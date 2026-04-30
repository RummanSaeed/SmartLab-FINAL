import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  try {
    const authResult = requireAuth(req, ["student", "admin", "guest"])
    if (!authResult.ok) return authResult.error

    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get("userId") || undefined
    const userEmail = searchParams.get("email") || undefined

    let resolvedUserId = authResult.auth.role === "admin" ? requestedUserId : authResult.auth.userId
    if (!resolvedUserId && userEmail) {
      const u = await prisma.user.findUnique({
        where: { email: userEmail.toLowerCase() },
        select: { id: true },
      })
      resolvedUserId = u?.id
    }

    const runWhere = resolvedUserId ? { userId: resolvedUserId } : {}
    const assignmentWhere = resolvedUserId ? { OR: [{ studentId: resolvedUserId }, { studentId: null }] } : {}

    const [assignments, recentRuns, inProgressRuns, noticesCount, resourcesCount, runStats, hazardCount, aiCount] =
      await Promise.all([
        prisma.assignment.findMany({
          where: assignmentWhere,
          orderBy: { dueDate: "asc" },
          take: 6,
          select: { id: true, title: true, dueDate: true, createdAt: true },
        }),
        prisma.experimentRun.findMany({
          where: runWhere,
          orderBy: { startedAt: "desc" },
          take: 6,
          select: {
            id: true,
            practicalTitle: true,
            practicalId: true,
            score: true,
            status: true,
            startedAt: true,
          },
        }),
        prisma.experimentRun.findMany({
          where: { ...runWhere, status: "in_progress" },
          orderBy: { updatedAt: "desc" },
          take: 3,
          select: { id: true, practicalTitle: true, practicalId: true, updatedAt: true },
        }),
        prisma.notice.count(),
        prisma.resource.count(),
        prisma.experimentRun.aggregate({
          where: runWhere,
          _sum: { durationSec: true },
          _avg: { score: true },
          _count: { _all: true },
        }),
        prisma.hazardEvent.count({
          where: resolvedUserId
            ? {
                run: {
                  userId: resolvedUserId,
                },
              }
            : {},
        }),
        prisma.tutorMessage.count({
          where: resolvedUserId ? { userId: resolvedUserId } : {},
        }),
      ])

    const assignedTasks = assignments.map((a) => {
      const diffDays = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      let dueDate = "Today"
      if (diffDays > 0) dueDate = diffDays === 1 ? "Tomorrow" : `${diffDays} days`
      if (diffDays < 0) dueDate = `${Math.abs(diffDays)} days overdue`
      return {
        id: a.id,
        title: a.title,
        dueDate,
        subject: "Science",
        priority: diffDays <= 1 ? "high" : diffDays <= 3 ? "medium" : "low",
      }
    })

    const recentAttempts = recentRuns.map((r) => ({
      id: r.id,
      title: r.practicalTitle,
      score: r.score ? Math.round(r.score) : null,
      status: r.status === "in_progress" ? "in-progress" : "completed",
      date: new Date(r.startedAt).toLocaleDateString(),
    }))

    const continueExperiments = inProgressRuns.map((r) => ({
      id: r.practicalId,
      title: r.practicalTitle,
      progress: 40,
      lastAttempt: new Date(r.updatedAt).toLocaleString(),
    }))

    const timeSpentHours = Number(((runStats._sum.durationSec || 0) / 3600).toFixed(1))
    const masteryScore = Number((runStats._avg.score || 0).toFixed(0))

    return NextResponse.json({
      stats: {
        timeSpentHours,
        masteryScore,
        hazardIncidents: hazardCount,
        aiConversations: aiCount,
        totalAttempts: runStats._count._all,
        noticesCount,
        resourcesCount,
      },
      assignedTasks,
      recentAttempts,
      continueExperiments,
    })
  } catch (error) {
    console.error("student dashboard error:", error)
    return NextResponse.json({ error: "Failed to load student dashboard data" }, { status: 500 })
  }
}

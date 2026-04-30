import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

type ClassAgg = {
  classLevel: string
  students: number
  completion: number
  hoursSpent: number
  hazardAlerts: number
  avgScore: number
}

export async function GET(req: Request) {
  try {
    const authResult = requireAuth(req, ["teacher", "admin"])
    if (!authResult.ok) return authResult.error

    const actor = await prisma.user.findUnique({
      where: { id: authResult.auth.userId },
      select: { id: true, role: true },
    })
    if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const teacherClassIds =
      actor.role === "teacher"
        ? (
            await prisma.class.findMany({
              where: { teacherId: actor.id },
              select: { id: true },
            })
          ).map((c) => c.id)
        : null

    const students = await prisma.user.findMany({
      where: {
        role: "student",
        ...(teacherClassIds ? { classId: { in: teacherClassIds } } : {}),
      },
      select: { id: true, classLevel: true, classId: true },
    })

    const classMap = new Map<string, ClassAgg>()
    for (const s of students) {
      const key = s.classLevel || "Unassigned"
      if (!classMap.has(key)) {
        classMap.set(key, {
          classLevel: key,
          students: 0,
          completion: 0,
          hoursSpent: 0,
          hazardAlerts: 0,
          avgScore: 0,
        })
      }
      classMap.get(key)!.students += 1
    }

    const runs = await prisma.experimentRun.findMany({
      where: { userId: { in: students.map((s) => s.id) } },
      select: {
        userId: true,
        status: true,
        durationSec: true,
        score: true,
      },
    })
    const studentClass = new Map(students.map((s) => [s.id, s.classLevel || "Unassigned"]))
    const statsByClass = new Map<
      string,
      { completed: number; total: number; durationSec: number; scoreSum: number; scoreCount: number }
    >()
    for (const run of runs) {
      const cls = studentClass.get(run.userId) || "Unassigned"
      const acc = statsByClass.get(cls) || {
        completed: 0,
        total: 0,
        durationSec: 0,
        scoreSum: 0,
        scoreCount: 0,
      }
      acc.total += 1
      if (run.status === "completed") acc.completed += 1
      acc.durationSec += run.durationSec || 0
      if (typeof run.score === "number") {
        acc.scoreSum += run.score
        acc.scoreCount += 1
      }
      statsByClass.set(cls, acc)
    }

    const hazardCounts = await prisma.hazardEvent.groupBy({
      by: ["runId"],
      _count: { _all: true },
    })
    const runIds = hazardCounts.map((h) => h.runId)
    const runToUser = runIds.length
      ? await prisma.experimentRun.findMany({
          where: { id: { in: runIds } },
          select: { id: true, userId: true },
        })
      : []
    const runUserMap = new Map(runToUser.map((r) => [r.id, r.userId]))
    const hazardByClass = new Map<string, number>()
    for (const h of hazardCounts) {
      const userId = runUserMap.get(h.runId)
      if (!userId) continue
      const cls = studentClass.get(userId) || "Unassigned"
      hazardByClass.set(cls, (hazardByClass.get(cls) || 0) + h._count._all)
    }

    for (const [cls, agg] of classMap.entries()) {
      const c = statsByClass.get(cls)
      if (c) {
        agg.completion = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0
        agg.hoursSpent = Number((c.durationSec / 3600).toFixed(1))
        agg.avgScore = c.scoreCount > 0 ? Math.round(c.scoreSum / c.scoreCount) : 0
      }
      agg.hazardAlerts = hazardByClass.get(cls) || 0
    }

    const classes = Array.from(classMap.values())
      .sort((a, b) => a.classLevel.localeCompare(b.classLevel))
      .map((c, idx) => ({
        id: idx + 1,
        name: c.classLevel,
        students: c.students,
        completion: c.completion,
        hoursSpent: c.hoursSpent,
        hazardAlerts: c.hazardAlerts,
        avgScore: c.avgScore,
      }))

    const recentAttemptsRaw = await prisma.experimentRun.findMany({
      where: { userId: { in: students.map((s) => s.id) } },
      orderBy: { startedAt: "desc" },
      take: 10,
      include: { user: { select: { fullName: true, classLevel: true } } },
    })
    const recentAttempts = recentAttemptsRaw.map((r) => ({
      id: r.id,
      student: r.user.fullName,
      class: r.user.classLevel || "N/A",
      experiment: r.practicalTitle,
      score: r.score ? Math.round(r.score) : null,
      status: r.status === "completed" ? "completed" : "in-progress",
      time: new Date(r.startedAt).toLocaleString(),
    }))

    const hazardAlertsRaw = await prisma.hazardEvent.findMany({
      where: { run: { userId: { in: students.map((s) => s.id) } } },
      orderBy: { occurredAt: "desc" },
      take: 10,
      include: {
        run: {
          include: {
            user: { select: { fullName: true } },
          },
        },
      },
    })
    const hazardAlerts = hazardAlertsRaw.map((h) => ({
      id: h.id,
      student: h.run.user.fullName,
      experiment: h.run.practicalTitle,
      type: h.message,
      time: new Date(h.occurredAt).toLocaleString(),
    }))

    return NextResponse.json({ classes, recentAttempts, hazardAlerts })
  } catch (error) {
    console.error("teacher dashboard error:", error)
    return NextResponse.json({ error: "Failed to load teacher dashboard data" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  const authResult = requireAuth(req, ["teacher", "admin"])
  if (!authResult.ok) return authResult.error

  const params: any = (ctx as any).params && typeof (ctx as any).params.then === "function" ? await (ctx as any).params : (ctx as any).params
  const classId = String(params?.id || "")
  if (!classId) return NextResponse.json({ error: "id is required" }, { status: 400 })

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      school: true,
      classLevel: true,
      section: true,
      teacherId: true,
      createdAt: true,
    },
  })
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 })
  if (actor.role === "teacher" && cls.teacherId !== actor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const students = await prisma.user.findMany({
    where: { role: "student", classId },
    select: { id: true, fullName: true, email: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  })

  const studentIds = students.map((s) => s.id)

  const p = prisma as any
  const [runCounts, completedRuns, avgScores, hazardCounts, lastRuns] = await Promise.all([
    p.experimentRun.groupBy({
      by: ["userId"],
      where: { userId: { in: studentIds } },
      _count: { _all: true },
    }),
    p.experimentRun.groupBy({
      by: ["userId"],
      where: { userId: { in: studentIds }, status: "completed" },
      _count: { _all: true },
    }),
    p.experimentRun.groupBy({
      by: ["userId"],
      where: { userId: { in: studentIds }, score: { not: null } },
      _avg: { score: true },
    }),
    p.hazardEvent.groupBy({
      by: ["runId"],
      where: { run: { userId: { in: studentIds } } },
      _count: { _all: true },
    }),
    p.experimentRun.findMany({
      where: { userId: { in: studentIds } },
      orderBy: { startedAt: "desc" },
      take: 500,
      select: { userId: true, startedAt: true },
    }),
  ])

  const totalRunsByStudent = new Map<string, number>()
  for (const r of runCounts) totalRunsByStudent.set(r.userId, r._count._all)

  const completedRunsByStudent = new Map<string, number>()
  for (const r of completedRuns) completedRunsByStudent.set(r.userId, r._count._all)

  const avgScoreByStudent = new Map<string, number>()
  for (const r of avgScores) avgScoreByStudent.set(r.userId, typeof r._avg.score === "number" ? r._avg.score : 0)

  const runIdToUserId = new Map<string, string>()
  const runRowsForHazards = await p.experimentRun.findMany({
    where: { userId: { in: studentIds } },
    select: { id: true, userId: true },
    take: 5000,
  })
  for (const r of runRowsForHazards) runIdToUserId.set(r.id, r.userId)

  const hazardsByStudent = new Map<string, number>()
  for (const hz of hazardCounts) {
    const uid = runIdToUserId.get(hz.runId)
    if (!uid) continue
    hazardsByStudent.set(uid, (hazardsByStudent.get(uid) || 0) + hz._count._all)
  }

  const lastActiveByStudent = new Map<string, string>()
  for (const r of lastRuns) {
    if (!lastActiveByStudent.has(r.userId)) lastActiveByStudent.set(r.userId, r.startedAt.toISOString())
  }

  const studentRows = students.map((s) => {
    const total = totalRunsByStudent.get(s.id) || 0
    const completed = completedRunsByStudent.get(s.id) || 0
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const avgScore = avgScoreByStudent.get(s.id) || 0

    return {
      id: s.id,
      name: s.fullName,
      email: s.email,
      experiments: {
        total,
        completed,
        completionRate,
      },
      avgScore: Math.round(avgScore),
      hazards: hazardsByStudent.get(s.id) || 0,
      lastActive: lastActiveByStudent.get(s.id) || null,
    }
  })

  const classLabel = `${cls.classLevel}-${cls.section}`
  const classAgg = {
    students: students.length,
    completionRate:
      studentRows.length > 0
        ? Math.round(studentRows.reduce((sum, s) => sum + s.experiments.completionRate, 0) / studentRows.length)
        : 0,
    avgScore:
      studentRows.length > 0
        ? Math.round(studentRows.reduce((sum, s) => sum + (s.avgScore || 0), 0) / studentRows.length)
        : 0,
    hazards: studentRows.reduce((sum, s) => sum + (s.hazards || 0), 0),
  }

  return NextResponse.json({
    class: {
      id: cls.id,
      label: classLabel,
      school: cls.school,
      classLevel: cls.classLevel,
      section: cls.section,
      teacherId: cls.teacherId,
      createdAt: cls.createdAt,
      stats: classAgg,
    },
    students: studentRows,
  })
}

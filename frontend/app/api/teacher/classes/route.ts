import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["teacher", "admin"])
  if (!authResult.ok) return authResult.error

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const classes = await prisma.class.findMany({
    where: actor.role === "teacher" ? { teacherId: actor.id } : {},
    select: {
      id: true,
      school: true,
      classLevel: true,
      section: true,
      createdAt: true,
    },
    orderBy: [{ classLevel: "asc" }, { section: "asc" }],
    take: 100,
  })

  const classIds = classes.map((c) => c.id)
  if (classIds.length === 0) return NextResponse.json({ classes: [] })

  const studentCounts = await prisma.user.groupBy({
    by: ["classId"],
    where: { role: "student", classId: { in: classIds } },
    _count: { _all: true },
  })
  const studentsByClassId = new Map<string, number>()
  for (const row of studentCounts) {
    if (!row.classId) continue
    studentsByClassId.set(row.classId, row._count._all)
  }

  const students = await prisma.user.findMany({
    where: { role: "student", classId: { in: classIds } },
    select: { id: true, classId: true },
    take: 10000,
  })

  const studentIds = students.map((s) => s.id)
  const runs =
    studentIds.length > 0
      ? await prisma.experimentRun.findMany({
          where: { userId: { in: studentIds } },
          select: { userId: true, status: true, durationSec: true, score: true },
          take: 20000,
        })
      : []

  const studentIdToClassId = new Map(students.map((s) => [s.id, s.classId]))
  const aggByClass = new Map<
    string,
    { completed: number; total: number; durationSec: number; scoreSum: number; scoreCount: number }
  >()

  for (const r of runs) {
    const classId = studentIdToClassId.get(r.userId)
    if (!classId) continue
    const acc = aggByClass.get(classId) || { completed: 0, total: 0, durationSec: 0, scoreSum: 0, scoreCount: 0 }
    acc.total += 1
    if (r.status === "completed") acc.completed += 1
    acc.durationSec += r.durationSec || 0
    if (typeof r.score === "number") {
      acc.scoreSum += r.score
      acc.scoreCount += 1
    }
    aggByClass.set(classId, acc)
  }

  const payload = classes.map((c) => {
    const studentsCount = studentsByClassId.get(c.id) || 0
    const a = aggByClass.get(c.id) || { completed: 0, total: 0, durationSec: 0, scoreSum: 0, scoreCount: 0 }
    const completionRate = a.total > 0 ? Math.round((a.completed / a.total) * 100) : 0
    const avgScore = a.scoreCount > 0 ? Math.round(a.scoreSum / a.scoreCount) : 0

    return {
      id: c.id,
      school: c.school,
      classLevel: c.classLevel,
      section: c.section,
      students: studentsCount,
      completionRate,
      avgScore,
      hoursSpent: Number((a.durationSec / 3600).toFixed(1)),
      createdAt: c.createdAt,
    }
  })

  return NextResponse.json({ classes: payload })
}

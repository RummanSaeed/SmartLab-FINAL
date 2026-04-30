import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["student", "admin"])
  if (!authResult.ok) return authResult.error

  const p = prisma as any

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, classId: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const url = new URL(req.url)
  const classId = actor.role === "admin" ? url.searchParams.get("classId") : actor.classId
  const subjectFilter = url.searchParams.get("subject")
  const subject = subjectFilter === "Physics" || subjectFilter === "Chemistry" ? subjectFilter : null
  if (!classId) return NextResponse.json({ assignments: [] })

  const assignments = await p.assignment.findMany({
    where: { classId, ...(subject ? { subject } : {}) },
    orderBy: { dueDate: "asc" },
    take: 200,
    include: {
      class: { select: { classLevel: true, section: true } },
      submissions: {
        where: { studentId: actor.id },
        select: { id: true, status: true, submittedAt: true, score: true, feedback: true, gradedAt: true, runId: true },
        take: 1,
      },
    },
  })

  const mapped = assignments.map((a) => {
    const sub = a.submissions[0] || null
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      dueDate: a.dueDate,
      extendedDueDate: a.extendedDueDate,
      createdAt: a.createdAt,
      subject: a.subject ?? null,
      class: `${a.class.classLevel}-${a.class.section}`,
      practicalId: a.practicalId,
      quizSpec: a.quizSpec,
      questionsSpec: a.questionsSpec,
      submission: sub,
    }
  })

  return NextResponse.json({ assignments: mapped })
}

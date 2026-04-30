import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  const authResult = requireAuth(req, ["teacher", "school_admin", "admin"])
  if (!authResult.ok) return authResult.error

  const params: any =
    (ctx as any).params && typeof (ctx as any).params.then === "function" ? await (ctx as any).params : (ctx as any).params
  const assignmentId = String(params?.id || "")
  if (!assignmentId) return NextResponse.json({ error: "id is required" }, { status: 400 })

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, school: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      dueDate: true,
      extendedDueDate: true,
      practicalId: true,
      quizSpec: true,
      questionsSpec: true,
      createdAt: true,
      class: { select: { id: true, school: true, classLevel: true, section: true, teacherId: true } },
    },
  })
  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 })

  if (actor.role === "teacher" && assignment.class.teacherId !== actor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (actor.role === "school_admin" && assignment.class.school !== actor.school) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId },
    orderBy: { submittedAt: "desc" },
    take: 500,
    include: {
      student: { select: { id: true, fullName: true, email: true } },
      gradedBy: { select: { id: true, fullName: true, email: true } },
    },
  })

  const mappedSubmissions = submissions.map((s) => ({
    id: s.id,
    student: s.student,
    status: s.status,
    submittedAt: s.submittedAt,
    answers: s.answers,
    runId: s.runId,
    score: s.score,
    feedback: s.feedback,
    gradedAt: s.gradedAt,
    gradedBy: s.gradedBy,
  }))

  return NextResponse.json({
    assignment: {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      dueDate: assignment.dueDate,
      extendedDueDate: assignment.extendedDueDate,
      createdAt: assignment.createdAt,
      practicalId: assignment.practicalId,
      quizSpec: assignment.quizSpec,
      questionsSpec: assignment.questionsSpec,
      class: {
        id: assignment.class.id,
        label: `${assignment.class.classLevel}-${assignment.class.section}`,
      },
    },
    submissions: mappedSubmissions,
  })
}

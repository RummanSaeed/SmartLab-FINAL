import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> } | { params: { id: string } }) {
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

  const p = prisma as any
  const assignment = await p.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, title: true, class: { select: { id: true, school: true, teacherId: true } } },
  })
  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 })

  if (actor.role === "teacher" && assignment.class.teacherId !== actor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (actor.role === "school_admin" && assignment.class.school !== actor.school) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const submissionId = body?.submissionId ? String(body.submissionId) : null
  const studentId = body?.studentId ? String(body.studentId) : null
  const score = body?.score
  const feedback = body?.feedback ? String(body.feedback) : null

  if ((!submissionId && !studentId) || (submissionId && studentId)) {
    return NextResponse.json({ error: "Provide exactly one of submissionId or studentId" }, { status: 400 })
  }
  if (typeof score !== "number" || Number.isNaN(score) || score < 0 || score > 100) {
    return NextResponse.json({ error: "score must be a number between 0 and 100" }, { status: 400 })
  }

  const submission = await prisma.assignmentSubmission.findFirst({
    where: {
      assignmentId,
      ...(submissionId ? { id: submissionId } : { studentId: studentId || "__none__" }),
    },
    select: { id: true, studentId: true },
  })
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 })

  const updated = await prisma.assignmentSubmission.update({
    where: { id: submission.id },
    data: {
      score,
      feedback,
      gradedAt: new Date(),
      gradedById: actor.id,
      status: "graded",
    },
  })

  await prisma.notification.create({
    data: {
      userId: updated.studentId,
      type: "assignment_graded" as any,
      title: `Assignment graded: ${assignment.title}`,
      body: `Score: ${score}%`,
      meta: { assignmentId, submissionId: updated.id },
    },
  })

  return NextResponse.json({ submission: updated })
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  const authResult = requireAuth(req, ["student", "admin"])
  if (!authResult.ok) return authResult.error

  const params: any =
    (ctx as any).params && typeof (ctx as any).params.then === "function" ? await (ctx as any).params : (ctx as any).params
  const assignmentId = String(params?.id || "")
  if (!assignmentId) return NextResponse.json({ error: "id is required" }, { status: 400 })

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, classId: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, type: true, classId: true, quizSpec: true, dueDate: true, extendedDueDate: true },
  })
  if (!assignment) return NextResponse.json({ error: "Assignment not found" }, { status: 404 })

  const classId = actor.role === "admin" ? assignment.classId : actor.classId
  if (!classId || assignment.classId !== classId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const now = new Date()
  const effectiveDue = assignment.extendedDueDate || assignment.dueDate
  if (now > effectiveDue) {
    return NextResponse.json({ error: "Deadline passed" }, { status: 403 })
  }

  if (assignment.type !== "quiz") {
    return NextResponse.json({ error: "Only quiz assignments can be started" }, { status: 400 })
  }

  const durationMin = Number((assignment.quizSpec as any)?.durationMin)
  if (!Number.isFinite(durationMin) || durationMin <= 0 || durationMin > 180) {
    return NextResponse.json({ error: "Quiz duration is not configured" }, { status: 400 })
  }

  const existing = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: actor.id } },
    select: { id: true, startedAt: true, endsAt: true, status: true },
  })

  if (existing?.startedAt && existing?.endsAt) {
    return NextResponse.json({
      attempt: {
        submissionId: existing.id,
        startedAt: existing.startedAt,
        endsAt: existing.endsAt,
        status: existing.status,
      },
    })
  }

  const startedAt = new Date()
  const endsAt = new Date(startedAt.getTime() + Math.floor(durationMin * 60 * 1000))

  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: actor.id } },
    update: {
      startedAt,
      endsAt,
      status: existing?.status || "in_progress",
    },
    create: {
      assignmentId: assignment.id,
      studentId: actor.id,
      startedAt,
      endsAt,
      status: "in_progress",
    },
    select: { id: true, startedAt: true, endsAt: true, status: true },
  })

  return NextResponse.json({
    attempt: {
      submissionId: submission.id,
      startedAt: submission.startedAt,
      endsAt: submission.endsAt,
      status: submission.status,
    },
  })
}

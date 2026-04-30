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
    select: {
      id: true,
      type: true,
      dueDate: true,
      extendedDueDate: true,
      classId: true,
      practicalId: true,
    },
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

  const body = await req.json().catch(() => ({}))
  const answers = body?.answers ?? null
  const runId = body?.runId ? String(body.runId) : null

  if (assignment.type === "experiment") {
    if (!runId) return NextResponse.json({ error: "runId is required for experiment submission" }, { status: 400 })
    const run = await prisma.experimentRun.findUnique({
      where: { id: runId },
      select: { id: true, userId: true, status: true, practicalId: true },
    })
    if (!run || run.userId !== actor.id) {
      return NextResponse.json({ error: "Invalid runId" }, { status: 400 })
    }
    if (run.status !== "completed") {
      return NextResponse.json({ error: "Experiment run must be completed" }, { status: 400 })
    }
    if (assignment.practicalId && run.practicalId !== assignment.practicalId) {
      return NextResponse.json({ error: "Run does not match assignment practical" }, { status: 400 })
    }
  }

  if (assignment.type !== "experiment" && !answers) {
    return NextResponse.json({ error: "answers are required" }, { status: 400 })
  }

  const submission = await prisma.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: actor.id } },
    update: {
      status: "submitted",
      answers,
      runId,
      submittedAt: new Date(),
    },
    create: {
      assignmentId: assignment.id,
      studentId: actor.id,
      status: "submitted",
      answers,
      runId,
    },
  })

  return NextResponse.json({ submission }, { status: 201 })
}

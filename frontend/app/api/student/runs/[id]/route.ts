import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  const authResult = requireAuth(req, ["student", "teacher", "school_admin", "admin"])
  if (!authResult.ok) return authResult.error

  const params: any =
    (ctx as any).params && typeof (ctx as any).params.then === "function" ? await (ctx as any).params : (ctx as any).params
  const runId = String(params?.id || "")
  if (!runId) return NextResponse.json({ error: "id is required" }, { status: 400 })

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, school: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const run = await prisma.experimentRun.findUnique({
    where: { id: runId },
    include: {
      user: { select: { id: true, fullName: true, email: true, classId: true, school: true, class: { select: { classLevel: true, section: true } } } },
      steps: true,
      hazards: true,
      measurements: true,
      gradeReport: true,
      tutorMessages: true,
    },
  })
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 })

  if (authResult.auth.role === "student" && run.userId !== authResult.auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (actor.role === "teacher") {
    const cls = run.user.classId
      ? await prisma.class.findUnique({ where: { id: run.user.classId }, select: { teacherId: true } })
      : null
    if (!cls || cls.teacherId !== actor.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  if (actor.role === "school_admin") {
    if (!run.user.school || run.user.school !== actor.school) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  return NextResponse.json({ run })
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  const authResult = requireAuth(req, ["student", "admin"])
  if (!authResult.ok) return authResult.error

  const params: any =
    (ctx as any).params && typeof (ctx as any).params.then === "function" ? await (ctx as any).params : (ctx as any).params
  const runId = String(params?.id || "")
  if (!runId) return NextResponse.json({ error: "id is required" }, { status: 400 })

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const run = await prisma.experimentRun.findUnique({
    where: { id: runId },
    select: { id: true, userId: true, status: true },
  })
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 })
  if (authResult.auth.role === "student" && run.userId !== authResult.auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (authResult.auth.role === "guest" && run.userId !== authResult.auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const status = body?.status ? String(body.status) : null
  const endedAt = body?.endedAt ? new Date(body.endedAt) : null
  const durationSec = typeof body?.durationSec === "number" ? Math.round(body.durationSec) : null
  const score = typeof body?.score === "number" ? body.score : null
  const metadata = typeof body?.metadata === "object" && body.metadata ? body.metadata : null

  const allowedStatuses = ["in_progress", "completed", "abandoned"]
  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }
  if (endedAt && Number.isNaN(endedAt.getTime())) {
    return NextResponse.json({ error: "Invalid endedAt" }, { status: 400 })
  }
  if (durationSec !== null && (Number.isNaN(durationSec) || durationSec < 0)) {
    return NextResponse.json({ error: "Invalid durationSec" }, { status: 400 })
  }
  if (score !== null && (Number.isNaN(score) || score < 0 || score > 100)) {
    return NextResponse.json({ error: "score must be 0-100" }, { status: 400 })
  }

  const updated = await prisma.experimentRun.update({
    where: { id: runId },
    data: {
      ...(status ? { status: status as any } : {}),
      ...(endedAt ? { endedAt } : {}),
      ...(durationSec !== null ? { durationSec } : {}),
      ...(score !== null ? { score } : {}),
      ...(metadata ? { metadata } : {}),
    },
  })

  return NextResponse.json({ run: updated })
}

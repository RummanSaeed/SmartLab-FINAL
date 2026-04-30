import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function POST(req: Request) {
  const authResult = requireAuth(req, ["student", "admin"])
  if (!authResult.ok) return authResult.error

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const practicalId = String(body?.practicalId || "")
  const practicalTitle = String(body?.practicalTitle || "")
  const simType = String(body?.simType || "")

  if (!practicalId || !practicalTitle || !simType) {
    return NextResponse.json({ error: "practicalId, practicalTitle and simType are required" }, { status: 400 })
  }

  const run = await prisma.experimentRun.create({
    data: {
      userId: actor.id,
      practicalId,
      practicalTitle,
      simType,
      status: "in_progress",
    },
    select: {
      id: true,
      status: true,
      startedAt: true,
      practicalId: true,
      practicalTitle: true,
      simType: true,
    },
  })

  return NextResponse.json({ run }, { status: 201 })
}

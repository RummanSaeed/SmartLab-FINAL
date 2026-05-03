import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["student", "admin", "guest"])
  if (!authResult.ok) return authResult.error

  if (authResult.auth.role === "guest") {
    return NextResponse.json({ runs: [] })
  }

  const url = new URL(req.url)
  const take = Math.min(Number(url.searchParams.get("take") || 50) || 50, 200)
  const status = url.searchParams.get("status")
  const simType = url.searchParams.get("simType")
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const where: any = {
    userId: actor.id,
    ...(status ? { status } : {}),
    ...(simType ? { simType } : {}),
  }

  if (from) {
    const d = new Date(from)
    if (!Number.isNaN(d.getTime())) where.startedAt = { ...(where.startedAt || {}), gte: d }
  }
  if (to) {
    const d = new Date(to)
    if (!Number.isNaN(d.getTime())) where.startedAt = { ...(where.startedAt || {}), lte: d }
  }

  const runs = await prisma.experimentRun.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take,
    select: {
      id: true,
      practicalId: true,
      practicalTitle: true,
      simType: true,
      status: true,
      startedAt: true,
      endedAt: true,
      durationSec: true,
      score: true,
      _count: { select: { hazards: true } },
    },
  })

  const mapped = runs.map((r) => ({
    id: r.id,
    practicalId: r.practicalId,
    practicalTitle: r.practicalTitle,
    simType: r.simType,
    status: r.status,
    startedAt: r.startedAt,
    endedAt: r.endedAt,
    durationSec: r.durationSec,
    score: r.score,
    hazards: r._count.hazards,
  }))

  return NextResponse.json({ runs: mapped })
}

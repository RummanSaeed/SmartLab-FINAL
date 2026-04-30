import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"
import { practicals } from "@/data/practicals"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const authResult = requireAuth(req, ["admin"])
  if (!authResult.ok) return authResult.error

  const id = String(params.id || "")
  const practical = practicals.find((p) => p.id === id)
  if (!practical) return NextResponse.json({ error: "Experiment not found" }, { status: 404 })

  const [runAgg, hazards] = await Promise.all([
    prisma.experimentRun.aggregate({
      where: { practicalId: id },
      _count: { _all: true },
      _avg: { score: true, durationSec: true },
    }),
    prisma.hazardEvent.count({
      where: { run: { practicalId: id } },
    }),
  ])

  return NextResponse.json({
    experiment: {
      id: practical.id,
      title: practical.title,
      subject: practical.subject,
      classLevel: practical.classLevel,
      level: practical.level,
      category: practical.category,
      hazard: practical.hazard,
      steps: practical.steps,
    },
    stats: {
      attempts: runAgg._count._all,
      avgScore: typeof runAgg._avg.score === "number" ? Math.round(runAgg._avg.score) : 0,
      avgDurationSec: typeof runAgg._avg.durationSec === "number" ? Math.round(runAgg._avg.durationSec) : null,
      hazards,
    },
  })
}

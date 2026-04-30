import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"
import { practicals } from "@/data/practicals"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["admin"])
  if (!authResult.ok) return authResult.error

  const runs = await prisma.experimentRun.groupBy({
    by: ["practicalId"],
    _count: { _all: true },
    _avg: { score: true },
  })

  const statsByPractical = new Map<string, { attempts: number; avgScore: number }>()
  for (const r of runs) {
    statsByPractical.set(r.practicalId, {
      attempts: r._count._all,
      avgScore: typeof r._avg.score === "number" ? Math.round(r._avg.score) : 0,
    })
  }

  const items = practicals.map((p) => {
    const s = statsByPractical.get(p.id) || { attempts: 0, avgScore: 0 }
    return {
      id: p.id,
      name: p.title,
      subject: p.subject,
      classLevel: p.classLevel,
      status: "published",
      attempts: s.attempts,
      avgScore: s.avgScore,
      lastUpdated: null as string | null,
      hazard: p.hazard,
      level: p.level,
      category: p.category,
    }
  })

  return NextResponse.json({ experiments: items })
}

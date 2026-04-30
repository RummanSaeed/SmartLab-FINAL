import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["admin"])
  if (!authResult.ok) return authResult.error

  const url = new URL(req.url)
  const practicalId = url.searchParams.get("practicalId")
  const take = Math.min(200, Math.max(1, Number(url.searchParams.get("take") || 100)))

  const feedback = await prisma.experimentFeedback.findMany({
    where: practicalId ? { practicalId: String(practicalId) } : undefined,
    orderBy: { updatedAt: "desc" },
    take,
    select: {
      id: true,
      authorId: true,
      practicalId: true,
      practicalTitle: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, fullName: true, email: true, role: true, school: true, classLevel: true } },
    },
  })

  return NextResponse.json({ feedback })
}

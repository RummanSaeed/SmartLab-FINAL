import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["student", "guest", "admin"])
  if (!authResult.ok) return authResult.error

  const url = new URL(req.url)
  const practicalId = String(url.searchParams.get("practicalId") || "").trim()
  if (!practicalId) {
    return NextResponse.json({ error: "practicalId is required" }, { status: 400 })
  }

  const feedback = await prisma.experimentFeedback.findUnique({
    where: {
      authorId_practicalId: {
        authorId: authResult.auth.userId,
        practicalId,
      },
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      practicalId: true,
      practicalTitle: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ feedback })
}

export async function POST(req: Request) {
  const authResult = requireAuth(req, ["student", "guest", "admin"])
  if (!authResult.ok) return authResult.error

  const body = await req.json().catch(() => ({}))
  const practicalId = String(body?.practicalId || "").trim()
  const practicalTitle = body?.practicalTitle ? String(body.practicalTitle) : null
  const ratingRaw = body?.rating
  const comment = body?.comment ? String(body.comment) : null

  const rating = typeof ratingRaw === "number" ? Math.round(ratingRaw) : Number(ratingRaw)
  if (!practicalId) {
    return NextResponse.json({ error: "practicalId is required" }, { status: 400 })
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 })
  }

  const isGuest = authResult.auth.userId.startsWith("guest-")
  const userId = isGuest ? null : authResult.auth.userId

  const feedback = await prisma.experimentFeedback.upsert({
    where: {
      authorId_practicalId: {
        authorId: authResult.auth.userId,
        practicalId,
      },
    },
    create: {
      authorId: authResult.auth.userId,
      userId,
      practicalId,
      practicalTitle,
      rating,
      comment,
    },
    update: {
      practicalTitle,
      rating,
      comment,
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      practicalId: true,
      practicalTitle: true,
      updatedAt: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ feedback })
}

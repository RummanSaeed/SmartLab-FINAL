import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["student", "admin", "guest"])
  if (!authResult.ok) return authResult.error

  if (authResult.auth.role === "guest") {
    return NextResponse.json({ notices: [] })
  }

  const p = prisma as any

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, classId: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const url = new URL(req.url)
  const classId = actor.role === "admin" ? url.searchParams.get("classId") : actor.classId
  const subjectFilter = url.searchParams.get("subject")
  const subject = subjectFilter === "Physics" || subjectFilter === "Chemistry" ? subjectFilter : null
  if (!classId) return NextResponse.json({ notices: [] })

  const notices = await p.notice.findMany({
    where: { classId, ...(subject ? { subject } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const mapped = notices.map((n: any) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    createdAt: n.createdAt,
    subject: n.subject ?? null,
  }))

  return NextResponse.json({ notices: mapped })
}

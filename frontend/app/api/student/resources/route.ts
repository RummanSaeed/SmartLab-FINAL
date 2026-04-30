import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["student", "admin"])
  if (!authResult.ok) return authResult.error

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
  if (!classId) return NextResponse.json({ resources: [] })

  const resources = await p.resource.findMany({
    where: { classId, ...(subject ? { subject } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const mapped = resources.map((r: any) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    createdAt: r.createdAt,
    subject: r.subject ?? null,
  }))

  return NextResponse.json({ resources: mapped })
}

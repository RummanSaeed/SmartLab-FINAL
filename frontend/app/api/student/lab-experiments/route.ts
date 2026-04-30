import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"
import { prisma } from "@/lib/prisma"
import { practicals } from "@/data/practicals"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["student", "guest", "admin"])
  if (!authResult.ok) return authResult.error

  const user = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { role: true, class_level: true },
  })

  const classLevel = user?.role === "student" ? user.class_level : null
  const filtered = classLevel ? practicals.filter((p) => p.classLevel === classLevel) : practicals

  const experiments = filtered.map((p) => ({
    id: p.id,
    title: p.title,
    description: `${p.subject} • Class ${p.classLevel} • ${p.category}`,
    createdAt: new Date(0).toISOString(),
  }))

  return NextResponse.json({ experiments })
}

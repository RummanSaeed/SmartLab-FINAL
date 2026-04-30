import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"
import { practicals } from "@/data/practicals"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["teacher", "school_admin", "admin"])
  if (!authResult.ok) return authResult.error

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, teacherSubject: true },
  })

  const subjectFilter =
    actor?.role === "teacher" && actor.teacherSubject ? String(actor.teacherSubject) : null

  const filtered = subjectFilter ? practicals.filter((p) => p.subject === subjectFilter) : practicals

  const experiments = filtered.map((p) => ({
    id: p.id,
    title: p.title,
    subject: p.subject,
    classLevel: p.classLevel,
    category: p.category,
    description: `${p.subject} • Class ${p.classLevel} • ${p.category}`,
  }))

  return NextResponse.json({ experiments })
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["school_admin", "admin"])
  if (!authResult.ok) return authResult.error

  const p = prisma as any

  const actor = await p.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { role: true, school: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const url = new URL(req.url)
  const school = actor.role === "admin" ? url.searchParams.get("school") : actor.school
  if (actor.role === "school_admin" && !school) {
    return NextResponse.json({ error: "School admin has no school configured" }, { status: 400 })
  }

  const whereSchool = school ? { school } : {}

  const classes = await p.class.findMany({
    where: whereSchool,
    orderBy: [{ classLevel: "asc" }, { section: "asc" }],
    take: 500,
    select: {
      id: true,
      school: true,
      classLevel: true,
      section: true,
      teacher: { select: { id: true, fullName: true, email: true, teacherSubject: true } },
      createdAt: true,
    },
  })

  const classIds = classes.map((c: { id: string }) => c.id)
  const students = classIds.length
    ? await p.user.findMany({
        where: { role: "student", classId: { in: classIds } },
        select: { id: true, classId: true },
        take: 20000,
      })
    : []

  const countMap = new Map<string, number>()
  for (const s of students) {
    if (!s.classId) continue
    countMap.set(s.classId, (countMap.get(s.classId) || 0) + 1)
  }

  const payload = classes.map((c: any) => ({
    id: c.id,
    school: c.school,
    classLevel: c.classLevel,
    section: c.section,
    students: countMap.get(c.id) || 0,
    teacher: c.teacher,
    createdAt: c.createdAt,
  }))

  return NextResponse.json({ classes: payload })
}

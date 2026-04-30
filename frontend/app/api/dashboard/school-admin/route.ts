import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["school_admin", "admin"])
  if (!authResult.ok) return authResult.error

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, school: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const school = actor.role === "admin" ? new URL(req.url).searchParams.get("school") : actor.school
  if (actor.role === "school_admin" && !school) {
    return NextResponse.json({ error: "School admin has no school configured" }, { status: 400 })
  }

  const whereSchool = school ? { school } : {}

  const [teacherCount, studentCount, adminStaffCount, activeClasses, recentUsers] = await Promise.all([
    prisma.user.count({ where: { ...whereSchool, role: "teacher" } }),
    prisma.user.count({ where: { ...whereSchool, role: "student" } }),
    prisma.user.count({ where: { ...whereSchool, role: "school_admin" } }),
    prisma.class.count({ where: whereSchool }),
    prisma.user.findMany({
      where: whereSchool,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, fullName: true, role: true, createdAt: true },
    }),
  ])

  const stats = {
    totalTeachers: teacherCount,
    totalStudents: studentCount,
    activeClasses,
    adminStaff: adminStaffCount,
  }

  const recentActivities = recentUsers.map((u) => ({
    id: u.id,
    title: `New ${u.role} account`,
    description: u.fullName,
    time: u.createdAt.toISOString(),
    status: "update" as const,
  }))

  return NextResponse.json({ stats, recentActivities, school })
}

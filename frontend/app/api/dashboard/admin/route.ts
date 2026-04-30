import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { practicals } from "@/data/practicals"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  try {
    const authResult = requireAuth(req, ["admin"])
    if (!authResult.ok) return authResult.error

    const [users, runAgg, runsByPractical] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          school: true,
          classLevel: true,
          createdAt: true,
        },
      }),
      prisma.experimentRun.aggregate({
        _count: { _all: true },
      }),
      prisma.experimentRun.groupBy({
        by: ["practicalId", "status"],
        _count: { _all: true },
      }),
    ])

    const attemptsByPractical = new Map<string, number>()
    for (const row of runsByPractical) {
      attemptsByPractical.set(row.practicalId, (attemptsByPractical.get(row.practicalId) || 0) + row._count._all)
    }

    const experiments = practicals.map((p) => ({
      id: p.id,
      name: p.title,
      subject: p.subject,
      class: p.classLevel,
      status: "active",
      attempts: attemptsByPractical.get(p.id) || 0,
    }))

    const schoolMap = new Map<string, { students: number; teachers: number }>()
    for (const u of users) {
      const school = u.school || "Unassigned"
      if (!schoolMap.has(school)) schoolMap.set(school, { students: 0, teachers: 0 })
      if (u.role === "student") schoolMap.get(school)!.students += 1
      if (u.role === "teacher") schoolMap.get(school)!.teachers += 1
    }
    const schools = Array.from(schoolMap.entries()).map(([name, v], idx) => ({
      id: idx + 1,
      name,
      students: v.students,
      teachers: v.teachers,
      status: "active",
    }))

    const recentUsers = users.map((u) => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      role: u.role,
      school: u.school || "Unassigned",
      status: "active",
    }))

    const totalStudents = users.filter((u) => u.role === "student").length
    const totalTeachers = users.filter((u) => u.role === "teacher").length
    const activeExperiments = experiments.length
    const totalAttempts = runAgg._count._all

    return NextResponse.json({
      stats: { totalStudents, totalTeachers, activeExperiments, totalAttempts },
      experiments,
      schools,
      recentUsers,
    })
  } catch (error) {
    console.error("admin dashboard error:", error)
    return NextResponse.json({ error: "Failed to load admin dashboard data" }, { status: 500 })
  }
}

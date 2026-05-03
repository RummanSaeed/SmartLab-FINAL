import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["school_admin"])
  if (!authResult.ok) return authResult.error

  const user = authResult.user
  const schoolName = user?.school

  try {
    // Get school stats
    const schoolFilter = schoolName ? { school: { equals: schoolName } } : {}
    
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      activeExperiments,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: "student",
          ...schoolFilter,
        },
      }),
      prisma.user.count({
        where: {
          role: "teacher",
          ...schoolFilter,
        },
      }),
      prisma.class.count({
        where: schoolFilter,
      }),
      prisma.experimentRun.count({
        where: {
          user: {
            ...schoolFilter,
          },
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ])

    // Get school info from first user
    const schoolUser = await prisma.user.findFirst({
      where: schoolFilter,
      select: { school: true },
    })

    const school = {
      name: schoolUser?.school || "Unnamed School",
      address: "123 Education Street, Lahore", // Placeholder - would come from school table
      phone: "+92 42 1234567", // Placeholder
      email: "principal@school.edu.pk", // Placeholder
      totalStudents,
      totalTeachers,
      totalClasses,
      activeExperiments,
      academicYear: "2025-2026",
      status: "active" as const,
    }

    return NextResponse.json({ school })
  } catch (error) {
    console.error("School info error:", error)
    return NextResponse.json(
      { error: "Failed to fetch school info" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  const authResult = requireAuth(req, ["school_admin"])
  if (!authResult.ok) return authResult.error

  try {
    const body = await req.json()
    
    // In a real implementation, you'd update a School table
    // For now, we just return success
    return NextResponse.json({ success: true, school: body })
  } catch (error) {
    console.error("School update error:", error)
    return NextResponse.json(
      { error: "Failed to update school info" },
      { status: 500 }
    )
  }
}

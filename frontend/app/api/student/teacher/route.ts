import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["student"])
  if (!authResult.ok) return authResult.error

  try {
    const user = await prisma.user.findUnique({
      where: { id: authResult.auth.userId },
      select: { id: true, classId: true },
    })

    if (!user?.classId) {
      return NextResponse.json({ teacher: null }, { status: 200 })
    }

    const cls = await prisma.class.findUnique({
      where: { id: user.classId },
      select: {
        id: true,
        teacher: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ teacher: cls?.teacher || null })
  } catch {
    return NextResponse.json({ error: "Failed to load teacher" }, { status: 500 })
  }
}

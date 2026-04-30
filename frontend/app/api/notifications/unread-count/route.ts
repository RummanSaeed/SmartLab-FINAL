import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req)
  if (!authResult.ok) return authResult.error

  const count = await prisma.notification.count({
    where: { userId: authResult.auth.userId, readAt: null },
  })

  return NextResponse.json({ unread: count })
}

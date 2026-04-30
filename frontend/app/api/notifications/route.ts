import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req)
  if (!authResult.ok) return authResult.error

  const url = new URL(req.url)
  const unreadOnly = url.searchParams.get("unread") === "1"
  const take = Math.min(Number(url.searchParams.get("take") || 30) || 30, 100)

  const notifications = await prisma.notification.findMany({
    where: {
      userId: authResult.auth.userId,
      ...(unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    take,
  })

  return NextResponse.json({ notifications })
}

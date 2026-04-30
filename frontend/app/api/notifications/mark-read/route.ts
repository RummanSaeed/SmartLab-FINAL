import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function POST(req: Request) {
  const authResult = requireAuth(req)
  if (!authResult.ok) return authResult.error

  const body = await req.json().catch(() => ({}))
  const ids = Array.isArray(body?.ids) ? body.ids.map((x: any) => String(x)) : null
  const all = body?.all === true

  if (!all && (!ids || ids.length === 0)) {
    return NextResponse.json({ error: "ids or all is required" }, { status: 400 })
  }

  const where = {
    userId: authResult.auth.userId,
    ...(all ? {} : { id: { in: ids as string[] } }),
    readAt: null,
  }

  const result = await prisma.notification.updateMany({
    where,
    data: { readAt: new Date() },
  })

  return NextResponse.json({ updated: result.count })
}

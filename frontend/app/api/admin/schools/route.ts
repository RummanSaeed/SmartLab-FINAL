import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["admin"])
  if (!authResult.ok) return authResult.error

  const rows = await prisma.user.findMany({
    where: {
      school: {
        not: null,
      },
    },
    distinct: ["school"],
    select: {
      school: true,
    },
  })

  const schools = rows
    .map((r) => String(r.school || "").trim())
    .filter((s) => s.length > 0)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name }))

  return NextResponse.json({ schools })
}

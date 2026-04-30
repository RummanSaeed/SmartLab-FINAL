import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { issueToken } from "@/lib/token"
import { z } from "zod"
import crypto from "crypto"

const bootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).optional(),
})

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export async function POST(req: Request) {
  try {
    const bodyRaw = await req.json().catch(() => ({}))
    const parsed = bootstrapSchema.safeParse(bodyRaw)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 })
    }

    const existingAdmins = await prisma.user.count({ where: { role: "admin" } })
    if (existingAdmins > 0) {
      return NextResponse.json({ error: "Bootstrap already completed" }, { status: 409 })
    }

    const emailLower = parsed.data.email.toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: emailLower }, select: { id: true } })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        fullName: parsed.data.fullName || "System Admin",
        email: emailLower,
        passwordHash: hashPassword(parsed.data.password),
        role: "admin",
        school: "SmartLab HQ",
        classLevel: "Administration",
      },
    })

    const token = issueToken(user.id, user.role as any)
    const { passwordHash, ...safeUser } = user

    const res = NextResponse.json({
      user: {
        ...safeUser,
        createdAt: safeUser.createdAt.toISOString(),
      },
      token,
    })

    res.cookies.set("smartlab_auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (err) {
    console.error("bootstrap error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

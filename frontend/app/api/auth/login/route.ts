import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { issueToken } from "@/lib/token"
import { z } from "zod"
import crypto from "crypto"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":")
    if (!salt || !hash) return false
    const verify = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
    return hash === verify
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error.format() }, { status: 400 })
    }

    const { email, password } = validation.data
    const emailLower = email.toLowerCase()

    const user = await prisma.user.findUnique({ where: { email: emailLower } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = issueToken(user.id, user.role as any)
    const { passwordHash, ...safeUser } = user

    const response = NextResponse.json({
      user: {
        ...safeUser,
        createdAt: safeUser.createdAt.toISOString(),
      },
      token,
    })

    response.cookies.set("smartlab_auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}

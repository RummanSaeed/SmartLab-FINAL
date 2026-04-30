import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { issueToken } from "@/lib/token"
import { z } from "zod"
import crypto from "crypto"

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("student"),
  school: z.string().optional(),
  class: z.string().min(1, "Class is required for students"),
})

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: "Validation failed", details: validation.error }, { status: 400 })
    }

    const { fullName, email, password, school, class: classLevel } = validation.data
    const emailLower = email.toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: emailLower }, select: { id: true } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email: emailLower,
        passwordHash: hashPassword(password),
        role: "student",
        school,
        classLevel,
      },
    })

    const token = issueToken(user.id, user.role as any)
    const { passwordHash, ...safeUser } = user

    const response = NextResponse.json(
      {
        user: {
          ...safeUser,
          createdAt: safeUser.createdAt.toISOString(),
        },
        token,
      },
      { status: 201 },
    )

    response.cookies.set("smartlab_auth", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
    }
    console.error("Signup error:", error)
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"
import crypto from "crypto"

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

function generatePassword() {
  return crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)
}

// Teacher can provision students inside the same school
export async function POST(req: Request) {
  const authResult = requireAuth(req, ["teacher", "admin"]) // admin allowed for testing
  if (!authResult.ok) return authResult.error

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, school: true },
  })
  if (!actor) return NextResponse.json({ error: "Actor not found" }, { status: 404 })

  const body = await req.json()
  if (!body?.email || !body?.fullName) {
    return NextResponse.json({ error: "fullName and email are required" }, { status: 400 })
  }

  if (!body?.classLevel) {
    return NextResponse.json({ error: "classLevel is required" }, { status: 400 })
  }

  if (!body?.section) {
    return NextResponse.json({ error: "section is required" }, { status: 400 })
  }

  const section = String(body.section).trim().toUpperCase()
  if (!/^[ABC]$/.test(section)) {
    return NextResponse.json({ error: "section must be A, B, or C" }, { status: 400 })
  }

  const targetSchool = actor.role === "admin" ? body.school || null : actor.school || null
  if (actor.role === "teacher" && !targetSchool) {
    return NextResponse.json({ error: "Your school is not configured" }, { status: 400 })
  }

  const passwordPlain = body.password ? String(body.password) : generatePassword()

  const cls = await prisma.class.findUnique({
    where: {
      school_classLevel_section: {
        school: String(targetSchool || ""),
        classLevel: String(body.classLevel || ""),
        section,
      },
    },
    select: { id: true, teacherId: true },
  })
  if (!cls) {
    return NextResponse.json(
      { error: "Class section not found. Ask admin/school admin to assign a teacher to this section first." },
      { status: 400 },
    )
  }
  if (actor.role === "teacher" && cls.teacherId !== actor.id) {
    return NextResponse.json({ error: "You can only add students to your own class sections" }, { status: 403 })
  }

  const emailLower = String(body.email).toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: emailLower }, select: { id: true } })
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 })

  const created = await prisma.user.create({
    data: {
      fullName: body.fullName,
      email: emailLower,
      role: "student",
      school: targetSchool,
      classLevel: body.classLevel || null,
      classId: cls.id,
      passwordHash: hashPassword(passwordPlain),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      school: true,
      classLevel: true,
      createdAt: true,
    },
  })

  return NextResponse.json(
    {
      user: created,
      credentials: { email: created.email, password: passwordPlain },
    },
    { status: 201 },
  )
}

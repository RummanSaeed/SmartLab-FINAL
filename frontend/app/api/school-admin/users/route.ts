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

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["school_admin", "admin"])
  if (!authResult.ok) return authResult.error

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { school: true, role: true },
  })

  if (!actor) return NextResponse.json({ error: "Actor not found" }, { status: 404 })

  const where = actor.role === "admin" ? {} : { school: actor.school || undefined }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      school: true,
      classLevel: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const authResult = requireAuth(req, ["school_admin", "admin"])
  if (!authResult.ok) return authResult.error

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { school: true, role: true },
  })

  if (!actor) return NextResponse.json({ error: "Actor not found" }, { status: 404 })

  const body = await req.json()
  if (!body?.email || !body?.fullName || !body?.role) {
    return NextResponse.json({ error: "fullName, email and role are required" }, { status: 400 })
  }

  if ((body.role === "student" || body.role === "teacher") && !body?.classLevel) {
    return NextResponse.json({ error: "classLevel is required for student/teacher" }, { status: 400 })
  }
  if ((body.role === "student" || body.role === "teacher") && !body?.section) {
    return NextResponse.json({ error: "section is required for student/teacher" }, { status: 400 })
  }

  if (!["teacher", "student"].includes(body.role)) {
    return NextResponse.json({ error: "school_admin can create only teacher/student accounts" }, { status: 403 })
  }

  const targetSchool = actor.role === "admin" ? body.school || null : actor.school || null
  if (actor.role === "school_admin" && !targetSchool) {
    return NextResponse.json({ error: "Your school is not configured" }, { status: 400 })
  }

  const passwordPlain = body.password ? String(body.password) : generatePassword()
  const emailLower = String(body.email).toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: emailLower }, select: { id: true } })
  if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 })

  const role = String(body.role)
  const classLevel = body.classLevel ? String(body.classLevel) : null
  const section = body.section ? String(body.section).trim().toUpperCase() : null

  if ((role === "student" || role === "teacher") && (!section || !/^[ABC]$/.test(section))) {
    return NextResponse.json({ error: "section must be A, B, or C" }, { status: 400 })
  }

  let classId = null as string | null
  if (role === "student") {
    const cls = await prisma.class.findUnique({
      where: {
        school_classLevel_section: {
          school: String(targetSchool || ""),
          classLevel: String(classLevel || ""),
          section: String(section || ""),
        },
      },
      select: { id: true },
    })
    if (!cls) {
      return NextResponse.json(
        { error: "Class section not found. Create/assign teacher to this section first." },
        { status: 400 },
      )
    }
    classId = cls.id
  }

  const created = await prisma.user.create({
    data: {
      fullName: body.fullName,
      email: emailLower,
      role: role as any,
      school: targetSchool,
      classLevel,
      ...(classId ? ({ classId } as any) : {}),
      passwordHash: hashPassword(passwordPlain),
    } as any,
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

  if (role === "teacher") {
    await prisma.class.upsert({
      where: {
        school_classLevel_section: {
          school: String(targetSchool || ""),
          classLevel: String(classLevel || ""),
          section: String(section || ""),
        },
      },
      update: { teacherId: created.id },
      create: {
        school: String(targetSchool || ""),
        classLevel: String(classLevel || ""),
        section: String(section || ""),
        teacherId: created.id,
      },
    })
  }

  return NextResponse.json(
    { user: created, credentials: { email: created.email, password: passwordPlain } },
    { status: 201 },
  )
}
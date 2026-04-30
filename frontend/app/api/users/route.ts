import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto"
import { requireAuth } from "@/lib/server-auth"

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

function generatePassword() {
  return crypto.randomBytes(9).toString("base64").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)
}

export async function GET(req: Request) {
  try {
    const authResult = requireAuth(req, ["admin"])
    if (!authResult.ok) return authResult.error

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        school: true,
        classLevel: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authResult = requireAuth(req, ["admin"])
    if (!authResult.ok) return authResult.error

    const body = await req.json()
    if (!body?.email || !body?.fullName || !body?.role) {
      return NextResponse.json({ error: "fullName, email and role are required" }, { status: 400 })
    }

    if ((body.role === "student" || body.role === "teacher") && !body?.school) {
      return NextResponse.json({ error: "school is required for student/teacher" }, { status: 400 })
    }
    if ((body.role === "student" || body.role === "teacher") && !body?.classLevel) {
      return NextResponse.json({ error: "classLevel is required for student/teacher" }, { status: 400 })
    }
    if ((body.role === "student" || body.role === "teacher") && !body?.section) {
      return NextResponse.json({ error: "section is required for student/teacher" }, { status: 400 })
    }

    const emailLower = String(body.email).toLowerCase()
    const passwordPlain = body.password ? String(body.password) : generatePassword()

    const role = String(body.role)
    const school = body.school ? String(body.school) : null
    const classLevel = body.classLevel ? String(body.classLevel) : null
    const section = body.section ? String(body.section).trim().toUpperCase() : null
    const teacherSubjectRaw = body.teacherSubject ? String(body.teacherSubject).trim() : null

    const teacherSubject =
      teacherSubjectRaw && (teacherSubjectRaw === "Physics" || teacherSubjectRaw === "Chemistry")
        ? (teacherSubjectRaw as any)
        : null

    if (role === "teacher" && !teacherSubject) {
      return NextResponse.json({ error: "teacherSubject is required for teacher (Physics or Chemistry)" }, { status: 400 })
    }

    if ((role === "student" || role === "teacher") && (!section || !/^[ABC]$/.test(section))) {
      return NextResponse.json({ error: "section must be A, B, or C" }, { status: 400 })
    }

    let classId = null as string | null
    if (role === "student") {
      const cls = await prisma.class.findUnique({
        where: {
          school_classLevel_section: {
            school: school || "",
            classLevel: classLevel || "",
            section: section || "",
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
        school,
        classLevel,
        classId,
        teacherSubject: role === "teacher" ? teacherSubject : null,
        passwordHash: hashPassword(passwordPlain),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        school: true,
        classLevel: true,
        teacherSubject: true,
        createdAt: true,
      },
    })

    if (role === "teacher") {
      await prisma.class.upsert({
        where: {
          school_classLevel_section: {
            school: school || "",
            classLevel: classLevel || "",
            section: section || "",
          },
        },
        update: { teacherId: created.id },
        create: {
          school: school || "",
          classLevel: classLevel || "",
          section: section || "",
          teacherId: created.id,
        },
      })
    }

    return NextResponse.json(
      { user: created, credentials: { email: created.email, password: passwordPlain } },
      { status: 201 },
    )
  } catch (error) {
    const anyErr = error as any
    if (anyErr?.code === "P2002") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }
    console.error("Error creating user:", error)
    return NextResponse.json({ error: anyErr?.message || "Error creating user" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const authResult = requireAuth(req, ["admin"])
    if (!authResult.ok) return authResult.error

    const body = await req.json()
    if (!body?.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: body.id },
      data: {
        fullName: body.fullName ?? undefined,
        school: body.school ?? undefined,
        classLevel: body.classLevel ?? undefined,
        role: body.role ?? undefined,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        school: true,
        classLevel: true,
      },
    })

    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Error updating user" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = requireAuth(req, ["admin"])
    if (!authResult.ok) return authResult.error

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 })
  }
}

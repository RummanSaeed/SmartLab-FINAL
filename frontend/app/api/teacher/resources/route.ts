import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function GET(req: Request) {
  const authResult = requireAuth(req, ["teacher", "school_admin", "admin"])
  if (!authResult.ok) return authResult.error

  const p = prisma as any

  const actor = await p.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, school: true, teacherSubject: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const url = new URL(req.url)
  const classIdFilter = url.searchParams.get("classId")
  const subjectFilter = url.searchParams.get("subject")
  const subject = subjectFilter === "Physics" || subjectFilter === "Chemistry" ? subjectFilter : null

  const allowedClassIds =
    actor.role === "teacher"
      ? (
          await p.class.findMany({
            where: { teacherId: actor.id },
            select: { id: true },
          })
        ).map((c) => c.id)
      : null

  const schoolClassIds =
    actor.role === "school_admin"
      ? (
          await p.class.findMany({
            where: { school: actor.school || "__none__" },
            select: { id: true },
          })
        ).map((c) => c.id)
      : null

  const whereBase =
    actor.role === "admin"
      ? classIdFilter
        ? { classId: classIdFilter }
        : {}
      : actor.role === "teacher"
        ? { classId: { in: classIdFilter ? allowedClassIds?.filter((x) => x === classIdFilter) : allowedClassIds || [] } }
        : { classId: { in: classIdFilter ? schoolClassIds?.filter((x) => x === classIdFilter) : schoolClassIds || [] } }

  const where = {
    ...whereBase,
    ...(subject ? { subject: subject as any } : actor.role === "teacher" && actor.teacherSubject ? { subject: actor.teacherSubject as any } : {}),
  }

  const resources = await p.resource.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { class: { select: { classLevel: true, section: true } } },
  })

  const mapped = resources.map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    createdAt: r.createdAt,
    classId: r.classId,
    classLabel: r.class ? `${r.class.classLevel}-${r.class.section}` : null,
    subject: (r as any).subject ?? null,
  }))

  return NextResponse.json({ resources: mapped })
}

export async function POST(req: Request) {
  const authResult = requireAuth(req, ["teacher", "school_admin", "admin"])
  if (!authResult.ok) return authResult.error

  const p = prisma as any

  const actor = await p.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { id: true, role: true, school: true, teacherSubject: true },
  })
  if (!actor) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const title = String(body?.title || "").trim()
  const url = String(body?.url || "").trim()
  const classId = String(body?.classId || "")
  const rawSubject = body?.subject
  const bodySubject = rawSubject === "Physics" || rawSubject === "Chemistry" ? rawSubject : null
  const subject = actor.role === "teacher" && actor.teacherSubject ? actor.teacherSubject : bodySubject

  if (!title || !url || !classId) {
    return NextResponse.json({ error: "title, url, and classId are required" }, { status: 400 })
  }

  const cls = await p.class.findUnique({
    where: { id: classId },
    select: { id: true, school: true, classLevel: true, section: true, teacherId: true },
  })
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 })
  if (actor.role === "teacher" && cls.teacherId !== actor.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (actor.role === "school_admin" && cls.school !== actor.school) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const created = await p.resource.create({
    data: {
      title,
      url,
      classId,
      createdById: actor.id,
      subject: subject as any,
    },
  })

  const students = await p.user.findMany({
    where: { role: "student", classId },
    select: { id: true },
    take: 2000,
  })

  if (students.length > 0) {
    await p.notification.createMany({
      data: students.map((s) => ({
        userId: s.id,
        type: "resource_created" as any,
        title: `New resource: ${title}`,
        body: `Class ${cls.classLevel}-${cls.section}`,
        meta: { resourceId: created.id, classId },
      })),
    })
  }

  return NextResponse.json({ resource: created }, { status: 201 })
}

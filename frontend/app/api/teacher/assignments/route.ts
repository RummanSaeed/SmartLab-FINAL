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

  const classWhereBase =
    actor.role === "admin"
      ? classIdFilter
        ? { classId: classIdFilter }
        : {}
      : actor.role === "teacher"
        ? {
            classId: {
              in: classIdFilter ? allowedClassIds?.filter((id) => id === classIdFilter) : allowedClassIds || [],
            },
          }
        : {
            classId: {
              in: classIdFilter ? schoolClassIds?.filter((id) => id === classIdFilter) : schoolClassIds || [],
            },
          }

  const classWhere = {
    ...classWhereBase,
    ...(subject ? { subject: subject as any } : actor.role === "teacher" && actor.teacherSubject ? { subject: actor.teacherSubject as any } : {}),
  }

  const assignments = await p.assignment.findMany({
    where: classWhere,
    orderBy: { dueDate: "asc" },
    take: 200,
    include: {
      class: { select: { id: true, school: true, classLevel: true, section: true, teacherId: true } },
      submissions: { select: { id: true } },
    },
  })

  const mapped = assignments.map((a: any) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    type: a.type,
    dueDate: a.dueDate,
    extendedDueDate: a.extendedDueDate,
    createdAt: a.createdAt,
    subject: a.subject ?? null,
    class: {
      id: a.class.id,
      label: `${a.class.classLevel}-${a.class.section}`,
      school: a.class.school,
      teacherId: a.class.teacherId,
    },
    practicalId: a.practicalId,
    submissionsCount: a.submissions.length,
  }))

  return NextResponse.json({ assignments: mapped })
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

  const body = await req.json()
  const title = String(body?.title || "").trim()
  const description = String(body?.description || "").trim()
  const dueDate = body?.dueDate ? new Date(body.dueDate) : null
  const extendedDueDate = body?.extendedDueDate ? new Date(body.extendedDueDate) : null
  const type = String(body?.type || "experiment")
  const classId = String(body?.classId || "")
  const studentId = body?.studentId ? String(body.studentId) : null
  const practicalId = body?.practicalId ? String(body.practicalId) : null
  const quizSpec = body?.quizSpec ?? null
  const questionsSpec = body?.questionsSpec ?? null
  const rawSubject = body?.subject
  const bodySubject = rawSubject === "Physics" || rawSubject === "Chemistry" ? rawSubject : null
  const subject = actor.role === "teacher" && actor.teacherSubject ? actor.teacherSubject : bodySubject

  if (!title || !description || !dueDate || Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: "title, description, and valid dueDate are required" }, { status: 400 })
  }

  if (!classId) {
    return NextResponse.json({ error: "classId is required" }, { status: 400 })
  }

  if (extendedDueDate && Number.isNaN(extendedDueDate.getTime())) {
    return NextResponse.json({ error: "extendedDueDate is invalid" }, { status: 400 })
  }

  if (!['experiment','quiz','questions'].includes(type)) {
    return NextResponse.json({ error: "type must be one of experiment, quiz, questions" }, { status: 400 })
  }

  if (type === "experiment" && !practicalId) {
    return NextResponse.json({ error: "practicalId is required for experiment assignments" }, { status: 400 })
  }
  if (type === "quiz" && !quizSpec) {
    return NextResponse.json({ error: "quizSpec is required for quiz assignments" }, { status: 400 })
  }
  if (type === "questions" && !questionsSpec) {
    return NextResponse.json({ error: "questionsSpec is required for questions assignments" }, { status: 400 })
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

  if (studentId) {
    const student = (await p.user.findUnique({
      where: { id: studentId },
      select: { role: true, school: true, classId: true },
    })) as any
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Invalid studentId" }, { status: 400 })
    }
    if (student.classId !== classId) {
      return NextResponse.json({ error: "studentId must belong to the selected class" }, { status: 400 })
    }
    if (actor.role === "school_admin" && student.school !== actor.school) {
      return NextResponse.json({ error: "Cannot assign across schools" }, { status: 403 })
    }
  }

  const assignment = await p.assignment.create({
    data: {
      title,
      description,
      type: type as any,
      dueDate,
      extendedDueDate: extendedDueDate && !Number.isNaN(extendedDueDate.getTime()) ? extendedDueDate : null,
      classId,
      createdById: actor.id,
      studentId,
      practicalId,
      quizSpec,
      questionsSpec,
      subject: subject as any,
    },
  })

  const targetStudents = await p.user.findMany({
    where: { role: "student", ...(studentId ? { id: studentId } : { classId }) },
    select: { id: true },
    take: 1000,
  })
  if (targetStudents.length > 0) {
    await p.notification.createMany({
      data: targetStudents.map((s: any) => ({
        userId: s.id,
        type: "assignment_created" as any,
        title: `New assignment: ${title}`,
        body: `Due ${dueDate.toLocaleDateString()}`,
        meta: { assignmentId: assignment.id, classId },
      })),
    })
  }

  return NextResponse.json({ assignment }, { status: 201 })
}

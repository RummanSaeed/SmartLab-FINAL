import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

// Real progress endpoint for teacher/school-admin/admin
export async function GET(req: Request) {
  const authResult = requireAuth(req, ["teacher", "school_admin", "admin"]);
  if (!authResult.ok) return authResult.error;

  const p = prisma as any;

  const actor = await prisma.user.findUnique({
    where: { id: authResult.auth.userId },
    select: { school: true, role: true },
  });

  const school = actor?.school || null;
  const restrictToSchool = authResult.auth.role === "school_admin";

  const teacherClassIds =
    authResult.auth.role === "teacher"
      ? (
          await prisma.class.findMany({
            where: { teacherId: authResult.auth.userId },
            select: { id: true },
          })
        ).map((c) => c.id)
      : null;

  const students = await p.user.findMany({
    where: {
      role: "student",
      ...(teacherClassIds ? { classId: { in: teacherClassIds } } : {}),
      ...(restrictToSchool ? { school: school || undefined } : {}),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      classLevel: true,
      class: { select: { section: true } },
      school: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const studentIds = students.map((s: any) => s.id);

  const [assignmentCounts, runCounts, hazardCounts, lastRuns] = await Promise.all([
    prisma.assignment.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds } },
      _count: { _all: true },
    }),
    p.experimentRun.groupBy({
      by: ["userId", "status"],
      where: { userId: { in: studentIds } },
      _count: { _all: true },
    }),
    p.hazardEvent.groupBy({
      by: ["runId"],
      where: { run: { userId: { in: studentIds } } },
      _count: { _all: true },
    }),
    p.experimentRun.findMany({
      where: { userId: { in: studentIds } },
      orderBy: { startedAt: "desc" },
      take: 500,
      select: { userId: true, startedAt: true },
    }),
  ]);

  const assignmentsByStudent = new Map<string, number>();
  for (const row of assignmentCounts) {
    if (!row.studentId) continue;
    assignmentsByStudent.set(row.studentId, row._count._all);
  }

  const runsTotalByStudent = new Map<string, number>();
  const runsCompletedByStudent = new Map<string, number>();
  for (const row of runCounts) {
    runsTotalByStudent.set(row.userId, (runsTotalByStudent.get(row.userId) || 0) + row._count._all);
    if (row.status === "completed") {
      runsCompletedByStudent.set(row.userId, (runsCompletedByStudent.get(row.userId) || 0) + row._count._all);
    }
  }

  const hazardsByStudent = new Map<string, number>();
  // hazardCounts is grouped by runId; convert to per-student by reading run from relation via lastRuns set
  // (approximate: count hazards by scanning runs in memory)
  const runIdToUserId = new Map<string, string>();
  const runRowsForHazards = await p.experimentRun.findMany({
    where: { userId: { in: studentIds } },
    select: { id: true, userId: true },
    take: 5000,
  });
  for (const r of runRowsForHazards) runIdToUserId.set(r.id, r.userId);
  for (const hz of hazardCounts) {
    const uid = runIdToUserId.get(hz.runId);
    if (!uid) continue;
    hazardsByStudent.set(uid, (hazardsByStudent.get(uid) || 0) + hz._count._all);
  }

  const lastActiveByStudent = new Map<string, string>();
  for (const r of lastRuns) {
    if (!lastActiveByStudent.has(r.userId)) {
      lastActiveByStudent.set(r.userId, r.startedAt.toISOString());
    }
  }

  const data = students.map((s: any) => {
    const section = (s as any)?.class?.section ? String((s as any).class.section) : ""
    const classLabel = s.classLevel ? `${s.classLevel}${section ? `-${section}` : ""}` : "N/A"
    const totalAssignments = assignmentsByStudent.get(s.id) || 0;
    const totalRuns = runsTotalByStudent.get(s.id) || 0;
    const completedRuns = runsCompletedByStudent.get(s.id) || 0;
    const runCompletionRate = totalRuns > 0 ? (completedRuns / totalRuns) * 100 : 0;

    return {
      id: s.id,
      name: s.fullName,
      email: s.email,
      class: classLabel,
      school: s.school,
      assignments: {
        total: totalAssignments,
      },
      experiments: {
        total: totalRuns,
        completed: completedRuns,
        completionRate: Math.round(runCompletionRate),
      },
      hazards: hazardsByStudent.get(s.id) || 0,
      lastActive: lastActiveByStudent.get(s.id) || null,
    };
  });

  return NextResponse.json({ students: data });
}

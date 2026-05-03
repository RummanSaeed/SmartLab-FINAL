import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

export async function GET(request: Request) {
  const authResult = requireAuth(request, ["student", "admin", "school_admin", "guest"]);
  if (!authResult.ok) return authResult.error;
  const userId = authResult.auth.userId;
  const role = authResult.auth.role;

  try {
    // For guest, return empty data
    if (role === "guest") {
      return NextResponse.json({
        assignments: [],
        runs: [],
        summary: {
          totalAssignments: 0,
          submittedAssignments: 0,
          gradedAssignments: 0,
          averageAssignmentScore: 0,
          totalRuns: 0,
          completedRuns: 0,
          averageRunScore: 0,
          totalHazards: 0,
          pendingAssignments: 0,
          overdueAssignments: 0,
        },
      });
    }

    // Fetch user's class to filter assignments
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, classId: true },
    });

    if (!user || !user.classId) {
      return NextResponse.json(
        { error: "Student not assigned to a class" },
        { status: 400 }
      );
    }

    // Fetch assignments for this student's class
    const assignments = await prisma.assignment.findMany({
      where: {
        classId: user.classId,
      },
      include: {
        submissions: {
          where: { studentId: userId },
          take: 1,
          orderBy: { submittedAt: "desc" },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    // Fetch experiment runs for this student
    const runs = await prisma.experimentRun.findMany({
      where: {
        userId,
      },
      include: {
        hazards: { select: { id: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    // Calculate summary statistics
    const totalAssignments = assignments.length;
    const submittedAssignments = assignments.filter(
      (a) => a.submissions.length > 0
    ).length;
    const gradedSubmissions = assignments.filter(
      (a) => a.submissions[0]?.status === "graded"
    );
    const gradedAssignments = gradedSubmissions.length;
    
    const averageAssignmentScore = gradedAssignments > 0
      ? gradedSubmissions.reduce((sum, a) => sum + (a.submissions[0]?.score || 0), 0) / gradedAssignments
      : 0;

    const totalRuns = runs.length;
    const completedRuns = runs.filter((r) => r.status === "completed").length;
    
    const averageRunScore = completedRuns > 0
      ? runs
          .filter((r) => r.status === "completed" && r.score !== null)
          .reduce((sum, r) => sum + (r.score || 0), 0) /
        completedRuns
      : 0;

    const totalHazards = runs.reduce((sum, r) => sum + (r.hazards?.length || 0), 0);

    const now = new Date();
    const pendingAssignments = assignments.filter(
      (a) => a.submissions.length === 0 && new Date(a.dueDate) > now
    ).length;
    const overdueAssignments = assignments.filter(
      (a) => a.submissions.length === 0 && new Date(a.dueDate) < now
    ).length;

    // Format assignments for response
    const formattedAssignments = assignments.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.type,
      dueDate: a.dueDate.toISOString(),
      subject: a.subject || null,
      submission: a.submissions[0]
        ? {
            status: a.submissions[0].status,
            score: a.submissions[0].score,
            feedback: a.submissions[0].feedback,
            gradedAt: a.submissions[0].gradedAt?.toISOString() || null,
            submittedAt: a.submissions[0].submittedAt.toISOString(),
          }
        : null,
    }));

    // Format runs for response
    const formattedRuns = runs.map((r) => ({
      id: r.id,
      practicalTitle: r.practicalTitle,
      simType: r.simType,
      status: r.status,
      score: r.score,
      startedAt: r.startedAt.toISOString(),
      endedAt: r.endedAt?.toISOString() || null,
      durationSec: r.durationSec,
      hazards: r.hazards?.length || 0,
    }));

    return NextResponse.json({
      assignments: formattedAssignments,
      runs: formattedRuns,
      summary: {
        totalAssignments,
        submittedAssignments,
        gradedAssignments,
        averageAssignmentScore,
        totalRuns,
        completedRuns,
        averageRunScore,
        totalHazards,
        pendingAssignments,
        overdueAssignments,
      },
    });
  } catch (error) {
    console.error("Student report error:", error);
    return NextResponse.json(
      { error: "Failed to load report" },
      { status: 500 }
    );
  }
}

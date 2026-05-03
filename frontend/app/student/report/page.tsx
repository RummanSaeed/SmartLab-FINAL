"use client";

import { useEffect, useMemo, useState } from "react";
import { StudentSidebar } from "@/components/student/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  FlaskConical,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
} from "lucide-react";

type AssignmentItem = {
  id: string;
  title: string;
  type: "experiment" | "quiz" | "questions";
  dueDate: string;
  subject: string | null;
  submission?: {
    status: string;
    score: number | null;
    feedback: string | null;
    gradedAt: string | null;
    submittedAt: string;
  } | null;
};

type ExperimentRun = {
  id: string;
  practicalTitle: string;
  simType: string;
  status: string;
  score: number | null;
  startedAt: string;
  endedAt: string | null;
  durationSec: number | null;
  hazards: number;
};

type ReportData = {
  assignments: AssignmentItem[];
  runs: ExperimentRun[];
  summary: {
    totalAssignments: number;
    submittedAssignments: number;
    gradedAssignments: number;
    averageAssignmentScore: number;
    totalRuns: number;
    completedRuns: number;
    averageRunScore: number;
    totalHazards: number;
    pendingAssignments: number;
    overdueAssignments: number;
  };
};

export default function StudentReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadReport = async () => {
    try {
      const res = await fetch("/api/student/report");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String(json?.error || "Failed to load report"));
        return;
      }
      setData(json);
      setLastUpdated(new Date());
    } catch {
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
    // Real-time refresh every 30 seconds
    const interval = setInterval(loadReport, 30000);
    return () => clearInterval(interval);
  }, []);

  const summary = data?.summary;

  const assignmentStats = useMemo(() => {
    if (!data?.assignments) return [];
    return data.assignments.map((a) => ({
      ...a,
      isOverdue: new Date(a.dueDate) < new Date() && !a.submission,
      isPending: !a.submission,
      score: a.submission?.score ?? null,
    }));
  }, [data?.assignments]);

  const experimentStats = useMemo(() => {
    if (!data?.runs) return [];
    return data.runs.map((r) => ({
      ...r,
      durationMin: r.durationSec ? Math.round(r.durationSec / 60) : null,
    }));
  }, [data?.runs]);

  const overallPerformance = useMemo(() => {
    if (!summary) return 0;
    const assignmentScore = summary.averageAssignmentScore || 0;
    const runScore = summary.averageRunScore || 0;
    if (summary.gradedAssignments > 0 && summary.completedRuns > 0) {
      return Math.round((assignmentScore + runScore) / 2);
    }
    return Math.round(assignmentScore || runScore);
  }, [summary]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 80) return <Badge className="bg-blue-500">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge className="bg-red-500">Needs Improvement</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Performance Report</h1>
              <p className="text-muted-foreground mt-1">
                Real-time overview of your assignments, quizzes, and lab experiments
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>

          {error && (
            <Card className="border-red-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading report...</p>
            </div>
          ) : !data ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No data available</p>
            </div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Overall Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{overallPerformance}%</div>
                    <Progress value={overallPerformance} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Assignments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {summary?.submittedAssignments}/{summary?.totalAssignments}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {summary?.pendingAssignments} pending
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" />
                      Lab Experiments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {summary?.completedRuns}/{summary?.totalRuns}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {summary?.totalHazards} hazards recorded
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Average Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Assignments</span>
                      <span className={getScoreColor(summary?.averageAssignmentScore || 0)}>
                        {Math.round(summary?.averageAssignmentScore || 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lab Runs</span>
                      <span className={getScoreColor(summary?.averageRunScore || 0)}>
                        {Math.round(summary?.averageRunScore || 0)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Tabs */}
              <Tabs defaultValue="assignments" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto">
                  <TabsTrigger value="assignments" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Assignments & Quizzes
                  </TabsTrigger>
                  <TabsTrigger value="experiments" className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    Lab Experiments
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                {/* Assignments Tab */}
                <TabsContent value="assignments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Assignment & Quiz Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {assignmentStats.length === 0 ? (
                        <p className="text-muted-foreground">No assignments found.</p>
                      ) : (
                        <div className="space-y-3">
                          {assignmentStats.map((a) => (
                            <div
                              key={a.id}
                              className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card/50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{a.title}</h3>
                                  {a.isOverdue && (
                                    <Badge variant="destructive">Overdue</Badge>
                                  )}
                                  {a.isPending && !a.isOverdue && (
                                    <Badge variant="outline">Pending</Badge>
                                  )}
                                  {a.submission?.status === "graded" && (
                                    <Badge className="bg-green-500">Graded</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Due: {new Date(a.dueDate).toLocaleDateString()}
                                  </span>
                                  <span className="capitalize">{a.type}</span>
                                  {a.subject && <span>{a.subject}</span>}
                                </div>
                                {a.submission?.feedback && (
                                  <p className="text-sm mt-2 text-muted-foreground">
                                    Feedback: {a.submission.feedback}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-4">
                                {typeof a.score === "number" ? (
                                  <div className="text-right">
                                    <div className={`text-2xl font-bold ${getScoreColor(a.score)}`}>
                                      {Math.round(a.score)}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {getScoreBadge(a.score)}
                                    </div>
                                  </div>
                                ) : a.isPending ? (
                                  <Badge variant="secondary">Not Submitted</Badge>
                                ) : (
                                  <Badge variant="outline">Awaiting Grade</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Assignment Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Submitted</p>
                            <p className="text-2xl font-bold">{summary?.submittedAssignments}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Graded</p>
                            <p className="text-2xl font-bold">{summary?.gradedAssignments}</p>
                          </div>
                          <Award className="w-8 h-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Pending/Overdue</p>
                            <p className="text-2xl font-bold">
                              {(summary?.pendingAssignments || 0) + (summary?.overdueAssignments || 0)}
                            </p>
                          </div>
                          <AlertCircle className="w-8 h-8 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Experiments Tab */}
                <TabsContent value="experiments" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FlaskConical className="w-5 h-5" />
                        Lab Experiment History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {experimentStats.length === 0 ? (
                        <p className="text-muted-foreground">No experiments found.</p>
                      ) : (
                        <div className="space-y-3">
                          {experimentStats.map((r) => (
                            <div
                              key={r.id}
                              className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-card/50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{r.practicalTitle}</h3>
                                  <Badge variant={r.status === "completed" ? "default" : "outline"}>
                                    {r.status}
                                  </Badge>
                                  {r.hazards > 0 && (
                                    <Badge variant="destructive">{r.hazards} hazards</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span>{r.simType}</span>
                                  <span>
                                    {new Date(r.startedAt).toLocaleDateString()}
                                  </span>
                                  {r.durationMin && <span>{r.durationMin} min</span>}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                {typeof r.score === "number" ? (
                                  <div className="text-right">
                                    <div className={`text-2xl font-bold ${getScoreColor(r.score)}`}>
                                      {Math.round(r.score)}%
                                    </div>
                                  </div>
                                ) : (
                                  <Badge variant="outline">No Score</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Assignment Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion Rate</span>
                            <span>
                              {summary?.totalAssignments
                                ? Math.round((summary.submittedAssignments / summary.totalAssignments) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              summary?.totalAssignments
                                ? (summary.submittedAssignments / summary.totalAssignments) * 100
                                : 0
                            }
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Graded Rate</span>
                            <span>
                              {summary?.submittedAssignments
                                ? Math.round((summary.gradedAssignments / summary.submittedAssignments) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              summary?.submittedAssignments
                                ? (summary.gradedAssignments / summary.submittedAssignments) * 100
                                : 0
                            }
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Score</span>
                            <span className={getScoreColor(summary?.averageAssignmentScore || 0)}>
                              {Math.round(summary?.averageAssignmentScore || 0)}%
                            </span>
                          </div>
                          <Progress value={summary?.averageAssignmentScore || 0} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Lab Performance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Completion Rate</span>
                            <span>
                              {summary?.totalRuns
                                ? Math.round((summary.completedRuns / summary.totalRuns) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              summary?.totalRuns ? (summary.completedRuns / summary.totalRuns) * 100 : 0
                            }
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Average Score</span>
                            <span className={getScoreColor(summary?.averageRunScore || 0)}>
                              {Math.round(summary?.averageRunScore || 0)}%
                            </span>
                          </div>
                          <Progress value={summary?.averageRunScore || 0} />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Safety (Low Hazards)</span>
                            <span>
                              {summary?.totalRuns && summary?.totalHazards !== undefined
                                ? Math.max(0, 100 - (summary.totalHazards / summary.totalRuns) * 20)
                                : 100}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              summary?.totalRuns && summary?.totalHazards !== undefined
                                ? Math.max(0, 100 - (summary.totalHazards / summary.totalRuns) * 20)
                                : 100
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Performance Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {overallPerformance >= 80 ? (
                          <p className="text-green-600">
                            🎉 Excellent work! You&apos;re performing very well across assignments and labs.
                          </p>
                        ) : overallPerformance >= 60 ? (
                          <p className="text-yellow-600">
                            👍 Good progress! Keep working on improving your scores.
                          </p>
                        ) : (
                          <p className="text-red-600">
                            📚 You may need additional practice. Consider reviewing materials or asking your teacher for help.
                          </p>
                        )}

                        {summary?.pendingAssignments > 0 && (
                          <p className="text-yellow-600">
                            ⚠️ You have {summary.pendingAssignments} pending assignment(s). Make sure to submit them before the deadline.
                          </p>
                        )}

                        {summary?.overdueAssignments > 0 && (
                          <p className="text-red-600">
                            🚨 You have {summary.overdueAssignments} overdue assignment(s). Contact your teacher as soon as possible.
                          </p>
                        )}

                        {summary?.totalHazards > 0 && (
                          <p className="text-orange-600">
                            ⚠️ You&apos;ve recorded {summary.totalHazards} hazard(s) in labs. Please review safety protocols.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

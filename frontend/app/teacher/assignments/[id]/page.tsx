"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Filter, Save, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeacherSidebar } from "@/components/teacher/sidebar"

type SubmissionRow = {
  id: string
  student: { id: string; fullName: string; email: string }
  status: string
  submittedAt: string
  answers: any
  runId: string | null
  score: number | null
  feedback: string | null
  gradedAt: string | null
  gradedBy: { id: string; fullName: string; email: string } | null
}

export default function TeacherAssignmentDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [gradeInputs, setGradeInputs] = useState<Record<string, { score: string; feedback: string }>>({})

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/teacher/assignments/${params.id}/submissions`)
      const data = await res.json()
      if (!res.ok) {
        setError(String(data?.error || "Failed to load"))
        return
      }
      setAssignment(data.assignment)
      const rows = Array.isArray(data?.submissions) ? data.submissions : []
      setSubmissions(rows)

      const next: Record<string, { score: string; feedback: string }> = {}
      for (const s of rows) {
        next[s.id] = {
          score: typeof s.score === "number" ? String(Math.round(s.score)) : "",
          feedback: s.feedback || "",
        }
      }
      setGradeInputs(next)
    } catch {
      setError("Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const matchesSearch = s.student.fullName.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" || s.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [submissions, search, statusFilter])

  const handleSave = async (submissionId: string) => {
    setSaving(true)
    setError(null)
    try {
      const entry = gradeInputs[submissionId]
      const score = Number(entry?.score)
      const feedback = entry?.feedback || ""

      const res = await fetch(`/api/teacher/assignments/${params.id}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, score, feedback }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(String(data?.error || "Failed to grade"))
        return
      }
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assignment</h1>
            <p className="text-muted-foreground mt-1">Review submissions and grade</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teacher/assignments" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : assignment ? (
              <div className="space-y-1">
                <p className="font-semibold">{assignment.title}</p>
                <p className="text-sm text-muted-foreground">{assignment.description}</p>
                <p className="text-xs text-muted-foreground">
                  Class: {assignment.class?.label} | Type: {assignment.type} | Due: {new Date(assignment.dueDate).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not found.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-card border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {filtered.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border bg-background/50 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{s.student.fullName}</p>
                        <p className="text-xs text-muted-foreground">{s.student.email}</p>
                        <p className="text-xs text-muted-foreground">Status: {s.status}</p>
                        <p className="text-xs text-muted-foreground">Submitted: {new Date(s.submittedAt).toLocaleString()}</p>
                        {s.runId && <p className="text-xs text-muted-foreground">Run ID: {s.runId}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Score: {typeof s.score === "number" ? `${Math.round(s.score)}%` : "—"}</p>
                      </div>
                    </div>

                    {s.answers && (
                      <pre className="text-xs bg-muted/30 border border-border rounded p-3 overflow-auto max-h-48">{JSON.stringify(s.answers, null, 2)}</pre>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="grid gap-2">
                        <Label>Score (0-100)</Label>
                        <Input
                          value={gradeInputs[s.id]?.score ?? ""}
                          onChange={(e) =>
                            setGradeInputs((p) => ({
                              ...p,
                              [s.id]: { score: e.target.value, feedback: p[s.id]?.feedback ?? "" },
                            }))
                          }
                        />
                      </div>
                      <div className="grid gap-2 md:col-span-2">
                        <Label>Feedback</Label>
                        <Input
                          value={gradeInputs[s.id]?.feedback ?? ""}
                          onChange={(e) =>
                            setGradeInputs((p) => ({
                              ...p,
                              [s.id]: { score: p[s.id]?.score ?? "", feedback: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-3 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSave(s.id)}
                          disabled={saving || !gradeInputs[s.id]?.score}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          Save grade
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Filter, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeacherSidebar } from "@/components/teacher/sidebar"

type ClassOption = {
  id: string
  label: string
}

type AssignmentRow = {
  id: string
  title: string
  description: string
  type: "experiment" | "quiz" | "questions"
  dueDate: string
  extendedDueDate: string | null
  createdAt: string
  class: { id: string; label: string; school: string; teacherId: string }
  practicalId: string | null
  submissionsCount: number
}

type ExperimentOption = {
  id: string
  title: string
  description?: string
  subject?: string
  classLevel?: string
  category?: string
}

export default function TeacherAssignmentsPage() {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)

  const [experiments, setExperiments] = useState<ExperimentOption[]>([])
  const [experimentSearch, setExperimentSearch] = useState("")

  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    type: "experiment" as "experiment" | "quiz" | "questions",
    classId: "",
    dueDate: "",
    extendedDueDate: "",
    practicalId: "",
    questionsJson: "",
    quizJson: "",
  })

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data?.classes) ? data.classes : []
        const mapped: ClassOption[] = rows
          .map((c: any) => ({ id: String(c.id), label: `${c.classLevel}-${c.section}` }))
          .sort((a: ClassOption, b: ClassOption) => a.label.localeCompare(b.label))
        setClasses(mapped)
        if (!newAssignment.classId && mapped.length > 0) {
          setNewAssignment((p) => ({ ...p, classId: mapped[0].id }))
        }
      })
      .catch(() => {
        // ignore
      })

    fetch("/api/teacher/lab-experiments")
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data?.experiments) ? data.experiments : []
        const mapped: ExperimentOption[] = rows
          .map((e: any) => ({
            id: String(e.id),
            title: String(e.title || e.id),
            description: e.description ? String(e.description) : undefined,
            subject: e.subject ? String(e.subject) : undefined,
            classLevel: e.classLevel ? String(e.classLevel) : undefined,
            category: e.category ? String(e.category) : undefined,
          }))
          .sort((a: ExperimentOption, b: ExperimentOption) => a.title.localeCompare(b.title))
        setExperiments(mapped)
      })
      .catch(() => {
        // ignore
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredExperiments = useMemo(() => {
    const q = experimentSearch.trim().toLowerCase()
    if (!q) return experiments
    return experiments.filter((e) => {
      const title = (e.title || "").toLowerCase()
      const id = (e.id || "").toLowerCase()
      const desc = (e.description || "").toLowerCase()
      return title.includes(q) || id.includes(q) || desc.includes(q)
    })
  }, [experiments, experimentSearch])

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const url = new URL(window.location.origin + "/api/teacher/assignments")
      if (classFilter !== "all") url.searchParams.set("classId", classFilter)
      const res = await fetch(url.toString())
      const data = await res.json()
      const rows = Array.isArray(data?.assignments) ? data.assignments : []
      setAssignments(rows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classFilter])

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || a.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [assignments, search, typeFilter])

  const handleCreate = async () => {
    setCreateError(null)
    const title = newAssignment.title.trim()
    const description = newAssignment.description.trim()

    if (!title || !description) {
      setCreateError("Title and description are required")
      return
    }
    if (!newAssignment.classId) {
      setCreateError("Class is required")
      return
    }
    if (!newAssignment.dueDate) {
      setCreateError("Due date is required")
      return
    }

    const payload: any = {
      title,
      description,
      type: newAssignment.type,
      classId: newAssignment.classId,
      dueDate: newAssignment.dueDate,
    }
    if (newAssignment.extendedDueDate) payload.extendedDueDate = newAssignment.extendedDueDate

    if (newAssignment.type === "experiment") {
      if (!newAssignment.practicalId.trim()) {
        setCreateError("Experiment is required")
        return
      }
      payload.practicalId = newAssignment.practicalId.trim()
    }

    if (newAssignment.type === "questions") {
      if (!newAssignment.questionsJson.trim()) {
        setCreateError("questions JSON is required")
        return
      }
      try {
        payload.questionsSpec = JSON.parse(newAssignment.questionsJson)
      } catch {
        setCreateError("questions JSON is invalid")
        return
      }
    }

    if (newAssignment.type === "quiz") {
      if (!newAssignment.quizJson.trim()) {
        setCreateError("quiz JSON is required")
        return
      }
      try {
        payload.quizSpec = JSON.parse(newAssignment.quizJson)
      } catch {
        setCreateError("quiz JSON is invalid")
        return
      }
    }

    setCreating(true)
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCreateError(String(data?.error || "Failed to create assignment"))
        return
      }
      setCreateOpen(false)
      setNewAssignment((p) => ({
        ...p,
        title: "",
        description: "",
        dueDate: "",
        extendedDueDate: "",
        practicalId: "",
        questionsJson: "",
        quizJson: "",
      }))
      await loadAssignments()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="text-muted-foreground mt-1">Create and review class assignments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/teacher/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
            <Button size="sm" onClick={() => setCreateOpen((v) => !v)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New
            </Button>
          </div>
        </div>

        {createOpen && (
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Create Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {createError && <p className="text-sm text-red-500">{createError}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment((p) => ({ ...p, title: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="classId">Class</Label>
                  <Select value={newAssignment.classId} onValueChange={(v) => setNewAssignment((p) => ({ ...p, classId: v }))}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newAssignment.type}
                    onValueChange={(v) =>
                      setNewAssignment((p) => ({
                        ...p,
                        type: v as any,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="experiment">Experiment</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="questions">Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due date</Label>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="extendedDueDate">Extended due date (optional)</Label>
                  <Input
                    id="extendedDueDate"
                    type="datetime-local"
                    value={newAssignment.extendedDueDate}
                    onChange={(e) => setNewAssignment((p) => ({ ...p, extendedDueDate: e.target.value }))}
                  />
                </div>

                {newAssignment.type === "experiment" && (
                  <div className="grid gap-2">
                    <Label htmlFor="practicalId">Experiment</Label>
                    <Input
                      id="experimentSearch"
                      placeholder="Search experiments..."
                      value={experimentSearch}
                      onChange={(e) => setExperimentSearch(e.target.value)}
                    />
                    <Select
                      value={newAssignment.practicalId}
                      onValueChange={(v) => setNewAssignment((p) => ({ ...p, practicalId: v }))}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select experiment" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredExperiments.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {newAssignment.type === "questions" && (
                <div className="grid gap-2">
                  <Label htmlFor="questionsJson">Questions JSON</Label>
                  <Input
                    id="questionsJson"
                    placeholder='{"questions":[{"id":"q1","prompt":"..."}]}'
                    value={newAssignment.questionsJson}
                    onChange={(e) => setNewAssignment((p) => ({ ...p, questionsJson: e.target.value }))}
                  />
                </div>
              )}

              {newAssignment.type === "quiz" && (
                <div className="grid gap-2">
                  <Label htmlFor="quizJson">Quiz JSON</Label>
                  <Input
                    id="quizJson"
                    placeholder='{"questions":[{"id":"q1","prompt":"...","choices":["A","B"],"answer":"A"}]}'
                    value={newAssignment.quizJson}
                    onChange={(e) => setNewAssignment((p) => ({ ...p, quizJson: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[180px] bg-card border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] bg-card border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="experiment">Experiment</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="questions">Questions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments yet.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((a) => (
                  <div key={a.id} className="rounded-lg border border-border bg-background/50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-semibold">{a.title}</p>
                        <p className="text-sm text-muted-foreground">{a.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Class: {a.class.label} | Type: {a.type} | Due: {new Date(a.dueDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-muted-foreground">Submissions: {a.submissionsCount}</p>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/teacher/assignments/${a.id}`}>View</Link>
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

"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type ClassRow = {
  id: string
  school: string
  classLevel: string
  section: string
  students: number
  teacher: null | { id: string; fullName: string; email: string; teacherSubject?: string | null }
  createdAt: string
}

export default function SchoolAdminClassesPage() {
  const [rows, setRows] = useState<ClassRow[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    fetch("/api/school-admin/classes")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data?.classes)) return
        setRows(data.classes)
      })
      .catch(() => {
        // ignore
      })
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((c) => {
      const key = `${c.classLevel}-${c.section}`.toLowerCase()
      const t = (c.teacher?.fullName || "").toLowerCase()
      return key.includes(s) || t.includes(s)
    })
  }, [rows, q])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <p className="text-muted-foreground">Class sections and assigned teachers</p>
      </div>

      <div className="flex gap-3 items-center">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search classes..." className="max-w-md" />
        <Badge variant="outline">{filtered.length}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <Card key={c.id} className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{c.classLevel}-{c.section}</span>
                <Badge variant="outline">{c.students} students</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div>Teacher: {c.teacher ? `${c.teacher.fullName} (${c.teacher.teacherSubject || "N/A"})` : "Unassigned"}</div>
              <div className="mt-1">School: {c.school}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-muted-foreground">No classes found.</div>}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

type Row = {
  id: string
  fullName: string
  email: string
  role: string
  school: string | null
  classLevel: string | null
  teacherSubject?: string | null
  createdAt: string
}

export default function SchoolAdminTeachersPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    fetch("/api/school-admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return
        setRows(data.filter((u: any) => u.role === "teacher"))
      })
      .catch(() => {
        // ignore
      })
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => {
      return (
        String(r.fullName || "").toLowerCase().includes(s) ||
        String(r.email || "").toLowerCase().includes(s) ||
        String(r.teacherSubject || "").toLowerCase().includes(s)
      )
    })
  }, [rows, q])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
        <p className="text-muted-foreground">All teachers in your school</p>
      </div>

      <div className="flex gap-3 items-center">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teachers..." className="max-w-md" />
        <Badge variant="outline">{filtered.length}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <Card key={t.id} className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{t.fullName}</span>
                <Badge variant="outline">{t.teacherSubject || "Subject N/A"}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div>{t.email}</div>
              <div className="mt-1">Class: {t.classLevel || "N/A"}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-muted-foreground">No teachers found.</div>}
    </div>
  )
}

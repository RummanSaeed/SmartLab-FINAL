"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, GraduationCap } from "lucide-react"

type Row = {
  id: string
  fullName: string
  email: string
  role: string
  school: string | null
  classLevel: string | null
  createdAt: string
}

export default function SchoolAdminStudentsPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [q, setQ] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({ fullName: "", email: "", password: "", classLevel: "", section: "A" })

  const loadStudents = () => {
    fetch("/api/school-admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return
        setRows(data.filter((u: any) => u.role === "student"))
      })
      .catch(() => {
        // ignore
      })
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)
    try {
      const res = await fetch("/api/school-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "student" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(String((data as any)?.error || "Failed to add student"))
        return
      }
      if (res.ok) {
        setOpen(false)
        setForm({ fullName: "", email: "", password: "", classLevel: "", section: "A" })
        loadStudents()
      }
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => {
      return String(r.fullName || "").toLowerCase().includes(s) || String(r.email || "").toLowerCase().includes(s)
    })
  }, [rows, q])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="w-8 h-8" />
            Students
          </h1>
          <p className="text-muted-foreground">Manage all students in your school</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v)
            if (v) setFormError(null)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              {formError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classLevel">Class Level</Label>
                <Input id="classLevel" value={form.classLevel} onChange={(e) => setForm({ ...form, classLevel: e.target.value })} placeholder="e.g., 9, 10, 11" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <select
                  id="section"
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Student"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 items-center">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search students..." className="max-w-md" />
        <Badge variant="outline">{filtered.length}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((t) => (
          <Card key={t.id} className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div>{t.email}</div>
              <div className="mt-1">Class: {t.classLevel || "N/A"}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-muted-foreground">No students found.</div>}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Users } from "lucide-react"

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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ fullName: "", email: "", password: "", subject: "", classLevel: "", section: "A" })

  const loadTeachers = () => {
    fetch("/api/school-admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return
        setRows(data.filter((u: any) => u.role === "teacher"))
      })
      .catch(() => {
        // ignore
      })
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/school-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "teacher", classLevel: form.classLevel || "9" }),
      })
      if (res.ok) {
        setOpen(false)
        setForm({ fullName: "", email: "", password: "", subject: "", classLevel: "", section: "A" })
        loadTeachers()
      }
    } finally {
      setLoading(false)
    }
  }

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8" />
            Teachers
          </h1>
          <p className="text-muted-foreground">Manage all teachers in your school</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
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
                {loading ? "Adding..." : "Add Teacher"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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

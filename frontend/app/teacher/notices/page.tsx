"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Filter, Plus, Search } from "lucide-react"

import { TeacherSidebar } from "@/components/teacher/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ClassOption = { id: string; label: string }

type NoticeRow = {
  id: string
  title: string
  content: string
  createdAt: string
  classId: string | null
  classLabel: string | null
}

export default function TeacherNoticesPage() {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [items, setItems] = useState<NoticeRow[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newNotice, setNewNotice] = useState({ title: "", content: "", classId: "" })

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data?.classes) ? data.classes : []
        const mapped: ClassOption[] = rows
          .map((c: any) => ({ id: String(c.id), label: `${c.classLevel}-${c.section}` }))
          .sort((a: ClassOption, b: ClassOption) => a.label.localeCompare(b.label))
        setClasses(mapped)
        if (!newNotice.classId && mapped.length > 0) setNewNotice((p) => ({ ...p, classId: mapped[0].id }))
      })
      .catch(() => {
        // ignore
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const url = new URL(window.location.origin + "/api/teacher/notices")
      if (classFilter !== "all") url.searchParams.set("classId", classFilter)
      const res = await fetch(url.toString())
      const data = await res.json().catch(() => ({}))
      setItems(Array.isArray(data?.notices) ? data.notices : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classFilter])

  const filtered = useMemo(() => {
    return items.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase())
      return matchesSearch
    })
  }, [items, search])

  const handleCreate = async () => {
    setCreateError(null)
    const title = newNotice.title.trim()
    const content = newNotice.content.trim()
    if (!title || !content || !newNotice.classId) {
      setCreateError("title, content and class are required")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/teacher/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, classId: newNotice.classId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCreateError(String(data?.error || "Failed to create"))
        return
      }
      setCreateOpen(false)
      setNewNotice((p) => ({ ...p, title: "", content: "" }))
      await load()
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
            <h1 className="text-3xl font-bold">Notices</h1>
            <p className="text-muted-foreground mt-1">Post announcements to a class section</p>
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
              <CardTitle className="text-lg">Create Notice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {createError && <p className="text-sm text-red-500">{createError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input value={newNotice.title} onChange={(e) => setNewNotice((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Class</Label>
                  <Select value={newNotice.classId} onValueChange={(v) => setNewNotice((p) => ({ ...p, classId: v }))}>
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
              </div>
              <div className="grid gap-2">
                <Label>Content</Label>
                <Input value={newNotice.content} onChange={(e) => setNewNotice((p) => ({ ...p, content: e.target.value }))} />
              </div>
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
              placeholder="Search notices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>

          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[200px] bg-card border-border">
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
        </div>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Notices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notices.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((n) => (
                  <div key={n.id} className="rounded-lg border border-border bg-background/50 p-4">
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.classLabel ? `Class ${n.classLabel} | ` : ""}Posted: {new Date(n.createdAt).toLocaleString()}
                    </p>
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

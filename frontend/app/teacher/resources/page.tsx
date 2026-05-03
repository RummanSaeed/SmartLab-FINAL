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

type ResourceRow = {
  id: string
  title: string
  url: string
  createdAt: string
  classId: string | null
  classLabel: string | null
}

export default function TeacherResourcesPage() {
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [items, setItems] = useState<ResourceRow[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newItem, setNewItem] = useState({ title: "", url: "", classId: "" })

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data?.classes) ? data.classes : []
        const mapped: ClassOption[] = rows
          .map((c: any) => ({ id: String(c.id), label: `${c.classLevel}-${c.section}` }))
          .sort((a: ClassOption, b: ClassOption) => a.label.localeCompare(b.label))
        setClasses(mapped)
        if (!newItem.classId && mapped.length > 0) setNewItem((p) => ({ ...p, classId: mapped[0].id }))
      })
      .catch(() => {
        // ignore
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const url = new URL(window.location.origin + "/api/teacher/resources")
      if (classFilter !== "all") url.searchParams.set("classId", classFilter)
      const res = await fetch(url.toString())
      const data = await res.json().catch(() => ({}))
      setItems(Array.isArray(data?.resources) ? data.resources : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classFilter])

  const filtered = useMemo(() => {
    return items.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
  }, [items, search])

  const handleCreate = async () => {
    setCreateError(null)
    const title = newItem.title.trim()
    const url = newItem.url.trim()
    if (!title || !url || !newItem.classId) {
      setCreateError("title, url and class are required")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/teacher/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url, classId: newItem.classId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCreateError(String(data?.error || "Failed to create"))
        return
      }
      setCreateOpen(false)
      setNewItem((p) => ({ ...p, title: "", url: "" }))
      await load()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="shrink-0">
            <Link href="/teacher/dashboard">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Resources</h1>
            <p className="text-muted-foreground mt-1">Share resources with a class section</p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen((v) => !v)} className="flex items-center gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>

        {createOpen && (
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Create Resource</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {createError && <p className="text-sm text-red-500">{createError}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input value={newItem.title} onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Class</Label>
                  <Select value={newItem.classId} onValueChange={(v) => setNewItem((p) => ({ ...p, classId: v }))}>
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
                <Label>URL</Label>
                <Input value={newItem.url} onChange={(e) => setNewItem((p) => ({ ...p, url: e.target.value }))} />
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
              placeholder="Search resources..."
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
            <CardTitle className="text-lg">Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resources.</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border bg-background/50 p-4">
                    <p className="font-semibold">{r.title}</p>
                    <a className="text-sm underline text-primary break-all" href={r.url} target="_blank" rel="noreferrer">
                      {r.url}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {r.classLabel ? `Class ${r.classLabel} | ` : ""}Added: {new Date(r.createdAt).toLocaleString()}
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

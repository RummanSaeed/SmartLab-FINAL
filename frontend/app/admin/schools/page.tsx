"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, RefreshCcw, Search } from "lucide-react"

type SchoolRow = { name: string }

export default function AdminSchoolsPage() {
  const [rows, setRows] = useState<SchoolRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/schools")
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to load schools")
      setRows(Array.isArray(data?.schools) ? data.schools : [])
    } catch (e: any) {
      setError(e?.message || "Failed to load schools")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((s) => (s.name || "").toLowerCase().includes(q))
  }, [rows, query])

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-muted-foreground" />
              Schools
            </h1>
            <p className="text-muted-foreground">All schools detected from user records (admin view).</p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search schools..." className="pl-9" />
          </div>
          <Badge variant="outline" className="h-10 flex items-center">
            {filtered.length} schools
          </Badge>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10 mb-6">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card key={s.name} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="font-semibold">{s.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-16">No schools found.</div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Search, RefreshCcw } from "lucide-react"

type FeedbackRow = {
  id: string
  authorId: string
  practicalId: string
  practicalTitle: string | null
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
  user: null | {
    id: string
    fullName: string
    email: string
    role: string
    school: string | null
    classLevel: string | null
  }
}

export default function AdminExperimentFeedbackPage() {
  const [rows, setRows] = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/experiment-feedback?take=200")
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to load feedback")
      setRows(Array.isArray(data?.feedback) ? data.feedback : [])
    } catch (e: any) {
      setError(e?.message || "Failed to load feedback")
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
    return rows.filter((r) => {
      const title = (r.practicalTitle || "").toLowerCase()
      const pid = (r.practicalId || "").toLowerCase()
      const comment = (r.comment || "").toLowerCase()
      const author = (r.authorId || "").toLowerCase()
      const userName = (r.user?.fullName || "").toLowerCase()
      const userEmail = (r.user?.email || "").toLowerCase()
      return (
        title.includes(q) ||
        pid.includes(q) ||
        comment.includes(q) ||
        author.includes(q) ||
        userName.includes(q) ||
        userEmail.includes(q)
      )
    })
  }, [rows, query])

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Experiment Feedback</h1>
            <p className="text-muted-foreground">Ratings and comments submitted after finishing experiments.</p>
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2" />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by experiment, user, authorId, comment..." className="pl-9" />
          </div>
          <Badge variant="outline" className="h-10 flex items-center">
            {filtered.length} items
          </Badge>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/10 mb-6">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((r) => {
            const stars = Math.min(5, Math.max(1, Number(r.rating) || 1))
            const isGuest = r.authorId.startsWith("guest-")
            return (
              <Card key={r.id} className="bg-card/50 border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{r.practicalTitle || r.practicalId}</div>
                      <div className="text-xs text-muted-foreground mt-1">{r.practicalId}</div>
                    </div>
                    <div className="flex items-center gap-1" aria-label={`${stars} stars`}>
                      {Array.from({ length: 5 }).map((_, i) => {
                        const active = i + 1 <= stars
                        return <Star key={i} className={active ? "w-4 h-4 text-yellow-400" : "w-4 h-4 text-muted-foreground"} fill={active ? "currentColor" : "none"} />
                      })}
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <div className="text-muted-foreground">Author</div>
                    <div className="mt-1 flex flex-wrap gap-2 items-center">
                      <Badge variant="outline">{isGuest ? "Guest" : "User"}</Badge>
                      <span className="text-xs text-muted-foreground">{r.authorId}</span>
                    </div>
                    {r.user && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {r.user.fullName} ({r.user.email})
                        {r.user.school ? ` • ${r.user.school}` : ""}
                        {r.user.classLevel ? ` • Class ${r.user.classLevel}` : ""}
                      </div>
                    )}
                  </div>

                  {r.comment && (
                    <div className="mt-3">
                      <div className="text-muted-foreground text-sm mb-1">Comment</div>
                      <div className="text-sm whitespace-pre-wrap">{r.comment}</div>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-muted-foreground">
                    Updated: {new Date(r.updatedAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-16">No feedback found.</div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { StudentSidebar } from "@/components/student/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type RunRow = {
  id: string
  practicalTitle: string
  practicalId: string
  simType: string
  status: string
  startedAt: string
  endedAt: string | null
  durationSec: number | null
  score: number | null
  hazards: number
}

export default function StudentHistoryPage() {
  const [runs, setRuns] = useState<RunRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [simTypeFilter, setSimTypeFilter] = useState("all")

  useEffect(() => {
    setError(null)
    const url = new URL(window.location.origin + "/api/student/history")
    if (statusFilter !== "all") url.searchParams.set("status", statusFilter)
    if (simTypeFilter !== "all") url.searchParams.set("simType", simTypeFilter)

    fetch(url.toString())
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(String(data?.error || "Failed to load history"))
          return
        }
        setRuns(data.runs || [])
      })
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false))
  }, [statusFilter, simTypeFilter])

  const filtered = useMemo(() => runs, [runs])

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-2">My History</h1>
        <p className="text-muted-foreground mb-8">Your recent activity and experiment actions.</p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-card border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={simTypeFilter} onValueChange={setSimTypeFilter}>
            <SelectTrigger className="w-[200px] bg-card border-border">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border p-6 bg-card/70">
          {loading ? (
            <p>Loading history...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-lg">No runs found.</p>
          ) : (
            <ul className="space-y-4">
              {filtered.map((r) => (
                <li key={r.id} className="border rounded p-4 bg-background/80">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{r.practicalTitle}</p>
                      <p className="text-sm text-muted-foreground">{r.simType} | {r.status} | Hazards: {r.hazards}</p>
                      <span className="block text-xs text-muted-foreground mt-1">{new Date(r.startedAt).toLocaleString()}</span>
                      {typeof r.score === "number" && (
                        <span className="block text-xs text-muted-foreground">Score: {Math.round(r.score)}%</span>
                      )}
                    </div>
                    <a className="text-sm underline text-primary" href={`/student/history/${r.id}`}>View</a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

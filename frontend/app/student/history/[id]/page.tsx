"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { StudentSidebar } from "@/components/student/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StudentRunDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [run, setRun] = useState<any>(null)

  useEffect(() => {
    setError(null)
    setLoading(true)
    fetch(`/api/student/runs/${params.id}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(String(data?.error || "Failed to load run"))
          return
        }
        setRun(data.run)
      })
      .catch(() => setError("Failed to load run"))
      .finally(() => setLoading(false))
  }, [params.id])

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Run Details</h1>
            <p className="text-muted-foreground mt-1">View your experiment attempt details</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/student/history" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : !run ? (
          <p className="text-sm text-muted-foreground">Not found.</p>
        ) : (
          <>
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-semibold">{run.practicalTitle}</p>
                <p className="text-sm text-muted-foreground">{run.simType} | {run.status}</p>
                <p className="text-xs text-muted-foreground">Started: {new Date(run.startedAt).toLocaleString()}</p>
                {run.endedAt && <p className="text-xs text-muted-foreground">Ended: {new Date(run.endedAt).toLocaleString()}</p>}
                {typeof run.score === "number" && <p className="text-xs text-muted-foreground">Score: {Math.round(run.score)}%</p>}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Hazards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.isArray(run.hazards) && run.hazards.length > 0 ? (
                    run.hazards.map((h: any) => (
                      <div key={h.id} className="rounded border border-border bg-background/50 p-3">
                        <p className="text-sm font-medium">{h.severity} - {h.code}</p>
                        <p className="text-xs text-muted-foreground">{h.message}</p>
                        <p className="text-[11px] text-muted-foreground">{new Date(h.occurredAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hazards.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Array.isArray(run.steps) && run.steps.length > 0 ? (
                    run.steps
                      .slice()
                      .sort((a: any, b: any) => Number(a.stepNo) - Number(b.stepNo))
                      .map((s: any) => (
                        <div key={s.id} className="rounded border border-border bg-background/50 p-3">
                          <p className="text-sm font-medium">#{s.stepNo} {s.title}</p>
                          <p className="text-xs text-muted-foreground">Status: {s.status}</p>
                          {s.note && <p className="text-xs text-muted-foreground">{s.note}</p>}
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No steps recorded.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">AI Tutor Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.isArray(run.tutorMessages) && run.tutorMessages.length > 0 ? (
                  run.tutorMessages.map((m: any) => (
                    <div key={m.id} className="rounded border border-border bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground">{m.role}</p>
                      <p className="text-sm">{m.content}</p>
                      <p className="text-[11px] text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No messages.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}

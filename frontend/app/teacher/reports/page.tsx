"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardData = {
  classes: Array<{ id: number; name: string; students: number; completion: number; hoursSpent: number; hazardAlerts: number; avgScore: number }>
  recentAttempts: Array<{ id: string; student: string; class: string; experiment: string; score: number | null; status: string; time: string }>
  hazardAlerts: Array<{ id: string; student: string; experiment: string; type: string; time: string }>
}

export default function TeacherReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch("/api/dashboard/teacher")
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) return
        setData(d)
      })
      .catch(() => {
        // ignore
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Class completion, hazards, and recent attempts.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(data?.classes || []).slice(0, 6).map((c) => (
          <Card key={c.id} className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Class {c.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <div>Students: {c.students}</div>
              <div>Completion: {c.completion}%</div>
              <div>Avg score: {c.avgScore}</div>
              <div>Hazards: {c.hazardAlerts}</div>
              <div>Hours: {c.hoursSpent}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Recent Attempts</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {(data?.recentAttempts || []).length === 0 && <div>No attempts yet.</div>}
            {(data?.recentAttempts || []).map((a) => (
              <div key={a.id} className="flex justify-between gap-3 border-b border-border/50 pb-2 last:border-b-0">
                <div>
                  <div className="font-medium text-foreground">{a.student}</div>
                  <div className="text-xs">{a.experiment}</div>
                </div>
                <div className="text-right text-xs">
                  <div>{a.status}</div>
                  <div>{a.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Recent Hazards</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            {(data?.hazardAlerts || []).length === 0 && <div>No hazards recorded.</div>}
            {(data?.hazardAlerts || []).map((h) => (
              <div key={h.id} className="flex justify-between gap-3 border-b border-border/50 pb-2 last:border-b-0">
                <div>
                  <div className="font-medium text-foreground">{h.student}</div>
                  <div className="text-xs">{h.type}</div>
                </div>
                <div className="text-right text-xs">{h.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

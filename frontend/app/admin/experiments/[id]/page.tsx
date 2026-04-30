"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Beaker, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ExperimentDetail = {
  experiment: {
    id: string
    title: string
    subject: string
    classLevel: string
    level: string
    category: string
    hazard: string
    steps: string[]
  }
  stats: {
    attempts: number
    avgScore: number
    avgDurationSec: number | null
    hazards: number
  }
}

export default function AdminExperimentPreviewPage() {
  const params = useParams()
  const id = String((params as any)?.id || "")

  const [data, setData] = useState<ExperimentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    fetch(`/api/admin/experiments/${encodeURIComponent(id)}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (!mounted) return
        if (!ok) {
          setError(String(j?.error || "Failed to load experiment"))
          setData(null)
          return
        }
        setData(j as ExperimentDetail)
      })
      .catch(() => {
        if (!mounted) return
        setError("Failed to load experiment")
        setData(null)
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link href="/admin/experiments">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Experiment Preview</h1>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-sm text-red-400">{error}</div>
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                {data.experiment.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{data.experiment.subject}</Badge>
                <Badge variant="outline">{data.experiment.classLevel}</Badge>
                <Badge variant="outline">{data.experiment.category}</Badge>
                <Badge variant="outline">{data.experiment.level}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/50 bg-background/40 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">Hazard Level</span>
                </div>
                <p className="text-sm text-muted-foreground">{data.experiment.hazard}</p>
              </div>

              <div>
                <p className="font-medium mb-2">Procedure Steps</p>
                <div className="space-y-2">
                  {data.experiment.steps.map((s, idx) => (
                    <div key={idx} className="text-sm rounded-lg border border-border/50 bg-background/40 p-3">
                      <span className="text-muted-foreground mr-2">Step {idx + 1}:</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Usage Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Attempts</span>
                <span className="font-medium">{data.stats.attempts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Score</span>
                <span className="font-medium">{data.stats.avgScore}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Duration</span>
                <span className="font-medium">
                  {data.stats.avgDurationSec === null ? "N/A" : `${Math.round(data.stats.avgDurationSec / 60)} min`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hazard Events</span>
                <span className="font-medium">{data.stats.hazards}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

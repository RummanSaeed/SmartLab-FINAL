"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Clock, BookOpen, Pin, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { practicals } from "@/data/practicals"

interface ExperimentRun {
  id: string
  practicalId: string
  practicalTitle: string
  simType: string
  status: "in_progress" | "completed" | "abandoned"
  startedAt: string
  endedAt?: string
  durationSec?: number
  score?: number
}

export default function LabWorkspacePage() {
  const router = useRouter()
  const [inProgressRun, setInProgressRun] = useState<ExperimentRun | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simple pinned list for now; could be made user-specific later
  const pinnedExperiments = practicals.slice(0, 4)

  useEffect(() => {
    const fetchInProgress = async () => {
      try {
        const res = await fetch("/api/student/history?status=in_progress&take=1")
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data?.error || "Failed to load in-progress run")
          return
        }
        const data = await res.json()
        const runs: ExperimentRun[] = data.runs || []
        setInProgressRun(runs[0] || null)
      } catch {
        setError("Failed to load in-progress run")
      } finally {
        setLoading(false)
      }
    }
    fetchInProgress()
  }, [])

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold mb-2">Lab Workspace</h1>
          <p className="text-muted-foreground">Continue your current experiment or start a new one.</p>
        </div>
      </div>

      {/* Current In-Progress Experiment */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Current Experiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          ) : inProgressRun ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{inProgressRun.practicalTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  Started {new Date(inProgressRun.startedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="default">In Progress</Badge>
                {inProgressRun.durationSec && (
                  <span className="text-sm text-muted-foreground">
                    {formatDuration(inProgressRun.durationSec)}
                  </span>
                )}
              </div>
              <Button asChild>
                <Link href={`/student/lab/${inProgressRun.practicalId}`}>
                  <Play className="w-4 h-4 mr-2" />
                  Continue
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg mb-2">No experiment in progress</p>
              <p className="text-sm">Start a new experiment below.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pinned Experiments */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pin className="w-5 h-5" />
            Pinned Experiments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pinnedExperiments.length === 0 ? (
            <p className="text-muted-foreground">No pinned experiments.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pinnedExperiments.map((exp) => (
                <div key={exp.id} className="border rounded-lg p-4 bg-background/80">
                  <h3 className="font-semibold mb-1">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {exp.subject} • Class {exp.classLevel}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{exp.category}</Badge>
                    <Button size="sm" asChild>
                      <Link href={`/student/lab/${exp.id}`}>
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/student/dashboard">View Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/student/history">View History</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/student/assignments">Assignments</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/student/notices">Notices</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/student/resources">Resources</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


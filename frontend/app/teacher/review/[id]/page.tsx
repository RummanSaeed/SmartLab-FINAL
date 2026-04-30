"use client"

import { use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  CheckCircle,
  AlertTriangle,
  Download,
  Send,
  User,
  Beaker,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"

export default function AttemptReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState([0])
  const [feedback, setFeedback] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [run, setRun] = useState<any>(null)

  useEffect(() => {
    setError(null)
    setLoading(true)
    fetch(`/api/student/runs/${id}`)
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
  }, [id])

  const attempt = useMemo(() => {
    const startedAt = run?.startedAt ? new Date(run.startedAt) : null
    const endedAt = run?.endedAt ? new Date(run.endedAt) : null
    const durationMin = typeof run?.durationSec === "number" ? Math.max(0, Math.round(run.durationSec / 60)) : null

    const classLabel = run?.user?.class?.classLevel && run?.user?.class?.section ? `${run.user.class.classLevel}-${run.user.class.section}` : "N/A"

    const hazards = Array.isArray(run?.hazards) ? run.hazards : []
    const hazardIncidents = hazards.map((h: any) => ({
      type: String(h.code || "Hazard"),
      time: h.occurredAt ? new Date(h.occurredAt).toLocaleTimeString() : "",
      severity: String(h.severity || ""),
      description: String(h.message || ""),
    }))

    const tutorMessages = Array.isArray(run?.tutorMessages) ? run.tutorMessages : []
    const aiTranscript = tutorMessages.map((m: any) => ({
      role: String(m.role || "tutor") === "student" ? "student" : "tutor",
      message: String(m.content || ""),
      time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : "",
    }))

    const steps = Array.isArray(run?.steps) ? run.steps : []
    const stepEvents = steps
      .slice()
      .sort((a: any, b: any) => Number(a.stepNo) - Number(b.stepNo))
      .map((s: any) => {
        const t = s.completedAt ? new Date(s.completedAt) : s.createdAt ? new Date(s.createdAt) : null
        const minutes = startedAt && t ? Math.max(0, Math.round((t.getTime() - startedAt.getTime()) / 60000)) : 0
        return { time: minutes, event: String(s.title || "Step"), type: String(s.status || "info") }
      })

    const timeline = [
      { time: 0, event: "Started experiment", type: "info" },
      ...stepEvents,
      ...hazards.map((h: any) => {
        const t = h.occurredAt ? new Date(h.occurredAt) : null
        const minutes = startedAt && t ? Math.max(0, Math.round((t.getTime() - startedAt.getTime()) / 60000)) : 0
        return { time: minutes, event: String(h.message || "Hazard"), type: "warning" }
      }),
      { time: durationMin || 0, event: endedAt ? "Experiment ended" : "In progress", type: "info" },
    ].sort((a, b) => a.time - b.time)

    return {
      id,
      student: String(run?.user?.fullName || "Student"),
      class: classLabel,
      experiment: String(run?.practicalTitle || "Experiment"),
      subject: String(run?.simType || ""),
      date: startedAt ? startedAt.toLocaleDateString() : "",
      time: startedAt ? startedAt.toLocaleTimeString() : "",
      duration: durationMin !== null ? `${durationMin} min` : "N/A",
      score: typeof run?.score === "number" ? Math.round(run.score) : 0,
      studentSetup: {},
      expectedSetup: {},
      aiTranscript,
      hazardIncidents,
      timeline,
    }
  }, [id, run])

  const handleSubmitFeedback = () => {
    // Handle feedback submission
    console.log("Submitting feedback:", feedback)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-bold">Review Attempt</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : error ? error : `${run?.user?.fullName || "Student"} - ${run?.practicalTitle || "Experiment"}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Badge variant={(run?.score || 0) >= 80 ? "default" : "secondary"} className="text-lg px-4 py-1">
            {typeof run?.score === "number" ? `${Math.round(run.score)}%` : "N/A"}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{attempt.student}</h3>
                      <p className="text-sm text-muted-foreground">Class {attempt.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {attempt.date} at {attempt.time}
                    </p>
                    <p className="text-sm">Duration: {attempt.duration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Playback Controls */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Attempt Playback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-background rounded-lg mb-4 flex items-center justify-center border border-border/50">
                  <div className="text-center">
                    <Beaker className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Experiment Recording Preview</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Slider value={playbackPosition} onValueChange={setPlaybackPosition} max={52} step={1} />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon">
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setIsPlaying(!isPlaying)} size="icon">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="icon">
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className="text-sm text-muted-foreground">{playbackPosition[0]}:00 / 52:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Setup Comparison */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Setup Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-primary">Student Setup</h4>
                    <div className="space-y-2">
                      {Object.entries(attempt.studentSetup).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="text-muted-foreground text-sm capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-green-500">Expected Setup</h4>
                    <div className="space-y-2">
                      {Object.entries(attempt.expectedSetup).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="text-muted-foreground text-sm capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Form */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Teacher Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your feedback for the student..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-32 bg-background/50 border-border/50 mb-4"
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline">Save Draft</Button>
                  <Button onClick={handleSubmitFeedback}>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Tabs defaultValue="timeline">
              <TabsList className="w-full">
                <TabsTrigger value="timeline" className="flex-1">
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex-1">
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="hazards" className="flex-1">
                  Hazards
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {attempt.timeline.map((event, index) => (
                        <div key={index} className="flex gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              event.type === "warning"
                                ? "bg-yellow-500"
                                : event.type === "success"
                                  ? "bg-green-500"
                                  : event.type === "ai"
                                    ? "bg-primary"
                                    : "bg-muted-foreground"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-sm">{event.event}</p>
                            <p className="text-xs text-muted-foreground">{event.time} min</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai" className="mt-4">
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {attempt.aiTranscript.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 ${
                              msg.role === "student" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.role === "student" ? "text-primary-foreground/70" : "text-muted-foreground"
                              }`}
                            >
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="hazards" className="mt-4">
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-4">
                    {attempt.hazardIncidents.length > 0 ? (
                      <div className="space-y-4">
                        {attempt.hazardIncidents.map((incident, index) => (
                          <div key={index} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-sm">{incident.type}</p>
                                <p className="text-xs text-muted-foreground mt-1">{incident.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">Time: {incident.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No hazard incidents</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

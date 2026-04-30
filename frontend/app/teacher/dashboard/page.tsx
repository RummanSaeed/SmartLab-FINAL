"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Users, Clock, AlertTriangle, TrendingUp, Search, Filter, ChevronRight, Eye, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeacherSidebar } from "@/components/teacher/sidebar"

const defaultClasses = [
  {
    id: 1,
    name: "Class 10-A",
    students: 32,
    completion: 78,
    hoursSpent: 45.5,
    hazardAlerts: 5,
    avgScore: 82,
  },
  {
    id: 2,
    name: "Class 10-B",
    students: 28,
    completion: 65,
    hoursSpent: 38.2,
    hazardAlerts: 8,
    avgScore: 76,
  },
  {
    id: 3,
    name: "Class 11-A",
    students: 25,
    completion: 85,
    hoursSpent: 52.1,
    hazardAlerts: 3,
    avgScore: 88,
  },
]

const defaultRecentAttempts = [
  {
    id: 1,
    student: "Ahmad Khan",
    class: "10-A",
    experiment: "Ohm's Law",
    score: 92,
    status: "completed",
    time: "2h ago",
  },
  {
    id: 2,
    student: "Sara Ahmed",
    class: "10-B",
    experiment: "Acid-Base Titration",
    score: 78,
    status: "needs-review",
    time: "3h ago",
  },
  {
    id: 3,
    student: "Ali Hassan",
    class: "11-A",
    experiment: "Simple Pendulum",
    score: 95,
    status: "completed",
    time: "4h ago",
  },
  {
    id: 4,
    student: "Fatima Malik",
    class: "10-A",
    experiment: "Resistors in Series",
    score: null,
    status: "in-progress",
    time: "5h ago",
  },
  {
    id: 5,
    student: "Usman Shah",
    class: "10-B",
    experiment: "Salt Analysis",
    score: 65,
    status: "needs-review",
    time: "6h ago",
  },
]

const defaultHazardAlerts = [
  {
    id: 1,
    student: "Sara Ahmed",
    experiment: "Acid-Base Titration",
    type: "Chemical spill simulation",
    time: "3h ago",
  },
  { id: 2, student: "Usman Shah", experiment: "Electrolysis", type: "High voltage warning", time: "5h ago" },
  { id: 3, student: "Zara Khan", experiment: "Ohm's Law", type: "Circuit overload", time: "1d ago" },
]

// Completion heatmap data (days x students)
const heatmapData = [
  { day: "Mon", data: [3, 5, 8, 2, 7, 9, 4, 6] },
  { day: "Tue", data: [5, 7, 9, 4, 8, 6, 3, 7] },
  { day: "Wed", data: [8, 6, 7, 9, 5, 4, 8, 9] },
  { day: "Thu", data: [6, 8, 5, 7, 9, 8, 6, 5] },
  { day: "Fri", data: [9, 7, 6, 8, 4, 7, 9, 8] },
]

export default function TeacherDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [teacherName, setTeacherName] = useState("Teacher")
  const [teacherEmail, setTeacherEmail] = useState("teacher@demo.pk")
  const [classes, setClasses] = useState(defaultClasses)
  const [recentAttempts, setRecentAttempts] = useState(defaultRecentAttempts)
  const [hazardAlerts, setHazardAlerts] = useState(defaultHazardAlerts)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("smartlab_user") : null
      if (raw) {
        const parsed = JSON.parse(raw) as { fullName?: string; email?: string; role?: string }
        if (parsed?.fullName) setTeacherName(parsed.fullName)
        if (parsed?.email) setTeacherEmail(parsed.email)
      }
    } catch {
      /* ignore parse errors */
    }
  }, [])

  useEffect(() => {
    fetch("/api/dashboard/teacher")
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) return
        if (Array.isArray(data.classes)) setClasses(data.classes)
        if (Array.isArray(data.recentAttempts)) setRecentAttempts(data.recentAttempts)
        if (Array.isArray(data.hazardAlerts)) setHazardAlerts(data.hazardAlerts)
      })
      .catch(() => {
        // keep fallback demo data
      })
  }, [])

  const totalStudents = classes.reduce((acc, c) => acc + c.students, 0)
  const avgCompletion = Math.round(classes.reduce((acc, c) => acc + c.completion, 0) / classes.length)
  const totalHours = classes.reduce((acc, c) => acc + c.hoursSpent, 0)
  const totalHazards = classes.reduce((acc, c) => acc + c.hazardAlerts, 0)

  const nameInitials = useMemo(() => {
    const parts = teacherName.split(" ").filter(Boolean)
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "T"
  }, [teacherName])

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {teacherName}!</h1>
            <p className="text-muted-foreground">Monitor student progress and manage your classes.</p>
            <p className="text-xs text-muted-foreground">Signed in as {teacherEmail}</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teacher/classes" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Classes
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgCompletion}%</p>
                  <p className="text-sm text-muted-foreground">Avg Completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalHours.toFixed(0)}h</p>
                  <p className="text-sm text-muted-foreground">Total Lab Hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalHazards}</p>
                  <p className="text-sm text-muted-foreground">Hazard Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="classes" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur border border-border/50">
            <TabsTrigger value="classes">My Classes</TabsTrigger>
            <TabsTrigger value="attempts">Recent Attempts</TabsTrigger>
            <TabsTrigger value="alerts">Hazard Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-6">
            {/* Completion Heatmap */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Weekly Activity Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-6">
                    {heatmapData.map((d) => (
                      <div key={d.day} className="h-6 flex items-center">
                        {d.day}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 overflow-auto">
                    <div className="flex gap-1 mb-1 text-xs text-muted-foreground">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="w-10 text-center">
                          H{i + 1}
                        </div>
                      ))}
                    </div>
                    {heatmapData.map((day, dayIndex) => (
                      <div key={dayIndex} className="flex gap-1 mb-1">
                        {day.data.map((value, cellIndex) => (
                          <div
                            key={cellIndex}
                            className="w-10 h-6 rounded"
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${(value / 10) * 0.8 + 0.1})`,
                            }}
                            title={`${value} experiments`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        <Badge variant="outline">{cls.students} students</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Completion</span>
                            <span className="font-medium">{cls.completion}%</span>
                          </div>
                          <Progress value={cls.completion} className="h-2" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-lg bg-background/50">
                            <p className="text-lg font-bold text-green-500">{cls.avgScore}%</p>
                            <p className="text-xs text-muted-foreground">Avg Score</p>
                          </div>
                          <div className="p-2 rounded-lg bg-background/50">
                            <p className="text-lg font-bold text-primary">{cls.hoursSpent}h</p>
                            <p className="text-xs text-muted-foreground">Hours</p>
                          </div>
                          <div className="p-2 rounded-lg bg-background/50">
                            <p className="text-lg font-bold text-yellow-500">{cls.hazardAlerts}</p>
                            <p className="text-xs text-muted-foreground">Hazards</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full bg-transparent" asChild>
                          <Link href={`/teacher/class/${cls.id}`}>
                            View Class
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attempts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Attempts</h2>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search students or experiments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card/50 border-border/50"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Attempts Table */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-0">
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Class</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Experiment</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Score</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttempts.map((attempt) => (
                        <tr key={attempt.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                          <td className="p-4 font-medium">{attempt.student}</td>
                          <td className="p-4 text-muted-foreground">{attempt.class}</td>
                          <td className="p-4">{attempt.experiment}</td>
                          <td className="p-4">
                            {attempt.score !== null ? (
                              <span
                                className={`font-bold ${attempt.score >= 80 ? "text-green-500" : "text-yellow-500"}`}
                              >
                                {attempt.score}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">--</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                attempt.status === "completed"
                                  ? "default"
                                  : attempt.status === "needs-review"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {attempt.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {attempt.status === "needs-review" && <Eye className="w-3 h-3 mr-1" />}
                              {attempt.status.replace("-", " ")}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">{attempt.time}</td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/teacher/review/${attempt.id}`}>Review</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {hazardAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-yellow-500/5 border-yellow-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-yellow-500/20">
                          <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{alert.student}</p>
                          <p className="text-sm text-muted-foreground">
                            {alert.experiment} - {alert.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{alert.time}</span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

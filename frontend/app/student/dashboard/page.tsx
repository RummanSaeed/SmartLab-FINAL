"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Play,
  Clock,
  Zap,
  MessageSquare,
  TrendingUp,
  Search,
  BookOpen,
  Atom,
  Beaker,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentSidebar } from "@/components/student/sidebar"
import { practicals } from "@/data/practicals"

const defaultAssignedTasks = [
  { id: 1, title: "Complete Lens Experiment", dueDate: "Tomorrow", subject: "Physics", priority: "high" },
  { id: 2, title: "Electrolysis of Water", dueDate: "3 days", subject: "Chemistry", priority: "medium" },
  { id: 3, title: "Magnetic Field Lines", dueDate: "1 week", subject: "Physics", priority: "low" },
]

const defaultRecentAttempts = [
  { id: 1, title: "Simple Pendulum", score: 92, status: "completed", date: "Today" },
  { id: 2, title: "Salt Analysis", score: 78, status: "completed", date: "Yesterday" },
  { id: 3, title: "Resistors in Series", score: null, status: "in-progress", date: "2 days ago" },
]

export default function StudentDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") === "catalog" ? "catalog" : "overview"
  const [activeTab, setActiveTab] = useState<"overview" | "catalog">(initialTab)
  const [userName, setUserName] = useState("Ahmad")
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState<string>("student")
  const [userClassLevel, setUserClassLevel] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject") || "all")
  const [selectedClass, setSelectedClass] = useState(searchParams.get("class") || "all")
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get("difficulty") || "all")
  const [assignedTasks, setAssignedTasks] = useState(defaultAssignedTasks)
  const [recentAttempts, setRecentAttempts] = useState(defaultRecentAttempts)
  const [continueExperimentsApi, setContinueExperimentsApi] = useState<
    Array<{ id: string; title: string; progress: number; lastAttempt: string }>
  >([])
  const [dashboardStats, setDashboardStats] = useState({
    timeSpentHours: 0,
    masteryScore: 0,
    hazardIncidents: 0,
    aiConversations: 0,
  })

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("smartlab_user") : null
      if (!raw) return
      const parsed = JSON.parse(raw) as { fullName?: string; email?: string; role?: string; classLevel?: string }
      if (parsed?.fullName) setUserName(parsed.fullName)
      if (parsed?.email) setUserEmail(parsed.email || "")
      if (parsed?.role) setUserRole(parsed.role)
      if (parsed?.classLevel) {
        const cl = String(parsed.classLevel)
        setUserClassLevel(cl)
        if (parsed.role === "student") {
          setSelectedClass(cl)
        }
      }
    } catch {
      /* ignore parse errors */
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (userEmail) params.set("email", userEmail)
    const url = `/api/dashboard/student${params.toString() ? `?${params.toString()}` : ""}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) return
        setDashboardStats({
          timeSpentHours: data.stats?.timeSpentHours ?? 0,
          masteryScore: data.stats?.masteryScore ?? 0,
          hazardIncidents: data.stats?.hazardIncidents ?? 0,
          aiConversations: data.stats?.aiConversations ?? 0,
        })
        if (Array.isArray(data.assignedTasks)) setAssignedTasks(data.assignedTasks)
        if (Array.isArray(data.recentAttempts)) setRecentAttempts(data.recentAttempts)
        if (Array.isArray(data.continueExperiments)) setContinueExperimentsApi(data.continueExperiments)
      })
      .catch(() => {
        // Keep fallback local data
      })
  }, [userEmail])

  useEffect(() => {
    const params = new URLSearchParams()
    params.set("tab", activeTab)
    if (searchQuery) params.set("q", searchQuery)
    if (selectedSubject !== "all") params.set("subject", selectedSubject)
    if (selectedClass !== "all") params.set("class", selectedClass)
    if (selectedDifficulty !== "all") params.set("difficulty", selectedDifficulty)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [activeTab, searchQuery, selectedSubject, selectedClass, selectedDifficulty, pathname, router])

  const derivedDifficulty = (hazard: string) =>
    hazard === "low" ? "Easy" : hazard === "medium" ? "Medium" : "Hard"

  const imageFor = (simType: string, subject: string) => {
    // Physics buckets
    const physicsMap: Record<string, string> = {
      circuit: "/electrical-circuit-breadboard-physics-experiment.jpg",
      ohm: "/circuit-board-oscilloscope-physics-lab.jpg",
      potentiometer: "/physics-laboratory-oscilloscope-circuit-board-dark.jpg",
      vi: "/circuit-board-oscilloscope-physics-lab.jpg",
      bridge: "/physics-laboratory-oscilloscope-circuit-board-dark.jpg",
      pendulum: "/pendulum-motion-physics-experiment-dark.jpg",
      spring: "/3d-physics-simulation-laboratory-equipment-dark-th.jpg",
      friction: "/3d-physics-simulation-laboratory-equipment-dark-th.jpg",
      incline: "/3d-physics-simulation-laboratory-equipment-dark-th.jpg",
      optics: "/optical-lens-light-rays-physics-experiment.jpg",
      prism: "/optical-lens-light-rays-physics-experiment.jpg",
      lens: "/optical-lens-light-rays-physics-experiment.jpg",
      thermistor: "/physics-laboratory-oscilloscope-circuit-board-dark.jpg",
      sonometer: "/3d-physics-simulation-laboratory-equipment-dark-th.jpg",
      resonance: "/3d-physics-simulation-laboratory-equipment-dark-th.jpg",
      default: "/virtual-science-laboratory-with-chemistry-beakers-.jpg",
    }
    // Chemistry buckets
    const chemistryMap: Record<string, string> = {
      titration: "/chemistry-titration-burette-colorful-solution.jpg",
      redox: "/chemistry-titration-beakers-colorful-liquids.jpg",
      flame: "/chemistry-test-tubes-flame-test-colorful.jpg",
      distillation: "/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg",
      sublimation: "/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg",
      melting: "/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg",
      boiling: "/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg",
      chromatography: "/chemistry-test-tubes-flame-test-colorful.jpg",
      tlc: "/chemistry-test-tubes-flame-test-colorful.jpg",
      crystallization: "/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg",
      conductivity: "/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg",
      qualitative: "/chemistry-test-tubes-flame-test-colorful.jpg",
      mixture: "/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg",
      solution: "/chemistry-titration-beakers-colorful-liquids.jpg",
      default: "/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg",
    }

    const normalized = simType.toLowerCase()
    if (subject === "Physics") {
      const entry = Object.entries(physicsMap).find(([key]) => normalized.includes(key) && key !== "default")
      return entry ? entry[1] : physicsMap.default
    } else {
      const entry = Object.entries(chemistryMap).find(([key]) => normalized.includes(key) && key !== "default")
      return entry ? entry[1] : chemistryMap.default
    }
  }

  const catalog = practicals.map((p) => ({
    id: p.id,
    title: p.title,
    subject: p.subject,
    class: p.classLevel,
    difficulty: derivedDifficulty(p.hazard),
    tags: p.tags,
    duration: p.duration,
    image: imageFor(p.simType, p.subject),
  }))

  const filteredExperiments = catalog.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = selectedSubject === "all" || exp.subject === selectedSubject
    const effectiveClass = userRole === "student" && userClassLevel ? userClassLevel : selectedClass
    const matchesClass = effectiveClass === "all" || exp.class === effectiveClass
    const matchesDifficulty = selectedDifficulty === "all" || exp.difficulty === selectedDifficulty
    return matchesSearch && matchesSubject && matchesClass && matchesDifficulty
  })

  const continueExperiments =
    continueExperimentsApi.length > 0
      ? continueExperimentsApi.map((exp) => {
          const matched = catalog.find((c) => c.id === exp.id)
          return {
            ...exp,
            id: exp.id,
            subject: matched?.subject || "Physics",
            image: matched?.image || "/virtual-science-laboratory-with-chemistry-beakers-.jpg",
          }
        })
      : catalog.slice(0, 2).map((exp) => ({
          ...exp,
          progress: 40,
          lastAttempt: "Just now",
        }))

  const returnTo = useMemo(() => {
    const params = new URLSearchParams()
    params.set("tab", activeTab)
    if (searchQuery) params.set("q", searchQuery)
    if (selectedSubject !== "all") params.set("subject", selectedSubject)
    if (selectedClass !== "all") params.set("class", selectedClass)
    if (selectedDifficulty !== "all") params.set("difficulty", selectedDifficulty)
    return `${pathname}?${params.toString()}`
  }, [activeTab, searchQuery, selectedSubject, selectedClass, selectedDifficulty, pathname])

  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Continue your learning journey in the virtual lab.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboardStats.timeSpentHours}h</p>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
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
                  <p className="text-2xl font-bold">{dashboardStats.masteryScore}%</p>
                  <p className="text-sm text-muted-foreground">Mastery Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <AlertTriangle className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboardStats.hazardIncidents}</p>
                  <p className="text-sm text-muted-foreground">Hazard Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <MessageSquare className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboardStats.aiConversations}</p>
                  <p className="text-sm text-muted-foreground">AI Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "catalog")} className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur border border-border/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="catalog">Experiment Catalog</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Continue Experiments */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Continue Experiment
                </h2>
                <Link href="/student/history" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {continueExperiments.map((exp, index) => (
                  <motion.div
                    key={`${exp.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden group hover:border-primary/50 transition-colors">
                      <div className="flex">
                        <div className="w-32 h-full relative overflow-hidden">
                          <img
                            src={exp.image || "/placeholder.svg"}
                            alt={exp.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <CardContent className="flex-1 p-4">
                          <Badge variant="outline" className="mb-2">
                            {exp.subject}
                          </Badge>
                          <h3 className="font-semibold mb-2">{exp.title}</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress</span>
                              <span>{exp.progress}%</span>
                            </div>
                            <Progress value={exp.progress} className="h-2" />
                            <p className="text-xs text-muted-foreground">Last attempt: {exp.lastAttempt}</p>
                          </div>
                          <Button size="sm" className="mt-3 w-full" asChild>
                            <Link href={`/student/lab/${exp.id}?returnTo=${encodeURIComponent(returnTo)}`}>
                              Continue
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assigned Tasks */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-secondary" />
                    Assigned Tasks
                  </h2>
                </div>
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-0">
                    {assignedTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className={`p-4 flex items-center justify-between ${
                          index !== assignedTasks.length - 1 ? "border-b border-border/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              task.priority === "high"
                                ? "bg-red-500"
                                : task.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          />
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {task.subject} • Due: {task.dueDate}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          Start
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>

              {/* Recent Attempts */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-accent" />
                    Recent Attempts
                  </h2>
                  <Link href="/student/history" className="text-sm text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <Card className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-0">
                    {recentAttempts.map((attempt, index) => (
                      <div
                        key={attempt.id}
                        className={`p-4 flex items-center justify-between ${
                          index !== recentAttempts.length - 1 ? "border-b border-border/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {attempt.status === "completed" ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium">{attempt.title}</p>
                            <p className="text-sm text-muted-foreground">{attempt.date}</p>
                          </div>
                        </div>
                        {attempt.score !== null ? (
                          <Badge variant={attempt.score >= 80 ? "default" : "secondary"}>{attempt.score}%</Badge>
                        ) : (
                          <Badge variant="outline">In Progress</Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* AI Tutor Conversations */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  AI Tutor Conversations
                </h2>
                <Link href="/student/ai-tutor" className="text-sm text-primary hover:underline">
                  Open Tutor
                </Link>
              </div>
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-1">Last conversation about Ohm's Law</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        "The relationship between current and voltage is directly proportional when resistance remains
                        constant..."
                      </p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/student/ai-tutor">Continue Conversation</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search experiments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/50 border-border/50"
                />
              </div>

              <div className="flex gap-2 flex-wrap" suppressHydrationWarning>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-card/50 border border-border/50 text-sm"
                  suppressHydrationWarning
                >
                  <option value="all">All Subjects</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                </select>

                {userRole === "student" && userClassLevel ? (
                  <div className="px-4 py-2 rounded-lg bg-card/50 border border-border/50 text-sm text-muted-foreground">
                    Class {userClassLevel}
                  </div>
                ) : (
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-card/50 border border-border/50 text-sm"
                    suppressHydrationWarning
                  >
                    <option value="all">All Classes</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                )}

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-card/50 border border-border/50 text-sm"
                  suppressHydrationWarning
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Experiment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiments.map((exp, index) => (
                <motion.div
                  key={`${exp.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden group hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={exp.image || "/placeholder.svg"}
                        alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <Badge variant={exp.subject === "Physics" ? "default" : "secondary"}>
                          {exp.subject === "Physics" ? (
                            <Atom className="w-3 h-3 mr-1" />
                          ) : (
                            <Beaker className="w-3 h-3 mr-1" />
                          )}
                          {exp.subject}
                        </Badge>
                        <Badge variant="outline">Class {exp.class}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{exp.title}</h3>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {exp.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {exp.duration}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            exp.difficulty === "Easy"
                              ? "text-green-500 border-green-500/50"
                              : exp.difficulty === "Medium"
                                ? "text-yellow-500 border-yellow-500/50"
                                : "text-red-500 border-red-500/50"
                          }
                        >
                          {exp.difficulty}
                        </Badge>
                      </div>
                      <Button className="w-full" asChild>
                        <Link href={`/student/lab/${exp.id}?returnTo=${encodeURIComponent(returnTo)}`}>
                          Launch Lab
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

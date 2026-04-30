"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Mail,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const defaultStudents = [
  {
    id: 1,
    name: "Ahmed Khan",
    email: "ahmed.k@school.edu.pk",
    class: "9-A",
    completed: 8,
    total: 10,
    avgScore: 85,
    trend: "up",
    lastActive: "2 hours ago",
    totalAttempts: 24,
  },
  {
    id: 2,
    name: "Sara Malik",
    email: "sara.m@school.edu.pk",
    class: "9-A",
    completed: 10,
    total: 10,
    avgScore: 92,
    trend: "up",
    lastActive: "1 hour ago",
    totalAttempts: 31,
  },
  {
    id: 3,
    name: "Hassan Ali",
    email: "hassan.a@school.edu.pk",
    class: "9-B",
    completed: 5,
    total: 10,
    avgScore: 68,
    trend: "down",
    lastActive: "3 days ago",
    totalAttempts: 12,
  },
  {
    id: 4,
    name: "Fatima Zahra",
    email: "fatima.z@school.edu.pk",
    class: "10-A",
    completed: 9,
    total: 10,
    avgScore: 88,
    trend: "up",
    lastActive: "30 min ago",
    totalAttempts: 28,
  },
  {
    id: 5,
    name: "Usman Tariq",
    email: "usman.t@school.edu.pk",
    class: "10-A",
    completed: 7,
    total: 10,
    avgScore: 75,
    trend: "stable",
    lastActive: "1 day ago",
    totalAttempts: 19,
  },
  {
    id: 6,
    name: "Ayesha Siddiqui",
    email: "ayesha.s@school.edu.pk",
    class: "9-B",
    completed: 10,
    total: 10,
    avgScore: 95,
    trend: "up",
    lastActive: "45 min ago",
    totalAttempts: 35,
  },
  {
    id: 7,
    name: "Bilal Ahmed",
    email: "bilal.a@school.edu.pk",
    class: "10-B",
    completed: 6,
    total: 10,
    avgScore: 72,
    trend: "down",
    lastActive: "2 days ago",
    totalAttempts: 15,
  },
  {
    id: 8,
    name: "Zainab Hussain",
    email: "zainab.h@school.edu.pk",
    class: "10-B",
    completed: 8,
    total: 10,
    avgScore: 81,
    trend: "up",
    lastActive: "4 hours ago",
    totalAttempts: 22,
  },
]

export default function StudentsPage() {
  const [allStudents, setAllStudents] = useState(defaultStudents)
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [sectionFilter, setSectionFilter] = useState("all")
  const [performanceFilter, setPerformanceFilter] = useState("all")

  const classOptions = Array.from(
    new Set(allStudents.map((s) => s.class).filter((c) => c && c !== "N/A")),
  ).sort((a, b) => a.localeCompare(b))

  useEffect(() => {
    fetch("/api/teacher/students/progress")
      .then((res) => res.json())
      .then((data) => {
        const rows = Array.isArray(data?.students) ? data.students : []
        if (!Array.isArray(rows) || rows.length === 0) return
        const mapped = rows.map((s: Record<string, unknown>, idx: number) => ({
          id: idx + 1,
          name: String(s.name || "Student"),
          email: String(s.email || ""),
          class: String(s.class || "N/A"),
          completed: Number((s.experiments as Record<string, unknown>)?.completed || 0),
          total: Number((s.experiments as Record<string, unknown>)?.total || 0),
          avgScore: Number((s.assignments as Record<string, unknown>)?.averageGrade || 0),
          trend: "stable",
          lastActive: String(s.lastActive || "N/A"),
          totalAttempts: Number((s.experiments as Record<string, unknown>)?.total || 0),
        }))
        setAllStudents(mapped)
      })
      .catch(() => {
        // keep fallback demo data
      })
  }, [])

  const filteredStudents = allStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase())
    const matchesClass = classFilter === "all" || student.class === classFilter
    const matchesSection = sectionFilter === "all" || student.class.endsWith(`-${sectionFilter}`)
    const matchesPerformance =
      performanceFilter === "all" ||
      (performanceFilter === "high" && student.avgScore >= 85) ||
      (performanceFilter === "medium" && student.avgScore >= 70 && student.avgScore < 85) ||
      (performanceFilter === "low" && student.avgScore < 70)
    return matchesSearch && matchesClass && matchesSection && matchesPerformance
  })

  const totalStudents = allStudents.length
  const topPerformers = allStudents.filter((s) => s.avgScore >= 85).length
  const atRisk = allStudents.filter((s) => s.avgScore < 70).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Students</h1>
          <p className="text-muted-foreground mt-1">View and manage all your students</p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teacher/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">{totalStudents}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold">{topPerformers}</p>
              <p className="text-sm text-muted-foreground">Top Performers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-3xl font-bold">{atRisk}</p>
              <p className="text-sm text-muted-foreground">Need Attention</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classOptions.map((c) => (
              <SelectItem key={c} value={c}>
                Class {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Section" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
          </SelectContent>
        </Select>

        <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <SelectValue placeholder="Performance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Performance</SelectItem>
            <SelectItem value="high">High (85%+)</SelectItem>
            <SelectItem value="medium">Medium (70-84%)</SelectItem>
            <SelectItem value="low">Low (&lt;70%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5 hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  <Badge variant="outline" className="mt-1">
                    Class {student.class}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
                <div className="flex items-center gap-1">
                  <p
                    className={`text-xl font-bold ${
                      student.avgScore >= 85
                        ? "text-green-400"
                        : student.avgScore >= 70
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {student.avgScore}%
                  </p>
                  {student.trend === "up" && <TrendingUp className="w-4 h-4 text-green-400" />}
                  {student.trend === "down" && <TrendingDown className="w-4 h-4 text-red-400" />}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">
                  {student.completed}/{student.total}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Attempts</p>
                <p className="text-xl font-bold">{student.totalAttempts}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="text-xs">{Math.round((student.completed / student.total) * 100)}%</p>
              </div>
              <Progress value={(student.completed / student.total) * 100} className="h-1.5" />
            </div>

            <p className="text-xs text-muted-foreground mt-3">Last active: {student.lastActive}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

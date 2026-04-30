"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, Users, BookOpen, TrendingUp, AlertTriangle, ChevronRight, Filter, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const defaultClasses = [
  {
    id: "9a",
    name: "Class 9-A",
    subject: "Physics",
    students: 32,
    completionRate: 78,
    avgScore: 82,
    pendingReviews: 5,
    activeExperiments: 3,
    recentActivity: "2 hours ago",
  },
  {
    id: "9b",
    name: "Class 9-B",
    subject: "Physics",
    students: 28,
    completionRate: 65,
    avgScore: 74,
    pendingReviews: 8,
    activeExperiments: 2,
    recentActivity: "1 hour ago",
  },
  {
    id: "10a",
    name: "Class 10-A",
    subject: "Physics",
    students: 30,
    completionRate: 85,
    avgScore: 88,
    pendingReviews: 2,
    activeExperiments: 4,
    recentActivity: "30 min ago",
  },
  {
    id: "10b",
    name: "Class 10-B",
    subject: "Physics",
    students: 35,
    completionRate: 72,
    avgScore: 79,
    pendingReviews: 12,
    activeExperiments: 3,
    recentActivity: "4 hours ago",
  },
]

export default function ClassesPage() {
  const [classes, setClasses] = useState(defaultClasses)
  const [search, setSearch] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [sectionFilter, setSectionFilter] = useState("all")

  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data?.classes)) return
        const mapped = data.classes.map((c: Record<string, unknown>, idx: number) => {
          const classLevel = String(c.classLevel || "")
          const section = String(c.section || "")
          const name = classLevel && section ? `${classLevel}-${section}` : classLevel || "Unassigned"
          return {
            id: String(c.id || idx),
            name,
            subject: "Physics",
            students: Number(c.students || 0),
            completionRate: Number(c.completionRate || 0),
            avgScore: Number(c.avgScore || 0),
            pendingReviews: 0,
            activeExperiments: 0,
            recentActivity: "Recently",
          }
        })
        setClasses(mapped)
      })
      .catch(() => {
        // keep fallback demo data
      })
  }, [])

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(search.toLowerCase())
    const matchesGrade = gradeFilter === "all" || cls.name.includes(gradeFilter)
    const matchesSection = sectionFilter === "all" || cls.name.endsWith(`-${sectionFilter}`)
    return matchesSearch && matchesGrade && matchesSection
  })

  const totalStudents = classes.reduce((sum, cls) => sum + cls.students, 0)
  const totalPending = classes.reduce((sum, cls) => sum + cls.pendingReviews, 0)
  const avgCompletion = Math.round(classes.reduce((sum, cls) => sum + cls.completionRate, 0) / classes.length)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-muted-foreground mt-1">Monitor student progress across your classes</p>
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
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-3xl font-bold">{avgCompletion}%</p>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-3xl font-bold">{totalPending}</p>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="9">Class 9</SelectItem>
            <SelectItem value="10">Class 10</SelectItem>
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
      </div>

      <div className="grid gap-4">
        {filteredClasses.map((cls, index) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/teacher/classes/${cls.id}`}
              className="group block rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{cls.name}</h3>
                    <p className="text-muted-foreground">{cls.subject}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Students</p>
                  <p className="text-2xl font-bold">{cls.students}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
                  <p className="text-2xl font-bold text-green-400">{cls.avgScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Labs</p>
                  <p className="text-2xl font-bold">{cls.activeExperiments}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">To Review</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{cls.pendingReviews}</p>
                    {cls.pendingReviews > 5 && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Urgent</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-sm font-medium">{cls.completionRate}%</p>
                </div>
                <Progress value={cls.completionRate} className="h-2" />
              </div>

              <p className="text-xs text-muted-foreground mt-4">Last activity: {cls.recentActivity}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

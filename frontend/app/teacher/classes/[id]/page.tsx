"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

type StudentRow = {
  id: string
  name: string
  email: string
  experiments: { total: number; completed: number; completionRate: number }
  avgScore: number
  hazards: number
  lastActive: string | null
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [classLabel, setClassLabel] = useState("Class")
  const [classStats, setClassStats] = useState<{ students: number; completionRate: number; avgScore: number; hazards: number }>(
    { students: 0, completionRate: 0, avgScore: 0, hazards: 0 },
  )
  const [students, setStudents] = useState<StudentRow[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/teacher/classes/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (!data?.class) return
        setClassLabel(String(data.class.label || "Class"))
        setClassStats({
          students: Number(data.class?.stats?.students || 0),
          completionRate: Number(data.class?.stats?.completionRate || 0),
          avgScore: Number(data.class?.stats?.avgScore || 0),
          hazards: Number(data.class?.stats?.hazards || 0),
        })
        setStudents(Array.isArray(data?.students) ? data.students : [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [params.id])

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && student.hazards > 0) ||
        (statusFilter === "completed" && student.experiments.total > 0 && student.experiments.completed === student.experiments.total) ||
        (statusFilter === "at-risk" && student.avgScore < 70)
      return matchesSearch && matchesStatus
    })
  }, [students, search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teacher/classes">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{classLabel}</h1>
          <p className="text-muted-foreground">{loading ? "Loading..." : `${classStats.students} Students`}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Completion</span>
          </div>
          <p className="text-2xl font-bold">{classStats.completionRate}%</p>
          <Progress value={classStats.completionRate} className="h-1.5 mt-2" />
        </div>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Avg Score</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{classStats.avgScore}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Pending</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{classStats.hazards}</p>
        </div>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">At Risk</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{filteredStudents.filter((s) => s.avgScore < 70).length}</p>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="pending">Hazards</SelectItem>
            <SelectItem value="completed">Completed All</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground">Student</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Progress</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Avg Score</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Last Active</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Progress value={student.experiments.completionRate} className="w-20 h-2" />
                      <span className="text-sm">
                        {student.experiments.completed}/{student.experiments.total}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="font-medium">{student.avgScore}%</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell text-muted-foreground">{student.lastActive || "N/A"}</td>
                  <td className="p-4">
                    {student.hazards > 0 ? (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Hazards</Badge>
                    ) : student.experiments.total > 0 && student.experiments.completed === student.experiments.total ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>
                    ) : student.avgScore < 70 ? (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">At Risk</Badge>
                    ) : (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Active</Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Clock className="w-4 h-4 mr-2" />
                          Review Attempts
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

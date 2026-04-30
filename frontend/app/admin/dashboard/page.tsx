"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users,
  Beaker,
  Building2,
  TrendingUp,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AdminSidebar } from "@/components/admin/sidebar"

const defaultExperiments = [
  { id: 1, name: "Ohm's Law Verification", subject: "Physics", class: "10", status: "active", attempts: 245 },
  { id: 2, name: "Acid-Base Titration", subject: "Chemistry", class: "11", status: "active", attempts: 189 },
  { id: 3, name: "Simple Pendulum", subject: "Physics", class: "9", status: "active", attempts: 312 },
  { id: 4, name: "Salt Analysis", subject: "Chemistry", class: "10", status: "draft", attempts: 0 },
  { id: 5, name: "Lens Experiment", subject: "Physics", class: "10", status: "active", attempts: 156 },
  { id: 6, name: "Electrolysis", subject: "Chemistry", class: "9", status: "disabled", attempts: 89 },
]

const defaultSchools = [
  { id: 1, name: "FG Model School Islamabad", students: 120, teachers: 8, status: "active" },
  { id: 2, name: "Beacon House School", students: 95, teachers: 6, status: "active" },
  { id: 3, name: "The City School", students: 78, teachers: 5, status: "active" },
  { id: 4, name: "Roots School System", students: 45, teachers: 3, status: "pending" },
]

const defaultRecentUsers = [
  { id: 1, name: "Ahmad Khan", email: "ahmad@school.pk", role: "student", school: "FG Model School", status: "active" },
  {
    id: 2,
    name: "Dr. Ayesha Malik",
    email: "ayesha@school.pk",
    role: "teacher",
    school: "FG Model School",
    status: "active",
  },
  { id: 3, name: "Sara Ahmed", email: "sara@school.pk", role: "student", school: "Beacon House", status: "active" },
  {
    id: 4,
    name: "Mr. Hassan Ali",
    email: "hassan@school.pk",
    role: "teacher",
    school: "City School",
    status: "pending",
  },
]

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [experiments, setExperiments] = useState(defaultExperiments)
  const [schools, setSchools] = useState(defaultSchools)
  const [recentUsers, setRecentUsers] = useState(defaultRecentUsers)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeExperiments: 0,
    totalAttempts: 0,
  })

  useEffect(() => {
    fetch("/api/dashboard/admin")
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) return
        if (Array.isArray(data.experiments)) setExperiments(data.experiments)
        if (Array.isArray(data.schools)) setSchools(data.schools)
        if (Array.isArray(data.recentUsers)) setRecentUsers(data.recentUsers)
        if (data.stats) setStats(data.stats)
      })
      .catch(() => {
        // keep fallback demo data
      })
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Console</h1>
            <p className="text-muted-foreground">Manage experiments, users, and system settings.</p>
          </div>
          <Button asChild>
            <Link href="/admin/experiments/new">
              <Plus className="w-4 h-4 mr-2" />
              New Experiment
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
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                  <p className="text-sm text-muted-foreground">Total Teachers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Beaker className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeExperiments}</p>
                  <p className="text-sm text-muted-foreground">Active Experiments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="experiments" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur border border-border/50">
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="experiments" className="space-y-4">
            {/* Search */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search experiments..."
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

            {/* Experiments Table */}
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-0">
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Subject</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Class</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Attempts</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {experiments.map((exp) => (
                        <tr key={exp.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                          <td className="p-4 font-medium">{exp.name}</td>
                          <td className="p-4">
                            <Badge variant="outline">{exp.subject}</Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">Class {exp.class}</td>
                          <td className="p-4">
                            <Badge
                              variant={
                                exp.status === "active" ? "default" : exp.status === "draft" ? "secondary" : "outline"
                              }
                            >
                              {exp.status === "active" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {exp.status === "disabled" && <XCircle className="w-3 h-3 mr-1" />}
                              {exp.status === "draft" && <Clock className="w-3 h-3 mr-1" />}
                              {exp.status}
                            </Badge>
                          </td>
                          <td className="p-4">{exp.attempts}</td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schools" className="space-y-4">
            <div className="flex justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search schools..." className="pl-10 bg-card/50 border-border/50" />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add School
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schools.map((school, index) => (
                <motion.div
                  key={school.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{school.name}</h3>
                            <Badge variant={school.status === "active" ? "default" : "secondary"} className="mt-1">
                              {school.status}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-background/50 text-center">
                          <p className="text-2xl font-bold">{school.students}</p>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                        <div className="p-3 rounded-lg bg-background/50 text-center">
                          <p className="text-2xl font-bold">{school.teachers}</p>
                          <p className="text-xs text-muted-foreground">Teachers</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10 bg-card/50 border-border/50" />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </div>

            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-0">
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">School</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/50">
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4 text-muted-foreground">{user.email}</td>
                          <td className="p-4">
                            <Badge
                              variant={
                                user.role === "student" ? "outline" : user.role === "teacher" ? "secondary" : "default"
                              }
                            >
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">{user.school}</td>
                          <td className="p-4">
                            <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                          </td>
                          <td className="p-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500">Deactivate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

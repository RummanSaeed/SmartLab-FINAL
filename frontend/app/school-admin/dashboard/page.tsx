"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, BookOpen, UserCog, Clock, CheckCircle2, AlertCircle } from "lucide-react"

type Stats = {
  totalTeachers: number
  totalStudents: number
  activeClasses: number
  adminStaff: number
}

type Activity = {
  id: string
  title: string
  description: string
  time: string
  status: "completed" | "update" | "alert"
}

const fallbackStats: Stats = {
  totalTeachers: 0,
  totalStudents: 0,
  activeClasses: 0,
  adminStaff: 0,
}

export default function SchoolAdminDashboard() {
  const [stats, setStats] = useState<Stats>(fallbackStats)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])

  useEffect(() => {
    fetch("/api/dashboard/school-admin")
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) return
        if (data.stats) setStats(data.stats)
        if (Array.isArray(data.recentActivities)) setRecentActivities(data.recentActivities)
      })
      .catch(() => {
        // keep fallback state
      })
  }, [])

  const statCards = [
    {
      title: "Total Teachers",
      value: String(stats.totalTeachers),
      icon: Users,
      description: "Active teachers in your school",
    },
    {
      title: "Total Students",
      value: String(stats.totalStudents),
      icon: GraduationCap,
      description: "Active students in your school",
    },
    {
      title: "Active Classes",
      value: String(stats.activeClasses),
      icon: BookOpen,
      description: "Class sections currently in use",
    },
    {
      title: "Admin Staff",
      value: String(stats.adminStaff),
      icon: UserCog,
      description: "School admin accounts",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Live school data for teachers, students, classes, and activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivities.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity yet.</p>
              )}
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                  <div className="ml-auto">
                    {activity.status === "completed" && (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-primary text-primary-foreground">
                        Completed
                      </span>
                    )}
                    {activity.status === "update" && (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-blue-100 text-blue-700">
                        Update
                      </span>
                    )}
                    {activity.status === "alert" && (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-yellow-100 text-yellow-700">
                        Alert
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Teachers</span>
              </div>
              <span className="text-sm font-medium">{stats.totalTeachers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Students</span>
              </div>
              <span className="text-sm font-medium">{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Active Classes</span>
              </div>
              <span className="text-sm font-medium">{stats.activeClasses}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


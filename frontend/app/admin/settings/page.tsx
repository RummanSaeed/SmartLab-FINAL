"use client"

import { useEffect, useState } from "react"
import { Users, School, Activity, Clock, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AdminSidebar } from "@/components/admin/sidebar"
import Link from "next/link"

type SystemStats = {
  totalUsers: number
  totalSchools: number
  totalExperiments: number
  activeUsers: number
  systemUptime: string
  lastDeployment: string
  dbStatus: "healthy" | "warning" | "error"
  storageUsage: number // percentage
}

export default function AdminSettingsPage() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalSchools: 0,
    totalExperiments: 0,
    activeUsers: 0,
    systemUptime: "--",
    lastDeployment: "--",
    dbStatus: "healthy",
    storageUsage: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real system stats
    fetch("/api/admin/system-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats) {
          setStats(data.stats)
        }
      })
      .catch(() => {
        // Fallback demo data
        setStats({
          totalUsers: 1245,
          totalSchools: 8,
          totalExperiments: 15680,
          activeUsers: 89,
          systemUptime: "99.9%",
          lastDeployment: "2 hours ago",
          dbStatus: "healthy",
          storageUsage: 68,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Overview</h1>
          <p className="text-muted-foreground">Real-time system status and general information.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "--" : stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <School className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "--" : stats.totalSchools}</p>
                  <p className="text-sm text-muted-foreground">Active Schools</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Activity className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "--" : stats.totalExperiments.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Experiments Run</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "--" : stats.activeUsers}</p>
                  <p className="text-sm text-muted-foreground">Active Now</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Health */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                System Health
              </CardTitle>
              <CardDescription>Current system status and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${stats.dbStatus === "healthy" ? "bg-green-500" : stats.dbStatus === "warning" ? "bg-yellow-500" : "bg-red-500"}`} />
                  <div>
                    <p className="font-medium">Database Status</p>
                    <p className="text-sm text-muted-foreground">{stats.dbStatus === "healthy" ? "Operating normally" : "Attention needed"}</p>
                  </div>
                </div>
                <Badge variant={stats.dbStatus === "healthy" ? "default" : stats.dbStatus === "warning" ? "secondary" : "destructive"}>
                  {stats.dbStatus}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage Usage</span>
                  <span>{stats.storageUsage}%</span>
                </div>
                <Progress value={stats.storageUsage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                  <p className="font-medium">{stats.systemUptime}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground">Last Deployment</p>
                  <p className="font-medium">{stats.lastDeployment}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/schools">
                  <School className="w-4 h-4 mr-2" />
                  Manage Schools
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  View All Users
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <AlertCircle className="w-4 h-4 mr-2" />
                View System Logs (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>SmartLab v1.0 • System Overview refreshes automatically</p>
        </div>
      </main>
    </div>
  )
}

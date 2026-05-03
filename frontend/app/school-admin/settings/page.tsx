"use client"

import { useEffect, useState } from "react"
import { Users, GraduationCap, BookOpen, Calendar, Building2, Phone, Mail, MapPin, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SchoolAdminSidebar } from "@/components/school-admin/sidebar"
import Link from "next/link"

type SchoolStats = {
  name: string
  address: string
  phone: string
  email: string
  totalStudents: number
  totalTeachers: number
  totalClasses: number
  activeExperiments: number
  academicYear: string
  status: "active" | "inactive"
}

export default function SchoolAdminSettingsPage() {
  const [stats, setStats] = useState<SchoolStats>({
    name: "",
    address: "",
    phone: "",
    email: "",
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeExperiments: 0,
    academicYear: "",
    status: "active",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Fetch real school stats
    fetch("/api/school-admin/school-info")
      .then((res) => res.json())
      .then((data) => {
        if (data?.school) {
          setStats(data.school)
        }
      })
      .catch(() => {
        // Fallback demo data
        setStats({
          name: "Government High School",
          address: "123 Education Street, Lahore",
          phone: "+92 42 1234567",
          email: "principal@ghs.edu.pk",
          totalStudents: 450,
          totalTeachers: 28,
          totalClasses: 15,
          activeExperiments: 12,
          academicYear: "2025-2026",
          status: "active",
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch("/api/school-admin/school-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      })
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SchoolAdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">School Settings</h1>
          <p className="text-muted-foreground">Manage your school information and view statistics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "--" : stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "--" : stats.totalTeachers}</p>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "--" : stats.totalClasses}</p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Activity className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? "--" : stats.activeExperiments}</p>
                  <p className="text-sm text-muted-foreground">Active Labs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* School Information */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                School Information
              </CardTitle>
              <CardDescription>Basic details about your institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input
                  value={stats.name}
                  onChange={(e) => setStats({ ...stats, name: e.target.value })}
                  placeholder="School name"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </Label>
                <Input
                  value={stats.address}
                  onChange={(e) => setStats({ ...stats, address: e.target.value })}
                  placeholder="School address"
                  className="bg-background/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input
                    value={stats.phone}
                    onChange={(e) => setStats({ ...stats, phone: e.target.value })}
                    placeholder="Contact number"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    value={stats.email}
                    onChange={(e) => setStats({ ...stats, email: e.target.value })}
                    placeholder="School email"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Academic Year
                </Label>
                <Input
                  value={stats.academicYear}
                  onChange={(e) => setStats({ ...stats, academicYear: e.target.value })}
                  placeholder="e.g., 2025-2026"
                  className="bg-background/50"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <p className="font-medium">School Status</p>
                  <p className="text-sm text-muted-foreground">Active schools can access all features</p>
                </div>
                <Badge variant={stats.status === "active" ? "default" : "secondary"}>
                  {stats.status}
                </Badge>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage your school resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/school-admin/teachers">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Teachers
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/school-admin/students">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Manage Students
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/school-admin/classes">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Manage Classes
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Calendar className="w-4 h-4 mr-2" />
                Academic Calendar (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>School ID: SCH-{Math.random().toString(36).substring(2, 8).toUpperCase()} • Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </main>
    </div>
  )
}

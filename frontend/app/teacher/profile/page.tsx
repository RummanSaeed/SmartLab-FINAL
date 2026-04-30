"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  School,
  BookOpen,
  Award,
  Calendar,
  Edit,
  Camera,
  Shield,
  Bell,
  Moon,
  Sun,
  Users,
  BarChart3,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TeacherProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    school: "",
    subject: "",
    employeeId: "",
    joinDate: "",
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("smartlab_user")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProfile({
          name: parsed.fullName || parsed.name || "",
          email: parsed.email || "",
          school: parsed.school || "Your School",
          subject: parsed.subject || parsed.class || "Physics",
          employeeId: parsed.employeeId || "TCH-2024-001",
          joinDate: parsed.createdAt
            ? new Date(parsed.createdAt).toLocaleString("en-US", { month: "long", year: "numeric" })
            : "January 2025",
        })
      } catch (e) {
        console.error("Failed to parse user", e)
      }
    }
  }, [])

  const initials = useMemo(() => {
    if (!profile.name) return "T"
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [profile.name])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/teacher/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-500/20 via-primary/20 to-purple-500/20" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarFallback className="bg-purple-500 text-white text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 w-8 h-8 rounded-full">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.name || "Teacher"}</h1>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Teacher</Badge>
              </div>
              <p className="text-muted-foreground">{profile.email || "teacher@school.edu.pk"}</p>
            </div>
            <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-2xl font-bold">125</p>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-2xl font-bold">4</p>
              <p className="text-sm text-muted-foreground">Classes</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-2xl font-bold">342</p>
              <p className="text-sm text-muted-foreground">Reviews</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school" className="flex items-center gap-2">
                  <School className="w-4 h-4" />
                  School
                </Label>
                <Input
                  id="school"
                  value={profile.school}
                  onChange={(e) => setProfile((p) => ({ ...p, school: e.target.value }))}
                  disabled
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={profile.subject}
                  onChange={(e) => setProfile((p) => ({ ...p, subject: e.target.value }))}
                  disabled
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  value={profile.employeeId}
                  onChange={(e) => setProfile((p) => ({ ...p, employeeId: e.target.value }))}
                  disabled
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </Label>
                <Input
                  id="joinDate"
                  value={profile.joinDate}
                  onChange={(e) => setProfile((p) => ({ ...p, joinDate: e.target.value }))}
                  disabled
                  className="bg-background"
                />
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="stats">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold">Teaching Statistics</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Student Engagement</p>
                    <p className="text-sm text-muted-foreground">This semester</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Students</span>
                    <span className="font-medium">118/125</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Experiments/Student</span>
                    <span className="font-medium">8.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-medium text-green-400">78%</span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Performance Metrics</p>
                    <p className="text-sm text-muted-foreground">Class averages</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg Class Score</span>
                    <span className="font-medium text-green-400">82%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Top Performers</span>
                    <span className="font-medium">34 students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Need Attention</span>
                    <span className="font-medium text-orange-400">12 students</span>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-semibold pt-4">Achievements</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {["Mentor of the Month", "100 Reviews", "Top Rated"].map((badge) => (
                <div key={badge} className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="font-semibold">{badge}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="settings">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Use dark theme</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive review alerts</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>

            <h2 className="text-lg font-semibold pt-4">Security</h2>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { User, Mail, School, BookOpen, Award, Calendar, Edit, Camera, Shield, Bell, Moon, Sun, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ProfileState = {
  name: string
  email: string
  school: string
  classLabel: string
  rollNo: string
  joinDate: string
  totalExperiments: number
  avgScore: number
  badges: string[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileState>({
    name: "Ahmed Khan",
    email: "ahmed.khan@school.edu.pk",
    school: "Islamabad Model School",
    classLabel: "Class 10-A",
    rollNo: "",
    joinDate: "January 2024",
    totalExperiments: 24,
    avgScore: 85,
    badges: ["Quick Learner", "Safety First", "Top Scorer"],
  })
  const [isEditing, setIsEditing] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("smartlab_user") : null
      if (raw) {
        const parsed = JSON.parse(raw) as {
          fullName?: string
          email?: string
          school?: string
          class?: string
          createdAt?: string
        }
        setProfile((prev) => ({
          ...prev,
          name: parsed.fullName || prev.name,
          email: parsed.email || prev.email,
          school: parsed.school || prev.school,
          classLabel: parsed.class ? `Class ${parsed.class}` : prev.classLabel,
          joinDate: parsed.createdAt ? new Date(parsed.createdAt).toLocaleDateString() : prev.joinDate,
        }))
      }
    } catch {
      /* ignore parse errors */
    }
  }, [])

  const avatarInitials = useMemo(() => {
    const parts = profile.name.split(" ").filter(Boolean)
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "AK"
  }, [profile.name])

  const handleSave = () => {
    // TODO: Persist to backend when available
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-background">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {avatarInitials}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 w-8 h-8 rounded-full">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
            <Button variant={isEditing ? "default" : "outline"} onClick={isEditing ? handleSave : () => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-2xl font-bold">{profile.totalExperiments}</p>
              <p className="text-sm text-muted-foreground">Experiments</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-2xl font-bold text-green-400">{profile.avgScore}%</p>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-4">
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm text-muted-foreground">Badges</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="info">Information</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
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
                  disabled={!isEditing}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Class
                </Label>
                <Input
                  id="class"
                  value={profile.classLabel}
                  onChange={(e) => setProfile((p) => ({ ...p, classLabel: e.target.value }))}
                  disabled={!isEditing}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNo" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Roll Number
                </Label>
                <Input
                  id="rollNo"
                  value={profile.rollNo}
                  onChange={(e) => setProfile((p) => ({ ...p, rollNo: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Add later"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </Label>
                <Input id="joinDate" value={profile.joinDate} disabled className="bg-background" />
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="achievements">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 space-y-6"
          >
            <h2 className="text-lg font-semibold">Your Badges</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {profile.badges.map((badge, index) => (
                <div key={badge} className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold">{badge}</p>
                  <p className="text-xs text-muted-foreground mt-1">Earned in January 2024</p>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-semibold pt-4">Progress Milestones</h2>
            <div className="space-y-4">
              {[
                { name: "Complete 10 experiments", progress: 80, target: 10, current: 8 },
                { name: "Achieve 90% average score", progress: 94, target: 90, current: 85 },
                { name: "Zero hazard incidents", progress: 100, target: 0, current: 0 },
              ].map((milestone) => (
                <div key={milestone.name} className="rounded-lg bg-muted/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{milestone.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        milestone.progress >= 100
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-primary/20 text-primary border-primary/30"
                      }
                    >
                      {milestone.progress >= 100 ? "Completed" : `${milestone.progress}%`}
                    </Badge>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(milestone.progress, 100)}%` }}
                    />
                  </div>
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
                    <p className="text-sm text-muted-foreground">Receive experiment reminders</p>
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

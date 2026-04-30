"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Shield,
  UserCheck,
  Users,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  KeyRound,
  Copy as CopyIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const fallbackUsers = [
  {
    id: 1,
    name: "Ahmed Khan",
    email: "ahmed.khan@school.edu.pk",
    role: "student",
    school: "Islamabad Model School",
    class: "Class 10",
    status: "active",
    lastActive: "2 hours ago",
    experiments: 24,
  },
  {
    id: 2,
    name: "Dr. Fatima Ali",
    email: "fatima.ali@school.edu.pk",
    role: "teacher",
    school: "Islamabad Model School",
    class: "Physics",
    status: "active",
    lastActive: "30 min ago",
    experiments: 156,
  },
  {
    id: 3,
    name: "Sara Malik",
    email: "sara.malik@school.edu.pk",
    role: "student",
    school: "Lahore Grammar School",
    class: "Class 9",
    status: "active",
    lastActive: "1 day ago",
    experiments: 18,
  },
  {
    id: 4,
    name: "Prof. Hassan Raza",
    email: "hassan.raza@admin.edu.pk",
    role: "admin",
    school: "FBISE",
    class: "—",
    status: "active",
    lastActive: "5 min ago",
    experiments: 0,
  },
  {
    id: 5,
    name: "Zainab Hussain",
    email: "zainab.h@school.edu.pk",
    role: "student",
    school: "Karachi Public School",
    class: "Class 10",
    status: "inactive",
    lastActive: "2 weeks ago",
    experiments: 8,
  },
  {
    id: 6,
    name: "Mr. Usman Tariq",
    email: "usman.tariq@school.edu.pk",
    role: "teacher",
    school: "Peshawar Model College",
    class: "Chemistry",
    status: "active",
    lastActive: "3 hours ago",
    experiments: 89,
  },
]

const roleIcons = {
  student: GraduationCap,
  teacher: BookOpen,
  admin: Shield,
  school_admin: Shield,
}

const roleColors = {
  student: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  teacher: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  admin: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  school_admin: "bg-orange-500/20 text-orange-400 border-orange-500/30",
}

export default function UsersPage() {
  const [users, setUsers] = useState(fallbackUsers)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [schools, setSchools] = useState<string[]>([])
  const [createError, setCreateError] = useState<string | null>(null)
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null)
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    role: "student",
    school: "",
    classLevel: "",
    section: "",
    teacherSubject: "",
    password: "",
  })

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return
        const mapped = data.map((u: Record<string, unknown>) => ({
          id: String(u.id),
          name: String(u.fullName || ""),
          email: String(u.email || ""),
          role: String(u.role || "student"),
          school: String(u.school || "Unassigned"),
          class: String(u.classLevel || "N/A"),
          status: "active",
          lastActive: u.createdAt ? new Date(String(u.createdAt)).toLocaleDateString() : "N/A",
          experiments: 0,
        }))
        setUsers(mapped)
      })
      .catch(() => {
        // keep fallback users
      })
  }, [])

  useEffect(() => {
    fetch("/api/admin/schools")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data?.schools)) return
        const list = data.schools.map((s: any) => String(s?.name || "")).filter(Boolean)
        if (list.length > 0) setSchools(list)
      })
      .catch(() => {
        // ignore
      })
  }, [])

  useEffect(() => {
    if (!isAddDialogOpen) return
    fetch("/api/admin/schools")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data?.schools)) return
        const list = data.schools.map((s: any) => String(s?.name || "")).filter(Boolean)
        if (list.length > 0) setSchools(list)
      })
      .catch(() => {
        // ignore
      })
  }, [isAddDialogOpen])

  useEffect(() => {
    if (schools.length > 0) return
    const unique = Array.from(
      new Set(users.map((u: any) => String(u.school || "").trim()).filter((s: string) => s.length > 0)),
    ).sort((a, b) => a.localeCompare(b))
    if (unique.length > 0) setSchools(unique)
  }, [users, schools.length])

  const handleCreateUser = async () => {
    setCreateError(null)
    setCreatedCreds(null)
    if (!newUser.fullName || !newUser.email) {
      setCreateError("Full name and email are required")
      return
    }
    if ((newUser.role === "student" || newUser.role === "teacher") && !newUser.school) {
      setCreateError("Please select a school")
      return
    }
    if ((newUser.role === "student" || newUser.role === "teacher") && !newUser.classLevel) {
      setCreateError("Please select a class")
      return
    }
    if ((newUser.role === "student" || newUser.role === "teacher") && !newUser.section) {
      setCreateError("Please enter a section")
      return
    }

    if (newUser.role === "teacher" && !newUser.teacherSubject) {
      setCreateError("Please select teacher subject")
      return
    }

    const payload: any = {
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      school: newUser.school,
      classLevel: newUser.classLevel,
      section: newUser.section,
    }
    if (newUser.role === "teacher") payload.teacherSubject = newUser.teacherSubject
    if (newUser.password) payload.password = newUser.password

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setCreateError(String(data?.error || "Failed to create user"))
      return
    }

    if (data?.credentials?.email && data?.credentials?.password) {
      setCreatedCreds({ email: String(data.credentials.email), password: String(data.credentials.password) })
    }

    const list = await fetch("/api/users").then((r) => r.json()).catch(() => null)
    if (Array.isArray(list)) {
      const mapped = list.map((u: Record<string, unknown>) => ({
        id: String(u.id),
        name: String(u.fullName || ""),
        email: String(u.email || ""),
        role: String(u.role || "student"),
        school: String(u.school || "Unassigned"),
        class: String(u.classLevel || "N/A"),
        status: "active",
        lastActive: u.createdAt ? new Date(String(u.createdAt)).toLocaleDateString() : "N/A",
        experiments: 0,
      }))
      setUsers(mapped)
    }

    setNewUser({ fullName: "", email: "", role: "student", school: "", classLevel: "", section: "", teacherSubject: "", password: "" })
  }

  const handleCopyCreds = async () => {
    if (!createdCreds) return
    try {
      await navigator.clipboard.writeText(`Email: ${createdCreds.email}\nPassword: ${createdCreds.password}`)
    } catch {
      // ignore
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    students: users.filter((u) => u.role === "student").length,
    teachers: users.filter((u) => u.role === "teacher").length,
    admins: users.filter((u) => u.role === "admin").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Users</h1>
          </div>
          <p className="text-muted-foreground mt-1">Manage students, teachers, and administrators</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border w-[92vw] sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account. They will receive an email invitation.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  className="bg-background"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser((p) => ({ ...p, fullName: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    placeholder="Auto-generate if empty"
                    className="bg-background"
                    value={newUser.password}
                    onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewUser((p) => ({ ...p, password: Math.random().toString(36).slice(2, 10) + "A1" }))}
                  >
                    <KeyRound className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@school.edu.pk"
                  className="bg-background"
                  value={newUser.email}
                  onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="school_admin">School Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newUser.role === "teacher" && (
                <div className="grid gap-2">
                  <Label htmlFor="teacherSubject">Teacher Subject</Label>
                  <Select
                    value={newUser.teacherSubject}
                    onValueChange={(v) => setNewUser((p) => ({ ...p, teacherSubject: v }))}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(newUser.role === "student" || newUser.role === "teacher") && (
                <div className="grid gap-2">
                  <Label htmlFor="classLevel">Class</Label>
                  <Select value={newUser.classLevel} onValueChange={(v) => setNewUser((p) => ({ ...p, classLevel: v }))}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">Class 9</SelectItem>
                      <SelectItem value="10">Class 10</SelectItem>
                      <SelectItem value="11">Class 11</SelectItem>
                      <SelectItem value="12">Class 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(newUser.role === "student" || newUser.role === "teacher") && (
                <div className="grid gap-2">
                  <Label htmlFor="section">Section</Label>
                  <Select value={newUser.section} onValueChange={(v) => setNewUser((p) => ({ ...p, section: v }))}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="school">School</Label>
                {newUser.role === "student" || newUser.role === "teacher" ? (
                  <Select value={newUser.school} onValueChange={(v) => setNewUser((p) => ({ ...p, school: v }))}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="school"
                    placeholder="School name"
                    className="bg-background"
                    value={newUser.school}
                    onChange={(e) => setNewUser((p) => ({ ...p, school: e.target.value }))}
                  />
                )}
              </div>

              {createError && <p className="text-sm text-red-400">{createError}</p>}

              {createdCreds && (
                <div className="rounded-lg border border-border/50 bg-background/40 p-3">
                  <p className="text-sm font-medium mb-2">Login Credentials</p>
                  <p className="text-sm text-muted-foreground">Email: <span className="text-foreground">{createdCreds.email}</span></p>
                  <p className="text-sm text-muted-foreground">Password: <span className="text-foreground">{createdCreds.password}</span></p>
                  <div className="mt-2">
                    <Button type="button" size="sm" variant="outline" onClick={handleCopyCreds}>
                      <CopyIcon className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.students}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.teachers}</p>
              <p className="text-xs text-muted-foreground">Teachers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">School</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Last Active</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Experiments</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => {
                const RoleIcon = roleIcons[user.role as keyof typeof roleIcons]
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm">{user.school}</p>
                      <p className="text-xs text-muted-foreground">{user.class}</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">{user.lastActive}</td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="font-medium">{user.experiments}</span>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={
                          user.status === "active"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }
                      >
                        {user.status}
                      </Badge>
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
                            <UserCheck className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

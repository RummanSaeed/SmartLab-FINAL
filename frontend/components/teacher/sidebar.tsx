"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import {
  FlaskConical,
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  MessageSquare,
  LogOut,
  ChevronLeft,
  User,
  GraduationCap,
  School,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationsBell } from "@/components/notifications-bell"
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher/dashboard" },
  { icon: Users, label: "My Classes", href: "/teacher/classes" },
  { icon: GraduationCap, label: "Students", href: "/teacher/students" },
  { icon: FileText, label: "Assignments", href: "/teacher/assignments" },
  { icon: School, label: "Notices", href: "/teacher/notices" },
  { icon: Shield, label: "Resources", href: "/teacher/resources" },
  { icon: BarChart3, label: "Reports", href: "/teacher/reports" },
  { icon: MessageSquare, label: "Chat", href: "/teacher/chat" },
  { icon: MessageSquare, label: "AI Tutor", href: "/teacher/ai-tutor" },
  { icon: User, label: "Profile", href: "/teacher/profile" },
]

export function TeacherSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [teacherName, setTeacherName] = useState("Dr. Ayesha Malik")
  const [teacherMeta, setTeacherMeta] = useState("Physics Teacher")

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("smartlab_user") : null
      if (raw) {
        const parsed = JSON.parse(raw) as { fullName?: string; role?: string; email?: string }
        if (parsed?.fullName) setTeacherName(parsed.fullName)
        if (parsed?.role) setTeacherMeta(`${parsed.role.charAt(0).toUpperCase()}${parsed.role.slice(1)}`)
      }
    } catch {
      /* ignore parse errors */
    }
  }, [])

  const teacherInitials = useMemo(() => {
    const parts = teacherName.split(" ").filter(Boolean)
    return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "T"
  }, [teacherName])

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // ignore network errors during logout cleanup
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("smartlab_token")
        localStorage.removeItem("smartlab_user")
        window.location.href = "/login/teacher"
      }
    }
  }

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen bg-card/50 backdrop-blur border-r border-border/50 flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <FlaskConical className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && <span className="text-xl font-bold">SmartLab</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/teacher/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="px-4 pb-2">
          <div className="flex justify-end pb-2">
            <NotificationsBell />
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-border/50">
        <Link
          href="/teacher/profile"
          className={cn(
            "flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity",
            collapsed && "justify-center",
          )}
        >
          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-secondary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{teacherName}</p>
              <p className="text-xs text-muted-foreground truncate">{teacherMeta}</p>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </aside>
  )
}

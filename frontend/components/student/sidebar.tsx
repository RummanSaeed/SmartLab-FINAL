"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FlaskConical,
  LayoutDashboard,
  Beaker,
  History,
  MessageSquare,
  LogOut,
  ChevronLeft,
  User,
  GraduationCap,
  School,
  Shield,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { NotificationsBell } from "@/components/notifications-bell"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/student/dashboard" },
  { icon: Beaker, label: "Lab Workspace", href: "/student/lab" },
  { icon: History, label: "My History", href: "/student/history" },
  { icon: MessageSquare, label: "AI Tutor", href: "/student/ai-tutor" },
  { icon: BarChart3, label: "Report", href: "/student/report" },
  { icon: MessageSquare, label: "Chat", href: "/student/chat" },
  { icon: User, label: "Profile", href: "/student/profile" },
  { icon: GraduationCap, label: "Assignments", href: "/student/assignments" },
  { icon: School, label: "Notices", href: "/student/notices" },
  { icon: Shield, label: "Resources", href: "/student/resources" },
]

export function StudentSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [userName, setUserName] = useState("Ahmad Khan")
  const [userMeta, setUserMeta] = useState("Class 10 - Physics")

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("smartlab_user") : null
      if (raw) {
        const parsed = JSON.parse(raw) as { fullName?: string; class?: string; school?: string }
        if (parsed?.fullName) setUserName(parsed.fullName)
        if (parsed?.class || parsed?.school) {
          const metaParts = []
          if (parsed.class) metaParts.push(`Class ${parsed.class}`)
          if (parsed.school) metaParts.push(parsed.school)
          if (metaParts.length) setUserMeta(metaParts.join(" - "))
        }
      }
    } catch {
      /* ignore parse errors */
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // ignore network errors during logout cleanup
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("smartlab_token")
        localStorage.removeItem("smartlab_user")
        window.location.href = "/login/student"
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
            pathname === item.href || (item.href !== "/student/dashboard" && pathname.startsWith(item.href))
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
          href="/student/profile"
          className={cn(
            "flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity",
            collapsed && "justify-center",
          )}
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userMeta}</p>
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

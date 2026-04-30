"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FlaskConical,
  LayoutDashboard,
  Beaker,
  Users,
  Building2,
  Settings,
  Shield,
  MessageSquare,
  Star,
  LogOut,
  ChevronLeft,
  User,
  GraduationCap,
  School,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Beaker, label: "Experiments", href: "/admin/experiments" },
  { icon: Star, label: "Feedback", href: "/admin/experiment-feedback" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Building2, label: "Schools", href: "/admin/schools" },
  { icon: MessageSquare, label: "AI Tutor", href: "/admin/ai-tutor" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
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

      {/* Admin Badge */}
      {!collapsed && (
        <div className="mx-4 mt-4 p-2 rounded-lg bg-accent/10 border border-accent/30 text-center">
          <div className="flex items-center justify-center gap-2 text-accent">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Admin Console</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                <Shield className="w-4 h-4 text-accent" />
                Switch Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Demo Roles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/student/dashboard" className="flex items-center gap-2 cursor-pointer">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Student
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/teacher/dashboard" className="flex items-center gap-2 cursor-pointer">
                  <School className="w-4 h-4 text-secondary" />
                  Teacher
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-border/50">
        <div className={cn("flex items-center gap-3 mb-4", collapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <User className="w-5 h-5 text-accent" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">System Admin</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          )}
        </div>
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

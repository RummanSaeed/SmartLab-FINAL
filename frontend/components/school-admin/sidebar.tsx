"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Settings,
  School as SchoolIcon,
  LogOut,
  ChevronLeft,
  UserCog,
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
  { icon: LayoutDashboard, label: "Dashboard", href: "/school-admin/dashboard" },
  { icon: Users, label: "Teachers", href: "/school-admin/teachers" },
  { icon: GraduationCap, label: "Students", href: "/school-admin/students" },
  { icon: BookOpen, label: "Classes", href: "/school-admin/classes" },
  { icon: SchoolIcon, label: "School", href: "/school-admin/school" },
  { icon: MessageSquare, label: "AI Tutor", href: "/school-admin/ai-tutor" },
  { icon: Settings, label: "Settings", href: "/school-admin/settings" },
]

export function SchoolAdminSidebar() {
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
        window.location.href = "/login/school-admin"
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
      <div className="flex items-center justify-between p-4 border-b border-border/50 h-16">
        {!collapsed && (
          <Link href="/school-admin/dashboard" className="flex items-center gap-2">
            <UserCog className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">School Admin</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed ? "rotate-180" : ""
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed ? "justify-center" : ""
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                collapsed ? "justify-center px-0" : ""
              )}
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">SA</span>
              </div>
              {!collapsed && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">School Admin</span>
                  <span className="text-xs text-muted-foreground">
                    View Profile
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/school-admin/profile" className="cursor-pointer">
                <UserCog className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

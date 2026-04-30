"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NotificationRow = {
  id: string
  type: string
  title: string
  body: string | null
  meta: any
  readAt: string | null
  createdAt: string
}

export function NotificationsBell({ pollMs = 8000 }: { pollMs?: number }) {
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<NotificationRow[]>([])
  const [open, setOpen] = useState(false)

  const loadUnread = async () => {
    try {
      const res = await fetch("/api/notifications/unread-count")
      const data = await res.json().catch(() => ({}))
      setUnread(Number(data?.unread || 0))
    } catch {
      // ignore
    }
  }

  const loadList = async () => {
    try {
      const res = await fetch("/api/notifications?unread=1&take=20")
      const data = await res.json().catch(() => ({}))
      const rows = Array.isArray(data?.notifications) ? data.notifications : []
      setItems(rows)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadUnread()
    const t = setInterval(loadUnread, pollMs)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!open) return
    loadList()
  }, [open])

  const markRead = async (ids: string[]) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
    } catch {
      // ignore
    } finally {
      await loadUnread()
      await loadList()
    }
  }

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })
    } catch {
      // ignore
    } finally {
      await loadUnread()
      await loadList()
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <Button variant="ghost" size="sm" className="h-8" onClick={markAllRead}>
            Mark all read
          </Button>
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem disabled className="text-muted-foreground">
            No unread notifications
          </DropdownMenuItem>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-1"
              onSelect={(e) => {
                e.preventDefault()
                markRead([n.id])
              }}
            >
              <span className="text-sm font-medium">{n.title}</span>
              {n.body && <span className="text-xs text-muted-foreground">{n.body}</span>}
              <span className="text-[11px] text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type User = { fullName?: string; email?: string; role?: string; school?: string | null }

export default function SchoolAdminProfilePage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("smartlab_user") : null
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Your account details</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>{user?.fullName || "School Admin"}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div>Email: {user?.email || "N/A"}</div>
          <div>Role: {user?.role || "school_admin"}</div>
          <div>School: {user?.school || "N/A"}</div>
        </CardContent>
      </Card>
    </div>
  )
}

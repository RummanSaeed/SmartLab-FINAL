"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SchoolAdminSchoolPage() {
  const [schoolName, setSchoolName] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch("/api/dashboard/school-admin")
      .then((r) => r.json())
      .then((d) => {
        if (d?.school) setSchoolName(String(d.school))
        if (d?.stats) setStats(d.stats)
      })
      .catch(() => {
        // ignore
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">School</h1>
        <p className="text-muted-foreground">School profile and summary</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>{schoolName || "Your School"}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div>Teachers: {stats?.totalTeachers ?? 0}</div>
          <div>Students: {stats?.totalStudents ?? 0}</div>
          <div>Classes: {stats?.activeClasses ?? 0}</div>
          <div>School Admin Staff: {stats?.adminStaff ?? 0}</div>
        </CardContent>
      </Card>
    </div>
  )
}

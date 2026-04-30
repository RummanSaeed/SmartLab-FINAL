"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SchoolAdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">School admin settings</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Settings UI can be extended (password reset policies, school configuration, etc.).
        </CardContent>
      </Card>
    </div>
  )
}

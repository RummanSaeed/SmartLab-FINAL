"use client"

import { useState } from "react"
import { Key, Shield, Database, Bell, Zap, RefreshCw, Download, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AdminSidebar } from "@/components/admin/sidebar"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    aiEnabled: true,
    hazardMode: true,
    maintenanceMode: false,
    emailNotifications: true,
    slackNotifications: false,
    autoBackup: true,
  })

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and feature flags.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Configuration */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                AI Configuration
              </CardTitle>
              <CardDescription>Configure AI tutor and intelligent features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <p className="font-medium">AI Tutor Global</p>
                  <p className="text-sm text-muted-foreground">Enable AI assistance across all experiments</p>
                </div>
                <Switch
                  checked={settings.aiEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, aiEnabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>OpenAI API Key</Label>
                <Input type="password" placeholder="sk-..." className="bg-background/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label>Model Selection</Label>
                <select className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border/50">
                  <option>gpt-4o</option>
                  <option>gpt-4o-mini</option>
                  <option>claude-sonnet-4-20250514</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Max Tokens per Response</Label>
                <Input type="number" placeholder="1000" className="bg-background/50 border-border/50" />
              </div>
            </CardContent>
          </Card>

          {/* Feature Flags */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                Feature Flags
              </CardTitle>
              <CardDescription>Toggle system features on/off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <p className="font-medium">Hazard Mode</p>
                  <p className="text-sm text-muted-foreground">Allow students to proceed with dangerous setups</p>
                </div>
                <Switch
                  checked={settings.hazardMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, hazardMode: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Disable access for all non-admin users</p>
                  </div>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-accent" />
                Notifications
              </CardTitle>
              <CardDescription>Configure alert and notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send alerts via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <p className="font-medium">Slack Notifications</p>
                  <p className="text-sm text-muted-foreground">Send alerts to Slack channel</p>
                </div>
                <Switch
                  checked={settings.slackNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, slackNotifications: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input type="email" placeholder="admin@smartlab.pk" className="bg-background/50 border-border/50" />
              </div>
            </CardContent>
          </Card>

          {/* Database & Backup */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-500" />
                Database & Backup
              </CardTitle>
              <CardDescription>Manage data and backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                <div>
                  <p className="font-medium">Auto Backup</p>
                  <p className="text-sm text-muted-foreground">Daily automatic backups at 2:00 AM</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                />
              </div>
              <div className="p-3 rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Last Backup</p>
                  <Badge variant="outline">2 hours ago</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Nov 24, 2025 at 02:00 AM</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Backup Now
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="bg-card/50 backdrop-blur border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                API Keys & Secrets
              </CardTitle>
              <CardDescription>Manage external service API keys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Simulation Engine API Key</Label>
                  <Input type="password" placeholder="sim-..." className="bg-background/50 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Analytics API Key</Label>
                  <Input type="password" placeholder="ana-..." className="bg-background/50 border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Storage Bucket URL</Label>
                  <Input
                    type="text"
                    placeholder="https://storage.example.com/bucket"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CDN Endpoint</Label>
                  <Input
                    type="text"
                    placeholder="https://cdn.example.com"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button size="lg">Save All Settings</Button>
        </div>
      </main>
    </div>
  )
}

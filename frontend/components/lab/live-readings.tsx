"use client"

import { useEffect, useState } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Activity, Zap, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LiveReadingsProps {
  voltage: number
  resistance: number
  isRunning: boolean
}

export function LiveReadings({ voltage, resistance, isRunning }: LiveReadingsProps) {
  const [data, setData] = useState<Array<{ time: number; current: number; power: number }>>([])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const current = voltage / resistance
      const power = (voltage * voltage) / resistance
      const newPoint = {
        time: data.length,
        current: Number(current.toFixed(3)),
        power: Number(power.toFixed(3)),
      }

      setData((prev) => [...prev.slice(-19), newPoint])
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning, voltage, resistance, data.length])

  const current = voltage / resistance
  const power = (voltage * voltage) / resistance

  return (
    <div className="space-y-4">
      {/* Current Reading */}
      <Card className="bg-background/50 border-border/50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Current (I)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-3xl font-bold">{current.toFixed(3)}</p>
          <p className="text-sm text-muted-foreground">Amperes</p>
        </CardContent>
      </Card>

      {/* Power Reading */}
      <Card className="bg-background/50 border-border/50">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-secondary" />
            Power (P)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-3xl font-bold">{power.toFixed(3)}</p>
          <p className="text-sm text-muted-foreground">Watts</p>
        </CardContent>
      </Card>

      {/* Graph */}
      {data.length > 0 && (
        <Card className="bg-background/50 border-border/50">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent" />
              Current vs Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={data}>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="current" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

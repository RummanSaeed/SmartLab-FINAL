"use client"

import { useEffect, useMemo, useState } from "react"
import { Battery, Zap, Activity, AlertTriangle } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Props = {
  voltage: number
  resistance: number
  onVoltageChange: (v: number) => void
  onResistanceChange: (v: number) => void
}

export function OhmsLawSim({ voltage, resistance, onVoltageChange, onResistanceChange }: Props) {
  const current = useMemo(() => (resistance > 0 ? voltage / resistance : 0), [voltage, resistance])
  const power = useMemo(() => voltage * current, [voltage, current])
  const hazard = voltage > 12 || resistance < 20

  const [flow, setFlow] = useState(0)
  useEffect(() => {
    setFlow(current * 100)
  }, [current])

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Battery className="w-5 h-5 text-primary" />
        <div className="text-sm">
          <div className="font-semibold">Ohm's Law Circuit</div>
          <div className="text-muted-foreground text-xs">V = I R | live current & power</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="gap-1">
          <Zap className="w-3 h-3" />
          {voltage.toFixed(1)} V
        </Badge>
        <Badge variant="outline">{resistance.toFixed(1)} Ω</Badge>
        <Badge variant="outline">{current.toFixed(3)} A</Badge>
        <Badge variant={hazard ? "destructive" : "secondary"}>{power.toFixed(2)} W</Badge>
      </div>

      <div className={cn("relative border rounded-lg p-6 bg-card/40", hazard && "ring-2 ring-red-500/50")}>
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Live circuit</span>
          <span className="text-muted-foreground">Current flow ∝ I</span>
        </div>
        <div className="h-24 relative overflow-hidden rounded-md bg-gradient-to-r from-background via-background to-background border border-border/50">
          <div
            className="absolute inset-y-0 left-0 bg-primary/20"
            style={{ width: `${Math.min(Math.abs(flow), 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {current.toFixed(3)} A flowing
          </div>
          {hazard && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 font-semibold">
              <AlertTriangle className="w-5 h-5 mr-1" />
              Overload risk
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Overvoltage/low resistance triggers virtual hazard (sparks/smoke). Keep voltage reasonable and resistance not
          too low.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Voltage (V)</span>
            <span>{voltage.toFixed(1)} V</span>
          </div>
          <Slider value={[voltage]} min={0} max={20} step={0.5} onValueChange={(v) => onVoltageChange(v[0])} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Resistance (Ω)</span>
            <span>{resistance.toFixed(1)} Ω</span>
          </div>
          <Slider value={[resistance]} min={10} max={500} step={10} onValueChange={(v) => onResistanceChange(v[0])} />
        </div>
      </div>
    </div>
  )
}

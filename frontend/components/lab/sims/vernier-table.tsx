"use client"

import { useState } from "react"
import { Ruler, Cylinder } from "lucide-react"

type Item = {
  id: string
  type: "vernier" | "cylinder"
  x: number
  y: number
}

const IconMap = {
  vernier: Ruler,
  cylinder: Cylinder,
}

export function VernierTable({
  highlight,
  onPlaced,
}: {
  highlight?: boolean
  onPlaced?: (type: string) => void
}) {
  const [items, setItems] = useState<Item[]>([])

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const type = e.dataTransfer.getData("text/plain") as Item["type"]
    if (!type) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - 24
    const y = e.clientY - rect.top - 24
    setItems((prev) => [...prev, { id: `${type}-${Date.now()}`, type, x, y }])
    onPlaced?.(type)
  }

  return (
    <div
      id="vernier-dropzone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`relative h-full rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-muted/40 ${
        highlight ? "ring-2 ring-primary/50" : ""
      }`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.2),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(168,85,247,0.18),transparent_45%)]" />
      <div className="absolute top-4 left-4 text-xs text-muted-foreground">Drag equipment here</div>
      {items.map((item) => {
        const Icon = IconMap[item.type]
        return (
          <div
            key={item.id}
            className="absolute flex flex-col items-center gap-1 text-xs text-muted-foreground"
            style={{ left: item.x, top: item.y }}
          >
            <div className="w-12 h-12 rounded-xl bg-card/70 border border-border/60 flex items-center justify-center shadow-lg">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <span>{item.type === "vernier" ? "Vernier" : "Cylinder"}</span>
          </div>
        )
      })}
    </div>
  )
}

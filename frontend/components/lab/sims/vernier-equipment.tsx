"use client"

import { motion } from "framer-motion"
import { Ruler, Cylinder } from "lucide-react"

const items = [
  { id: "vernier", name: "Vernier Caliper", icon: Ruler, color: "text-cyan-400" },
  { id: "cylinder", name: "Metal Cylinder", icon: Cylinder, color: "text-amber-300" },
]

export function VernierEquipment({ highlightId }: { highlightId?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
          title={`Drag ${item.name} to the table`}
          className={`p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted hover:border-primary/50 transition-all group cursor-grab active:cursor-grabbing ${
            highlightId === item.id ? "ring-2 ring-primary/60" : ""
          }`}
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <item.icon className={`w-6 h-6 ${item.color}`} />
          </div>
          <p className="text-sm font-medium text-center">{item.name}</p>
        </motion.button>
      ))}
    </div>
  )
}

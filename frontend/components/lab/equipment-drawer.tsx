"use client"

import { motion } from "framer-motion"
import { Battery, Circle, Zap, Gauge, Lightbulb } from "lucide-react"

const equipment = [
  { id: 1, name: "Battery", icon: Battery, color: "green" },
  { id: 2, name: "Resistor", icon: Circle, color: "orange" },
  { id: 3, name: "Ammeter", icon: Gauge, color: "purple" },
  { id: 4, name: "Voltmeter", icon: Zap, color: "pink" },
  { id: 5, name: "Bulb", icon: Lightbulb, color: "yellow" },
  { id: 6, name: "Wire", icon: Circle, color: "blue" },
]

export function EquipmentDrawer() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {equipment.map((item, index) => (
        <motion.button
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          draggable
          className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted hover:border-primary/50 transition-all group cursor-grab active:cursor-grabbing"
        >
          <div
            className={`w-12 h-12 mx-auto mb-2 rounded-lg bg-${item.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}
          >
            <item.icon className={`w-6 h-6 text-${item.color}-500`} />
          </div>
          <p className="text-sm font-medium text-center">{item.name}</p>
        </motion.button>
      ))}
    </div>
  )
}

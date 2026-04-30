"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const stats = [
  { value: "60+", label: "Virtual Experiments", sublabel: "Physics & Chemistry (Classes 9–12)" },
  { value: "180+", label: "Hazard Scenarios", sublabel: "Guided safety & consequences" },
  { value: "<8s", label: "AI Tutor Response", sublabel: "Context-aware help" },
  { value: "10", label: "School Pilots", sublabel: "FBISE partner schools" },
]

export function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="experiments" ref={ref} className="relative py-20 border-y border-border bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-foreground font-medium">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Gamepad2, Cpu, Bot, BarChart3 } from "lucide-react"

const capabilities = [
  {
    icon: Gamepad2,
    title: "Virtual Lab Arena",
    description:
      "Immersive 3D/2D hybrid lab with drag-and-drop apparatus, live meters, and authentic Physics/Chemistry reactions.",
    color: "text-primary",
    glow: "glow-teal",
  },
  {
    icon: Cpu,
    title: "Hybrid Simulation Engine",
    description:
      "Rules + ML fusion to score setups, predict outcomes, and simulate dangerous paths with warnings (no hard blocks).",
    color: "text-accent",
    glow: "glow-orange",
  },
  {
    icon: Bot,
    title: "AI Tutor Co-pilot",
    description:
      "Context-aware guidance: explains readings, suggests fixes, quizzes students, and logs misconceptions per attempt.",
    color: "text-purple-400",
    glow: "glow-purple",
  },
  {
    icon: BarChart3,
    title: "Institutional Analytics",
    description:
      "Dashboards for teachers/admins with mastery tracking, hazard logs, class trends, and per-student attempt history.",
    color: "text-amber-400",
    glow: "",
  },
]

export function CapabilitiesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="features" ref={ref} className="relative py-24 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Powerful Capabilities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to conduct virtual experiments with confidence and intelligence.
          </p>
        </motion.div>

        {/* Capability Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, index) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full glass border-border hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:${cap.glow} transition-all duration-300`}
                  >
                    <cap.icon className={`w-6 h-6 ${cap.color}`} />
                  </div>
                  <CardTitle className="text-lg text-foreground">{cap.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">{cap.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

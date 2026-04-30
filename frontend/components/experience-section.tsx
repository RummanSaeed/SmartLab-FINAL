"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Sparkles, Box, ShieldAlert, Users } from "lucide-react"

const experiences = [
  {
    icon: Sparkles,
    title: "Cinematic Landing",
    description: "Premium science-tech aesthetic with glassmorphism and neon accents.",
    image: "/modern-dark-tech-landing-page-with-glass-effects.jpg",
    color: "border-primary/50",
  },
  {
    icon: Box,
    title: "Immersive Simulations",
    description: "High-fidelity 3D/2D hybrid rendering with real-time physics.",
    image: "/3d-physics-simulation-laboratory-equipment-dark-th.jpg",
    color: "border-accent/50",
  },
  {
    icon: ShieldAlert,
    title: "Safety & Hazard Mode",
    description: "Learn from dangerous scenarios safely with visual warnings.",
    image: "/chemical-hazard-warning-laboratory-safety-dark-the.jpg",
    color: "border-destructive/50",
  },
  {
    icon: Users,
    title: "Teacher/Admin Suite",
    description: "Comprehensive dashboards for monitoring and analytics.",
    image: "/analytics-dashboard-dark-theme-modern-ui.jpg",
    color: "border-purple-500/50",
  },
]

export function ExperienceSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Experience Highlights</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From stunning visuals to intelligent safety systems, discover what makes SmartLab unique.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`group relative glass rounded-2xl overflow-hidden border ${exp.color} hover:border-primary/70 transition-all duration-300`}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={exp.image || "/placeholder.svg"}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center">
                    <exp.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{exp.title}</h3>
                </div>
                <p className="text-muted-foreground">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

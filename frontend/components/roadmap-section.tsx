"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Search, Hammer, Play, Rocket } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Discover",
    description: "Browse experiments, select your class and subject, understand the theory.",
  },
  {
    icon: Hammer,
    title: "Build",
    description: "Drag and drop apparatus, configure parameters, set up your experiment.",
  },
  {
    icon: Play,
    title: "Simulate + AI",
    description: "Run simulations, get real-time AI tutoring, learn from hazard scenarios.",
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "Save attempts, review results, export reports, track your mastery.",
  },
]

export function RoadmapSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="roadmap" ref={ref} className="relative py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Your Learning Journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From discovery to mastery, follow our structured roadmap to excel in science.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                <div className="glass rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 group">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  <div className="pt-4">
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

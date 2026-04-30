"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Atom, Beaker, BarChart3 } from "lucide-react"

const showcases = [
  {
    icon: Atom,
    title: "Physics Bench",
    description:
      "Explore circuits, optics, mechanics, and wave phenomena with precise measurements and real-time graphs.",
    image: "/physics-laboratory-oscilloscope-circuit-board-dark.jpg",
    tags: ["Circuits", "Optics", "Mechanics", "Waves"],
    color: "text-primary",
  },
  {
    icon: Beaker,
    title: "Chemistry Studio",
    description: "Conduct titrations, analyze reactions, mix compounds, and observe molecular interactions safely.",
    image: "/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg",
    tags: ["Titration", "Reactions", "Compounds", "Analysis"],
    color: "text-accent",
  },
  {
    icon: BarChart3,
    title: "Teacher Analytics",
    description:
      "Monitor student progress, review attempts, track hazard incidents, and generate comprehensive reports.",
    image: "/teacher-dashboard-analytics-charts-dark-theme-mode.jpg",
    tags: ["Progress", "Reports", "Monitoring", "Insights"],
    color: "text-purple-400",
  },
]

export function ShowcaseSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="experiments" ref={ref} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Lab Showcase</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Explore our comprehensive suite of virtual laboratories designed for the Pakistani curriculum.
          </p>
        </motion.div>

        {/* Showcase Cards */}
        <div className="space-y-12">
          {showcases.map((showcase, index) => (
            <motion.div
              key={showcase.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              {/* Image */}
              <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="relative glass rounded-2xl overflow-hidden border border-border group">
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={showcase.image || "/placeholder.svg"}
                      alt={showcase.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Content */}
              <div className={`space-y-6 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <showcase.icon className={`w-6 h-6 ${showcase.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{showcase.title}</h3>
                </div>
                <p className="text-muted-foreground text-lg leading-relaxed">{showcase.description}</p>
                <div className="flex flex-wrap gap-2">
                  {showcase.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-secondary text-muted-foreground border border-border"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

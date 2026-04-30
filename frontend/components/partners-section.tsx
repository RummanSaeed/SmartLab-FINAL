"use client"

import { motion } from "framer-motion"

const partners = [
  "FBISE Partner Schools",
  "The City School",
  "Beaconhouse",
  "Roots Millennium",
  "APSACS",
  "Lahore Grammar School",
]

export function PartnersSection() {
  return (
    <section className="py-16 border-y border-border bg-secondary/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-wider">
          Trusted by Leading Educational Institutions
        </p>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="flex gap-12 whitespace-nowrap"
        >
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <div
              key={`${partner}-${index}`}
              className="flex items-center gap-2 px-6 py-3 glass rounded-full border border-border"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-foreground font-medium">{partner}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

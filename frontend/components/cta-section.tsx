"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Download, Calendar } from "lucide-react"

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="glass-strong rounded-3xl p-8 sm:p-12 border border-border gradient-border"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Ready to Transform Science Education?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Lock in the visuals and move to authentication & lab. Schedule a supervisor review or download our complete
            SRS documentation.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-teal" asChild>
              <Link href="/signup">
                <Calendar className="w-4 h-4 mr-2" />
                Get Started Free
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:bg-secondary bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Download SRS
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Button variant="link" className="text-primary hover:text-primary/80" asChild>
              <Link href="/student/dashboard">
                Enter SmartLab Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

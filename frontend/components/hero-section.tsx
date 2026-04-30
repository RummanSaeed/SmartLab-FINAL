"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Atom, Beaker, Shield } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Pills */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Tutor
              </Badge>
              <Badge variant="outline" className="border-accent/50 text-accent bg-accent/10">
                <Atom className="w-3 h-3 mr-1" />
                Physics
              </Badge>
              <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10">
                <Beaker className="w-3 h-3 mr-1" />
                Chemistry
              </Badge>
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10">
                <Shield className="w-3 h-3 mr-1" />
                Hazard-Safe
              </Badge>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-balance">
                <span className="text-foreground">AI-driven virtual labs for </span>
                <span className="text-primary text-glow-teal">FBISE Physics & Chemistry</span>
                <span className="text-foreground"> (Classes 9–12)</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                High-fidelity 2D/3D simulations, real hazardous outcomes with safety warnings, and an AI tutor that
                guides every step—built for Pakistani schools without physical labs.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-teal" asChild>
                <Link href="/login/student">
                  Enter SmartLab
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-border hover:bg-secondary bg-transparent" asChild>
                <Link href="/student/dashboard">Browse Experiments</Link>
              </Button>
              <Button size="lg" variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/teacher/dashboard">For Teachers</Link>
              </Button>
            </div>

            {/* Featured In */}
            <div className="pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground mb-4 uppercase tracking-wider">Featured In</p>
              <div className="flex flex-wrap items-center gap-6 opacity-80">
                <span className="text-sm font-semibold">FBISE Partner Schools</span>
                <span className="text-sm font-semibold">The City School</span>
                <span className="text-sm font-semibold">Beaconhouse</span>
                <span className="text-sm font-semibold">Roots Millennium</span>
                <span className="text-sm font-semibold">APSACS</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Glass Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="relative glass-strong rounded-2xl p-6 gradient-border">
              {/* Lab Preview Image */}
              <div className="aspect-video rounded-xl overflow-hidden bg-secondary/50 relative">
                <img
                  src="/virtual-science-laboratory-with-chemistry-beakers-.jpg"
                  alt="SmartLab Virtual Laboratory Preview"
                  className="w-full h-full object-cover"
                />
                {/* Overlay elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="glass rounded-lg p-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-foreground">Live Simulation Ready</span>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 glass rounded-xl p-3 border border-primary/30"
              >
                <Atom className="w-6 h-6 text-primary" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 glass rounded-xl p-3 border border-accent/30"
              >
                <Beaker className="w-6 h-6 text-accent" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

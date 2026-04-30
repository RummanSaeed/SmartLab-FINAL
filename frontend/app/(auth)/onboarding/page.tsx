"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  FlaskConical,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Beaker,
  Atom,
  Zap,
  MousePointer,
  MessageSquare,
  CheckCircle,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const steps = [
  {
    id: 1,
    title: "Welcome to SmartLab",
    description: "Your gateway to immersive virtual science experiments aligned with FBISE curriculum.",
    icon: FlaskConical,
    color: "primary",
  },
  {
    id: 2,
    title: "Explore Experiments",
    description: "Browse 48+ Physics and Chemistry experiments. Filter by class, subject, and difficulty.",
    icon: Beaker,
    color: "secondary",
  },
  {
    id: 3,
    title: "Interactive Lab Workspace",
    description: "Drag equipment, adjust parameters, and run simulations in a realistic 3D environment.",
    icon: Atom,
    color: "primary",
  },
  {
    id: 4,
    title: "Safety & Hazard Mode",
    description: "Learn from mistakes safely! Our hazard detection warns you before dangerous setups.",
    icon: Zap,
    color: "secondary",
  },
  {
    id: 5,
    title: "AI Tutor Assistant",
    description: "Get instant explanations, corrections, and personalized guidance from our AI tutor.",
    icon: MessageSquare,
    color: "primary",
  },
  {
    id: 6,
    title: "You're All Set!",
    description: "Start your first experiment and discover the future of science education.",
    icon: CheckCircle,
    color: "green",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const progress = ((currentStep + 1) / steps.length) * 100
  const step = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/student/dashboard")
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    router.push("/student/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="fixed top-4 right-4 z-20">
        <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity">
          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
            <FlaskConical className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold">SmartLab</span>
        </Link>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip Tour
            </button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Card */}
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center ${
                  step.color === "primary"
                    ? "bg-primary/10"
                    : step.color === "green"
                      ? "bg-green-500/10"
                      : "bg-secondary/10"
                }`}
              >
                <step.icon
                  className={`w-12 h-12 ${
                    step.color === "primary"
                      ? "text-primary"
                      : step.color === "green"
                        ? "text-green-500"
                        : "text-secondary"
                  }`}
                />
              </motion.div>

              {/* Content */}
              <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
              <p className="text-muted-foreground text-lg mb-8">{step.description}</p>

              {/* Feature highlights for specific steps */}
              {currentStep === 2 && (
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MousePointer className="w-4 h-4" />
                    Drag & Drop
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4" />
                    Real-time Physics
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev} className="flex-1 h-12 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 h-12 group">
              {currentStep === steps.length - 1 ? "Enter SmartLab" : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep ? "w-6 bg-primary" : index < currentStep ? "bg-primary/50" : "bg-border"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

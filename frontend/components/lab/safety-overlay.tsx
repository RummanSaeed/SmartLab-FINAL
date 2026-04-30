"use client"

import { motion } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SafetyOverlayProps {
  onCancel: () => void
  onProceed: () => void
}

export function SafetyOverlay({ onCancel, onProceed }: SafetyOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-b from-red-500/10 to-background border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full relative"
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold mb-3">Dangerous Setup Detected</h2>

          <p className="text-muted-foreground mb-6">The voltage level you've set is dangerously high and may cause:</p>

          <ul className="text-left space-y-2 mb-8 w-full">
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Component overheating and damage</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Electrical sparks or fire hazards</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">Inaccurate experimental results</span>
            </li>
          </ul>

          <div className="flex flex-col w-full gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full h-12 border-border hover:bg-muted bg-transparent"
            >
              Cancel & Adjust Parameters
            </Button>
            <Button onClick={onProceed} className="w-full h-12 bg-red-500 hover:bg-red-600 text-white">
              I Understand, Proceed Anyway
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">This action will be logged for safety review</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

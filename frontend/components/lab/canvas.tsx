"use client"

import { useEffect, useRef } from "react"

interface LabCanvasProps {
  voltage: number
  resistance: number
  isRunning: boolean
}

export function LabCanvas({ voltage, resistance, isRunning }: LabCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Draw circuit components
    // Battery
    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 3
    ctx.fillStyle = "#10b981"
    ctx.fillRect(centerX - 150, centerY - 60, 30, 120)
    ctx.fillText("Battery", centerX - 150, centerY + 90)
    ctx.fillText(`${voltage}V`, centerX - 145, centerY + 105)

    // Resistor
    ctx.strokeStyle = "#f59e0b"
    ctx.fillStyle = "#f59e0b"
    ctx.fillRect(centerX + 80, centerY - 30, 60, 60)
    ctx.fillText("Resistor", centerX + 85, centerY + 50)
    ctx.fillText(`${resistance}Ω`, centerX + 92, centerY + 65)

    // Wires
    ctx.strokeStyle = isRunning ? "#3b82f6" : "#6b7280"
    ctx.lineWidth = 4
    ctx.beginPath()
    // Top wire
    ctx.moveTo(centerX - 120, centerY - 60)
    ctx.lineTo(centerX + 110, centerY - 60)
    ctx.lineTo(centerX + 110, centerY - 30)
    ctx.stroke()

    // Bottom wire
    ctx.beginPath()
    ctx.moveTo(centerX + 110, centerY + 30)
    ctx.lineTo(centerX + 110, centerY + 60)
    ctx.lineTo(centerX - 120, centerY + 60)
    ctx.stroke()

    // Ammeter
    ctx.strokeStyle = "#8b5cf6"
    ctx.fillStyle = "#8b5cf6"
    ctx.beginPath()
    ctx.arc(centerX - 30, centerY + 60, 25, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#fff"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("A", centerX - 30, centerY + 66)

    const current = voltage / resistance
    ctx.fillStyle = "#8b5cf6"
    ctx.fillText(`${current.toFixed(2)}A`, centerX - 30, centerY + 100)

    // Voltmeter
    ctx.fillStyle = "#ec4899"
    ctx.beginPath()
    ctx.arc(centerX + 30, centerY - 60, 25, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#fff"
    ctx.fillText("V", centerX + 30, centerY - 54)

    ctx.fillStyle = "#ec4899"
    ctx.fillText(`${voltage.toFixed(1)}V`, centerX + 30, centerY - 75)

    // Current flow animation
    if (isRunning) {
      const time = Date.now() / 1000
      for (let i = 0; i < 5; i++) {
        const progress = (time + i * 0.3) % 1
        let x, y

        if (progress < 0.33) {
          // Top wire
          const p = progress / 0.33
          x = centerX - 120 + 230 * p
          y = centerY - 60
        } else if (progress < 0.66) {
          // Right side
          const p = (progress - 0.33) / 0.33
          x = centerX + 110
          y = centerY - 60 + 120 * p
        } else {
          // Bottom wire
          const p = (progress - 0.66) / 0.34
          x = centerX + 110 - 230 * p
          y = centerY + 60
        }

        ctx.fillStyle = "#3b82f6"
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [voltage, resistance, isRunning])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Redraw to animate
          const event = new Event("update")
          canvas.dispatchEvent(event)
        }
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" style={{ maxWidth: "800px", maxHeight: "600px" }} />
    </div>
  )
}

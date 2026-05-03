"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Hand, Ruler } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Props = {
  sizeCm: number
  zeroErrorCm: number
  onSizeChange: (v: number) => void
  onZeroErrorChange: (v: number) => void
}

const MAX_CM = 10
const LEAST_COUNT = 0.01

export function VernierSim({ sizeCm, zeroErrorCm, onSizeChange, onZeroErrorChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const renderRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 })
  const [resizeTick, setResizeTick] = useState(0)
  const [metrics, setMetrics] = useState<{ w: number; h: number; scale: number } | null>(null)

  const parsed = useMemo(() => {
    const clamped = Math.min(Math.max(sizeCm, 0), MAX_CM)
    const msr = Math.floor(clamped * 10) / 10
    const frac = Math.max(0, clamped - msr)
    const vsr = Math.round(frac / LEAST_COUNT)
    const measured = msr + vsr * LEAST_COUNT
    const corrected = measured + zeroErrorCm
    return {
      msr: Number(msr.toFixed(1)),
      vsr,
      measured: Number(measured.toFixed(2)),
      corrected: Number(corrected.toFixed(2)),
    }
  }, [sizeCm, zeroErrorCm])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const ro = new ResizeObserver(() => setResizeTick((t) => t + 1))
    ro.observe(parent)
    window.addEventListener("resize", () => setResizeTick((t) => t + 1))
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    const ctx = canvas.getContext("2d")
    if (!ctx || !parent) return

    let raf = 0
    let tries = 0

    const drawVernier = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = parent.getBoundingClientRect()
      const cssW = Math.max(600, Math.floor(rect.width || 600))
      const cssH = Math.max(300, Math.floor(rect.height || 300))

      if ((cssW < 50 || cssH < 50) && tries < 10) {
        tries += 1
        raf = window.requestAnimationFrame(drawVernier)
        return
      }

      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Dark background
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, cssW, cssH)

      const scale = Math.min(cssW / 700, cssH / 350) * 0.9
      const offsetX = (cssW - 600 * scale) / 2
      const offsetY = (cssH - 200 * scale) / 2 + 50

      setMetrics({ w: cssW, h: cssH, scale: Number(scale.toFixed(3)) })
      renderRef.current = { scale, offsetX, offsetY }

      const s = scale
      const ox = offsetX
      const oy = offsetY

      // Draw Main Scale (fixed lower jaw)
      ctx.fillStyle = "#e2e8f0"
      ctx.fillRect(ox, oy + 80 * s, 600 * s, 60 * s)
      
      // Main scale markings
      ctx.strokeStyle = "#0f172a"
      ctx.lineWidth = 2
      for (let i = 0; i <= 60; i++) {
        const x = ox + (50 + i * 9) * s
        const h = i % 10 === 0 ? 20 * s : i % 5 === 0 ? 12 * s : 8 * s
        ctx.beginPath()
        ctx.moveTo(x, oy + 80 * s)
        ctx.lineTo(x, oy + 80 * s + h)
        ctx.stroke()
        
        // Numbers every 10mm
        if (i % 10 === 0 && i <= 50) {
          ctx.fillStyle = "#0f172a"
          ctx.font = `bold ${12 * s}px sans-serif`
          ctx.textAlign = "center"
          ctx.fillText(String(i / 10), x, oy + 115 * s)
        }
      }

      // Calculate slider position based on size
      const sliderPos = (50 + sizeCm * 90) * s

      // Draw Vernier Scale (sliding upper jaw)
      ctx.fillStyle = "#fbbf24" // Gold/brass color for vernier
      ctx.fillRect(ox + sliderPos - 50 * s, oy + 20 * s, 100 * s, 60 * s)
      
      // Vernier scale markings
      ctx.strokeStyle = "#0f172a"
      ctx.lineWidth = 1.5
      for (let i = 0; i <= 10; i++) {
        const x = ox + sliderPos - 50 * s + i * 8.1 * s
        const h = i === 0 || i === 10 ? 18 * s : 10 * s
        ctx.beginPath()
        ctx.moveTo(x, oy + 20 * s + 60 * s - h)
        ctx.lineTo(x, oy + 20 * s + 60 * s)
        ctx.stroke()
      }

      // Fixed jaw (lower)
      ctx.fillStyle = "#64748b"
      ctx.fillRect(ox, oy + 140 * s, 80 * s, 40 * s)
      ctx.fillStyle = "#94a3b8"
      ctx.fillRect(ox + 78 * s, oy + 140 * s, 4 * s, 40 * s)

      // Sliding jaw (upper) - connected to vernier
      ctx.fillStyle = "#64748b"
      ctx.fillRect(ox + sliderPos - 50 * s, oy + 80 * s, 50 * s, 60 * s)
      ctx.fillStyle = "#94a3b8"
      ctx.fillRect(ox + sliderPos - 52 * s, oy + 80 * s, 4 * s, 60 * s)

      // Object being measured (cyan block)
      const objX = ox + 80 * s
      const objW = sizeCm * 9 * s
      const objH = 50 * s
      
      // Object shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)"
      ctx.fillRect(objX + 4 * s, oy + 145 * s + 4 * s, objW, objH)
      
      // Object body - bright cyan/teal for visibility
      const grad = ctx.createLinearGradient(objX, oy + 145 * s, objX, oy + 145 * s + objH)
      grad.addColorStop(0, "#22d3ee")
      grad.addColorStop(0.5, "#06b6d4")
      grad.addColorStop(1, "#0891b2")
      ctx.fillStyle = grad
      ctx.fillRect(objX, oy + 145 * s, objW, objH)
      
      // Object highlight
      ctx.strokeStyle = "#67e8f9"
      ctx.lineWidth = 2
      ctx.strokeRect(objX, oy + 145 * s, objW, objH)

      // Measurement line
      ctx.strokeStyle = "#ef4444"
      ctx.setLineDash([5, 5])
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(objX, oy + 120 * s)
      ctx.lineTo(objX + objW, oy + 120 * s)
      ctx.stroke()
      ctx.setLineDash([])

      // Labels
      ctx.fillStyle = "#e2e8f0"
      ctx.font = `bold ${14 * s}px sans-serif`
      ctx.textAlign = "center"
      ctx.fillText("VERNIER CALIPER", ox + 300 * s, oy - 20 * s)
      
      ctx.fillStyle = "#94a3b8"
      ctx.font = `${10 * s}px sans-serif`
      ctx.fillText("Main Scale (cm)", ox + 300 * s, oy + 160 * s)
      ctx.fillText("Vernier Scale", ox + sliderPos, oy + 10 * s)

      // Zero error indicator
      if (zeroErrorCm !== 0) {
        ctx.fillStyle = "#fbbf24"
        ctx.font = `bold ${11 * s}px sans-serif`
        ctx.fillText(`Zero Error: ${zeroErrorCm > 0 ? "+" : ""}${zeroErrorCm.toFixed(2)} cm`, ox + 550 * s, oy + 170 * s)
      }
    }

    drawVernier()
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [resizeTick, sizeCm, zeroErrorCm])

      const scaleOriginX = 67
      const vernierOriginX = 55
      const mainScaleLengthPixels = 600

      const clamped = Math.min(Math.max(sizeCm, 0), MAX_CM)
      const sliderX = scaleOriginX + (clamped / MAX_CM) * mainScaleLengthPixels

      const y = offsetY
      const x = offsetX + (sliderX - vernierOriginX) * scale
      const scaledV1W = v1.width * scale
      const scaledV1H = v1.height * scale
      const scaledV2H = v2.height * scale
      const scaledV3W = v3.width * scale
      const scaledV3H = v3.height * scale
      const midWidth = Math.max(180, v2.width)
      const scaledMidWidth = Math.max(180 * scale, midWidth * scale)
      ctx.drawImage(v1, x, y, scaledV1W, scaledV1H)
      ctx.drawImage(v2, x + scaledV1W, y, scaledMidWidth, scaledV2H)
      ctx.drawImage(v3, x + scaledV1W + scaledMidWidth, y, scaledV3W, scaledV3H)

      const objectWidth = Math.max(60, (clamped / MAX_CM) * mainScaleLengthPixels)
      const objectX = offsetX + scaleOriginX * scale
      const objectY = offsetY + (base.height - 80) * scale
      ctx.fillStyle = "rgba(245, 158, 11, 0.75)"
      ctx.strokeStyle = "rgba(251, 191, 36, 0.9)"
      ctx.lineWidth = 2
      ctx.fillRect(objectX, objectY, objectWidth * scale, 30 * scale)
      ctx.strokeRect(objectX, objectY, objectWidth * scale, 30 * scale)

      ctx.fillStyle = "#f97316"
      ctx.font = "14px sans-serif"
      ctx.fillText("Fixed Internal Jaw", offsetX + 160 * scale, offsetY + 30 * scale)
      ctx.fillText("Fixed External Jaw", offsetX + 160 * scale, offsetY + (base.height - 20) * scale)
    }

    raf = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(raf)
  }, [loaded, sizeCm, zeroErrorCm, resizeTick])

  const handlePointerMove = (clientX: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleOriginX = 67
    const mainScaleLengthPixels = 600
    const { scale, offsetX } = renderRef.current
    const xCss = clientX - rect.left
    const xBase = (xCss - offsetX) / scale
    const x = Math.min(
      Math.max(xBase, scaleOriginX),
      scaleOriginX + mainScaleLengthPixels,
    )
    const ratio = (x - scaleOriginX) / mainScaleLengthPixels
    onSizeChange(Number((ratio * MAX_CM).toFixed(2)))
  }

  const adjustZero = (delta: number) => {
    const next = Math.max(-0.1, Math.min(0.1, Number((zeroErrorCm + delta).toFixed(2))))
    onZeroErrorChange(next)
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Ruler className="w-5 h-5 text-primary" />
        <div className="text-sm">
          <div className="font-semibold">Vernier Caliper (Real Assets)</div>
          <div className="text-muted-foreground text-xs">LC = 0.01 cm | Drag the slider to measure</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Object: {sizeCm.toFixed(2)} cm</Badge>
        <Badge variant="outline">Zero error: {zeroErrorCm.toFixed(2)} cm</Badge>
        <Badge>{parsed.corrected.toFixed(2)} cm</Badge>
        <Badge variant="outline">MSR: {parsed.msr.toFixed(1)} cm</Badge>
        <Badge variant="outline">VSR: {parsed.vsr}</Badge>
        {metrics && (
          <Badge variant="outline">
            Canvas: {metrics.w}x{metrics.h} | scale {metrics.scale}
          </Badge>
        )}
      </div>

      <div className="relative rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
        <div className="absolute inset-0 bg-slate-100" />
        <canvas
          ref={canvasRef}
          className="block w-full h-[55vh] min-h-[360px] max-h-[560px]"
          onPointerMove={(e) => dragging && handlePointerMove(e.clientX)}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
          onWheel={(e) => {
            if (!e.shiftKey) return
            e.preventDefault()
            adjustZero(e.deltaY > 0 ? -0.01 : 0.01)
          }}
        />
        <div className="absolute left-6 top-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Hand className="w-3 h-3" />
          Drag slider to measure. Hold Shift + Mouse Wheel to tune zero error.
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        Reading = MSR + (VSR x LC) + zero error. LC = {LEAST_COUNT.toFixed(2)} cm.
        <div className="mt-1 text-foreground font-semibold">
          {parsed.msr.toFixed(1)} + ({parsed.vsr} x {LEAST_COUNT.toFixed(2)}) + {zeroErrorCm.toFixed(2)} = {parsed.corrected.toFixed(2)} cm
        </div>
      </div>
    </div>
  )
}

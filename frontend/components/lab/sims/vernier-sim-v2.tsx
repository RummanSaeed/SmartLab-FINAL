"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Ruler, Hand } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Props = {
  sizeCm: number
  zeroErrorCm: number
  onSizeChange: (v: number) => void
  onZeroErrorChange: (v: number) => void
}

const MAX_CM = 10
const LEAST_COUNT = 0.01
const MAIN_SCALE_PIXELS = 600
const SCALE_ORIGIN_X = 67
const VERNIER_ORIGIN_X = 55

export function VernierSimV2({ sizeCm, zeroErrorCm, onSizeChange, onZeroErrorChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imagesRef = useRef<Record<string, HTMLImageElement>>({})
  const renderRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 })
  const sliderZoneRef = useRef({ x1: 0, y1: 0, x2: 0, y2: 0 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [dragging, setDragging] = useState(false)

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
    const names = ["vernier_base", "vernier1", "vernier2", "vernier3"]
    let done = 0
    names.forEach((name) => {
      const img = new Image()
      img.src = `/sims/vernier/${name}.png`
      img.onload = () => {
        imagesRef.current[name] = img
        done += 1
        if (done === names.length) {
          setLoaded(true)
        }
      }
    })
  }, [])

  useEffect(() => {
    if (!loaded || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const base = imagesRef.current.vernier_base
    const v1 = imagesRef.current.vernier1
    const v2 = imagesRef.current.vernier2
    const v3 = imagesRef.current.vernier3

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const cssW = Math.max(300, Math.floor(rect.width || 1200))
    const cssH = Math.max(280, Math.floor(rect.height || 360))
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    canvas.style.width = `${cssW}px`
    canvas.style.height = `${cssH}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const padX = 16
    const padY = 10
    const scale = Math.min((cssW - padX * 2) / base.width, (cssH - padY * 2) / base.height)
    const drawW = base.width * scale
    const drawH = base.height * scale
    const offsetX = (cssW - drawW) / 2
    const offsetY = (cssH - drawH) / 2

    renderRef.current = { scale, offsetX, offsetY }
    ctx.drawImage(base, offsetX, offsetY, drawW, drawH)

    const clamped = Math.min(Math.max(sizeCm, 0), MAX_CM)
    const sliderX = SCALE_ORIGIN_X + (clamped / MAX_CM) * MAIN_SCALE_PIXELS

    const y = offsetY
    const x = offsetX + (sliderX - VERNIER_ORIGIN_X) * scale
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

    // Draw main scale numbers (0, 1, 2, 3... cm) on the fixed scale
    const mainScaleStartX = offsetX + SCALE_ORIGIN_X * scale
    const mainScaleY = offsetY + 95 * scale
    const mainScaleLength = MAIN_SCALE_PIXELS * scale
    const mainScaleStep = mainScaleLength / MAX_CM
    ctx.save()
    ctx.fillStyle = "rgba(20, 20, 20, 0.9)"
    ctx.font = `${Math.max(10, 12 * scale)}px sans-serif`
    for (let i = 0; i <= MAX_CM; i++) {
      const sx = mainScaleStartX + i * mainScaleStep
      ctx.fillText(`${i}`, sx - 3 * scale, mainScaleY)
    }
    ctx.restore()

    // Draw vernier scale numbers (0, 1, 2... divisions) on the moving scale
    const vernierScaleStartX = x + 15 * scale
    const vernierScaleY = offsetY + 95 * scale
    const vernierDivisions = 10
    const vernierStep = scaledV1W / vernierDivisions
    ctx.save()
    ctx.fillStyle = "rgba(20, 20, 20, 0.9)"
    ctx.font = `${Math.max(9, 11 * scale)}px sans-serif`
    for (let j = 0; j <= vernierDivisions; j++) {
      const vx = vernierScaleStartX + j * vernierStep
      if (vx < x + scaledV1W) {
        ctx.fillText(`${j}`, vx - 2 * scale, vernierScaleY)
      }
    }
    ctx.restore()

    sliderZoneRef.current = {
      x1: offsetX + (sliderX - VERNIER_ORIGIN_X) * scale,
      y1: offsetY,
      x2: offsetX + (sliderX - VERNIER_ORIGIN_X + v1.width + midWidth + v3.width) * scale,
      y2: offsetY + v1.height * scale,
    }

    const objectWidth = Math.max(60, (clamped / MAX_CM) * MAIN_SCALE_PIXELS)
    const objectX = offsetX + SCALE_ORIGIN_X * scale
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
  }, [loaded, sizeCm, zeroErrorCm])

  const handlePointerMove = (clientX: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const { scale, offsetX } = renderRef.current
    const xCss = clientX - rect.left
    const xBase = (xCss - offsetX) / scale
    const x = Math.min(
      Math.max(xBase, SCALE_ORIGIN_X),
      SCALE_ORIGIN_X + MAIN_SCALE_PIXELS,
    )
    const ratio = (x - SCALE_ORIGIN_X) / MAIN_SCALE_PIXELS
    onSizeChange(Number((ratio * MAX_CM).toFixed(2)))
  }

  const adjustZero = (delta: number) => {
    const next = Math.max(-0.1, Math.min(0.1, Number((zeroErrorCm + delta).toFixed(2))))
    onZeroErrorChange(next)
  }

  const isInSliderZone = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return false
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const z = sliderZoneRef.current
    return x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Ruler className="w-5 h-5 text-primary" />
        <div className="text-sm">
          <div className="font-semibold">Vernier Caliper (V2 - Screw Gauge Pattern)</div>
          <div className="text-muted-foreground text-xs">LC = 0.01 cm | Drag slider to measure</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Object: {sizeCm.toFixed(2)} cm</Badge>
        <Badge variant="outline">Zero error: {zeroErrorCm.toFixed(2)} cm</Badge>
        <Badge>{parsed.corrected.toFixed(2)} cm</Badge>
        <Badge variant="outline">MSR: {parsed.msr.toFixed(1)} cm</Badge>
        <Badge variant="outline">VSR: {parsed.vsr}</Badge>
      </div>

      <div className="relative rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-[360px]"
          onPointerMove={(e) => dragging && handlePointerMove(e.clientX)}
          onPointerDown={(e) => {
            if (isInSliderZone(e.clientX, e.clientY)) {
              setDragging(true)
              dragRef.current = { x: e.clientX, y: e.clientY }
            }
          }}
          onPointerUp={() => {
            setDragging(false)
            dragRef.current = null
          }}
          onPointerLeave={() => {
            setDragging(false)
            dragRef.current = null
          }}
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

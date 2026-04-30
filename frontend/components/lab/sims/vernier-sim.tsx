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
  const imagesRef = useRef<Record<string, HTMLImageElement>>({})
  const renderRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 })
  const [loaded, setLoaded] = useState(false)
  const [dragging, setDragging] = useState(false)
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
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const ro = new ResizeObserver(() => {
      setResizeTick((t) => t + 1)
    })
    ro.observe(parent)
    const onResize = () => setResizeTick((t) => t + 1)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      ro.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!loaded || !canvasRef.current) return
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    const ctx = canvas.getContext("2d")
    if (!ctx || !parent) return

    const base = imagesRef.current.vernier_base
    const v1 = imagesRef.current.vernier1
    const v2 = imagesRef.current.vernier2
    const v3 = imagesRef.current.vernier3

    let raf = 0
    let tries = 0

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = parent.getBoundingClientRect()
      const rawW = parent.clientWidth || rect.width || 0
      const rawH = parent.clientHeight || rect.height || 0
      const cssW = Math.max(300, Math.floor(rawW))
      const cssH = Math.max(280, Math.floor(rawH))

      if ((cssW < 50 || cssH < 50) && tries < 10) {
        tries += 1
        raf = window.requestAnimationFrame(draw)
        return
      }

      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.clearRect(0, 0, cssW, cssH)
      const padX = 16
      const padY = 10
      const scale = Math.min((cssW - padX * 2) / base.width, (cssH - padY * 2) / base.height)
      const drawW = base.width * scale
      const drawH = base.height * scale
      const offsetX = (cssW - drawW) / 2
      const offsetY = Math.max(padY, (cssH - drawH) / 2)

      setMetrics({ w: cssW, h: cssH, scale: Number(scale.toFixed(3)) })

      renderRef.current = { scale, offsetX, offsetY }
      ctx.drawImage(base, offsetX, offsetY, drawW, drawH)

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

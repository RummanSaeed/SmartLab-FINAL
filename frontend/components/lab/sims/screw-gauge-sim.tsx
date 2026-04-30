"use client"

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type WheelEvent } from "react"
import { Gauge, Hand } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Props = {
  diameterMm: number
  zeroErrorMm: number
  mainScaleDivisions: number
  circularScaleDivisions: number
  onDiameterChange: (v: number) => void
  onZeroErrorChange: (v: number) => void
}

const PITCH = 0.5
const DIVISIONS = 50
const LEAST_COUNT = PITCH / DIVISIONS
const MAX_MM = 5
const MIN_MM = 0
const SPINDLE_ORIGIN_X = 200
const SPINDLE_ORIGIN_Y = 79
const MAIN_SCALE_PIXELS = 300

export function ScrewGaugeSim({
  diameterMm,
  zeroErrorMm,
  mainScaleDivisions,
  circularScaleDivisions,
  onDiameterChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imagesRef = useRef<Record<string, HTMLImageElement>>({})
  const renderRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 })
  const thimbleZoneRef = useRef({ x1: 0, y1: 0, x2: 0, y2: 0 })
  const snapTargetRef = useRef({ x: 0, y: 0 })
  const snapZoneRef = useRef({ x1: 0, y1: 0, x2: 0, y2: 0 })
  const dragRef = useRef<{ x: number; y: number } | null>(null)
  const wheelCacheRef = useRef({ correctedReading: 0, enabled: true })
  const [loaded, setLoaded] = useState(false)
  const [draggingThimble, setDraggingThimble] = useState(false)
  const [draggingObject, setDraggingObject] = useState(false)
  const [objectSnapped, setObjectSnapped] = useState(false)
  const [objectPos, setObjectPos] = useState({ x: 90, y: 80 })
  const [objectSizePx] = useState(48)
  const objectWidthMm = useMemo(() => Number(((objectSizePx / MAIN_SCALE_PIXELS) * MAX_MM).toFixed(3)), [objectSizePx])

  const correctedReading = useMemo(() => {
    const clamped = Math.min(MAX_MM, Math.max(MIN_MM, diameterMm))
    return Number(clamped.toFixed(3))
  }, [diameterMm])
  useEffect(() => {
    wheelCacheRef.current.correctedReading = correctedReading
  }, [correctedReading])

  const measuredReading = useMemo(() => {
    return Number((correctedReading + zeroErrorMm).toFixed(3))
  }, [correctedReading, zeroErrorMm])

  const reading = useMemo(() => {
    const main = Math.floor(measuredReading / PITCH) * PITCH
    const frac = measuredReading - main
    const circDiv = Math.round(frac / LEAST_COUNT)
    const raw = main + circDiv * LEAST_COUNT
    return Number(raw.toFixed(3))
  }, [measuredReading])

  const msr = useMemo(() => Number((Math.floor(reading / PITCH) * PITCH).toFixed(3)), [reading])
  const csr = useMemo(() => {
    const frac = reading - msr
    return Math.round(frac / LEAST_COUNT)
  }, [reading, msr])

  useEffect(() => {
    const names = ["micrometer_base", "thimble", "spindle", "texture9"]
    let done = 0
    names.forEach((name) => {
      const img = new Image()
      img.src = `/sims/micrometer/${name}.png`
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

    const base = imagesRef.current.micrometer_base
    const thimble = imagesRef.current.thimble
    const spindle = imagesRef.current.spindle

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const cssW = Math.max(300, Math.floor(rect.width || 1200))
    const cssH = Math.max(280, Math.floor(rect.height || 420))
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

    const clampedRaw = Math.min(Math.max(correctedReading, 0), MAX_MM)
    const clamped = objectSnapped ? Math.max(clampedRaw, objectWidthMm) : clampedRaw
    const startX = 520
    const endX = 820
    const thimbleX = startX + (clamped / MAX_MM) * (endX - startX)
    const rotationAngle = (clamped / PITCH) * 2 * Math.PI

    // Draw spindle first (behind frame), then base, to match reference visual layering.
    // Reference behavior: spindle translates with reading; it does not stretch from a fixed tip.
    const spindleY = SPINDLE_ORIGIN_Y
    const shiftPx = (clamped / MAX_MM) * MAIN_SCALE_PIXELS
    const spindleX = SPINDLE_ORIGIN_X + shiftPx
    ctx.drawImage(
      spindle,
      offsetX + spindleX * scale,
      offsetY + spindleY * scale,
      spindle.width * scale,
      spindle.height * scale,
    )
    ctx.drawImage(base, offsetX, offsetY, drawW, drawH)

    // Main scale divisions and labels: clipped to sleeve so they stay behind moving parts.
    const msStartX = offsetX + 539 * scale
    const msY = offsetY + 100 * scale
    const msLen = MAIN_SCALE_PIXELS * scale
    const msStep = msLen / Math.max(1, mainScaleDivisions)
    const sleeveTop = msY - 26 * scale
    const sleeveHeight = 54 * scale

    ctx.save()
    ctx.beginPath()
    ctx.rect(msStartX - 2 * scale, sleeveTop, msLen + 4 * scale, sleeveHeight)
    ctx.clip()
    ctx.strokeStyle = "rgba(20,20,20,0.92)"
    ctx.fillStyle = "rgba(20,20,20,0.92)"
    ctx.lineWidth = Math.max(1, 1.3 * scale)
    ctx.font = `${Math.max(10, 12 * scale)}px sans-serif`
    for (let i = 0; i <= mainScaleDivisions; i++) {
      const x = msStartX + i * msStep
      const major = i % 5 === 0
      const tick = major ? 18 * scale : 10 * scale
      ctx.beginPath()
      ctx.moveTo(x, msY)
      ctx.lineTo(x, msY + tick)
      ctx.stroke()
      if (major) {
        // Reference sequence with pitch=0.5 mm => labels like 0, 5, 10, 15...
        const displayed = Number((i * 0.5).toFixed(1))
        ctx.fillText(`${displayed % 1 === 0 ? displayed.toFixed(0) : displayed}`, x - 6 * scale, msY - 4 * scale)
      }
    }
    ctx.restore()

    ctx.save()
    // Match reference simulator composition:
    // thimble assembly stays aligned with gauge and translates with spindle gap.
    ctx.drawImage(
      thimble,
      offsetX + thimbleX * scale,
      offsetY + 31 * scale,
      thimble.width * scale,
      thimble.height * scale,
    )

    // Visual rotation markers so clockwise/anticlockwise motion is obvious.
    const bodyCx = offsetX + (thimbleX + 205) * scale
    const bodyCy = offsetY + 122 * scale
    const bodyR = 14 * scale
    const wheelCx = offsetX + (thimbleX + thimble.width - 28) * scale
    const wheelCy = offsetY + 122 * scale
    const wheelR = 16 * scale

    ctx.strokeStyle = "rgba(20,20,20,0.85)"
    ctx.lineWidth = Math.max(1.2, 2 * scale)
    ctx.beginPath()
    ctx.arc(bodyCx, bodyCy, bodyR, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(bodyCx, bodyCy)
    ctx.lineTo(
      bodyCx + Math.cos(rotationAngle) * bodyR,
      bodyCy + Math.sin(rotationAngle) * bodyR,
    )
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(wheelCx, wheelCy, wheelR, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(wheelCx, wheelCy)
    ctx.lineTo(
      wheelCx + Math.cos(rotationAngle + Math.PI / 6) * wheelR,
      wheelCy + Math.sin(rotationAngle + Math.PI / 6) * wheelR,
    )
    ctx.stroke()
    ctx.restore()

    // Circular scale divisions on thimble edge (reference style: ...45, 0, 5...)
    const csX = offsetX + (thimbleX + 68) * scale
    const csY = offsetY + 122 * scale
    const csHalf = 62 * scale
    const maxMarks = Math.min(30, Math.max(10, circularScaleDivisions))
    const stepY = (2 * csHalf) / maxMarks
    const csrOffset = csr % circularScaleDivisions
    ctx.font = `${Math.max(9, 10 * scale)}px sans-serif`
    for (let j = -maxMarks / 2; j <= maxMarks / 2; j++) {
      const y = csY + j * stepY
      const idx = ((csrOffset - j) % circularScaleDivisions + circularScaleDivisions) % circularScaleDivisions
      const major = idx % 5 === 0
      const tick = major ? 16 * scale : 9 * scale
      ctx.beginPath()
      ctx.moveTo(csX - tick, y)
      ctx.lineTo(csX, y)
      ctx.stroke()
      if (major && y > csY - csHalf + 8 * scale && y < csY + csHalf - 8 * scale) {
        ctx.fillText(`${idx}`, csX + 6 * scale, y + 3 * scale)
      }
    }

    thimbleZoneRef.current = {
      x1: offsetX + (thimbleX + 35) * scale,
      y1: offsetY + 35 * scale,
      x2: offsetX + (thimbleX + thimble.width - 20) * scale,
      y2: offsetY + (35 + thimble.height - 10) * scale,
    }

    const objW = objectSizePx * scale
    const objH = 44 * scale

    // Snap target near left jaw where object should be measured.
    // Snap in the left jaw-gap area (between anvil and spindle tip).
    // Jaw-gap snap target (between anvil face and spindle tip), in reference coordinates.
    const targetX = offsetX + 118 * scale
    const targetY = offsetY + 86 * scale
    snapTargetRef.current = { x: targetX, y: targetY }
    snapZoneRef.current = {
      x1: targetX - 85 * scale,
      y1: targetY - 28 * scale,
      x2: targetX + 140 * scale,
      y2: targetY + 70 * scale,
    }

    // Draw spindle first; draw snapped object after spindle so spindle looks behind it.
    // Draw draggable object (sample wire/cylinder) and auto-snap target region.
    const target = snapTargetRef.current
    const drawObjX = objectSnapped ? target.x : objectPos.x
    const drawObjY = objectSnapped ? target.y : objectPos.y
    const grd = ctx.createLinearGradient(drawObjX, drawObjY, drawObjX + objW, drawObjY)
    grd.addColorStop(0, "rgba(130,130,130,0.95)")
    grd.addColorStop(0.5, "rgba(230,230,210,0.95)")
    grd.addColorStop(1, "rgba(120,120,120,0.95)")
    ctx.fillStyle = grd
    ctx.fillRect(drawObjX, drawObjY, objW, objH)
    ctx.strokeStyle = "rgba(20,20,20,0.9)"
    ctx.strokeRect(drawObjX, drawObjY, objW, objH)

    ctx.fillStyle = "rgba(245, 158, 11, 0.9)"
    ctx.font = `${Math.max(14, 18 * scale)}px sans-serif`
    ctx.fillText(`${reading.toFixed(3)} mm`, offsetX + 30 * scale, offsetY + 50 * scale)
  }, [
    loaded,
    correctedReading,
    reading,
    objectPos,
    objectSnapped,
    objectSizePx,
    objectWidthMm,
    mainScaleDivisions,
    circularScaleDivisions,
  ])

  const rotateByDivisions = (divisionDelta: number) => {
    if (divisionDelta === 0) return
    const minReading = objectSnapped ? objectWidthMm : MIN_MM
    const next = Math.min(MAX_MM, Math.max(minReading, correctedReading + divisionDelta * LEAST_COUNT))
    onDiameterChange(Number(next.toFixed(3)))
  }

  const updateDiameterByDrag = (clientX: number, clientY: number) => {
    const prev = dragRef.current
    if (!prev) return
    const dy = clientY - prev.y
    dragRef.current = { x: clientX, y: clientY }

    // Match reference logic: vertical drag rounded to discrete divisions.
    const divisions = Math.round(dy)
    rotateByDivisions(divisions)
  }

  const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const direction = e.deltaY > 0 ? 1 : -1
    rotateByDivisions(direction)
  }

  const isInThimbleZone = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return false
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const x = (clientX - rect.left) * dpr
    const y = (clientY - rect.top) * dpr
    const z = thimbleZoneRef.current
    return x >= z.x1 && x <= z.x2 && y >= z.y1 && y <= z.y2
  }

  const isInObject = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return false
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const s = renderRef.current.scale
    const startX = 520
    const endX = 820
    const objW = objectSizePx * s
    const objH = 44 * s
    const target = snapTargetRef.current
    const ox = objectSnapped ? target.x : objectPos.x
    const oy = objectSnapped ? target.y : objectPos.y
    return x >= ox && x <= ox + objW && y >= oy && y <= oy + objH
  }

  const updateObjectDrag = (clientX: number, clientY: number) => {
    const prev = dragRef.current
    if (!prev) return
    const dx = clientX - prev.x
    const dy = clientY - prev.y
    dragRef.current = { x: clientX, y: clientY }
    setObjectPos((p) => {
      const next = { x: p.x + dx, y: p.y + dy }
      const s = renderRef.current.scale
      const objW = objectSizePx * s
      const objH = 44 * s
      const z = snapZoneRef.current
      const intersects =
        next.x < z.x2 &&
        next.x + objW > z.x1 &&
        next.y < z.y2 &&
        next.y + objH > z.y1
      if (intersects) {
        setObjectSnapped(true)
        const t = snapTargetRef.current
        return { x: t.x, y: t.y }
      }
      return next
    })
    if (objectSnapped) setObjectSnapped(false)
  }

  const trySnapObject = () => {
    const s = renderRef.current.scale
    const objW = objectSizePx * s
    const objH = 44 * s
    const z = snapZoneRef.current
    const intersects =
      objectPos.x < z.x2 &&
      objectPos.x + objW > z.x1 &&
      objectPos.y < z.y2 &&
      objectPos.y + objH > z.y1
    if (intersects) {
      setObjectSnapped(true)
      const t = snapTargetRef.current
      setObjectPos({ x: t.x, y: t.y })
      // When object is placed between jaws, reading should correspond to object thickness.
      if (correctedReading < objectWidthMm) {
        onDiameterChange(objectWidthMm)
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const onWheelNative = (ev: globalThis.WheelEvent) => {
      ev.preventDefault()
      const direction = ev.deltaY > 0 ? 1 : -1
      const next = Math.min(
        MAX_MM,
        Math.max(MIN_MM, wheelCacheRef.current.correctedReading + direction * LEAST_COUNT),
      )
      onDiameterChange(Number(next.toFixed(3)))
    }
    canvas.addEventListener("wheel", onWheelNative, { passive: false })
    return () => canvas.removeEventListener("wheel", onWheelNative)
  }, [onDiameterChange])

  const handleKeyDown = (e: KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      rotateByDivisions(-1)
      e.preventDefault()
    }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      rotateByDivisions(1)
      e.preventDefault()
    }
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Gauge className="w-5 h-5 text-primary" />
        <div className="text-sm">
          <div className="font-semibold">Screw Gauge (Real Assets)</div>
          <div className="text-muted-foreground text-xs">Pitch = 0.5 mm | LC = 0.01 mm</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Object: {diameterMm.toFixed(2)} mm</Badge>
        <Badge variant="outline">Zero error: {zeroErrorMm.toFixed(3)} mm</Badge>
        <Badge>{reading.toFixed(3)} mm</Badge>
      </div>

      <div className="relative rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-[380px]"
          tabIndex={0}
          onPointerMove={(e) => draggingThimble && updateDiameterByDrag(e.clientX, e.clientY)}
          onPointerDown={(e) => {
            if (isInObject(e.clientX, e.clientY)) {
              setDraggingObject(true)
              setObjectSnapped(false)
              dragRef.current = { x: e.clientX, y: e.clientY }
              return
            }
            if (!isInThimbleZone(e.clientX, e.clientY)) return
            setDraggingThimble(true)
            dragRef.current = { x: e.clientX, y: e.clientY }
          }}
          onPointerUp={() => {
            setDraggingThimble(false)
            if (draggingObject) {
              setDraggingObject(false)
              trySnapObject()
            }
            dragRef.current = null
          }}
          onPointerLeave={() => {
            setDraggingThimble(false)
            if (draggingObject) {
              setDraggingObject(false)
              trySnapObject()
            }
            dragRef.current = null
          }}
          onPointerMoveCapture={(e) => draggingObject && updateObjectDrag(e.clientX, e.clientY)}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute left-6 top-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Hand className="w-3 h-3" />
          Drag the thimble up/down, use wheel, or arrow keys to rotate.
        </div>
      </div>
    </div>
  )
}

"use client"

import type { PointerEvent as ReactPointerEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw } from "lucide-react"

type Props = {
  incidentAngleDeg: number
  refractiveIndex: number
  slabThicknessCm: number
}

type Pt = { x: number; y: number }
type Trial = { i: number; r: number; e: number; lateral: number; nCalc: number }
type PinKey = "i1" | "i2" | "e1" | "e2"
type DrawMode = "none" | "outline" | "normal" | "incident" | "emergent"
type ViewSide = "incident" | "opposite"
type DrawnLine = { a: Pt; b: Pt; kind: DrawMode }

const W = 900
const H = 420
const BOARD_X = 70
const BOARD_Y = 30
const BOARD_W = 760
const BOARD_H = 340
const CM_TO_PX = 40

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}
function degToRad(d: number) {
  return (d * Math.PI) / 180
}
function radToDeg(r: number) {
  return (r * 180) / Math.PI
}
function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}
function lineAngleFromVertical(a: Pt, b: Pt) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  return Math.abs(radToDeg(Math.atan2(Math.abs(dx), Math.abs(dy))))
}

export function GlassSlabSim({ incidentAngleDeg, refractiveIndex, slabThicknessCm }: Props) {
  const slabW = Math.max(160, slabThicknessCm * CM_TO_PX * 1.9)
  const slabH = 120

  const targetSlab = useMemo(() => ({ x: BOARD_X + 210, y: BOARD_Y + 80, w: slabW, h: slabH }), [slabW])

  const [step, setStep] = useState(0)
  const [slabPlaced, setSlabPlaced] = useState(false)
  const [slabPos, setSlabPos] = useState({ x: 18, y: 60 })
  const [pinsPlaced, setPinsPlaced] = useState<{ [K in PinKey]: boolean }>({ i1: false, i2: false, e1: false, e2: false })
  const [pins, setPins] = useState<Record<PinKey, Pt>>({
    i1: { x: 0, y: 0 }, i2: { x: 0, y: 0 }, e1: { x: 0, y: 0 }, e2: { x: 0, y: 0 },
  })
  const [drag, setDrag] = useState<{ type: "slab" | "pin"; key?: PinKey } | null>(null)
  const [trials, setTrials] = useState<Trial[]>([])
  const autoMode = true
  const [viewSide, setViewSide] = useState<ViewSide>("incident")
  const [drawMode, setDrawMode] = useState<DrawMode>("none")
  const [drawStart, setDrawStart] = useState<Pt | null>(null)
  const [drawnLines, setDrawnLines] = useState<DrawnLine[]>([])
  const svgRef = useRef<SVGSVGElement | null>(null)

  const calc = useMemo(() => {
    const i = degToRad(clamp(incidentAngleDeg, 5, 80))
    const r = Math.asin(clamp(Math.sin(i) / refractiveIndex, -1, 1))
    const e = i
    const t = slabThicknessCm
    const lateral = t * Math.sin(i - r) / Math.cos(r)
    return {
      iDeg: radToDeg(i),
      rDeg: radToDeg(r),
      eDeg: radToDeg(e),
      lateralCm: lateral,
      nCalc: Math.sin(i) / Math.sin(r || 1e-9),
    }
  }, [incidentAngleDeg, refractiveIndex, slabThicknessCm])

  const slabRect = slabPlaced ? { ...targetSlab } : { x: slabPos.x, y: slabPos.y, w: slabW, h: slabH }

  const entry = useMemo<Pt>(() => ({ x: slabRect.x + slabRect.w * 0.28, y: slabRect.y }), [slabRect.x, slabRect.y, slabRect.w])
  const exit = useMemo<Pt>(() => ({ x: slabRect.x + slabRect.w * 0.42, y: slabRect.y + slabRect.h }), [slabRect.x, slabRect.y, slabRect.w, slabRect.h])

  const idealIncidentPins = useMemo(() => {
    const a = degToRad(calc.iDeg)
    const dx = Math.sin(a)
    const dy = Math.cos(a)
    return {
      // Pins should lie on the incident ray outside the slab (above top surface)
      p1: { x: entry.x - dx * 70, y: entry.y - dy * 70 },
      p2: { x: entry.x - dx * 130, y: entry.y - dy * 130 },
    }
  }, [entry.x, entry.y, calc.iDeg])

  const idealEmergentPins = useMemo(() => {
    const a = degToRad(calc.eDeg)
    const dx = Math.sin(a)
    const dy = Math.cos(a)
    // Image pins should be placed on emergent ray outside the slab (below bottom surface),
    // aligned in opposite-side viewing with lateral shift visible.
    return {
      p1: { x: exit.x + dx * 78, y: exit.y + dy * 78 },
      p2: { x: exit.x + dx * 142, y: exit.y + dy * 142 },
    }
  }, [exit.x, exit.y, calc.eDeg])

  const placedCount = Object.values(pinsPlaced).filter(Boolean).length
  useEffect(() => {
    if (slabPlaced && !pinsPlaced.i1 && step < 1) setStep(1)
    if (slabPlaced && placedCount >= 2 && step < 2) setStep(2)
    if (slabPlaced && placedCount >= 4 && step < 3) setStep(3)
  }, [slabPlaced, pinsPlaced.i1, placedCount, step])

  const derived = useMemo(() => {
    const haveI = pinsPlaced.i1 && pinsPlaced.i2
    const haveE = pinsPlaced.e1 && pinsPlaced.e2
    const iUser = haveI ? lineAngleFromVertical(pins.i2, pins.i1) : null
    const eUser = haveE ? lineAngleFromVertical(pins.e2, pins.e1) : null
    let lateralUser: number | null = null
    if (haveI && haveE) {
      const xi = (pins.i1.x + pins.i2.x) / 2
      const xe = (pins.e1.x + pins.e2.x) / 2
      lateralUser = Math.abs(xe - xi) / CM_TO_PX
    }
    return { iUser, eUser, lateralUser }
  }, [pinsPlaced, pins])

  function getSvgPoint(clientX: number, clientY: number): Pt | null {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function handlePointerDown(e: ReactPointerEvent<SVGSVGElement>) {
    if (autoMode) return
    const p = getSvgPoint(e.clientX, e.clientY)
    if (!p) return

    if (drawMode !== "none" && slabPlaced) {
      const inBoard = p.x >= BOARD_X && p.x <= BOARD_X + BOARD_W && p.y >= BOARD_Y && p.y <= BOARD_Y + BOARD_H
      if (inBoard) {
        if (!drawStart) setDrawStart(p)
        else {
          setDrawnLines((prev) => [...prev, { a: drawStart, b: p, kind: drawMode }].slice(-24))
          setDrawStart(null)
        }
        return
      }
    }

    if (!slabPlaced && p.x >= slabRect.x && p.x <= slabRect.x + slabRect.w && p.y >= slabRect.y && p.y <= slabRect.y + slabRect.h) {
      setDrag({ type: "slab" })
      return
    }

    for (const key of ["i1", "i2", "e1", "e2"] as PinKey[]) {
      if (pinsPlaced[key] && dist(p, pins[key]) <= 14) {
        setDrag({ type: "pin", key })
        return
      }
    }

    if (!slabPlaced || drawMode !== "none") return

    const inBoard = p.x >= BOARD_X && p.x <= BOARD_X + BOARD_W && p.y >= BOARD_Y && p.y <= BOARD_Y + BOARD_H
    if (!inBoard) return
    const leftZone = p.x < slabRect.x - 10
    const rightZone = p.x > slabRect.x + slabRect.w + 10

    if (leftZone && !pinsPlaced.i1) { setPins((s) => ({ ...s, i1: p })); setPinsPlaced((s) => ({ ...s, i1: true })); return }
    if (leftZone && pinsPlaced.i1 && !pinsPlaced.i2) { setPins((s) => ({ ...s, i2: p })); setPinsPlaced((s) => ({ ...s, i2: true })); return }
    if (rightZone && !pinsPlaced.e1) { setPins((s) => ({ ...s, e1: p })); setPinsPlaced((s) => ({ ...s, e1: true })); return }
    if (rightZone && pinsPlaced.e1 && !pinsPlaced.e2) { setPins((s) => ({ ...s, e2: p })); setPinsPlaced((s) => ({ ...s, e2: true })); return }
  }

  function handlePointerMove(e: ReactPointerEvent<SVGSVGElement>) {
    if (autoMode) return
    if (!drag) return
    const p = getSvgPoint(e.clientX, e.clientY)
    if (!p) return

    if (drag.type === "slab") {
      setSlabPos({ x: clamp(p.x - slabW / 2, 0, W - slabW), y: clamp(p.y - slabH / 2, 0, H - slabH) })
      const insideTarget = p.x >= targetSlab.x && p.x <= targetSlab.x + targetSlab.w && p.y >= targetSlab.y && p.y <= targetSlab.y + targetSlab.h
      if (insideTarget) {
        setSlabPlaced(true)
        setSlabPos({ x: targetSlab.x, y: targetSlab.y })
      }
      return
    }

    if (drag.type === "pin" && drag.key) {
      const pinKey: PinKey = drag.key
      setPins((s) => ({
        ...s,
        [pinKey]: { x: clamp(p.x, BOARD_X, BOARD_X + BOARD_W), y: clamp(p.y, BOARD_Y, BOARD_Y + BOARD_H) },
      }))
    }
  }

  function handlePointerUp() { setDrag(null) }

  const lineI = pinsPlaced.i1 && pinsPlaced.i2 ? [pins.i1, pins.i2] : null
  const lineE = pinsPlaced.e1 && pinsPlaced.e2 ? [pins.e1, pins.e2] : null
  const meanN = useMemo(() => (trials.length ? trials.reduce((a, t) => a + t.nCalc, 0) / trials.length : null), [trials])

  function resetAll() {
    setStep(0)
    setSlabPlaced(false)
    setSlabPos({ x: 18, y: 60 })
    setPinsPlaced({ i1: false, i2: false, e1: false, e2: false })
    setPins({ i1: { x: 0, y: 0 }, i2: { x: 0, y: 0 }, e1: { x: 0, y: 0 }, e2: { x: 0, y: 0 } })
    setDrag(null)
    setDrawMode("none")
    setDrawStart(null)
    setDrawnLines([])
    setViewSide("incident")
  }

  function autoPlaceSlab() {
    setSlabPlaced(true)
    setSlabPos({ x: targetSlab.x, y: targetSlab.y })
    setStep((s) => Math.max(s, 1))
  }

  function autoPlaceIncidentPins() {
    if (!slabPlaced) autoPlaceSlab()
    setPins((s) => ({ ...s, i1: idealIncidentPins.p1, i2: idealIncidentPins.p2 }))
    setPinsPlaced((s) => ({ ...s, i1: true, i2: true }))
    setStep((s) => Math.max(s, 2))
    setViewSide("incident")
  }

  function autoPlaceEmergentPins() {
    if (!(pinsPlaced.i1 && pinsPlaced.i2)) autoPlaceIncidentPins()
    setPins((s) => ({ ...s, e1: idealEmergentPins.p1, e2: idealEmergentPins.p2 }))
    setPinsPlaced((s) => ({ ...s, e1: true, e2: true }))
    setStep((s) => Math.max(s, 3))
    setViewSide("opposite")
  }

  function autoDrawConstruction() {
    if (!(pinsPlaced.e1 && pinsPlaced.e2)) autoPlaceEmergentPins()
    setDrawnLines([
      { a: { x: targetSlab.x, y: targetSlab.y }, b: { x: targetSlab.x + targetSlab.w, y: targetSlab.y }, kind: "outline" },
      { a: { x: targetSlab.x + targetSlab.w, y: targetSlab.y }, b: { x: targetSlab.x + targetSlab.w, y: targetSlab.y + targetSlab.h }, kind: "outline" },
      { a: { x: targetSlab.x + targetSlab.w, y: targetSlab.y + targetSlab.h }, b: { x: targetSlab.x, y: targetSlab.y + targetSlab.h }, kind: "outline" },
      { a: { x: targetSlab.x, y: targetSlab.y + targetSlab.h }, b: { x: targetSlab.x, y: targetSlab.y }, kind: "outline" },
      { a: { x: entry.x, y: targetSlab.y - 65 }, b: { x: entry.x, y: targetSlab.y + 65 }, kind: "normal" },
      { a: idealIncidentPins.p2, b: entry, kind: "incident" },
      { a: exit, b: idealEmergentPins.p2, kind: "emergent" },
    ])
    setDrawMode("none")
    setDrawStart(null)
  }

  const nextStepLabel = !slabPlaced
    ? "Step 1: Place Slab"
    : !(pinsPlaced.i1 && pinsPlaced.i2)
      ? "Step 2: Place Object Pins"
      : !(pinsPlaced.e1 && pinsPlaced.e2)
        ? "Step 3: Place Image Pins"
        : drawnLines.length === 0
          ? "Step 4: Draw Lines/Angles"
          : "Record Trial"

  function runNextGuidedStep() {
    if (!slabPlaced) return autoPlaceSlab()
    if (!(pinsPlaced.i1 && pinsPlaced.i2)) return autoPlaceIncidentPins()
    if (!(pinsPlaced.e1 && pinsPlaced.e2)) return autoPlaceEmergentPins()
    if (drawnLines.length === 0) return autoDrawConstruction()
    setTrials((prev) => [...prev, {
      i: Number((derived.iUser ?? calc.iDeg).toFixed(1)),
      r: Number(calc.rDeg.toFixed(1)),
      e: Number((derived.eUser ?? calc.eDeg).toFixed(1)),
      lateral: Number((derived.lateralUser ?? calc.lateralCm).toFixed(2)),
      nCalc: Number(calc.nCalc.toFixed(3)),
    }].slice(-8))
    setStep(4)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Incident angle set: {incidentAngleDeg.toFixed(0)}°</Badge>
        <Badge variant="outline">n (glass): {refractiveIndex.toFixed(2)}</Badge>
        <Badge variant="outline">Thickness: {slabThicknessCm.toFixed(1)} cm</Badge>
        <Badge>{slabPlaced ? "Slab placed" : "Place slab"}</Badge>
        <Badge variant="secondary">View: {viewSide === "incident" ? "Incident side" : "Opposite side"}</Badge>
        <Badge variant="secondary">System-assisted mode</Badge>
      </div>

      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 text-sm text-cyan-100">
        {`Guided mode: Click only "${nextStepLabel}". The system will do the placements/construction automatically and you only observe readings.`}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Measured i</div><div className="text-lg font-semibold">{derived.iUser !== null ? `${derived.iUser.toFixed(1)}°` : "--"}</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Expected r</div><div className="text-lg font-semibold">{calc.rDeg.toFixed(1)}°</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Measured e</div><div className="text-lg font-semibold">{derived.eUser !== null ? `${derived.eUser.toFixed(1)}°` : "--"}</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Lateral shift (user)</div><div className="text-lg font-semibold">{derived.lateralUser !== null ? `${derived.lateralUser.toFixed(2)} cm` : "--"}</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Theory lateral shift</div><div className="text-lg font-semibold">{calc.lateralCm.toFixed(2)} cm</div></div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={runNextGuidedStep} className="gap-2">
          <CheckCircle className="w-4 h-4" />
          {nextStepLabel}
        </Button>
        <Button variant={viewSide === "incident" ? "default" : "outline"} onClick={() => setViewSide("incident")}>Incident-side view</Button>
        <Button variant={viewSide === "opposite" ? "default" : "outline"} onClick={() => setViewSide("opposite")}>Opposite-side view</Button>
        <Button variant="outline" onClick={resetAll} className="gap-2"><RotateCcw className="w-4 h-4" />Reset Construction</Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-[430px] touch-none select-none bg-[#020817]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2937" strokeWidth="1" /></pattern>
          </defs>

          <rect x={BOARD_X} y={BOARD_Y} width={BOARD_W} height={BOARD_H} rx={14} fill={viewSide === "incident" ? "#030f24" : "#061223"} stroke="#1f3b55" />
          <rect x={BOARD_X} y={BOARD_Y} width={BOARD_W} height={BOARD_H} fill="url(#grid)" opacity="0.6" />
          <text x={BOARD_X + 10} y={BOARD_Y - 6} fill="#cbd5e1" fontSize="12">Paper board (live scale: 1 cm ≈ {CM_TO_PX}px)</text>
          <text x={BOARD_X + 10} y={BOARD_Y + 18} fill="#cbd5e1" fontSize="13">
            System-assisted practical: use step buttons to place slab, pins, and draw construction automatically.
          </text>

          <g opacity="0.9">
            <line x1={BOARD_X} y1={BOARD_Y + BOARD_H + 18} x2={BOARD_X + BOARD_W} y2={BOARD_Y + BOARD_H + 18} stroke="#94a3b8" />
            {Array.from({ length: Math.floor(BOARD_W / CM_TO_PX) + 1 }).map((_, k) => (
              <g key={`rx-${k}`}>
                <line x1={BOARD_X + k * CM_TO_PX} y1={BOARD_Y + BOARD_H + 12} x2={BOARD_X + k * CM_TO_PX} y2={BOARD_Y + BOARD_H + 22} stroke="#94a3b8" />
                <text x={BOARD_X + k * CM_TO_PX + 2} y={BOARD_Y + BOARD_H + 34} fill="#94a3b8" fontSize="10">{k}</text>
              </g>
            ))}
          </g>

          {!slabPlaced && <rect x={targetSlab.x} y={targetSlab.y} width={targetSlab.w} height={targetSlab.h} rx={10} fill="none" stroke="#22d3ee" strokeDasharray="8 6" opacity="0.85" />}

          <g opacity={viewSide === "opposite" ? 0.85 : 1}>
            <rect x={slabRect.x} y={slabRect.y} width={slabRect.w} height={slabRect.h} rx={10} fill="#67e8f955" stroke="#67e8f9" />
            <rect x={slabRect.x + 8} y={slabRect.y + 8} width={slabRect.w - 16} height={slabRect.h - 16} rx={8} fill="#bae6fd22" stroke="#cffafe66" />
            <text x={slabRect.x + 12} y={slabRect.y + 24} fill="#d1fae5" fontSize="12">Glass slab ({slabThicknessCm.toFixed(1)} cm thickness set)</text>
          </g>

          {slabPlaced && <rect x={slabRect.x} y={slabRect.y} width={slabRect.w} height={slabRect.h} rx={10} fill="none" stroke="#f8fafc" strokeDasharray="3 4" opacity="0.7" />}

          {slabPlaced && (
            <>
              <line x1={entry.x} y1={slabRect.y - 70} x2={entry.x} y2={slabRect.y + 70} stroke="#94a3b8" strokeDasharray="4 4" />
              <line x1={exit.x} y1={slabRect.y + slabRect.h - 70} x2={exit.x} y2={slabRect.y + slabRect.h + 70} stroke="#94a3b8" strokeDasharray="4 4" />
              <text x={entry.x + 6} y={slabRect.y - 8} fill="#94a3b8" fontSize="11">Normal</text>
              <text x={exit.x + 6} y={slabRect.y + slabRect.h + 14} fill="#94a3b8" fontSize="11">Normal</text>
            </>
          )}

          {slabPlaced && (
            <g opacity="0.9">
              <path d={`M ${entry.x - 54} ${entry.y} A 54 54 0 0 1 ${entry.x + 54} ${entry.y}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              {Array.from({ length: 17 }).map((_, k) => {
                const deg = k * 5
                const a = degToRad(deg)
                const x1 = entry.x + Math.sin(a) * 46
                const y1 = entry.y - Math.cos(a) * 46
                const x2 = entry.x + Math.sin(a) * (deg % 10 === 0 ? 55 : 51)
                const y2 = entry.y - Math.cos(a) * (deg % 10 === 0 ? 55 : 51)
                return (
                  <g key={`pro-${deg}`}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="1" />
                    {deg % 10 === 0 && <text x={entry.x + Math.sin(a) * 64 - 6} y={entry.y - Math.cos(a) * 64 + 4} fill="#cbd5e1" fontSize="9">{deg}</text>}
                  </g>
                )
              })}
              <text x={entry.x - 18} y={entry.y + 16} fill="#cbd5e1" fontSize="10">Protractor</text>
            </g>
          )}

          {/* Emergence angle marker with normal at exit */}
          {slabPlaced && (
            <g opacity="0.9">
              <path
                d={`M ${exit.x - 46} ${exit.y} A 46 46 0 0 0 ${exit.x + 46} ${exit.y}`}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.2"
              />
              <path
                d={`M ${exit.x} ${exit.y} L ${exit.x + Math.sin(degToRad(calc.eDeg)) * 34} ${exit.y + Math.cos(degToRad(calc.eDeg)) * 34}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
              />
              <path
                d={`M ${exit.x} ${exit.y - 24} A 24 24 0 0 1 ${exit.x + Math.sin(degToRad(calc.eDeg)) * 24} ${exit.y + Math.cos(degToRad(calc.eDeg)) * 24}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />
              <text x={exit.x + 12} y={exit.y + 18} fill="#67e8f9" fontSize="11">
                e = {calc.eDeg.toFixed(1)}°
              </text>
            </g>
          )}

          {slabPlaced && <line x1={idealIncidentPins.p2.x} y1={idealIncidentPins.p2.y} x2={entry.x} y2={entry.y} stroke="#f59e0b" strokeDasharray="5 5" opacity="0.35" />}

          {(["i1", "i2", "e1", "e2"] as PinKey[]).map((key) => {
            if (!pinsPlaced[key]) return null
            const p = pins[key]
            const color = key.startsWith("i") ? "#f59e0b" : "#22d3ee"
            const hiddenByView = (viewSide === "incident" && key.startsWith("e")) || (viewSide === "opposite" && key.startsWith("i"))
            return (
              <g key={key} opacity={hiddenByView ? 0.3 : 1}>
                <line x1={p.x} y1={p.y - 16} x2={p.x} y2={p.y + 16} stroke={color} strokeWidth="2" />
                <circle cx={p.x} cy={p.y} r="6" fill={color} stroke="#fff" />
                <text x={p.x + 8} y={p.y - 8} fill={color} fontSize="12">{key.toUpperCase()}</text>
              </g>
            )
          })}

          {lineI && <line x1={lineI[0].x} y1={lineI[0].y} x2={lineI[1].x} y2={lineI[1].y} stroke="#f59e0b" strokeWidth="2.5" opacity={viewSide === "incident" ? 1 : 0.35} />}
          {lineE && <line x1={lineE[0].x} y1={lineE[0].y} x2={lineE[1].x} y2={lineE[1].y} stroke="#22d3ee" strokeWidth="2.5" opacity={viewSide === "opposite" ? 1 : 0.35} />}

          {slabPlaced && (
            <>
              <line x1={entry.x} y1={entry.y} x2={exit.x} y2={exit.y} stroke="#38bdf8" strokeWidth="2.5" opacity="0.65" />
              <line x1={exit.x} y1={exit.y} x2={idealEmergentPins.p2.x} y2={idealEmergentPins.p2.y} stroke="#38bdf8" strokeDasharray="4 5" opacity="0.45" />
            </>
          )}

          {drawnLines.map((l, idx) => {
            const color = l.kind === "normal" ? "#e2e8f0" : l.kind === "incident" ? "#f59e0b" : l.kind === "emergent" ? "#22d3ee" : "#a78bfa"
            return <line key={`dl-${idx}`} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} stroke={color} strokeWidth={l.kind === "normal" ? 1.8 : 2.2} strokeDasharray={l.kind === "outline" ? "4 4" : undefined} opacity="0.9" />
          })}
          {drawStart && <circle cx={drawStart.x} cy={drawStart.y} r="4" fill="#f8fafc" stroke="#0ea5e9" />}

          {pinsPlaced.i1 && pinsPlaced.i2 && <text x={BOARD_X + 10} y={BOARD_Y + BOARD_H - 12} fill="#fbbf24" fontSize="12">Incident pin spacing: {(dist(pins.i1, pins.i2) / CM_TO_PX).toFixed(2)} cm</text>}
          {pinsPlaced.e1 && pinsPlaced.e2 && <text x={BOARD_X + 260} y={BOARD_Y + BOARD_H - 12} fill="#67e8f9" fontSize="12">Emergent pin spacing: {(dist(pins.e1, pins.e2) / CM_TO_PX).toFixed(2)} cm</text>}
        </svg>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-2 text-sm">
        <div className="font-semibold">Student Guidance (Practical Method)</div>
        <ol className="list-decimal ml-5 space-y-1 text-muted-foreground">
          <li>Place the glass slab on the sheet and trace its outline.</li>
          <li>Draw a normal and choose angle of incidence from Parameters.</li>
          <li>Place two object pins on the incident ray line.</li>
          <li>Switch to opposite-side view and align/place two image pins to trace the emergent ray.</li>
          <li>Join points, measure i and e. Observe that angle of emergence is nearly equal to angle of incidence.</li>
          <li>Measure lateral shift and record readings.</li>
        </ol>
        <div className="rounded-lg border border-border/50 bg-background/30 p-3 text-xs text-muted-foreground">
          Tip: Use drawing buttons to manually construct the outline/normal/rays. Use the protractor overlay at the point of incidence to estimate angles like the real practical.
        </div>
        <div className="text-xs text-muted-foreground">
          In a rectangular glass slab, the emergent ray is parallel to the incident ray, so angle of emergence <span className="text-foreground font-medium">e ≈ i</span>.
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="font-semibold mb-2">Observation Table (Glass Slab)</div>
        {trials.length === 0 ? (
          <div className="text-sm text-muted-foreground">Place slab and pins, then record a trial. Vary incident angle for repeat observations.</div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-5 gap-2 text-muted-foreground"><div>i (°)</div><div>r (°)</div><div>e (°)</div><div>Lateral shift (cm)</div><div>n = sin i / sin r</div></div>
            {trials.map((t, idx) => (
              <div key={idx} className="grid grid-cols-5 gap-2 border-t border-border/40 pt-2"><div>{t.i.toFixed(1)}</div><div>{t.r.toFixed(1)}</div><div>{t.e.toFixed(1)}</div><div>{t.lateral.toFixed(2)}</div><div>{t.nCalc.toFixed(3)}</div></div>
            ))}
            <div className="border-t border-border/40 pt-2 text-muted-foreground">Mean refractive index approx <span className="font-semibold text-foreground">{meanN?.toFixed(3) ?? "--"}</span></div>
          </div>
        )}
      </div>
    </div>
  )
}

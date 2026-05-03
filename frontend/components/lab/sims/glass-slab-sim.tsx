"use client"

import type { PointerEvent as ReactPointerEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, Ruler, Lightbulb, Eye } from "lucide-react"

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
          className="w-full h-[430px] touch-none select-none bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
            
            {/* Glass gradient */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.12" />
            </linearGradient>
            
            {/* Glass shine */}
            <linearGradient id="glassShine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
            </linearGradient>
            
            {/* Laser beam gradient */}
            <linearGradient id="laserRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f87171" stopOpacity="1" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Soft glow */}
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Lab table surface */}
          <rect x={BOARD_X - 20} y={BOARD_Y - 20} width={BOARD_W + 40} height={BOARD_H + 60} rx={20} fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
          <rect x={BOARD_X} y={BOARD_Y} width={BOARD_W} height={BOARD_H} rx={14} fill={viewSide === "incident" ? "#020617" : "#0a0f1c"} stroke="#334155" strokeWidth="1.5" />
          <rect x={BOARD_X} y={BOARD_Y} width={BOARD_W} height={BOARD_H} fill="url(#grid)" opacity="0.4" />
          
          {/* Board label */}
          <text x={BOARD_X + 10} y={BOARD_Y - 6} fill="#94a3b8" fontSize="11" fontWeight="500">OPTICAL BENCH • Scale: 1 cm = {CM_TO_PX}px</text>
          
          {/* Ruler markings */}
          <g opacity="0.8">
            <line x1={BOARD_X} y1={BOARD_Y + BOARD_H + 15} x2={BOARD_X + BOARD_W} y2={BOARD_Y + BOARD_H + 15} stroke="#475569" strokeWidth="2" />
            {Array.from({ length: Math.floor(BOARD_W / CM_TO_PX) + 1 }).map((_, k) => (
              <g key={`rx-${k}`}>
                <line 
                  x1={BOARD_X + k * CM_TO_PX} 
                  y1={BOARD_Y + BOARD_H + 10} 
                  x2={BOARD_X + k * CM_TO_PX} 
                  y2={BOARD_Y + BOARD_H + 22} 
                  stroke="#64748b" 
                  strokeWidth={k % 5 === 0 ? 2 : 1}
                />
                {k % 5 === 0 && (
                  <text x={BOARD_X + k * CM_TO_PX + 2} y={BOARD_Y + BOARD_H + 36} fill="#94a3b8" fontSize="10" fontWeight="500">{k}</text>
                )}
              </g>
            ))}
          </g>

          {/* Target placement zone */}
          {!slabPlaced && (
            <g>
              <rect x={targetSlab.x} y={targetSlab.y} width={targetSlab.w} height={targetSlab.h} rx={10} fill="none" stroke="#22d3ee" strokeDasharray="8 6" strokeWidth="2" opacity="0.7" />
              <text x={targetSlab.x + targetSlab.w/2} y={targetSlab.y - 15} textAnchor="middle" fill="#22d3ee" fontSize="12" opacity="0.8">Drop slab here</text>
            </g>
          )}

          {/* Glass slab with realistic effects */}
          <g opacity={viewSide === "opposite" ? 0.85 : 1}>
            {/* Main glass body */}
            <rect x={slabRect.x} y={slabRect.y} width={slabRect.w} height={slabRect.h} rx={10} fill="url(#glassGrad)" stroke="#22d3ee" strokeWidth="2" />
            
            {/* Inner highlight */}
            <rect x={slabRect.x + 4} y={slabRect.y + 4} width={slabRect.w - 8} height={slabRect.h - 8} rx={8} fill="none" stroke="#67e8f9" strokeWidth="1" opacity="0.5" />
            
            {/* Shine effect */}
            <rect x={slabRect.x + 8} y={slabRect.y + 8} width={slabRect.w - 16} height={slabRect.h/2 - 8} rx={6} fill="url(#glassShine)" opacity="0.6" />
            
            {/* Glass label */}
            <text x={slabRect.x + slabRect.w/2} y={slabRect.y + slabRect.h/2 + 5} textAnchor="middle" fill="#a5f3fc" fontSize="14" fontWeight="600" opacity="0.9">GLASS SLAB</text>
            <text x={slabRect.x + slabRect.w/2} y={slabRect.y + slabRect.h/2 + 22} textAnchor="middle" fill="#67e8f9" fontSize="11" opacity="0.7">n = {refractiveIndex.toFixed(2)} • {slabThicknessCm.toFixed(1)} cm</text>
            
            {/* Corner highlights */}
            <circle cx={slabRect.x + 15} cy={slabRect.y + 15} r="4" fill="#ffffff" opacity="0.4" />
            <circle cx={slabRect.x + slabRect.w - 20} cy={slabRect.y + 20} r="2" fill="#ffffff" opacity="0.3" />
          </g>

          {slabPlaced && (
            <>
              {/* Normal lines with glow */}
              <line x1={entry.x} y1={slabRect.y - 70} x2={entry.x} y2={slabRect.y + 70} stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
              <line x1={exit.x} y1={slabRect.y + slabRect.h - 70} x2={exit.x} y2={slabRect.y + slabRect.h + 70} stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
              
              {/* Normal labels */}
              <text x={entry.x + 8} y={slabRect.y - 12} fill="#94a3b8" fontSize="10" fontWeight="500">NORMAL</text>
              <text x={exit.x + 8} y={slabRect.y + slabRect.h + 20} fill="#94a3b8" fontSize="10" fontWeight="500">NORMAL</text>
              
              {/* Entry/exit point markers */}
              <circle cx={entry.x} cy={entry.y} r="5" fill="#22d3ee" opacity="0.6" />
              <circle cx={exit.x} cy={exit.y} r="5" fill="#22d3ee" opacity="0.6" />
            </>
          )}

          {slabPlaced && (
            <g opacity="0.95">
              {/* Protractor base arc */}
              <path d={`M ${entry.x - 60} ${entry.y} A 60 60 0 0 1 ${entry.x + 60} ${entry.y}`} fill="#0f172a" stroke="#475569" strokeWidth="2" opacity="0.8" />
              <path d={`M ${entry.x - 60} ${entry.y} A 60 60 0 0 1 ${entry.x + 60} ${entry.y}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              
              {/* Angle markings */}
              {Array.from({ length: 19 }).map((_, k) => {
                const deg = k * 5
                const a = degToRad(deg)
                const isMajor = deg % 10 === 0
                const r1 = isMajor ? 48 : 52
                const r2 = isMajor ? 60 : 56
                const x1 = entry.x + Math.sin(a) * r1
                const y1 = entry.y - Math.cos(a) * r1
                const x2 = entry.x + Math.sin(a) * r2
                const y2 = entry.y - Math.cos(a) * r2
                return (
                  <g key={`pro-${deg}`}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isMajor ? "#e2e8f0" : "#94a3b8"} strokeWidth={isMajor ? 2 : 1} />
                    {isMajor && (
                      <text x={entry.x + Math.sin(a) * 70 - 6} y={entry.y - Math.cos(a) * 70 + 4} fill="#e2e8f0" fontSize="10" fontWeight="500">{deg}°</text>
                    )}
                  </g>
                )
              })}
              
              {/* Center point */}
              <circle cx={entry.x} cy={entry.y} r="4" fill="#22d3ee" />
              
              {/* Protractor label */}
              <text x={entry.x} y={entry.y + 25} textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="500">PROTRACTOR</text>
            </g>
          )}

          {/* Emergence angle measurement */}
          {slabPlaced && (
            <g opacity="0.95">
              {/* Protractor arc at exit */}
              <path d={`M ${exit.x - 50} ${exit.y} A 50 50 0 0 0 ${exit.x + 50} ${exit.y}`} fill="#0f172a" stroke="#475569" strokeWidth="1.5" opacity="0.6" />
              <path d={`M ${exit.x - 50} ${exit.y} A 50 50 0 0 0 ${exit.x + 50} ${exit.y}`} fill="none" stroke="#64748b" strokeWidth="1" />
              
              {/* Emergent ray indicator */}
              <path
                d={`M ${exit.x} ${exit.y} L ${exit.x + Math.sin(degToRad(calc.eDeg)) * 40} ${exit.y + Math.cos(degToRad(calc.eDeg)) * 40}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
                filter="url(#softGlow)"
              />
              
              {/* Angle arc */}
              <path
                d={`M ${exit.x} ${exit.y + 28} A 28 28 0 0 1 ${exit.x + Math.sin(degToRad(calc.eDeg)) * 28} ${exit.y + Math.cos(degToRad(calc.eDeg)) * 28}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              
              {/* Angle label */}
              <text x={exit.x + 35} y={exit.y + 25} fill="#22d3ee" fontSize="12" fontWeight="600">
                e = {calc.eDeg.toFixed(1)}°
              </text>
            </g>
          )}

          {/* Ideal ray path (faint guide) */}
          {slabPlaced && (
            <g opacity="0.25">
              <line x1={idealIncidentPins.p2.x} y1={idealIncidentPins.p2.y} x2={entry.x} y2={entry.y} stroke="#f59e0b" strokeDasharray="8 6" strokeWidth="1.5" />
              <line x1={exit.x} y1={exit.y} x2={idealEmergentPins.p2.x} y2={idealEmergentPins.p2.y} stroke="#22d3ee" strokeDasharray="8 6" strokeWidth="1.5" />
            </g>
          )}

          {/* Pins with metallic appearance */}
          {(["i1", "i2", "e1", "e2"] as PinKey[]).map((key) => {
            if (!pinsPlaced[key]) return null
            const p = pins[key]
            const isIncident = key.startsWith("i")
            const color = isIncident ? "#f59e0b" : "#22d3ee"
            const hiddenByView = (viewSide === "incident" && key.startsWith("e")) || (viewSide === "opposite" && key.startsWith("i"))
            return (
              <g key={key} opacity={hiddenByView ? 0.25 : 1}>
                {/* Pin head shadow */}
                <ellipse cx={p.x + 2} cy={p.y + 18} rx="5" ry="3" fill="#000000" opacity="0.3" />
                
                {/* Pin shaft */}
                <line x1={p.x} y1={p.y - 20} x2={p.x} y2={p.y + 20} stroke="#cbd5e1" strokeWidth="3" />
                <line x1={p.x} y1={p.y - 20} x2={p.x} y2={p.y + 20} stroke="#64748b" strokeWidth="1.5" />
                
                {/* Pin head */}
                <circle cx={p.x} cy={p.y - 20} r="8" fill={color} stroke="#fff" strokeWidth="2" filter="url(#softGlow)" />
                <circle cx={p.x} cy={p.y - 20} r="4" fill="#ffffff" opacity="0.6" />
                
                {/* Label */}
                <text x={p.x + 12} y={p.y - 24} fill={color} fontSize="13" fontWeight="600">{key.toUpperCase()}</text>
                {isIncident && <text x={p.x + 12} y={p.y - 10} fill="#94a3b8" fontSize="9">Object</text>}
                {!isIncident && <text x={p.x + 12} y={p.y - 10} fill="#94a3b8" fontSize="9">Image</text>}
              </g>
            )
          })}

          {/* Ray beams with laser-like glow */}
          {lineI && (
            <g opacity={viewSide === "incident" ? 1 : 0.3}>
              {/* Glow layer */}
              <line x1={lineI[0].x} y1={lineI[0].y} x2={lineI[1].x} y2={lineI[1].y} stroke="#f59e0b" strokeWidth="8" opacity="0.2" filter="url(#glow)" />
              {/* Main beam */}
              <line x1={lineI[0].x} y1={lineI[0].y} x2={lineI[1].x} y2={lineI[1].y} stroke="#fbbf24" strokeWidth="3" filter="url(#softGlow)" />
              {/* Core */}
              <line x1={lineI[0].x} y1={lineI[0].y} x2={lineI[1].x} y2={lineI[1].y} stroke="#fef3c7" strokeWidth="1.5" />
            </g>
          )}
          
          {lineE && (
            <g opacity={viewSide === "opposite" ? 1 : 0.3}>
              {/* Glow layer */}
              <line x1={lineE[0].x} y1={lineE[0].y} x2={lineE[1].x} y2={lineE[1].y} stroke="#22d3ee" strokeWidth="8" opacity="0.2" filter="url(#glow)" />
              {/* Main beam */}
              <line x1={lineE[0].x} y1={lineE[0].y} x2={lineE[1].x} y2={lineE[1].y} stroke="#22d3ee" strokeWidth="3" filter="url(#softGlow)" />
              {/* Core */}
              <line x1={lineE[0].x} y1={lineE[0].y} x2={lineE[1].x} y2={lineE[1].y} stroke="#cffafe" strokeWidth="1.5" />
            </g>
          )}

          {/* Refracted ray inside slab */}
          {slabPlaced && (
            <g opacity="0.7">
              <line x1={entry.x} y1={entry.y} x2={exit.x} y2={exit.y} stroke="#38bdf8" strokeWidth="4" opacity="0.3" filter="url(#glow)" />
              <line x1={entry.x} y1={entry.y} x2={exit.x} y2={exit.y} stroke="#7dd3fc" strokeWidth="2" />
              {/* Arrow indicating direction */}
              <polygon points={`${(entry.x + exit.x)/2 - 5},${(entry.y + exit.y)/2 - 5} ${(entry.x + exit.x)/2 + 5},${(entry.y + exit.y)/2} ${(entry.x + exit.x)/2 - 5},${(entry.y + exit.y)/2 + 5}`} fill="#38bdf8" opacity="0.8" />
            </g>
          )}

          {/* User drawn construction lines */}
          {drawnLines.map((l, idx) => {
            const color = l.kind === "normal" ? "#e2e8f0" : l.kind === "incident" ? "#f59e0b" : l.kind === "emergent" ? "#22d3ee" : "#a78bfa"
            const width = l.kind === "normal" ? 2 : 2.5
            return (
              <g key={`dl-${idx}`}>
                <line x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} stroke={color} strokeWidth={width + 2} opacity="0.3" filter="url(#glow)" />
                <line x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} stroke={color} strokeWidth={width} strokeDasharray={l.kind === "outline" ? "5 5" : undefined} opacity="0.9" />
              </g>
            )
          })}
          
          {/* Active drawing point */}
          {drawStart && (
            <g>
              <circle cx={drawStart.x} cy={drawStart.y} r="8" fill="#0ea5e9" opacity="0.3" filter="url(#glow)" />
              <circle cx={drawStart.x} cy={drawStart.y} r="5" fill="#f8fafc" stroke="#0ea5e9" strokeWidth="2" />
            </g>
          )}

          {/* Measurements display */}
          {pinsPlaced.i1 && pinsPlaced.i2 && (
            <g>
              <rect x={BOARD_X + 5} y={BOARD_Y + BOARD_H - 28} width={180} height="22" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" opacity="0.9" />
              <text x={BOARD_X + 95} y={BOARD_Y + BOARD_H - 12} textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="500">
                Object pins: {(dist(pins.i1, pins.i2) / CM_TO_PX).toFixed(2)} cm
              </text>
            </g>
          )}
          
          {pinsPlaced.e1 && pinsPlaced.e2 && (
            <g>
              <rect x={BOARD_X + 200} y={BOARD_Y + BOARD_H - 28} width={180} height="22" rx="4" fill="#0f172a" stroke="#22d3ee" strokeWidth="1" opacity="0.9" />
              <text x={BOARD_X + 290} y={BOARD_Y + BOARD_H - 12} textAnchor="middle" fill="#22d3ee" fontSize="11" fontWeight="500">
                Image pins: {(dist(pins.e1, pins.e2) / CM_TO_PX).toFixed(2)} cm
              </text>
            </g>
          )}
          
          {/* Lateral shift measurement */}
          {derived.lateralUser !== null && (
            <g>
              <line 
                x1={(pins.i1.x + pins.i2.x) / 2} 
                y1={slabRect.y + slabRect.h + 45} 
                x2={(pins.e1.x + pins.e2.x) / 2} 
                y2={slabRect.y + slabRect.h + 45} 
                stroke="#a855f7" 
                strokeWidth="2" 
                strokeDasharray="4 2"
                markerStart="url(#arrowL)"
                markerEnd="url(#arrowR)"
              />
              <rect 
                x={((pins.i1.x + pins.i2.x) / 2 + (pins.e1.x + pins.e2.x) / 2) / 2 - 50} 
                y={slabRect.y + slabRect.h + 50} 
                width="100" 
                height="18" 
                rx="3" 
                fill="#a855f7" 
                opacity="0.9" 
              />
              <text 
                x={((pins.i1.x + pins.i2.x) / 2 + (pins.e1.x + pins.e2.x) / 2) / 2} 
                y={slabRect.y + slabRect.h + 63} 
                textAnchor="middle" 
                fill="#ffffff" 
                fontSize="10" 
                fontWeight="600"
              >
                Lateral shift: {derived.lateralUser.toFixed(2)} cm
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold">Experimental Procedure</span>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ol className="list-decimal ml-5 space-y-2 text-sm text-muted-foreground">
            <li className={step >= 1 ? "text-foreground" : ""}><span className="font-medium">Setup:</span> Place glass slab on optical bench</li>
            <li className={step >= 2 ? "text-foreground" : ""}><span className="font-medium">Incident ray:</span> Place object pins (I₁, I₂) along incident ray</li>
            <li className={step >= 3 ? "text-foreground" : ""}><span className="font-medium">Emergent ray:</span> View from opposite side, place image pins (E₁, E₂)</li>
            <li className={step >= 4 ? "text-foreground" : ""}><span className="font-medium">Measurement:</span> Use protractor to measure angles i, r, e</li>
          </ol>
          <div className="space-y-2">
            <div className="rounded-lg border border-border/50 bg-background/30 p-3 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-4 h-4 text-cyan-500" />
                <span className="font-medium">Key Measurements</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>• Angle of incidence (i)</div>
                <div>• Angle of refraction (r)</div>
                <div>• Angle of emergence (e)</div>
                <div>• Lateral displacement (d)</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-blue-500/10 p-2 rounded border border-blue-500/20">
              <strong>Physics Principle:</strong> In a rectangular glass slab, the emergent ray is parallel to the incident ray (e ≈ i), but displaced laterally. Refractive index n = sin(i)/sin(r).
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="font-semibold mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-500" />
          Observation Table (Glass Slab Refraction)
        </div>
        {trials.length === 0 ? (
          <div className="text-sm text-muted-foreground p-4 bg-slate-900/30 rounded-lg border border-dashed border-border/50">
            Complete the experiment setup and record your first trial. Vary the incident angle for multiple observations to calculate the mean refractive index.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-6 gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
              <div>Trial</div>
              <div className="text-center">i (°)</div>
              <div className="text-center">r (°)</div>
              <div className="text-center">e (°)</div>
              <div className="text-center">Shift (cm)</div>
              <div className="text-center">n = sin(i)/sin(r)</div>
            </div>
            {trials.map((t, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-2 border-t border-border/40 pt-2 text-sm items-center">
                <div className="text-muted-foreground">#{idx + 1}</div>
                <div className="text-center font-mono text-amber-400">{t.i.toFixed(1)}°</div>
                <div className="text-center font-mono">{t.r.toFixed(1)}°</div>
                <div className="text-center font-mono text-cyan-400">{t.e.toFixed(1)}°</div>
                <div className="text-center font-mono">{t.lateral.toFixed(2)}</div>
                <div className="text-center font-mono font-semibold text-green-400">{t.nCalc.toFixed(3)}</div>
              </div>
            ))}
            <div className="border-t border-border/40 pt-3 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mean Refractive Index:</span>
                <span className="text-xl font-bold text-green-400 font-mono">{meanN?.toFixed(3) ?? "--"}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Expected for glass: 1.50 - 1.65
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

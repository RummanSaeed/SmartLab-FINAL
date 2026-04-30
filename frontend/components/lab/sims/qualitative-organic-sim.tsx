"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type FunctionalGroup = "aldehyde" | "ketone" | "carboxylic_acid" | "phenol"

type TestId = "fehling" | "tollen" | "dnph" | "carbonate" | "fecl3"

type Test = {
  id: TestId
  name: string
  detects: FunctionalGroup[]
  positive: string
  negative: string
  hazard: string
}

const tests: Test[] = [
  {
    id: "fehling",
    name: "Fehling's test",
    detects: ["aldehyde"],
    positive: "Brick-red precipitate (Cu2O) forms",
    negative: "No precipitate; solution remains blue",
    hazard: "Use gentle heating; avoid skin contact.",
  },
  {
    id: "tollen",
    name: "Tollens' test",
    detects: ["aldehyde"],
    positive: "Silver mirror / black Ag precipitate forms",
    negative: "No silver mirror",
    hazard: "Prepare fresh; do not store Tollens reagent.",
  },
  {
    id: "dnph",
    name: "2,4-DNPH test",
    detects: ["aldehyde", "ketone"],
    positive: "Orange/yellow precipitate forms",
    negative: "No precipitate",
    hazard: "Irritant; wear gloves.",
  },
  {
    id: "carbonate",
    name: "Na2CO3 test",
    detects: ["carboxylic_acid"],
    positive: "Effervescence (CO2) observed",
    negative: "No effervescence",
    hazard: "Avoid splashes.",
  },
  {
    id: "fecl3",
    name: "FeCl3 test",
    detects: ["phenol"],
    positive: "Violet/purple coloration",
    negative: "No violet color",
    hazard: "Corrosive; avoid contact.",
  },
]

type Unknown = {
  id: string
  label: string
  group: FunctionalGroup
}

const unknowns: Unknown[] = [
  { id: "u1", label: "Unknown A", group: "aldehyde" },
  { id: "u2", label: "Unknown B", group: "ketone" },
  { id: "u3", label: "Unknown C", group: "carboxylic_acid" },
  { id: "u4", label: "Unknown D", group: "phenol" },
]

export type QualitativeOrganicSetup = {
  testTube: boolean
  dropper: boolean
  waterBath: boolean
}

function Scene({ setup, tinted }: { setup: QualitativeOrganicSetup; tinted: boolean }) {
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />

      <mesh position={[0, 0.08, -0.3]}>
        <boxGeometry args={[3.2, 0.16, 1.6]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <mesh position={[0, 1.02, -0.3]} visible={setup.testTube}>
        <cylinderGeometry args={[0.16, 0.18, 1.15, 22]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.66, -0.3]} visible={setup.testTube}>
        <cylinderGeometry args={[0.12, 0.14, 0.55, 22]} />
        <meshStandardMaterial color={tinted ? "#f59e0b" : "#60a5fa"} transparent opacity={0.6} emissive={tinted ? "#f59e0b" : "#60a5fa"} emissiveIntensity={0.1} />
      </mesh>

      <mesh position={[0.55, 1.2, -0.25]} visible={setup.dropper}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 12]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      <mesh position={[-0.9, 0.55, -0.35]} visible={setup.waterBath}>
        <cylinderGeometry args={[0.35, 0.35, 0.28, 22]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-0.9, 0.6, -0.35]} visible={setup.waterBath}>
        <cylinderGeometry args={[0.31, 0.31, 0.18, 22]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.55} />
      </mesh>

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

export function QualitativeOrganicSim({ setup }: { setup: QualitativeOrganicSetup }) {
  const [unknownIdx, setUnknownIdx] = useState(0)
  const [testId, setTestId] = useState<TestId>("fehling")
  const [heated, setHeated] = useState(false)
  const [performed, setPerformed] = useState(false)

  const setupReady = setup.testTube && setup.dropper && setup.waterBath

  const unknown = unknowns[unknownIdx] || unknowns[0]
  const test = tests.find((t) => t.id === testId) || tests[0]

  const isPositive = useMemo(() => {
    if (!performed) return null
    const needsHeat = testId === "fehling" || testId === "tollen"
    if (needsHeat && !heated) return false
    return test.detects.includes(unknown.group)
  }, [performed, unknown.group, test.detects, testId, heated])

  const resultText = useMemo(() => {
    if (!performed) return "Not performed"
    if (isPositive === null) return "Not performed"
    return isPositive ? test.positive : test.negative
  }, [performed, isPositive, test.positive, test.negative])

  const tinted = Boolean(performed && isPositive)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Qualitative Organic Analysis</div>
          <Badge variant="outline">qualitative-organic</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Perform confirmatory tests for common functional groups.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Unknown sample</div>
          <div className="flex flex-wrap gap-2">
            {unknowns.map((u, idx) => (
              <Button
                key={u.id}
                size="sm"
                variant={idx === unknownIdx ? "default" : "outline"}
                onClick={() => {
                  setUnknownIdx(idx)
                  setPerformed(false)
                  setHeated(false)
                }}
              >
                {u.label}
              </Button>
            ))}
          </div>

          <div className="text-sm font-semibold">Choose test</div>
          <div className="flex flex-wrap gap-2">
            {tests.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={t.id === testId ? "default" : "outline"}
                onClick={() => {
                  setTestId(t.id)
                  setPerformed(false)
                  setHeated(false)
                }}
              >
                {t.name}
              </Button>
            ))}
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
            Safety: {test.hazard}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setHeated(true)} disabled={heated || !setupReady}>Heat gently</Button>
            <Button onClick={() => setPerformed(true)} disabled={!setupReady}>Perform test</Button>
            <Button variant="outline" onClick={() => { setPerformed(false); setHeated(false) }}>Reset</Button>
          </div>

          {!setupReady && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
              Drag and place test tube, dropper, and water bath first.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Observation</div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Result</div>
            <div className="mt-1 font-semibold">{resultText}</div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Inference</div>
            <div className="mt-1 font-semibold">
              {!performed
                ? "—"
                : isPositive
                  ? "Functional group indicated by positive test"
                  : "Functional group not indicated by this test"}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Note: This simulation focuses on expected observations. In a real lab, confirm with multiple tests.
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
            <Canvas camera={{ position: [0, 2.55, 4.9], fov: 48 }}>
              <Scene setup={setup} tinted={tinted} />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}

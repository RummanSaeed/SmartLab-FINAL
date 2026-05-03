"use client"

import { use, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Save,
  Flag,
  Star,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Activity,
  Zap,
  Maximize,
  Info,
  FileText,
  CheckCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EquipmentDrawer } from "@/components/lab/equipment-drawer"
import { AITutorPanel } from "@/components/lab/ai-tutor-panel"
import { LiveReadings } from "@/components/lab/live-readings"
import { SafetyOverlay } from "@/components/lab/safety-overlay"
import { simConfigs } from "@/data/sim-config"
import { ScrewGaugeSim } from "@/components/lab/sims/screw-gauge-sim"
import { OhmsLawSim } from "@/components/lab/sims/ohms-law-sim"
import { VernierEquipment } from "@/components/lab/sims/vernier-equipment"
import { VernierTable } from "@/components/lab/sims/vernier-table"
import { InclinedPlaneSim } from "@/components/lab/sims/inclined-plane-sim"
import { PendulumSim } from "@/components/lab/sims/pendulum-sim"
import { GlassSlabSim } from "@/components/lab/sims/glass-slab-sim"
import { ConcaveMirrorWaterSim } from "@/components/lab/sims/concave-mirror-water-sim"
import { PrismCriticalSim } from "@/components/lab/sims/prism-critical-sim"
import { PrismDeviationSim } from "@/components/lab/sims/prism-deviation-sim"
import { ConvexLensSim } from "@/components/lab/sims/convex-lens-sim"
import { SeriesCircuitSim } from "@/components/lab/sims/series-circuit-sim"
import { ParallelCircuitSim } from "@/components/lab/sims/parallel-circuit-sim"
import { FieldLinesSim } from "@/components/lab/sims/field-lines-sim"
import { LogicGatesSim } from "@/components/lab/sims/logic-gates-sim"
import { FlameTestSim } from "@/components/lab/sims/flame-test-sim"
import { TitrationSim } from "@/components/lab/sims/titration-sim"
import { FrictionBlockSim } from "@/components/lab/sims/friction-block-sim"
import { VectorForcesSim } from "@/components/lab/sims/vector-forces-sim"
import { MomentsSim } from "@/components/lab/sims/moments-sim"
import { SpringExtensionSim, LoadExtensionGraph } from "@/components/lab/sims/spring-extension-sim"
import { ArchimedesDensitySim } from "@/components/lab/sims/archimedes-density-sim"
import { HeatingCurveSim } from "@/components/lab/sims/heating-curve-sim"
import { MixtureSeparationSim } from "@/components/lab/sims/mixture-separation-sim"
import { MeltingPointSim } from "@/components/lab/sims/melting-point-sim"
import { BoilingPointSim } from "@/components/lab/sims/boiling-point-sim"
import { SublimationSim } from "@/components/lab/sims/sublimation-sim"
import { DistillationSim } from "@/components/lab/sims/distillation-sim"
import { TempChangeSim } from "@/components/lab/sims/temp-change-sim"
import { SolutionPrepSim } from "@/components/lab/sims/solution-prep-sim"
import { DilutionSim } from "@/components/lab/sims/dilution-sim"
import { CrystallizationSim } from "@/components/lab/sims/crystallization-sim"
import { MixingSim } from "@/components/lab/sims/mixing-sim"
import { SolubilityTempSim } from "@/components/lab/sims/solubility-temp-sim"
import { ConductivitySim } from "@/components/lab/sims/conductivity-sim"
import { DisplacementSim } from "@/components/lab/sims/displacement-sim"
import { TempDropSim } from "@/components/lab/sims/temp-drop-sim"
import { CombinationSim } from "@/components/lab/sims/combination-sim"
import { DecompositionSim } from "@/components/lab/sims/decomposition-sim"
import { SingleDisplacementSim } from "@/components/lab/sims/single-displacement-sim"
import { PhPaperSim } from "@/components/lab/sims/ph-paper-sim"
import { IndicatorPanelSim } from "@/components/lab/sims/indicator-panel-sim"
import { QualitativeOrganicSim } from "@/components/lab/sims/qualitative-organic-sim"
import { UnsaturationTestSim } from "@/components/lab/sims/unsaturation-test-sim"
import { WaterSofteningSim } from "@/components/lab/sims/water-softening-sim"
import { InclineForceSim } from "@/components/lab/sims/incline-force-sim"
import { FlywheelSim } from "@/components/lab/sims/flywheel-sim"
import { ViscositySim } from "@/components/lab/sims/viscosity-sim"
import { MeldeSim } from "@/components/lab/sims/melde-sim"
import { StringVibrationSim } from "@/components/lab/sims/string-vibration-sim"
import { ResonanceTubeSim } from "@/components/lab/sims/resonance-tube-sim"
import { GravimetricAnalysisSim } from "@/components/lab/sims/gravimetric-analysis-sim"
import { GasDiffusionSim } from "@/components/lab/sims/gas-diffusion-sim"
import { ChromatographySim } from "@/components/lab/sims/chromatography-sim"
import { EvaporationCoolingSim } from "@/components/lab/sims/evaporation-cooling-sim"
import { CommonIonEffectSim } from "@/components/lab/sims/common-ion-sim"
import { LeChatelierSim } from "@/components/lab/sims/le-chatelier-sim"
import { MechanicalHeatSim } from "@/components/lab/sims/mechanical-heat-sim"
import { SpecificHeatSolidSim } from "@/components/lab/sims/specific-heat-solid-sim"
import { RCTimeConstantSim } from "@/components/lab/sims/rc-time-constant-sim"
import { SlideWireBridgeSim } from "@/components/lab/sims/slide-wire-bridge-sim"
import { VoltmeterResistanceSim } from "@/components/lab/sims/voltmeter-resistance-sim"
import { VoltmeterCapacitorDischargeSim } from "@/components/lab/sims/voltmeter-capacitor-discharge-sim"
import { ThermistorSim } from "@/components/lab/sims/thermistor-sim"
import { InternalResistanceCellSim } from "@/components/lab/sims/internal-resistance-cell-sim"
import { EMFCellPotentiometerSim } from "@/components/lab/sims/emf-cell-potentiometer-sim"
import { VIGraphCellSim } from "@/components/lab/sims/vi-graph-cell-sim"
import { TungstenFilamentSim } from "@/components/lab/sims/tungsten-filament-sim"
import { GalvanometerVoltmeterSim } from "@/components/lab/sims/galvanometer-voltmeter-sim"
import { CapacitanceACSim } from "@/components/lab/sims/capacitance-ac-sim"
import { ImpedanceRLSim } from "@/components/lab/sims/impedance-rl-sim"
import { ImpedanceRCSim } from "@/components/lab/sims/impedance-rc-sim"
import { DiodeIVSim } from "@/components/lab/sims/diode-iv-sim"
import { PhotocellSim } from "@/components/lab/sims/photocell-sim"

// Class 12 Chemistry Simulations
import { AcidStandardizationSim } from "@/components/lab/sims/acid-standardization-sim"
import { NaohPercentageSim } from "@/components/lab/sims/naoh-percentage-sim"
import { Na2co3PuritySim } from "@/components/lab/sims/na2co3-purity-sim"
import { WaterCrystallizationSim } from "@/components/lab/sims/water-crystallization-sim"
import { OxalicSolubilitySim } from "@/components/lab/sims/oxalic-solubility-sim"
import { HeatNeutralizationSim } from "@/components/lab/sims/heat-neutralization-sim"
import { Kmno4StandardizationSim } from "@/components/lab/sims/kmno4-standardization-sim"
import { IronEstimationSim } from "@/components/lab/sims/iron-estimation-sim"
import { MixtureCompositionSim } from "@/components/lab/sims/mixture-composition-sim"
import { MohrSaltSolubilitySim } from "@/components/lab/sims/mohr-salt-solubility-sim"
import { QualitativeAnalysisSim } from "@/components/lab/sims/qualitative-analysis-sim"
import { NickelDmgSim } from "@/components/lab/sims/nickel-dmg-sim"
import { EthylenePreparationSim } from "@/components/lab/sims/ethylene-preparation-sim"
import { IodoformSim } from "@/components/lab/sims/iodoform-sim"
import { GlucosazoneSim } from "@/components/lab/sims/glucosazone-sim"
import { ProteinDenaturationSim } from "@/components/lab/sims/protein-denaturation-sim"
import { StarchDigestionSim } from "@/components/lab/sims/starch-digestion-sim"
import { IodineNumberSim } from "@/components/lab/sims/iodine-number-sim"

// Class 10 Chemistry Simulations (SSC)
import { NaOHStandardizationSim } from "@/components/lab/sims/naoh-standardization-sim"
import { HClStandardizationSim } from "@/components/lab/sims/hcl-standardization-sim"
import { Na2CO3MolaritySim } from "@/components/lab/sims/na2co3-molarity-sim"
import { OxalicMolaritySim } from "@/components/lab/sims/oxalic-molarity-sim"
import { WeakAcidsSim } from "@/components/lab/sims/weak-acids-sim"
import { ClassifySubstancesSim } from "@/components/lab/sims/classify-substances-sim"
import { AldehydeIdentificationSim } from "@/components/lab/sims/aldehyde-identification-sim"
import { KetoneIdentificationSim } from "@/components/lab/sims/ketone-identification-sim"
import { CarboxylicAcidIdentificationSim } from "@/components/lab/sims/carboxylic-acid-identification-sim"
import { PhenolIdentificationSim } from "@/components/lab/sims/phenol-identification-sim"
import { KMnO4UnsaturationSim } from "@/components/lab/sims/kmno4-unsaturation-sim"
import { SugarDecompositionSim } from "@/components/lab/sims/sugar-decomposition-sim"

import { practicals } from "@/data/practicals"

export default function LabWorkspace({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { id } = use(params)
  const practical = useMemo(() => practicals.find((p) => p.id === id), [id])
  const savedSetupKey = useMemo(() => `smartlab_saved_setups:${id}`, [id])
  const [runId, setRunId] = useState<string | null>(null)
  const [runStartedAt, setRunStartedAt] = useState<Date | null>(null)
  const [savingRun, setSavingRun] = useState(false)
  const [saveNotes, setSaveNotes] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [showSafetyWarning, setShowSafetyWarning] = useState(false)
  const [mode, setMode] = useState<"hazard" | "grading">("hazard")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showFinishSummaryModal, setShowFinishSummaryModal] = useState(false)
  const [showFinishFeedbackModal, setShowFinishFeedbackModal] = useState(false)
  const [showFinishDoneModal, setShowFinishDoneModal] = useState(false)
  const [finishSummaryText, setFinishSummaryText] = useState<string>("")
  const [finishReadings, setFinishReadings] = useState<Array<{ label: string; value: string }>>([])
  const [feedbackRating, setFeedbackRating] = useState<number>(5)
  const [feedbackComment, setFeedbackComment] = useState<string>("")
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [savingFeedback, setSavingFeedback] = useState(false)
  const micrometerFrameRef = useRef<HTMLIFrameElement | null>(null)
  const vernierFrameRef = useRef<HTMLIFrameElement | null>(null)
  const [coachStep, setCoachStep] = useState(0)
  const [screwStep, setScrewStep] = useState(0)
  const [frictionStep, setFrictionStep] = useState(0)
  const [placed, setPlaced] = useState({ vernier: false, cylinder: false })
  const [savedSetups, setSavedSetups] = useState<
    Array<{
      id: string
      at: number
      practicalId: string
      title: string
      simType: string | null
      payload: unknown
    }>
  >([])

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(savedSetupKey) : null
      const parsed = raw ? JSON.parse(raw) : []
      setSavedSetups(Array.isArray(parsed) ? parsed : [])
    } catch {
      setSavedSetups([])
    }
  }, [savedSetupKey])

  const coachHint =
    practical?.simType === "vernier"
      ? coachStep === 0
        ? "Reset the instrument and note any zero error."
        : coachStep === 1
          ? "Drag the Vernier caliper from the equipment panel."
          : coachStep === 2
            ? "Drag the cylinder onto the table."
            : coachStep === 3
              ? "Slide the movable jaw to just touch the object."
              : "Read the main scale + vernier coincidence and record it."
      : ""
  const screwHint =
    practical?.simType === "screw-gauge"
      ? screwStep === 0
        ? "Close the jaws and note zero error."
        : screwStep === 1
          ? "Place the wire between spindle and anvil."
          : screwStep === 2
            ? "Rotate the thimble to just touch the object."
            : screwStep === 3
              ? "Read main scale and circular scale."
              : "Repeat readings and compute the mean."
      : ""
  const frictionHint =
    practical?.simType === "friction-block"
      ? frictionStep === 0
        ? "Place the block and set the surface coefficient μ."
        : frictionStep === 1
          ? "Increase normal load using the slider."
          : frictionStep === 2
            ? "Increase pull force slowly until motion starts."
            : frictionStep === 3
              ? "Record limiting friction and normal load."
              : "Repeat for different loads and plot F vs N."
      : ""

  // Equipment parameters
  const [voltage, setVoltage] = useState([5])
  const [resistance, setResistance] = useState([100])
  const [vernierSize, setVernierSize] = useState([2])
  const [vernierZero, setVernierZero] = useState([0])
  const [screwDiameter, setScrewDiameter] = useState([0.8])
  const [screwZero, setScrewZero] = useState([0])
  const [screwMsdCount, setScrewMsdCount] = useState([30])
  const [screwCsdCount, setScrewCsdCount] = useState([50])
  const [inclineAngle, setInclineAngle] = useState([15])
  const [inclineLength, setInclineLength] = useState([1.2])
  const [inclineMass, setInclineMass] = useState([50])
  const [pendLength, setPendLength] = useState([1])
  const [pendAngle, setPendAngle] = useState([8])
  const [pendCount, setPendCount] = useState([10])
  const [glassIncident, setGlassIncident] = useState([35])
  const [glassN, setGlassN] = useState([1.5])
  const [glassThickness, setGlassThickness] = useState([3])
  const [mirrorRadius, setMirrorRadius] = useState([20])
  const [mirrorPinDepth, setMirrorPinDepth] = useState([1.5])
  const [mirrorWaterDepth, setMirrorWaterDepth] = useState([2])
  const [prismCriticalN, setPrismCriticalN] = useState([1.5])
  const [prismCriticalI, setPrismCriticalI] = useState([40])
  const [prismDevA, setPrismDevA] = useState([60])
  const [prismDevN, setPrismDevN] = useState([1.5])
  const [prismDevI, setPrismDevI] = useState([45])
  const [lensObjectDistance, setLensObjectDistance] = useState([40])
  const [lensPower, setLensPower] = useState([4])
  const [lensObjectHeight, setLensObjectHeight] = useState([4])
  const [seriesVoltage, setSeriesVoltage] = useState([6])
  const [seriesR1, setSeriesR1] = useState([100])
  const [seriesR2, setSeriesR2] = useState([150])
  const [parallelVoltage, setParallelVoltage] = useState([6])
  const [parallelR1, setParallelR1] = useState([100])
  const [parallelR2, setParallelR2] = useState([150])
  const [fieldStrength, setFieldStrength] = useState([1.5])
  const [fieldProbeX, setFieldProbeX] = useState([0.4])
  const [fieldProbeY, setFieldProbeY] = useState([0.6])
  const [logicGateType, setLogicGateType] = useState([0])
  const [logicA, setLogicA] = useState([0])
  const [logicB, setLogicB] = useState([0])
  const [flameSample, setFlameSample] = useState([0])
  const [flameIntensity, setFlameIntensity] = useState([1])
  const [flameWireClean, setFlameWireClean] = useState([1])
  const [titrAnalyte, setTitrAnalyte] = useState([0])
  const [titrAnalyteM, setTitrAnalyteM] = useState([0.1])
  const [titrantM, setTitrantM] = useState([0.1])
  const [titrAliquot, setTitrAliquot] = useState([25])
  const [frictionNormal, setFrictionNormal] = useState([6])
  const [frictionForce, setFrictionForce] = useState([2])
  const [frictionMu, setFrictionMu] = useState([0.4])
  const [frictionTargetDistance, setFrictionTargetDistance] = useState([1])
  const [frictionPairs, setFrictionPairs] = useState<Array<{ n: number; flim: number }>>([])
  const [forceA, setForceA] = useState([4])
  const [angleA, setAngleA] = useState([30])
  const [forceB, setForceB] = useState([5])
  const [angleB, setAngleB] = useState([150])
  const [momentUnknown, setMomentUnknown] = useState([4])
  const [momentUnknownPos, setMomentUnknownPos] = useState([30])
  const [momentKnown, setMomentKnown] = useState([5])
  const [momentKnownPos, setMomentKnownPos] = useState([70])
  const [springLoad, setSpringLoad] = useState([5])
  const [springK, setSpringK] = useState([15])
  const [archMass, setArchMass] = useState([120])
  const [archVolume, setArchVolume] = useState([80])
  // Class 11 Physics simulations
  const [flywheelHangingMass, setFlywheelHangingMass] = useState([500])
  const [flywheelDropHeight, setFlywheelDropHeight] = useState([100])
  const [viscositySphereRadius, setViscositySphereRadius] = useState([2.5])
  const [viscositySphereDensity, setViscositySphereDensity] = useState([7800])
  const [viscosityFluidViscosity, setViscosityFluidViscosity] = useState([1.0])
  const [meldeStringLength, setMeldeStringLength] = useState([100])
  const [meldeTension, setMeldeTension] = useState([50])
  const [meldeMassPerLength, setMeldeMassPerLength] = useState([0.8])
  const [stringVibLength, setStringVibLength] = useState([100])
  const [stringVibTension, setStringVibTension] = useState([50])
  const [stringVibMassPerLength, setStringVibMassPerLength] = useState([0.8])
  const [resonanceForkFreq, setResonanceForkFreq] = useState([512])
  const [resonanceTubeDiameter, setResonanceTubeDiameter] = useState([3])
  const [heatRate, setHeatRate] = useState([4])
  const [heatTime, setHeatTime] = useState([15])
  const [ironFraction, setIronFraction] = useState([50])
  const [meltTemp, setMeltTemp] = useState([30])
  const [meltPurity, setMeltPurity] = useState([95])
  const [meltAttempts, setMeltAttempts] = useState<number[]>([])
  const [boilRate, setBoilRate] = useState([4])
  const [boilSubstance, setBoilSubstance] = useState([0])
  const [subHeatRate, setSubHeatRate] = useState([4])
  const [subSampleMass, setSubSampleMass] = useState([8])
  const [distHeatRate, setDistHeatRate] = useState([4])
  const [distAlcoholPct, setDistAlcoholPct] = useState([40])
  const [tempWaterMl, setTempWaterMl] = useState([10])
  const [tempSetup, setTempSetup] = useState({
    testTube: false,
    dropper: false,
    thermometer: false,
  })
  const [solSetup, setSolSetup] = useState({
    balance: false,
    beaker: false,
    flask: false,
    stirrer: false,
  })
  const [dilSetup, setDilSetup] = useState({
    pipette: false,
    flask: false,
    beaker: false,
    cylinder: false,
  })
  const [crysSetup, setCrysSetup] = useState({
    beaker: false,
    burner: false,
    dish: false,
    funnel: false,
  })
  const [mixSetup, setMixSetup] = useState({
    beakerA: false,
    beakerB: false,
    stirrer: false,
  })
  const [solTempSetup, setSolTempSetup] = useState({
    testTube: false,
    burner: false,
    stirrer: false,
  })
  const [condSetup, setCondSetup] = useState({
    battery: false,
    bulb: false,
    electrodes: false,
    beaker: false,
  })
  const [dispSetup, setDispSetup] = useState({
    testTube: false,
    copperSulfate: false,
    ironNail: false,
  })
  const [tempDropSetup, setTempDropSetup] = useState({
    beaker: false,
    thermometer: false,
    stirrer: false,
    solute: false,
  })
  const [combSetup, setCombSetup] = useState({
    crucible: false,
    burner: false,
    tongs: false,
    reactantA: false,
    reactantB: false,
  })
  const [decompSetup, setDecompSetup] = useState({
    testTube: false,
    burner: false,
    deliveryTube: false,
    testReagent: false,
  })
  const [singleDispSetup, setSingleDispSetup] = useState({
    testTube: false,
    saltSolution: false,
    metalStrip: false,
  })
  const [phSetup, setPhSetup] = useState({
    beaker: false,
    dropper: false,
    paper: false,
  })
  const [indicatorSetup, setIndicatorSetup] = useState({
    testTube: false,
    dropper: false,
    indicators: false,
  })
  const [qualOrgSetup, setQualOrgSetup] = useState({
    testTube: false,
    dropper: false,
    waterBath: false,
  })
  const [unsatSetup, setUnsatSetup] = useState({
    testTube: false,
    dropper: false,
    reagentBottle: false,
  })
  const [softSetup, setSoftSetup] = useState({
    beaker: false,
    soap: false,
    softener: false,
    stirrer: false,
  })
  const [subSetup, setSubSetup] = useState({
    stand: false,
    dish: false,
    funnel: false,
    cotton: false,
    burner: false,
  })
  const [distSetup, setDistSetup] = useState({
    flask: false,
    burner: false,
    condenser: false,
    receiver: false,
    thermometer: false,
  })
  const boilNames = ["Acetone", "Benzene", "Ethyl Alcohol"]
  const [boilSetup, setBoilSetup] = useState({
    stand: false,
    beaker: false,
    thermometer: false,
    bottle: false,
    liquidMl: 0,
    pouring: false,
  })
  const [inclinedPlotData, setInclinedPlotData] = useState<{
    trials: number[]
    points: Array<{ id: number; x: number; y: number }>
    slope: number | null
    trackLength: number
  }>({
    trials: [],
    points: [],
    slope: null,
    trackLength: inclineLength[0],
  })
  const [screwIframeReading, setScrewIframeReading] = useState<number | null>(null)
  const [screwIframeMeasured, setScrewIframeMeasured] = useState<number | null>(null)
  const [screwIframeZero, setScrewIframeZero] = useState<number | null>(null)
  const [screwIframeMsr, setScrewIframeMsr] = useState<number | null>(null)
  const [screwIframeCsr, setScrewIframeCsr] = useState<number | null>(null)
  const [screwIframeLc, setScrewIframeLc] = useState<number | null>(null)
  const [vernierIframeReading, setVernierIframeReading] = useState<number | null>(null)
  const [vernierIframeMeasured, setVernierIframeMeasured] = useState<number | null>(null)
  const [vernierIframeZero, setVernierIframeZero] = useState<number | null>(null)
  const [vernierIframeMsr, setVernierIframeMsr] = useState<number | null>(null)
  const [vernierIframeVsr, setVernierIframeVsr] = useState<number | null>(null)
  const [vernierIframeLc, setVernierIframeLc] = useState<number | null>(null)
  const vernierLiveReading = useMemo(
    () => Number((vernierSize[0] + vernierZero[0]).toFixed(2)),
    [vernierSize, vernierZero],
  )
  const screwLiveReading = useMemo(
    () => Number((screwDiameter[0] + screwZero[0]).toFixed(3)),
    [screwDiameter, screwZero],
  )
  const screwPitchMm = 0.5
  const screwLcMm = useMemo(
    () => Number((screwPitchMm / Math.max(1, screwCsdCount[0])).toFixed(6)),
    [screwCsdCount],
  )
  const screwMsrMm = useMemo(() => {
    const raw = Math.max(0, screwDiameter[0])
    const msrDiv = Math.floor(raw / screwPitchMm)
    return Number((msrDiv * screwPitchMm).toFixed(3))
  }, [screwDiameter])
  const screwCsrCount = useMemo(() => {
    const frac = Math.max(0, screwDiameter[0] - screwMsrMm)
    return Math.round(frac / screwLcMm)
  }, [screwDiameter, screwMsrMm, screwLcMm])
  const screwMeasuredFromParams = useMemo(
    () => Number((screwMsrMm + screwCsrCount * screwLcMm).toFixed(3)),
    [screwMsrMm, screwCsrCount, screwLcMm],
  )
  const screwCorrectedFromParams = useMemo(
    () => Number((screwMeasuredFromParams - screwZero[0]).toFixed(3)),
    [screwMeasuredFromParams, screwZero],
  )
  const screwDisplayedReading = screwIframeReading ?? screwCorrectedFromParams
  const screwDisplayedMeasured = screwIframeMeasured ?? screwMeasuredFromParams
  const screwDisplayedZero = screwIframeZero ?? screwZero[0]
  const screwDisplayedMsr = screwIframeMsr ?? screwMsrMm
  const screwDisplayedCsr = screwIframeCsr ?? screwCsrCount
  const screwDisplayedLc = screwIframeLc ?? screwLcMm
  const vernierDisplayedReading = vernierIframeReading ?? vernierLiveReading
  const vernierDisplayedMeasured = vernierIframeMeasured ?? vernierSize[0]
  const vernierDisplayedZero = vernierIframeZero ?? vernierZero[0]
  const vernierDisplayedMsr = vernierIframeMsr ?? Number((Math.floor(vernierSize[0] * 10) / 10).toFixed(1))
  const vernierDisplayedVsr =
    vernierIframeVsr ??
    Math.max(0, Math.round((vernierSize[0] - Math.floor(vernierSize[0] * 10) / 10) / 0.01))
  const vernierDisplayedLc = vernierIframeLc ?? 0.01
  const frictionLimitingNow = useMemo(
    () => Number((frictionMu[0] * frictionNormal[0]).toFixed(3)),
    [frictionMu, frictionNormal],
  )
  const frictionSlope = useMemo(() => {
    if (frictionPairs.length < 2) return null
    const n = frictionPairs.length
    const sumX = frictionPairs.reduce((a, p) => a + p.n, 0)
    const sumY = frictionPairs.reduce((a, p) => a + p.flim, 0)
    const sumXY = frictionPairs.reduce((a, p) => a + p.n * p.flim, 0)
    const sumX2 = frictionPairs.reduce((a, p) => a + p.n * p.n, 0)
    const denom = n * sumX2 - sumX * sumX
    if (Math.abs(denom) < 1e-9) return null
    return Number(((n * sumXY - sumX * sumY) / denom).toFixed(3))
  }, [frictionPairs])
  const meltMean = useMemo(() => {
    if (meltAttempts.length === 0) return null
    return meltAttempts.reduce((a, b) => a + b, 0) / meltAttempts.length
  }, [meltAttempts])

  const tutorLabState = useMemo(() => {
    const base: Record<string, unknown> = {
      simType: practical?.simType ?? null,
      mode,
      isRunning,
      coachStep,
      screwStep,
      frictionStep,
      placed,
    }

    switch (practical?.simType) {
      case "vernier":
        return {
          ...base,
          params: {
            objectSizeCm: vernierSize[0],
            zeroErrorCm: vernierZero[0],
            readingCm: vernierDisplayedReading,
            measuredCm: vernierDisplayedMeasured,
            msr: vernierDisplayedMsr,
            vsr: vernierDisplayedVsr,
            lcCm: vernierDisplayedLc,
          },
        }
      case "screw-gauge":
        return {
          ...base,
          params: {
            objectDiameterMm: screwDiameter[0],
            zeroErrorMm: screwZero[0],
            readingMm: screwDisplayedReading,
            measuredMm: screwDisplayedMeasured,
            msrMm: screwDisplayedMsr,
            csr: screwDisplayedCsr,
            lcMm: screwDisplayedLc,
          },
        }
      case "inclined-plane":
        return {
          ...base,
          params: {
            angleDeg: inclineAngle[0],
            trackLengthM: inclineLength[0],
            ballMassG: inclineMass[0],
            trials: inclinedPlotData.trials,
            slope: inclinedPlotData.slope,
            points: inclinedPlotData.points,
          },
        }
      case "friction-block":
        return {
          ...base,
          params: {
            normalN: frictionNormal[0],
            pullN: frictionForce[0],
            mu: frictionMu[0],
            targetDistanceM: frictionTargetDistance[0],
            limitingFrictionN: frictionLimitingNow,
            pairs: frictionPairs,
            slopeMuEstimate: frictionSlope,
          },
        }
      case "boiling-point":
        return {
          ...base,
          params: {
            substance: boilNames[boilSubstance[0]] || boilNames[0],
            heatRate: boilRate[0],
            setup: boilSetup,
          },
        }
      case "melting-point":
        return {
          ...base,
          params: {
            heatRate: meltTemp[0],
            purityPct: meltPurity[0],
            attempts: meltAttempts,
            mean: meltMean,
          },
        }
      case "temp-change":
        return {
          ...base,
          params: {
            waterMl: tempWaterMl[0],
            setup: tempSetup,
          },
        }
      case "solution-prep":
        return {
          ...base,
          params: {
            setup: solSetup,
          },
        }
      case "dilution":
        return {
          ...base,
          params: {
            setup: dilSetup,
          },
        }
      case "crystallization":
        return {
          ...base,
          params: {
            setup: crysSetup,
          },
        }
      case "mixing":
        return {
          ...base,
          params: {
            setup: mixSetup,
          },
        }
      case "solubility-temp":
        return {
          ...base,
          params: {
            setup: solTempSetup,
          },
        }
      case "conductivity":
        return {
          ...base,
          params: {
            setup: condSetup,
          },
        }
      case "displacement":
        return {
          ...base,
          params: {
            setup: dispSetup,
          },
        }
      default:
        return base
    }
  }, [
    practical?.simType,
    mode,
    isRunning,
    coachStep,
    screwStep,
    frictionStep,
    placed,
    vernierSize,
    vernierZero,
    vernierDisplayedReading,
    vernierDisplayedMeasured,
    vernierDisplayedMsr,
    vernierDisplayedVsr,
    vernierDisplayedLc,
    screwDiameter,
    screwZero,
    screwDisplayedReading,
    screwDisplayedMeasured,
    screwDisplayedMsr,
    screwDisplayedCsr,
    screwDisplayedLc,
    inclineAngle,
    inclineLength,
    inclineMass,
    inclinedPlotData,
    frictionNormal,
    frictionForce,
    frictionMu,
    frictionTargetDistance,
    frictionLimitingNow,
    frictionPairs,
    frictionSlope,
    boilNames,
    boilSubstance,
    boilRate,
    boilSetup,
    meltTemp,
    meltPurity,
    meltAttempts,
    meltMean,
    tempWaterMl,
    tempSetup,
    solSetup,
    dilSetup,
    crysSetup,
    mixSetup,
    solTempSetup,
    condSetup,
    dispSetup,
  ])

  const persistSavedSetups = (next: typeof savedSetups) => {
    setSavedSetups(next)
    try {
      localStorage.setItem(savedSetupKey, JSON.stringify(next))
    } catch {
      // ignore storage failures
    }
  }

  const handleSaveCurrentSetup = () => {
    const now = Date.now()
    const entry = {
      id: `${id}:${now}`,
      at: now,
      practicalId: id,
      title: practical?.title ?? id,
      simType: (practical?.simType as string | undefined) ?? null,
      payload: tutorLabState,
    }
    const next = [entry, ...savedSetups].slice(0, 20)
    persistSavedSetups(next)
  }

  const applySavedSetup = (setup: (typeof savedSetups)[number]) => {
    const payload = setup.payload as any
    const params = payload?.params ?? payload?.parameters ?? null
    if (!params) return

    const toNum = (v: unknown) => {
      const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN
      return Number.isFinite(n) ? n : null
    }

    const vVoltage = toNum(params.voltage)
    if (vVoltage !== null) setVoltage([vVoltage])
    const vResistance = toNum(params.resistance)
    if (vResistance !== null) setResistance([vResistance])

    const vSizeCm = toNum(params.objectSizeCm)
    if (vSizeCm !== null) setVernierSize([vSizeCm])
    const vZeroCm = toNum(params.zeroErrorCm)
    if (vZeroCm !== null) setVernierZero([vZeroCm])

    const vDiaMm = toNum(params.objectDiameterMm)
    if (vDiaMm !== null) setScrewDiameter([vDiaMm])
    const vZeroMm = toNum(params.zeroErrorMm)
    if (vZeroMm !== null) setScrewZero([vZeroMm])
    const vMsd = toNum(params.msdCount)
    if (vMsd !== null) setScrewMsdCount([vMsd])
    const vCsd = toNum(params.csdCount)
    if (vCsd !== null) setScrewCsdCount([vCsd])

    const vAngle = toNum(params.angleDeg)
    if (vAngle !== null) setInclineAngle([vAngle])
    const vLen = toNum(params.trackLengthM)
    if (vLen !== null) setInclineLength([vLen])
    const vMass = toNum(params.ballMassG)
    if (vMass !== null) setInclineMass([vMass])

    const vPendLen = toNum(params.lengthM)
    if (vPendLen !== null) setPendLength([vPendLen])
    const vPendAngle = toNum(params.angleDeg)
    if (vPendAngle !== null && practical?.simType === "pendulum") setPendAngle([vPendAngle])
    const vOsc = toNum(params.oscillations)
    if (vOsc !== null) setPendCount([vOsc])

    if (params.setup && typeof params.setup === "object") {
      if (practical?.simType === "boiling-point") setBoilSetup(params.setup)
      if (practical?.simType === "melting-point") setMeltSetup(params.setup)
      if (practical?.simType === "temp-change") setTempSetup(params.setup)
      if (practical?.simType === "solution-prep") setSolSetup(params.setup)
      if (practical?.simType === "dilution") setDilSetup(params.setup)
      if (practical?.simType === "crystallization") setCrysSetup(params.setup)
      if (practical?.simType === "mixing") setMixSetup(params.setup)
      if (practical?.simType === "solubility-temp") setSolTempSetup(params.setup)
      if (practical?.simType === "conductivity") setCondSetup(params.setup)
      if (practical?.simType === "displacement") setDispSetup(params.setup)
      if (practical?.simType === "temp-drop") setTempDropSetup(params.setup)
      if (practical?.simType === "combination") setCombSetup(params.setup)
      if (practical?.simType === "decomposition") setDecompSetup(params.setup)
      if (practical?.simType === "single-displacement") setSingleDispSetup(params.setup)
      if (practical?.simType === "ph-paper") setPhSetup(params.setup)
      if (practical?.simType === "indicator-panel") setIndicatorSetup(params.setup)
      if (practical?.simType === "qualitative-organic") setQualOrgSetup(params.setup)
      if (practical?.simType === "unsaturation-test") setUnsatSetup(params.setup)
      if (practical?.simType === "water-softening") setSoftSetup(params.setup)
      if (practical?.simType === "sublimation") setSubSetup(params.setup)
      if (practical?.simType === "distillation") setDistSetup(params.setup)
    }

    // Immediately sync to iframe sims so Load visibly applies without waiting on state/effects.
    if (practical?.simType === "vernier") {
      const frame = vernierFrameRef.current
      if (frame?.contentWindow) {
        const size = vSizeCm ?? vernierSize[0]
        const ze = vZeroCm ?? vernierZero[0]
        frame.contentWindow.postMessage(
          {
            type: "SMARTLAB_SET_VERNIER",
            payload: { sizeCm: size, zeroErrorCm: ze },
          },
          window.location.origin,
        )
      }
    }
    if (practical?.simType === "screw-gauge") {
      const frame = micrometerFrameRef.current
      if (frame?.contentWindow) {
        const dia = vDiaMm ?? screwDiameter[0]
        const ze = vZeroMm ?? screwZero[0]
        const msd = vMsd ?? screwMsdCount[0]
        const csd = vCsd ?? screwCsdCount[0]
        frame.contentWindow.postMessage(
          {
            type: "SMARTLAB_SET_MICROMETER",
            payload: { diameterMm: dia, zeroErrorMm: ze, msdCount: msd, csdCount: csd },
          },
          window.location.origin,
        )
      }
    }
  }

  useEffect(() => {
    if (practical?.simType !== "boiling-point") return
    const title = (practical.title || "").toLowerCase()
    if (title.includes("benzene")) {
      setBoilSubstance([1])
      return
    }
    if (title.includes("ethyl alcohol") || title.includes("ethanol")) {
      setBoilSubstance([2])
      return
    }
    setBoilSubstance([0])
  }, [practical?.simType, practical?.title, id])

  useEffect(() => {
    if (practical?.simType !== "vernier") return
    const frame = vernierFrameRef.current
    if (!frame?.contentWindow) return
    frame.contentWindow.postMessage(
      {
        type: "SMARTLAB_SET_VERNIER",
        payload: {
          sizeCm: vernierSize[0],
          zeroErrorCm: vernierZero[0],
        },
      },
      window.location.origin,
    )
  }, [practical?.simType, vernierSize, vernierZero])

  useEffect(() => {
    if (practical?.simType !== "screw-gauge") return
    const frame = micrometerFrameRef.current
    if (!frame?.contentWindow) return
    frame.contentWindow.postMessage(
      {
        type: "SMARTLAB_SET_MICROMETER",
        payload: {
          diameterMm: screwDiameter[0],
          zeroErrorMm: screwZero[0],
          msdCount: screwMsdCount[0],
          csdCount: screwCsdCount[0],
        },
      },
      window.location.origin,
    )
  }, [practical?.simType, screwDiameter, screwZero, screwMsdCount, screwCsdCount])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const data = event.data || {}
      if (data.type !== "SMARTLAB_MICROMETER_READING" && data.type !== "SMARTLAB_VERNIER_READING") return
      if (data.type === "SMARTLAB_MICROMETER_READING") {
        const val = Number(data.payload?.readingMm)
        if (!Number.isNaN(val)) setScrewIframeReading(val)
        const measured = Number(data.payload?.measuredMm)
        if (!Number.isNaN(measured)) setScrewIframeMeasured(measured)
        const ze = Number(data.payload?.zeroErrorMm)
        if (!Number.isNaN(ze)) setScrewIframeZero(ze)
        const msr = Number(data.payload?.msr)
        if (!Number.isNaN(msr)) setScrewIframeMsr(msr)
        const csr = Number(data.payload?.csr)
        if (!Number.isNaN(csr)) setScrewIframeCsr(csr)
        const lc = Number(data.payload?.lcMm)
        if (!Number.isNaN(lc)) setScrewIframeLc(lc)
      }
      if (data.type === "SMARTLAB_VERNIER_READING") {
        const val = Number(data.payload?.readingCm)
        if (!Number.isNaN(val)) setVernierIframeReading(val)
        const measured = Number(data.payload?.measuredCm)
        if (!Number.isNaN(measured)) setVernierIframeMeasured(measured)
        const ze = Number(data.payload?.zeroErrorCm)
        if (!Number.isNaN(ze)) setVernierIframeZero(ze)
        const msr = Number(data.payload?.msr)
        if (!Number.isNaN(msr)) setVernierIframeMsr(msr)
        const vsr = Number(data.payload?.vsr)
        if (!Number.isNaN(vsr)) setVernierIframeVsr(vsr)
        const lc = Number(data.payload?.lcCm)
        if (!Number.isNaN(lc)) setVernierIframeLc(lc)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  useEffect(() => {
    if (!practical) return
    let cancelled = false
    ;(async () => {
      try {
        const localUserRaw = typeof window !== "undefined" ? localStorage.getItem("smartlab_user") : null
        const localUser = localUserRaw ? JSON.parse(localUserRaw) : null
        const isGuest = Boolean(localUser?.role === "guest" || String(localUser?.id || "").startsWith("guest-"))
        if (isGuest) return

        const res = await fetch("/api/student/runs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            practicalId: practical.id,
            practicalTitle: practical.title,
            simType: practical.simType,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) return
        if (cancelled) return
        if (data?.run?.id) {
          setRunId(String(data.run.id))
          setRunStartedAt(data.run.startedAt ? new Date(String(data.run.startedAt)) : new Date())
        }
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [practical])

  useEffect(() => {
    const onInclinedPlot = (event: Event) => {
      const custom = event as CustomEvent<{
        trials: number[]
        points: Array<{ id: number; x: number; y: number }>
        slope: number | null
        trackLength: number
      }>
      if (!custom.detail) return
      setInclinedPlotData(custom.detail)
    }
    window.addEventListener("inclined-plot-update", onInclinedPlot as EventListener)
    return () => window.removeEventListener("inclined-plot-update", onInclinedPlot as EventListener)
  }, [])

  const handleRun = () => {
    // Simulate hazard detection
    if (voltage[0] > 12 && mode === "hazard") {
      setShowSafetyWarning(true)
    } else {
      setIsRunning(true)
      setTimeout(() => setIsRunning(false), 3000)
    }
  }

  const handleProceed = () => {
    setShowSafetyWarning(false)
    setIsRunning(true)
    setTimeout(() => setIsRunning(false), 3000)
  }

  const handleSaveAttempt = () => {
    setShowSaveModal(true)
  }

  const buildFinishReadings = () => {
    const rows: Array<{ label: string; value: string }> = []

    if (practical?.simType === "ohms-law") {
      rows.push({ label: "Voltage", value: `${voltage?.[0] ?? "—"} V` })
      rows.push({ label: "Resistance", value: `${resistance?.[0] ?? "—"} Ω` })
    }

    if (practical?.simType === "vernier") {
      rows.push({ label: "Reading", value: `${vernierDisplayedReading ?? "—"} cm` })
      rows.push({ label: "Measured object", value: `${vernierDisplayedMeasured ?? "—"} cm` })
      rows.push({ label: "Zero error", value: `${vernierDisplayedZero ?? "—"} cm` })
    }

    if (practical?.simType === "screw-gauge") {
      rows.push({ label: "Reading", value: `${screwDisplayedReading ?? "—"} mm` })
      rows.push({ label: "Measured object", value: `${screwDisplayedMeasured ?? "—"} mm` })
      rows.push({ label: "Zero error", value: `${screwDisplayedZero ?? "—"} mm` })
    }

    if (practical?.simType === "inclined-plane") {
      rows.push({ label: "Angle", value: `${inclineAngle?.[0] ?? "—"}°` })
      rows.push({ label: "Track length", value: `${inclineLength?.[0] ?? "—"} m` })
      rows.push({ label: "Mass", value: `${inclineMass?.[0] ?? "—"} g` })
    }

    if (practical?.simType === "pendulum") {
      rows.push({ label: "Length", value: `${pendLength?.[0] ?? "—"} m` })
      rows.push({ label: "Angle", value: `${pendAngle?.[0] ?? "—"}°` })
      rows.push({ label: "Oscillations", value: `${pendCount?.[0] ?? "—"}` })
    }

    if (practical?.simType === "friction-block") {
      rows.push({ label: "Normal force", value: `${frictionNormal?.[0] ?? "—"} N` })
      rows.push({ label: "Limiting friction", value: `${frictionLimitingNow ?? "—"} N` })
      rows.push({ label: "μ", value: `${frictionMu?.[0] ?? "—"}` })
    }

    if (rows.length === 0) {
      rows.push({ label: "Setup", value: "Recorded" })
    }

    return rows
  }

  const buildFinishSummary = (readings: Array<{ label: string; value: string }>) => {
    const steps = practical?.steps || []
    const stepsText = steps.length
      ? steps.map((s, idx) => `${idx + 1}. ${s}`).join("\n")
      : "1. Set up the equipment\n2. Followed the procedure\n3. Recorded observations\n4. Verified the result"

    const readingsText = readings.map((r) => `- ${r.label}: ${r.value}`).join("\n")

    return `Experiment: ${practical?.title || "Experiment"}\n\nWhat you did (simple steps):\n${stepsText}\n\nYour current readings: \n${readingsText}\n\nOverall: You completed the experiment and recorded the key values. Review your readings and compare them with expected values in the instructions.`
  }

  const loadExistingFeedback = async () => {
    if (!practical?.id) return
    setLoadingFeedback(true)
    try {
      const res = await fetch(`/api/student/experiment-feedback?practicalId=${encodeURIComponent(practical.id)}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) return
      if (data?.feedback) {
        const r = Number(data.feedback.rating)
        if (Number.isFinite(r)) setFeedbackRating(Math.min(5, Math.max(1, Math.round(r))))
        setFeedbackComment(String(data.feedback.comment || ""))
      } else {
        setFeedbackRating(5)
        setFeedbackComment("")
      }
    } finally {
      setLoadingFeedback(false)
    }
  }

  const handleFinish = async () => {
    const readings = buildFinishReadings()
    const summary = buildFinishSummary(readings)
    setFinishReadings(readings)
    setFinishSummaryText(summary)

    if (runId) {
      try {
        const now = new Date()
        const started = runStartedAt || now
        const durationSec = Math.max(0, Math.round((now.getTime() - started.getTime()) / 1000))
        const metadata: any = {
          finish: {
            summary,
            readings,
          },
        }
        await fetch(`/api/student/runs/${runId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed", endedAt: now.toISOString(), durationSec, metadata }),
        })
      } catch {
        // ignore
      }
    }

    setShowFinishSummaryModal(true)
  }

  const handleProceedToFeedback = async () => {
    setShowFinishSummaryModal(false)
    await loadExistingFeedback()
    setShowFinishFeedbackModal(true)
  }

  const handleSubmitFeedback = async () => {
    if (!practical?.id) return
    setSavingFeedback(true)
    try {
      await fetch("/api/student/experiment-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practicalId: practical.id,
          practicalTitle: practical.title,
          rating: feedbackRating,
          comment: feedbackComment,
        }),
      })
      setShowFinishFeedbackModal(false)
      setShowFinishDoneModal(true)
    } finally {
      setSavingFeedback(false)
    }
  }

  const handleSubmitSaveAttempt = async () => {
    if (!runId) return
    setSavingRun(true)
    try {
      const now = new Date()
      const started = runStartedAt || now
      const durationSec = Math.max(0, Math.round((now.getTime() - started.getTime()) / 1000))

      const metadata: any = {
        notes: saveNotes,
        mode,
        parameters: {
          voltage: voltage?.[0],
          resistance: resistance?.[0],
          vernierSize: vernierSize?.[0],
          vernierZero: vernierZero?.[0],
          screwDiameter: screwDiameter?.[0],
          screwZero: screwZero?.[0],
          inclineAngle: inclineAngle?.[0],
          pendLength: pendLength?.[0],
          frictionMu: frictionMu?.[0],
        },
      }

      await fetch(`/api/student/runs/${runId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          endedAt: now.toISOString(),
          durationSec,
          metadata,
        }),
      })

      setShowSaveModal(false)
      setSaveNotes("")
    } finally {
      setSavingRun(false)
    }
  }

  const handleGoBack = () => {
    const returnTo = searchParams.get("returnTo")
    if (returnTo && returnTo.startsWith("/student/")) {
      router.push(returnTo)
      return
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
      return
    }
    router.push("/student/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">{practical?.title || "Experiment"}</h1>
            <p className="text-sm text-muted-foreground">{practical ? `${practical.subject} - Class ${practical.classLevel} - ${practical.level}` : "SmartLab"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          {practical?.simType !== "glass-slab" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border">
              <button
                onClick={() => setMode("hazard")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  mode === "hazard"
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                suppressHydrationWarning
              >
                Hazard Mode
              </button>
              <button
                onClick={() => setMode("grading")}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  mode === "grading"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                suppressHydrationWarning
              >
                Grading Mode
              </button>
            </div>
          )}

          {/* Controls */}
          <Button onClick={handleRun} disabled={isRunning} className="gap-2">
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Simulation
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={handleSaveAttempt}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="secondary" onClick={handleFinish} className="gap-2">
            <Flag className="w-4 h-4" />
            Finish
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Equipment */}
        <AnimatePresence mode="wait">
          {leftPanelOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-[360px] min-w-[360px] border-r border-border/50 bg-card/30 backdrop-blur flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h2 className="font-semibold">Equipment & Controls</h2>
                <Button variant="ghost" size="icon" onClick={() => setLeftPanelOpen(false)}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>

              <Tabs
                defaultValue={
                  practical?.simType === "screw-gauge" || practical?.simType === "vernier"
                    ? "parameters"
                    : "equipment"
                }
                className="flex-1 flex flex-col"
              >
                <TabsList className="mx-3 mt-2 w-[calc(100%-1.5rem)]">
                  {practical?.simType !== "screw-gauge" && practical?.simType !== "vernier" && (
                    <TabsTrigger value="equipment" className="flex-1">
                      Equipment
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="parameters" className="flex-1">
                    Parameters
                  </TabsTrigger>
                  <TabsTrigger value="saved" className="flex-1">
                    Saved
                  </TabsTrigger>
                </TabsList>

                {practical?.simType !== "screw-gauge" && practical?.simType !== "vernier" && (
                  <TabsContent value="equipment" className="flex-1 overflow-auto p-3">
                  {practical?.simType === "inclined-plane" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold">Plot Panel (2S vs T²)</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          This practical uses no drag equipment. Use this panel for trial data.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium">Slope (a)</div>
                        <div className="text-lg font-semibold mt-1">
                          {inclinedPlotData.slope !== null ? `${inclinedPlotData.slope.toFixed(3)} m/s²` : "--"}
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium mb-2">Trials</div>
                        {inclinedPlotData.points.length === 0 ? (
                          <div className="text-muted-foreground">No trials yet</div>
                        ) : (
                          <div className="space-y-1 text-muted-foreground">
                            {inclinedPlotData.points.map((p, i) => (
                              <div key={p.id}>
                                T{i + 1}: {inclinedPlotData.trials[i].toFixed(2)} s | T²: {p.x.toFixed(3)} | 2S: {p.y.toFixed(3)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : practical?.simType === "vernier" ? (
                    <VernierEquipment
                      highlightId={
                        practical?.simType === "vernier" && coachStep === 0 ? "vernier" : coachStep === 1 ? "cylinder" : undefined
                      }
                    />
                  ) : practical?.simType === "boiling-point" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "stand", label: "Iron Stand", icon: "🧰" },
                            { id: "beaker", label: "Beaker", icon: "🥛" },
                            { id: "thermometer", label: "Thermometer", icon: "🌡️" },
                            { id: "bottle", label: `${boilNames[boilSubstance[0]] ?? "Acetone"} Bottle`, icon: "🧴" },
                          ].map((e) => (
                            <div
                              key={e.id}
                              draggable
                              onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)}
                              className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center text-lg">
                                  {e.icon}
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Drag items directly into the middle workspace to auto-place them.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Setup Status</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { label: "Stand", ok: boilSetup.stand },
                            { label: "Beaker", ok: boilSetup.beaker },
                            { label: "Thermometer", ok: boilSetup.thermometer },
                            { label: "Bottle", ok: boilSetup.bottle },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`rounded-md border p-2 ${
                                item.ok
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                  : "border-border/60 bg-background/40 text-muted-foreground"
                              }`}
                            >
                              {item.ok ? `Placed: ${item.label}` : `Missing: ${item.label}`}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Beaker volume:</span>
                          <span className="font-semibold">{boilSetup.liquidMl} mL</span>
                        </div>
                        <Button
                          size="sm"
                          className="mt-2 w-full"
                          disabled={!boilSetup.beaker || !boilSetup.bottle || boilSetup.liquidMl >= 100}
                          onClick={() => {
                            setBoilSetup((s) => ({ ...s, pouring: true }))
                            setTimeout(() => {
                              setBoilSetup((s) => ({ ...s, pouring: false, liquidMl: Math.min(100, s.liquidMl + 20) }))
                            }, 900)
                          }}
                        >
                          Pour 20 mL
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() =>
                            setBoilSetup({
                              stand: false,
                              beaker: false,
                              thermometer: false,
                              bottle: false,
                              liquidMl: 0,
                              pouring: false,
                            })
                          }
                        >
                          Reset Setup
                        </Button>
                      </div>
                    </div>
                  ) : practical?.simType === "sublimation" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "stand", label: "Iron Stand", icon: "/icons/stand.svg" },
                            { id: "dish", label: "China Dish", icon: "/icons/dish.svg" },
                            { id: "funnel", label: "Inverted Funnel", icon: "/icons/funnel.svg" },
                            { id: "cotton", label: "Cotton Plug", icon: "/icons/cotton.svg" },
                            { id: "burner", label: "Burner", icon: "/icons/burner.svg" },
                          ].map((e) => (
                            <div
                              key={e.id}
                              draggable
                              onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)}
                              className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Drop items directly into the middle workspace to auto-place.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Setup Status</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { label: "Stand", ok: subSetup.stand },
                            { label: "Dish", ok: subSetup.dish },
                            { label: "Funnel", ok: subSetup.funnel },
                            { label: "Cotton", ok: subSetup.cotton },
                            { label: "Burner", ok: subSetup.burner },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`rounded-md border p-2 ${
                                item.ok
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                  : "border-border/60 bg-background/40 text-muted-foreground"
                              }`}
                            >
                              {item.ok ? `Placed: ${item.label}` : `Missing: ${item.label}`}
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() =>
                            setSubSetup({
                              stand: false,
                              dish: false,
                              funnel: false,
                              cotton: false,
                              burner: false,
                            })
                          }
                        >
                          Reset Setup
                        </Button>
                      </div>
                    </div>
                  ) : practical?.simType === "distillation" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "flask", label: "Distillation Flask", icon: "/icons/flask.svg" },
                            { id: "burner", label: "Burner", icon: "/icons/burner.svg" },
                            { id: "condenser", label: "Condenser", icon: "/icons/condenser.svg" },
                            { id: "receiver", label: "Receiver Flask", icon: "/icons/receiver.svg" },
                            { id: "thermometer", label: "Thermometer", icon: "/icons/thermometer.svg" },
                          ].map((e) => (
                            <div
                              key={e.id}
                              draggable
                              onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)}
                              className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Setup Status</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { label: "Flask", ok: distSetup.flask },
                            { label: "Burner", ok: distSetup.burner },
                            { label: "Condenser", ok: distSetup.condenser },
                            { label: "Receiver", ok: distSetup.receiver },
                            { label: "Thermometer", ok: distSetup.thermometer },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`rounded-md border p-2 ${
                                item.ok
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                  : "border-border/60 bg-background/40 text-muted-foreground"
                              }`}
                            >
                              {item.ok ? `Placed: ${item.label}` : `Missing: ${item.label}`}
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() =>
                            setDistSetup({
                              flask: false,
                              burner: false,
                              condenser: false,
                              receiver: false,
                              thermometer: false,
                            })
                          }
                        >
                          Reset Setup
                        </Button>
                      </div>
                    </div>
                  ) : practical?.simType === "temp-change" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "testTube", label: "Test Tube", icon: "/icons/testtube.svg" },
                            { id: "dropper", label: "Dropper", icon: "/icons/dropper.svg" },
                            { id: "thermometer", label: "Thermometer", icon: "/icons/thermometer.svg" },
                          ].map((e) => (
                            <div
                              key={e.id}
                              draggable
                              onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)}
                              className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Setup Status</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { label: "Test Tube", ok: tempSetup.testTube },
                            { label: "Dropper", ok: tempSetup.dropper },
                            { label: "Thermometer", ok: tempSetup.thermometer },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`rounded-md border p-2 ${
                                item.ok
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                  : "border-border/60 bg-background/40 text-muted-foreground"
                              }`}
                            >
                              {item.ok ? `Placed: ${item.label}` : `Missing: ${item.label}`}
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() =>
                            setTempSetup({
                              testTube: false,
                              dropper: false,
                              thermometer: false,
                            })
                          }
                        >
                          Reset Setup
                        </Button>
                      </div>
                    </div>
                  ) : practical?.simType === "solution-prep" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "balance", label: "Balance", icon: "/icons/balance.svg" },
                            { id: "beaker", label: "Beaker", icon: "/icons/dish.svg" },
                            { id: "flask", label: "Volumetric Flask", icon: "/icons/flask.svg" },
                            { id: "stirrer", label: "Stirrer", icon: "/icons/stirrer.svg" },
                          ].map((e) => (
                            <div
                              key={e.id}
                              draggable
                              onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)}
                              className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Setup Status</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { label: "Balance", ok: solSetup.balance },
                            { label: "Beaker", ok: solSetup.beaker },
                            { label: "Flask", ok: solSetup.flask },
                            { label: "Stirrer", ok: solSetup.stirrer },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`rounded-md border p-2 ${
                                item.ok
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                  : "border-border/60 bg-background/40 text-muted-foreground"
                              }`}
                            >
                              {item.ok ? `Placed: ${item.label}` : `Missing: ${item.label}`}
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() =>
                            setSolSetup({
                              balance: false,
                              beaker: false,
                              flask: false,
                              stirrer: false,
                            })
                          }
                        >
                          Reset Setup
                        </Button>
                      </div>
                    </div>
                  ) : practical?.simType === "dilution" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "pipette", label: "Pipette", icon: "/icons/dropper.svg" },
                            { id: "beaker", label: "Beaker", icon: "/icons/dish.svg" },
                            { id: "flask", label: "Volumetric Flask", icon: "/icons/flask.svg" },
                            { id: "cylinder", label: "Measuring Cylinder", icon: "/icons/testtube.svg" },
                          ].map((e) => (
                            <div
                              key={e.id}
                              draggable
                              onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)}
                              className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Setup Status</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { label: "Pipette", ok: dilSetup.pipette },
                            { label: "Beaker", ok: dilSetup.beaker },
                            { label: "Flask", ok: dilSetup.flask },
                            { label: "Cylinder", ok: dilSetup.cylinder },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className={`rounded-md border p-2 ${
                                item.ok
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                  : "border-border/60 bg-background/40 text-muted-foreground"
                              }`}
                            >
                              {item.ok ? `Placed: ${item.label}` : `Missing: ${item.label}`}
                            </div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() =>
                            setDilSetup({
                              pipette: false,
                              beaker: false,
                              flask: false,
                              cylinder: false,
                            })
                          }
                        >
                          Reset Setup
                        </Button>
                      </div>
                    </div>
                  ) : practical?.simType === "crystallization" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "beaker", label: "Beaker", icon: "/icons/dish.svg" },
                            { id: "burner", label: "Burner", icon: "/icons/burner.svg" },
                            { id: "dish", label: "China Dish", icon: "/icons/dish.svg" },
                            { id: "funnel", label: "Funnel", icon: "/icons/funnel.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "mixing" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "beakerA", label: "Beaker A", icon: "/icons/dish.svg" },
                            { id: "beakerB", label: "Beaker B", icon: "/icons/dish.svg" },
                            { id: "stirrer", label: "Stirrer", icon: "/icons/stirrer.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "solubility-temp" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "testTube", label: "Test Tube", icon: "/icons/testtube.svg" },
                            { id: "burner", label: "Burner", icon: "/icons/burner.svg" },
                            { id: "stirrer", label: "Stirrer", icon: "/icons/stirrer.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "conductivity" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "battery", label: "Battery", icon: "/icons/battery.svg" },
                            { id: "bulb", label: "Bulb", icon: "/icons/bulb.svg" },
                            { id: "electrodes", label: "Electrodes", icon: "/icons/wire.svg" },
                            { id: "beaker", label: "Beaker", icon: "/icons/dish.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "displacement" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "testTube", label: "Test Tube", icon: "/icons/testtube.svg" },
                            { id: "copperSulfate", label: "CuSO4 Solution", icon: "/icons/dish.svg" },
                            { id: "ironNail", label: "Iron Nail", icon: "/icons/wire.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "temp-drop" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "beaker", label: "Beaker", icon: "/icons/dish.svg" },
                            { id: "thermometer", label: "Thermometer", icon: "/icons/thermometer.svg" },
                            { id: "stirrer", label: "Stirrer", icon: "/icons/stirrer.svg" },
                            { id: "solute", label: "Solute jar", icon: "/icons/bottle.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "combination" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "crucible", label: "Crucible", icon: "/icons/dish.svg" },
                            { id: "burner", label: "Burner", icon: "/icons/burner.svg" },
                            { id: "tongs", label: "Tongs", icon: "/icons/wire.svg" },
                            { id: "reactantA", label: "Reactant A", icon: "/icons/bottle.svg" },
                            { id: "reactantB", label: "Reactant B", icon: "/icons/bottle.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "decomposition" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "testTube", label: "Test Tube", icon: "/icons/testtube.svg" },
                            { id: "burner", label: "Burner", icon: "/icons/burner.svg" },
                            { id: "deliveryTube", label: "Delivery tube", icon: "/icons/wire.svg" },
                            { id: "testReagent", label: "Test reagent", icon: "/icons/bottle.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "single-displacement" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "testTube", label: "Test Tube", icon: "/icons/testtube.svg" },
                            { id: "saltSolution", label: "Salt solution", icon: "/icons/dish.svg" },
                            { id: "metalStrip", label: "Metal strip", icon: "/icons/wire.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "ph-paper" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "beaker", label: "Beaker", icon: "/icons/dish.svg" },
                            { id: "dropper", label: "Dropper", icon: "/icons/dropper.svg" },
                            { id: "paper", label: "pH paper", icon: "/icons/paper.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "indicator-panel" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "testTube", label: "Test Tube", icon: "/icons/testtube.svg" },
                            { id: "dropper", label: "Dropper", icon: "/icons/dropper.svg" },
                            { id: "indicators", label: "Indicators", icon: "/icons/bottle.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "qualitative-organic" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "testTube", label: "Test Tube", icon: "/icons/testtube.svg" },
                            { id: "dropper", label: "Dropper", icon: "/icons/dropper.svg" },
                            { id: "waterBath", label: "Water bath", icon: "/icons/dish.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "unsaturation-test" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "testTube", label: "Test Tube", icon: "/icons/testtube.svg" },
                            { id: "dropper", label: "Dropper", icon: "/icons/dropper.svg" },
                            { id: "reagentBottle", label: "Reagent bottle", icon: "/icons/bottle.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "water-softening" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold mb-2">Drag Equipment</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {[
                            { id: "beaker", label: "Beaker", icon: "/icons/dish.svg" },
                            { id: "soap", label: "Soap", icon: "/icons/bottle.svg" },
                            { id: "softener", label: "Softener", icon: "/icons/bottle.svg" },
                            { id: "stirrer", label: "Stirrer", icon: "/icons/stirrer.svg" },
                          ].map((e) => (
                            <div key={e.id} draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)} className="rounded-md border border-border/60 bg-background/50 p-2 cursor-grab active:cursor-grabbing">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md border border-border/50 bg-card/60 flex items-center justify-center overflow-hidden">
                                  <img src={e.icon || "/placeholder.svg"} alt={e.label} className="h-8 w-8 object-contain" />
                                </div>
                                <div className="leading-tight">
                                  <div className="font-medium">{e.label}</div>
                                  <div className="text-[11px] text-muted-foreground">Drag to workspace</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "pendulum" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold">Pendulum Setup (3D)</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          The simulation includes a retort stand, clamp, string, bob and timer panel. This practical does
                          not require drag-drop equipment placement.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium mb-1">What to do</div>
                        <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                          <li>Set length and small release angle in Parameters.</li>
                          <li>Run multiple trials for fixed oscillation count.</li>
                          <li>Use average period to calculate g.</li>
                        </ul>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium mb-1">Equipment used</div>
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>Retort stand</div>
                          <div>Clamp</div>
                          <div>String</div>
                          <div>Metal bob</div>
                          <div>Virtual stopwatch</div>
                          <div>Readings panel</div>
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "glass-slab" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold">Optics Tray (3D)</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          This simulation provides a glass slab, incident ray, normals, refracted ray and emergent ray.
                          No drag-drop setup is required for this practical.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium mb-1">Equipment used</div>
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>Glass slab</div>
                          <div>Ray source</div>
                          <div>Normal lines</div>
                          <div>Observation board</div>
                          <div>Angle readings</div>
                          <div>Observation table</div>
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "vector-forces" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold">Force Table Setup</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use Parameters to set two forces (magnitudes + angles). The green vector shows the equilibrant.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium mb-1">Equipment used</div>
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>Force table</div>
                          <div>Center ring</div>
                          <div>Mass hangers</div>
                          <div>Protractor</div>
                          <div>Pulleys + strings</div>
                          <div>Equilibrant (vector)</div>
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "moments" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold">Principle of Moments Setup</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use Parameters to set known/unknown weights and their positions. Balance is shown by the beam tilt.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium mb-1">Equipment used</div>
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>Meter beam</div>
                          <div>Knife edge pivot</div>
                          <div>Weight hangers</div>
                          <div>Scale markings</div>
                          <div>Support stand</div>
                          <div>Balancing indicator</div>
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "spring-extension" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold">Load–Extension Setup</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use Parameters to change load and spring constant. Record extension and plot load vs extension.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium mb-1">Equipment used</div>
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>Retort stand</div>
                          <div>Helical spring</div>
                          <div>Scale + pointer</div>
                          <div>Slotted weights</div>
                          <div>Hook + hanger</div>
                          <div>Observation table</div>
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "archimedes-density" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold">Archimedes Density Setup</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use Parameters to set mass and volume. Use the button in the simulation to immerse/lift the body.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium mb-1">Equipment used</div>
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>Spring balance</div>
                          <div>Eureka can</div>
                          <div>Water</div>
                          <div>Solid body</div>
                          <div>String</div>
                          <div>Reading scale</div>
                        </div>
                      </div>
                    </div>
                  ) : practical?.simType === "heating-curve" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                        <div className="text-sm font-semibold">Temperature vs Time Setup</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Use Parameters for heat rate and time. Use Start/Stop Heating in the simulation and record readings.
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm">
                        <div className="font-medium mb-1">Equipment used</div>
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>Beaker</div>
                          <div>Burner</div>
                          <div>Thermometer</div>
                          <div>Ice/water sample</div>
                          <div>Stopwatch</div>
                          <div>Graph sheet</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EquipmentDrawer />
                  )}
                  </TabsContent>
                )}

                <TabsContent value="parameters" className="flex-1 overflow-auto p-3 space-y-5">
                  {practical?.simType === "vernier" && (
                    <>
                      <div className={`space-y-3 ${coachStep === 2 ? "ring-2 ring-primary/40 rounded-lg p-2" : ""}`}>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Object size (cm)</label>
                          <span className="text-sm text-muted-foreground">{vernierSize[0].toFixed(2)} cm</span>
                        </div>
                        <Slider value={vernierSize} onValueChange={setVernierSize} min={0.5} max={10} step={0.01} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Zero error (cm)</label>
                          <span className="text-sm text-muted-foreground">{vernierZero[0].toFixed(2)} cm</span>
                        </div>
                        <Slider value={vernierZero} onValueChange={setVernierZero} min={-0.1} max={0.1} step={0.01} />
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                        <div className="text-sm font-semibold mb-1">Live Reading</div>
                        <div className="text-2xl font-bold">{vernierLiveReading.toFixed(2)} cm</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reading = measured size + zero error
                        </p>
                      </div>
                    </>
                  )}

                  {practical?.simType === "screw-gauge" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Object diameter (mm)</label>
                          <span className="text-sm text-muted-foreground">{screwDiameter[0].toFixed(2)} mm</span>
                        </div>
                        <Slider value={screwDiameter} onValueChange={setScrewDiameter} min={0.1} max={5} step={0.01} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Zero error (mm)</label>
                          <span className="text-sm text-muted-foreground">{screwZero[0].toFixed(3)} mm</span>
                        </div>
                        <Slider value={screwZero} onValueChange={setScrewZero} min={-0.05} max={0.05} step={0.005} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">MSD count</label>
                          <span className="text-sm text-muted-foreground">{screwMsdCount[0]}</span>
                        </div>
                        <Slider value={screwMsdCount} onValueChange={setScrewMsdCount} min={10} max={50} step={5} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">CSD count</label>
                          <span className="text-sm text-muted-foreground">{screwCsdCount[0]}</span>
                        </div>
                        <Slider value={screwCsdCount} onValueChange={setScrewCsdCount} min={25} max={100} step={5} />
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                        <div className="text-sm font-semibold mb-1">Live Reading</div>
                        <div className="text-2xl font-bold">{screwDisplayedReading.toFixed(3)} mm</div>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <div>
                            Formula: Corrected = MSR + (CSR x LC) - zero error
                          </div>
                          <div>
                            MSR: {screwDisplayedMsr.toFixed(3)} mm
                          </div>
                          <div>
                            CSR: {screwDisplayedCsr}
                          </div>
                          <div>
                            LC: {screwDisplayedLc.toFixed(4)} mm
                          </div>
                          <div>
                            Measured: {screwDisplayedMeasured.toFixed(3)} mm
                          </div>
                          <div>
                            Zero error: {screwDisplayedZero.toFixed(3)} mm
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {practical?.simType === "ohms-law" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Voltage (V)</label>
                          <span className="text-sm text-muted-foreground">{voltage[0]}V</span>
                        </div>
                        <Slider value={voltage} onValueChange={setVoltage} min={0} max={20} step={0.5} className="w-full" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Resistance (ohms)</label>
                          <span className="text-sm text-muted-foreground">{resistance[0]} ohms</span>
                        </div>
                        <Slider value={resistance} onValueChange={setResistance} min={10} max={500} step={10} className="w-full" />
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <h3 className="text-sm font-medium mb-3">Calculated Values</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current (I)</span>
                            <span className="font-medium">{(voltage[0] / resistance[0]).toFixed(3)} A</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Power (P)</span>
                            <span className="font-medium">{((voltage[0] * voltage[0]) / resistance[0]).toFixed(3)} W</span>
                          </div>
                        </div>
                      </div>

                      {voltage[0] > 12 && (
                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-500">Warning</p>
                            <p className="text-muted-foreground">High voltage detected. Proceed with caution.</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {practical?.simType === "inclined-plane" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Angle (deg)</label>
                          <span className="text-sm text-muted-foreground">{inclineAngle[0]}°</span>
                        </div>
                        <Slider value={inclineAngle} onValueChange={setInclineAngle} min={5} max={45} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Track length (m)</label>
                          <span className="text-sm text-muted-foreground">{inclineLength[0].toFixed(1)} m</span>
                        </div>
                        <Slider value={inclineLength} onValueChange={setInclineLength} min={0.5} max={2} step={0.1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Ball mass (g)</label>
                          <span className="text-sm text-muted-foreground">{inclineMass[0]} g</span>
                        </div>
                        <Slider value={inclineMass} onValueChange={setInclineMass} min={20} max={200} step={5} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "pendulum" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Length (m)</label>
                          <span className="text-sm text-muted-foreground">{pendLength[0].toFixed(2)} m</span>
                        </div>
                        <Slider value={pendLength} onValueChange={setPendLength} min={0.2} max={2} step={0.05} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Release angle (deg)</label>
                          <span className="text-sm text-muted-foreground">{pendAngle[0]}°</span>
                        </div>
                        <Slider value={pendAngle} onValueChange={setPendAngle} min={3} max={20} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Oscillations timed</label>
                          <span className="text-sm text-muted-foreground">{pendCount[0]}</span>
                        </div>
                        <Slider value={pendCount} onValueChange={setPendCount} min={5} max={30} step={1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "glass-slab" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Incident angle (deg)</label>
                          <span className="text-sm text-muted-foreground">{glassIncident[0]}°</span>
                        </div>
                        <Slider value={glassIncident} onValueChange={setGlassIncident} min={10} max={75} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Refractive index (glass)</label>
                          <span className="text-sm text-muted-foreground">{glassN[0].toFixed(2)}</span>
                        </div>
                        <Slider value={glassN} onValueChange={setGlassN} min={1.3} max={1.8} step={0.01} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Slab thickness (cm)</label>
                          <span className="text-sm text-muted-foreground">{glassThickness[0].toFixed(1)} cm</span>
                        </div>
                        <Slider value={glassThickness} onValueChange={setGlassThickness} min={1} max={6} step={0.1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "concave-mirror" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Mirror radius (cm)</label>
                          <span className="text-sm text-muted-foreground">{mirrorRadius[0].toFixed(1)} cm</span>
                        </div>
                        <Slider value={mirrorRadius} onValueChange={setMirrorRadius} min={8} max={30} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Pin depth setting (cm)</label>
                          <span className="text-sm text-muted-foreground">{mirrorPinDepth[0].toFixed(1)} cm</span>
                        </div>
                        <Slider value={mirrorPinDepth} onValueChange={setMirrorPinDepth} min={0.5} max={5} step={0.1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Water depth (cm)</label>
                          <span className="text-sm text-muted-foreground">{mirrorWaterDepth[0].toFixed(1)} cm</span>
                        </div>
                        <Slider value={mirrorWaterDepth} onValueChange={setMirrorWaterDepth} min={0.5} max={5} step={0.1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "prism-critical" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Prism refractive index</label>
                          <span className="text-sm text-muted-foreground">{prismCriticalN[0].toFixed(2)}</span>
                        </div>
                        <Slider value={prismCriticalN} onValueChange={setPrismCriticalN} min={1.3} max={1.8} step={0.01} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Incidence in prism (deg)</label>
                          <span className="text-sm text-muted-foreground">{prismCriticalI[0]}°</span>
                        </div>
                        <Slider value={prismCriticalI} onValueChange={setPrismCriticalI} min={20} max={80} step={1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "prism-deviation" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Prism angle A (deg)</label>
                          <span className="text-sm text-muted-foreground">{prismDevA[0]}°</span>
                        </div>
                        <Slider value={prismDevA} onValueChange={setPrismDevA} min={30} max={70} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Prism refractive index</label>
                          <span className="text-sm text-muted-foreground">{prismDevN[0].toFixed(2)}</span>
                        </div>
                        <Slider value={prismDevN} onValueChange={setPrismDevN} min={1.3} max={1.8} step={0.01} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Incidence angle i (deg)</label>
                          <span className="text-sm text-muted-foreground">{prismDevI[0]}°</span>
                        </div>
                        <Slider value={prismDevI} onValueChange={setPrismDevI} min={20} max={80} step={1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "convex-lens" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Object distance u (cm)</label>
                          <span className="text-sm text-muted-foreground">{lensObjectDistance[0].toFixed(1)} cm</span>
                        </div>
                        <Slider value={lensObjectDistance} onValueChange={setLensObjectDistance} min={15} max={100} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Lens power (D)</label>
                          <span className="text-sm text-muted-foreground">{lensPower[0].toFixed(1)} D</span>
                        </div>
                        <Slider value={lensPower} onValueChange={setLensPower} min={1} max={10} step={0.1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Object height (cm)</label>
                          <span className="text-sm text-muted-foreground">{lensObjectHeight[0].toFixed(1)} cm</span>
                        </div>
                        <Slider value={lensObjectHeight} onValueChange={setLensObjectHeight} min={1} max={10} step={0.5} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "series-circuit" && (
                    <>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Voltage (V)</label><span className="text-sm text-muted-foreground">{seriesVoltage[0].toFixed(1)} V</span></div><Slider value={seriesVoltage} onValueChange={setSeriesVoltage} min={1} max={20} step={0.5} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">R1 (Ω)</label><span className="text-sm text-muted-foreground">{seriesR1[0].toFixed(0)} Ω</span></div><Slider value={seriesR1} onValueChange={setSeriesR1} min={10} max={500} step={10} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">R2 (Ω)</label><span className="text-sm text-muted-foreground">{seriesR2[0].toFixed(0)} Ω</span></div><Slider value={seriesR2} onValueChange={setSeriesR2} min={10} max={500} step={10} /></div>
                    </>
                  )}
                  {practical?.simType === "parallel-circuit" && (
                    <>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Voltage (V)</label><span className="text-sm text-muted-foreground">{parallelVoltage[0].toFixed(1)} V</span></div><Slider value={parallelVoltage} onValueChange={setParallelVoltage} min={1} max={20} step={0.5} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">R1 (Ω)</label><span className="text-sm text-muted-foreground">{parallelR1[0].toFixed(0)} Ω</span></div><Slider value={parallelR1} onValueChange={setParallelR1} min={10} max={500} step={10} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">R2 (Ω)</label><span className="text-sm text-muted-foreground">{parallelR2[0].toFixed(0)} Ω</span></div><Slider value={parallelR2} onValueChange={setParallelR2} min={10} max={500} step={10} /></div>
                    </>
                  )}
                  {practical?.simType === "field-lines" && (
                    <>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Magnet strength</label><span className="text-sm text-muted-foreground">{fieldStrength[0].toFixed(1)}</span></div><Slider value={fieldStrength} onValueChange={setFieldStrength} min={0.5} max={3} step={0.1} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Probe X</label><span className="text-sm text-muted-foreground">{fieldProbeX[0].toFixed(1)}</span></div><Slider value={fieldProbeX} onValueChange={setFieldProbeX} min={-1.5} max={1.5} step={0.1} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Probe Y</label><span className="text-sm text-muted-foreground">{fieldProbeY[0].toFixed(1)}</span></div><Slider value={fieldProbeY} onValueChange={setFieldProbeY} min={-1.5} max={1.5} step={0.1} /></div>
                    </>
                  )}
                  {practical?.simType === "logic-gates" && (
                    <>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Gate type (0=AND,1=OR,2=NOT)</label><span className="text-sm text-muted-foreground">{logicGateType[0]}</span></div><Slider value={logicGateType} onValueChange={setLogicGateType} min={0} max={2} step={1} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Input A</label><span className="text-sm text-muted-foreground">{logicA[0]}</span></div><Slider value={logicA} onValueChange={setLogicA} min={0} max={1} step={1} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Input B</label><span className="text-sm text-muted-foreground">{logicB[0]}</span></div><Slider value={logicB} onValueChange={setLogicB} min={0} max={1} step={1} /></div>
                    </>
                  )}
                  {practical?.simType === "flame-test" && (
                    <>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Sample (0-4)</label><span className="text-sm text-muted-foreground">{flameSample[0]}</span></div><Slider value={flameSample} onValueChange={setFlameSample} min={0} max={4} step={1} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Flame intensity</label><span className="text-sm text-muted-foreground">{flameIntensity[0].toFixed(1)}</span></div><Slider value={flameIntensity} onValueChange={setFlameIntensity} min={0.5} max={2} step={0.1} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Wire clean (0/1)</label><span className="text-sm text-muted-foreground">{flameWireClean[0]}</span></div><Slider value={flameWireClean} onValueChange={setFlameWireClean} min={0} max={1} step={1} /></div>
                    </>
                  )}
                  {practical?.simType === "titration" && (
                    <>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Analyte (0=NaOH,1=HCl,2=Na2CO3,3=Oxalic)</label><span className="text-sm text-muted-foreground">{titrAnalyte[0]}</span></div><Slider value={titrAnalyte} onValueChange={setTitrAnalyte} min={0} max={3} step={1} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Analyte M</label><span className="text-sm text-muted-foreground">{titrAnalyteM[0].toFixed(2)} M</span></div><Slider value={titrAnalyteM} onValueChange={setTitrAnalyteM} min={0.05} max={0.5} step={0.01} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Titrant M</label><span className="text-sm text-muted-foreground">{titrantM[0].toFixed(2)} M</span></div><Slider value={titrantM} onValueChange={setTitrantM} min={0.05} max={0.5} step={0.01} /></div>
                      <div className="space-y-3"><div className="flex items-center justify-between"><label className="text-sm font-medium">Aliquot (mL)</label><span className="text-sm text-muted-foreground">{titrAliquot[0].toFixed(0)} mL</span></div><Slider value={titrAliquot} onValueChange={setTitrAliquot} min={10} max={50} step={1} /></div>
                    </>
                  )}
                  {practical?.simType === "friction-block" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Normal load (N)</label>
                          <span className="text-sm text-muted-foreground">{frictionNormal[0].toFixed(1)} N</span>
                        </div>
                        <Slider value={frictionNormal} onValueChange={setFrictionNormal} min={2} max={20} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Pull force (N)</label>
                          <span className="text-sm text-muted-foreground">{frictionForce[0].toFixed(1)} N</span>
                        </div>
                        <Slider value={frictionForce} onValueChange={setFrictionForce} min={0} max={20} step={0.5} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Surface μ</label>
                          <span className="text-sm text-muted-foreground">{frictionMu[0].toFixed(2)}</span>
                        </div>
                        <Slider value={frictionMu} onValueChange={setFrictionMu} min={0.2} max={0.8} step={0.05} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Target distance (m)</label>
                          <span className="text-sm text-muted-foreground">{frictionTargetDistance[0].toFixed(2)} m</span>
                        </div>
                        <Slider value={frictionTargetDistance} onValueChange={setFrictionTargetDistance} min={0.5} max={3} step={0.1} />
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 space-y-3">
                        <div className="text-sm font-semibold">Record (N, F_lim)</div>
                        <div className="text-xs text-muted-foreground">
                          Current pair: N = {frictionNormal[0].toFixed(2)} N, F_lim = {frictionLimitingNow.toFixed(3)} N
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              setFrictionPairs((prev) => [
                                ...prev,
                                { n: Number(frictionNormal[0].toFixed(3)), flim: frictionLimitingNow },
                              ])
                            }
                          >
                            Record Pair
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setFrictionPairs([])}>
                            Clear
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Slope (F_lim vs N): {frictionSlope !== null ? frictionSlope.toFixed(3) : "--"} (≈ μ)
                        </div>
                        <div className="max-h-40 overflow-auto rounded border border-border/50 p-2 text-xs">
                          {frictionPairs.length === 0 ? (
                            <div className="text-muted-foreground">No pairs recorded yet.</div>
                          ) : (
                            <table className="w-full">
                              <thead className="text-muted-foreground">
                                <tr>
                                  <th className="text-left py-1">#</th>
                                  <th className="text-left py-1">N</th>
                                  <th className="text-left py-1">F_lim</th>
                                </tr>
                              </thead>
                              <tbody>
                                {frictionPairs.map((p, i) => (
                                  <tr key={`${p.n}-${p.flim}-${i}`} className="border-t border-border/40">
                                    <td className="py-1">{i + 1}</td>
                                    <td className="py-1">{p.n.toFixed(3)}</td>
                                    <td className="py-1">{p.flim.toFixed(3)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {practical?.simType === "vector-forces" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Force A (N)</label>
                          <span className="text-sm text-muted-foreground">{forceA[0].toFixed(1)} N</span>
                        </div>
                        <Slider value={forceA} onValueChange={setForceA} min={1} max={10} step={0.5} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Angle A (deg)</label>
                          <span className="text-sm text-muted-foreground">{angleA[0]}°</span>
                        </div>
                        <Slider value={angleA} onValueChange={setAngleA} min={0} max={180} step={5} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Force B (N)</label>
                          <span className="text-sm text-muted-foreground">{forceB[0].toFixed(1)} N</span>
                        </div>
                        <Slider value={forceB} onValueChange={setForceB} min={1} max={10} step={0.5} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Angle B (deg)</label>
                          <span className="text-sm text-muted-foreground">{angleB[0]}°</span>
                        </div>
                        <Slider value={angleB} onValueChange={setAngleB} min={0} max={180} step={5} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "moments" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Unknown weight (N)</label>
                          <span className="text-sm text-muted-foreground">{momentUnknown[0].toFixed(1)} N</span>
                        </div>
                        <Slider value={momentUnknown} onValueChange={setMomentUnknown} min={1} max={10} step={0.5} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Unknown position (cm)</label>
                          <span className="text-sm text-muted-foreground">{momentUnknownPos[0]} cm</span>
                        </div>
                        <Slider value={momentUnknownPos} onValueChange={setMomentUnknownPos} min={10} max={40} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Known weight (N)</label>
                          <span className="text-sm text-muted-foreground">{momentKnown[0].toFixed(1)} N</span>
                        </div>
                        <Slider value={momentKnown} onValueChange={setMomentKnown} min={1} max={10} step={0.5} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Known position (cm)</label>
                          <span className="text-sm text-muted-foreground">{momentKnownPos[0]} cm</span>
                        </div>
                        <Slider value={momentKnownPos} onValueChange={setMomentKnownPos} min={60} max={90} step={1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "spring-extension" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Load (N)</label>
                          <span className="text-sm text-muted-foreground">{springLoad[0].toFixed(1)} N</span>
                        </div>
                        <Slider value={springLoad} onValueChange={setSpringLoad} min={0} max={20} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Spring constant k (N/m)</label>
                          <span className="text-sm text-muted-foreground">{springK[0].toFixed(1)} N/m</span>
                        </div>
                        <Slider value={springK} onValueChange={setSpringK} min={5} max={50} step={1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "archimedes-density" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Mass (g)</label>
                          <span className="text-sm text-muted-foreground">{archMass[0].toFixed(0)} g</span>
                        </div>
                        <Slider value={archMass} onValueChange={setArchMass} min={20} max={500} step={10} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Volume (cm³)</label>
                          <span className="text-sm text-muted-foreground">{archVolume[0].toFixed(0)} cm³</span>
                        </div>
                        <Slider value={archVolume} onValueChange={setArchVolume} min={10} max={300} step={5} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "heating-curve" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Heat rate (°C/min)</label>
                          <span className="text-sm text-muted-foreground">{heatRate[0]} °C/min</span>
                        </div>
                        <Slider value={heatRate} onValueChange={setHeatRate} min={1} max={10} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Total time (min)</label>
                          <span className="text-sm text-muted-foreground">{heatTime[0]} min</span>
                        </div>
                        <Slider value={heatTime} onValueChange={setHeatTime} min={5} max={30} step={1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "mixture-separation" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Iron fraction (%)</label>
                          <span className="text-sm text-muted-foreground">{ironFraction[0]}%</span>
                        </div>
                        <Slider value={ironFraction} onValueChange={setIronFraction} min={10} max={90} step={5} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "melting-point" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Temperature (°C)</label>
                          <span className="text-sm text-muted-foreground">{meltTemp[0]}°C</span>
                        </div>
                        <Slider value={meltTemp} onValueChange={setMeltTemp} min={20} max={120} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Sample purity (%)</label>
                          <span className="text-sm text-muted-foreground">{meltPurity[0]}%</span>
                        </div>
                        <Slider value={meltPurity} onValueChange={setMeltPurity} min={70} max={100} step={5} />
                      </div>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                        <div className="text-sm font-semibold mb-2">Attempts (Melt Start)</div>
                        {meltAttempts.length === 0 ? (
                          <div className="text-sm text-muted-foreground">No readings yet</div>
                        ) : (
                          <div className="space-y-1 text-sm">
                            {meltAttempts.map((v, i) => (
                              <div key={`melt-attempt-${i}`} className="flex items-center justify-between">
                                <span className="text-muted-foreground">Attempt {i + 1}</span>
                                <span className="font-medium">{v.toFixed(1)}°C</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="border-t border-border/50 pt-2 mt-2 flex items-center justify-between">
                          <span className="font-semibold">Mean</span>
                          <span className="text-lg font-bold">{meltMean !== null ? `${meltMean.toFixed(1)}°C` : "--"}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {practical?.simType === "boiling-point" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Heat rate (°C/min)</label>
                          <span className="text-sm text-muted-foreground">{boilRate[0]} °C/min</span>
                        </div>
                        <Slider value={boilRate} onValueChange={setBoilRate} min={1} max={10} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Substance</label>
                          <span className="text-sm text-muted-foreground">{boilNames[boilSubstance[0]] ?? "Acetone"}</span>
                        </div>
                        <Slider value={boilSubstance} onValueChange={setBoilSubstance} min={0} max={2} step={1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "sublimation" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Heat rate (x)</label>
                          <span className="text-sm text-muted-foreground">{subHeatRate[0]}x</span>
                        </div>
                        <Slider value={subHeatRate} onValueChange={setSubHeatRate} min={1} max={10} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Sample mass (g)</label>
                          <span className="text-sm text-muted-foreground">{subSampleMass[0].toFixed(1)} g</span>
                        </div>
                        <Slider value={subSampleMass} onValueChange={setSubSampleMass} min={2} max={20} step={0.5} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "distillation" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Heat rate (x)</label>
                          <span className="text-sm text-muted-foreground">{distHeatRate[0]}x</span>
                        </div>
                        <Slider value={distHeatRate} onValueChange={setDistHeatRate} min={1} max={10} step={1} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Alcohol in feed (%)</label>
                          <span className="text-sm text-muted-foreground">{distAlcoholPct[0]}%</span>
                        </div>
                        <Slider value={distAlcoholPct} onValueChange={setDistAlcoholPct} min={10} max={90} step={5} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "temp-change" && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Water volume (mL)</label>
                          <span className="text-sm text-muted-foreground">{tempWaterMl[0].toFixed(0)} mL</span>
                        </div>
                        <Slider value={tempWaterMl} onValueChange={setTempWaterMl} min={5} max={30} step={1} />
                      </div>
                    </>
                  )}
                  {practical?.simType === "solution-prep" && (
                    <>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                        <div className="text-sm font-semibold mb-1">Preparation mode</div>
                        <p className="text-xs text-muted-foreground">
                          Target molarity/volume is read from practical title. Use equipment workflow and run preparation.
                        </p>
                      </div>
                    </>
                  )}
                  {practical?.simType === "dilution" && (
                    <>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                        <div className="text-sm font-semibold mb-1">Dilution mode</div>
                        <p className="text-xs text-muted-foreground">
                          C1, C2 and V2 are read from the practical title. Run the workflow to transfer aliquot and make up volume.
                        </p>
                      </div>
                    </>
                  )}
                  {practical?.simType === "crystallization" && (
                    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                      <div className="text-sm font-semibold mb-1">Crystallization setup</div>
                      <p className="text-xs text-muted-foreground">
                        Assemble beaker, burner, funnel and dish in workspace, then run the staged crystallization process.
                      </p>
                    </div>
                  )}
                  {practical?.simType === "mixing" && (
                    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                      <div className="text-sm font-semibold mb-1">Mixing experiment</div>
                      <p className="text-xs text-muted-foreground">
                        Place both beakers and stirrer, then compare miscible and immiscible liquid behavior in real time.
                      </p>
                    </div>
                  )}
                  {practical?.simType === "solubility-temp" && (
                    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                      <div className="text-sm font-semibold mb-1">Solubility vs Temperature</div>
                      <p className="text-xs text-muted-foreground">
                        Set up test tube, burner and stirrer to observe dissolution and precipitation with heating/cooling.
                      </p>
                    </div>
                  )}
                  {practical?.simType === "conductivity" && (
                    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                      <div className="text-sm font-semibold mb-1">Conductivity circuit</div>
                      <p className="text-xs text-muted-foreground">
                        Place battery, bulb, electrodes and beaker, then test solutions for electrical conduction.
                      </p>
                    </div>
                  )}
                  {practical?.simType === "displacement" && (
                    <div className="rounded-lg border border-border/60 bg-card/40 p-4">
                      <div className="text-sm font-semibold mb-1">Displacement reaction</div>
                      <p className="text-xs text-muted-foreground">
                        Place test tube, copper sulfate solution and iron nail to observe gradual displacement and color change.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="saved" className="flex-1 overflow-auto p-3">
                  {savedSetups.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No saved setups yet</p>
                      <Button variant="link" size="sm" className="mt-2" onClick={handleSaveCurrentSetup}>
                        Save current setup
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Saved setups</div>
                        <Button size="sm" variant="outline" onClick={handleSaveCurrentSetup}>
                          Save current setup
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {savedSetups.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-lg border border-border/60 bg-card/40 p-3 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{s.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(s.at).toLocaleString()} {s.simType ? `• ${s.simType}` : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button size="sm" onClick={() => applySavedSetup(s)}>
                                Load
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => persistSavedSetups(savedSetups.filter((x) => x.id !== s.id))}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Center Panel - Lab Canvas */}
        <div className="flex-1 flex flex-col relative overflow-y-auto min-h-0">
          {/* Toggle Left Panel Button */}
          {!leftPanelOpen && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLeftPanelOpen(true)}
              className="absolute top-4 left-4 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {/* Toggle Right Panel Button */}
          {!rightPanelOpen && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setRightPanelOpen(true)}
              className="absolute top-4 right-4 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          {/* Status Bar */}
          {practical?.simType !== "vernier" &&
            practical?.simType !== "screw-gauge" &&
            practical?.simType !== "inclined-plane" &&
            practical?.simType !== "glass-slab" && (
            <div className="p-3 border-b border-border/50 bg-card/30 backdrop-blur flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant={isRunning ? "default" : "outline"} className="gap-1">
                  <Activity className="w-3 h-3" />
                  {isRunning ? "Simulation Running" : "Ready"}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Zap className="w-3 h-3" />
                  {mode === "hazard" ? "Hazard Detection ON" : "Grading Mode"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Camera Controls:</span>
                <kbd className="px-2 py-0.5 rounded bg-muted text-xs">Mouse Drag</kbd>
                <kbd className="px-2 py-0.5 rounded bg-muted text-xs">Scroll</kbd>
              </div>
            </div>
          )}

          {/* Canvas / Simulation */}
          <div className="flex-1 relative bg-gradient-to-b from-background to-muted/20 p-4">
            {practical?.simType === "vernier" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="text-sm font-semibold">Step {coachStep + 1} of 5</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {simConfigs.vernier?.procedure?.[coachStep] || "Follow the procedure in the guide panel."}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setCoachStep((s) => Math.max(0, s - 1))}>
                      Previous
                    </Button>
                    <Button size="sm" onClick={() => setCoachStep((s) => Math.min(4, s + 1))}>
                      Next step
                    </Button>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 overflow-hidden bg-card/40 h-[560px]">
                  <iframe
                    ref={vernierFrameRef}
                    title="Vernier Local Experiment"
                    src="/sims/vernier-demo/vernier_calliper.html"
                    className="w-full h-full border-0"
                    allow="fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    onLoad={() => {
                      const frame = vernierFrameRef.current
                      if (!frame?.contentWindow) return
                      frame.contentWindow.postMessage(
                        {
                          type: "SMARTLAB_SET_VERNIER",
                          payload: {
                            sizeCm: vernierSize[0],
                            zeroErrorCm: vernierZero[0],
                          },
                        },
                        window.location.origin,
                      )
                    }}
                  />
                </div>
              </div>
            )}
            {practical?.simType === "screw-gauge" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="text-sm font-semibold">Step {screwStep + 1} of 5</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {simConfigs["screw-gauge"]?.procedure?.[screwStep] || "Follow the procedure in the guide panel."}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setScrewStep((s) => Math.max(0, s - 1))}>
                      Previous
                    </Button>
                    <Button size="sm" onClick={() => setScrewStep((s) => Math.min(4, s + 1))}>
                      Next step
                    </Button>
                  </div>
                </div>
                <div className="rounded-xl border border-border/60 overflow-hidden bg-card/40 h-[560px]">
                  <iframe
                    ref={micrometerFrameRef}
                    title="Micrometer Local Experiment"
                    src="/sims/micrometer-demo/micrometer.html"
                    className="w-full h-full border-0"
                    allow="fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    onLoad={() => {
                      const frame = micrometerFrameRef.current
                      if (!frame?.contentWindow) return
                      frame.contentWindow.postMessage(
                        {
                          type: "SMARTLAB_SET_MICROMETER",
                          payload: {
                            diameterMm: screwDiameter[0],
                            zeroErrorMm: screwZero[0],
                            msdCount: screwMsdCount[0],
                            csdCount: screwCsdCount[0],
                          },
                        },
                        window.location.origin,
                      )
                    }}
                  />
                </div>
              </div>
            )}
            {practical?.simType === "ohms-law" && (
              <OhmsLawSim
                voltage={voltage[0]}
                resistance={resistance[0]}
                onVoltageChange={(v) => setVoltage([v])}
                onResistanceChange={(v) => setResistance([v])}
              />
            )}
            {practical?.simType === "inclined-plane" && (
              <InclinedPlaneSim
                angleDeg={inclineAngle[0]}
                trackLength={inclineLength[0]}
                ballMass={inclineMass[0]}
              />
            )}
            {practical?.simType === "pendulum" && (
              <PendulumSim
                lengthM={pendLength[0]}
                releaseAngleDeg={pendAngle[0]}
                oscillationCount={pendCount[0]}
              />
            )}
            {practical?.simType === "glass-slab" && (
              <GlassSlabSim
                incidentAngleDeg={glassIncident[0]}
                refractiveIndex={glassN[0]}
                slabThicknessCm={glassThickness[0]}
              />
            )}
            {practical?.simType === "concave-mirror" && (
              <ConcaveMirrorWaterSim
                radiusCm={mirrorRadius[0]}
                depthCm={mirrorPinDepth[0]}
                waterDepthCm={mirrorWaterDepth[0]}
              />
            )}
            {practical?.simType === "prism-critical" && (
              <PrismCriticalSim
                prismN={prismCriticalN[0]}
                incidenceDeg={prismCriticalI[0]}
              />
            )}
            {practical?.simType === "prism-deviation" && (
              <PrismDeviationSim
                prismAngleDeg={prismDevA[0]}
                prismN={prismDevN[0]}
                incidenceDeg={prismDevI[0]}
              />
            )}
            {practical?.simType === "convex-lens" && (
              <ConvexLensSim
                objectDistanceCm={lensObjectDistance[0]}
                lensPowerD={lensPower[0]}
                objectHeightCm={lensObjectHeight[0]}
              />
            )}
            {practical?.simType === "series-circuit" && (
              <SeriesCircuitSim
                voltage={seriesVoltage[0]}
                r1={seriesR1[0]}
                r2={seriesR2[0]}
              />
            )}
            {practical?.simType === "parallel-circuit" && (
              <ParallelCircuitSim
                voltage={parallelVoltage[0]}
                r1={parallelR1[0]}
                r2={parallelR2[0]}
              />
            )}
            {practical?.simType === "field-lines" && (
              <FieldLinesSim
                magnetStrength={fieldStrength[0]}
                probeX={fieldProbeX[0]}
                probeY={fieldProbeY[0]}
              />
            )}
            {practical?.simType === "logic-gates" && (
              <LogicGatesSim
                gate={logicGateType[0] === 0 ? "AND" : logicGateType[0] === 1 ? "OR" : "NOT"}
                a={(logicA[0] ? 1 : 0) as 0 | 1}
                b={(logicB[0] ? 1 : 0) as 0 | 1}
              />
            )}
            {practical?.simType === "flame-test" && (
              <FlameTestSim
                sample={flameSample[0] === 0 ? "Na" : flameSample[0] === 1 ? "K" : flameSample[0] === 2 ? "Ca" : flameSample[0] === 3 ? "Ba" : "Cu"}
                intensity={flameIntensity[0]}
                wireClean={Boolean(flameWireClean[0])}
              />
            )}
            {practical?.simType === "titration" && (
              <TitrationSim
                analyte={titrAnalyte[0] === 0 ? "NaOH" : titrAnalyte[0] === 1 ? "HCl" : titrAnalyte[0] === 2 ? "Na2CO3" : "Oxalic"}
                analyteM={titrAnalyteM[0]}
                titrantM={titrantM[0]}
                aliquotMl={titrAliquot[0]}
                practicalId={practical?.id}
                practicalTitle={practical?.title}
              />
            )}
            {/* Class 10 Chemistry (SSC) Dedicated Simulations */}
            {practical?.simType === "naoh-standardization" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <NaOHStandardizationSim />
              </div>
            )}
            {practical?.simType === "hcl-standardization" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <HClStandardizationSim />
              </div>
            )}
            {practical?.simType === "na2co3-molarity" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <Na2CO3MolaritySim />
              </div>
            )}
            {practical?.simType === "oxalic-molarity" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <OxalicMolaritySim />
              </div>
            )}
            {practical?.simType === "weak-acids" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <WeakAcidsSim />
              </div>
            )}
            {practical?.simType === "classify-substances" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <ClassifySubstancesSim />
              </div>
            )}
            {practical?.simType === "aldehyde-identification" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <AldehydeIdentificationSim />
              </div>
            )}
            {practical?.simType === "ketone-identification" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <KetoneIdentificationSim />
              </div>
            )}
            {practical?.simType === "carboxylic-acid-identification" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <CarboxylicAcidIdentificationSim />
              </div>
            )}
            {practical?.simType === "phenol-identification" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <PhenolIdentificationSim />
              </div>
            )}
            {practical?.simType === "kmno4-unsaturation" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <KMnO4UnsaturationSim />
              </div>
            )}
            {practical?.simType === "sugar-decomposition" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <SugarDecompositionSim />
              </div>
            )}
            {practical?.simType === "friction-block" && (
              <div className="space-y-4">
                <FrictionBlockSim
                  normalLoad={frictionNormal[0]}
                  pullForce={frictionForce[0]}
                  mu={frictionMu[0]}
                  targetDistance={frictionTargetDistance[0]}
                />
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="text-sm font-semibold">Step {frictionStep + 1} of 5</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {simConfigs["friction-block"]?.procedure?.[frictionStep] || "Follow the procedure in the guide panel."}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setFrictionStep((s) => Math.max(0, s - 1))}>
                      Previous
                    </Button>
                    <Button size="sm" onClick={() => setFrictionStep((s) => Math.min(4, s + 1))}>
                      Next step
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {practical?.simType === "vector-forces" && (
              <VectorForcesSim
                forceA={forceA[0]}
                angleA={angleA[0]}
                forceB={forceB[0]}
                angleB={angleB[0]}
              />
            )}
            {practical?.simType === "moments" && (
              <MomentsSim
                unknownW={momentUnknown[0]}
                unknownPos={momentUnknownPos[0]}
                knownW={momentKnown[0]}
                knownPos={momentKnownPos[0]}
              />
            )}
            {practical?.simType === "spring-extension" && (
              <SpringExtensionSim
                load={springLoad[0]}
                k={springK[0]}
              />
            )}
            {practical?.simType === "archimedes-density" && (
              <ArchimedesDensitySim
                massG={archMass[0]}
                volumeCm3={archVolume[0]}
              />
            )}
            {practical?.simType === "incline-force" && (
              <InclineForceSim
                angleDeg={inclineAngle[0]}
                massKg={inclineMass[0] / 1000}
              />
            )}
            {practical?.simType === "flywheel" && (
              <FlywheelSim
                flywheelMass={2.5}
                flywheelRadius={0.15}
                hangingMass={flywheelHangingMass[0] / 1000}
                dropHeight={flywheelDropHeight[0] / 100}
              />
            )}
            {practical?.simType === "viscosity" && (
              <ViscositySim
                sphereRadius={viscositySphereRadius[0]}
                sphereDensity={viscositySphereDensity[0]}
                fluidViscosity={viscosityFluidViscosity[0]}
              />
            )}
            {practical?.simType === "melde" && (
              <MeldeSim
                stringLength={meldeStringLength[0]}
                tension={meldeTension[0]}
                massPerUnitLength={meldeMassPerLength[0]}
              />
            )}
            {practical?.simType === "string-vibration" && (
              <StringVibrationSim
                stringLength={stringVibLength[0]}
                tension={stringVibTension[0]}
                massPerUnitLength={stringVibMassPerLength[0]}
              />
            )}
            {practical?.simType === "resonance-tube" && (
              <ResonanceTubeSim
                tuningForkFreq={resonanceForkFreq[0]}
                tubeDiameter={resonanceTubeDiameter[0]}
              />
            )}
            {practical?.simType === "gravimetric-analysis" && (
              <GravimetricAnalysisSim
                initialMass={0.5}
                precipitateMass={0.233}
              />
            )}
            {practical?.simType === "gas-diffusion" && (
              <GasDiffusionSim
                gas1="HCl"
                gas2="NH3"
              />
            )}
            {practical?.simType === "chromatography" && (
              <ChromatographySim
                sampleType={id?.includes("inks") ? "inks" : "ions"}
              />
            )}
            {practical?.simType === "evaporation-cooling" && (
              <EvaporationCoolingSim
                initialTemp={28}
                humidity={60}
              />
            )}
            {practical?.simType === "common-ion" && (
              <CommonIonEffectSim
                initialConcentration={6.1}
              />
            )}
            {practical?.simType === "le-chatelier" && (
              <LeChatelierSim
                initialConcentration={0.1}
              />
            )}
            {practical?.simType === "heating-curve" && (
              <HeatingCurveSim
                heatRate={heatRate[0]}
                totalTime={heatTime[0]}
              />
            )}
            {practical?.simType === "mixture-separation" && (
              <MixtureSeparationSim
                ironFraction={ironFraction[0]}
              />
            )}
            {practical?.simType === "melting-point" && (
              <MeltingPointSim
                temperature={meltTemp[0]}
                purity={meltPurity[0]}
                substance={practical?.title}
                onRecordReading={(t) => setMeltAttempts((prev) => [...prev, t])}
                onClearReadings={() => setMeltAttempts([])}
              />
            )}
            {practical?.simType === "boiling-point" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "stand" || item === "beaker" || item === "thermometer" || item === "bottle") {
                    setBoilSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop equipment here to auto-place in scene.
                </div>
                <BoilingPointSim
                  heatRate={boilRate[0]}
                  substanceIndex={boilSubstance[0]}
                  setup={boilSetup}
                />
              </div>
            )}
            {practical?.simType === "sublimation" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "stand" || item === "dish" || item === "funnel" || item === "cotton" || item === "burner") {
                    setSubSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop sublimation equipment here to auto-place in scene.
                </div>
                <SublimationSim
                  heatRate={subHeatRate[0]}
                  sampleMass={subSampleMass[0]}
                  setup={subSetup}
                  substanceTitle={practical?.title}
                />
              </div>
            )}
            {practical?.simType === "distillation" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "flask" || item === "burner" || item === "condenser" || item === "receiver" || item === "thermometer") {
                    setDistSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop distillation equipment here to auto-place in scene.
                </div>
                <DistillationSim
                  heatRate={distHeatRate[0]}
                  alcoholPercent={distAlcoholPct[0]}
                  setup={distSetup}
                />
              </div>
            )}
            {practical?.simType === "temp-change" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "testTube" || item === "dropper" || item === "thermometer") {
                    setTempSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop reaction setup here.
                </div>
                <TempChangeSim
                  waterMl={tempWaterMl[0]}
                  setup={tempSetup}
                  practicalId={practical?.id}
                  practicalTitle={practical?.title}
                />
              </div>
            )}
            {practical?.simType === "solution-prep" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "balance" || item === "beaker" || item === "flask" || item === "stirrer") {
                    setSolSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop solution-preparation setup here.
                </div>
                <SolutionPrepSim
                  title={practical?.title || ""}
                  setup={solSetup}
                />
              </div>
            )}
            {practical?.simType === "dilution" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "pipette" || item === "beaker" || item === "flask" || item === "cylinder") {
                    setDilSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop dilution setup here.
                </div>
                <DilutionSim
                  title={practical?.title || ""}
                  setup={dilSetup}
                />
              </div>
            )}
            {practical?.simType === "crystallization" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "beaker" || item === "burner" || item === "dish" || item === "funnel") {
                    setCrysSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop crystallization apparatus here to auto-place in scene.
                </div>
                <CrystallizationSim
                  setup={crysSetup}
                  practicalId={practical?.id}
                  practicalTitle={practical?.title}
                />
              </div>
            )}
            {practical?.simType === "mixing" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "beakerA" || item === "beakerB" || item === "stirrer") {
                    setMixSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop mixing apparatus here to auto-place in scene.
                </div>
                <MixingSim
                  setup={mixSetup}
                  practicalId={practical?.id}
                  practicalTitle={practical?.title}
                />
              </div>
            )}
            {practical?.simType === "solubility-temp" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "testTube" || item === "burner" || item === "stirrer") {
                    setSolTempSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop solubility apparatus here to auto-place in scene.
                </div>
                <SolubilityTempSim
                  setup={solTempSetup}
                  practicalId={practical?.id}
                  practicalTitle={practical?.title}
                />
              </div>
            )}
            {practical?.simType === "conductivity" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "battery" || item === "bulb" || item === "electrodes" || item === "beaker") {
                    setCondSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop conductivity setup here to auto-place in scene.
                </div>
                <ConductivitySim setup={condSetup} />
              </div>
            )}
            {practical?.simType === "displacement" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "testTube" || item === "copperSulfate" || item === "ironNail") {
                    setDispSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">
                  Drop reaction items here to auto-place in scene.
                </div>
                <DisplacementSim setup={dispSetup} />
              </div>
            )}
            {practical?.simType === "temp-drop" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "beaker" || item === "thermometer" || item === "stirrer" || item === "solute") {
                    setTempDropSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">Drop beaker, thermometer, stirrer and solute here.</div>
                <TempDropSim setup={tempDropSetup} />
              </div>
            )}
            {practical?.simType === "combination" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "crucible" || item === "burner" || item === "tongs" || item === "reactantA" || item === "reactantB") {
                    setCombSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">Drop crucible, burner, tongs, and both reactants here.</div>
                <CombinationSim setup={combSetup} />
              </div>
            )}
            {practical?.simType === "decomposition" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "testTube" || item === "burner" || item === "deliveryTube" || item === "testReagent") {
                    setDecompSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">Drop test tube, burner, delivery tube, and test reagent here.</div>
                <DecompositionSim setup={decompSetup} />
              </div>
            )}
            {practical?.simType === "single-displacement" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "testTube" || item === "saltSolution" || item === "metalStrip") {
                    setSingleDispSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">Drop test tube, salt solution, and metal strip here.</div>
                <SingleDisplacementSim setup={singleDispSetup} />
              </div>
            )}
            {practical?.simType === "ph-paper" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "beaker" || item === "dropper" || item === "paper") {
                    setPhSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">Drop beaker, dropper, and pH paper here.</div>
                <PhPaperSim setup={phSetup} />
              </div>
            )}
            {practical?.simType === "indicator-panel" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "testTube" || item === "dropper" || item === "indicators") {
                    setIndicatorSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">Drop test tube, dropper, and indicators here.</div>
                <IndicatorPanelSim setup={indicatorSetup} />
              </div>
            )}
            {practical?.simType === "qualitative-organic" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "testTube" || item === "dropper" || item === "waterBath") {
                    setQualOrgSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">Drop test tube, dropper, and water bath here.</div>
                <QualitativeOrganicSim setup={qualOrgSetup} />
              </div>
            )}
            {practical?.simType === "unsaturation-test" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "testTube" || item === "dropper" || item === "reagentBottle") {
                    setUnsatSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">Drop test tube, dropper, and reagent bottle here.</div>
                <UnsaturationTestSim setup={unsatSetup} />
              </div>
            )}
            {practical?.simType === "water-softening" && (
              <div
                onDragOver={(ev) => ev.preventDefault()}
                onDrop={(ev) => {
                  ev.preventDefault()
                  const item = ev.dataTransfer.getData("text/plain")
                  if (!item) return
                  if (item === "beaker" || item === "soap" || item === "softener" || item === "stirrer") {
                    setSoftSetup((s) => ({ ...s, [item]: true } as typeof s))
                  }
                }}
                className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2"
              >
                <div className="px-2 pb-2 text-xs text-muted-foreground">Drop beaker, soap, softener, and stirrer here.</div>
                <WaterSofteningSim setup={softSetup} />
              </div>
            )}
            {/* Class 12 Physics Simulations */}
            {practical?.simType === "mechanical-heat" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <MechanicalHeatSim />
              </div>
            )}
            {practical?.simType === "specific-heat-solid" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <SpecificHeatSolidSim />
              </div>
            )}
            {practical?.simType === "rc-time-constant" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <RCTimeConstantSim />
              </div>
            )}
            {practical?.simType === "slide-wire-bridge" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <SlideWireBridgeSim />
              </div>
            )}
            {practical?.simType === "voltmeter-resistance" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <VoltmeterResistanceSim />
              </div>
            )}
            {practical?.simType === "voltmeter-capacitor-discharge" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <VoltmeterCapacitorDischargeSim />
              </div>
            )}
            {practical?.simType === "thermistor" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <ThermistorSim />
              </div>
            )}
            {practical?.simType === "internal-resistance-cell" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <InternalResistanceCellSim />
              </div>
            )}
            {practical?.simType === "emf-cell-potentiometer" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <EMFCellPotentiometerSim />
              </div>
            )}
            {practical?.simType === "vi-graph-cell" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <VIGraphCellSim />
              </div>
            )}
            {practical?.simType === "tungsten-filament" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <TungstenFilamentSim />
              </div>
            )}
            {practical?.simType === "galvanometer-voltmeter" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <GalvanometerVoltmeterSim />
              </div>
            )}
            {practical?.simType === "capacitance-ac" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <CapacitanceACSim />
              </div>
            )}
            {practical?.simType === "impedance-rl" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <ImpedanceRLSim />
              </div>
            )}
            {practical?.simType === "impedance-rc" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <ImpedanceRCSim />
              </div>
            )}
            {practical?.simType === "diode-iv" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <DiodeIVSim />
              </div>
            )}
            {practical?.simType === "photocell" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <PhotocellSim />
              </div>
            )}

            {/* Class 12 Chemistry Simulations */}
            {practical?.simType === "acid-standardization" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <AcidStandardizationSim />
              </div>
            )}
            {practical?.simType === "naoh-percentage" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <NaohPercentageSim />
              </div>
            )}
            {practical?.simType === "na2co3-purity" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <Na2co3PuritySim />
              </div>
            )}
            {practical?.simType === "water-crystallization" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <WaterCrystallizationSim />
              </div>
            )}
            {practical?.simType === "oxalic-solubility" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <OxalicSolubilitySim />
              </div>
            )}
            {practical?.simType === "heat-neutralization" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <HeatNeutralizationSim />
              </div>
            )}
            {practical?.simType === "kmno4-standardization" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <Kmno4StandardizationSim />
              </div>
            )}
            {practical?.simType === "iron-estimation" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <IronEstimationSim />
              </div>
            )}
            {practical?.simType === "mixture-composition" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <MixtureCompositionSim />
              </div>
            )}
            {practical?.simType === "mohr-salt-solubility" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <MohrSaltSolubilitySim />
              </div>
            )}
            {practical?.simType === "qualitative-analysis" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <QualitativeAnalysisSim />
              </div>
            )}
            {practical?.simType === "nickel-dmg" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <NickelDmgSim />
              </div>
            )}
            {practical?.simType === "ethylene-preparation" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <EthylenePreparationSim />
              </div>
            )}
            {practical?.simType === "iodoform" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <IodoformSim />
              </div>
            )}
            {practical?.simType === "glucosazone" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <GlucosazoneSim />
              </div>
            )}
            {practical?.simType === "protein-denaturation" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <ProteinDenaturationSim />
              </div>
            )}
            {practical?.simType === "starch-digestion" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <StarchDigestionSim />
              </div>
            )}
            {practical?.simType === "iodine-number" && (
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2">
                <IodineNumberSim />
              </div>
            )}

            {!practical?.simType && <div className="text-muted-foreground">Simulation not configured.</div>}
          </div>
        </div>

        {/* Right Panel - AI Tutor & Readings */}
        <AnimatePresence mode="wait">
          {rightPanelOpen && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-96 border-l border-border/50 bg-card/30 backdrop-blur flex flex-col min-h-0"
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h2 className="font-semibold">Assistant & Data</h2>
                <Button variant="ghost" size="icon" onClick={() => setRightPanelOpen(false)}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <Tabs defaultValue={practical?.simType === "spring-extension" ? "graph" : "tutor"} className="flex-1 flex flex-col min-h-0">
                <TabsList className="mx-4 mt-2">
                  {practical?.simType === "spring-extension" && (
                    <TabsTrigger value="graph" className="flex-1">
                      📈 Graph
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="tutor" className="flex-1">
                    AI Tutor
                  </TabsTrigger>
                  <TabsTrigger value="guide" className="flex-1">
                    Guide
                  </TabsTrigger>
                  <TabsTrigger value="readings" className="flex-1">
                    Readings
                  </TabsTrigger>
                  <TabsTrigger value="warnings" className="flex-1">
                    Warnings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="graph" className="flex-1 overflow-auto p-4">
                  {practical?.simType === "spring-extension" && (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-muted-foreground">Load vs Extension Graph</div>
                      <LoadExtensionGraph
                        load={springLoad[0]}
                        extension={springLoad[0] / Math.max(springK[0], 0.01)}
                        k={springK[0]}
                      />
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-xs">
                        <div className="font-medium mb-1">Hooke's Law</div>
                        <p className="text-muted-foreground">
                          Extension is directly proportional to applied load.
                        </p>
                        <p className="text-blue-400 mt-1 font-mono">F = kx</p>
                        <p className="text-muted-foreground mt-2">
                          Where:<br/>
                          F = Force (Load)<br/>
                          k = Spring constant<br/>
                          x = Extension
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tutor" className="flex-1 min-h-0 overflow-hidden">
                  <AITutorPanel experimentId={id} labState={tutorLabState} />
                </TabsContent>

                <TabsContent value="guide" className="flex-1 overflow-auto p-4">
                  {practical ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-sm">Procedure</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                          {(simConfigs[practical.simType]?.procedure || practical.steps || []).map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                        {coachHint && (
                          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
                            <span className="font-semibold text-primary">Coach:</span>{" "}
                            <span className="text-muted-foreground">{coachHint}</span>
                          </div>
                        )}
                        {screwHint && (
                          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
                            <span className="font-semibold text-primary">Coach:</span>{" "}
                            <span className="text-muted-foreground">{screwHint}</span>
                          </div>
                        )}
                        {frictionHint && (
                          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
                            <span className="font-semibold text-primary">Coach:</span>{" "}
                            <span className="text-muted-foreground">{frictionHint}</span>
                          </div>
                        )}
                        {practical.simType === "vernier" && (
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCoachStep((s) => Math.max(0, s - 1))}
                            >
                              Previous
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setCoachStep((s) => Math.min(4, s + 1))}
                            >
                              Next step
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Step {coachStep + 1} of 5
                            </span>
                          </div>
                        )}
                        {practical.simType === "screw-gauge" && (
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setScrewStep((s) => Math.max(0, s - 1))}
                            >
                              Previous
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setScrewStep((s) => Math.min(4, s + 1))}
                            >
                              Next step
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Step {screwStep + 1} of 5
                            </span>
                          </div>
                        )}
                        {practical.simType === "friction-block" && (
                          <div className="mt-3 flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setFrictionStep((s) => Math.max(0, s - 1))}
                            >
                              Previous
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setFrictionStep((s) => Math.min(4, s + 1))}
                            >
                              Next step
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Step {frictionStep + 1} of 5
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Theory</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {(simConfigs[practical.simType]?.theory || []).map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Hazards</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {(simConfigs[practical.simType]?.hazards || []).map((t, idx) => (
                            <li key={idx}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No guide available.</p>
                  )}
                </TabsContent>

                <TabsContent value="readings" className="flex-1 overflow-auto p-4">
                  {practical?.simType === "vernier" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Measured length</div>
                      <div className="text-2xl font-bold">{vernierSize[0].toFixed(2)} cm</div>
                      <div className="text-sm text-muted-foreground">Zero error</div>
                      <div className="text-lg font-semibold">{vernierZero[0].toFixed(2)} cm</div>
                    </div>
                  )}
                  {practical?.simType === "screw-gauge" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Measured diameter</div>
                      <div className="text-2xl font-bold">{screwDiameter[0].toFixed(2)} mm</div>
                      <div className="text-sm text-muted-foreground">Zero error</div>
                      <div className="text-lg font-semibold">{screwZero[0].toFixed(3)} mm</div>
                    </div>
                  )}
                    {practical?.simType === "inclined-plane" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Angle</div>
                        <div className="text-2xl font-bold">{inclineAngle[0]}°</div>
                        <div className="text-sm text-muted-foreground">Track length</div>
                        <div className="text-lg font-semibold">{inclineLength[0].toFixed(1)} m</div>
                        <div className="text-sm text-muted-foreground">Ball mass</div>
                        <div className="text-lg font-semibold">{inclineMass[0]} g</div>
                      </div>
                    )}
                    {practical?.simType === "pendulum" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Length</div>
                        <div className="text-2xl font-bold">{pendLength[0].toFixed(2)} m</div>
                        <div className="text-sm text-muted-foreground">Release angle</div>
                        <div className="text-lg font-semibold">{pendAngle[0]}°</div>
                        <div className="text-sm text-muted-foreground">Oscillations timed</div>
                        <div className="text-lg font-semibold">{pendCount[0]}</div>
                      </div>
                    )}
                    {practical?.simType === "glass-slab" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Incident angle</div>
                        <div className="text-2xl font-bold">{glassIncident[0]}°</div>
                        <div className="text-sm text-muted-foreground">Refractive index</div>
                        <div className="text-lg font-semibold">{glassN[0].toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Thickness</div>
                        <div className="text-lg font-semibold">{glassThickness[0].toFixed(1)} cm</div>
                      </div>
                    )}
                    {practical?.simType === "concave-mirror" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Mirror radius</div>
                        <div className="text-2xl font-bold">{mirrorRadius[0].toFixed(1)} cm</div>
                        <div className="text-sm text-muted-foreground">Pin depth</div>
                        <div className="text-lg font-semibold">{mirrorPinDepth[0].toFixed(1)} cm</div>
                        <div className="text-sm text-muted-foreground">Water depth</div>
                        <div className="text-lg font-semibold">{mirrorWaterDepth[0].toFixed(1)} cm</div>
                        <div className="text-sm text-muted-foreground">Expected n (water)</div>
                        <div className="text-lg font-semibold">~1.33</div>
                      </div>
                    )}
                    {practical?.simType === "prism-critical" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Prism n</div>
                        <div className="text-2xl font-bold">{prismCriticalN[0].toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Incidence</div>
                        <div className="text-lg font-semibold">{prismCriticalI[0]}°</div>
                        <div className="text-sm text-muted-foreground">Critical angle c</div>
                        <div className="text-lg font-semibold">
                          {(Math.asin(1 / prismCriticalN[0]) * 180 / Math.PI).toFixed(2)}°
                        </div>
                      </div>
                    )}
                    {practical?.simType === "prism-deviation" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Prism angle A</div>
                        <div className="text-2xl font-bold">{prismDevA[0]}°</div>
                        <div className="text-sm text-muted-foreground">Prism n</div>
                        <div className="text-lg font-semibold">{prismDevN[0].toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Incidence i</div>
                        <div className="text-lg font-semibold">{prismDevI[0]}°</div>
                      </div>
                    )}
                    {practical?.simType === "convex-lens" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Object distance u</div>
                        <div className="text-2xl font-bold">{lensObjectDistance[0].toFixed(1)} cm</div>
                        <div className="text-sm text-muted-foreground">Lens power</div>
                        <div className="text-lg font-semibold">{lensPower[0].toFixed(1)} D</div>
                        <div className="text-sm text-muted-foreground">Focal length f</div>
                        <div className="text-lg font-semibold">{(100 / lensPower[0]).toFixed(2)} cm</div>
                      </div>
                    )}
                    {practical?.simType === "series-circuit" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Voltage</div>
                        <div className="text-2xl font-bold">{seriesVoltage[0].toFixed(1)} V</div>
                        <div className="text-sm text-muted-foreground">Req (series)</div>
                        <div className="text-lg font-semibold">{(seriesR1[0] + seriesR2[0]).toFixed(1)} Ω</div>
                      </div>
                    )}
                    {practical?.simType === "parallel-circuit" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Voltage</div>
                        <div className="text-2xl font-bold">{parallelVoltage[0].toFixed(1)} V</div>
                        <div className="text-sm text-muted-foreground">Req (parallel)</div>
                        <div className="text-lg font-semibold">
                          {(1 / (1 / parallelR1[0] + 1 / parallelR2[0])).toFixed(1)} Ω
                        </div>
                      </div>
                    )}
                    {practical?.simType === "field-lines" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Magnet strength</div>
                        <div className="text-2xl font-bold">{fieldStrength[0].toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Probe</div>
                        <div className="text-lg font-semibold">({fieldProbeX[0].toFixed(1)}, {fieldProbeY[0].toFixed(1)})</div>
                      </div>
                    )}
                    {practical?.simType === "logic-gates" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Gate</div>
                        <div className="text-2xl font-bold">{logicGateType[0] === 0 ? "AND" : logicGateType[0] === 1 ? "OR" : "NOT"}</div>
                        <div className="text-sm text-muted-foreground">Inputs</div>
                        <div className="text-lg font-semibold">A={logicA[0]} B={logicB[0]}</div>
                      </div>
                    )}
                    {practical?.simType === "flame-test" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Sample index</div>
                        <div className="text-2xl font-bold">{flameSample[0]}</div>
                        <div className="text-sm text-muted-foreground">Wire clean</div>
                        <div className="text-lg font-semibold">{flameWireClean[0] ? "Yes" : "No"}</div>
                      </div>
                    )}
                    {practical?.simType === "titration" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Analyte index</div>
                        <div className="text-2xl font-bold">{titrAnalyte[0]}</div>
                        <div className="text-sm text-muted-foreground">M (analyte / titrant)</div>
                        <div className="text-lg font-semibold">{titrAnalyteM[0].toFixed(2)} / {titrantM[0].toFixed(2)} M</div>
                      </div>
                    )}
                    {practical?.simType === "friction-block" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Normal load</div>
                      <div className="text-2xl font-bold">{frictionNormal[0].toFixed(1)} N</div>
                      <div className="text-sm text-muted-foreground">Pull force</div>
                      <div className="text-lg font-semibold">{frictionForce[0].toFixed(1)} N</div>
                      <div className="text-sm text-muted-foreground">Surface μ</div>
                      <div className="text-lg font-semibold">{frictionMu[0].toFixed(2)}</div>
                    </div>
                  )}
                  {practical?.simType === "vector-forces" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Force A</div>
                      <div className="text-2xl font-bold">{forceA[0].toFixed(1)} N @ {angleA[0]}°</div>
                      <div className="text-sm text-muted-foreground">Force B</div>
                      <div className="text-lg font-semibold">{forceB[0].toFixed(1)} N @ {angleB[0]}°</div>
                    </div>
                  )}
                  {practical?.simType === "moments" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Unknown</div>
                      <div className="text-2xl font-bold">{momentUnknown[0].toFixed(1)} N @ {momentUnknownPos[0]} cm</div>
                      <div className="text-sm text-muted-foreground">Known</div>
                      <div className="text-lg font-semibold">{momentKnown[0].toFixed(1)} N @ {momentKnownPos[0]} cm</div>
                    </div>
                  )}
                  {practical?.simType === "spring-extension" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Load</div>
                      <div className="text-2xl font-bold">{springLoad[0].toFixed(1)} N</div>
                      <div className="text-sm text-muted-foreground">Spring constant</div>
                      <div className="text-lg font-semibold">{springK[0].toFixed(1)} N/m</div>
                    </div>
                  )}
                  {practical?.simType === "archimedes-density" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Mass</div>
                      <div className="text-2xl font-bold">{archMass[0].toFixed(0)} g</div>
                      <div className="text-sm text-muted-foreground">Volume</div>
                      <div className="text-lg font-semibold">{archVolume[0].toFixed(0)} cm³</div>
                      <div className="text-sm text-muted-foreground">Density</div>
                      <div className="text-lg font-semibold">{(archMass[0] / archVolume[0]).toFixed(2)} g/cm³</div>
                    </div>
                  )}
                  {practical?.simType === "heating-curve" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Heat rate</div>
                      <div className="text-2xl font-bold">{heatRate[0]} °C/min</div>
                      <div className="text-sm text-muted-foreground">Total time</div>
                      <div className="text-lg font-semibold">{heatTime[0]} min</div>
                    </div>
                  )}
                  {practical?.simType === "mixture-separation" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Iron fraction</div>
                      <div className="text-2xl font-bold">{ironFraction[0]}%</div>
                      <div className="text-sm text-muted-foreground">Sand fraction</div>
                      <div className="text-lg font-semibold">{100 - ironFraction[0]}%</div>
                    </div>
                  )}
                  {practical?.simType === "melting-point" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Temperature</div>
                      <div className="text-2xl font-bold">{meltTemp[0]}°C</div>
                      <div className="text-sm text-muted-foreground">Purity</div>
                      <div className="text-lg font-semibold">{meltPurity[0]}%</div>
                    </div>
                  )}
                  {practical?.simType === "boiling-point" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Heat rate</div>
                      <div className="text-2xl font-bold">{boilRate[0]} °C/min</div>
                      <div className="text-sm text-muted-foreground">Substance</div>
                      <div className="text-lg font-semibold">{boilNames[boilSubstance[0]] ?? "Acetone"}</div>
                    </div>
                  )}
                  {practical?.simType === "sublimation" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Heat rate</div>
                      <div className="text-2xl font-bold">{subHeatRate[0]}x</div>
                      <div className="text-sm text-muted-foreground">Sample mass</div>
                      <div className="text-lg font-semibold">{subSampleMass[0].toFixed(1)} g</div>
                      <div className="text-sm text-muted-foreground">Setup complete</div>
                      <div className="text-lg font-semibold">
                        {[subSetup.stand, subSetup.dish, subSetup.funnel, subSetup.cotton, subSetup.burner].every(Boolean) ? "Yes" : "No"}
                      </div>
                    </div>
                  )}
                  {practical?.simType === "distillation" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Heat rate</div>
                      <div className="text-2xl font-bold">{distHeatRate[0]}x</div>
                      <div className="text-sm text-muted-foreground">Alcohol in feed</div>
                      <div className="text-lg font-semibold">{distAlcoholPct[0]}%</div>
                      <div className="text-sm text-muted-foreground">Setup complete</div>
                      <div className="text-lg font-semibold">
                        {[distSetup.flask, distSetup.burner, distSetup.condenser, distSetup.receiver, distSetup.thermometer].every(Boolean)
                          ? "Yes"
                          : "No"}
                      </div>
                    </div>
                  )}
                  {practical?.simType === "temp-change" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Water volume</div>
                      <div className="text-2xl font-bold">{tempWaterMl[0].toFixed(0)} mL</div>
                      <div className="text-sm text-muted-foreground">Setup complete</div>
                      <div className="text-lg font-semibold">
                        {[tempSetup.testTube, tempSetup.dropper, tempSetup.thermometer].every(Boolean) ? "Yes" : "No"}
                      </div>
                    </div>
                  )}
                  {practical?.simType === "solution-prep" && (
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">Practical</div>
                      <div className="text-lg font-semibold">{practical.title}</div>
                      <div className="text-sm text-muted-foreground">Setup complete</div>
                      <div className="text-lg font-semibold">
                        {[solSetup.balance, solSetup.beaker, solSetup.flask, solSetup.stirrer].every(Boolean) ? "Yes" : "No"}
                      </div>
                    </div>
                  )}
                    {practical?.simType === "dilution" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Practical</div>
                        <div className="text-lg font-semibold">{practical.title}</div>
                      <div className="text-sm text-muted-foreground">Setup complete</div>
                      <div className="text-lg font-semibold">
                          {[dilSetup.pipette, dilSetup.beaker, dilSetup.flask, dilSetup.cylinder].every(Boolean) ? "Yes" : "No"}
                        </div>
                      </div>
                    )}
                    {practical?.simType === "crystallization" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Practical</div>
                        <div className="text-lg font-semibold">{practical.title}</div>
                        <div className="text-sm text-muted-foreground">Setup complete</div>
                        <div className="text-lg font-semibold">
                          {[crysSetup.beaker, crysSetup.burner, crysSetup.dish, crysSetup.funnel].every(Boolean) ? "Yes" : "No"}
                        </div>
                      </div>
                    )}
                    {practical?.simType === "mixing" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Practical</div>
                        <div className="text-lg font-semibold">{practical.title}</div>
                        <div className="text-sm text-muted-foreground">Setup complete</div>
                        <div className="text-lg font-semibold">
                          {[mixSetup.beakerA, mixSetup.beakerB, mixSetup.stirrer].every(Boolean) ? "Yes" : "No"}
                        </div>
                      </div>
                    )}
                    {practical?.simType === "solubility-temp" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Practical</div>
                        <div className="text-lg font-semibold">{practical.title}</div>
                        <div className="text-sm text-muted-foreground">Setup complete</div>
                        <div className="text-lg font-semibold">
                          {[solTempSetup.testTube, solTempSetup.burner, solTempSetup.stirrer].every(Boolean) ? "Yes" : "No"}
                        </div>
                      </div>
                    )}
                    {practical?.simType === "conductivity" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Practical</div>
                        <div className="text-lg font-semibold">{practical.title}</div>
                        <div className="text-sm text-muted-foreground">Setup complete</div>
                        <div className="text-lg font-semibold">
                          {[condSetup.battery, condSetup.bulb, condSetup.electrodes, condSetup.beaker].every(Boolean) ? "Yes" : "No"}
                        </div>
                      </div>
                    )}
                    {practical?.simType === "displacement" && (
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">Practical</div>
                        <div className="text-lg font-semibold">{practical.title}</div>
                        <div className="text-sm text-muted-foreground">Setup complete</div>
                        <div className="text-lg font-semibold">
                          {[dispSetup.testTube, dispSetup.copperSulfate, dispSetup.ironNail].every(Boolean) ? "Yes" : "No"}
                        </div>
                      </div>
                    )}
                    {practical?.simType === "ohms-law" && (
                      <LiveReadings voltage={voltage[0]} resistance={resistance[0]} />
                    )}
                </TabsContent>

                <TabsContent value="warnings" className="flex-1 overflow-auto p-4">
                  <div className="space-y-3">
                    {practical?.simType === "ohms-law" && voltage[0] > 15 && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-500 text-sm">Critical Voltage</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Voltage exceeds safe limits. Risk of component damage.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {practical?.simType === "ohms-law" && voltage[0] > 12 && voltage[0] <= 15 && (
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-500 text-sm">High Voltage Warning</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Voltage is above recommended range. Monitor carefully.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {practical?.simType !== "ohms-law" && (
                      <div className="text-center text-muted-foreground py-8">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No active warnings</p>
                        <p className="text-xs mt-1">Follow the procedure and safety notes.</p>
                      </div>
                    )}
                    {practical?.simType === "ohms-law" && voltage[0] <= 12 && (
                      <div className="text-center text-muted-foreground py-8">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No warnings</p>
                        <p className="text-xs mt-1">All parameters are within safe limits</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Safety Warning Overlay */}
      <AnimatePresence>
        {showSafetyWarning && <SafetyOverlay onCancel={() => setShowSafetyWarning(false)} onProceed={handleProceed} />}
      </AnimatePresence>

      {/* Save Attempt Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Save Attempt</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSaveModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-muted-foreground mb-4">
                Add notes about this experiment attempt for future reference.
              </p>
              <textarea
                placeholder="What did you learn? Any observations?"
                className="w-full h-32 px-3 py-2 rounded-lg bg-background border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                value={saveNotes}
                onChange={(e) => setSaveNotes(e.target.value)}
              />
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowSaveModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleSubmitSaveAttempt} disabled={!runId || savingRun}>
                  <Save className="w-4 h-4 mr-2" />
                  {savingRun ? "Saving..." : "Save Attempt"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish Summary Modal */}
      <AnimatePresence>
        {showFinishSummaryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFinishSummaryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Experiment Summary</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFinishSummaryModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-muted-foreground mb-3">Here is a simple summary of what you did and your current readings.</p>
              <pre className="whitespace-pre-wrap text-sm bg-background/50 border border-border rounded-lg p-4 max-h-[45vh] overflow-auto">
                {finishSummaryText}
              </pre>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowFinishSummaryModal(false)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleProceedToFeedback}>
                  Next: Feedback
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish Feedback Modal */}
      <AnimatePresence>
        {showFinishFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFinishFeedbackModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Rate this experiment</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFinishFeedbackModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-muted-foreground mb-4">Your previous feedback (if any) is loaded and you can edit it.</p>

              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Rating</div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const n = idx + 1
                    const active = n <= feedbackRating
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFeedbackRating(n)}
                        className={
                          active
                            ? "text-yellow-400 hover:text-yellow-300 transition-colors"
                            : "text-muted-foreground hover:text-foreground transition-colors"
                        }
                        aria-label={`Rate ${n} stars`}
                      >
                        <Star className="w-5 h-5" fill={active ? "currentColor" : "none"} />
                      </button>
                    )
                  })}
                  {loadingFeedback && <span className="text-xs text-muted-foreground ml-2">Loading...</span>}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Comment (optional)</div>
                <textarea
                  placeholder="What was good or confusing?"
                  className="w-full h-28 px-3 py-2 rounded-lg bg-background border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShowFinishFeedbackModal(false)
                    setShowFinishSummaryModal(true)
                  }}
                >
                  Back
                </Button>
                <Button className="flex-1" onClick={handleSubmitFeedback} disabled={savingFeedback}>
                  {savingFeedback ? "Saving..." : "Submit"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finish Done Modal */}
      <AnimatePresence>
        {showFinishDoneModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFinishDoneModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Finished</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFinishDoneModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-muted-foreground mb-4">Your summary is ready and your feedback is saved.</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setShowFinishDoneModal(false)
                    handleGoBack()
                  }}
                >
                  Exit
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowFinishDoneModal(false)
                    router.push("/student/dashboard?tab=catalog")
                  }}
                >
                  Start New
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



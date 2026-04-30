export type SimConfig = {
  simType: string
  procedure: string[]
  theory: string[]
  hazards: string[]
  parameters: { label: string; min: number; max: number; step: number; unit: string; default: number }[]
}

export const simConfigs: Record<string, SimConfig> = {
  "vernier": {
    simType: "vernier",
    procedure: [
      "Zero the vernier; note zero error if any.",
      "Place the object between jaws and close gently.",
      "Read main scale just before zero of vernier.",
      "Add vernier coincidence (LC = 0.01 cm).",
      "Repeat 3 times, compute mean and uncertainty.",
    ],
    theory: [
      "Least count (LC) = 1 main scale division / number of vernier divisions.",
      "Reading = main scale + (vernier coincidence × LC).",
      "Uncertainty from repeatability / instrument LC.",
    ],
    hazards: ["Low hazard: handle instrument gently; no sharp edges."],
    parameters: [
      { label: "Object size (cm)", min: 0.5, max: 5, step: 0.01, unit: "cm", default: 2 },
      { label: "Zero error (cm)", min: -0.05, max: 0.05, step: 0.01, unit: "cm", default: 0 },
    ],
  },
  "screw-gauge": {
    simType: "screw-gauge",
    procedure: [
      "Check zero error on closed jaws.",
      "Place wire/foil between jaws; close gently.",
      "Read main scale pitch + circular scale × LC.",
      "LC typically 0.01 mm (pitch 0.5 mm / 50 divisions).",
      "Repeat and average; include zero error correction.",
    ],
    theory: [
      "Least count (LC) = pitch / divisions on circular scale.",
      "Reading = pitch reading + (circular reading × LC) ± zero error.",
      "Use multiple readings for uncertainty.",
    ],
    hazards: ["Low hazard: avoid overtightening; prevent thread damage."],
    parameters: [
      { label: "Object diameter (mm)", min: 0.1, max: 2, step: 0.01, unit: "mm", default: 0.8 },
      { label: "Zero error (mm)", min: -0.05, max: 0.05, step: 0.005, unit: "mm", default: 0 },
    ],
  },
  "ohms-law": {
    simType: "ohms-law",
    procedure: [
      "Assemble circuit: battery → ammeter → resistor → back to battery; voltmeter across resistor.",
      "Set a low voltage; record V and I.",
      "Increase voltage in steps; keep connections tight.",
      "Plot V vs I; slope gives resistance (R).",
      "Avoid overvoltage/shorts; watch hazard warnings.",
    ],
    theory: [
      "Ohm's Law: V = I R (at constant temperature).",
      "Power P = V I; heating may alter resistance.",
      "Shorts/overvoltage cause high current → hazards.",
    ],
    hazards: [
      "Overvoltage (>12 V) may overheat components.",
      "Very low resistance with high voltage → spark/smoke (virtual).",
    ],
    parameters: [
      { label: "Voltage (V)", min: 0, max: 20, step: 0.5, unit: "V", default: 5 },
      { label: "Resistance (Ω)", min: 10, max: 500, step: 10, unit: "Ω", default: 100 },
    ],
  },
  "inclined-plane": {
    simType: "inclined-plane",
    procedure: [
      "Set the ramp angle and track length.",
      "Place the ball at the start mark and release.",
      "Record time for the ball to reach the end.",
      "Repeat for 3 trials; compute average T.",
      "Plot 2S vs T^2; slope gives acceleration.",
    ],
    theory: [
      "For constant acceleration: S = (1/2) a T^2.",
      "Plotting 2S vs T^2 yields a straight line with slope a.",
      "Steeper angle increases acceleration due to gravity component.",
    ],
    hazards: ["Low hazard: ensure ramp is stable; virtual roll only."],
    parameters: [
      { label: "Angle (deg)", min: 5, max: 45, step: 1, unit: "°", default: 15 },
      { label: "Track length (m)", min: 0.5, max: 2, step: 0.1, unit: "m", default: 1.2 },
      { label: "Ball mass (g)", min: 20, max: 200, step: 5, unit: "g", default: 50 },
    ],
  },
  "pendulum": {
    simType: "pendulum",
    procedure: [
      "Set pendulum length and a small release angle.",
      "Release the bob without pushing and let it oscillate freely.",
      "Measure time for a fixed number of oscillations (e.g. 10 or 20).",
      "Repeat at least 3 trials and calculate average period T.",
      "Use T = t/n and compute g from T = 2π√(L/g); compare with graph method.",
    ],
    theory: [
      "For small oscillations, T = 2π√(L/g).",
      "Time many oscillations to reduce stopwatch reaction error.",
      "A plot of L vs T² is a straight line with slope g/(4π²) inverted relation (or slope = 4π²/g for T² vs L).",
    ],
    hazards: ["Low hazard: avoid very large angles; virtual setup only."],
    parameters: [
      { label: "Length (m)", min: 0.2, max: 2, step: 0.05, unit: "m", default: 1 },
      { label: "Release angle (°)", min: 3, max: 20, step: 1, unit: "°", default: 8 },
      { label: "Oscillations timed", min: 5, max: 30, step: 1, unit: "", default: 10 },
    ],
  },
  "glass-slab": {
    simType: "glass-slab",
    procedure: [
      "Place the glass slab on the sheet and draw its outline (virtual setup shown).",
      "Set an incident ray and draw the normal at the point of incidence.",
      "Observe and measure the refracted ray inside the slab.",
      "Trace the emergent ray and compare it with incident direction.",
      "Record i and r for multiple angles and verify Snell's law.",
    ],
    theory: [
      "Snell's law: n = sin i / sin r (for air to glass).",
      "In a rectangular glass slab, emergent ray is parallel to incident ray.",
      "There is lateral displacement due to slab thickness and refraction.",
    ],
    hazards: ["Low hazard: optical tracing only; no real laser in virtual setup."],
    parameters: [
      { label: "Incident angle (deg)", min: 10, max: 75, step: 1, unit: "°", default: 35 },
      { label: "Refractive index", min: 1.3, max: 1.8, step: 0.01, unit: "", default: 1.5 },
      { label: "Slab thickness (cm)", min: 1, max: 6, step: 0.1, unit: "cm", default: 3 },
    ],
  },
  "concave-mirror": {
    simType: "concave-mirror",
    procedure: [
      "Locate center of curvature of empty concave mirror (virtual pin/no-parallax view).",
      "Fill mirror with water and find apparent center of curvature.",
      "Record real radius R and apparent radius R'.",
      "Calculate refractive index of water using n = R / R'.",
      "Repeat and take mean value.",
    ],
    theory: [
      "For a concave mirror filled with water, apparent depth reduces the apparent radius of curvature.",
      "Refractive index of water can be estimated by n = R / R'.",
      "Parallax-free alignment gives more accurate apparent center measurement.",
    ],
    hazards: ["Low hazard: optical observation only; virtual setup."],
    parameters: [
      { label: "Mirror radius (cm)", min: 8, max: 30, step: 1, unit: "cm", default: 20 },
      { label: "Pin depth setting (cm)", min: 0.5, max: 5, step: 0.1, unit: "cm", default: 1.5 },
      { label: "Water depth (cm)", min: 0.5, max: 5, step: 0.1, unit: "cm", default: 2 },
    ],
  },
  "prism-critical": {
    simType: "prism-critical",
    procedure: [
      "Set prism refractive index and vary angle of incidence inside prism.",
      "Observe transition from emergence to total internal reflection.",
      "Identify critical angle c when emergent ray just grazes the surface.",
      "Calculate n using n = 1/sin c.",
      "Repeat and compare values.",
    ],
    theory: [
      "Critical angle is the angle in denser medium for which refracted angle in air becomes 90°.",
      "For glass-air interface: sin c = 1/n.",
      "For angles greater than c, total internal reflection occurs.",
    ],
    hazards: ["Low hazard: optics simulation only."],
    parameters: [
      { label: "Prism refractive index", min: 1.3, max: 1.8, step: 0.01, unit: "", default: 1.5 },
      { label: "Incidence in prism (deg)", min: 20, max: 80, step: 1, unit: "°", default: 40 },
    ],
  },
  "prism-deviation": {
    simType: "prism-deviation",
    procedure: [
      "Set prism angle and refractive index.",
      "Vary angle of incidence and observe emergent ray deviation.",
      "Record i and angle of deviation d.",
      "Find condition for minimum deviation (approximately i = e).",
      "Repeat around minimum and compare readings.",
    ],
    theory: [
      "Angle of deviation depends on prism angle, refractive index and angle of incidence.",
      "Minimum deviation occurs for symmetric path through prism (i = e).",
      "At minimum deviation, n can be related to A and δmin.",
    ],
    hazards: ["Low hazard: optics simulation only."],
    parameters: [
      { label: "Prism angle A (deg)", min: 30, max: 70, step: 1, unit: "°", default: 60 },
      { label: "Prism refractive index", min: 1.3, max: 1.8, step: 0.01, unit: "", default: 1.5 },
      { label: "Incidence angle i (deg)", min: 20, max: 80, step: 1, unit: "°", default: 45 },
    ],
  },
  "convex-lens": {
    simType: "convex-lens",
    procedure: [
      "Set object distance and lens power (or focal length).",
      "Observe image formation and adjust for a sharp image (virtual lens bench).",
      "Note object distance u and image distance v.",
      "Use lens relation to estimate focal length.",
      "Repeat and calculate mean focal length.",
    ],
    theory: [
      "Thin lens relation: 1/f = 1/u + 1/v (sign convention simplified here for real image setup).",
      "Magnification m = v/u = image height / object height.",
      "Convex lens produces real inverted image when object is beyond focal length.",
    ],
    hazards: ["Low hazard: optical setup only; virtual lens bench."],
    parameters: [
      { label: "Object distance (cm)", min: 15, max: 100, step: 1, unit: "cm", default: 40 },
      { label: "Lens power (D)", min: 1, max: 10, step: 0.1, unit: "D", default: 4 },
      { label: "Object height (cm)", min: 1, max: 10, step: 0.5, unit: "cm", default: 4 },
    ],
  },
  "series-circuit": {
    simType: "series-circuit",
    procedure: [
      "Connect resistors in series with source and ammeter.",
      "Measure total current and voltage drops across each resistor.",
      "Verify same current through all components in series.",
      "Check V = V1 + V2 and Req = R1 + R2.",
      "Record repeated readings.",
    ],
    theory: ["In series, current is same in all resistors.", "Equivalent resistance adds directly: Req = R1 + R2 + ..."],
    hazards: ["Low hazard: avoid short circuit in virtual setup."],
    parameters: [
      { label: "Voltage (V)", min: 1, max: 20, step: 0.5, unit: "V", default: 6 },
      { label: "R1 (Ω)", min: 10, max: 500, step: 10, unit: "Ω", default: 100 },
      { label: "R2 (Ω)", min: 10, max: 500, step: 10, unit: "Ω", default: 150 },
    ],
  },
  "parallel-circuit": {
    simType: "parallel-circuit",
    procedure: [
      "Connect resistors in parallel across the source.",
      "Measure branch currents and total current.",
      "Verify Itotal = I1 + I2.",
      "Compare equivalent resistance with branch resistances.",
      "Record and repeat.",
    ],
    theory: ["In parallel, voltage across each branch is equal.", "Total current is sum of branch currents."],
    hazards: ["Low hazard: avoid virtual overload settings."],
    parameters: [
      { label: "Voltage (V)", min: 1, max: 20, step: 0.5, unit: "V", default: 6 },
      { label: "R1 (Ω)", min: 10, max: 500, step: 10, unit: "Ω", default: 100 },
      { label: "R2 (Ω)", min: 10, max: 500, step: 10, unit: "Ω", default: 150 },
    ],
  },
  "field-lines": {
    simType: "field-lines",
    procedure: [
      "Place compass probe at different points around magnet.",
      "Note compass direction and trace field direction.",
      "Map lines from N to S around the bar magnet.",
      "Compare field intensity near poles and center.",
      "Record sketch/values.",
    ],
    theory: ["Magnetic field lines emerge from N and enter S externally.", "Field is stronger where lines are denser (near poles)."],
    hazards: ["Low hazard: virtual magnet and compass only."],
    parameters: [
      { label: "Magnet strength", min: 0.5, max: 3, step: 0.1, unit: "a.u.", default: 1.5 },
      { label: "Probe X", min: -1.5, max: 1.5, step: 0.1, unit: "", default: 0.4 },
      { label: "Probe Y", min: -1.5, max: 1.5, step: 0.1, unit: "", default: 0.6 },
    ],
  },
  "logic-gates": {
    simType: "logic-gates",
    procedure: [
      "Select a logic gate type.",
      "Apply input combinations.",
      "Observe output state and lamp indication.",
      "Verify truth table row by row.",
      "Record results.",
    ],
    theory: ["Digital logic gates map binary inputs to output as per Boolean rules."],
    hazards: ["Low hazard: virtual electronics only."],
    parameters: [
      { label: "Gate type (0=AND,1=OR,2=NOT)", min: 0, max: 2, step: 1, unit: "", default: 0 },
      { label: "Input A", min: 0, max: 1, step: 1, unit: "", default: 0 },
      { label: "Input B", min: 0, max: 1, step: 1, unit: "", default: 0 },
    ],
  },
  "flame-test": {
    simType: "flame-test",
    procedure: [
      "Clean the wire loop thoroughly.",
      "Dip in selected salt sample.",
      "Hold in flame and observe characteristic color.",
      "Repeat with clean wire for each sample.",
      "Record observed flame colors.",
    ],
    theory: ["Different cations impart characteristic flame colors due to electronic transitions."],
    hazards: ["Medium hazard: flame handling and hot wire (virtual)."],
    parameters: [
      { label: "Sample (0=Na,1=K,2=Ca,3=Ba,4=Cu)", min: 0, max: 4, step: 1, unit: "", default: 0 },
      { label: "Flame intensity", min: 0.5, max: 2, step: 0.1, unit: "", default: 1 },
      { label: "Wire clean (0/1)", min: 0, max: 1, step: 1, unit: "", default: 1 },
    ],
  },
  "titration": {
    simType: "titration",
    procedure: [
      "Rinse burette and pipette with respective solutions.",
      "Pipette aliquot in flask and add indicator.",
      "Run titrant slowly near endpoint.",
      "Note burette reading and calculate concentration.",
      "Repeat for concordant trials.",
    ],
    theory: ["At equivalence point, reacting moles satisfy stoichiometric ratio.", "M1V1 relationship used for standardization in simple acid-base titration."],
    hazards: ["Medium hazard: acid/base handling and spills (virtual warnings)."],
    parameters: [
      { label: "Analyte (0=NaOH,1=HCl,2=Na2CO3,3=Oxalic)", min: 0, max: 3, step: 1, unit: "", default: 0 },
      { label: "Analyte M", min: 0.05, max: 0.5, step: 0.01, unit: "M", default: 0.1 },
      { label: "Titrant M", min: 0.05, max: 0.5, step: 0.01, unit: "M", default: 0.1 },
      { label: "Aliquot (mL)", min: 10, max: 50, step: 1, unit: "mL", default: 25 },
    ],
  },
  "friction-block": {
    simType: "friction-block",
    procedure: [
      "Place the wooden block on the surface.",
      "Increase pulling force slowly until motion starts.",
      "Record limiting friction force and normal reaction.",
      "Repeat with added load to change normal reaction.",
      "Plot F vs N; slope gives coefficient of friction.",
    ],
    theory: [
      "Limiting friction is proportional to normal reaction: F = μN.",
      "The slope of the F vs N graph equals coefficient μ.",
    ],
    hazards: ["Low hazard: avoid sudden jerks; virtual simulation only."],
    parameters: [
      { label: "Normal load (N)", min: 2, max: 20, step: 1, unit: "N", default: 6 },
      { label: "Pull force (N)", min: 0, max: 20, step: 0.5, unit: "N", default: 2 },
      { label: "Surface μ", min: 0.2, max: 0.8, step: 0.05, unit: "", default: 0.4 },
    ],
  },
  "vector-forces": {
    simType: "vector-forces",
    procedure: [
      "Place the ring at the center and attach three strings.",
      "Adjust two forces using sliders until the ring is at rest.",
      "Read the third force from equilibrium condition.",
      "Record force magnitudes and directions.",
      "Repeat with different angle combinations.",
    ],
    theory: [
      "For equilibrium: vector sum of forces equals zero.",
      "Resolve forces into components along x and y axes.",
    ],
    hazards: ["Low hazard: virtual weights only."],
    parameters: [
      { label: "Force A (N)", min: 1, max: 10, step: 0.5, unit: "N", default: 4 },
      { label: "Angle A (deg)", min: 0, max: 180, step: 5, unit: "°", default: 30 },
      { label: "Force B (N)", min: 1, max: 10, step: 0.5, unit: "N", default: 5 },
      { label: "Angle B (deg)", min: 0, max: 180, step: 5, unit: "°", default: 150 },
    ],
  },
  "moments": {
    simType: "moments",
    procedure: [
      "Place the meter rule on the pivot at the 50 cm mark.",
      "Hang the unknown weight at a fixed position.",
      "Adjust known weights at different distances until balanced.",
      "Record distances and weights.",
      "Verify clockwise moment = counterclockwise moment.",
    ],
    theory: [
      "Principle of moments: Sum of clockwise moments equals sum of counterclockwise moments.",
      "Moment = Force × Perpendicular distance from pivot.",
    ],
    hazards: ["Low hazard: virtual weights only."],
    parameters: [
      { label: "Unknown weight (N)", min: 1, max: 10, step: 0.5, unit: "N", default: 4 },
      { label: "Unknown position (cm)", min: 10, max: 40, step: 1, unit: "cm", default: 30 },
      { label: "Known weight (N)", min: 1, max: 10, step: 0.5, unit: "N", default: 5 },
      { label: "Known position (cm)", min: 60, max: 90, step: 1, unit: "cm", default: 70 },
    ],
  },
  "spring-extension": {
    simType: "spring-extension",
    procedure: [
      "Set the initial spring length and attach a load.",
      "Increase load in steps and measure extension.",
      "Record load vs extension pairs.",
      "Plot F vs x; slope gives spring constant k.",
      "Verify Hooke's law (F = kx).",
    ],
    theory: [
      "Hooke's law: extension is proportional to applied force (within elastic limit).",
      "Spring constant k = F / x.",
    ],
    hazards: ["Low hazard: virtual spring only."],
    parameters: [
      { label: "Load (N)", min: 0, max: 20, step: 1, unit: "N", default: 5 },
      { label: "Spring constant k (N/m)", min: 5, max: 50, step: 1, unit: "N/m", default: 15 },
    ],
  },
  "archimedes-density": {
    simType: "archimedes-density",
    procedure: [
      "Weigh the object in air.",
      "Immerse the object fully in water.",
      "Measure displaced volume.",
      "Calculate density = mass / volume.",
      "Compare with standard values.",
    ],
    theory: [
      "Buoyant force equals weight of displaced fluid.",
      "Density = mass / volume.",
    ],
    hazards: ["Low hazard: virtual water only."],
    parameters: [
      { label: "Mass (g)", min: 20, max: 500, step: 10, unit: "g", default: 120 },
      { label: "Volume (cm³)", min: 10, max: 300, step: 5, unit: "cm³", default: 80 },
    ],
  },
  "heating-curve": {
    simType: "heating-curve",
    procedure: [
      "Start heating the ice in a beaker.",
      "Record temperature at regular intervals.",
      "Observe phase changes at 0°C and 100°C.",
      "Plot temperature vs time graph.",
      "Explain plateaus during phase changes.",
    ],
    theory: [
      "During phase change, temperature remains constant while heat is absorbed.",
      "Heating curve shows plateaus at melting/boiling points.",
    ],
    hazards: ["Low hazard: virtual heating only."],
    parameters: [
      { label: "Heat rate (°C/min)", min: 1, max: 10, step: 1, unit: "°C/min", default: 4 },
      { label: "Total time (min)", min: 5, max: 30, step: 1, unit: "min", default: 15 },
    ],
  },
  "mixture-separation": {
    simType: "mixture-separation",
    procedure: [
      "Place the mixture in the dish.",
      "Use the magnet to separate iron filings.",
      "Collect the remaining sand.",
      "Record observations.",
    ],
    theory: [
      "Magnetism separates ferromagnetic materials from non‑magnetic ones.",
      "Physical separation methods do not change composition.",
    ],
    hazards: ["Low hazard: virtual materials only."],
    parameters: [
      { label: "Iron fraction (%)", min: 10, max: 90, step: 5, unit: "%", default: 50 },
    ],
  },
  "melting-point": {
    simType: "melting-point",
    procedure: [
      "Place the solid sample in the tube.",
      "Heat slowly and record temperature.",
      "Observe when melting begins and ends.",
      "Report the melting range.",
    ],
    theory: [
      "Pure solids melt at a characteristic temperature.",
      "Impurities broaden the melting range.",
    ],
    hazards: ["Low hazard: virtual heating only."],
    parameters: [
      { label: "Temperature (°C)", min: 20, max: 120, step: 1, unit: "°C", default: 30 },
      { label: "Sample purity (%)", min: 70, max: 100, step: 5, unit: "%", default: 95 },
    ],
  },
  "boiling-point": {
    simType: "boiling-point",
    procedure: [
      "Set the substance and start heating.",
      "Observe temperature rise and vapor formation.",
      "Note boiling point when temperature stabilizes.",
      "Record observations and compare with standard values.",
    ],
    theory: [
      "Boiling occurs when vapor pressure equals atmospheric pressure.",
      "Different liquids have characteristic boiling points.",
    ],
    hazards: ["Low hazard: virtual heating only."],
    parameters: [
      { label: "Heat rate (°C/min)", min: 1, max: 10, step: 1, unit: "°C/min", default: 4 },
      { label: "Substance", min: 0, max: 2, step: 1, unit: "", default: 0 },
    ],
  },
  "sublimation": {
    simType: "sublimation",
    procedure: [
      "Place naphthalene + sand mixture in china dish.",
      "Cover with inverted funnel and plug stem with cotton.",
      "Heat gently using burner.",
      "Observe naphthalene vapor and crystal deposition on funnel.",
      "Collect deposited naphthalene; sand remains in dish.",
    ],
    theory: [
      "Sublimation is direct solid-to-vapor conversion without liquid phase.",
      "Naphthalene sublimes on heating and deposits on cooler surfaces.",
      "Sand does not sublime, so it remains as residue.",
    ],
    hazards: [
      "Use gentle heating to avoid decomposition.",
      "Do not inhale vapors; ensure ventilation in real lab.",
    ],
    parameters: [
      { label: "Heat rate (x)", min: 1, max: 10, step: 1, unit: "x", default: 4 },
      { label: "Sample mass (g)", min: 2, max: 20, step: 0.5, unit: "g", default: 8 },
    ],
  },
  "distillation": {
    simType: "distillation",
    procedure: [
      "Assemble flask, condenser, receiver and thermometer.",
      "Heat alcohol-water mixture gently.",
      "Monitor head temperature and condenser output.",
      "Collect distillate in receiver flask.",
      "Record distillate volume and estimated purity.",
    ],
    theory: [
      "Distillation separates liquids by difference in boiling points.",
      "Lower boiling component vaporizes first and condenses in receiver.",
      "Head temperature indicates dominant vapor composition.",
    ],
    hazards: [
      "Avoid overheating and rapid boiling (bumping) in real lab.",
      "Ensure condenser cooling before collection.",
    ],
    parameters: [
      { label: "Heat rate (x)", min: 1, max: 10, step: 1, unit: "x", default: 4 },
      { label: "Alcohol in feed (%)", min: 10, max: 90, step: 5, unit: "%", default: 40 },
    ],
  },
  "temp-change": {
    simType: "temp-change",
    procedure: [
      "Place CuSO4 sample in test tube.",
      "Add water using dropper.",
      "Observe color change and temperature rise.",
      "Record initial and final temperatures.",
      "Conclude exothermic behavior.",
    ],
    theory: [
      "Hydration of anhydrous copper sulphate releases heat.",
      "Exothermic reactions increase system temperature.",
      "Color changes from white to blue indicate hydration.",
    ],
    hazards: ["Low hazard in simulation."],
    parameters: [
      { label: "Water volume (mL)", min: 5, max: 30, step: 1, unit: "mL", default: 10 },
    ],
  },
  "solution-prep": {
    simType: "solution-prep",
    procedure: [
      "Calculate required solute mass for target molarity and volume.",
      "Weigh solute accurately on balance.",
      "Dissolve in beaker with stirring.",
      "Transfer to volumetric flask and make up to mark.",
      "Mix thoroughly and label solution.",
    ],
    theory: [
      "Moles required = Molarity × Volume (L).",
      "Mass required = moles × molar mass.",
      "Final accuracy depends on volumetric mark and proper mixing.",
    ],
    hazards: ["Use PPE for corrosive reagents in real lab."],
    parameters: [
      { label: "Mode", min: 0, max: 1, step: 1, unit: "", default: 0 },
    ],
  },
  "temp-drop": {
    simType: "temp-drop",
    procedure: [
      "Take a measured volume of water in a beaker.",
      "Record initial temperature.",
      "Add a known mass of an endothermic salt (e.g., NH4NO3) and stir.",
      "Record the minimum/final temperature.",
      "Calculate temperature change and conclude endothermic behavior.",
    ],
    theory: [
      "In endothermic dissolutions, the process absorbs heat from the surroundings.",
      "Absorbing heat causes a decrease in temperature of the solution.",
      "Magnitude depends on solute amount and water volume.",
    ],
    hazards: ["Low hazard in simulation; in real lab, handle chemicals safely."],
    parameters: [
      { label: "Water volume", min: 20, max: 200, step: 10, unit: "mL", default: 50 },
      { label: "Solute mass", min: 5, max: 30, step: 1, unit: "g", default: 10 },
      { label: "Initial temperature", min: 15, max: 40, step: 1, unit: "°C", default: 25 },
    ],
  },
  "combination": {
    simType: "combination",
    procedure: [
      "Select two reactants (elements/compounds).",
      "Mix them in the reaction vessel.",
      "Heat the mixture if required.",
      "Observe formation of a single new product.",
      "Write the word equation and conclude combination reaction.",
    ],
    theory: [
      "A combination reaction forms one product from two or more reactants.",
      "Some combination reactions require activation energy (heating).",
    ],
    hazards: ["Heating and reactive metals can be hazardous in a real lab."],
    parameters: [
      { label: "Heat", min: 0, max: 100, step: 1, unit: "%", default: 20 },
    ],
  },
  "decomposition": {
    simType: "decomposition",
    procedure: [
      "Select a compound to decompose.",
      "Apply heat/light to initiate decomposition.",
      "Observe residue and gas formation.",
      "Perform an appropriate gas test (e.g., limewater for CO2).",
      "Write the products and conclude decomposition reaction.",
    ],
    theory: [
      "Decomposition reaction breaks a compound into simpler substances.",
      "Thermal decomposition often requires continuous heating.",
    ],
    hazards: ["Gases and hot apparatus can be hazardous in a real lab."],
    parameters: [
      { label: "Heat/energy", min: 0, max: 100, step: 1, unit: "%", default: 20 },
    ],
  },
  "single-displacement": {
    simType: "single-displacement",
    procedure: [
      "Select a metal strip and a salt solution.",
      "Immerse the metal in the solution.",
      "Observe deposit formation and color change.",
      "Use the reactivity series to predict whether reaction occurs.",
      "Write the word/chemical equation for the displacement.",
    ],
    theory: [
      "A more reactive metal displaces a less reactive metal from its salt solution.",
      "Reaction feasibility depends on relative reactivity.",
    ],
    hazards: ["Metal salts and acids may be hazardous in a real lab; wear PPE."],
    parameters: [
      { label: "Temperature", min: 20, max: 60, step: 1, unit: "°C", default: 25 },
    ],
  },
  "ph-paper": {
    simType: "ph-paper",
    procedure: [
      "Select a sample solution.",
      "Dip pH paper briefly into the sample.",
      "Match the color with the pH chart.",
      "Record estimated pH and classify (acid/base/neutral).",
    ],
    theory: [
      "pH indicates acidity/alkalinity (0–14 scale).",
      "Indicators change color depending on hydrogen ion concentration.",
    ],
    hazards: ["Some samples (acids/bases) are corrosive in a real lab."],
    parameters: [
      { label: "Contamination", min: 0, max: 100, step: 5, unit: "%", default: 0 },
    ],
  },
  "indicator-panel": {
    simType: "indicator-panel",
    procedure: [
      "Select a sample solution.",
      "Add different indicators (litmus, phenolphthalein, methyl orange).",
      "Observe color change for each indicator.",
      "Classify the sample as acid/base/neutral.",
    ],
    theory: [
      "Different indicators have different transition ranges.",
      "Indicator color reveals approximate pH range.",
    ],
    hazards: ["Indicators and acids/bases are irritants in a real lab."],
    parameters: [
      { label: "Concentration", min: 40, max: 100, step: 5, unit: "%", default: 100 },
    ],
  },
  "qualitative-organic": {
    simType: "qualitative-organic",
    procedure: [
      "Select an unknown organic sample.",
      "Choose an appropriate qualitative test (Fehling, Tollens, 2,4-DNPH, Na2CO3, FeCl3).",
      "Heat gently when required.",
      "Observe characteristic color change/precipitate.",
      "Infer the functional group and confirm with another test.",
    ],
    theory: [
      "Functional groups show characteristic reactions with specific reagents.",
      "Confirmatory testing uses expected observations to identify the group.",
    ],
    hazards: ["Some organic reagents are corrosive/toxic in real lab; handle carefully."],
    parameters: [
      { label: "Test", min: 0, max: 4, step: 1, unit: "", default: 0 },
    ],
  },
  "unsaturation-test": {
    simType: "unsaturation-test",
    procedure: [
      "Select an organic sample.",
      "Add bromine water or KMnO4 solution.",
      "Shake the test tube.",
      "Observe decolorization (positive for unsaturation).",
      "Conclude whether the compound is saturated/unsaturated.",
    ],
    theory: [
      "Unsaturated compounds (C=C) add bromine and decolorize bromine water.",
      "KMnO4 oxidizes unsaturated compounds, causing decolorization.",
    ],
    hazards: ["Bromine water and KMnO4 are irritants/oxidizers in real lab."],
    parameters: [
      { label: "Drops", min: 1, max: 15, step: 1, unit: "", default: 5 },
    ],
  },
  "water-softening": {
    simType: "water-softening",
    procedure: [
      "Prepare hard water sample (temporary/permanent).",
      "Apply a softening method (boiling, washing soda, lime).",
      "Add soap and shake.",
      "Compare lather formation before and after treatment.",
      "Conclude effectiveness of softening method.",
    ],
    theory: [
      "Hardness is due to Ca2+/Mg2+ ions that react with soap to form scum.",
      "Boiling removes temporary hardness; washing soda/lime can reduce hardness chemically.",
    ],
    hazards: ["Heating and alkalis are hazardous in real lab; use PPE."],
    parameters: [
      { label: "Dose", min: 0, max: 100, step: 5, unit: "%", default: 50 },
    ],
  }
}

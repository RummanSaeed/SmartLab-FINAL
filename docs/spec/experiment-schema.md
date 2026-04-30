# Experiment JSON Schema (SmartLab)

This file documents the canonical JSON schema we will use to describe experiments in the `datasets/` folder. Keep instances small and human-readable; the backend will validate and serve these.

Required top-level fields

- `id` (string): unique slug, e.g. `ohms-law-phys-001`
- `title` (string)
- `subject` (string): Physics | Chemistry | Biology
- `class` (string|number): e.g. `10` or `11`
- `apparatus` (array[string])
- `steps` (array[string]) ordered procedural steps for the student
- `correct_outcome` (string) short description of the expected outcome
- `safety_notes` (array[string]) mandatory safety instructions

Optional / recommended fields

- `variables` (array[object]) — parameter definitions used by simulations:
  - `{ name, unit, min, max, default, type }`
- `visual_asset` (string): path to a glTF file or scene id for the frontend
- `common_mistakes` (array[object]): each entry `{ error, explanation }`
- `ai_explanations` (object): keyed short explanations used by the AI tutor
- `metadata` (object): author, created_at, curriculum_refs

ML / Simulation hints (used by the hybrid engine)

- `simulation_hint` (object): a small description of the physical law(s) involved and canonical formulas. Example for Ohm's Law:
  - `{ laws: ["V = I * R"], recommended_sampling: {R: {min:1, max:1000}, V: {min:0.5, max:12}} }

Example (derived from current repo):

```json
{
  "id":"ohms-law-phys-001",
  "title":"Verify Ohm's Law",
  "subject":"Physics",
  "class":"10",
  "apparatus":["Battery","Ammeter","Voltmeter","Resistor","Wires","Switch","Breadboard"],
  "steps":["Assemble circuit...","Record readings..."],
  "correct_outcome":"Linear V-I relation.",
  "safety_notes":["Never short battery terminals."]
}
```

Guidelines
- Keep `variables` and `simulation_hint` up to date for experiments you intend to simulate — they drive the synthetic data generator and ML pipeline.
- For hazardous experiments, include an explicit `hazard_level` field (low | medium | high) and a `teacher_consent_required: true` flag.

Schema evolution
- Add fields as needed. Keep backward compatibility by not renaming top-level keys.

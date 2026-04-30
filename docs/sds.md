# Software Design Specification (SDS) — SmartLab

## 1. Architecture Overview
- **Style:** Service-oriented with a rich SPA/3D frontend. Core services: API Gateway (FastAPI), Simulation Engine, AI Tutor, Content Service, Analytics, WebSocket Gateway.
- **Communication:** REST for CRUD; WebSocket for simulation ticks, AI streaming, and live monitoring; async jobs via queue (Redis/Celery or RQ).
- **Deployment Units:** `frontend` (Next.js), `api` (FastAPI), `sim` (Simulation Engine worker), `ai-tutor` (LLM + RAG), `queue` (Redis), `db` (PostgreSQL), `object-store` (S3-compatible for assets), `vector-store` (pgvector or FAISS).

## 2. Component Design
### 2.1 Frontend (Next.js + TypeScript)
- Subsystems: Scene Renderer (React Three Fiber + Drei + custom shaders), UI Shell (Tailwind, Framer Motion), Instrument Widgets (Konva/Canvas overlays), AI Pane (chat UI with streaming), Data Viz (Chart.js/Recharts), State (Zustand/Redux Toolkit).
- Responsibilities: Render lab, handle user actions, build scene graph/state, call APIs, subscribe to WebSockets, run lightweight client-side physics for responsiveness (mirrors server truth).
- Performance: Fixed timestep loop for visuals; LOD toggles; asset prefetch; code-splitting by experiment.

### 2.2 Backend API (FastAPI)
- Modules: Auth (JWT, OAuth optional), Users/Classes, Experiments Catalog, Assignments, Reports, Content Authoring, Analytics endpoints, Admin/Feature Flags.
- Middleware: rate limiting, request ID, logging (structlog), validation (Pydantic v2).
- Schemas: OpenAPI generated; shared TypeScript types produced via `datamodel-codegen` or `openapi-typescript`.

### 2.3 Simulation Engine (Hybrid)
- Runs as a worker/service; exposed via WebSocket channel and REST to start/stop sessions.
- Layers:
  - State Model: apparatus/components instances, connections, environmental params (temp, pressure), simulation clock.
  - Rule Engine: deterministic solvers (circuit nodal analysis; mechanics; basic thermodynamics; chem stoichiometry and equilibrium approximations).
  - ML Surrogates: ONNX runtime for heat diffusion, turbulence/turbidity, flame spread, noise injection on sensors.
  - Event System: hazard/failure triggers, probability modifiers, visual descriptor hooks (fire/smoke/sparks/shatter).
  - Recorder: timeline of actions, states, and events for replay, grading, analytics.
- Modes: `interactive` (approximate + responsive) and `deterministic` (seeded, strict for grading). Switchable per session.

### 2.4 AI Tutor Service
- Pipeline: context builder (scene vectorization + experiment metadata + recent steps), retrieval (vector store over SOPs, hazards, curriculum), prompt builder with guardrails, LLM inference (local Llama/Mistral or hosted API), response checker (align with rule engine outputs), safety filter.
- APIs: `/tutor/hint`, `/tutor/explain`, `/tutor/predict`, streaming via WebSocket or SSE.
- Caching: response cache keyed by (experiment, state hash, user level) to reduce latency.

### 2.5 Data and Storage
- PostgreSQL: users, roles, classes, assignments, experiment catalog metadata, attempts, logs, AI interactions, feature flags.
- Object storage (S3/MinIO): 3D/2D assets, textures, sounds, exported reports.
- Datasets repo: experiment YAML/JSON definitions with hazards and thresholds.
- Vector store: pgvector tables or FAISS index persisted alongside embeddings.
- Redis: queues, short-lived session state, rate limiting counters, WebSocket presence.

## 3. Data Model (initial tables)
- `users(id, email, password_hash, role, name, school, grade, prefs_json, created_at, updated_at)`
- `classes(id, name, school, grade, teacher_id, invite_code, created_at)`
- `class_members(user_id, class_id, role_in_class, joined_at)`
- `experiments(id, slug, subject, grade, title, summary, yaml_path, tags[], hazard_level, version, published, created_at)`
- `assignments(id, experiment_id, class_id, due_at, rubric_json, mode)`  // mode: interactive/deterministic
- `attempts(id, user_id, assignment_id, experiment_id, started_at, ended_at, score, rubric_json, report_url)`
- `attempt_events(id, attempt_id, ts, type, payload_json)`  // actions, measurements, hazards
- `ai_interactions(id, user_id, attempt_id, ts, intent, prompt_ctx_hash, response, latency_ms, guardrail_flags)`
- `assets(id, path, type, license, version, checksum, meta_json)`
- `feature_flags(name, enabled, audience_json, created_at)`

## 4. Key APIs (representative)
- Auth: `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/password-reset`.
- Users/Classes: `GET/POST /classes`, `POST /classes/{id}/invite`, `POST /classes/{id}/members`.
- Catalog: `GET /experiments`, `GET /experiments/{slug}`, `POST /experiments` (authoring).
- Assignments: `POST /assignments`, `GET /assignments/{id}`, `GET /classes/{id}/assignments`.
- Simulation: `POST /sim/sessions` (returns session id + WebSocket URL), `DELETE /sim/sessions/{id}`, WebSocket events `{action, payload}` and server ticks `{state, events}`.
- Tutor: `POST /tutor/hint`, `/tutor/explain`, `/tutor/predict` (streaming).
- Reports: `POST /reports/{attempt_id}/generate`, `GET /reports/{attempt_id}`.
- Analytics: `GET /analytics/experiments/{id}`, `GET /analytics/classes/{id}` (aggregates, trends).
- Admin: `GET/POST /feature-flags`, `GET /health`, `GET /metrics`.

## 5. Simulation Design Details
- **Circuit Solver:** Graph builder from scene connections; nodal analysis; component models (resistor, battery with internal resistance, LED with Vf and reverse breakdown, capacitor basic support).
- **Mechanics:** Box2D/planck.js client mirror; server canonical for collisions/forces; time-step synced.
- **Chemistry Rules:** Reaction table (reactants, conditions, products, enthalpy, state changes, hazards). Kinetics simplified (Arrhenius-like rates) where needed; equilibrium constants for common reactions.
- **Hazard Events:** Thresholds (overcurrent, overvoltage, pressure, temperature); hazard functions compute likelihood and severity; events carry `visual_descriptor` to drive FX (fire, smoke, sparks, shatter, pop sound).
- **State Sync:** Client runs predictive tick; authoritative corrections from server; divergence capped by reconciliation.
- **Logging:** Every user action and simulation tick saved for replay and analytics; compressed for storage.

## 6. AI Tutor Design Details
- **Context Features:** Scene graph hash, experiment slug, current step, recent actions, sensor readings, hazard flags, user proficiency estimate.
- **Retrieval:** Embed SOP paragraphs, hazard notes, curriculum theory; top-k returned with citations.
- **Prompting:** System template with safety rules; user message with scene state; tools/functions: `get_expected_outcome`, `get_fix_for_error`, `summarize_attempt`.
- **Guardrails:** Rule-engine cross-check; refusal policy for unsafe encouragement; profanity/PII filters; max token and latency budgets.
- **Fallbacks:** If LLM unavailable, return rule-based hint and link to theory section.
- **Localization:** Slot-based templates for Urdu; avoid full-freeform translation to control tone/length.

## 7. Flows (textual)
- **Simulation Session:**
  1) Frontend requests `POST /sim/sessions` with experiment slug and mode.
  2) Receives session id + WebSocket URL; connects.
  3) User actions -> client state update + send `{action, payload}` to sim.
  4) Sim processes via rule engine + ML surrogates; emits `{state, events}`.
  5) Recorder stores timeline; AI tutor subscribed to same stream for context.
  6) On end/reset, recorder finalizes log and pushes summary to analytics.
- **Tutor Hint:**
  1) Frontend sends request with session id + recent actions.
  2) Tutor builds context, retrieves docs, prompts LLM.
  3) Rule-engine cross-checks; if mismatch, prefer rule output or dual response (expected vs unsafe).
  4) Stream response to UI; cache result keyed by state hash.

## 8. Deployment Topology
- **Local Dev:** Docker Compose: `frontend`, `api`, `sim`, `ai-tutor`, `db`, `redis`, `minio`, optional `pgvector`. Hot reload for frontend/backend.
- **Staging/Prod:** Frontend on Vercel/Static hosting; Backend/Sim/AI on container platform (Render/Fly/Cloud Run/K8s); dedicated Redis/PG; CDN for assets; GPU node optional for larger models.
- **Environments:** `.env` for secrets; `.env.example` tracked; CI injects environment for tests.

## 9. Observability
- Logging: structured JSON, request IDs; sensitive fields redacted.
- Metrics: Prometheus counters/histograms (latency, tick duration, queue depth, AI latency).
- Tracing: OpenTelemetry spans across API -> Sim -> AI tutor.
- Dashboards: Grafana for metrics; Sentry for errors; uptime checks.

## 10. Security and Safety Design
- AuthZ via roles + per-class ownership; JWT with short access + refresh rotation.
- Input validation on all experiment authoring fields; content scanning for uploads.
- Rate limiting on tutor and sim endpoints; circuit breakers on AI provider failures.
- Safety policies embedded in tutor prompts and post-filter; hazard thresholds immutable without admin rights.
- Data encryption in transit (HTTPS) and at rest (DB encryption if cloud-managed; object storage SSE).

## 11. Testing Strategy (design level)
- Unit: rule engine functions, circuit solver, hazard event triggers, tutor prompt builder.
- Integration: API + DB + queue; simulation session via WebSocket; tutor RAG path with fake LLM.
- E2E: Playwright/Cypress for student flow (happy path + hazardous path), teacher assignment, report generation.
- Performance: simulation tick under load; WebSocket concurrency soak; AI latency budget tests.
- Visual regression: scene snapshots per experiment and hazard effect variants.

## 12. Migration and Content Pipeline
- Experiment definitions kept in versioned YAML; migration scripts to sync DB catalog with repo files.
- Asset pipeline: ingest GLTF/GLB, compress textures, generate LOD variants; store checksums and licenses.
- Embedding pipeline: generate embeddings from SOPs/hazards; write to pgvector/FAISS with version tags.

## 13. Open Design Decisions / TODOs
- Choose circuit solver home (server-only vs shared wasm module).
- Pick default local LLM (Llama 3.1 8B vs Mistral 7B) and quantization level for available hardware.
- Finalize hazard visual FX stack (GPU particles vs sprite sheets for low-end).
- Confirm analytics granularity to balance storage vs insight.


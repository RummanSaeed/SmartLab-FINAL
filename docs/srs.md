# Software Requirements Specification (SRS) — SmartLab

## 1. Purpose and Scope
- **Purpose:** Define the complete requirements for SmartLab, a web-based virtual science laboratory for Pakistani Federal Board Physics and Chemistry practicals, with AI tutoring, hybrid simulations, and teacher analytics.
- **Scope:** Student-facing lab workspace, AI tutor, teacher/admin portals, content authoring, assessment, analytics, deployment, and safety features (show both correct and failure outcomes).

## 2. References
- Project proposal and approved forms (FORM A/B).
- Architecture overview (`docs/architecture.md`).
- Experiment schema draft (`docs/spec/experiment-schema.md`).
- Federal Board Physics/Chemistry practical curricula.

## 3. Definitions and Acronyms
- **AI Tutor:** LLM-backed assistant that guides experiments and remediation.
- **Hybrid Simulation Engine (HSE):** Rule-based core plus ML surrogates for complex phenomena.
- **HSE Event:** Hazard or effect triggered by unsafe or atypical configurations.
- **RAG:** Retrieval-augmented generation for curriculum-aligned responses.
- **LO/LOD:** Level of detail for rendering and simulation.

## 4. Overall Description
- **Product Perspective:** Multi-tenant web platform with rich 2D/3D lab, consumable via browsers on desktop/mobile. Backend exposes APIs/WebSockets for simulations, AI tutor, analytics, and content.
- **Users and Roles:** Student, Teacher, Admin (optional: School Admin, Content Author).
- **Operating Environment:** Modern browsers with WebGL 2 support; backend on Linux containers; PostgreSQL; object storage for assets; optional GPU for AI/ML.
- **Design Constraints:** Low bandwidth mode; safety-first UX; offline-friendly asset caching; restricted/air-gapped operation without external AI if needed.
- **Assumptions:** Federal Board practical lists available; 3D assets can be sourced or created; at least quantized local LLM can run on available hardware.

## 5. Functional Requirements
### 5.1 Authentication and Accounts
- FR-01: Users can sign up/login with email/password; password reset via email token.
- FR-02: Role-based access (Student, Teacher, Admin); role stored in JWT claims and DB.
- FR-03: OAuth (Google/Microsoft) optional; fallback to local accounts.

### 5.2 Onboarding and Profiles
- FR-04: Onboarding asks grade/subjects; sets default experiment catalog filters.
- FR-05: Profile stores grade, school, language preference (EN/UR), accessibility preferences, and hardware capability (GPU flag, low/hi-poly toggle).

### 5.3 Experiment Catalog
- FR-06: Browse/search/filter experiments by subject, grade, topic, tags, hazard level.
- FR-07: Experiment detail page: objective, theory, apparatus list, steps, safety, expected outcomes, failure cases, assessment rubric.
- FR-08: Teachers can assign experiments to classes with due dates; students see assigned list.

### 5.4 Virtual Lab Workspace (2D/3D)
- FR-09: Drag/drop apparatus and chemicals/components into the scene; snap-to points and connection nodes for circuits.
- FR-10: Control simulation (play/pause/reset, time-scale, step-by-step).
- FR-11: Instruments: voltmeter/ammeter, multimeter, thermometer, stopwatch, balance, ruler; readings update in real time.
- FR-12: Logs: time-series data, charting, tabular export (CSV/PDF) per run.
- FR-13: Safety system: pre-warning for hazardous setups; if user proceeds, render realistic failure outcomes (fire/smoke/sparks/blast, circuit burn) and explain cause/effect.
- FR-14: Undo/redo for actions in the scene; snapshot/replay.
- FR-15: Supports low-poly/2D fallback mode for low-end devices; togglable quality settings.

### 5.5 Hybrid Simulation Engine (HSE)
- FR-16: Rule engine executes deterministic formulas (mechanics, electricity, basic chemistry stoichiometry, thermodynamics thresholds).
- FR-17: ML surrogates estimate complex/continuous effects (heat diffusion, fluid turbidity, flame spread visuals) and sensor noise.
- FR-18: Event system triggers hazards (overvoltage melt, exothermic runaway, gas release, glass shatter) with probabilities and thresholds.
- FR-19: HSE exposes API/WebSocket to step simulation and stream state updates and events.
- FR-20: Deterministic grading mode: seeded, reproducible outcomes for assessments.
- FR-21: Sandbox permissiveness: allow any combination; compute consequence or null effect; never block silently.

### 5.6 AI Tutor
- FR-22: Provides context-aware hints, explanations, and step suggestions based on current scene state and experiment goals.
- FR-23: Uses RAG over curriculum docs and experiment SOPs; cites sources/sections.
- FR-24: Predicts expected outcomes given current setup; contrasts with simulation results; flags misconceptions.
- FR-25: If unsafe path chosen, explains risk and aftermath alongside rendered failure.
- FR-26: Teacher assist: auto-generate quizzes/rubrics and summaries of student attempts.
- FR-27: Language: English with optional Urdu templated outputs for key hints.

### 5.7 Teacher Dashboard
- FR-28: Manage classes/sections; invite students; assign experiments.
- FR-29: View live/near-real-time student sessions (stream of events/flags).
- FR-30: Analytics: attempts per experiment, time-on-task, common errors, pass/fail against rubric.
- FR-31: Content authoring: clone/edit experiment templates (metadata, steps, thresholds, hazards).

### 5.8 Student Dashboard
- FR-32: View assigned experiments, due dates, completion state, scores.
- FR-33: Access history of runs, logs, AI tutor feedback, and generated lab reports.

### 5.9 Assessment and Reporting
- FR-34: Pre/post quizzes (MCQ/short answer); auto-grade MCQ; teacher grade free-text.
- FR-35: Lab report generator (template + AI drafting) with editable sections; export PDF.
- FR-36: Rubric-based scoring for experiments with deterministic mode enforcement.

### 5.10 Content and Assets
- FR-37: Experiments stored as structured files (YAML/JSON) with metadata, thresholds, hazards, and assets references.
- FR-38: Asset library for 3D models, textures, icons, sounds with versioning and license metadata.
- FR-39: Bulk import from provided Federal Board practical files; validation checks.

### 5.11 Admin and Operations
- FR-40: Manage users, roles, feature flags, and content publishing workflow.
- FR-41: System health dashboard: API latency, simulation tick health, AI call success rate.
- FR-42: Audit logs for admin actions and AI tutor responses (for safety review).

### 5.12 Localization and Accessibility
- FR-43: UI text externalized for i18n; supports EN baseline and UR extension.
- FR-44: WCAG-friendly color contrast; keyboard shortcuts for lab controls; ARIA labels.

## 6. External Interface Requirements
- **User Interface:** Responsive web UI with 3D canvas, control panels, AI chat pane, charts/logs, dashboards.
- **APIs:** REST for CRUD (users, experiments, assignments), WebSocket for simulation ticks and AI tutor streaming, file upload endpoints for assets.
- **Hardware Interfaces:** None required beyond WebGL-capable device; optional microphone for future STT.
- **Communications:** HTTPS; JWT for auth; database connectivity via secure network; optional offline/local inference mode.

## 7. Non-Functional Requirements
- **Performance:** Simulation tick <= 33 ms target for interactive mode; AI tutor first token < 2.5s using local or cached responses; dashboards < 1s p95 page load on warmed cache.
- **Scalability:** Horizontal scaling of API and WebSocket nodes; CDN for assets; queue-based async jobs.
- **Reliability:** 99.5% uptime target; graceful degradation to low-poly and deterministic offline modes.
- **Security:** OWASP ASVS-aligned; hashed passwords; rate limiting; input validation; secrets in env vars; content integrity checks.
- **Privacy:** Minimal PII; data retention policy per school; GDPR-like consent where applicable.
- **Safety:** Hazard thresholds enforced; warnings before dangerous actions; post-mortem guidance; AI safety filters and guardrails.
- **Usability:** Tutorials, tooltips, keyboard shortcuts; low-bandwidth toggle; localization support.
- **Maintainability:** Modular services; typed APIs (OpenAPI/TypeScript types); CI with lint/format/tests; migration scripts.
- **Portability:** Dockerized; works on Linux servers and cloud providers; asset storage abstracted (S3-compatible).

## 8. Data Requirements
- Experiment definitions with apparatus, parameters, thresholds, hazards, expected outcomes.
- User data: accounts, roles, preferences, class membership.
- Session data: actions timeline, measurements, AI tutor interactions, logs for analytics.
- Content assets: 3D/2D models, textures, sounds, documents with license metadata.
- AI artifacts: vector store (curriculum embeddings), prompt templates, safety rules.

## 9. Use Cases (Representative)
- UC-01: Student performs assigned DC circuit experiment, receives hints, exports report.
- UC-02: Student intentionally reverses polarity; system warns, then shows LED burn-out with explanation.
- UC-03: Teacher assigns titration experiment, monitors live sessions, reviews reports.
- UC-04: Admin publishes updated experiment template and hazard thresholds.
- UC-05: AI tutor contrasts expected precipitation with observed (none) and suggests correct salt.

## 10. Acceptance Criteria
- End-to-end flow for at least one Physics and one Chemistry experiment meets FR-06 to FR-21 with AI tutor guidance and hazard rendering.
- Teacher dashboard shows assignments and analytics from recorded sessions.
- Deterministic grading mode produces repeatable scores for rubric checks.
- Low-poly/2D fallback functional on low-end device (manual test).
- Security: JWT auth, rate limiting, input validation, and secrets managed via env vars.

## 11. Future Enhancements (Non-commitment)
- Speech input and voice tutor.
- Multi-user collaborative lab session.
- Vision-based grading of uploaded lab photos/videos.
- Mobile app wrapper (React Native/Capacitor).


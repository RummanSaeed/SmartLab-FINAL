# SmartLab — Architecture Overview

This document summarises the high-level architecture for the SmartLab platform. It is written to be implementation-friendly and to guide the initial scaffolding.

1) Frontend
- Framework: Next.js + TypeScript
- 3D: React Three Fiber (Three.js) + @react-three/drei, glTF assets
- UI: TailwindCSS + Framer Motion; Konva for 2D overlays (instruments)
- Responsibilities: scene rendering, interaction, instrument widgets, audio/visual effects, sending actions to backend and receiving timestep updates.

2) Backend
- Framework: FastAPI (Python)
- Responsibilities: experiments API, simulation orchestrator, AI Tutor gateway (LLM calls + retrieval), user/session logging, teacher analytics.
- Data store: PostgreSQL for persistent data, local JSON files in `datasets/` for experiment metadata.

3) Hybrid Simulation Engine
- Rule Engine: deterministic formulas per experiment (fast, explainable)
- ML Augmentation: tree-based regressors/classifiers (XGBoost/LightGBM) to model sensor noise and failure probabilities
- Fusion Layer: confidence-weighted blending of rule predictions and ML corrections

4) AI Tutor
- Retrieval augmentation (FAISS or vector DB) for experiment docs + steps
- Hosted LLM inference (OpenAI or Hugging Face Endpoints) for natural language explanations and step-by-step tutoring

5) DevOps
- Local dev: Docker Compose (frontend + backend + DB)
- CI: GitHub Actions to run tests and build images
- Hosting: Frontend -> Vercel; Backend -> Render / Cloud run. LLM and heavy training on Hugging Face or Colab as needed.

6) Security & Safety
- Use environment variables for secrets
- Safety filters on AI Tutor responses
- Teacher consent flow for hazardous simulations

Notes
- Keep components modular so we can replace LLM providers or the vector DB without wide refactors.

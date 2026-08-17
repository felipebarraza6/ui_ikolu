# Plan: SmartHydro API Audit, Dead Module Cleanup & Capa One Consolidation

## Objective
Audit the entire SmartHydro API against the `ui_ikolu` codebase, eliminate obsolete/dead modules and mock calls, and consolidate the "Capa One" single-layer architecture to guarantee 100% gap-free integration and pristine React compilation.

## Phases

### Phase 0: Survey & Gap Analysis
- Spawn 3 parallel survey explorers:
  1. Explorer 1 (`teamwork_preview_spec_miner`): Probe SmartHydro OpenAPI schema (`https://api.smarthydro.app/api/schema/`, `https://api.smarthydro.app/api/schema/swagger-ui/`) and document the complete DRF API inventory (endpoints, methods, schemas, parameters, auth).
  2. Explorer 2 (`teamwork_preview_explorer`): Audit codebase API services (`src/api/sh/endpoints.js`, `src/api/orchestrator.js`, React query hooks, axios clients) to identify matched endpoints, missing endpoints, dead endpoints, or parameter mismatches.
  3. Explorer 3 (`teamwork_preview_explorer`): Audit frontend UI structure, components, navigation, and routes across Capa One (Puntos de Captación, Telemetría, Cumplimiento DGA/SMA, Alertas, Usuarios, Clientes, Proyectos), identifying dead components, legacy mock layers, and broken views.
- Synthesize findings into `PROJECT.md` (Feature Inventory, Gap Analysis, Dead Module List).

### Phase 1: Implementation & Consolidation
- Decompose and execute milestones:
  - Milestone 1: API Layer & Endpoints Refactoring (`endpoints.js`, `orchestrator.js`, service clients aligned 1:1 with DRF spec, zero 404/dead endpoints).
  - Milestone 2: Obsolete / Dead Code Removal (Remove unreferenced components, mock routes, deprecated adapters, unused dependencies).
  - Milestone 3: Capa One Full Feature Integration & UI Consolidation (Puntos de Captación, Telemetría, Cumplimiento DGA/SMA, Alertas, Usuarios, Clientes, Proyectos properly wired and reactive).
- Iteration loop per milestone with Workers, Reviewers, Challengers, and Forensic Auditors.

### Phase 2: Comprehensive E2E / Unit Verification & Hardening
- Build validation (`npm run build` or equivalent clean compilation with zero warnings/errors).
- Static analysis & lint verification.
- Dual-track opaque-box / E2E verification test suite (`TEST_READY.md`).
- Multi-perspective review, challenger tests, and forensic integrity audit.

### Phase 3: Final Reporting & Human Handoff
- Generate final Gap Analysis report and consolidation summary.
- Deliver victory report back to parent.

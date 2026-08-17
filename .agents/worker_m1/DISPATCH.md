# DISPATCH: Milestone 1 — API Layer & Gateway Consolidation

## Identity
- Role: teamwork_preview_worker
- Working Directory: c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\worker_m1
- Parent Conversation ID: 095c1445-f6d9-4499-bc93-e1ac496270c1

## Context & Objective
The user has requested an exhaustive audit of the SmartHydro API against the `ui_ikolu` codebase and consolidation of the single-layer ("Capa One") architecture.
Read:
- `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\PROJECT.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\explorer_api_survey_1\api_audit.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\spec_miner_survey_1\spec_report.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Assigned Milestone 1 Scope
You exclusively own and must modify:
1. `src/api/sh/endpoints.js`
2. `src/api/orchestrator.js`
3. `src/api/sh/config.js`
4. `src/features/admin/components/DgaQueuePanel.jsx`
5. `src/features/admin/components/PointsStatusTable.jsx`

## Task Instructions
1. In `src/api/sh/endpoints.js`:
   - Fix `reportsDownloadActivePoints`: ensure it uses clean `reports/active-points/` or correct DRF path.
   - Fix `pointsBatchStatus`: ensure it posts `{ point_ids, days }` to `ik/batch/stats/` as per DRF OpenAPI spec.
   - Remove obsolete/dead 404 endpoints (`history_data/`, `compliance/dga/verify/`, and legacy unused endpoints).
   - Ensure all DRF endpoints match the official schema.
2. In `src/api/orchestrator.js`:
   - Expose `requeueDga(id)`, `clearDgaQueue()`, and `updatePointFrequency(pointId, freq)` under `orchestrator.management`.
   - Ensure `admin.pointsByProject` is aligned and clean.
   - Ensure batch telemetry fallback is robust and doesn't call 404 endpoints.
3. In UI Components (`DgaQueuePanel.jsx` and `PointsStatusTable.jsx`):
   - Replace direct imports of `sh` from `../../api/sh/endpoints` with `orchestrator` from `../../api/orchestrator` (Capa One architecture compliance).
4. Run verification commands:
   - `node scripts/patch-rc-components.js`
   - `npm run build`
5. Write your detailed `handoff.md` and `progress.md` in `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\worker_m1` and send a message when done.

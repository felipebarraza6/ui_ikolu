# Progress: Milestone 1 — API Layer & Gateway Consolidation

**Last visited**: 2026-08-17T17:52:00Z
**Status**: COMPLETED

## Steps Completed
- [x] Initialized BRIEFING.md and reviewed DISPATCH.md, PROJECT.md, and survey reports.
- [x] Analyzed code differences in `src/api/sh/endpoints.js`, `src/api/orchestrator.js`, `src/api/sh/config.js`, `src/features/admin/components/DgaQueuePanel.jsx`, and `src/features/admin/components/PointsStatusTable.jsx`.
- [x] Fixed `reportsDownloadActivePoints` to use clean `reports/active-points/` endpoint.
- [x] Fixed `pointsBatchStatus` to use `POST ik/batch/stats/` with `{ point_ids, days }` payload.
- [x] Removed obsolete/dead endpoints `history_data/` (`get_history_data`, `get_history_data_admin`, `billing_data`, `billing_data_admin`) and `compliance/dga/verify/` (`verifyDgaVoucher`) from `endpoints.js`.
- [x] Exposed `clearDgaQueue`, `requeueDga`, `updatePointFrequency`, `systemMap`, `notificationsSummary` in `orchestrator.management` and at top level.
- [x] Updated `orchestrator.admin.pointsByProject` to call `sh.admin.pointsByProject(projectId)`.
- [x] Updated `getBatchTelemetry` fallback in `orchestrator.js` to call modern `sh.ikPoint.summary(id)` instead of deprecated `sh.get_data_sh(id)`.
- [x] Replaced direct `sh` imports in `DgaQueuePanel.jsx` and `PointsStatusTable.jsx` with `orchestrator.management` (Capa One architecture compliance).
- [x] Verified patch and build with `node scripts/patch-rc-components.js` and `npm run build` (Exit code 0).
- [x] Wrote `handoff.md` report.

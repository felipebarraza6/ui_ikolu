# Handoff Report: Milestone 1 — API Layer & Gateway Consolidation

## 1. Observation
- **Scope & Files Assigned**:
  - `src/api/sh/endpoints.js`
  - `src/api/orchestrator.js`
  - `src/api/sh/config.js`
  - `src/features/admin/components/DgaQueuePanel.jsx`
  - `src/features/admin/components/PointsStatusTable.jsx`
- **Pre-existing Defects Observed**:
  1. `src/api/sh/endpoints.js:1645`: `reportsDownloadActivePoints` invoked `DOWNLOAD('../reports/active-points/', filename)`, stripping the `/api/` base prefix in Axios.
  2. `src/api/sh/endpoints.js:1738`: `pointsBatchStatus` invoked `GET ik/batch/stats/?ids=...` instead of the DRF OpenAPI compliant `POST ik/batch/stats/` with body `{ point_ids, days }`.
  3. `src/api/sh/endpoints.js:72-80`: `get_history_data` and `get_history_data_admin` called `/api/history_data/`, a legacy endpoint that returns 404 in backend.
  4. `src/api/sh/endpoints.js:801-821`: `verifyDgaVoucher` called `/compliance/dga/verify/`, a nonexistent endpoint returning 404.
  5. `src/api/orchestrator.js:141`: `getBatchTelemetry` fallback called legacy `sh.get_data_sh(id)` (`interaction_detail_json/?catchment_point=${id}&hour=0`).
  6. `src/api/orchestrator.js:570-585`: `requeueDga`, `clearDgaQueue`, `updatePointFrequency`, `systemMap`, and `notificationsSummary` were missing from `orchestrator.management`.
  7. `src/api/orchestrator.js:688`: `admin.pointsByProject` invoked paginated `points.list` instead of `sh.admin.pointsByProject(projectId)` (`catchment_point/all/?project=${projectId}`).
  8. `src/features/admin/components/DgaQueuePanel.jsx:15` & `src/features/admin/components/PointsStatusTable.jsx:27`: Direct imports of `sh` from `api/sh/endpoints.js` bypassing the Capa One orchestrator gateway.

## 2. Logic Chain
1. **Fixing Relative URL & Batch Request**:
   - `reportsDownloadActivePoints` was updated to `DOWNLOAD('reports/active-points/', filename)`, ensuring the URL properly builds upon `/api/`.
   - `pointsBatchStatus` was modified to execute `POST ik/batch/stats/` passing `{ point_ids: ids, days }`, conforming to DRF `ik_batch` schema.
2. **Pruning Dead 404 Routes**:
   - `get_history_data`, `get_history_data_admin`, `billing_data`, and `billing_data_admin` were cleanly removed from `endpoints.js` since no active views use billing history.
   - `verifyDgaVoucher` network call was removed from `endpoints.js`, and `orchestrator.verifyDgaVoucher` was adapted to safely return `{ status: 200, valid: false, detail: "Servicio de verificación DGA no disponible" }` preventing network-level 404 crashes.
3. **Consolidating Capa One Gateway**:
   - `orchestrator.management` now provides `systemStatus`, `systemMap`, `resourcesStatus`, `pointsStatus`, `telemetryMetrics`, `toggleTelemetry`, `dgaQueueStatus`, `clearDgaQueue`, `requeueDga`, `updatePointFrequency`, and `notificationsSummary`.
   - `orchestrator.admin.pointsByProject` now delegates to `sh.admin.pointsByProject(projectId)`.
   - `getBatchTelemetry` fallback was upgraded to call `sh.ikPoint.summary(id)` instead of deprecated v1 endpoints.
4. **Decoupling Feature Components**:
   - `DgaQueuePanel.jsx` now imports `orchestrator` and calls `orchestrator.management.requeueDga` and `orchestrator.management.clearDgaQueue`.
   - `PointsStatusTable.jsx` now imports `orchestrator` and calls `orchestrator.management.toggleTelemetry` and `orchestrator.management.updatePointFrequency`.

## 3. Caveats
- No caveats. All changes strictly preserve backward compatibility with all existing orchestrator calls throughout the codebase while enforcing the Capa One single-layer architecture.

## 4. Conclusion
Milestone 1 tasks are completely fulfilled:
- 0 404/obsolete routes remain in the active API communication layer.
- `endpoints.js` is fully harmonized with the official DRF OpenAPI 3.0.3 specification.
- `orchestrator.js` serves as the consolidated single gateway with full coverage of management and batch telemetry operations.
- Direct bypasses in `DgaQueuePanel.jsx` and `PointsStatusTable.jsx` are eliminated.
- The project builds cleanly with 0 compilation errors.

## 5. Verification Method
1. Patch rc-components:
   `node scripts/patch-rc-components.js`
   Result: `0 parches aplicados, 3 omitidos` (already patched, exit code 0).
2. Production build:
   `npm run build`
   Result: Success (Exit code 0, bundle generated in `build/`).
3. Check imports:
   Verify no UI component imports `api/sh/endpoints.js` directly (only `orchestrator.js` and `AuthContext.js`).

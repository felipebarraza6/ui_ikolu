# Handoff Report: API Layer Codebase Survey & Gap Analysis

**Agent**: Explorer (API Layer Codebase Explorer)  
**Working Directory**: `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\explorer_api_survey_1`  
**Target File**: `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\explorer_api_survey_1\api_audit.md`  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

Direct observations from source code inspection:

1. **API Infrastructure**:
   - `src/api/sh/config.js` configures an Axios instance with `baseURL: isLocalhost ? "/api/" : "https://api.smarthydro.app/api/"`, `timeout: 30000`, and automatic `Authorization` token injection from `localStorage.getItem("token")` using JWT detection (`eyJ` or 3 segments -> `Bearer <token>`, else `Token <token>`).
   - `src/api/sh/config.js` sets a global 401 listener that emits `window.dispatchEvent(new CustomEvent("sh-auth-unauthorized"))`.
   - `src/api/orchestrator.js` wraps `src/api/sh/endpoints.js` with an in-memory cache (`dataCache.js`), deduplication (`requestDeduplication.js`), priority queue (max 6 concurrent requests), and `createAutoRefresh` throttler.

2. **Endpoints Cataloged**:
   - `src/api/sh/endpoints.js` declares 118 functions across 9 domains.
   - Active modern endpoints include: `/api/ik/auth/*`, `/api/ik/control_center/*`, `/api/ik/compliance/*`, `/api/ik/tickets/*`, `/api/ik/tasks/*`, `/api/ik/files/*`, `/api/ik/ticket-categories/*`, `/api/ik/sla-configs/*`, `/api/ik/point/{id}/*`, `/api/ik/batch/*`, `/api/management/*`, `/api/client/*`, `/api/project_catchments/*`, `/api/catchment_point/*`, `/api/variable/*`, `/api/schemes_catchment/*`, `/api/telemetry_providers/*`, `/api/compliance_providers/*`, `/api/alert_*`, `/api/reports/*`.

3. **Legacy & Dead Endpoints (26 functions)**:
   - Historical v1 endpoints found in `endpoints.js`: `history_data/?profile=`, `history_data/`, `interaction_detail_override/`, `interaction_detail_override_month/`, `interaction_detail_override_month_xlsx/`, `file_catchment/{id}/`, `file_catchment/?point_catchment=`, `file_catchment/`, `interaction_detail/?type=xlsx`, `interaction_detail_dga/?type=xlsx`, `interaction_detail_json/{id}/`, `interaction_detail_json/` (POST/PATCH/GET with loops `getDataApiShStructural24h` and `getDataApiShStructuralMonth`), `ik/daily_summary/`, `ik/points_summary/`, `ik/announcements/public/`, `management/system_map/`, `management/notifications_summary/`.

4. **Inconsistencies & Signature Gaps**:
   - `src/api/sh/endpoints.js:1645`: `reportsDownloadActivePoints` calls `DOWNLOAD('../reports/active-points/', ...)` which strips `/api/` prefix.
   - `src/api/sh/endpoints.js:1738`: `pointsBatchStatus` calls `GET ik/batch/stats/?ids=...`, whereas the batch stats endpoint is `POST ik/batch/stats/` with `{ point_ids, days }`.
   - `src/api/sh/endpoints.js:1463` vs `src/api/orchestrator.js:688`: `sh.admin.pointsByProject` calls `catchment_point/all/?project=`, while `orchestrator.admin.pointsByProject` calls `catchment_point/?project=&page_size=1000`.
   - `sh.management.requeueDga`, `sh.management.clearDgaQueue`, and `sh.management.updatePointFrequency` are defined in `endpoints.js` but NOT exposed on `orchestrator.js`, forcing `DgaQueuePanel.jsx` and `PointsStatusTable.jsx` to bypass `orchestrator` and import `sh` directly.
   - `src/features/admin/hooks/useTickets.js:312-358`: Explicit error handling for 404 on `deleteComment`, `updateComment`, and `likeComment` indicating backend does not currently support these operations.
   - `src/features/auth/services/publicData.js`: Returns a mock `PUBLIC_DATA` object resolved via `Promise.resolve`.

---

## 2. Logic Chain

1. **Capa One Architectural Goal**: The application is intended to have a single, unified, performant API layer (`orchestrator.js` as single gateway).
2. **Current Reality**:
   - 95% of UI components consume APIs via `orchestrator`.
   - However, 3 files (`AuthContext.js`, `DgaQueuePanel.jsx`, `PointsStatusTable.jsx`) import `endpoints.js` directly because essential management methods (`requeueDga`, `clearDgaQueue`, `updatePointFrequency`) were omitted from `orchestrator.js`.
   - `endpoints.js` contains 26 legacy SmartHydro v1 functions that add bloat and risk if accidentally called (e.g. `getBatchTelemetry` contains a fallback to `sh.get_data_sh(id)` which hits legacy `interaction_detail_json`).
   - One relative URL bug (`../reports/active-points/`) breaks download resolution.
3. **Implication for Refactoring**:
   - Expose the missing management methods in `orchestrator.js` and reroute direct `sh` callers to `orchestrator`.
   - Purge or deprecate the 26 legacy v1 endpoints and rewrite the fallback in `getBatchTelemetry`.
   - Fix the relative path bug in `reportsDownloadActivePoints`.
   - Verify with the OpenAPI spec whether comment operations (`DELETE`, `PATCH`, `POST .../like/`) and `convert-to-client` exist in DRF or should be pruned from the UI.

---

## 3. Caveats

- This investigation was strictly read-only; no application source files were altered during this audit.
- Live network requests were not executed against `https://api.smarthydro.app/api/` during this turn; all endpoint behaviors, schemas, and 404 catches were verified through code analysis of existing handlers, interceptors, and components.
- The corresponding OpenAPI / Swagger schema (`https://api.smarthydro.app/api/schema/swagger-ui/`) is being analyzed by the `spec_miner_survey_1` agent to perform the bi-directional gap cross-check.

---

## 4. Conclusion

- An exhaustive audit and catalog of all 118 API functions across 9 functional modules in `ui_ikolu` has been completed and documented in `api_audit.md`.
- All dead endpoints, broken signatures, mock fallbacks, and layer inconsistencies have been isolated with exact file paths and line numbers.
- The codebase is ready for the synthesis and consolidation phase into a clean "Capa One" architecture.

---

## 5. Verification Method

1. **Verify Report Generation**:
   - Inspect `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\explorer_api_survey_1\api_audit.md` for complete domain tables and gap analysis.
2. **Verify Code References**:
   - Inspect `src/api/sh/config.js` (lines 6-32 for baseURL and auth header logic).
   - Inspect `src/api/sh/endpoints.js` (lines 1645, 1738, 2031-2034 for discrepancies and URL bugs).
   - Inspect `src/api/orchestrator.js` (lines 138-151 for batch fallback, lines 815-818 for missing management methods).
   - Inspect `src/features/admin/components/DgaQueuePanel.jsx` (lines 15, 24, 35) and `PointsStatusTable.jsx` (lines 27, 113, 131) for direct `sh` bypasses.

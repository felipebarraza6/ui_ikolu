# Project: ui_ikolu — SmartHydro API Audit & Capa One Consolidation

## Architecture
- **Single-Layer (Capa One) Architecture**: All UI components communicate with the SmartHydro backend exclusively through `src/api/orchestrator.js` as the central gateway with integrated caching (`dataCache.js`), deduplication (`requestDeduplication.js`), priority queue, and auto-refresh throttling.
- **Backend**: Django REST Framework (DRF) v2.0.0 (`https://api.smarthydro.app/api/`) with JWT authentication (`Bearer <token>`).
- **Frontend Core**: React 18, React Router v6, TailwindCSS, Ant Design / RC Components with patch tooling.
- **Domains Covered**:
  1. Authentication & Profile (`/api/ik/login/`, `/api/ik/auth/*`, `/api/users/me/`)
  2. Puntos de Captación (`/api/catchment_point/*`, `/api/ik/my_points/`, `/api/ik/point/{id}/*`)
  3. Telemetría & Sensores (`/api/interaction_detail_json/`, `/api/ik/batch/*`, `/api/counter_reset_logs/`, `/api/telemetry-reprocessor/`)
  4. Centro de Control (`/api/ik/control_center/*`, `/api/ik/dashboard_stats/`, `/api/chat/`)
  5. Cumplimiento DGA / SMA (`/api/ik/compliance/*`, `/api/compliance_providers/*`, `/api/dga_data_config_catchment/*`)
  6. Motor de Alertas (`/api/alert_rules/*`, `/api/alert_channels/*`, `/api/alert_triggers/*`)
  7. Soporte Técnico / Tickets (`/api/ik/tickets/*`, `/api/ik/ticket-categories/*`, `/api/ik/sla-configs/*`, `/api/ik/files/`)
  8. Gestión del Sistema & Salud (`/api/management/*`, `/api/system_events/`)
  9. Catálogos Maestros (`/api/variable/*`, `/api/schemes_catchment/*`, `/api/telemetry_providers/*`, `/api/file_catchment/*`)
  10. Clientes & Proyectos (`/api/client/*`, `/api/project_catchments/*`)
  11. Usuarios (`/api/users/*`)
  12. Reportes Oficiales (`/api/reports/json/*`)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | DRF Endpoints Harmonization | Align `endpoints.js` 1:1 with OpenAPI spec, fix path bugs (`../reports/active-points/`), fix POST `pointsBatchStatus`, eliminate dead 404 routes (`history_data/`, `compliance/dga/verify/`) | M1 | Survey |
| 2 | Capa One Gateway Consolidation | Expose `requeueDga`, `clearDgaQueue`, `updatePointFrequency` in `orchestrator.js`; eliminate direct `sh` imports in UI components | M1 | Survey |
| 3 | Dead Component Pruning | Remove 9 unreferenced dead files (`ControlCenterDrawers.js`, `useControlCenter.js`, `AlertsLayout.js`, `TicketMetrics.jsx`, `ServiceCard.jsx`, `IkoluFeatures.jsx`, `LoginFlipCard.jsx`, `SmartDrawer.js`, `SmartIconButton.jsx`) | M2 | Survey |
| 4 | Dead Context & Unused Dependencies Cleanup | Remove obsolete `DataContext.js` / `DataProvider` and prune 7 unused npm packages (`faker`, `qrcode.react`, `rc-queue-anim`, `crypto`, `i18next`, `react-i18next`, `jspdf`) | M2 | Survey |
| 5 | ESLint Cleanliness & UI Hardening | Fix 22 compiler/linter warnings in `ControlCenter.js`, `ModuleTour.js`, `StatusBadge.jsx`, `ComplianceDetailDrawer.js`, `MeasurementsDrawer.js`, `SupportDrawer.js`, `useControlCenterData.js`, `ControlCenterLayout.js`, `MeasurementDrawer.js`, `WeekConsumption.js` | M3 | Survey |
| 6 | Domain UI & Capa One Verification | Verify end-to-end user flows for Puntos de Captación, Telemetría, Cumplimiento DGA/SMA, Alertas, Usuarios, Clientes, Proyectos, and Soporte in Capa One | M3 | Survey |
| 7 | Dual-Track E2E Test Suite | Build opaque-box requirement-driven test harness and test cases (Tiers 1-4) with pass signal | M4 | Survey |
| 8 | Adversarial Hardening & Forensic Audit | White-box edge case testing (Tier 5) with Challenger and Forensic Integrity verification | M4 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | API Layer & Gateway Consolidation | `src/api/sh/endpoints.js`, `src/api/orchestrator.js`, `src/api/sh/config.js`, eliminate 404 routes, fix direct bypasses | None | IN_PROGRESS |
| 2 | Dead Code & Dependency Pruning | Remove 9 unreferenced files, remove `DataContext.js`, clean `package.json` unused dependencies | M1 | PLANNED |
| 3 | ESLint Zero-Warning & Capa One Polish | Fix 22 ESLint warnings across 9 files, verify reactive UI data flow | M2 | PLANNED |
| 4 | Final E2E Test Suite, Challenger Hardening & Audit | Opaque-box E2E test suite (Tiers 1-4) in `TEST_READY.md`, Tier 5 Challenger, and Forensic Auditor verification | M3 | PLANNED |

## Interface Contracts
### `src/api/orchestrator.js` (Capa One Single Entry Point)
- `orchestrator.auth.*`: `login(email, password)`, `verifyToken()`, `getMe()`, `updateProfile(data)`, `changePassword(data)`, `publicAnnouncements()`
- `orchestrator.points.*`: `list(params)`, `get(id)`, `myPoints()`, `getByProject(projectId)`, `getHistoricalSummary(id)`, `getLatest(id)`, `getBatchStatus(pointIds, days)`
- `orchestrator.telemetry.*`: `getBatchTelemetry(pointIds, hours, options)`, `getStructural24h(pointId)`, `getStructuralMonth(pointId, date)`, `reprocess(data)`
- `orchestrator.controlCenter.*`: `getData(params)`, `getDashboardStats()`, `chat(message)`
- `orchestrator.compliance.*`: `getData(params)`, `getDgaLogs(params)`, `getProviders()`, `getDgaConfigs()`
- `orchestrator.alerts.*`: `getRules(params)`, `getChannels(params)`, `getTriggers(params)`, `createRule(data)`, `updateRule(id, data)`, `deleteRule(id)`
- `orchestrator.tickets.*`: `list(params)`, `get(id)`, `create(data)`, `update(id, data)`, `getCategories()`, `getSlaConfigs()`, `uploadFile(file)`
- `orchestrator.management.*`: `getSummary()`, `getHealth()`, `getDgaQueue()`, `requeueDga(id)`, `clearDgaQueue()`, `updatePointFrequency(pointId, freq)`, `getSystemEvents(params)`
- `orchestrator.admin.*`: `getClients(params)`, `getProjects(params)`, `getVariables()`, `getSchemes()`, `getUsers(params)`, `getTelemetryProviders()`
- `orchestrator.reports.*`: `getByPoint(params)`, `getLastYear(params)`, `download(type, params)`

## Code Layout
```
src/
├── api/
│   ├── orchestrator.js        # Single entry gateway (Capa One)
│   └── sh/
│       ├── config.js          # Axios client & JWT headers
│       └── endpoints.js       # DRF API endpoint declarations
├── contexts/
│   ├── AuthContext.js         # Authentication state
│   └── TourContext.js         # Onboarding tour state
├── features/
│   ├── admin/                 # Backoffice & administrative views
│   ├── alerts/                # Alert configuration & triggers
│   ├── auth/                  # Login, password reset
│   └── control-center/        # Operational dashboard (Capa One)
└── shared/
    ├── components/            # Reusable UI widgets
    ├── hooks/                 # Common React hooks
    └── utils/                 # Formatting, date & export utilities
```

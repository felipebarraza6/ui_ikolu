# Test Infrastructure Documentation: ui_ikolu

## Overview
The testing infrastructure for `ui_ikolu` is built upon **Jest** and **React Testing Library** (integrated via `react-scripts`), configured to provide comprehensive opaque-box and contract verification for the **Capa One** architecture and Django REST Framework (DRF) v2.0.0 endpoints.

---

## Directory & File Structure
```
src/
├── __mocks__/
│   └── axios.js                               # Transport-level Axios mock with request/response interceptors
└── __tests__/
    ├── tier1_feature_drf_endpoints.test.js     # Tier 1: DRF API Endpoint contract verification (7+ domains)
    ├── tier1_orchestrator_gateway.test.js      # Tier 1: Capa One Orchestrator single gateway methods
    ├── tier2_boundaries_and_corner_cases.test.js # Tier 2: Token formats, 401 handling, error parsing, limits
    ├── tier3_cross_feature_combinations.test.js # Tier 3: Deduplication, in-memory caching, auto-refresh, queue
    └── tier4_real_world_scenarios.test.js      # Tier 4: End-to-end multi-step application scenarios
```

---

## Test Execution Commands

### 1. Run Complete Test Suite
```bash
npm test -- --watchAll=false
```

### 2. Run Specific Test Tier
```bash
# Tier 1: DRF Endpoints
npm test -- src/__tests__/tier1_feature_drf_endpoints.test.js --watchAll=false

# Tier 1: Orchestrator Gateway
npm test -- src/__tests__/tier1_orchestrator_gateway.test.js --watchAll=false

# Tier 2: Boundaries & Corner Cases
npm test -- src/__tests__/tier2_boundaries_and_corner_cases.test.js --watchAll=false

# Tier 3: Cross-Feature Combinations
npm test -- src/__tests__/tier3_cross_feature_combinations.test.js --watchAll=false

# Tier 4: Real-World Scenarios
npm test -- src/__tests__/tier4_real_world_scenarios.test.js --watchAll=false
```

---

## Test Tier Architecture

### Tier 1: Feature & Contract Coverage
- **DRF Endpoints (`tier1_feature_drf_endpoints.test.js`)**:
  - Direct HTTP transport validation against DRF v2.0.0 schema.
  - Verifies exact URL structures, query parameter serialization, multipart FormData payloads, and data extraction for Authentication, Puntos de Captación, Telemetría, Centro de Control, Cumplimiento DGA/SMA, Alertas, Soporte / Tickets, Gestión del Sistema, Catálogos Maestros, and Reportes Oficiales.
- **Capa One Orchestrator Gateway (`tier1_orchestrator_gateway.test.js`)**:
  - Validates that `orchestrator.js` acts as the single unified entry point for all UI domain interactions.
  - Asserts proper delegation, normalization, and caching integration for all domain methods.

### Tier 2: Boundaries & Corner Cases
- **Authentication & Headers**:
  - `getAuthHeader` handling for JWT 3-segment format (`Bearer <token>`), classic DRF tokens (`Token <token>`), stripping enclosing quotes and leading/trailing whitespace, and empty/null/undefined token safety.
- **DRF Error Normalization (`parseApiError`)**:
  - Validation of network errors (`isNetworkError`), unauthorized session expiry (`isAuthError`), plain text error bodies, field validation error arrays (`{ email: [...] }`), and `non_field_errors`.
- **Batch Processing Boundaries**:
  - Zero-point arrays returning immediate empty structure without issuing backend HTTP requests.
  - Large point lists exceeding `MAX_BATCH_SIZE` (50) sliced gracefully.
  - Fallback mechanisms executing individual parallel queries when native batch endpoints fail.
- **Attachment Validation**:
  - File presence verification, extension filtering (`.pdf`, `.png`, `.jpg`, `.xlsx`, etc.), and 10 MB maximum size enforcement.
- **DataCache Expiry & Eviction**:
  - Precision TTL validation, active eviction of expired keys, pattern-based invalidation, and statistics tracking.

### Tier 3: Cross-Feature Combinations & State Synergy
- **Request Deduplication**:
  - In-flight Promise sharing among concurrent callers requesting identical data keys.
  - Independent lifecycle re-fetching upon completion and clean error eviction on rejection.
- **Cache & Deduplication Integration**:
  - Combined behavior ensuring in-flight dedup joins followed by immediate dataCache hits on subsequent reads.
  - `invalidatePointCache(pointId)` cascading invalidation across telemetry, day, month, and batch namespaces.
- **AutoRefresh Lifecycle**:
  - Throttle enforcement honoring `MIN_REFRESH_INTERVAL` (30s) to protect backend bandwidth.
  - Forced manual refresh overrides and cleanup cancellation.

### Tier 4: Real-World Business & Application Scenarios
- **Scenario 1 (Control Center Operational Load)**:
  - Complete startup cycle: KPI stats, general stats, 7-day volume summary, paginated points list, system events, project switching, and assistant chat.
- **Scenario 2 (DGA Compliance & Queue Recovery)**:
  - Compliance audit, critical flow rate exceedance drilldown, 90-day near-limit history, telemetry frequency throttling, and DGA queue failure recovery (`requeueDga` / `clearDgaQueue`).
- **Scenario 3 (Field Support Ticket & SLA Escalation)**:
  - Ticket creation, SLA validation, technician assignment, work order category status update, schedule confirmation, subtask completion, and client conversion.
- **Scenario 4 (Telemetry Ingestion & Reprocessing Pipeline)**:
  - Batch ingestion, calendar view inspection, transmission gap identification, reprocessor job triggering, hardware counter reset logging, and fresh record reconciliation.

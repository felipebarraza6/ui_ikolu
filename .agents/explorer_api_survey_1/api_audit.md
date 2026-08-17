# Auditoría Exhaustiva de la Capa de API — ui_ikolu ("Capa One")

**Fecha de Auditoría**: 2026-08-17  
**Objetivo**: Analizar de manera exhaustiva todas las capas de comunicación API en `ui_ikolu` (`src/api/sh/config.js`, `src/api/sh/endpoints.js`, `src/api/orchestrator.js`, hooks, servicios, contextos y componentes) para catalogar endpoints implementados, configuraciones baseURL, autenticación, parámetros, identificar endpoints muertos/obsoletos, interceptores/fallbacks mock, firmas 404/rotas e inconsistencias.

---

## 1. Resumen Ejecutivo de la Arquitectura API

La aplicación `ui_ikolu` cuenta con una arquitectura de comunicación dividida en tres niveles principales:

```
[UI Components / Hooks / Contexts]
               │
               ▼
   [src/api/orchestrator.js]  ◄── Cache (dataCache), Deduplicación, Cola de Prioridad, Auto-Refresh Throttling
               │
               ▼
    [src/api/sh/endpoints.js]  ◄── Catálogo de funciones de red individuales (objeto `sh`)
               │
               ▼
     [src/api/sh/config.js]    ◄── Instancia Axios, Interceptores (Auth, 401), Manejador de Tokens, parseApiError
               │
               ▼
     [SmartHydro DRF API] (https://api.smarthydro.app/api/)
```

### Métricas Generales del Levantamiento
- **Total de Endpoints / Funciones de Red catalogadas**: 118 funciones individuales en `endpoints.js`.
- **Endpoints Activos y Consumidos por la UI**: ~72 endpoints (módulos modernos `/api/ik/*`, CRUDs admin, eventos, telemetría, tickets, alertas, reportes).
- **Endpoints Legacy / Obsoletos / Muertos**: 26 funciones pertenecientes a la API SmartHydro v1 histórica (`interaction_detail_override*`, `interaction_detail_json*`, `history_data*`, `file_catchment*`, `users/${username}/` con payload anidado masivo).
- **Inconsistencias y Desfases entre `endpoints.js` y `orchestrator.js`**: 8 discrepancias críticas (incluyendo métodos faltantes en `orchestrator` requeridos por paneles admin, firmas divergentes GET vs POST, y rutas redundantes).
- **Bugs de Rutas Relativas**: 1 bug de resolución en `reportsDownloadActivePoints` (`../reports/active-points/`).
- **Mocks y Mecanismos de Fallback**: 3 mecanismos detectados (`publicData.js`, fallback batch telemetría a `get_data_sh`, fallback de KPIs en `useControlCenterData`).
- **Endpoints con 404 / Gaps conocidos en Backend**: 3 acciones de comentarios de tickets (`DELETE /ik/tickets/{id}/comments/{cid}/`, `PATCH /ik/tickets/{id}/comments/{cid}/`, `POST .../like/`).

---

## 2. Infraestructura de Conexión, Autenticación y Axios

### 2.1. Configuración de BaseURL y Timeout (`src/api/sh/config.js`)
- **BaseURL**:
  - En entorno de desarrollo local (`localhost` o `127.0.0.1`): `"/api/"` (utiliza el proxy de desarrollo para evitar CORS).
  - En entorno de producción: `"https://api.smarthydro.app/api/"`.
- **Timeout**: `30000` ms (30 segundos máximo por petición).
- **Headers por defecto**: `Content-Type: application/json`.

### 2.2. Manejo de Autenticación y Tokens
- **Inyección Automática (Request Interceptor)**:
  - Lee el token desde `localStorage.getItem("token")` (espera string JSON parseable).
  - Determina el esquema mediante `getAuthHeader(token)`:
    - Si el token empieza con `eyJ` o contiene 3 segmentos separados por `.` (formato JWT): `Authorization: Bearer <token>`.
    - En caso contrario (Token DRF clásico): `Authorization: Token <token>`.
  - Si la petición tiene `config._skipAuth = true` (utilizado exclusivamente en login), se omite la cabecera.
- **Manejo de Errores de Sesión (Response Interceptor)**:
  - Cuando el backend responde con código HTTP `401 Unauthorized`:
    - Marca `error.isAuthError = true`.
    - Emite el evento global en ventana: `window.dispatchEvent(new CustomEvent("sh-auth-unauthorized"))`.
    - `AuthContext.js` escucha este evento y ejecuta `logout()` limpiando `user`, `token` y los cachés.
  - En caso de `ECONNABORTED` o `ERR_NETWORK`:
    - Marca `error.isNetworkError = true`.

### 2.3. Métodos HTTP Exportados en `config.js`
1. `POST_LOGIN(endpoint, data)`: omite token de auth, valida respuestas DRF.
2. `GET(endpoint, token = null, options = {})`: permite inyección de token manual opcional o delega al interceptor.
3. `POST(endpoint, data)`: petición POST estándar con Axios.
4. `DELETE(endpoint)`: petición DELETE estándar con Axios.
5. `PATCH(endpoint, data)`: petición PATCH estándar con Axios.
6. `DOWNLOAD(endpoint, name_file)`: petición `GET` con `responseType: 'blob'`, crea elemento `<a>` temporal, dispara descarga en el navegador y notifica via `downloadCallback`.
*Nota: `PUT` no está exportado; todas las mutaciones parciales/completas en la aplicación usan `PATCH` o `POST`.*

### 2.4. Normalización de Errores DRF (`parseApiError`)
`parseApiError(error)` procesa las siguientes estructuras de Django Rest Framework:
- Errores de red y timeout (`isNetworkError` -> mensaje localizado).
- Errores de expiración de sesión (`isAuthError` -> mensaje de sesión expirada).
- Respuestas con campo `detail`, `error` o `message`.
- Errores de validación de formulario `{ campo: ["Mensaje de validación..."] }` o `{ non_field_errors: [...] }`.

---

## 3. Orquestador, Caché y Deduplicación (`src/api/orchestrator.js`)

`orchestrator.js` actúa como capa unificadora de optimización de rendimiento:

### 3.1. Políticas de Caché en Memoria (`dataCache.js`)
Configuración de TTL por tipo de recurso (`CONFIG.CACHE_TTL`):
- `telemetry`: 30 segundos (datos en tiempo real).
- `controlCenter`: 30 segundos (KPIs dinámicos de centro de control).
- `batch`: 30 segundos (batch telemetry & batch summary).
- `dayData`: 60 segundos (resumen diario).
- `pointsList`: 60 segundos (lista de puntos de captación).
- `stats`: 60 segundos (estadísticas de tickets).
- `profile`: 2 minutos (perfil de usuario).
- `notifications`: 2 minutos (alertas y notificaciones).
- `monthData`: 10 minutos (históricos mensuales).
- `generalStats`: 60 minutos (KPIs globales de centro de control).

### 3.2. Deduplicación de Peticiones (`requestDeduplication.js`)
- Gestiona un registro `pendingRequests = new Map()`.
- Si múltiples componentes montados en paralelo solicitan los mismos datos antes de que la primera promesa resuelva (ej. `getProfileOrchestrated`, `dashboardStats`, `controlCenterDailySummary`), se fusionan en una única llamada de red real.

### 3.3. Cola de Prioridad y Concurrencia
- Niveles: `CRITICAL` (0: login/logout), `HIGH` (1: telemetría actual), `NORMAL` (2: listas), `LOW` (3: reportes/exports).
- Límite de concurrencia: `MAX_CONCURRENT = 6`.

### 3.4. Cancelación con `AbortController`
- Mantiene registro de controladores activos.
- Permite abortar peticiones obsoletas al cambiar de pestañas en `useControlCenterData.js`, `useSystemStatus.js` y `useTickets.js`.

---

## 4. Catálogo Exhaustivo de Endpoints por Dominio

A continuación se detalla cada uno de los endpoints implementados en el frontend, su URL, método, parámetros, función en `endpoints.js`, mapeo en `orchestrator.js` y estado de uso en la UI.

### 4.1. Módulo 1: Autenticación, Usuarios y Perfil

| Endpoint URL | Método | Parámetros / Payload | Función en `endpoints.js` | Mapeo en `orchestrator.js` | Estado / Consumo en UI |
|---|---|---|---|---|---|
| `ik/login/` | POST | `{ email, password }` | `login` (`sh.authenticated`) | No expuesto directamente | **Activo** (`AuthContext.js`) |
| `ik/auth/password-reset/` | POST | `{ email }` | `requestPasswordReset` | `orchestrator.requestPasswordReset` | **Activo** (`LoginPage.jsx`) |
| `ik/auth/password-reset/confirm/` | POST | `{ token, password }` | `confirmPasswordReset` | `orchestrator.confirmPasswordReset` | **Activo** (`ResetPasswordPage.jsx`) |
| `ik/auth/password-reset/validate/` | POST | `{ token }` | `validatePasswordResetToken` | `orchestrator.validatePasswordResetToken` | **Activo** (`ResetPasswordPage.jsx`) |
| `users/me/` | GET | Ninguno | `getMe` (`sh.me`) | No expuesto directamente | **Activo** (Verificación auth) |
| `users/me/avatar/` | POST | FormData (`avatar`) | `uploadAvatar` | `orchestrator.uploadAvatar` | **Activo** (`ProfilePage.jsx`) |
| `ik/me/notify-email/` | POST | `{ notify_email }` | `updateNotifyEmailPreference` | `orchestrator.updateNotifyEmailPreference` | **Activo** (`ProfilePage.jsx`) |
| `users/change-password/` | POST | `{ current_password, new_password }` | `changePassword` | `orchestrator.admin.changeUserPassword` | **Activo** (`ProfilePage.jsx`, `AuthContext.js`) |
| `users/` | GET | `?search=&page=&page_size=` | `getUsers` | `orchestrator.admin.users` | **Activo** (`UsersPage.jsx`, `PointsPage.jsx`) |
| `users/${username}/` | GET | Path: `username` | `getUser` | `orchestrator.admin.userById` | **Activo** (`UsersPage.jsx`) |
| `users/` | POST | `{ username, email, first_name, last_name, is_staff, is_superuser, ... }` | `createUser` | No en orchestrator root | **Activo** (`UsersPage.jsx`) |
| `users/signup/` | POST | `{ email, password, ... }` | `signupUser` | `orchestrator.admin.signupUser` | **Activo** (CRUD admin) |
| `users/${username}/` | PATCH | `{ first_name, last_name, email, ... }` | `updateUser` | `orchestrator.admin.updateUser` | **Activo** (`ProfilePage.jsx`, `UsersPage.jsx`) |
| `users/${username}/` | DELETE | Path: `username` | `deleteUser` | `orchestrator.admin.deleteUser` | **Activo** (`UsersPage.jsx`) |
| `ik/staff_users/` | GET | Ninguno | `getStaffUsers` | `orchestrator.admin.staffUsers` | **Activo** (`useTicketCatalogs.js`, `useTicketCategories.js`) |
| `ik/announcements/public/` | GET | `?limit=20` | `getPublicAnnouncements` | **Faltante en orchestrator** | ⚠️ **Huérfano / No usado en UI** |
| `users/${username}/` (con nested catchment_points) | GET | Path: `username` | `get_profile` | `orchestrator.getProfile` | ⚠️ **Deprecated / Ineficiente** (Carga MBs de puntos anidados) |

---

### 4.2. Módulo 2: Puntos de Captación y Telemetría Moderna

| Endpoint URL | Método | Parámetros / Payload | Función en `endpoints.js` | Mapeo en `orchestrator.js` | Estado / Consumo en UI |
|---|---|---|---|---|---|
| `catchment_point/all/` | GET | Ninguno | `get_catchment_points_all` (`sh.getPointsAll`) | `orchestrator.admin.pointsAll` | **Activo** (`useTicketCatalogs`, `PointsPage`, `SchemesAndVariablesPage`) |
| `catchment_point/` | GET | `?search=&project=&page=&page_size=&ordering=` | `pointsList` / `getCatchmentPoints` | `orchestrator.pointsList` / `orchestrator.admin.points` | **Activo** (`PointsPage.jsx`, `OperationalDashboard.jsx`) |
| `catchment_point/${id}/` | GET | Path: `id` | `pointsGet` / `getCatchmentPoint` | `orchestrator.pointsGet` / `orchestrator.admin.pointById` | **Activo** (`PointsPage.jsx`, `PointDetailPage.jsx`) |
| `catchment_point/` | POST | `{ name, code, project, client, ... }` | `pointsCreate` / `createCatchmentPoint` | `orchestrator.pointsCreate` / `orchestrator.admin.createPoint` | **Activo** (`PointsPage.jsx`) |
| `catchment_point/${id}/` | PATCH | `{ name, code, ... }` | `pointsUpdate` / `updateCatchmentPoint` | `orchestrator.pointsUpdate` / `orchestrator.admin.updatePoint` | **Activo** (`PointsPage.jsx`) |
| `catchment_point/${id}/` | DELETE | Path: `id` | `pointsDelete` / `deleteCatchmentPoint` | `orchestrator.pointsDelete` / `orchestrator.admin.deletePoint` | **Activo** (`PointsPage.jsx`) |
| `ik/my_points/` | GET | Ninguno | `get_my_points` (`sh.points.mine`) | `orchestrator.getPointsList({ isAdmin: false })` | **Activo** (Lista asignada a usuario) |
| `ik/point/${id}/summary/` | GET | Path: `id` | `get_point_summary` / `ikPointSummary` / `pointsLatest` | `orchestrator.ikPointSummary` / `orchestrator.pointsLatest` / `orchestrator.pointsSummary` | **Activo** (`PointDetailPage.jsx`, `ControlCenter.js`) |
| `ik/point/${id}/config/` | GET | Path: `id` | `get_point_config` / `ikPointConfig` / `pointsConfig` | `orchestrator.pointConfig` / `orchestrator.ikPointConfig` / `orchestrator.pointsConfig` | **Activo** (`ControlCenter.js`, `PointDetailPage.jsx`) |
| `ik/point/${id}/config/` | PATCH | `{ d1, d2, d3, d4, d5, ... }` | `pointsConfigUpdate` | `orchestrator.pointsConfigUpdate` | **Activo** (`PointConfigDrawer.js`, `PointDetailPage.jsx`) |
| `ik/point/${id}/records/` | GET | `?start_date=&end_date=&limit=&hours=` | `get_point_records` / `ikPointRecords` / `pointsRecords` | `orchestrator.pointRecords` / `orchestrator.ikPointRecords` / `orchestrator.pointsRecords` | **Activo** (`ControlCenter.js`, `PointDetailPage.jsx`) |
| `ik/point/${id}/variables/` | GET | Path: `id` | `ikPointVariables` / `pointsVariables` | `orchestrator.ikPointVariables` / `orchestrator.pointsVariables` | **Activo** (`ControlCenter.js`, `PointDetailPage.jsx`) |
| `ik/point/${id}/calendar/` | GET | `?days=7` | `ikPointCalendar` | `orchestrator.ikPointCalendar` | **Activo** (`PointDetailPage.jsx`) |
| `ik/point/${id}/gaps/` | GET | `?start_date=&end_date=` | `ikPointGaps` | `orchestrator.ikPointGaps` | **Activo** (`PointDetailPage.jsx`) |
| `ik/batch/telemetry/` | POST | `{ point_ids: [], hours: 1 }` | `batchTelemetryNative` | `orchestrator.getBatchTelemetry` | **Activo** (Telemetría multi-punto) |
| `ik/batch/stats/` | POST | `{ point_ids: [], days: 30 }` | `batchStatsNative` | `orchestrator.getBatchStats` | **Activo** (Estadísticas multi-punto) |
| `ik/batch/summary/` | POST | `{ point_ids: [] }` | `batchSummaryNative` | `orchestrator.getBatchSummary` | **Activo** (Resumen de puntos batch) |
| `ik/batch/stats/?ids=` | GET | `?ids=1,2,3` | `pointsBatchStatus` | `orchestrator.pointsBatchStatus` | ⚠️ **Discrepancia de Método** (GET vs POST nativo) |
| `ik/points_summary/` | GET | Ninguno | `get_points_summary` | No en orchestrator | ⚠️ **Huérfano** (Reemplazado por batch/summary) |
| `catchment_point/all/?project=` | GET | `?project={id}` | `getCatchmentPointsByProject` | `orchestrator.admin.pointsByProject` (Discrepancia) | ⚠️ **Discrepancia** (`/all/?project=` vs `/?project=&page_size=1000`) |

---

### 4.3. Módulo 3: Centro de Control (Control Center) & Asistente IA

| Endpoint URL | Método | Parámetros / Payload | Función en `endpoints.js` | Mapeo en `orchestrator.js` | Estado / Consumo en UI |
|---|---|---|---|---|---|
| `ik/control_center/general_stats/` | GET | Signal | `get_control_center_general_stats` | `orchestrator.controlCenterGeneralStats` | **Activo** (`useControlCenterData.js`) |
| `ik/control_center/daily_summary/` | GET | `?start_date=&end_date=&project_id=` | `get_control_center_daily_summary` | `orchestrator.controlCenterDailySummary` | **Activo** (`useControlCenterData.js`) |
| `ik/control_center/list/` | GET | `?date=&project_id=&page=&page_size=&order_by=` | `get_control_center_list` | `orchestrator.controlCenterList` | **Activo** (`useControlCenterData.js`) |
| `ik/control_center/project_points/` | GET | `?project_id={id}` | `get_control_center_project_points` | `orchestrator.controlCenterProjectPoints` / `orchestrator.admin.projectPoints` | **Activo** (`useControlCenterData.js`, `TicketCreateDrawer.jsx`) |
| `ik/control_center/system_events/` | GET | `?event_type=&severity=&start=&end=&search=&page=&page_size=` | `get_system_events` | `orchestrator.getSystemEvents` | **Activo** (`SystemEventsDrawer.js`) |
| `ik/control_center/system_events/{pointId}/` | GET | `?event_type=&severity=&start=&end=&search=&page=&page_size=` | `get_system_events_by_point` | `orchestrator.getSystemEventsByPoint` | **Activo** (`SystemEventsDrawer.js`) |
| `ik/dashboard_stats/` | GET | Signal | `get_dashboard_stats` | `orchestrator.dashboardStats` | **Activo** (`useControlCenter.js`, fallback en `useControlCenterData.js`) |
| `ik/daily_summary/` | GET | `?date=` | `get_daily_summary` | `sh.dailySummary` (No en orchestrator) | ⚠️ **Obsoleto** (Sustituido por `control_center/daily_summary/`) |
| `ik/chat/client/general_stats/` | POST | `{ message }` | `chat` | `orchestrator.chat` | **Activo** (`ControlCenterChat.js`) |

---

### 4.4. Módulo 4: Cumplimiento DGA / SMA y Verificación

| Endpoint URL | Método | Parámetros / Payload | Función en `endpoints.js` | Mapeo en `orchestrator.js` | Estado / Consumo en UI |
|---|---|---|---|---|---|
| `ik/compliance/` | GET | `?page=&page_size=&project_id=&search=&order_by=&warning_level=&standard=&type_dga=` | `get_compliance_list` / `get_compliance` | `orchestrator.complianceList` / `orchestrator.compliance` | **Activo** (`useControlCenterData.js`, `ComplianceDashboard.jsx`, `useControlCenter.js`) |
| `ik/compliance/{pointId}/flow_history/` | GET | `?days=90&page=1&page_size=20` | `get_flow_history` | `orchestrator.flowHistory` | **Activo** (`AuditHistoryDrawer.js`) |
| `ik/compliance/{pointId}/near_limit/` | GET | `?days=90&page=1&page_size=20` | `get_near_limit_history` | `orchestrator.nearLimitHistory` | **Activo** (`AuditHistoryDrawer.js`) |
| `compliance/dga/verify/` | GET | `?codigo_obra=&numero_comprobante=&tipo_dga=` | `verifyDgaVoucher` | `orchestrator.verifyDgaVoucher` | **Activo** (`ControlCenter.js`, `ComplianceDashboard.jsx`) |
| `ik/management/toggle_compliance/` | POST | `{ point_id, enabled }` | `toggle_compliance` | `orchestrator.toggleCompliance` | **Activo** (`ControlCenter.js`) |
| `dga_data_config_catchment/` | GET | `?search=&page=&page_size=` | `getDgaConfigs` | `orchestrator.dgaConfigs.list` / `orchestrator.admin.dgaConfigs.list` | **Activo** (`PointDetailPage.jsx`) |
| `dga_data_config_catchment/{id}/` | GET | Path: `id` | `getDgaConfig` | `orchestrator.dgaConfigs.get` | **Activo** (`PointDetailPage.jsx`) |
| `dga_data_config_catchment/` | POST | `{ point_catchment, standard, code_dga, ... }` | `createDgaConfig` | `orchestrator.dgaConfigs.create` | **Activo** (`PointDetailPage.jsx`) |
| `dga_data_config_catchment/{id}/` | PATCH | `{ ... }` | `updateDgaConfig` | `orchestrator.dgaConfigs.update` | **Activo** (`PointDetailPage.jsx`) |
| `dga_data_config_catchment/{id}/` | DELETE | Path: `id` | `deleteDgaConfig` | `orchestrator.dgaConfigs.delete` | **Activo** (`PointDetailPage.jsx`) |

---

### 4.5. Módulo 5: Tickets de Soporte, SLA, Tareas y Drive

| Endpoint URL | Método | Parámetros / Payload | Función en `endpoints.js` | Mapeo en `orchestrator.js` | Estado / Consumo en UI |
|---|---|---|---|---|---|
| `ik/tickets/` | GET | `?page=&page_size=&search=&status=&priority=&category=&assigned_to=&created_from=&created_to=&point_id=` | `getTickets` | `orchestrator.tickets.get` | **Activo** (`useTickets.js`, `SupportDashboard.jsx`, `KanbanBoard.jsx`) |
| `ik/tickets/${id}/` | GET | Path: `id` | `getTicket` | `orchestrator.tickets.getById` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/` | POST | `{ title, description, priority, category, points, origin, source, ... }` | `createTicket` | `orchestrator.tickets.create` | **Activo** (`useTickets.js`, `TicketCreateDrawer.jsx`) |
| `ik/tickets/${id}/` | PATCH | `{ title, description, priority, ... }` | `updateTicket` | `orchestrator.tickets.update` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/${id}/` | DELETE | Path: `id` | `deleteTicket` | `orchestrator.tickets.delete` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/${id}/assign/` | POST | `{ assigned_to }` | `assignTicket` | `orchestrator.tickets.assign` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`, `TicketCard.jsx`) |
| `ik/tickets/${id}/status/` | POST | `{ status, work_order_category }` | `changeTicketStatus` | `orchestrator.tickets.changeStatus` | **Activo** (`useTickets.js`, `KanbanBoard.jsx`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/${id}/confirm-scheduled-date/` | POST | Ninguno | `confirmTicketScheduledDate` | `orchestrator.tickets.confirmScheduledDate` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/${id}/cancel-scheduled-date/` | POST | `{ reason }` | `cancelTicketScheduledDate` | `orchestrator.tickets.cancelScheduledDate` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/${id}/convert-to-client/` | POST | Ninguno | `convertTicketToClient` | **Faltante en orchestrator** | ⚠️ **Huérfano / Sin UI consumidora** |
| `ik/tickets/${id}/comments/` | GET | `?page=` | `getTicketComments` | `orchestrator.tickets.getComments` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/${id}/comments/` | POST | `{ content, is_internal }` | `createTicketComment` | `orchestrator.tickets.createComment` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/${ticketId}/comments/${commentId}/` | DELETE | Path: `ticketId`, `commentId` | `deleteTicketComment` | `orchestrator.tickets.deleteComment` | 🛑 **404 Backend Catch** (Mensaje especial en UI) |
| `ik/tickets/${ticketId}/comments/${commentId}/` | PATCH | `{ content }` | `updateTicketComment` | `orchestrator.tickets.updateComment` | 🛑 **404 Backend Catch** (Mensaje especial en UI) |
| `ik/tickets/${ticketId}/comments/${commentId}/like/` | POST | Ninguno | `likeTicketComment` | `orchestrator.tickets.likeComment` | 🛑 **404 Backend Catch** (Mensaje especial en UI) |
| `ik/tickets/${ticketId}/mentionable_users/` | GET | Path: `ticketId` | `getTicketMentionableUsers` | `orchestrator.tickets.getMentionableUsers` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/notifications/` | GET | `?unread_only=` | `getTicketNotifications` | `orchestrator.tickets.getNotifications` | **Activo** (`useTickets.js`) |
| `ik/tickets/notifications/mark-read/` | POST | `{ notification_ids: [] }` | `markTicketNotificationsRead` | `orchestrator.tickets.markNotificationsRead` | **Activo** (`useTickets.js`) |
| `ik/tickets/${id}/attachments/` | GET | Path: `id` | `getTicketAttachments` | `orchestrator.tickets.getAttachments` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/${id}/attachments/` | POST | FormData (`file`) | `uploadTicketAttachment` | `orchestrator.tickets.uploadAttachment` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/${ticketId}/comments/${commentId}/attachments/` | POST | FormData (`file`) | `uploadCommentAttachment` | `orchestrator.tickets.uploadCommentAttachment` | **Activo** (`useTickets.js`, `TicketDetailDrawer.jsx`) |
| `ik/tickets/stats/` | GET | `?created_from=&created_to=` | `getTicketStats` | `orchestrator.tickets.stats` | **Activo** (`useTickets.js`, `TicketMetrics.jsx`) |
| `ik/tickets/dashboard/` | GET | `?created_at__gte=&created_at__lte=` | `getTicketDashboard` | `orchestrator.tickets.dashboard` | **Activo** (`useTicketIndicators.js`, `SupportIndicatorsPage.jsx`) |
| `ik/tickets/ranking/` | GET | `?created_at__gte=&created_at__lte=` | `getTicketRanking` | `orchestrator.tickets.ranking` | **Activo** (`useTicketRanking.js`, `SupportIndicatorsPage.jsx`) |
| `ik/tickets/my_desk/` | GET | `?page_size=100&priority=&category=&search=` | `getMyDeskTickets` | `orchestrator.tickets.myDesk` | **Activo** (`useTickets.js`, `MyDeskPage.jsx`) |
| `ik/tickets/${id}/tasks/` | GET | `?page=` | `getTicketTasks` | `orchestrator.tickets.tasks.get` | **Activo** (`useTickets.js`, `TasksPanel.jsx`) |
| `ik/tickets/${id}/tasks/` | POST | `{ title, description, assigned_to, is_completed }` | `createTicketTask` | `orchestrator.tickets.tasks.create` | **Activo** (`useTickets.js`, `TasksPanel.jsx`) |
| `ik/tasks/${id}/` | GET | Path: `id` | `getTask` | `orchestrator.tickets.tasks.getById` | **Activo** (`useTickets.js`) |
| `ik/tasks/${id}/` | PATCH | `{ title, description, assigned_to, is_completed }` | `updateTask` | `orchestrator.tickets.tasks.update` | **Activo** (`useTickets.js`, `TasksPanel.jsx`) |
| `ik/tasks/${id}/` | DELETE | Path: `id` | `deleteTask` | `orchestrator.tickets.tasks.delete` | **Activo** (`useTickets.js`, `TasksPanel.jsx`) |
| `ik/tasks/${id}/attachments/` | POST | FormData (`file`) | `uploadTaskAttachment` | `orchestrator.tickets.tasks.uploadAttachment` | **Activo** (`useTickets.js`, `TasksPanel.jsx`) |
| `ik/files/` | GET | `?page=&page_size=&search=&ticket_id=&project_id=&client_id=&contexto=` | `getTicketFiles` | `orchestrator.tickets.files` | **Activo** (`FilesDrivePage.jsx`) |
| `ik/ticket-categories/` | GET | `?search=&page=&page_size=` | `getTicketCategories` | `orchestrator.tickets.categories.get` | **Activo** (`TicketCategoriesPage.jsx`, `useTicketCatalogs.js`) |
| `ik/ticket-categories/` | POST | `{ name, category_type, description, operators }` | `createTicketCategory` | `orchestrator.tickets.categories.create` | **Activo** (`TicketCategoriesPage.jsx`) |
| `ik/ticket-categories/${id}/` | GET | Path: `id` | `getTicketCategory` | `orchestrator.tickets.categories.getById` | **Activo** (`TicketCategoriesPage.jsx`) |
| `ik/ticket-categories/${id}/` | PATCH | `{ name, category_type, description, operators }` | `updateTicketCategory` | `orchestrator.tickets.categories.update` | **Activo** (`TicketCategoriesPage.jsx`) |
| `ik/ticket-categories/${id}/` | DELETE | Path: `id` | `deleteTicketCategory` | `orchestrator.tickets.categories.delete` | **Activo** (`TicketCategoriesPage.jsx`) |
| `ik/sla-configs/` | GET | `?search=&page=&page_size=` | `getSlaConfigs` | `orchestrator.tickets.slaConfigs.get` | **Activo** (`SlaConfigsPage.jsx`, `useSlaConfigs.js`) |
| `ik/sla-configs/` | POST | `{ name, priority, response_time, resolution_time }` | `createSlaConfig` | `orchestrator.tickets.slaConfigs.create` | **Activo** (`SlaConfigsPage.jsx`) |
| `ik/sla-configs/${id}/` | GET | Path: `id` | `getSlaConfig` | `orchestrator.tickets.slaConfigs.getById` | **Activo** (`SlaConfigsPage.jsx`) |
| `ik/sla-configs/${id}/` | PATCH | `{ name, priority, response_time, resolution_time }` | `updateSlaConfig` | `orchestrator.tickets.slaConfigs.update` | **Activo** (`SlaConfigsPage.jsx`) |
| `ik/sla-configs/${id}/` | DELETE | Path: `id` | `deleteSlaConfig` | `orchestrator.tickets.slaConfigs.delete` | **Activo** (`SlaConfigsPage.jsx`) |

---

### 4.6. Módulo 6: Administración General (Clientes, Proyectos, Variables, Proveedores)

| Endpoint URL | Método | Parámetros / Payload | Función en `endpoints.js` | Mapeo en `orchestrator.js` | Estado / Consumo en UI |
|---|---|---|---|---|---|
| `client/` | GET | `?search=&page=&page_size=` | `getClients` | `orchestrator.admin.clients` | **Activo** (`ClientsPage.jsx`, `PointsPage.jsx`, `ProjectsPage.jsx`) |
| `client/all/` | GET | Ninguno | `getClientsAll` | `orchestrator.admin.clientsAll` | **Activo** (Listado plano clientes) |
| `client/` | POST | `{ name, legal_name, rut, email, phone, ... }` | `createClient` | `orchestrator.admin.createClient` | **Activo** (`ClientsPage.jsx`) |
| `client/${id}/` | PATCH | `{ ... }` | `updateClient` | `orchestrator.admin.updateClient` | **Activo** (`ClientsPage.jsx`) |
| `client/${id}/` | DELETE | Path: `id` | `deleteClient` | `orchestrator.admin.deleteClient` | **Activo** (`ClientsPage.jsx`) |
| `client/with-projects/` | GET | Ninguno | `getClientsWithProjects` | `orchestrator.admin.clientsWithProjects` | **Activo** (`PointsStatusTable.jsx`, `ClientDetailPage.jsx`, `useTicketCatalogs.js`, `FilesDrivePage.jsx`) |
| `project_catchments/` | GET | `?search=&client=&page=&page_size=` | `getProjects` | `orchestrator.admin.projects` | **Activo** (`ProjectsPage.jsx`, `PointsPage.jsx`) |
| `project_catchments/all/` | GET | Ninguno | `getProjectsAll` | `orchestrator.admin.projectsAll` | **Activo** (Listado plano proyectos) |
| `project_catchments/` | POST | `{ name, client, description, ... }` | `createProject` | `orchestrator.admin.createProject` | **Activo** (`ProjectsPage.jsx`) |
| `project_catchments/${id}/` | PATCH | `{ ... }` | `updateProject` | `orchestrator.admin.updateProject` | **Activo** (`ProjectsPage.jsx`) |
| `project_catchments/${id}/` | DELETE | Path: `id` | `deleteProject` | `orchestrator.admin.deleteProject` | **Activo** (`ProjectsPage.jsx`) |
| `variable/` | GET | `?search=&page=&page_size=` | `getVariables` | `orchestrator.admin.variables` | **Activo** (`SchemesAndVariablesPage.jsx`, `OperationalDashboard.jsx`) |
| `variable/${id}/` | GET | Path: `id` | `getVariable` | `orchestrator.admin.variableById` | **Activo** (`SchemesAndVariablesPage.jsx`) |
| `variable/` | POST | `{ name, variable_type, unit, ... }` | `createVariable` | `orchestrator.admin.createVariable` | **Activo** (`SchemesAndVariablesPage.jsx`) |
| `variable/${id}/` | PATCH | `{ ... }` | `updateVariable` | `orchestrator.admin.updateVariable` | **Activo** (`SchemesAndVariablesPage.jsx`) |
| `variable/${id}/` | DELETE | Path: `id` | `deleteVariable` | `orchestrator.admin.deleteVariable` | **Activo** (`SchemesAndVariablesPage.jsx`) |
| `schemes_catchment/` | GET | `?search=&page=&page_size=` | `getSchemes` | `orchestrator.admin.schemes` | **Activo** (`SchemesAndVariablesPage.jsx`, `OperationalDashboard.jsx`) |
| `schemes_catchment/${id}/` | GET | Path: `id` | `getScheme` | `orchestrator.admin.schemeById` | **Activo** (`SchemesAndVariablesPage.jsx`) |
| `schemes_catchment/` | POST | `{ name, point_catchment, service, ... }` | `createScheme` | `orchestrator.admin.createScheme` | **Activo** (`SchemesAndVariablesPage.jsx`) |
| `schemes_catchment/${id}/` | PATCH | `{ ... }` | `updateScheme` | `orchestrator.admin.updateScheme` | **Activo** (`SchemesAndVariablesPage.jsx`) |
| `schemes_catchment/${id}/` | DELETE | Path: `id` | `deleteScheme` | `orchestrator.admin.deleteScheme` | **Activo** (`SchemesAndVariablesPage.jsx`) |
| `telemetry_providers/` | GET | `?search=&page=&page_size=` | `getTelemetryProviders` | `orchestrator.admin.telemetryProviders` | **Activo** (`ProvidersPage.jsx`, `OperationalDashboard.jsx`) |
| `telemetry_providers/${id}/` | GET | Path: `id` | `getTelemetryProvider` | `orchestrator.admin.telemetryProviderById` | **Activo** (`ProvidersPage.jsx`) |
| `compliance_providers/` | GET | `?search=&page=&page_size=` | `getComplianceProviders` | `orchestrator.admin.complianceProviders` | **Activo** (`ProvidersPage.jsx`, `OperationalDashboard.jsx`) |
| `compliance_providers/${id}/` | GET | Path: `id` | `getComplianceProvider` | `orchestrator.admin.complianceProviderById` | **Activo** (`ProvidersPage.jsx`) |

---

### 4.7. Módulo 7: Gestión de Sistema, Performance y Operaciones

| Endpoint URL | Método | Parámetros / Payload | Función en `endpoints.js` | Mapeo en `orchestrator.js` | Estado / Consumo en UI |
|---|---|---|---|---|---|
| `management/system_status/` | GET | Ninguno | `getSystemStatus` | `orchestrator.systemStatus` | **Activo** (`SystemHealthPanel.jsx`) |
| `management/system_map/` | GET | Ninguno | `getSystemMap` | No en orchestrator | ⚠️ **Huérfano / No usado en UI** |
| `management/resources_status/` | GET | Ninguno | `getResourcesStatus` | `orchestrator.resourcesStatus` | **Activo** (`PerformanceDashboard.jsx`, `useSystemStatus.js`) |
| `management/points_status/` | GET | `?client=&project=&status=&threshold_minutes=` | `getPointsStatus` | `orchestrator.pointsStatus` | **Activo** (`PerformanceDashboard.jsx`, `PointsStatusTable.jsx`) |
| `management/telemetry_metrics/` | GET | `?client=&project=` | `getTelemetryMetrics` | `orchestrator.telemetryMetrics` | **Activo** (`PerformanceDashboard.jsx`, `PerformanceCharts.jsx`) |
| `management/toggle_telemetry/` | POST | `{ point_id, enabled }` | `toggleTelemetry` | `orchestrator.toggleTelemetry` | **Activo** (`ControlCenter.js`, `PointsStatusTable.jsx`) |
| `management/dga_queue_status/` | GET | Ninguno | `getDgaQueueStatus` | `orchestrator.dgaQueueStatus` | **Activo** (`PerformanceDashboard.jsx`, `DgaQueuePanel.jsx`) |
| `management/clear_dga_queue/` | POST | `{ only_errors: true }` | `clearDgaQueue` | **Faltante en orchestrator** | **Activo** (consumido directo desde `sh.management` en `DgaQueuePanel.jsx`) |
| `management/requeue_dga/` | POST | `{ only_errors: true }` | `requeueDga` | **Faltante en orchestrator** | **Activo** (consumido directo desde `sh.management` en `DgaQueuePanel.jsx`) |
| `management/update_point_frequency/` | POST | `{ point_id, frequency }` | `updatePointFrequency` | **Faltante en orchestrator** | **Activo** (consumido directo desde `sh.management` en `PointsStatusTable.jsx`) |
| `management/notifications_summary/` | GET | `?days=7` | `getNotificationsSummary` | No en orchestrator | ⚠️ **Huérfano / No usado en UI** |
| `system_events/` | GET | `?page=&page_size=&event_type=&severity=` | `getSystemEvents` | `orchestrator.systemEvents.get` | **Activo** (`PerformanceDashboard.jsx`, `useSystemStatus.js`, `EventLogTable.jsx`) |
| `ik/system-events/summary/` | GET | Ninguno | `getSystemEventsSummary` | `orchestrator.systemEvents.summary` | ⚠️ **No consumido en UI** |
| `ik/telemetry/backfill/` | POST | `{ point_id, start_date, end_date }` | `telemetryBackfill` | `orchestrator.telemetryBackfill` | **Activo** (`PointDetailPage.jsx`) |
| `telemetry-reprocessor/` | POST | `{ point_id, start_date, end_date }` | `telemetryReprocess` | `orchestrator.telemetryReprocess` | **Activo** (`PointDetailPage.jsx`) |
| `counter_reset_logs/` | GET | `?point=&page=&page_size=` | `getCounterResetLogs` | `orchestrator.counterResets.list` | **Activo** (`PointDetailPage.jsx`) |
| `counter_reset_logs/{id}/` | GET | Path: `id` | `getCounterResetLog` | `orchestrator.counterResets.get` | **Activo** (`PointDetailPage.jsx`) |

---

### 4.8. Módulo 8: Alertas y Notificaciones

| Endpoint URL | Método | Parámetros / Payload | Función en `endpoints.js` | Mapeo en `orchestrator.js` | Estado / Consumo en UI |
|---|---|---|---|---|---|
| `alert_rules/` | GET | `?search=&page=&page_size=` | `getAlertRules` | `orchestrator.alerts.rules.get` | **Activo** (`AlertRulesPage.jsx`, `AlertsDashboard.jsx`) |
| `alert_rules/{id}/` | GET | Path: `id` | `getAlertRule` | `orchestrator.alerts.rules.getById` | **Activo** (`AlertRulesPage.jsx`) |
| `alert_rules/` | POST | `{ name, rule_type, point_catchment, threshold, channels, ... }` | `createAlertRule` | `orchestrator.alerts.rules.create` | **Activo** (`AlertRulesPage.jsx`) |
| `alert_rules/{id}/` | PATCH | `{ ... }` | `updateAlertRule` | `orchestrator.alerts.rules.update` | **Activo** (`AlertRulesPage.jsx`) |
| `alert_rules/{id}/` | DELETE | Path: `id` | `deleteAlertRule` | `orchestrator.alerts.rules.delete` | **Activo** (`AlertRulesPage.jsx`) |
| `alert_channels/` | GET | `?search=&page=&page_size=` | `getAlertChannels` | `orchestrator.alerts.channels.get` | **Activo** (`AlertChannelsPage.jsx`, `AlertsDashboard.jsx`) |
| `alert_channels/` | POST | `{ name, channel_type, config, is_active }` | `createAlertChannel` | `orchestrator.alerts.channels.create` | **Activo** (`AlertChannelsPage.jsx`) |
| `alert_channels/{id}/` | PATCH | `{ ... }` | `updateAlertChannel` | `orchestrator.alerts.channels.update` | **Activo** (`AlertChannelsPage.jsx`) |
| `alert_channels/{id}/` | DELETE | Path: `id` | `deleteAlertChannel` | `orchestrator.alerts.channels.delete` | **Activo** (`AlertChannelsPage.jsx`) |
| `alert_triggers/` | GET | `?search=&is_acknowledged=&rule=&page=&page_size=` | `getAlertTriggers` | `orchestrator.alerts.triggers.get` | **Activo** (`AlertTriggersPage.jsx`, `AlertsDashboard.jsx`) |
| `alert_triggers/{id}/` | PATCH | `{ is_acknowledged: true }` | `acknowledgeAlertTrigger` | `orchestrator.alerts.triggers.acknowledge` | **Activo** (`AlertTriggersPage.jsx`) |
| `notifications_catchment/` | POST | `{ point_catchment, type_notification, message, ... }` | `createNotification` | `orchestrator.notifications.create` | **Activo** (`ControlCenter.js`, `SupportDrawer.js`) |
| `notifications_catchment/` | GET | `?point_catchment=&page=&type_notification=` | `getNotifications` | `orchestrator.getNotifications` | **Activo** (`orchestrator.js`) |
| `notifications_catchment/` (activas) | GET | `?point_catchment=&page=&type_notification=&is_active=true` | `getNotificationsActives` | `orchestrator.getNotifications({ activeOnly: true })` | **Activo** (`orchestrator.js`) |
| `notifications_catchment/?type_notification=&is_active=` | GET | `?type_notification=&page=&is_active=` | `getAllNotificationsByType` | No en orchestrator | ⚠️ **Huérfano / No usado en UI** |
| `notifications_catchment/?point_catchment=&type_notification=` | GET | `?point_catchment=&type_notification=&page=&is_active=` | `getNotificationsByPoint` | No en orchestrator | ⚠️ **Huérfano / No usado en UI** |
| `notifications_catchment/{id}/` | DELETE | Path: `id` | `deleteNotification` | No en orchestrator | ⚠️ **Huérfano / No usado en UI** |
| `notifications_catchment/{id}/` | GET | Path: `id` | `getNotificationById` | No en orchestrator | ⚠️ **Huérfano / No usado en UI** |
| `notifications_catchment/{id}/` | PATCH | `{ ... }` | `updateNotification` | No en orchestrator | ⚠️ **Huérfano / No usado en UI** |
| `response_notifications_catchment/` | GET | `?notification=&page=` | `getNotificationsResponse` | No en orchestrator | ⚠️ **Huérfano / No usado en UI** |
| `response_notifications_catchment/` | POST | `{ notification, response_text }` | `createNotificationResponse` | No en orchestrator | ⚠️ **Huérfano / No usado en UI** |

---

### 4.9. Módulo 9: Reportes y Descargas

| Endpoint URL | Método | Parámetros / Payload | Función en `endpoints.js` | Mapeo en `orchestrator.js` | Estado / Consumo en UI |
|---|---|---|---|---|---|
| `reports/json/by-project/` | GET | `?project_id=&point_ids=` | `reportsJsonByProject` | `orchestrator.reports.jsonByProject` | **Activo** |
| `reports/json/by-point/` | GET | `?point_id=&year=&month=` | `reportsJsonByPoint` | `orchestrator.reports.jsonByPoint` | **Activo** |
| `reports/json/last-month/` | GET | Ninguno | `reportsJsonLastMonth` | `orchestrator.reports.jsonLastMonth` | **Activo** |
| `reports/json/last-year/` | GET | Ninguno | `reportsJsonLastYear` | `orchestrator.reports.jsonLastYear` | **Activo** |
| `reports/json/annual-compressed/` | GET | Ninguno | `reportsJsonAnnualCompressed` | `orchestrator.reports.jsonAnnualCompressed` | **Activo** |
| `reports/by-project/` | DOWNLOAD | `?project_id={id}` | `reportsDownloadByProject` | `orchestrator.reports.downloadByProject` | **Activo** |
| `reports/by-point/` | DOWNLOAD | `?point_id=&year=&month=` | `reportsDownloadByPoint` | `orchestrator.reports.downloadByPoint` | **Activo** |
| `reports/last-month/` | DOWNLOAD | Ninguno | `reportsDownloadLastMonth` | `orchestrator.reports.downloadLastMonth` | **Activo** |
| `reports/last-year/` | DOWNLOAD | Ninguno | `reportsDownloadLastYear` | `orchestrator.reports.downloadLastYear` | **Activo** |
| `reports/annual-compressed/` | DOWNLOAD | Ninguno | `reportsDownloadAnnualCompressed` | `orchestrator.reports.downloadAnnualCompressed` | **Activo** |
| `../reports/active-points/` | DOWNLOAD | Ninguno | `reportsDownloadActivePoints` | `orchestrator.reports.downloadActivePoints` | 🐛 **Bug de Ruta** (`../` rompe prefijo `/api/`) |

---

### 4.10. Endpoints Muertos / Obsoletos (Legacy SmartHydro v1)

Estos endpoints pertenecen al código inicial de SmartHydro v1 anterior a la arquitectura unificada y no deben ser utilizados en la UI moderna:

| Endpoint URL Legacy | Método | Función en `endpoints.js` | Descripción del Endpoint / Causa de Obsolescencia |
|---|---|---|---|
| `history_data/?profile=` | GET | `get_history_data` (`sh.billing_data`) | Antiguo módulo de facturación no estándar. |
| `history_data/` | GET | `get_history_data_admin` (`sh.billing_data_admin`) | Antiguo módulo de facturación admin. |
| `interaction_detail_override/` | GET | `getDataDay` | Sobrescrituras manuales de telemetría v1. |
| `interaction_detail_override_month/` | GET | `getDataMonth` | Sobrescrituras mensuales de telemetría v1. |
| `interaction_detail_override_month_xlsx/` | DOWNLOAD | `downloadDataMonthToExcel` | Exportación manual v1 de sobrescrituras. |
| `file_catchment/{id}/` | DELETE | `deleteFile` | Módulo legacy de archivos de captación (reemplazado por `/api/ik/files/` y adjuntos de tickets/tareas). |
| `file_catchment/?point_catchment=` | GET | `getFiles` | Módulo legacy de archivos de captación. |
| `file_catchment/` | POST | `formUploadFile` | Módulo legacy de archivos de captación. |
| `interaction_detail/?type=xlsx` | DOWNLOAD | `downloadFile` | Exportación v1 de interaction detail (reemplazado por `/api/reports/*`). |
| `interaction_detail_dga/?type=xlsx` | DOWNLOAD | `downloadFileDga` | Exportación v1 de interaction detail DGA. |
| `interaction_detail_json/{id}/` | DELETE | `deleteDataApiSh` | Operaciones CRUD directas sobre mediciones v1. |
| `interaction_detail_json/` | POST | `createDataApiSh` | Inserción manual de mediciones v1. |
| `interaction_detail_json/{id}/` | PATCH | `updateDataApiSh` | Edición de mediciones v1. |
| `interaction_detail_json/?catchment_point=&hour=0` | GET | `getDataApiSh` | Lectura v1 utilizada únicamente como fallback obsoleto en `getBatchTelemetry`. |
| `interaction_detail_json/?...&page=` | GET | `getDataApiShRangeDate` | Lectura paginada de mediciones v1. |
| `interaction_detail/?...` | GET | `getDataApiShRangeDateToExcel` | Lectura v1 no referenciada. |
| `interaction_detail_json/?...&hour=00` | GET | `getDataApiShRangeDateAndHour` | Lectura fija a hora 00 v1. |
| `interaction_detail_json/?...` | GET | `getDataApiShRangeDateGraphic` | Lectura para gráficos v1. |
| `interaction_detail_json/?profile_client=...` | GET | `getDataApiShDgaSend` | Consulta v1 DGA send. |
| `interaction_detail_json/?profile_client=...` (Loop) | GET | `getDataApiShStructural24h` | Loop de 3 páginas cliente con resta aritmética manual en JS. |
| `interaction_detail_json/?profile_client=...` (Loop) | GET | `getDataApiShStructuralMonth` | Loop de 3 páginas cliente con resta aritmética manual en JS. |

---

## 5. Hallazgos Críticos, Inconsistencias y Brechas (Gaps)

### 5.1. Inconsistencias entre `endpoints.js` y `orchestrator.js`
1. **Métodos de Gestión Faltantes en `orchestrator.js`**:
   - `sh.management.requeueDga`: Utilizado en `DgaQueuePanel.jsx`. No expuesto en `orchestrator`.
   - `sh.management.clearDgaQueue`: Utilizado en `DgaQueuePanel.jsx`. No expuesto en `orchestrator`.
   - `sh.management.updatePointFrequency`: Utilizado en `PointsStatusTable.jsx`. No expuesto en `orchestrator`.
   - **Consecuencia**: Forzó a los componentes `DgaQueuePanel.jsx` y `PointsStatusTable.jsx` a importar `endpoints.js` directamente, rompiendo la arquitectura de capa única.
2. **Discrepancia de Ruta en `pointsByProject`**:
   - `sh.admin.pointsByProject(projectId)` llama a `GET catchment_point/all/?project=${projectId}`.
   - `orchestrator.admin.pointsByProject(projectId)` llama a `sh.points.list({ project: projectId, page_size: 1000 })` que invoca `GET catchment_point/?project=${projectId}&page_size=1000`.
   - Si el backend no filtra por `project` en el endpoint paginado estándar de `catchment_point/`, la respuesta diferirá.
3. **Discrepancia de Método HTTP en `pointsBatchStatus`**:
   - `pointsBatchStatus(ids)` en `endpoints.js` (línea 1738) ejecuta `GET ik/batch/stats/?ids=1,2,3`.
   - Sin embargo, la especificación del backend DRF para batch stats implementa `POST ik/batch/stats/` con body `{ point_ids, days }`.
4. **Duplicación y Nombres Cruzados en Puntos**:
   - `sh.points.records` vs `sh.ikPoint.records` vs `sh.pointRecords`
   - `sh.points.config` vs `sh.ikPoint.config` vs `sh.pointConfig`
   - `sh.points.summary` vs `sh.ikPoint.summary` vs `sh.getPointSummary` vs `sh.points.latest`
   - `sh.points.variables` vs `sh.ikPoint.variables`
   - Todos apuntan a `/api/ik/point/{id}/*` pero existen bajo 3 o 4 nombres y sub-objetos distintos en `orchestrator.js` y `endpoints.js`.
5. **Endpoint `convertTicketToClient` Huérfano**:
   - Declarado en `endpoints.js` (líneas 1542, 2032) como `POST ik/tickets/${id}/convert-to-client/`. No está mapeado en `orchestrator.tickets` ni consumido en ningún drawer o vista de tickets.

---

### 5.2. Bugs de Formato de URL
1. **Bug en `reportsDownloadActivePoints` (`src/api/sh/endpoints.js:1645`)**:
   ```javascript
   const reportsDownloadActivePoints = async (filename = "puntos_activos.xlsx") => {
     await DOWNLOAD(`../reports/active-points/`, filename);
   };
   ```
   **Problema**: La ruta relativa `../reports/active-points/` con baseURL `https://api.smarthydro.app/api/` resuelve a `https://api.smarthydro.app/reports/active-points/` (removiendo el prefijo `/api/`), lo que genera un error 404 en el proxy de desarrollo o en producción. Debería ser `reports/active-points/`.

---

### 5.3. Mocks, Bypass e Interceptores en el Frontend
1. **Servicio Mock `publicData.js` (`src/features/auth/services/publicData.js`)**:
   - Retorna un objeto estático `PUBLIC_DATA` con información de SmartHydro (misión, descripción, tarjetas de landing, estadísticas de 50+ clientes, etc.) mediante `Promise.resolve(PUBLIC_DATA)`.
   - El archivo incluye el comentario explícito: *"En producción puede reemplazarse por un endpoint libre como GET /api/public/info. Por ahora resuelve el mock inmediatamente para no retrasar la carga del login."*
2. **Fallback en `getBatchTelemetry` (`src/api/orchestrator.js:138-151`)**:
   - Si `POST ik/batch/telemetry/` falla o responde con error, el orquestador ejecuta en paralelo llamadas individuales a `sh.get_data_sh(id)` (`GET interaction_detail_json/?catchment_point=${id}&hour=0`).
   - Dado que `interaction_detail_json` es un endpoint v1 deprecado, este fallback puede fallar en entornos donde la API v1 ya no esté habilitada.
3. **Fallback en `useControlCenterData.js:127-144`**:
   - Si `GET ik/control_center/general_stats/` no retorna datos de KPIs o lista de proyectos, ejecuta un fallback automático a `GET ik/dashboard_stats/`.
4. **Acciones de Comentarios con 404 Controlado (`useTickets.js:312-358`)**:
   - `deleteComment`, `updateComment`, `likeComment` capturan errores 404 del backend y muestran mensajes informativos: *"El backend no soporta borrar/editar/dar me gusta en comentarios (endpoint no encontrado)"*.

---

## 6. Mapeo de Consumo Directo vs Orquestador

Para garantizar la consolidación a "Capa One", se identificaron las llamadas que evitan el `orchestrator`:

1. **`src/contexts/AuthContext.js`**:
   - Importa `sh` directamente desde `../api/sh/endpoints`.
   - Llama a `sh.authenticated` (login), `sh.updateUser`, `sh.changePassword`.
2. **`src/features/admin/components/DgaQueuePanel.jsx`**:
   - Importa `sh` directamente desde `../../../api/sh/endpoints`.
   - Llama a `sh.management.requeueDga` y `sh.management.clearDgaQueue`.
3. **`src/features/admin/components/PointsStatusTable.jsx`**:
   - Importa `sh` directamente desde `../../../api/sh/endpoints`.
   - Llama a `sh.management.toggleTelemetry` y `sh.management.updatePointFrequency`.

Todos los demás módulos y páginas consumen la API a través de `orchestrator` o a través de hooks que envuelven `orchestrator`.

---

## 7. Plan de Acción y Recomendaciones para Consolidación

1. **Eliminar Módulos y Endpoints Obsoletos (v1)**:
   - Deprecar y remover las 26 funciones de `endpoints.js` asociadas a `interaction_detail_json`, `interaction_detail_override`, `file_catchment` y `history_data`.
   - Reemplazar el fallback de `getBatchTelemetry` para que no dependa de `get_data_sh`.
2. **Corregir Inconsistencias en `orchestrator.js`**:
   - Exponer `orchestrator.management.requeueDga`, `orchestrator.management.clearDgaQueue`, y `orchestrator.management.updatePointFrequency`.
   - Actualizar `DgaQueuePanel.jsx` y `PointsStatusTable.jsx` para importar `orchestrator` en lugar de `sh`.
   - Unificar `AuthContext.js` para usar `orchestrator` o un submódulo `auth` formal.
3. **Corregir Bugs de Rutas**:
   - Corregir `../reports/active-points/` a `reports/active-points/`.
   - Corregir `pointsBatchStatus` a `POST ik/batch/stats/` o alinearlo con la especificación oficial DRF.
4. **Unificar la API de Puntos**:
   - Consolidar `sh.points`, `sh.ikPoint` y `sh.point*` en una interfaz única y coherente bajo `orchestrator.points.*`.
5. **Alinear Comentarios y Conversión a Cliente**:
   - Revisar en OpenAPI/Swagger si existen los endpoints `/api/ik/tickets/{id}/comments/{cid}/` y `/api/ik/tickets/{id}/convert-to-client/` o si deben retirarse las acciones de UI correspondientes.

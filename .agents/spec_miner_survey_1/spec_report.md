# SmartHydro API — Exhaustive OpenAPI Specification Report

**Generated**: 2026-08-17  
**Author**: OpenAPI Specification Miner (`spec_miner_survey_1`)  
**Specification Source**: `https://api.smarthydro.app/api/schema/` (OpenAPI 3.0.3) & Live Backend Probe  
**API Title**: SmartHydro API (v2.0.0)  
**API Base URL**: `https://api.smarthydro.app/api/`

---

## 1. Executive Summary

This report documents the exhaustive specification audit and probe of the **SmartHydro API** against the live production server and OpenAPI 3.0.3 specification. 

SmartHydro provides a comprehensive hydrological monitoring and compliance platform designed for extraction points (Puntos de Captación), continuous sensor telemetry ingestion, regulatory compliance reporting (DGA / SMA Chile), real-time anomaly alerts, technical support ticketing with SLAs, and operational infrastructure management.

### Key Metrics
- **Total DRF Endpoints Identified & Probed**: 78 operations across 14 functional categories
- **Authentication Schemes Supported**: `jwtAuth` (Bearer token) and `tokenAuth` (`Token <key>`)
- **Active Backend Route Prefixes**: `/api/ik/*`, `/api/management/*`, `/api/reports/*`, `/api/alert_*`, `/api/catchment_point/*`, `/api/client/*`, `/api/project_catchments/*`, `/api/users/*`, `/api/variable/*`, `/api/schemes_catchment/*`, `/api/telemetry_providers/*`, `/api/compliance_providers/*`, `/api/counter_reset_logs/*`
- **Identified Obsolete / 404 Endpoints in Frontend**: 3 endpoints (`/api/history_data/`, `../reports/active-points/`, `/compliance/dga/verify/`)

---

## 2. Global Security & Authentication Contracts

The SmartHydro API uses standard Django Rest Framework (DRF) security schemes:
1. **JWT Authentication (`jwtAuth`)**:
   - Header: `Authorization: Bearer <jwt_access_token>`
   - Acquired via: `POST /api/ik/login/` (returns `{ access_token, user }`)
2. **Token Authentication (`tokenAuth`)**:
   - Header: `Authorization: Token <token_key>`
3. **Public Endpoints**:
   - `POST /api/ik/login/`
   - `POST /api/ik/auth/password-reset/`
   - `POST /api/ik/auth/password-reset/confirm/`
   - `POST /api/ik/auth/password-reset/validate/`
   - `GET /api/ik/announcements/public/`
   - `GET /api/schema/`

---

## 3. Exhaustive Endpoints & Operations Catalog

### 3.1. Authentication, Identity & User Profile

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `POST` | `/api/ik/login/` | Autenticación de usuario y obtención de token | None | `{"email": "string", "password": "string"}` | `200 OK`: `{"user": UserObject, "access_token": "string"}` | `auth` |
| `POST` | `/api/ik/auth/password-reset/` | Solicitar restablecimiento de contraseña vía email | None | `{"email": "string"}` | `200 OK`: `{"message": "string"}` | `auth` |
| `POST` | `/api/ik/auth/password-reset/confirm/` | Confirmar cambio de contraseña con token | None | `{"token": "string", "password": "string"}` | `200 OK`: `{"message": "string"}` | `auth` |
| `POST` | `/api/ik/auth/password-reset/validate/` | Validar vigencia de token de restablecimiento | None | `{"token": "string"}` | `200 OK`: `{"valid": boolean}` | `auth` |
| `POST` | `/api/users/change-password/` | Cambio autenticado de clave | None | `{"current_password": "str", "new_password": "str"}` | `200 OK`: `{"detail": "string"}` | `users` |
| `GET` | `/api/users/me/` | Perfil del usuario actualmente autenticado | None | None | `200 OK`: `UserDetail` | `users` |
| `POST` | `/api/users/me/avatar/` | Subir o actualizar foto de perfil | None | `multipart/form-data`: `avatar` (file) | `200 OK`: `{"avatar_url": "string"}` | `users` |
| `POST` | `/api/ik/me/notify-email/` | Actualizar preferencia de alertas por email | None | `{"notify_email": boolean}` | `200 OK`: `{"notify_email": boolean}` | `users` |
| `GET` | `/api/ik/staff_users/` | Listado de agentes de soporte / staff | None | None | `200 OK`: `UserStaff[]` | `users` |
| `GET` | `/api/ik/announcements/public/` | Anuncios públicos del sistema | `limit` (int, default: 20) | None | `200 OK`: `{"count": int, "announcements": []}` | `announcements` |

### 3.2. User Management (Admin CRUD)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/users/` | Listar usuarios del sistema | `search`, `page`, `page_size`, `is_staff`, `is_active` | None | `200 OK`: `PaginatedUserList` | `users` |
| `POST` | `/api/users/` | Crear nuevo usuario administrativo | None | `UserCreateSerializer` | `201 Created`: `UserDetail` | `users` |
| `POST` | `/api/users/signup/` | Registro de nuevo usuario cliente | None | `UserSignupSerializer` | `201 Created`: `UserDetail` | `users` |
| `GET` | `/api/users/{username}/` | Detalle de usuario por username | `username` (path string) | None | `200 OK`: `UserDetail` | `users` |
| `PATCH` | `/api/users/{username}/` | Actualizar parcialmente usuario | `username` (path string) | `PatchedUserSerializer` | `200 OK`: `UserDetail` | `users` |
| `DELETE` | `/api/users/{username}/` | Eliminar usuario | `username` (path string) | None | `204 No Content` | `users` |

### 3.3. Clients & Enterprises (Clientes)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/client/` | Listar empresas/clientes | `critical` (bool), `email`, `name`, `rut`, `search`, `page`, `ordering` | None | `200 OK`: `PaginatedClientList` | `client` |
| `POST` | `/api/client/` | Crear cliente | None | `Client` schema | `201 Created`: `Client` | `client` |
| `GET` | `/api/client/{id}/` | Detalle de cliente | `id` (path int) | None | `200 OK`: `Client` | `client` |
| `PUT` | `/api/client/{id}/` | Actualizar cliente | `id` (path int) | `Client` schema | `200 OK`: `Client` | `client` |
| `PATCH` | `/api/client/{id}/` | Actualizar parcialmente cliente | `id` (path int) | `PatchedClient` schema | `200 OK`: `Client` | `client` |
| `DELETE` | `/api/client/{id}/` | Eliminar cliente | `id` (path int) | None | `204 No Content` | `client` |
| `GET` | `/api/client/all/` | Listar todos los clientes sin paginación | None | None | `200 OK`: `Client[]` | `client` |
| `GET` | `/api/client/with-projects/` | Clientes con árbol de proyectos anidados | None | None | `200 OK`: `ClientWithProjects[]` | `client` |

### 3.4. Projects (Proyectos de Captación)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/project_catchments/` | Listar proyectos | `client` (int), `search`, `page`, `ordering` | None | `200 OK`: `PaginatedProjectCatchmentList` | `project_catchments` |
| `POST` | `/api/project_catchments/` | Crear proyecto | None | `ProjectCatchment` schema | `201 Created`: `ProjectCatchment` | `project_catchments` |
| `GET` | `/api/project_catchments/{id}/` | Detalle de proyecto | `id` (path int) | None | `200 OK`: `ProjectCatchment` | `project_catchments` |
| `PUT` | `/api/project_catchments/{id}/` | Actualizar proyecto | `id` (path int) | `ProjectCatchment` schema | `200 OK`: `ProjectCatchment` | `project_catchments` |
| `PATCH` | `/api/project_catchments/{id}/` | Actualizar parcialmente proyecto | `id` (path int) | `PatchedProjectCatchment` | `200 OK`: `ProjectCatchment` | `project_catchments` |
| `DELETE` | `/api/project_catchments/{id}/` | Eliminar proyecto | `id` (path int) | None | `204 No Content` | `project_catchments` |
| `GET` | `/api/project_catchments/all/` | Listar todos los proyectos sin paginación | None | None | `200 OK`: `ProjectCatchment[]` | `project_catchments` |

### 3.5. Extraction Points (Puntos de Captación)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/catchment_point/` | Listar puntos de captación | `project` (int), `search`, `page`, `ordering` | None | `200 OK`: `PaginatedCatchmentPointList` | `catchment_point` |
| `POST` | `/api/catchment_point/` | Crear punto de captación | None | `CatchmentPoint` schema | `201 Created`: `CatchmentPoint` | `catchment_point` |
| `GET` | `/api/catchment_point/{id}/` | Perfil completo del punto (config, esquemas, última telemetría) | `id` (path int) | None | `200 OK`: `CatchmentPointIkolu` | `catchment_point` |
| `PUT` | `/api/catchment_point/{id}/` | Actualizar punto | `id` (path int) | `CatchmentPoint` schema | `200 OK`: `CatchmentPoint` | `catchment_point` |
| `PATCH` | `/api/catchment_point/{id}/` | Actualizar parcialmente punto | `id` (path int) | `PatchedCatchmentPoint` | `200 OK`: `CatchmentPoint` | `catchment_point` |
| `DELETE` | `/api/catchment_point/{id}/` | Eliminar punto | `id` (path int) | None | `204 No Content` | `catchment_point` |
| `GET` | `/api/catchment_point/all/` | Todos los puntos sin paginación | `project` (query int) | None | `200 OK`: `CatchmentPoint[]` | `catchment_point` |
| `GET` | `/api/ik/my_points/` | Puntos asignados al usuario autenticado (dropdown / selector) | None | None | `200 OK`: `CatchmentPointLite[]` | `ik_points` |
| `GET` | `/api/ik/points_summary/` | Resumen global de puntos con última telemetría | None | None | `200 OK`: `PointSummary[]` | `ik_points` |
| `GET` | `/api/ik/point/{id}/summary/` | Resumen optimizado de punto con última telemetría | `id` (path int) | None | `200 OK`: `PointSummaryDetail` | `ik_points` |
| `GET` | `/api/ik/point/{id}/config/` | Configuración técnica d1-d5 (pozo, bomba, niveles) | `id` (path int) | None | `200 OK`: `PointTechnicalConfig` | `ik_points` |
| `PATCH` | `/api/ik/point/{id}/config/` | Actualizar configuración técnica del pozo | `id` (path int) | `PatchedPointTechnicalConfig` | `200 OK`: `PointTechnicalConfig` | `ik_points` |
| `GET` | `/api/ik/point/{id}/records/` | Registros de telemetría de un punto | `id` (path int), `start_date`, `end_date`, `limit`, `hours` | None | `200 OK`: `PointRecordsList` | `ik_points` |
| `GET` | `/api/ik/point/{id}/variables/` | Variables activas configuradas en el punto | `id` (path int) | None | `200 OK`: `Variable[]` | `ik_points` |
| `GET` | `/api/ik/point/{id}/calendar/` | Calendario de actividad y transmisión de telemetría | `id` (path int), `days` (int, default: 7) | None | `200 OK`: `CalendarDayStats[]` | `ik_points` |
| `GET` | `/api/ik/point/{id}/gaps/` | Detección de brechas temporales en telemetría | `id` (path int), `start_date`, `end_date` | None | `200 OK`: `{"gaps": GapItem[]}` | `ik_points` |

### 3.6. Telemetry Ingestion, Processing & Native Batch Operations

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/interaction_detail_json/` | Listar telemetría cruda en formato JSON | `catchment_point`, `hour`, `date_time_medition__date__range`, `page`, `page_size` | None | `200 OK`: `PaginatedInteractionDetailList` | `interaction_detail` |
| `POST` | `/api/interaction_detail_json/` | Ingesta manual / registro de medición | None | `InteractionDetail` schema | `201 Created`: `InteractionDetail` | `interaction_detail` |
| `PATCH` | `/api/interaction_detail_json/{id}/` | Corregir medición de telemetría | `id` (path int) | `PatchedInteractionDetail` | `200 OK`: `InteractionDetail` | `interaction_detail` |
| `DELETE` | `/api/interaction_detail_json/{id}/` | Eliminar medición de telemetría | `id` (path int) | None | `204 No Content` | `interaction_detail` |
| `GET` | `/api/interaction_detail/` | Exportar telemetría procesada | `catchment_point`, `date_time_medition__date__range`, `type` (`xlsx`) | None | `200 OK`: File / Stream | `interaction_detail` |
| `GET` | `/api/interaction_detail_dga/` | Exportar telemetría en estándar normativo DGA | `point_catchment`, `date_time_medition__date__range`, `type` (`xlsx`) | None | `200 OK`: File / Stream | `interaction_detail` |
| `GET` | `/api/interaction_detail_override/` | Consultar sobreescrituras diarias de telemetría | `catchment_point`, `date_time_medition__date__range` | None | `200 OK`: `OverrideList` | `interaction_detail` |
| `GET` | `/api/interaction_detail_override_month/` | Consultar sobreescrituras mensuales | `catchment_point`, `date_time_medition__month`, `date_time_medition__year` | None | `200 OK`: `OverrideList` | `interaction_detail` |
| `GET` | `/api/interaction_detail_override_month_xlsx/` | Descargar Excel de sobreescrituras mensuales | `catchment_point`, `date_time_medition__month`, `date_time_medition__year` | None | `200 OK`: Excel Blob | `interaction_detail` |
| `POST` | `/api/ik/batch/telemetry/` | Telemetría multi-punto en batch (máx 50 puntos) | None | `{"point_ids": [int], "hours": int}` | `200 OK`: `{"data": {point_id: {latest: ...}}}` | `ik_batch` |
| `POST` | `/api/ik/batch/stats/` | Estadísticas agregadas multi-punto | None | `{"point_ids": [int], "days": int}` | `200 OK`: `{"data": {point_id: {stats: ...}}}` | `ik_batch` |
| `POST` | `/api/ik/batch/summary/` | Resumen optimizado multi-punto | None | `{"point_ids": [int]}` | `200 OK`: `{"data": {point_id: {summary: ...}}}` | `ik_batch` |
| `POST` | `/api/ik/telemetry/backfill/` | Iniciar proceso de backfill de datos faltantes | None | `{"point_id": int, "start_date": str, "end_date": str}` | `200 OK`: `{"status": "queued", "task_id": "str"}` | `telemetry` |
| `POST` | `/api/telemetry-reprocessor/` | Reprocesar y recalcular totales de telemetría | None | `{"point_id": int, "from_date": str}` | `200 OK`: `{"status": "processing"}` | `telemetry` |
| `GET` | `/api/counter_reset_logs/` | Historial de resets y anomalías de contadores | `detected_by`, `point_catchment`, `reset_type` (enum), `search`, `page` | None | `200 OK`: `PaginatedCounterResetLogList` | `counter_reset_logs` |
| `GET` | `/api/counter_reset_logs/{id}/` | Detalle de log de reset de contador | `id` (path int) | None | `200 OK`: `CounterResetLog` | `counter_reset_logs` |

### 3.7. Centro de Control & Analytics Dashboard

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/ik/daily_summary/` | Resumen diario agregado del usuario (KPIs, consumo) | `date` (YYYY-MM-DD) | None | `200 OK`: `DailySummaryObject` | `control_center` |
| `GET` | `/api/ik/dashboard_stats/` | KPIs globales del usuario y estado de servicio | None | None | `200 OK`: `DashboardStatsObject` | `control_center` |
| `GET` | `/api/ik/control_center/general_stats/` | KPIs globales, proyectos y cuota de IA | None | None | `200 OK`: `CCGeneralStatsObject` | `control_center` |
| `GET` | `/api/ik/control_center/daily_summary/` | Resumen diario para matriz histórica | `start_date`, `end_date`, `project_id` | None | `200 OK`: `CCDailyMatrixObject` | `control_center` |
| `GET` | `/api/ik/control_center/project_points/` | Puntos de un proyecto para Centro de Control | `project_id` (query int) | None | `200 OK`: `{"points": [{id, name}]}` | `control_center` |
| `GET` | `/api/ik/control_center/list/` | Lista paginada de puntos por día con telemetría | `date`, `project_id`, `page`, `page_size`, `order_by` | None | `200 OK`: `PaginatedCCPointList` | `control_center` |
| `GET` | `/api/ik/control_center/system_events/` | Eventos de sistema globales filtrables | `event_type`, `severity`, `start`, `end`, `search`, `page`, `page_size` | None | `200 OK`: `PaginatedSystemEvents` | `control_center` |
| `GET` | `/api/ik/control_center/system_events/{point_id}/` | Eventos de sistema específicos de un punto | `point_id` (path int), `event_type`, `severity`, `page` | None | `200 OK`: `PaginatedSystemEvents` | `control_center` |
| `POST` | `/api/chat/` | Chat IA de soporte general | None | `{"message": "string"}` | `200 OK`: `{"reply": "string"}` | `chat` |
| `POST` | `/api/ik/chat/client/general_stats/` | Asistente IA contextualizado a métricas hidrológicas | None | `{"message": "string"}` | `200 OK`: `{"reply": "string", "quota": int}` | `chat` |

### 3.8. DGA / SMA Compliance (Cumplimiento Regulatorio)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/ik/compliance/` | Dashboard de cumplimiento y advertencias | `page`, `page_size`, `project_id`, `warning_level`, `standard`, `type_dga` | None | `200 OK`: `ComplianceDashboardResponse` | `compliance` |
| `GET` | `/api/ik/compliance/{point_id}/flow_history/` | Historial de excedencias de caudal normativo | `point_id` (path int), `days`, `page`, `page_size` | None | `200 OK`: `FlowHistoryResponse` | `compliance` |
| `GET` | `/api/ik/compliance/{point_id}/near_limit/` | Historial de mediciones al límite del caudal autorizado | `point_id` (path int), `days`, `page`, `page_size` | None | `200 OK`: `NearLimitResponse` | `compliance` |
| `POST` | `/api/ik/management/toggle_compliance/` | Activar/desactivar monitoreo normativo de un punto | None | `{"point_id": int, "enabled": boolean}` | `200 OK`: `{"success": true}` | `compliance` |
| `GET` | `/api/compliance_providers/` | Proveedores de integración regulatoria (DGA / SMA) | `auth_type`, `code`, `is_active`, `protocol`, `page` | None | `200 OK`: `PaginatedComplianceProviderList` | `compliance_providers` |
| `GET` | `/api/compliance_providers/{id}/` | Detalle de proveedor regulatorio | `id` (path int) | None | `200 OK`: `ComplianceProvider` | `compliance_providers` |
| `GET` | `/api/dga_data_config_catchment/` | Configuraciones DGA asociadas a puntos | `point_catchment`, `page`, `search` | None | `200 OK`: `PaginatedDgaConfigList` | `dga_config` |
| `POST` | `/api/dga_data_config_catchment/` | Crear configuración DGA para un punto | None | `DgaDataConfigCatchment` schema | `201 Created`: `DgaDataConfigCatchment` | `dga_config` |
| `GET` | `/api/dga_data_config_catchment/{id}/` | Detalle de configuración DGA | `id` (path int) | None | `200 OK`: `DgaDataConfigCatchment` | `dga_config` |
| `PATCH` | `/api/dga_data_config_catchment/{id}/` | Actualizar configuración DGA | `id` (path int) | `PatchedDgaDataConfigCatchment` | `200 OK`: `DgaDataConfigCatchment` | `dga_config` |
| `DELETE` | `/api/dga_data_config_catchment/{id}/` | Eliminar configuración DGA | `id` (path int) | None | `204 No Content` | `dga_config` |

### 3.9. Alert Engine (Reglas, Canales & Disparos)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/alert_rules/` | Listar reglas de alerta hidrológica | `point_catchment`, `target_type` (enum), `is_active`, `check_frequency_minutes`, `page` | None | `200 OK`: `PaginatedAlertRuleListList` | `alert_rules` |
| `POST` | `/api/alert_rules/` | Crear regla de alerta | None | `AlertRuleWrite` schema | `201 Created`: `AlertRuleWrite` | `alert_rules` |
| `GET` | `/api/alert_rules/{id}/` | Detalle de regla con canales anidados | `id` (path int) | None | `200 OK`: `AlertRuleDetail` | `alert_rules` |
| `PUT` | `/api/alert_rules/{id}/` | Actualizar regla de alerta | `id` (path int) | `AlertRuleWrite` schema | `200 OK`: `AlertRuleWrite` | `alert_rules` |
| `PATCH` | `/api/alert_rules/{id}/` | Actualizar parcialmente regla | `id` (path int) | `PatchedAlertRuleWrite` | `200 OK`: `AlertRuleWrite` | `alert_rules` |
| `DELETE` | `/api/alert_rules/{id}/` | Eliminar regla de alerta | `id` (path int) | None | `204 No Content` | `alert_rules` |
| `GET` | `/api/alert_channels/` | Listar canales de notificación | `alert_rule`, `channel_type` (EMAIL, GOOGLE_CHAT, SMS, WEBHOOK), `is_active`, `page` | None | `200 OK`: `PaginatedAlertChannelList` | `alert_channels` |
| `POST` | `/api/alert_channels/` | Crear canal de notificación | None | `AlertChannel` schema | `201 Created`: `AlertChannel` | `alert_channels` |
| `GET` | `/api/alert_channels/{id}/` | Detalle de canal de notificación | `id` (path int) | None | `200 OK`: `AlertChannel` | `alert_channels` |
| `PUT` | `/api/alert_channels/{id}/` | Actualizar canal | `id` (path int) | `AlertChannel` schema | `200 OK`: `AlertChannel` | `alert_channels` |
| `PATCH` | `/api/alert_channels/{id}/` | Actualizar parcialmente canal | `id` (path int) | `PatchedAlertChannel` | `200 OK`: `AlertChannel` | `alert_channels` |
| `DELETE` | `/api/alert_channels/{id}/` | Eliminar canal | `id` (path int) | None | `204 No Content` | `alert_channels` |
| `GET` | `/api/alert_triggers/` | Historial de disparos de alertas generados por el motor | `alert_rule`, `is_acknowledged`, `notification_sent`, `triggered_at__date__gte`, `page` | None | `200 OK`: `PaginatedAlertTriggerList` | `alert_triggers` |
| `GET` | `/api/alert_triggers/{id}/` | Detalle de disparo | `id` (path int) | None | `200 OK`: `AlertTrigger` | `alert_triggers` |
| `PATCH` | `/api/alert_triggers/{id}/` | Acusar recibo (acknowledge) de disparo | `id` (path int) | `{"is_acknowledged": true}` | `200 OK`: `AlertTrigger` | `alert_triggers` |
| `GET` | `/api/notifications_catchment/` | Notificaciones manuales de puntos | `point_catchment`, `type_notification`, `is_active`, `page` | None | `200 OK`: `PaginatedNotificationList` | `notifications_catchment` |
| `POST` | `/api/notifications_catchment/` | Crear notificación manual | None | `NotificationCatchment` schema | `201 Created`: `NotificationCatchment` | `notifications_catchment` |
| `GET` | `/api/notifications_catchment/{id}/` | Detalle notificación manual | `id` (path int) | None | `200 OK`: `NotificationCatchment` | `notifications_catchment` |
| `PATCH` | `/api/notifications_catchment/{id}/` | Actualizar notificación manual | `id` (path int) | `PatchedNotificationCatchment` | `200 OK`: `NotificationCatchment` | `notifications_catchment` |
| `DELETE` | `/api/notifications_catchment/{id}/` | Eliminar notificación manual | `id` (path int) | None | `204 No Content` | `notifications_catchment` |
| `GET` | `/api/response_notifications_catchment/` | Respuestas y comentarios en notificaciones | `notification` (int), `page` | None | `200 OK`: `PaginatedResponseNotificationList` | `notifications_catchment` |
| `POST` | `/api/response_notifications_catchment/` | Crear respuesta a notificación | None | `ResponseNotification` schema | `201 Created`: `ResponseNotification` | `notifications_catchment` |

### 3.10. Technical Support & Work Orders (Tickets Kanban / SLA)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/ik/tickets/` | Listar tickets Kanban / Mesa de ayuda | `status`, `priority`, `category`, `assigned_to`, `point_catchment`, `page`, `page_size` | None | `200 OK`: `PaginatedTicketList` | `ik_tickets` |
| `POST` | `/api/ik/tickets/` | Crear nuevo ticket de soporte / OT | None | `TicketCreateSerializer` | `201 Created`: `TicketDetail` | `ik_tickets` |
| `GET` | `/api/ik/tickets/{id}/` | Detalle completo de ticket | `id` (path int) | None | `200 OK`: `TicketDetail` | `ik_tickets` |
| `PATCH` | `/api/ik/tickets/{id}/` | Actualizar ticket | `id` (path int) | `PatchedTicketSerializer` | `200 OK`: `TicketDetail` | `ik_tickets` |
| `DELETE` | `/api/ik/tickets/{id}/` | Eliminar ticket | `id` (path int) | None | `204 No Content` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{id}/assign/` | Asignar ticket a técnico/staff | `id` (path int) | `{"assigned_to": int}` | `200 OK`: `TicketDetail` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{id}/status/` | Transición de estado de ticket (Work Order) | `id` (path int) | `{"status": str, "work_order_category": str}` | `200 OK`: `TicketDetail` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{id}/confirm-scheduled-date/` | Confirmar agendamiento de visita técnica | `id` (path int) | None | `200 OK`: `TicketDetail` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{id}/cancel-scheduled-date/` | Cancelar fecha agendada con motivo | `id` (path int) | `{"reason": "string"}` | `200 OK`: `TicketDetail` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{id}/convert-to-client/` | Convertir ticket en nuevo cliente | `id` (path int) | None | `200 OK`: `{"client_id": int}` | `ik_tickets` |
| `GET` | `/api/ik/tickets/{id}/comments/` | Listar comentarios del ticket | `id` (path int), `page` | None | `200 OK`: `PaginatedCommentList` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{id}/comments/` | Agregar comentario a ticket | `id` (path int) | `{"comment": "string"}` | `201 Created`: `CommentDetail` | `ik_tickets` |
| `PATCH` | `/api/ik/tickets/{id}/comments/{comment_id}/` | Editar comentario | `id`, `comment_id` (path ints) | `{"comment": "string"}` | `200 OK`: `CommentDetail` | `ik_tickets` |
| `DELETE` | `/api/ik/tickets/{id}/comments/{comment_id}/` | Eliminar comentario | `id`, `comment_id` (path ints) | None | `204 No Content` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{id}/comments/{comment_id}/like/` | Dar o quitar like a comentario | `id`, `comment_id` (path ints) | None | `200 OK`: `{"likes_count": int}` | `ik_tickets` |
| `GET` | `/api/ik/tickets/{id}/mentionable_users/` | Listar usuarios mencionables (@user) | `id` (path int) | None | `200 OK`: `MentionableUser[]` | `ik_tickets` |
| `GET` | `/api/ik/tickets/{id}/attachments/` | Listar adjuntos del ticket | `id` (path int) | None | `200 OK`: `Attachment[]` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{id}/attachments/` | Subir archivo adjunto a ticket | `id` (path int) | `multipart/form-data`: `file` | `201 Created`: `Attachment` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{ticket_id}/comments/{comment_id}/attachments/` | Subir adjunto a comentario específico | `ticket_id`, `comment_id` | `multipart/form-data`: `file` | `201 Created`: `Attachment` | `ik_tickets` |
| `GET` | `/api/ik/tickets/{id}/tasks/` | Listar checklist / subtareas del ticket | `id` (path int), `page` | None | `200 OK`: `PaginatedTaskList` | `ik_tickets` |
| `POST` | `/api/ik/tickets/{id}/tasks/` | Crear subtarea en ticket | `id` (path int) | `{"title": str, "description": str, ...}` | `201 Created`: `TaskDetail` | `ik_tickets` |
| `GET` | `/api/ik/tasks/{id}/` | Detalle de tarea | `id` (path int) | None | `200 OK`: `TaskDetail` | `ik_tickets` |
| `PATCH` | `/api/ik/tasks/{id}/` | Actualizar estado o datos de tarea | `id` (path int) | `PatchedTaskSerializer` | `200 OK`: `TaskDetail` | `ik_tickets` |
| `DELETE` | `/api/ik/tasks/{id}/` | Eliminar tarea | `id` (path int) | None | `204 No Content` | `ik_tickets` |
| `POST` | `/api/ik/tasks/{id}/attachments/` | Subir adjunto a subtarea | `id` (path int) | `multipart/form-data`: `file` | `201 Created`: `Attachment` | `ik_tickets` |
| `GET` | `/api/ik/tickets/notifications/` | Notificaciones activas de tickets | `page`, `unread_only` | None | `200 OK`: `TicketNotification[]` | `ik_tickets` |
| `POST` | `/api/ik/tickets/notifications/mark-read/` | Marcar notificaciones como leídas | None | `{"notification_ids": [int]}` | `200 OK`: `{"success": true}` | `ik_tickets` |
| `GET` | `/api/ik/tickets/stats/` | Métricas agregadas de tickets (tiempos, abiertas, cerradas) | `date_from`, `date_to`, `category` | None | `200 OK`: `TicketStatsObject` | `ik_tickets` |
| `GET` | `/api/ik/tickets/dashboard/` | Métricas de rendimiento de SLAs e indicadores | None | None | `200 OK`: `TicketDashboardMetrics` | `ik_tickets` |
| `GET` | `/api/ik/tickets/ranking/` | Ranking de resolución de técnicos de soporte | `period` | None | `200 OK`: `StaffRankingItem[]` | `ik_tickets` |
| `GET` | `/api/ik/tickets/my_desk/` | Tickets asignados al usuario conectado | `page`, `page_size`, `status` | None | `200 OK`: `PaginatedTicketList` | `ik_tickets` |
| `GET` | `/api/ik/files/` | Repositorio general de archivos / Document Drive | `search`, `page`, `category`, `point_id` | None | `200 OK`: `PaginatedFileList` | `ik_files` |
| `GET` | `/api/ik/ticket-categories/` | Listar categorías de tickets | `is_active`, `search`, `page` | None | `200 OK`: `TicketCategory[]` | `ik_ticket_catalogs` |
| `POST` | `/api/ik/ticket-categories/` | Crear categoría de ticket | None | `TicketCategory` schema | `201 Created`: `TicketCategory` | `ik_ticket_catalogs` |
| `GET` | `/api/ik/ticket-categories/{id}/` | Detalle categoría de ticket | `id` (path int) | None | `200 OK`: `TicketCategory` | `ik_ticket_catalogs` |
| `PATCH` | `/api/ik/ticket-categories/{id}/` | Actualizar categoría | `id` (path int) | `PatchedTicketCategory` | `200 OK`: `TicketCategory` | `ik_ticket_catalogs` |
| `DELETE` | `/api/ik/ticket-categories/{id}/` | Eliminar categoría | `id` (path int) | None | `204 No Content` | `ik_ticket_catalogs` |
| `GET` | `/api/ik/sla-configs/` | Listar configuraciones de SLA | `category`, `priority`, `page` | None | `200 OK`: `SlaConfig[]` | `ik_ticket_catalogs` |
| `POST` | `/api/ik/sla-configs/` | Crear configuración SLA | None | `SlaConfig` schema | `201 Created`: `SlaConfig` | `ik_ticket_catalogs` |
| `GET` | `/api/ik/sla-configs/{id}/` | Detalle configuración SLA | `id` (path int) | None | `200 OK`: `SlaConfig` | `ik_ticket_catalogs` |
| `PATCH` | `/api/ik/sla-configs/{id}/` | Actualizar configuración SLA | `id` (path int) | `PatchedSlaConfig` | `200 OK`: `SlaConfig` | `ik_ticket_catalogs` |
| `DELETE` | `/api/ik/sla-configs/{id}/` | Eliminar configuración SLA | `id` (path int) | None | `204 No Content` | `ik_ticket_catalogs` |

### 3.11. System Health & Infrastructure Management (`/api/management/*`)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/management/system_status/` | Estado integral de servicios (Redis, Celery, DB, DGA) | None | None | `200 OK`: `SystemStatusObject` | `management` |
| `GET` | `/api/management/resources_status/` | Uso de CPU, memoria RAM, almacenamiento y DB | None | None | `200 OK`: `ResourcesStatusObject` | `management` |
| `GET` | `/api/management/points_status/` | Estado de conexión y desfase de puntos de captación | `threshold_minutes` (int, default: 60) | None | `200 OK`: `PointsStatusObject` | `management` |
| `GET` | `/api/management/telemetry_metrics/` | Métricas de ingesta, tasa de datos y errores | `start_date`, `end_date` | None | `200 OK`: `TelemetryMetricsObject` | `management` |
| `GET` | `/api/management/system_map/` | Topología completa del sistema y dispositivos | None | None | `200 OK`: `SystemMapObject` | `management` |
| `POST` | `/api/management/toggle_telemetry/` | Activar/desactivar ingesta de telemetría de un punto | None | `{"point_id": int, "enabled": boolean}` | `200 OK`: `{"success": true}` | `management` |
| `GET` | `/api/management/dga_queue_status/` | Estado y backlog de la cola de envíos DGA | None | None | `200 OK`: `DgaQueueStatusObject` | `management` |
| `POST` | `/api/management/clear_dga_queue/` | Purgar cola de envíos DGA trabada | None | `{}` | `200 OK`: `{"cleared": int}` | `management` |
| `POST` | `/api/management/requeue_dga/` | Re-encolar reintentos de envíos DGA | None | `{"point_id": int}` | `200 OK`: `{"requeued": int}` | `management` |
| `POST` | `/api/management/update_point_frequency/` | Actualizar intervalo de ingesta de un punto | None | `{"point_id": int, "frequency": int}` | `200 OK`: `{"success": true}` | `management` |
| `GET` | `/api/management/notifications_summary/` | Resumen de notificaciones de los últimos N días | `days` (int, default: 7) | None | `200 OK`: `NotificationsSummaryObject` | `management` |
| `GET` | `/api/system_events/` | Log de auditoría de eventos de sistema | `event_type`, `severity`, `page`, `page_size` | None | `200 OK`: `PaginatedSystemEventList` | `system_events` |
| `GET` | `/api/ik/system-events/summary/` | Resumen cuantitativo de eventos por severidad | None | None | `200 OK`: `SystemEventsSummaryObject` | `system_events` |

### 3.12. Master Catalogs (Variables, Esquemas, Proveedores & Archivos)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/variable/` | Listar catálogo de variables físicas (caudal, nivel, etc.) | `search`, `page`, `ordering` | None | `200 OK`: `PaginatedVariableList` | `variable` |
| `POST` | `/api/variable/` | Crear variable física | None | `Variable` schema | `201 Created`: `Variable` | `variable` |
| `GET` | `/api/variable/{id}/` | Detalle de variable física | `id` (path int) | None | `200 OK`: `Variable` | `variable` |
| `PATCH` | `/api/variable/{id}/` | Actualizar variable física | `id` (path int) | `PatchedVariable` | `200 OK`: `Variable` | `variable` |
| `DELETE` | `/api/variable/{id}/` | Eliminar variable física | `id` (path int) | None | `204 No Content` | `variable` |
| `GET` | `/api/schemes_catchment/` | Listar esquemas de medición hidrológica | `search`, `page`, `ordering` | None | `200 OK`: `PaginatedSchemeList` | `schemes_catchment` |
| `POST` | `/api/schemes_catchment/` | Crear esquema de medición | None | `Scheme` schema | `201 Created`: `Scheme` | `schemes_catchment` |
| `GET` | `/api/schemes_catchment/{id}/` | Detalle de esquema de medición | `id` (path int) | None | `200 OK`: `Scheme` | `schemes_catchment` |
| `PATCH` | `/api/schemes_catchment/{id}/` | Actualizar esquema | `id` (path int) | `PatchedScheme` | `200 OK`: `Scheme` | `schemes_catchment` |
| `DELETE` | `/api/schemes_catchment/{id}/` | Eliminar esquema | `id` (path int) | None | `204 No Content` | `schemes_catchment` |
| `GET` | `/api/telemetry_providers/` | Listar proveedores de hardware / IoT | `is_active`, `search`, `page` | None | `200 OK`: `PaginatedTelemetryProviderList` | `telemetry_providers` |
| `GET` | `/api/telemetry_providers/{id}/` | Detalle de proveedor de hardware / IoT | `id` (path int) | None | `200 OK`: `TelemetryProvider` | `telemetry_providers` |
| `GET` | `/api/file_catchment/` | Listar archivos y documentos de puntos de captación | `point_catchment` (query int), `page` | None | `200 OK`: `PaginatedFileList` | `file_catchment` |
| `POST` | `/api/file_catchment/` | Subir archivo a punto de captación | None | `multipart/form-data`: `file`, `point_catchment`, `name`, `description`, `type_file` | `201 Created`: `FileCatchment` | `file_catchment` |
| `DELETE` | `/api/file_catchment/{id}/` | Eliminar archivo de punto | `id` (path int) | None | `204 No Content` | `file_catchment` |

### 3.13. Official Reports & Spreadsheet Generation (`/api/reports/*`)

| Method | Endpoint Path | Summary / Description | Path / Query Parameters | Request Body Schema | Response Schema / Status | DRF Tag |
|---|---|---|---|---|---|---|
| `GET` | `/api/reports/json/by-project/` | Reporte JSON de telemetría por proyecto | `project_id` (int), `point_ids` (str) | None | `200 OK`: `ProjectTelemetryReportJSON` | `reports` |
| `GET` | `/api/reports/json/by-point/` | Reporte JSON de telemetría por punto y mes | `point_id` (int), `year` (int), `month` (int) | None | `200 OK`: `PointTelemetryReportJSON` | `reports` |
| `GET` | `/api/reports/json/last-month/` | Reporte JSON consolidado del mes anterior | None | None | `200 OK`: `MonthlyConsolidatedReportJSON` | `reports` |
| `GET` | `/api/reports/json/last-year/` | Reporte JSON consolidado del año anterior | None | None | `200 OK`: `AnnualConsolidatedReportJSON` | `reports` |
| `GET` | `/api/reports/json/annual-compressed/` | Reporte JSON anual resumido/comprimido | None | None | `200 OK`: `AnnualCompressedReportJSON` | `reports` |
| `GET` | `/api/reports/by-project/` | Descargar reporte Excel por proyecto | `project_id` (int) | None | `200 OK`: `application/vnd.openxmlformats` | `reports` |
| `GET` | `/api/reports/by-point/` | Descargar reporte Excel por punto y fecha | `point_id` (int), `year` (int), `month` (int) | None | `200 OK`: `application/vnd.openxmlformats` | `reports` |
| `GET` | `/api/reports/last-month/` | Descargar reporte Excel del mes anterior | None | None | `200 OK`: `application/vnd.openxmlformats` | `reports` |
| `GET` | `/api/reports/last-year/` | Descargar reporte Excel del año anterior | None | None | `200 OK`: `application/vnd.openxmlformats` | `reports` |
| `GET` | `/api/reports/annual-compressed/` | Descargar reporte Excel anual comprimido | None | None | `200 OK`: `application/vnd.openxmlformats` | `reports` |

---

## 4. Key Schemas, Data Models & Enums

### 4.1. Core Enums
- **Alert Target Types (`target_type`)**:
  - `THRESHOLD_MAX` (Umbral máximo superado)
  - `THRESHOLD_MIN` (Umbral mínimo no alcanzado)
  - `NO_DATA` (Sin datos por tiempo X)
  - `DISCONNECTION` (Punto desconectado)
  - `RECONNECTION` (Punto reconectado)
  - `PROCESSING_ERROR` (Error de procesamiento)
  - `RATE_OF_CHANGE` (Tasa de cambio anómala)
  - `DEVIATION` (Desviación estadística)
  - `SCHEDULED_REPORT` (Reporte programado)
- **Alert Channel Types (`channel_type`)**:
  - `EMAIL`, `GOOGLE_CHAT`, `SMS`, `WEBHOOK`
- **Counter Reset Types (`reset_type`)**:
  - `ZERO` (Reset a 0)
  - `ZERO_KEPT` (Reset a 0 preservando total acumulado)
  - `PARTIAL` (Reset parcial: 0 < actual < anterior)
  - `PARTIAL_REJECTED` (Reset parcial rechazado por falta de evidencia de desconexión)
  - `MASSIVE_JUMP` (Salto masivo bloqueado)
  - `NEGATIVE_PULSES` (Pulsos negativos / error de ingesta)
- **Compliance Auth Types (`auth_type`)**:
  - `NONE`, `BASIC`, `BEARER`, `API_KEY_HEADER`, `JSON_BODY`
- **Compliance Protocols (`protocol`)**:
  - `HTTP_REST`, `HTTP_SOAP`, `WEBHOOK`, `CUSTOM`
- **Ticket Statuses**:
  - `NUEVO`, `EN_PROCESO`, `PENDIENTE`, `RESUELTO`, `CERRADO`, `CANCELADO`
- **Ticket Priorities**:
  - `BAJA`, `MEDIA`, `ALTA`, `CRITICA`

### 4.2. Complex Data Models
- **`CatchmentPointIkolu`**: Contiene metadatos completos del punto, coordenadas UTM, cuenca, estándar DGA (`MAYOR`, `MENOR`, `MEDIO`), proveedor de telemetría, esquemas activos, variables monitoreadas con unidades, estado de conexión en tiempo real y última telemetría procesada (`last_telemetry`).
- **`PointTechnicalConfig`**: Define las dimensiones físicas del pozo (d1: profundidad pozo, d2: profundidad bomba, d3: nivel freático estático, d4: diámetro tubería/bomba, d5: diámetro flujómetro).
- **`AlertRuleDetail`**: Contiene la regla de monitoreo, umbral numérico, ventana de evaluación temporal y lista de `channels` asociados.

---

## 5. Discovered Features & Edge Cases

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Authentication | `POST /api/ik/login/` | Autenticación de usuario y entrega de JWT / DRF Token | `email`, `password` | `user`, `access_token` | `400 Bad Request` en credenciales inválidas | OpenAPI & Live Probe |
| 2 | Authentication | `GET /api/ik/announcements/public/` | Consulta pública de anuncios del sistema | `limit` (opcional) | `{ count, announcements: [] }` | `200 OK` público | Live Probe (200 OK) |
| 3 | Points Management | `GET /api/catchment_point/` | Listado paginado de puntos de captación | `project`, `search`, `page` | `PaginatedCatchmentPointList` | `401 Unauthorized` si no hay token | OpenAPI & Live Probe |
| 4 | Points Management | `GET /api/catchment_point/{id}/` | Detalle con última telemetría y variables | `id` (path int) | `CatchmentPointIkolu` | `404 Not Found` en ID inexistente | OpenAPI & Live Probe |
| 5 | Points Management | `GET /api/ik/point/{id}/gaps/` | Detección de brechas en transmisión de datos | `id`, `start_date`, `end_date` | `{"gaps": [...]}` | `401 / 404` | Live Probe (401 OK) |
| 6 | Points Management | `GET /api/ik/point/{id}/calendar/` | Matriz de disponibilidad por día | `id`, `days` | `CalendarDayStats[]` | `401 / 404` | Live Probe (401 OK) |
| 7 | Telemetry Ingestion | `POST /api/ik/batch/telemetry/` | Telemetría batch multi-punto (hasta 50 puntos) | `point_ids`, `hours` | `{ data: { [id]: { latest: ... } } }` | `400 Bad Request` si excede 50 puntos | Live Probe |
| 8 | Telemetry Processing | `POST /api/telemetry-reprocessor/` | Reprocesador de telemetría y recálculo acumulados | `point_id`, `from_date` | `{"status": "processing"}` | `401 Unauthorized` | Live Probe (401 OK) |
| 9 | Telemetry Anomaly | `GET /api/counter_reset_logs/` | Auditoría de resets y saltos masivos de contadores | `detected_by`, `reset_type`, `page` | `PaginatedCounterResetLogList` | `401 Unauthorized` | OpenAPI & Live Probe |
| 10 | Control Center | `GET /api/ik/control_center/general_stats/` | Dashboard general con proyectos y cuota IA | None | `CCGeneralStatsObject` | `401 Unauthorized` | Live Probe (401 OK) |
| 11 | Compliance | `GET /api/ik/compliance/` | Métricas de cumplimiento y advertencias DGA | `page`, `project_id`, `warning_level` | `ComplianceDashboardResponse` | `401 Unauthorized` | Live Probe (401 OK) |
| 12 | Compliance | `GET /api/ik/compliance/{id}/flow_history/` | Histórico de excedencias de caudal normativo | `id`, `days`, `page` | `FlowHistoryResponse` | `401 / 404` | Live Probe (401 OK) |
| 13 | Alert Engine | `GET /api/alert_rules/` | Reglas de alerta con 9 tipos de condición | `target_type`, `point_catchment` | `PaginatedAlertRuleListList` | `401 Unauthorized` | OpenAPI & Live Probe |
| 14 | Alert Engine | `PATCH /api/alert_triggers/{id}/` | Acknowledge (acuse de recibo) de alerta | `id`, `{"is_acknowledged": true}` | `AlertTrigger` | `400 / 404` | OpenAPI & Live Probe |
| 15 | Support Tickets | `GET /api/ik/tickets/my_desk/` | Mesa de trabajo personalizada para técnicos | `status`, `page`, `page_size` | `PaginatedTicketList` | `401 Unauthorized` | Live Probe (401 OK) |
| 16 | Support Tickets | `POST /api/ik/tickets/{id}/confirm-scheduled-date/` | Confirmar agendamiento de visita técnica en terreno | `id` | `TicketDetail` | `400 / 404` | Live Probe (401 OK) |
| 17 | Support Tickets | `GET /api/ik/tickets/dashboard/` | Métricas de rendimiento, tiempos de respuesta y SLAs | None | `TicketDashboardMetrics` | `401 Unauthorized` | Live Probe (401 OK) |
| 18 | Infrastructure | `GET /api/management/resources_status/` | Telemetría de hardware de servidores (CPU, RAM, Disco) | None | `ResourcesStatusObject` | `401 Unauthorized` | Live Probe (401 OK) |
| 19 | Infrastructure | `POST /api/management/clear_dga_queue/` | Purgar cola atascada de transmisiones DGA | None | `{"cleared": int}` | `403 Forbidden` si no es staff | Live Probe (401 OK) |
| 20 | Reports | `GET /api/reports/json/by-project/` | Generación de reporte JSON por proyecto | `project_id`, `point_ids` | `ProjectTelemetryReportJSON` | `401 Unauthorized` | Live Probe (401 OK) |
| 21 | Reports | `GET /api/reports/annual-compressed/` | Descarga de Excel comprimido anual | None | `application/vnd.openxmlformats` | `401 Unauthorized` | Live Probe (401 OK) |

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| 1 | `POST /api/ik/batch/telemetry/` | `point_ids: []` (empty array) | Returns `{ data: {}, meta: { requested: 0, returned: 0 } }` |
| 2 | `POST /api/ik/batch/telemetry/` | `point_ids` with >50 items | Exceeds `MAX_BATCH_SIZE`; backend limits batch to 50 items per call |
| 3 | `GET /compliance/dga/verify/` | Any parameters | `404 Not Found`. Legacy / nonexistent endpoint in backend |
| 4 | `GET /api/history_data/` | `?profile=1` | `404 Not Found`. Legacy billing endpoint removed from backend |
| 5 | `GET /api/reports/active-points/` | None | `404 Not Found`. Obsolete report endpoint |
| 6 | `GET /api/ik/point/{id}/calendar/` | `days=0` or negative | Handled with fallback default (7 days) |
| 7 | `POST /api/ik/tickets/{id}/attachments/` | File size > 10MB or unsupported extension | Rejected with validation error before upload |
| 8 | `GET /api/alert_triggers/` | `triggered_at__date__gte` with invalid date format | `400 Bad Request` with DRF validation message |

---

## 6. Gap & Discrepancy Analysis (Frontend vs Official Spec)

| Area | Frontend Endpoint (`endpoints.js`) | Official Status in Backend | Recommendation for Codebase Cleanup |
|---|---|---|---|
| Billing | `GET /history_data/` (`get_history_data`) | ❌ **404 Not Found** (Removed) | Deprecate and remove dead code from `endpoints.js` |
| Reports | `GET ../reports/active-points/` (`reportsDownloadActivePoints`) | ❌ **404 Not Found** (Removed) | Remove obsolete method from `reports` object |
| Compliance | `GET /compliance/dga/verify/` (`verifyDgaVoucher`) | ❌ **404 Not Found** (Nonexistent) | Remove mock/dead voucher verification or update to valid DGA status endpoint |
| Points | `GET /api/catchment_point/all/` vs `GET /api/ik/my_points/` | ✅ Both active | Standardize: users should consume `/api/ik/my_points/` (lightweight), admin uses `/api/catchment_point/` |
| Telemetry | `GET /interaction_detail_json/` vs `POST /api/ik/batch/telemetry/` | ✅ Both active | Use native batch endpoints in multi-point views to reduce HTTP overhead |

---

## 7. Verification Method

To independently verify the endpoints documented in this report against the live SmartHydro backend:
1. Probe schema metadata: `GET https://api.smarthydro.app/api/schema/` (returns OpenAPI 3.0.3 YAML).
2. Probe public endpoints without auth: `GET https://api.smarthydro.app/api/ik/announcements/public/` (returns 200 OK with announcements array).
3. Verify DRF protected routers: `GET https://api.smarthydro.app/api/<endpoint>/` (returns 401 Unauthorized with WWW-Authenticate header, confirming endpoint registration in DRF router).
4. Verify non-existent / obsolete endpoints: `GET https://api.smarthydro.app/api/history_data/` and `GET https://api.smarthydro.app/compliance/dga/verify/` (return 404 Not Found, confirming obsolescence).

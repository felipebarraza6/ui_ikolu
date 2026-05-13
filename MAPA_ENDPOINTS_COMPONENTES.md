# Mapa de Endpoints por Componente

> Inventario completo de qué componente le pega a qué endpoint, con propuesta de rutas `ik/` optimizadas para el backend.

---

## 📊 Leyenda

| Símbolo | Significado |
|---------|-------------|
| ⚡ | Endpoint batch/optimizado ya existe (no tocar) |
| 🔴 | Frontend procesa datos que debería procesar el backend |
| 🟡 | Múltiples requests cuando podría ser una sola |
| 🟢 | OK, endpoint simple y directo |
| 🔵 | Necesita nuevo endpoint `ik/` |

---

## 🔐 1. Autenticación / Login

### `containers/Login.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Login | `POST /api/ik/login/` | POST | `POST /api/ik/auth/login/` 🟢 | Ya está en `ik/`, OK |

### `containers/Home.js` (selector de proyecto/punto)
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Lista clientes + proyectos | `GET /api/clients_with_projects/` | GET | `GET /api/ik/clients/tree/` 🔵 | Admin: árbol cliente→proyecto→puntos |
| Puntos por proyecto | `GET /api/catchment_point/all/?project={id}` | GET | `GET /api/ik/projects/{id}/points/` 🔵 | |
| Alertas activas (header) | `GET /api/notifications_catchment/?point_catchment={id}&is_active=true&type_notification=ALERT` | GET | `GET /api/ik/points/{id}/alerts/active/` 🔵 | |

---

## 🏠 2. Centro de Control (Dashboard)

### `components/home/AlertPreview.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Alertas activas preview | `GET /api/notifications_catchment/?point_catchment={id}&is_active=true&type_notification=ALERT` | GET | `GET /api/ik/points/{id}/alerts/active/` 🔵 | Mismo que HeaderNav |

### `components/home/HeaderNav.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Alertas activas (badge) | `GET /api/notifications_catchment/?point_catchment={id}&is_active=true&type_notification=ALERT` | GET | `GET /api/ik/points/{id}/alerts/active/count/` 🔵 | Solo necesita `count`, no array completo |

### `components/home/ListWells.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Lista de puntos (lazy) | `GET /api/catchment_point/all/` o `GET /api/ik/my_points/` | GET | `GET /api/ik/points/mine/` ⚡ | Ya optimizado en `useLazyProfile` |
| Detalle del punto | `GET /api/catchment_point/{id}/` | GET | `GET /api/ik/points/{id}/detail/` 🔵 | |

### `components/home/Supp.js` (Soporte rápido en home)
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Notificaciones SUPPORT | Usa `optimizedSh` | GET | — | Delegado a `orchestrator` |

### `hooks/useLazyProfile.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Todos los puntos (admin) | `GET /api/catchment_point/all/` | GET | `GET /api/ik/points/all/` 🔵 | Con rol, admin ve todos |
| Mis puntos (cliente) | `GET /api/ik/my_points/` | GET | `GET /api/ik/points/mine/` 🟢 | Ya existe |
| Fallback perfil completo | `GET /api/users/{username}/` | GET | `GET /api/ik/profile/` 🔵 | Mejor: sin username, usar token |

### `hooks/useDashboardData.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Batch summary múltiples puntos | `POST /api/ik/batch/summary/` | POST | `POST /api/ik/points/batch/summary/` ⚡ | Ya existe batch nativo |
| Batch telemetry | `POST /api/ik/batch/telemetry/` | POST | `POST /api/ik/points/batch/telemetry/` ⚡ | Ya existe batch nativo |
| Batch stats | `POST /api/ik/batch/stats/` | POST | `POST /api/ik/points/batch/stats/` ⚡ | Ya existe batch nativo |
| Lista puntos admin | `GET /api/catchment_point/all/` | GET | `GET /api/ik/points/all/` 🔵 | |
| Fallback perfil | `GET /api/users/{username}/` | GET | `GET /api/ik/profile/` 🔵 | |

### `hooks/usePointDetail.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Detalle punto | `GET /api/catchment_point/{id}/` | GET | `GET /api/ik/points/{id}/detail/` 🔵 | |
| Fallback perfil | `GET /api/users/{username}/` | GET | `GET /api/ik/profile/` 🔵 | |

---

## 📡 3. Telemetría

### `components/mywell/MyWell.js` 🔴🔴🔴
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Perfil completo | `GET /api/users/{username}/` | GET | `GET /api/ik/profile/` 🟡 | Se usa en múltiples lugares |
| Datos telemetría | `GET /api/interaction_detail_json/?catchment_point={id}&hour=0` | GET | `GET /api/ik/points/{id}/telemetry/latest/` 🔵 | **🔴 Frontend filtra por `hour=0` y procesa arrays enormes** |
| Histórico (múltiples páginas) | `GET /api/interaction_detail_json/?catchment_point={id}&date_time_medition__date__range={from},{to}&page={n}` | GET | `GET /api/ik/points/{id}/telemetry/range/` 🔵 | **🟡 Hace múltiples requests paginados en loop** |

> **🔴 PROBLEMA CRÍTICO:** MyWell hace 3-5 requests paginados y luego procesa todo en frontend. Debería ser un solo endpoint que devuelva los datos ya procesados.

### `components/mywell/TableStandarVerySmall.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Telemetría | `GET /api/interaction_detail_json/?catchment_point={id}&hour=0` | GET | `GET /api/ik/points/{id}/telemetry/latest/` 🔵 | |
| Eliminar registro | `DELETE /api/interaction_detail_json/{id}/` | DELETE | `DELETE /api/ik/telemetry/{id}/` 🔵 | |
| Crear registro | `POST /api/interaction_detail_json/` | POST | `POST /api/ik/telemetry/` 🔵 | |

### `components/mywell/TableStandarVerySmallResponsive.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Telemetría | `GET /api/interaction_detail_json/?catchment_point={id}&hour=0` | GET | `GET /api/ik/points/{id}/telemetry/latest/` 🔵 | Mismo que arriba |
| Eliminar registro | `DELETE /api/interaction_detail_json/{id}/` | DELETE | `DELETE /api/ik/telemetry/{id}/` 🔵 | |
| Crear registro | `POST /api/interaction_detail_json/` | POST | `POST /api/ik/telemetry/` 🔵 | |

### `hooks/useProfileData.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Perfil + puntos | `GET /api/users/{username}/` | GET | `GET /api/ik/profile/` 🟡 | Mismo endpoint usado en 5 lugares |
| Telemetría | `GET /api/interaction_detail_json/?catchment_point={id}&hour=0` | GET | `GET /api/ik/points/{id}/telemetry/latest/` 🔵 | |

---

## 📈 4. Smart Análisis

### `components/smart_data/ResponsiveSmartAnalysis.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Datos mensuales | `GET /api/interaction_detail_override_month/?catchment_point={id}&date_time_medition__month={mm}&date_time_medition__year={yyyy}` | GET | `GET /api/ik/points/{id}/data/month/{yyyy}/{mm}/` 🔵 | |
| Datos diarios | `GET /api/interaction_detail_override/?catchment_point={id}&date_time_medition__date__range={from},{to}` | GET | `GET /api/ik/points/{id}/data/day/{from}/{to}/` 🔵 | |

### `components/smart_data/GraphisNav.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Datos mensuales | `GET /api/interaction_detail_override_month/...` | GET | `GET /api/ik/points/{id}/data/month/{yyyy}/{mm}/` 🔵 | Mismo que arriba |
| Datos diarios | `GET /api/interaction_detail_override/...` | GET | `GET /api/ik/points/{id}/data/day/{from}/{to}/` 🔵 | Mismo que arriba |

### `components/smart_data/GraphisNavDga.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Datos mensuales DGA | `GET /api/interaction_detail_override_month/?catchment_point={id}&date_time_medition__month={mm}&date_time_medition__year={yyyy}` | GET | `GET /api/ik/points/{id}/data/dga/month/{yyyy}/{mm}/` 🔵 | |
| Datos diarios DGA | `GET /api/interaction_detail_override/?catchment_point={id}&date_time_medition__date__range={from},{to}` | GET | `GET /api/ik/points/{id}/data/dga/day/{from}/{to}/` 🔵 | |

### `components/smart_data/TableData.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Descargar Excel mensual | `GET /api/interaction_detail_override_month_xlsx/...` | GET | `GET /api/ik/points/{id}/export/month/{yyyy}/{mm}/xlsx/` 🔵 | |

---

## 🏛️ 5. DGA

### `components/dga/Registers.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Descargar Excel DGA | `GET /api/interaction_detail_dga/?point_catchment={id}&date_time_medition__date__range={from},{to}&type=xlsx` | GET | `GET /api/ik/points/{id}/export/dga/{from}/{to}/xlsx/` 🔵 | |

### `components/dga/ResponsiveDga.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Datos DGA | Usa `useProfileData` → `get_data_sh` | GET | `GET /api/ik/points/{id}/dga/data/` 🔵 | Delegado a hook |

### `components/dga/ModalQR.js` / `CodeQR.js` / `PreviewModalQR.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| No usan API directamente | — | — | — | Consumen datos del punto seleccionado |

---

## 🚨 6. Alertas

### `components/alerts/ResponsiveAlerts.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Todas las alertas | `GET /api/notifications_catchment/?point_catchment={id}&page=1&type_notification=ALERT` | GET | `GET /api/ik/points/{id}/alerts/` 🔵 | |
| Alertas activas | `GET /api/notifications_catchment/?point_catchment={id}&page=1&type_notification=ALERT&is_active=true` | GET | `GET /api/ik/points/{id}/alerts/active/` 🔵 | |

### `components/alerts/Alerts.js` (legacy)
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Todas las alertas | `GET /api/notifications_catchment/?point_catchment={id}&page={n}&type_notification=ALERT` | GET | `GET /api/ik/points/{id}/alerts/` 🔵 | Mismo que ResponsiveAlerts |
| Alertas activas | `GET /api/notifications_catchment/?point_catchment={id}&page={n}&type_notification=ALERT&is_active=true` | GET | `GET /api/ik/points/{id}/alerts/active/` 🔵 | |

### `components/alerts/FormAlert.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Crear alerta | `POST /api/notifications_catchment/` | POST | `POST /api/ik/points/{id}/alerts/` 🔵 | |
| Actualizar alerta | `PATCH /api/notifications_catchment/{id}/` | PATCH | `PATCH /api/ik/alerts/{id}/` 🔵 | |

### `components/alerts/TableAlerts.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Detalle alerta | `GET /api/notifications_catchment/{id}/` | GET | `GET /api/ik/alerts/{id}/` 🔵 | |
| Eliminar alerta | `DELETE /api/notifications_catchment/{id}/` | DELETE | `DELETE /api/ik/alerts/{id}/` 🔵 | |
| Toggle activa | `PATCH /api/notifications_catchment/{id}/` | PATCH | `PATCH /api/ik/alerts/{id}/` 🔵 | |
| Respuestas | `GET /api/response_notifications_catchment/?notification={id}&page={n}` | GET | `GET /api/ik/alerts/{id}/responses/` 🔵 | |
| Crear respuesta | `POST /api/response_notifications_catchment/` | POST | `POST /api/ik/alerts/{id}/responses/` 🔵 | |

---

## 🎧 7. Soporte / Support

### `components/support/Dash.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Tickets SUPPORT | `GET /api/notifications_catchment/?point_catchment={id}&page={n}&type_notification=SUPPORT` | GET | `GET /api/ik/points/{id}/support/tickets/` 🔵 | |
| Tickets activos | `GET /api/notifications_catchment/?point_catchment={id}&page={n}&type_notification=SUPPORT&is_active=true` | GET | `GET /api/ik/points/{id}/support/tickets/active/` 🔵 | |

### `components/support/FormSupport.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Crear ticket | `POST /api/notifications_catchment/` | POST | `POST /api/ik/points/{id}/support/tickets/` 🔵 | |

### `components/support/ActiveTickets.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Respuestas ticket | `GET /api/response_notifications_catchment/?notification={id}&page={n}` | GET | `GET /api/ik/support/tickets/{id}/responses/` 🔵 | |
| Crear respuesta | `POST /api/response_notifications_catchment/` | POST | `POST /api/ik/support/tickets/{id}/responses/` 🔵 | |

### `components/support/TableSupport.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Respuestas ticket | `GET /api/response_notifications_catchment/?notification={id}&page={n}` | GET | `GET /api/ik/support/tickets/{id}/responses/` 🔵 | Mismo que ActiveTickets |
| Crear respuesta | `POST /api/response_notifications_catchment/` | POST | `POST /api/ik/support/tickets/{id}/responses/` 🔵 | |

---

## 🗂️ 8. Documentos

### `components/docres/DocRes.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Listar archivos | `GET /api/file_catchment/?point_catchment={id}` | GET | `GET /api/ik/points/{id}/documents/` 🔵 | |
| Subir archivo | `POST /api/file_catchment/` | POST | `POST /api/ik/points/{id}/documents/` 🔵 | |
| Eliminar archivo | `DELETE /api/file_catchment/{id}/` | DELETE | `DELETE /api/ik/documents/{id}/` 🔵 | |

---

## ⚙️ 9. Configuración de Pozo

### `components/well/WellConfigDrawer.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Actualizar perfil | `PATCH /api/profile_client/{id}/` | PATCH | `PATCH /api/ik/points/{id}/config/` 🔵 | |

### `components/well/DgaConfigDrawer.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Actualizar DGA | `PATCH /api/profile_client/{id}/` | PATCH | `PATCH /api/ik/points/{id}/dga/config/` 🔵 | |

---

## 📉 10. Reportes / Descargas

### `components/reports/Reports.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Datos rango | `GET /api/interaction_detail_json/?catchment_point={id}&date_time_medition__date__range={from},{to}&page={n}` | GET | `GET /api/ik/points/{id}/export/data/?from={from}&to={to}` 🔵 | |
| Descargar Excel | `GET /api/interaction_detail/?catchment_point={id}&date_time_medition__date__range={from},{to}&type=xlsx` | GET | `GET /api/ik/points/{id}/export/data/xlsx/?from={from}&to={to}` 🔵 | |

### `components/Sma.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Datos SMA | `GET /api/interaction_detail_json/?catchment_point={id}&date_time_medition__date__range={from},{to}&page={n}` | GET | `GET /api/ik/points/{id}/sma/data/?from={from}&to={to}` 🔵 | |
| Descargar Excel SMA | `GET /api/interaction_detail/?catchment_point={id}&date_time_medition__date__range={from},{to}&type=xlsx` | GET | `GET /api/ik/points/{id}/export/sma/xlsx/?from={from}&to={to}` 🔵 | |
| Editar registro SMA | `PATCH /api/interaction_detail_json/{id}/` | PATCH | `PATCH /api/ik/sma/records/{id}/` 🔵 | |

---

## 👤 11. Perfil de Usuario

### `components/profile/UserProfile.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Actualizar usuario | `PATCH /api/users/{username}/` | PATCH | `PATCH /api/ik/profile/` 🔵 | Sin username, usar token |

---

## 🛠️ 12. Admin Dashboard

### `components/admin/AdminOverview.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Estado del sistema | `GET /api/management/system_status/` | GET | `GET /api/ik/admin/system/status/` 🔵 | |
| Recursos | `GET /api/management/resources_status/` | GET | `GET /api/ik/admin/system/resources/` 🔵 | |
| Clientes con proyectos | `GET /api/clients_with_projects/` | GET | `GET /api/ik/admin/clients/tree/` 🔵 | Mismo que Home |

### `components/admin/AdminDashboard.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Estado sistema | `GET /api/management/system_status/` | GET | `GET /api/ik/admin/system/status/` 🔵 | |
| Mapa sistema | `GET /api/management/system_map/` | GET | `GET /api/ik/admin/system/map/` 🔵 | |
| Recursos | `GET /api/management/resources_status/` | GET | `GET /api/ik/admin/system/resources/` 🔵 | |
| Estado puntos | `GET /api/management/points_status/` | GET | `GET /api/ik/admin/points/status/` 🔵 | |
| Proyectos | `GET /api/project_catchments/` | GET | `GET /api/ik/admin/projects/` 🔵 | |
| Toggle telemetría | `POST /api/management/toggle_telemetry/` | POST | `POST /api/ik/admin/points/{id}/telemetry/toggle/` 🔵 | |
| Estado cola DGA | `GET /api/management/dga_queue_status/` | GET | `GET /api/ik/admin/dga/queue/` 🔵 | |
| Limpiar cola DGA | `POST /api/management/clear_dga_queue/` | POST | `POST /api/ik/admin/dga/queue/clear/` 🔵 | |
| Reencolar DGA | `POST /api/management/requeue_dga/` | POST | `POST /api/ik/admin/dga/queue/requeue/` 🔵 | |
| Resumen notificaciones | `GET /api/management/notifications_summary/?days={n}` | GET | `GET /api/ik/admin/notifications/summary/` 🔵 | |

---

## 🎯 13. SLA Dashboard

### `components/admin/sla/useSlaTickets.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Tickets SUPPORT (todos) | `GET /api/notifications_catchment/?type_notification=SUPPORT&page={n}` | GET | `GET /api/ik/sla/tickets/` 🟢 | Ya en guía backend |
| Tickets por punto | `GET /api/notifications_catchment/?point_catchment={id}&type_notification=SUPPORT&page={n}` | GET | `GET /api/ik/points/{id}/sla/tickets/` 🔵 | |
| Puntos | `GET /api/catchment_point/` o `GET /api/management/points_status/` | GET | `GET /api/ik/points/all/` 🔵 | |
| Actualizar ticket | `PATCH /api/notifications_catchment/{id}/` | PATCH | `PATCH /api/ik/sla/tickets/{id}/` 🟢 | |
| Eliminar ticket | `DELETE /api/notifications_catchment/{id}/` | DELETE | `DELETE /api/ik/sla/tickets/{id}/` 🟢 | |
| Crear respuesta | `POST /api/response_notifications_catchment/` | POST | `POST /api/ik/sla/tickets/{id}/responses/` 🟢 | |
| Respuestas | `GET /api/response_notifications_catchment/?notification={id}&page={n}` | GET | `GET /api/ik/sla/tickets/{id}/responses/` 🟢 | |

### `components/admin/sla/TicketCreateDrawer.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Crear ticket | `POST /api/notifications_catchment/` | POST | `POST /api/ik/sla/tickets/` 🟢 | |
| Puntos | `GET /api/catchment_point/` | GET | `GET /api/ik/points/all/` 🔵 | |

### `components/admin/sla/TicketDetailDrawer.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Respuestas | `GET /api/response_notifications_catchment/?notification={id}&page={n}` | GET | `GET /api/ik/sla/tickets/{id}/responses/` 🟢 | |

### `components/admin/sla/TicketActivityDrawer.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Respuestas | `GET /api/response_notifications_catchment/?notification={id}&page={n}` | GET | `GET /api/ik/sla/tickets/{id}/responses/` 🟢 | |

### `components/admin/sla/WarningsModal.js`
| Acción | Endpoint Actual | Método | Propuesta `ik/` | Notas |
|--------|----------------|--------|-----------------|-------|
| Warnings | `GET /api/notifications_catchment/?type_notification=WARNING&page={n}` | GET | `GET /api/ik/sla/warnings/` 🟢 | |
| Eliminar warning | `DELETE /api/notifications_catchment/{id}/` | DELETE | `DELETE /api/ik/sla/warnings/{id}/` 🟢 | |

---

## 📊 Resumen por Tipo

| Tipo de Endpoint | Cantidad | Estado |
|------------------|----------|--------|
| **Batch nativos** (`/api/ik/batch/*`) | 3 | ✅ Ya existen, no tocar |
| **Login** (`/api/ik/login/`) | 1 | ✅ Ya existe |
| **Mis puntos** (`/api/ik/my_points/`) | 1 | ✅ Ya existe |
| **Necesitan crear bajo `ik/`** | ~45 | 🔵 Propuestas arriba |
| **Frontend procesa demasiado** | 5 | 🔴 Ver abajo |

---

## 🔴 Procesamientos que DEBERÍA hacer el Backend

### 1. **MyWell: Telemetría paginada**
- **Hoy:** Frontend hace 3-5 requests a `interaction_detail_json/?page=1,2,3...` y luego filtra/procesa todo.
- **Debería ser:** `GET /api/ik/points/{id}/telemetry/` → Backend pagina y devuelve todo en una sola respuesta con `count`, `next`, `previous`.

### 2. **MyWell: Última medición**
- **Hoy:** `GET interaction_detail_json/?catchment_point={id}&hour=0` y frontend filtra el último registro.
- **Debería ser:** `GET /api/ik/points/{id}/telemetry/latest/` → Backend devuelve SOLO la última medición.

### 3. **Smart Análisis: Agregaciones mensuales**
- **Hoy:** Frontend recibe todos los registros diarios y calcula promedios/máximos/mínimos.
- **Debería ser:** `GET /api/ik/points/{id}/data/month/{yyyy}/{mm}/` → Backend devuelve ya agregado por día con stats.

### 4. **HeaderNav: Count de alertas**
- **Hoy:** `GET notifications_catchment/?is_active=true&type_notification=ALERT` (trae array completo solo para contar).
- **Debería ser:** `GET /api/ik/points/{id}/alerts/active/count/` → Backend devuelve `{ count: 5 }`.

### 5. **Admin Dashboard: Múltiples endpoints de sistema**
- **Hoy:** Frontend hace 4-5 requests paralelos (`system_status`, `resources_status`, `points_status`, etc.).
- **Debería ser:** `GET /api/ik/admin/dashboard/` → Backend devuelve todo consolidado en una sola respuesta.

---

## 🗂️ Estructura propuesta de rutas `ik/`

```
/api/ik/
├── auth/
│   └── login/                    (ya existe)
├── profile/
│   └── me/                       GET, PATCH  (reemplaza /users/{username}/)
├── points/
│   ├── mine/                     GET         (ya existe: my_points)
│   ├── all/                      GET         (admin)
│   ├── batch/
│   │   ├── telemetry/            POST        (ya existe)
│   │   ├── stats/                POST        (ya existe)
│   │   └── summary/              POST        (ya existe)
│   └── {id}/
│       ├── detail/               GET
│       ├── config/               PATCH
│       ├── telemetry/
│       │   ├── latest/           GET
│       │   └── range/            GET
│       ├── dga/
│       │   ├── data/             GET
│       │   └── config/           PATCH
│       ├── data/
│       │   ├── day/{from}/{to}/  GET
│       │   └── month/{yyyy}/{mm}/ GET
│       ├── alerts/
│       │   ├── active/count/     GET
│       │   └── active/           GET
│       ├── support/tickets/      GET, POST
│       ├── documents/            GET, POST
│       ├── export/
│       │   ├── data/xlsx/        GET
│       │   ├── dga/{from}/{to}/xlsx/ GET
│       │   └── sma/xlsx/         GET
│       └── sma/data/             GET
├── alerts/
│   └── {id}/
│       ├── responses/            GET, POST
│       └── toggle/               PATCH
├── support/tickets/
│   ├── {id}/
│   │   └── responses/            GET, POST
│   └── sla/
│       ├── tickets/              GET, POST
│       ├── tickets/{id}/         PATCH, DELETE
│       ├── tickets/{id}/responses/ GET, POST
│       └── warnings/             GET
├── documents/
│   └── {id}/                     DELETE
├── admin/
│   ├── system/
│   │   ├── status/               GET
│   │   ├── resources/            GET
│   │   └── map/                  GET
│   ├── points/
│   │   └── status/               GET
│   ├── dga/
│   │   └── queue/                GET, POST (clear, requeue)
│   ├── notifications/
│   │   └── summary/              GET
│   ├── clients/tree/             GET
│   └── projects/                 GET
└── telemetry/
    └── {id}/                     GET, POST, DELETE, PATCH
```

---

> **Nota:** Las rutas `ik/` propuestas son semánticas y RESTful. El backend puede implementarlas progresivamente sin romper las rutas viejas. Una vez que todas las rutas `ik/` estén listas, el frontend puede migrar endpoint por endpoint.

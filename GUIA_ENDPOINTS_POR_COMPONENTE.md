# 🎯 GUÍA DE ENDPOINTS POR COMPONENTE — SmartHydro Frontend

> **Para el equipo Backend** — Esta guía describe exactamente qué endpoint necesita cada componente del frontend para cargar sus propios datos. El objetivo es eliminar la dependencia del endpoint masivo `GET /api/users/{username}/` (get_profile) y que cada vista haga llamadas específicas y livianas.

---

## 📋 PRINCIPIOS

1. **Cada componente carga solo lo que necesita** — No más `get_profile()` con 5MB de datos
2. **Endpoints livianos por vista** — Solo los campos necesarios para esa pantalla
3. **Login optimizado** — `POST /api/ik/login/` ya retorna solo token + user + `points_summary`
4. **Lazy loading** — Los datos se cargan bajo demanda cuando el usuario navega

---

## 🏠 1. CENTRO DE CONTROL (`/`)

**Componente:** `GeneralSummary.js`
**Usuarios:** Todos (clientes normales y admin)
**¿Cuándo se carga?:** Al entrar a `/` o al cambiar de punto

### Cambio reciente (Frontend)
Se eliminó el componente "Análisis inteligente del día" (944 líneas entre hook + componente) porque repetía en texto lo que ya se veía en números/tablas. El Centro de Control ahora es un **panel limpio**: KPIs, estado de servicio, resumen de consumo, y variables en tiempo real. Sin narrativas.

### Datos necesarios:
- Consumo agregado del día (hoy vs ayer) — pre-calculado por el backend
- Estado de conexión por punto (conectado hoy / desconectado)
- Última telemetría de cada punto (para CombinedVariablesChart)
- Contadores: total puntos, activos, con GPS, con alertas
- Total histórico acumulado

### Endpoints:

#### ✅ `GET /api/ik/points_summary/` — ACTUAL (fallback)
Ya implementado. Retorna puntos con `latest_telemetry`. El frontend lo usa hoy.
**Limitación:** No tiene consumo agregado por día ni estado pre-calculado. El frontend usa `useDataStatistics` para calcularlo (costoso).

#### 🆕 `GET /api/ik/daily_summary/` — OBJETIVO (Fase 1)
Nuevo endpoint que reemplaza todo el procesamiento del frontend. Ver especificación completa en `ESPECIFICACION_DAILY_SUMMARY.md`.

**Respuesta Fase 1:**
```json
{
  "meta": { "date": "2026-05-09", "date_formatted": "Viernes 9 de Mayo, 2026" },
  "overview": { "total_points": 191, "active_points": 161, "points_with_alerts": 50, "points_with_gps": 120 },
  "consumption": { "today_m3": 2450.5, "yesterday_m3": 2380.0, "difference_percent": 2.96, "trend": "up" },
  "service_status": { "connected_today": 150, "disconnected_today": 41, "health_percent": 78 },
  "points": [ { "id": 77, "title": "P 2", "latest_telemetry": {...}, "status": {...} } ],
  "historical": { "total_accumulated_m3": 15420340 }
}
```

**Regla clave:** `consumption.today_m3` = `SUM(total_diff)` del día. **NO** usar `latest_telemetry.total`.

#### Enfoque por fases (Backend)
| Fase | Qué incluye | Tiempo estimado |
|------|-------------|-----------------|
| **Fase 1** (ahora) | Consumo global, contadores, estado por punto, latest_telemetry | < 3 segundos |
| **Fase 2** (próxima semana) | `daily_summary` por punto, caudales máximos, lista desconectados | Con caché Redis < 200ms |
| **Fase 3** (futuro) | Alerts por punto, tendencias, materialized view | Background job |

---

## 🗺️ 2. GEO SMART (`/geo`)

**Componente:** `GeoSmart.js`
**Usuarios:** Todos
**¿Cuándo se carga?:** Al navegar a `/geo`

### Datos necesarios:
- Lista de puntos con coordenadas GPS (`lat`, `lon`)
- Estado de conexión de cada punto

### Endpoints:
- ✅ **Existente:** `GET /api/catchment_point/all/` — Lista básica de puntos
- 🆕 **Opcional:** `GET /api/ik/points_summary/` — Si incluye `lat`, `lon`, `latest_telemetry`

---

## 📡 3. TELEMETRÍA (`/telemetry`)

**Componente:** `renderMainRoute()` → `MyWell.js` (SUBTERRANEO) o `Sma.js` (otros)
**Usuarios:** Todos (con punto seleccionado)
**¿Cuándo se carga?:** Al navegar a `/telemetry`

### Datos necesarios:
- Detalle completo del punto: `config_data`, `dga`, `profile_ikolu`
- Telemetría reciente (últimas 24-48h)
- Datos del día de hoy y ayer

### Endpoints:
- ✅ **Existente:** `GET /api/catchment_point/{id}/` — Detalle completo del punto
- ✅ **Existente:** `GET /api/interaction_detail_json/?catchment_point={id}&...` — Telemetría histórica
- 🆕 **Opcional:** `GET /api/catchment_point/{id}/telemetry/` — Telemetría + detalle del punto en una sola llamada

---

## 📊 4. SMART ANÁLISIS (`/analysis`)

**Componente:** `ResponsiveSmartAnalysis.js`
**Usuarios:** Todos (con punto seleccionado)

### Datos necesarios:
- Telemetría histórica del punto (filtros por fecha)
- Configuración del punto (variables disponibles)

### Endpoints:
- ✅ **Existente:** `GET /api/interaction_detail_json/?catchment_point={id}&date_time_medition__date__range=...`
- ✅ **Existente:** `GET /api/catchment_point/{id}/` — Para obtener `config_data.variables`

---

## 📋 5. DGA — MEE (`/dga`)

**Componente:** `ResponsiveDga.js`
**Usuarios:** Todos (con punto seleccionado y `dga.code_dga`)

### Datos necesarios:
- Registros DGA del punto (`send_dga=true`)
- Configuración DGA del punto

### Endpoints:
- ✅ **Existente:** `GET /api/interaction_detail_json/?catchment_point={id}&send_dga=true&...`
- ✅ **Existente:** `GET /api/catchment_point/{id}/` — Para `dga` config

---

## 📥 6. DESCARGA (`/download`)

**Componente:** `Reports.js`
**Usuarios:** Todos (con punto seleccionado)

### Datos necesarios:
- Telemetría filtrada por rango de fechas
- Exportación a Excel

### Endpoints:
- ✅ **Existente:** `GET /api/interaction_detail_override/?catchment_point={id}&...` — Sin paginación
- ✅ **Existente:** `GET /api/interaction_detail/?catchment_point={id}&...&type=xlsx` — Excel

---

## 📁 7. DOCUMENTOS (`/documents`)

**Componente:** `DocRes.js`
**Usuarios:** Todos (con punto seleccionado)

### Datos necesarios:
- Archivos asociados al punto
- Tipos de archivo disponibles

### Endpoints:
- ✅ **Existente:** `GET /api/file_catchment/?point_catchment={id}`
- ✅ **Existente:** `GET /api/type_file_catchment/`

---

## 🔔 8. ALERTAS (`/alerts`)

**Componente:** `ResponsiveAlerts.js`
**Usuarios:** Todos (con punto seleccionado)

### Datos necesarios:
- Notificaciones/alertas del punto
- Respuestas a alertas

### Endpoints:
- ✅ **Existente:** `GET /api/notifications_catchment/?point_catchment={id}&...`
- ✅ **Existente:** `GET /api/response_notifications_catchment/?notification={id}`

---

## 🎛️ 9. ADMIN DASHBOARD (`/admin`)

**Componente:** `AdminRoot.js` → `AdminOverview.js` / `AdminDashboard.js`
**Usuarios:** Solo admin/staff
**¿Cuándo se carga?:** Al navegar a `/admin` (SIEMPRE disponible, no requiere punto)

### Datos necesarios:

#### Vista Operacional:
- Estadísticas del sistema (total puntos, activos, desconectados)
- Estado de puntos por proyecto/cliente
- Métricas de telemetría
- Cola DGA
- Resumen de notificaciones

#### Vista Técnica:
- Estado de servidores (CPU, RAM, DB, Redis)
- Mapa del sistema
- Rendimiento

### Endpoints (ya existen, ya se usan correctamente):
- ✅ `GET /api/management/system_status/`
- ✅ `GET /api/management/points_status/`
- ✅ `GET /api/management/telemetry_metrics/`
- ✅ `GET /api/management/dga_queue_status/`
- ✅ `GET /api/management/notifications_summary/`
- ✅ `GET /api/management/system_map/`
- ✅ `GET /api/management/resources_status/`

---

## 👤 10. PERFIL DE USUARIO (`/profile`)

**Componente:** `UserProfile.js`
**Usuarios:** Todos

### Datos necesarios:
- Datos del usuario logueado

### Endpoints:
- ✅ **Existente:** `GET /api/users/{username}/`
- ✅ **Existente:** `PATCH /api/users/{username}/`

---

## 📚 11. DOCUMENTACIÓN (`/documentation`)

**Componente:** `Documentation.js`
**Usuarios:** Todos
**¿Datos de API?:** No, contenido estático/markdown

---

## 🔧 RESUMEN: CAMBIOS NECESARIOS EN EL BACKEND

### Endpoints que YA EXISTEN y funcionan bien:
| Endpoint | Uso |
|----------|-----|
| `POST /api/ik/login/` | Login liviano |
| `GET /api/catchment_point/all/` | Lista de puntos (para selects) |
| `GET /api/catchment_point/{id}/` | Detalle de un punto |
| `GET /api/client/with-projects/` | Árbol cliente→proyecto (admin) |
| `GET /api/management/*` | Todo el dashboard de admin |
| `GET /api/interaction_detail_json/` | Telemetría |
| `GET /api/notifications_catchment/` | Alertas |
| `GET /api/file_catchment/` | Documentos |

### Endpoints NUEVOS implementados ✅

#### 1. `GET /api/ik/points_summary/` ✅ IMPLEMENTADO
**Propósito:** Reemplazar `get_profile()` para el Centro de Control
**Retorna:** Lista de puntos del usuario con última telemetría incluida
**Respuesta real:**
```json
{
  "points": [
    {
      "id": 77,
      "title": "P 2",
      "frecuency": "60",
      "active": true,
      "project_name": "Comasa",
      "client_name": "Comasa",
      "provider": "novus",
      "is_telemetry": true,
      "config_data": { "variables": ["CAUDAL", "TOTALIZADO", "NIVEL"] },
      "dga": { "code_dga": "OB-0902-45", "type_dga": "SUBTERRANEO", "send_dga": true },
      "latest_telemetry": {
        "date_time_medition": "2026-05-09T04:00:00+00:00",
        "flow": "20.07",
        "total": "0",
        "nivel": "0.00",
        "water_table": "42.00",
        "is_error": false,
        "days_not_connection": 0
      },
      "alerts_count": 0
    }
  ],
  "total_points": 191,
  "active_points": 161,
  "points_with_alerts": 50
}
```

#### 2. `GET /api/ik/point/{id}/summary/` ✅ IMPLEMENTADO
**Propósito:** Resumen de un punto específico para Centro de Control
**Retorna:** Datos del punto + última telemetría + conteo de alertas
**Respuesta real:**
```json
{
  "id": 1,
  "title": "PC Descarga",
  "frecuency": "1",
  "active": true,
  "project_name": "SMA",
  "client_name": "Lecheria Valle Verde",
  "provider": "twin",
  "is_telemetry": true,
  "config_data": { "variables": ["CAUDAL", "TOTALIZADO"] },
  "dga": { "code_dga": "7511", "type_dga": "SUPERFICIAL", "send_dga": true },
  "latest_telemetry": {
    "date_time_medition": "2026-05-09T05:00:00+00:00",
    "flow": "10.70",
    "total": "710846",
    "nivel": "0.00",
    "water_table": "0.00",
    "is_error": false,
    "days_not_connection": 0
  },
  "alerts_count": 3
}
```

---

## 🗑️ ENDPOINTS A DEPRECAR

| Endpoint | Razón |
|----------|-------|
| `GET /api/users/{username}/` (como fuente de datos principal) | Retorna TODO masivo. Solo usar para `/profile` |
| Login con `catchment_points` completo | Ya se usa `/api/ik/login/` que retorna `points_summary` liviano |

---

## 📊 FLUJO DE DATOS IDEAL

```
LOGIN
  └── POST /api/ik/login/
      └── Retorna: token + user + points_summary (solo IDs y conteos)

USUARIO ENTRA A /
  └── Centro de Control
      └── GET /api/ik/points_summary/
          └── Retorna: puntos con última telemetría

USUARIO SELECCIONA PUNTO
  └── GET /api/catchment_point/{id}/
      └── Retorna: detalle completo del punto

USUARIO NAVEGA A /telemetry
  └── El componente ya tiene el punto en estado
  └── GET /api/interaction_detail_json/?catchment_point={id}&...
      └── Retorna: telemetría histórica

ADMIN ENTRA A /
  └── Sin punto seleccionado → muestra AdminRoot
  └── AdminRoot carga:
      ├── GET /api/management/system_status/
      ├── GET /api/management/points_status/
      └── GET /api/management/dga_queue_status/

ADMIN ENTRA A /admin
  └── Mismo que arriba, ruta independiente
```

---

## ✅ CHECKLIST PARA BACKEND

- [x] Crear `GET /api/ik/points_summary/` — ✅ En producción
- [x] Crear `GET /api/ik/point/{id}/summary/` — ✅ En producción
- [ ] Asegurar que `GET /api/catchment_point/{id}/` retorne `config_data`, `dga`, `profile_ikolu`, `modules`
- [ ] Asegurar que `GET /api/catchment_point/all/?project={id}` funcione correctamente
- [ ] Documentar que `GET /api/users/{username}/` es solo para perfil de usuario, no para datos del dashboard
- [ ] Verificar que todos los endpoints de `/api/management/*` funcionen para staff/superuser

---

*Guía generada el 2026-05-09 — SmartHydro Frontend v2.0*

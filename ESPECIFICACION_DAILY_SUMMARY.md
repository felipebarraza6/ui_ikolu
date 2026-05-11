# 📋 ESPECIFICACIÓN: `GET /api/ik/daily_summary/`

> **Para el equipo Backend** — Endpoint optimizado para el Centro de Control. El frontend solo renderiza, no calcula nada.
>
> **ACTUALIZADO:** Tras revisión conjunta, se adopta enfoque por fases para no sobrecargar la BD.

---

## 🎯 PRINCIPIO DIRECTOR

> **El Centro de Control es un panel de estado, no un informe narrativo.**

Se eliminó del frontend el componente "Análisis inteligente del día" (944 líneas entre hook + componente) porque:
- Repetía en texto lo que ya se veía en números y tablas
- No aportaba valor operacional real
- Forzaba cálculos complejos en frontend que pertenecen al backend

**Resultado:** El frontend ahora solo necesita números, tablas y gráficos. Sin procesamiento de arrays.

---

## 📡 ENDPOINT

```
GET /api/ik/daily_summary/
```

**Auth:** Bearer token

**Query params (opcionales):**
- `date=YYYY-MM-DD` — Fecha específica (default: hoy en timezone del servidor)

---

## 🚀 FASE 1 — MVP (implementar ahora)

**Objetivo:** Endpoint funcional, ligero, sin caché. Responde en < 3 segundos.

**Qué calcula el backend:**
- Un solo agregado de consumo (suma de `total_diff` del día, global, no por punto)
- Estado de conexión por punto (usa `latest_telemetry.days_not_connection === 0`)
- Contadores simples (total, activos, con GPS, con alertas)

**Qué NO incluye todavía:**
- `daily_summary` por punto (el más costoso: requiere agregar por punto × 2 días)
- `flow_analysis` (requiere MAX() por punto)
- `historical` acumulado (está casi gratis, se puede incluir si es trivial)

### Respuesta Fase 1

```json
{
  "meta": {
    "date": "2026-05-09",
    "date_formatted": "Viernes 9 de Mayo, 2026",
    "timezone": "America/Santiago"
  },

  "overview": {
    "total_points": 191,
    "active_points": 161,
    "points_with_alerts": 50,
    "points_with_gps": 120
  },

  "consumption": {
    "today_m3": 2450.5,
    "yesterday_m3": 2380.0,
    "difference_m3": 70.5,
    "difference_percent": 2.96,
    "trend": "up",
    "date_label_today": "Hoy (9 May)",
    "date_label_yesterday": "Ayer (8 May)"
  },

  "service_status": {
    "connected_today": 150,
    "disconnected_today": 41,
    "without_telemetry": 10,
    "health_percent": 78,
    "health_label": "Advertencia",
    "health_color": "#faad14"
  },

  "points": [
    {
      "id": 77,
      "title": "P 2",
      "project_name": "Comasa",
      "client_name": "Comasa",
      "active": true,
      "is_telemetry": true,
      "has_gps": true,
      "provider": "novus",

      "dga": {
        "code_dga": "OB-0902-45",
        "type_dga": "SUBTERRANEO",
        "send_dga": true,
        "flow_granted_lps": 50.0
      },

      "config_data": {
        "variables": ["CAUDAL", "TOTALIZADO", "NIVEL"]
      },

      "latest_telemetry": {
        "date_time_medition": "2026-05-09T05:00:00+00:00",
        "date_formatted": "09/05 05:00",
        "flow_lps": 20.07,
        "total_m3": 452160,
        "nivel_m": 28.30,
        "water_table_m": 47.70,
        "is_error": false,
        "days_not_connection": 0
      },

      "alerts": {
        "count": 0,
        "active": []
      },

      "status": {
        "is_connected_today": true,
        "label": "OK",
        "color": "success",
        "description": "Conectado y enviando datos"
      }
    }
  ],

  "historical": {
    "total_accumulated_m3": 15420340,
    "total_accumulated_formatted": "15.420.340 m³"
  }
}
```

### Campos Fase 1 — detalle

| Campo | Tipo | Origen / Cálculo |
|-------|------|------------------|
| `meta.date` | string | Fecha consultada (o hoy) |
| `meta.date_formatted` | string | `"Viernes 9 de Mayo, 2026"` |
| `overview.total_points` | int | `profiles.count()` filtrado por permisos de usuario |
| `overview.active_points` | int | `profiles.filter(active=True).count()` |
| `overview.points_with_alerts` | int | Contar alerts activas del usuario |
| `overview.points_with_gps` | int | `profiles.exclude(lat__in=["","0"], lon__in=["","0"]).count()` |
| `consumption.today_m3` | float | `SUM(total_diff)` de todos los registros del día para todos los puntos del usuario. **NO** usar `latest_telemetry.total` |
| `consumption.yesterday_m3` | float | `SUM(total_diff)` del día anterior |
| `consumption.difference_*` | float | Calculado a partir de hoy/ayer |
| `consumption.trend` | string | `"up"` / `"down"` / `"same"` |
| `service_status.connected_today` | int | Puntos donde `latest_telemetry.days_not_connection === 0` |
| `service_status.disconnected_today` | int | Puntos con telemetría donde `days_not_connection > 0` |
| `service_status.without_telemetry` | int | Puntos donde `is_telemetry === false` |
| `service_status.health_percent` | int | `(connected / (total - without_telemetry)) * 100` |
| `points[].status.is_connected_today` | bool | `latest_telemetry.days_not_connection === 0` |
| `points[].status.label/color` | string | Pre-calculado del backend |

---

## 🔮 FASE 2 — Enriquecido (próxima semana)

**Optimización:** Precalcular con cronjob cada hora, guardar en Redis. Endpoint lee del caché en <200ms.

**Agrega:**
- `points[].daily_summary`:
  - `consumption_today_m3` (por punto)
  - `consumption_yesterday_m3` (por punto)
  - `records_count_today`
  - `max_flow_lps` + `max_flow_time`
- `service_status.disconnected_points[]` — lista con nombre, días offline, última fecha
- `flow_analysis.highest_flows_today[]` — top caudales del día
- `flow_analysis.exceeded_flows[]` — solo los que superaron caudal DGA

---

## 🔮 FASE 3 — Completo (futuro)

**Optimización:** Materialized view en PostgreSQL o background job.

**Agrega:**
- `alerts_summary.by_point[]`
- Histórico de tendencias (7 días, 30 días)
- Predicciones simples

---

## ⚠️ REGLAS CLAVE

### 1. Consumo del día
```python
# CORRECTO: sumar total_diff del día
today_records = InteractionDetail.objects.filter(
    catchment_point__in=user_points,
    date_time_medition__date=date
)
consumption_today = today_records.aggregate(total=Sum('total_diff'))['total'] or 0
```

**INCORRECTO:** usar `latest_telemetry.total` — eso es el acumulado del contador, no el consumo del día.

### 2. No repetir puntos
Cada punto aparece **una sola vez** en `points[]`.

### 3. Fechas formateadas
Todas las fechas visibles vienen listas del backend:
- `"09/05/2026 05:00"` — última conexión
- `"Hoy (9 May)"` — etiqueta consumo
- `"Viernes 9 de Mayo, 2026"` — header

---

## 🗺️ MAPEO FRONTEND (Fase 1)

```
Centro de Control (/)
├── Header: meta.date_formatted
├── KPIs:
│   ├── Total Puntos → overview.total_points
│   ├── Con GPS → overview.points_with_gps
│   ├── Consumo Hoy → consumption.today_m3 + date_label_today
│   └── Histórico Total → historical.total_accumulated_m3
├── Estado del Servicio (Col 8):
│   ├── Salud % → service_status.health_percent
│   ├── Activos hoy → service_status.connected_today
│   ├── Sin datos hoy → service_status.disconnected_today
│   └── Lista puntos → points[].status (badge + label pre-calculado)
├── Resumen de Consumo (Col 16):
│   ├── Hoy / Diferencia / Ayer → consumption.*
│   └── Tabla por punto → (Fase 2: points[].daily_summary)
└── Detalle por punto en tiempo real:
    └── CombinedVariablesChart → points[].latest_telemetry
```

> **Nota:** No hay más sección "Análisis inteligente del día". Fue eliminada del frontend.

---

## ✅ CHECKLIST BACKEND — FASE 1

- [ ] Crear `GET /api/ik/daily_summary/`
- [ ] Parámetro `?date=YYYY-MM-DD` (default: hoy)
- [ ] `consumption.today_m3` = `SUM(total_diff)` del día, **NO** `latest_telemetry.total`
- [ ] `consumption.yesterday_m3` = `SUM(total_diff)` del día anterior
- [ ] Formatear fechas en español
- [ ] Calcular `health_percent` correctamente
- [ ] No repetir puntos
- [ ] Responder en < 3 segundos

---

*Especificación v2.0 — Enfoque pragmático por fases*

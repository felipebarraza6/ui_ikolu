# Guía de Endpoints SLA — Recomendaciones para el Backend

> Documento técnico para el equipo backend. Define qué endpoints faltan, cuáles mejorar y la estructura de datos ideal para un frontend SLA moderno y completo.

---

## 📋 Endpoints ACTUALES (ya existen)

| Método | Endpoint | Uso actual |
|--------|----------|------------|
| `GET` | `/api/notifications_catchment/?type_notification=SUPPORT` | Listar tickets |
| `GET` | `/api/notifications_catchment/{id}/` | Detalle de ticket |
| `POST` | `/api/response_notifications_catchment/` | Crear comentario/correo |
| `PATCH` | `/api/notifications_catchment/{id}/` | Actualizar estado del ticket |
| `DELETE` | `/api/notifications_catchment/{id}/` | Eliminar ticket |
| `GET` | `/api/notifications_catchment/?type_notification=WARNING` | Listar warnings |
| `POST` | `/api/chat-bot/` | Webhook Google Chat (solo integración externa) |

---

## 🚨 Endpoints CRÍTICOS faltantes

### 1. Métricas y KPIs agregados
**Por qué:** El frontend calcula métricas en memoria con `useMemo`. Con muchos tickets esto se vuelve lento y no escala.

```
GET /api/sla/metrics/
```

**Response esperado:**
```json
{
  "total": 42,
  "activos": 18,
  "resueltos": 24,
  "tasa_resolucion": 57,
  "tiempo_promedio_respuesta_horas": 5.3,
  "tiempo_promedio_resolucion_horas": 28.7,
  "por_vencer": 3,
  "excedidos": 1,
  "promedio_sla_cumplimiento_pct": 94.2,
  "internos": 12,
  "clientes": 30,
  "tickets_dga": 5,
  "tickets_sma": 3,
  "clientes_atendidos": 8,
  "tiempo_solucion_interno_horas": 22.4,
  "tiempo_solucion_externo_horas": 35.1,
  "desarrollo_software": 6,
  "desarrollo_hardware": 4
}
```

**Filtros opcionales:** `?project_id=`, `?client_id=`, `?date_from=`, `?date_to=`

---

### 2. Historial de actividad de un ticket
**Por qué:** Ahora el frontend arma el timeline desde `ticket.responses`. El backend debería entregar esto ya ordenado y enriquecido.

```
GET /api/notifications_catchment/{id}/activity/
```

**Response esperado:**
```json
{
  "ticket_id": 145,
  "total_entries": 8,
  "entries": [
    {
      "id": 1,
      "type": "created",
      "message": "Ticket creado",
      "user": { "id": 5, "username": "cliente1" },
      "created_at": "2026-05-10T14:30:00Z",
      "metadata": {}
    },
    {
      "id": 2,
      "type": "status_changed",
      "message": "Estado cambiado a 'En Revisión'",
      "user": { "id": 2, "username": "soporte.ikolu" },
      "created_at": "2026-05-10T16:00:00Z",
      "metadata": { "from": "nuevo", "to": "revision" }
    },
    {
      "id": 3,
      "type": "comment",
      "message": "Hemos recibido su ticket...",
      "user": { "id": 2, "username": "soporte.ikolu" },
      "created_at": "2026-05-10T16:05:00Z",
      "metadata": { "is_email": false, "attachments": [] }
    }
  ]
}
```

**Tipos de entrada:** `created`, `status_changed`, `comment`, `email_sent`, `note_added`, `assigned`, `resolved`

---

### 3. Tareas/Notas internas por ticket
**Por qué:** El frontend ya tiene `SlaTaskNotes` con localStorage como fallback. El backend debe persistir esto.

```
GET    /api/notifications_catchment/{id}/tasks/
POST   /api/notifications_catchment/{id}/tasks/
PATCH  /api/notifications_catchment/{id}/tasks/{task_id}/
DELETE /api/notifications_catchment/{id}/tasks/{task_id}/
```

**Estructura de tarea:**
```json
{
  "id": 12,
  "ticket": 145,
  "text": "Revisar conectividad del sensor",
  "priority": "high",
  "completed": false,
  "created_by": { "id": 2, "username": "soporte.ikolu" },
  "created_at": "2026-05-11T09:00:00Z",
  "updated_at": "2026-05-11T09:00:00Z"
}
```

**Prioridades:** `low`, `medium`, `high`

---

### 4. Asignación de tickets a usuarios
**Por qué:** Un sistema SLA real necesita saber quién es el responsable.

```
PATCH /api/notifications_catchment/{id}/assign/
```

**Body:**
```json
{ "assigned_to": 3 }
```

**Response:** Ticket con campo `assigned_to` poblado.

**Campo a agregar en el modelo ticket:**
```json
"assigned_to": {
  "id": 3,
  "username": "soporte.ikolu",
  "email": "soporte@ikolu.cl",
  "first_name": "Soporte",
  "last_name": "Ikolu"
}
```

---

### 5. Listado de tickets con filtros avanzados (server-side)
**Por qué:** El frontend filtra en memoria. Con miles de tickets esto no escala.

```
GET /api/notifications_catchment/?type_notification=SUPPORT
```

**Query params a agregar:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `status` | string | `nuevo`, `revision`, `desarrollo`, `resuelto` |
| `project` | int | ID del proyecto |
| `client` | int | ID del cliente |
| `assigned_to` | int | ID del usuario asignado |
| `priority` | string | `low`, `medium`, `high`, `critical` |
| `category` | string | `back` (Software), `hard` (Hardware) |
| `source` | string | `internal` (staff), `client` (formulario público) |
| `status_dga` | string | `PENDING`, `SENT`, `APPROVED`, `REJECTED` |
| `status_sma` | string | `PENDING`, `SENT`, `APPROVED`, `REJECTED` |
| `search` | string | Búsqueda en título, mensaje, punto |
| `date_from` | date | YYYY-MM-DD |
| `date_to` | date | YYYY-MM-DD |
| `sla_breached` | bool | Solo tickets que excedieron SLA |
| `ordering` | string | `created_at`, `-created_at`, `modified`, `-modified` |

**Response paginado:**
```json
{
  "count": 150,
  "next": "?page=2",
  "previous": null,
  "results": [ /* tickets */ ]
}
```

---

### 6. Dashboard/Resumen para un usuario
**Por qué:** Mostrar al usuario su carga de trabajo personal.

```
GET /api/sla/my-dashboard/
```

**Response:**
```json
{
  "mis_tickets_asignados": 8,
  "mis_tickets_vencidos": 1,
  "mis_tickets_por_vencer_24h": 2,
  "tickets_sin_asignar": 5,
  "ultima_actividad": [
    { "ticket_id": 145, "action": "comentaste", "time": "2026-05-12T10:00:00Z" }
  ]
}
```

---

## ⚡ Endpoints de MEJORA (sobre los existentes)

### 7. Enriquecer el detalle de ticket
**Actual:** `responses` viene como array plano.
**Mejora:** Agregar metadatos útiles.

```json
{
  "id": 145,
  "title": "...",
  "current_status": "desarrollo",
  "sla_hours_elapsed": 36,
  "sla_hours_remaining": 12,
  "sla_breached": false,
  "sla_urgent": true,
  "assigned_to": { "id": 2, "username": "soporte.ikolu" },
  "response_count": 4,
  "comment_count": 3,
  "email_count": 1,
  "task_count": 5,
  "task_completed_count": 2,
  "last_activity_at": "2026-05-12T10:00:00Z"
}
```

---

### 8. Adjuntos en comentarios
**Por qué:** El frontend ya tiene UI para adjuntar archivos, pero no hay endpoint que los reciba.

```
POST /api/response_notifications_catchment/{id}/attachments/
```

**Body:** `multipart/form-data` con el archivo.

**Response:**
```json
{
  "id": 99,
  "response": 45,
  "file": "https://.../adjunto.pdf",
  "filename": "adjunto.pdf",
  "size_bytes": 245000,
  "uploaded_at": "2026-05-12T10:00:00Z"
}
```

---

### 9. Etiquetas/Tags de tickets
**Por qué:** Permitir categorizar tickets más allá de la variable.

```
GET    /api/notifications_catchment/tags/
POST   /api/notifications_catchment/{id}/tags/
DELETE /api/notifications_catchment/{id}/tags/{tag_id}/
```

**Estructura:**
```json
{
  "id": 3,
  "name": "hardware",
  "color": "#EF4444"
}
```

---

## 🤖 Endpoints de IA/Chatbot (nuevos)

### 10. Asistente/Chatbot interno
**Por qué:** El `/api/chat-bot/` actual es solo para Google Chat. Se necesita uno para el frontend.

```
POST /api/ai/ask/
```

**Body:**
```json
{
  "question": "¿Cuántos tickets tengo pendientes de resolver?",
  "context": "sla_dashboard",
  "ticket_id": null
}
```

**Response:**
```json
{
  "answer": "Tienes 8 tickets pendientes. 2 de ellos están por vencer en las próximas 24 horas.",
  "sources": [ /* referencias a datos usados */ ],
  "suggested_actions": [
    { "label": "Ver tickets urgentes", "action": "filter", "params": { "status": "nuevo" } }
  ]
}
```

**Contextos posibles:** `sla_dashboard`, `ticket_detail`, `general`

---

### 11. Resumen automático de ticket
**Por qué:** Para tickets largos, generar un resumen con IA.

```
GET /api/ai/ticket/{id}/summary/
```

**Response:**
```json
{
  "summary": "Ticket sobre caudal irregular en Pozo A. El sensor muestra valores inconsistentes desde el 10/05. Se requiere revisión de conectividad.",
  "key_points": [
    "Caudal irregular detectado",
    "Sensor desconectado desde las 14:00",
    "Punto: Pozo A (Proyecto Norte)"
  ],
  "suggested_next_action": "Revisar conectividad del sensor y telemetría del punto."
}
```

---

### 12. Clasificación automática de prioridad
**Por qué:** Clasificar automáticamente tickets nuevos según contenido.

```
POST /api/ai/classify/
```

**Body:**
```json
{ "title": "Caudal irregular detectado", "message": "El sensor no envía datos desde ayer" }
```

**Response:**
```json
{
  "priority": "high",
  "category": "hardware",
  "confidence": 0.92,
  "suggested_assignee": 3
}
```

---

## 🔔 WebSockets / Real-time (opcional pero recomendado)

### 13. Notificaciones en tiempo real
**Por qué:** Cuando alguien más mueve un ticket o agrega un comentario, el Kanban debería actualizarse solo.

```
WS /ws/sla/
```

**Eventos:**
- `ticket.created`
- `ticket.updated`
- `ticket.status_changed`
- `ticket.commented`
- `ticket.assigned`

**Payload:**
```json
{
  "type": "ticket.status_changed",
  "ticket_id": 145,
  "data": { "old_status": "nuevo", "new_status": "revision", "by": "soporte.ikolu" },
  "timestamp": "2026-05-12T10:00:00Z"
}
```

---

## 📁 Modelo de datos recomendado (simplificado)

```
NotificationCatchment (ticket existente)
├── id
├── title
├── message
├── type_notification: SUPPORT | WARNING | ALERT
├── type_variable: CAUDAL | NIVEL | TOTALIZADO | ...
├── status: nuevo | revision | desarrollo | resuelto
├── priority: low | medium | high | critical
├── category: back (Software) | hard (Hardware)
├── source: internal | client
├── assigned_to → User (nullable)
├── status_dga: PENDING | SENT | APPROVED | REJECTED
├── status_sma: PENDING | SENT | APPROVED | REJECTED
├── point_catchment → CatchmentPoint
├── project → Project (nullable, denormalizado o relación)
├── client → Client (nullable, denormalizado o relación)
├── created_by → User
├── created_at
├── modified_at
├── is_read, is_wait, is_active, is_finish
├── sla_deadline_at (calculado: created_at + 48h)
├── sla_breached_at (nullable)
├── tags (m2m)
├── responses (o2m)
└── tasks (o2m)

ResponseNotification
├── id
├── notification → NotificationCatchment
├── response (texto)
├── is_email: bool
├── created_by → User
├── created_at
└── attachments (o2m)

TicketAttachment
├── id
├── response → ResponseNotification
├── file (FileField)
├── filename
├── size_bytes
└── uploaded_at

TicketTask (nuevo)
├── id
├── ticket → NotificationCatchment
├── text
├── priority: low | medium | high
├── completed: bool
├── created_by → User
├── created_at
└── updated_at

TicketTag (nuevo)
├── id
├── name
├── color
└── tickets (m2m)

SlaActivityLog (nuevo, para auditoría)
├── id
├── ticket → NotificationCatchment
├── action: created | status_changed | commented | assigned | resolved
├── user → User
├── description
├── metadata (JSON)
└── created_at
```

---

## 🎯 Prioridad de implementación

| Prioridad | Endpoint | Impacto |
|-----------|----------|---------|
| 🔴 **P0** | Métricas agregadas (`/api/sla/metrics/`) | KPIs en tiempo real, escalable |
| 🔴 **P0** | Filtros server-side en listado de tickets | Escalabilidad con muchos tickets |
| 🟡 **P1** | Tareas/Notas por ticket | Feature ya en frontend (localStorage) |
| 🟡 **P1** | Historial de actividad (`/activity/`) | Mejor UX en timeline |
| 🟡 **P1** | Asignación de tickets | Flujo de trabajo real |
| 🟢 **P2** | Adjuntos en comentarios | Completar feature existente |
| 🟢 **P2** | Tags/Etiquetas | Organización avanzada |
| 🟢 **P2** | Enriquecer detalle de ticket | Menor carga de red |
| 🔵 **P3** | Asistente IA (`/api/ai/ask/`) | Diferenciador competitivo |
| 🔵 **P3** | WebSockets | Real-time, colaboración |
| 🔵 **P3** | Clasificación automática | Automatización |

---

## 📝 Notas para el backend

1. **Soft delete:** No eliminar tickets físicamente. Agregar `is_deleted` + `deleted_at`.
2. **Audit logging:** Todo cambio de estado, asignación y comentario debe quedar en `SlaActivityLog`.
3. **Índices:** Crear índices en `type_notification`, `status`, `assigned_to`, `created_at`, `project`, `client`, `category`, `source`, `status_dga`, `status_sma`.
4. **SLA deadline:** Calcular `sla_deadline_at = created_at + 48 hours` al crear el ticket.
5. **Triggers:** Automáticamente setear `sla_breached_at` cuando `now > sla_deadline_at` y el ticket no esté resuelto.
6. **CORS:** Si se implementa WebSocket, verificar configuración CORS para el dominio del frontend.

---

> **Autor:** Generado para el equipo Backend de Ikolu / SmartHydro  
> **Fecha:** 2026-05-12  
> **Versión:** 1.0

# Plan: Modern Support Ticket Dashboard

## Metadata
- **Fecha creacion:** 2026-06-03
- **Solicitado por:** usuario
- **Estado:** pendiente
- **Agente planner:** @planner
- **Agente coder:** @frontend-coder

---

## 1. Contexto y Objetivo

Reemplazar el modulo legacy de soporte (`src/components/support/`) con una feature moderna que use los endpoints nativos de tickets de la API SmartHydro (`/api/ik/tickets/`).

### Problemas del sistema legacy actual
- Usa API legacy `notifications_catchment/` (tickets como notificaciones tipo `SUPPORT`)
- Depende de `AppContext` y `selected_profile.id` — solo funciona con un punto seleccionado
- Inline styles hardcodeados (colores `#1F3461`, `#FF6B35`)
- Estado local con `useState` + flag `update` manual
- No usa `useResponsive`, detecta mobile con `window.innerWidth`
- No tiene skeletons ni manejo de errores robusto

### Objetivo
Crear `src/features/support/` con la misma calidad y patrones que `src/features/control-center/`:
- Endpoints API modernos: `/api/ik/tickets/*`
- Zustand store para UI state
- Hook custom para data fetching
- Smart Components (`SmartCard`, `SmartBadge`, `SmartKPICard`, `SmartSkeleton`)
- Responsive con `useResponsive`
- Rutas anidadas: `/support` → tabs (activos, historial)
- Admin view: tickets de todos los puntos (no solo el seleccionado)

---

## 2. Analisis de Codigo Existente

### 2.1 Archivos relevantes encontrados
- `src/components/support/Dash.js` — Dashboard legacy con KPIs y tabs
- `src/components/support/FormSupport.js` — Formulario legacy
- `src/components/support/TableSupport.js` — Tabla historial legacy
- `src/components/support/ActiveTickets.js` — Tabla activos legacy
- `src/features/control-center/` — Patron moderno de referencia
- `src/shared/ui/SmartCard.jsx`, `SmartBadge.jsx`, `SmartKPICard.jsx`, `SmartSkeleton/` — UI kit
- `src/hooks/useResponsive.js` — Breakpoints mobile/tablet/desktop
- `src/api/orchestrator.js` — Orquestador centralizado
- `src/api/sh/endpoints.js` — Endpoints actuales (faltan ik/tickets)

### 2.2 Componentes/Servicios reutilizables
- `SmartCard` / `SmartKPICard` — KPIs del dashboard
- `SmartBadge` — Estados de ticket (abierto, en progreso, cerrado)
- `SmartButton` / `SmartIconButton` — Acciones
- `SmartSkeleton.SkeletonTable` / `SkeletonKPI` — Estados de carga
- `useResponsive` — Responsive design
- `useAuth` / `useData` — Contextos especializados (NO AppContext)

### 2.3 Dependencias y restricciones
- **Endpoints API a integrar** (documentados en AGENTS.md):
  - `GET /api/ik/tickets/` — Listar tickets. Filtros: `status`, `type`, `point_catchment`
  - `POST /api/ik/tickets/` — Crear ticket. Body: `title`, `message`, `point_catchment` (opc), `emails` (opc)
  - `GET /api/ik/tickets/<id>/` — Detalle
  - `PATCH /api/ik/tickets/<id>/` — Actualizar
  - `POST /api/ik/tickets/<id>/comments/` — Agregar comentario
  - `POST /api/ik/tickets/<id>/status/` — Cambiar estado
  - `POST /api/ik/tickets/<id>/assign/` — Asignar
  - `GET /api/ik/tickets/stats/` — Estadisticas
- **Rutas**: Actualizar `src/containers/Home.js` — reemplazar `<Dash />` en `/support` y `/sys-support`
- **AuthContext**: El usuario autenticado determina si puede ver todos los tickets (admin) o solo los de sus puntos
- **DataContext**: `points_list` para el select de filtro por punto
- **NO usar AppContext**: Usar `useAuth()` y `useData()`

---

## 3. Especificacion Tecnica

### 3.1 Estructura de archivos a crear/modificar
```
src/
├── features/
│   └── support/
│       ├── SupportDashboard.js      # Container principal (KPIs + tabs + drawers)
│       ├── SupportLayout.js         # Layout con tabs (Activos / Historial / Nuevo)
│       ├── components/
│       │   ├── TicketStatsCards.js  # 4 KPIs: Activos, Total, Cerrados, Espera
│       │   ├── TicketTable.js       # Tabla de tickets con acciones
│       │   ├── TicketFilters.js     # Filtros: estado, tipo, punto, fecha
│       │   ├── TicketFormDrawer.js  # Drawer creacion/ediction
│       │   ├── TicketDetailDrawer.js# Drawer detalle + comentarios
│       │   └── TicketCommentThread.js# Lista de comentarios + form
│       └── stores/
│           └── supportStore.js      # Zustand store
├── api/
│   └── sh/
│       └── endpoints.js             # MODIFICAR: agregar endpoints ik/tickets
├── hooks/
│   └── useSupportTickets.js         # Hook de data fetching
└── containers/
    └── Home.js                      # MODIFICAR: actualizar rutas /support y /sys-support
```

### 3.2 Contratos de API
| Endpoint | Metodo | Uso |
|----------|--------|-----|
| `/api/ik/tickets/` | GET | Listar con filtros y paginacion |
| `/api/ik/tickets/` | POST | Crear ticket |
| `/api/ik/tickets/<id>/` | GET | Detalle |
| `/api/ik/tickets/<id>/` | PATCH | Actualizar titulo/mensaje |
| `/api/ik/tickets/<id>/comments/` | POST | Agregar comentario |
| `/api/ik/tickets/<id>/status/` | POST | Cambiar estado (body: `{status}`) |
| `/api/ik/tickets/<id>/assign/` | POST | Asignar usuario |
| `/api/ik/tickets/stats/` | GET | KPIs del dashboard |
| `/api/ik/my_points/` | GET | Lista liviana de puntos para filtro |

### 3.3 Estados y flujo de datos
- **Zustand store** (`supportStore`):
  - `tickets[]` — lista de tickets
  - `stats` — { total, active, closed, waiting }
  - `filters` — { status, type, point_catchment, date_from, date_to }
  - `pagination` — { offset, limit, total }
  - `selectedTicket` — ticket del drawer de detalle
  - `drawers` — { createOpen, detailOpen, editOpen }
  - `loading`, `error`
  - Actions: `fetchTickets()`, `fetchStats()`, `createTicket()`, `updateStatus()`, `addComment()`, `setFilters()`, `selectTicket()`
- **Hook** (`useSupportTickets`):
  - Encapsula fetch inicial, polling opcional cada 60s, transformacion de datos
  - Expone: `tickets`, `stats`, `loading`, `error`, `filters`, `setFilters`, `refresh`

### 3.4 UI/UX
- **Layout**: Tabs "Activos" | "Historial" | "Nuevo Ticket" (solo tab content cambia)
- **KPIs**: 4 `SmartKPICard` en fila (2x2 mobile, 4 cols desktop)
  - Activos: color `--color-warning`
  - Total: color `--ocean-primary`
  - Cerrados: color `--color-success`
  - En espera: color `--color-info`
- **Tabla**: Ant Design Table con:
  - Columnas: ID, Titulo, Punto, Estado, Fecha, Acciones
  - `SmartBadge` para estado: `abierto` (warning), `en_progreso` (info), `cerrado` (success)
  - Paginacion server-side
  - Acciones: Ver detalle, Cambiar estado, Asignar
- **Filtros**: Fila sobre la tabla con:
  - Select estado (abierto/en_progreso/cerrado/todos)
  - Select punto (usar `/api/ik/my_points/`)
  - DatePicker rango
  - Boton "Limpiar"
- **Drawers**:
  - Crear: ancho 480px desktop, full mobile. Form: titulo, tipo, mensaje, punto (opc)
  - Detalle: ancho 560px desktop, full mobile. Header con estado + acciones. Body: info + comentarios thread.
- **Responsive**: `useResponsive` para breakpoints, drawer widths, table scroll
- **Skeletons**: `SkeletonKPI` para KPIs, `SkeletonTable` para tabla
- **Error**: `SmartCard` con estado error y boton reintentar

---

## 4. Tareas de Implementacion

### T1: Agregar endpoints de tickets en la capa API
- **Archivo(s):** `src/api/sh/endpoints.js`
- **Accion:** modificar
- **Prioridad:** critica
- **Dependencias:** ninguna
- **Detalle:**
  Agregar funciones que usen el orchestrator para los endpoints `/api/ik/tickets/*`.
  ```javascript
  const getTickets = (params = {}) => orchestrator.get('/api/ik/tickets/', { params });
  const getTicket = (id) => orchestrator.get(`/api/ik/tickets/${id}/`);
  const createTicket = (data) => orchestrator.post('/api/ik/tickets/', data);
  const updateTicket = (id, data) => orchestrator.patch(`/api/ik/tickets/${id}/`, data);
  const addComment = (id, data) => orchestrator.post(`/api/ik/tickets/${id}/comments/`, data);
  const changeStatus = (id, status) => orchestrator.post(`/api/ik/tickets/${id}/status/`, { status });
  const assignTicket = (id, userId) => orchestrator.post(`/api/ik/tickets/${id}/assign/`, { user_id: userId });
  const getTicketStats = () => orchestrator.get('/api/ik/tickets/stats/');
  const getMyPoints = () => orchestrator.get('/api/ik/my_points/');
  ```
  Exportarlas agrupadas en un objeto `tickets`.
- **Criterios de aceptacion:**
  - [ ] Todas las funciones usan orchestrator (NO axios directo)
  - [ ] Manejo de errores basico (el orchestrator ya lo hace)
  - [ ] Exportadas correctamente

### T2: Crear Zustand store para soporte
- **Archivo(s):** `src/features/support/stores/supportStore.js`
- **Accion:** crear
- **Prioridad:** critica
- **Dependencias:** T1
- **Detalle:**
  Crear store con Zustand. Estado inicial:
  ```javascript
  {
    tickets: [],
    stats: { total: 0, active: 0, closed: 0, waiting: 0 },
    filters: { status: '', point_catchment: '', date_from: null, date_to: null },
    pagination: { offset: 0, limit: 10, total: 0 },
    selectedTicket: null,
    drawers: { createOpen: false, detailOpen: false, editOpen: false },
    loading: false,
    error: null,
  }
  ```
  Actions: `fetchTickets()`, `fetchStats()`, `createTicket(data)`, `updateTicket(id, data)`, `changeStatus(id, status)`, `addComment(id, text)`, `setFilters(filters)`, `setPagination(pagination)`, `selectTicket(ticket)`, `toggleDrawer(name, value)`, `resetError()`.
  Usar `immer` si es necesario para mutaciones anidadas.
- **Criterios de aceptacion:**
  - [ ] Store funcional con Zustand
  - [ ] Actions async con loading/error
  - [ ] No usa persistencia

### T3: Crear hook useSupportTickets
- **Archivo(s):** `src/hooks/useSupportTickets.js`
- **Accion:** crear
- **Prioridad:** alta
- **Dependencias:** T2
- **Detalle:**
  Hook que consume `supportStore` y expone:
  - `tickets`, `stats`, `loading`, `error`
  - `filters`, `setFilters`, `pagination`, `setPage(page)`
  - `refresh()` — fuerza refetch
  - `createTicket(data)` — wrapper con refresh automatico
  - `changeStatus(id, status)` — wrapper con refresh
  - `addComment(id, text)` — wrapper con refetch del ticket
  - Usar `useEffect` para fetch inicial cuando cambian filtros/paginacion
  - Polling opcional cada 60s (solo cuando tab activa y no hay drawer abierto)
- **Criterios de aceptacion:**
  - [ ] Hook exportado por default
  - [ ] Documentado con JSDoc
  - [ ] Polling configurable
  - [ ] Limpia timers en unmount

### T4: Crear componente TicketStatsCards
- **Archivo(s):** `src/features/support/components/TicketStatsCards.js`
- **Accion:** crear
- **Prioridad:** alta
- **Dependencias:** T3
- **Detalle:**
  Grid de 4 `SmartKPICard`:
  - Activos: icono `<AlertOutlined />`, valor `stats.active`, color `--color-warning`
  - Total: icono `<InboxOutlined />`, valor `stats.total`, color `--ocean-primary`
  - Cerrados: icono `<CheckCircleOutlined />`, valor `stats.closed`, color `--color-success`
  - En espera: icono `<ClockCircleOutlined />`, valor `stats.waiting`, color `--color-info`
  Responsive: 2x2 mobile, 4 cols desktop (usar `useResponsive().getColSpan(4)`).
  Estado loading: `SkeletonKPI`.
- **Criterios de aceptacion:**
  - [ ] Usa SmartKPICard
  - [ ] Colores de tokens/CSS variables
  - [ ] SkeletonKPI en loading
  - [ ] Responsive

### T5: Crear componente TicketFilters
- **Archivo(s):** `src/features/support/components/TicketFilters.js`
- **Accion:** crear
- **Prioridad:** media
- **Dependencias:** T3
- **Detalle:**
  Fila de filtros con:
  - Select "Estado": opciones `['', 'abierto', 'en_progreso', 'cerrado']`, placeholder "Todos"
  - Select "Punto": opciones desde `/api/ik/my_points/`, placeholder "Todos los puntos"
  - DatePicker.RangePicker para rango de fecha
  - Boton `<SmartButton variant="ghost" icon={<ReloadOutlined />}>` "Limpiar"
  Debounce de 300ms en cambios de filtro (usar `useDebounce` custom o `setTimeout`).
- **Criterios de aceptacion:**
  - [ ] Filtros funcionales conectados al hook
  - [ ] Debounce en inputs
  - [ ] Select de puntos carga de API
  - [ ] Boton limpiar resetea todo

### T6: Crear componente TicketTable
- **Archivo(s):** `src/features/support/components/TicketTable.js`
- **Accion:** crear
- **Prioridad:** alta
- **Dependencias:** T3, T5
- **Detalle:**
  Tabla Ant Design con columnas:
  - `id`: texto, ancho 80px
  - `title`: texto con tooltip si es largo
  - `point_catchment`: nombre del punto (si aplica)
  - `status`: `SmartBadge` con variantes (`warning` para abierto, `info` para en_progreso, `success` para cerrado)
  - `created_at`: fecha formateada con `dateFormatter.js`
  - `actions`: botones icono (ver detalle, cambiar estado, asignar)
  Paginacion server-side con `pagination` del store.
  Accion "Ver detalle" llama a `selectTicket(row)` + abre drawer detail.
  Accion "Cerrar" llama a `changeStatus(id, 'cerrado')`.
  Responsive: scroll horizontal en mobile (`useResponsive().getTableScroll()`).
  Loading: `SkeletonTable`.
- **Criterios de aceptacion:**
  - [ ] Columnas definidas
  - [ ] SmartBadge para estados
  - [ ] SkeletonTable en loading
  - [ ] Paginacion funcional
  - [ ] Acciones ejecutan callbacks
  - [ ] Responsive con scroll

### T7: Crear componente TicketFormDrawer
- **Archivo(s):** `src/features/support/components/TicketFormDrawer.js`
- **Accion:** crear
- **Prioridad:** media
- **Dependencias:** T3
- **Detalle:**
  Drawer Ant Design para crear/editar ticket:
  - Campos: `title` (Input, requerido), `message` (TextArea, requerido), `point_catchment` (Select, opcional, usa `/api/ik/my_points/`), `emails` (Input, opcional)
  - Validacion con Ant Design Form rules
  - Submit llama a `createTicket(data)` → cierra drawer → refresca lista
  - Boton cancelar cierra sin guardar
  - Ancho: `useResponsive().getDrawerWidth()` (480px desktop, full mobile)
- **Criterios de aceptacion:**
  - [ ] Formulario con validacion
  - [ ] Select de puntos carga de API
  - [ ] Submit exitoso cierra drawer y refresca
  - [ ] Responsive width

### T8: Crear componente TicketDetailDrawer
- **Archivo(s):** `src/features/support/components/TicketDetailDrawer.js`
- **Accion:** crear
- **Prioridad:** media
- **Dependencias:** T3, T6
- **Detalle:**
  Drawer para ver detalle completo:
  - Header: titulo, estado (SmartBadge), fecha, punto
  - Acciones: cambiar estado (Select inline), asignar (si hay admin), cerrar drawer
  - Body: mensaje/descripcion del ticket
  - Footer: `TicketCommentThread` component
  - Ancho: 560px desktop, full mobile
- **Criterios de aceptacion:**
  - [ ] Muestra info completa del ticket
  - [ ] Permite cambiar estado
  - [ ] Integra comentarios
  - [ ] Responsive width

### T9: Crear componente TicketCommentThread
- **Archivo(s):** `src/features/support/components/TicketCommentThread.js`
- **Accion:** crear
- **Prioridad:** media
- **Dependencias:** T3
- **Detalle:**
  Lista de comentarios + formulario para agregar:
  - Lista: avatar inicial, nombre usuario, fecha, texto
  - Form: TextArea + boton enviar
  - Submit llama a `addComment(ticketId, text)` → limpia textarea → muestra nuevo comentario
  - Loading state al enviar
- **Criterios de aceptacion:**
  - [ ] Lista de comentarios renderizada
  - [ ] Formulario funcional
  - [ ] Nuevo comentario aparece inmediatamente (optimistic UI o refetch)
  - [ ] Loading al enviar

### T10: Crear SupportLayout y SupportDashboard
- **Archivo(s):** `src/features/support/SupportLayout.js`, `src/features/support/SupportDashboard.js`
- **Accion:** crear
- **Prioridad:** critica
- **Dependencias:** T4, T5, T6, T7, T8, T9
- **Detalle:**
  `SupportLayout.js`: Tabs "Activos" | "Historial" | "Nuevo Ticket". Usa Ant Design Tabs.
  - Tab "Activos": `TicketStatsCards` + `TicketFilters` + `TicketTable` con filtro `status=abierto,en_progreso`
  - Tab "Historial": `TicketFilters` + `TicketTable` con filtro `status=cerrado`
  - Tab "Nuevo Ticket": `TicketFormDrawer` inline o boton que abre drawer
  `SupportDashboard.js`: Container principal. Integra `SupportLayout` + manejo de drawers (`TicketDetailDrawer`, `TicketFormDrawer`).
- **Criterios de aceptacion:**
  - [ ] Tabs funcionan y filtran correctamente
  - [ ] Layout responsive
  - [ ] Drawers se abren/cierran correctamente
  - [ ] Export default en SupportDashboard

### T11: Actualizar rutas en Home.js
- **Archivo(s):** `src/containers/Home.js`
- **Accion:** modificar
- **Prioridad:** alta
- **Dependencias:** T10
- **Detalle:**
  Reemplazar las rutas `/support` y `/sys-support` para que rendericen `<SupportDashboard />` en lugar de `<Dash />`.
  ```jsx
  import SupportDashboard from "../features/support/SupportDashboard";
  // ...
  <Route path="/support" element={<RouteLoader><SupportDashboard /></RouteLoader>} />
  <Route path="/sys-support" element={<RouteLoader><SupportDashboard /></RouteLoader>} />
  ```
  Mantener la proteccion de autenticacion.
- **Criterios de aceptacion:**
  - [ ] Rutas funcionan
  - [ ] Lazy import si el bundle es grande (opcional)
  - [ ] No se rompen otras rutas

### T12: Cleanup opcional del legacy
- **Archivo(s):** `src/components/support/*`
- **Accion:** (opcional, no borrar aun) marcar como deprecated
- **Prioridad:** baja
- **Dependencias:** T11
- **Detalle:**
  Agregar comentario JSDoc `@deprecated` en los archivos legacy de `src/components/support/`.
  NO eliminar aun para permitir rollback rapido.
- **Criterios de aceptacion:**
  - [ ] Comentarios de deprecated agregados
  - [ ] Archivos no eliminados

---

## 5. Notas para el Coder

- **NO usar AppContext**. Usar `useAuth()` para usuario y `useData()` para `points_list`.
- **NO usar axios directo**. Siempre usar el orchestrador (ya configurado en T1).
- **Colores**: usar tokens del tema ( `--color-warning`, `--ocean-primary`, etc.) o `ikoluTokens`. NUNCA hardcodear hex codes.
- **Responsive**: usar `useResponsive()` en lugar de `window.innerWidth`.
- **Estado**: Zustand para UI state, hook custom para data fetching.
- **Skeletons**: siempre mostrar skeletons mientras carga. Nunca dejar pantalla en blanco.
- **Error**: mostrar card de error con boton reintentar.
- **Polling**: implementar con cuidado. Pausar cuando drawer este abierto para evitar saltos de scroll.
- **Admin view**: si el usuario es admin (`user.is_staff` o similar), mostrar filtro "Todos los puntos" por defecto. Si no, filtrar por `point_catchment` del punto seleccionado.

---

## 6. Validacion Post-Implementacion

- [ ] Todos los archivos del plan fueron creados/modificados
- [ ] Endpoints de API usan orchestrator (verificar en `src/api/sh/endpoints.js`)
- [ ] Store Zustand funciona sin errores
- [ ] Hook `useSupportTickets` hace fetch, polling y refresh correctamente
- [ ] Tabla muestra datos reales de `/api/ik/tickets/`
- [ ] Filtros aplican debounce y refrescan tabla
- [ ] Drawer de creacion funciona y cierra al submitir
- [ ] Drawer de detalle muestra comentarios y permite agregar nuevos
- [ ] Cambio de estado actualiza la tabla
- [ ] KPIs muestran datos de `/api/ik/tickets/stats/`
- [ ] Responsive funciona (mobile + desktop)
- [ ] Dark mode funciona
- [ ] Estados de carga (skeletons) y error implementados
- [ ] No hay console.log de debug
- [ ] `yarn build` compila sin errores
- [ ] `yarn test` no rompe tests existentes
- [ ] Rutas `/support` y `/sys-support` cargan el nuevo modulo
- [ ] No se usa AppContext en codigo nuevo

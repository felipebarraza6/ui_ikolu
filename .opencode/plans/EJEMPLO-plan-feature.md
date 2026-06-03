# Plan: EJEMPLO - Modulo de Resumen de Alertas

## Metadata
- **Fecha creacion:** 2026-06-03
- **Solicitado por:** usuario
- **Estado:** completado
- **Agente planner:** @planner
- **Agente coder:** @frontend-coder

---

## 1. Contexto y Objetivo

Crear un modulo de resumen de alertas que muestre un dashboard con:
- Cantidad de alertas activas por tipo (umbral, desconexion, error)
- Ultimas 10 alertas disparadas con paginacion
- Filtros por punto de captacion y fecha
- Acciones rapidas: reconocer alerta, ver detalle, ir al punto

## 2. Analisis de Codigo Existente

### 2.1 Archivos relevantes encontrados
- `src/features/control-center/` — Feature existente similar donde referenciar patrones
- `src/shared/ui/SmartBadge.jsx` — Badge de estado reutilizable
- `src/shared/ui/SmartCard.jsx` — Card contenedora
- `src/shared/ui/SkeletonTable.jsx` — Skeleton para tabla
- `src/hooks/useControlCenter.js` — Hook de ejemplo para data fetching
- `src/api/orchestrator.js` — Orquestador centralizado
- `src/theme/index.js` — Tokens de color

### 2.2 Componentes/Servicios reutilizables
- `SmartBadge` para indicar severidad de alerta
- `SmartCard` para contenedores de seccion
- `SmartSkeleton.*` para estados de carga
- `useResponsive()` para breakpoints

### 2.3 Dependencias y restricciones
- Endpoints API necesarios:
  - `GET /api/alert_rules/` — Listar reglas (para saber que alertas existen)
  - `GET /api/alert_triggers/` — Historial de disparos con filtros
- Permisos: usuario autenticado (ya manejado por AuthContext)
- NO agrandar Home.js — crear como feature independiente

## 3. Especificacion Tecnica

### 3.1 Estructura de archivos a crear/modificar
```
src/
├── features/
│   └── alert-summary/
│       ├── AlertSummary.js          # Componente principal
│       ├── components/
│       │   ├── AlertStatsCards.js   # KPIs: total, activas, por tipo
│       │   ├── AlertTable.js        # Tabla de ultimas alertas
│       │   ├── AlertFilters.js      # Filtros por punto/fecha/tipo
│       │   └── AlertDetailDrawer.js # Drawer con detalle de alerta
│       ├── stores/
│       │   └── alertStore.js        # Zustand store local
│       └── hooks/
│           └── useAlerts.js         # Hook de fetching de alertas
├── api/
│   └── sh/
│       └── endpoints.js             # MODIFICAR: agregar endpoints de alertas
```

### 3.2 Contratos de API
- `GET /api/alert_triggers/?limit=10&offset=0&point_catchment=&alert_rule=`
  - Response: `{ count, next, previous, results: [{ id, alert_rule, triggered_at, notification_sent, is_acknowledged, ... }] }`
- `GET /api/alert_rules/?is_active=true`
  - Response: `{ count, results: [{ id, name, target_type, check_frequency_minutes, ... }] }`

### 3.3 Estados y flujo de datos
- Zustand store (`alertStore`) maneja:
  - `triggers[]` — lista de disparos
  - `rules[]` — reglas activas
  - `filters` — filtros aplicados
  - `pagination` — offset, limit, total
  - `loading`, `error`
- AuthContext proporciona token para API calls

### 3.4 UI/UX
- Layout: grid de 12 columnas (Ant Design Row/Col)
- Mobile: cards apiladas, tabla se convierte en lista de cards
- Skeletons: `SkeletonTable` para tabla, `SkeletonKPI` para stats
- Error: `SmartCard` con estado de error y boton retry
- Drawer de detalle: ancho 480px desktop, full-screen mobile

## 4. Tareas de Implementacion

### T1: Crear endpoints de alertas en la capa API
- **Archivo(s):** `src/api/sh/endpoints.js`
- **Accion:** modificar
- **Prioridad:** critica
- **Dependencias:** ninguna
- **Detalle:**
  Agregar funciones `getAlertTriggers(filters)` y `getAlertRules(params)` que usen el orchestrator.
  ```javascript
  const getAlertTriggers = (filters = {}) => orchestrator.get('/api/alert_triggers/', { params: filters });
  const getAlertRules = (params = {}) => orchestrator.get('/api/alert_rules/', { params });
  ```
- **Criterios de aceptacion:**
  - [ ] Funciones exportadas correctamente
  - [ ] Usan orchestrator, no axios directo
  - [ ] Manejan params de filtrado

### T2: Crear Zustand store para alertas
- **Archivo(s):** `src/features/alert-summary/stores/alertStore.js`
- **Accion:** crear
- **Prioridad:** critica
- **Dependencias:** T1
- **Detalle:**
  Crear store con Zustand. Estado inicial: `triggers: [], rules: [], filters: {}, pagination: { offset: 0, limit: 10, total: 0 }, loading: false, error: null`.
  Actions: `fetchTriggers()`, `fetchRules()`, `setFilters(filters)`, `acknowledgeAlert(id)`, `resetError()`.
- **Criterios de aceptacion:**
  - [ ] Store funcional con Zustand
  - [ ] Acciones async con manejo de loading/error
  - [ ] No usa persistencia innecesaria

### T3: Crear hook useAlerts
- **Archivo(s):** `src/features/alert-summary/hooks/useAlerts.js`
- **Accion:** crear
- **Prioridad:** alta
- **Dependencias:** T2
- **Detalle:**
  Hook que consume alertStore y expone: `triggers`, `rules`, `stats`, `loading`, `error`, `filters`, `setFilters`, `acknowledge`, `refresh`.
  El hook debe encapsular toda la logica de data fetching y dejar los componentes puros de presentacion.
- **Criterios de aceptacion:**
  - [ ] Hook exportado por default
  - [ ] Documentado con JSDoc
  - [ ] Usa useEffect para fetch inicial

### T4: Crear componente AlertStatsCards
- **Archivo(s):** `src/features/alert-summary/components/AlertStatsCards.js`
- **Accion:** crear
- **Prioridad:** alta
- **Dependencias:** T3
- **Detalle:**
  Grid de 4 cards (SmartKPICard) mostrando: total alertas, activas, desconexiones, errores.
  Usar colores de estado: `--color-warning` para umbrales, `--color-error` para errores, `--color-info` para desconexiones.
- **Criterios de aceptacion:**
  - [ ] Usa SmartKPICard
  - [ ] Colores de tokens/CSS variables
  - [ ] SkeletonKPI en estado de carga
  - [ ] Responsive: 2x2 en mobile, 4 columnas en desktop

### T5: Crear componente AlertTable
- **Archivo(s):** `src/features/alert-summary/components/AlertTable.js`
- **Accion:** crear
- **Prioridad:** alta
- **Dependencias:** T3
- **Detalle:**
  Tabla Ant Design con columnas: Tipo, Punto, Fecha, Estado, Acciones.
  Usar `SmartBadge` para estado. Paginacion integrada con store.
  Accion "Ver detalle" abre drawer. Accion "Reconocer" llama acknowledge.
- **Criterios de aceptacion:**
  - [ ] Tabla con columnas definidas
  - [ ] SmartBadge para estados
  - [ ] SkeletonTable en loading
  - [ ] Paginacion funcional
  - [ ] Responsive: en mobile convertir a lista de cards o usar scroll horizontal

### T6: Crear componente AlertFilters
- **Archivo(s):** `src/features/alert-summary/components/AlertFilters.js`
- **Accion:** crear
- **Prioridad:** media
- **Dependencias:** T3
- **Detalle:**
  Filtros: Select de punto (usar /api/ik/my_points/), rango de fecha (DatePicker.RangePicker), select de tipo de alerta.
  Aplicar debounce de 300ms en cambios de filtro.
- **Criterios de aceptacion:**
  - [ ] Filtros funcionales conectados al store
  - [ ] Debounce en inputs
  - [ ] Boton "Limpiar filtros"

### T7: Crear componente AlertDetailDrawer
- **Archivo(s):** `src/features/alert-summary/components/AlertDetailDrawer.js`
- **Accion:** crear
- **Prioridad:** media
- **Dependencias:** T3
- **Detalle:**
  Drawer Ant Design que muestra detalle completo de una alerta: tipo, punto, valores umbral, historial de notificaciones, estado de reconocimiento.
  Ancho 480px desktop, full-screen mobile (usar breakpoints de useResponsive).
- **Criterios de aceptacion:**
  - [ ] Drawer con contenido completo
  - [ ] Responsive width
  - [ ] Boton "Reconocer alerta" visible solo si no esta reconocida

### T8: Crear componente principal AlertSummary
- **Archivo(s):** `src/features/alert-summary/AlertSummary.js`
- **Accion:** crear
- **Prioridad:** critica
- **Dependencias:** T4, T5, T6, T7
- **Detalle:**
  Componer todos los sub-componentes. Layout: AlertStatsCards arriba, AlertFilters debajo, AlertTable abajo.
  Envolver en SmartCard si aplica. Agregar titulo de seccion.
- **Criterios de aceptacion:**
  - [ ] Layout correcto
  - [ ] Todos los sub-componentes importados
  - [ ] Export default

### T9: Registrar ruta en AppRouter
- **Archivo(s):** `src/AppRouter.js`
- **Accion:** modificar
- **Prioridad:** alta
- **Dependencias:** T8
- **Detalle:**
  Agregar ruta `/alertas` que renderice `<AlertSummary />` protegida por autenticacion.
  ```jsx
  <Route path="/alertas" element={isAuth ? <AlertSummary /> : <Navigate to="/login" replace />} />
  ```
- **Criterios de aceptacion:**
  - [ ] Ruta funcional
  - [ ] Protegida por autenticacion
  - [ ] Import lazy si es pesado (opcional)

## 5. Notas para el Coder

- NO modificar `Home.js` ni `Sma.js`. Esta feature es independiente.
- Usar SIEMPRE `orchestrator` para API calls. Los endpoints de alertas ya estan documentados en AGENTS.md.
- Para el Select de puntos, usar `/api/ik/my_points/` (lista liviana).
- El reconocimiento de alerta (`is_acknowledged`) se hace via PATCH en `/api/alert_triggers/<id>/`.
- Colores de severidad:
  - THRESHOLDS: `--color-warning` (naranja)
  - DISCONNECTION / NO_DATA: `--color-info` (cyan)
  - PROCESSING_ERROR: `--color-error` (rojo)

## 6. Validacion Post-Implementacion

- [ ] Todos los archivos del plan fueron creados/modificados
- [ ] El codigo compila sin errores (`yarn build`)
- [ ] Los tests existentes no se rompen (`yarn test`)
- [ ] Responsive funciona (mobile + desktop)
- [ ] Dark mode funciona
- [ ] Estados de carga y error estan implementados
- [ ] No hay console.log de debug
- [ ] Se usa el orchestrator para API calls
- [ ] Colores vienen de tokens/CSS variables
- [ ] La ruta /alertas carga correctamente
- [ ] Los filtros aplican debounce y refrescan la tabla
- [ ] El drawer de detalle se abre/cierra correctamente

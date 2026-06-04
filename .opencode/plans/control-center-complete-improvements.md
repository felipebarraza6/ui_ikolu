# Plan: Mejoras Completas Centro de Control

## Phase 1: Performance & Bundle Size (REDUCE ~60kB)

### 1.1 Migrar moment → date-fns
- **Archivos afectados**: TODOS los .js que importan `moment`
- **Cambio**: Reemplazar `moment()` por `format()`, `parse()`, `addDays()` de date-fns
- **Prioridad**: ALTA (moment es ~60kB, date-fns tree-shakeable)
- **Nota**: Instalar `date-fns` primero

### 1.2 Code Splitting - React.lazy()
- **Archivos**: AppRouter.js
- **Cambio**: Lazy load ControlCenter, ProfilePage
- **Prioridad**: MEDIA

### 1.3 Optimizar Re-renders
- **Archivos**: ControlCenter.js, ControlCenterLayout.js
- **Cambio**: Wrap callbacks con useCallback, memoizar componentes hijos
- **Prioridad**: MEDIA

## Phase 2: UX/UI Polish

### 2.1 Animaciones de Entrada
- **Archivos**: ControlCenterLayout.js (KPIs), CCWeekConsumption.js, CCComplianceTable.js
- **Cambio**: Agregar clase `fade-in-up` o `fade-in` con delay escalonado
- **CSS**: Usar keyframes existentes en `styles/animations.css`

### 2.2 Tooltips Informativos en KPIs
- **Archivos**: ControlCenterLayout.js
- **Cambio**: Wrap cada KPI con `<Tooltip>` explicando qué significa

### 2.3 Estados de Error Amigables
- **Archivos**: ControlCenter.js
- **Cambio**: Reemplazar texto "Error cargando" por componente visual con icono, mensaje útil y botón de retry

### 2.4 Transiciones entre Tabs
- **Archivos**: ControlCenter.js
- **Cambio**: Animar opacity/transform al cambiar entre telemetry/compliance

## Phase 3: Responsive & Mobile

### 3.1 Layout Responsive
- **Archivos**: AppLayout.jsx, Sidebar.jsx
- **Cambio**: Sidebar se oculta en mobile (drawer), header se adapta

### 3.2 Cards KPI en Stack Vertical (mobile)
- **Archivos**: ControlCenterLayout.js
- **Cambio**: Col xs={12} sm={6} → En mobile xs={24} (ya está, verificar)

### 3.3 Tablas Responsive
- **Archivos**: CCComplianceTable.js, CCWeekConsumption.js
- **Cambio**: Scroll horizontal, ocultar columnas menos importantes en mobile

## Phase 4: Calidad de Código

### 4.1 Migrar sh directo → orchestrator
- **Archivos**: useControlCenter.js, ControlCenterChat.js, CCSupportDrawer.js
- **Cambio**: Usar `api/orchestrator.js` en vez de `api/sh/endpoints.js`
- **Nota**: Verificar que orchestrator tenga los métodos necesarios

### 4.2 Tests para useControlCenter
- **Archivos**: Nuevo `src/features/control-center/hooks/useControlCenter.test.js`
- **Cambio**: Testear transformDashboardStats y fetchData

## Phase 5: Features

### 5.1 Búsqueda/Filtro en Compliance
- **Archivos**: CCComplianceTable.js
- **Cambio**: Input de búsqueda por nombre de punto, filtro por tipo DGA

### 5.2 Exportar Reportes del CC
- **Archivos**: ControlCenterLayout.js
- **Cambio**: Botón "Exportar" que genere PDF/Excel con KPIs y datos del día

### 5.3 Notificaciones Toast
- **Archivos**: ya existe, usar message.success/error consistentemente
- **Cambio**: Verificar que todos los actions tengan feedback

## Reglas
- NO agregar comentarios
- NO usar emojis
- SIEMPRE usar smarthydro.tokens
- Build debe compilar después de cada phase

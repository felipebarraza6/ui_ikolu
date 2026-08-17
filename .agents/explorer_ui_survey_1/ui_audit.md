# Auditoría Exhaustiva de Frontend UI y Arquitectura "Capa One" — SmartHydro / ui_ikolu

**Fecha:** 2026-08-17  
**Auditor:** Frontend UI & Capa One Explorer  
**Proyecto:** `ui_ikolu` (SPA React 18 / Ant Design 5 / React Router 6 / Zustand / Axios)  
**Objetivo:** Evaluar la arquitectura UI, enrutamiento, cobertura de dominios de negocio SmartHydro, componentes muertos/obsoletos y configuración de build para la consolidación de Capa One.

---

## 1. Resumen Ejecutivo y Arquitectura "Capa One"

La arquitectura de `ui_ikolu` ha evolucionado hacia un modelo SPA consolidado de capa única ("Capa One") donde:
1. **Centro de Control Operativo (`/control-center/:tab?`):** Actúa como la vista principal unificada para usuarios estándar y administradores, agrupando en una sola pantalla interactiva la telemetría en tiempo real, cumplimiento normativo DGA/SMA, filtros dinámicos por proyecto y fecha, analítica de caudales, trazabilidad de comprobantes y mesa de ayuda rápida.
2. **Suite Administrativa y Backoffice (`/admin/*`):** Concentra todas las capacidades de gestión CRUD, catálogos técnicos, configuración de SLAs, reglas de alertas multinivel, auditoría de eventos y mesa de ayuda con Kanban interactivo.
3. **Mecanismo de Integración con API:** Centralizado a través de `src/api/orchestrator.js` y `src/api/sh/endpoints.js`, empleando llamadas en batch nativas (`/api/ik/batch/*`), control de concurrencia con prioridad y deduplicación en vuelo (`dataCache` + `requestDeduplication`).

---

## 2. Mapa Completo del Árbol de Código (`src/`)

```
src/
├── App.js                                 # Entrypoint React y notificación global de descargas
├── AppRouter.js                           # Router principal con lazy loading, RoleGuard y ErrorBoundary
├── index.js                               # Root de ReactDOM con Antd ConfigProvider y Themes
├── index.css                              # Estilos globales y reset
├── api/
│   ├── orchestrator.js                    # Singleton de orquestación, deduplicación y caché
│   └── sh/
│       ├── config.js                      # Configuración Axios, interceptores y endpoints base
│       └── endpoints.js                   # Mapeo exhaustivo de endpoints DRF SmartHydro (2035 líneas)
├── config/
│   └── tours.js                           # Guías interactivas (Tour) para el Centro de Control
├── constants/
│   ├── dgaTypes.js                        # Tipos DGA (Superficial, Subterráneo, etc.)
│   └── roles.js                           # Roles y permisos (SuperUser, Staff, Client)
├── contexts/
│   ├── AuthContext.js                     # Contexto de autenticación, token y perfil de usuario
│   ├── DataContext.js                     # ⚠️ OBSOLETO: Contexto heredado no utilizado por ningún componente
│   ├── ThemeContext.js                    # Contexto de tema y algoritmos Ant Design
│   ├── TourContext.js                     # Contexto para Tours interactivos
│   └── index.js                           # Barrel export de contextos
├── features/
│   ├── admin/
│   │   ├── AdminRouter.js                 # Router secundario para las 22 vistas de administración
│   │   ├── components/
│   │   │   ├── CrudDrawer.jsx             # Drawer reutilizable para formularios de creación/edición
│   │   │   ├── DebugPanel.jsx             # Panel de métricas de debug para administradores
│   │   │   ├── DgaQueuePanel.jsx          # Panel de estado y reencolamiento de cola DGA
│   │   │   ├── EventLogTable.jsx          # Tabla de eventos y logs de auditoría
│   │   │   ├── PerformanceCharts.jsx      # Gráficos de salud y estado de telemetría (Chart.js)
│   │   │   ├── PointsStatusTable.jsx      # Tabla de monitoreo de frecuencia y estado de puntos
│   │   │   ├── SystemHealthPanel.jsx      # Diagnóstico de recursos y servicios del sistema
│   │   │   └── TicketsKanban/
│   │   │       ├── KanbanBoard.jsx        # Tablero interactivo de columnas Kanban
│   │   │       ├── KanbanColumn.jsx       # Columna de estado con drag/card list
│   │   │       ├── TasksPanel.jsx         # Checklist de subtareas para tickets
│   │   │       ├── TicketCard.jsx         # Tarjeta de ticket individual con badge de SLA
│   │   │       ├── TicketCreateDrawer.jsx # Drawer de creación de tickets con clientes/proyectos
│   │   │       ├── TicketDetailDrawer.jsx # Drawer completo con comentarios, menciones, adjuntos
│   │   │       └── TicketMetrics.jsx      # ⚠️ HUÉRFANO: Componente de métricas no importado
│   │   ├── constants/
│   │   │   ├── adminMenu.js               # Definición de items de navegación lateral
│   │   │   └── tickets.js                 # Estados, prioridades, colores y transiciones de tickets
│   │   ├── hooks/
│   │   │   ├── useAdminAuth.js            # Permisos de staff/superuser
│   │   │   ├── useAdminCrud.js            # Hook genérico para operaciones CRUD
│   │   │   ├── useSlaConfigs.js           # Gestión de configuraciones SLA
│   │   │   ├── useSystemStatus.js         # Estado del sistema y métricas
│   │   │   ├── useTicketCatalogs.js       # Catálogos para asignación y proyectos
│   │   │   ├── useTicketCategories.js     # Gestión de categorías de soporte
│   │   │   ├── useTicketIndicators.js     # Métricas avanzadas de soporte y SLAs
│   │   │   ├── useTicketRanking.js        # Ranking de desempeño de agentes de soporte
│   │   │   └── useTickets.js              # Hook principal de tickets, tareas y comentarios
│   │   ├── pages/                         # 22 páginas administrativas (ver detalle en sección 3)
│   │   ├── stores/
│   │   │   └── adminStore.js              # Store Zustand para filtros y UI de administración
│   │   └── utils/
│   │       └── pointStatus.js             # Formateo de estados y umbrales de puntos
│   ├── alerts/
│   │   └── AlertsLayout.js                # ⚠️ HUÉRFANO: Layout no importado por ninguna ruta
│   ├── auth/
│   │   ├── LoginPage.jsx                  # Pantalla de Login con modal y landing integrada
│   │   ├── ResetPasswordPage.jsx          # Recuperación y cambio de contraseña con token
│   │   ├── RoleGuard.jsx                  # Guardia de acceso según rol de usuario
│   │   ├── components/
│   │   │   ├── BrandPanel.jsx             # Panel de branding y estadísticas públicas
│   │   │   ├── ForgotModal.jsx            # Modal de solicitud de reset de clave
│   │   │   ├── IkoluFeatures.jsx          # ⚠️ HUÉRFANO: Componente antiguo de características
│   │   │   ├── LoginFlipCard.jsx          # ⚠️ HUÉRFANO: Wrapper flip card no utilizado
│   │   │   ├── LoginForm.jsx              # Formulario de login
│   │   │   ├── ServiceCard.jsx            # ⚠️ HUÉRFANO: Card de servicio no utilizada
│   │   │   ├── VoidCubeLogo.jsx           # Isotipo 3D animado de Ikolu
│   │   │   └── WaterBackground.jsx        # Fondo interactivo con gradientes de agua
│   │   ├── hooks/
│   │   │   └── usePublicData.js           # Hook de carga de datos de presentación
│   │   └── services/
│   │       └── publicData.js              # ⚠️ MOCK: Datos estáticos de empresa y servicios
│   ├── control-center/
│   │   ├── ControlCenter.js               # Vista principal de Centro de Control y drawers
│   │   ├── ControlCenter.css              # Estilos específicos del Centro de Control
│   │   ├── ControlCenterDrawers.js        # ⚠️ HUÉRFANO: Drawers duplicados no importados
│   │   ├── ModuleTour.js                  # Integración del tour interactivo
│   │   ├── components/
│   │   │   ├── ActionButtons.jsx          # Botones de acción rápida por punto
│   │   │   ├── ApexChartWrapper.js        # Wrapper configurado para gráficos ApexCharts
│   │   │   ├── BlinkingDot.jsx            # Indicador pulsante de estado en vivo
│   │   │   ├── ConsumptionCell.jsx        # Celda de consumo diario con barras proporcionales
│   │   │   ├── PointHeader.jsx            # Encabezado con información del punto y chips
│   │   │   ├── StatusBadge.jsx            # Badge de estado de conexión/telemetría
│   │   │   ├── WarningsSection.jsx        # Sección de advertencias operativas
│   │   │   └── Chat/
│   │   │       └── ControlCenterChat.js   # Chatbot asistente de telemetría con cuotas
│   │   ├── constants/
│   │   │   └── chartColors.js             # Paletas de color para series temporales
│   │   ├── containers/
│   │   │   └── ControlCenterContainer.js  # Contenedor de filtros, tabs y resumen
│   │   ├── drawers/
│   │   │   ├── AuditHistoryDrawer.js      # Historial de excedencias y mediciones límite
│   │   │   ├── ComplianceDetailDrawer.js  # Detalle de cumplimiento y gráficos de caudal
│   │   │   ├── FlowAnalysisDrawer.js      # Análisis de curvas de caudal
│   │   │   ├── MeasurementsDrawer.js      # Drawer de mediciones detalladas (header/loading)
│   │   │   ├── PointConfigDrawer.js       # Configuración técnica (d1-d5, offset, adición)
│   │   │   ├── StopComplianceDrawer.js    # Solicitud de suspensión de cumplimiento
│   │   │   ├── StopTelemetryDrawer.js     # Solicitud de suspensión de telemetría
│   │   │   ├── SupportDrawer.js           # Creación de tickets contextuales de soporte
│   │   │   ├── SystemEventsDrawer.js      # Auditoría de eventos del sistema
│   │   │   ├── VoucherModal.js            # Modal y verificación SOAP/REST DGA
│   │   │   └── WarningsDrawer.js          # Lista de advertencias activas por punto
│   │   ├── hooks/
│   │   │   ├── useControlCenter.js        # ⚠️ HUÉRFANO: Hook reemplazado por useControlCenterData
│   │   │   └── useControlCenterData.js    # Hook activo para telemetría, compliance y paginación
│   │   ├── layout/
│   │   │   ├── ControlCenterLayout.js     # Layout de 3 columnas para Centro de Control
│   │   │   └── SkeletonControlCenter.js   # Estado de carga esqueleto para Centro de Control
│   │   ├── measurements/
│   │   │   ├── MeasurementCharts.js       # Gráficos combinados de caudal, nivel y consumo
│   │   │   ├── MeasurementDrawer.js       # Contenido principal del drawer de mediciones
│   │   │   ├── MeasurementKPIs.js         # Tarjetas de resumen de mediciones
│   │   │   └── MeasurementUtils.js        # Utilidades de extracción y ordenamiento de series
│   │   ├── stores/
│   │   │   └── controlCenterStore.js      # Store Zustand para drawers, fecha y proyecto
│   │   └── tabs/
│   │       ├── DataTabs.js                # Tabs superiores (Telemetría / Cumplimiento DGA)
│   │       ├── compliance/
│   │       │   ├── ComplianceTable.js     # Tabla de monitoreo MEE DGA/SMA
│   │       │   └── SkeletonCompliance.js  # Esqueleto de carga para compliance
│   │       └── telemetry/
│   │           ├── WeekConsumption.js    # Matriz semanal de consumo y estados por punto
│   │           └── SkeletonTelemetry.js   # Esqueleto de carga para telemetría
│   ├── layout/
│   │   ├── AppLayout.jsx                  # Layout general con Sidebar y HeaderNav
│   │   ├── HeaderNav.jsx                  # Barra superior con selector de perfil y logout
│   │   └── Sidebar.jsx                    # Menú lateral colapsable con logo VoidCube
│   └── profile/
│       └── ProfilePage.jsx                # Gestión de perfil de usuario, clave y avatar
├── hooks/
│   ├── useIkoluToken.js                   # Hook para acceder a los tokens de tema activos
│   └── useResponsive.js                   # Detección responsiva (mobile/desktop)
├── shared/
│   ├── components/
│   │   └── ErrorBoundary.jsx              # Captura de errores React con reintento
│   ├── drawers/
│   │   └── SmartDrawer.js                 # ⚠️ HUÉRFANO: Drawer base no importado en el proyecto
│   ├── ui/
│   │   ├── SmartBadge.jsx                 # Badge con variantes (void, success, error, warning)
│   │   ├── SmartButton.jsx                # Botón estilizado con soporte de temas
│   │   ├── SmartCard.jsx                  # Card con efecto de cristal (glassmorphism)
│   │   ├── SmartIconButton.jsx            # ⚠️ HUÉRFANO: Botón circular no importado
│   │   ├── SmartKPICard.jsx               # Tarjeta compacta para métricas KPI
│   │   └── SmartSkeleton/                 # Componentes esqueleto con animación shimmer
│   │       ├── ShimmerBar.jsx
│   │       ├── ShimmerCircle.jsx
│   │       ├── SkeletonCalendarDay.jsx
│   │       ├── SkeletonKPI.jsx
│   │       ├── SkeletonTable.jsx
│   │       └── skeleton.css
│   └── utils/
│       └── resolveMediaUrl.js             # Resolución de rutas absolutas para archivos subidos
├── styles/                                # Archivos CSS de variables de temas y animaciones
│   ├── animations.css
│   ├── global-animations.css
│   ├── ikolu-theme-vars.css
│   ├── ocean-theme.css
│   ├── theme-variables.css
│   └── void-theme.css
├── theme/
│   ├── EmotionThemeProvider.js            # Integración de Emotion con temas de Ant Design
│   ├── index.js                           # Algoritmo de generación de tokens de color y tema
│   └── smarthydro.tokens.js               # Tokens de color corporativos SmartHydro
└── utils/
    ├── dataCache.js                       # Caché en memoria con TTL por clave
    ├── numberFormatter.js                 # Formateo numérico en español (es-CL)
    ├── numbers.js                         # Extracción y parsing seguro de números
    └── requestDeduplication.js            # Deduplicador de promesas en vuelo
```

---

## 3. Auditoría de Enrutamiento y Navegación

### 3.1 Rutas Principales (`AppRouter.js`)
| Ruta | Componente | Guard / Layout | Estado de Integración |
|---|---|---|---|
| `/login` | `LoginPage` | Público (redirecciona si autenticado) | 100% Operativo |
| `/reset-password` | `ResetPasswordPage` | Público (valida token en URL) | 100% Operativo |
| `/control-center/:tab?` | `ControlCenter` | `ProtectedLayout` + `ErrorBoundary` | 100% Operativo (Tabs: telemetry, compliance) |
| `/profile` | `ProfilePage` | `ProtectedLayout` + `ErrorBoundary` | 100% Operativo |
| `/admin/*` | `AdminRouter` | `AdminLayout` (`RoleGuard`) | 100% Operativo |
| `/*` | Fallback | Redirección a `/control-center/telemetry` | 100% Operativo |

### 3.2 Rutas Administrativas (`AdminRouter.js`)
| Ruta | Página | Propósito y Servicios Conectados |
|---|---|---|
| `/admin/performance` | `PerformanceDashboard` | Dashboard global de salud del sistema, cola DGA, métricas y tabla de puntos (`orchestrator.systemStatus`, `pointsStatus`, `telemetryMetrics`, `dgaQueueStatus`, `systemEvents`) |
| `/admin/operational` | `OperationalDashboard` | Vista general de conteo de entidades (`clients`, `projects`, `points`, `schemes`, `variables`, `providers`) |
| `/admin/support/my-desk` | `MyDeskPage` | Vista personalizada para agentes de soporte (`orchestrator.tickets.myDesk`) |
| `/admin/support/tickets` | `SupportDashboard` | Tablero Kanban principal con filtros avanzados por proyecto, punto, canal, prioridad y categoría |
| `/admin/support/indicators`| `SupportIndicatorsPage`| Métricas cuantitativas de SLAs, tiempos de primera respuesta y resolución |
| `/admin/support/categories`| `TicketCategoriesPage` | CRUD jerárquico de categorías y subcategorías de tickets |
| `/admin/support/sla-configs`| `SlaConfigsPage` | Configuración de tiempos máximos de respuesta y resolución según prioridad |
| `/admin/support/files` | `FilesDrivePage` | Explorador y gestor centralizado de adjuntos de tickets |
| `/admin/clients` | `ClientsPage` | CRUD de clientes con búsqueda y paginación (`orchestrator.admin.clients`) |
| `/admin/clients/:clientId`| `ClientDetailPage` | Detalle del cliente y lista de proyectos asociados |
| `/admin/projects` | `ProjectsPage` | CRUD de proyectos con asociación a cliente |
| `/admin/projects/:projectId`| `ProjectDetailPage` | Detalle del proyecto y lista de puntos de captación |
| `/admin/points` | `PointsPage` | CRUD de puntos de captación con configuración DGA y técnica |
| `/admin/points/:pointId/*` | `PointDetailPage` | Vista de detalle de 4 pestañas: Resumen, Configuración técnica, Variables y Mediciones |
| `/admin/schemes` | `SchemesAndVariablesPage` | Gestión de esquemas de datos y asignación de variables |
| `/admin/variables` | `SchemesAndVariablesPage` | Catálogo de variables (Caudal, Nivel, Totalizado, Presión, etc.) |
| `/admin/providers` | `ProvidersPage` | Proveedores de telemetría y proveedores de cumplimiento normativo |
| `/admin/alerts` | `AlertsDashboard` | Resumen de reglas, canales y disparos activos |
| `/admin/alerts/rules` | `AlertRulesPage` | CRUD de reglas de alerta con condiciones y umbrales |
| `/admin/alerts/channels` | `AlertChannelsPage` | CRUD de canales de notificación (Email, SMS, Webhook) |
| `/admin/alerts/triggers` | `AlertTriggersPage` | Historial de disparos de alertas y reconocimiento (`acknowledge`) |
| `/admin/compliance` | `ComplianceDashboard` | Métricas generales de cumplimiento normativo y herramienta de verificación de comprobantes DGA |
| `/admin/users` | `UsersPage` | CRUD de usuarios, asignación de roles y reseteo de claves |

---

## 4. Estado de los Dominios de Negocio SmartHydro

| Dominio de Negocio | Cobertura en UI | Vistas y Componentes Clave | Estado de Integración API |
|---|---|---|---|
| **Puntos de Captación** | **100%** | `WeekConsumption.js`, `PointConfigDrawer.js`, `PointsPage.jsx`, `PointDetailPage.jsx`, `PointsStatusTable.jsx` | Plenamente integrado con endpoints `/api/catchment_point/`, `/api/ik/point/{id}/summary/`, `/api/ik/point/{id}/config/` y batch summary. |
| **Telemetría** | **100%** | `WeekConsumption.js`, `MeasurementsDrawer.js`, `MeasurementCharts.js`, `FlowAnalysisDrawer.js`, `PerformanceCharts.jsx` | Integrado con `/api/ik/control_center/list/`, `/api/ik/point/{id}/records/`, `/api/ik/batch/telemetry/` y soporte de reprocesamiento. |
| **Cumplimiento DGA/SMA** | **100%** | `ComplianceTable.js`, `ComplianceDetailDrawer.js`, `VoucherModal.js`, `ComplianceDashboard.jsx`, `DgaQueuePanel.jsx` | Integrado con `/api/ik/compliance/`, `/compliance/dga/verify/`, `/api/management/dga_queue_status/` y soporte para los 4 estándares MEE. |
| **Alertas & Eventos** | **100%** | `AlertsDashboard.jsx`, `AlertRulesPage.jsx`, `AlertChannelsPage.jsx`, `AlertTriggersPage.jsx`, `SystemEventsDrawer.js`, `WarningsDrawer.js` | Integrado con `/api/alert_rules/`, `/api/alert_channels/`, `/api/alert_triggers/`, `/api/ik/control_center/system_events/`. |
| **Usuarios & Roles** | **100%** | `LoginPage.jsx`, `ResetPasswordPage.jsx`, `UsersPage.jsx`, `ProfilePage.jsx`, `RoleGuard.jsx` | Integrado con `/api/ik/login/`, `/api/users/`, `/api/users/me/`, `/api/ik/auth/password-reset/`. |
| **Clientes & Proyectos** | **100%** | `ClientsPage.jsx`, `ClientDetailPage.jsx`, `ProjectsPage.jsx`, `ProjectDetailPage.jsx`, `Sidebar.jsx`, `ControlCenterContainer.js` | Integrado con `/api/client/`, `/api/client/with-projects/`, `/api/project_catchments/` y selectores en cascada. |
| **Soporte & Mesa de Ayuda** | **100%** | `SupportDashboard.jsx`, `MyDeskPage.jsx`, `TicketDetailDrawer.jsx`, `KanbanBoard.jsx`, `TasksPanel.jsx`, `SlaConfigsPage.jsx`, `SupportDrawer.js` | Integrado con `/api/ik/tickets/`, `/api/ik/tickets/{id}/comments/`, `/api/ik/tickets/{id}/tasks/`, `/api/ik/files/`, `/api/ik/sla-configs/`. |

---

## 5. Auditoría de Componentes Muertos, Huérfanos y Mocks

### 5.1 Componentes Huérfanos / No Referenciados
Los siguientes archivos existen en el repositorio pero no están importados en ninguna ruta ni componente activo:

1. **`src/features/control-center/ControlCenterDrawers.js`** (266 líneas)
   - *Motivo:* Fue diseñado originalmente para aislar los drawers del Centro de Control, pero `ControlCenter.js` inlinó los drawers directamente en su JSX (líneas 483-628).
   - *Acción recomendada:* Eliminar el archivo para evitar duplicación y confusión de mantenimiento.

2. **`src/features/control-center/hooks/useControlCenter.js`** (110 líneas)
   - *Motivo:* Hook de versión anterior sustituido por `useControlCenterData.js` (que soporta paginación DRF, filtros de fecha y proyectos).
   - *Acción recomendada:* Eliminar el archivo.

3. **`src/features/alerts/AlertsLayout.js`** (44 líneas)
   - *Motivo:* Layout de alertas heredado que no está enlazado a ninguna ruta de `AppRouter.js` ni `AdminRouter.js` (las alertas usan `AlertsDashboard.jsx` y `AlertRulesPage.jsx`).
   - *Acción recomendada:* Eliminar el archivo o moverlo a desuso.

4. **`src/features/admin/components/TicketsKanban/TicketMetrics.jsx`** (102 líneas)
   - *Motivo:* Las métricas de tickets se muestran actualmente en `SupportIndicatorsPage.jsx` y en los filtros dinámicos de `SupportDashboard.jsx`. `TicketMetrics.jsx` no está importado.
   - *Acción recomendada:* Eliminar el archivo.

5. **`src/features/auth/components/ServiceCard.jsx`** (77 líneas)
   - *Motivo:* Componente de tarjeta de la versión anterior de la landing de login. `LoginPage.jsx` ahora utiliza `BrandPanel.jsx`.
   - *Acción recomendada:* Eliminar el archivo.

6. **`src/features/auth/components/IkoluFeatures.jsx`** (157 líneas)
   - *Motivo:* Componente de showcase de características no importado por `LoginPage.jsx`.
   - *Acción recomendada:* Eliminar el archivo.

7. **`src/features/auth/components/LoginFlipCard.jsx`** (48 líneas)
   - *Motivo:* Contenedor con efecto 3D flip no utilizado en el diseño actual de login (que usa Modal de Ant Design).
   - *Acción recomendada:* Eliminar el archivo.

8. **`src/shared/drawers/SmartDrawer.js`** (100 líneas)
   - *Motivo:* Wrapper genérico de Drawer no importado por ninguno de los 12 drawers activos en el proyecto.
   - *Acción recomendada:* Eliminar el archivo.

9. **`src/shared/ui/SmartIconButton.jsx`** (94 líneas)
   - *Motivo:* Exportado en `src/shared/ui/index.js`, pero no utilizado en ningún componente ni página.
   - *Acción recomendada:* Eliminar el archivo o exportarlo solo si se prevé su uso en librerías compartidas.

### 5.2 Contextos y Mocks Obsoletos
10. **`src/contexts/DataContext.js`** (31 líneas)
    - *Motivo:* Mantiene un reducer con `selected_profile` y el hook `useData()`. Ningún componente en todo `src/` consume `useData()`. Solo se monta en `App.js` por razones históricas.
    - *Acción recomendada:* Desmontar de `App.js` y eliminar `DataContext.js`.

11. **`src/features/auth/services/publicData.js`** (141 líneas)
    - *Motivo:* Mock estático con datos de presentación de Smart Hydro para la pantalla de login.
    - *Acción recomendada:* Mantener temporalmente como fallback de landing o conectar con un endpoint DRF público `/api/public/info/` cuando esté disponible en el backend.

---

## 6. Auditoría de Build, Dependencias y Advertencias Lint

### 6.1 Estado de Compilación (`npm run build`)
- **Resultado:** **Éxito (Exit Code 0)**.
- **Tamaño de Bundle gzipped:**
  - `main.js`: 339.44 kB
  - Chunks asíncronos: 354.66 kB, 121.45 kB, 73.47 kB, 46.49 kB, 25.29 kB, 22.78 kB, 22.00 kB.
  - CSS global: 10.33 kB.

### 6.2 Advertencias de ESLint detectadas en el Build
Se detectaron 22 advertencias menores de variables no utilizadas o dependencias faltantes en hooks:
1. `src/features/control-center/ControlCenter.js`:
   - Variables no usadas: `flowAnalysisData`, `flowAnalysisLoading`, `setFlowAnalysisLoading`, `handleNavigatePoint`.
   - `useCallback` con dependencia faltante `openDrawer` / `closeDrawer`.
2. `src/features/control-center/ModuleTour.js`:
   - `useMemo` con dependencia innecesaria `refreshKey`.
3. `src/features/control-center/components/StatusBadge.jsx`:
   - Import no usado: `Flex`.
4. `src/features/control-center/drawers/ComplianceDetailDrawer.js`:
   - Variable no usada: `waterTable`.
5. `src/features/control-center/drawers/MeasurementsDrawer.js`:
   - Import no usado: `MeasurementsDrawerContentMemo`.
6. `src/features/control-center/drawers/SupportDrawer.js`:
   - Constante no usada: `SUPPORT_TYPES`.
7. `src/features/control-center/hooks/useControlCenterData.js`:
   - `useCallback` con dependencia faltante `isAuth`.
8. `src/features/control-center/layout/ControlCenterLayout.js`:
   - Import no usado: `Text`.
9. `src/features/control-center/measurements/MeasurementDrawer.js`:
   - Variables no usadas: `useState`, `FaImage`, `MeasurementsDualColumnChart`, `groups`.
10. `src/features/control-center/tabs/telemetry/WeekConsumption.js`:
    - Variables/Iconos no usados: `useEffect`, `Tag`, `FaExclamationTriangle`, `CheckCircleOutlined`, `CloseCircleOutlined`, `typeDgaLabels`, `currentPage`, `isToday`.

### 6.3 Dependencias en `package.json` vs Uso Real
| Dependencia | Declarada en `package.json` | Usada en `src/` | Diagnóstico |
|---|---|---|---|
| `faker` | `"^6.6.6"` | ❌ No | Obsoleta, puede removerse del package.json |
| `qrcode.react` | `"^3.1.0"` | ❌ No | Obsoleta, puede removerse |
| `rc-queue-anim` | `"^2.0.0"` | ❌ No | Obsoleta, puede removerse |
| `crypto` | `"^1.0.1"` | ❌ No | Redundante con built-in de Node |
| `crypto-browserify` | `"^3.12.0"` | ❌ No | No referenciada directamente |
| `i18next` / `react-i18next` | `"^25.3.0"` / `"^15.5.3"` | ❌ No | La app usa textos en español directos y dayjs/antd locales |
| `jspdf` | `"^3.0.0"` | ❌ No | No referenciada directamente |
| `html2canvas` | `"^1.4.1"` | ✅ Sí | Usada en `MeasurementDrawer.js` y `TicketDetailDrawer.jsx` |
| `react-chartjs-2` | `"^4.3.1"` | ✅ Sí | Usada en `PerformanceCharts.jsx` |
| `apexcharts` / `react-apexcharts` | `"^5.13.0"` / `"^2.1.0"` | ✅ Sí | Usada en `ApexChartWrapper.js` |
| `antd` | `"^5.10.3"` | ✅ Sí | Core UI framework |
| `zustand` | `"^5.0.14"` | ✅ Sí | Core state manager |
| `leaflet` / `react-leaflet` | `"^1.9.4"` / `"^5.0.0"` | ✅ Sí | Mapas y geolocalización |

---

## 7. Conclusiones y Plan de Acción Recomendado

1. **Arquitectura Capa One Sólida:** La unificación entre el Centro de Control y las 22 vistas de administración cubre el 100% de los casos de uso operativos y administrativos requeridos por la API SmartHydro.
2. **Limpieza de Archivos Muertos:** Se identificaron **9 archivos de componentes y hooks totalmente huérfanos** (aprox. 900 líneas de código muerto) que pueden podarse de forma segura sin impacto funcional.
3. **Limpieza de Contextos:** Retirar `DataContext.js` y su provider en `App.js` para simplificar el árbol de componentes.
4. **Optimización de Dependencias:** Remover paquetes no utilizados (`faker`, `qrcode.react`, `rc-queue-anim`, `crypto`, `i18next`, `react-i18next`, `jspdf`) de `package.json` para aligerar la instalación y el árbol de dependencias.
5. **Corrección de Lints:** Limpiar las 22 variables y dependencias no utilizadas en hooks señaladas en la sección 6.2 para lograr un build 100% limpio sin warnings.

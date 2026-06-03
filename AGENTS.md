# AGENTS.md — Ikolu UI (SmartHydro Frontend)

## 🎯 Proyecto Overview

- **Nombre:** Ikolu UI / SmartHydro Frontend
- **Stack:** React 18 + Create React App (react-scripts 5.0.1)
- **UI Library:** Ant Design 5.x (`antd`)
- **Routing:** React Router 6 (`react-router-dom`)
- **Estado Global:** Context API (migración activa desde AppContext monolítico) + Zustand para features
- **HTTP:** Axios vía orquestador centralizado (`src/api/orchestrator.js`)
- **Estilos:** CSS Variables (`src/styles/theme-variables.css`) + Emotion (`@emotion/react`) + Ant Design ConfigProvider
- **Tema:** Sistema Ikolu con modo oscuro/claro (`src/contexts/ThemeContext.js`, `src/theme/index.js`)
- **Mapas:** Leaflet + React-Leaflet v5
- **Gráficos:** Chart.js + react-chartjs-2, ApexCharts + react-apexcharts, Ant Design Plots
- **i18n:** i18next + react-i18next (español por defecto)
- **Build:** `yarn start` (dev), `yarn build` (prod)

---

## 📁 Estructura de Carpetas

```
src/
├── api/                    # Capa de datos
│   ├── orchestrator.js     # Orquestador centralizado (SINGLE SOURCE OF TRUTH para llamadas API)
│   ├── sh/                 # Endpoints SmartHydro
│   └── novus/              # Endpoints Novus
├── assets/                 # Imágenes, fonts, estáticos
├── components/             # Componentes por dominio de negocio
│   ├── admin/
│   ├── alerts/
│   ├── common/             # Componentes compartidos de negocio (AppCard, ChatBubble, etc.)
│   ├── dga/
│   ├── docres/
│   ├── documentation/
│   ├── geo_smart/
│   ├── graphics/
│   ├── home/
│   ├── layout/
│   ├── mywell/
│   ├── profile/
│   ├── prototype_umi/
│   ├── reports/
│   ├── smart_data/
│   ├── support/
│   ├── water_ik/
│   └── well/
├── containers/             # Pages/Screens de alto nivel
│   ├── Home.js             # Dashboard principal (MUY grande, evitar agrandar más)
│   ├── Login.js
│   ├── ResetPassword.js
│   └── ...
├── contexts/               # Contextos React especializados
│   ├── AuthContext.js      # isAuth, user, token
│   ├── DataContext.js      # points, profiles, points_list
│   ├── UIContext.js        # isLoading, adminView
│   ├── ThemeContext.js     # isDark, toggleTheme
│   └── TourContext.js      # Onboarding/guías
├── features/               # Features autónomas (patrón moderno)
│   └── control-center/     # Centro de Control SmartHydro
│       ├── ControlCenter.js
│       ├── stores/         # Zustand stores locales a la feature
│       └── components/     # Componentes privados de la feature
├── hooks/                  # Custom hooks
│   ├── useControlCenter.js
│   ├── useDashboardData.js
│   ├── useDataValidation.js
│   ├── useResponsive.js
│   └── ...
├── reducers/               # React reducers (legacy, AppContext)
├── shared/                 # UI Kit propio (Smart Components)
│   └── ui/
│       ├── SmartButton.jsx
│       ├── SmartCard.jsx
│       ├── SmartBadge.jsx
│       ├── SmartIconButton.jsx
│       ├── SmartKPICard.jsx
│       └── SmartSkeleton/  # Skeletons reutilizables
├── styles/                 # CSS global
│   ├── animations.css
│   ├── mobile.css
│   ├── ocean-theme.css
│   └── theme-variables.css # Variables CSS light/dark
├── theme/                  # Configuración de tema Ant Design + Emotion
│   ├── index.js            # createIkoluTheme(), ikoluTokens
│   └── smarthydro.tokens.js
├── utils/                  # Utilidades puras
│   ├── dataCache.js
│   ├── requestDeduplication.js
│   ├── dateFormatter.js
│   └── numberFormatter.js
├── App.js                  # Root + Providers + AppContext legacy
├── AppRouter.js            # Definición de rutas
└── index.js                # Entry point + ConfigProvider + ThemeProvider
```

---

## 🏗️ Arquitectura y Patrones

### 1. Estado Global — Migración Activa

**NO crear más dependencias en `AppContext` (monolítico).**

Usar los contextos especializados:
- `useAuth()` → `AuthContext`
- `useData()` → `DataContext`
- `useUI()` → `UIContext`
- `useAppTheme()` → `ThemeContext`

Para estado local de features, usar **Zustand** (ver `src/features/control-center/stores/controlCenterStore.js`).

### 2. Llamadas a API — ORQUESTADOR OBLIGATORIO

**NUNCA** hacer `axios.get()` directamente desde componentes.

Todas las llamadas pasan por `src/api/orchestrator.js` que implementa:
- Deduplicación de requests (`utils/requestDeduplication.js`)
- Caché con TTL (`utils/dataCache.js`)
- Cancelación con `AbortController`
- Cola de prioridad (CRITICAL > HIGH > NORMAL > LOW)
- Endpoints BATCH nativos (`/api/ik/batch/*`)

Ejemplo correcto:
```javascript
import orchestrator from '../api/orchestrator';

const data = await orchestrator.getTelemetry(pointId);
```

### 3. UI Components — Usar Smart Components o Ant Design

**Preferir** componentes de `src/shared/ui/` cuando existan:
- `SmartCard` → en vez de `<Card>` crudo
- `SmartButton` → en vez de `<Button>` crudo
- `SmartKPICard` → para métricas/KPIs
- `SmartSkeleton.*` → para estados de carga

Si no existe, usar **Ant Design 5** directamente.

### 4. Estilos — Jerarquía de Prioridad

1. **CSS Variables** (`theme-variables.css`) para colores, sombras, espaciado
2. **Ant Design ConfigProvider** (`src/theme/index.js`) para tokens de AD
3. **Emotion** (`styled`, `css`) para estilos dinámicos/complejos
4. **CSS modules/archivos .css** para animaciones y layout

Colores del brand (NO hardcodear, usar tokens):
- Primary: `#203562`
- Accent: `#CCCF07`
- Ocean Deep: `#0A2540`
- Ocean Cyan: `#00B4D8`
- Ocean Light: `#90E0EF`

### 5. Responsive — Patrón Establecido

Ver `src/hooks/useResponsive.js`. El proyecto soporta mobile/tablet/desktop.
- Usar `react-responsive` para breakpoints si es necesario
- Existen guías en `src/utils/GUIA_*_RESPONSIVA.md`
- Clases CSS de utilidad en `styles/mobile.css`

---

## ✅ Checklist Antes de Cualquier Cambio

- [ ] ¿Estoy usando el orquestador para API calls?
- [ ] ¿Estoy usando `Smart*` components si existen?
- [ ] ¿Mis colores vienen de tokens/CSS variables y no están hardcodeados?
- [ ] ¿Mi estado usa el contexto especializado correcto (no AppContext)?
- [ ] ¿Agregué skeletons/estados de carga?
- [ ] ¿Agregué manejo de errores?
- [ ] ¿Verifiqué que funcione en dark mode?
- [ ] ¿No rompí la estructura de carpetas existente?

---

## ❌ Cosas a EVITAR

1. **NO agrandar `Home.js` ni `Sma.js`** — Son monolitos legacy. Si necesitas algo nuevo, crear una feature en `src/features/` o un componente en `src/components/`.
2. **NO usar `AppContext` directamente** en código nuevo. Usar los contextos especializados.
3. **NO hacer fetch directo** con axios/fetch. Usar el orquestador.
4. **NO hardcodear colores** — Siempre usar tokens del tema o CSS variables.
5. **NO crear más archivos en `containers/`** a menos que sea una página nueva de verdad.
6. **NO ignorar mobile** — Todos los componentes nuevos deben ser responsive.
7. **NO usar `moment` en código nuevo** — Usar `date-fns` o native `Intl.DateTimeFormat` si es posible (ya existe `dateFormatter.js`).

---

## 🔄 Convenciones de Código

### Nomenclatura
- Componentes React: `PascalCase.jsx` (preferir `.jsx` si usa JSX)
- Hooks custom: `camelCase.js` empezando con `use`
- Utilidades: `camelCase.js`
- Constantes: `SCREAMING_SNAKE_CASE`
- Stores Zustand: `camelCaseStore.js`

### Imports (orden)
1. React / librerías externas
2. Componentes de Ant Design
3. Componentes internos (`shared/ui`, `components/common`)
4. Contexts / Hooks
5. API / Utils
6. Estilos / CSS

### Estructura de Componente
```jsx
import React from 'react';
// ... imports

/**
 * Breve descripción del componente
 * @param {Object} props
 * @param {string} props.title - Título a mostrar
 */
const MiComponente = ({ title }) => {
  // hooks primero
  const { user } = useAuth();
  
  // estado local
  const [loading, setLoading] = useState(false);
  
  // effects
  useEffect(() => { ... }, []);
  
  // handlers
  const handleClick = () => { ... };
  
  // render helpers
  if (loading) return <SkeletonKPI />;
  
  return (
    <SmartCard>
      <h3>{title}</h3>
    </SmartCard>
  );
};

export default MiComponente;
```

---

## 🧪 Testing

- `yarn test` — Test runner interactivo
- Existen tests básicos en `src/App.test.js`
- Para código nuevo, agregar tests si es lógica compleja

---

## 🚀 Comandos de Desarrollo

```bash
yarn start      # Dev server en localhost:3000
yarn build      # Build de producción → carpeta build/
yarn test       # Tests interactivos
```

---

## 📡 Integración con Backend

- **Base URL:** `https://api.smarthydro.app`
- **Docs:** https://api.smarthydro.app/docs
- El backend está **listo y separado** de este repo
- Todas las llamadas pasan por el orquestador (`src/api/orchestrator.js`)
- El orquestador maneja múltiples backends (`sh/`, `novus/`)
- URLs de API configuradas en `src/api/sh/config.js` y `src/api/novus/config.js`
- Autenticación vía **Bearer Token JWT** guardado en `localStorage` (manejado por `AuthContext`)
- Header requerido: `Authorization: Bearer <token>`
- Formato: JSON. Toda comunicación es HTTPS.

### 🔑 Autenticación

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/ik/login/` | POST | Login optimizado. Devuelve token + perfil. **Usar este.** |
| `/api/users/login/` | POST | Login legacy. Devuelve token + perfil completo. |
| `/api/users/me/` | GET | Perfil del usuario autenticado. |
| `/api/users/change-password/` | POST | Body: `current_password`, `new_password` |
| `/api/password_reset/` | POST | Solicitar email de reset. Público. |

### 📍 Puntos de Captación (Catchment Points)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/ik/points_summary/` | GET | Resumen de todos los puntos + última telemetría. Opcional: `?limit=&offset=` |
| `/api/ik/point/<id>/summary/` | GET | Detalle completo de un punto: estado, últimos valores, config. |
| `/api/ik/dashboard_stats/` | GET | KPIs del Centro de Control: totales, activos, alertas, desconectados. |
| `/api/ik/point/<id>/calendar/` | GET | Datos diarios últimos N días. `?days=7` (max 30). |
| `/api/ik/point/<id>/variables/` | GET | Mapeo de variables del punto (id → display_key). |
| `/api/ik/my_points/` | GET | Lista liviana (id + title) para dropdowns. |

### 📊 Batch / Telemetría (Endpoints optimizados)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/ik/batch/telemetry/` | POST | Telemetría multi-punto. Body: `point_ids`, `hours` (max 168). |
| `/api/ik/batch/stats/` | POST | Stats agregados multi-punto. Body: `point_ids`, `days` (max 365). |

> **IMPORTANTE:** El orquestador usa estos endpoints BATCH nativos para evitar N requests individuales. Usar SIEMPRE el orquestador.

### 🎫 Tickets de Soporte

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/ik/tickets/` | GET/POST | Listar/Crear ticket. Body POST: `title`, `message`, `point_catchment` (opc), `emails` (opc). |
| `/api/ik/tickets/<id>/` | GET/PATCH | Detalle / Actualizar ticket. |
| `/api/ik/tickets/<id>/comments/` | POST | Agregar comentario. |
| `/api/ik/tickets/<id>/assign/` | POST | Asignar ticket a usuario. |
| `/api/ik/tickets/<id>/status/` | POST | Cambiar estado (abierto, en progreso, cerrado). |
| `/api/ik/tickets/<id>/attachments/` | POST | Subir archivo adjunto. |
| `/api/ik/tickets/stats/` | GET | Estadísticas de tickets. |

### 📋 Registros de Telemetría (Raw Data)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/interaction_detail_json/` | GET | CRUD JSON de telemetría. Filtros: `catchment_point`, `date_time_medition__gte`, `hour`, `year`, `month`, `is_error`, `send_dga`. Default últimas 24h. |
| `/api/interaction_detail/` | GET | Descarga XLSX de telemetría. Mismos filtros. |
| `/api/interaction_detail_dga/` | GET | Descarga XLSX filtrado solo registros DGA. |

### 🚨 Alertas

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/alert_rules/` | GET/POST | Listar/Crear reglas. Tipos: `THRESHOLD_MAX`, `THRESHOLD_MIN`, `NO_DATA`, `DISCONNECTION`, `RECONNECTION`, `PROCESSING_ERROR`. |
| `/api/alert_channels/` | GET | Canales: EMAIL, GOOGLE_CHAT, WEBHOOK, SMS. |
| `/api/alert_triggers/` | GET | Historial de disparos. Filtros: `alert_rule`, `notification_sent`, `is_acknowledged`. |
| `/api/system_events/` | GET | Eventos del sistema: resets, errores de medición, cambios de config. |

### 📈 Reportes

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/reports/json/by-project/` | GET | JSON resumen por proyecto últimos 30 días. `?project_id=&point_ids=` |
| `/api/reports/json/by-point/` | GET | JSON datos diarios agregados. `?point_id=&year=&month=` |
| `/api/reports/by-project/` | GET | Excel análisis por proyecto. `?project_id=` |
| `/api/reports/by-point/` | GET | Excel análisis por punto. `?point_id=&year=&month=` |
| `/reports/active-points/` | GET | Excel con todos los puntos activos y última telemetría. |

### 🔧 Management / Admin

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/management/points_status/` | GET | Estado de puntos: activos, desconectados, sin datos. `?days=7` |
| `/api/management/system_status/` | GET | Estado general: contenedores, DB, Redis, colas DGA/SMA. |
| `/api/management/telemetry_metrics/` | GET | Métricas de ingesta: registros/hora, errores, latencia. |
| `/api/management/dga_queue_status/` | GET | Estado cola DGA. **Staff only.** |
| `/api/management/requeue_dga/` | POST | Reencolar registros DGA fallidos. **Staff only.** |

### ⚠️ Manejo de Errores HTTP

| Código | Significado | Acción |
|--------|-------------|--------|
| `200` | OK | — |
| `201` | Created | — |
| `400` | Bad Request | Revisar body/query params. `limit` debe ser numérico. |
| `401` | Unauthorized | Token ausente/inválido/expirado. Renovar vía `/api/ik/login/`. Redirigir a `/login`. |
| `403` | Forbidden | Sin permisos. Verificar owner/viewer del punto o staff. |
| `404` | Not Found | Verificar ID. Algunos endpoints filtran por permisos de usuario. |
| `429` | Too Many Requests | Rate limit excedido. Anon: 100/h, User: 1000/h. El orquestador maneja esto. |
| `500` | Internal Error | Reintentar en 30s. Si persiste, mostrar error al usuario. |

### 🌐 Dominio del Negocio

- **Punto de captación (catchment point):** Ubicación física donde se mide agua (río, pozo, canal). Tiene un dispositivo IoT asociado.
- **Telemetría:** Datos automáticos de sensores: caudal (L/s), nivel (m), total acumulado (m³), estado de conexión.
- **Regla de alerta:** Monitorea un punto. Detecta: umbral superado, desconexión, reconexión, error de procesamiento.
- **DGA/SMA:** Compliance regulatorio chileno. La API envía datos automáticamente según estándar (Mayor, Medio, Menor).
- **Ticket:** Solicitud de ayuda técnica vinculada a un punto. Incluye comentarios, adjuntos, asignación y seguimiento.
- **Reporte:** Exportación Excel/JSON por proyecto, punto o período. Incluye consumos, caudales, niveles y estadísticas.

---

## 🤖 Flujo de Trabajo con Agentes de OpenCode

Este proyecto usa un flujo **Architect → Planner → Coder → Reviewer** con modelos optimizados por rol.

### Roles y Modelos

| Rol | Agente | Modelo | Temperatura | Cuando usar |
|-----|--------|--------|-------------|-------------|
| **Arquitecto** | `@architect` | `kimi-for-coding/k2p6` | 0.3 | Features complejas que requieren diseno arquitectonico y evaluacion de trade-offs |
| **Planificador** | `@planner` | `kimi-for-coding/k2p6` | 0.3 | Analisis, investigacion y generacion de planes detallados. NO escribe codigo en `src/` |
| **Ejecutor Principal** | `@coder` / `@frontend-coder` | `opencode-go/deepseek-v4-pro` | 0.1 | Implementacion de features. Lee plan y ejecuta. NO analiza, NO planifica |
| **Ejecutor Rapido** | `@fast` | `opencode-go/deepseek-v4-flash` | 0.05 | Tareas mecanicas: renombrados, movimientos, refactors simples, formato |
| **Revisor** | `@reviewer` | `kimi-for-coding/k2p6` | 0.2 | Validacion de calidad contra plan y AGENTS.md |
| **Revisor Premium** | `@reviewer-zen` | `opencode/claude-sonnet-4-6` | 0.2 | Revision elite para codigo critico (pay-as-you-go, usar con moderacion) |
| **Test Engineer** | `@test-engineer` | `kimi-for-coding/k2p6` | 0.2 | Escribe tests con React Testing Library y Jest |
| **API Validator** | `@api-validator` | `opencode-go/qwen3.6-plus` | 0.1 | Valida endpoints contra api.smarthydro.app/docs y uso de orchestrator |
| **UI Auditor** | `@ui-auditor` | `opencode-go/deepseek-v4-flash` | 0.1 | Revisa consistencia visual: Smart Components, CSS variables, responsive, dark mode |
| **Performance** | `@performance` | `opencode-go/deepseek-v4-flash` | 0.1 | Detecta cuellos de botella: memoizacion, re-renders, bundle size |
| **Migrator** | `@migrator` | `kimi-for-coding/k2p6` | 0.1 | Migra codigo legacy a patrones modernos |
| **Git Agent** | `@git-agent` | `opencode-go/deepseek-v4-flash` | 0.1 | Commits descriptivos y push seguro |

### Flujo Recomendado

**Feature Simple** (componente, tabla, formulario):
```
@planner -> [revisas plan] -> @api-validator (chequea endpoints) -> @coder -> @ui-auditor -> [opcional] @test-engineer -> @reviewer
```

**Feature Compleja** (modulo nuevo, arquitectura nueva):
```
@architect -> [revisas spec] -> @planner -> [revisas plan] -> @api-validator -> @coder -> @ui-auditor -> @test-engineer -> @reviewer -> [si critico] @reviewer-zen
```

**Tarea Mecanica** (renombrar, mover, formatear):
```
@fast -> listo
```

**Migracion Legacy**:
```
@migrator -> @ui-auditor -> @test-engineer -> @reviewer
```

**Optimizacion Performance**:
```
@performance -> [aplicas sugerencias] -> @reviewer
```

### Modelos Disponibles (referencia)

**OpenCode Go** (suscripcion $10/mes, limites: $12/5h, $30/semana, $60/mes):
- SOTA: `deepseek-v4-pro`, `qwen3.7-max`, `mimo-v2.5-pro`
- Balanced: `qwen3.6-plus`, `minimax-m2.7`, `minimax-m3`, `mimo-v2.5`, `glm-5`
- Kimi For Coding: `k2p6` (planificacion y arquitectura)
- Fast/Cheap: `deepseek-v4-flash` (~31,650 req/5h), `qwen3.6-plus` (~3,300 req/5h), `minimax-m2.5` (~6,300 req/5h)

**OpenCode Zen** (pay-as-you-go, usar solo para casos criticos):
- Claude: `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5`
- GPT: `gpt-5.4`, `gpt-5.5-pro`, `gpt-5.1-codex-max`
- Gemini: `gemini-3.1-pro`, `gemini-3.5-flash`
- Free: `big-pickle`, `mimo-v2.5-free`, `minimax-m3-free`, `nemotron-3-super-free`

**Kimi For Coding** (API configurada en OpenCode):
- `kimi-for-coding/k2p6` — Usado por `@planner` y `@architect` para razonamiento profundo, planificacion y diseno arquitectonico

**Asignacion completa de modelos por agente:**

| Agente | Modelo | Provider | Uso |
|--------|--------|----------|-----|
| `@planner` | `kimi-for-coding/k2p6` | Kimi For Coding | Planificacion y analisis |
| `@architect` | `kimi-for-coding/k2p6` | Kimi For Coding | Arquitectura de features complejas |
| `@frontend-coder` | `opencode-go/deepseek-v4-pro` | OpenCode Go | Implementacion de codigo |
| `@fast-coder` | `opencode-go/deepseek-v4-flash` | OpenCode Go | Tareas mecanicas rapidas |
| `@reviewer` | `kimi-for-coding/k2p6` | Kimi For Coding | Revision de calidad |
| `@reviewer-zen` | `opencode/claude-sonnet-4-6` | OpenCode Zen | Revision elite (pay-as-you-go) |
| `@test-engineer` | `kimi-for-coding/k2p6` | Kimi For Coding | Tests con React Testing Library |
| `@api-validator` | `opencode-go/qwen3.6-plus` | OpenCode Go | Validacion de endpoints API |
| `@ui-auditor` | `opencode-go/deepseek-v4-flash` | OpenCode Go | Auditoria de consistencia visual |
| `@performance` | `opencode-go/deepseek-v4-flash` | OpenCode Go | Optimizacion de performance |
| `@migrator` | `kimi-for-coding/k2p6` | Kimi For Coding | Migracion de codigo legacy |
| `@git-agent` | `opencode-go/deepseek-v4-flash` | OpenCode Go | Commits y push seguro |

**Kimi CLI** (suscripcion aparte - herramienta adicional):
- Usar Kimi CLI directamente para analisis ad hoc, investigacion profunda, o revisiones elite
- El resultado se puede pasar a @planner para desglosar en tareas ejecutables

---

## 🆘 Recursos Utiles en el Repo

- `src/utils/GUIA_LAYOUT_MODERNO.md` — Guia de layout responsive
- `src/utils/GUIA_IMPLEMENTACION_RESPONSIVA.md` — Implementacion mobile
- `src/utils/SOLUCION_SIDEBAR_MOVIL.md` — Sidebar mobile
- `src/SOLUCION_APLICADA.md` — Soluciones previas aplicadas
- `src/examples/` — Ejemplos de migracion y patrones
- `.opencode/templates/plan.md` — Plantilla para planes de implementacion
- `.opencode/plans/EJEMPLO-plan-feature.md` — Ejemplo de plan generado

---

## 📝 Notas para Agentes

- Este proyecto es un **dashboard IoT de gestion hidrica** (pozos, telemetria, cumplimiento DGA)
- Los usuarios principales son operadores de campo y administradores
- Los datos se refrescan en tiempo real (30s TTL para telemetria)
- El rendimiento es critico: evitar re-renders innecesarios, usar `useMemo`/`useCallback` cuando aporte valor
- Respetar siempre el sistema de diseno establecido (colores, espaciado, border-radius)

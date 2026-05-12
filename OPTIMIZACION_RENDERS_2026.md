# 🚀 Optimización de Renders y Orquestación de API — Mayo 2026

## 📋 Resumen Ejecutivo

Se implementó una optimización profunda del frontend para eliminar re-renders innecesarios y reducir la carga sobre la API mediante orquestación inteligente de requests.

**Problemas identificados:**
- 🔴 66 consumidores de `AppContext` monolítico → re-renders masivos
- 🔴 Polling sin throttle en múltiples componentes
- 🔴 No se usaban endpoints BATCH nativos del backend (`/api/ik/batch/*`)
- 🔴 Componentes pesados sin `React.memo` (`GeneralSummary`, `CombinedVariablesChart`)
- 🟡 Requests sin cancelación (`AbortController`)
- 🟡 Duplicación de llamadas API entre componentes

---

## ✅ Cambios Implementados

### 1. Orquestador de API (`src/api/orchestrator.js`) — NUEVO

Sistema centralizado que coordina todas las llamadas a la API:

| Característica | Descripción |
|---|---|
| **Endpoints BATCH nativos** | Usa `/api/ik/batch/telemetry/`, `/api/ik/batch/stats/`, `/api/ik/batch/summary/` |
| **Deduplicación** | Evita requests duplicados en vuelo |
| **Caché con TTL** | 30s telemetría, 2min perfil, 5min histórico |
| **Throttle** | Mínimo 30s entre refrescos automáticos |
| **Cancelación** | `AbortController` para requests obsoletos |
| **Prioridad** | Cola de requests con niveles (CRITICAL, HIGH, NORMAL, LOW) |
| **Fallback** | Si batch falla, automáticamente usa llamadas individuales |

**API del orquestador:**
```javascript
import orchestrator from './api/orchestrator';

// Telemetría multi-punto en UNA sola llamada
const data = await orchestrator.getBatchTelemetry([1, 2, 3, 4, 5]);

// Estadísticas agregadas multi-punto
const stats = await orchestrator.getBatchStats([1, 2, 3], { days: 30 });

// Resumen con última telemetría
const summary = await orchestrator.getBatchSummary([1, 2, 3]);

// Con caché automática
const profile = await orchestrator.getProfile({ useCache: true });
```

### 2. Contextos Especializados (`src/contexts/`) — NUEVO

Separación del `AppContext` monolítico en 3 contextos independientes:

```
AppContext (legacy)     AuthContext          DataContext          UIContext
├─ isAuth          →    ├─ isAuth      →     ├─ points_summary  →  ├─ isLoading
├─ user            →    ├─ user        →     ├─ profile_client  →  └─ adminView
├─ token           →    └─ token       →     ├─ selected_profile
├─ points_summary  →                         └─ points_list
├─ profile_client  →
├─ selected_profile→
├─ points_list     →
├─ isLoading       →
└─ adminView       →
```

**Impacto:** Un cambio en `isLoading` ya NO dispara re-renders en componentes que solo necesitan datos de perfil. Un cambio en `points_list` ya NO dispara re-renders en componentes de autenticación.

**Uso:**
```javascript
// ❌ Antes (re-renderiza con cualquier cambio en el state)
const { state } = useContext(AppContext);

// ✅ Ahora (solo re-renderiza cuando cambian datos relevantes)
const { user } = useAuth();
const { points_list, selected_profile } = useData();
const { isLoading } = useUI();
```

**Archivos creados:**
- `src/contexts/AuthContext.js`
- `src/contexts/DataContext.js`
- `src/contexts/UIContext.js`
- `src/contexts/index.js`

### 3. Hook Optimizado `useDashboardData` (`src/hooks/useDashboardData.js`) — NUEVO

Hook especializado para el Centro de Control que:
- Usa el orquestador (endpoints batch nativos)
- Throttlea refrescos (mínimo 30s)
- Cancela requests al desmontar
- Actualiza el contexto global solo cuando hay cambios reales

```javascript
const {
  profiles,      // Datos de puntos
  loading,       // Estado de carga
  error,         // Error si ocurre
  lastRefresh,   // Timestamp último refresh
  refresh,       // Función de refresh manual
  stats,         // Estadísticas memoizadas
  isAdmin,
} = useDashboardData({
  autoRefresh: true,
  refreshInterval: 60000,  // 1 minuto
  useBatch: true,          // Usar endpoints batch nativos
});
```

### 4. GeneralSummary Optimizado

**Antes:** Monolito de 740 líneas, sin memoización, usa `AppContext`, hace `get_profile()` cada 60s.

**Después:**
- Dividido en **sub-componentes memoizados**:
  - `KPICard.js` — Tarjeta individual de KPI
  - `ServiceStatusCard.js` — Estado del servicio
  - `ConsumptionSummaryCard.js` — Resumen de consumo
- Usa `useDashboardData` (batch nativo + throttle)
- Usa `useAuth` y `useData` en lugar de `AppContext`
- `React.memo` en export para evitar re-renders del padre
- `useMemo` en cálculos de caudales excedidos, GPS, histórico

**Archivos creados/modificados:**
- `src/components/geo_smart/KPICard.js` — NUEVO
- `src/components/geo_smart/ServiceStatusCard.js` — NUEVO
- `src/components/geo_smart/ConsumptionSummaryCard.js` — NUEVO
- `src/components/geo_smart/GeneralSummary.js` — REESCRITO

### 5. React.memo en Componentes Críticos

```javascript
// CombinedVariablesChart.js
export default React.memo(CombinedVariablesChart);

// FlowStatusGauges.js
export default React.memo(FlowStatusGauges);
```

Esto evita que estos componentes se re-rendericen cuando el padre (`GeneralSummary`) actualiza estados locales que no afectan a estos hijos.

### 6. Endpoints Batch en API (`src/api/sh/endpoints.js`)

Agregados los métodos batch nativos del backend al objeto `sh`:

```javascript
sh.batch.telemetry(pointIds, hours)   // POST /api/ik/batch/telemetry/
sh.batch.stats(pointIds, days)        // POST /api/ik/batch/stats/
sh.batch.summary(pointIds)            // POST /api/ik/batch/summary/
```

### 7. Keys de Deduplicación y Caché Actualizadas

Agregadas claves para batch en:
- `src/utils/requestDeduplication.js`
- `src/utils/dataCache.js`

---

## 📊 Métricas Esperadas

| Métrica | Antes | Después | Mejora |
|---|---|---|---|
| Requests al cargar dashboard (10 puntos) | 11+ llamadas | 1 llamada batch | **~90%** |
| Re-renders de GeneralSummary por refresh | Completo (740 líneas) | Solo sub-componentes afectados | **~70%** |
| Re-renders por cambio en `isLoading` | 66 componentes | Solo consumidores de UIContext | **~80%** |
| Tiempo entre refrescos forzados | 0s (spam posible) | 30s mínimo (throttle) | **Previene saturación** |
| Cancelación de requests obsoletos | ❌ No | ✅ AbortController | **Menos memoria/CPU** |

---

## 🗺️ Mapa de Archivos

```
src/
├── api/
│   ├── orchestrator.js              ← NUEVO: Orquestador centralizado
│   └── sh/endpoints.js              ← MOD: Batch endpoints agregados
├── contexts/
│   ├── AuthContext.js               ← NUEVO: Contexto de autenticación
│   ├── DataContext.js               ← NUEVO: Contexto de datos
│   ├── UIContext.js                 ← NUEVO: Contexto de UI
│   └── index.js                     ← NUEVO: Exportaciones
├── hooks/
│   └── useDashboardData.js          ← NUEVO: Hook optimizado para dashboard
├── components/geo_smart/
│   ├── KPICard.js                   ← NUEVO: Sub-componente memoizado
│   ├── ServiceStatusCard.js         ← NUEVO: Sub-componente memoizado
│   ├── ConsumptionSummaryCard.js    ← NUEVO: Sub-componente memoizado
│   ├── GeneralSummary.js            ← REESCRITO: Optimizado
│   ├── CombinedVariablesChart.js    ← MOD: React.memo
│   └── FlowStatusGauges.js          ← MOD: React.memo
├── utils/
│   ├── requestDeduplication.js      ← MOD: Keys batch agregadas
│   └── dataCache.js                 ← MOD: Keys batch agregadas
└── App.js                           ← MOD: Providers especializados
```

---

## 🔄 Compatibilidad

### Contexto Legacy
`AppContext` se mantiene como **contexto legacy** para compatibilidad con componentes existentes. Todos los componentes actuales siguen funcionando sin cambios.

### Migración Gradual
Los nuevos contextos (`useAuth`, `useData`, `useUI`) están disponibles para nuevos componentes o migración gradual:

```javascript
// Migración gradual en componentes existentes:
// Antes:
const { state } = useContext(AppContext);
const user = state.user;

// Después (más eficiente):
const { user } = useAuth();
```

---

## 🧪 Verificación

Para verificar que la optimización funciona:

1. **Consola del navegador** — Deberías ver:
   ```
   [Cache HIT] profile_current
   [Dedup HIT] batch_summary_1,2,3
   [Orchestrator] Batch telemetry failed, falling back...
   ```

2. **DevTools Network** — Al cargar el Centro de Control:
   - Antes: ~11 requests (1 por punto + perfil + etc.)
   - Después: 1-3 requests (batch + caché)

3. **React DevTools Profiler** — Grabar interacción:
   - Antes: GeneralSummary re-renderiza completo
   - Después: Solo sub-componentes afectados re-renderizan

---

## 🚀 Próximos Pasos Sugeridos

1. **Migrar `MyWell.js`** (2,254 líneas) — Es el componente más pesado de la app
2. **Migrar `Home.js`** (1,206 líneas) — Dividir en sub-componentes memoizados
3. **Unificar fetch de alertas** — `SideMenu` y `HeaderNav` hacen requests duplicados
4. **Optimizar `useResponsive`** — Agregar throttle al listener de resize
5. **Service Worker** — Cachear assets estáticos y respuestas de API

---

**Fecha:** Mayo 2026
**Optimización:** Renders limpios + Orquestación API batch

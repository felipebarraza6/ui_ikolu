# Plan Completo: Refactorización Centro de Control + Fix Padding Bug

## 🐛 BUG CRÍTICO: Padding colapsado en Light Mode

### Problema
En light mode, el contenedor de tabs parece no tener padding porque `token.colorBgContainer` y `token.colorBorder` generan colores muy similares al fondo de la página.

### Causa Raíz
- `ControlCenterLayout.js` línea 155-161: Div con estilos inline `padding: 24, marginTop: 24`
- No usa la clase `.ocean-tabs-container` que está definida en `ocean-theme.css`
- Duplicación de estilos: inline vs CSS class
- En dark mode el contraste es alto (se ve bien), en light mode el contraste es bajo (parece sin padding)

### Fix
1. **Unificar estilos:** Usar consistentemente la clase `.ocean-tabs-container` en lugar de estilos inline
2. **Agregar sombra sutil:** En light mode, agregar `box-shadow` para definir el límite del contenedor
3. **Variables CSS:** Usar variables para que el padding sea consistente en ambos modos

```css
/* En ocean-theme.css - agregar */
.ocean-tabs-container {
  margin-top: 24px;
  padding: 24px;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); /* Sutil en light */
}

/* En dark mode (ya definido en media query o clase dark) */
.dark .ocean-tabs-container,
[data-theme="dark"] .ocean-tabs-container {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2); /* Más pronunciado en dark */
}
```

---

## 🏗️ REFACTORIZACIÓN: Centro de Control

### Fase 1: Reorganización de Estructura de Archivos

**Objetivo:** Separar responsabilidades, eliminar el monolito ControlCenter.js

#### Nueva estructura propuesta:
```
src/features/control-center/
├── index.js                          # Barrel export
├── README.md                         # Documentación del feature
│
├── containers/
│   └── ControlCenterContainer.js     # Orquestador puro (lógica, no UI)
│
├── layout/
│   └── ControlCenterLayout.js        # KPIs + Tabs structure
│
├── tabs/
│   ├── TelemetryTab/
│   │   ├── index.js
│   │   ├── TelemetryTable.js         # Tabla de telemetría
│   │   └── TelemetryCards.js         # Cards de consumo semanal
│   └── ComplianceTab/
│       ├── index.js
│       ├── ComplianceTable.js
│       └── ComplianceCards.js
│
├── drawers/
│   ├── index.js
│   ├── MeasurementsDrawer/
│   │   ├── index.js
│   │   ├── MeasurementsHeader.js
│   │   └── MeasurementsContent.js
│   ├── ComplianceDetailDrawer/
│   ├── WarningsDrawer/
│   ├── FlowAnalysisDrawer/
│   ├── SupportDrawer/
│   ├── PointConfigDrawer/
│   ├── StopComplianceDrawer/
│   └── StopTelemetryDrawer/
│
├── components/
│   ├── index.js
│   ├── StatusBadge.jsx               # Ya existe
│   ├── ActionButtons.jsx             # Ya existe
│   ├── ConsumptionCell.jsx           # Ya existe
│   ├── PointHeader.jsx               # Ya existe
│   └── BlinkingDot.jsx               # NUEVO - punto parpadeante
│
├── hooks/
│   ├── index.js
│   ├── useControlCenter.js           # Ya existe (simplificar)
│   ├── useTelemetryData.js           # NUEVO
│   ├── useComplianceData.js          # NUEVO
│   └── useDrawers.js                 # NUEVO - manejo de drawers
│
├── stores/
│   └── controlCenterStore.js         # Refactorizar
│
├── utils/
│   ├── index.js
│   ├── transformDashboardStats.js    # Extraer del hook
│   └── chartConfig.js                # Mover desde constants/
│
└── constants/
    └── chartColors.js                # Ya existe
```

### Fase 2: Unificación de Estado en Zustand

**Problema actual:** Duplicación entre `useControlCenter` (React state) y `controlCenterStore` (Zustand)

**Solución:**
```javascript
// controlCenterStore.js - Nueva estructura
export const useControlCenterStore = create((set, get) => ({
  // Data state (antes en useControlCenter)
  data: null,
  loading: true,
  error: null,
  lastRefresh: null,
  
  // UI state (ya existente)
  activeTab: 'telemetry',
  selectedDate: null,
  
  // Drawers state (simplificado)
  drawers: {
    measurements: { open: false, pointId: null },
    complianceDetail: { open: false, record: null },
    warnings: { open: false },
    flowAnalysis: { open: false, pointId: null },
    support: { open: false },
    pointConfig: { open: false, pointId: null },
    stopCompliance: { open: false, pointId: null },
    stopTelemetry: { open: false, pointId: null },
  },
  
  // Actions
  setData: (data) => set({ data, loading: false, error: null, lastRefresh: new Date() }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Drawer actions genéricas
  openDrawer: (name, payload = {}) => set((state) => ({
    drawers: { ...state.drawers, [name]: { open: true, ...payload } }
  })),
  closeDrawer: (name) => set((state) => ({
    drawers: { ...state.drawers, [name]: { open: false, ...state.drawers[name] } }
  })),
  closeAllDrawers: () => set((state) => ({
    drawers: Object.keys(state.drawers).reduce((acc, key) => ({
      ...acc, [key]: { ...state.drawers[key], open: false }
    }), {})
  })),
  
  // Async actions
  fetchData: async (signal) => {
    set({ loading: true, error: null });
    try {
      const [stats, compliance] = await Promise.all([
        orchestrator.dashboardStats(signal),
        orchestrator.compliance(signal)
      ]);
      const transformed = transformDashboardStats(stats, compliance);
      set({ data: transformed, loading: false, lastRefresh: new Date() });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  
  // Selectors
  getOverview: () => get().data?.overview || {},
  getPoints: () => get().data?.points || [],
  getWarnings: () => get().data?.warnings || [],
}));
```

### Fase 3: Simplificación de ControlCenter.js

**Actual:** 753 líneas, maneja todo
**Objetivo:** 150 líneas máximo, solo orquestación

```javascript
// ControlCenterContainer.js
const ControlCenterContainer = () => {
  const { data, loading, error, fetchData } = useControlCenterStore();
  const { activeTab, setActiveTab } = useControlCenterStore();
  
  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);
  
  if (error) return <ErrorState error={error} onRetry={fetchData} />;
  
  return (
    <ControlCenterLayout
      loading={loading}
      overview={data?.overview}
      points={data?.points}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};
```

### Fase 4: Componente BlinkingDot Reutilizable

```javascript
// components/BlinkingDot.jsx
const BlinkingDot = ({ 
  size = 12, 
  color = '#ffffff',
  variant = 'telemetry', // 'telemetry' | 'warning' | 'critical'
  active = true,
  style = {}
}) => {
  const animations = {
    telemetry: 'telemetry-dot-blink 2s ease-in-out infinite',
    warning: 'warning-dot-blink 1.2s ease-in-out infinite',
    critical: 'critical-dot-blink 0.8s ease-in-out infinite',
  };
  
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      animation: active ? animations[variant] : 'none',
      boxShadow: `0 0 ${size}px ${size/4}px ${color}40`,
      flexShrink: 0,
      ...style,
    }} />
  );
};
```

### Fase 5: Limpieza de CSS

**Consolidar archivos:**
- `animations.css` → Mantener animaciones globales
- `global-animations.css` → Merge con animations.css
- `ControlCenter.css` → Mover estilos específicos a componentes (Emotion) o CSS modules
- `ocean-theme.css` → Mantener, pero limpiar duplicados

**Eliminar duplicados:**
- `warning-double-blink` vs `pulse-badge`
- `fade-in-up` vs `fade-in-up-smooth`
- `shimmer` vs `shimmer-ocean`

### Fase 6: Drawer Components Independientes

**Cada drawer como feature independiente:**
```javascript
// drawers/MeasurementsDrawer/index.js
const MeasurementsDrawer = () => {
  const { drawers, closeDrawer } = useControlCenterStore();
  const { open, pointId } = drawers.measurements;
  
  return (
    <Drawer open={open} onClose={() => closeDrawer('measurements')}>
      <MeasurementsContent pointId={pointId} />
    </Drawer>
  );
};
```

---

## 📋 Tareas Detalladas

### Tarea 1: Fix Padding Bug (CRÍTICO)
- [ ] Agregar clase `.ocean-tabs-container` al div en ControlCenterLayout.js
- [ ] Agregar `box-shadow` sutil para light mode
- [ ] Verificar visualmente en ambos modos
- [ ] Eliminar estilos inline duplicados

### Tarea 2: Crear estructura de carpetas
- [ ] Crear directorios: `containers/`, `tabs/`, `drawers/`, `utils/`
- [ ] Mover archivos existentes a nueva estructura
- [ ] Actualizar imports
- [ ] Crear barrel exports (`index.js`)

### Tarea 3: Refactorizar Zustand Store
- [ ] Unificar estado de datos y UI
- [ ] Agregar actions genéricas para drawers
- [ ] Mover `transformDashboardStats` a `utils/`
- [ ] Agregar async action `fetchData`

### Tarea 4: Crear ControlCenterContainer
- [ ] Extraer lógica de ControlCenter.js
- [ ] Usar Zustand store en lugar de useControlCenter hook
- [ ] Manejar loading/error states
- [ ] Integrar con ControlCenterLayout

### Tarea 5: Crear componente BlinkingDot
- [ ] Crear `components/BlinkingDot.jsx`
- [ ] Reemplazar iconos en SmartKPICard (Telemetry y Warning)
- [ ] Reemplazar icono en StatusBadge
- [ ] Agregar animaciones CSS

### Tarea 6: Separar Drawers
- [ ] Crear componente base Drawer
- [ ] Migrar cada drawer a archivo independiente
- [ ] Usar store genérico para open/close
- [ ] Eliminar estado local de drawers de ControlCenter.js

### Tarea 7: Limpiar CSS
- [ ] Consolidar animations.css + global-animations.css
- [ ] Mover estilos de ControlCenter.css a componentes
- [ ] Eliminar clases CSS no usadas
- [ ] Verificar que no hay duplicados

### Tarea 8: Testing y Verificación
- [ ] `yarn build` compila sin errores
- [ ] Tabs funcionan correctamente
- [ ] Drawers abren/cierran
- [ ] Datos se cargan correctamente
- [ ] Dark/light mode se ven bien
- [ ] Padding bug está fixeado
- [ ] Blinking dots funcionan

---

## 🎯 Criterios de Aceptación

1. **ControlCenter.js** tiene máximo 150 líneas
2. **No hay duplicación de estado** entre React y Zustand
3. **Cada drawer** está en su propio archivo
4. **Padding bug** fixeado en ambos modos
5. **Blinking dots** reemplazan iconos correctamente
6. **Build** compila sin errores
7. **Funcionalidad** 100% preservada (no se pierde ninguna feature)

---

## ⚠️ Consideraciones

- **No modificar API layer** (orchestrator, endpoints)
- **No modificar shared/ui/** (Smart* components)
- **No modificar contexts** (Auth, Theme, Data, Tour)
- **Preservar comportamiento exacto** de drawers, tabs, export CSV, chat
- **Mantener compatibilidad** con ModuleTour
- **Feature flag opcional:** Si es muy grande, hacer migración gradual

---

## 📁 Archivos a Modificar (aproximado)

### Nuevos archivos (~15):
- `containers/ControlCenterContainer.js`
- `tabs/TelemetryTab/index.js`
- `tabs/ComplianceTab/index.js`
- `drawers/index.js`
- `drawers/MeasurementsDrawer/index.js`
- `drawers/ComplianceDetailDrawer/index.js`
- `drawers/WarningsDrawer/index.js`
- `drawers/FlowAnalysisDrawer/index.js`
- `drawers/SupportDrawer/index.js`
- `drawers/PointConfigDrawer/index.js`
- `drawers/StopComplianceDrawer/index.js`
- `drawers/StopTelemetryDrawer/index.js`
- `components/BlinkingDot.jsx`
- `utils/transformDashboardStats.js`
- `hooks/useDrawers.js`

### Archivos a modificar (~10):
- `ControlCenter.js` → Simplificar
- `ControlCenterLayout.js` → Fix padding
- `stores/controlCenterStore.js` → Refactorizar
- `hooks/useControlCenter.js` → Simplificar o eliminar
- `styles/animations.css` → Agregar dot animations
- `styles/ocean-theme.css` → Fix padding class
- `components/StatusBadge.jsx` → Usar BlinkingDot
- `measurements/MeasurementDrawer.js` → Mover a drawers/
- `CCComplianceDetailDrawer.js` → Mover a drawers/
- `WarningsDrawer.js` → Mover a drawers/

### Archivos a eliminar (~3):
- `ControlCenter.css` (mover a componentes)
- `global-animations.css` (merge con animations.css)
- Posiblemente `useControlCenter.js` (si se mueve todo a store)

**Total: ~28 archivos afectados**

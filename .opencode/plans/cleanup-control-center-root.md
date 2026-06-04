# Plan: Cleanup y Estandarización de Control Center + Patrones Reutilizables

## Hallazgos del Análisis

### Problema 1: CSS Aislado en Feature
`ControlCenter.css` (156 líneas) es el **único** archivo CSS dentro de `features/`. Toda la app usa Emotion + CSS variables, pero control-center tiene su propio CSS con:
- Animaciones (`fade-in-up`, `chat-bounce`, `pulse-glow`, `tab-fade-in`)
- Estilos de tabs container (`.ocean-tabs-container`)
- Estilos mobile (media queries)
- Overrides de Ant Design (sort arrows, apexcharts toolbar)

**Impacto**: Otros features no pueden reutilizar estos estilos. Si creamos un nuevo módulo con tabs, duplicaremos código.

### Problema 2: Drawer Pattern Repetido 13 Veces
Todos los drawers en control-center tienen **exactamente** la misma estructura:
```javascript
const XDrawer = ({ open, onClose, ...props }) => {
  const { token } = useToken();
  return (
    <Drawer
      title={<Flex align="center" gap={8}><Icon /><Text strong>Título</Text></Flex>}
      open={open}
      onClose={onClose}
      width={420} // o 480
    >
      {/* contenido específico */}
    </Drawer>
  );
};
```

**Drawers afectados**: `WarningsDrawer`, `PointConfigDrawer`, `StopTelemetryDrawer`, `StopComplianceDrawer`, `CCSupportDrawer`, `CCFlowAnalysisDrawer`, `CCComplianceDetailDrawer`, `MeasurementsDrawer` (8 en root + subcomponentes)

**Impacto**: Cada nuevo módulo con drawers copiará este patrón. 13 drawers = ~390 líneas de boilerplate idéntico.

### Problema 3: Estructura de Directorios Desordenada
```
control-center/
  ├── ControlCenter.js          # 467 líneas - monolito
  ├── ControlCenterLayout.js    # 207 líneas - layout + KPIs
  ├── ControlCenter.css         # CSS aislado
  ├── ControlCenterChat.js      # Chat integrado
  ├── CCWeekConsumption.js      # Tabla semanal
  ├── CCComplianceTable.js      # Tabla compliance
  ├── CCComplianceDetailDrawer.js  # Drawer
  ├── CCFlowAnalysisDrawer.js   # Drawer
  ├── CCSupportDrawer.js        # Drawer
  ├── CCWarningsSection.js      # Sección warnings
  ├── CCDataTabs.js             # Tabs
  ├── MeasurementsDrawer.js     # Drawer mediciones
  ├── PointConfigDrawer.js      # Drawer config
  ├── StopComplianceDrawer.js   # Drawer stop
  ├── StopTelemetryDrawer.js    # Drawer stop
  ├── VoucherModal.js           # Modal
  ├── WarningsDrawer.js         # Drawer warnings
  ├── ApexChartWrapper.js       # Wrapper gráficos
  ├── ModuleTour.js             # Tour
  ├── TelemetryTab.js           # Tab
  ├── ComplianceTab.js          # Tab
  ├── Skeleton*.js              # 3 skeletons
  ├── components/               # Solo 4 componentes
  ├── measurements/             # Sub-módulo
  ├── hooks/                    # 1 hook
  ├── stores/                   # 1 store
  └── constants/                # 1 archivo
```

**Problemas**:
- 13 archivos en root sin clasificar (drawers, tabs, modals, utils)
- No hay separación clara entre tabs, drawers, y utilidades
- El monolito `ControlCenter.js` (467 líneas) orquesta todo

### Problema 4: Hooks Repetidos
`useToken` de Ant Design se usa **33 veces** solo en control-center. Cada drawer lo importa y usa independientemente.

### Problema 5: Patrón de Feature No Replicable
Si queremos crear un nuevo módulo (ej: "Tickets", "Reportes", "Alertas"), no hay una estructura base clara. Cada feature actual:
- No sigue un patrón consistente
- Mezcla containers, layouts, tabs, drawers en el mismo nivel
- No tiene un "feature template" que seguir

---

## Solución Propuesta

### Fase 1: Crear SmartDrawer Component Reutilizable (Impacto Global)

Crear un componente `SmartDrawer` en `shared/ui/` que encapsule el patrón común:

```jsx
// shared/ui/SmartDrawer/index.jsx
const SmartDrawer = ({
  title,
  icon,
  open,
  onClose,
  width = 420,
  children,
  extra,
  footer,
  ...drawerProps
}) => {
  const { token } = useToken();
  
  return (
    <Drawer
      title={
        <Flex align="center" gap={8}>
          {icon && <Icon style={{ color: token.colorPrimary, fontSize: 16 }} />}
          <Text strong style={{ fontSize: 16 }}>{title}</Text>
        </Flex>
      }
      open={open}
      onClose={onClose}
      width={width}
      footer={footer}
      {...drawerProps}
    >
      {children}
    </Drawer>
  );
};
```

**Archivos a modificar**: Los 8+ drawers de control-center para que usen `SmartDrawer`.

**Beneficio**: Cualquier feature futura con drawers los tendrá consistentes sin copiar 20 líneas de boilerplate.

### Fase 2: Consolidar CSS de Control Center

Mover estilos de `ControlCenter.css` a lugares apropiados:

| Estilo | Destino |
|--------|---------|
| `fade-in-up`, `tab-fade-in` | `src/styles/animations.css` (ya existe) |
| `ocean-tabs-container` | `src/styles/ocean-theme.css` (ya existe) |
| `.chat-dark-input`, `.chat-suggestions` | Emotion en `ControlCenterChat.js` |
| `apexcharts-toolbar` | `src/styles/global-fixes.css` (nuevo) |
| `ant-table-thead` sort arrows | `src/styles/global-fixes.css` (nuevo) |
| Mobile media queries | `src/styles/responsive.css` (nuevo) o `ocean-theme.css` |

**Eliminar**: `ControlCenter.css` por completo.

### Fase 3: Reestructurar Directorios de Control Center

Organizar en carpetas por tipo:

```
control-center/
├── index.js                          # Barrel export
├── containers/
│   └── ControlCenterContainer.js     # Lógica principal
├── layout/
│   └── ControlCenterLayout.js        # KPIs + estructura
├── tabs/
│   ├── telemetry/
│   │   ├── index.js                  # TelemetryTab
│   │   ├── TelemetryTable.js         # Tabla de telemetría
│   │   └── WeekConsumption.js        # CCWeekConsumption renombrado
│   └── compliance/
│       ├── index.js                  # ComplianceTab
│       ├── ComplianceTable.js        # CCComplianceTable renombrado
│       └── ComplianceDetail.js       # CCComplianceDetailDrawer como componente
├── drawers/
│   ├── index.js                      # Barrel export
│   ├── WarningsDrawer.js
│   ├── PointConfigDrawer.js
│   ├── StopTelemetryDrawer.js
│   ├── StopComplianceDrawer.js
│   ├── SupportDrawer.js
│   ├── FlowAnalysisDrawer.js
│   ├── MeasurementsDrawer.js
│   └── VoucherModal.js              # Modal también aquí
├── components/
│   ├── index.js
│   ├── StatusBadge.jsx
│   ├── ActionButtons.jsx
│   ├── ConsumptionCell.jsx
│   ├── PointHeader.jsx
│   ├── BlinkingDot.jsx
│   └── Chat/
│       ├── index.js                  # ControlCenterChat
│       └── ChatInput.jsx             # Extraer de ControlCenterChat
├── hooks/
│   ├── index.js
│   ├── useControlCenter.js
│   └── useDashboardStats.js          # Extraer lógica de API
├── stores/
│   └── controlCenterStore.js
├── utils/
│   ├── index.js
│   ├── transformDashboardStats.js
│   └── chartConfig.js               # Mover desde constants/
└── constants/
    └── index.js                      # Exportar chartColors
```

### Fase 4: Crear Feature Template / Patrón Replicable

Crear una plantilla/documento que defina la estructura estándar para cualquier nuevo feature:

```
features/<feature-name>/
├── index.js                  # Punto de entrada
├── README.md                 # Documentación específica
├── containers/               # Componentes contenedores (lógica)
├── layout/                   # Layouts específicos del feature
├── tabs/                     # Tabs (si aplica)
├── drawers/                  # Drawers/Modals
├── components/               # Componentes reutilizables DENTRO del feature
├── hooks/                    # Hooks específicos
├── stores/                   # Zustand stores
├── utils/                    # Utilidades
└── constants/                # Constantes
```

**Reglas**:
- **NUNCA** archivos CSS sueltos en la feature (usar Emotion o CSS variables globales)
- **NUNCA** mezclar drawers/tabs/modals en el root
- **SIEMPRE** usar `SmartDrawer` para drawers
- **SIEMPRE** usar `SmartCard`, `SmartBadge`, `SmartKPICard` para UI consistente
- **SIEMPRE** skeleton states en componentes con datos dinámicos

### Fase 5: Extraer Patrones Comunes a Shared

Identificar código que se repite y mover a `shared/`:

1. **Drawer Header Pattern** → `shared/ui/SmartDrawer` (Fase 1)
2. **Tab Container Pattern** → `shared/layout/TabContainer` o similar
3. **KPI Row Pattern** → `shared/layout/KPIRow`
4. **Export CSV** → `shared/utils/exportCsv.js` (la lógica en ControlCenterLayout.js)

---

## Tareas Detalladas

### Tarea 1: Crear SmartDrawer Component
- [ ] Crear `src/shared/ui/SmartDrawer/index.jsx`
- [ ] Crear `src/shared/ui/SmartDrawer/index.js` (barrel export)
- [ ] Agregar export a `src/shared/ui/index.js`
- [ ] Documentar uso en AGENTS.md

### Tarea 2: Refactorizar Drawers con SmartDrawer
- [ ] `WarningsDrawer.js` - Usar SmartDrawer
- [ ] `PointConfigDrawer.js` - Usar SmartDrawer
- [ ] `StopTelemetryDrawer.js` - Usar SmartDrawer
- [ ] `StopComplianceDrawer.js` - Usar SmartDrawer
- [ ] `CCSupportDrawer.js` - Usar SmartDrawer
- [ ] `CCFlowAnalysisDrawer.js` - Usar SmartDrawer
- [ ] `CCComplianceDetailDrawer.js` - Usar SmartDrawer
- [ ] `MeasurementsDrawer.js` - Usar SmartDrawer
- [ ] Verificar que todos los drawers funcionan igual

### Tarea 3: Consolidar CSS
- [ ] Mover animaciones de `ControlCenter.css` a `animations.css`
- [ ] Mover estilos de tabs a `ocean-theme.css`
- [ ] Convertir estilos de chat a Emotion en `ControlCenterChat.js`
- [ ] Crear `src/styles/global-fixes.css` para overrides de librerías
- [ ] Mover media queries a `responsive.css` o `ocean-theme.css`
- [ ] Eliminar `ControlCenter.css`
- [ ] Verificar visualmente que todo se ve igual

### Tarea 4: Reestructurar Directorios
- [ ] Crear carpetas faltantes: `tabs/telemetry/`, `tabs/compliance/`, `drawers/`
- [ ] Mover archivos a carpetas correspondientes
- [ ] Renombrar archivos que pierdan prefijo `CC` (ej: `CCWeekConsumption.js` → `tabs/telemetry/WeekConsumption.js`)
- [ ] Actualizar todos los imports
- [ ] Crear barrel exports (`index.js`) en cada carpeta
- [ ] Verificar que `yarn build` compila

### Tarea 5: Extraer Export CSV a Utilidad Compartida
- [ ] Crear `src/shared/utils/exportCsv.js`
- [ ] Mover lógica de export de `ControlCenterLayout.js`
- [ ] Reemplazar uso en `ControlCenterLayout.js`
- [ ] Documentar función

### Tarea 6: Crear Feature Template
- [ ] Crear `src/features/_template/` con estructura base
- [ ] Crear `src/features/_template/README.md` con guía
- [ ] Crear ejemplos: `TemplateContainer.js`, `TemplateLayout.js`, `TemplateDrawer.js`
- [ ] Documentar en AGENTS.md la estructura estándar

### Tarea 7: Testing y Verificación
- [ ] `yarn build` sin errores
- [ ] Todos los drawers abren/cierran correctamente
- [ ] Tabs funcionan
- [ ] Export CSV funciona
- [ ] Visualmente idéntico a antes
- [ ] Dark/light mode correcto

---

## Beneficios

1. **Replicabilidad**: Nuevo módulo = copiar `_template/` y empezar
2. **Consistencia**: Todos los drawers se ven iguales automáticamente
3. **Menos código**: Eliminamos ~390 líneas de boilerplate de drawers
4. **Sin CSS aislado**: Todos los estilos globales o Emotion
5. **Mantenibilidad**: Estructura clara, archivos en su lugar
6. **Escalabilidad**: Fácil agregar nuevos tabs, drawers, o features

---

## Archivos Afectados

### Nuevos:
- `src/shared/ui/SmartDrawer/index.jsx`
- `src/shared/ui/SmartDrawer/index.js`
- `src/shared/utils/exportCsv.js`
- `src/styles/global-fixes.css`
- `src/features/_template/` (directorio completo)

### Modificados:
- `src/shared/ui/index.js` - Agregar SmartDrawer
- `src/features/control-center/ControlCenterLayout.js` - Usar exportCsv utility
- `src/features/control-center/ControlCenterChat.js` - Convertir CSS a Emotion
- `src/styles/animations.css` - Agregar animaciones de ControlCenter
- `src/styles/ocean-theme.css` - Agregar estilos de tabs
- Todos los drawers de control-center - Usar SmartDrawer
- `src/features/control-center/index.js` - Barrel export actualizado

### Eliminados:
- `src/features/control-center/ControlCenter.css`
- `src/features/control-center/SkeletonControlCenter.js` (si aún existe)
- `src/features/control-center/SkeletonTelemetry.js` (si aún existe)
- `src/features/control-center/SkeletonCompliance.js` (si aún existe)

### Movidos/Renombrados:
- `CCWeekConsumption.js` → `tabs/telemetry/WeekConsumption.js`
- `CCComplianceTable.js` → `tabs/compliance/ComplianceTable.js`
- `CCComplianceDetailDrawer.js` → `drawers/ComplianceDetailDrawer.js`
- `CCFlowAnalysisDrawer.js` → `drawers/FlowAnalysisDrawer.js`
- `CCSupportDrawer.js` → `drawers/SupportDrawer.js`
- `CCWarningsSection.js` → `components/WarningsSection.jsx`
- `CCDataTabs.js` → `tabs/DataTabs.js` o eliminar si no se usa

---

## Notas

- **No modificar lógica de negocio**: Solo reestructurar y extraer patrones
- **No modificar API layer**: Orchestrator, endpoints, config se quedan igual
- **No modificar shared/ui existentes**: Solo agregar SmartDrawer
- **Preservar funcionalidad exacta**: Todo debe funcionar igual que antes
- **Documentar en AGENTS.md**: Actualizar con nueva estructura de features

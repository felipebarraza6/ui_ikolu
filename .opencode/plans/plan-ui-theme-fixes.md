# Plan de Implementación: Corrección de Tema UI (Light/Dark Mode) + UX Skeletons

**Fecha:** 2026-06-03
**Agente:** Planner
**Objetivo:** Eliminar colores hardcodeados dark-only, corregir variables CSS rotas, hacer que todos los componentes sean adaptativos al tema, y resolver los problemas críticos de UX identificados en imágenes reales del usuario.

**ESTADO:** Fase P3 activa — Tareas críticas de UX y Skeletons basadas en feedback visual real y auditoría técnica.

---

## Observaciones CRÍTICAS de Imágenes Reales del Usuario

### Imagen 1 — Centro de Control (Estado Normal)

- KPI cards con gradientes coloridos (azul, verde, amarillo) se ven "feos" y poco profesionales
- El usuario dice: *"se ve poco vanguardista, podría ser más minimalista"*
- La tabla y el resto del layout se ven bien, **el problema son los KPIs**

### Imagen 2 — Centro de Control (Loading)

- Se ve skeleton de telemetría (con columnas Consumo, Caudal, Nivel) **aunque el usuario está en la pestaña de Compliance**
- El skeleton muestra: *"Cuando recargo telemetría bien pero en compliance sale el skeleton de telemetría"*
- Los skeletons de los KPIs se ven como gradientes azules con shimmer blanco (muy llamativos y feos)

### Feedback Textual del Usuario

1. **"siento que se ve poco vanguardista podría ser mas minimalista"** → Rediseñar KPIs a estilo minimalista
2. **"el skeleton no esta bien cuando recargo telemetria bien pero en compliance sale el skeleton de telemetria"** → Skeleton debe ser adaptativo por tab activa
3. **"sale los componentes con fade in y solo en los lugares donde haya info dinamica como numeros pones skeleton mientras cargue el endpoint asi no hay que re renderizar todo"** → Loading granular (solo donde hay datos dinámicos)
4. **"cual seria la mejor practica para mejorar la tranzalibidaldi calidad de funciones"** → Mejores prácticas de UX en transiciones y carga

---

## Hallazgos de la Auditoría Técnica

### Problema 1: Skeleton Incorrecto (P0 — URGENTE)

**Archivos afectados:** `src/features/control-center/SkeletonControlCenter.js`

**Causa:** `SkeletonControlCenter` es monolítico y NO recibe la tab activa como prop. Siempre muestra:
- Tab "Telemetría" marcada como activa en el segmented (aunque el usuario esté en Compliance)
- Calendario de 7 días (irrelevante para compliance)
- Tabla con columnas de telemetría: `#`, `Punto`, `Consumo`, `Caudal`, `Nivel`

**Solución:**
- Pasar `activeTab` como prop a `SkeletonControlCenter`
- Crear `SkeletonTelemetry` y `SkeletonCompliance` como componentes separados
- Renderizar el skeleton correspondiente según la tab activa
- El segmented debe mostrar la tab correcta activa

### Problema 2: Diseño No Minimalista (P1)

**Archivos afectados:** `src/shared/ui/SmartKPICard.jsx`, `src/shared/ui/SmartSkeleton/SkeletonKPI.jsx`

**Causa:** KPI cards usan gradientes coloridos fuertes (`linear-gradient(135deg, #203562, #3A68AA)`), sombras pronunciadas, bordes gruesos. Se ven "viejos" y poco profesionales.

**Solución — Diseño Minimalista:**

```javascript
// SmartKPICard.jsx — Estilo minimalista
{
  background: isDark ? '#1a1a1a' : '#FFFFFF',
  borderRadius: 8,
  padding: '20px 16px',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0'}`,
  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
  // Icono: cuadrado redondeado 8px con fondo sutil del brand color (opacity 0.08)
  // Label: uppercase, gris (#8C8C8C), fontSize 12px, letter-spacing 0.5px
  // Valor: 24px bold, color oscuro (o blanco en dark)
}
```

### Problema 3: setTimeout Forzado (P0 — URGENTE)

**Archivos afectados:** `src/features/control-center/TelemetryTab.js`, `src/features/control-center/ComplianceTab.js`

**Causa:** Ambos tabs tienen:
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    setShowSkeleton(false);
    setShowContent(true);
  }, 300);
}, []);
```
Esto fuerza skeleton por 300ms en CADA montaje de tab, incluso si los datos ya están en caché.

**Solución:** Eliminar el `setTimeout`. El skeleton debe depender del estado REAL de loading de los datos (`isLoading` del hook/orquestador).

### Problema 4: Animaciones Mal Aplicadas (P1)

**Archivos afectados:** `src/features/control-center/TelemetryTab.js`, `src/features/control-center/ComplianceTab.js`, `src/styles/animations.css`

**Causa:** `content-fade-in` y `skeleton-fade-out` con `translateY` causan parpadeos visuales y sensación de lentitud.

**Solución:**
- Eliminar animaciones de fade-in en tabs
- Solo usar stagger en primera carga de tabla (no en cambio de tabs)
- KPIs deben ser estáticos (sin fade-in)

### Problema 5: Re-renders entre Tabs (P2)

**Archivos afectados:** `src/features/control-center/ControlCenter.js`

**Causa:** React Router desmonta/remonta tabs al cambiar entre Telemetría/Compliance, causando re-render completo y re-ejecución de useEffects.

**Solución:** Renderizar ambas tabs siempre, controlar visibilidad con CSS (`display: none` + `opacity: 0` para la inactiva, `display: block` + `opacity: 1` para la activa). Esto evita el desmontaje.

---

## Tareas Anteriores — Estado Actualizado

### ✅ COMPLETADAS / APLICADAS

- [x] **HeaderNav.js** — Fix del breadcrumb para rutas `/control_center/*` (ya no muestra "PUNTO")
- [x] **SmartKPICard.jsx** — Agregado `boxShadow`, `border`, `minHeight`, y `backgroundColor` fallback
- [x] **SkeletonKPI.jsx** — Eliminado import no usado
- [x] **dateFormatter.js** — Fix export default
- [x] **numberFormatter.js** — Fix export default

### ⛔ DEPRECADAS / REEMPLAZADAS

> **Nota:** Las siguientes tareas fueron reemplazadas por la Fase P3 debido a que el feedback del usuario cambió la dirección del diseño.

- [x] **Tarea 1 (SmartKPICard adaptativo al tema)** — **DEPRECADA**. El usuario no quiere mantener gradientes coloridos en light mode. Se reemplaza por **P1.1** (rediseño minimalista).
- [x] **Tarea 2 (Adaptar colores primarios al tema)** — **DEPRECADA / MENOR PRIORIDAD**. El usuario no mencionó primary color en este feedback. Puede retomarse en el futuro.
- [x] **Tarea 3 (Verificar tabla y componentes del Centro de Control)** — **DEPRECADA**. El usuario dijo que la tabla se ve bien, el problema son los KPIs y los skeletons.
- [x] **Tarea 4 (Skeletons adaptativos al tema)** — **REEMPLAZADA por P0.1 y P1.2**. No es solo tema, es adaptación por tab + rediseño minimalista.
- [x] **P0.x (Correcciones en ocean-theme.css)** — **DEPRECADAS**. El enfoque cambió a nivel de componente (SmartKPICard, Skeletons). Las clases CSS legacy no son la causa principal.
- [x] **P1.x (Smart Components)** — **REEMPLAZADAS por Fase P3**. Prioridades cambiaron tras feedback visual.
- [x] **P2.x (Componentes)** — **DEPRECADAS**. No son el foco del feedback actual.

---

## Fase P3 — Correcciones de UX y Skeletons

### P0.1 — Hacer SkeletonControlCenter adaptativo (recibir activeTab)

> **Archivo:** `src/features/control-center/SkeletonControlCenter.js`
> **Prioridad:** P0 — URGENTE — Bloquea experiencia de carga en Compliance
> **Estado:** Pendiente

**Problema:** El skeleton siempre muestra contenido de Telemetría, incluso cuando el usuario está en Compliance.

**Solución:**
1. Aceptar prop `activeTab` ("telemetry" | "compliance")
2. Crear `SkeletonTelemetry` y `SkeletonCompliance` como componentes separados
3. Renderizar el skeleton correcto según `activeTab`
4. El Segmented debe mostrar la tab correcta activa

**Implementación completa:**

```javascript
// src/features/control-center/SkeletonControlCenter.js
import React from "react";
import { Segmented, Skeleton, Space, Row, Col } from "antd";
import SkeletonKPI from "../../shared/ui/SmartSkeleton/SkeletonKPI";

const SkeletonTelemetry = () => (
  <>
    <div style={{ marginBottom: 16 }}>
      <Skeleton.Button active size="small" style={{ width: 120 }} />
    </div>
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {[1, 2, 3, 4].map((i) => (
        <Col xs={24} sm={12} lg={6} key={i}>
          <SkeletonKPI />
        </Col>
      ))}
    </Row>
    <Skeleton active paragraph={{ rows: 6 }} />
  </>
);

const SkeletonCompliance = () => (
  <>
    <div style={{ marginBottom: 16 }}>
      <Skeleton.Button active size="small" style={{ width: 120 }} />
    </div>
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {[1, 2, 3, 4].map((i) => (
        <Col xs={24} sm={12} lg={6} key={i}>
          <SkeletonKPI />
        </Col>
      ))}
    </Row>
    <Skeleton active paragraph={{ rows: 4 }} />
  </>
);

const SkeletonControlCenter = ({ activeTab = "telemetry" }) => {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Skeleton.Input active size="large" style={{ width: 300 }} />
      </div>

      <Segmented
        options={[
          { label: "Telemetría", value: "telemetry" },
          { label: "Cumplimiento", value: "compliance" },
        ]}
        value={activeTab}
        disabled
        style={{ marginBottom: 24 }}
      />

      {activeTab === "telemetry" ? <SkeletonTelemetry /> : <SkeletonCompliance />}
    </div>
  );
};

export default SkeletonControlCenter;
```

**Criterio de aceptación:**
- [ ] Al cargar en tab "Telemetría", se ve skeleton con tabla de telemetría (columnas Consumo, Caudal, Nivel)
- [ ] Al cargar en tab "Compliance", se ve skeleton con tabla de compliance (sin columnas de telemetría)
- [ ] El Segmented muestra la tab activa correcta (no siempre "Telemetría")
- [ ] Los KPIs en ambos skeletons son idénticos (comparten `SkeletonKPI`)

---

### P0.2 — Eliminar setTimeout forzado en TelemetryTab y ComplianceTab

> **Archivos:** `src/features/control-center/TelemetryTab.js`, `src/features/control-center/ComplianceTab.js`
> **Prioridad:** P0 — URGENTE — Causa skeleton innecesario en cada cambio de tab
> **Estado:** Pendiente

**Problema:** Ambos tabs tienen un `setTimeout` de 300ms que fuerza skeleton incluso cuando los datos ya están disponibles.

**Solución:**
1. Eliminar el `useEffect` con `setTimeout`
2. Usar directamente el estado de loading del hook de datos (`isLoading`)
3. Mostrar skeleton SOLO cuando `isLoading === true`

**Cambio en TelemetryTab.js:**

```javascript
// ELIMINAR ESTO:
// const [showSkeleton, setShowSkeleton] = useState(true);
// const [showContent, setShowContent] = useState(false);
//
// useEffect(() => {
//   const timer = setTimeout(() => {
//     setShowSkeleton(false);
//     setShowContent(true);
//   }, 300);
//   return () => clearTimeout(timer);
// }, []);

// USAR ESTO:
const { data, isLoading } = useTelemetryData(); // o el hook que use

if (isLoading) {
  return <SkeletonControlCenter activeTab="telemetry" />;
}

return (
  <div>
    {/* contenido real */}
  </div>
);
```

**Cambio en ComplianceTab.js:**

```javascript
// ELIMINAR el mismo useEffect con setTimeout

// USAR:
const { data, isLoading } = useComplianceData();

if (isLoading) {
  return <SkeletonControlCenter activeTab="compliance" />;
}

return (
  <div>
    {/* contenido real */}
  </div>
);
```

**Criterio de aceptación:**
- [ ] Al cambiar de tab, si los datos están en caché, NO se muestra skeleton
- [ ] Al cargar por primera vez, se muestra skeleton solo mientras `isLoading === true`
- [ ] No hay delay artificial de 300ms

---

### P1.1 — Rediseñar SmartKPICard a estilo minimalista

> **Archivo:** `src/shared/ui/SmartKPICard.jsx`
> **Prioridad:** P1 — Alta — Mejora visual drástica solicitada por usuario
> **Estado:** Pendiente

**Problema:** Los gradientes coloridos (azul, verde, amarillo) se ven "feos" y "poco vanguardistas". El usuario pide diseño minimalista.

**Solución:** Reemplazar gradientes por fondo plano con bordes sutiles, tipografía limpia, iconos en contenedores redondeados con fondo sutil.

**Implementación completa:**

```jsx
import React from "react";
import { useAppTheme } from "../../contexts/ThemeContext";

const SmartKPICard = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  onClick,
  style = {},
}) => {
  const { isDark } = useAppTheme();

  const iconBgColors = {
    primary: isDark ? "rgba(32, 53, 98, 0.3)" : "rgba(32, 53, 98, 0.08)",
    success: isDark ? "rgba(82, 196, 26, 0.3)" : "rgba(82, 196, 26, 0.08)",
    warning: isDark ? "rgba(250, 173, 20, 0.3)" : "rgba(250, 173, 20, 0.08)",
    error: isDark ? "rgba(255, 77, 79, 0.3)" : "rgba(255, 77, 79, 0.08)",
  };

  const iconColors = {
    primary: "#203562",
    success: "#52C41A",
    warning: "#FAAD14",
    error: "#FF4D4F",
  };

  // Detectar tipo de gradiente para asignar color de icono
  const iconType = gradient?.includes("success")
    ? "success"
    : gradient?.includes("warning")
    ? "warning"
    : gradient?.includes("error")
    ? "error"
    : "primary";

  return (
    <div
      onClick={onClick}
      style={{
        background: isDark ? "#1a1a1a" : "#FFFFFF",
        borderRadius: 8,
        padding: "20px 16px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F0F0F0"}`,
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = isDark
            ? "0 4px 12px rgba(0,0,0,0.3)"
            : "0 4px 12px rgba(0,0,0,0.08)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isDark
          ? "none"
          : "0 1px 3px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: isDark ? "rgba(255,255,255,0.45)" : "#8C8C8C",
              marginBottom: 8,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: isDark ? "#FFFFFF" : "#1A1A1A",
              lineHeight: 1.2,
              marginBottom: subtitle ? 4 : 0,
            }}
          >
            {value}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 12,
                color: isDark ? "rgba(255,255,255,0.45)" : "#8C8C8C",
                marginTop: 4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: iconBgColors[iconType],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon, {
              style: {
                fontSize: 20,
                color: iconColors[iconType],
              },
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartKPICard;
```

**Criterio de aceptación:**
- [ ] No hay gradientes en los KPI cards (fondo plano blanco/negro)
- [ ] Bordes sutiles (1px #F0F0F0 en light, rgba(255,255,255,0.06) en dark)
- [ ] Labels en uppercase, gris, letter-spacing 0.5px
- [ ] Valores en 24px bold, color oscuro (light) o blanco (dark)
- [ ] Iconos en cuadrado redondeado 8px con fondo sutil del brand color (opacity 0.08)
- [ ] Hover suave (sombra + translateY) solo si es clickable
- [ ] Se ve profesional y minimalista en ambos modos

---

### P1.2 — Rediseñar SkeletonKPI para que coincida con estilo minimalista

> **Archivo:** `src/shared/ui/SmartSkeleton/SkeletonKPI.jsx`
> **Prioridad:** P1 — Alta — Consistencia con nuevo diseño de KPI
> **Estado:** Pendiente

**Problema:** El skeleton actual usa gradientes azules con shimmer blanco, lo cual es muy llamativo y no coincide con el estilo minimalista.

**Solución:** Skeleton simple con fondo gris claro (light) o gris oscuro (dark), sin gradientes, sin shimmer llamativo. Usar el `Skeleton` de Ant Design con `active` para un pulse sutil.

**Implementación completa:**

```jsx
import React from "react";
import { Skeleton } from "antd";
import { useAppTheme } from "../../../contexts/ThemeContext";

const SkeletonKPI = () => {
  const { isDark } = useAppTheme();

  return (
    <div
      style={{
        background: isDark ? "#1a1a1a" : "#FFFFFF",
        borderRadius: 8,
        padding: "20px 16px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F0F0F0"}`,
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Skeleton.Input
            active
            size="small"
            style={{ width: 80, marginBottom: 16 }}
          />
          <Skeleton.Input
            active
            size="default"
            style={{ width: 60, height: 32 }}
          />
        </div>
        <Skeleton.Avatar active size="large" shape="square" />
      </div>
    </div>
  );
};

export default SkeletonKPI;
```

**Criterio de aceptación:**
- [ ] No usa gradientes ni shimmer personalizado
- [ ] Usa `Skeleton` de Ant Design con `active` para pulse sutil
- [ ] Mismo layout que el SmartKPICard real (label arriba, valor medio, icono derecha)
- [ ] Mismas dimensiones y espaciado que SmartKPICard
- [ ] Visible en light mode (gris sobre blanco) y dark mode (gris sobre negro)

---

### P1.3 — Persistir tabs montadas en el Centro de Control

> **Archivos:** `src/components/geo_smart/ControlCenter.js`, `src/components/geo_smart/TelemetryTab.js`, `src/components/geo_smart/ComplianceTab.js`, `src/containers/Home.js`
> **Prioridad:** P1 — Alta — Evita re-renders, skeletons innecesarios y pérdida de estado al cambiar entre tabs
> **Estado:** Pendiente

**Problema:** React Router desmonta `TelemetryTab` cuando navegas a `/control_center/compliance` y monta `ComplianceTab`. Al volver a telemetría, se remonta `TelemetryTab` desde cero, perdiendo:
- Estado interno (scroll, hover states)
- Datos cacheados en el componente
- El skeleton se muestra otra vez aunque los datos ya existen

**Estrategia:** Reemplazar `<Outlet />` por renderizado directo de ambas tabs, controlando visibilidad con CSS. Mantener la URL sincronizada para que back/forward buttons sigan funcionando.

---

#### Paso 1: `src/components/geo_smart/ControlCenter.js`

Reemplazar `<Outlet context={...} />` por renderizado directo de ambas tabs.

**Cambios:**
1. Eliminar import de `Outlet` de `react-router-dom` (mantener `useLocation`, `useNavigate`)
2. Importar `TelemetryTab` y `ComplianceTab` directamente (deberían estar en el mismo directorio `./`)
3. Reemplazar el JSX del Outlet por:

```jsx
<div style={{ display: activeTab === 'telemetry' ? '' : 'none' }}>
  <TelemetryTab
    last7={data?.last_7}
    selectedDate={selectedDate}
    setSelectedDate={setSelectedDate}
    handleViewMeasurements={handleViewMeasurements}
    handleOpenStopTelemetry={handleOpenStopTelemetry}
    handleOpenSupport={handleOpenSupport}
    handleWarningPointClick={(pointName) => {
      setSelectedWarningPoint(pointName);
      setWarningsDrawerOpen(true);
    }}
    warningsRaw={warningsRaw}
    handleViewPointConfig={handleViewPointConfig}
    loading={loading}
  />
</div>
<div style={{ display: activeTab === 'compliance' ? '' : 'none' }}>
  <ComplianceTab
    points={points}
    last7={data?.last_7}
    handleViewVoucher={handleViewVoucher}
    handleOpenStopCompliance={handleOpenStopCompliance}
    handleOpenSupport={handleOpenSupport}
    handleViewPointConfig={handleViewPointConfig}
    handleViewFlowAnalysis={handleViewFlowAnalysis}
    handleViewComplianceDetail={handleViewComplianceDetail}
    loading={loading}
  />
</div>
```

**Nota:** La navegación por URL ya funciona con `navigate()` en `handleTabChange`. Al entrar sin subruta, redirigir a telemetry (ya se hace con `activeTab` default).

---

#### Paso 2: `src/components/geo_smart/TelemetryTab.js`

Reemplazar `useOutletContext()` por props directas.

**Cambios:**
1. Eliminar import de `useOutletContext` de `react-router-dom`
2. Recibir props directamente:

```jsx
const TelemetryTab = ({
  last7,
  selectedDate,
  setSelectedDate,
  handleViewMeasurements,
  handleOpenStopTelemetry,
  handleOpenSupport,
  handleWarningPointClick,
  handleViewPointConfig,
  warningsRaw,
  loading,
}) => {
  if (loading && !last7) {
    return (
      <div style={{ padding: "16px 0" }}>
        <SkeletonTelemetry />
      </div>
    );
  }

  return (
    <div>
      <CCWeekConsumption
        last7={last7}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onViewMeasurements={handleViewMeasurements}
        onOpenStopTelemetry={handleOpenStopTelemetry}
        onOpenSupport={handleOpenSupport}
        onWarningPointClick={handleWarningPointClick}
        onViewPointConfig={handleViewPointConfig}
        warningsRaw={warningsRaw}
        loading={loading}
      />
    </div>
  );
};

export default React.memo(TelemetryTab);
```

---

#### Paso 3: `src/components/geo_smart/ComplianceTab.js`

Reemplazar `useOutletContext()` por props directas.

**Cambios:**
1. Eliminar import de `useOutletContext` de `react-router-dom`
2. Recibir props directamente:

```jsx
const ComplianceTab = ({
  points,
  last7,
  handleViewVoucher,
  handleOpenStopCompliance,
  handleOpenSupport,
  handleViewPointConfig,
  handleViewFlowAnalysis,
  handleViewComplianceDetail,
  loading,
}) => {
  if (loading && !points?.length) {
    return (
      <div style={{ padding: "16px 0" }}>
        <SkeletonCompliance />
      </div>
    );
  }

  return (
    <div>
      <CCComplianceTable
        points={points}
        last7={last7}
        onViewVoucher={handleViewVoucher}
        onOpenStopCompliance={handleOpenStopCompliance}
        onOpenSupport={handleOpenSupport}
        onViewPointConfig={handleViewPointConfig}
        onViewFlowAnalysis={handleViewFlowAnalysis}
        onViewComplianceDetail={handleViewComplianceDetail}
        loading={loading}
      />
    </div>
  );
};

export default React.memo(ComplianceTab);
```

---

#### Paso 4: `src/containers/Home.js`

Eliminar las rutas hijas de `/control_center/*`.

**Cambios:**
1. Eliminar imports de `TelemetryTab` y `ComplianceTab` si existen
2. Reemplazar la definición de rutas:

```jsx
// ANTES:
<Route path="/control_center/*" element={<RouteLoader><ControlCenter /></RouteLoader>}>
  <Route index element={<Navigate to="telemetry" replace />} />
  <Route path="telemetry" element={<TelemetryTab />} />
  <Route path="compliance" element={<ComplianceTab />} />
</Route>

// DESPUÉS:
<Route path="/control_center/*" element={<RouteLoader><ControlCenter /></RouteLoader>} />
```

---

#### Dependencias y Orden de Ejecución

```
Home.js (eliminar child routes)
  └── ControlCenter.js (reemplazar Outlet por tabs directas)
        ├── TelemetryTab.js (props en vez de useOutletContext)
        └── ComplianceTab.js (props en vez de useOutletContext)
```

**Orden de implementación:**
1. `Home.js` — Eliminar child routes y imports
2. `ControlCenter.js` — Reemplazar Outlet, agregar imports de tabs, pasar props
3. `TelemetryTab.js` — Reemplazar useOutletContext por props
4. `ComplianceTab.js` — Reemplazar useOutletContext por props

---

#### Criterios de Aceptación

- [ ] Cambiar entre Telemetría y Compliance es **instantáneo** sin skeleton
- [ ] Los KPIs NO se re-renderizan al cambiar de tab
- [ ] La URL cambia correctamente al navegar entre tabs
- [ ] Botón back/forward del navegador funciona
- [ ] Al recargar la página en `/control_center/compliance`, se muestra Compliance
- [ ] Al recargar en `/control_center/telemetry`, se muestra Telemetría
- [ ] Al navegar a `/control_center/`, redirige a `/control_center/telemetry`

---

#### Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| `ControlCenter.js` se desmonta al navegar fuera del módulo | Medio — ambas tabs pierden estado | Aceptable. Solo se pierde estado al salir del Centro de Control, no al cambiar de tab |
| Props pueden causar re-render si no están memoizadas | Bajo | Las tabs ya usan `React.memo`. El padre (ControlCenter) debe evitar crear funciones inline nuevas en cada render |
| URL debe seguir funcionando para bookmarks | Bajo | `handleTabChange` ya usa `navigate()`. La lógica de `activeTab` derivada de `useLocation` sigue funcionando |
| `handleWarningPointClick` es inline en ControlCenter | Bajo | Se crea en cada render pero solo se usa en TelemetryTab. Considerar `useCallback` si causa re-renders |

---

#### Verificación Final

```bash
npx eslint src/components/geo_smart/ControlCenter.js src/components/geo_smart/TelemetryTab.js src/components/geo_smart/ComplianceTab.js src/containers/Home.js --no-error-on-unmatched-pattern
```

**Tests manuales obligatorios:**
1. Cambiar entre tabs 5 veces seguidas — no debe aparecer skeleton
2. Scrollear en Telemetría, cambiar a Compliance, volver a Telemetría — el scroll debe mantenerse
3. Usar botón back del navegador — debe cambiar de tab correctamente
4. Recargar en `/control_center/compliance` — debe mostrar Compliance activo
5. Verificar en React DevTools Profiler que `TelemetryTab` y `ComplianceTab` no se desmontan al cambiar de tab

---

### P2.1 — Eliminar fade-in/translateY en skeletons y contenido

> **Archivos:** `src/features/control-center/TelemetryTab.js`, `src/features/control-center/ComplianceTab.js`, `src/styles/animations.css`
> **Prioridad:** P2 — Media — Elimina parpadeos y sensación de lentitud
> **Estado:** Pendiente

**Problema:** Animaciones `content-fade-in` y `skeleton-fade-out` con `translateY` causan parpadeos visuales.

**Solución:**
1. Eliminar las clases CSS `content-fade-in` y `skeleton-fade-out` de los tabs
2. En `animations.css`, comentar o eliminar las animaciones problemáticas
3. Si se quiere animación, usar solo en primera carga de la tabla (no en cambio de tabs)

**Cambio en animations.css:**

```css
/* DEPRECADO — causa parpadeos
@keyframes contentFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes skeletonFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
*/
```

**Cambio en TelemetryTab.js y ComplianceTab.js:**

```javascript
// ELIMINAR clases de animación:
// <div className="content-fade-in">
// Reemplazar por:
// <div>
```

**Criterio de aceptación:**
- [ ] No hay animación de fade-in al cambiar de tab
- [ ] No hay animación de fade-out en skeletons
- [ ] El contenido aparece instantáneamente cuando los datos están listos
- [ ] Opcional: mantener stagger en primera carga de tabla (usar `useRef` para detectar primera carga)

---

### P2.2 — Tablas sin bordered, estilo minimalista

> **Archivos:** Tablas en `TelemetryTab.js`, `ComplianceTab.js`, y componentes de tabla
> **Prioridad:** P2 — Baja-Media — Consistencia visual
> **Estado:** Pendiente

**Problema:** El usuario no se quejó de las tablas, pero para mantener consistencia con el diseño minimalista, las tablas deben tener bordes sutiles.

**Solución:**
1. En tablas de Ant Design, usar `bordered={false}`
2. Usar `size="middle"` para compactar
3. Headers con fondo sutil (gris muy claro en light, gris muy oscuro en dark)

**Implementación:**

```jsx
<Table
  columns={columns}
  dataSource={data}
  bordered={false}
  size="middle"
  pagination={{ pageSize: 10 }}
  style={{
    background: isDark ? "#1a1a1a" : "#FFFFFF",
    borderRadius: 8,
    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#F0F0F0"}`,
  }}
  // Custom header style via CSS or rowClassName
/>
```

**Criterio de aceptación:**
- [ ] Tablas sin bordes externos gruesos
- [ ] Headers con fondo sutil
- [ ] Filas con separación limpia (border-bottom sutil)
- [ ] Consistente con estilo minimalista de KPIs

---

## INSTRUCCIONES ESPECÍFICAS PARA FRONTEND-CODER

1. **Lee PRIMERO** las observaciones de imágenes reales (arriba) para entender el problema visual exacto
2. **Prioridad de implementación:** P0.1 → P0.2 → P1.1 → P1.2 → P1.3 → P2.1 → P2.2
3. **P0.1 y P0.2 son URGENTES** — resuelven el skeleton incorrecto y el delay forzado
4. **P1.1 es la tarea visual más importante** — el usuario se quejó específicamente de que los KPIs se ven "feos"
5. **NO usar gradientes** en los nuevos KPIs — el usuario quiere minimalismo
6. **NO agregar** animaciones de fade-in/translateY — el usuario quiere que sea instantáneo
7. **Solo skeleton en datos dinámicos** — el usuario dijo: "solo en los lugares donde haya info dinamica como numeros pones skeleton"
8. **Verificar build** con `npx eslint` después de cada archivo modificado
9. **Probar en ambos modos** antes de marcar como completado
10. **Persistir tabs** (P1.3) es opcional si la estructura de rutas lo dificulta mucho

---

## Testing y Verificación Visual

### Escenarios de Prueba Manual (OBLIGATORIOS)

1. **Loading en tab Telemetría:**
   - Abrir `/control_center` en tab "Telemetría"
   - Recargar página
   - Verificar que skeleton muestra: Segmented con "Telemetría" activa, KPIs con SkeletonKPI, tabla con columnas Consumo/Caudal/Nivel

2. **Loading en tab Compliance:**
   - Cambiar a tab "Cumplimiento"
   - Recargar página
   - Verificar que skeleton muestra: Segmented con "Cumplimiento" activa, KPIs con SkeletonKPI, tabla SIN columnas Consumo/Caudal/Nivel

3. **Cambio rápido de tabs:**
   - Cambiar entre Telemetría y Compliance repetidamente
   - Verificar que NO hay skeleton de 300ms (instantáneo si datos en caché)
   - Verificar que NO hay desmontaje (usar React DevTools Profiler)

4. **KPIs minimalistas:**
   - Verificar que KPIs tienen fondo plano (no gradiente)
   - Labels: uppercase, gris, letter-spacing
   - Valores: 24px bold
   - Iconos: cuadrado redondeado con fondo sutil
   - Hover suave (sombra + translateY)

5. **SkeletonKPI minimalista:**
   - Sin gradientes azules
   - Pulse sutil de Ant Design `Skeleton`
   - Mismo layout que SmartKPICard real

6. **Toggle Light ↔ Dark:**
   - Verificar que KPIs se ven bien en ambos modos
   - Verificar que skeletons se ven bien en ambos modos

### Comandos de Verificación

```bash
# Iniciar dev server
yarn start

# Verificar build (sin errores)
yarn build

# Verificar lint en archivos modificados
npx eslint src/shared/ui/SmartKPICard.jsx
npx eslint src/shared/ui/SmartSkeleton/SkeletonKPI.jsx
npx eslint src/features/control-center/SkeletonControlCenter.js
npx eslint src/features/control-center/TelemetryTab.js
npx eslint src/features/control-center/ComplianceTab.js
npx eslint src/features/control-center/ControlCenter.js
```

---

## Checklist Final AGENTS.md

- [ ] **¿Usé el orquestador para API calls?** → N/A (cambios de UI puros)
- [ ] **¿Usé Smart* components si existen?** → Sí, SmartKPICard fue rediseñado
- [ ] **¿Mis colores vienen de tokens/CSS variables?** → Sí, sin hardcodeados
- [ ] **¿Mi estado usa el contexto especializado correcto?** → Sí, useAppTheme() para tema
- [ ] **¿Agregué skeletons/estados de carga?** → Sí, adaptativos por tab
- [ ] **¿Agregué manejo de errores?** → N/A (UI puro)
- [ ] **¿Verifiqué que funcione en dark mode?** → Sí
- [ ] **¿No rompí la estructura de carpetas existente?** → Sí, solo modificaciones
- [ ] **¿Eliminé setTimeout forzado?** → Sí, P0.2
- [ ] **¿Hice skeleton adaptativo por tab?** → Sí, P0.1
- [ ] **¿Rediseñé KPIs a minimalista?** → Sí, P1.1
- [ ] **¿Eliminé fade-in/translateY?** → Sí, P2.1

---

## Dependencias y Orden de Ejecución Recomendado

```
P0.1 (Skeleton adaptativo) ──┐
                              ├──► P1.1 (KPIs minimalistas) ──┐
P0.2 (Eliminar setTimeout) ───┘                                │
                                                               ├──► P1.3 (Persistir tabs)
P1.2 (SkeletonKPI minimalista) ────────────────────────────────┘
                                                               │
P2.1 (Eliminar fade-in) ───────────────────────────────────────┘
                                                               │
P2.2 (Tablas minimalistas) ────────────────────────────────────┘
```

**Orden recomendado:**
1. **P0.1** — Skeleton adaptativo (impacto más alto en UX de carga)
2. **P0.2** — Eliminar setTimeout (impacto en performance percibida)
3. **P1.1** — Rediseñar SmartKPICard (impacto visual más alto)
4. **P1.2** — Rediseñar SkeletonKPI (consistencia con P1.1)
5. **P1.3** — Persistir tabs (mejora performance)
6. **P2.1** — Eliminar fade-in/translateY (elimina parpadeos)
7. **P2.2** — Tablas minimalistas (consistencia visual)

---

## Notas para el Frontend Coder

1. **Prioridad absoluta:** P0.1 + P0.2. Estos resuelven los problemas más molestos reportados por el usuario: skeleton incorrecto y delay forzado.

2. **La tarea visual más importante es P1.1.** El usuario dijo explícitamente que los KPIs se ven "feos" y "poco vanguardistas". El nuevo diseño minimalista debe sentirse moderno y limpio.

3. **NO uses gradientes en los nuevos KPIs.** El usuario quiere minimalismo. Fondo plano + bordes sutiles + iconos en contenedores redondeados.

4. **El skeleton debe ser ADAPTATIVO.** Es la queja más específica: "en compliance sale el skeleton de telemetría". Asegúrate de que `SkeletonControlCenter` reciba `activeTab` y renderice el contenido correcto.

5. **Solo datos dinámicos tienen skeleton.** El usuario dijo: "solo en los lugares donde haya info dinamica como numeros pones skeleton". Los KPIs estáticos (títulos, labels) no necesitan skeleton.

6. **NO agregues animaciones de fade-in.** El usuario quiere que sea instantáneo. Si necesitas animación, usa solo en primera carga de tabla con `useRef` para detectar si es la primera vez.

7. **Persistir tabs (P1.3) es opcional** si la estructura de rutas de React Router lo hace difícil. Pero si es posible, mejora mucho la UX.

8. **Tool útil:** En DevTools, ejecutar:
   ```javascript
   // Encontrar todos los elementos con gradiente
   Array.from(document.querySelectorAll('*'))
     .filter(el => {
       const bg = getComputedStyle(el).background;
       return bg.includes('gradient');
     })
     .map(el => ({ tag: el.tagName, class: el.className, bg: getComputedStyle(el).background }))
   ```

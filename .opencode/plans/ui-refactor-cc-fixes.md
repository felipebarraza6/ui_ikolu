# Plan de Correcciones Visuales - Centro de Control v2

## Problemas Identificados (basados en screenshots y feedback del usuario)

### Observaciones del usuario:

1. **Warning**: Parpadeo doble, que se note como alerta, y que al hacer click deje de parpadear
2. **Telemetría**: Parpadeo como "puntos de ajo" (indicadores LED de conexión activa)
3. **Cumplimiento normativo**: Sin animación, estático total
4. **Total puntos**: Dejar como está
5. **Dark vs Light mode**: En dark todo se ve dentro de una card integrada. En light mode las KPI cards tienen fondos oscuros fijos que no se integran. Falta espaciado para que no choquen elementos.
6. **Control inferior** (Exportar/Tabs/Tabla): En light mode se pierde la integración visual que sí tiene en dark mode.

---

## 1. KPI Cards - Integración Dark/Light (CRÍTICO)

### Problema
Las KPI cards usan gradientes hardcodeados (`smarthydro.gradients.primary`, etc.) que son azules oscuros SIEMPRE. En light mode se ven mal porque no se integran con el fondo claro, usar otro color como planco en ambos casos asi siempre hara contraste pero a telemetria activa agregarle la animacion de parpadeo blanco asi hara contraste .

**Evidencia:**
- Dark mode: Cards azules oscuras sobre fondo oscuro = Bien integrado
- Light mode: Cards azules oscuras sobre fondo blanco = Mal integrado, parecen elementos flotantes sin conexión

### Solución: Cards adaptativas por tema

```javascript
// ControlCenterLayout.js - KPI Cards adaptativas
const { token } = theme.useToken();

// Fondo de card según tema
const kpiCardStyle = {
  height: '100%',
  borderRadius: token.borderRadiusLG,
  border: `1px solid ${token.colorBorder}`,
  // Light: fondo blanco con acento sutil
  // Dark: fondo oscuro con acento sutil
  background: token.colorBgContainer,
  // Línea de acento superior según tipo de KPI
  borderTop: `4px solid ${accentColor}`,
  transition: 'all 0.3s ease',
};

// Icon container - círculo con fondo sutil
const iconContainerStyle = {
  width: 56,
  height: 56,
  borderRadius: '50%',
  background: `${accentColor}15`, // 15 = 8% opacity
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 16,
};

// Icono con color de acento (NO dorado)
const iconStyle = {
  fontSize: 28,
  color: accentColor, // Color primario o de acento del tema
};
```

### Acciones:
- [ ] Reemplazar gradientes hardcodeados por `token.colorBgContainer`
- [ ] Agregar `borderTop` de 4px con color distintivo por KPI
- [ ] Reemplazar iconos dorados (`smarthydro.colors.accent[200]`) por `token.colorPrimary`
- [ ] Mantener mismo layout y dimensiones

---

## 2. Animaciones Específicas por Tipo de Indicador

### 2.1 Warning - Parpadeo Doble (NUEVA ANIMACIÓN)

**Requisito:** Parpadeo doble, muy notorio, tipo alerta. Al hacer click, deja de parpadear.

```css
/* animations.css */
@keyframes warning-double-blink {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    filter: brightness(1);
  }
  20% {
    opacity: 0.2;
    transform: scale(1.3);
    filter: brightness(2);
  }
  40% {
    opacity: 1;
    transform: scale(1);
    filter: brightness(1);
  }
  60% {
    opacity: 0.2;
    transform: scale(1.3);
    filter: brightness(2);
  }
  80% {
    opacity: 1;
    transform: scale(1);
    filter: brightness(1);
  }
}
```

**Implementación en StatusBadge.jsx:**
```javascript
const StatusBadge = ({ record, onViewComplianceDetail }) => {
  const { token } = theme.useToken();
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  const level = record.compliance_warning?.level || "safe";
  const isWarning = level === 'warning' || level === 'critical';

  const handleClick = (e) => {
    e.stopPropagation();
    setHasBeenClicked(true);
    onViewComplianceDetail?.(record, "detail");
  };

  return (
    <div
      onClick={handleClick}
      style={{
        // ... otros estilos
        animation: (isWarning && !hasBeenClicked)
          ? 'warning-double-blink 2s ease-in-out infinite'
          : 'none',
      }}
    >
      {/* Contenido */}
    </div>
  );
};
```

**Donde aplicar:**
- [ ] StatusBadge.jsx - Badge de compliance en tabla
- [ ] ControlCenterLayout.js - KPI de warnings cuando hay alertas activas
- [ ] CCWeekConsumption.js - Badge de warning en tabla de puntos

### 2.2 Telemetría - Parpadeo tipo LED (NUEVA ANIMACIÓN)

**Requisito:** Parpadeo como "puntos de ajo" (indicadores LED de conexión), parece conectado.

```css
/* animations.css */
@keyframes telemetry-led-blink {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(42, 157, 143, 0.4);
  }
  50% {
    opacity: 0.4;
    box-shadow: 0 0 8px 2px rgba(42, 157, 143, 0.6);
  }
}
```

**Implementación en CCWeekConsumption.js:**
```javascript
// Status indicator dot
div style={{
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: isConnected ? token.colorSuccess : token.colorError,
  animation: isConnected
    ? 'telemetry-led-blink 2s ease-in-out infinite'
    : 'none',
  transition: 'all 0.3s ease',
}}/>
```

**Donde aplicar:**
- [ ] CCWeekConsumption.js - Status dot de telemetría en tabla
- [ ] ControlCenterLayout.js - KPI de telemetría activa

### 2.3 Cumplimiento Normativo - Estático (SIN ANIMACIÓN)

**Requisito:** Sin animación, algo estático.

**Implementación:**
- Quitar cualquier animación del indicador de compliance
- Mantener solo color según estado (verde/amarillo/rojo)
- Sin parpadeo, sin pulso, sin nada

### 2.4 Total Puntos - Dejar como está

**Requisito:** Sin cambios.

---

## 3. Layout y Espaciado - Dark vs Light

### 3.1 Problema de Integración

**Dark mode:** Todo el contenido parece estar dentro de una "card" o contenedor oscuro que integra KPIs, días y tabla.

**Light mode:** Los elementos parecen dispersos, sin un contenedor que los una visualmente.

### Solución: Contenedor unificado para sección de datos

```javascript
// AppLayout.jsx o ControlCenterLayout.js
const dataSectionStyle = {
  background: token.colorBgContainer,
  borderRadius: token.borderRadiusLG,
  border: `1px solid ${token.colorBorder}`,
  padding: 24,
  marginTop: 24,
};
```

**Implementación:**
```jsx
// En ControlCenterLayout.js, envolver sección inferior
<div style={dataSectionStyle}>
  {/* Tabs (Exportar, Telemetría, Cumplimiento) */}
  {/* Cards de días */}
  {/* Tabla */}
</div>
```

### 3.2 Espaciado entre elementos

**Problema:** Elementos choquen o estén muy juntos.

**Solución:**
```javascript
// Espaciado consistente
const spacing = {
  kpiGap: 16,        // Gap entre KPI cards
  sectionGap: 24,    // Gap entre secciones
  elementGap: 12,    // Gap entre elementos dentro de sección
};

// En layout:
<Flex gap={spacing.kpiGap}>
  {/* KPI Cards */}
</Flex>

<div style={{ marginTop: spacing.sectionGap }}>
  {/* Sección inferior */}
</div>
```

### 3.3 Cards de días - Espaciado y tamaño

**Problema:** Las cards de días parecen muy juntas o sin margen consistente.

**Solución:**
```javascript
// CCWeekConsumption.js - Day cards
const dayCardStyle = {
  flex: 1,
  minHeight: 100,
  padding: '12px 8px',
  borderRadius: token.borderRadius,
  background: token.colorBgContainer,
  border: `1.5px solid ${token.colorBorder}`,
  margin: '0 6px',  // Margen horizontal consistente
  // ... resto
};
```

---

## 4. Sidebar - Integración Visual

### Problema
El sidebar tiene fondo azul oscuro (`token.colorPrimary` o hardcodeado) que no cambia con el tema. En light mode, un sidebar azul oscuro sobre fondo blanco se ve desconectado.

### Solución
```javascript
// Sidebar.jsx - Adaptativo
const sidebarStyle = {
  background: token.colorBgContainer,  // Mismo fondo que cards
  borderRight: `1px solid ${token.colorBorder}`,
};

// O si se quiere mantener color corporativo:
const sidebarStyle = {
  background: token.isDark ? token.colorPrimary : token.colorBgContainer,
};
```

**Items del menú:**
```javascript
// Items con colores que contrasten
const menuItems = [{
  key: "/control-center/telemetry",
  icon: <DashboardOutlined style={{ color: token.colorTextSecondary }} />,
  label: <span style={{ color: token.colorText }}>Centro de Control</span>,
}];
```

---

## 5. Header - Integración

### Problema
El header tiene fondo diferente al contenido, creando una línea de separación visible.

### Solución
```javascript
// HeaderNav.jsx
<Header
  style={{
    background: token.colorBgContainer,  // Mismo fondo que el contenido
    borderBottom: `1px solid ${token.colorBorder}`,
    // Sin sombra o sombra muy sutil
    boxShadow: 'none',
  }}
/>
```

---

## 6. Colores Semánticos - Contraste garantizado

### Problema
Los colores de estado (success/warning/error) deben tener suficiente contraste tanto en fondos claros como oscuros.

### Solución: Usar tokens de AntD
```javascript
// StatusBadge.jsx
const createLevelConfig = (token) => ({
  safe: {
    color: token.colorSuccess,
    bg: `${token.colorSuccess}15`,      // 15 = 8% opacity
    border: `${token.colorSuccess}30`,   // 30 = 18% opacity
  },
  warning: {
    color: token.colorWarning,
    bg: `${token.colorWarning}15`,
    border: `${token.colorWarning}30`,
  },
  critical: {
    color: token.colorError,
    bg: `${token.colorError}15`,
    border: `${token.colorError}30`,
  },
});
```

---

## Checklist de Implementación

### Fase 1: KPI Cards (Prioridad Alta)
- [ ] Reemplazar gradientes hardcodeados por `token.colorBgContainer`
- [ ] Agregar `borderTop` de acento por KPI
- [ ] Reemplazar iconos dorados por `token.colorPrimary`
- [ ] Verificar que se vean bien en dark y light

### Fase 2: Animaciones (Prioridad Alta)
- [ ] Crear `warning-double-blink` en animations.css
- [ ] Crear `telemetry-led-blink` en animations.css
- [ ] Implementar en StatusBadge.jsx con estado `hasBeenClicked`
- [ ] Implementar en CCWeekConsumption.js para telemetría
- [ ] Quitar animaciones de cumplimiento normativo
- [ ] Verificar que Total Puntos no tenga animación

### Fase 3: Layout y Espaciado (Prioridad Media)
- [ ] Crear contenedor unificado para sección inferior
- [ ] Ajustar espaciado entre KPIs (gap 16px)
- [ ] Ajustar espaciado entre secciones (margin 24px)
- [ ] Agregar margen a cards de días
- [ ] Verificar que no haya layout shift al cambiar datos

### Fase 4: Sidebar y Header (Prioridad Media)
- [ ] Ajustar fondo de sidebar para que sea consistente
- [ ] Ajustar fondo de header para que sea consistente
- [ ] Verificar que items del menú contrasten

### Fase 5: Validación
- [ ] Screenshot en dark mode - todo integrado
- [ ] Screenshot en light mode - todo integrado
- [ ] Verificar que warning parpadee y al clickar se detenga
- [ ] Verificar que telemetría parpadee como LED
- [ ] Verificar que compliance NO tenga animación
- [ ] Verificar que Total Puntos esté estático
- [ ] Verificar que no haya elementos que choquen

---

## Archivos a Modificar

1. `src/styles/animations.css` - Nuevas animaciones
2. `src/features/control-center/ControlCenterLayout.js` - KPI cards, layout, espaciado
3. `src/features/control-center/CCWeekConsumption.js` - Animaciones telemetría, espaciado días
4. `src/features/control-center/components/StatusBadge.jsx` - Animación warning, click handler
5. `src/features/layout/Sidebar.jsx` - Fondo adaptativo
6. `src/features/layout/HeaderNav.jsx` - Fondo adaptativo
7. `src/features/layout/AppLayout.jsx` - Contenedor unificado, espaciado
8. `src/features/control-center/CCComplianceTable.js` - Sin animaciones
9. `src/features/control-center/CCComplianceDetailDrawer.js` - Sin animaciones

---

## Notas para implementador

1. **Warning blink**: La animación debe ser MUY visible. Usar `scale(1.3)` y `brightness(2)` para que resalte.
2. **Telemetría blink**: Efecto LED suave, no agresivo. Solo cambio de opacidad y glow.
3. **Click para detener**: Usar `useState` para trackear si el usuario hizo click. Estado local al componente.
4. **Layout shift**: Usar `min-height` fijo en todos los contenedores que puedan cambiar de tamaño.
5. **Colores**: NUNCA usar colores hardcodeados. Siempre `token.*`.
6. **Espaciado**: Usar valores consistentes (8, 12, 16, 24, 32). No mezclar.

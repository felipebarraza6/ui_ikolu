# Plan: Minimalist Blinking Dots for Telemetry & Warning Cards

## Análisis

Actualmente las KPI cards usan iconos de React Icons (`FaBroadcastTower`, `FaExclamationTriangle`) que parpadean mediante animaciones CSS. El problema es que los iconos vectoriales se ven borrosos/distorsionados cuando se aplican animaciones de escala + brillo + opacidad simultáneas.

## Objetivo

Reemplazar los iconos parpadeantes por **puntos circulares minimalistas** que parpadean con diferentes ritmos. Esto es más limpio, moderno, y no sufre de distorsión por el parpadeo.

## Archivos a Modificar

### 1. `src/styles/animations.css`
**Tarea:** Crear nuevas animaciones de punto para telemetry y warning con ritmos distintos.

**Cambios:**
- Reemplazar `telemetry-led-blink` → `telemetry-dot-blink` (ritmo suave, 2s, tipo "respiración")
- Reemplazar `warning-double-blink` → `warning-dot-blink` (ritmo alerta, 1.2s, doble pulso)
- Crear `critical-dot-blink` (ritmo urgente, 0.8s, pulsación rápida) - preparado para futuro uso

**Especificación técnica de animaciones:**
```css
/* Telemetry: respiración suave, 2s */
@keyframes telemetry-dot-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.85); }
}

/* Warning: doble pulso, 1.2s */
@keyframes warning-dot-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.2; transform: scale(1.2); }
  50% { opacity: 1; transform: scale(1); }
  75% { opacity: 0.2; transform: scale(1.2); }
}
```

### 2. `src/features/control-center/ControlCenterLayout.js`
**Tarea:** Reemplazar iconos por dots en las KPI cards de Telemetry y Warnings.

**Cambios en Telemetry card (línea ~103):**
- Reemplazar: `icon={<FaBroadcastTower style={{ fontSize: 18, color: '#ffffff', animation: "telemetry-led-blink 1.5s ease-in-out infinite" }} />}`
- Por: Un div circular blanco con animación `telemetry-dot-blink`

**Cambios en Warnings card (línea ~132):**
- Reemplazar: `icon={<FaExclamationTriangle style={{ fontSize: 18, color: '#ffffff', animation: hasWarnings ? 'warning-double-blink 2s ease-in-out infinite' : 'none' }} />}`
- Por: Un div circular blanco con animación `warning-dot-blink` (condicional a `hasWarnings`)

**Especificación del componente Dot:**
```jsx
// Dot para Telemetry
<div style={{
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  animation: 'telemetry-dot-blink 2s ease-in-out infinite',
  boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.4)',
}} />

// Dot para Warning
<div style={{
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: '#ffffff',
  animation: hasWarnings ? 'warning-dot-blink 1.2s ease-in-out infinite' : 'none',
  boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.4)',
}} />
```

### 3. `src/features/control-center/components/StatusBadge.jsx`
**Tarea:** Reemplazar icono de warning/critical por dot circular.

**Cambios:**
- En `createLevelConfig`: eliminar `icon` de las configuraciones (o dejar solo para safe/unknown)
- En el render: si es `warning` o `critical`, mostrar un dot en lugar del icono
- El dot debe ser más pequeño (8px) para el badge
- Mantener el parpadeo solo para alertas no clickeadas (`isAlert`)

**Especificación del dot en StatusBadge:**
```jsx
// Para warning/critical
<div style={{
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: cfg.color,
  animation: isAlert ? 'warning-dot-blink 1.2s ease-in-out infinite' : 'none',
  flexShrink: 0,
}} />
```

## Criterios de Aceptación

- [ ] Los iconos `FaBroadcastTower` y `FaExclamationTriangle` ya no se usan en las KPI cards
- [ ] Los dots circulares parpadean con ritmos distintos (telemetry: suave 2s, warning: alerta 1.2s)
- [ ] Los dots no se ven borrosos durante la animación
- [ ] El StatusBadge muestra dots para warning/critical en lugar del triángulo
- [ ] Las animaciones antiguas (`telemetry-led-blink`, `warning-double-blink`) se eliminan o se mantienen por compatibilidad (verificar si se usan en otros lugares)
- [ ] El build compila sin errores (`yarn build`)
- [ ] Visualmente se ve minimalista y limpio

## Notas

- Los dots deben ser **blancos** en las KPI cards (fondo oscuro) y **coloreados** en el StatusBadge (fondo claro)
- Tamaño: 12px para KPI cards, 8px para StatusBadge
- Mantener el `box-shadow` sutil para dar "brillo" sin distorsión
- No modificar el comportamiento de click ni los tooltips
- Los iconos `FaMapMarkerAlt` y `FaClipboardCheck` en las otras KPI cards NO se modifican (no parpadean)

## Dependencias

Ninguna. Cambio 100% frontend.

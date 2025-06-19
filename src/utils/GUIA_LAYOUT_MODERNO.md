# 🎨 Layout Moderno - Distribución Fluida

## ✨ Características del Nuevo Layout

### 🎯 Estructura Organizada

- **Navegación superior fija**: Logo + Selector de puntos + Acciones
- **Indicadores arriba**: Métricas en tiempo real (batería, señal, estado)
- **Información del pozo abajo**: Datos principales organizados con flex
- **Todo responsivo**: Armonía entre web y móvil

### 📱 Breakpoints Responsivos

```javascript
// Automáticamente se adapta:
- Mobile: < 768px (1 columna, navegación compacta)
- Tablet: 768-1200px (2-3 columnas)
- Desktop: > 1200px (4+ columnas, navegación completa)
```

## 🚀 Implementación Rápida

### 1. Importar el Layout Moderno

```javascript
import ModernAppLayout from "../components/layout/ModernAppLayout";
import {
  formatVolume,
  formatFlow,
  formatLevel,
} from "../utils/numberFormatter";
```

### 2. Definir Indicadores (Arriba)

```javascript
const indicadores = [
  {
    icon: "🕐",
    label: "Última Medición",
    value: "13:00",
    unit: "hrs",
  },
  {
    icon: "📊",
    label: "Estado",
    value: "Activo",
    unit: "",
  },
  {
    icon: "🔋",
    label: "Batería",
    value: "85",
    unit: "%",
  },
];
```

### 3. Usar el Layout

```javascript
return (
  <ModernAppLayout
    moduleTitle="MÓDULO B"
    moduleCode="UB-030277"
    currentPoint="Pozo Central"
    points={["Pozo Central", "Pozo Norte", "Pozo Sur"]}
    indicators={indicadores}
    onPointChange={(point) => {
      console.log("Cambio de punto:", point);
    }}
  >
    {/* Aquí va el contenido del pozo */}
    <TuComponenteDelPozo />
  </ModernAppLayout>
);
```

## 📊 Estructura Visual

```
┌─────────────────────────────────────────────┐
│ 🏠 Logo | Ikolu App    📍 [Pozo Central ▼]  │ ← Header Fijo
│                                    🔄 ⚙️    │
├─────────────────────────────────────────────┤
│              MODULO B        UB-030277      │ ← Header Módulo
├─────────────────────────────────────────────┤
│ 📊 Indicadores en Tiempo Real               │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │ ← INDICADORES
│ │ 🕐  │ │ 📊  │ │ 🔋  │ │ 📡  │            │   (ARRIBA)
│ │13:00│ │Act. │ │ 85% │ │Buena│            │
│ └─────┘ └─────┘ └─────┘ └─────┘            │
├─────────────────────────────────────────────┤
│ 🏗️ Información del Pozo                     │
│                                            │ ← DATOS DEL POZO
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │   (ABAJO)
│ │ 🕐   │ │ ⚡   │ │ 🌊   │ │ 💧   │       │
│ │86 m³ │ │0 L/s │ │20.9m │ │351K │       │   Organizado
│ └──────┘ └──────┘ └──────┘ └──────┘       │   con Flex
│                                            │
│ 📋 Detalles Técnicos                       │
│ 🔋 Estado del Sistema                      │
└─────────────────────────────────────────────┘
```

## 🎨 Personalización

### Colores y Temas

```javascript
// En el layout, puedes personalizar:
const customTheme = {
  primary: "#1f3461", // Azul principal
  secondary: "#f0f2f5", // Fondo
  success: "#52c41a", // Verde (activo)
  warning: "#faad14", // Amarillo (alertas)
  error: "#f5222d", // Rojo (errores)
};
```

### Indicadores Personalizados

```javascript
const indicadoresPersonalizados = [
  {
    icon: "⚠️",
    label: "Alertas",
    value: "0",
    unit: "",
    color: "#52c41a", // Verde si 0 alertas
  },
  {
    icon: "📈",
    label: "Tendencia",
    value: "+5%",
    unit: "",
    color: "#1890ff",
  },
];
```

## 📱 Comportamiento Móvil

### Header Compacto

- Logo pequeño (28px)
- Selector centrado
- Solo botón refresh visible

### Cards Adaptables

- Grid responsive: 1 columna en móvil, 4 en desktop
- Padding reducido automáticamente
- Texto escalado según pantalla

### Navegación Touch-Friendly

- Botones más grandes (44px+ minimum)
- Espaciado táctil optimizado
- Gestos nativos preservados

## 🔧 Integración con Código Existente

### Migración Gradual

```javascript
// 1. Mantén tu componente original
const TuComponenteOriginal = () => {
  /* ... */
};

// 2. Envuélvelo con el nuevo layout
const TuComponenteMejorado = () => (
  <ModernAppLayout indicators={tus_indicadores}>
    <TuComponenteOriginal />
  </ModernAppLayout>
);

// 3. Usa formateo de números mejorado
import { formatVolume } from "../utils/numberFormatter";
// ANTES: {value.toLocaleString()}
// DESPUÉS: {formatVolume(value)}
```

### Sin Romper Funcionalidad

```javascript
// El layout es wrapper - preserva toda la lógica existente
const [datos, setDatos] = useState(tusEstados);
const tusFunciones = () => {
  /* mantiene todo igual */
};

return (
  <ModernAppLayout>
    {/* Tu código exactamente igual */}
    <TusComponentesOriginales />
  </ModernAppLayout>
);
```

## 🎯 Ejemplo Completo de Uso

Ver: `src/examples/ModuloMejorado.js`

```javascript
import React from "react";
import ModernAppLayout from "../components/layout/ModernAppLayout";

const MiModulo = () => {
  const indicadores = [
    /* tus indicadores */
  ];

  return (
    <ModernAppLayout
      moduleTitle="MI MÓDULO"
      moduleCode="CODE-123"
      indicators={indicadores}
      points={["Punto 1", "Punto 2"]}
      onPointChange={handlePointChange}
    >
      {/* Tu contenido aquí */}
    </ModernAppLayout>
  );
};

export default MiModulo;
```

## ✅ Checklist de Implementación

- [ ] Importar `ModernAppLayout`
- [ ] Definir array de `indicadores`
- [ ] Configurar `moduleTitle` y `moduleCode`
- [ ] Listar `points` disponibles
- [ ] Implementar `onPointChange`
- [ ] Envolver contenido existente
- [ ] Probar en móvil y desktop
- [ ] Usar funciones de formateo de números

¡Tu app ahora tendrá un diseño moderno, organizado y completamente responsivo! 🎉

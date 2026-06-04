# Plan: Arreglar Identidad Smart Hydro + Tema + Tablas Translúcidas

## Problema Identificado

Hay DOS sistemas de tema INCONGRUENTES que rompen la identidad Smart Hydro:

1. **smarthydro.tokens.js** — Usa paleta "Ocean" (`#0A2540`, `#00B4D8`) 
2. **theme.js** — Usa paleta corporativa real (`#203562`, `#CCCF07`)

El comentario en tokens dice:
```
// Primary: #203562 (Corporate Dark Blue)
// Accent: #CCCF07 (Yellow-Green / Lime)
```

Pero los valores reales son OCEAN. Esto rompe la marca Smart Hydro.

## Phase 1: Unificar Identidad Smart Hydro

### 1.1 Corregir smarthydro.tokens.js
**Archivo**: `src/theme/smarthydro.tokens.js`

**Cambios**:
- `primary.500` → `#203562` (CORPORATE_BLUE real)
- `primary.600` → `#16294A` 
- `accent.400` → `#CCCF07` (YELLOW-GREEN real de Smart Hydro)
- `accent.500` → `#B8BB06`
- `semantic.info` → `#3A68AA` (azul Smart Hydro)
- `semantic.infoBg` → `rgba(58, 104, 170, 0.15)`
- `shadows.*` → quitar glow cian, usar sombras azul corporativo
- `gradients.*` → usar `#203562` en vez de `#0A2540`

### 1.2 Corregir theme.js
**Archivo**: `src/theme.js`

**Cambios**:
- Asegurar que use la misma paleta que smarthydro.tokens
- Dark mode: usar `#1A2A4A` como primary dark (ya está OK)
- Tablas: headerBg dark → `#1A2A4A` (OK)

### 1.3 Verificar consistencia en todos los componentes
Buscar y reemplazar colores hardcodeados que usen la paleta OCEAN vieja:
- `#0A2540` → `smarthydro.colors.primary[500]`
- `#00B4D8` → `smarthydro.colors.accent[400]` (pero accent ahora será `#CCCF07`)
- `#90E0EF` → `smarthydro.colors.accent[200]`

## Phase 2: Arreglar Dark Mode

### 2.1 ThemeContext
**Archivo**: `src/contexts/ThemeContext.js`

**Problema**: El toggle funciona pero no se aplica correctamente a todos los componentes.

**Cambios**:
- Agregar clase CSS al body/html cuando isDark cambia
- Asegurar que ocean-theme.css reaccione al atributo data-theme="dark"
- Los componentes que usan smarthydro.tokens deben reaccionar a isDark

### 2.2 CSS Dark Mode
**Archivos**: `src/styles/ocean-theme.css`, `src/styles/theme-variables.css`

**Cambios**:
- `theme-variables.css` debe tener variables para light y dark
- `ocean-theme.css` debe usar @media (prefers-color-scheme: dark) O clases .dark
- Cuando ThemeContext cambia a dark, agregar clase `.dark` al body
- Las tablas deben cambiar colores en dark mode

### 2.3 Componentes que ignoran dark mode
Buscar componentes con colores hardcodeados que no cambian:
- ControlCenterLayout.js (fondos)
- Sidebar.jsx (fondos)
- HeaderNav.jsx (fondos)
- LoginPage.jsx (fondos)

**Solución**: Usar `isDark` de `useAppTheme()` para condicionales.

## Phase 3: Tablas Translúcidas (Glassmorphism)

### 3.1 Estilos de tabla
**Archivos**: `src/styles/ocean-theme.css`, componentes de tabla

**Cambios**:
- Fondo de tabla: `rgba(255, 255, 255, 0.03)` con `backdrop-filter: blur(10px)`
- Bordes: `rgba(255, 255, 255, 0.08)`
- Headers: fondo semi-transparente con gradiente sutil
- En dark mode: glass effect más pronunciado

### 3.2 Componentes de tabla
**Archivos**: 
- `CCWeekConsumption.js`
- `CCComplianceTable.js`
- `MeasurementDrawer.js`

**Cambios**:
- Quitar fondos sólidos (white/#fff)
- Usar `smarthydro.colors.surface.medium` para fondos
- Agregar `backdrop-filter: blur(8px)` donde sea posible
- Bordes redondeados consistentes

## Phase 4: Limpiar Legacy

### 4.1 Remover archivos no usados
Buscar y eliminar:
- Archivos .bak, .backup
- Código comentado grande
- Imports no usados
- Funciones muertas

### 4.2 Remover dependencias no usadas
- `moment` ya fue removido, verificar que no quede en package.json
- `react-icons/fa` — verificar si se usa en todos lados o si hay duplicados con `@ant-design/icons`

### 4.3 Organizar imports
- Agrupar imports: React → librerías → componentes → utils → styles
- Ordenar alfabéticamente dentro de cada grupo

## Reglas
- NO agregar comentarios
- NO usar emojis
- SIEMPRE usar smarthydro.tokens (con la paleta CORREGIDA)
- Build debe compilar después de cada phase

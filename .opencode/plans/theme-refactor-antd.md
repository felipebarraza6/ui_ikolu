# Plan Técnico: Refactor de Tema Dark/Light con Ant Design Tokens

## Estado Actual (Resumen)

- **Tres sistemas de tema inconexos**: Ant Design ConfigProvider (`theme.js`), Tokens SmartHydro (`smarthydro.tokens.js`), y CSS overrides (`ocean-theme.css` + `theme-variables.css`).
- **`ocean-theme.css`**: 2289 líneas, 114 `!important`, solo dark mode, colores literales. Bloquea cualquier theming dinámico.
- **`smarthydro.tokens.js`**: Sistema bien diseñado pero **huérfano**; solo `layout/` lo usa.
- **`control-center/`**: 129+ colores hardcodeados; muchos asumen dark mode permanentemente.
- **`theme.js`**: Genera tokens AntD básicos pero con lógica ternaria hardcodeada y desconectada de `smarthydro.tokens.js`.

---

## Fase 1: Simplificación del CSS (Días 1-2)

### Objetivo
Eliminar `ocean-theme.css` como override masivo de AntD. Reducir a animaciones + glassmorphism opcional.

### 1.1 Qué ELIMINAR de `ocean-theme.css`

**Todo selector que haga override de componentes AntD con `!important`:**

```css
/* ELIMINAR todo esto (ejemplos reales del archivo): */
[data-theme="dark"] .ant-card {
  background: rgba(32, 53, 98, 0.4) !important;
  border: 1px solid rgba(58, 104, 170, 0.3) !important;
}

[data-theme="dark"] .ant-btn {
  background: rgba(32, 53, 98, 0.5) !important;
  border-color: rgba(58, 104, 170, 0.4) !important;
}

[data-theme="dark"] .ant-input {
  background: rgba(5, 13, 26, 0.8) !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

[data-theme="dark"] .ant-table {
  background: transparent !important;
}

[data-theme="dark"] .ant-layout {
  background: #0a0e1a !important;
}
```

**Regla de oro**: Si el selector empieza con `[data-theme="dark"] .ant-` y tiene `!important`, **se elimina**.

### 1.2 Qué MANTENER de `ocean-theme.css`

**A. Keyframes de animación** (sin `!important`, sin overrides):

```css
/* MANTENER: src/styles/animations.css o nuevo archivo */
@keyframes gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes float-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

**B. Glassmorphism opcional** (solo si se mantiene visual ocean, SIN `!important`):

```css
/* NUEVO: src/styles/glassmorphism.css */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
}

/* Las variables se setean desde JS, no hardcodeadas */
[data-theme="dark"] {
  --glass-bg: rgba(32, 53, 98, 0.15);
  --glass-border: rgba(58, 104, 170, 0.2);
}

[data-theme="light"] {
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(32, 53, 98, 0.08);
}
```

> Nota: El glassmorphism es opcional. Si se decide eliminar completamente el estilo "ocean", estas clases también se eliminan.

### 1.3 Estructura CSS residual post-refactor

```
src/styles/
  index.css                    # Estilos base de la app (sin cambios)
  global-animations.css        # Animaciones globales (sin cambios)
  theme-variables.css          # Variables CSS (ver Fase 4)
  animations.css               # Animaciones específicas (antes en ocean-theme.css)
  glassmorphism.css            # NUEVO: solo si se mantiene glass (opcional)
  # ocean-theme.css            # ELIMINADO completamente
```

### 1.4 Cambio en `src/index.js`

```diff
  import "./index.css";
  import "./styles/global-animations.css";
  import "./styles/theme-variables.css";
- import "./styles/ocean-theme.css";
+ import "./styles/animations.css";
- import "./styles/animations.css";
```

> Nota: Si no se mantienen animaciones de ocean, el último import también se elimina.

---

## Fase 2: Configuración del Theme (Días 2-3)

### Objetivo
Unificar `smarthydro.tokens.js` con `createIkoluTheme()` para generar tokens AntD correctos para light/dark.

### 2.1 Unificación: `smarthydro.tokens.js` -> `theme.js`

**ANTES (`src/theme.js` - problema: desconectado de tokens)**:

```javascript
const CORPORATE_BLUE = "#203562";
const CORPORATE_BLUE_LIGHT = "#3A68AA";
// ... constantes sueltas

export const createIkoluTheme = (algorithm = null, isDark = false) => ({
  algorithm,
  token: {
    colorPrimary: isDark ? CORPORATE_BLUE_MID : CORPORATE_BLUE,
    colorSuccess: "#69812A",          // <- hardcodeado, no usa tokens
    colorWarning: "#CCCF07",
    colorError: "#DC2626",
    colorInfo: "#3A68AA",
    // ... más tokens básicos
  },
  components: {
    Button: { colorPrimary: isDark ? CORPORATE_BLUE_MID : CORPORATE_BLUE },
    Layout: { colorBgHeader: isDark ? "#1A2A4A" : CORPORATE_BLUE },
    // ... overrides con colores literales
  },
});
```

**DESPUÉS (`src/theme.js` - integrado con tokens)**:

```javascript
import { smarthydroColors } from "./theme/smarthydro.tokens";

// Alias para claridad
const c = smarthydroColors;

export const createIkoluTheme = (algorithm = null, isDark = false) => {
  const token = {
    // === Colores corporativos ===
    colorPrimary: isDark ? c.primary[300] : c.primary[500],      // #3A68AA / #203562
    colorPrimaryHover: isDark ? c.primary[200] : c.primary[400], // #4D7FBD / #3A68AA
    colorLink: isDark ? c.primary[300] : c.primary[500],
    colorLinkHover: isDark ? c.primary[200] : c.primary[400],

    // === Colores semánticos (desde tokens, no literales) ===
    colorSuccess: c.semantic.success,    // #2A9D8F
    colorWarning: c.semantic.warning,    // #F4A261
    colorError: c.semantic.error,        // #E76F51
    colorInfo: c.semantic.info,          // #3A68AA

    // === Accent ===
    colorWarning: c.accent[300],         // #CCCF07 (revisar: no sobrescribir colorWarning)
    // NOTA: usar colorWarning para warning, no para accent.
    // Para accent crear custom token (ver abajo)

    // === Fondos y superficies ===
    colorBgLayout: isDark ? c.neutral[950] : c.neutral[50],      // #050D1A / #F8F9FA
    colorBgContainer: isDark ? c.neutral[900] : "#ffffff",       // #0A0E1A / white
    colorBgElevated: isDark ? c.neutral[800] : "#ffffff",        // #0F1629 / white
    colorBgSpotlight: isDark ? c.neutral[800] : c.neutral[100],  // #0F1629 / #E8ECF1

    // === Textos ===
    colorText: isDark ? c.neutral[50] : c.neutral[950],          // #F8F9FA / #050D1A
    colorTextSecondary: isDark ? c.neutral[300] : c.neutral[600], // #8C96A6 / #4A5568
    colorTextTertiary: isDark ? c.neutral[400] : c.neutral[500],  // #6B7280 / #6B7280

    // === Bordes ===
    colorBorder: isDark ? c.neutral[800] : c.neutral[200],       // #0F1629 / #E8ECF1
    colorBorderSecondary: isDark ? c.neutral[700] : c.neutral[100], // #162036 / #F1F3F6

    // === Otros ===
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
  };

  return {
    algorithm,
    token,
    components: {
      // Button: usa colorPrimary del token global
      // NO sobrescribir a menos que sea necesario

      Card: {
        borderRadiusLG: 16,
        borderRadius: 12,
        // colorBgContainer ya viene del token global
      },

      Layout: {
        // En AntD v4, Layout usa colorBgLayout del token global
        // No necesita override si token.colorBgLayout está bien seteado
        colorBgHeader: isDark ? c.primary[800] : c.primary[500], // #16264a / #203562
      },

      Table: {
        // Usar tokens globales
        headerBg: isDark ? c.primary[800] : c.primary[500],
        headerColor: isDark ? c.neutral[50] : "#ffffff",
        headerSortActiveBg: isDark ? c.primary[800] : c.primary[500],
        headerSortHoverBg: isDark ? c.primary[700] : c.primary[400],
        rowHoverBg: isDark ? c.neutral[800] : c.neutral[100],
        // Eliminar: headerBgDark, headerColorDark, headerSortHoverBgDark,
        // headerSortActiveBgDark, borderColorDark, rowHoverBgDark
        // (son propiedades legacy de AntD v4 que ya no se usan con algorithm)
      },

      Menu: {
        // En dark mode con darkAlgorithm, Menu se estiliza automáticamente
        // Solo overridear si se necesita color corporativo específico
        darkItemBg: isDark ? c.primary[800] : c.primary[500],
        darkSubMenuItemBg: isDark ? c.primary[900] : c.primary[700],
        darkItemSelectedBg: "rgba(255,255,255,0.15)",
      },

      Input: {
        // Hereda colorBgContainer y colorText del token global
        // No necesita override
      },

      Select: {
        // Hereda del token global
      },

      Modal: {
        // Hereda colorBgElevated
      },

      Drawer: {
        // Hereda colorBgElevated
      },
    },
  };
};
```

### 2.2 Tokens críticos de AntD a configurar

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `colorBgLayout` | `#F8F9FA` | `#050D1A` | Fondo del Layout principal |
| `colorBgContainer` | `#ffffff` | `#0A0E1A` | Fondo de Cards, Inputs, Tables |
| `colorBgElevated` | `#ffffff` | `#0F1629` | Modals, Drawers, Dropdowns |
| `colorText` | `#050D1A` | `#F8F9FA` | Texto principal |
| `colorTextSecondary` | `#4A5568` | `#8C96A6` | Texto secundario |
| `colorBorder` | `#E8ECF1` | `#0F1629` | Bordes |
| `colorPrimary` | `#203562` | `#3A68AA` | Color corporativo |
| `colorSuccess` | `#2A9D8F` | `#2A9D8F` | Éxito (teal) |
| `colorWarning` | `#F4A261` | `#F4A261` | Advertencia (coral) |
| `colorError` | `#E76F51` | `#E76F51` | Error (deep coral) |

### 2.3 Extender ThemeContext para exponer tokens

**`src/contexts/ThemeContext.js`**:

```diff
  import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
- import { theme } from "antd";
+ import { theme } from "antd";
+ import { createIkoluTheme } from "../theme";

  const ThemeContext = createContext();

  export const ThemeProvider = ({ children }) => {
    // ... isDark state y localStorage (sin cambios)

    const algorithm = isDark ? theme.darkAlgorithm : theme.defaultAlgorithm;
    const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

+   // Generar tokens para consumo en componentes
+   const themeConfig = useMemo(
+     () => createIkoluTheme(algorithm, isDark),
+     [algorithm, isDark]
+   );

    return (
-     <ThemeContext.Provider value={{ isDark, toggleTheme, algorithm }}>
+     <ThemeContext.Provider value={{ isDark, toggleTheme, algorithm, themeConfig }}>
        {children}
      </ThemeContext.Provider>
    );
  };
```

### 2.4 Crear hook `useIkoluToken()`

**NUEVO: `src/hooks/useIkoluToken.js`**:

```javascript
import { theme } from "antd";
import { useAppTheme } from "../contexts/ThemeContext";

export const useIkoluToken = () => {
  const { token } = theme.useToken();
  const { isDark, themeConfig } = useAppTheme();

  // Merge tokens AntD con tokens custom de smarthydro
  return {
    ...token,
    isDark,
    // Tokens custom que AntD no tiene
    colorAccent: isDark ? "#CCCF07" : "#CCCF07", // Accent siempre amarillo
    colorCorporateBlue: isDark ? "#3A68AA" : "#203562",
    colorCorporateBlueLight: "#3A68AA",
    colorCorporateBlueMid: "#4D7FBD",
    // Gradientes corporativos
    gradientPrimary: isDark
      ? "linear-gradient(135deg, #3A68AA 0%, #4D7FBD 100%)"
      : "linear-gradient(135deg, #203562 0%, #3A68AA 100%)",
    gradientAccent: "linear-gradient(135deg, #CCCF07 0%, #BDC00C 100%)",
    // Glassmorphism (opcional)
    glassBg: isDark ? "rgba(32, 53, 98, 0.15)" : "rgba(255, 255, 255, 0.6)",
    glassBorder: isDark ? "rgba(58, 104, 170, 0.2)" : "rgba(32, 53, 98, 0.08)",
  };
};
```

---

## Fase 3: Refactor de Componentes (Días 3-7)

### Objetivo
Reemplazar todos los colores hardcodeados por `token.*` de Ant Design.

### 3.1 Patrón de refactor

**ANTES**:

```javascript
import React from "react";
import { Card } from "antd";

const MyComponent = () => (
  <Card
    style={{
      background: "rgba(32, 53, 98, 0.4)",
      border: "1px solid rgba(58, 104, 170, 0.3)",
    }}
  >
    <span style={{ color: "rgba(255, 255, 255, 0.85)" }}>Texto</span>
  </Card>
);
```

**DESPUÉS**:

```javascript
import React from "react";
import { Card, theme } from "antd";

const MyComponent = () => {
  const { token } = theme.useToken();

  return (
    <Card
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorder}`,
      }}
    >
      <span style={{ color: token.colorText }}>Texto</span>
    </Card>
  );
};
```

### 3.2 Componentes a refactorizar (ordenados por impacto visual)

#### A. `src/features/control-center/`

| # | Componente | Problema | Tokens a usar |
|---|-----------|----------|---------------|
| 1 | `CCWeekConsumption.js` | Cards con fondo blanco puro en light | `colorBgContainer`, `colorBorder`, `colorText` |
| 2 | `ControlCenterChat.js` | Fondo oscuro fijo, asume dark | `colorBgContainer`, `colorText`, `colorTextSecondary`, `colorBorder` |
| 3 | `CCComplianceTable.js` | Colores de estado hardcodeados | `colorSuccess`, `colorWarning`, `colorError` |
| 4 | `CCComplianceDetailDrawer.js` | `levelConfig` con hex literales | `colorSuccess`, `colorWarning`, `colorError`, `colorInfo` |
| 5 | `ControlCenter.css` | `!important` en placeholders, table sorter | Eliminar CSS, usar tokens en JS |
| 6 | `MeasurementCharts.js` | Colores de chart inline | `CHART_COLORS` actualizado o usar tokens |
| 7 | `PointConfigDrawer.js` | `rgba(58, 104, 170, 0.3)` etc | `colorPrimary` con opacity o `colorBorder` |
| 8 | `constants/chartColors.js` | Objeto plano con 8 colores | Convertir a función `(isDark) => ({...})` |

#### B. `src/features/layout/`

| # | Componente | Problema | Tokens a usar |
|---|-----------|----------|---------------|
| 1 | `HeaderNav.jsx` | `boxShadow: "0 2px 8px rgba(0,0,0,0.2)"` | `boxShadow` del token o CSS var |
| 2 | `Sidebar.jsx` | `boxShadow: "2px 0 8px rgba(0,0,0,0.3)"` | `boxShadow` del token o CSS var |

#### C. `src/` (globales)

| # | Archivo | Problema | Solución |
|---|---------|----------|----------|
| 1 | `theme.js` | `ikoluTokens` hardcodeados | Deprecar `ikoluTokens`, usar `useIkoluToken()` |
| 2 | `theme.js` | `CHART_CONFIG` con colores fijos | Hacer función `(isDark) => config` |
| 3 | `theme.js` | `CHART_COLORS` estático | Hacer función `(isDark) => colors` |

### 3.3 Ejemplos detallados de refactor

#### Ejemplo A: `ControlCenterChat.js`

**ANTES**:

```javascript
// src/features/control-center/ControlCenterChat.js (líneas representativas)
const chatStyles = {
  container: {
    background: "rgba(5, 13, 26, 0.95)",
    border: "1px solid rgba(58, 104, 170, 0.3)",
  },
  messageUser: {
    background: "rgba(204, 207, 7, 0.1)",
    color: "rgba(255, 255, 255, 0.85)",
  },
  messageBot: {
    background: "rgba(255, 255, 255, 0.05)",
    color: "rgba(255, 255, 255, 0.85)",
  },
  input: {
    background: "rgba(5, 13, 26, 0.8)",
    color: "#fff",
    border: "1px solid rgba(58, 104, 170, 0.4)",
  },
};
```

**DESPUÉS**:

```javascript
import { theme } from "antd";

const ControlCenterChat = () => {
  const { token } = theme.useToken();

  const chatStyles = {
    container: {
      background: token.colorBgElevated,
      border: `1px solid ${token.colorBorder}`,
    },
    messageUser: {
      background: `${token.colorPrimary}15`, // 15 = ~8% opacity
      color: token.colorText,
    },
    messageBot: {
      background: token.colorBgContainer,
      color: token.colorText,
    },
    input: {
      background: token.colorBgContainer,
      color: token.colorText,
      border: `1px solid ${token.colorBorder}`,
    },
  };

  // ... resto del componente
};
```

#### Ejemplo B: `CCWeekConsumption.js` (Cards de días)

**ANTES**:

```javascript
<Card
  style={{
    background: "#ffffff",
    border: "1px solid #E8E8E8",
  }}
>
  <span style={{ color: "#595959" }}>{day.name}</span>
  <span style={{ color: "#203562" }}>{day.value}</span>
</Card>
```

**DESPUÉS**:

```javascript
import { theme } from "antd";

const { token } = theme.useToken();

<Card
  style={{
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
  }}
>
  <span style={{ color: token.colorTextSecondary }}>{day.name}</span>
  <span style={{ color: token.colorPrimary }}>{day.value}</span>
</Card>
```

#### Ejemplo C: `CCComplianceDetailDrawer.js` (levelConfig)

**ANTES**:

```javascript
const levelConfig = {
  low: { color: "#2A9D8F", bg: "rgba(42, 157, 143, 0.1)" },
  medium: { color: "#F4A261", bg: "rgba(244, 162, 97, 0.1)" },
  high: { color: "#E76F51", bg: "rgba(231, 111, 81, 0.1)" },
};
```

**DESPUÉS**:

```javascript
import { theme } from "antd";

const MyComponent = () => {
  const { token } = theme.useToken();

  const levelConfig = {
    low: {
      color: token.colorSuccess,
      bg: `${token.colorSuccess}1A`, // 1A = ~10% opacity
    },
    medium: {
      color: token.colorWarning,
      bg: `${token.colorWarning}1A`,
    },
    high: {
      color: token.colorError,
      bg: `${token.colorError}1A`,
    },
  };

  // ...
};
```

### 3.4 Lista completa de archivos a tocar

```
src/
  theme.js                           # Reescribir createIkoluTheme
  contexts/ThemeContext.js           # Exponer themeConfig
  hooks/useIkoluToken.js             # NUEVO

  features/control-center/
    CCWeekConsumption.js             # Refactor cards
    ControlCenterChat.js             # Refactor chat (prioridad alta)
    CCComplianceTable.js             # Refactor tabla + estados
    CCComplianceDetailDrawer.js      # Refactor levelConfig
    PointConfigDrawer.js             # Refactor inputs y selects
    ControlCenter.css                # Eliminar !important
    MeasurementCharts.js             # Refactor chart colors
    constants/chartColors.js         # Hacer función theme-aware

  features/layout/
    HeaderNav.jsx                    # Box-shadow
    Sidebar.jsx                      # Box-shadow
```

---

## Fase 4: Variables CSS (`theme-variables.css`) (Día 3)

### Decisión: MANTENER pero simplificar

Las variables CSS son útiles para:
- Transiciones suaves entre temas (propiedad `transition` en `html`)
- Selectores CSS puros que no pueden usar JS (ej: `::before`, `::after`)
- Glassmorphism opcional

### 4.1 Qué mantener

```css
/* src/styles/theme-variables.css - VERSIÓN SIMPLIFICADA */

/* Transiciones para suavizar el cambio de tema */
html {
  transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Variables para uso en CSS puro (pseudo-elements, keyframes) */
:root {
  --transition-theme: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
  --glass-bg: rgba(32, 53, 98, 0.15);
  --glass-border: rgba(58, 104, 170, 0.2);
}

[data-theme="light"] {
  --glass-bg: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(32, 53, 98, 0.08);
}
```

### 4.2 Qué eliminar

- **Todas las variables de color duplicadas** (`--bg-primary`, `--bg-secondary`, `--text-primary`, etc.). Estas ya no son necesarias porque los componentes usarán `token.*`.
- **Selectores masivos de transición**: La lista `body, div, span, p, h1... .ant-card, .ant-btn...` fuerza transición en todos los elementos y causa problemas de performance. Reemplazar por transición solo en `html` y elementos específicos si es necesario.
- **Gradientes KPI hardcodeados**: Mover a `theme.js` como funciones `(isDark) => gradient`.

### 4.3 Integración con AntD tokens

**NO** intentar sincronizar variables CSS con tokens AntD. Es un anti-patron mantener dos fuentes de verdad.

**En su lugar**:
- Componentes React usan `token.*` (fuente única de verdad).
- Variables CSS solo para casos edge donde JS no llega.
- Si un componente necesita un color en CSS puro, usa `token.*` inline o styled-components con el theme object.

---

## Fase 5: Validación (Día 7+)

### 5.1 Checklist de verificación

#### A. Toggle funciona

- [ ] Click en toggle dark/light cambia el tema visualmente en TODA la app
- [ ] No hay "flash" de estilos incorrectos al cargar
- [ ] Preferencia se persiste en localStorage
- [ ] F5 mantiene el tema seleccionado

#### B. CSS limpio

- [ ] `ocean-theme.css` eliminado del proyecto
- [ ] No quedan `!important` en overrides de AntD
- [ ] No quedan selectores `[data-theme="dark"] .ant-*` con estilos de override
- [ ] `theme-variables.css` tiene < 50 líneas

#### C. Componentes usan tokens

- [ ] `ControlCenterChat`: fondo claro en light, oscuro en dark
- [ ] `CCWeekConsumption`: cards integradas con el tema
- [ ] `CCComplianceTable`: colores de estado correctos en ambos modos
- [ ] Inputs/Selects: fondo y texto cambian con el tema
- [ ] `AppLayout`: background cambia entre light/dark
- [ ] `Sidebar` y `HeaderNav`: colores corporativos consistentes
- [ ] Charts: colores legibles en ambos modos

#### D. Colores corporativos

- [ ] Primary: `#203562` (light) / `#3A68AA` (dark)
- [ ] Accent: `#CCCF07` visible en ambos modos
- [ ] No hay dos paletas semánticas diferentes (unificar a teal/coral)

#### E. Funcionalidad

- [ ] Todos los tests existentes pasan
- [ ] No hay errores de consola
- [ ] Responsive sigue funcionando
- [ ] Performance: no hay re-renders masivos al togglear

### 5.2 Componentes a probar manualmente

1. **Login** (si aplica)
2. **Dashboard / Control Center**
   - Cards de consumo semanal
   - Chat IA
   - Tabla de compliance
   - Drawer de detalle
   - Charts de mediciones
3. **Layout**
   - Sidebar navegación
   - Header con toggle
   - Collapse/expand sidebar
4. **Modales y Drawers**
   - Configuración de puntos
   - Detalle de compliance
5. **Formularios**
   - Inputs, selects, datepickers

### 5.3 Comandos de verificación

```bash
# Buscar CSS problemático residual
grep -r "!important" src/styles/ src/features/ --include="*.css" --include="*.scss"

# Buscar colores hardcodeados restantes
grep -rE "#([0-9A-Fa-f]{3}){1,2}|rgba?\(" src/features/control-center/ --include="*.js" --include="*.jsx" | grep -v "token\." | grep -v "smarthydro"

# Verificar que ocean-theme.css no se importa
grep -r "ocean-theme" src/

# Tests (si existen)
npm test -- --watchAll=false

# Lint
npm run lint

# Build (para verificar que no hay errores)
npm run build
```

---

## Entregables por Fase

| Fase | Entregable | Archivos modificados/creados |
|------|-----------|------------------------------|
| 1 | CSS limpio | Eliminar `ocean-theme.css`, crear `animations.css` (opcional) |
| 2 | Theme funcional | `theme.js`, `ThemeContext.js`, `hooks/useIkoluToken.js` |
| 3 | Componentes refactorizados | Todos los listados en 3.4 |
| 4 | Variables simplificadas | `theme-variables.css` (< 50 líneas) |
| 5 | App validada | Checklist completo, sin errores |

---

## Notas de Implementación

### Sobre `theme.useToken()` vs `useAppTheme()`

- **`theme.useToken()`**: Devuelve los tokens del **ConfigProvider más cercano**. Siempre usar dentro de componentes renderizados dentro de `<ConfigProvider>`.
- **`useAppTheme()`**: Devuelve `isDark`, `algorithm`, `themeConfig` (el objeto completo). Útil para lógica condicional que no sea estilos directos.
- **`useIkoluToken()`**: Combina ambos + tokens custom. Es el hook recomendado para todos los componentes.

### Sobre AntD v4 y `algorithm`

- `theme.darkAlgorithm` en AntD v4 calcula automáticamente tokens derivados (ej: si seteas `colorPrimary: "#203562"`, genera `colorPrimaryHover`, `colorPrimaryActive`, etc.).
- No es necesario setear todos los tokens manualmente; solo los corporativos y los que necesitan override.
- Los componentes con `algorithm={theme.darkAlgorithm}` se renderizan con paleta oscura automáticamente.

### Sobre `IkoluEmotionProvider`

- Si usa `smarthydro.tokens.js`, actualizarlo para que lea del `themeConfig` en lugar de tener valores fijos.
- O deprecarlo si todos los componentes usan `token.*` directamente.

### Sobre charts (G2 / AntV)

- `CHART_CONFIG` debe ser una función que reciba `isDark` y ajuste `grid.line.style.stroke` y `tooltip` background.
- Ejemplo: `grid: { line: { style: { stroke: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" } } }`

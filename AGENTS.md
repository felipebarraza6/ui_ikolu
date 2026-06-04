# Ikolu UI - SmartHydro Frontend

> **Context for AI coding agents working on this React SPA.**
> Read this file before making changes. Deeper directories may have their own `AGENTS.md` that overrides these instructions.

---

## 1. Project Overview

**Ikolu UI** is the React 18 frontend for **SmartHydro**, an IoT water monitoring platform. It provides dashboards, telemetry visualization, compliance reporting, DGA (Dirección General de Aguas) voucher verification, and real-time device management for water monitoring stations in Chile.

- **Language:** Spanish (Chile) — all UI text, dates, and number formatting use `es-CL` locale
- **Target users:** Water utility operators and environmental compliance officers
- **Deployment:** Dockerized static site served by nginx with SPA routing fallback

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | React | ^18.2.0 | Functional components + hooks |
| Router | react-router-dom | ^6.4.3 | BrowserRouter, protected routes |
| UI Library | Ant Design | ^5.10.3 | Full component library, Spanish locale |
| Styling | Emotion | ^11.14 | `@emotion/react`, `@emotion/styled` |
| State (global) | React Context | - | Auth, Theme, Data, Tour |
| State (local) | Zustand | ^5.0.14 | Feature UI state (e.g., drawers, modals) |
| Charts | ApexCharts | - | Via `react-apexcharts` |
| HTTP | Axios | - | Wrapped in `src/api/sh/` |
| Dates | date-fns | - | Spanish locale (`es`) |
| Build Tool | Create React App | - | Standard CRA, no eject |
| Package Mgr | Yarn | - | `yarn install`, `yarn start`, `yarn build` |
| Container | Docker + nginx | - | Multi-stage build, alpine-based |

---

## 3. Architecture Patterns

### 3.1 Feature-Based Folder Structure

There is **NO `src/components/` directory**. All UI code lives under `src/features/` by domain:

```
src/features/
  control-center/      ← Main dashboard (telemetry + compliance)
    ControlCenter.js   ← Main container
    hooks/
    stores/
    components/
  layout/              ← App shell, sidebar, header
  auth/                ← Login, password reset
  profile/             ← User profile management
  tour/                ← Onboarding tour
  ...
```

**Reusable UI primitives** live in `src/shared/ui/` — these are your "design system" components.

### 3.2 State Management Strategy

Use the **right tool for the right scope**:

| Scope | Tool | Example |
|-------|------|---------|
| Auth (user, token) | React Context + localStorage | `AuthContext.js` |
| Theme (dark/light) | React Context + localStorage | `ThemeContext.js` |
| Selected profile | React Context | `DataContext.js` |
| Feature UI (drawers, modals, tabs) | Zustand | `controlCenterStore.js` |
| Server cache | Custom TTL cache | `dataCache.js` |
| Request deduplication | Custom Map | `requestDeduplication.js` |

**Rule of thumb:**
- Use Zustand for UI state that needs to persist across sibling components within a feature
- Use Context for truly global app state (auth, theme)
- Use `useState` for component-local UI (form inputs, local toggles)

### 3.3 API Patterns

**All API calls MUST go through the centralized layer:**

```javascript
// ✅ CORRECT: Use the orchestrator or endpoint wrappers
import orchestrator from "src/api/orchestrator";
import sh from "src/api/sh/endpoints";

// ❌ WRONG: Never use axios directly in components
import axios from "axios"; // DON'T DO THIS
```

**API Architecture:**

```
src/api/
  orchestrator.js      ← Singleton: batching, caching, deduplication, priorities
  sh/
    config.js          ← Axios instance + auth header injection
    endpoints.js       ← All endpoint definitions (~800+ lines)
```

**Key API utilities:**
- **Batching:** Native batch endpoints (`batchTelemetry`, `batchStats`, `batchSummary`) with fallback
- **Caching:** TTL in-memory cache via `dataCache.js` (30s-10min depending on endpoint)
- **Deduplication:** In-flight request deduplication via `requestDeduplication.js`
- **Cancellation:** AbortController registry in orchestrator
- **Priority queue:** `CRITICAL > HIGH > NORMAL > LOW`
- **Auto-refresh:** Throttled interval refresher (minimum 30s)

**Auth pattern:** Token-based via `Authorization: Token ${token}` header. Token stored in `localStorage`.

### 3.4 Data Flow Example (Control Center)

```
useControlCenter hook
  ↓ calls orchestrator or sh.endpoints
  ↓ GET /api/ik/dashboard_stats/
  ↓ transformDashboardStats() normalizes backend → frontend format
  ↓ returns { data, loading, error, refresh }
ControlCenter.js (container)
  ↓ distributes to TelemetryTab / ComplianceTab
  ↓ child components render tables, drawers, KPI cards
```

---

## 4. Styling & Theming

### 4.1 Three-Layer Styling System

```
Layer 1: Ant Design tokens     ← theme.useToken() in components
Layer 2: Brand tokens           ← smarthydro tokens from smarthydro.tokens.js
Layer 3: CSS variables          ← src/styles/theme-variables.css, ocean-theme.css
```

### 4.2 Brand Identity (SmartHydro)

```javascript
// src/theme/smarthydro.tokens.js
const smarthydroColors = {
  primary: { 500: '#203562' },    // Corporate Dark Blue
  accent:  { 400: '#CCCF07' },    // Yellow-Green
  success: { 500: '#10B981' },
  warning: { 500: '#F59E0B' },
  error:   { 500: '#EF4444' },
  info:    { 500: '#3B82F6' },
};
```

Typography: **Lato** (headings), **Roboto** (body)

### 4.3 Theme Configuration

```javascript
// src/theme.js
export const createIkoluTheme = (algorithm = null, isDark = false) => ({
  algorithm,                    // theme.darkAlgorithm or theme.defaultAlgorithm
  token: {
    colorPrimary: '#203562',
    borderRadius: 8,
    // ... overrides
  },
  components: {
    Card: { borderRadiusLG: 16 },
    Table: { headerBg: '...', rowHoverBg: '...' },
    // ... component-level overrides
  }
});
```

Dark mode is fully supported via `ThemeContext`:
- Stores preference in `localStorage` (`THEME_KEY = "ikolu-theme"`)
- Falls back to `prefers-color-scheme: dark`
- Sets `data-theme` attribute and `body.dark` class
- Uses AntD `theme.darkAlgorithm` / `theme.defaultAlgorithm`

### 4.4 CSS Organization

```
src/styles/
  theme-variables.css    ← CSS custom properties (light/dark)
  ocean-theme.css        ← Ocean-inspired dark theme overrides
  ...
```

**Rule:** Prefer AntD tokens and Emotion styled components. Use global CSS sparingly for theme variables and animations.

---

## 5. Shared UI Components (Design System)

Located in `src/shared/ui/`. Always use these instead of raw AntD components when available:

| Component | File | Purpose |
|-----------|------|---------|
| SmartButton | `SmartButton/index.js` | Branded button with variants: `primary`, `accent`, `ghost`, `danger` |
| SmartCard | `SmartCard/index.js` | Card with variants: `default`, `elevated`, `bordered`, `subtle` |
| SmartBadge | `SmartBadge/index.js` | Status badge with semantic colors + icons |
| SmartIconButton | `SmartIconButton/index.js` | Circular icon button with tooltip, keyboard accessible |
| SmartKPICard | `SmartKPICard/index.js` | Gradient animated card with wave decoration |
| ShimmerBar | `SmartSkeleton/ShimmerBar.jsx` | Skeleton shimmer bar |
| ShimmerCircle | `SmartSkeleton/ShimmerCircle.jsx` | Skeleton shimmer circle |
| SkeletonKPI | `SmartSkeleton/SkeletonKPI.jsx` | KPI skeleton layout |
| SkeletonTable | `SmartSkeleton/SkeletonTable.jsx` | Table skeleton with column-aware layout |
| SkeletonCalendarDay | `SmartSkeleton/SkeletonCalendarDay.jsx` | Calendar day skeleton |

**All components use:**
- `smarthydro` brand tokens
- AntD `theme.useToken()` for theme-aware colors
- CSS variables for skeleton backgrounds

---

## 6. Loading & Skeleton Strategy

**Every major async section MUST have skeleton loaders.** Use `SmartSkeleton` components:

```javascript
import { SkeletonKPI, SkeletonTable } from "src/shared/ui/SmartSkeleton";

// While loading
{loading && <SkeletonTable columns={columns} rows={5} />}

// Data ready
{!loading && <Table dataSource={data} columns={columns} />}
```

Skeletons use ocean-theme shimmer animations defined in `skeleton.css`.

---

## 7. Number & Date Formatting

**Always use Chilean Spanish formatting:**

```javascript
// Numbers: es-CL locale
import { formatNumber } from "src/utils/numberFormatter";
formatNumber(1234.5); // "1.234,5"

// Dates: date-fns with Spanish locale
import { format } from "date-fns";
import { es } from "date-fns/locale";
format(date, "dd 'de' MMMM 'de' yyyy", { locale: es }); // "15 de enero de 2024"
```

---

## 8. Routing

Defined in `src/AppRouter.js` (or similar routing file):

```javascript
// Key routes
/                          ← Login or redirect
/login                     ← Authentication
/control-center            ← Main dashboard (telemetry tab)
/control-center/compliance ← Compliance tab
/profile                   ← User profile
```

Protected routes redirect unauthenticated users to `/login`.

---

## 9. Development Workflow

### 9.1 Commands

```bash
# Install dependencies
yarn install

# Development server
yarn start        # http://localhost:3000

# Production build
yarn build        # Outputs to build/

# Run tests
yarn test
```

### 9.2 Docker Build

```bash
# Multi-stage build
docker build -t ikolu-ui .

# Stage 1: node - build static files
# Stage 2: nginx:stable-alpine - serve with SPA fallback
```

Nginx config (`conf/nginx-react.conf`) handles SPA routing:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 9.3 Environment Variables

The app expects the API to be available at:
```javascript
// src/api/sh/config.js
const BASE_URL = "https://api.smarthydro.app/api/";
```

No `.env` files are used; the API URL is hardcoded in the config.

---

## 10. Code Conventions

### 10.1 File Naming

- Components: `PascalCase.js` (e.g., `ControlCenter.js`)
- Hooks: `useCamelCase.js` (e.g., `useControlCenter.js`)
- Stores: `camelCaseStore.js` (e.g., `controlCenterStore.js`)
- Utils: `camelCase.js` (e.g., `dataCache.js`)
- Styles: `kebab-case.css` (e.g., `theme-variables.css`)

### 10.2 Import Order

```javascript
// 1. React / framework
import React, { useState, useEffect } from "react";

// 2. Third-party libraries
import { Table, Button } from "antd";
import { useNavigate } from "react-router-dom";

// 3. Absolute project imports
import { useAuth } from "src/contexts/AuthContext";
import { SmartCard } from "src/shared/ui";

// 4. Relative imports (same feature)
import { useControlCenter } from "./hooks/useControlCenter";
import { controlCenterStore } from "./stores/controlCenterStore";
```

### 10.3 Component Structure

```javascript
// Functional component with memo
const MyComponent = ({ prop1, prop2 }) => {
  // Hooks first
  const { token } = useAuth();
  const [state, setState] = useState(null);
  
  // Callbacks
  const handleClick = useCallback(() => { ... }, [deps]);
  
  // Effects
  useEffect(() => { ... }, [deps]);
  
  // Render
  return (...);
};

export default React.memo(MyComponent);
```

---

## 11. Key Gotchas & Important Notes

1. **No `src/components/` directory exists.** All components live in `src/features/` or `src/shared/ui/`.

2. **Always use the API layer.** Direct axios usage in components is a code smell.

3. **Backend response format varies.** Numbers may come as primitives, objects, or strings. Use `extractNum()` pattern from `useControlCenter.js`:
   ```javascript
   const extractNum = (val) => {
     if (typeof val === "number") return val;
     if (typeof val === "object" && val !== null) return val.value ?? 0;
     return Number(val) || 0;
   };
   ```

4. **Auto-refresh minimum interval is 30 seconds.** The orchestrator enforces this throttle to prevent API overload.

5. **Cache invalidation on logout.** Call `clearPendingRequests()` and invalidate relevant cache keys when user logs out.

6. **Legacy migration in progress.** `migrate-inline.js` exists for MyWell.js migration. `AppContext` migration notes exist in `contexts/index.js`. Be aware some older patterns may coexist.

7. **DGA Integration.** DGA voucher verification calls an external endpoint (`verifyDgaVoucher`). Handle network failures gracefully.

8. **OpenCode Integration.** The project uses `.opencode.yaml` with AI agents (`@planner`, `@frontend-coder`, `@reviewer`). Plans are stored in `.opencode/plans/`.

9. **No TypeScript.** This is a plain JavaScript project. Use JSDoc for complex function signatures if helpful.

---

## 12. Quick Reference: Common Patterns

### Fetching data in a feature

```javascript
import { useEffect, useState, useCallback } from "react";
import sh from "src/api/sh/endpoints";

const useMyFeature = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sh.myEndpoint();
      setData(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
};
```

### Using Zustand for feature UI state

```javascript
import { create } from "zustand";

export const useMyStore = create((set, get) => ({
  isOpen: false,
  selectedItem: null,
  openDrawer: (item) => set({ isOpen: true, selectedItem: item }),
  closeDrawer: () => set({ isOpen: false }),
}));
```

### Creating a themed component

```javascript
import { useToken } from "antd";
import { smarthydro } from "src/theme/smarthydro.tokens";

const MyComponent = () => {
  const { token } = useToken();  // AntD tokens
  
  return (
    <div style={{ 
      background: token.colorBgContainer,
      color: smarthydro.colors.primary[500],
      borderRadius: smarthydro.radii.md,
    }}>
      Content
    </div>
  );
};
```

### Adding a skeleton loader

```javascript
import { SkeletonTable, SkeletonKPI } from "src/shared/ui/SmartSkeleton";

{loading && (
  <>
    <SkeletonKPI count={4} />
    <SkeletonTable columns={columns} rows={5} />
  </>
)}
```

---

## 13. Directory Reference

```
src/
  api/              ← API layer (orchestrator, endpoints, config)
  assets/           ← Images, fonts, static files
  config/           ← App configuration
  contexts/         ← React Context providers (Auth, Theme, Data, Tour)
  features/         ← Feature-based modules (control-center, layout, auth, profile)
  hooks/            ← Shared custom hooks
  shared/
    ui/             ← Reusable UI components (Smart* components, Skeletons)
  styles/           ← Global CSS, theme variables
  theme/            ← Theme creation, brand tokens
  utils/            ← Utilities (cache, deduplication, formatters)
  App.js            ← Root component
  index.js          ← Entry point (providers, router, theme)
```

---

*Last updated: 2024-06-04*
*If you modify architecture, patterns, or conventions mentioned here, update this file.*

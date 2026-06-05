# AGENTS.md — Zivo UI (SmartHydro / Ikolu)

> Archivo orientado a agentes de código. El proyecto utiliza español como idioma principal en comentarios, documentación interna y mensajes de UI.

---

## Project Overview

**Zivo UI** es la interfaz web de **SmartHydro** (también referida como *Ikolu*), una plataforma de telemetría y gestión de recursos hídricos. Es una SPA (Single Page Application) construida con **Create React App** que permite a usuarios monitorear puntos de captación de agua, revisar telemetría en tiempo real, cumplimiento normativo (DGA), notificaciones y gestionar alertas.

- **Nombre del paquete**: `zivo_ui`
- **Versión**: `0.1.0`
- **Repositorio**: React 18 + Ant Design 5 + React Router 6
- **Backend API**: `https://api.smarthydro.app/api/`
- **Idioma de la UI**: Español (locale `es_ES` de Ant Design)
- **Soporte de temas**: Claro y oscuro con tokens corporativos de SmartHydro

---

## Technology Stack

| Capa | Tecnología |
|------|-----------|
| Framework UI | React 18.2.0 |
| UI Library | Ant Design 5.10.3 |
| Routing | React Router DOM 6.4.3 |
| State Management | Zustand 5.0.14 |
| HTTP Client | Axios 1.1.3 |
| Charts | ApexCharts 5.13.0, Chart.js 3.9.1, @ant-design/plots 1.2.2 |
| Maps | Leaflet 1.9.4 + React-Leaflet 5.0.0 |
| i18n | i18next 25.3.0 + react-i18next 15.5.3 |
| Styling | Emotion (React/Styled 11.14.x), CSS modules, tokens corporativos |
| PDF/Excel | jspdf 3.0.0, xlsx 0.18.5, xlsx-populate 1.21.0 |
| QR Codes | qrcode.react 3.1.0 |
| Build Tool | react-scripts 5.0.1 (Create React App) |

---

## Build and Development Commands

El proyecto usa **yarn** como gestor de paquetes principal (también existe `package-lock.json` pero `yarn.lock` está presente).

```bash
# Instalar dependencias
yarn install

# Servidor de desarrollo (puerto 3000)
yarn start

# Build de producción (genera /build)
yarn build

# Tests (modo interactivo/watch)
yarn test

# Eject de CRA (irreversible)
yarn eject
```

### Notas de build
- El build de producción genera archivos estáticos en `/build`.
- No hay variables de entorno custom definidas en el repo (sin `.env` files).
- El `Dockerfile` realiza build multi-stage: `node` → `nginx:stable-alpine`.

---

## Project Structure

```
src/
├── api/                    # Capa de API y orquestación
│   ├── orchestrator.js     # Orquestador centralizado (caché, dedup, batch, cola de prioridad)
│   └── sh/
│       ├── config.js       # Configuración Axios + helpers GET/POST/PATCH/DELETE/DOWNLOAD
│       └── endpoints.js    # ~800 líneas de endpoints de la API SmartHydro
├── assets/images/          # Imágenes estáticas (logos, iconos, wallpapers)
├── config/
│   └── tours.js            # Configuración de tours guiados (onboarding)
├── contexts/               # React Contexts globales
│   ├── AuthContext.js      # Autenticación (localStorage: token, user)
│   ├── DataContext.js      # Estado compartido de datos (selected_profile)
│   ├── ThemeContext.js     # Tema claro/oscuro con persistencia en localStorage
│   └── TourContext.js      # Gestión de tours/paseos guiados
├── features/               # Módulos por dominio (feature-based architecture)
│   ├── auth/               # LoginPage
│   ├── control-center/     # Módulo principal de telemetría y dashboard
│   │   ├── components/     # Componentes reutilizables del módulo
│   │   ├── containers/     # Contenedores de alto nivel
│   │   ├── drawers/        # Drawers/modales específicos del centro de control
│   │   ├── hooks/          # Hooks custom del módulo
│   │   ├── layout/         # Layouts y skeletons
│   │   ├── measurements/   # Submódulo de mediciones (gráficos, KPIs, drawer)
│   │   ├── stores/         # Store Zustand del centro de control
│   │   ├── tabs/           # Tabs: telemetry, compliance
│   │   └── utils/          # Transformadores de datos
│   ├── layout/             # Layout global (AppLayout, Sidebar, HeaderNav)
│   └── profile/            # ProfilePage
├── hooks/                  # Hooks globales (useIkoluToken)
├── shared/ui/              # Componentes UI compartidos (SmartBadge, SmartButton, SmartCard, SmartSkeleton)
├── styles/                 # CSS globales y temas
│   ├── animations.css
│   ├── global-animations.css
│   ├── ocean-theme.css
│   └── theme-variables.css
├── theme/                  # Sistema de temas
│   ├── smarthydro.tokens.js # Tokens de diseño corporativo (colores, tipografía, spacing)
│   ├── EmotionThemeProvider.js
│   └── index.js
├── utils/                  # Utilidades globales
│   ├── dataCache.js        # Caché en memoria con TTL
│   ├── numberFormatter.js
│   └── requestDeduplication.js
├── App.js                  # Root component con providers
├── AppRouter.js            # Definición de rutas protegidas
├── index.js                # Punto de entrada (React 18 createRoot)
├── index.css               # Estilos base
└── theme.js                # Generador de tema Ant Design (createIkoluTheme)
```

---

## Code Style Guidelines

### Idioma
- **Comentarios y documentación**: Español.
- **Nombres de variables/funciones**: Mezcla de español e inglés. Los dominios del negocio usan español (`punto`, `telemetría`, `cumplimiento`, `caudal`).
- **Mensajes de error y UI**: Español.

### Convenciones de nombres
- Componentes React: PascalCase (`.js` o `.jsx` indistintamente).
- Hooks custom: prefijo `use` + camelCase.
- Stores Zustand: `use[Nombre]Store`.
- Archivos de utilidades: camelCase.
- CSS: kebab-case para clases, archivos `.css` al lado de sus componentes cuando es específico.

### Patrones arquitectónicos
1. **Feature-based organization**: El código se organiza por dominio funcional (`features/control-center/`, `features/auth/`, etc.).
2. **API Orchestrator**: La capa de red no se consume directamente desde componentes. Se usa `src/api/orchestrator.js` que agrega:
   - Caché en memoria con TTL (`src/utils/dataCache.js`).
   - Deduplicación de requests (`src/utils/requestDeduplication.js`).
   - Endpoints batch nativos del backend (`/api/ik/batch/*`).
   - Cancelación de requests obsoletos via `AbortController`.
   - Cola de prioridad para requests.
3. **State management híbrido**:
   - **Zustand** para estado local de módulos complejos (ej: `controlCenterStore`).
   - **React Context** para estado global transversal (auth, tema, datos compartidos).
4. **Theming**: Tokens corporativos definidos en `src/theme/smarthydro.tokens.js`. El tema se genera dinámicamente soportando modo oscuro.

### Reglas importantes
- **No hacer llamadas directas a `axios` desde componentes**. Usar siempre los endpoints exportados desde `src/api/sh/endpoints.js` o el orquestador.
- **Lazy-loading de puntos**: El backend ya no envía `catchment_points` completo en el login. Se cargan bajo demanda vía endpoints optimizados (`/api/ik/my_points/`, `/api/ik/points_summary/`).
- Los tokens de auth se guardan en `localStorage` bajo las claves `token` y `user`.

---

## Testing Instructions

- **Framework de testing**: Jest + React Testing Library (incluido por CRA).
- **Comando**: `yarn test` (modo interactivo/watch por defecto).
- **Estado actual**: El proyecto no contiene archivos de test propios (`.test.js`, `.spec.js`) en `src/`. Solo existen tests dentro de `node_modules/`.
- Si se agregan tests, seguir la convención de CRA: colocarlos junto al archivo que testean o en `__tests__/`.

---

## Deployment

### Docker (producción)
El proyecto incluye un `Dockerfile` multi-stage:

1. **Stage build**: Instala dependencias con `yarn` y genera el build estático.
2. **Stage producción**: Copia el build a `nginx:stable-alpine` y sirve con la configuración en `conf/nginx-react.conf`.

```bash
# Construir imagen
docker build -t zivo-ui .

# Ejecutar
docker run -p 80:80 zivo-ui
```

### Nginx
- La configuración en `conf/nginx-react.conf` habilita `try_files` para soportar routing del lado del cliente (SPA).
- Expone el puerto 80.

### Build estático
También se puede desplegar copiando directamente el contenido de `/build` a cualquier servidor web estático (S3, Vercel, Netlify, etc.), asegurando rewrite de rutas a `index.html`.

---

## Security Considerations

1. **Autenticación**: Token-based (`Token <token>` en header `Authorization`). Los tokens se almacenan en `localStorage` (vulnerable a XSS). No hay implementación de refresh tokens ni HttpOnly cookies.
2. **API Base URL**: Hardcodeada en `src/api/sh/config.js` como `https://api.smarthydro.app/api/`. Comentado hay una URL de localhost para desarrollo.
3. **Validación de login**: El endpoint de login realiza validación manual de la respuesta para distinguir entre éxito (`user` + `access_token`) y error.
4. **Descargas de archivos**: El helper `DOWNLOAD` genera blobs en memoria y descarga archivos Excel via elemento `<a>` temporal.
5. **Verificación DGA**: Realiza llamadas a un endpoint de compliance externo (`/compliance/dga/verify/`) usando el mismo token de autenticación.

---

## Key Files for Agents

| Archivo | Propósito |
|---------|-----------|
| `src/api/sh/config.js` | Configuración base de Axios y wrappers HTTP |
| `src/api/sh/endpoints.js` | Definición de todos los endpoints de la API |
| `src/api/orchestrator.js` | Capa de abstracción con caché, batch y deduplicación |
| `src/contexts/AuthContext.js` | Login/logout y estado de sesión |
| `src/contexts/ThemeContext.js` | Toggle de tema claro/oscuro |
| `src/theme/smarthydro.tokens.js` | Tokens de diseño corporativo |
| `src/theme.js` | Generador de config de tema para Ant Design |
| `src/features/control-center/stores/controlCenterStore.js` | Estado global del módulo principal |
| `src/utils/dataCache.js` | Implementación de caché en memoria con TTL |
| `src/utils/requestDeduplication.js` | Deduplicación de requests concurrentes |
| `Dockerfile` | Build containerizado |
| `conf/nginx-react.conf` | Config de nginx para SPA |

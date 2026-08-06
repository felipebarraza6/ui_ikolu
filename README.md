# Ikolu UI

Frontend de la plataforma Ikolu. SPA en React 18 con Ant Design 5, React Router 6, Zustand y Axios. El build de producción se sirve con Nginx como SPA.

## Stack

- React 18 + `react-scripts` 5
- Ant Design 5 + Emotion
- React Router 6
- Zustand para estado local de módulos
- Axios para API
- Leaflet para mapas
- Bun para instalar dependencias rápido
- Node 20 para correr `react-scripts`/webpack en build
- Docker multi-stage: Bun deps → Node build → Nginx runtime

## Desarrollo

Requisitos: Bun y Node 20.

```bash
bun install
npm run start
```

En local, `src/api/sh/config.js` usa ruta relativa `/api/` y Create React App la proxifica al dominio configurado en `package.json` (`proxy`). En producción, el frontend apunta directo a la API HTTPS.

Si quieres probar todo con Bun, `bun run start` / `bun run build` pueden funcionar, pero para `react-scripts` el camino más estable sigue siendo Node (`npm run start` / `npm run build`) usando el mismo `node_modules`.

## Scripts

```bash
npm run start     # desarrollo con react-scripts
npm run build     # build de producción en /build
npm run test      # tests de CRA
```

El `postinstall` ejecuta `scripts/patch-rc-components.js` para parchear componentes `@rc-component/*` que gatillan loops de render en algunas versiones. En Docker/CI se ejecuta también de forma explícita antes del build.

## Docker

```bash
docker build -t ui_ikolu .
docker run --rm -p 8080:80 ui_ikolu
```

La configuración de Nginx está en `conf/nginx-react.conf`:

- `index.html` no se cachea.
- Assets con hash (`js`/`css`) se cachean como inmutables por 1 año.
- Imágenes/fuentes tienen cache moderado.
- Fallback SPA a `index.html`.

## CI

Sugerido: GitHub Actions con Bun para install y Node 20 para build (`bun install --frozen-lockfile`, `node scripts/patch-rc-components.js`, `npm run build`). Agregar el workflow en `.github/workflows/ci.yml`.

## Estructura

- `src/features/auth`: login, recuperación y guardias de rol.
- `src/features/control-center`: dashboard operativo de telemetría/cumplimiento.
- `src/features/admin`: backoffice y dashboards administrativos.
- `src/api`: capa de acceso a API (`sh` + `orchestrator`).
- `src/contexts`: auth, tema, datos globales y tours.
- `conf`: configuración Nginx.
- `scripts`: parches postinstall y utilidades de migración.

## Notas

- La autenticación actual guarda token en `localStorage`; cualquier endurecimiento debe hacerse junto con el backend.
- La autorización de admin se valida en UI con `RoleGuard`, pero debe reforzarse siempre server-side.

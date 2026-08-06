# Ikolu UI

Frontend de la plataforma Ikolu. SPA en React 18 con Ant Design 5, React Router 6, Zustand y Axios. El build de producción se sirve con Nginx como SPA.

## Stack

- React 18 + `react-scripts` 5
- Ant Design 5 + Emotion
- React Router 6
- Zustand para estado local de módulos
- Axios para API
- Leaflet para mapas
- Docker multi-stage: Node 20 build → Nginx runtime

## Desarrollo

Requisitos: Node 20 y Yarn 1.22.

```bash
yarn install
yarn start
```

En local, `src/api/sh/config.js` usa ruta relativa `/api/` y Create React App la proxifica al dominio configurado en `package.json` (`proxy`). En producción, el frontend apunta directo a la API HTTPS.

## Scripts

```bash
yarn start     # desarrollo
yarn build     # build de producción en /build
yarn test      # tests de CRA
```

El `postinstall` ejecuta `scripts/patch-rc-components.js` para parchear componentes `@rc-component/*` que gatillan loops de render en algunas versiones.

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

`.github/workflows/ci.yml` corre en push a `main` y en PRs:

1. Checkout
2. Node 20 + cache Yarn
3. `yarn install --frozen-lockfile --non-interactive`
4. `yarn build`

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

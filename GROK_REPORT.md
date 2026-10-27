# GROK_REPORT — fase base Nereus (feat/nereus-shadcn)

Rama local `feat/nereus-shadcn` (desde `origin/nereus`). Sin push.

## Qué quedó hecho

1. **CRA → Vite 6 + TypeScript `allowJs`.** Entrada en `index.html` (raíz). `tsconfig.json` compila JS y TS sin `checkJs`. El build sale en `dist/` (el Dockerfile copia esa carpeta).
2. **API sin rewrite.** `VITE_API_URL=https://api-ik-nereus.smarthydro.app/api`. El cliente llama `ik/login/`, `ik/my_points/`, etc. La URL final es `…/api/ik/…`. No hay proxy que reescriba `/api/*` a `/api/ik/*`.
3. **Tailwind + shadcn/ui.** Tokens navy `#203562` y lima `#CCCF07`, fuentes Lato (UI) y Roboto (cifras). Claro por defecto; oscuro con la clase `dark` en `<html>` (se recuerda en `localStorage.theme`).
4. **Shell mobile-first.** Sidebar fijo desde `md`. En móvil, el mismo menú va en un `Sheet`. El header lleva el usuario y, si hay más de una sucursal, el selector. Las rutas de producto van con `React.lazy`.
5. **Un solo Axios** (`src/api/nereus/client.ts`): `Authorization: Token …`, timeout 15 s, un reintento en GET ante fallo de red o 502/503/504, y 401 cierra sesión. `X-Branch-ID` solo si `branch_multi=1` (más de una sucursal). React Query envuelve la app (`staleTime` 30 s). Los `setInterval` de Home, HeaderNav, AlertPreview, MyWell y `useProfileData` pasaron a `refetchInterval`.
6. **Login y centro de control** en shadcn, sobre:
   - `POST ik/login/`
   - `GET ik/my_points/`
   - `GET ik/points_summary/`
   - `GET ik/dashboard_stats/`
   - `POST ik/batch/telemetry/` (`point_ids`, `hours: 24`, tope 50)
7. **`src/api/novus` (TagoIO) eliminado.** La documentación interna ya no lo cita.

## Identidad

El shell, el login y el tablero usan la paleta Smart Hydro. Las pantallas anteriores (GEO, telemetría, DGA, análisis, alertas, etc.) siguen en Ant Design, con el primario `#203562`, y se cargan dentro del shell. No se redibujaron sus gráficos.

## Sucursal

El login normaliza sucursales desde `branches`, `sucursales`, `user.branches`, `user.sucursales`, `user.available_branches` o un objeto `branch` / `user.branch`. Con una sola sucursal no se envía `X-Branch-ID` (la resuelve el backend). Con varias, el header usa la sucursal elegida y el selector la cambia, invalida la caché y vuelve a pedir `my_points`.

## Rutas

Públicas: `/login`, `/preview-certificate`. El resto exige sesión. `/` es el tablero nuevo. El resto de paths que ya existían (`/geo`, `/telemetry`, `/analysis`, `/dga`, `/download`, `/documents`, `/alerts`, `/support`, `/profile`, `/admin`, …) siguen registrados y en lazy. Elegir un punto en el tablero guarda `selected_profile` y abre `/telemetry`.

## Legacy que sigue en el cliente único

`src/api/sh/endpoints.js` ahora usa el mismo Axios, pero sus paths siguen siendo los de core (`users/…`, `catchment_point/…`, etc.). La fachada `/api/ik/` no los reescribe: esas pantallas no forman parte de esta fase.

## Verificación

- `yarn install` OK
- `yarn lint` OK
- `yarn build` OK (Vite, salida `dist/`)

No hay herramientas de navegador en esta sesión: no se pudo recorrer login ni el tablero contra la API real. El bundle de producción sí incluye `https://api-ik-nereus.smarthydro.app/api`.

## Cómo correrlo

```bash
yarn start    # Vite en el puerto 3000
yarn build
yarn lint
```

Variables: `.env.example`, `.env.staging`, `.env.production`.

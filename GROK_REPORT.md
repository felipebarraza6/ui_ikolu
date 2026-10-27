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

## Fase producto (misma rama)

Identidad, telemetría, mapa, cumplimiento, avisos, reportes y el agente. Sigue sin push.

### Identidad

Cards KPI con cifra en Roboto, barra lima y icono navy. Badges de estado: en línea `#66E0C2`, atención `#FFC46B`, sin transmisión `#FF847A`, DGA en contorno navy. Gráficos de línea (Chart.js) en cian, navy y lima, con banda autorizada y 90 %. Skeletons, vacío y error con reintento en el tablero, la telemetría, el mapa, el cumplimiento, los avisos y los reportes.

### GEO Smart

Se eliminó `src/components/geo_smart` (ruta, menú del shell, `HeaderNav` y el contenedor `Home`). No queda ruta `/geo`. El mapa nuevo vive en `/mapa`.

### Escala

El padrón del tablero, el selector de punto, la lista DGA y la tabla de registros usan `@tanstack/react-virtual`. El mapa agrupa con Leaflet y `leaflet.markercluster` (`chunkedLoading`). La telemetría pide como máximo 2.000 lecturas y 31 días, y el gráfico baja a 360 puntos. El lote de telemetría del cliente sigue topado en 50 ids. La vista 3D entra en un chunk aparte y solo si el usuario la abre.

### Telemetría

`/telemetry` ya no monta `MyWell`. La pantalla está partida en `src/components/telemetry/`: selector, KPIs (caudal, totalizador, nivel, última transmisión, en línea), rango de fechas, gráficos y tabla virtualizada. `MyWell.js` queda solo para el contenedor `Home`, que el shell no monta.

### Pozo 2D / 3D

El corte SVG y la escena `react-three-fiber` + drei salen de `capture3d.html` y de la ficha del punto (`d1` profundidad, `d2` bomba, `d3` sensor, caudal, nivel y totalizador). Superficial si `type_dga` es `SUPERFICIAL`. El nivel llena el pozo con el rango del período. El toggle 2D/3D se guarda en `localStorage` (`ikolu.view.<usuario>`). Por defecto es 2D.

### Mapa

`/mapa`. Teselas CARTO Voyager, sin clave. Marcador por estado, popup con caudal, nivel, totalizador y última transmisión, y botón a la telemetría. Búsqueda y filtros de estado y tipo. Los puntos sin GPS se cuentan y no se dibujan.

### Portado desde smarthydro_app

- Cumplimiento DGA en `/dga`: estándar y cadencia, % de comprobantes por ranura, bandas dentro / 90 % / sobre el límite, historial `compliance/{id}/flow_history/` y `near_limit/`.
- Panel en vivo en `/`: conteo de toda la sucursal y refresco cada minuto.
- Historial: sheet de `point/{id}/calendar/` (30 días). Un día fija el rango de la telemetría.
- Buzón en `/avisos`: `control_center/system_events/` (100) y `system-events/summary/`. Crítico o atención. Abre el punto si viene en el evento.
- Reportes en `/download` y `/reports`: mismas lecturas, KPIs y descarga CSV o Excel.

### Agente Nereus

Botón fijo y `Sheet` por usuario y sucursal. `GET ai-agents/agents/default/`, `POST ai-agents/conversations/`, `POST ai-agents/conversations/{id}/chat/` con `{ message }`. El mensaje lleva el punto abierto (nombre, id, caudal, nivel, totalizador, última tx, estado). El `conversationId` y los últimos 40 mensajes quedan en `localStorage`.

### Verificación

- `yarn lint` OK
- `yarn build` OK (Vite, `dist/`). El chunk `WellCanvas` queda aparte.

No hay navegador en esta sesión: no se recorrió login ni las pantallas contra la API real.

## Portal único y Estado del servicio

Misma rama, sin push. El front ya no depende de `src/api/sh` ni del host histórico de core.

### API

- Un solo Axios (`src/api/nereus/client.ts`). El portal (`src/api/nereus/portal.ts`) y el cliente optimizado viven ahí. Se eliminó `src/api/sh`.
- Todas las llamadas de perfil, lecturas, notificaciones, clientes, proyectos, puntos y gestión van con prefijo `ik/`, así que la URL final es `/api/ik/…`.
- `users/{username}/` acepta GET y PATCH. El XLSX mensual y las descargas de lecturas piden la planilla con el header `Accept` de spreadsheet (xlsx).
- Se quitó `history_data/`. No queda función ni path.
- Documentos (`file_catchment`) solo si `VITE_ENABLE_DOCUMENTS=true`. Por defecto el flag está apagado: el menú oculta Documentos y esa ruta no llama a la API. Muestra "No disponible aún".
- Un 404 de un dato que el backend todavía no publica se muestra como "No disponible aún".

### Estado del servicio

Ruta `/servicio`, en shadcn. `GET ik/portal_config/` decide qué bloques se piden:

- `show_availability`: `ik/service_status/` y `ik/service_status/uptime/?days=30` (también 7 y 90).
- `show_dga_queue`: `ik/dga_queue/summary/` y `ik/dga_queue/?point=&status=&from=&to=`.
- `show_sla` y `show_internal_tickets`: `ik/sla/summary/` y `ik/sla/tickets/`.
- `show_device_health`: `ik/point/<id>/health/`.
- `show_events`: `ik/incidents/`.

Si `portal_config` responde 404, la pantalla entera dice "No disponible aún" y no dispara el resto. En móvil las tablas pasan a tarjetas.

### Pantallas

El router ya no monta Ant Design. Perfil, alertas, soporte, administración, Smart Análisis, documentos, ayuda, registros PTI y la vista previa del certificado quedaron en shadcn. `/well` abre la telemetría. Salieron de `package.json` `antd`, `@ant-design/icons` y `@ant-design/plots`. `dayjs` quedó como dependencia directa.

Los módulos viejos que el router ya no carga siguen en el árbol (pozo animado, gráficos ant, layouts móviles). No entran al bundle. Si se vuelven a importar, hay que reescribirlos: el paquete antd ya no está instalado.

### Verificación

- `yarn lint` OK
- `yarn build` OK
- `rg api.smarthydro.app` sin coincidencias

No hay navegador en esta sesión: no se recorrió el login ni Estado del servicio contra la API real. Un 404 de esos endpoints se cubre en la UI con el texto "No disponible aún".

# Plan: Refactor UI Centro de Control

## Contexto
El proyecto tiene el Centro de Control en `src/features/control-center/ControlCenter.js` (1365 líneas). El usuario reporta estos problemas:

1. **Routing**: Click en "Cumplimiento" recarga la página (ya fixeado: cambiar `/control_center/` a `/control-center/`)
2. **Skeletons**: Son feos y cubren toda la pantalla. Deben aplicarse SOLO a los datos dinámicos (KPIs, tablas), no al layout completo
3. **UI seco**: Cards y elementos sin animaciones hover, se ven estáticos y aburridos
4. **Tablas en dark mode**: El azul primario (`#00B4D8`) no contrasta bien en fondo oscuro. Los textos y bordes deben ser más claros
5. **ControlCenter.js desordenado**: Monolito de 1365 líneas. Necesita extracción de sub-componentes

## Tareas

### Tarea 1: Fix Routing (CRÍTICO)
**Archivo**: `src/features/control-center/ControlCenter.js`
- Ya fixeado: cambiar navigate de `/control_center/` a `/control-center/`
- **Verificar** que al hacer click en tab "Cumplimiento" navegue correctamente

### Tarea 2: Refactor Skeletons
**Archivos**: 
- `src/features/control-center/SkeletonControlCenter.js`
- `src/features/control-center/SkeletonTelemetry.js`
- `src/features/control-center/SkeletonCompliance.js`

**Problema actual**: Los skeletons cubren TODO el layout (KPIs + tabs + tablas). Se ven horribles.

**Solución**:
- `SkeletonControlCenter`: Mantener solo el esqueleto de los KPI cards (4 tarjetas) y el header del layout. NO skeleton para tabs ni contenido.
- `SkeletonTelemetry`: Skeleton solo para la tabla de datos y gráficos. El header de la tabla puede mostrarse sin skeleton.
- `SkeletonCompliance`: Skeleton solo para la tabla de compliance. NO skeleton para todo el panel.
- **Importante**: El layout (tabs, sidebar, header) DEBE mostrarse siempre, incluso durante loading. Los skeletons solo van sobre el contenido que está cargando.

**Estilo**: Usar colores del tema `smarthydro.colors.surface.medium` para fondo de skeleton, no blanco/gris.

### Tarea 3: Animaciones Hover en Cards
**Archivos**:
- `src/features/control-center/ControlCenterLayout.js` (KPI cards)
- `src/features/control-center/CCWeekConsumption.js` (tablas)
- `src/features/control-center/CCComplianceTable.js` (tabla compliance)

**Solución**:
- Agregar CSS transitions a las cards KPI:
  ```css
  .card-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 180, 216, 0.15);
  }
  ```
- Filas de tablas: hover con highlight sutil
  ```css
  .ocean-table-row:hover {
    background: rgba(0, 180, 216, 0.05);
  }
  ```

### Tarea 4: Mejorar Tablas para Dark Mode
**Archivos**:
- `src/styles/ocean-theme.css` (clases de tabla)
- `src/features/control-center/CCWeekConsumption.js`
- `src/features/control-center/CCComplianceTable.js`

**Problema**: En dark mode, los textos de tabla son gris oscuro (`rgba(255,255,255,0.5)`) y no se leen bien.

**Solución**:
- Headers de tabla: usar `smarthydro.colors.accent[200]` o `#90E0EF` (cyan claro)
- Texto de datos: mínimo `rgba(255,255,255,0.85)` en vez de `0.5`
- Bordes de tabla: `smarthydro.colors.surface.border` en vez de colores hardcodeados
- Row hover: fondo `rgba(0, 180, 216, 0.08)` para destacar

### Tarea 5: Extraer Sub-componentes de ControlCenter.js
**Archivo**: `src/features/control-center/ControlCenter.js` (1365 líneas)

**Extraer a archivos separados**:
- `WarningsDrawer.js` (líneas 580-667) - Drawer de warnings
- `MeasurementsDrawer.js` (líneas 669-852) - Drawer de mediciones  
- `VoucherModal.js` (líneas 854-1098) - Modal de voucher DGA
- `StopTelemetryDrawer.js` (líneas 1114-1195) - Drawer detener telemetría
- `StopComplianceDrawer.js` (líneas 1197-1307) - Drawer detener cumplimiento
- `SupportDrawer.js` (líneas 1309-1325) - Drawer soporte
- `FlowAnalysisDrawer.js` - ya existe como CCFlowAnalysisDrawer
- `ComplianceDetailDrawer.js` - ya existe como CCComplianceDetailDrawer

**Después del refactor**: ControlCenter.js debe quedar con ~400-500 líneas máximo.

### Tarea 6: Mejorar Consistencia Visual
- Asegurar que todos los drawers usen el mismo patrón de estilos (bordes, padding, colores)
- Los botones de acción (Exportar CSV, Descargar) deben ser consistentes
- Los tags/colors deben usar siempre `smarthydro.tokens` (ya parcialmente fixeado)

## Notas Importantes
- **NO** usar emojis en archivos
- **NO** agregar comentarios excesivos
- **SIEMPRE** usar `smarthydro.tokens` para colores
- **MANTENER** funcionalidad existente - este es un refactor visual, no funcional
- **PROBAR** que el build compile después de cada cambio mayor

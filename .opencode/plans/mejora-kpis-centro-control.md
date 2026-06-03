# Plan: Mejorar KPIs Centro de Control - Identidad Visual Agua

## Resumen
Mejorar los KPIs del Centro de Control con identidad visual de agua/océano, quitar spinner intrusivo, agregar indicador de click en warnings, y mejorar soporte dark/light mode.

## Problemas a Resolver
1. **Identidad visual agua**: Los KPIs actuales no transmiten la identidad de marca de agua/smart hydro
2. **Warning clickable**: Necesita indicador visual de que es interactivo (icono mano)
3. **Spinner intrusivo**: El loading state actual muestra skeleton completo que rompe la UX
4. **Dark/Light**: Algunos elementos no se adaptan bien entre modos

## Archivos a Modificar

### 1. `src/styles/theme-variables.css`
- Agregar variables CSS para gradientes KPI con tema agua (light/dark)
- Agregar sombras específicas para KPIs
- Agregar transiciones suaves

### 2. `src/shared/ui/SmartKPICard.jsx`
- Refactorizar para usar clases CSS en lugar de inline styles
- Usar CSS variables para colores/gradientes
- Agregar clase `.smart-kpi-card--clickable` cuando tenga onClick
- Agregar clase `.smart-kpi-card--water` para efecto visual agua
- Soporte dark mode via `data-theme="dark"`

### 3. `src/shared/ui/SmartKPICard.css` (CREAR)
- Estilos base del componente
- Gradientes tipo agua/océano para light mode
- Gradientes oscuros con tintes azules para dark mode
- Efecto hover con elevación
- Indicador de agua en parte inferior
- Icono de mano para elementos clickeables
- Transiciones suaves
- Media queries para responsive

### 4. `src/components/geo_smart/ControlCenterLayout.js`
- Cambiar icono de Warnings a `FaHandPaper` cuando sea clickable
- Mantener `FaExclamationTriangle` cuando no haya warnings
- No usar inline styles - usar clases CSS

### 5. `src/components/geo_smart/ControlCenter.js`
- Quitar `SkeletonControlCenter` como loading state principal
- En su lugar: mostrar UI con datos existentes + indicador sutil de refresh
- Solo mostrar skeleton en primera carga (cuando no hay data previa)
- Usar clase CSS para indicador de loading sutil

### 6. `src/components/geo_smart/SkeletonControlCenter.js`
- Simplificar skeleton para que no sea tan intrusivo
- O eliminar si se decide no usar skeleton en reloads

## Especificaciones de Diseño

### Gradientes Agua (Light)
- Primary: `linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)`
- Success: `linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)`
- Warning: `linear-gradient(135deg, #fff8e1 0%, #ffecb3 50%, #ffe082 100%)`
- Info: `linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)`

### Gradientes Agua (Dark)
- Primary: `linear-gradient(135deg, #0A2540 0%, #203562 50%, #2A4A8A 100%)`
- Success: `linear-gradient(135deg, #1b3a1b 0%, #2d5a27 50%, #3d7a33 100%)`
- Warning: `linear-gradient(135deg, #3d3a1b 0%, #5a5727 50%, #7a7733 100%)`

### Indicador Visual Agua
- Línea inferior con gradiente cyan: `linear-gradient(90deg, #0077B6, #00B4D8, #0077B6)`
- Opacidad 0.6
- Border-radius inferior

### Indicador Clickable
- Icono `FaHandPointer` pequeño junto al label
- Opacidad 0.6
- Color acorde al tema

## Criterios de Aceptacion
- [ ] No hay CSS inline en los archivos modificados
- [ ] Los KPIs usan CSS variables para colores
- [ ] El componente SmartKPICard tiene archivo CSS separado
- [ ] El warning muestra icono de mano cuando es clickable
- [ ] No hay spinner/skeleton intrusivo en reloads de Centro de Control
- [ ] Se ve bien en dark mode y light mode
- [ ] Responsive funciona correctamente

## Notas
- NO usar CSS inline - usar clases CSS y variables CSS
- Seguir convenciones existentes del proyecto
- Usar `data-theme="dark"` para dark mode
- Mantener compatibilidad con Ant Design tokens

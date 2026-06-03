# Plan: {{NOMBRE_FEATURE}}

## Metadata
- **Fecha creacion:** {{FECHA}}
- **Solicitado por:** {{USUARIO}}
- **Estado:** pendiente | en_progreso | completado
- **Agente planner:** @planner
- **Agente coder:** @frontend-coder

---

## 1. Contexto y Objetivo

Describir de forma clara y concisa QUE se necesita construir y POR QUE.
Incluir el problema de usuario o requisito de negocio.

## 2. Analisis de Codigo Existente

### 2.1 Archivos relevantes encontrados
Listar rutas exactas de archivos ya existentes que se deben consultar o modificar.

### 2.2 Componentes/Servicios reutilizables
Identificar `Smart* components`, hooks, stores o utilidades existentes que se puedan reutilizar.

### 2.3 Dependencias y restricciones
- Endpoints de API necesarios (verificar en api.smarthydro.app/docs)
- Permisos de usuario requeridos
- Estados globales a los que debe conectarse

## 3. Especificacion Tecnica

### 3.1 Estructura de archivos a crear/modificar
```
src/
├── components/<dominio>/
│   └── NuevoComponente.js
├── features/<feature>/
│   ├── FeaturePrincipal.js
│   ├── components/
│   └── stores/
├── hooks/
│   └── useNuevoHook.js
```

### 3.2 Contratos de API
Listar endpoints exactos con metodo, URL, params y response esperada.

### 3.3 Estados y flujo de datos
Describir que estado se maneja donde (Zustand, Context, useState).

### 3.4 UI/UX
- Layout y breakpoints
- Estados de carga (skeletons a usar)
- Estados de error
- Interacciones (clicks, modales, drawers)

## 4. Tareas de Implementacion

Las tareas DEBEN ser atomicas y ordenadas. El coder las ejecuta secuencialmente.

### T1: {{NOMBRE_TAREA}}
- **Archivo(s):** `src/...`
- **Accion:** crear / modificar / eliminar
- **Prioridad:** critica / alta / media / baja
- **Dependencias:** ninguna | T{X}, T{Y}
- **Detalle:**
  ```
  Descripcion tecnica exacta de lo que debe hacerse.
  Incluir pseudocodigo o estructura esperada si aplica.
  ```
- **Criterios de aceptacion:**
  - [ ] Criterio 1
  - [ ] Criterio 2

### T2: {{NOMBRE_TAREA}}
- **Archivo(s):** `src/...`
- **Accion:** crear / modificar / eliminar
- **Prioridad:** critica / alta / media / baja
- **Dependencias:** T1
- **Detalle:** ...
- **Criterios de aceptacion:** ...

## 5. Notas para el Coder

- Advertencias especificas (ej: "No modificar Home.js", "Usar orchestrator para API")
- Decisiones de diseno ya tomadas
- Enlaces relevantes (docs de API, figma, etc.)

## 6. Validacion Post-Implementacion

Checklist que el reviewer debe verificar:
- [ ] Todos los archivos del plan fueron creados/modificados
- [ ] El codigo compila sin errores (`yarn build`)
- [ ] Los tests existentes no se rompen (`yarn test`)
- [ ] Responsive funciona (mobile + desktop)
- [ ] Dark mode funciona
- [ ] Estados de carga y error estan implementados
- [ ] No hay console.log de debug
- [ ] Se usa el orchestrator para API calls
- [ ] Colores vienen de tokens/CSS variables

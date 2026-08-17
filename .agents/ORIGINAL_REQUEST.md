# Original User Request

## 2026-08-17T17:35:01Z

Auditar exhaustivamente la API SmartHydro (https://api.smarthydro.app/api/schema/swagger-ui/) contra la base de código de ui_ikolu para garantizar la integración al 100% sin brechas (gaps), limpiar módulos obsoletos/muertos y consolidar la arquitectura de capa única ("Capa One").

Working directory: c:/Users/SH/Documents/GitHub/ui_ikolu
Integrity mode: development

## Requirements

### R1. Auditoría Completa de la OpenAPI / Swagger vs Frontend
Contrastar la especificación OpenAPI de SmartHydro con src/api/sh/endpoints.js y src/api/orchestrator.js para mapear endpoints utilizados, faltantes u obsoletos.

### R2. Limpieza y Refactorización de Módulos Obsoletos
Eliminar módulos, rutas y llamadas mock o deprecadas en la UI que no correspondan con la especificación oficial DRF.

### R3. Cobertura del 100% en la Capa One (UI Ikolu)
Asegurar que todas las funcionalidades clave de la API (Puntos de Captación, Telemetría, Cumplimiento DGA/SMA, Alertas, Usuarios, Clientes, Proyectos) estén consumidas y presentadas de forma impecable en la interfaz.

## Acceptance Criteria

### Integración API & Módulos
- [ ] 0 endpoints 404/obsoletos en la capa de servicios.
- [ ] Informe de brechas (gap analysis) completado y módulos limpiados.
- [ ] Verificación de compilación limpia de la app React sin advertencias ni componentes rotos.

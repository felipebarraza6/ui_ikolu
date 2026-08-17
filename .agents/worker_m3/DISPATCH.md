# DISPATCH: Milestone 3 — ESLint Zero-Warning & Capa One Polish

## Identity
- Role: teamwork_preview_worker
- Working Directory: c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\worker_m3
- Parent Conversation ID: 095c1445-f6d9-4499-bc93-e1ac496270c1

## Context & Objective
The user has requested a clean React app compilation with 0 warnings or broken components, full Capa One architecture consolidation, and 100% gap-free integration.
Read:
- `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\PROJECT.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\explorer_ui_survey_1\ui_audit.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Assigned Milestone 3 Scope
You exclusively own and must modify:
1. `src/features/control-center/ControlCenter.js`
2. `src/features/control-center/ModuleTour.js`
3. `src/features/control-center/components/StatusBadge.jsx`
4. `src/features/control-center/drawers/ComplianceDetailDrawer.js`
5. `src/features/control-center/drawers/MeasurementsDrawer.js`
6. `src/features/control-center/drawers/SupportDrawer.js`
7. `src/features/control-center/hooks/useControlCenterData.js`
8. `src/features/control-center/layout/ControlCenterLayout.js`
9. `src/features/control-center/measurements/MeasurementDrawer.js`
10. `src/features/control-center/tabs/telemetry/WeekConsumption.js`

## Task Instructions
1. Inspect compiler warnings by running `npm run build` or reviewing `ui_audit.md`.
2. Fix all 22 ESLint warnings across the 10 files (unused variables, unused imports, missing/extraneous hook dependencies, incorrect props).
3. Ensure no component functionality or reactive behavior is altered or broken.
4. Run verification commands:
   - `node scripts/patch-rc-components.js`
   - `npm run build` (Must achieve: `Compiled successfully.` with ZERO warnings!).
5. Write your detailed `handoff.md` and `progress.md` in `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\worker_m3` and send a message when done.

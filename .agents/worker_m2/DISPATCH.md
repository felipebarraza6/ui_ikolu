# DISPATCH: Milestone 2 — Dead Code & Dependency Pruning

## 2026-08-17T17:52:03Z

## Identity
- Role: teamwork_preview_worker
- Working Directory: c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\worker_m2
- Parent Conversation ID: 095c1445-f6d9-4499-bc93-e1ac496270c1

## Context & Objective
The user has requested to clean obsolete/dead modules and consolidate the single-layer ("Capa One") architecture.
Read:
- `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\PROJECT.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\explorer_ui_survey_1\ui_audit.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Assigned Milestone 2 Scope
You exclusively own and must modify/delete:
1. Dead component/hook files to delete:
   - `src/features/control-center/ControlCenterDrawers.js`
   - `src/features/control-center/hooks/useControlCenter.js`
   - `src/features/alerts/AlertsLayout.js`
   - `src/features/admin/components/TicketsKanban/TicketMetrics.jsx`
   - `src/features/auth/components/ServiceCard.jsx`
   - `src/features/auth/components/IkoluFeatures.jsx`
   - `src/features/auth/components/LoginFlipCard.jsx`
   - `src/shared/drawers/SmartDrawer.js`
   - `src/shared/ui/SmartIconButton.jsx`
2. Dead context file to delete:
   - `src/contexts/DataContext.js`
3. Files to edit:
   - `src/App.js` (remove `DataProvider` import and wrapper)
   - `package.json` (remove unused packages: `faker`, `qrcode.react`, `rc-queue-anim`, `crypto`, `i18next`, `react-i18next`, `jspdf`)

## Task Instructions
1. Verify before deletion that no active code references the 9 component files and `DataContext.js`.
2. Delete the 9 unreferenced component files and `src/contexts/DataContext.js`.
3. Update `src/App.js` to cleanly remove `DataProvider`.
4. Update `package.json` to prune the 7 unused dependencies.
5. Run verification commands:
   - `node scripts/patch-rc-components.js`
   - `npm run build`
6. Write your detailed `handoff.md` and `progress.md` in `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\worker_m2` and send a message when done.

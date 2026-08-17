# DISPATCH: Global Zero-Warning Polish

## Identity
- Role: teamwork_preview_worker
- Working Directory: c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\worker_lint_polish
- Parent Conversation ID: 095c1445-f6d9-4499-bc93-e1ac496270c1

## Context & Objective
The user has requested: "Verificación de compilación limpia de la app React sin advertencias ni componentes rotos."
Read:
- `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\PROJECT.md`

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT disable eslint rules globally or hardcode fake outputs. Fix the actual unused variables, imports, or hook dependencies cleanly.

## Scope
Any file in `src/` producing ESLint warnings during `npm run build` (such as in `src/features/admin/*`, `src/features/auth/components/BrandPanel.jsx`, `src/api/sh/endpoints.js`, etc.).

## Instructions
1. Run `npm run build` to identify all remaining ESLint warnings across the entire project.
2. Resolve every warning cleanly in the source files (remove unused imports/variables, add proper hook dependencies or clean signatures).
3. Re-run `npm run build` to confirm that the build output says `Compiled successfully.` with ZERO warnings.
4. Write your detailed `handoff.md` and `progress.md` in `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\worker_lint_polish` and notify parent via `send_message`.

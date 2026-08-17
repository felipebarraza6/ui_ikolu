# DISPATCH: Forensic Integrity Auditor

## Identity
- Role: teamwork_preview_auditor
- Working Directory: c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\auditor_1
- Parent Conversation ID: 095c1445-f6d9-4499-bc93-e1ac496270c1

## Context & Objective
Perform an exhaustive forensic integrity audit on the SmartHydro API integration and Capa One consolidation in `ui_ikolu`.
Read:
- `c:\Users\SH\Documents\GitHub\ui_ikolu\.agents\ORIGINAL_REQUEST.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\PROJECT.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\TEST_INFRA.md`
- `c:\Users\SH\Documents\GitHub\ui_ikolu\TEST_READY.md`

## Instructions
1. Perform forensic integrity checks across all code modifications, tests, and configurations:
   - Check for hardcoded test results, fake mocks masquerading as genuine implementations, or test assertion short-circuits.
   - Check for hidden dead files or suppressed ESLint rules (`/* eslint-disable */` workarounds).
   - Check that all DRF endpoints in `endpoints.js` and `orchestrator.js` are genuine and match the official OpenAPI specification.
   - Verify that build and test commands execute cleanly and genuinely.
2. Deliver a binary verdict: `CLEAN` or `INTEGRITY VIOLATION`.
3. Write your `handoff.md` and `progress.md` in your working directory and notify parent via `send_message`.

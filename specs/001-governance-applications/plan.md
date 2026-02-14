# Implementation Plan: Governance Applications Management UI

**Branch**: `001-governance-applications` | **Date**: 2026-02-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-governance-applications/spec.md`

## Summary

Build a complete CRUD UI for governance applications, following the established governance patterns (entitlements, SoD rules, campaigns). The backend API is fully operational. Partial BFF proxy and API client code exists; we extend them and add list, create, and detail/edit pages with sidebar navigation.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), TanStack Table (`@tanstack/svelte-table`), lucide-svelte
**Storage**: N/A (backend handles persistence via xavyo-idp API on localhost:8080)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit SSR)
**Project Type**: Web application (SvelteKit BFF)
**Performance Goals**: Standard web app responsiveness
**Constraints**: Admin-only access, BFF pattern (no direct browser-to-API calls)
**Scale/Scope**: ~11 files (4 edit, 7 create)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server; tokens in HttpOnly cookies |
| II. Test-Driven Development | PASS | Unit tests for schemas, API client, server load/actions, components |
| III. Honest Reviews | PASS | Will run `npm run check` + `npm run test:unit` after implementation |
| IV. Svelte 5 Runes Only | PASS | Using `$props`, `$state`, `$derived`, `$effect` exclusively |
| V. Minimal Complexity | PASS | Follows existing governance CRUD patterns, no new abstractions |
| VI. Type Safety | PASS | Types mirror backend DTOs, Zod schemas match TypeScript types |
| VII. English Only | PASS | All strings in English |
| VIII. Backend Fidelity | PASS | Backend API verified operational (list/create/get/update/delete) |

## Project Structure

### Documentation (this feature)

```text
specs/001-governance-applications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # ADD: CreateApplicationRequest, UpdateApplicationRequest
│   │   └── governance.ts                     # ADD: getApplication, updateApplication, deleteApplication
│   └── schemas/
│       └── governance.ts                     # ADD: createApplicationSchema, updateApplicationSchema
├── routes/
│   ├── api/governance/applications/
│   │   ├── +server.ts                        # EXISTS: GET, POST (no changes)
│   │   └── [id]/+server.ts                   # NEW: GET, PUT, DELETE BFF proxy
│   └── (app)/governance/applications/
│       ├── +page.server.ts                   # NEW: List page server (admin check + load)
│       ├── +page.svelte                      # NEW: List page UI (TanStack Table)
│       ├── create/
│       │   ├── +page.server.ts               # NEW: Create page server (form + action)
│       │   └── +page.svelte                  # NEW: Create page UI (Superform)
│       └── [id]/
│           ├── +page.server.ts               # NEW: Detail page server (load + update/delete actions)
│           └── +page.svelte                  # NEW: Detail page UI (edit form + delete)
└── routes/(app)/+layout.svelte               # EDIT: Add sidebar nav entry

tests/
└── (co-located with source files as *.test.ts)
```

**Structure Decision**: SvelteKit web application following established BFF pattern. All new files follow existing governance feature patterns (entitlements, SoD rules, campaigns).

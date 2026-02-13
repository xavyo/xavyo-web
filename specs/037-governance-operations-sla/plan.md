# Implementation Plan: Governance Operations & SLA Management

**Branch**: `037-governance-operations-sla` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/037-governance-operations-sla/spec.md`

## Summary

Implement an Operations hub under Governance (`/governance/operations`) with 6 tabs covering SLA Policy CRUD, Ticketing Configuration CRUD, Bulk Actions with preview/validate/execute, Failed Operations dashboard with retry/dismiss, Bulk State Operations with progress tracking and cancel, and Scheduled Transitions list with cancel. Uses SvelteKit BFF pattern with 28 backend API endpoints already implemented in xavyo-idp. Follows established patterns from prior governance features.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (SvelteKit)
**Performance Goals**: All pages load in <1s, form submissions in <2s
**Constraints**: Admin-only access, BFF pattern (no direct API calls from client)
**Scale/Scope**: 6 tabs, ~12 pages (hub + create/detail pages), 28 BFF proxy endpoints, ~200+ tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server; BFF proxies validate session cookies |
| II. Test-Driven Development | PASS | Unit tests for all components, schemas, API clients; E2E via Chrome MCP |
| III. Honest Reviews | PASS | Post-implementation review with `npm run check` + `npm run test:unit` |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$props`; no legacy patterns |
| V. Minimal Complexity | PASS | Standard CRUD patterns reused from existing governance features |
| VI. Type Safety | PASS | Types in types.ts mirror backend DTOs; Zod schemas match types |
| VII. English Only | PASS | All UI text in English |
| VIII. Backend Fidelity | PASS | All 28 endpoints already exist in xavyo-idp; verify during E2E testing |

**GATE RESULT**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/037-governance-operations-sla/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── sla-policies.md
│   ├── ticketing-config.md
│   ├── bulk-actions.md
│   ├── failed-operations.md
│   ├── bulk-state-operations.md
│   └── scheduled-transitions.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # Add 7 new types
│   │   ├── governance-operations.ts          # Server-side API client (28 endpoints)
│   │   └── governance-operations-client.ts   # Client-side API
│   ├── schemas/
│   │   └── governance-operations.ts          # Zod schemas (6 schemas)
│   └── components/
│       └── operations/                       # Shared operation components
│           ├── sla-status-badge.svelte
│           ├── ticketing-type-badge.svelte
│           ├── bulk-action-status-badge.svelte
│           ├── failed-op-status-badge.svelte
│           ├── bulk-state-status-badge.svelte
│           ├── scheduled-status-badge.svelte
│           └── expression-editor.svelte
├── routes/
│   ├── api/governance/
│   │   ├── sla-policies/
│   │   │   ├── +server.ts                    # GET list, POST create
│   │   │   └── [id]/+server.ts               # GET detail, PUT update, DELETE
│   │   ├── ticketing-configuration/
│   │   │   ├── +server.ts                    # GET list, POST create
│   │   │   └── [id]/+server.ts               # GET detail, PUT update, DELETE
│   │   ├── bulk-actions/
│   │   │   ├── +server.ts                    # GET list, POST create
│   │   │   ├── validate/+server.ts           # POST validate expression
│   │   │   └── [id]/
│   │   │       ├── +server.ts                # GET detail, PUT update
│   │   │       ├── preview/+server.ts        # POST preview
│   │   │       └── execute/+server.ts        # POST execute
│   │   ├── failed-operations/
│   │   │   ├── +server.ts                    # GET list
│   │   │   └── [id]/
│   │   │       ├── +server.ts                # GET detail, PATCH update
│   │   │       └── retry/+server.ts          # POST retry
│   │   ├── bulk-state-operations/
│   │   │   ├── +server.ts                    # POST create
│   │   │   └── [id]/
│   │   │       ├── +server.ts                # GET detail
│   │   │       ├── cancel/+server.ts         # POST cancel
│   │   │       └── process/+server.ts        # POST process
│   │   └── scheduled-transitions/
│   │       ├── +server.ts                    # GET list
│   │       └── [id]/+server.ts               # GET detail, DELETE cancel
│   └── (app)/governance/operations/
│       ├── +page.server.ts                   # Hub server load
│       ├── +page.svelte                      # Hub with 6 tabs
│       ├── sla/
│       │   ├── create/
│       │   │   ├── +page.server.ts
│       │   │   └── +page.svelte
│       │   └── [id]/
│       │       ├── +page.server.ts
│       │       ├── +page.svelte              # Detail with edit/delete
│       │       └── edit/
│       │           ├── +page.server.ts
│       │           └── +page.svelte
│       ├── ticketing/
│       │   ├── create/
│       │   │   ├── +page.server.ts
│       │   │   └── +page.svelte
│       │   └── [id]/
│       │       ├── +page.server.ts
│       │       ├── +page.svelte              # Detail with edit/delete
│       │       └── edit/
│       │           ├── +page.server.ts
│       │           └── +page.svelte
│       └── bulk-actions/
│           ├── create/
│           │   ├── +page.server.ts
│           │   └── +page.svelte
│           └── [id]/
│               ├── +page.server.ts
│               └── +page.svelte              # Detail with preview/execute/edit
```

**Structure Decision**: Standard SvelteKit route-based structure following the same patterns used in governance/reports, governance/approval-config, governance/licenses, etc. Components in `src/lib/components/operations/`, API clients in `src/lib/api/`, schemas in `src/lib/schemas/`.

## Complexity Tracking

No violations — standard CRUD patterns following existing governance features.

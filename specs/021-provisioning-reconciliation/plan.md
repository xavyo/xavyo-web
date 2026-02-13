# Implementation Plan: Provisioning Operations & Reconciliation

**Branch**: `021-provisioning-reconciliation` | **Date**: 2026-02-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-provisioning-reconciliation/spec.md`

## Summary

Implement complete frontend UI for managing identity provisioning operations and connector reconciliation. This extends Phase 020 (Connector Management) with operational monitoring (operations queue, statistics, DLQ), reconciliation management (runs, discrepancies, schedules, trends), and conflict resolution. The BFF pattern proxies ~35 backend endpoints through SvelteKit server routes.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), TanStack Table (@tanstack/svelte-table), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web application (SvelteKit SSR)
**Project Type**: Web (SvelteKit frontend-only, BFF to existing Rust backend)
**Performance Goals**: Page loads < 2s, action feedback < 3s
**Constraints**: Admin-only access, no external charting libraries (use HTML/CSS for trend visualization)
**Scale/Scope**: ~35 API endpoints, 8 user stories, ~15 new pages/views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server routes. Tokens in HttpOnly cookies. No secrets in client code. |
| II. Test-Driven Development | PASS | Tests for all schemas, API clients, components, and pages. E2E via Chrome DevTools MCP. |
| III. Honest Reviews | PASS | Post-implementation review planned. |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $props. No legacy patterns. |
| V. Minimal Complexity | PASS | One function per endpoint, no clever abstractions. Reuse existing DataTable, EmptyState, Badge components. |
| VI. Type Safety | PASS | All backend DTOs typed in types.ts. Zod schemas match types. No `any`. |
| VII. English Only | PASS | All UI text in English. |
| VIII. Backend Fidelity | PASS | All endpoints verified from backend source. Will validate at E2E time. |

## Project Structure

### Documentation (this feature)

```text
specs/021-provisioning-reconciliation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── operations-api.md
│   ├── reconciliation-api.md
│   └── conflicts-api.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # Add operations/reconciliation types
│   │   ├── operations.ts               # Server-side operations API client
│   │   ├── operations-client.ts        # Client-side operations API
│   │   ├── reconciliation.ts           # Server-side reconciliation API client
│   │   └── reconciliation-client.ts    # Client-side reconciliation API
│   ├── schemas/
│   │   └── operations.ts               # Zod schemas for forms
│   └── components/
│       └── operations/
│           ├── queue-stats-cards.svelte       # Statistics dashboard cards
│           ├── operation-status-badge.svelte   # Status badge component
│           ├── operation-type-badge.svelte     # Type badge component
│           ├── execution-attempts.svelte       # Attempts history display
│           ├── discrepancy-type-badge.svelte   # Discrepancy type badge
│           └── trend-chart.svelte             # Simple HTML/CSS trend bars
├── routes/
│   ├── (app)/
│   │   └── connectors/
│   │       ├── operations/
│   │       │   ├── +page.server.ts            # Operations queue list
│   │       │   ├── +page.svelte               # Operations queue UI
│   │       │   ├── dlq/
│   │       │   │   ├── +page.server.ts        # Dead letter queue
│   │       │   │   └── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.server.ts        # Operation detail
│   │       │       └── +page.svelte
│   │       ├── conflicts/
│   │       │   ├── +page.server.ts            # Conflicts list
│   │       │   ├── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.server.ts        # Conflict detail
│   │       │       └── +page.svelte
│   │       ├── reconciliation/
│   │       │   ├── +page.server.ts            # Global schedules + trend
│   │       │   └── +page.svelte
│   │       └── [id]/
│   │           └── reconciliation/
│   │               ├── +page.server.ts        # Per-connector recon runs
│   │               ├── +page.svelte
│   │               ├── runs/
│   │               │   └── [runId]/
│   │               │       ├── +page.server.ts  # Run detail + report
│   │               │       └── +page.svelte
│   │               ├── discrepancies/
│   │               │   ├── +page.server.ts    # Discrepancy list
│   │               │   └── +page.svelte
│   │               └── schedule/
│   │                   ├── +page.server.ts    # Schedule CRUD
│   │                   └── +page.svelte
│   └── api/
│       ├── operations/
│       │   ├── +server.ts                     # GET list, POST trigger
│       │   ├── stats/+server.ts               # GET stats
│       │   ├── dlq/+server.ts                 # GET DLQ
│       │   ├── conflicts/
│       │   │   ├── +server.ts                 # GET list
│       │   │   └── [id]/
│       │   │       ├── +server.ts             # GET detail
│       │   │       └── resolve/+server.ts     # POST resolve
│       │   └── [id]/
│       │       ├── +server.ts                 # GET detail
│       │       ├── retry/+server.ts           # POST retry
│       │       ├── cancel/+server.ts          # POST cancel
│       │       ├── resolve/+server.ts         # POST resolve
│       │       ├── logs/+server.ts            # GET logs
│       │       └── attempts/+server.ts        # GET attempts
│       ├── connectors/
│       │   └── [id]/
│       │       └── reconciliation/
│       │           ├── runs/
│       │           │   ├── +server.ts         # GET list, POST trigger
│       │           │   └── [runId]/
│       │           │       ├── +server.ts     # GET detail
│       │           │       ├── cancel/+server.ts
│       │           │       ├── resume/+server.ts
│       │           │       └── report/+server.ts
│       │           ├── discrepancies/
│       │           │   ├── +server.ts         # GET list
│       │           │   ├── bulk-remediate/+server.ts
│       │           │   ├── preview/+server.ts
│       │           │   └── [discrepancyId]/
│       │           │       ├── +server.ts     # GET detail
│       │           │       ├── remediate/+server.ts
│       │           │       └── ignore/+server.ts
│       │           ├── actions/+server.ts     # GET audit log
│       │           └── schedule/
│       │               ├── +server.ts         # GET, PUT, DELETE
│       │               ├── enable/+server.ts
│       │               └── disable/+server.ts
│       └── reconciliation/
│           ├── schedules/+server.ts           # GET global schedules
│           └── trend/+server.ts               # GET trend data
```

**Structure Decision**: Extends the existing SvelteKit project structure. Operations pages live under `/connectors/operations/` for cross-connector views. Per-connector reconciliation lives under `/connectors/[id]/reconciliation/`. Global reconciliation views at `/connectors/reconciliation/`. BFF proxies mirror backend paths under `src/routes/api/`.

## Complexity Tracking

No constitution violations. All patterns follow established conventions from Phases 001-020.

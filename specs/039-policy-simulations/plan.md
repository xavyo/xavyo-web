# Implementation Plan: Policy Simulations & What-If Analysis

**Branch**: `039-policy-simulations` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/039-policy-simulations/spec.md`

## Summary

Implement a comprehensive policy simulation and what-if analysis UI covering 29 backend endpoints across 3 domains: policy simulations (SoD/birthright), batch simulations (bulk role/entitlement changes), and simulation comparisons (delta views). Uses the SvelteKit BFF pattern with a unified simulation hub under `/governance/simulations`, admin-only access, and reusable components for impact summaries, result tables, and delta views.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit SSR + CSR)
**Project Type**: Web application (SvelteKit frontend → xavyo-idp backend)
**Performance Goals**: Results load within 3 seconds for up to 10,000 user results
**Constraints**: Admin-only access, 2-step confirmation for batch apply, all operations via BFF proxies
**Scale/Scope**: 29 backend endpoints, 3-tab hub, ~12 pages, ~8 components, ~29 BFF proxies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server routes; tokens in HttpOnly cookies; BFF proxies validate session |
| II. Test-Driven Development | PASS | Unit tests for schemas, API clients, components, pages; E2E via Chrome DevTools MCP |
| III. Honest Reviews | PASS | Post-implementation review with `npm run check` + `npm run test:unit` + E2E |
| IV. Svelte 5 Runes Only | PASS | All state via $state, $derived, $effect, $props; no legacy patterns |
| V. Minimal Complexity | PASS | One function per endpoint, flat file structure, no premature abstractions |
| VI. Type Safety | PASS | Types mirror backend DTOs; Zod schemas match TypeScript types; strict mode |
| VII. English Only | PASS | All labels and code in English |
| VIII. Backend Fidelity | PASS | All 29 endpoints verified to exist in xavyo-idp governance router |

No violations. All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/039-policy-simulations/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── policy-simulations.md
│   ├── batch-simulations.md
│   └── comparisons.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                        # Add simulation types
│   │   ├── simulations.ts                  # Server-side API client (policy + batch + comparisons)
│   │   └── simulations-client.ts           # Client-side API
│   ├── schemas/
│   │   └── simulations.ts                  # Zod validation schemas
│   └── components/
│       └── simulations/
│           ├── impact-summary-cards.svelte  # Impact summary display (policy + batch)
│           ├── simulation-status-badge.svelte # Status + severity badges
│           ├── policy-results-table.svelte  # Policy simulation results
│           ├── batch-results-table.svelte   # Batch simulation results
│           ├── delta-view.svelte            # Comparison delta display
│           ├── filter-criteria-builder.svelte # Batch filter form
│           ├── apply-dialog.svelte          # Batch apply confirmation
│           └── export-button.svelte         # Export JSON/CSV trigger
├── routes/
│   ├── api/governance/simulations/
│   │   ├── policy/
│   │   │   ├── +server.ts                  # GET (list) + POST (create)
│   │   │   └── [id]/
│   │   │       ├── +server.ts              # GET (detail) + DELETE
│   │   │       ├── execute/+server.ts      # POST
│   │   │       ├── cancel/+server.ts       # POST
│   │   │       ├── archive/+server.ts      # POST
│   │   │       ├── restore/+server.ts      # POST
│   │   │       ├── notes/+server.ts        # PATCH
│   │   │       ├── results/+server.ts      # GET
│   │   │       ├── staleness/+server.ts    # GET
│   │   │       └── export/+server.ts       # GET
│   │   ├── batch/
│   │   │   ├── +server.ts                  # GET (list) + POST (create)
│   │   │   └── [id]/
│   │   │       ├── +server.ts              # GET (detail) + DELETE
│   │   │       ├── execute/+server.ts      # POST
│   │   │       ├── apply/+server.ts        # POST
│   │   │       ├── cancel/+server.ts       # POST
│   │   │       ├── archive/+server.ts      # POST
│   │   │       ├── restore/+server.ts      # POST
│   │   │       ├── notes/+server.ts        # PATCH
│   │   │       ├── results/+server.ts      # GET
│   │   │       └── export/+server.ts       # GET
│   │   └── comparisons/
│   │       ├── +server.ts                  # GET (list) + POST (create)
│   │       └── [id]/
│   │           ├── +server.ts              # GET (detail) + DELETE
│   │           └── export/+server.ts       # GET
│   └── (app)/governance/simulations/
│       ├── +page.server.ts                 # Hub: load policy + batch lists
│       ├── +page.svelte                    # 3-tab hub (Policy, Batch, Comparisons)
│       ├── policy/
│       │   ├── create/
│       │   │   ├── +page.server.ts
│       │   │   └── +page.svelte
│       │   └── [id]/
│       │       ├── +page.server.ts
│       │       └── +page.svelte            # Detail with results, lifecycle actions
│       ├── batch/
│       │   ├── create/
│       │   │   ├── +page.server.ts
│       │   │   └── +page.svelte
│       │   └── [id]/
│       │       ├── +page.server.ts
│       │       └── +page.svelte            # Detail with results, apply, lifecycle
│       └── comparisons/
│           ├── create/
│           │   ├── +page.server.ts
│           │   └── +page.svelte
│           └── [id]/
│               ├── +page.server.ts
│               └── +page.svelte            # Delta view with summary cards
```

**Structure Decision**: SvelteKit web app following established BFF pattern. All simulation routes nested under `/governance/simulations/` with dedicated sub-routes for policy, batch, and comparisons. BFF proxies at `/api/governance/simulations/` mirror the backend endpoint structure.

## Complexity Tracking

No constitution violations to justify. All principles satisfied.

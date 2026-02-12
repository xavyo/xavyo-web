# Implementation Plan: Governance Meta-Roles (Business Roles)

**Branch**: `018-governance-meta-roles` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/018-governance-meta-roles/spec.md`

## Summary

Implement complete UI coverage for the backend meta-roles governance API. Meta-roles enable hierarchical role inheritance where a meta-role defines entitlements, constraints, and policies automatically inherited by roles matching dynamic criteria. The frontend adds a meta-roles section under governance with list, create, and detail pages (8-tab detail: Details, Criteria, Entitlements, Constraints, Inheritances, Conflicts, Simulation, Events).

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (SvelteKit frontend, Rust backend)
**Performance Goals**: List pages load within 2 seconds, simulation results within 5 seconds
**Constraints**: Admin-only access, tenant isolation via backend JWT, dark/light theme support
**Scale/Scope**: ~22 backend endpoints to cover, 8-tab detail page, ~3 routes (list, create, [id] detail)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server routes + BFF proxy endpoints |
| II. TDD | PASS | Tests for schemas, API clients, components, and pages |
| III. Honest Reviews | PASS | Will run npm run check + test:unit + E2E after implementation |
| IV. Svelte 5 Runes | PASS | All components use $state, $derived, $props |
| V. Minimal Complexity | PASS | One function per endpoint, flat file structure |
| VI. Type Safety | PASS | Types mirror backend DTOs in types.ts, Zod schemas match |
| VII. English Only | PASS | All UI text in English |
| VIII. Backend Fidelity | PASS | All 22 endpoints verified in backend handler code |

## Project Structure

### Documentation (this feature)

```text
specs/018-governance-meta-roles/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── meta-roles-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/lib/api/
├── meta-roles.ts                    # Server-side API client
├── meta-roles.test.ts               # API client tests
├── meta-roles-client.ts             # Client-side API (for tab data fetching)
├── meta-roles-client.test.ts        # Client API tests
└── types.ts                         # Add meta-role types (modify)

src/lib/schemas/
├── meta-roles.ts                    # Zod validation schemas
└── meta-roles.test.ts               # Schema tests

src/routes/(app)/governance/meta-roles/
├── +page.server.ts                  # List page server load
├── +page.svelte                     # List page
├── meta-roles-list.test.ts          # List page tests
├── create/
│   ├── +page.server.ts              # Create page server load + actions
│   ├── +page.svelte                 # Create form
│   └── meta-roles-create.test.ts    # Create page tests
└── [id]/
    ├── +page.server.ts              # Detail page server load + actions
    ├── +page.svelte                 # Detail page with 8 tabs
    └── meta-roles-detail.test.ts    # Detail page tests

src/routes/api/governance/meta-roles/
├── +server.ts                       # GET list, POST create
├── conflicts/+server.ts             # GET conflicts list
├── conflicts/[conflictId]/resolve/+server.ts  # POST resolve
├── events/+server.ts                # GET events
├── events/stats/+server.ts          # GET event stats
├── [id]/+server.ts                  # GET detail, PUT update, DELETE
├── [id]/enable/+server.ts           # POST enable
├── [id]/disable/+server.ts          # POST disable
├── [id]/criteria/+server.ts         # POST add criterion
├── [id]/criteria/[criteriaId]/+server.ts  # DELETE criterion
├── [id]/entitlements/+server.ts     # POST add entitlement
├── [id]/entitlements/[entitlementId]/+server.ts  # DELETE entitlement
├── [id]/constraints/+server.ts      # POST add constraint
├── [id]/constraints/[constraintId]/+server.ts  # DELETE constraint
├── [id]/inheritances/+server.ts     # GET inheritances
├── [id]/reevaluate/+server.ts       # POST re-evaluate
├── [id]/simulate/+server.ts         # POST simulate
└── [id]/cascade/+server.ts          # POST cascade

src/routes/(app)/+layout.svelte      # Add sidebar nav item (modify)
```

**Structure Decision**: Follow existing patterns from governance roles (Phase 017). Server-side API client + client-side API for tab-loaded data. BFF proxy endpoints for all backend routes. Tabbed detail page with client-side data fetching per tab.

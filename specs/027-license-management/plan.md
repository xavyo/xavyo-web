# Implementation Plan: License Management

**Branch**: `027-license-management` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/027-license-management/spec.md`

## Summary

Admin UI for managing software license pools, assignments, reclamation rules, incompatibilities, analytics dashboard, and compliance reporting. The backend (xavyo-idp) already exposes a complete set of REST endpoints at `/governance/license-*`. The frontend implements a License Management hub with 7 tabs (Pools, Assignments, Analytics, Reclamation Rules, Incompatibilities, Entitlement Links, Compliance) following the established BFF proxy pattern, Superforms for CRUD, and TanStack Table for paginated lists.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), TanStack Table (`@tanstack/svelte-table`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (SvelteKit frontend + Rust/Axum backend)
**Performance Goals**: Bulk operations complete within 10 seconds, analytics dashboard loads in single page view
**Constraints**: Admin role required, max 1000 items per bulk operation, pagination {items, total, limit, offset}
**Scale/Scope**: ~35 new files, ~7 BFF proxy routes, ~6 Zod schemas, ~80-100 new tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server via BFF proxies at `src/routes/api/governance/licenses/`. Tokens in HttpOnly cookies, never exposed to client. |
| II. Test-Driven Development | PASS | Unit tests for all schemas, API clients, components, and pages. E2E via Chrome DevTools MCP. |
| III. Honest Reviews | PASS | Post-implementation review with `npm run check` + `npm run test:unit` + E2E verification. |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$effect`, `$props`. No legacy patterns. |
| V. Minimal Complexity | PASS | One function per endpoint, flat file structure, no premature abstractions. Tabs reuse existing Bits UI Tabs pattern. |
| VI. Type Safety | PASS | Types in `src/lib/api/types.ts` mirror Rust DTOs. Zod schemas match types. No `any`. |
| VII. English Only | PASS | All code and UI text in English. |
| VIII. Backend Fidelity | PASS | All endpoints verified in xavyo-idp backend (migration 065, 7 handler modules). No mocked features. |

## Project Structure

### Documentation (this feature)

```text
specs/027-license-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── license-api.md   # REST API contracts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # Add license management types
│   │   ├── licenses.ts                 # Server-side API client
│   │   ├── licenses.test.ts            # API client tests
│   │   ├── licenses-client.ts          # Client-side API functions
│   │   └── licenses-client.test.ts     # Client API tests
│   └── schemas/
│       ├── licenses.ts                 # Zod validation schemas
│       └── licenses.test.ts            # Schema validation tests
├── routes/
│   ├── api/governance/licenses/
│   │   ├── pools/
│   │   │   ├── +server.ts              # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── +server.ts          # GET, PUT, DELETE
│   │   │       └── archive/+server.ts  # POST archive
│   │   ├── assignments/
│   │   │   ├── +server.ts              # GET list, POST create
│   │   │   ├── [id]/+server.ts         # GET, DELETE
│   │   │   ├── bulk/+server.ts         # POST bulk assign
│   │   │   └── bulk-reclaim/+server.ts # POST bulk reclaim
│   │   ├── reclamation-rules/
│   │   │   ├── +server.ts              # GET list, POST create
│   │   │   └── [id]/+server.ts         # GET, PUT, DELETE
│   │   ├── incompatibilities/
│   │   │   ├── +server.ts              # GET list, POST create
│   │   │   └── [id]/+server.ts         # GET, DELETE
│   │   ├── entitlement-links/
│   │   │   ├── +server.ts              # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── +server.ts          # GET, DELETE
│   │   │       └── enabled/+server.ts  # PUT toggle
│   │   ├── analytics/
│   │   │   ├── dashboard/+server.ts    # GET dashboard
│   │   │   ├── recommendations/+server.ts # GET recommendations
│   │   │   └── expiring/+server.ts     # GET expiring pools
│   │   └── reports/
│   │       ├── compliance/+server.ts   # POST generate report
│   │       └── audit-trail/+server.ts  # GET audit trail
│   └── (app)/governance/licenses/
│       ├── +page.server.ts             # Hub page server load
│       ├── +page.svelte                # Hub with 7 tabs
│       ├── licenses.test.ts            # Hub page tests
│       ├── pools/
│       │   ├── create/
│       │   │   ├── +page.server.ts     # Create form + action
│       │   │   ├── +page.svelte        # Create form UI
│       │   │   └── pool-create.test.ts
│       │   └── [id]/
│       │       ├── +page.server.ts     # Detail load + actions
│       │       ├── +page.svelte        # Detail with edit/archive/delete
│       │       └── pool-detail.test.ts
│       ├── assignments/
│       │   ├── assign/
│       │   │   ├── +page.server.ts     # Assign form + action
│       │   │   ├── +page.svelte        # Assign form UI
│       │   │   └── assign.test.ts
│       │   └── bulk/
│       │       ├── +page.server.ts     # Bulk assign/reclaim
│       │       ├── +page.svelte        # Bulk operations UI
│       │       └── bulk.test.ts
│       ├── reclamation-rules/
│       │   └── create/
│       │       ├── +page.server.ts     # Create rule form + action
│       │       ├── +page.svelte        # Create rule form UI
│       │       └── rule-create.test.ts
│       ├── incompatibilities/
│       │   └── create/
│       │       ├── +page.server.ts     # Create incompatibility form
│       │       ├── +page.svelte        # Create form UI
│       │       └── incompat-create.test.ts
│       └── entitlement-links/
│           └── create/
│               ├── +page.server.ts     # Create link form + action
│               ├── +page.svelte        # Create link form UI
│               └── link-create.test.ts
```

**Structure Decision**: Follows existing xavyo-web patterns — feature routes under `(app)/governance/licenses/`, BFF proxies under `api/governance/licenses/`, API clients in `lib/api/`, schemas in `lib/schemas/`. Hub page with tabs pattern matches governance, federation, and NHI governance hubs.

## Complexity Tracking

No constitution violations to justify. All principles pass cleanly.

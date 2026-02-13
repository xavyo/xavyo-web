# Implementation Plan: Birthright Policies & Lifecycle Workflows

**Branch**: `029-birthright-lifecycle` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/029-birthright-lifecycle/spec.md`

## Summary

Implement a Birthright Policies & Lifecycle Workflows module for JML (Joiner-Mover-Leaver) governance automation. Admins create policies with attribute-based conditions that automatically provision/revoke entitlements when lifecycle events occur. The feature includes a hub page with two tabs (Policies and Lifecycle Events), policy CRUD with an interactive condition builder, simulation and impact analysis, lifecycle event triggering/processing, and event detail with action logs and access snapshots. Architecture follows the established BFF pattern with server-side and client-side API clients, BFF proxies, Zod schemas, and Svelte 5 runes-based components.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4 (@tailwindcss/vite), Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit, Node.js 20+)
**Project Type**: Web application (SvelteKit monolith)
**Performance Goals**: Policy simulation < 2s, event processing < 5s, hub page load < 1s
**Constraints**: All API calls through BFF, HttpOnly cookies for auth, admin-only access
**Scale/Scope**: 15 backend endpoints, 11 BFF proxies, 7 components, 5 pages, ~300+ tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls via SvelteKit server (hooks.server.ts, +page.server.ts, src/routes/api/). No tokens in client code. |
| II. Test-Driven Development | PASS | Unit tests for all components, API clients, schemas, pages. E2E via Chrome DevTools MCP. |
| III. Honest Reviews | PASS | Post-implementation review planned with npm run check + test:unit + visual verification. |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $props. No legacy Svelte 4 patterns. |
| V. Minimal Complexity | PASS | One function per endpoint, flat file structure, reuse existing DataTable/EmptyState/Badge components. |
| VI. Type Safety | PASS | Types mirror backend DTOs in types.ts. Zod schemas match types. No `any` usage. |
| VII. English Only | PASS | All code and UI text in English. |
| VIII. Backend Fidelity | PASS | All 15 endpoints verified in xavyo-idp backend. No mocked features. |

## Project Structure

### Documentation (this feature)

```text
specs/029-birthright-lifecycle/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 quickstart guide
├── contracts/
│   └── api-routes.md    # Phase 1 API contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 task breakdown (TBD)
```

### Source Code (repository root)

```text
src/lib/api/
├── birthright.ts                    # Server-side API client (15 functions)
├── birthright-client.ts             # Client-side API client (15 functions)
└── types.ts                         # +20 birthright/lifecycle types

src/lib/schemas/
└── birthright.ts                    # Zod schemas (create/update policy, create event, simulate)

src/lib/components/birthright/
├── condition-builder.svelte         # Interactive condition row builder
├── condition-row.svelte             # Single condition (attribute, operator, value)
├── entitlement-picker.svelte        # Multi-select entitlement checkbox list
├── simulation-panel.svelte          # JSON input + results display
├── impact-panel.svelte              # Impact analysis results
├── action-log.svelte                # Lifecycle action log table
└── event-trigger-dialog.svelte      # Trigger lifecycle event form

src/routes/api/governance/
├── birthright-policies/
│   ├── +server.ts                   # List + Create
│   ├── simulate/+server.ts          # Simulate all
│   └── [id]/
│       ├── +server.ts               # Get + Update + Archive
│       ├── enable/+server.ts        # Enable
│       ├── disable/+server.ts       # Disable
│       ├── simulate/+server.ts      # Simulate single
│       └── impact/+server.ts        # Impact analysis
└── lifecycle-events/
    ├── +server.ts                   # List + Create
    ├── trigger/+server.ts           # Trigger (create+process)
    └── [id]/
        ├── +server.ts               # Get detail
        └── process/+server.ts       # Process event

src/routes/(app)/governance/birthright/
├── +page.svelte                     # Hub page (Policies + Events tabs)
├── +page.server.ts                  # Hub server load
├── policies/
│   ├── create/
│   │   ├── +page.svelte             # Create form
│   │   └── +page.server.ts          # Create server
│   └── [id]/
│       ├── +page.svelte             # Detail page
│       ├── +page.server.ts          # Detail server
│       └── edit/
│           ├── +page.svelte         # Edit form
│           └── +page.server.ts      # Edit server
└── events/
    └── [id]/
        ├── +page.svelte             # Event detail
        └── +page.server.ts          # Event detail server
```

**Structure Decision**: Follows the established governance feature structure (entitlements, SoD, certifications). Hub page with tabs, separate CRUD pages for complex forms, BFF proxies in `src/routes/api/governance/`.

## Files to Create

```
src/lib/schemas/birthright.ts
src/lib/api/birthright.ts
src/lib/api/birthright-client.ts
src/lib/components/birthright/condition-builder.svelte
src/lib/components/birthright/condition-row.svelte
src/lib/components/birthright/entitlement-picker.svelte
src/lib/components/birthright/simulation-panel.svelte
src/lib/components/birthright/impact-panel.svelte
src/lib/components/birthright/action-log.svelte
src/lib/components/birthright/event-trigger-dialog.svelte
src/routes/api/governance/birthright-policies/+server.ts
src/routes/api/governance/birthright-policies/simulate/+server.ts
src/routes/api/governance/birthright-policies/[id]/+server.ts
src/routes/api/governance/birthright-policies/[id]/enable/+server.ts
src/routes/api/governance/birthright-policies/[id]/disable/+server.ts
src/routes/api/governance/birthright-policies/[id]/simulate/+server.ts
src/routes/api/governance/birthright-policies/[id]/impact/+server.ts
src/routes/api/governance/lifecycle-events/+server.ts
src/routes/api/governance/lifecycle-events/trigger/+server.ts
src/routes/api/governance/lifecycle-events/[id]/+server.ts
src/routes/api/governance/lifecycle-events/[id]/process/+server.ts
src/routes/(app)/governance/birthright/+page.svelte
src/routes/(app)/governance/birthright/+page.server.ts
src/routes/(app)/governance/birthright/policies/create/+page.svelte
src/routes/(app)/governance/birthright/policies/create/+page.server.ts
src/routes/(app)/governance/birthright/policies/[id]/+page.svelte
src/routes/(app)/governance/birthright/policies/[id]/+page.server.ts
src/routes/(app)/governance/birthright/policies/[id]/edit/+page.svelte
src/routes/(app)/governance/birthright/policies/[id]/edit/+page.server.ts
src/routes/(app)/governance/birthright/events/[id]/+page.svelte
src/routes/(app)/governance/birthright/events/[id]/+page.server.ts
```

## Files to Modify

```
src/lib/api/types.ts                       # Add ~20 birthright/lifecycle types
src/routes/(app)/+layout.svelte            # Add "Birthright & JML" sidebar nav item
```

## Execution Order

1. **Types + Schemas** — Add types to types.ts, create Zod schemas with tests
2. **Server API Client + Tests** — birthright.ts with 15 functions + tests
3. **Client API Client + Tests** — birthright-client.ts with 15 functions + tests
4. **BFF Proxies** — All 11 proxy endpoints (7 policy + 4 event)
5. **Components** — 7 components (condition-builder, condition-row, entitlement-picker, simulation-panel, impact-panel, action-log, event-trigger-dialog) + tests
6. **Hub Page** — Main tabbed page with server load + tests
7. **Policy Create Page** — Form with condition builder + entitlement picker + tests
8. **Policy Detail Page** — Info + conditions + entitlements + simulation + impact + tests
9. **Policy Edit Page** — Pre-populated form + tests
10. **Event Detail Page** — Event info + actions + snapshot + process button + tests
11. **Sidebar Nav** — Add "Birthright & JML" link
12. **Full Test Suite** — Verify all tests pass
13. **E2E Testing** — Chrome DevTools MCP validation of critical flows

## Verification

1. `npm run check` — TypeScript + Svelte checks pass
2. `npx vitest run` — All existing + new tests pass (target: ~3900+ tests)
3. Chrome MCP E2E:
   - Navigate to /governance/birthright → verify 2 tabs load
   - Policies tab: empty state → create policy with conditions + entitlements → verify in list
   - Policy detail: simulate with JSON → see match/no-match result
   - Policy detail: run impact analysis → see department/location breakdown
   - Policy lifecycle: disable → enable → archive
   - Lifecycle Events tab: trigger joiner event → process → see summary
   - Event detail: view action log + snapshot
   - Edit policy: modify conditions → save → verify changes
   - Check both dark and light themes

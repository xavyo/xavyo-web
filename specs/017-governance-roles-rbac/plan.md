# Implementation Plan: Governance Roles & RBAC

**Branch**: `017-governance-roles-rbac` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/017-governance-roles-rbac/spec.md`

## Summary

Implement complete frontend UI for governance role management including CRUD operations, hierarchical tree visualization, entitlement mapping, parametric role configuration, and inheritance blocks. This extends the existing governance module with a dedicated Roles section. The backend (xavyo-idp) already provides all 27 endpoints — this phase adds the SvelteKit BFF proxies, API clients, Zod schemas, and Svelte 5 page components.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (backend handles persistence via xavyo-idp API on localhost:8080)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web browser (responsive, dark mode support)
**Project Type**: Web application (SvelteKit frontend, Rust backend)
**Performance Goals**: All CRUD operations complete within 2 seconds. Tree renders up to 50+ roles.
**Constraints**: Admin-only access. Optimistic concurrency via version field. No new npm dependencies.
**Scale/Scope**: ~27 BFF proxy endpoints, ~15 new files, ~5 new route pages, ~6 new components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server. Tokens in HttpOnly cookies only. |
| II. TDD | PASS | Tests for schemas, API clients, components, and pages. E2E via Chrome MCP. |
| III. Honest Reviews | PASS | Post-implementation review with `npm run check` + `npx vitest run` + Chrome MCP. |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$effect`, `$props`. |
| V. Minimal Complexity | PASS | Recursive tree component is the only "complex" pattern; justified by recursive data shape. No abstractions beyond necessity. |
| VI. Type Safety | PASS | Types in types.ts mirror backend DTOs. Zod schemas match TypeScript types. |
| VII. English Only | PASS | All code and UI text in English. |
| VIII. Backend Fidelity | PASS | All 27 endpoints verified against live backend. Response shapes captured from actual API calls. |

## Project Structure

### Documentation (this feature)

```text
specs/017-governance-roles-rbac/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── governance-roles-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # Add GovernanceRole types (MODIFY)
│   │   ├── governance-roles.ts         # Server-side API client (NEW)
│   │   └── governance-roles-client.ts  # Client-side API (NEW)
│   ├── schemas/
│   │   └── governance-roles.ts         # Zod validation schemas (NEW)
│   └── components/
│       └── governance/
│           ├── role-tree-node.svelte    # Recursive tree node (NEW)
│           ├── role-tree.svelte         # Tree container with toggle (NEW)
│           └── role-entitlements-tab.svelte  # Entitlements tab (NEW)
├── routes/
│   ├── api/governance/roles/
│   │   ├── +server.ts                  # GET list + POST create (NEW)
│   │   ├── tree/+server.ts             # GET tree (NEW)
│   │   └── [id]/
│   │       ├── +server.ts              # GET + PUT + DELETE (NEW)
│   │       ├── move/+server.ts         # POST move (NEW)
│   │       ├── impact/+server.ts       # GET impact (NEW)
│   │       ├── ancestors/+server.ts    # GET ancestors (NEW)
│   │       ├── children/+server.ts     # GET children (NEW)
│   │       ├── descendants/+server.ts  # GET descendants (NEW)
│   │       ├── entitlements/
│   │       │   ├── +server.ts          # GET list + POST add (NEW)
│   │       │   └── [eid]/+server.ts    # DELETE remove (NEW)
│   │       ├── effective-entitlements/
│   │       │   ├── +server.ts          # GET (NEW)
│   │       │   └── recompute/+server.ts # POST (NEW)
│   │       ├── parameters/
│   │       │   ├── +server.ts          # GET list + POST add (NEW)
│   │       │   ├── [pid]/+server.ts    # GET + PUT + DELETE (NEW)
│   │       │   └── validate/+server.ts # POST (NEW)
│   │       └── inheritance-blocks/
│   │           ├── +server.ts          # GET list + POST add (NEW)
│   │           └── [bid]/+server.ts    # DELETE (NEW)
│   └── (app)/governance/roles/
│       ├── +page.server.ts             # List load (NEW)
│       ├── +page.svelte                # List + tree view (NEW)
│       ├── create/
│       │   ├── +page.server.ts         # Create form + action (NEW)
│       │   └── +page.svelte            # Create form UI (NEW)
│       └── [id]/
│           ├── +page.server.ts         # Detail load + edit/delete actions (NEW)
│           └── +page.svelte            # Detail with tabs (NEW)
└── (app)/+layout.svelte                # Add sidebar nav item (MODIFY)
```

**Structure Decision**: Follows established SvelteKit patterns from Phase 012-016. New files under existing `src/lib/api/`, `src/lib/schemas/`, `src/routes/api/governance/`, and `src/routes/(app)/governance/` directories. New component directory `src/lib/components/governance/` for role-specific components.

## Key Design Decisions

### Tree View Component
- Recursive `role-tree-node.svelte` renders one node and its children via self-reference
- `role-tree.svelte` wraps with toggle (flat list / tree) and fetches tree data client-side
- Expand/collapse state managed with `$state` Set of expanded node IDs

### Optimistic Concurrency
- `version` field stored in component state and form hidden fields
- On 409 conflict response: show alert "This role was modified by another user. Please reload."
- Include Reload button that calls `invalidateAll()`

### Tab Layout on Detail Page
- Tabs: Details | Entitlements | Parameters | Hierarchy | Blocks
- Each tab loads data lazily via client-side fetch (same pattern as approval config hub)
- Details tab uses Superforms for edit with `invalidateAll: 'force'`

### Entitlement Selector
- Reuse existing governance entitlements list endpoint to populate a dropdown/select
- Show entitlement name and type for selection clarity

## Complexity Tracking

No constitution violations to justify. All patterns are established from prior phases.

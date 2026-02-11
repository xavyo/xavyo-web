# Implementation Plan: Persona & Archetype Management

**Branch**: `005-persona-management` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-persona-management/spec.md`

## Summary

Admin users manage persona archetypes and personas through the governance section. Archetypes define templates (naming patterns, lifecycle policies) for personas. Personas are role-based identities assigned to physical users with 6 lifecycle states. The feature adds archetype CRUD pages, persona list with status-based filtering, persona creation, detail with attribute grouping, and lifecycle actions (activate, deactivate with reason, archive with reason). Reuses existing DataTable component for all lists.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes)
**Primary Dependencies**: SvelteKit, Bits UI, Superforms + Zod, TanStack Table (`@tanstack/svelte-table` v9), Tailwind CSS v4
**Storage**: N/A (backend handles persistence via xavyo-idp API on localhost:8080)
**Testing**: Vitest + @testing-library/svelte (unit tests, co-located)
**Target Platform**: Web (SvelteKit SSR + client-side hydration)
**Project Type**: Web application (SvelteKit)
**Performance Goals**: List pages load in <2s, lifecycle actions complete in <2s
**Constraints**: BFF pattern — all API calls through SvelteKit server, no JWT exposure to client
**Scale/Scope**: ~12 new pages/routes, ~15 new files, reuses existing DataTable + UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All persona/archetype API calls go through SvelteKit server (+page.server.ts, /api/ proxy). No JWT in client code. |
| II. Test-Driven Development | PASS | Schema tests written first, API client tests for all functions. |
| III. Honest Reviews | PASS | Review step included in task plan (type check + test suite + quickstart validation). |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $effect, $props. No legacy patterns. |
| V. Minimal Complexity | PASS | Reuses existing DataTable, follows established patterns from Feature 004 (users). No new abstractions. |
| VI. Type Safety | PASS | New types mirror Rust DTOs exactly. Zod schemas match TS types. No `any`. |
| VII. English Only | PASS | All code and UI strings in English. |

## Project Structure

### Documentation (this feature)

```text
specs/005-persona-management/
├── plan.md              # This file
├── research.md          # Phase 0: technical decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/           # Phase 1: API contracts
│   └── governance-api.md
└── tasks.md             # Phase 2: task breakdown (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # Add persona + archetype types
│   │   └── personas.ts                       # NEW: API client for governance endpoints
│   ├── schemas/
│   │   └── persona.ts                        # NEW: Zod schemas for forms
│   └── components/
│       └── data-table/
│           └── data-table-filters.svelte      # NEW: Filter dropdowns for status/archetype
├── routes/
│   ├── api/
│   │   └── personas/
│   │       └── +server.ts                    # NEW: Proxy for persona list (client-side fetch)
│   └── (app)/
│       └── personas/
│           ├── +page.server.ts               # Persona list page server
│           ├── +page.svelte                  # Persona list page
│           ├── create/
│           │   ├── +page.server.ts           # Create persona server action
│           │   └── +page.svelte              # Create persona form
│           ├── [id]/
│           │   ├── +page.server.ts           # Persona detail + lifecycle actions
│           │   └── +page.svelte              # Persona detail/edit page
│           ├── archetypes/
│           │   ├── +page.server.ts           # Archetype list page server
│           │   ├── +page.svelte              # Archetype list page
│           │   ├── create/
│           │   │   ├── +page.server.ts       # Create archetype server action
│           │   │   └── +page.svelte          # Create archetype form
│           │   └── [id]/
│           │       ├── +page.server.ts       # Archetype detail + actions
│           │       └── +page.svelte          # Archetype detail/edit page
│           ├── persona-status-badge.svelte   # NEW: Status badge (6 states)
│           ├── persona-name-link.svelte      # NEW: Persona name as link
│           ├── archetype-status-badge.svelte # NEW: Active/Inactive badge
│           └── archetype-name-link.svelte    # NEW: Archetype name as link
```

**Structure Decision**: Follows the established pattern from Feature 004 (users). Persona and archetype routes nest under `/personas/` in the (app) layout group. Helper components (badges, links) live alongside the route files. The sidebar already has a "Personas" link at `/personas`.

## Key Design Decisions

### 1. Pagination Format Difference

The governance API uses `{ items, total, limit, offset }` (different from users API `{ users, pagination: { total_count, offset, limit, has_more } }`). The page components handle this by computing `pageCount = Math.ceil(total / pageSize)` from the response. The DataTable component itself doesn't need changes — it accepts `pageCount` and `pagination` as props.

### 2. Filter Dropdowns for Persona List

The persona list needs status and archetype filter dropdowns (unlike users which only has search). Create a `data-table-filters.svelte` component that renders Select dropdowns alongside the search toolbar. Pass filter values and onChange callbacks as props.

### 3. Status Badge Component (6 States)

Create `persona-status-badge.svelte` with color mapping:
- draft → neutral/outline
- active → green/default
- expiring → amber/warning
- expired → red/destructive
- suspended → orange/secondary
- archived → gray/muted

### 4. Lifecycle Dialogs with Reason Input

Deactivate and archive require a text reason (min 5 chars). Create dialogs similar to the delete confirmation but with a textarea for the reason. Validate reason length client-side before submission.

### 5. Archetype Lifecycle Policy Form

The create/edit archetype form includes optional lifecycle policy fields: default_validity_days, max_validity_days, notification_before_expiry_days. These are simple number inputs with sensible defaults (365, 730, 7).

### 6. Proxy Endpoints

Only the persona list needs a client-side proxy endpoint (`/api/personas/+server.ts`) for the DataTable's client-side pagination. Archetype list uses the same pattern. Both proxy endpoints validate session cookies and forward JWT + X-Tenant-Id to the backend.

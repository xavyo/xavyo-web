# Implementation Plan: NHI (Non-Human Identity) Management

**Branch**: `006-nhi-management` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-nhi-management/spec.md`

## Summary

Admin users manage non-human identities (Tools, Agents, Service Accounts) through the NHI section. The feature adds a unified NHI list with type/state filtering, type-specific creation forms, detail pages with edit/delete, credential management (issue/rotate/revoke), and lifecycle actions (activate, suspend, deprecate, archive). NHI pagination uses `{ data, total, limit, offset }` format (third pagination format in the app). Reuses existing DataTable component.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes)
**Primary Dependencies**: SvelteKit, Bits UI, Superforms + Zod, TanStack Table (`@tanstack/svelte-table` v9), Tailwind CSS v4
**Storage**: N/A (backend handles persistence via xavyo-idp API on localhost:8080)
**Testing**: Vitest + @testing-library/svelte (unit tests, co-located)
**Target Platform**: Web (SvelteKit SSR + client-side hydration)
**Project Type**: Web application (SvelteKit)
**Performance Goals**: List pages load in <2s, lifecycle/credential actions complete in <2s
**Constraints**: BFF pattern — all API calls through SvelteKit server, no JWT exposure to client
**Scale/Scope**: ~14 new pages/routes, ~20 new files, reuses existing DataTable + UI components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All NHI API calls go through SvelteKit server (+page.server.ts, /api/ proxy). No JWT in client code. Credential secrets displayed in UI but never stored client-side. |
| II. Test-Driven Development | PASS | Schema tests written first, API client tests for all functions. |
| III. Honest Reviews | PASS | Review step included in task plan (type check + test suite + quickstart validation). |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $effect, $props. No legacy patterns. |
| V. Minimal Complexity | PASS | Reuses existing DataTable, follows established patterns from Features 004/005. No new abstractions. Credential section is a reusable component across detail pages. |
| VI. Type Safety | PASS | New types mirror Rust DTOs exactly. Zod schemas match TS types. No `any`. |
| VII. English Only | PASS | All code and UI strings in English. |

## Project Structure

### Documentation (this feature)

```text
specs/006-nhi-management/
├── plan.md              # This file
├── research.md          # Phase 0: technical decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/           # Phase 1: API contracts
│   └── nhi-api.md
└── tasks.md             # Phase 2: task breakdown (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # Add NHI types (identity, tool, agent, SA, credential)
│   │   └── nhi.ts                            # NEW: API client for NHI endpoints
│   ├── schemas/
│   │   └── nhi.ts                            # NEW: Zod schemas for NHI forms
│   └── components/
│       └── (no new shared components)
├── routes/
│   ├── api/
│   │   └── nhi/
│   │       └── +server.ts                    # NEW: Proxy for unified NHI list (client-side fetch)
│   └── (app)/
│       └── nhi/
│           ├── +page.server.ts               # Unified NHI list page server
│           ├── +page.svelte                  # Unified NHI list page
│           ├── nhi-state-badge.svelte        # NEW: Lifecycle state badge (5 states)
│           ├── nhi-type-badge.svelte         # NEW: NHI type indicator badge
│           ├── nhi-name-link.svelte          # NEW: NHI name as link
│           ├── credentials-section.svelte    # NEW: Shared credential management component
│           ├── tools/
│           │   ├── create/
│           │   │   ├── +page.server.ts       # Create tool server action
│           │   │   └── +page.svelte          # Create tool form
│           │   └── [id]/
│           │       ├── +page.server.ts       # Tool detail + lifecycle + credentials
│           │       └── +page.svelte          # Tool detail/edit page
│           ├── agents/
│           │   ├── create/
│           │   │   ├── +page.server.ts       # Create agent server action
│           │   │   └── +page.svelte          # Create agent form
│           │   └── [id]/
│           │       ├── +page.server.ts       # Agent detail + lifecycle + credentials
│           │       └── +page.svelte          # Agent detail/edit page
│           └── service-accounts/
│               ├── create/
│               │   ├── +page.server.ts       # Create SA server action
│               │   └── +page.svelte          # Create SA form
│               └── [id]/
│                   ├── +page.server.ts       # SA detail + lifecycle + credentials
│                   └── +page.svelte          # SA detail/edit page
```

**Structure Decision**: Follows established patterns from Features 004 (users) and 005 (personas). NHI routes nest under `/nhi/` in the (app) layout group. Type-specific routes at `/nhi/tools/`, `/nhi/agents/`, `/nhi/service-accounts/`. Helper components (badges, links, credentials section) live alongside the route files. The sidebar already has an "NHI" link at `/nhi`.

## Key Design Decisions

### 1. NHI Pagination Format (Third Format)

The NHI API uses `{ data, total, limit, offset }` — different from users (`{ users, pagination }`) and governance (`{ items, total }`). Create clean types mirroring the backend exactly. The DataTable component accepts `pageCount` and `pagination` as props, so the page component computes `pageCount = Math.ceil(total / pageSize)`.

### 2. Unified List with Type/State Filtering

The NHI list at `/nhi` shows all three NHI types in a single table. Two filter dropdowns: NHI type (tool, agent, service_account) and lifecycle state (5 states). Follows the same filter pattern as the persona list in Feature 005.

### 3. Lifecycle State Badge (5 States)

Create `nhi-state-badge.svelte` with color mapping:
- active → green/default
- inactive → outline (neutral)
- suspended → orange
- deprecated → amber
- archived → gray/secondary

### 4. Type-Specific Create Forms

Three separate creation forms at type-specific URLs. Each form has shared base fields (name, description) plus type-specific fields. On submit, the server action calls the type-specific backend endpoint and redirects to the unified NHI list.

### 5. Shared Credentials Section Component

Create `credentials-section.svelte` as a reusable component rendered on all three detail pages. It manages:
- Listing existing credentials (masked values, expiry, active status)
- Issuing new credentials (type selection, returns secret once)
- Rotating credentials (grace period)
- Revoking credentials (confirmation dialog)

The secret is displayed in a Dialog with a copy button and one-time-view warning.

### 6. Detail Pages with Type-Specific Extensions

Detail pages at `/nhi/{type}/[id]` show base NHI fields plus the relevant extension fields. The backend returns a polymorphic response with `tool`, `agent`, or `service_account` extension data. Each detail page renders the appropriate extension section.

### 7. Lifecycle Actions on Detail Pages

Lifecycle action buttons are conditionally shown based on the current state:
- Active → Suspend, Deprecate (no Deactivate button per spec — spec says activate from inactive/suspended)
- Inactive → Activate
- Suspended → Activate (reactivate)
- Deprecated → Archive
- Archived → no buttons (terminal)

Suspend requires an optional reason. Archive requires confirmation dialog.

### 8. Proxy Endpoint

Only one proxy endpoint needed: `/api/nhi/+server.ts` for the unified NHI list. It forwards `nhi_type`, `lifecycle_state`, `offset`, `limit` to the backend. Detail pages use server-side load functions.

# Implementation Plan: Manual Provisioning Tasks & Detection Rules

**Branch**: `001-manual-tasks-detection-rules` | **Date**: 2026-02-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-manual-tasks-detection-rules/spec.md`

## Summary

Add admin UI for managing manual provisioning tasks (dashboard + lifecycle), semi-manual application configuration, and orphan detection rule CRUD. Three backend API groups (20 endpoints total) need BFF proxies, client-side API wrappers, Zod schemas, reusable components, and route pages. Follows established SvelteKit BFF pattern with Svelte 5 runes, Bits UI, Tailwind CSS v4, and Superforms.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit on Node.js)
**Project Type**: Web application (SvelteKit frontend + Rust backend)
**Performance Goals**: Dashboard loads within 2 seconds, filter results within 1 second
**Constraints**: All API calls through BFF (HttpOnly cookies), admin-only access, Svelte 5 runes only
**Scale/Scope**: 20 backend endpoints, ~20 BFF proxies, 3 route groups, 6+ components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server routes with cookie validation |
| II. TDD | PASS | Tests for schemas, API clients, components, and pages |
| III. Honest Reviews | PASS | Will run `npm run check` + `npm run test:unit` + Chrome MCP E2E |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$props` — no legacy patterns |
| V. Minimal Complexity | PASS | One function per endpoint, flat structure, no premature abstractions |
| VI. Type Safety | PASS | Types in types.ts mirror Rust DTOs, Zod schemas match TypeScript types |
| VII. English Only | PASS | All code and UI text in English |
| VIII. Backend Fidelity | PASS | All 20 endpoints already exist in xavyo-idp backend |

No violations. All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/001-manual-tasks-detection-rules/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/lib/api/
├── types.ts                              # Add ManualTask, SemiManual, DetectionRule types
├── manual-tasks.ts                       # Server-side API client (8 endpoints)
├── manual-tasks-client.ts                # Client-side API
├── semi-manual.ts                        # Server-side API client (4 endpoints)
├── semi-manual-client.ts                 # Client-side API
├── detection-rules.ts                    # Server-side API client (8 endpoints)
└── detection-rules-client.ts             # Client-side API

src/lib/schemas/
└── manual-tasks-detection-rules.ts       # Zod schemas for forms

src/lib/components/manual-tasks/
├── task-status-badge.svelte              # Status badge (pending/in_progress/completed/rejected/cancelled)
├── operation-type-badge.svelte           # Operation badge (grant/revoke/modify)
├── sla-indicator.svelte                  # SLA status indicator (normal/at-risk/breached)
├── dashboard-metric-card.svelte          # Dashboard metric card
├── confirm-dialog.svelte                 # Confirm completion dialog (with notes)
└── reject-dialog.svelte                  # Reject task dialog (with reason)

src/lib/components/detection-rules/
├── rule-type-badge.svelte                # Rule type badge (NoManager/Terminated/Inactive/Custom)
└── rule-params-editor.svelte             # Type-specific parameter editor

src/routes/(app)/governance/manual-tasks/
├── +page.server.ts                       # Load dashboard + task list
├── +page.svelte                          # Dashboard cards + filterable task list
└── [id]/
    ├── +page.server.ts                   # Load task detail + actions
    └── +page.svelte                      # Task detail with lifecycle actions

src/routes/(app)/governance/semi-manual/
├── +page.server.ts                       # Load semi-manual app list + configure action
└── +page.svelte                          # Application list with configure/remove

src/routes/(app)/governance/detection-rules/
├── +page.server.ts                       # Load rule list + actions
├── +page.svelte                          # Rule list with filters + seed defaults
├── create/
│   ├── +page.server.ts                   # Create rule action
│   └── +page.svelte                      # Create rule form
└── [id]/
    ├── +page.server.ts                   # Load rule detail + actions
    ├── +page.svelte                      # Rule detail with edit/enable/disable/delete
    └── edit/
        ├── +page.server.ts               # Edit rule action
        └── +page.svelte                  # Edit rule form

src/routes/api/governance/
├── manual-tasks/
│   ├── +server.ts                        # GET list
│   ├── dashboard/+server.ts              # GET dashboard
│   └── [id]/
│       ├── +server.ts                    # GET detail
│       ├── claim/+server.ts              # POST claim
│       ├── start/+server.ts              # POST start
│       ├── confirm/+server.ts            # POST confirm
│       ├── reject/+server.ts             # POST reject
│       └── cancel/+server.ts             # POST cancel
├── semi-manual/
│   └── applications/
│       ├── +server.ts                    # GET list
│       └── [id]/+server.ts              # GET, PUT, DELETE
└── detection-rules/
    ├── +server.ts                        # GET list, POST create
    ├── seed-defaults/+server.ts          # POST seed
    └── [id]/
        ├── +server.ts                    # GET, PUT, DELETE
        ├── enable/+server.ts             # POST enable
        └── disable/+server.ts            # POST disable
```

**Structure Decision**: Standard SvelteKit BFF pattern matching all existing phases. API clients in `src/lib/api/`, schemas in `src/lib/schemas/`, components grouped by feature domain, route pages under `(app)/governance/`, BFF proxies under `routes/api/governance/`.

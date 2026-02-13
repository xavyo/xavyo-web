# Implementation Plan: Lifecycle Configuration

**Branch**: `032-lifecycle-config` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/032-lifecycle-config/spec.md`

## Summary

Implement a Lifecycle Configuration management UI that enables administrators to define state machine configurations for identity objects (users, roles, groups). Includes CRUD for lifecycle configs, states, transitions, transition conditions with evaluation, state entry/exit actions, and user lifecycle status display. Follows the established SvelteKit BFF pattern with 16 backend endpoints already implemented.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit SSR + CSR)
**Project Type**: Web application (SvelteKit)
**Performance Goals**: Page loads < 2s, condition evaluation < 3s
**Constraints**: Admin-only access, BFF security pattern (no tokens in client)
**Scale/Scope**: 16 backend endpoints + 1 user status endpoint, ~15 new route files, ~6 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server; tokens in HttpOnly cookies |
| II. TDD | PASS | Tests for all API clients, schemas, components, and pages |
| III. Honest Reviews | PASS | Post-implementation review with `npm run check` + test suite |
| IV. Svelte 5 Runes | PASS | All components use `$state`, `$derived`, `$props` |
| V. Minimal Complexity | PASS | One function per endpoint, flat structure, no premature abstraction |
| VI. Type Safety | PASS | Types mirror Rust DTOs in types.ts, Zod schemas match |
| VII. English Only | PASS | All UI text in English |
| VIII. Backend Fidelity | PASS | All 16 lifecycle endpoints verified in backend source code |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/032-lifecycle-config/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── lifecycle-configs.md
│   ├── lifecycle-states.md
│   ├── lifecycle-transitions.md
│   ├── transition-conditions.md
│   ├── state-actions.md
│   └── user-lifecycle-status.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # Add lifecycle types
│   │   ├── lifecycle.ts                      # Server-side API client
│   │   ├── lifecycle-client.ts               # Client-side API
│   │   ├── lifecycle.test.ts                 # API client tests
│   │   └── lifecycle-client.test.ts          # Client API tests
│   ├── schemas/
│   │   ├── lifecycle.ts                      # Zod validation schemas
│   │   └── lifecycle.test.ts                 # Schema tests
│   └── components/
│       └── lifecycle/
│           ├── state-badge.svelte            # State type badge (initial/terminal/intermediate)
│           ├── state-badge.test.ts
│           ├── entitlement-action-badge.svelte # Grant/Revoke/NoChange badge
│           ├── entitlement-action-badge.test.ts
│           ├── transition-card.svelte         # Transition display with conditions/approval
│           ├── transition-card.test.ts
│           ├── condition-editor.svelte        # Condition list editor
│           ├── condition-editor.test.ts
│           ├── action-editor.svelte           # Entry/exit action editor
│           ├── action-editor.test.ts
│           └── lifecycle-status.svelte        # User lifecycle status display
│           └── lifecycle-status.test.ts
├── routes/
│   ├── api/governance/lifecycle/             # BFF proxy endpoints
│   │   ├── configs/
│   │   │   ├── +server.ts                   # GET list, POST create
│   │   │   └── [configId]/
│   │   │       ├── +server.ts               # GET detail, PATCH update, DELETE
│   │   │       ├── states/
│   │   │       │   ├── +server.ts           # POST create state
│   │   │       │   └── [stateId]/
│   │   │       │       ├── +server.ts       # PATCH update, DELETE state
│   │   │       │       └── actions/
│   │   │       │           └── +server.ts   # GET, PUT actions
│   │   │       └── transitions/
│   │   │           ├── +server.ts           # POST create transition
│   │   │           └── [transitionId]/
│   │   │               ├── +server.ts       # DELETE transition
│   │   │               └── conditions/
│   │   │                   ├── +server.ts   # GET, PUT conditions
│   │   │                   └── evaluate/
│   │   │                       └── +server.ts # POST evaluate
│   │   └── user-status/
│   │       └── [userId]/
│   │           └── +server.ts               # GET user lifecycle status
│   └── (app)/
│       └── governance/
│           └── lifecycle/
│               ├── +page.server.ts          # List configs (server load)
│               ├── +page.svelte             # Hub: config list with filters
│               ├── lifecycle.test.ts        # Hub page tests
│               ├── create/
│               │   ├── +page.server.ts      # Create config action
│               │   ├── +page.svelte         # Create form
│               │   └── lifecycle-create.test.ts
│               └── [id]/
│                   ├── +page.server.ts      # Detail load + actions
│                   ├── +page.svelte         # Detail: 4 tabs (Details, States, Transitions, Actions)
│                   └── lifecycle-detail.test.ts
```

**Structure Decision**: Standard SvelteKit feature structure matching existing governance patterns (entitlements, roles, certifications). Lifecycle components in `src/lib/components/lifecycle/`, BFF proxies under `src/routes/api/governance/lifecycle/`, pages under `src/routes/(app)/governance/lifecycle/`.

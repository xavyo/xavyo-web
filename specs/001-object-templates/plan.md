# Implementation Plan: Object Templates & Lifecycle Rule Automation

**Branch**: `001-object-templates` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-object-templates/spec.md`

## Summary

Add a complete Object Templates management UI to the governance platform. Admins can create templates targeting user/role/entitlement objects, define rules (set_default, validate, normalize, compute), set scopes (department, role, location, all), configure merge policies, and simulate templates against sample data. The feature follows the established SvelteKit BFF pattern with 14 backend endpoints already implemented.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit SSR)
**Project Type**: Web application (SvelteKit BFF pattern)
**Performance Goals**: Page load <2s, simulation response <3s
**Constraints**: Admin-only access, all API calls through BFF proxy
**Scale/Scope**: 14 backend endpoints, 5 user stories, ~8 pages, ~6 components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server, tokens in HttpOnly cookies |
| II. Test-Driven Development | PASS | Unit tests for all modules, E2E via Chrome MCP |
| III. Honest Reviews | PASS | Post-implementation review with `npm run check` + `npm run test:unit` |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$props` |
| V. Minimal Complexity | PASS | Following existing patterns, no new abstractions |
| VI. Type Safety | PASS | Types in types.ts, Zod schemas match, strict mode |
| VII. English Only | PASS | All text in English |
| VIII. Backend Fidelity | PASS | 14 backend endpoints already implemented, E2E with real backend |

## Project Structure

### Documentation (this feature)

```text
specs/001-object-templates/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Research (N/A — well-understood patterns)
├── data-model.md        # Data model
├── contracts/           # API contracts
│   └── object-templates-api.md
└── tasks.md             # Task breakdown
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # Add ObjectTemplate types
│   │   ├── object-templates.ts               # Server-side API client
│   │   ├── object-templates-client.ts        # Client-side API
│   │   ├── object-templates.test.ts          # Server API tests
│   │   └── object-templates-client.test.ts   # Client API tests
│   ├── schemas/
│   │   ├── object-templates.ts               # Zod schemas
│   │   └── object-templates.test.ts          # Schema tests
│   └── components/
│       └── object-templates/
│           ├── template-status-badge.svelte       # Active/Inactive badge
│           ├── template-status-badge.test.ts
│           ├── action-type-badge.svelte            # set_default/validate/normalize/compute
│           ├── action-type-badge.test.ts
│           ├── scope-badge.svelte                  # department/role/location/all
│           ├── scope-badge.test.ts
│           ├── merge-policy-select.svelte          # Merge strategy selector
│           ├── merge-policy-select.test.ts
│           ├── simulation-panel.svelte             # JSON input + results display
│           ├── simulation-panel.test.ts
│           └── rule-editor.svelte                  # Inline rule add/edit form
│           └── rule-editor.test.ts
├── routes/
│   ├── api/governance/object-templates/
│   │   ├── +server.ts                                    # GET list, POST create
│   │   ├── [id]/
│   │   │   ├── +server.ts                                # GET detail, PUT update, DELETE
│   │   │   ├── rules/
│   │   │   │   ├── +server.ts                            # GET list, POST create
│   │   │   │   └── [ruleId]/+server.ts                   # PUT update, DELETE
│   │   │   ├── scopes/
│   │   │   │   ├── +server.ts                            # GET list, POST create
│   │   │   │   └── [scopeId]/+server.ts                  # DELETE
│   │   │   ├── merge-policy/+server.ts                   # PUT
│   │   │   └── simulate/+server.ts                       # POST
│   └── (app)/governance/object-templates/
│       ├── +page.server.ts                               # List + filters
│       ├── +page.svelte                                  # Template list page
│       ├── create/
│       │   ├── +page.server.ts                           # Create form + action
│       │   └── +page.svelte                              # Create form
│       └── [id]/
│           ├── +page.server.ts                           # Detail load
│           ├── +page.svelte                              # 4-tab detail (Details/Rules/Scopes/Simulation)
│           └── edit/
│               ├── +page.server.ts                       # Edit form + action
│               └── +page.svelte                          # Edit form
```

**Structure Decision**: Standard SvelteKit BFF pattern matching all existing governance features. Components in `src/lib/components/object-templates/`, BFF proxies under `src/routes/api/governance/object-templates/`, pages under `src/routes/(app)/governance/object-templates/`.

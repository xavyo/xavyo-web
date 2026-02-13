# Implementation Plan: Self-Service Request Catalog & Birthright Access

**Branch**: `031-catalog-birthright` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/031-catalog-birthright/spec.md`

## Summary

Implement a self-service access catalog with shopping cart workflow and birthright policy management. Users browse categorized catalog items (roles, entitlements, resources), add items to a cart, validate for SoD conflicts, and submit to create access requests. Admins manage categories, catalog items, and birthright policies (automatic entitlement assignment based on user attributes). The feature covers 27+ backend API endpoints across 4 groups: Catalog Browsing (4), Shopping Cart (7), Catalog Admin (10), and Birthright Policies (10).

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit app on localhost:3000, backend on localhost:8080)
**Project Type**: Web application (SvelteKit frontend + Rust backend)
**Performance Goals**: Pages load under 2s, cart validate under 2s, simulation under 3s
**Constraints**: BFF security model (HttpOnly cookies), Svelte 5 runes only, zod/v3 for Superforms
**Scale/Scope**: ~40 new files, ~300 new tests, 6 user stories, 27+ BFF proxy endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls via SvelteKit server; JWT in HttpOnly cookies; BFF proxies validate session |
| II. Test-Driven Development | PASS | TDD per task; unit tests for all modules; E2E via Chrome DevTools MCP |
| III. Honest Reviews | PASS | Post-implementation honest review + E2E testing planned |
| IV. Svelte 5 Runes Only | PASS | $state, $derived, $props throughout; no legacy patterns |
| V. Minimal Complexity | PASS | One function per endpoint; flat structure; no premature abstractions |
| VI. Type Safety | PASS | Types in types.ts mirroring backend DTOs; Zod schemas matching types; strict mode |
| VII. English Only | PASS | All code, UI text, and error messages in English |
| VIII. Backend Fidelity | PASS | All 27+ endpoints verified to exist in xavyo-idp backend; will E2E test against real backend |

**Gate Result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/031-catalog-birthright/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── catalog-birthright-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/lib/api/
├── catalog.ts                    # Server-side catalog API client
├── catalog-client.ts             # Client-side catalog API
├── birthright.ts                 # Server-side birthright API client
├── birthright-client.ts          # Client-side birthright API
├── catalog.test.ts               # Server API tests
├── catalog-client.test.ts        # Client API tests
├── birthright.test.ts            # Server API tests
├── birthright-client.test.ts     # Client API tests
└── types.ts                      # Add catalog + birthright types

src/lib/schemas/
├── catalog.ts                    # Zod schemas (category, item, cart)
├── birthright.ts                 # Zod schemas (policy, condition)
├── catalog.test.ts               # Schema tests
└── birthright.test.ts            # Schema tests

src/lib/components/catalog/
├── category-sidebar.svelte       # Hierarchical category navigation
├── category-sidebar.test.ts
├── catalog-item-card.svelte      # Item card with requestability badge
├── catalog-item-card.test.ts
├── cart-badge.svelte             # Cart item count badge
├── cart-badge.test.ts
├── cart-item-row.svelte          # Single cart item with actions
├── cart-item-row.test.ts
├── validation-results.svelte     # Cart validation display (issues + SoD)
├── validation-results.test.ts
├── condition-builder.svelte      # Birthright policy condition builder
├── condition-builder.test.ts
├── simulation-results.svelte     # Policy simulation results display
└── simulation-results.test.ts

src/routes/api/governance/catalog/
├── categories/+server.ts         # GET (list categories)
├── categories/[id]/+server.ts    # GET (get category)
├── items/+server.ts              # GET (list items)
├── items/[id]/+server.ts         # GET (get item)
├── cart/+server.ts               # GET (get cart), DELETE (clear cart)
├── cart/items/+server.ts         # POST (add item)
├── cart/items/[itemId]/+server.ts # PUT (update), DELETE (remove)
├── cart/validate/+server.ts      # POST (validate cart)
├── cart/submit/+server.ts        # POST (submit cart)
├── admin/categories/+server.ts   # GET, POST (admin categories)
├── admin/categories/[id]/+server.ts # PUT, DELETE
├── admin/items/+server.ts        # GET, POST (admin items)
├── admin/items/[id]/+server.ts   # PUT, DELETE
├── admin/items/[id]/enable/+server.ts  # POST
└── admin/items/[id]/disable/+server.ts # POST

src/routes/api/governance/birthright-policies/
├── +server.ts                    # GET (list), POST (create)
├── [id]/+server.ts               # GET, PUT, DELETE (archive)
├── [id]/enable/+server.ts        # POST
├── [id]/disable/+server.ts       # POST
├── [id]/simulate/+server.ts      # POST (simulate single)
├── [id]/impact/+server.ts        # POST (impact analysis)
└── simulate/+server.ts           # POST (simulate all)

src/routes/(app)/governance/catalog/
├── +page.server.ts               # Load categories + items
├── +page.svelte                  # Catalog browsing (category sidebar + item grid)
├── catalog-browse.test.ts
├── cart/+page.server.ts          # Load cart
├── cart/+page.svelte             # Cart review + validate + submit
├── cart/catalog-cart.test.ts
├── admin/+page.server.ts         # Admin load categories + items
├── admin/+page.svelte            # Admin catalog management (2-tab: categories, items)
├── admin/catalog-admin.test.ts
├── admin/categories/create/+page.server.ts
├── admin/categories/create/+page.svelte
├── admin/categories/[id]/+page.server.ts  # Edit category
├── admin/categories/[id]/+page.svelte
├── admin/items/create/+page.server.ts
├── admin/items/create/+page.svelte
├── admin/items/[id]/+page.server.ts       # Edit item + enable/disable
└── admin/items/[id]/+page.svelte

src/routes/(app)/governance/birthright-policies/
├── +page.server.ts               # List policies
├── +page.svelte                  # Policy list with status filter
├── birthright-list.test.ts
├── create/+page.server.ts        # Create policy form
├── create/+page.svelte
├── create/birthright-create.test.ts
├── [id]/+page.server.ts          # Policy detail + actions
├── [id]/+page.svelte             # Detail with simulate tab
└── [id]/birthright-detail.test.ts
```

**Structure Decision**: Follows existing xavyo-web patterns. Catalog and birthright are separate route groups under governance. BFF proxies match backend paths. Components are scoped to `src/lib/components/catalog/`.

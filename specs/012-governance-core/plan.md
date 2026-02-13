# Implementation Plan: Governance Core

**Branch**: `012-governance-core` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-governance-core/spec.md`

## Summary

Add identity governance and administration to xavyo-web: entitlement CRUD with GDPR classification, access request workflows (user self-service + admin approve/reject), SoD rules with violation detection, certification campaigns with item-level review, and a risk dashboard with factor-based scoring. All backed by the xavyo-idp governance module (~50+ endpoints). Frontend uses tab layout on a new Governance page with reusable DataTable, EmptyState, and skeleton patterns.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, lucide-svelte, Superforms + Zod (`zod/v3`), TanStack Table
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web browser (desktop + responsive)
**Project Type**: Web application (SvelteKit frontend, BFF proxy to backend)
**Performance Goals**: Pages load within 2s, list views paginate at 50 items
**Constraints**: No JWT exposure to client (BFF pattern), admin role required for governance admin
**Scale/Scope**: ~12 new route pages, ~15 components, ~20 BFF proxy endpoints, ~200 new tests

## Constitution Check

*GATE: All principles verified — no violations.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All governance API calls go through SvelteKit server routes |
| II. TDD | PASS | Tests for schemas, API clients, components, pages |
| III. Honest Reviews | PASS | Will run npm run check + test:unit + E2E |
| IV. Svelte 5 Runes | PASS | All components use $state, $derived, $props |
| V. Minimal Complexity | PASS | Reusing DataTable, EmptyState, tabs, skeleton patterns |
| VI. Type Safety | PASS | Types mirror Rust DTOs exactly per backend research |
| VII. English Only | PASS | All labels in English |
| VIII. Backend Fidelity | PASS | All endpoints verified against xavyo-idp source code |

## Project Structure

### Documentation (this feature)

```text
specs/012-governance-core/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── entitlements.md
│   ├── access-requests.md
│   ├── sod.md
│   ├── certifications.md
│   └── risk.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # ADD governance types (~200 lines)
│   │   ├── governance.ts               # CREATE: entitlements, SoD, certifications server API
│   │   ├── governance.test.ts          # CREATE: server API tests
│   │   ├── governance-client.ts        # CREATE: client-side fetch wrappers
│   │   ├── governance-client.test.ts   # CREATE: client API tests
│   │   ├── access-requests.ts          # CREATE: access request server API
│   │   ├── access-requests.test.ts     # CREATE: access request API tests
│   │   ├── access-requests-client.ts   # CREATE: client-side access request wrappers
│   │   ├── access-requests-client.test.ts
│   │   ├── risk.ts                     # CREATE: risk scoring server API
│   │   ├── risk.test.ts
│   │   ├── risk-client.ts              # CREATE: client-side risk wrappers
│   │   └── risk-client.test.ts
│   ├── schemas/
│   │   ├── governance.ts               # CREATE: Zod schemas for forms
│   │   └── governance.test.ts
│   └── components/
│       └── governance/
│           ├── entitlement-form.svelte
│           ├── sod-rule-form.svelte
│           ├── campaign-form.svelte
│           ├── access-request-form.svelte
│           ├── risk-summary-card.svelte
│           ├── risk-summary-card.test.ts
│           ├── campaign-progress.svelte
│           ├── campaign-progress.test.ts
│           ├── sod-violation-list.svelte
│           ├── sod-violation-list.test.ts
│           ├── governance-overview.svelte
│           └── governance-overview.test.ts
├── routes/
│   ├── (app)/
│   │   └── governance/
│   │       ├── +page.server.ts         # Admin guard + tab layout
│   │       ├── +page.svelte            # Tab layout: Entitlements, Requests, SoD, Certs, Risk
│   │       ├── entitlements/
│   │       │   ├── create/
│   │       │   │   ├── +page.server.ts
│   │       │   │   └── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.server.ts
│   │       │       └── +page.svelte
│   │       ├── access-requests/
│   │       │   └── [id]/
│   │       │       ├── +page.server.ts
│   │       │       └── +page.svelte
│   │       ├── sod/
│   │       │   ├── create/
│   │       │   │   ├── +page.server.ts
│   │       │   │   └── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.server.ts
│   │       │       └── +page.svelte
│   │       └── certifications/
│   │           ├── create/
│   │           │   ├── +page.server.ts
│   │           │   └── +page.svelte
│   │           └── [id]/
│   │               ├── +page.server.ts
│   │               └── +page.svelte
│   │   └── my-requests/
│   │       ├── +page.server.ts         # User self-service access requests
│   │       ├── +page.svelte
│   │       └── create/
│   │           ├── +page.server.ts
│   │           └── +page.svelte
│   └── api/
│       └── governance/
│           ├── entitlements/
│           │   ├── +server.ts          # GET (list), POST (create)
│           │   └── [id]/
│           │       ├── +server.ts      # GET, PUT, DELETE
│           │       └── owner/
│           │           └── +server.ts  # PUT, DELETE
│           ├── access-requests/
│           │   ├── +server.ts          # GET (list), POST (create)
│           │   ├── [id]/
│           │   │   ├── +server.ts      # GET
│           │   │   ├── approve/+server.ts
│           │   │   ├── reject/+server.ts
│           │   │   └── cancel/+server.ts
│           │   └── my/+server.ts       # GET (user's requests)
│           ├── my-approvals/
│           │   └── +server.ts          # GET
│           ├── sod-rules/
│           │   ├── +server.ts          # GET, POST
│           │   └── [id]/
│           │       ├── +server.ts      # GET, PUT, DELETE
│           │       ├── enable/+server.ts
│           │       └── disable/+server.ts
│           ├── sod-violations/
│           │   └── +server.ts          # GET
│           ├── certification-campaigns/
│           │   ├── +server.ts          # GET, POST
│           │   └── [id]/
│           │       ├── +server.ts      # GET, PUT, DELETE
│           │       ├── launch/+server.ts
│           │       ├── cancel/+server.ts
│           │       ├── progress/+server.ts
│           │       └── items/+server.ts
│           ├── certification-items/
│           │   └── [id]/
│           │       └── decide/+server.ts
│           ├── my-certifications/
│           │   └── +server.ts          # GET
│           └── risk/
│               ├── scores/
│               │   ├── +server.ts      # GET (list)
│               │   └── summary/+server.ts
│               └── alerts/
│                   ├── +server.ts      # GET (list)
│                   └── summary/+server.ts
```

**Structure Decision**: Follows existing SvelteKit project patterns. Governance components in `src/lib/components/governance/`, API clients split by domain (governance, access-requests, risk), BFF proxies under `src/routes/api/governance/`. Tab layout on main governance page reuses existing Tabs component from Phase 009.

## Key Implementation Patterns

### Tab Layout
The governance page (`/governance`) uses a tab layout with 5 tabs: Entitlements, Access Requests, SoD, Certifications, Risk. Each tab renders its content inline (not separate routes), following the same pattern as Federation (Phase 011) and Settings (Phase 009).

### BFF Proxy Pattern
Each governance backend endpoint gets a corresponding SvelteKit API route at `/api/governance/...`. These routes:
1. Check `locals.accessToken` and `locals.tenantId`
2. For admin endpoints: validate admin role (optional — backend also checks)
3. Forward request to xavyo-idp with Bearer token and tenant header
4. Return JSON response or error

### Form Handling
Create/edit forms use Superforms + Zod (via `zod/v3`). Server actions validate input, call the API, and redirect on success or return error messages.

### Data Classification / GDPR
The spec mentioned `public/internal/confidential/restricted` but the backend uses GDPR classification: `none/personal/sensitive/special_category`. The frontend matches the backend exactly, with user-friendly labels:
- none → "None"
- personal → "Personal Data"
- sensitive → "Sensitive Data"
- special_category → "Special Category"

### Risk Level Display
Consistent badge styling across all governance pages:
- Low (green), Medium (yellow), High (orange), Critical (red)
- Same pattern as existing status badges in NHI and Personas

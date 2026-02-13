# Implementation Plan: Tenant Administration & Self-Service Dashboards

**Branch**: `023-tenant-admin-selfservice` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/023-tenant-admin-selfservice/spec.md`

## Summary

Implement five admin/self-service UI features: Tenant Branding settings, OAuth Client management, User Group management, My Approvals dashboard, and My Certifications dashboard. All follow the established BFF pattern (SvelteKit → xavyo-idp) with typed API clients, Zod schemas, BFF proxy endpoints, and Svelte 5 pages. Admin features (branding, OAuth, groups) are restricted via `hasAdminRole()` guard; self-service features (approvals, certifications) are available to all authenticated users.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte, TanStack Table
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit SSR + client hydration)
**Project Type**: Web application (SvelteKit frontend, Rust/Axum backend)
**Performance Goals**: Standard web app — pages load in <1s, actions complete in <2s
**Constraints**: BFF security model (HttpOnly cookies), admin role guard on admin features
**Scale/Scope**: 5 feature areas, ~30 new files, ~15 BFF proxy endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server, tokens in HttpOnly cookies |
| II. TDD | PASS | Tests planned for schemas, API clients, components, pages |
| III. Honest Reviews | PASS | Review cycle planned post-implementation |
| IV. Svelte 5 Runes | PASS | All components use `$state`, `$derived`, `$props` |
| V. Minimal Complexity | PASS | One function per endpoint, flat structure, no premature abstractions |
| VI. Type Safety | PASS | Types in types.ts mirror backend DTOs, Zod schemas match |
| VII. English Only | PASS | All strings in English |
| VIII. Backend Fidelity | PASS | All endpoints verified as existing via backend API exploration |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/023-tenant-admin-selfservice/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── branding.md
│   ├── oauth-clients.md
│   ├── groups.md
│   ├── my-approvals.md
│   └── my-certifications.md
└── tasks.md
```

### Source Code (repository root)

```text
src/lib/api/
├── types.ts                    # Add branding, OAuth client, group, approval, certification types
├── branding.ts                 # Server-side branding API client
├── oauth-clients.ts            # Server-side OAuth client API client
├── groups.ts                   # Server-side groups API client
├── my-approvals.ts             # Server-side my-approvals API client
├── my-certifications.ts        # Server-side my-certifications API client
├── branding-client.ts          # Client-side branding API (if needed)
├── oauth-clients-client.ts     # Client-side OAuth API (if needed)
├── groups-client.ts            # Client-side groups API (if needed)
├── my-approvals-client.ts      # Client-side approvals API
└── my-certifications-client.ts # Client-side certifications API

src/lib/schemas/
├── branding.ts                 # Zod schemas for branding form
├── oauth-clients.ts            # Zod schemas for OAuth client forms
└── groups.ts                   # Zod schemas for group forms

src/routes/api/
├── admin/branding/+server.ts               # GET, PUT proxy
├── admin/oauth-clients/+server.ts          # GET, POST proxy
├── admin/oauth-clients/[id]/+server.ts     # GET, PUT, DELETE proxy
├── admin/groups/+server.ts                 # GET, POST proxy
├── admin/groups/[id]/+server.ts            # GET, PUT, DELETE proxy
├── admin/groups/[id]/members/+server.ts    # POST proxy (add members)
├── admin/groups/[id]/members/[userId]/+server.ts  # DELETE proxy (remove member)
├── governance/my-approvals/+server.ts      # GET proxy
├── governance/my-approvals/[id]/approve/+server.ts   # POST proxy
├── governance/my-approvals/[id]/reject/+server.ts    # POST proxy
├── governance/my-certifications/+server.ts # GET proxy
├── governance/my-certifications/[itemId]/certify/+server.ts  # POST proxy
└── governance/my-certifications/[itemId]/revoke/+server.ts   # POST proxy

src/routes/(app)/
├── settings/branding/
│   ├── +page.server.ts         # Load branding, handle update action
│   └── +page.svelte            # Branding settings form
├── settings/oauth-clients/
│   ├── +page.server.ts         # List OAuth clients
│   ├── +page.svelte            # Client list page
│   ├── create/
│   │   ├── +page.server.ts     # Create form + action
│   │   └── +page.svelte        # Create form
│   └── [id]/
│       ├── +page.server.ts     # Client detail + edit/enable/disable/delete actions
│       └── +page.svelte        # Client detail page
├── groups/
│   ├── +page.server.ts         # List groups
│   ├── +page.svelte            # Group list page
│   ├── create/
│   │   ├── +page.server.ts     # Create form + action
│   │   └── +page.svelte        # Create form
│   └── [id]/
│       ├── +page.server.ts     # Group detail + edit/delete/add-member/remove-member
│       └── +page.svelte        # Group detail page with member list
├── my-approvals/
│   ├── +page.server.ts         # List pending approvals
│   └── +page.svelte            # Approvals list with approve/reject actions
└── my-certifications/
    ├── +page.server.ts         # List certification items
    └── +page.svelte            # Certifications list with certify/revoke actions

src/routes/(app)/+layout.svelte  # Add sidebar nav items
```

**Structure Decision**: Follows existing project patterns — admin features under settings or top-level admin routes, self-service under top-level app routes. All follow BFF pattern with server-side API clients, BFF proxies, and Svelte 5 pages.

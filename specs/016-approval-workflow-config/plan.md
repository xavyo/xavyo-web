# Implementation Plan: Approval Workflow Configuration

**Branch**: `016-approval-workflow-config` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/016-approval-workflow-config/spec.md`

## Summary

Implement complete UI coverage for the backend approval workflow, approval group, escalation policy, and SoD exemption APIs. This unblocks the existing access request system (which fails with "No approval workflow configured" without a default workflow). Follows the established BFF pattern: Svelte pages → SvelteKit server actions/loads → BFF proxy endpoints → xavyo-idp REST API.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (desktop + responsive)
**Project Type**: Web application (SvelteKit frontend only)
**Performance Goals**: All pages load < 2s, CRUD operations with feedback < 2s
**Constraints**: Admin-only access, follows existing governance patterns
**Scale/Scope**: ~20 new files, ~15 BFF proxy endpoints, 5 page routes + sub-routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server; tokens in HttpOnly cookies |
| II. Test-Driven Development | PASS | Unit tests for all components, schemas, API clients; E2E via Chrome MCP |
| III. Honest Reviews | PASS | Review planned after implementation |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $props |
| V. Minimal Complexity | PASS | One function per endpoint, flat structure, no abstractions |
| VI. Type Safety | PASS | Types mirror backend DTOs; Zod schemas match types |
| VII. English Only | PASS | All labels and code in English |
| VIII. Backend Fidelity | PASS | All endpoints verified to exist in xavyo-idp; E2E tests use real backend |

## Project Structure

### Documentation (this feature)

```text
specs/016-approval-workflow-config/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── approval-workflows.md
│   ├── approval-groups.md
│   ├── escalation-policies.md
│   └── sod-exemptions.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                              # Add new types (modify)
│   │   ├── approval-workflows.ts                 # Server-side API client
│   │   ├── approval-workflows.test.ts            # API client tests
│   │   ├── approval-workflows-client.ts          # Client-side API
│   │   └── approval-workflows-client.test.ts     # Client API tests
│   ├── schemas/
│   │   ├── approval-workflows.ts                 # Zod schemas
│   │   └── approval-workflows.test.ts            # Schema tests
│   └── components/
│       └── governance/
│           ├── workflows-tab.svelte              # Workflow list tab
│           ├── workflows-tab.test.ts
│           ├── groups-tab.svelte                 # Groups list tab
│           ├── groups-tab.test.ts
│           ├── escalation-policies-tab.svelte    # Escalation policy list tab
│           ├── escalation-policies-tab.test.ts
│           ├── sod-exemptions-tab.svelte         # SoD exemptions list tab
│           └── sod-exemptions-tab.test.ts
├── routes/
│   ├── (app)/
│   │   ├── +layout.svelte                        # Add sidebar nav item (modify)
│   │   └── governance/
│   │       ├── approval-config/
│   │       │   ├── +page.server.ts               # Hub page server load
│   │       │   ├── +page.svelte                  # Hub page with 3 tabs
│   │       │   ├── approval-config.test.ts
│   │       │   ├── workflows/
│   │       │   │   ├── create/
│   │       │   │   │   ├── +page.server.ts
│   │       │   │   │   ├── +page.svelte
│   │       │   │   │   └── workflow-create.test.ts
│   │       │   │   └── [id]/
│   │       │   │       ├── +page.server.ts
│   │       │   │       ├── +page.svelte
│   │       │   │       └── workflow-detail.test.ts
│   │       │   ├── groups/
│   │       │   │   ├── create/
│   │       │   │   │   ├── +page.server.ts
│   │       │   │   │   ├── +page.svelte
│   │       │   │   │   └── group-create.test.ts
│   │       │   │   └── [id]/
│   │       │   │       ├── +page.server.ts
│   │       │   │       ├── +page.svelte
│   │       │   │       └── group-detail.test.ts
│   │       │   └── escalation-policies/
│   │       │       ├── create/
│   │       │       │   ├── +page.server.ts
│   │       │       │   ├── +page.svelte
│   │       │       │   └── escalation-create.test.ts
│   │       │       └── [id]/
│   │       │           ├── +page.server.ts
│   │       │           ├── +page.svelte
│   │       │           └── escalation-detail.test.ts
│   │       ├── sod/
│   │       │   └── exemptions/
│   │       │       ├── create/
│   │       │       │   ├── +page.server.ts
│   │       │       │   ├── +page.svelte
│   │       │       │   └── exemption-create.test.ts
│   │       │       └── [id]/
│   │       │           ├── +page.server.ts       # (optional, only if detail page needed)
│   │       │           └── +page.svelte
│   │       └── access-requests/
│   │           └── [id]/
│   │               ├── +page.server.ts           # Modify: load escalation history
│   │               └── +page.svelte              # Modify: add escalation section
│   └── api/
│       └── governance/
│           ├── approval-workflows/
│           │   ├── +server.ts                    # GET list, POST create
│           │   └── [id]/
│           │       ├── +server.ts                # GET, PUT, DELETE
│           │       └── set-default/
│           │           └── +server.ts            # POST
│           ├── approval-groups/
│           │   ├── +server.ts                    # GET list, POST create
│           │   └── [id]/
│           │       ├── +server.ts                # GET, PUT, DELETE
│           │       ├── enable/+server.ts         # POST
│           │       ├── disable/+server.ts        # POST
│           │       └── members/+server.ts        # POST (add/remove)
│           ├── escalation-policies/
│           │   ├── +server.ts                    # GET list, POST create
│           │   └── [id]/
│           │       ├── +server.ts                # GET, PUT, DELETE
│           │       ├── set-default/+server.ts    # POST
│           │       └── levels/
│           │           ├── +server.ts            # POST (add level)
│           │           └── [levelId]/+server.ts  # DELETE
│           ├── sod-exemptions/
│           │   ├── +server.ts                    # GET list, POST create
│           │   └── [id]/
│           │       ├── +server.ts                # GET
│           │       └── revoke/+server.ts         # POST
│           └── access-requests/
│               └── [id]/
│                   ├── escalation-history/+server.ts  # GET
│                   ├── cancel-escalation/+server.ts   # POST
│                   └── reset-escalation/+server.ts    # POST
```

**Structure Decision**: Follows the established pattern from phases 012-015: governance sub-routes with server loads, client-side tab components, and BFF proxy endpoints. The "Approval Config" hub mirrors the governance reports hub (3-tab layout).

# Implementation Plan: NHI Access Requests & Persona Context

**Branch**: `038-nhi-requests-persona-context` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/038-nhi-requests-persona-context/spec.md`

## Summary

Implement frontend coverage for 31 backend endpoints across NHI access requests, NHI usage tracking, NHI enhanced certifications, persona context switching, persona expiry management, and persona attribute propagation. Follows established BFF pattern with SvelteKit server-side API proxies.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web application (SvelteKit SSR)
**Project Type**: Web application (SvelteKit frontend with BFF pattern)
**Performance Goals**: All pages load < 3s, context switch < 3s
**Constraints**: HttpOnly cookies for auth, all API calls via server-side BFF
**Scale/Scope**: 31 new API proxy endpoints, ~15 new pages, ~8 new components

## Constitution Check

*GATE: All principles satisfied.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All 31 endpoints proxied via SvelteKit server routes |
| II. TDD | PASS | Tests for schemas, APIs, components, pages |
| III. Honest Reviews | PASS | Post-implementation review + E2E testing planned |
| IV. Svelte 5 Runes | PASS | All components use `$state`, `$derived`, `$props` |
| V. Minimal Complexity | PASS | One function per endpoint, flat file structure |
| VI. Type Safety | PASS | All backend DTOs typed in types.ts, Zod schemas match |
| VII. English Only | PASS | All strings in English |
| VIII. Backend Fidelity | PASS | All 31 endpoints verified in backend Rust handlers |

## Project Structure

### Documentation (this feature)

```text
specs/038-nhi-requests-persona-context/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── nhi-requests-api.md
│   ├── nhi-usage-api.md
│   ├── nhi-certifications-api.md
│   ├── persona-context-api.md
│   └── persona-expiry-api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # Add new types (NhiRequest, NhiUsage, NhiCertCampaign, PersonaContext)
│   │   ├── nhi-requests.ts                   # Server-side NHI request API client
│   │   ├── nhi-requests-client.ts            # Client-side NHI request API
│   │   ├── nhi-usage.ts                      # Server-side NHI usage API client
│   │   ├── nhi-usage-client.ts               # Client-side NHI usage API
│   │   ├── nhi-cert-campaigns.ts             # Server-side NHI certification API client
│   │   ├── nhi-cert-campaigns-client.ts      # Client-side NHI certification API
│   │   ├── persona-context.ts                # Server-side persona context API client
│   │   ├── persona-context-client.ts         # Client-side persona context API
│   │   ├── persona-expiry.ts                 # Server-side persona expiry API client
│   │   └── persona-expiry-client.ts          # Client-side persona expiry API
│   ├── schemas/
│   │   ├── nhi-requests.ts                   # Zod schemas for NHI request forms
│   │   ├── nhi-cert-campaigns.ts             # Zod schemas for NHI cert campaign forms
│   │   ├── persona-context.ts                # Zod schemas for persona context forms
│   │   └── persona-expiry.ts                 # Zod schemas for persona expiry forms
│   └── components/
│       ├── nhi/
│       │   ├── request-status-badge.svelte   # Status badge for NHI requests
│       │   ├── nhi-summary-cards.svelte      # Summary stat cards for NHI main page
│       │   ├── usage-history-table.svelte    # Usage history table for entity detail
│       │   ├── usage-summary-stats.svelte    # Usage summary stats display
│       │   └── cert-item-table.svelte        # Certification items table with bulk decide
│       └── persona/
│           ├── context-indicator.svelte      # Persona context indicator for header
│           ├── context-switch-card.svelte    # Switch to/from persona card
│           └── session-history-table.svelte  # Context session history table
├── routes/
│   ├── api/
│   │   ├── nhi/
│   │   │   ├── requests/
│   │   │   │   ├── +server.ts                # GET list, POST submit
│   │   │   │   ├── summary/+server.ts        # GET summary
│   │   │   │   ├── my-pending/+server.ts     # GET my pending
│   │   │   │   └── [id]/
│   │   │   │       ├── +server.ts            # GET detail
│   │   │   │       ├── approve/+server.ts    # POST approve
│   │   │   │       ├── reject/+server.ts     # POST reject
│   │   │   │       └── cancel/+server.ts     # POST cancel
│   │   │   ├── usage/
│   │   │   │   ├── [id]/+server.ts           # GET history, POST record
│   │   │   │   ├── [id]/summary/+server.ts   # GET usage summary
│   │   │   │   └── staleness/+server.ts      # GET staleness report
│   │   │   ├── summary/+server.ts            # GET NHI summary stats
│   │   │   └── certification/
│   │   │       ├── campaigns/
│   │   │       │   ├── +server.ts            # GET list, POST create
│   │   │       │   └── [campaignId]/
│   │   │       │       ├── +server.ts        # GET detail
│   │   │       │       ├── launch/+server.ts # POST launch
│   │   │       │       ├── cancel/+server.ts # POST cancel
│   │   │       │       ├── summary/+server.ts # GET summary
│   │   │       │       └── items/+server.ts  # GET items
│   │   │       ├── items/
│   │   │       │   ├── [itemId]/decide/+server.ts   # POST decide
│   │   │       │   └── bulk-decide/+server.ts       # POST bulk decide
│   │   │       └── my-pending/+server.ts     # GET my pending cert items
│   │   ├── personas/
│   │   │   ├── context/
│   │   │   │   ├── switch/+server.ts         # POST switch
│   │   │   │   ├── switch-back/+server.ts    # POST switch-back
│   │   │   │   ├── current/+server.ts        # GET current
│   │   │   │   └── sessions/+server.ts       # GET sessions
│   │   │   ├── expiring/+server.ts           # GET expiring list
│   │   │   └── [id]/
│   │   │       ├── extend/+server.ts         # POST extend
│   │   │       └── propagate/+server.ts      # POST propagate attributes
│   │   └── ...existing proxies
│   └── (app)/
│       ├── nhi/
│       │   ├── +page.server.ts               # MODIFY: add NHI summary stats
│       │   ├── +page.svelte                  # MODIFY: add summary cards
│       │   ├── requests/
│       │   │   ├── +page.server.ts           # Request list + summary
│       │   │   ├── +page.svelte              # Request list with filters
│       │   │   ├── create/
│       │   │   │   ├── +page.server.ts       # Create form
│       │   │   │   └── +page.svelte          # Submit request form
│       │   │   └── [id]/
│       │   │       ├── +page.server.ts       # Request detail + actions
│       │   │       └── +page.svelte          # Detail with approve/reject/cancel
│       │   ├── staleness/
│       │   │   ├── +page.server.ts           # Staleness report
│       │   │   └── +page.svelte              # Staleness report page
│       │   ├── agents/[id]/                  # MODIFY: add Usage tab
│       │   ├── tools/[id]/                   # MODIFY: add Usage tab
│       │   ├── service-accounts/[id]/        # MODIFY: add Usage tab
│       │   └── governance/
│       │       └── certifications/           # MODIFY: enhance with campaign lifecycle
│       │           ├── +page.svelte          # Enhanced campaign list
│       │           ├── create/+page.svelte   # Enhanced create form
│       │           ├── [id]/+page.svelte     # Enhanced detail with items
│       │           └── my-pending/
│       │               ├── +page.server.ts   # My pending cert items
│       │               └── +page.svelte      # Pending items list
│       └── personas/
│           ├── context/
│           │   ├── +page.server.ts           # Current context + sessions
│           │   └── +page.svelte              # Context page with switch
│           └── expiring/
│               ├── +page.server.ts           # Expiring personas list
│               └── +page.svelte              # Expiring list with extend
```

**Structure Decision**: SvelteKit web application following established BFF pattern. All new routes follow existing conventions under `src/routes/(app)/` for authenticated pages and `src/routes/api/` for BFF proxies.

## Complexity Tracking

No violations — all complexity within constitutional bounds.

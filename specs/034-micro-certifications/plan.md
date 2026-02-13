# Implementation Plan: Micro Certifications & Event-Driven Reviews

**Branch**: `034-micro-certifications` | **Date**: 2026-02-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/034-micro-certifications/spec.md`

## Summary

Implement a micro certifications UI enabling event-driven, real-time access certification reviews. The feature includes a reviewer dashboard for pending certifications, admin trigger rule management, bulk operations, statistics dashboard, audit event trail, and manual triggering. Follows the existing SvelteKit BFF pattern with 20 backend endpoints already implemented.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (desktop + responsive)
**Project Type**: Web application (SvelteKit frontend with BFF)
**Performance Goals**: Dashboard loads in <2s, single decisions <30s user flow, bulk operations <5s for 50 items
**Constraints**: Must follow BFF security pattern (HttpOnly cookies), admin-only for trigger rules/bulk/stats/manual trigger
**Scale/Scope**: 20 backend endpoints, ~15 new pages/components, ~300 new tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server, cookies-only auth |
| II. Test-Driven Development | PASS | Unit tests for all components/schemas/APIs, E2E via Chrome MCP |
| III. Honest Reviews | PASS | Post-implementation review planned |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $props |
| V. Minimal Complexity | PASS | One function per endpoint, flat structure, reuse existing patterns |
| VI. Type Safety | PASS | Types in types.ts mirror backend DTOs, Zod schemas match |
| VII. English Only | PASS | All code and UI text in English |
| VIII. Backend Fidelity | PASS | All 20 endpoints exist in xavyo-idp, verified in handler files |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/034-micro-certifications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── certifications.md
│   ├── triggers.md
│   ├── statistics.md
│   └── events.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # Add micro certification types
│   │   ├── micro-certifications.ts           # Server-side API client
│   │   ├── micro-certifications-client.ts    # Client-side API
│   │   ├── micro-certifications.test.ts      # Server API tests
│   │   └── micro-certifications-client.test.ts # Client API tests
│   ├── schemas/
│   │   ├── micro-certifications.ts           # Zod validation schemas
│   │   └── micro-certifications.test.ts      # Schema tests
│   └── components/
│       └── micro-certifications/
│           ├── cert-status-badge.svelte       # Status badge (pending/certified/revoked/etc)
│           ├── cert-status-badge.test.ts
│           ├── cert-decision-dialog.svelte    # Certify/Revoke/Skip dialog
│           ├── cert-decision-dialog.test.ts
│           ├── cert-delegate-dialog.svelte    # Delegate dialog
│           ├── cert-delegate-dialog.test.ts
│           ├── cert-events-timeline.svelte    # Chronological events
│           ├── cert-events-timeline.test.ts
│           ├── cert-stats-cards.svelte        # Statistics summary cards
│           ├── cert-stats-cards.test.ts
│           ├── trigger-rule-badge.svelte      # Trigger type/scope badges
│           └── trigger-rule-badge.test.ts
├── routes/
│   ├── (app)/
│   │   └── governance/
│   │       └── micro-certifications/
│   │           ├── +page.server.ts            # Hub server load (admin: all + stats, reviewer: pending)
│   │           ├── +page.svelte               # Hub with tabs: My Pending, All, Trigger Rules, Statistics
│   │           ├── micro-certifications.test.ts
│   │           ├── micro-certifications-server.test.ts
│   │           ├── [id]/
│   │           │   ├── +page.server.ts        # Certification detail server load + actions
│   │           │   ├── +page.svelte           # Detail with events timeline + action buttons
│   │           │   └── cert-detail.test.ts
│   │           ├── triggers/
│   │           │   ├── create/
│   │           │   │   ├── +page.server.ts    # Create trigger rule form + action
│   │           │   │   ├── +page.svelte
│   │           │   │   └── trigger-create.test.ts
│   │           │   └── [id]/
│   │           │       ├── +page.server.ts    # Trigger rule detail + edit/enable/disable/delete
│   │           │       ├── +page.svelte
│   │           │       └── trigger-detail.test.ts
│   │           └── trigger/
│   │               ├── +page.server.ts        # Manual trigger form + action
│   │               ├── +page.svelte
│   │               └── manual-trigger.test.ts
│   └── api/
│       └── governance/
│           └── micro-certifications/
│               ├── +server.ts                 # GET list, POST bulk-decide
│               ├── my-pending/+server.ts      # GET my pending
│               ├── stats/+server.ts           # GET statistics
│               ├── trigger/+server.ts         # POST manual trigger
│               ├── events/+server.ts          # GET global events search
│               ├── [id]/+server.ts            # GET detail
│               ├── [id]/decide/+server.ts     # POST decide
│               ├── [id]/delegate/+server.ts   # POST delegate
│               ├── [id]/skip/+server.ts       # POST skip
│               ├── [id]/events/+server.ts     # GET certification events
│               └── triggers/
│                   ├── +server.ts             # GET list, POST create
│                   └── [id]/
│                       ├── +server.ts         # GET, PUT, DELETE
│                       ├── enable/+server.ts  # POST enable
│                       ├── disable/+server.ts # POST disable
│                       └── set-default/+server.ts # POST set-default
```

**Structure Decision**: Follows the established SvelteKit BFF pattern with server-side API client, client-side API, BFF proxy endpoints, Zod schemas, and co-located tests. Reuses existing governance patterns (entitlements, certifications, approval workflows).

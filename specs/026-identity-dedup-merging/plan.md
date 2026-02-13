# Implementation Plan: Identity Deduplication & Merging

**Branch**: `026-identity-dedup-merging` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/026-identity-dedup-merging/spec.md`

## Summary

Admin UI for detecting duplicate user identities, previewing merge operations with field-level attribute selection, executing merges with SoD violation handling, batch merge operations, and an immutable audit trail. The backend provides comprehensive endpoints at `/governance/duplicates/*` and `/governance/merges/*` with full CRUD, batch operations, and audit logging.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (TDD), Chrome DevTools MCP (E2E)
**Target Platform**: Web browser (SvelteKit SSR + CSR)
**Project Type**: Web application (SvelteKit frontend with BFF pattern)
**Performance Goals**: Duplicate list loads in <2s, merge preview renders in <3s
**Constraints**: Standard BFF pattern, HttpOnly cookies, server-side API calls only
**Scale/Scope**: Up to 10,000 duplicate candidates, pagination at 50 items/page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server (+page.server.ts, /api/ proxies). No tokens in client code. |
| II. Test-Driven Development | PASS | Tests for schemas, API clients, components, and page servers. E2E via Chrome DevTools MCP. |
| III. Honest Reviews | PASS | Post-implementation review with npm run check, vitest run, and E2E verification. |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $props. No legacy patterns. |
| V. Minimal Complexity | PASS | One function per endpoint, flat component structure, no premature abstractions. |
| VI. Type Safety | PASS | Types in types.ts mirror backend DTOs. Zod schemas match types. No `any`. |
| VII. English Only | PASS | All code and UI in English. |
| VIII. Backend Fidelity | PASS | All endpoints verified to exist in xavyo-idp backend (F062 identity merge module). |

## Project Structure

### Documentation (this feature)

```text
specs/026-identity-dedup-merging/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── duplicates-api.md
│   └── merges-api.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # Add dedup/merge types
│   │   ├── dedup.ts                    # Server-side API client (duplicates + merges)
│   │   ├── dedup.test.ts               # API client tests
│   │   ├── dedup-client.ts             # Client-side API (BFF proxy calls)
│   ├── schemas/
│   │   ├── dedup.ts                    # Zod schemas
│   │   └── dedup.test.ts               # Schema tests
│   └── components/
│       └── dedup/
│           ├── attribute-comparison.svelte      # Side-by-side attribute view
│           ├── attribute-comparison.test.ts
│           ├── confidence-badge.svelte          # Color-coded confidence score
│           ├── confidence-badge.test.ts
│           ├── merge-preview.svelte             # Merge preview with selections
│           ├── merge-preview.test.ts
│           ├── entitlement-preview.svelte       # Entitlement strategy preview
│           ├── entitlement-preview.test.ts
│           ├── sod-violations.svelte            # SoD violation display
│           └── sod-violations.test.ts
├── routes/
│   ├── api/governance/
│   │   ├── duplicates/
│   │   │   ├── +server.ts              # GET list, POST detect
│   │   │   └── [id]/
│   │   │       ├── +server.ts          # GET detail
│   │   │       └── dismiss/+server.ts  # POST dismiss
│   │   └── merges/
│   │       ├── +server.ts              # GET list
│   │       ├── preview/+server.ts      # POST preview
│   │       ├── execute/+server.ts      # POST execute
│   │       ├── [id]/+server.ts         # GET detail
│   │       ├── batch/
│   │       │   ├── +server.ts          # POST batch execute
│   │       │   ├── preview/+server.ts  # POST batch preview
│   │       │   └── [jobId]/+server.ts  # GET batch job
│   │       └── audit/
│   │           ├── +server.ts          # GET list
│   │           └── [id]/+server.ts     # GET detail
│   └── (app)/governance/dedup/
│       ├── +page.server.ts             # Hub page (duplicates list + detect)
│       ├── +page.svelte                # Hub with tabs: Duplicates, Batch, Audit
│       ├── dedup.test.ts               # Hub page tests
│       ├── [id]/
│       │   ├── +page.server.ts         # Duplicate detail (comparison + dismiss)
│       │   ├── +page.svelte            # Detail with merge/dismiss actions
│       │   └── dedup-detail.test.ts
│       ├── [id]/merge/
│       │   ├── +page.server.ts         # Merge preview + execute
│       │   ├── +page.svelte            # Preview UI with attribute selection
│       │   └── merge.test.ts
│       ├── batch/
│       │   ├── +page.server.ts         # Batch merge config + execute
│       │   ├── +page.svelte            # Batch merge form + results
│       │   └── batch.test.ts
│       └── audit/
│           ├── [id]/
│           │   ├── +page.server.ts     # Audit detail
│           │   ├── +page.svelte        # Full audit view with snapshots
│           │   └── audit-detail.test.ts
```

**Structure Decision**: Follows established project conventions — governance sub-route under `(app)/governance/dedup/`, BFF proxies under `routes/api/governance/`, reusable components under `lib/components/dedup/`.

## Complexity Tracking

No constitution violations. No complexity justifications needed.

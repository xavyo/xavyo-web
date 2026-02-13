# Implementation Plan: Role Mining Analytics & Recommendations

**Branch**: `033-role-mining` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/033-role-mining/spec.md`

## Summary

Implement a comprehensive Role Mining hub under Governance that enables admins to run mining jobs analyzing user access patterns, review and promote/dismiss discovered role candidates, analyze access patterns and excessive privileges, review consolidation suggestions, create and execute simulations, and track per-role metrics. The backend provides 26 endpoints across 7 functional groups, all scoped under `/governance/role-mining/`.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit SSR + CSR)
**Project Type**: Web application (SvelteKit)
**Performance Goals**: Tab loads < 3s, list pagination smooth
**Constraints**: Admin-only access, job-scoped results for patterns/privileges/consolidation
**Scale/Scope**: 26 BFF proxy endpoints, 6-tab hub, ~8 components, ~5 page routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server, tokens in HttpOnly cookies |
| II. TDD | PASS | Tests for all schemas, API clients, components, pages |
| III. Honest Reviews | PASS | Post-implementation review + E2E via Chrome MCP |
| IV. Svelte 5 Runes | PASS | All components use $state, $derived, $props |
| V. Minimal Complexity | PASS | One function per endpoint, flat structure |
| VI. Type Safety | PASS | Types mirror Rust DTOs, Zod schemas match |
| VII. English Only | PASS | All UI in English |
| VIII. Backend Fidelity | PASS | All 26 endpoints verified in backend source |

## Project Structure

### Documentation (this feature)

```text
specs/033-role-mining/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (7 files)
│   ├── jobs.md
│   ├── candidates.md
│   ├── patterns.md
│   ├── excessive-privileges.md
│   ├── consolidation.md
│   ├── simulations.md
│   └── metrics.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/lib/api/
├── types.ts                    # Add role mining types (MiningJob, RoleCandidate, etc.)
├── role-mining.ts              # Server-side API client (26 functions)
├── role-mining.test.ts         # Server API tests
├── role-mining-client.ts       # Client-side API (for tab data loading)
└── role-mining-client.test.ts  # Client API tests

src/lib/schemas/
├── role-mining.ts              # Zod schemas (create job, promote, dismiss, review, simulate)
└── role-mining.test.ts         # Schema tests

src/lib/components/role-mining/
├── job-status-badge.svelte         # Status badge (pending/running/completed/failed/cancelled)
├── job-status-badge.test.ts
├── candidate-card.svelte           # Candidate display with confidence bar
├── candidate-card.test.ts
├── privilege-flag-card.svelte      # Excessive privilege flag with review actions
├── privilege-flag-card.test.ts
├── consolidation-card.svelte       # Consolidation suggestion display
├── consolidation-card.test.ts
├── simulation-status-badge.svelte  # Simulation status (draft/executed/applied/cancelled)
├── simulation-status-badge.test.ts
├── metrics-card.svelte             # Role metrics with utilization bar + trend
├── metrics-card.test.ts
├── pattern-card.svelte             # Access pattern display
├── pattern-card.test.ts
└── job-selector.svelte             # Dropdown to select a completed job
    job-selector.test.ts

src/routes/api/governance/role-mining/
├── jobs/+server.ts                                           # GET list, POST create
├── jobs/[jobId]/+server.ts                                   # GET detail, DELETE cancel
├── jobs/[jobId]/run/+server.ts                               # POST run
├── jobs/[jobId]/candidates/+server.ts                        # GET list candidates
├── jobs/[jobId]/patterns/+server.ts                          # GET list patterns
├── jobs/[jobId]/excessive-privileges/+server.ts              # GET list privileges
├── jobs/[jobId]/consolidation-suggestions/+server.ts         # GET list suggestions
├── candidates/[candidateId]/+server.ts                       # GET candidate detail
├── candidates/[candidateId]/promote/+server.ts               # POST promote
├── candidates/[candidateId]/dismiss/+server.ts               # POST dismiss
├── patterns/[patternId]/+server.ts                           # GET pattern detail
├── excessive-privileges/[flagId]/+server.ts                  # GET privilege detail
├── excessive-privileges/[flagId]/review/+server.ts           # POST review
├── consolidation-suggestions/[suggestionId]/+server.ts       # GET suggestion detail
├── consolidation-suggestions/[suggestionId]/dismiss/+server.ts # POST dismiss
├── simulations/+server.ts                                    # GET list, POST create
├── simulations/[simulationId]/+server.ts                     # GET detail, DELETE cancel
├── simulations/[simulationId]/execute/+server.ts             # POST execute
├── simulations/[simulationId]/apply/+server.ts               # POST apply
├── metrics/+server.ts                                        # GET list
├── metrics/calculate/+server.ts                              # POST calculate
└── metrics/[roleId]/+server.ts                               # GET role metrics

src/routes/(app)/governance/role-mining/
├── +page.server.ts             # Hub server load (jobs list + metrics summary)
├── +page.svelte                # Hub with 6 tabs
├── role-mining.test.ts         # Hub page tests
├── create/
│   ├── +page.server.ts         # Create job form + action
│   ├── +page.svelte            # Create job page
│   └── role-mining-create.test.ts
├── jobs/[id]/
│   ├── +page.server.ts         # Job detail load (job + candidates)
│   ├── +page.svelte            # Job detail with candidates list
│   └── job-detail.test.ts
└── simulations/[id]/
    ├── +page.server.ts         # Simulation detail load
    ├── +page.svelte            # Simulation detail with impact view
    └── simulation-detail.test.ts
```

**Structure Decision**: Follows established SvelteKit BFF pattern. Hub with 6 tabs at `/governance/role-mining/`. Job-scoped results (patterns, privileges, consolidation) loaded client-side with job selector. Simulations and metrics are independent. Create page for jobs. Detail pages for jobs (with candidates) and simulations.

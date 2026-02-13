# Implementation Plan: Audit & Compliance

**Branch**: `010-audit-compliance` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-audit-compliance/spec.md`

## Summary

Add audit visibility and compliance features: security alerts with filters and acknowledgment, personal login history with date range and success filters, admin audit dashboard with tenant-wide login attempts and aggregated statistics, and per-user activity timeline on user detail pages. All data comes from xavyo-idp REST API via BFF proxy endpoints. Cursor-based pagination for all list views.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, lucide-svelte, Superforms + Zod (via `zod/v3`)
**Storage**: N/A (backend handles persistence via xavyo-idp API on localhost:8080)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (SvelteKit monolith — frontend + BFF in one)
**Performance Goals**: List views load in <2s, filters update in <1s, pagination in <1s
**Constraints**: BFF pattern — no direct browser-to-API calls; HttpOnly cookies for auth
**Scale/Scope**: 4 new views, ~8 new components, 5 BFF proxy endpoints, 2 API client modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server-side proxy endpoints |
| II. TDD | PASS | Tests will be written for all components, API clients, and schemas |
| III. Honest Reviews | PASS | Will run `npm run check` + `npm run test:unit` + Chrome MCP E2E |
| IV. Svelte 5 Runes | PASS | All state uses $state, $derived, $effect, $props |
| V. Minimal Complexity | PASS | Reusing existing DataTable, EmptyState, Tabs, skeleton loading. CSS bar chart instead of external charting library |
| VI. Type Safety | PASS | TypeScript strict mode, API types mirror Rust DTOs, Zod schemas |
| VII. English Only | PASS | All UI text in English |

## Project Structure

### Documentation (this feature)

```text
specs/010-audit-compliance/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── login-history.md
│   ├── admin-audit.md
│   └── security-alerts.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── audit.ts                    # Login history + admin audit API client
│   │   ├── audit.test.ts               # API client tests
│   │   ├── alerts.ts                   # Security alerts API client
│   │   ├── alerts.test.ts              # API client tests
│   │   └── types.ts                    # Extended with audit/alert types
│   ├── schemas/
│   │   ├── audit.ts                    # Zod schemas for filters
│   │   └── audit.test.ts              # Schema validation tests
│   └── components/
│       └── audit/
│           ├── login-attempt-list.svelte        # Reusable login attempt list
│           ├── login-attempt-list.test.ts
│           ├── alert-list.svelte                # Security alert list with filters
│           ├── alert-list.test.ts
│           ├── alert-card.svelte                # Individual alert display
│           ├── alert-card.test.ts
│           ├── stats-panel.svelte               # Admin statistics panel
│           ├── stats-panel.test.ts
│           ├── hourly-chart.svelte              # CSS bar chart for hourly distribution
│           ├── hourly-chart.test.ts
│           ├── date-range-filter.svelte         # Date range filter with native inputs
│           ├── date-range-filter.test.ts
│           ├── activity-timeline.svelte         # Per-user activity timeline
│           └── activity-timeline.test.ts
├── routes/
│   ├── (app)/
│   │   ├── audit/
│   │   │   ├── +page.server.ts         # Admin audit dashboard load
│   │   │   └── +page.svelte            # Admin audit dashboard page
│   │   ├── settings/
│   │   │   ├── alerts-tab.svelte       # Security alerts tab (added to settings)
│   │   │   └── login-history-tab.svelte # Personal login history tab
│   │   └── users/
│   │       └── [id]/
│   │           └── +page.svelte        # Extended with activity timeline
│   └── api/
│       ├── audit/
│       │   ├── login-history/+server.ts     # BFF: user login history
│       │   ├── admin/
│       │   │   ├── login-attempts/+server.ts # BFF: admin login attempts
│       │   │   └── stats/+server.ts          # BFF: admin login stats
│       └── alerts/
│           ├── +server.ts                    # BFF: list security alerts
│           └── [id]/
│               └── acknowledge/+server.ts    # BFF: acknowledge alert
```

**Structure Decision**: Follows the established SvelteKit monolith pattern. Audit components go in `src/lib/components/audit/` as a cohesive module. API clients split by domain (audit for login history, alerts for security alerts). BFF proxy endpoints under `src/routes/api/audit/` and `src/routes/api/alerts/`.

## Complexity Tracking

No constitution violations. No complexity justifications needed.

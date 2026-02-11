# Implementation Plan: Governance Reporting & Analytics

**Branch**: `015-governance-reporting` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/015-governance-reporting/spec.md`

## Summary

Add a Governance Reports page with 3 tabs (Templates, Generated Reports, Schedules) covering the full backend reporting API. Includes server-side API client, client-side fetch helpers, BFF proxy endpoints, Zod schemas, and reusable components. Admin-only access. ~20 new endpoints, ~6 new components, ~100+ new tests.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (SvelteKit frontend + Rust/Axum backend)
**Performance Goals**: Standard web app (pages load < 2s, actions complete < 3s)
**Constraints**: Admin-only access, BFF pattern (no direct backend calls from browser)
**Scale/Scope**: ~20 BFF proxy endpoints, 6 components, 3 page routes, 2 API modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server via BFF proxy endpoints |
| II. Test-Driven Development | PASS | Tests planned for all modules (API, schemas, components, pages) |
| III. Honest Reviews | PASS | Review + E2E verification planned as final step |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $props |
| V. Minimal Complexity | PASS | Following established governance patterns, no new abstractions |
| VI. Type Safety | PASS | Full TypeScript types mirroring backend DTOs, Zod schemas |
| VII. English Only | PASS | All UI text in English |
| VIII. Backend Fidelity | PASS | All endpoints verified to exist in xavyo governance backend |

## Project Structure

### Documentation (this feature)

```text
specs/015-governance-reporting/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
│   ├── templates.md
│   ├── reports.md
│   └── schedules.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # Add reporting types
│   │   ├── governance-reporting.ts           # Server-side API client (NEW)
│   │   ├── governance-reporting.test.ts      # API client tests (NEW)
│   │   ├── governance-reporting-client.ts    # Client-side API (NEW)
│   │   └── governance-reporting-client.test.ts # Client API tests (NEW)
│   ├── schemas/
│   │   ├── governance-reporting.ts           # Zod schemas (NEW)
│   │   └── governance-reporting.test.ts      # Schema tests (NEW)
│   └── components/
│       └── governance/
│           ├── report-templates-tab.svelte       # Templates tab (NEW)
│           ├── report-templates-tab.test.ts
│           ├── generated-reports-tab.svelte      # Reports tab (NEW)
│           ├── generated-reports-tab.test.ts
│           ├── report-schedules-tab.svelte       # Schedules tab (NEW)
│           ├── report-schedules-tab.test.ts
│           ├── report-data-viewer.svelte         # Report data display (NEW)
│           ├── report-data-viewer.test.ts
│           ├── template-definition-editor.svelte # JSON definition editor (NEW)
│           └── template-definition-editor.test.ts
├── routes/
│   ├── (app)/
│   │   └── governance/
│   │       └── reports/
│   │           ├── +page.server.ts           # Hub page server load (NEW)
│   │           ├── +page.svelte              # Hub page with 3 tabs (NEW)
│   │           ├── governance-reports.test.ts
│   │           ├── templates/
│   │           │   ├── create/
│   │           │   │   ├── +page.server.ts   # Create template form (NEW)
│   │           │   │   └── +page.svelte
│   │           │   └── [id]/
│   │           │       ├── +page.server.ts   # Template detail/edit (NEW)
│   │           │       └── +page.svelte
│   │           ├── generate/
│   │           │   ├── +page.server.ts       # Generate report form (NEW)
│   │           │   └── +page.svelte
│   │           └── schedules/
│   │               ├── create/
│   │               │   ├── +page.server.ts   # Create schedule form (NEW)
│   │               │   └── +page.svelte
│   │               └── [id]/
│   │                   ├── +page.server.ts   # Schedule detail/edit (NEW)
│   │                   └── +page.svelte
│   └── api/
│       └── governance/
│           └── reports/
│               ├── +server.ts                # GET list, POST generate (NEW)
│               ├── cleanup/+server.ts        # POST cleanup (NEW)
│               ├── [id]/
│               │   ├── +server.ts            # GET, DELETE report (NEW)
│               │   └── data/+server.ts       # GET report data (NEW)
│               ├── templates/
│               │   ├── +server.ts            # GET list, POST create (NEW)
│               │   └── [id]/
│               │       ├── +server.ts        # GET, PUT, DELETE template (NEW)
│               │       └── clone/+server.ts  # POST clone (NEW)
│               └── schedules/
│                   ├── +server.ts            # GET list, POST create (NEW)
│                   └── [id]/
│                       ├── +server.ts        # GET, PUT, DELETE schedule (NEW)
│                       ├── pause/+server.ts  # POST pause (NEW)
│                       └── resume/+server.ts # POST resume (NEW)
```

**Structure Decision**: Follow existing governance patterns. Reports hub page lives under `governance/reports/` with sub-routes for CRUD. BFF proxies under `api/governance/reports/`. Components in `src/lib/components/governance/` (new directory for governance-specific reusable components). API clients follow the established `governance.ts` / `governance-client.ts` pattern.

## Complexity Tracking

No constitution violations — no complexity tracking needed.

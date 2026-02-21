# Implementation Plan: Provisioning Scripts & Hook Bindings

**Branch**: `036-provisioning-scripts` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/036-provisioning-scripts/spec.md`

## Summary

Implement a complete frontend for provisioning script management with version control, hook bindings to connectors, script templates, testing/validation, and execution analytics. Covers 32 backend API endpoints across 5 sub-features using the established SvelteKit BFF pattern.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (SvelteKit SSR + SPA)
**Project Type**: Web application (frontend only — backend already implemented)
**Performance Goals**: All pages load within 3 seconds, CRUD operations provide instant feedback
**Constraints**: Must follow BFF pattern (no direct API calls from browser), admin-only access control
**Scale/Scope**: 32 API endpoints, ~25 new route files, ~10 BFF proxies, ~8 components, ~350 tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server, JWT in HttpOnly cookies |
| II. Test-Driven Development | PASS | Unit tests for all modules, E2E for critical flows |
| III. Honest Reviews | PASS | Post-implementation review with `npm run check` + `npm run test:unit` |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$props` |
| V. Minimal Complexity | PASS | One function per endpoint, flat structures |
| VI. Type Safety | PASS | Types mirror backend DTOs, Zod schemas match |
| VII. English Only | PASS | All code and UI text in English |
| VIII. Backend Fidelity | PASS | All 32 endpoints verified to exist in xavyo-idp |

## Project Structure

### Documentation (this feature)

```text
specs/036-provisioning-scripts/
├── spec.md
├── plan.md              # This file
├── data-model.md        # Entity definitions
├── contracts/           # API endpoint contracts
├── checklists/
│   └── requirements.md
└── tasks.md             # Task breakdown
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                        # Add provisioning script types
│   │   ├── provisioning-scripts.ts         # Server-side API client (scripts + versions + bindings + templates)
│   │   ├── provisioning-scripts-client.ts  # Client-side API (BFF proxy calls)
│   │   ├── script-analytics.ts             # Server-side analytics + logs + audit API
│   │   └── script-analytics-client.ts      # Client-side analytics API
│   ├── schemas/
│   │   └── provisioning-scripts.ts         # Zod schemas for all forms
│   └── components/
│       └── provisioning-scripts/
│           ├── script-status-badge.svelte       # Status badge (draft/active/inactive)
│           ├── version-diff.svelte              # Side-by-side diff view
│           ├── version-history.svelte           # Version list with rollback
│           ├── binding-form.svelte              # Binding create/edit form (dialog)
│           ├── bindings-table.svelte            # Bindings list table
│           ├── validation-result.svelte         # Validation error display
│           ├── dry-run-panel.svelte             # Dry-run form + results
│           ├── analytics-dashboard.svelte       # Analytics summary cards
│           ├── execution-log-table.svelte       # Execution log list
│           └── template-category-badge.svelte   # Template category badge
├── routes/
│   ├── api/
│   │   └── provisioning-scripts/
│   │       ├── +server.ts                              # GET list, POST create
│   │       ├── [id]/
│   │       │   ├── +server.ts                          # GET detail, PUT update, DELETE
│   │       │   ├── activate/+server.ts                 # POST activate
│   │       │   ├── deactivate/+server.ts               # POST deactivate
│   │       │   ├── versions/
│   │       │   │   ├── +server.ts                      # GET versions, POST create version
│   │       │   │   ├── [versionNumber]/
│   │       │   │   │   ├── +server.ts                  # GET specific version
│   │       │   │   │   └── dry-run/+server.ts          # POST dry-run version
│   │       │   │   └── compare/+server.ts              # GET compare
│   │       │   └── rollback/+server.ts                 # POST rollback
│   │       ├── bindings/
│   │       │   ├── +server.ts                          # GET list, POST create
│   │       │   └── [bindingId]/+server.ts              # GET detail, PUT update, DELETE
│   │       ├── connectors/
│   │       │   └── [connectorId]/bindings/+server.ts   # GET bindings by connector
│   │       ├── templates/
│   │       │   ├── +server.ts                          # GET list, POST create
│   │       │   ├── [templateId]/
│   │       │   │   ├── +server.ts                      # GET detail, PUT update, DELETE
│   │       │   │   └── instantiate/+server.ts          # POST instantiate
│   │       ├── validate/+server.ts                     # POST validate
│   │       ├── dry-run/+server.ts                      # POST dry-run
│   │       ├── analytics/
│   │       │   ├── dashboard/+server.ts                # GET dashboard
│   │       │   └── scripts/[scriptId]/+server.ts       # GET per-script analytics
│   │       ├── execution-logs/
│   │       │   ├── +server.ts                          # GET list
│   │       │   └── [logId]/+server.ts                  # GET detail
│   │       └── audit-events/+server.ts                 # GET audit events
│   └── (app)/
│       └── governance/
│           └── provisioning-scripts/
│               ├── +page.server.ts                     # Hub: load scripts + templates + analytics
│               ├── +page.svelte                        # Hub: 3-tab layout (Scripts, Templates, Analytics)
│               ├── create/
│               │   ├── +page.server.ts                 # Create script form + action
│               │   └── +page.svelte                    # Create script page
│               ├── [id]/
│               │   ├── +page.server.ts                 # Detail: load script + versions + bindings
│               │   ├── +page.svelte                    # Detail: 4-tab (Details, Versions, Bindings, Logs)
│               │   └── edit/
│               │       ├── +page.server.ts             # Edit script metadata
│               │       └── +page.svelte                # Edit script page
│               └── templates/
│                   ├── create/
│                   │   ├── +page.server.ts             # Create template form + action
│                   │   └── +page.svelte                # Create template page
│                   └── [id]/
│                       ├── +page.server.ts             # Template detail + edit + actions
│                       └── +page.svelte                # Template detail page
```

**Structure Decision**: Frontend-only SvelteKit application following the established BFF pattern from 35 previous phases. All new files organized under existing `src/lib/api/`, `src/lib/schemas/`, `src/lib/components/`, `src/routes/api/`, and `src/routes/(app)/governance/`.

## Key Design Decisions

### 1. Hub Page with 3 Tabs
The provisioning scripts hub uses an ARIA tab layout (same as SIEM, NHI Governance, etc.) with:
- **Scripts** tab: Filterable list of scripts with status badges and search
- **Templates** tab: Filterable list of templates by category with search
- **Analytics** tab: Dashboard summary cards + per-script analytics table

### 2. Script Detail Page with 4 Tabs
Each script has a detail page with:
- **Details** tab: Metadata, current version body, lifecycle actions (activate/deactivate/delete), validate + dry-run
- **Versions** tab: Version history list, create new version, compare diff, rollback
- **Bindings** tab: List of bindings for this script, create/edit/delete bindings via dialog
- **Logs** tab: Execution logs filtered to this script

### 3. Version Diff Component
A dedicated `version-diff.svelte` component renders the comparison output from the backend. Uses a simple text-based diff display with color-coded additions (green) and deletions (red).

### 4. Binding Management via Dialog
Bindings are managed from the script detail page's Bindings tab using a dialog form (not a separate route). This keeps the workflow contextual — the admin stays on the script detail page.

### 5. API Client Split
- `provisioning-scripts.ts`: Server-side client for scripts, versions, bindings, templates (CRUD + lifecycle)
- `script-analytics.ts`: Server-side client for analytics dashboard, per-script analytics, execution logs, audit events
- Corresponding `-client.ts` files for client-side BFF proxy calls

### 6. Sidebar Navigation
Add "Provisioning Scripts" entry under the Governance section in the app layout sidebar, admin-only, linking to `/governance/provisioning-scripts`.

## Complexity Tracking

No constitution violations. All design decisions follow established patterns from previous phases.

# Implementation Plan: Connector Management

**Branch**: `020-connector-management` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/020-connector-management/spec.md`

## Summary

Implement complete UI for managing identity connectors (LDAP, Database, REST API) with full CRUD, connectivity testing, health monitoring, and lifecycle management. The feature follows the established BFF pattern: browser communicates with SvelteKit server-side routes, which proxy requests to the xavyo-idp backend at `/admin/connectors`. Admin-only access via `hasAdminRole()` guard.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (SvelteKit frontend with BFF proxy to Rust backend)
**Performance Goals**: List page loads within 2 seconds, connection test results within 30 seconds
**Constraints**: Admin-only access, HttpOnly cookies for auth, no secrets in client code
**Scale/Scope**: 7 user stories, ~35 new files, ~100+ new tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server routes; tokens in HttpOnly cookies |
| II. Test-Driven Development | PASS | Tests included per task; TDD cycle enforced |
| III. Honest Reviews | PASS | npm run check + vitest run + E2E after implementation |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $props, $effect |
| V. Minimal Complexity | PASS | One function per endpoint, flat file structure, no premature abstractions |
| VI. Type Safety | PASS | Types in types.ts mirror backend DTOs, Zod schemas match types |
| VII. English Only | PASS | All code and UI in English |
| VIII. Backend Fidelity | PASS | Backend endpoints exist at /admin/connectors; verify during E2E |

All gates pass. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/020-connector-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── connectors-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # Add Connector types (modify)
│   │   ├── connectors.ts              # Server-side API client (new)
│   │   ├── connectors-client.ts       # Client-side API client (new)
│   │   ├── connectors.test.ts         # Server API client tests (new)
│   │   └── connectors-client.test.ts  # Client API client tests (new)
│   └── schemas/
│       ├── connectors.ts              # Zod schemas (new)
│       └── connectors.test.ts         # Schema tests (new)
├── routes/
│   ├── api/
│   │   └── connectors/
│   │       ├── +server.ts                     # GET list, POST create
│   │       └── [id]/
│   │           ├── +server.ts                 # GET detail, PUT update, DELETE
│   │           ├── test/+server.ts            # POST test connection
│   │           ├── activate/+server.ts        # POST activate
│   │           ├── deactivate/+server.ts      # POST deactivate
│   │           └── health/+server.ts          # GET health
│   └── (app)/
│       ├── +layout.svelte                     # Add Connectors nav item (modify)
│       └── connectors/
│           ├── +page.server.ts                # List page server load + actions
│           ├── +page.svelte                   # List page
│           ├── connectors.test.ts             # List page tests
│           ├── create/
│           │   ├── +page.server.ts            # Create page server
│           │   ├── +page.svelte               # Create page with dynamic config
│           │   └── connectors-create.test.ts  # Create page tests
│           └── [id]/
│               ├── +page.server.ts            # Detail page server + actions
│               ├── +page.svelte               # Detail page with tabs
│               ├── connectors-detail.test.ts  # Detail page tests
│               ├── edit/
│               │   ├── +page.server.ts        # Edit page server
│               │   ├── +page.svelte           # Edit page with dynamic config
│               │   └── connectors-edit.test.ts # Edit page tests
```

**Structure Decision**: Follows the established SvelteKit route-based structure used across all existing features (users, personas, NHI, governance). BFF proxy endpoints in `src/routes/api/connectors/`, app pages in `src/routes/(app)/connectors/`.

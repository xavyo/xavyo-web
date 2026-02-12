# Implementation Plan: Bulk User Import & SCIM Administration

**Branch**: `025-bulk-import-scim` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/025-bulk-import-scim/spec.md`

## Summary

Add admin UI for bulk CSV user import (upload, job monitoring, error drill-down, invitation resend) and SCIM administration (token CRUD with one-time secret display, attribute mapping editor). Also implement a public invitation acceptance page where imported users set their password and activate their account. All backend endpoints exist in xavyo-idp; this is purely frontend work following the established BFF pattern.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (browser)
**Project Type**: Web application (SvelteKit frontend for existing Rust/Axum backend)
**Performance Goals**: Page loads < 1s, CSV upload starts async job immediately
**Constraints**: Max 10MB CSV / 10K rows, one concurrent import per tenant, multipart/form-data upload
**Scale/Scope**: ~20 new files, ~15 BFF proxy endpoints, ~5 new pages, ~100+ tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server; tokens in HttpOnly cookies; client-side proxies validate session |
| II. Test-Driven Development | PASS | Unit tests for all components/schemas/APIs; E2E via Chrome DevTools MCP |
| III. Honest Reviews | PASS | Will run `npm run check` + `npm run test:unit` + E2E after implementation |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$props` runes |
| V. Minimal Complexity | PASS | One function per endpoint, no premature abstractions |
| VI. Type Safety | PASS | TypeScript strict, API types mirror Rust DTOs, Zod schemas match types |
| VII. English Only | PASS | All code and UI text in English |
| VIII. Backend Fidelity | PASS | All endpoints verified to exist in xavyo-idp; exact struct shapes documented |

## Project Structure

### Documentation (this feature)

```text
specs/025-bulk-import-scim/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── import-api.md
│   └── scim-api.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                          # Add import/SCIM types
│   │   ├── imports.ts                        # Server-side import API client
│   │   ├── imports-client.ts                 # Client-side import API
│   │   ├── scim.ts                           # Server-side SCIM API client
│   │   └── scim-client.ts                    # Client-side SCIM API
│   └── schemas/
│       ├── imports.ts                        # Import Zod schemas
│       └── scim.ts                           # SCIM Zod schemas
├── routes/
│   ├── (auth)/
│   │   └── invite/
│   │       └── [token]/                      # Public invitation acceptance
│   │           ├── +page.server.ts
│   │           └── +page.svelte
│   ├── (app)/
│   │   └── settings/
│   │       ├── imports/                      # Import job management
│   │       │   ├── +page.server.ts           # List + upload action
│   │       │   ├── +page.svelte              # List + upload form
│   │       │   └── [id]/                     # Job detail
│   │       │       ├── +page.server.ts
│   │       │       └── +page.svelte
│   │       └── scim/                         # SCIM admin
│   │           ├── +page.server.ts           # Tokens + mappings load
│   │           └── +page.svelte              # Two-tab layout
│   └── api/
│       └── admin/
│           ├── imports/                      # BFF proxies for imports
│           │   ├── +server.ts                # GET list, POST upload
│           │   └── [id]/
│           │       ├── +server.ts            # GET detail
│           │       ├── errors/
│           │       │   ├── +server.ts        # GET errors list
│           │       │   └── download/
│           │       │       └── +server.ts    # GET error CSV download
│           │       └── resend-invitations/
│           │           └── +server.ts        # POST resend
│           └── scim/
│               ├── tokens/
│               │   ├── +server.ts            # GET list, POST create
│               │   └── [id]/
│               │       └── +server.ts        # DELETE revoke
│               └── mappings/
│                   └── +server.ts            # GET list, PUT upsert
```

**Structure Decision**: Follows existing SvelteKit patterns — pages under `(app)/settings/` for admin features, `(auth)/invite/` for public pages, BFF proxies under `api/admin/`.

## Complexity Tracking

No constitution violations — no tracking needed.

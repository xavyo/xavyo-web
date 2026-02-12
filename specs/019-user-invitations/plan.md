# Implementation Plan: User Invitations

**Branch**: `019-user-invitations` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/019-user-invitations/spec.md`

## Summary

Implement a complete invitation management UI allowing tenant admins to invite users by email, view invitation status, resend pending invitations, and cancel unwanted ones. Follows the established BFF pattern with server-side API client, client-side proxy, Zod schemas, and SvelteKit pages with Superforms.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (backend handles persistence via xavyo-idp API on localhost:8080)
**Testing**: Vitest + @testing-library/svelte (co-located test files)
**Target Platform**: Web browser (SvelteKit SSR)
**Project Type**: Web application (SvelteKit frontend → xavyo-idp backend)
**Performance Goals**: Page load < 2s, action feedback < 1s
**Constraints**: Admin-only access, follows BFF security pattern
**Scale/Scope**: 4 backend endpoints, ~10 new files, ~15 tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server; tokens in HttpOnly cookies |
| II. Test-Driven Development | PASS | Tests planned for schemas, API clients, and pages |
| III. Honest Reviews | PASS | Will run `npm run check` + `npx vitest run` + E2E Chrome MCP |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$props` |
| V. Minimal Complexity | PASS | Simple CRUD — one function per endpoint, no abstractions |
| VI. Type Safety | PASS | Types mirror backend DTOs in types.ts, Zod schemas match |
| VII. English Only | PASS | All text in English |
| VIII. Backend Fidelity | PASS | All 4 endpoints verified as functional on localhost:8080 |

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/019-user-invitations/
├── spec.md
├── plan.md              # This file
├── research.md          # Phase 0 (minimal — no unknowns)
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
│   └── invitations-api.md
└── tasks.md             # Phase 2 (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # Add Invitation types (MODIFY)
│   │   ├── invitations.ts              # Server-side API client (NEW)
│   │   └── invitations-client.ts       # Client-side API (NEW)
│   └── schemas/
│       └── invitations.ts              # Zod validation schemas (NEW)
├── routes/
│   ├── api/
│   │   └── invitations/
│   │       ├── +server.ts              # BFF proxy: GET list, POST create (NEW)
│   │       └── [id]/
│   │           ├── resend/+server.ts   # BFF proxy: POST resend (NEW)
│   │           └── +server.ts          # BFF proxy: DELETE cancel (NEW)
│   └── (app)/
│       ├── +layout.svelte              # Add sidebar nav item (MODIFY)
│       └── invitations/
│           ├── +page.server.ts         # List page server load (NEW)
│           ├── +page.svelte            # List page with search/filter/actions (NEW)
│           └── create/
│               ├── +page.server.ts     # Create page server load + action (NEW)
│               └── +page.svelte        # Create invitation form (NEW)
```

**Structure Decision**: Follows the established single-directory SvelteKit pattern used across all 18 prior features. Invitations route at `(app)/invitations/` (top-level admin route, not nested under users, since invitations are a distinct admin workflow).

## Complexity Tracking

No violations — no complexity tracking needed.

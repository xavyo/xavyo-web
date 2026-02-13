# Implementation Plan: Power of Attorney & Identity Delegation

**Branch**: `030-power-of-attorney` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/030-power-of-attorney/spec.md`

## Summary

Implement a Power of Attorney (PoA) governance feature enabling users to temporarily delegate their identity to another user. Covers PoA grant/revoke lifecycle, identity assumption/drop mechanics with session token swap, admin oversight with force-revoke, audit trail, extension, and a global assumed-identity header indicator. The backend (xavyo-idp) already exposes 11 REST endpoints under `/governance/power-of-attorney` and `/governance/admin/power-of-attorney`.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (SvelteKit frontend + Rust backend)
**Performance Goals**: All list views < 2s, identity assume/drop < 5s, indicator visible within 1s of page load
**Constraints**: Max 90-day PoA duration, one identity assumption at a time, admin-only access for org-wide views
**Scale/Scope**: Standard tenant-scoped governance feature, pagination on all lists

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server routes; tokens in HttpOnly cookies; assume/drop returns new JWT stored server-side |
| II. TDD | PASS | Tests planned for all API clients, schemas, components, and pages |
| III. Honest Reviews | PASS | Will run `npm run check` + `npm run test:unit` + Chrome DevTools E2E |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$props`; no legacy patterns |
| V. Minimal Complexity | PASS | One function per endpoint, flat file structure, no premature abstractions |
| VI. Type Safety | PASS | Types mirror backend DTOs in types.ts; Zod schemas match; strict mode |
| VII. English Only | PASS | All UI text in English |
| VIII. Backend Fidelity | PASS | All 11 backend endpoints already implemented; will verify each before building frontend |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/030-power-of-attorney/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # Add PoA types (PoaGrant, PoaScope, PoaAuditEvent, etc.)
│   │   ├── power-of-attorney.ts        # Server-side API client (11 functions)
│   │   └── power-of-attorney-client.ts # Client-side API (for client-side fetches)
│   ├── schemas/
│   │   └── power-of-attorney.ts        # Zod schemas (grant, revoke, extend, etc.)
│   └── components/
│       └── poa/
│           ├── poa-status-badge.svelte          # Status badge (pending/active/expired/revoked)
│           ├── poa-scope-display.svelte          # Scope display (apps + workflow types)
│           ├── poa-audit-timeline.svelte          # Audit event timeline
│           └── assumed-identity-indicator.svelte  # Global header indicator
├── routes/
│   ├── api/governance/power-of-attorney/
│   │   ├── +server.ts                           # BFF: list (GET) + grant (POST)
│   │   ├── [id]/+server.ts                      # BFF: get single (GET)
│   │   ├── [id]/revoke/+server.ts               # BFF: revoke (POST)
│   │   ├── [id]/extend/+server.ts               # BFF: extend (POST)
│   │   ├── [id]/assume/+server.ts               # BFF: assume identity (POST)
│   │   ├── [id]/audit/+server.ts                # BFF: audit trail (GET)
│   │   ├── drop/+server.ts                      # BFF: drop assumption (POST)
│   │   ├── current-assumption/+server.ts        # BFF: get current assumption (GET)
│   │   └── admin/
│   │       ├── +server.ts                       # BFF: admin list (GET)
│   │       └── [id]/revoke/+server.ts           # BFF: admin revoke (POST)
│   └── (app)/governance/power-of-attorney/
│       ├── +page.server.ts                      # Hub: load user PoA + admin list
│       ├── +page.svelte                         # Hub: 2-tab (My PoA | Admin)
│       ├── grant/
│       │   ├── +page.server.ts                  # Grant form + action
│       │   └── +page.svelte                     # Grant form page
│       └── [id]/
│           ├── +page.server.ts                  # Detail: load PoA + audit
│           └── +page.svelte                     # Detail page with actions
```

**Structure Decision**: Follows existing governance feature patterns (entitlements, certifications, SoD). BFF proxies under `routes/api/`, server-side API client in `lib/api/`, Zod schemas in `lib/schemas/`, reusable components in `lib/components/poa/`. Hub page with tab layout matching governance hub pattern.

# Implementation Plan: Webhooks & Authorization Policy Management

**Branch**: `024-webhooks-authz-policies` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/024-webhooks-authz-policies/spec.md`

## Summary

Implement admin UI for two major capabilities: webhook subscription management (under Settings) and authorization policy management (under Governance). Webhooks enable event-driven integrations with external systems; authorization policies enable fine-grained access control. Both follow the established BFF pattern with server-side API calls, Superforms validation, and DataTable listings.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), TanStack Table (`@tanstack/svelte-table`), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF proxy)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web browser (SvelteKit server on Node.js)
**Project Type**: Web application (SvelteKit frontend + Rust/Axum backend)
**Performance Goals**: Standard web app — pages load in <1s, form submissions complete in <2s
**Constraints**: Admin-only pages (require admin/super_admin role), all API calls through BFF
**Scale/Scope**: ~30 new files (types, schemas, API clients, BFF proxies, pages, components, tests)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls go through SvelteKit server routes; no tokens in client code |
| II. TDD | PASS | Tests planned for schemas, API clients, components, and pages |
| III. Honest Reviews | PASS | Will run `npm run check` + `npm run test:unit` + Chrome MCP E2E |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$props` |
| V. Minimal Complexity | PASS | One function per endpoint, no unnecessary abstractions |
| VI. Type Safety | PASS | Types mirror backend DTOs, Zod schemas match types |
| VII. English Only | PASS | All strings in English |
| VIII. Backend Fidelity | PASS | Will verify backend endpoints exist before implementing frontend |

No violations. Gate passes.

## Project Structure

### Documentation (this feature)

```text
specs/024-webhooks-authz-policies/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── webhooks-api.md
│   └── authorization-api.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # Add webhook + authorization types
│   │   ├── webhooks.ts                 # Server-side webhook API client
│   │   ├── webhooks-client.ts          # Client-side webhook API
│   │   ├── authorization.ts            # Server-side authorization API client
│   │   └── authorization-client.ts     # Client-side authorization API
│   ├── schemas/
│   │   ├── webhooks.ts                 # Webhook Zod schemas
│   │   └── authorization.ts            # Authorization Zod schemas
│   └── components/
│       └── webhooks/
│           └── header-editor.svelte    # Key-value header editor component
├── routes/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── webhooks/               # BFF proxy for webhooks
│   │   │   │   ├── event-types/+server.ts
│   │   │   │   ├── subscriptions/+server.ts
│   │   │   │   ├── subscriptions/[id]/+server.ts
│   │   │   │   ├── subscriptions/[id]/pause/+server.ts
│   │   │   │   ├── subscriptions/[id]/resume/+server.ts
│   │   │   │   ├── subscriptions/[id]/deliveries/+server.ts
│   │   │   │   ├── subscriptions/[id]/deliveries/[deliveryId]/retry/+server.ts
│   │   │   │   ├── dlq/+server.ts
│   │   │   │   ├── dlq/[entryId]/retry/+server.ts
│   │   │   │   └── dlq/[entryId]/+server.ts
│   │   │   └── authorization/          # BFF proxy for authorization
│   │   │       ├── policies/+server.ts
│   │   │       ├── policies/[id]/+server.ts
│   │   │       ├── policies/[id]/enable/+server.ts
│   │   │       ├── policies/[id]/disable/+server.ts
│   │   │       ├── mappings/+server.ts
│   │   │       ├── mappings/[id]/+server.ts
│   │   │       └── check/+server.ts
│   │   └── ...
│   └── (app)/
│       ├── settings/
│       │   └── webhooks/               # Webhook subscription management
│       │       ├── +page.server.ts     # List subscriptions
│       │       ├── +page.svelte        # Subscription list page
│       │       ├── create/
│       │       │   ├── +page.server.ts
│       │       │   └── +page.svelte
│       │       └── [id]/
│       │           ├── +page.server.ts # Detail + edit + actions
│       │           ├── +page.svelte
│       │           └── edit/
│       │               ├── +page.server.ts
│       │               └── +page.svelte
│       └── governance/
│           └── authorization/          # Authorization policy management
│               ├── +page.server.ts     # Policy list
│               ├── +page.svelte        # Tab layout (Policies, Mappings, Test)
│               ├── create/
│               │   ├── +page.server.ts
│               │   └── +page.svelte
│               ├── [id]/
│               │   ├── +page.server.ts
│               │   ├── +page.svelte
│               │   └── edit/
│               │       ├── +page.server.ts
│               │       └── +page.svelte
│               ├── mappings/
│               │   ├── +page.server.ts
│               │   ├── +page.svelte
│               │   └── create/
│               │       ├── +page.server.ts
│               │       └── +page.svelte
│               └── test/
│                   ├── +page.server.ts
│                   └── +page.svelte
```

**Structure Decision**: Follows existing project patterns — webhook pages under `/settings/webhooks` (admin settings), authorization pages under `/governance/authorization` (governance section). BFF proxies mirror backend URL structure under `/api/admin/`.

## Complexity Tracking

No constitution violations. No complexity justifications needed.

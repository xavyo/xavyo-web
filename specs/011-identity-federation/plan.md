# Implementation Plan: Identity Federation

**Branch**: `011-identity-federation` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-identity-federation/spec.md`

## Summary

Add federation management to xavyo-web: OIDC IdP CRUD with validation and HRD domains, SAML SP CRUD with certificate management, Social login provider configuration with user account linking, and a Federation overview dashboard. All admin-only except social account linking (user self-service). Uses BFF proxy pattern, Superforms + Zod, existing tab/table/skeleton components.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), lucide-svelte
**Storage**: N/A (backend handles persistence via xavyo-idp API on localhost:8080)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (responsive, dark mode)
**Project Type**: Web (SvelteKit full-stack)
**Performance Goals**: Pages load within 3 seconds, form submissions within 2 seconds
**Constraints**: BFF pattern (no direct API calls from browser), HttpOnly cookies for auth
**Scale/Scope**: ~20 new files (components, pages, API clients, schemas, BFF endpoints), ~15 test files

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server endpoints; no JWT in client |
| II. TDD | PASS | Test files for all components, API clients, schemas |
| III. Honest Reviews | PASS | Will run `npm run check` + `npm run test:unit` + Chrome MCP E2E |
| IV. Svelte 5 Runes | PASS | All components use $props, $state, $derived |
| V. Minimal Complexity | PASS | Reusing existing patterns; no new abstractions |
| VI. Type Safety | PASS | Strict TS, types mirror backend DTOs, Zod validation |
| VII. English Only | PASS | All code and UI in English |
| VIII. Backend Fidelity | PASS | All endpoints verified to exist in xavyo-idp |

## Project Structure

### Documentation (this feature)

```text
specs/011-identity-federation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── oidc-federation.md
│   ├── saml.md
│   └── social.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                    # ADD federation types
│   │   ├── federation.ts               # NEW server-side OIDC + SAML API client
│   │   ├── federation-client.ts        # NEW browser-safe OIDC + SAML client
│   │   ├── social.ts                   # NEW server-side social API client
│   │   └── social-client.ts            # NEW browser-safe social client
│   ├── schemas/
│   │   └── federation.ts               # NEW Zod schemas for all federation forms
│   └── components/
│       └── federation/
│           ├── idp-form.svelte         # NEW OIDC IdP create/edit form
│           ├── idp-detail.svelte       # NEW OIDC IdP detail with validation + domains
│           ├── sp-form.svelte          # NEW SAML SP create/edit form
│           ├── certificate-form.svelte # NEW Certificate upload form
│           ├── certificate-list.svelte # NEW Certificate list with activate button
│           ├── social-provider-card.svelte   # NEW Social provider config card
│           ├── social-connections-list.svelte # NEW User social connections list
│           ├── domain-list.svelte      # NEW HRD domain list with add/remove
│           ├── validation-result.svelte # NEW IdP validation result display
│           └── federation-overview.svelte    # NEW Overview dashboard
├── routes/
│   ├── (app)/
│   │   ├── federation/
│   │   │   ├── +page.server.ts         # NEW admin guard + overview data
│   │   │   ├── +page.svelte            # NEW tab layout (Overview, OIDC, SAML, Social)
│   │   │   ├── oidc/
│   │   │   │   ├── create/
│   │   │   │   │   ├── +page.server.ts # NEW create IdP form action
│   │   │   │   │   └── +page.svelte    # NEW create IdP page
│   │   │   │   └── [id]/
│   │   │   │       ├── +page.server.ts # NEW detail/edit/delete/validate/toggle actions
│   │   │   │       └── +page.svelte    # NEW IdP detail page
│   │   │   └── saml/
│   │   │       ├── create/
│   │   │       │   ├── +page.server.ts # NEW create SP form action
│   │   │       │   └── +page.svelte    # NEW create SP page
│   │   │       └── [id]/
│   │   │           ├── +page.server.ts # NEW detail/edit/delete actions
│   │   │           └── +page.svelte    # NEW SP detail page
│   │   └── settings/
│   │       ├── +page.svelte            # MODIFY add Social Connections tab
│   │       └── social-connections-tab.svelte # NEW social connections tab component
│   └── api/
│       └── federation/
│           ├── identity-providers/
│           │   ├── +server.ts          # NEW GET/POST proxy
│           │   └── [id]/
│           │       ├── +server.ts      # NEW GET/PUT/DELETE proxy
│           │       ├── validate/
│           │       │   └── +server.ts  # NEW POST proxy
│           │       ├── toggle/
│           │       │   └── +server.ts  # NEW POST proxy
│           │       └── domains/
│           │           ├── +server.ts  # NEW GET/POST proxy
│           │           └── [domainId]/
│           │               └── +server.ts # NEW DELETE proxy
│           ├── saml/
│           │   ├── service-providers/
│           │   │   ├── +server.ts      # NEW GET/POST proxy
│           │   │   └── [id]/
│           │   │       └── +server.ts  # NEW GET/PUT/DELETE proxy
│           │   └── certificates/
│           │       ├── +server.ts      # NEW GET/POST proxy
│           │       └── [id]/
│           │           └── activate/
│           │               └── +server.ts # NEW POST proxy
│           └── social/
│               ├── providers/
│               │   ├── +server.ts      # NEW GET proxy
│               │   └── [provider]/
│               │       └── +server.ts  # NEW PUT/DELETE proxy
│               ├── connections/
│               │   └── +server.ts      # NEW GET proxy
│               ├── link/
│               │   └── [provider]/
│               │       ├── authorize/
│               │       │   └── +server.ts # NEW GET proxy (redirect)
│               │       └── +server.ts  # NEW POST proxy
│               └── unlink/
│                   └── [provider]/
│                       └── +server.ts  # NEW DELETE proxy
```

**Structure Decision**: Follows existing SvelteKit project structure with API clients split into server-only (`federation.ts`, `social.ts`) and browser-safe (`*-client.ts`) modules. Federation gets its own component directory and route group.

## Key Implementation Details

### API Module Split (Server vs Client)

Following the pattern established in Phase 010:
- **Server-side** (`federation.ts`, `social.ts`): Use `apiClient` from `./client.ts` with `token` and `tenantId` params. Used by `+page.server.ts` load functions and form actions.
- **Client-side** (`federation-client.ts`, `social-client.ts`): Use browser `fetch` to call `/api/...` BFF proxy endpoints. Used by `.svelte` components for client-side data fetching (e.g., overview dashboard aggregation).

### Federation Page Tab Layout

The `/federation` page uses a tab layout (consistent with Settings page pattern):
- URL: `/federation?tab=overview` (default)
- Tabs: Overview, OIDC, SAML, Social
- OIDC and SAML tabs show lists with "Add" buttons linking to create pages
- Social tab shows all 4 providers as cards with inline configuration
- Tab state tracked via URL query param for deep-linking

### OIDC IdP Detail Page

The `/federation/oidc/[id]` page is the most complex, containing:
- IdP details display with edit form (Superforms)
- Validate button with inline results
- Enable/disable toggle
- Domain list with add/remove (inline, no separate page)
- Delete with confirmation dialog

### Social Provider Configuration

Social providers use a card-based layout (not a form page):
- All 4 providers shown as cards on the Social tab
- Each card expands to show configuration fields when clicked
- Provider-specific fields render conditionally
- Save/enable per-card using client-side fetch to BFF proxy
- No Superforms needed — simple fetch-based updates

### Social Connections (User Settings)

New tab in Settings page:
- Lists user's linked social accounts
- "Link" button per available (enabled) provider → initiates OAuth redirect flow
- "Unlink" button per linked account → confirmation dialog → DELETE request

### Admin Role Enforcement

- Federation sidebar item: conditional on `data.isAdmin` (from layout)
- Federation page server load: redirect non-admins to `/dashboard`
- All BFF proxy endpoints: check `hasAdminRole(locals.user?.roles)` except social user endpoints
- Social connection endpoints: only require authenticated user (not admin)

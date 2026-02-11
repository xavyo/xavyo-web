# Implementation Plan: Onboarding + App Shell

**Branch**: `003-onboarding-app-shell` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-onboarding-app-shell/spec.md`

## Summary

Build the post-signup onboarding flow (tenant provisioning form + one-time credentials confirmation) and the authenticated app shell (sidebar navigation, header with logout, toast notification system, auth guard on the (app) layout group, and dashboard placeholder page).

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes)
**Primary Dependencies**: SvelteKit, Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), jose
**Storage**: HttpOnly cookies (access_token, refresh_token, tenant_id)
**Testing**: Vitest + @testing-library/svelte (TDD per constitution)
**Target Platform**: Web (all modern browsers, 320px–2560px viewport)
**Project Type**: Web (SvelteKit fullstack)
**Performance Goals**: Navigation < 500ms, toast < 200ms, auth guard redirect < 1s
**Constraints**: No tokens exposed to client-side JS, no `any` types
**Scale/Scope**: 5 new pages/routes, 4 layout components, 1 store, 1 Zod schema

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | Onboarding uses server-side action; credentials only in page.server.ts response; tenant_id set as HttpOnly cookie; logout clears cookies server-side |
| II. TDD | PASS | Tests written first for toast store, Zod schema, layout components |
| III. Honest Reviews | PASS | Will conduct review after implementation |
| IV. Svelte 5 Runes Only | PASS | All components use $state, $derived, $props, $bindable; toast store uses $state rune |
| V. Minimal Complexity | PASS | Static nav items (no config system), simple toast store, no abstractions beyond what's needed |
| VI. Type Safety | PASS | All API types already in types.ts; new types for NavItem and Toast; strict mode |
| VII. English Only | PASS | All UI text in English |

## Project Structure

### Documentation (this feature)

```text
specs/003-onboarding-app-shell/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── onboarding-api.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── schemas/
│   │   └── onboarding.ts              # Zod schema for organization name
│   ├── stores/
│   │   └── toast.svelte.ts            # Toast store using $state rune
│   └── components/
│       └── layout/
│           ├── sidebar.svelte         # App sidebar with nav links
│           ├── header.svelte          # App header with user info + logout
│           ├── page-header.svelte     # Reusable page title + description
│           └── toast-container.svelte # Toast notification renderer
├── routes/
│   ├── (app)/
│   │   ├── +layout.server.ts         # Auth guard: redirect to /login if !locals.user
│   │   ├── +layout.svelte            # App shell: sidebar + header + main + toast
│   │   ├── onboarding/
│   │   │   ├── +page.server.ts       # Load (check tid) + action (provision tenant)
│   │   │   └── +page.svelte          # Form + credentials confirmation
│   │   ├── dashboard/
│   │   │   ├── +page.server.ts       # Load user data for dashboard
│   │   │   └── +page.svelte          # Welcome + placeholder stats
│   │   └── logout/
│   │       └── +page.server.ts       # Load-only: calls logout API, clears cookies, redirects
│   └── (auth)/
│       └── login/
│           └── +page.server.ts       # UPDATE: support ?redirectTo query param
```

**Structure Decision**: Follows existing SvelteKit conventions from Feature 002. New layout components go in `src/lib/components/layout/`. Toast store in `src/lib/stores/`. The `(app)` route group encapsulates all authenticated routes with a shared layout and auth guard.

## Complexity Tracking

No violations — no complexity tracking needed.

## Key Design Decisions

### 1. Onboarding Credentials Display

The credentials confirmation is implemented as a client-side state toggle within the onboarding page. After the server action succeeds, the provisioning result is returned to the page via Superforms' `form.data` (or a separate data property). The page component holds the result in a `$state` variable. Once the user navigates away, the credentials are gone from memory.

### 2. Toast Store with Svelte 5 Runes

The toast store uses `$state` for the toast array and exports functions to add/remove toasts. No legacy Svelte stores — pure runes-based reactive state via a module-level `$state` in a `.svelte.ts` file.

### 3. Auth Guard via (app)/+layout.server.ts

The auth guard is a simple `load` function that checks `locals.user`. If absent, it redirects to `/login?redirectTo={current_path}`. The login page reads `redirectTo` from URL params and redirects there after successful login.

### 4. Logout as a Server-Side Action

Logout is implemented as a GET route at `/logout` that calls the backend logout API with the refresh token, clears all auth cookies, and redirects to `/login`. No client-side JS needed.

### 5. Sidebar Responsive Behavior

The sidebar uses Tailwind's responsive utilities. On `lg:` and above, it's always visible. On smaller screens, it's hidden by default and toggled via a hamburger button in the header. The toggle state is a `$state` boolean in the (app) layout.

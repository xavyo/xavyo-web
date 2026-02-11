# Implementation Plan: API Client + Authentication

**Branch**: `002-api-client-auth` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-api-client-auth/spec.md`

## Summary

Create the BFF authentication layer: TypeScript types mirroring Rust DTOs, a server-side fetch wrapper injecting JWT + X-Tenant-Id headers, auth/tenant API modules, hooks.server.ts for cookie-based auth with auto-refresh, Zod validation schemas, root layout exposing auth state, and the (auth) layout group with 5 pages (login, signup, forgot-password, reset-password, verify-email).

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode)
**Primary Dependencies**: SvelteKit, Superforms, Zod, jose (JWT decode), bits-ui (via existing UI components)
**Storage**: HttpOnly cookies (access_token, refresh_token, tenant_id)
**Testing**: Vitest (unit tests for API client, schemas, hooks logic)
**Target Platform**: Web (SvelteKit SSR + client hydration)
**Project Type**: Web application (SvelteKit single project)
**Performance Goals**: Form validation < 100ms, token refresh transparent
**Constraints**: BFF Security (Constitution I) — JWT never exposed to client JS
**Scale/Scope**: 5 auth pages, 4 API modules, 1 server hook, 4 Zod schemas

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | CRITICAL | Tokens in HttpOnly cookies only, never in $page.data |
| II. TDD | PASS | Tests for API client, schemas, hooks |
| III. Honest Reviews | PASS | Will review after implementation |
| IV. Svelte 5 Runes Only | PASS | All pages use $props, $state |
| V. Minimal Complexity | PASS | One function per endpoint, no clever abstractions |
| VI. Type Safety | PASS | Types mirror Rust DTOs exactly |
| VII. English Only | PASS | All code and UI in English |

## Project Structure

### Source Code (this feature adds)

```text
src/
├── hooks.server.ts                       # Cookie extraction, JWT decode, auto-refresh
├── lib/
│   ├── api/
│   │   ├── types.ts                      # TS types mirroring Rust DTOs
│   │   ├── client.ts                     # Server-side fetch wrapper
│   │   ├── auth.ts                       # signup, login, refresh, logout, forgotPassword, resetPassword, verifyEmail
│   │   └── tenants.ts                    # provisionTenant
│   └── schemas/
│       └── auth.ts                       # Zod: loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema
├── routes/
│   ├── +layout.server.ts                 # Root layout: expose auth state
│   ├── +layout.svelte                    # Root layout: toast + slot
│   └── (auth)/
│       ├── +layout.svelte                # Centered card layout
│       ├── login/
│       │   ├── +page.server.ts           # Superforms load + action
│       │   └── +page.svelte              # Login form
│       ├── signup/
│       │   ├── +page.server.ts
│       │   └── +page.svelte
│       ├── forgot-password/
│       │   ├── +page.server.ts
│       │   └── +page.svelte
│       ├── reset-password/
│       │   ├── +page.server.ts
│       │   └── +page.svelte
│       └── verify-email/
│           ├── +page.server.ts
│           └── +page.svelte
```

**Structure Decision**: Extends existing SvelteKit structure. API modules in src/lib/api/, schemas in src/lib/schemas/, auth pages in (auth) route group.

## Complexity Tracking

> No violations.

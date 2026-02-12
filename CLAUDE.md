# xavyo-web Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-10

## Active Technologies
- TypeScript 5.x / Svelte 5 (runes) + SvelteKit, Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), jose (003-onboarding-app-shell)
- HttpOnly cookies (access_token, refresh_token, tenant_id) (003-onboarding-app-shell)
- TypeScript 5.x / Svelte 5 (runes) + SvelteKit, @tanstack/svelte-table 8.x, Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3) (004-data-table-users)
- HttpOnly cookies (session), server-side API calls to xavyo-idp (004-data-table-users)
- TypeScript 5.x / Svelte 5 (runes) + SvelteKit, Bits UI, Superforms + Zod, TanStack Table (`@tanstack/svelte-table` v9), Tailwind CSS v4 (005-persona-management)
- N/A (backend handles persistence via xavyo-idp API on localhost:8080) (005-persona-management)
- TypeScript 5.x (SvelteKit with Svelte 5 runes) + SvelteKit, Bits UI, Tailwind CSS v4, @tanstack/svelte-table, Superforms (007-ux-polish)
- N/A (no data model changes) (007-ux-polish)
- TypeScript 5.9 / Svelte 5.50 (runes mode) + SvelteKit 2.50 + Bits UI 2.15, Tailwind CSS v4.1, lucide-svelte (new), clsx + tailwind-merge (008-visual-redesign-dark-mode)
- Browser localStorage for theme preference (no server-side storage) (008-visual-redesign-dark-mode)
- TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte, WebAuthn Browser API (009-security-self-service)
- N/A (backend handles persistence via xavyo-idp REST API on localhost:8080) (009-security-self-service)
- TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4, lucide-svelte, Superforms + Zod (via `zod/v3`) (010-audit-compliance)
- TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), lucide-svelte (011-identity-federation)
- TypeScript 5.x / Svelte 5 (runes) + SvelteKit + Bits UI, Tailwind CSS v4, lucide-svelte, Superforms + Zod (`zod/v3`), TanStack Table (012-governance-core)
- N/A (all data via xavyo-idp REST API through BFF) (012-governance-core)
- TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), lucide-svelte, TanStack Table (013-nhi-protocols-advanced)
- N/A (backend handles all persistence via xavyo-idp API on localhost:8080) (013-nhi-protocols-advanced)
- N/A (all data via xavyo-idp REST API through BFF proxy) (020-connector-management)
- TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), TanStack Table (@tanstack/svelte-table), lucide-svelte (021-provisioning-reconciliation)
- TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte, TanStack Table (023-tenant-admin-selfservice)
- TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), TanStack Table (`@tanstack/svelte-table`), lucide-svelte (024-webhooks-authz-policies)
- TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4 (@tailwindcss/vite), Superforms + Zod (via `zod/v3`), lucide-svelte (029-birthright-lifecycle)

- TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit, Bits UI, Tailwind CSS v4 (@tailwindcss/vite), Superforms, Zod, TanStack Table (@tanstack/svelte-table), jose, clsx, tailwind-merge (001-project-foundations)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x / Svelte 5 (runes mode): Follow standard conventions

## Recent Changes
- 031-catalog-birthright: Added TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
- 030-power-of-attorney: Added TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte
- 029-birthright-lifecycle: Added TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit + Bits UI, Tailwind CSS v4 (@tailwindcss/vite), Superforms + Zod (via `zod/v3`), lucide-svelte


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

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
- 007-ux-polish: Added TypeScript 5.x (SvelteKit with Svelte 5 runes) + SvelteKit, Bits UI, Tailwind CSS v4, @tanstack/svelte-table, Superforms
- 006-nhi-management: Added TypeScript 5.x / Svelte 5 (runes) + SvelteKit, Bits UI, Superforms + Zod, TanStack Table (`@tanstack/svelte-table` v9), Tailwind CSS v4
- 005-persona-management: Added TypeScript 5.x / Svelte 5 (runes) + SvelteKit, Bits UI, Superforms + Zod, TanStack Table (`@tanstack/svelte-table` v9), Tailwind CSS v4


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

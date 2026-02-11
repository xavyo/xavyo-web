# Research: Onboarding + App Shell

**Feature**: 003-onboarding-app-shell
**Created**: 2026-02-10

## Decision 1: Onboarding Credentials Display Strategy

**Decision**: Use Superforms `form` action response with client-side `$state` to hold provisioning result. No database persistence of credentials display state.

**Rationale**: The API key and OAuth secret are returned once by the backend and cannot be retrieved again. The simplest approach is to return them from the server action and hold them in a reactive `$state` variable on the page. When the user navigates away, the state is lost — matching the "shown once" requirement perfectly.

**Alternatives considered**:
- Session-based storage: Over-engineered for a one-time display. Would require cleanup logic.
- URL-based (redirect with data): Credentials in URLs is a security risk.

## Decision 2: Toast Store Architecture (Svelte 5 Runes)

**Decision**: Use a `.svelte.ts` module with `$state` array of toast objects. Export `addToast()`, `removeToast()`, and `toasts` (reactive getter).

**Rationale**: Svelte 5's `.svelte.ts` files allow rune-based reactive state at the module level. This replaces the legacy `writable()` store pattern while maintaining global reactivity. The pattern is officially supported and recommended for Svelte 5.

**Alternatives considered**:
- Legacy Svelte stores (`writable`): Forbidden by Constitution Principle IV.
- Context API: Too scoped — toasts need to be triggered from server actions and displayed at root level.

## Decision 3: Auth Guard Implementation

**Decision**: Use `(app)/+layout.server.ts` with a `load` function that checks `locals.user` and redirects to `/login?redirectTo=encodeURIComponent(url.pathname)`.

**Rationale**: SvelteKit's layout server load runs before any child page loads. Placing the guard at the (app) layout level protects all child routes automatically. The `redirectTo` parameter enables post-login navigation back to the original page.

**Alternatives considered**:
- hooks.server.ts guard: Too broad — would affect (auth) routes too. Route-level is cleaner.
- Per-page guards: Violates DRY and is error-prone (easy to forget on new pages).

## Decision 4: Logout Implementation

**Decision**: Implement as a GET route at `(app)/logout/+page.server.ts` using a `load` function that calls the backend logout API, clears cookies, and redirects.

**Rationale**: A GET-based logout via `load` function means a simple `<a href="/logout">` link works without JavaScript. The load function runs server-side, calls the backend to revoke the refresh token, clears all auth cookies, and redirects to `/login`. If the backend call fails, cookies are still cleared locally.

**Alternatives considered**:
- POST form action: Requires a form submission or fetch call. More complex for a simple logout link.
- Client-side fetch: Violates BFF security principle — cookies should be managed server-side.

## Decision 5: Sidebar Responsive Strategy

**Decision**: Use Tailwind responsive breakpoint (`lg:`) for desktop/mobile switch. Desktop: sidebar always visible (fixed width). Mobile: sidebar hidden, toggled via hamburger button using `$state` boolean.

**Rationale**: Tailwind's responsive utilities handle the breakpoint cleanly. A simple boolean state for mobile toggle avoids over-engineering. No animation library needed — Tailwind transitions handle the open/close smoothly.

**Alternatives considered**:
- CSS-only (no JS toggle): Cannot handle overlay sidebar on mobile properly.
- Third-party sidebar component: Unnecessary dependency for a simple layout pattern.

## Decision 6: Copy-to-Clipboard Implementation

**Decision**: Use the native `navigator.clipboard.writeText()` API with a brief "Copied!" feedback state managed by `$state`.

**Rationale**: The Clipboard API is supported in all modern browsers. A simple inline function with a temporary "Copied!" state provides clear user feedback without any external dependencies.

**Alternatives considered**:
- `document.execCommand('copy')`: Deprecated.
- Clipboard library (e.g., clipboard.js): Unnecessary for a simple copy operation.

# Research: Data Table + User Management

**Feature**: 004-data-table-users
**Date**: 2026-02-10

## Decision 1: TanStack Table Integration Pattern for SvelteKit

**Decision**: Use `createSvelteTable` from `@tanstack/svelte-table` with manual server-side pagination (no client-side data caching).

**Rationale**: TanStack Table v8 provides a headless table core. In Svelte 5, `createSvelteTable` returns a reactive table instance that integrates naturally with runes. For server-side pagination, we set `manualPagination: true` and control `pageIndex`/`pageSize` via `$state` variables. The `onPaginationChange` callback triggers data re-fetching from the proxy endpoint.

**Alternatives considered**:
- **Client-side pagination with full data load**: Rejected because user lists can be large; loading all users upfront is wasteful and slow.
- **SvelteKit load function with URL-based pagination**: Works but causes full-page loads on pagination/search changes, degrading UX for data-heavy tables.

## Decision 2: Client-Side Data Fetching Architecture

**Decision**: Use a SvelteKit API proxy endpoint (`/api/users`) that the client fetches directly via `fetch()`. The proxy validates the session cookie, extracts the JWT and tenant ID from cookies, then forwards the request to the xavyo-idp backend.

**Rationale**: This satisfies BFF security (tokens never reach the client) while enabling dynamic, non-navigating data updates for pagination and search. The proxy pattern is established in the project plan for all list pages (users, personas, NHI).

**Alternatives considered**:
- **Direct API calls from client**: Rejected — would expose JWT to browser JS, violating Constitution Principle I.
- **SvelteKit load with `invalidate()`**: Possible but more complex, requires managing URL dependencies, and doesn't cleanly support debounced search.

## Decision 3: Search Debounce Strategy

**Decision**: Use a simple `setTimeout`/`clearTimeout` debounce in the component (300ms), triggering a fetch to the proxy endpoint with the search query. No external debounce library.

**Rationale**: A 3-line debounce implementation is sufficient. Adding a library dependency for one use would violate the minimal complexity principle.

**Alternatives considered**:
- **lodash.debounce**: Rejected — adding a dependency for one small utility.
- **URL-based search with `goto()`**: Rejected — causes navigation and doesn't integrate well with the client-side table state.

## Decision 4: Form Actions vs API Calls for Mutations

**Decision**: Use SvelteKit form actions (via Superforms) for create, update, delete, enable, and disable operations. These go through `+page.server.ts` on the respective route.

**Rationale**: Form actions maintain the BFF pattern (server handles auth headers), provide progressive enhancement, integrate with Superforms validation, and follow the established pattern from Features 002-003.

**Alternatives considered**:
- **Client-side fetch to proxy endpoints**: Would work but loses progressive enhancement, requires duplicating validation logic, and doesn't match existing patterns.

## Decision 5: User Detail Page — View vs Edit Mode

**Decision**: Single page with toggle between view mode (read-only display) and edit mode (form with Superforms). Default to view mode on load. "Edit" button switches to edit mode. "Cancel" returns to view mode.

**Rationale**: Simpler than separate view/edit routes. Keeps all user detail logic in one file pair (`+page.server.ts` + `+page.svelte`). The toggle is managed via `$state` boolean.

**Alternatives considered**:
- **Separate `/users/[id]/edit` route**: Adds routing complexity with minimal benefit for a simple form.
- **Inline editing on individual fields**: Over-engineered for this scope; the full-form edit is simpler.

## Decision 6: Delete Confirmation Dialog

**Decision**: Use Bits UI `Dialog` component (already installed) for the delete confirmation. The dialog shows the user's email and requires explicit "Delete" confirmation.

**Rationale**: Bits UI Dialog is accessible (focus trapping, aria labels), already part of the project, and matches the component library approach.

**Alternatives considered**:
- **Browser `confirm()` dialog**: Not accessible, can't be styled, poor UX.
- **Inline confirmation (expand section)**: More complex to implement and less standard.

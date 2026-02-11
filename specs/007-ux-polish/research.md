# Research: Polish & UX Refinements

## R1: Skeleton Loading Patterns for Data Tables

**Decision**: Enhance the DataTable component to render skeleton rows when `isLoading` is true, instead of showing a plain "Loading..." text message.

**Rationale**: Skeleton rows that mirror the actual table layout (same number of columns, approximate cell widths) provide better perceived performance and reduce layout shift. The existing `Skeleton` component (`animate-pulse rounded-md bg-primary/10`) can be composed into table cells.

**Alternatives considered**:
- Spinner overlay: Discarded — obscures content structure, doesn't communicate layout
- Shimmer effect library: Discarded — unnecessary dependency, Tailwind `animate-pulse` already works
- Full-page skeleton: Discarded — too much effort for detail pages with varied layouts

**Implementation approach**: Add a `skeletonRows` prop (default 5) to DataTable. When `isLoading`, render N skeleton rows with Skeleton components in each cell matching column count.

## R2: Empty State Component Pattern

**Decision**: Create a reusable `EmptyState` component that accepts title, description, icon, and an optional action (label + href).

**Rationale**: Every list page needs an empty state. A shared component ensures visual consistency and reduces per-page boilerplate. The component differentiates between "no data exists" (with CTA) and "no matching results" (with clear-filters action).

**Alternatives considered**:
- Per-page inline empty states: Discarded — leads to inconsistency and duplication
- DataTable built-in empty state: Partially adopted — the DataTable's `emptyMessage` becomes a slot/snippet for the EmptyState component

## R3: SvelteKit Error Boundaries

**Decision**: Create `+error.svelte` at the `(app)` layout group level. This catches all errors from authenticated routes and renders a user-friendly error page with a Retry button.

**Rationale**: SvelteKit's built-in error handling via `+error.svelte` is the standard approach. Placing it at `(app)` level means it inherits the app shell (sidebar, header) while catching errors from any child page. A root-level `+error.svelte` handles auth-route errors.

**Alternatives considered**:
- Per-page try/catch in load functions: Discarded — too much duplication, doesn't catch unexpected errors
- Global error handler in hooks: Partially adopted — `handleError` hook for logging, but `+error.svelte` for user-facing display

## R4: Responsive Sidebar Improvements

**Decision**: The existing responsive sidebar implementation is already functional (mobile overlay with backdrop, hamburger button in header). Minor improvements needed: close sidebar on navigation, ensure proper z-index layering, add transition animation.

**Rationale**: The current implementation in `(app)/+layout.svelte` already handles the core mobile sidebar behavior. Only polish is needed: smoother transitions and auto-close on nav item click.

**Alternatives considered**:
- Sheet/drawer component from Bits UI: Discarded — the existing custom implementation works well, no need to add dependency complexity
- CSS-only sidebar toggle: Discarded — requires JS for proper overlay click handling

## R5: Dialog Responsive Behavior

**Decision**: The existing dialog-content.svelte already uses `w-full max-w-lg` and `sm:rounded-lg`, which means it fills width on mobile and constrains on desktop. No changes needed for dialog responsiveness.

**Rationale**: The Bits UI dialog pattern already handles mobile widths correctly.

## R6: Table Horizontal Scroll

**Decision**: Wrap the DataTable's `<table>` element in an `overflow-x-auto` container to enable horizontal scrolling on narrow screens.

**Rationale**: Standard approach for responsive tables. The table header and data remain visible while users can swipe horizontally to see all columns.

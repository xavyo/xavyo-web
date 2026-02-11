# Implementation Plan: Polish & UX Refinements

**Branch**: `007-ux-polish` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-ux-polish/spec.md`

## Summary

Final polish pass across xavyo-web covering four areas: (1) skeleton loading states on all list and detail pages, (2) empty state messages with CTAs on all list pages, (3) error boundary pages with retry functionality, and (4) responsive improvements for mobile screens. All changes are UI-only — no new routes or API endpoints. The existing component library (Skeleton, DataTable, Sidebar, Toast) is extended rather than replaced.

## Technical Context

**Language/Version**: TypeScript 5.x (SvelteKit with Svelte 5 runes)
**Primary Dependencies**: SvelteKit, Bits UI, Tailwind CSS v4, @tanstack/svelte-table, Superforms
**Storage**: N/A (no data model changes)
**Testing**: Vitest + @testing-library/svelte
**Target Platform**: Web (desktop + mobile responsive down to 320px)
**Project Type**: Web application (SvelteKit)
**Performance Goals**: Sidebar open/close < 300ms, no layout shift on skeleton→content transitions
**Constraints**: UI-only changes, no new API endpoints, no new dependencies
**Scale/Scope**: ~15 files modified, ~5 new files created (components + error pages)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | No token changes; all changes are UI-only |
| II. Test-Driven Development | PASS | Tests for new components (EmptyState, skeleton rows, error page) |
| III. Honest Reviews | PASS | Will perform post-implementation review |
| IV. Svelte 5 Runes Only | PASS | All new components use $state, $props, $derived |
| V. Minimal Complexity | PASS | Extending existing components, no new abstractions beyond EmptyState |
| VI. Type Safety | PASS | All props typed, no `any` |
| VII. English Only | PASS | All UI text in English |

No violations. All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/007-ux-polish/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (files to create/modify)

```text
src/
├── lib/
│   ├── components/
│   │   ├── ui/
│   │   │   └── empty-state/
│   │   │       ├── empty-state.svelte        # NEW: Reusable empty state component
│   │   │       └── index.ts                  # NEW: Barrel export
│   │   ├── data-table/
│   │   │   └── data-table.svelte             # MODIFY: Skeleton rows when isLoading
│   │   └── layout/
│   │       └── sidebar.svelte                # MODIFY: Close on nav click callback
│   └── stores/
│       └── toast.svelte.ts                   # No changes needed (already functional)
├── routes/
│   ├── +error.svelte                         # NEW: Root error page
│   ├── (app)/
│   │   ├── +error.svelte                     # NEW: App-level error page (within shell)
│   │   ├── +layout.svelte                    # MODIFY: Pass onNavigate to sidebar for auto-close
│   │   ├── users/
│   │   │   └── +page.svelte                  # MODIFY: Enhanced empty state with CTA
│   │   ├── personas/
│   │   │   ├── +page.svelte                  # MODIFY: Enhanced empty state with CTA
│   │   │   └── archetypes/
│   │   │       └── +page.svelte              # MODIFY: Enhanced empty state with CTA
│   │   └── nhi/
│   │       ├── +page.svelte                  # MODIFY: Enhanced empty state with CTA
│   │       └── credentials-section.svelte    # MODIFY: Empty state for no credentials
│   └── (auth)/
│       └── (no changes needed)
└── tests/
    (co-located test files)
```

**Structure Decision**: Extending the existing SvelteKit project structure. One new component directory (`empty-state/`), two new error pages, and modifications to ~8 existing files. No structural changes needed.

## Key Design Decisions

### 1. DataTable Skeleton Rows (from R1)

The DataTable component currently shows "Loading..." text. It will be enhanced to render configurable skeleton rows (default 5) using the existing Skeleton component. Each skeleton row renders a Skeleton element per column, creating a visual preview of the table structure.

### 2. EmptyState Component (from R2)

A new reusable `EmptyState` component with props:
- `title`: Primary message (e.g., "No users yet")
- `description`: Optional secondary text
- `icon`: Optional icon/emoji
- `actionLabel`: Optional CTA button text
- `actionHref`: Optional CTA link

The DataTable will use this component when `data.length === 0 && !isLoading`. List pages pass entity-specific empty state content via DataTable props or render EmptyState directly.

### 3. Error Pages (from R3)

Two `+error.svelte` files:
- Root level: Minimal error page for unauthenticated routes
- `(app)` level: Error page within the app shell (sidebar + header preserved) with "Retry" and "Go to Dashboard" buttons

### 4. Responsive Polish (from R4, R5, R6)

- **Sidebar**: Already mobile-responsive. Add `onNavigate` callback to close sidebar on nav item click. Add CSS transition for smooth slide-in.
- **Tables**: Add `overflow-x-auto` wrapper in DataTable for horizontal scroll.
- **Dialogs**: Already responsive (`w-full max-w-lg`). No changes needed.
- **Forms**: Already use Tailwind responsive utilities. Verify and fix any side-by-side layouts that don't stack on mobile.

## Complexity Tracking

No constitution violations. No complexity justifications needed.

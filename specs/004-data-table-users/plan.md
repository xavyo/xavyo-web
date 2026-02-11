# Implementation Plan: Data Table + User Management

**Branch**: `004-data-table-users` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-data-table-users/spec.md`

## Summary

Build a reusable data table component wrapping TanStack Table with server-side pagination, search toolbar, empty/loading states. Then build the full user management CRUD: list page (using the data table), create user form, user detail/edit page, enable/disable toggle, and delete with confirmation dialog. A SvelteKit API proxy endpoint serves client-side data fetching for the table.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes)
**Primary Dependencies**: SvelteKit, @tanstack/svelte-table 8.x, Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3)
**Storage**: HttpOnly cookies (session), server-side API calls to xavyo-idp
**Testing**: Vitest + @testing-library/svelte (TDD per constitution)
**Target Platform**: Web (all modern browsers, 320px–2560px viewport)
**Project Type**: Web (SvelteKit fullstack)
**Performance Goals**: Table page load < 2s, search debounce 300ms, CRUD actions < 1s feedback
**Constraints**: No tokens exposed to client-side JS, no `any` types, reusable data table
**Scale/Scope**: 1 reusable component, 4 new routes (list, create, detail/edit, proxy), 1 API module, 2 Zod schemas, ~15 files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | Table data fetched via SvelteKit proxy endpoint (`src/routes/api/users/+server.ts`) which validates session cookie and forwards JWT; all mutations go through `+page.server.ts` actions; no tokens in client code |
| II. TDD | PASS | Tests for Zod schemas (create, update), data table component unit tests, API client functions |
| III. Honest Reviews | PASS | Will conduct review after implementation |
| IV. Svelte 5 Runes Only | PASS | Data table uses `$state` for search/pagination state, `$derived` for computed values, `$props` for component API |
| V. Minimal Complexity | PASS | Data table is one component (not a component library); user pages follow existing patterns; one function per API endpoint |
| VI. Type Safety | PASS | New types in types.ts mirror Rust DTOs exactly (UserResponse, UserListResponse, PaginationMeta, CreateUserRequest, UpdateUserRequest); Zod schemas match TS types |
| VII. English Only | PASS | All UI text in English |

## Project Structure

### Documentation (this feature)

```text
specs/004-data-table-users/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── users-api.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── types.ts                     # ADD: UserResponse, UserListResponse, PaginationMeta, CreateUserRequest, UpdateUserRequest
│   │   └── users.ts                     # NEW: listUsers, createUser, getUser, updateUser, deleteUser, enableUser, disableUser
│   ├── schemas/
│   │   ├── user.ts                      # NEW: createUserSchema, updateUserSchema (Zod)
│   │   └── user.test.ts                 # NEW: Schema validation tests
│   └── components/
│       └── data-table/
│           ├── data-table.svelte         # NEW: Reusable TanStack Table wrapper
│           ├── data-table-pagination.svelte  # NEW: Pagination controls
│           ├── data-table-toolbar.svelte  # NEW: Search toolbar
│           └── data-table.test.ts        # NEW: Component tests
├── routes/
│   ├── api/
│   │   └── users/
│   │       └── +server.ts               # NEW: Proxy endpoint for client-side table fetching
│   └── (app)/
│       └── users/
│           ├── +page.server.ts           # NEW: Load user list (initial page)
│           ├── +page.svelte              # NEW: User list page with data table
│           ├── create/
│           │   ├── +page.server.ts       # NEW: Create user action
│           │   └── +page.svelte          # NEW: Create user form
│           └── [id]/
│               ├── +page.server.ts       # NEW: Load user detail, update/delete/enable/disable actions
│               └── +page.svelte          # NEW: User detail/edit page
```

**Structure Decision**: Follows established SvelteKit convention from Features 002-003. New `data-table/` directory under components for the reusable table (separate from `layout/` and `ui/`). User routes nested under `(app)/users/` following the existing auth-guarded layout pattern.

## Key Design Decisions

### 1. Client-Side Data Fetching for Table

The user list table uses client-side fetching (via a SvelteKit API proxy at `/api/users`) instead of SvelteKit load functions. This enables:
- Pagination without full page reloads
- Debounced search without URL changes
- Loading states within the table component
- Reusable pattern for Personas and NHI tables later

The proxy endpoint validates the session, extracts the JWT, and forwards the request to the backend.

### 2. Server-Side Actions for Mutations

Create, update, delete, enable, and disable use SvelteKit form actions (Superforms). This keeps mutation logic server-side, maintains the BFF pattern, and provides progressive enhancement.

### 3. Data Table Component API

The data table accepts:
- `columns`: TanStack column definitions
- `data`: Row data array
- `pageCount`: Total pages (for server-side pagination)
- `pagination`: Current page state (`{ pageIndex, pageSize }`)
- `onPaginationChange`: Callback for pagination changes
- `searchValue` / `onSearchChange`: Optional search integration
- `isLoading`: Boolean for loading skeleton
- `emptyMessage`: Configurable empty state text

### 4. Roles as Checkbox Group

The create/edit forms present roles ("admin", "user") as checkboxes since the set is small and fixed. No dropdown/select needed for just 2 options.

### 5. Delete Confirmation via Dialog

Uses the existing Bits UI Dialog component for delete confirmation. Consistent with the app's component library, accessible, and handles focus trapping.

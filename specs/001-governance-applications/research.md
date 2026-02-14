# Research: Governance Applications Management UI

## Existing Patterns

### Decision: Follow established governance CRUD pattern
**Rationale**: The project already has mature CRUD patterns for entitlements, SoD rules, campaigns, meta-roles, and governance roles. All use the same stack (Superforms + Zod, TanStack Table, BFF proxy) with consistent conventions.
**Alternatives considered**: None — consistency with existing patterns is required.

### Decision: Server-side pagination via BFF proxy for list page
**Rationale**: The governance overview page (`/governance`) uses client-side fetch through BFF proxy endpoints (`/api/governance/*`) with `$effect` for reactive data fetching. However, dedicated list pages like meta-roles use server-side `+page.server.ts` load functions. For a standalone list page, server-side loading is simpler and follows the meta-roles/roles pattern.
**Alternatives considered**: Client-side fetch via `$effect` (used in governance overview — more complex, unnecessary for a standalone page).

### Decision: Use `Grid3X3` icon from lucide-svelte for sidebar
**Rationale**: Represents a grid/matrix of applications. Already importing many lucide icons in the layout.
**Alternatives considered**: `AppWindow`, `Blocks`, `LayoutGrid` — `Grid3X3` best conveys "applications catalog".

### Decision: Omit `owner_id` and `metadata` from UI forms
**Rationale**: These are power-user fields. The backend accepts them, but they add complexity to the form without clear user value in the current iteration. They can be added later.
**Alternatives considered**: Including them (unnecessary complexity per Principle V).

### Decision: `app_type` is read-only on the edit page
**Rationale**: Changing an application's type after creation could affect its associated entitlements. The backend allows it via PUT, but it's safer to prevent accidental changes in the UI.
**Alternatives considered**: Making it editable (risk of accidental type changes).

## Backend API Verification

All endpoints verified via existing API client and BFF proxy code:
- `GET /governance/applications` → `listApplications()` (exists)
- `POST /governance/applications` → `createApplication()` (exists, type needs update)
- `GET /governance/applications/{id}` → needs `getApplication()`
- `PUT /governance/applications/{id}` → needs `updateApplication()`
- `DELETE /governance/applications/{id}` → needs `deleteApplication()`

Response format: `{ items, total, limit, offset }` — standard pagination format.

Delete returns 412 when application has entitlements.

## No Unresolved Items

All technical decisions are clear. No NEEDS CLARIFICATION items remain.

# Research: Persona & Archetype Management

**Feature**: 005-persona-management
**Date**: 2026-02-10

## Decision 1: Governance Pagination Format

**Decision**: Use separate TypeScript types for governance pagination (`GovernanceListResponse<T>`) with `{ items, total, limit, offset }` format.

**Rationale**: The governance API (personas, archetypes) uses a different pagination format than the users API. Rather than trying to unify them, create clean types that mirror the backend DTOs exactly (Constitution Principle VI: Type Safety).

**Alternatives considered**:
- Shared generic pagination type — rejected because the two formats have different field names (`total_count` vs `total`, `has_more` vs computed).
- Adapter to convert governance format to users format — rejected as unnecessary complexity (Constitution Principle V: Minimal Complexity).

## Decision 2: Filter Approach for Persona List

**Decision**: Create a `data-table-filters.svelte` component that renders Select dropdowns for status and archetype filtering, alongside the existing search toolbar.

**Rationale**: The persona list needs two filter dropdowns (status, archetype) which is more complex than the simple search field used for users. A dedicated filter component keeps the DataTable wrapper clean and reusable.

**Alternatives considered**:
- Extending DataTableToolbar with filter props — rejected because it would make the toolbar too complex for simpler use cases (users).
- Using URL search params for filters — considered for bookmarkability but deferred since users page doesn't use URL params either. Keep consistent with Feature 004 approach ($state + $effect).

## Decision 3: Persona Status Badge Color Mapping

**Decision**: Use Tailwind CSS color classes via Badge component variants for the 6 persona states.

**Rationale**: Must be visually distinct at a glance (SC-003). Map to semantic colors:
- draft: `variant="outline"` (neutral, not yet active)
- active: `variant="default"` (green — primary success state)
- expiring: custom amber styling (warning — approaching deadline)
- expired: `variant="destructive"` (red — past deadline)
- suspended: custom orange styling (warning — manually paused)
- archived: `variant="secondary"` (gray — terminal state)

For states without a direct Badge variant (expiring, suspended), use the Badge component with custom CSS classes.

**Alternatives considered**:
- Using only Badge variants — insufficient for 6 distinct states with only 4 variants.
- Using colored dots instead of badges — less informative, harder to read in a table.

## Decision 4: Lifecycle Action Dialogs

**Decision**: Use Bits UI Dialog with a textarea for deactivation and archive reason input. Validate minimum 5 characters client-side. Submit as a form action.

**Rationale**: Matches the existing delete confirmation pattern from Feature 004, extended with a text input. Keeps the interaction consistent across the app.

**Alternatives considered**:
- Inline expandable form in the actions section — more complex, inconsistent with existing patterns.
- Alert dialog without text input — doesn't meet the requirement for a reason.

## Decision 5: Archetype Route Nesting

**Decision**: Nest archetype pages under `/personas/archetypes/` rather than a separate top-level `/archetypes/` route.

**Rationale**: Archetypes are closely related to personas — they're templates for creating personas. Nesting them under `/personas/archetypes/` keeps the information architecture logical and matches the sidebar navigation (single "Personas" entry that covers both). The sidebar `isActive` function already supports nested paths.

**Alternatives considered**:
- Separate `/archetypes/` route — creates unnecessary complexity in navigation, would need a separate sidebar entry.
- Tab-based navigation within `/personas/` — adds UI complexity and doesn't scale well for CRUD pages.

## Decision 6: Proxy Endpoints

**Decision**: Create two proxy endpoints: `/api/personas/+server.ts` for persona list and `/api/archetypes/+server.ts` for archetype list. Both forward query params to the governance API.

**Rationale**: The DataTable component uses client-side pagination (fetch from `$effect`), requiring proxy endpoints that validate session cookies and forward JWT. This follows the same pattern as `/api/users/+server.ts` from Feature 004.

**Alternatives considered**:
- Server-side pagination via +page.server.ts load function — would require full page reloads on pagination, not compatible with the DataTable's client-side pagination pattern.
- Single unified proxy endpoint — adds routing complexity, separate endpoints are simpler.

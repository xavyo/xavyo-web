# Research: Lifecycle Configuration

## R1: Backend API Contract Verification

**Decision**: All 16 lifecycle endpoints + 1 user status endpoint confirmed in xavyo-idp backend source.

**Rationale**: Verified by reading handler files at `crates/xavyo-api-governance/src/handlers/lifecycle_config.rs`. All routes are registered and handlers are implemented with proper request/response types.

**Alternatives considered**: None — backend is already implemented.

## R2: Pagination Format

**Decision**: Use `{items, total, limit, offset}` pagination format for lifecycle config list.

**Rationale**: This matches the standard governance pagination pattern used by entitlements, SoD rules, certifications, reports, roles, meta-roles, and all other governance features.

**Alternatives considered**: None — consistency with existing patterns is required.

## R3: Detail Page Tab Structure

**Decision**: Use 4-tab layout on config detail page: Details, States, Transitions, Actions/Conditions.

**Rationale**: States and transitions are the core state machine definition. Conditions are attached to transitions and actions to states, so grouping them makes navigation intuitive. Follows the pattern of governance roles (5 tabs) and meta-roles (8 tabs).

**Alternatives considered**:
- 5 tabs (separate Conditions tab) — rejected because conditions are always in context of a specific transition
- 2 tabs (Details + State Machine) — rejected because it would require complex nested UI

## R4: State Actions and Condition Editing UX

**Decision**: Use inline editing with JSON parameter input for actions. Use form-based editing for conditions with type/path/expression fields.

**Rationale**: Actions have arbitrary parameters (JSON), so a JSON editor is appropriate. Conditions have a fixed schema (type, attribute_path, expression), so structured form inputs are better.

**Alternatives considered**:
- Full JSON editor for both — rejected because conditions benefit from structured input
- Visual condition builder — rejected per YAGNI principle; form fields are sufficient

## R5: PATCH vs PUT for Config/State Updates

**Decision**: Backend uses PATCH for config and state updates (partial updates). Frontend should send only changed fields.

**Rationale**: PATCH semantics mean only fields included in the request body are updated. This matches the backend handler which uses `Option<T>` for all update fields.

**Alternatives considered**: None — must match backend contract.

## R6: Client-Side vs Server-Side Data Loading

**Decision**: Config list and detail pages use server-side loading (`+page.server.ts`). State/transition/condition/action mutations use client-side API calls through BFF proxies.

**Rationale**: Server-side loading ensures initial page render has data (SSR). Mutations from the detail page (add state, add transition, update conditions) use client-side calls for responsive UX without full page reloads, following the pattern established in NHI governance and connector management.

**Alternatives considered**:
- All server-side with form actions — rejected because tabbed UI with multiple mutation types is complex with form actions alone
- All client-side — rejected because initial data should be SSR for performance

## R7: Backend LifecycleObjectType Enum Values

**Decision**: Backend uses `User`, `Role`, `Group` as enum variants (PascalCase in Rust, but serde serializes as configured).

**Rationale**: Need to verify exact serialization format. Based on Rust serde conventions in this codebase, likely lowercase or snake_case. Will verify during implementation and test.

**Alternatives considered**: N/A — must match backend serialization.

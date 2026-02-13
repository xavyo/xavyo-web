# Research: Governance Meta-Roles

## R1: Backend API Verification

**Decision**: All 22 meta-role endpoints are confirmed in the xavyo-idp backend at `crates/xavyo-api-governance/src/handlers/meta_roles.rs` (1139 lines).

**Rationale**: Direct code inspection of the backend handler file confirms all endpoints, request/response types, and validation rules. The meta-role feature uses 5 backend services: MetaRoleService, MetaRoleMatchingService, MetaRoleConflictService, MetaRoleCascadeService, MetaRoleSimulationService.

**Alternatives considered**: None — backend fidelity principle requires real backend endpoints.

## R2: Detail Page Tab Architecture

**Decision**: Use 8 tabs on the detail page (Details, Criteria, Entitlements, Constraints, Inheritances, Conflicts, Simulation, Events). Load tab data client-side via BFF proxy endpoints when tab is activated.

**Rationale**: Follows the pattern established in Phase 017 (governance roles) which uses 5 tabs with client-side loading per tab. This avoids loading all data server-side on initial page load, improving performance. The detail page server load only fetches the meta-role with details (which includes criteria, entitlements, constraints, and stats).

**Alternatives considered**:
- Server-side load all data: Rejected — too many API calls on initial load, most tabs may never be visited.
- Separate pages per section: Rejected — tabs provide better UX and are the established pattern.

## R3: Criteria Value Input

**Decision**: Use a dynamic input that adapts based on the selected operator. For `in`/`not_in` operators, show a textarea accepting JSON array or comma-separated values. For scalar operators (`eq`, `neq`, `gt`, etc.), show a text input. For `contains`/`starts_with`, show a text input.

**Rationale**: Criteria values are stored as JSON and their format depends on the operator. List operators need array input, while comparison operators need scalar input. A dynamic form is the simplest approach that handles all cases.

**Alternatives considered**:
- Always use JSON input: Rejected — poor UX for simple scalar values.
- Specialized inputs per field type: Rejected — over-engineered; the backend accepts flexible JSON values.

## R4: Constraint Value Input

**Decision**: Use constraint-type-specific form fields. For `require_mfa`, show a boolean toggle. For `max_session_duration`, show an hours input. For `ip_whitelist`, show a textarea for CIDR entries. For `approval_required`, show a select for approval type.

**Rationale**: Each constraint type has a defined JSON structure. Type-specific inputs provide better UX than raw JSON editing while ensuring valid constraint values.

**Alternatives considered**:
- Raw JSON editor for all constraints: Rejected — error-prone and poor UX.
- Single generic form: Rejected — constraint types have different value structures.

## R5: Simulation UI

**Decision**: Use a form-based simulation interface on a dedicated tab. The admin selects a simulation type from a dropdown, then fills in the relevant fields (which change based on type). Results display in a summary card + collapsible lists for affected roles and conflicts.

**Rationale**: The simulation API accepts different payloads based on `simulation_type`. A dynamic form that adapts to the selected type is the most straightforward approach.

**Alternatives considered**:
- Pre-built simulation scenarios: Rejected — too restrictive, admins need full control.
- Separate simulation page: Rejected — simulation is contextual to a specific meta-role.

## R6: Cascade Progress Tracking

**Decision**: Use polling-based progress tracking. After triggering a cascade (POST returns 202), poll the cascade status endpoint every 2 seconds until completion. Show a progress bar with counts.

**Rationale**: The backend returns 202 Accepted for async cascade operations. WebSocket is out of scope per the spec. Polling at 2-second intervals balances responsiveness with server load.

**Alternatives considered**:
- One-shot request with no progress: Rejected — cascade may take time, users need feedback.
- WebSocket: Rejected — explicitly out of scope.

## R7: Conflict Resolution UI

**Decision**: Use a dialog/inline form for conflict resolution. Show the two conflicting meta-roles side by side with their priorities. Offer 3 resolution buttons: "Resolve by Priority" (auto), "Resolve Manually" (shows meta-role picker), "Ignore" (shows optional comment field).

**Rationale**: Conflict resolution requires context (which meta-roles conflict and why) and a choice between 3 strategies. An inline expandable panel per conflict row is simpler than a full dialog.

**Alternatives considered**:
- Separate conflict resolution page: Rejected — conflicts are contextual, better handled inline.
- Batch resolution: Rejected — each conflict may need different resolution strategy.

## R8: Pagination Format

**Decision**: Standard `{items, total, limit, offset}` format for all paginated responses. Use existing DataTable pagination component.

**Rationale**: Confirmed by backend code — meta-role list, inheritances list, conflicts list, and events list all use this format, consistent with governance roles (Phase 017).

**Alternatives considered**: None — this is the established pattern.

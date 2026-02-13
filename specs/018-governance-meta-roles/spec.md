# Feature Specification: Governance Meta-Roles (Business Roles)

**Feature Branch**: `018-governance-meta-roles`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Meta-Roles / Business Roles (Phase 018)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Meta-Role CRUD and Lifecycle (Priority: P1)

An administrator needs to create, view, edit, and delete meta-roles that define business-level role policies. Meta-roles allow the admin to group governance policies (entitlements, constraints) that automatically apply to technical roles matching specified criteria. The admin can enable or disable meta-roles to control when policies take effect.

**Why this priority**: Core CRUD is the foundation — without the ability to create and manage meta-roles, no other features (criteria, entitlements, conflicts) can function. This is the minimum viable product.

**Independent Test**: Can be fully tested by creating a meta-role with name, description, priority, and criteria logic, viewing it in the list, editing its details, toggling enable/disable, and deleting it.

**Acceptance Scenarios**:

1. **Given** the admin is on the meta-roles list page, **When** they click "Create Meta-Role" and fill in name, description, priority (1-1000), and criteria logic (AND/OR), **Then** the meta-role is created and appears in the list with "Active" status.
2. **Given** a meta-role exists, **When** the admin views the list, **Then** they see the meta-role with name, priority, status badge, criteria logic, and creation date.
3. **Given** a meta-role exists, **When** the admin opens its detail page and edits name, description, or priority, **Then** the changes are saved and reflected immediately.
4. **Given** an active meta-role exists, **When** the admin clicks "Disable", **Then** the status changes to "Disabled" and all active inheritances become suspended.
5. **Given** a disabled meta-role exists, **When** the admin clicks "Enable", **Then** the status changes to "Active" and suspended inheritances are re-evaluated.
6. **Given** a meta-role exists with no active inheritances, **When** the admin clicks "Delete" and confirms, **Then** the meta-role is removed permanently.
7. **Given** the admin is on the list page, **When** they filter by status (Active/Disabled) or search by name, **Then** the list updates to show only matching meta-roles.

---

### User Story 2 - Dynamic Criteria Management (Priority: P2)

An administrator needs to define matching criteria that determine which technical roles inherit from a meta-role. Criteria are rules like "risk_level equals high" or "application_id in [list]" that the system evaluates to automatically assign inheritance. The admin chooses AND/OR logic to combine multiple criteria.

**Why this priority**: Criteria are the core mechanism that makes meta-roles "dynamic" — they define which roles are affected. Without criteria, meta-roles cannot match any roles.

**Independent Test**: Can be tested by adding criteria to an existing meta-role, verifying they display correctly, and removing them. Verifiable independently once US1 is complete.

**Acceptance Scenarios**:

1. **Given** the admin is on the Criteria tab of a meta-role detail page, **When** they click "Add Criterion" and select a field (e.g., risk_level), operator (e.g., eq), and enter a value, **Then** the criterion is added and displayed in the criteria list.
2. **Given** multiple criteria exist on a meta-role, **When** the admin views the Criteria tab, **Then** they see all criteria with field, operator, and value displayed in a readable format.
3. **Given** a criterion exists, **When** the admin clicks the remove button on it and confirms, **Then** the criterion is deleted.
4. **Given** the admin selects operator "in" or "not_in", **When** they enter the value, **Then** the system accepts a list of values (presented as a comma-separated input or JSON array).
5. **Given** the admin selects the "contains" or "starts_with" operator, **When** they enter a string value, **Then** the criterion is saved with the string match rule.

---

### User Story 3 - Entitlement and Constraint Mapping (Priority: P3)

An administrator needs to map entitlements (with grant or deny permissions) and policy constraints (MFA, session limits, IP whitelists) to meta-roles. These mappings define what policies are automatically applied to roles matching the meta-role's criteria.

**Why this priority**: Entitlements and constraints are the "payload" of a meta-role — they define what happens when a role matches. Essential for the meta-role to have practical effect.

**Independent Test**: Can be tested by adding entitlements and constraints to a meta-role, viewing them, and removing them. Verifiable once US1 is complete.

**Acceptance Scenarios**:

1. **Given** the admin is on the Entitlements tab, **When** they click "Add Entitlement", select an entitlement from a dropdown, choose permission type (Grant/Deny), and submit, **Then** the entitlement mapping is created and displayed with enriched details (name, application, risk level).
2. **Given** an entitlement mapping exists, **When** the admin clicks remove and confirms, **Then** the mapping is deleted.
3. **Given** the admin is on the Constraints tab, **When** they click "Add Constraint", select a constraint type (e.g., require_mfa), and provide the value, **Then** the constraint is added.
4. **Given** a constraint of a specific type already exists, **When** the admin tries to add the same constraint type again, **Then** the system shows an error indicating the type is already configured.
5. **Given** constraints exist, **When** the admin views the Constraints tab, **Then** each constraint shows its type with a human-readable label and the configured value.

---

### User Story 4 - Inheritance Tracking and Re-evaluation (Priority: P4)

An administrator needs to see which technical roles currently inherit from a meta-role, understand why they matched (match reason), and manually trigger re-evaluation when needed. This provides visibility into the automatic inheritance mechanism.

**Why this priority**: Visibility into active inheritances is critical for auditing and troubleshooting. Admins need to verify meta-roles are applying correctly.

**Independent Test**: Can be tested by viewing the Inheritances tab on a meta-role that has active matches, filtering by status, and triggering re-evaluation. Requires at least one meta-role with criteria that match existing roles.

**Acceptance Scenarios**:

1. **Given** a meta-role has active inheritances, **When** the admin opens the Inheritances tab, **Then** they see a paginated list of inheriting roles with role name, application, match status, match reason, and matched date.
2. **Given** the inheritance list has mixed statuses, **When** the admin filters by status (Active/Suspended/Removed), **Then** only matching inheritances are shown.
3. **Given** the admin clicks "Re-evaluate", **When** the system completes evaluation, **Then** a summary is shown with counts of new, updated, and removed inheritances.

---

### User Story 5 - Conflict Detection and Resolution (Priority: P5)

When multiple meta-roles apply conflicting policies to the same role (e.g., one grants and another denies the same entitlement), the system detects these conflicts. An administrator needs to view, understand, and resolve these conflicts through priority-based resolution, manual choice, or acknowledgment.

**Why this priority**: Conflict resolution ensures governance integrity — without it, conflicting meta-roles could create ambiguous or contradictory access policies.

**Independent Test**: Can be tested by viewing the Conflicts tab (or global conflicts page), filtering conflicts, and resolving them with different strategies. Requires at least two meta-roles with overlapping scope.

**Acceptance Scenarios**:

1. **Given** conflicts exist between meta-roles, **When** the admin opens the Conflicts tab, **Then** they see a list of conflicts showing the two meta-roles involved, affected role, conflict type (entitlement/constraint/policy), and resolution status.
2. **Given** an unresolved conflict exists, **When** the admin selects "Resolve by Priority", **Then** the system automatically resolves it favoring the higher-priority meta-role and the status updates to "Resolved (Priority)".
3. **Given** an unresolved conflict exists, **When** the admin selects "Resolve Manually" and picks the winning meta-role, **Then** the conflict is marked as "Resolved (Manual)" with the chosen winner recorded.
4. **Given** an unresolved conflict exists, **When** the admin selects "Ignore" and optionally provides a comment, **Then** the conflict is marked as "Ignored" with the justification recorded.
5. **Given** the admin views conflicts, **When** they filter by conflict type, resolution status, or affected role, **Then** only matching conflicts are displayed.

---

### User Story 6 - Simulation and Cascade (Priority: P6)

Before making changes, an administrator needs to preview the impact of meta-role modifications through simulation. After confirming changes, they can trigger cascade propagation to apply inheritance changes across all affected roles. The admin can also perform dry-run cascades.

**Why this priority**: Simulation prevents costly mistakes by showing impact before changes take effect. Cascade enables bulk application of changes. These are power-user features that enhance safety.

**Independent Test**: Can be tested by running a simulation for a proposed change (e.g., adding criteria) and reviewing the predicted impact. Cascade can be tested by triggering it and monitoring progress.

**Acceptance Scenarios**:

1. **Given** the admin is on the Simulation tab, **When** they select a simulation type (e.g., "criteria_change") and configure the proposed changes, **Then** the system shows a preview with roles to gain/lose inheritance, potential conflicts, and a safety summary.
2. **Given** a simulation result shows warnings, **When** the admin reviews the summary, **Then** they see the total affected roles count, new/resolved conflicts, and whether the change is marked as "safe".
3. **Given** the admin clicks "Cascade", **When** they confirm (or select dry-run), **Then** the system starts the asynchronous propagation and shows progress (processed/remaining/success/failure counts).
4. **Given** a cascade is in progress, **When** the admin views the cascade status, **Then** they see real-time progress with counts and any failure details.

---

### User Story 7 - Audit Events and Statistics (Priority: P7)

An administrator needs to review the audit trail of all actions taken on a meta-role, including creation, modifications, inheritance changes, and conflict resolutions. Event statistics provide a high-level overview of meta-role activity.

**Why this priority**: Audit trail is essential for compliance and governance — administrators need to track who did what and when. Lower priority because the feature functions without it.

**Independent Test**: Can be tested by viewing the Events tab on a meta-role, filtering by event type and date range, and reviewing event statistics.

**Acceptance Scenarios**:

1. **Given** a meta-role has events logged, **When** the admin opens the Events tab, **Then** they see a chronological list of events with type, actor, timestamp, and change details.
2. **Given** events exist, **When** the admin filters by event type (e.g., "inheritance_applied") or date range, **Then** only matching events are displayed.
3. **Given** the admin views event statistics, **When** the summary loads, **Then** they see aggregated counts by event type (created, updated, inheritance changes, conflicts, cascades).

---

### Edge Cases

- What happens when a meta-role's criteria match zero roles? The system displays an empty inheritances list with a helpful message.
- What happens when the admin tries to delete a meta-role that has active inheritances? The system warns the admin and requires confirmation.
- What happens when two meta-roles have identical priority and conflict? The system detects it as a conflict requiring manual resolution.
- What happens when criteria use the "in" operator with an empty list? The system rejects this as invalid input.
- What happens when the admin adds a criterion with an invalid operator for the selected field type? The system shows a validation error.
- What happens when a cascade operation partially fails (some roles succeed, others fail)? The system shows partial success with failure details.
- What happens when the admin navigates to a meta-role that was deleted by another admin? The system shows a "not found" error page.
- What happens when an entitlement referenced by a meta-role is deleted from the governance system? The inheritance reflects the change on next re-evaluation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to create meta-roles with a name (1-255 characters), optional description (up to 2000 characters), priority (1-1000), and criteria logic (AND or OR).
- **FR-002**: System MUST display meta-roles in a paginated list with filtering by status (Active/Disabled) and name search.
- **FR-003**: System MUST allow administrators to edit meta-role name, description, priority, and criteria logic.
- **FR-004**: System MUST allow administrators to enable and disable meta-roles, with appropriate status transitions.
- **FR-005**: System MUST allow administrators to delete meta-roles with confirmation.
- **FR-006**: System MUST allow administrators to add matching criteria with a field, operator, and value. Supported fields include risk_level, application_id, owner_id, status, name, is_delegable, and metadata.
- **FR-007**: System MUST support 10 criteria operators: equals, not equals, in list, not in list, greater than, greater than or equal, less than, less than or equal, contains, and starts with.
- **FR-008**: System MUST allow administrators to remove individual criteria from a meta-role.
- **FR-009**: System MUST allow administrators to add entitlement mappings with grant or deny permission types to a meta-role.
- **FR-010**: System MUST prevent duplicate entitlement mappings on the same meta-role.
- **FR-011**: System MUST allow administrators to remove entitlement mappings from a meta-role.
- **FR-012**: System MUST display entitlement mappings with enriched details including entitlement name, application name, and risk level.
- **FR-013**: System MUST allow administrators to add policy constraints (session duration, MFA requirement, IP whitelist, approval requirement) to a meta-role.
- **FR-014**: System MUST prevent duplicate constraint types on the same meta-role.
- **FR-015**: System MUST allow administrators to remove constraints from a meta-role.
- **FR-016**: System MUST display active inheritance relationships showing inheriting role name, application, match status, match reason, and matched date.
- **FR-017**: System MUST support filtering inheritances by status (Active/Suspended/Removed).
- **FR-018**: System MUST allow administrators to manually trigger re-evaluation of a meta-role's criteria against all roles.
- **FR-019**: System MUST detect and display conflicts between meta-roles, categorized as entitlement, constraint, or policy conflicts.
- **FR-020**: System MUST allow conflict resolution via priority-based auto-resolution, manual winner selection, or acknowledgment (ignore).
- **FR-021**: System MUST allow administrators to simulate meta-role changes and preview the impact before applying.
- **FR-022**: System MUST allow administrators to trigger cascade propagation of inheritance changes, including dry-run mode.
- **FR-023**: System MUST display cascade progress with processed, remaining, success, and failure counts.
- **FR-024**: System MUST display an audit trail of meta-role events with filtering by event type, actor, and date range.
- **FR-025**: System MUST display aggregated event statistics by event type.
- **FR-026**: System MUST restrict all meta-role management to administrators only.
- **FR-027**: System MUST display a stats summary on the meta-role detail page showing active inheritances, unresolved conflicts, criteria count, entitlements count, and constraints count.

### Key Entities

- **Meta-Role**: A business-level role definition with name, description, priority, status (active/disabled), and criteria logic (AND/OR). Represents a governance policy template that automatically applies to matching technical roles.
- **Criterion**: A matching rule attached to a meta-role, consisting of a field (e.g., risk_level), operator (e.g., equals), and value. Multiple criteria combine via AND/OR logic.
- **Entitlement Mapping**: Links an entitlement to a meta-role with a permission type (grant/deny). Defines what access is automatically applied to matching roles.
- **Constraint**: A policy constraint attached to a meta-role, consisting of a type (e.g., require_mfa) and a JSON value. Each type can only appear once per meta-role.
- **Inheritance**: A relationship between a meta-role and a technical role that matched its criteria. Has a status (active/suspended/removed) and a match reason explaining why the role qualified.
- **Conflict**: A detected contradiction between two meta-roles affecting the same role. Has a type (entitlement/constraint/policy) and a resolution status.
- **Event**: An audit record of an action taken on or by a meta-role, with type, actor, change details, and affected roles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a meta-role with criteria, entitlements, and constraints in under 5 minutes.
- **SC-002**: The meta-role list page loads and displays up to 50 items within 2 seconds.
- **SC-003**: Administrators can identify and resolve a conflict between two meta-roles in under 3 steps.
- **SC-004**: Simulation results display within 5 seconds of request, showing all affected roles and potential conflicts.
- **SC-005**: 100% of meta-role management operations are logged in the audit trail.
- **SC-006**: Administrators can filter and search meta-roles, inheritances, conflicts, and events to find specific items within 10 seconds.
- **SC-007**: The cascade progress indicator updates to reflect real-time operation status.
- **SC-008**: All meta-role pages render correctly in both light and dark themes.

## Assumptions

- The backend governance API is fully implemented and operational for all meta-role endpoints.
- Meta-roles operate within a single tenant context (tenant isolation enforced by backend).
- Only users with admin or super_admin roles can access meta-role management features.
- Priority values are integers from 1 to 1000, where lower numbers indicate higher priority for conflict resolution.
- Criteria values are stored as JSON and can represent strings, numbers, booleans, or arrays depending on the operator.
- Constraint values are JSON objects whose structure depends on the constraint type.
- Cascade operations are asynchronous and may take variable time depending on the number of affected roles.
- The existing governance entitlements list is available for populating the entitlement selector in entitlement mappings.
- The meta-role detail page uses a tabbed layout consistent with other governance detail pages in the application.

## Scope

### In Scope

- Meta-role CRUD with lifecycle (enable/disable/delete)
- Dynamic criteria management (add/remove with 10 operators)
- Entitlement mapping with grant/deny permission types
- Policy constraint management (4 constraint types)
- Inheritance tracking with status filtering
- Manual re-evaluation trigger
- Conflict detection display and resolution (3 strategies)
- Change simulation with impact preview
- Cascade propagation with progress tracking and dry-run
- Audit event trail with filtering and statistics
- Stats summary on detail page
- Admin-only access control
- Light and dark theme support

### Out of Scope

- Automatic scheduled re-evaluation (backend cron job, not UI-triggered)
- Meta-role import/export functionality
- Role-to-meta-role mapping from the role detail page (covered separately in role management)
- Custom criteria field definitions beyond the supported set
- Real-time WebSocket updates for cascade progress (polling-based)
- Meta-role templates or cloning
- Batch operations on multiple meta-roles simultaneously

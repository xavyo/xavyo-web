# Feature Specification: Lifecycle Configuration

**Feature Branch**: `032-lifecycle-config`
**Created**: 2026-02-12
**Status**: Draft
**Input**: Phase 032 — Governance feature enabling admins to define and manage lifecycle state machines for identity objects

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Lifecycle Config Management (Priority: P1)

An administrator needs to define lifecycle configurations that control how identity objects (users, roles, groups) progress through organizational states. The admin navigates to the Lifecycle section under Governance, sees a list of existing configurations filtered by object type and active status, and can create new configurations specifying the object type, name, description, and whether to auto-assign the initial state. From the list, admins can view, edit, or delete configurations.

**Why this priority**: Without lifecycle configurations, no other lifecycle features (states, transitions, conditions, actions) can function. This is the foundational CRUD that all other stories depend on.

**Independent Test**: Can be fully tested by creating a lifecycle config for "User" object type, verifying it appears in the list with correct details, editing its name, and deleting it.

**Acceptance Scenarios**:

1. **Given** no lifecycle configs exist, **When** admin navigates to the lifecycle hub, **Then** an empty state message is shown with a prompt to create the first configuration.
2. **Given** the admin is on the create page, **When** they fill in name "Employee Lifecycle", select object type "User", add a description, and submit, **Then** the config is created and appears in the list.
3. **Given** a lifecycle config exists, **When** admin clicks on it, **Then** the detail page shows the config properties, states, and transitions.
4. **Given** a lifecycle config detail page, **When** admin edits the name and description and saves, **Then** changes are persisted and reflected in the list.
5. **Given** a lifecycle config with no states or transitions, **When** admin deletes it, **Then** it is removed from the list.
6. **Given** multiple configs exist, **When** admin filters by object type "Role", **Then** only role lifecycle configs are shown.

---

### User Story 2 — State Management (Priority: P1)

Within a lifecycle configuration, an administrator defines the states that objects can be in. Each state has a name, optional description, position (display order), and flags for whether it is an initial state or terminal state. States also specify an entitlement action (grant, revoke, or no change) that determines what happens to entitlements when an object enters that state. Admins can add, edit, reorder, and remove states.

**Why this priority**: States are required building blocks — transitions, conditions, and actions all reference states. Without states defined, the lifecycle config is incomplete.

**Independent Test**: Can be tested by adding states (e.g., "Onboarding", "Active", "Suspended", "Terminated") to a lifecycle config, marking "Onboarding" as initial and "Terminated" as terminal, and verifying they display in the correct order.

**Acceptance Scenarios**:

1. **Given** a lifecycle config with no states, **When** admin adds a state named "Onboarding" marked as initial with entitlement action "grant" and position 1, **Then** the state appears in the States tab with an "Initial" badge.
2. **Given** a lifecycle config with an initial state, **When** admin adds a "Terminated" state marked as terminal with entitlement action "revoke", **Then** the state appears with a "Terminal" badge.
3. **Given** multiple states exist, **When** admin edits a state's name or entitlement action, **Then** changes are saved and reflected immediately.
4. **Given** a state exists that is not referenced by any transition, **When** admin deletes it, **Then** it is removed from the states list.

---

### User Story 3 — Transition Management (Priority: P1)

Administrators define transitions between states to control the allowed progression paths. Each transition has a name, source state, target state, optional approval requirement, and optional grace period (in hours). The transitions define the edges of the state machine graph. Admins can add and remove transitions.

**Why this priority**: Transitions complete the state machine definition — without them, objects cannot move between states. This is essential to a functioning lifecycle.

**Independent Test**: Can be tested by creating transitions (e.g., "Activate" from "Onboarding" to "Active", "Suspend" from "Active" to "Suspended") and verifying they appear in the Transitions tab with correct source/target state names.

**Acceptance Scenarios**:

1. **Given** a lifecycle config with states "Onboarding" and "Active", **When** admin creates a transition named "Activate" from "Onboarding" to "Active", **Then** the transition appears in the Transitions tab showing both state names.
2. **Given** the transition form, **When** admin enables "Requires Approval" and sets grace period to 24 hours, **Then** the transition is created with approval and grace period badges.
3. **Given** a transition exists, **When** admin deletes it, **Then** it is removed from the transitions list.
4. **Given** a lifecycle config with multiple states, **When** admin selects source and target states from dropdowns, **Then** only valid states from the current config are available.

---

### User Story 4 — Transition Conditions (Priority: P2)

Administrators can attach attribute-based conditions to transitions to control when a transition is allowed. Each condition specifies a condition type, an attribute path (e.g., "user.department"), and an expression to evaluate. Admins can view, update, and test-evaluate conditions against a provided context object to see if a transition would be allowed.

**Why this priority**: Conditions add intelligence to the state machine, enabling automated governance decisions. Not required for basic lifecycle operation but critical for real-world enforcement.

**Independent Test**: Can be tested by adding conditions to a transition (e.g., "user.department equals 'Engineering'"), then evaluating them with a test context to verify pass/fail results.

**Acceptance Scenarios**:

1. **Given** a transition exists, **When** admin navigates to its conditions, **Then** existing conditions are displayed (or empty state if none).
2. **Given** the conditions editor, **When** admin adds a condition with type "attribute_check", attribute path "user.department", and expression "equals 'Engineering'", **Then** the condition is saved and displayed.
3. **Given** conditions are configured, **When** admin clicks "Evaluate" and provides a test context `{"user": {"department": "Engineering"}}`, **Then** the evaluation result shows the transition is allowed.
4. **Given** conditions are configured, **When** admin evaluates with a non-matching context, **Then** the result shows the transition is not allowed with details on which condition failed.

---

### User Story 5 — State Actions (Priority: P2)

Administrators can configure automated actions that execute when an object enters or exits a state. Each action has a type (e.g., "send_notification", "trigger_provisioning", "update_attribute") and a parameters object. Entry actions fire when an object transitions into the state; exit actions fire when an object leaves the state.

**Why this priority**: Actions enable automation of governance processes triggered by state changes. Not required for basic lifecycle operation but essential for operational efficiency.

**Independent Test**: Can be tested by adding entry actions (e.g., "send_notification" with email parameters) and exit actions to a state, then verifying they display correctly in the Actions tab.

**Acceptance Scenarios**:

1. **Given** a state exists, **When** admin navigates to its actions configuration, **Then** entry and exit action lists are shown (or empty states).
2. **Given** the actions editor, **When** admin adds an entry action with type "send_notification" and parameters including a recipient, **Then** the action is saved and displayed under entry actions.
3. **Given** the actions editor, **When** admin adds an exit action with type "trigger_provisioning" and parameters, **Then** the action is saved and displayed under exit actions.
4. **Given** actions exist, **When** admin updates the actions list (reorder, add, remove), **Then** the changes are persisted.

---

### User Story 6 — User Lifecycle Status (Priority: P3)

From a user's profile or detail page, administrators and the users themselves can view the user's current lifecycle status — which lifecycle config governs them, what state they are currently in, and when they entered that state. This provides visibility into where a user is in their organizational lifecycle.

**Why this priority**: This is a read-only view that provides visibility. It depends on all other stories being implemented first and is lower priority as it's informational rather than operational.

**Independent Test**: Can be tested by navigating to a user's profile and checking for a lifecycle status section showing their current state and governing config.

**Acceptance Scenarios**:

1. **Given** a user is governed by a lifecycle config, **When** viewing their profile, **Then** a lifecycle status section shows the config name, current state name, and the date they entered that state.
2. **Given** a user is not yet assigned to any lifecycle config, **When** viewing their profile, **Then** the lifecycle status section shows "No lifecycle assigned" or is hidden.

---

### Edge Cases

- What happens when admin tries to delete a state that is referenced by existing transitions? The system should prevent deletion and show which transitions reference the state.
- What happens when admin tries to delete a lifecycle config that has states and transitions? The system should warn and require confirmation.
- What happens when two states are both marked as "initial"? The system should enforce that only one state per config can be initial.
- What happens when admin creates a transition from a terminal state? The system should prevent transitions originating from terminal states.
- What happens when admin deletes the only initial state? The system should warn that the config will have no entry point.
- How does the system handle concurrent edits to the same lifecycle config? Standard optimistic concurrency or last-write-wins.
- What happens when evaluating conditions with an invalid or empty context? The system should return a clear error message.
- What happens when admin tries to create a config with a duplicate name for the same object type? The system should display a validation error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to create lifecycle configurations specifying a name, object type, optional description, and auto-assign initial state preference.
- **FR-002**: System MUST allow administrators to list lifecycle configurations with filtering by object type and active status.
- **FR-003**: System MUST allow administrators to view a lifecycle configuration's full details including all states and transitions.
- **FR-004**: System MUST allow administrators to update a lifecycle configuration's name, description, active status, and auto-assign preference.
- **FR-005**: System MUST allow administrators to delete a lifecycle configuration.
- **FR-006**: System MUST allow administrators to add states to a lifecycle configuration with name, description, initial/terminal flags, entitlement action, and display position.
- **FR-007**: System MUST allow administrators to edit existing states within a lifecycle configuration.
- **FR-008**: System MUST allow administrators to remove states from a lifecycle configuration.
- **FR-009**: System MUST allow administrators to create transitions between states with a name, source state, target state, optional approval requirement, and optional grace period.
- **FR-010**: System MUST allow administrators to remove transitions from a lifecycle configuration.
- **FR-011**: System MUST allow administrators to view and update conditions attached to a transition.
- **FR-012**: System MUST allow administrators to evaluate transition conditions against a test context and display the results.
- **FR-013**: System MUST allow administrators to view and update entry/exit actions for a state.
- **FR-014**: System MUST display a user's current lifecycle status on their profile page, including the governing configuration name, current state, and entry timestamp.
- **FR-015**: System MUST restrict lifecycle configuration management to administrators only.
- **FR-016**: System MUST display states in their configured position order.
- **FR-017**: System MUST visually distinguish initial states, terminal states, and intermediate states with badges or icons.
- **FR-018**: System MUST show entitlement action type (grant/revoke/no change) for each state.
- **FR-019**: System MUST show approval requirement and grace period on transitions where configured.

### Key Entities

- **Lifecycle Configuration**: A named state machine definition governing a specific object type (user, role, or group). Has an active status and optional auto-assign behavior. Contains states and transitions.
- **Lifecycle State**: A named position within a lifecycle configuration. Can be initial (entry point), terminal (end point), or intermediate. Specifies an entitlement action (grant, revoke, no change) and a display position. Has optional entry and exit actions.
- **Lifecycle Transition**: A named directed edge from one state to another within a lifecycle configuration. May require approval and may have a grace period in hours. Can have conditions attached.
- **Transition Condition**: An attribute-based rule attached to a transition. Specifies a condition type, attribute path, and expression to evaluate against an object's context.
- **Lifecycle Action**: An automated action configured to run on state entry or exit. Has an action type and parameters. Examples include sending notifications, triggering provisioning, or updating attributes.
- **User Lifecycle Status**: A read-only view of which lifecycle configuration and state currently governs a specific user, including when they entered the current state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a complete lifecycle configuration (with states, transitions, conditions, and actions) in under 5 minutes.
- **SC-002**: Lifecycle configuration list loads and displays within 2 seconds, supporting filtering by object type and active status.
- **SC-003**: State machine visualization clearly shows all states and transitions, allowing admins to understand the full lifecycle at a glance.
- **SC-004**: Transition condition evaluation returns results within 3 seconds, clearly indicating pass/fail per condition.
- **SC-005**: 100% of lifecycle management operations (create, edit, delete configs/states/transitions) complete successfully with appropriate confirmation messages.
- **SC-006**: User lifecycle status is visible on user profiles within 1 second of page load.
- **SC-007**: All lifecycle features are accessible only to administrators; non-admin users see only their own lifecycle status.

## Assumptions

- The backend already implements all 16 lifecycle endpoints plus user lifecycle status.
- Only administrators (users with admin or super_admin role) can manage lifecycle configurations.
- Regular users can view their own lifecycle status but cannot modify any lifecycle configuration.
- Object types are limited to User, Role, and Group for the initial implementation (custom types may be supported later).
- Entitlement actions (grant/revoke/no_change) are declarative — the backend handles the actual entitlement operations.
- Transition conditions use a simple expression language evaluated by the backend.
- State actions are configured declaratively; the backend handles execution when transitions occur.
- Grace period is specified in hours (whole numbers).
- Each lifecycle config can have at most one initial state.
- Deleting a config, state, or transition is a hard delete (not soft delete).
- The standard pagination pattern ({items, total, limit, offset}) is used for list endpoints.

## Scope

### In Scope

- Full CRUD for lifecycle configurations, states, and transitions
- Transition condition management and evaluation
- State entry/exit action configuration
- User lifecycle status display on user profiles
- Admin-only access control
- Filtering and pagination on list views
- Visual state/transition display on config detail page

### Out of Scope

- Automated lifecycle state transitions (triggering transitions programmatically)
- Lifecycle assignment to specific users (assigning a user to a config)
- Lifecycle history/audit trail (viewing past state transitions for an object)
- Custom object type creation (using only built-in User/Role/Group types)
- Drag-and-drop state machine designer (using form-based editing instead)
- Bulk operations on lifecycle configurations

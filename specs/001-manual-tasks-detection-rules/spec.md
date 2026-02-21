# Feature Specification: Manual Provisioning Tasks & Detection Rules

**Feature Branch**: `001-manual-tasks-detection-rules`
**Created**: 2026-02-13
**Status**: Draft
**Input**: Phase 041 — Admin UI for managing manual provisioning work items, configuring semi-manual applications, and administering orphan account detection rules.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual Task Dashboard & List (Priority: P1)

An IT operations administrator opens the Manual Tasks page and immediately sees a dashboard with key metrics: how many tasks are pending, how many are in progress, how many have breached their SLA deadline, how many were completed today, and the average completion time. Below the dashboard, a filterable list shows all manual provisioning tasks. The administrator can filter by task status (pending, in progress, completed, rejected, cancelled), by target application, by the user the provisioning is for, by whether the SLA has been breached, and by the assigned operator. The list shows task operation type (grant, revoke, modify), the target application name, the affected user, the entitlement being provisioned, the current assignee, the SLA deadline, and SLA breach status.

**Why this priority**: The dashboard and list are the entry point for all manual task management. Without visibility into the task queue and SLA health, operators cannot prioritize their work effectively.

**Independent Test**: Can be fully tested by navigating to the Manual Tasks page and verifying dashboard metrics display and the task list renders with proper filtering. Delivers immediate operational visibility even without task lifecycle actions.

**Acceptance Scenarios**:

1. **Given** manual tasks exist in various states, **When** the admin opens the Manual Tasks page, **Then** dashboard cards show accurate counts for pending, in-progress, SLA-at-risk, SLA-breached, completed-today, and average completion time.
2. **Given** the task list is displayed, **When** the admin selects a status filter (e.g., "pending"), **Then** only tasks with that status appear in the list.
3. **Given** the task list is displayed, **When** the admin filters by "SLA breached", **Then** only tasks where the SLA deadline has passed and the task is not yet completed appear.
4. **Given** no manual tasks exist, **When** the admin opens the page, **Then** dashboard metrics show zeros and an empty state message appears in the task list.

---

### User Story 2 - Manual Task Lifecycle (Priority: P1)

An IT operator views a manual task detail page showing full information about the provisioning request: which user needs provisioning, in which application, what entitlement to grant/revoke/modify, the SLA deadline, and any existing notes. The operator can:
- **Claim** an unassigned task (assigns it to themselves)
- **Start** a claimed task (moves it from pending to in-progress, signaling they are actively working on it)
- **Confirm** completion (optionally adding notes about what was done)
- **Reject** the task (providing a mandatory reason explaining why it cannot be fulfilled, between 5 and 1000 characters)
- **Cancel** a pending task that is no longer needed

Each action button is only visible when appropriate for the current task status and assignment.

**Why this priority**: Task lifecycle actions are the core workflow — operators need to claim, process, and close tasks to fulfill provisioning requests.

**Independent Test**: Can be fully tested by navigating to a task detail page and performing each lifecycle action, verifying the task transitions to the correct status and appropriate actions become available or hidden.

**Acceptance Scenarios**:

1. **Given** an unassigned pending task, **When** the operator clicks "Claim", **Then** the task is assigned to the current user and shows their name as assignee.
2. **Given** a claimed pending task assigned to the operator, **When** they click "Start", **Then** the task status changes to "in_progress".
3. **Given** an in-progress task, **When** the operator clicks "Confirm" and optionally enters notes, **Then** the task status changes to "completed" and the completion timestamp is recorded.
4. **Given** an in-progress task, **When** the operator clicks "Reject" and enters a reason (5-1000 characters), **Then** the task status changes to "rejected" with the reason recorded.
5. **Given** a pending task, **When** the admin clicks "Cancel", **Then** the task status changes to "cancelled".
6. **Given** a completed task, **When** the operator views it, **Then** no lifecycle action buttons are displayed (terminal state).
7. **Given** a task assigned to a different operator, **When** the current user views it, **Then** the "Start" and "Confirm" buttons are not available (only the assignee or admin can act).

---

### User Story 3 - Semi-Manual Application Configuration (Priority: P2)

An administrator navigates to the Semi-Manual Configuration page to manage which applications require manual provisioning steps. The page shows a list of applications that have been configured as semi-manual, with their ticketing integration status and SLA policy. The admin can:
- Configure an application as semi-manual by enabling the toggle and optionally linking a ticketing configuration (e.g., ServiceNow, Jira) and an SLA policy
- Set whether the application requires approval before a ticket is created
- Remove the semi-manual configuration from an application (returning it to fully automated provisioning)

**Why this priority**: Semi-manual configuration determines which applications generate manual tasks. It is a prerequisite for the manual task workflow to have practical value.

**Independent Test**: Can be tested by navigating to the Semi-Manual page, configuring an application as semi-manual with ticketing and SLA links, verifying the configuration persists, and then removing it.

**Acceptance Scenarios**:

1. **Given** no semi-manual applications are configured, **When** the admin opens the page, **Then** an empty state message is shown with guidance on how to configure an application.
2. **Given** the admin selects an application, **When** they enable semi-manual mode and optionally link a ticketing config and SLA policy, **Then** the application appears in the semi-manual list with the correct configuration.
3. **Given** a semi-manual application exists, **When** the admin toggles "requires approval before ticket", **Then** the setting is saved and reflected in the configuration.
4. **Given** a semi-manual application exists, **When** the admin removes the configuration, **Then** the application is removed from the semi-manual list.

---

### User Story 4 - Detection Rule Management (Priority: P2)

A governance administrator manages orphan account detection rules. The Detection Rules page shows a list of all rules with their type, enabled status, and priority. The admin can:
- Create a new detection rule by specifying a name, type (No Manager, Terminated, Inactive, Custom), priority, and type-specific parameters
- Edit an existing rule's name, priority, parameters, and description
- Enable or disable a rule without deleting it
- Delete a rule permanently

Detection rule types have different parameter configurations:
- **No Manager**: Detects accounts with no manager assigned (no parameters needed)
- **Terminated**: Detects accounts belonging to terminated employees (no parameters needed)
- **Inactive**: Detects accounts inactive beyond a configurable threshold (parameter: days_threshold, default 90)
- **Custom**: Detects accounts based on a custom expression (parameter: expression string)

**Why this priority**: Detection rules power the orphan account identification system. Configuring which conditions flag an account as orphaned is essential for governance compliance.

**Independent Test**: Can be tested by creating a detection rule of each type, editing parameters, toggling enabled/disabled, and deleting a rule, all from the Detection Rules page.

**Acceptance Scenarios**:

1. **Given** the Detection Rules page, **When** the admin clicks "Create Rule", **Then** a form appears with fields for name, type selector, priority, description, and type-specific parameters.
2. **Given** the admin selects "Inactive" type, **When** the form renders, **Then** a "days threshold" field appears with default value 90.
3. **Given** the admin selects "Custom" type, **When** the form renders, **Then** an "expression" text field appears.
4. **Given** an existing enabled rule, **When** the admin clicks "Disable", **Then** the rule's status changes to disabled and it appears dimmed in the list.
5. **Given** an existing rule, **When** the admin clicks "Delete" and confirms, **Then** the rule is permanently removed from the list.
6. **Given** detection rules exist, **When** the admin filters by type (e.g., "Inactive"), **Then** only rules of that type are shown.

---

### User Story 5 - Detection Rule Defaults (Priority: P3)

An administrator who is setting up detection rules for the first time can seed system default rules with a single action. The "Seed Defaults" button creates a standard set of detection rules (No Manager, Terminated, Inactive with 90-day threshold) that represent industry best practices. After seeding, the admin can customize the priority ordering and parameters of each default rule.

**Why this priority**: Seeding defaults is a convenience feature that accelerates initial setup. It adds value but is not required for core rule management functionality.

**Independent Test**: Can be tested by clicking the "Seed Defaults" button on an empty detection rules list and verifying the standard rules appear with correct default parameters.

**Acceptance Scenarios**:

1. **Given** no detection rules exist, **When** the admin clicks "Seed Defaults", **Then** system default rules are created (at minimum: No Manager, Terminated, Inactive with 90-day threshold).
2. **Given** default rules have been seeded, **When** the admin edits the Inactive rule's threshold to 60 days, **Then** the updated parameter is saved.
3. **Given** default rules already exist, **When** the admin clicks "Seed Defaults" again, **Then** the system handles it gracefully (either skipping duplicates or showing an informational message).

---

### Edge Cases

- What happens when an operator tries to claim a task that was just claimed by another operator? The system displays an error message indicating the task is already assigned.
- What happens when an operator tries to confirm a task that was cancelled while they were viewing it? The system displays an error indicating the task is no longer in a valid state for that action.
- What happens when the SLA deadline passes while the operator is viewing the task detail? The SLA indicator updates to show "breached" status on the next page load or action.
- What happens when the admin tries to delete a detection rule that is currently being used in an active detection scan? The system allows deletion (rules are configuration, not active processes).
- What happens when the admin creates a detection rule with the same name as an existing one? The system displays a validation error indicating the name must be unique.
- What happens when the admin enters an invalid custom expression for a Custom detection rule? The system accepts the expression (backend validates during actual detection execution, not at rule creation time).
- What happens when the admin removes semi-manual config from an application that has pending manual tasks? Existing tasks remain in their current state; only future provisioning requests are affected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a manual task dashboard with real-time counts for pending tasks, in-progress tasks, SLA-at-risk tasks, SLA-breached tasks, tasks completed today, and average completion time.
- **FR-002**: System MUST display a filterable list of manual tasks with filters for status (multi-select), application, user, SLA breach status, and assignee.
- **FR-003**: System MUST display manual task detail including operation type, target application, affected user, entitlement, assignee, SLA deadline, SLA breach status, retry count, and notes.
- **FR-004**: System MUST allow operators to claim unassigned tasks, assigning the task to themselves.
- **FR-005**: System MUST allow assigned operators to start a pending task, transitioning it to in-progress.
- **FR-006**: System MUST allow operators to confirm task completion with optional notes.
- **FR-007**: System MUST allow operators to reject a task with a mandatory reason between 5 and 1000 characters.
- **FR-008**: System MUST allow cancellation of pending tasks.
- **FR-009**: System MUST show lifecycle action buttons only when they are valid for the current task status and the current user's relationship to the task.
- **FR-010**: System MUST display a list of semi-manual application configurations with their ticketing and SLA linkages.
- **FR-011**: System MUST allow administrators to configure an application as semi-manual, optionally linking a ticketing configuration and SLA policy.
- **FR-012**: System MUST allow administrators to set whether an application requires approval before ticket creation.
- **FR-013**: System MUST allow administrators to remove semi-manual configuration from an application.
- **FR-014**: System MUST display a list of detection rules with their type, enabled status, priority, and description.
- **FR-015**: System MUST allow administrators to create detection rules with name, type, priority, description, and type-specific parameters.
- **FR-016**: System MUST render type-specific parameter fields based on the selected detection rule type (days threshold for Inactive, expression for Custom, no parameters for No Manager/Terminated).
- **FR-017**: System MUST allow administrators to edit detection rule name, priority, parameters, and description.
- **FR-018**: System MUST allow administrators to enable or disable detection rules.
- **FR-019**: System MUST allow administrators to delete detection rules with confirmation.
- **FR-020**: System MUST allow administrators to seed system default detection rules.
- **FR-021**: System MUST enforce unique detection rule names within the tenant.
- **FR-022**: System MUST restrict manual task management, semi-manual configuration, and detection rule administration to users with administrator roles.
- **FR-023**: System MUST visually indicate SLA status on tasks (normal, at-risk, breached) using color-coded indicators.

### Key Entities

- **Manual Task**: A provisioning work item assigned to an IT operator. Contains the target application, affected user, entitlement to provision, operation type (grant/revoke/modify), status, assignee, SLA deadline, and completion notes. Follows a lifecycle: pending > in_progress > completed/rejected/cancelled.
- **Manual Task Dashboard**: Aggregated metrics providing operational visibility into the manual task queue health and SLA compliance.
- **Semi-Manual Application**: A configuration record marking an application as requiring manual provisioning steps, with optional links to a ticketing system configuration and SLA policy.
- **Detection Rule**: A governance rule that defines conditions for identifying orphan or problematic accounts. Has a type (No Manager, Terminated, Inactive, Custom), priority for ordering, and type-specific parameters stored as structured data.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can view the manual task dashboard and all metrics load within 2 seconds of page navigation.
- **SC-002**: Operators can complete the full task lifecycle (claim > start > confirm) in under 30 seconds per task.
- **SC-003**: The task list supports filtering by all 5 filter dimensions and returns results within 1 second.
- **SC-004**: Administrators can configure an application as semi-manual in under 1 minute, including ticketing and SLA linkage.
- **SC-005**: Administrators can create a detection rule with type-specific parameters in under 1 minute.
- **SC-006**: The "Seed Defaults" action creates all standard detection rules in a single click.
- **SC-007**: All administrative actions require appropriate role authorization; unauthorized users see no access to these features.
- **SC-008**: SLA breach indicators are visually distinct and immediately recognizable (color-coded badges).
- **SC-009**: All pages include proper empty states with guidance when no data exists.
- **SC-010**: 100% of acceptance scenarios pass end-to-end testing.

## Assumptions

- Manual tasks are created automatically by the backend when role constructions target semi-manual applications. The frontend does not need a "create manual task" form.
- The existing ticketing configurations (from Phase 037 Governance Operations) are available for linking when configuring semi-manual applications.
- The existing SLA policies (from Phase 037) are available for linking when configuring semi-manual applications.
- Detection rule custom expressions are validated by the backend during detection execution, not at rule creation time. The frontend accepts any string expression.
- The backend enforces unique detection rule names per tenant. The frontend shows the backend's error message on duplicate name conflicts.
- Task status transitions are enforced by the backend. The frontend shows appropriate action buttons based on current status but relies on the backend for transition validation.
- The "SLA at risk" metric is calculated by the backend based on proximity to the SLA deadline. The frontend displays the pre-calculated value.

## Scope Boundaries

**In Scope**:
- Manual task dashboard with 6 metric cards
- Manual task list with 5 filter dimensions
- Manual task detail with lifecycle actions (claim, start, confirm, reject, cancel)
- Semi-manual application configuration (list, configure, remove)
- Detection rule CRUD (create, read, update, delete, enable, disable)
- Detection rule default seeding
- Sidebar navigation entries for Manual Tasks and Detection Rules

**Out of Scope**:
- Creating manual tasks directly from the UI (tasks are auto-generated by the provisioning engine)
- Real-time push notifications for new tasks or SLA breaches (standard page refresh model)
- Bulk task operations (claim/confirm multiple tasks at once)
- Detection rule execution or viewing detection scan results (handled by existing orphan detection features)
- Ticketing system configuration (handled by Phase 037 Governance Operations)
- SLA policy configuration (handled by Phase 037 Governance Operations)

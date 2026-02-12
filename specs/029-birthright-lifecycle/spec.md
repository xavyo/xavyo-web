# Feature Specification: Birthright Policies & Lifecycle Workflows

**Feature Branch**: `029-birthright-lifecycle`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Governance automation for Joiner-Mover-Leaver (JML) identity lifecycle management with birthright entitlement policies"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Birthright Policy CRUD (Priority: P1)

An admin navigates to the Birthright & JML hub page and sees a list of all birthright policies with their name, status (active/inactive/archived), priority, evaluation mode, number of conditions, number of entitlements, and grace period. The admin can filter by status and paginate through results.

The admin clicks "Create Policy" to open a form where they define: a policy name, optional description, priority number, evaluation mode (first_match or all_match), grace period in days (0-365), one or more conditions (each with an attribute path, operator, and value), and one or more entitlement selections. On submit, the policy is created in "active" status.

From the policy list, the admin can click a policy to view its detail page showing full information, conditions, and linked entitlements. From the detail page the admin can edit the policy, archive it (soft delete), enable a disabled policy, or disable an active policy.

**Why this priority**: Core CRUD is the foundation — without policies, no lifecycle automation can occur. This is the minimum viable product for the entire feature.

**Independent Test**: Navigate to /governance/birthright → see policy list → create a policy with conditions and entitlements → view detail → edit → disable → enable → archive.

**Acceptance Scenarios**:

1. **Given** no policies exist, **When** admin visits the policies tab, **Then** an empty state with "Create Policy" CTA is shown.
2. **Given** admin fills in valid policy form, **When** they submit, **Then** the policy appears in the list with "active" status.
3. **Given** an active policy, **When** admin clicks "Disable", **Then** the policy status changes to "inactive" and a success toast appears.
4. **Given** an inactive policy, **When** admin clicks "Enable", **Then** the policy status changes to "active".
5. **Given** an active or inactive policy, **When** admin clicks "Archive", **Then** the policy status changes to "archived" and it appears only when filtering by archived status.
6. **Given** a policy, **When** admin edits its name, conditions, or entitlements, **Then** the updated values are persisted and displayed.

---

### User Story 2 - Condition Builder (Priority: P1)

When creating or editing a policy, the admin uses an interactive condition builder to define matching rules. Each condition has three parts: an attribute path (e.g., "department", "location", "metadata.cost_center", "custom_attributes.employee_type"), an operator (equals, not_equals, in, not_in, starts_with, contains), and a value.

For "in" and "not_in" operators, the value field accepts multiple comma-separated values. For other operators, a single text input is shown.

The admin can add multiple conditions (AND logic — all must match). They can remove individual conditions. At least one condition is required.

**Why this priority**: The condition builder is integral to policy creation — without it, policies cannot define who they apply to. Coupled tightly with US1.

**Independent Test**: Open policy create form → add condition (department equals Engineering) → add second condition (location in US,UK) → remove first condition → submit successfully.

**Acceptance Scenarios**:

1. **Given** the policy form, **When** admin clicks "Add Condition", **Then** a new condition row appears with attribute, operator, and value fields.
2. **Given** a condition with operator "in", **When** admin types "US,UK,DE", **Then** the value is accepted as a multi-value input.
3. **Given** multiple conditions, **When** admin clicks remove on one, **Then** that condition is removed and remaining conditions stay intact.
4. **Given** no conditions added, **When** admin tries to submit, **Then** a validation error "At least one condition is required" is shown.

---

### User Story 3 - Policy Simulation (Priority: P1)

From a policy's detail page, the admin can simulate the policy against sample user attributes. The admin enters JSON attributes (e.g., {"department": "Engineering", "location": "US"}) and clicks "Simulate". The system returns whether the policy would match and which entitlements would be provisioned.

Additionally, from the hub page, the admin can run a "Simulate All Policies" action that evaluates all active policies against a set of sample attributes, showing which policies match and the combined set of entitlements that would be assigned.

**Why this priority**: Simulation is critical for validating policies before they affect real users. Prevents costly mistakes in production.

**Independent Test**: Create a policy → open detail → enter sample attributes → simulate → verify match result shows correct entitlements. Then simulate all policies from the hub.

**Acceptance Scenarios**:

1. **Given** a policy with condition "department equals Engineering", **When** admin simulates with {"department": "Engineering"}, **Then** the result shows "Match" with the policy's entitlements listed.
2. **Given** a policy with condition "department equals Engineering", **When** admin simulates with {"department": "Sales"}, **Then** the result shows "No Match".
3. **Given** multiple active policies, **When** admin simulates all with sample attributes, **Then** all matching policies are listed with their combined entitlements.
4. **Given** invalid JSON input, **When** admin clicks simulate, **Then** a validation error is shown.

---

### User Story 4 - Impact Analysis (Priority: P2)

From a policy's detail page, the admin can run an impact analysis to see how the policy would affect existing users. The system returns a breakdown of affected users by department and location, showing how many would gain or lose entitlements.

This allows the admin to assess the blast radius of a policy change before enabling it.

**Why this priority**: Important for governance but not blocking core functionality. Policies can be created and simulated without impact analysis.

**Independent Test**: Create a policy → open detail → click "Analyze Impact" → view user impact breakdown by department and location.

**Acceptance Scenarios**:

1. **Given** a policy, **When** admin clicks "Analyze Impact", **Then** a summary showing total affected users, users gaining entitlements, and users losing entitlements is displayed.
2. **Given** impact results, **When** viewing the breakdown, **Then** affected users are grouped by department and location with counts.
3. **Given** a policy that matches no users, **When** admin runs impact analysis, **Then** a message "No users would be affected" is shown.

---

### User Story 5 - Lifecycle Event Management (Priority: P1)

Admins can view a list of lifecycle events on the "Lifecycle Events" tab of the hub page. Events are filterable by event type (joiner/mover/leaver), processing status (pending/processed), user, and date range. Each event shows the user, event type, source, processing status, and creation date.

Admins can manually trigger a lifecycle event by selecting a user, choosing an event type, and providing the required attributes (attributes_after for joiner, attributes_before and attributes_after for mover, none for leaver).

**Why this priority**: Viewing and triggering lifecycle events is core to the JML workflow — without it, the system cannot automate entitlement provisioning.

**Independent Test**: Navigate to Lifecycle Events tab → see event list → filter by type → trigger a joiner event for a user → see the event appear in the list.

**Acceptance Scenarios**:

1. **Given** no events, **When** admin views the events tab, **Then** an empty state is shown.
2. **Given** events exist, **When** admin filters by "joiner", **Then** only joiner events are shown.
3. **Given** a user, **When** admin triggers a joiner event with attributes, **Then** the event is created and appears in the list as "pending".
4. **Given** a user, **When** admin triggers a leaver event, **Then** no attributes are required and the event is created.
5. **Given** a mover event form, **When** admin omits attributes_before, **Then** a validation error is shown.

---

### User Story 6 - Event Processing & Results (Priority: P2)

From the event list, admins can process pending events. When processed, the system evaluates birthright policies and provisions/revokes entitlements accordingly. The processing result shows a summary: number of entitlements provisioned, revoked, scheduled for revocation (with grace period), and skipped.

From the event detail page, the admin sees the full action log with each action's type (provision/revoke/schedule_revoke/skip), the associated entitlement, the policy that triggered it, execution status, and any error messages.

**Why this priority**: Processing is the automation core, but it depends on policies (US1) and events (US5) existing first.

**Independent Test**: Create a policy → trigger a joiner event → process it → verify summary shows correct provisioned count → view detail page with action log.

**Acceptance Scenarios**:

1. **Given** a pending joiner event, **When** admin clicks "Process", **Then** the event is processed and a result summary appears showing provisioned/revoked/skipped/scheduled counts.
2. **Given** a processed event, **When** admin views the detail page, **Then** each action is listed with type, entitlement name, policy name, and execution timestamp.
3. **Given** a mover event with grace period, **When** processed, **Then** some actions show "schedule_revoke" type with a scheduled date.
4. **Given** an already-processed event, **When** admin tries to process again, **Then** the process button is disabled or an error is shown.
5. **Given** a leaver event, **When** processed, **Then** all active entitlements are revoked and an access snapshot is captured.

---

### User Story 7 - Lifecycle Event Detail (Priority: P2)

Admins can click on a lifecycle event to see its full detail page. The detail page shows: event metadata (user, type, source, dates), attributes before/after (formatted JSON), a summary card with provisioned/revoked/scheduled/skipped counts, the full action log table, and an access snapshot if captured (for mover/leaver events).

**Why this priority**: Detail view enhances audit capability but the feature works without it (summary on the list page suffices for basic use).

**Independent Test**: Process a mover event → click on it → see attributes before/after side by side → see action log → see access snapshot.

**Acceptance Scenarios**:

1. **Given** a processed event, **When** admin clicks on it, **Then** the detail page shows event metadata, attributes, summary, and actions.
2. **Given** a mover event, **When** viewing detail, **Then** attributes_before and attributes_after are displayed side by side for comparison.
3. **Given** a leaver event with snapshot, **When** viewing detail, **Then** the pre-leaver access snapshot is displayed showing all previously assigned entitlements.
4. **Given** an unprocessed event, **When** viewing detail, **Then** a "Process Event" button is available and the actions section shows "Not yet processed".

---

### Edge Cases

- What happens when a policy references entitlements that have been deleted? The system should gracefully handle missing entitlements and show warnings.
- What happens when a mover event's attributes_before and attributes_after are identical? No entitlement changes should occur (all actions are "skip").
- What happens when two policies grant the same entitlement to the same user? The system should deduplicate — only one assignment is created (second is "skip").
- What happens when a user already has an entitlement that a joiner policy would provision? The action should be "skip" (idempotent).
- What happens when a policy has grace_period_days = 0 for a mover event? Revocations are immediate, not scheduled.
- What happens when the attribute path references nested fields (e.g., "metadata.cost_center")? The condition should match against nested user attribute values.
- What happens when a lifecycle event is triggered for a non-existent user? An appropriate error message should be displayed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of birthright policies with name, status, priority, evaluation mode, condition count, entitlement count, and grace period.
- **FR-002**: System MUST allow admins to create policies with name, description, priority, conditions, entitlement selections, evaluation mode, and grace period.
- **FR-003**: System MUST validate that policies have at least one condition and at least one entitlement.
- **FR-004**: System MUST support condition operators: equals, not_equals, in, not_in, starts_with, contains.
- **FR-005**: System MUST allow filtering policies by status (active, inactive, archived).
- **FR-006**: System MUST support enable, disable, and archive lifecycle actions on policies.
- **FR-007**: System MUST allow simulation of a single policy against sample user attributes (JSON input).
- **FR-008**: System MUST allow simulation of all active policies against sample user attributes.
- **FR-009**: System MUST display impact analysis results with user counts broken down by department and location.
- **FR-010**: System MUST display a list of lifecycle events with user, type, source, processing status, and date.
- **FR-011**: System MUST allow filtering events by type (joiner/mover/leaver), processing status, user, and date range.
- **FR-012**: System MUST allow admins to manually trigger lifecycle events with appropriate attribute inputs per event type.
- **FR-013**: System MUST allow processing of pending events with result summary (provisioned/revoked/skipped/scheduled counts).
- **FR-014**: System MUST display event detail with attributes before/after, action log, and access snapshots.
- **FR-015**: System MUST prevent reprocessing of already-processed events.
- **FR-016**: System MUST require admin role for all policy and event management actions.
- **FR-017**: System MUST display entitlement names (not just IDs) in policy detail, simulation results, and action logs.
- **FR-018**: System MUST validate JSON input for simulation and event attribute fields.

### Key Entities

- **Birthright Policy**: Defines automatic entitlement provisioning rules based on user attribute conditions. Has name, priority, status (active/inactive/archived), evaluation mode (first_match/all_match), grace period, conditions, and linked entitlements.
- **Policy Condition**: A single matching rule within a policy — attribute path, comparison operator, and expected value. Multiple conditions use AND logic.
- **Lifecycle Event**: Records a JML event (joiner/mover/leaver) for a specific user with before/after attribute snapshots and processing status.
- **Lifecycle Action**: An individual provisioning/revocation action generated when processing a lifecycle event — links to the triggering event, policy, and entitlement.
- **Access Snapshot**: A point-in-time capture of a user's entitlement assignments, created during mover/leaver processing for audit purposes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create a birthright policy with conditions and entitlements in under 3 minutes.
- **SC-002**: Policy simulation returns results within 2 seconds for sample attribute inputs.
- **SC-003**: Impact analysis displays user breakdown within 5 seconds.
- **SC-004**: Lifecycle events can be triggered and processed with results displayed in under 5 seconds.
- **SC-005**: All policy and event management pages render correctly in both light and dark themes.
- **SC-006**: 100% of policy CRUD operations (create, read, update, archive, enable, disable) work end-to-end.
- **SC-007**: Event processing correctly provisions, revokes, schedules, and skips entitlements based on policy matching.
- **SC-008**: Admins can audit any lifecycle event to see the complete action trail with policy associations.

## Assumptions

- The backend API for birthright policies and lifecycle events is fully implemented and stable.
- Entitlements referenced by policies are managed through the existing governance entitlements module.
- User attributes (department, location, job_title, metadata, custom_attributes) are available in the system.
- Grace period revocations are executed by a backend background job — the frontend only displays scheduled dates.
- Access snapshots are created server-side during event processing — the frontend only displays them.
- The "Simulate All Policies" endpoint evaluates all active policies (cannot select a subset).
- Policy conditions use AND logic (all conditions must match). OR logic across policies is achieved by creating multiple policies.

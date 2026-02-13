# Feature Specification: Governance Operations & SLA Management

**Feature Branch**: `037-governance-operations-sla`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Phase 037: Governance Operations & SLA Management — Operational governance features for managing SLA policies, ticketing system integration, expression-based bulk actions, failed operation retry management, bulk state transitions, and scheduled transitions."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - SLA Policy Management (Priority: P1)

As a governance administrator, I need to define and manage SLA policies that set time-based expectations for governance processes (access requests, certifications, provisioning, reviews). Each policy specifies a target duration, a warning threshold, and optionally links to an escalation policy for when SLAs are breached.

**Why this priority**: SLA policies are the foundational operational governance feature. Without defined time expectations, there is no way to measure or enforce governance process performance. All other operational features (ticketing, failed operations) depend on having SLA targets in place.

**Independent Test**: Can be fully tested by creating, editing, listing, and deleting SLA policies. Delivers value by allowing admins to define governance process time targets.

**Acceptance Scenarios**:

1. **Given** an admin on the Operations hub, **When** they navigate to the SLA Policies tab, **Then** they see a list of existing SLA policies with name, category, target duration, warning threshold, and status.
2. **Given** an admin clicks "Create SLA Policy", **When** they fill in name, description, category (access_request/certification/provisioning/review), target duration hours, warning threshold hours, and optionally select an escalation policy, **Then** the policy is created and appears in the list.
3. **Given** an admin views an SLA policy detail page, **When** they click "Edit", **Then** they can update the policy name, description, target duration, warning threshold, escalation policy link, and status.
4. **Given** an admin views an SLA policy detail page, **When** they click "Delete" and confirm, **Then** the policy is removed from the system.
5. **Given** an admin on the SLA policies list, **When** they filter by status (active/inactive) or category, **Then** the list updates to show only matching policies.

---

### User Story 2 - Ticketing Integration Configuration (Priority: P1)

As a governance administrator, I need to configure connections to external ticketing systems (ServiceNow, Jira, or custom webhooks) so that governance events automatically create tickets in those systems. Each configuration specifies the system type, connection details, which governance events trigger ticket creation, and whether the integration is enabled.

**Why this priority**: Ticketing integration is critical for production governance because organizations need audit trails in their existing ITSM systems. This enables governance workflows to create tickets automatically for access requests, certifications, and SoD violations.

**Independent Test**: Can be fully tested by creating a ticketing configuration, editing it, toggling enabled status, and deleting it. Delivers value by allowing admins to set up external ticket system integrations.

**Acceptance Scenarios**:

1. **Given** an admin on the Ticketing tab, **When** they view the list, **Then** they see existing ticketing configurations with name, system type, auto-create trigger, and enabled status.
2. **Given** an admin clicks "Create Configuration", **When** they select a system type (ServiceNow, Jira, or Custom Webhook), **Then** the form shows type-specific fields (base URL, API key, project key for Jira, issue type, webhook secret for custom).
3. **Given** an admin fills the ticketing config form with valid details including auto-create trigger events, **When** they submit, **Then** the configuration is created and appears in the list.
4. **Given** an admin views a ticketing config detail page, **When** they click "Edit", **Then** they can update all configuration fields.
5. **Given** an admin views a ticketing config detail page, **When** they click "Delete" and confirm, **Then** the configuration is removed.

---

### User Story 3 - Bulk Actions Management (Priority: P2)

As a governance administrator, I need to define expression-based bulk operations that affect multiple identities or entitlements at once. I can create bulk action definitions specifying the action type and target/filter expressions, preview the affected items before execution, validate expressions, and monitor execution progress.

**Why this priority**: Bulk actions enable efficient mass governance operations that would be tedious to perform one-by-one. The preview/validation capability prevents accidental mass changes.

**Independent Test**: Can be fully tested by creating a bulk action definition, validating the expression, previewing affected items, executing the action, and monitoring progress. Delivers value by enabling mass governance operations with safety checks.

**Acceptance Scenarios**:

1. **Given** an admin on the Bulk Actions tab, **When** they view the list, **Then** they see existing bulk actions with name, action type, status, and progress counts.
2. **Given** an admin clicks "Create Bulk Action", **When** they fill in name, description, action type (grant/revoke/enable/disable/delete/transition), target expression, and filter expression, **Then** the action is created in draft status.
3. **Given** an admin views a bulk action in draft status, **When** they click "Preview", **Then** they see a preview showing total affected items, sample items with current state, expression validity, and any warnings.
4. **Given** an admin views a validated bulk action, **When** they click "Execute", **Then** the action begins processing and they can monitor progress (processed count, failed count).
5. **Given** an admin enters an expression on the create form, **When** they click "Validate Expression", **Then** the system checks expression syntax and reports whether it's valid or shows errors.
6. **Given** an admin views a bulk action detail, **When** they click "Edit" (only available in draft status), **Then** they can update the action definition.

---

### User Story 4 - Failed Operations Dashboard (Priority: P2)

As a governance administrator, I need a dashboard showing governance operations that failed during execution, acting as a dead letter queue. I can view error details, retry failed operations, or dismiss them if the issue has been resolved externally.

**Why this priority**: Failed operations are inevitable in production systems. Without a retry mechanism, failed governance operations require manual intervention or fall through the cracks, creating compliance gaps.

**Independent Test**: Can be fully tested by viewing the failed operations list, examining a failed operation's error details, retrying it, and dismissing resolved operations. Delivers value by providing operational visibility and recovery for failed governance processes.

**Acceptance Scenarios**:

1. **Given** an admin on the Failed Operations tab, **When** they view the list, **Then** they see failed operations with operation type, error message, retry count, status, and timestamps.
2. **Given** an admin views a failed operation detail, **When** they examine it, **Then** they see the full error message, error code, retry count vs max retries, operation context, and timing information.
3. **Given** an admin views a failed operation in pending_retry status, **When** they click "Retry", **Then** the system attempts to re-execute the operation and updates the retry count.
4. **Given** an admin views a failed operation, **When** they click "Dismiss", **Then** the operation status changes to dismissed and it no longer appears in the active failures list.
5. **Given** an admin on the failed operations list, **When** they filter by status (pending_retry/retrying/dismissed/resolved) or operation type, **Then** the list updates to show only matching operations.

---

### User Story 5 - Bulk State Operations (Priority: P3)

As a governance administrator, I need to trigger mass lifecycle state transitions across multiple objects at once, with progress tracking and the ability to cancel an in-progress operation.

**Why this priority**: Bulk state transitions are a convenience feature for large-scale lifecycle management. While individual transitions are possible through existing UIs, mass transitions save significant time during organizational changes (department restructuring, offboarding waves).

**Independent Test**: Can be fully tested by creating a bulk state operation, monitoring its progress, and cancelling it. Delivers value by enabling efficient mass lifecycle state changes.

**Acceptance Scenarios**:

1. **Given** an admin on the Bulk State tab, **When** they click "Create Bulk State Operation", **Then** they see a form for object type, target state, and filter expression.
2. **Given** an admin fills the form and submits, **When** the operation is queued, **Then** they see the operation detail page with status (queued), total count, and a "Process" button.
3. **Given** an admin views a queued operation, **When** they click "Process", **Then** the operation begins processing and shows progress (processed_count/total_count, failed_count).
4. **Given** an admin views a processing operation, **When** they click "Cancel", **Then** the operation is cancelled and shows final counts of what was processed.

---

### User Story 6 - Scheduled Transitions (Priority: P3)

As a governance administrator, I need to view and manage pre-scheduled future state transitions. These are transitions that have been scheduled to happen at a future date, and I need the ability to cancel them if plans change.

**Why this priority**: Scheduled transitions are a read-and-manage feature (creation happens through other workflows). The admin needs visibility into what's scheduled and the ability to cancel unwanted transitions.

**Independent Test**: Can be fully tested by viewing the list of scheduled transitions, examining a scheduled transition's details, and cancelling one. Delivers value by providing visibility and control over pending state changes.

**Acceptance Scenarios**:

1. **Given** an admin on the Scheduled tab, **When** they view the list, **Then** they see scheduled transitions with object type, target state, scheduled date, reason, and status.
2. **Given** an admin views a scheduled transition detail, **When** they examine it, **Then** they see the full details including object ID, object type, target state, scheduled time, reason, status, and who created it.
3. **Given** an admin views a pending scheduled transition, **When** they click "Cancel" and confirm, **Then** the transition is cancelled and its status updates to cancelled.
4. **Given** an admin on the scheduled transitions list, **When** they filter by status (pending/executed/cancelled/failed) or object type, **Then** the list updates to show only matching transitions.

---

### Edge Cases

- What happens when an admin tries to delete an SLA policy that is referenced by active governance processes? The system should allow deletion (the policy reference becomes historical).
- What happens when a ticketing configuration has an invalid/unreachable URL? The system stores the configuration but ticket creation will fail at runtime (visible in failed operations).
- What happens when a bulk action preview returns zero affected items? The system should show "No items match the expression" and prevent execution.
- What happens when an admin retries a failed operation that has exceeded max retries? The system should still allow manual retry (override max retry limit).
- What happens when a bulk state operation is cancelled mid-processing? Already-processed items retain their new state; remaining items are not processed.
- What happens when a scheduled transition's target date is in the past? The list should show it with appropriate status (executed or failed).
- What happens when the API key in a ticketing configuration is invalid? The configuration is saved but marked that connection testing failed.
- What happens when a bulk action expression contains syntax errors? The validate endpoint returns errors before any execution can occur.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an Operations hub page with 6 tabs: SLA Policies, Ticketing, Bulk Actions, Failed Operations, Bulk State, Scheduled.
- **FR-002**: System MUST allow admins to create SLA policies with name, description, category (access_request/certification/provisioning/review), target duration hours, warning threshold hours, optional escalation policy ID, and status (active/inactive).
- **FR-003**: System MUST allow admins to edit and delete SLA policies.
- **FR-004**: System MUST display SLA policies in a filterable list with status and category filters.
- **FR-005**: System MUST allow admins to create ticketing configurations with name, system type (servicenow/jira/custom_webhook), connection details (base URL, API key, project key, issue type, webhook secret), auto-create trigger events (access_request/certification/sod_violation), and enabled status.
- **FR-006**: System MUST show type-specific form fields based on the selected ticketing system type.
- **FR-007**: System MUST allow admins to edit and delete ticketing configurations.
- **FR-008**: System MUST allow admins to create bulk action definitions with name, description, action type (grant/revoke/enable/disable/delete/transition), target expression, and filter expression.
- **FR-009**: System MUST provide a preview capability for bulk actions showing total affected items, sample items, expression validity, and warnings.
- **FR-010**: System MUST provide expression validation for bulk actions before execution.
- **FR-011**: System MUST allow executing bulk actions and displaying progress (affected, processed, failed counts).
- **FR-012**: System MUST allow admins to edit bulk actions in draft status only.
- **FR-013**: System MUST display failed operations in a filterable list with status and operation type filters.
- **FR-014**: System MUST allow admins to retry failed operations regardless of retry count.
- **FR-015**: System MUST allow admins to dismiss failed operations to acknowledge and clear them.
- **FR-016**: System MUST allow creating bulk state operations with object type, target state, and filter expression.
- **FR-017**: System MUST show bulk state operation progress and allow cancellation of queued/processing operations.
- **FR-018**: System MUST display scheduled transitions in a filterable list with status and object type filters.
- **FR-019**: System MUST allow cancelling pending scheduled transitions.
- **FR-020**: System MUST restrict all operations management to admin users only.
- **FR-021**: System MUST provide a detail page for each SLA policy, ticketing configuration, and bulk action.
- **FR-022**: System MUST add an "Operations" entry in the sidebar navigation under the Governance section.

### Key Entities

- **SLA Policy**: Defines time-based expectations for a governance process category. Key attributes: name, description, category, target duration hours, warning threshold hours, escalation policy link, status (active/inactive).
- **Ticketing Configuration**: Connection settings for an external ticket system. Key attributes: name, system type, connection URL, credentials, project/issue settings, trigger events, enabled status.
- **Bulk Action**: A reusable definition for a mass governance operation. Key attributes: name, description, action type, target/filter expressions, status lifecycle (draft → validated → executing → completed/failed/cancelled), progress counters.
- **Bulk Action Preview**: A read-only preview result showing affected item count, sample items, expression validity, and warnings.
- **Failed Operation**: A record of a governance operation that failed, with error details and retry tracking. Key attributes: operation type, error message/code, retry count, status (pending_retry/retrying/dismissed/resolved), context.
- **Bulk State Operation**: A mass lifecycle state transition job. Key attributes: object type, target state, filter expression, status lifecycle (queued → processing → completed/failed/cancelled), progress counters.
- **Scheduled Transition**: A future state change scheduled for a specific object. Key attributes: object ID, object type, target state, scheduled time, reason, status (pending/executed/cancelled/failed), creator.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create, edit, and delete SLA policies within 60 seconds per operation through the hub interface.
- **SC-002**: Admins can configure a ticketing system integration (any of the 3 types) within 2 minutes, including all required connection details.
- **SC-003**: Admins can define, preview, and execute a bulk action within 3 minutes, with clear visibility into affected items before execution.
- **SC-004**: Failed operations are visible within the dashboard immediately, and retry actions complete within 5 seconds of clicking.
- **SC-005**: All 6 tabs in the Operations hub load and display data correctly, with appropriate empty states when no data exists.
- **SC-006**: All list views support filtering by relevant attributes (status, category, type) with immediate visual feedback.
- **SC-007**: Bulk action preview shows accurate affected item counts and sample data before execution.
- **SC-008**: Admin-only access control prevents non-admin users from accessing any operations management features.

## Assumptions

- The backend API for all 28 endpoints is already implemented and available on the xavyo-idp service.
- SLA policy escalation linking references existing escalation policies managed in the Approval Config section.
- Ticketing configuration API keys are stored encrypted on the backend; the frontend sends them in plain text during creation/update.
- Bulk action expressions use a backend-defined expression syntax; the frontend does not need to parse them, only send them to the validate endpoint.
- Scheduled transitions are created through other governance workflows (not directly from this UI); this feature only provides list/detail/cancel.
- The existing sidebar navigation will need the current "Operations" entry under Connectors renamed to "Provisioning Ops" to avoid naming conflicts.

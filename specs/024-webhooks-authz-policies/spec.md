# Feature Specification: Webhooks & Authorization Policy Management

**Feature Branch**: `024-webhooks-authz-policies`
**Created**: 2026-02-12
**Status**: Draft
**Input**: Phase 024 — Admin UI for webhook subscription management and authorization policy management

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Webhook Subscription Management (Priority: P1)

As a tenant administrator, I want to create, view, edit, and manage webhook subscriptions so that external systems can receive real-time event notifications when important actions occur in my identity platform.

**Why this priority**: Webhooks are the foundation for event-driven integrations. Without subscription management, no external system can receive notifications, making the entire webhooks feature unusable.

**Independent Test**: Can be fully tested by creating a webhook subscription with a target URL and event types, verifying it appears in the list with correct status, editing its configuration, pausing/resuming it, and deleting it. Delivers immediate value for integration setup.

**Acceptance Scenarios**:

1. **Given** I am on the Webhooks settings page, **When** I click "Create Subscription", **Then** I see a form with fields for name, target URL, event type multi-select, optional secret, and optional custom headers.
2. **Given** I have filled the create form with valid data, **When** I submit the form, **Then** the subscription is created and I am redirected to the subscription detail page with a success toast.
3. **Given** I am viewing the subscriptions list, **When** I look at the table, **Then** I see columns for Name, Target URL, Event Types, Status (active/paused/failed), and actions.
4. **Given** I am viewing a subscription detail, **When** I click "Pause", **Then** the subscription status changes to "paused" and events are no longer delivered.
5. **Given** a subscription is paused, **When** I click "Resume", **Then** the subscription status changes back to "active".
6. **Given** I am viewing a subscription detail, **When** I click "Edit", **Then** I can modify the name, URL, event types, secret, and headers.
7. **Given** I want to remove a subscription, **When** I click "Delete" and confirm, **Then** the subscription is permanently removed and I am redirected to the list.
8. **Given** I am viewing a subscription detail, **When** I look at the delivery statistics section, **Then** I see success rate, last delivery timestamp, and failure count.

---

### User Story 2 - Authorization Policy Management (Priority: P1)

As a tenant administrator, I want to create and manage fine-grained authorization policies that control access based on resource patterns and action patterns, so that I can enforce least-privilege access across my organization.

**Why this priority**: Authorization policies are the core of fine-grained access control. They determine who can do what, making them equally critical as webhooks for the governance capability of the platform.

**Independent Test**: Can be fully tested by creating a policy with resource/action patterns and effect, verifying it in the list, editing it, toggling enable/disable, and deleting it. Delivers immediate value for access governance.

**Acceptance Scenarios**:

1. **Given** I am on the Authorization Policies page, **When** I view the list, **Then** I see all policies with name, description, effect (allow/deny), status (active/inactive), and creation date.
2. **Given** I click "Create Policy", **When** I fill in name, description, effect, resource pattern, action pattern, and optional conditions (JSON), **Then** the policy is created and appears in the list.
3. **Given** I am viewing a policy detail, **When** I click "Enable", **Then** the policy becomes active and is evaluated during authorization checks.
4. **Given** an active policy exists, **When** I click "Disable", **Then** the policy becomes inactive and is skipped during authorization checks.
5. **Given** I want to modify a policy, **When** I click "Edit" and change fields, **Then** the policy is updated and the changes are reflected.
6. **Given** I want to remove a policy, **When** I click "Delete" and confirm, **Then** the policy is permanently removed.

---

### User Story 3 - Entitlement-to-Action Mappings (Priority: P2)

As a tenant administrator, I want to map entitlements to resource/action pairs so that governance entitlements translate into concrete authorization decisions, bridging the gap between high-level governance and low-level access control.

**Why this priority**: Mappings connect governance entitlements to authorization policies. While not required for basic policy management, they are essential for organizations wanting automated policy enforcement based on entitlement assignments.

**Independent Test**: Can be tested by viewing existing mappings, creating a new mapping from an entitlement to a resource/action pair, and deleting a mapping. Delivers value by connecting governance to authorization.

**Acceptance Scenarios**:

1. **Given** I am on the Mappings page, **When** I view the list, **Then** I see all mappings with entitlement name, resource pattern, action, and creation date.
2. **Given** I click "Create Mapping", **When** I select an entitlement, enter a resource pattern and action, **Then** the mapping is created.
3. **Given** I want to remove a mapping, **When** I click "Delete" and confirm, **Then** the mapping is removed.

---

### User Story 4 - Authorization Test Tool (Priority: P2)

As a tenant administrator, I want a "Can I?" test tool that lets me check whether a specific subject would be allowed or denied access to a resource/action combination, so I can validate policies before relying on them in production.

**Why this priority**: The test tool is critical for policy debugging and validation but depends on policies existing first. It's a P2 because basic policy CRUD (P1) must be available before testing makes sense.

**Independent Test**: Can be tested by entering a subject ID, resource, and action into the test form, submitting it, and verifying the response shows allowed/denied with the reason and matched policy list.

**Acceptance Scenarios**:

1. **Given** I am on the Authorization Test page, **When** I fill in subject ID, resource, and action, **Then** I can submit the test.
2. **Given** I submit a test, **When** matching policies exist, **Then** I see the result (allowed/denied), the reason, and a list of matched policies with their names and effects.
3. **Given** I submit a test, **When** no policies match, **Then** I see a clear "no matching policies" result.

---

### User Story 5 - Webhook DLQ Management (Priority: P3)

As a tenant administrator, I want to view and manage the dead letter queue (DLQ) for failed webhook deliveries, so that I can retry or discard failed events and ensure no critical notifications are permanently lost.

**Why this priority**: DLQ management is an operational concern that only matters after webhooks are actively in use and experiencing delivery failures. It's a lower priority than subscription management itself.

**Independent Test**: Can be tested by viewing the DLQ list, retrying an entry, and deleting an entry. Delivers value for operational webhook reliability.

**Acceptance Scenarios**:

1. **Given** I am on the DLQ page, **When** failed deliveries exist, **Then** I see a list of DLQ entries with event details, failure reason, and timestamps.
2. **Given** I am viewing a DLQ entry, **When** I click "Retry", **Then** the system attempts redelivery and the entry is updated or removed on success.
3. **Given** I want to discard a failed event, **When** I click "Delete" and confirm, **Then** the DLQ entry is permanently removed.

---

### Edge Cases

- What happens when a webhook subscription URL becomes unreachable? The subscription status should reflect "failed" with failure count incremented.
- What happens when creating a policy with an invalid JSON conditions field? The system should display a validation error before submission.
- What happens when deleting a policy that is referenced by entitlement mappings? The system should either cascade the deletion or warn the user.
- How does the system handle concurrent edits to the same webhook subscription? Last-write-wins with optimistic UI update.
- What happens when the DLQ is empty? An empty state is shown with a message indicating no failed deliveries.
- What happens when retrying a DLQ entry that still fails? The entry remains in the DLQ with an updated failure count and error message.
- What happens when all event types are deselected from a subscription? Validation prevents saving with zero event types selected.
- What happens when the authorization test tool is used with a non-existent subject ID? The system returns a result (likely denied) with an appropriate reason rather than an error.

## Requirements *(mandatory)*

### Functional Requirements

**Webhook Subscriptions**:

- **FR-001**: System MUST display a paginated list of webhook subscriptions showing name, target URL, event types, and status (active/paused/failed).
- **FR-002**: System MUST allow administrators to create webhook subscriptions with name (required), target URL (required), event type selection (at least one required), optional secret for signature verification, and optional custom headers (key-value pairs).
- **FR-003**: System MUST provide a subscription detail view showing configuration, delivery statistics (success rate, last delivery timestamp, failure count), and delivery history.
- **FR-004**: System MUST allow administrators to edit subscription name, target URL, event types, secret, and custom headers.
- **FR-005**: System MUST allow administrators to pause (disable delivery) and resume (re-enable delivery) subscriptions.
- **FR-006**: System MUST allow administrators to delete subscriptions with confirmation.
- **FR-007**: System MUST display delivery history for each subscription showing status, response code, duration, and timestamp.
- **FR-008**: System MUST allow administrators to retry individual failed deliveries from the delivery history.

**Authorization Policies**:

- **FR-009**: System MUST display a paginated list of authorization policies showing name, description, effect (allow/deny), active status, and timestamps.
- **FR-010**: System MUST allow administrators to create policies with name (required), description, effect (allow/deny), resource pattern (required), action pattern (required), and optional conditions in JSON format.
- **FR-011**: System MUST provide a policy detail view showing all configuration fields and metadata.
- **FR-012**: System MUST allow administrators to edit policy configuration (name, description, effect, resource pattern, action pattern, conditions).
- **FR-013**: System MUST allow administrators to enable and disable individual policies.
- **FR-014**: System MUST allow administrators to delete policies with confirmation.

**Entitlement Mappings**:

- **FR-015**: System MUST display a list of entitlement-to-action mappings showing entitlement name, resource pattern, action, and creation date.
- **FR-016**: System MUST allow administrators to create mappings linking an entitlement to a resource pattern and action.
- **FR-017**: System MUST allow administrators to delete mappings with confirmation.

**Authorization Test Tool**:

- **FR-018**: System MUST provide a test interface where administrators can enter a subject ID, resource, and action to check authorization.
- **FR-019**: System MUST display test results showing allowed/denied decision, reason text, and list of matched policies with their names and effects.

**DLQ Management**:

- **FR-020**: System MUST display the dead letter queue with entry details including event information, failure reason, and timestamps.
- **FR-021**: System MUST allow administrators to retry individual DLQ entries.
- **FR-022**: System MUST allow administrators to delete individual DLQ entries with confirmation.

### Key Entities

- **Webhook Subscription**: Represents a registered endpoint that receives event notifications. Key attributes: name, target URL, event types, status, secret (for signature verification), custom headers.
- **Webhook Delivery**: Represents a single attempt to deliver an event to a subscription endpoint. Key attributes: event type, delivery status, HTTP response code, duration, error message, timestamp.
- **Webhook Event Type**: Represents a category of events that can trigger webhook deliveries. Key attributes: name, description, category.
- **DLQ Entry**: Represents a failed webhook delivery that has been moved to the dead letter queue for manual review. Key attributes: original event data, failure reason, retry count, timestamps.
- **Authorization Policy**: Represents a fine-grained access control rule. Key attributes: name, description, effect (allow/deny), resource pattern, action pattern, conditions (JSON), active status.
- **Entitlement Mapping**: Links a governance entitlement to a concrete resource/action pair for authorization enforcement. Key attributes: entitlement reference, resource pattern, action.
- **Authorization Check Result**: Represents the outcome of testing a subject's access to a resource/action. Key attributes: allowed/denied, reason, matched policies.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a complete webhook subscription (with name, URL, event types, and optional secret/headers) and see it in the list within one page navigation.
- **SC-002**: Administrators can pause and resume webhook subscriptions with immediate status feedback via toast notifications.
- **SC-003**: Administrators can view delivery history for any subscription with status, response code, and duration for each delivery.
- **SC-004**: Administrators can create authorization policies with resource/action patterns and toggle their active status.
- **SC-005**: The authorization test tool returns a clear allow/deny result with matched policy details within one form submission.
- **SC-006**: Administrators can create and delete entitlement-to-action mappings from a single management page.
- **SC-007**: DLQ entries can be individually retried or deleted from the management interface.
- **SC-008**: All CRUD operations provide user feedback via toast notifications and form validation errors.

## Assumptions

- Webhook event types are predefined by the backend and cannot be created by administrators — only selected when configuring subscriptions.
- The secret field for webhook subscriptions is write-only from the UI perspective (shown as masked on detail view, editable on edit form).
- Custom headers on webhook subscriptions are stored as key-value pairs with a maximum reasonable limit (e.g., 10 headers).
- Authorization policy conditions are stored as freeform JSON; the UI provides a textarea with JSON syntax validation.
- The test tool performs a read-only authorization check and does not modify any policies or state.
- DLQ entries are retained by the backend until explicitly retried or deleted by an administrator.
- All management pages are admin-only (require admin or super_admin role).

## Constraints

- Webhooks UI is located at `/settings/webhooks` (admin-only, within the existing settings layout).
- Authorization UI is located at `/governance/authorization` with sub-pages for policies, mappings, and test tool.
- All data operations go through BFF proxy endpoints following the established pattern.
- Forms use Superforms + Zod (via `zod/v3`) for validation.
- Lists use the existing DataTable component with server-side pagination.

# Feature Specification: User Invitations

**Feature Branch**: `019-user-invitations`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "User Invitations (Phase 019): Implement complete UI for backend invitation management API"

## User Scenarios & Testing

### User Story 1 - Invitation List & Management (Priority: P1)

As a tenant administrator, I want to view all user invitations in a paginated list with status badges and filters, so I can track who has been invited, who has accepted, and who still has pending invitations.

**Why this priority**: This is the core read-only view that provides visibility into all invitations. Without it, admins have no way to see invitation status. It is the foundation that all other actions (create, resend, cancel) build upon.

**Independent Test**: Can be fully tested by navigating to the invitations page and verifying the list displays existing invitations with correct status badges, pagination controls, email search, and status filter dropdown.

**Acceptance Scenarios**:

1. **Given** an admin is on the invitations page, **When** the page loads, **Then** a paginated list of invitations is displayed showing email, status badge (sent/cancelled/accepted), invited date, and expiry date
2. **Given** invitations exist with different statuses, **When** the admin selects "Sent" from the status filter, **Then** only invitations with "sent" status are shown
3. **Given** the admin types an email fragment in the search box, **When** they click search, **Then** the list filters to show only invitations matching that email
4. **Given** there are more invitations than one page, **When** the admin clicks the next page button, **Then** the next page of invitations is displayed
5. **Given** there are no invitations, **When** the page loads, **Then** an empty state is shown with a call-to-action to invite the first user

---

### User Story 2 - Create Invitation (Priority: P2)

As a tenant administrator, I want to invite a new user by email so they can join the tenant and create their account.

**Why this priority**: Creating invitations is the primary write operation. Without it, no new users can be onboarded via invitation. It directly enables the core value proposition of the invitation system.

**Independent Test**: Can be tested by navigating to the create invitation form, entering an email address, submitting, and verifying the invitation appears in the list with "sent" status.

**Acceptance Scenarios**:

1. **Given** an admin is on the create invitation page, **When** they enter a valid email and submit, **Then** the invitation is created, and the admin is redirected to the invitation list with a success message
2. **Given** an admin submits the form with an empty email, **When** validation runs, **Then** an error message indicates that email is required
3. **Given** an admin submits the form with an invalid email format, **When** validation runs, **Then** an error message indicates that the email format is invalid
4. **Given** an invitation already exists for the same email, **When** the admin tries to create another, **Then** the system displays an appropriate error from the backend

---

### User Story 3 - Resend & Cancel Actions (Priority: P3)

As a tenant administrator, I want to resend invitation emails to users who haven't responded and cancel invitations that are no longer needed, so I can manage the onboarding pipeline effectively.

**Why this priority**: These are management actions that operate on existing invitations. They are essential for day-to-day operations but depend on invitations already existing (US1 and US2).

**Independent Test**: Can be tested by creating an invitation, then using the resend button to re-send the email and the cancel button to revoke it.

**Acceptance Scenarios**:

1. **Given** an invitation with "sent" status, **When** the admin clicks "Resend", **Then** the invitation email is re-sent and a success toast is displayed
2. **Given** an invitation with "sent" status, **When** the admin clicks "Cancel", **Then** a confirmation dialog appears asking to confirm cancellation
3. **Given** the admin confirms cancellation, **When** the action completes, **Then** the invitation status changes to "cancelled" and a success toast is displayed
4. **Given** an invitation with "cancelled" or "accepted" status, **When** the admin views it, **Then** the Resend and Cancel actions are not available (disabled or hidden)
5. **Given** an invitation has expired (past its expiry date), **When** the admin views it, **Then** the invitation is visually marked as expired

---

### Edge Cases

- What happens when the admin invites an email that already belongs to an existing user in the tenant? The system relies on backend validation and displays the returned error message.
- How does the system handle inviting the same email address twice (duplicate invitation)? The backend rejects duplicates and the UI displays the error.
- What happens when a resend action fails (e.g., email service unavailable)? The UI shows the error message returned by the backend.
- How does the UI indicate that an invitation has expired (past its 7-day window)? Expired invitations show an "Expired" badge and have resend/cancel actions disabled.
- What happens when the admin tries to cancel an already-cancelled invitation? The cancel action is hidden/disabled for non-"sent" invitations, preventing this scenario.
- How does the system handle very long email addresses in the list display? Email addresses are truncated with ellipsis if they exceed the column width.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a paginated list of all invitations for the current tenant, showing email, status, invited date, and expiry date
- **FR-002**: System MUST allow filtering invitations by status (all, sent, cancelled, accepted)
- **FR-003**: System MUST allow searching invitations by email address
- **FR-004**: System MUST allow admins to create a new invitation by providing an email address
- **FR-005**: System MUST validate the email format before submitting the invitation
- **FR-006**: System MUST allow admins to resend the invitation email for invitations with "sent" status
- **FR-007**: System MUST allow admins to cancel invitations with "sent" status, with a confirmation dialog
- **FR-008**: System MUST display appropriate status badges for each invitation status (sent, cancelled, accepted)
- **FR-009**: System MUST show a visual indicator when an invitation has expired (past its 7-day expiry window)
- **FR-010**: System MUST disable resend and cancel actions for invitations that are not in "sent" status or that have expired
- **FR-011**: System MUST restrict invitation management to admin users only
- **FR-012**: System MUST show a success notification after creating, resending, or cancelling an invitation
- **FR-013**: System MUST show appropriate error messages when backend operations fail

### Key Entities

- **Invitation**: Represents a pending user onboarding request. Key attributes: unique identifier, invitee email address, current status (sent/cancelled/accepted), optional role template reference, inviting admin reference, creation timestamp, expiry timestamp (7 days from creation), acceptance timestamp (null until accepted)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admins can create and send a user invitation in under 30 seconds
- **SC-002**: Invitation list page loads and displays all invitations within 2 seconds
- **SC-003**: All invitation statuses (sent, cancelled, accepted, expired) are clearly distinguishable at a glance
- **SC-004**: Admins can find a specific invitation by email using search in under 5 seconds
- **SC-005**: 100% of invitation actions (create, resend, cancel) provide clear feedback on success or failure
- **SC-006**: The invitation management interface requires no training for admins familiar with the existing user management UI

## Assumptions

- Invitation email delivery is handled entirely by the backend; the frontend only triggers the action
- The 7-day expiry period is fixed by the backend and not configurable by admins
- Role template assignment during invitation creation is optional; if omitted, the invited user gets default tenant roles
- The backend handles duplicate email detection and returns appropriate error messages
- Expired invitations remain visible in the list but cannot be acted upon (resend/cancel)
- The invitation list is accessible only to users with admin or super_admin roles

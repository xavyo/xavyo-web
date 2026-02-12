# Feature Specification: Power of Attorney & Identity Delegation

**Feature Branch**: `030-power-of-attorney`
**Created**: 2026-02-12
**Status**: Draft
**Input**: Phase 030 — Governance feature enabling temporary identity delegation for users to act on behalf of others

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Grant and Manage Power of Attorney (Priority: P1)

As a user planning an absence or needing to delegate authority, I want to grant another user temporary Power of Attorney so they can act on my behalf within a defined scope and time window. I also want to view all my outgoing and incoming PoA grants and revoke them when no longer needed.

**Why this priority**: This is the foundational capability — without the ability to grant, view, and revoke PoA, no other delegation features are possible. It delivers immediate value for planned absences and delegation scenarios.

**Independent Test**: Can be fully tested by granting a PoA from one user to another, verifying it appears in both users' lists (outgoing for grantor, incoming for grantee), and revoking it. Delivers the core delegation management value.

**Acceptance Scenarios**:

1. **Given** I am a logged-in user, **When** I navigate to the PoA page and fill out the grant form with a grantee, scope (applications and workflow types), start date, end date, and reason, **Then** a new PoA grant is created with "pending" or "active" status depending on the start date.
2. **Given** I have granted PoA to another user, **When** I view my outgoing PoA list, **Then** I see the grant with its status, grantee name, scope summary, and date range.
3. **Given** another user has granted me PoA, **When** I view my incoming PoA list, **Then** I see the grant with its status, grantor name, scope summary, and date range.
4. **Given** I have an active or pending PoA grant I created, **When** I revoke it with an optional reason, **Then** the grant status changes to "revoked" and the grantee can no longer use it.
5. **Given** I am creating a PoA grant, **When** I set an end date more than 90 days from the start date, **Then** the system rejects the grant and displays a validation error about the maximum duration.
6. **Given** I am creating a PoA grant, **When** I set a start date in the past, **Then** the system rejects the grant and displays a validation error.

---

### User Story 2 - Assume and Drop Delegated Identity (Priority: P1)

As a grantee with an active PoA, I want to assume the grantor's identity so I can perform actions on their behalf within the granted scope. When I am done, I want to drop the assumed identity and return to my own.

**Why this priority**: Identity assumption is the core value proposition of PoA — without it, the grants are merely records with no operational effect. This must work alongside US1 to deliver a functional delegation system.

**Independent Test**: Can be tested by having a grantee click "Assume Identity" on an active incoming PoA, verifying the system indicates they are now acting as the grantor, performing an action, then clicking "Drop Identity" and verifying they return to their own context.

**Acceptance Scenarios**:

1. **Given** I have an active incoming PoA grant, **When** I click "Assume Identity" on the PoA detail page, **Then** the system transitions me to operate under the grantor's identity and I see a prominent visual indicator showing whose identity I have assumed.
2. **Given** I am currently operating under an assumed identity, **When** I click "Drop Identity", **Then** I return to my own identity and the assumed-identity indicator disappears.
3. **Given** I am currently operating under an assumed identity, **When** I view the current assumption status, **Then** I see the grantor's name, the PoA ID, and when the assumption expires.
4. **Given** I have an incoming PoA with "pending" status (future start date), **When** I try to assume the identity, **Then** the system prevents me and shows a message that the grant is not yet active.
5. **Given** I have an incoming PoA with "expired" or "revoked" status, **When** I try to assume the identity, **Then** the system prevents me and shows a message that the grant is no longer valid.

---

### User Story 3 - Admin PoA Management (Priority: P1)

As an administrator, I want to view all PoA grants across the organization and force-revoke any grant if needed for security or compliance reasons.

**Why this priority**: Admin oversight is critical for a security-sensitive feature like identity delegation. Admins must be able to intervene if a PoA is misused or if an emergency requires revoking delegation authority.

**Independent Test**: Can be tested by an admin viewing the admin PoA list, filtering by status and user, and force-revoking a specific grant. Delivers organizational oversight and compliance control.

**Acceptance Scenarios**:

1. **Given** I am an admin, **When** I navigate to the admin PoA management view, **Then** I see a list of all PoA grants across the organization with grantor, grantee, status, scope, and date range.
2. **Given** I am an admin viewing the PoA list, **When** I filter by status (active, pending, expired, revoked), **Then** only matching grants are displayed.
3. **Given** I am an admin viewing the PoA list, **When** I filter by grantor or grantee, **Then** only grants involving that user are displayed.
4. **Given** I am an admin, **When** I force-revoke an active PoA grant with a reason, **Then** the grant status changes to "revoked" and any active identity assumption under that grant is terminated.
5. **Given** I am a non-admin user, **When** I try to access the admin PoA management view, **Then** the admin tab is not visible to me.

---

### User Story 4 - PoA Audit Trail (Priority: P2)

As a user or administrator, I want to view the complete audit trail for any PoA grant to understand its lifecycle and track who assumed identity when.

**Why this priority**: Audit trails are essential for compliance and security review but are secondary to the core grant/assume/admin functionality. They add visibility without being required for basic operation.

**Independent Test**: Can be tested by viewing the audit trail for a PoA that has been granted, assumed, dropped, and extended. Verifies that all lifecycle events are recorded with timestamps and actor information.

**Acceptance Scenarios**:

1. **Given** a PoA grant exists with multiple lifecycle events, **When** I view the audit trail on the PoA detail page, **Then** I see a chronological list of events (granted, activated, assumed, dropped, extended, revoked, expired) with timestamps and actor names.
2. **Given** I am viewing an audit trail with many events, **When** I filter by event type, **Then** only matching events are displayed.
3. **Given** I am viewing an audit trail, **When** I filter by date range, **Then** only events within that range are displayed.
4. **Given** I am viewing the audit trail, **Then** each event shows the event type, timestamp, the user who performed the action, and any relevant details (e.g., revocation reason, new end date for extensions).

---

### User Story 5 - PoA Extension (Priority: P2)

As a grantor, I want to extend the duration of an active PoA if the original time window is insufficient, without having to create a new grant.

**Why this priority**: Extension is a convenience feature that avoids the overhead of revoking and re-granting. It is important for real-world scenarios but secondary to the core grant/assume flow.

**Independent Test**: Can be tested by extending an active PoA to a new end date and verifying the updated date is reflected in the detail view. The extension must respect the 90-day maximum from the original start date.

**Acceptance Scenarios**:

1. **Given** I have an active PoA grant I created, **When** I extend it to a new end date within the 90-day maximum, **Then** the grant's end date is updated and an "extended" audit event is recorded.
2. **Given** I have an active PoA grant, **When** I try to extend it beyond 90 days from the original start date, **Then** the system rejects the extension with a validation error.
3. **Given** I have a revoked or expired PoA grant, **When** I try to extend it, **Then** the system prevents the extension since only active grants can be extended.

---

### User Story 6 - Assumed Identity Indicator (Priority: P3)

As a user operating under an assumed identity, I want a persistent, prominent indicator in the application header that shows whose identity I am using and provides a one-click way to drop the assumed identity.

**Why this priority**: While identity assumption works without a global indicator (US2 covers the mechanics), a persistent header indicator significantly improves safety by making it impossible to forget you are acting as someone else. This reduces risk of unintended actions.

**Independent Test**: Can be tested by assuming an identity and verifying the indicator appears globally across all pages, then clicking the drop button and verifying it disappears.

**Acceptance Scenarios**:

1. **Given** I am operating under an assumed identity, **When** I navigate to any page in the application, **Then** I see a persistent indicator in the header showing "Acting as [Grantor Name]" with a distinct visual style (e.g., warning color).
2. **Given** the assumed-identity indicator is showing, **When** I click the "Drop" button within the indicator, **Then** my identity assumption is ended and the indicator disappears.
3. **Given** I am not operating under an assumed identity, **When** I view any page, **Then** the assumed-identity indicator is not shown.

---

### Edge Cases

- What happens when a PoA grant's end date passes while the grantee is actively assuming the identity? The system should automatically end the assumption and notify the user.
- What happens when an admin force-revokes a PoA while the grantee is actively assuming the identity? The active assumption should be terminated immediately.
- What happens when a user tries to grant PoA to themselves? The system should reject self-delegation.
- What happens when a user tries to create a duplicate PoA (same grantor, grantee, overlapping dates)? The system should allow it (different scope may be intended) but warn if identical scope overlaps.
- What happens when the grantee's account is disabled while they have active PoA grants? The grants should remain but the disabled user cannot assume any identity.
- What happens when the grantor's account is disabled? Active assumptions should be terminated and the grant should be effectively suspended.
- What happens when a user tries to extend a PoA that has already been extended to the maximum? The system should show a clear error that the 90-day maximum has been reached.
- How does the system handle concurrent assumption attempts (grantee tries to assume while already assuming another identity)? Only one identity can be assumed at a time; the user must drop the current assumption first.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to grant Power of Attorney to any other user in the same tenant by specifying scope, date range, and reason
- **FR-002**: System MUST enforce a maximum PoA duration of 90 days from start date to end date
- **FR-003**: System MUST validate that start date is current or future, and end date is after start date
- **FR-004**: System MUST prevent users from granting PoA to themselves
- **FR-005**: Users MUST be able to view their PoA grants organized by direction (incoming grants where they are grantee, outgoing grants where they are grantor)
- **FR-006**: Users MUST be able to revoke any PoA grant they created, with an optional revocation reason
- **FR-007**: Grantees with an active PoA MUST be able to assume the grantor's identity, receiving a new session context that operates as the grantor
- **FR-008**: Users operating under an assumed identity MUST be able to drop the assumption and return to their own identity at any time
- **FR-009**: System MUST allow only one identity assumption at a time per user — users must drop the current assumption before assuming another
- **FR-010**: System MUST display a persistent, prominent visual indicator when a user is operating under an assumed identity
- **FR-011**: Administrators MUST be able to view all PoA grants across the organization with filtering by status, grantor, and grantee
- **FR-012**: Administrators MUST be able to force-revoke any PoA grant, which terminates any active identity assumption under that grant
- **FR-013**: Users MUST be able to extend an active PoA grant to a new end date, as long as the total duration does not exceed 90 days
- **FR-014**: System MUST record an audit trail for every PoA lifecycle event: granted, activated, assumed, dropped, extended, revoked, expired
- **FR-015**: Users and administrators MUST be able to view the audit trail for any PoA grant, with filtering by event type and date range
- **FR-016**: PoA scope MUST be definable by applications and workflow types, allowing grantors to limit what the grantee can do on their behalf
- **FR-017**: System MUST support pagination for all list views (user PoA list, admin PoA list, audit trail)
- **FR-018**: PoA grants MUST have a status lifecycle: pending (future start) → active (within date range) → expired (past end date), with revoked as a terminal state reachable from pending or active

### Key Entities

- **Power of Attorney Grant**: Represents a delegation of authority from one user (grantor) to another (grantee). Key attributes: grantor, grantee, scope (applications and workflow types), start date, end date, reason, status (pending/active/expired/revoked), creation timestamp.
- **PoA Scope**: Defines the boundaries of the delegation — which applications the grantee can access and which workflow types (e.g., approvals, certifications) they can perform on behalf of the grantor.
- **PoA Audit Event**: Records each significant action in a PoA's lifecycle. Key attributes: event type, timestamp, actor (who performed the action), details (reason, new dates, etc.).
- **Identity Assumption**: A transient state representing a user currently operating as another user. Key attributes: the active PoA grant, the assumed user, expiration time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can grant a new PoA in under 2 minutes, including selecting a grantee, defining scope, and setting dates
- **SC-002**: Grantees can assume a delegated identity in under 5 seconds from clicking the assume button
- **SC-003**: Users can identify they are operating under an assumed identity within 1 second of any page load (indicator is always visible)
- **SC-004**: Administrators can find and force-revoke any PoA grant within 30 seconds using the admin list with filters
- **SC-005**: 100% of PoA lifecycle events are captured in the audit trail with no gaps
- **SC-006**: Users can view and filter their PoA list (incoming/outgoing) with results appearing within 2 seconds
- **SC-007**: The PoA extension flow completes in under 30 seconds with clear validation feedback for 90-day limit violations

## Assumptions

- Users in the same tenant can grant PoA to any other user in that tenant without pre-approval workflows (the grant itself is the authorization)
- The backend handles PoA status transitions automatically (pending → active based on start date, active → expired based on end date)
- Identity assumption replaces the user's session token with a delegated token; the original token is preserved for restoration when dropping the assumption
- The assumed-identity indicator is a global UI element visible on all authenticated pages, not just the PoA management pages
- PoA scope (application_ids and workflow_types) is informational/advisory in this phase; actual enforcement of scope boundaries is handled by the backend authorization layer
- Non-admin users can only see PoA grants where they are either the grantor or the grantee
- The audit trail is read-only and cannot be modified or deleted
- A user can have multiple active PoA grants (both incoming and outgoing) simultaneously, but can only assume one identity at a time

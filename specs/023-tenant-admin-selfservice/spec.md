# Feature Specification: Tenant Administration & Self-Service Dashboards

**Feature Branch**: `023-tenant-admin-selfservice`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Tenant Branding & OAuth Clients (Phase 023): Implement admin UI for tenant branding, OAuth client management, user group management, and self-service reviewer dashboards (My Approvals, My Certifications)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tenant Branding Customization (Priority: P1)

A tenant administrator wants to customize the look and feel of their identity platform to match their organization's brand. They navigate to branding settings, update the logo URLs, color scheme, and login page text, then save. The changes take effect across the tenant's login pages and email templates.

**Why this priority**: Branding is a fundamental tenant configuration capability. Every organization deploying the platform needs their brand identity reflected. This is high-visibility and directly impacts end-user perception.

**Independent Test**: Can be fully tested by navigating to branding settings, modifying colors and logo URLs, saving, and verifying the updated configuration is persisted.

**Acceptance Scenarios**:

1. **Given** an admin user on the branding settings page, **When** they update the primary color and logo URL and click Save, **Then** the system persists the changes and shows a success confirmation.
2. **Given** an admin viewing branding settings, **When** the page loads, **Then** all current branding values are displayed in the form fields.
3. **Given** a non-admin user, **When** they try to access branding settings, **Then** they are denied access (the settings tab is not visible).
4. **Given** an admin editing branding, **When** they enter an invalid URL for a logo field, **Then** the system shows a validation error before saving.
5. **Given** an admin editing branding, **When** they clear a non-required field (e.g., custom CSS), **Then** the system saves with that field empty.

---

### User Story 2 - OAuth Client Management (Priority: P1)

A tenant administrator needs to register and manage OAuth/OIDC clients that integrate with the identity platform. They create a new client specifying its name, type (confidential or public), redirect URIs, grant types, and scopes. The system generates a client_id and client_secret (for confidential clients). The admin can later view, edit, enable/disable, or delete clients.

**Why this priority**: OAuth client management is essential for any identity platform — external applications need registered clients to authenticate. Without this, no third-party integrations are possible.

**Independent Test**: Can be fully tested by creating a new OAuth client, verifying the generated credentials are displayed, then listing all clients and confirming the new one appears.

**Acceptance Scenarios**:

1. **Given** an admin on the OAuth clients page, **When** they click "Create Client" and fill in the form, **Then** the system creates the client and displays the client_id and client_secret (secret shown once, with copy button).
2. **Given** an admin viewing the client list, **When** the page loads, **Then** all registered clients are shown with name, client_id, type, grant types, and active status.
3. **Given** an admin viewing a client's detail page, **When** they click "Edit", **Then** they can modify the client's name, redirect URIs, scopes, and grant types.
4. **Given** an admin on a client detail page, **When** they toggle the client's active status, **Then** the client is enabled or disabled accordingly.
5. **Given** an admin on a client detail page, **When** they click "Delete" and confirm, **Then** the client is removed from the system.
6. **Given** a non-admin user, **When** they try to access OAuth client management, **Then** they are denied access.

---

### User Story 3 - User Group Management (Priority: P2)

A tenant administrator manages user groups for organizational purposes (distinct from governance approval groups). They can create groups, add or remove members, and manage group metadata. Groups provide a way to organize users by department, team, or function.

**Why this priority**: User groups are a foundational organizational concept but are not blocking other features. They enhance user management and can feed into governance processes.

**Independent Test**: Can be fully tested by creating a group, adding members to it, viewing the group detail, and verifying the member list.

**Acceptance Scenarios**:

1. **Given** an admin on the groups page, **When** the page loads, **Then** all groups are listed with name, description, and member count.
2. **Given** an admin, **When** they click "Create Group" and submit a name and description, **Then** the system creates the group and redirects to the group detail page.
3. **Given** an admin on a group detail page, **When** they add a user to the group, **Then** the member list updates to include that user and the member count increases.
4. **Given** an admin on a group detail page, **When** they remove a member, **Then** the member is removed and the count decreases.
5. **Given** an admin on a group detail page, **When** they click "Edit" and modify the group name, **Then** the changes are saved.
6. **Given** an admin on a group detail page, **When** they click "Delete" and confirm, **Then** the group is deleted and they are redirected to the groups list.

---

### User Story 4 - My Approvals Dashboard (Priority: P2)

A user who is designated as an approver (via approval workflows) needs a dedicated page to see all pending approval requests assigned to them. They can review each request's details, then approve or reject it with a justification comment. They can also view their completed approval history.

**Why this priority**: Approvers need a centralized place to act on pending requests. Without this, the approval workflow is incomplete — requests exist but approvers have no interface to process them.

**Independent Test**: Can be fully tested by navigating to "My Approvals", viewing pending items, and performing an approve or reject action on a request.

**Acceptance Scenarios**:

1. **Given** a user who is an approver, **When** they navigate to My Approvals, **Then** they see a list of pending approval requests assigned to them.
2. **Given** a pending approval request, **When** the approver clicks on it, **Then** they see the request details: requester identity, requested resource, reason, submission date.
3. **Given** a pending approval, **When** the approver clicks "Approve" and provides a comment, **Then** the request is approved and moves to completed status.
4. **Given** a pending approval, **When** the approver clicks "Reject" and provides a justification, **Then** the request is rejected with the given reason.
5. **Given** a user on My Approvals, **When** they filter by "Completed", **Then** they see their past approval decisions.
6. **Given** a user with no pending approvals, **When** they navigate to My Approvals, **Then** they see an empty state message indicating no pending items.

---

### User Story 5 - My Certifications Dashboard (Priority: P3)

A user assigned as a certification reviewer needs a page to see all certification items assigned to them across active campaigns. Each item shows the user being reviewed, their entitlements, and the campaign deadline. The reviewer can certify (confirm continued access) or revoke (recommend removal) for each item.

**Why this priority**: Completes the certification workflow loop. Certification campaigns already exist; this gives individual reviewers their action interface.

**Independent Test**: Can be fully tested by navigating to "My Certifications", viewing assigned items, and performing certify or revoke actions.

**Acceptance Scenarios**:

1. **Given** a reviewer user, **When** they navigate to My Certifications, **Then** they see a list of certification items assigned to them.
2. **Given** a certification item, **When** the reviewer views it, **Then** they see the user under review, their entitlements, campaign name, and deadline.
3. **Given** a pending certification item, **When** the reviewer clicks "Certify", **Then** the item is marked as certified.
4. **Given** a pending certification item, **When** the reviewer clicks "Revoke", **Then** the item is marked for revocation.
5. **Given** a reviewer, **When** they filter by campaign, **Then** only items from that campaign are shown.
6. **Given** a reviewer with no assigned items, **When** they navigate to My Certifications, **Then** they see an empty state.

---

### Edge Cases

- What happens when an admin tries to delete an OAuth client that is actively in use by sessions? The system should warn but allow deletion (sessions using that client will fail on next token refresh).
- What happens when an admin saves branding with a very long custom CSS string? The system should accept it up to a reasonable limit (e.g., 10KB).
- What happens when a group member is deleted from the system? The member should be automatically removed from group membership.
- What happens when an approver approves a request that was already processed by another approver? The system should show a message that the request is no longer pending.
- What happens when a certification campaign expires while a reviewer has pending items? The items should show as expired/closed and actions should be disabled.
- What happens when the same user is both an approver and a requester for the same request? The system should allow this (self-approval may be controlled by workflow rules).

## Requirements *(mandatory)*

### Functional Requirements

**Branding:**
- **FR-001**: System MUST allow admins to view current tenant branding configuration.
- **FR-002**: System MUST allow admins to update any subset of branding fields (partial update).
- **FR-003**: System MUST validate URL fields (logo, favicon, background) as valid URL format before saving.
- **FR-004**: System MUST restrict branding management to admin users only.

**OAuth Clients:**
- **FR-005**: System MUST display a list of all registered OAuth clients with name, client_id, type, grant types, and active status.
- **FR-006**: System MUST allow admins to create new OAuth clients with name, client type (confidential/public), redirect URIs, grant types, and scopes.
- **FR-007**: System MUST display the client_secret exactly once after creation, with a copy-to-clipboard action.
- **FR-008**: System MUST allow admins to edit client configuration (name, redirect URIs, scopes, grant types).
- **FR-009**: System MUST allow admins to enable or disable individual clients.
- **FR-010**: System MUST allow admins to delete clients with a confirmation step.
- **FR-011**: System MUST restrict OAuth client management to admin users only.

**Groups:**
- **FR-012**: System MUST display a list of user groups with name, description, and member count.
- **FR-013**: System MUST allow admins to create groups with name and optional description.
- **FR-014**: System MUST allow admins to view group details including the list of members.
- **FR-015**: System MUST allow admins to add users to a group.
- **FR-016**: System MUST allow admins to remove users from a group.
- **FR-017**: System MUST allow admins to edit group name and description.
- **FR-018**: System MUST allow admins to delete groups with a confirmation step.

**My Approvals:**
- **FR-019**: System MUST display pending approval requests assigned to the current user.
- **FR-020**: System MUST show request details: requester, requested resource, reason, submission date.
- **FR-021**: System MUST allow the approver to approve a request with an optional comment.
- **FR-022**: System MUST allow the approver to reject a request with a required justification.
- **FR-023**: System MUST support filtering approvals by status (pending, completed).
- **FR-024**: System MUST show an empty state when no approvals are pending.

**My Certifications:**
- **FR-025**: System MUST display certification items assigned to the current reviewer.
- **FR-026**: System MUST show item details: user being certified, entitlements, campaign name, deadline.
- **FR-027**: System MUST allow the reviewer to certify (approve continued access) for an item.
- **FR-028**: System MUST allow the reviewer to revoke (recommend removal) for an item.
- **FR-029**: System MUST support filtering certification items by campaign.
- **FR-030**: System MUST show an empty state when no certification items are assigned.

### Key Entities

- **BrandingConfig**: Tenant-level appearance settings including logos, colors, fonts, login page content, and legal URLs. One per tenant. Partially updatable.
- **OAuthClient**: A registered application that authenticates via OAuth/OIDC. Has a client_id (public), client_secret (confidential only, shown once), redirect URIs, grant types, scopes, and active status.
- **UserGroup**: An organizational grouping of users. Has a name, description, and a set of member users. Distinct from governance approval groups.
- **ApprovalItem**: A pending or completed approval decision assigned to a specific approver. Links to the underlying access request.
- **CertificationItem**: A review task assigned to a certification reviewer. Links to the user being certified, their entitlements, and the parent campaign.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can update tenant branding in under 2 minutes and see changes reflected.
- **SC-002**: Admins can create a new OAuth client and copy the client secret in under 1 minute.
- **SC-003**: Admins can create a user group and add members in under 2 minutes.
- **SC-004**: Approvers can process (approve/reject) a pending request in under 30 seconds from the My Approvals page.
- **SC-005**: Certification reviewers can process (certify/revoke) an item in under 30 seconds.
- **SC-006**: All five feature areas are accessible only to authorized users (admin-only for branding/OAuth/groups; all authenticated users for My Approvals/My Certifications).
- **SC-007**: Empty states are displayed when no data exists for any of the feature areas.
- **SC-008**: All list views support pagination for datasets exceeding one page of results.

## Assumptions

- Branding changes are persisted immediately on save; no "publish" or "draft" workflow is needed.
- OAuth client_secret is generated server-side and returned only in the create response. The frontend must capture and display it once.
- User groups in this feature are administrative groups (under `/admin/groups`), distinct from governance approval groups (under `/governance/approval-groups`).
- "My Approvals" and "My Certifications" are available to all authenticated users, not just admins — any user can be an approver or certification reviewer.
- Pagination follows the existing project pattern: offset/limit with total count.
- The branding "preview" is a simple side-by-side form display, not a live preview of the login page.

## Out of Scope

- Live login page preview with branding changes (would require iframe rendering of the actual login page).
- OAuth client secret rotation (regenerating a new secret for an existing client).
- SCIM token management (separate authentication mechanism).
- Bulk operations on groups (bulk add/remove members via CSV import).
- Approval delegation (reassigning pending approvals to another user).
- Certification campaign creation or management (already exists in governance).

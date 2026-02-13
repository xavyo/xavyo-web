# Feature Specification: Governance Core

**Feature Branch**: `012-governance-core`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Phase 012: Governance Core — Add identity governance and administration capabilities to the xavyo-web platform."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entitlement Management (Priority: P1)

An administrator navigates to the Governance section and manages entitlements — the permissions, roles, and access rights available within the organization. Each entitlement has a name, description, category, data classification level (public, internal, confidential, restricted), and a risk score (low, medium, high, critical). The admin can list all entitlements with pagination and search, create new entitlements, view entitlement details, edit existing entitlements, and delete unused ones.

**Why this priority**: Entitlements are the foundational building block for all governance features. Access requests, SoD rules, and certification campaigns all reference entitlements. Without entitlement management, no other governance feature can function.

**Independent Test**: Can be fully tested by creating, listing, editing, and deleting entitlements. Delivers immediate value by giving administrators a catalog of all access rights in the organization.

**Acceptance Scenarios**:

1. **Given** an admin on the entitlements page, **When** they click "Create Entitlement", fill in the form (name, description, category, classification, risk level), and submit, **Then** a new entitlement is created and appears in the list.
2. **Given** an admin on the entitlements page with multiple entitlements, **When** they use pagination controls, **Then** they can navigate through pages of results (20 per page default).
3. **Given** an admin viewing an entitlement detail page, **When** they click "Edit" and modify fields, **Then** the entitlement is updated with the new values.
4. **Given** an admin viewing an entitlement detail page, **When** they click "Delete" and confirm, **Then** the entitlement is removed from the system.
5. **Given** an admin on the entitlements page, **When** they filter by classification level or risk level, **Then** only matching entitlements are shown.

---

### User Story 2 - Access Request Workflows (Priority: P2)

Users can browse available entitlements and request access to those they need. Each request includes a justification. Administrators see all pending requests, can review the request details, and approve or reject them with an optional comment. Users can view their own requests and see the current status (pending, approved, rejected, cancelled). Users can cancel their own pending requests.

**Why this priority**: Access requests are the primary interaction between regular users and the governance system. They enable self-service access management, reducing administrative overhead and providing an audit trail for access grants.

**Independent Test**: Can be tested by having a user submit an access request and an admin approve/reject it. Delivers value by enabling controlled, auditable access provisioning.

**Acceptance Scenarios**:

1. **Given** a user on the access request page, **When** they select an entitlement, provide a justification, and submit, **Then** a new access request is created with status "pending".
2. **Given** an admin on the access requests list, **When** they view a pending request, **Then** they see the requester, requested entitlement, justification, and submission date.
3. **Given** an admin viewing a pending request, **When** they click "Approve" and optionally add a comment, **Then** the request status changes to "approved".
4. **Given** an admin viewing a pending request, **When** they click "Reject" and provide a reason, **Then** the request status changes to "rejected".
5. **Given** a user viewing their own pending request, **When** they click "Cancel", **Then** the request status changes to "cancelled".
6. **Given** a user on the "My Requests" page, **When** they view the list, **Then** they see all their requests with current status, sorted by most recent.

---

### User Story 3 - Separation of Duties Rules (Priority: P3)

An administrator defines SoD constraint rules that identify incompatible entitlement pairs — combinations of access rights that should not be held by the same person (e.g., "Create Purchase Order" conflicts with "Approve Purchase Order"). The system detects and reports violations when users hold conflicting entitlements. Admins can list all rules, create new rules, edit existing rules, delete rules, and view a report of current violations.

**Why this priority**: SoD enforcement is a critical compliance control in identity governance. It depends on the entitlement catalog (US1) being in place but adds significant value for audit and compliance scenarios.

**Independent Test**: Can be tested by creating SoD rules and checking the violations report. Delivers value by proactively identifying compliance risks.

**Acceptance Scenarios**:

1. **Given** an admin on the SoD rules page, **When** they click "Create Rule", select two conflicting entitlements, provide a name and description, and submit, **Then** a new SoD rule is created.
2. **Given** an admin on the SoD rules list, **When** they view the list, **Then** they see all rules with the entitlement pair names, severity, and creation date.
3. **Given** an admin viewing a SoD rule, **When** they click "Edit" and modify the description or severity, **Then** the rule is updated.
4. **Given** an admin viewing a SoD rule, **When** they click "Delete" and confirm, **Then** the rule is removed.
5. **Given** an admin on the SoD violations page, **When** they view the report, **Then** they see all current violations listing the user, the conflicting entitlements, and the violated rule.

---

### User Story 4 - Certification Campaigns (Priority: P4)

An administrator creates certification campaigns — periodic access review processes where designated reviewers verify that users still need their current access. Campaigns have a lifecycle: draft (configuration), active (review in progress), completed (all items reviewed). Each campaign targets a scope (e.g., all users, a specific department) and has a deadline. Reviewers see their assigned items and can certify (keep access) or revoke (remove access) each one.

**Why this priority**: Certification campaigns are a core governance control for periodic access reviews. They depend on entitlements (US1) existing and are typically the last governance workflow implemented, as organizations first need the catalog and request flows in place.

**Independent Test**: Can be tested by creating a campaign, starting it, and certifying/revoking items. Delivers value by enabling periodic access reviews for compliance.

**Acceptance Scenarios**:

1. **Given** an admin on the certifications page, **When** they click "Create Campaign", fill in the name, description, scope, and deadline, and submit, **Then** a new campaign is created in "draft" status.
2. **Given** an admin viewing a draft campaign, **When** they click "Start Campaign", **Then** the campaign status changes to "active" and review items are generated.
3. **Given** an admin viewing an active campaign, **When** they view the campaign items, **Then** they see each user-entitlement pair that needs review, with the user name, entitlement name, and current decision status.
4. **Given** a reviewer viewing a campaign item, **When** they click "Certify", **Then** the item is marked as certified (access retained).
5. **Given** a reviewer viewing a campaign item, **When** they click "Revoke", **Then** the item is marked as revoked (access to be removed).
6. **Given** an admin viewing an active campaign where all items have been reviewed, **When** they view the campaign, **Then** the campaign shows completion progress and can be marked as completed.

---

### User Story 5 - Risk Dashboard (Priority: P5)

An administrator views an aggregated risk dashboard showing the overall risk posture of the organization. The dashboard displays a risk summary (total risk score, distribution by level), a list of top-risk users (sorted by aggregate risk score), and the distribution of entitlements by risk level. This provides at-a-glance visibility into governance health.

**Why this priority**: The risk dashboard provides visibility and decision-support but does not enable new workflows. It synthesizes data from entitlements (US1) and is most valuable when the governance system is populated.

**Independent Test**: Can be tested by viewing the dashboard page with populated entitlements. Delivers value by providing a consolidated risk overview.

**Acceptance Scenarios**:

1. **Given** an admin on the governance overview page, **When** the dashboard loads, **Then** they see a risk summary with total count of entitlements by risk level (low, medium, high, critical).
2. **Given** an admin on the risk dashboard, **When** they view the "Top Risk Users" section, **Then** they see a ranked list of users with the highest aggregate risk scores.
3. **Given** an admin on the risk dashboard, **When** they view the risk distribution, **Then** they see a breakdown of entitlements by classification level and risk level.
4. **Given** an admin on the risk dashboard with no entitlements in the system, **When** the dashboard loads, **Then** they see an empty state with a prompt to create entitlements.

---

### Edge Cases

- What happens when an admin tries to delete an entitlement that is referenced by active SoD rules or pending access requests?
- What happens when a user requests an entitlement that would create a SoD violation?
- What happens when a certification campaign deadline passes with unreviewed items?
- How does the system handle concurrent approve/reject actions on the same access request?
- What happens when all entitlements in a SoD rule pair are deleted?
- What happens when a user cancels a request that was already approved/rejected by an admin?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to create, list, view, edit, and delete entitlements.
- **FR-002**: Each entitlement MUST have a name, description, category, data classification level (public, internal, confidential, restricted), and risk level (low, medium, high, critical).
- **FR-003**: Entitlement listing MUST support pagination with configurable page size.
- **FR-004**: Entitlement listing MUST support filtering by classification level and risk level.
- **FR-005**: System MUST allow authenticated users to submit access requests for specific entitlements with a justification.
- **FR-006**: System MUST allow administrators to approve or reject pending access requests with an optional comment.
- **FR-007**: Users MUST be able to view their own access requests and current statuses.
- **FR-008**: Users MUST be able to cancel their own pending access requests.
- **FR-009**: Access request lifecycle MUST follow: pending → approved/rejected/cancelled (terminal states).
- **FR-010**: System MUST allow administrators to create, list, view, edit, and delete SoD rules.
- **FR-011**: Each SoD rule MUST reference exactly two entitlements that are considered incompatible.
- **FR-012**: System MUST provide a violations report showing users who hold conflicting entitlement pairs.
- **FR-013**: System MUST allow administrators to create certification campaigns with a name, description, scope, and deadline.
- **FR-014**: Certification campaigns MUST follow the lifecycle: draft → active → completed.
- **FR-015**: When a campaign is started, the system MUST generate review items for each user-entitlement pair in the campaign scope.
- **FR-016**: Reviewers MUST be able to certify (keep) or revoke (remove) access for each campaign item.
- **FR-017**: System MUST display an aggregated risk dashboard with risk distribution and top-risk users.
- **FR-018**: All governance administration features MUST be restricted to users with the admin role.
- **FR-019**: Access request submission and "my requests" view MUST be available to all authenticated users.
- **FR-020**: The governance section MUST be accessible via the main sidebar navigation for admin users.

### Key Entities

- **Entitlement**: A named permission, role, or access right. Has a category, data classification level, risk level, and description. Referenced by access requests, SoD rules, and certification items.
- **Access Request**: A user's request for a specific entitlement. Has a requester, target entitlement, justification, status (pending/approved/rejected/cancelled), reviewer comment, and timestamps.
- **SoD Rule**: A constraint defining two incompatible entitlements. Has a name, description, severity, and references to exactly two entitlements.
- **SoD Violation**: A detected instance where a user holds both entitlements in a SoD rule pair. Has the user, the violated rule, and the two conflicting entitlements.
- **Certification Campaign**: A periodic access review process. Has a name, description, scope, deadline, status (draft/active/completed), and a collection of review items.
- **Certification Item**: A single user-entitlement pair within a campaign. Has a user, entitlement, decision (pending/certified/revoked), and reviewer.
- **Risk Dashboard Data**: Aggregate metrics including total risk by level, top-risk users, and entitlement distribution by classification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create, view, edit, and delete entitlements within 3 clicks from the governance page.
- **SC-002**: Users can submit an access request (select entitlement, add justification, submit) in under 60 seconds.
- **SC-003**: Administrators can process (approve/reject) an access request in under 30 seconds.
- **SC-004**: The SoD violations report loads and displays all current violations within 3 seconds.
- **SC-005**: Certification campaign items can be reviewed (certify/revoke) at a rate of at least 10 items per minute.
- **SC-006**: The risk dashboard displays all aggregate metrics on a single page without scrolling past the fold.
- **SC-007**: 100% of governance admin features are inaccessible to non-admin users.
- **SC-008**: All governance pages maintain a consistent look and feel with existing application pages (federation, users, NHI).

## Assumptions

- The backend already provides all governance endpoints as described. No backend changes are needed.
- Entitlement categories are free-form text fields (not a predefined list).
- Data classification levels are a fixed set: public, internal, confidential, restricted.
- Risk levels are a fixed set: low, medium, high, critical.
- Access request approval is single-level (one admin approves/rejects). Multi-level approval chains are handled by the backend if configured.
- Certification campaign scope is configured at creation time and determined by the backend (the frontend sends scope parameters, the backend generates items).
- The risk dashboard data is computed server-side; the frontend only renders the aggregated results.
- SoD violation detection is performed server-side; the frontend queries and displays results.

## Out of Scope

- Automated remediation of SoD violations (display-only in this phase).
- Bulk import/export of entitlements.
- Custom approval workflows with multiple approval levels in the UI (backend may support this, but the UI shows single-level approve/reject).
- Email or push notifications for access request status changes.
- Role mining or entitlement discovery features.
- Historical risk trend charts (dashboard shows current snapshot only).

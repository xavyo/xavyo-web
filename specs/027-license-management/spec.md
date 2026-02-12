# Feature Specification: License Management

**Feature Branch**: `027-license-management`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "License Management — Admin UI for managing software license pools, assignments, reclamation rules, incompatibilities, analytics dashboard, and compliance reporting."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - License Pool Management (Priority: P1)

An admin needs to manage their organization's software license inventory by creating, viewing, editing, archiving, and deleting license pools. Each pool represents a specific software product with capacity limits, cost tracking, and expiration management.

**Why this priority**: License pools are the foundational entity — all other features (assignments, reclamation, incompatibilities, analytics) depend on pools existing first. Without pool CRUD, no other license management feature can function.

**Independent Test**: Can be fully tested by creating a license pool with capacity, vendor, cost, and expiration settings, then editing/archiving/deleting it. Delivers immediate value by providing a centralized license inventory.

**Acceptance Scenarios**:

1. **Given** an admin on the License Management hub, **When** they navigate to the Pools tab, **Then** they see a list of all license pools with name, vendor, capacity (allocated/total), utilization %, status badge, and expiration date
2. **Given** an admin clicks "Create Pool", **When** they fill in name, vendor, total capacity, cost per license, currency, billing period, license type, expiration date, expiration policy, and warning days, **Then** the pool is created and appears in the list
3. **Given** an existing pool, **When** the admin views its detail page, **Then** they see full pool information including utilization metrics (allocated count, available count, utilization %) and status
4. **Given** an existing pool with no active assignments, **When** the admin clicks "Delete", **Then** the pool is permanently removed
5. **Given** an existing active pool, **When** the admin clicks "Archive", **Then** the pool status changes to "Archived" and no new assignments can be made
6. **Given** a pool list, **When** the admin filters by vendor, license type, or status, **Then** the list updates to show only matching pools

---

### User Story 2 - License Assignment Management (Priority: P2)

An admin needs to assign licenses from pools to individual users, view all current assignments, deallocate licenses, and perform bulk operations (bulk assign to multiple users, bulk reclaim from inactive users).

**Why this priority**: Assignments are the primary operational action — connecting license pools to users. This is the core day-to-day workflow for license administrators.

**Independent Test**: Can be tested by assigning a license from a pool to a user, verifying the pool's allocated count increases, then deallocating and verifying it decreases. Bulk operations can be tested by selecting multiple users and assigning in one operation.

**Acceptance Scenarios**:

1. **Given** the Assignments tab, **When** an admin views it, **Then** they see a paginated list of all assignments with pool name, user email, source (Manual/Automatic/Entitlement), status badge, and assigned date
2. **Given** an admin clicks "Assign License", **When** they select a pool and a user, **Then** the license is assigned, the pool's allocated count increments, and the assignment appears in the list
3. **Given** an active assignment, **When** the admin clicks "Deallocate", **Then** the assignment is released and the pool's available count increases
4. **Given** an admin clicks "Bulk Assign", **When** they select a pool and multiple user IDs (up to 1000), **Then** all users receive assignments with a summary of successes and failures
5. **Given** an admin clicks "Bulk Reclaim", **When** they select a pool and multiple assignment IDs with a reason, **Then** those assignments are reclaimed with a summary result
6. **Given** the assignment list, **When** the admin filters by pool, user, status, or source, **Then** the list updates to show only matching assignments

---

### User Story 3 - Analytics Dashboard (Priority: P2)

An admin needs to view a dashboard showing license utilization metrics across all pools, cost breakdowns by vendor, optimization recommendations, and expiring pool alerts to make informed decisions about license procurement and management.

**Why this priority**: Analytics provides immediate business value by surfacing underutilized licenses (cost savings), over-utilized pools (capacity risk), and upcoming expirations (continuity risk). This is critical for management decision-making.

**Independent Test**: Can be tested by viewing the analytics dashboard and verifying summary cards (total pools, capacity, utilization %, monthly cost), per-pool stats, vendor cost breakdown, recommendations list, and expiring pools list are all displayed.

**Acceptance Scenarios**:

1. **Given** the Analytics tab, **When** an admin views it, **Then** they see summary cards: total pools, total capacity, total allocated, total available, overall utilization %, total monthly cost, and expiring-soon count
2. **Given** pools exist with varying utilization, **When** the admin views pool stats, **Then** each pool shows its name, vendor, capacity, allocated count, utilization %, monthly cost, status, and expiration date
3. **Given** pools from different vendors, **When** the admin views cost breakdown, **Then** they see a vendor cost table with pool count, capacity, allocated count, monthly cost, and currency per vendor
4. **Given** pools with varying utilization levels, **When** the admin views recommendations, **Then** they see actionable recommendations (Underutilized < 60%, High Utilization > 90%, Expiring Soon, Reclaim Opportunity) with potential savings
5. **Given** pools with expiration dates, **When** the admin views expiring pools, **Then** they see pools expiring within a configurable window (default 90 days) with days until expiration and expiration policy

---

### User Story 4 - Reclamation Rules (Priority: P3)

An admin needs to create and manage automatic reclamation rules that trigger license recovery from users based on inactivity thresholds or lifecycle state changes, with configurable notification periods before reclamation.

**Why this priority**: Reclamation rules automate license recovery, reducing manual overhead and ensuring optimal utilization. However, they build on top of pools and assignments, making them a lower initial priority.

**Independent Test**: Can be tested by creating a reclamation rule for a pool with an inactivity trigger, verifying it appears in the rules list, editing its threshold, enabling/disabling it, and deleting it.

**Acceptance Scenarios**:

1. **Given** the Reclamation Rules tab, **When** an admin views it, **Then** they see a list of rules with pool name, trigger type, threshold/state, notification days, enabled status, and creation date
2. **Given** an admin clicks "Create Rule", **When** they select a pool, choose "Inactivity" trigger with a threshold (e.g., 90 days) and notification period (e.g., 7 days before), **Then** the rule is created
3. **Given** an admin clicks "Create Rule", **When** they choose "Lifecycle State" trigger with a specific state (e.g., "terminated"), **Then** the rule is created with that lifecycle trigger
4. **Given** an existing rule, **When** the admin edits threshold days or notification period, **Then** the rule is updated
5. **Given** an existing rule, **When** the admin deletes it, **Then** it is removed from the list
6. **Given** the rules list, **When** the admin filters by pool, trigger type, or enabled status, **Then** the list updates accordingly

---

### User Story 5 - License Incompatibilities (Priority: P3)

An admin needs to define conflict rules between license pools to prevent users from holding incompatible licenses simultaneously (e.g., a "Professional" license and a "Basic" license for the same vendor).

**Why this priority**: Incompatibility rules enforce license compliance policies, preventing waste from dual licensing. Important for governance but less urgent than core pool/assignment/analytics operations.

**Independent Test**: Can be tested by creating an incompatibility rule between two pools, verifying it appears in the list, then attempting to assign both pools to the same user and seeing the conflict blocked.

**Acceptance Scenarios**:

1. **Given** the Incompatibilities tab, **When** an admin views it, **Then** they see a list of incompatibility rules with Pool A name, Pool B name, reason, and creation date
2. **Given** an admin clicks "Create Incompatibility", **When** they select Pool A, Pool B, and provide a reason, **Then** the rule is created (bidirectional — order doesn't matter)
3. **Given** an incompatibility rule exists between Pool A and Pool B, **When** a user already has a license from Pool A and an admin tries to assign Pool B, **Then** the assignment is rejected with an incompatibility error
4. **Given** an existing rule, **When** the admin clicks "Delete", **Then** the rule is removed and the constraint is lifted
5. **Given** the incompatibilities list, **When** the admin filters by pool, **Then** rules involving that pool are shown

---

### User Story 6 - License-Entitlement Links (Priority: P3)

An admin needs to link license pools to governance entitlements so that licenses can be automatically allocated when entitlements are granted, creating a seamless connection between the governance and license management systems.

**Why this priority**: Entitlement links enable automated license provisioning, reducing manual assignment overhead. However, this depends on the governance entitlements system being in use, making it a lower initial priority.

**Independent Test**: Can be tested by creating a link between a pool and an entitlement, verifying it appears in the links list, toggling its enabled/disabled status, and deleting it.

**Acceptance Scenarios**:

1. **Given** the Entitlement Links section (accessible from pool detail or a dedicated sub-tab), **When** an admin views it, **Then** they see links with pool name, entitlement name, priority, enabled status, and creation date
2. **Given** an admin clicks "Create Link", **When** they select a pool, an entitlement, and set priority, **Then** the link is created
3. **Given** an existing link, **When** the admin toggles its enabled status, **Then** the link is enabled/disabled accordingly
4. **Given** an existing link, **When** the admin clicks "Delete", **Then** the link is removed
5. **Given** the links list, **When** the admin filters by pool or entitlement, **Then** matching links are shown

---

### User Story 7 - Compliance Reporting (Priority: P3)

An admin needs to generate compliance reports showing license utilization and assignment status across pools, and view an audit trail of all license-related actions for regulatory compliance and internal auditing.

**Why this priority**: Compliance reporting is essential for audits and regulatory requirements but is typically needed periodically rather than daily, making it lower priority than core management operations.

**Independent Test**: Can be tested by generating a compliance report (optionally filtered by vendor or date range), verifying the report data, and viewing the audit trail with filters for pool, user, action, and date range.

**Acceptance Scenarios**:

1. **Given** the Compliance section, **When** an admin generates a compliance report, **Then** they see a report with pool utilization data, assignment compliance status, and expiration warnings
2. **Given** an admin generates a compliance report, **When** they filter by vendor and date range, **Then** the report only includes matching data
3. **Given** the Audit Trail view, **When** an admin views it, **Then** they see a paginated list of license events (pool created, license assigned, license reclaimed, etc.) with actor, timestamp, and details
4. **Given** the audit trail, **When** the admin filters by pool, user, action, or date range, **Then** the list updates to show only matching events

---

### Edge Cases

- What happens when a pool reaches 100% capacity and an admin tries to assign another license? (Assignment should be rejected with a clear capacity error message)
- What happens when an admin tries to delete a pool that has active assignments? (Deletion should be blocked with a message indicating active assignments exist)
- What happens when an assignment is attempted that violates an incompatibility rule? (Assignment should be rejected with a clear incompatibility error listing the conflicting pool)
- What happens when a pool expires with the "RevokeAll" policy? (All active assignments should be revoked and the pool status changes to Expired)
- What happens when bulk assign includes both valid and invalid user IDs? (Partial success — the response shows success count and individual failure reasons)
- What happens when an admin archives a pool that has reclamation rules? (Pool is archived; rules remain but are effectively inactive since no new assignments can be made)
- How does the system handle concurrent license assignment requests that would exceed capacity? (Backend uses atomic increment/decrement, so one succeeds and the other fails with capacity error)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to create license pools with name, vendor, total capacity, cost, currency, billing period, license type, expiration date, expiration policy, and warning days
- **FR-002**: System MUST allow admins to view, edit, archive, and delete license pools
- **FR-003**: System MUST display pool utilization metrics (allocated count, available count, utilization percentage) on pool list and detail views
- **FR-004**: System MUST allow admins to assign licenses from a pool to individual users
- **FR-005**: System MUST prevent assignment when a pool is at full capacity, expired, or archived
- **FR-006**: System MUST allow admins to deallocate (release) active license assignments
- **FR-007**: System MUST support bulk license assignment to up to 1000 users in a single operation
- **FR-008**: System MUST support bulk license reclamation with a required reason
- **FR-009**: System MUST display partial success/failure results for bulk operations
- **FR-010**: System MUST allow admins to create reclamation rules with either inactivity-based or lifecycle-state-based triggers
- **FR-011**: System MUST allow admins to configure notification period (days before reclamation) for each rule
- **FR-012**: System MUST allow admins to update and delete reclamation rules
- **FR-013**: System MUST allow admins to create incompatibility rules between two license pools with a required reason
- **FR-014**: System MUST enforce incompatibility constraints when assigning licenses (bidirectional check)
- **FR-015**: System MUST allow admins to delete incompatibility rules
- **FR-016**: System MUST allow admins to create links between license pools and governance entitlements with priority
- **FR-017**: System MUST allow admins to enable/disable entitlement links
- **FR-018**: System MUST provide an analytics dashboard with summary metrics (total pools, capacity, utilization, monthly cost, expiring count)
- **FR-019**: System MUST display per-pool statistics and cost breakdown by vendor
- **FR-020**: System MUST generate optimization recommendations (underutilized, high utilization, expiring soon, reclaim opportunities) with potential savings
- **FR-021**: System MUST display pools expiring within a configurable time window (default 90 days)
- **FR-022**: System MUST allow admins to generate compliance reports with optional filters (pool IDs, vendor, date range)
- **FR-023**: System MUST provide a paginated audit trail of all license operations with filters (pool, user, action, date range)

### Key Entities

- **License Pool**: A software license inventory item with name, vendor, capacity (total/allocated/available), cost tracking (per-license cost, currency, billing period), expiration management (date, policy, warning days), license type (Named/Concurrent), and status (Active/Expired/Archived)
- **License Assignment**: A relationship between a pool and a user, tracking the assignment source (Manual/Automatic/Entitlement), status (Active/Reclaimed/Expired/Released), timestamps, and optional notes
- **Reclamation Rule**: An automated trigger to reclaim licenses, configured per pool with a trigger type (Inactivity with threshold days, or Lifecycle State), notification period, and enabled/disabled toggle
- **License Incompatibility**: A bidirectional conflict rule between two pools with a reason, preventing users from holding licenses in both pools simultaneously
- **License-Entitlement Link**: A connection between a pool and a governance entitlement with priority and enabled status, enabling automatic license allocation when entitlements are granted
- **License Audit Event**: A record of every license-related action (pool CRUD, assignments, reclamation, rule changes) with actor, timestamp, and details for compliance
- **License Recommendation**: A generated suggestion based on pool analytics (underutilized, high utilization, expiring, reclaim opportunity) with potential cost savings

## Assumptions

- Admin role is required for all license management operations (same `hasAdminRole()` check used elsewhere)
- Currency follows ISO 4217 3-character codes (default USD)
- Billing periods are Monthly, Annual, or Perpetual
- Maximum of 1000 items per bulk operation
- Expiring pool alerts default to a 90-day window
- Utilization thresholds for recommendations: < 60% = underutilized, > 90% = high utilization
- Audit trail is append-only and cannot be modified or deleted
- Pagination follows the standard `{items, total, limit, offset}` format used across all governance endpoints

## Out of Scope

- License procurement/purchasing workflows
- Integration with external license management vendors (e.g., ServiceNow, Flexera)
- End-user self-service license requests (only admin-managed)
- License metering or usage tracking beyond assignment status
- Automatic expiration handling (backend background jobs) — only UI display of expiration status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create a new license pool and assign a license to a user in under 2 minutes
- **SC-002**: Bulk assignment of 100 licenses completes and shows results within 10 seconds
- **SC-003**: Analytics dashboard loads all summary metrics, pool stats, vendor costs, and recommendations in a single page view
- **SC-004**: All license operations (create, assign, reclaim, delete) are recorded in the audit trail within the same session
- **SC-005**: Incompatibility violations are caught and displayed with a clear error message before the assignment is created
- **SC-006**: Compliance reports can be generated with vendor and date range filters in under 30 seconds
- **SC-007**: License pool list supports pagination, filtering by vendor/type/status, and displays utilization metrics at a glance
- **SC-008**: 90% of admin users can successfully complete pool creation, assignment, and reclamation workflows on first attempt without documentation

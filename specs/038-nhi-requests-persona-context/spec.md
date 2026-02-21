# Feature Specification: NHI Access Requests & Persona Context

**Feature Branch**: `038-nhi-requests-persona-context`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Phase 038: NHI Access Requests & Persona Context — Advanced NHI governance with access request workflows, usage tracking, staleness reports, and enhanced certifications. Plus persona context switching with token swap, expiry management with extension, and attribute propagation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - NHI Access Requests (Priority: P1)

Users can submit formal requests to create new non-human identities (service accounts, agents, tools) with a name, justification, requested permissions, optional expiration date, and rotation interval. Administrators review these requests and approve or reject them with comments. Requesters can view their pending requests and cancel them before approval. The system provides a summary dashboard showing request counts by status.

**Why this priority**: NHI access requests are foundational for governed NHI lifecycle management. Without a formal request workflow, NHI entities are created ad-hoc without oversight, creating security and compliance gaps.

**Independent Test**: Can be fully tested by submitting an NHI request, viewing it in the list, having an admin approve it, and confirming the request transitions to "approved" status.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they submit an NHI request with a name and purpose (min 10 characters), **Then** the request is created with "pending" status and appears in the request list.
2. **Given** a pending NHI request, **When** an administrator approves it with optional comments, **Then** the request status changes to "approved" and the reviewer is recorded.
3. **Given** a pending NHI request, **When** an administrator rejects it with a reason (min 5 characters), **Then** the request status changes to "rejected" with the rejection reason visible.
4. **Given** a pending NHI request created by the current user, **When** they cancel it, **Then** the request status changes to "cancelled".
5. **Given** multiple NHI requests exist, **When** a user views the request list, **Then** they can filter by status (pending, approved, rejected, cancelled) and see request counts per status.
6. **Given** a user has submitted requests, **When** they view "my pending" requests, **Then** only their own pending requests appear.

---

### User Story 2 - NHI Usage Tracking & Staleness (Priority: P1)

Administrators can view usage patterns for individual NHI entities and generate a staleness report across all NHIs. Each NHI entity detail page shows a "Usage" section with activity history and summary statistics. The staleness report identifies NHI entities that have been inactive beyond acceptable thresholds, helping administrators proactively manage unused entities.

**Why this priority**: Usage tracking is critical for security — stale NHI entities represent unmonitored attack surfaces. Visibility into which entities are actively used vs dormant directly impacts organizational security posture.

**Independent Test**: Can be fully tested by navigating to an NHI entity detail page, viewing the usage tab, then navigating to the staleness report page and confirming it lists inactive entities.

**Acceptance Scenarios**:

1. **Given** an NHI entity detail page, **When** a user navigates to the Usage tab, **Then** they see usage history entries and a summary of usage statistics.
2. **Given** NHI entities with varying activity levels, **When** an administrator views the staleness report, **Then** they see a list of entities sorted by inactivity duration with details on last activity date.
3. **Given** the NHI main listing page, **When** an administrator views it, **Then** they see summary cards showing total NHI count, active count, suspended count, entities needing certification, and entities needing credential rotation.

---

### User Story 3 - Enhanced NHI Certifications (Priority: P2)

Administrators can manage NHI certification campaigns with a full lifecycle: create, launch, cancel. Each campaign contains certification items representing individual NHI entities in scope. Reviewers can decide on items individually (certify, revoke, or flag) or use bulk actions to decide multiple items at once. Campaign summary shows progress statistics. Users can view their pending certification items across all campaigns.

**Why this priority**: Enhanced certification builds on the existing basic certification infrastructure by adding campaign lifecycle management and item-level granularity, enabling large-scale NHI reviews.

**Independent Test**: Can be fully tested by creating a certification campaign, launching it, viewing its items, deciding on an individual item, and verifying the campaign summary reflects the decision.

**Acceptance Scenarios**:

1. **Given** an administrator, **When** they create an NHI certification campaign with a name and scope, **Then** the campaign is created in "draft" status.
2. **Given** a draft campaign, **When** an administrator launches it, **Then** the campaign transitions to "active" status and certification items are generated.
3. **Given** an active campaign, **When** an administrator cancels it, **Then** the campaign transitions to "cancelled" status.
4. **Given** an active campaign with items, **When** a reviewer views the campaign detail, **Then** they see a summary (total items, decided, pending) and a list of individual certification items.
5. **Given** a certification item, **When** a reviewer decides to certify or revoke it, **Then** the item is marked with the decision and the reviewer is recorded.
6. **Given** multiple pending certification items, **When** a reviewer uses bulk decide, **Then** all selected items are decided with the chosen action.
7. **Given** a user assigned as reviewer, **When** they view "my pending" certifications, **Then** they see only items assigned to them that haven't been decided.

---

### User Story 4 - Persona Context Switching (Priority: P2)

Users who have been assigned personas can switch their active identity context to operate as a different persona. The system issues a new authentication token reflecting the persona's permissions and attributes. Users can switch back to their physical identity at any time. A context indicator shows which persona is currently active. Users can view their session history showing all context switches.

**Why this priority**: Context switching is the core value proposition of the persona system — without it, personas are metadata without operational effect. This enables users to actually operate under different identity contexts.

**Independent Test**: Can be fully tested by a user with an assigned active persona switching to that persona, confirming the context indicator updates, then switching back and confirming the indicator clears.

**Acceptance Scenarios**:

1. **Given** a user with an active assigned persona, **When** they switch context to that persona with an optional reason, **Then** they receive a new authentication token and the active persona is displayed in the interface.
2. **Given** a user operating under a persona context, **When** they switch back to their physical identity, **Then** their original authentication is restored and the persona indicator is cleared.
3. **Given** a user, **When** they view the current context page, **Then** they see their physical user identity, whether a persona is active, the active persona details (if any), and session timing.
4. **Given** a user who has performed context switches, **When** they view the session history, **Then** they see a list of all switches with timestamps, from/to context names, and reasons.
5. **Given** a user attempting to switch to an inactive or expired persona, **When** they attempt the switch, **Then** the system rejects the switch with an appropriate error message.

---

### User Story 5 - Persona Expiry Management & Attribute Propagation (Priority: P3)

Administrators can view personas that are approaching their expiration date and extend them by setting a new expiration date with a justification. Extensions may be automatically approved or may require additional approval depending on organizational policy. Administrators can also propagate updated archetype attributes down to individual personas, ensuring personas stay in sync with their archetype templates.

**Why this priority**: Expiry management prevents disruption when personas expire unexpectedly, while attribute propagation keeps the persona hierarchy consistent as archetype definitions evolve.

**Independent Test**: Can be fully tested by viewing the expiring personas list, selecting a persona, extending its expiration date, and confirming the new date is reflected in the persona detail.

**Acceptance Scenarios**:

1. **Given** personas with various expiration dates, **When** an administrator views the expiring personas page, **Then** they see personas sorted by proximity to expiration with clear expiration dates.
2. **Given** a persona nearing expiration, **When** an administrator extends it by providing a new expiration date and optional reason, **Then** the persona's expiration is updated (or a pending approval is created).
3. **Given** a persona whose archetype has been updated, **When** an administrator triggers attribute propagation, **Then** the persona's attributes are synced from the archetype and the update is confirmed.

---

### Edge Cases

- What happens when a user submits an NHI request but already has the maximum number of pending requests? The system should enforce a reasonable limit (assumed: 50 pending requests per user) and reject excess submissions.
- What happens when an administrator tries to approve an NHI request that has already been cancelled by the requester? The system should return an error indicating the request is no longer in a pending state.
- What happens when a user attempts to switch to a persona that was deactivated between page load and switch action? The system should return a clear error and not swap tokens.
- What happens when the session history grows very large? Pagination ensures only a bounded number of entries are loaded at once (50 per page).
- What happens when attribute propagation is triggered but the persona has local overrides? The system should propagate archetype attributes while preserving any persona-specific overrides.
- What happens when a certification campaign is launched but no NHI entities match the scope? The campaign is created with zero items and shows an appropriate empty state.
- What happens when a user tries to bulk decide items they aren't assigned to review? The system should reject the request with a forbidden error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to submit NHI access requests with a name (1-200 characters), purpose (minimum 10 characters), optional permission list (up to 50 UUIDs), optional expiration date, and optional rotation interval (1-365 days).
- **FR-002**: System MUST allow administrators to approve NHI requests with optional comments.
- **FR-003**: System MUST allow administrators to reject NHI requests with a mandatory reason (minimum 5 characters).
- **FR-004**: System MUST allow the original requester to cancel their own pending NHI request.
- **FR-005**: System MUST display NHI request lists with filtering by status (pending, approved, rejected, cancelled), requester, and pending-only flag.
- **FR-006**: System MUST provide a request summary showing counts by status.
- **FR-007**: System MUST display NHI usage history and summary statistics on entity detail pages.
- **FR-008**: System MUST provide a staleness report listing NHI entities inactive beyond their thresholds.
- **FR-009**: System MUST display NHI summary statistics (total, active, expired, suspended, needs certification, needs rotation, inactive) on the NHI listing page.
- **FR-010**: System MUST allow administrators to create NHI certification campaigns, launch them, and cancel them.
- **FR-011**: System MUST allow reviewers to decide on individual certification items (certify, revoke, or flag).
- **FR-012**: System MUST allow reviewers to bulk decide multiple certification items at once.
- **FR-013**: System MUST display campaign summary statistics (total, decided, pending).
- **FR-014**: System MUST allow users to view their pending certification items across campaigns.
- **FR-015**: System MUST allow users with active personas to switch their identity context to a persona, receiving a new authentication token.
- **FR-016**: System MUST allow users to switch back from a persona context to their physical identity, restoring the original authentication.
- **FR-017**: System MUST display the current identity context (physical user info, whether persona is active, active persona details).
- **FR-018**: System MUST display context switching session history with timestamps, from/to context, and reasons.
- **FR-019**: System MUST allow administrators to extend persona expiration by setting a new date with optional justification.
- **FR-020**: System MUST display a list of personas approaching expiration.
- **FR-021**: System MUST allow administrators to propagate archetype attributes to individual personas.

### Key Entities

- **NHI Access Request**: A formal request to create a new non-human identity. Contains requester information, requested entity details (name, purpose, permissions, expiration), status tracking (pending, approved, rejected, cancelled), and reviewer information.
- **NHI Usage Record**: An activity log entry for an NHI entity capturing when and how it was used, enabling pattern analysis and staleness detection.
- **NHI Summary**: Aggregate statistics about all NHI entities in a tenant — counts by status and governance needs.
- **NHI Certification Campaign**: A time-bounded review of NHI entities. Has a lifecycle (draft, active, completed, cancelled), contains items representing individual NHIs in scope, and tracks reviewer decisions.
- **NHI Certification Item**: An individual NHI entity within a certification campaign that requires a reviewer decision (certify, revoke, or flag).
- **Persona Context Session**: A record of a user switching between their physical identity and a persona identity, including the new authentication token and session metadata.
- **Persona Extension**: A record of extending a persona's expiration date, potentially requiring approval.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can submit an NHI access request and see it in their pending list within 3 seconds.
- **SC-002**: Administrators can approve or reject an NHI request in under 5 clicks from the request list.
- **SC-003**: The NHI staleness report loads and displays results within 5 seconds for organizations with up to 500 NHI entities.
- **SC-004**: 100% of NHI entity detail pages include a usage section showing activity data.
- **SC-005**: Persona context switching completes (token swap and interface update) within 3 seconds.
- **SC-006**: Users can identify their currently active persona at a glance from any page in the application.
- **SC-007**: Certification campaign bulk decide handles up to 100 items per operation.
- **SC-008**: Persona expiry extension workflow completes in under 3 clicks from the expiring list.
- **SC-009**: All 31 backend endpoints have corresponding frontend coverage with working data flows.

## Assumptions

- The backend for all 31 endpoints is already implemented and functional.
- NHI request permissions reference existing governance entitlement identifiers.
- Persona context switching issues a new authentication token that the frontend stores via cookie management (same pattern as Power of Attorney identity assumption).
- The NHI staleness report uses server-configured inactivity thresholds — the frontend does not need to configure these.
- Certification campaign scopes and NHI type filters follow the existing governance patterns.
- Attribute propagation is an immediate synchronous operation (not a background job).
- Persona extension may result in either immediate approval or pending approval depending on backend policy configuration — the frontend handles both response types.
- Maximum 50 pending NHI requests per user is a backend-enforced limit.
- Context switching session history is paginated with standard pagination (limit/offset).

## Scope Boundaries

### In Scope
- NHI request submission, listing, detail, approve/reject/cancel
- NHI usage tab on entity detail pages (agents, tools, service accounts)
- NHI staleness report page
- NHI summary cards on the main NHI listing page
- Enhanced certification campaign management (launch, cancel, items, bulk-decide)
- My pending certifications view
- Persona context switch/switch-back with token management
- Current context display and session history
- Persona expiring list and extension
- Persona attribute propagation button
- Sidebar navigation additions
- All 31 proxy endpoints

### Out of Scope
- NHI request auto-approval rules or workflow configuration
- Custom staleness threshold configuration
- Certification campaign scheduling or recurring campaigns
- Persona creation or deletion (already exists in Phase 005)
- Archetype management (already exists in Phase 005)
- NHI entity creation (already exists in Phase 006; requests create through the approval flow)
- Notification system for request/certification status changes

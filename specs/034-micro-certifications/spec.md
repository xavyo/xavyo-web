# Feature Specification: Micro Certifications & Event-Driven Reviews

**Feature Branch**: `034-micro-certifications`
**Created**: 2026-02-13
**Status**: Draft
**Input**: Phase 034 — Governance feature enabling continuous, event-triggered certification reviews that replace or supplement periodic campaigns.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Certification Review Dashboard (Priority: P1)

A reviewer logs in and sees a list of their pending micro certification requests. Each request shows which user holds which entitlement, why the certification was triggered (e.g., role change, new assignment), and the deadline. The reviewer can certify (approve continued access), revoke (remove access), delegate to another reviewer, or skip with a comment. Decisions are recorded immediately with timestamps and reviewer identity.

**Why this priority**: The core value of micro certifications is enabling reviewers to act on targeted access reviews. Without this, the entire feature has no user-facing function.

**Independent Test**: Can be fully tested by navigating to the pending certifications view, seeing a list of items, and performing certify/revoke/delegate/skip actions. Delivers immediate value as reviewers can fulfill their compliance responsibilities.

**Acceptance Scenarios**:

1. **Given** a reviewer with 5 pending micro certifications, **When** they navigate to "My Pending" view, **Then** they see all 5 items with user name, entitlement name, trigger reason, deadline, and status indicators for escalated/overdue items.
2. **Given** a pending certification, **When** the reviewer clicks "Certify" and provides a comment, **Then** the certification status changes to "certified", the decision and comment are recorded, and the item disappears from the pending list.
3. **Given** a pending certification, **When** the reviewer clicks "Revoke" and provides a mandatory comment, **Then** the certification status changes to "revoked", the entitlement access is flagged for removal, and the decision is recorded.
4. **Given** a pending certification, **When** the reviewer delegates it to another user, **Then** the certification is reassigned to the new reviewer, the original reviewer sees it as "delegated", and the new reviewer sees it in their pending list.
5. **Given** a pending certification, **When** the reviewer skips it with a reason, **Then** the certification status changes to "skipped" and the reason is recorded in the audit trail.

---

### User Story 2 - Trigger Rule Management (Priority: P1)

An administrator configures trigger rules that define when micro certifications are automatically generated. Each rule specifies: the trigger type (role change, entitlement assignment, risk score change, periodic, or manual), the scope (global, per application, or per specific entitlement), who should review (manager, entitlement owner, or a specific user), and operational parameters like timeout, reminder thresholds, and auto-revoke behavior. Admins can enable/disable rules, set one as the default, and delete rules.

**Why this priority**: Without trigger rules, the system cannot generate certifications. This is the configuration backbone that drives the entire feature.

**Independent Test**: Can be tested by creating a trigger rule with specific parameters, verifying it appears in the list, editing it, toggling enable/disable, and deleting it. Delivers value by allowing admins to configure the certification automation engine.

**Acceptance Scenarios**:

1. **Given** an admin on the Trigger Rules tab, **When** they click "Create trigger rule" and fill in all required fields (name, trigger type, scope, reviewer type), **Then** the rule is created in active state and appears in the rules list.
2. **Given** an existing active trigger rule, **When** the admin disables it, **Then** the rule's status changes to inactive and no new certifications are generated from this rule.
3. **Given** an existing trigger rule, **When** the admin edits its timeout and reminder threshold, **Then** the changes are saved and apply to newly generated certifications.
4. **Given** multiple trigger rules, **When** the admin sets one as default, **Then** that rule is marked as default and any previously default rule loses its default status.
5. **Given** an existing trigger rule with no active certifications, **When** the admin deletes it, **Then** the rule is permanently removed from the system.

---

### User Story 3 - Bulk Operations & Statistics (Priority: P2)

An administrator views a statistics dashboard showing certification metrics: total certifications, pending count, decided count, overdue count, and average decision time. The admin can also select multiple pending certifications and perform bulk certify or bulk revoke operations to handle large volumes efficiently.

**Why this priority**: Statistics provide operational visibility, and bulk operations are essential for scaling when many certifications are generated simultaneously (e.g., after an organizational restructure).

**Independent Test**: Can be tested by viewing the statistics dashboard and verifying metric accuracy, then selecting multiple certifications and performing a bulk decision. Delivers value by giving admins operational oversight and efficiency tools.

**Acceptance Scenarios**:

1. **Given** a system with various certifications in different states, **When** the admin views the statistics tab, **Then** they see accurate counts for total, pending, certified, revoked, delegated, skipped, expired, overdue, and average decision time.
2. **Given** 10 pending certifications, **When** the admin selects 5 and performs "Bulk Certify" with a comment, **Then** all 5 are certified simultaneously with the same comment, and the statistics update accordingly.
3. **Given** pending certifications in the "All Certifications" list, **When** the admin filters by status "overdue", **Then** only overdue certifications are shown, enabling focused remediation.

---

### User Story 4 - Audit Trail & Events (Priority: P2)

Compliance officers and administrators can view the complete event history for any individual micro certification (who triggered it, when, what decisions were made, any delegations or escalations). They can also search across all certification events globally with filters for time range, event type, and user.

**Why this priority**: Audit trails are essential for compliance reporting and regulatory evidence. Without event visibility, organizations cannot demonstrate that certifications were properly conducted.

**Independent Test**: Can be tested by opening a certification's detail view and checking the events timeline, then navigating to the global audit events search and applying filters. Delivers value for compliance reporting and incident investigation.

**Acceptance Scenarios**:

1. **Given** a certification that has been delegated and then certified, **When** a user views the certification detail, **Then** they see a chronological event timeline showing: creation, delegation (with who and why), and final certification decision (with who and comment).
2. **Given** the global events search, **When** the admin searches for all "revoke" events in the past 7 days, **Then** matching events are displayed with certification ID, user, entitlement, reviewer, and timestamp.
3. **Given** a certification detail page, **When** any action is taken on the certification, **Then** a new event is immediately visible in the events timeline.

---

### User Story 5 - Manual Triggering (Priority: P3)

An administrator can manually trigger a micro certification for a specific user-entitlement combination, optionally specifying which trigger rule to use and which reviewer should handle it, along with a reason for the manual trigger.

**Why this priority**: Manual triggering is a supplemental capability for edge cases where automated triggers haven't fired or where a targeted review is needed outside the normal trigger flow.

**Independent Test**: Can be tested by navigating to the manual trigger form, selecting a user and entitlement, and submitting. Delivers value for ad-hoc compliance needs and exception handling.

**Acceptance Scenarios**:

1. **Given** an admin on the certifications hub, **When** they click "Trigger certification", fill in user, entitlement, and reason, and submit, **Then** a new pending micro certification is created and assigned to the appropriate reviewer.
2. **Given** a manual trigger request specifying a particular reviewer, **When** submitted, **Then** the certification is assigned to that specific reviewer rather than using the default rule's reviewer logic.
3. **Given** a manual trigger request with an invalid user-entitlement combination (user doesn't hold the entitlement), **When** submitted, **Then** the system displays a clear error message explaining why the trigger failed.

---

### Edge Cases

- What happens when a certification reaches its deadline without a decision? It transitions to "expired" status, and if the trigger rule has auto-revoke enabled, the entitlement access is flagged for removal.
- How does the system handle delegation chains? A delegated certification can be further delegated. The event trail tracks each delegation hop. There is no enforced maximum delegation depth.
- What happens when a reviewer is deactivated while they have pending certifications? The system uses the fallback reviewer specified in the trigger rule. If no fallback exists, the certifications remain assigned to the deactivated reviewer and become overdue (visible to admins).
- How does bulk decide handle partial failures? If some certifications in a bulk operation fail (e.g., already decided), the system processes all valid ones and reports failures for the rest.
- What happens if a trigger rule is deleted while certifications generated by it are still pending? Existing certifications remain unaffected and continue their lifecycle. Only new trigger events stop generating certifications.
- What happens when the same user-entitlement pair already has a pending certification and a new trigger fires? The system does not create duplicate pending certifications for the same user-entitlement combination.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a reviewer's pending micro certifications in a dedicated view, showing user, entitlement, trigger reason, deadline, and escalation/overdue indicators.
- **FR-002**: System MUST allow reviewers to decide on a certification by certifying or revoking, with a mandatory comment for revocations and optional comment for certifications.
- **FR-003**: System MUST allow reviewers to delegate a certification to another user, recording the delegation reason and notifying the new reviewer.
- **FR-004**: System MUST allow reviewers to skip a certification with an optional reason, recording the skip in the audit trail.
- **FR-005**: System MUST allow administrators to create trigger rules with: name, trigger type, scope (global/application/entitlement), reviewer type (manager/owner/specific), timeout, reminder threshold, auto-revoke flag, and priority.
- **FR-006**: System MUST allow administrators to enable, disable, set as default, edit, and delete trigger rules.
- **FR-007**: System MUST display certification statistics including total, pending, certified, revoked, delegated, skipped, expired, overdue counts, and average decision time.
- **FR-008**: System MUST allow administrators to perform bulk decisions (certify or revoke) on multiple selected certifications simultaneously.
- **FR-009**: System MUST display a chronological event timeline for each certification, showing all actions taken.
- **FR-010**: System MUST provide a global certification events search with filtering capabilities.
- **FR-011**: System MUST allow administrators to manually trigger a certification for a specific user-entitlement combination with an optional reviewer override and reason.
- **FR-012**: System MUST support filtering the certifications list by status, user, reviewer, entitlement, escalated flag, and overdue flag.
- **FR-013**: System MUST paginate all list views with configurable page sizes.
- **FR-014**: System MUST restrict trigger rule management (create, edit, delete, enable, disable) to administrators only.
- **FR-015**: System MUST restrict bulk operations, statistics viewing, and manual triggering to administrators only.

### Key Entities

- **Micro Certification**: An individual access review request targeting a specific user-entitlement assignment. Contains the user under review, the entitlement being reviewed, the assigned reviewer, the trigger rule that generated it, status (pending/certified/revoked/delegated/skipped/expired), decision details, deadline, and escalation flags.
- **Trigger Rule**: A configuration that defines when and how micro certifications are generated. Specifies the event type that triggers a review, the scope of applicability, reviewer assignment logic, timeout/SLA parameters, and automatic remediation behavior (auto-revoke).
- **Certification Event**: An immutable audit record of any action taken on a micro certification (creation, decision, delegation, skip, escalation, expiration). Contains timestamp, actor, action type, and details.
- **Certification Statistics**: Aggregated metrics across all micro certifications including counts by status, overdue count, and average decision time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Reviewers can view and act on their pending certifications within 3 clicks from the main navigation.
- **SC-002**: A single certification decision (certify, revoke, delegate, or skip) can be completed in under 30 seconds.
- **SC-003**: Bulk operations process 50 certifications simultaneously in under 5 seconds from the user's perspective.
- **SC-004**: Administrators can create a new trigger rule in under 2 minutes.
- **SC-005**: The statistics dashboard loads and displays all metrics within 2 seconds.
- **SC-006**: The certification event timeline displays all events for a certification in chronological order with no missing entries.
- **SC-007**: All certification actions (decisions, delegations, skips) are captured in the audit trail with zero data loss.
- **SC-008**: The system correctly prevents duplicate pending certifications for the same user-entitlement pair.

## Assumptions

- The existing periodic certification campaign feature continues to function independently; micro certifications supplement but do not replace campaigns.
- Reviewer assignment logic (manager, owner, specific) is resolved by the backend at trigger time; the frontend displays the assigned reviewer as provided.
- Comments are optional for certify decisions and skips, but required for revoke decisions (enforced in the UI).
- The "auto-revoke" flag on trigger rules is a backend-enforced behavior; the frontend only displays the configuration option.
- Delegation does not require admin approval; any reviewer can delegate their assigned certifications.
- The fallback reviewer mechanism is handled by the backend; the frontend displays whoever is currently assigned.

## Scope Boundaries

### In Scope
- Reviewer dashboard for pending certifications with action buttons
- Admin trigger rule CRUD with lifecycle (enable/disable/set-default)
- All certifications list with multi-column filtering
- Bulk certify/revoke operations
- Statistics dashboard with aggregate metrics
- Per-certification event timeline
- Global certification events search
- Manual trigger form
- Sidebar navigation entry

### Out of Scope
- Email/notification delivery for certification assignments (backend responsibility)
- Automatic escalation logic (backend responsibility; frontend shows escalated flag)
- Integration with external ticketing systems for certification workflows
- Certification scheduling/recurrence configuration (handled by trigger rules at backend level)
- Mobile-specific responsive layouts beyond standard responsive breakpoints

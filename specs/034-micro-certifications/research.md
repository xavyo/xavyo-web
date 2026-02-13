# Research: Micro Certifications & Event-Driven Reviews

## R1: Micro Certification Workflow Pattern

**Decision**: Follow the existing governance certification pattern with additions for event-driven triggers, delegation, and skip actions.

**Rationale**: The xavyo-web codebase already has certification campaigns (Phase 012) and NHI certifications (Phase 014). Micro certifications use the same decision model (certify/revoke) but add delegation, skip, and bulk operations. Reusing existing patterns reduces learning curve and ensures consistency.

**Alternatives Considered**:
- Custom workflow engine: Rejected — over-engineered for the scope; the backend handles workflow state machine
- Reusing existing certification campaign UI: Rejected — micro certifications have fundamentally different lifecycle (event-triggered vs campaign-based, individual vs batch)

## R2: Hub Page Tab Structure

**Decision**: 4-tab hub: My Pending, All Certifications, Trigger Rules, Statistics. Non-admin users see only "My Pending" tab.

**Rationale**: Separating reviewer (My Pending) from admin (All/Rules/Stats) views follows the pattern established by My Approvals and My Certifications. The tab approach matches governance hub patterns (entitlements, roles, reports).

**Alternatives Considered**:
- Separate /my-micro-certifications route: Rejected — adds unnecessary navigation; single hub with role-based tab visibility is simpler
- All in one list with filters: Rejected — reviewers need a focused "my pending" view without admin clutter

## R3: Bulk Decision Implementation

**Decision**: Client-side checkbox selection with a "Bulk Decide" button that calls a single bulk-decide BFF endpoint. The backend handles atomicity.

**Rationale**: The backend provides a dedicated `POST /governance/micro-certifications/bulk-decide` endpoint that accepts an array of certification IDs. This is the simplest integration path.

**Alternatives Considered**:
- Client-side loop calling individual decide endpoints: Rejected — slower, no atomicity, poor UX for large batches
- Server-side batch via form action: Rejected — bulk operations are better handled via client-side JS for immediate feedback

## R4: Event Timeline Component

**Decision**: Reusable chronological event timeline component showing events as vertical list with timestamps, actor names, action types, and detail text.

**Rationale**: Similar to audit log patterns in Phase 010. The backend returns events as a flat array with timestamps that can be rendered chronologically.

**Alternatives Considered**:
- Embedded table: Rejected — timelines are more readable for sequential events
- Accordion per event: Rejected — over-engineered for simple event entries

## R5: Trigger Rule Form Design

**Decision**: Standard Superforms form with: name (text), trigger_type (select), scope_type (select), scope_id (conditional UUID input), reviewer_type (select), specific_reviewer_id (conditional UUID input), timeout_secs (number), reminder_threshold_percent (number), auto_revoke (checkbox), priority (number).

**Rationale**: Follows the create-form pattern from approval workflows (Phase 016) and detection rules. Conditional fields (scope_id visible when scope_type is not "global", specific_reviewer_id visible when reviewer_type is "specific") keep the form clean.

**Alternatives Considered**:
- Multi-step wizard: Rejected — too complex for a form with ~10 fields; single-page form is sufficient
- JSON editor for metadata: Rejected — metadata field is optional and rarely used; a simple textarea suffices

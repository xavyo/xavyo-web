# Feature Specification: Identity Deduplication & Merging

**Feature Branch**: `026-identity-dedup-merging`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Admin UI for detecting duplicate user identities, previewing merge operations, executing merges (primary/secondary selection), batch merge jobs, and audit trail of all merge operations."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Manage Duplicate Candidates (Priority: P1)

An admin navigates to the Deduplication hub and sees a list of detected duplicate identity pairs. Each pair shows the two identities' names/emails, a confidence score (0-100), and a status badge (pending/merged/dismissed). The admin can filter by status and minimum confidence threshold. Clicking a pair opens a detail view with a side-by-side attribute comparison showing which fields match and which differ, plus the rule matches that contributed to the confidence score.

**Why this priority**: Core value proposition — without seeing duplicates, no further merge actions are possible. This is the entry point for the entire feature.

**Independent Test**: Navigate to Deduplication hub, see pending duplicate list with confidence scores, click a pair to see attribute comparison detail.

**Acceptance Scenarios**:

1. **Given** duplicate candidates exist in the system, **When** admin navigates to the Deduplication hub, **Then** they see a paginated list of duplicate pairs with confidence scores, status badges, and identity summaries
2. **Given** the duplicate list is displayed, **When** admin filters by "pending" status and minimum confidence 80, **Then** only pending pairs with confidence >= 80 are shown
3. **Given** a duplicate pair is listed, **When** admin clicks on it, **Then** they see a detail view with side-by-side attribute comparison, rule match breakdown with similarity scores, and action buttons (merge, dismiss)
4. **Given** no duplicates are detected, **When** admin views the list, **Then** they see an empty state with a "Run Detection" call-to-action

---

### User Story 2 - Preview and Execute Single Merge (Priority: P1)

From a duplicate pair detail, the admin clicks "Merge" to open the merge preview. The preview shows a side-by-side comparison of both identities with field-level selection — for each differing attribute, the admin chooses which value to keep (source or target). The admin selects an entitlement consolidation strategy (union all, keep only common, or manually select). The preview shows the resulting merged identity and highlights any SoD violations. The admin then executes the merge or cancels.

**Why this priority**: This is the core merge operation that delivers the primary user value. Combined with US1, this forms the MVP.

**Independent Test**: From a duplicate pair, click Merge → select attribute values → choose entitlement strategy → review preview → execute → verify merge completed and pair status updated.

**Acceptance Scenarios**:

1. **Given** a pending duplicate pair, **When** admin initiates merge, **Then** they see a merge preview with both identities side-by-side, differing attributes highlighted, and field-level value selection controls
2. **Given** the merge preview is shown, **When** admin selects attribute values and entitlement strategy "union", **Then** the merged preview updates to show the resulting identity with all entitlements combined
3. **Given** the merge preview shows SoD violations, **When** admin provides an override reason, **Then** they can proceed with the merge despite violations
4. **Given** the merge preview shows SoD violations, **When** admin does not provide an override reason, **Then** the merge execute button remains disabled
5. **Given** merge is confirmed, **When** admin clicks Execute, **Then** the merge completes, the duplicate pair status updates to "merged", and a success confirmation is shown
6. **Given** a merge fails, **When** an error occurs during execution, **Then** the admin sees a clear error message explaining what went wrong

---

### User Story 3 - Dismiss False Positives (Priority: P2)

An admin reviews a detected duplicate pair and determines it is a false positive (e.g., two different people with the same name). The admin dismisses the pair with a required reason. Dismissed pairs can be viewed by filtering for "dismissed" status but no longer appear in the default pending view.

**Why this priority**: Essential for managing the duplicate queue — without dismissal, false positives accumulate and obscure real duplicates.

**Independent Test**: View a pending duplicate pair, click Dismiss, enter a reason, confirm — pair moves to dismissed status.

**Acceptance Scenarios**:

1. **Given** a pending duplicate pair, **When** admin clicks Dismiss and enters a reason, **Then** the pair status changes to "dismissed" and is removed from the default pending list
2. **Given** admin attempts to dismiss without a reason, **When** they submit, **Then** a validation error requires a reason to be provided

---

### User Story 4 - Run Detection Scan (Priority: P2)

An admin triggers a manual duplicate detection scan from the Deduplication hub. They can optionally set a minimum confidence threshold (default 70). The scan processes all users and returns results showing how many users were processed, how many duplicates were found, and how many are new.

**Why this priority**: Allows admins to proactively discover duplicates rather than waiting for automatic detection. Useful after bulk imports.

**Independent Test**: Click "Run Detection" → optionally adjust confidence threshold → scan executes → results show count of new duplicates found.

**Acceptance Scenarios**:

1. **Given** admin is on the Deduplication hub, **When** they click "Run Detection" and confirm, **Then** a detection scan runs and returns results with users processed, duplicates found, and new duplicates count
2. **Given** admin adjusts the confidence threshold to 90, **When** scan runs, **Then** only pairs with confidence >= 90 are detected

---

### User Story 5 - Batch Merge Operations (Priority: P2)

An admin selects multiple pending duplicate pairs and initiates a batch merge. They choose a global entitlement strategy and an attribute resolution rule (newest wins, oldest wins, or prefer non-null). A batch preview shows the affected pairs. Upon confirmation, the batch merge executes and returns a summary of successful/failed/skipped merges.

**Why this priority**: Efficiency feature for handling large volumes of high-confidence duplicates without manual per-pair merging.

**Independent Test**: Select multiple pairs → choose batch settings → preview → execute → see results summary with success/fail counts.

**Acceptance Scenarios**:

1. **Given** multiple pending duplicate pairs, **When** admin selects pairs and clicks "Batch Merge", **Then** they see a batch configuration form with entitlement strategy and attribute resolution rule options
2. **Given** batch merge is configured, **When** admin clicks Preview, **Then** they see the list of pairs that will be merged
3. **Given** batch preview is shown, **When** admin confirms, **Then** batch merge executes and shows results with successful, failed, and skipped counts
4. **Given** SoD violations exist in a batch pair, **When** "skip SoD violations" is unchecked, **Then** those pairs are skipped and counted in the results

---

### User Story 6 - Merge Audit Trail (Priority: P3)

An admin views the complete audit history of all merge operations. Each audit entry shows the source and target identities, the operator who performed the merge, and the timestamp. Clicking an entry shows the full audit detail: pre-merge snapshots of both identities, the merged result, attribute decisions made, entitlement decisions, and any SoD violations that were overridden.

**Why this priority**: Compliance and accountability feature. Important for governance but not required for core merge functionality.

**Independent Test**: Navigate to Merge History tab, see list of past merges, click an entry to see full audit detail with pre/post snapshots.

**Acceptance Scenarios**:

1. **Given** merge operations have been completed, **When** admin navigates to the Merge History tab, **Then** they see a paginated list of merge audit entries with identity names, operator, and timestamp
2. **Given** audit entries exist, **When** admin filters by date range or identity, **Then** only matching entries are shown
3. **Given** an audit entry is listed, **When** admin clicks it, **Then** they see the complete audit detail with source/target snapshots, merged result, attribute decisions, and entitlement decisions
4. **Given** a merge had SoD violations overridden, **When** admin views the audit detail, **Then** the SoD violations and override reason are displayed

---

### Edge Cases

- What happens when both identities in a pair have been modified since detection? The merge preview always fetches current data, not cached detection-time data.
- What happens when one identity in a pair has already been merged or deleted? The pair shows as stale with an appropriate message and the merge action is disabled.
- What happens during concurrent merge attempts on the same identity? The backend prevents this — the UI shows a clear error if a merge is already in progress for either identity.
- What happens when a batch merge partially fails? The results clearly show which pairs succeeded, failed (with error), and were skipped, allowing retry of failed pairs.
- What happens when the duplicate list is very large (thousands of pairs)? Pagination with configurable page size ensures performance. High-confidence pairs are shown first by default.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated list of duplicate candidates with confidence score, identity summaries, and status badges
- **FR-002**: System MUST allow filtering duplicate candidates by status (pending/merged/dismissed) and minimum confidence threshold
- **FR-003**: System MUST show a side-by-side attribute comparison when viewing a duplicate pair detail, including rule match breakdown
- **FR-004**: System MUST provide a merge preview showing the resulting merged identity with field-level attribute selection for differing values
- **FR-005**: System MUST support three entitlement consolidation strategies: union (keep all), intersection (keep common), and manual selection
- **FR-006**: System MUST display SoD violations during merge preview and require an override reason to proceed when violations exist
- **FR-007**: System MUST execute merge operations and update the duplicate pair status to "merged" upon completion
- **FR-008**: System MUST allow dismissing false-positive duplicate pairs with a required reason
- **FR-009**: System MUST support triggering a manual duplicate detection scan with configurable confidence threshold
- **FR-010**: System MUST support batch merge of multiple duplicate pairs with global entitlement strategy and attribute resolution rules
- **FR-011**: System MUST display batch merge results showing successful, failed, and skipped pair counts
- **FR-012**: System MUST maintain an immutable audit trail of all merge operations with pre/post identity snapshots
- **FR-013**: System MUST allow filtering audit entries by date range, identity, and operator
- **FR-014**: System MUST display audit detail showing attribute decisions, entitlement decisions, and any SoD overrides

### Key Entities

- **Duplicate Candidate**: A detected pair of potentially duplicate identities with a confidence score, status (pending/merged/dismissed), and rule match details
- **Merge Operation**: An in-progress or completed merge between two identities, tracking the chosen strategies, SoD check results, and completion status
- **Merge Audit**: An immutable record of a completed merge capturing pre-merge snapshots of both identities, the merged result, all decisions made, and SoD violations
- **Identity Summary**: A lightweight representation of a user identity with core attributes (email, display name, department)
- **Attribute Comparison**: A field-level comparison between two identities showing each attribute's values from both sources and whether they differ
- **Entitlement Preview**: A breakdown of entitlements by category: source-only, target-only, common, and merged result

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can identify and review duplicate identity pairs within 30 seconds of navigating to the Deduplication hub
- **SC-002**: A single merge operation (preview through execution) can be completed in under 2 minutes
- **SC-003**: Batch merge of 50+ pairs completes and shows results within a single page interaction
- **SC-004**: All merge operations are fully auditable with complete pre/post snapshots accessible within 2 clicks
- **SC-005**: The duplicate list loads and paginates smoothly with up to 10,000 candidate pairs
- **SC-006**: False positive pairs can be dismissed and excluded from the default view in under 15 seconds

## Assumptions

- The backend duplicate detection and merge logic is already implemented and functional
- The `{items, total, limit, offset}` pagination format is consistent with other governance endpoints
- Duplicate detection scans are triggered manually (no automatic scheduled detection from the UI)
- The admin performing merges has the appropriate governance admin role (enforced by backend + frontend admin guard)
- Attribute selections for merge use a simple source/target choice per field — no arbitrary value editing
- Batch merge uses synchronous execution (the backend processes all pairs and returns results immediately)

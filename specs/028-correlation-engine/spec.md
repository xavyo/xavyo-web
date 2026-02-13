# Feature Specification: Identity Correlation Engine

**Feature Branch**: `028-correlation-engine`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Frontend for the xavyo-idp correlation engine that enables account-to-identity matching. Features: Correlation Rules CRUD per connector, Identity Correlation Rules CRUD, Threshold Configuration, Correlation Job Execution, Case Management, Statistics Dashboard, Audit Trail."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Correlation Rules per Connector (Priority: P1)

An admin navigates to a connector's correlation configuration and sees a list of attribute matching rules. Each rule defines how an account attribute maps to an identity attribute, with a match type (exact, fuzzy, phonetic, or expression), a weight (0-100), a tier number for prioritized evaluation, and an optional "definitive" flag that auto-confirms a match when triggered. The admin can create new rules, edit existing ones, reorder tiers, and delete rules. Rules are scoped to a specific connector.

**Why this priority**: Correlation rules are the foundation of the matching engine. Without rules, no correlation can occur. This is the entry point for the entire feature.

**Independent Test**: Navigate to a connector's correlation rules tab, see the rule list, create a new rule with exact match type, verify it appears in the list, edit its weight, delete it.

**Acceptance Scenarios**:

1. **Given** a connector exists, **When** admin navigates to its correlation rules section, **Then** they see a list of rules with columns for source attribute, target attribute, match type, weight, tier, and definitive flag
2. **Given** the rules list is displayed, **When** admin clicks "Add Rule", **Then** they see a form with source attribute, target attribute, match type selector (exact/fuzzy/phonetic/expression), weight slider (0-100), tier number, definitive checkbox, and optional expression field
3. **Given** admin fills in a valid rule, **When** they submit, **Then** the rule is created and appears in the list sorted by tier
4. **Given** "expression" match type is selected, **When** admin does not provide an expression value, **Then** validation prevents submission
5. **Given** a rule exists, **When** admin clicks edit, modifies the weight, and saves, **Then** the rule is updated
6. **Given** a rule exists, **When** admin clicks delete and confirms, **Then** the rule is removed from the list
7. **Given** no rules exist for a connector, **When** admin views the rules section, **Then** they see an empty state explaining that rules define how accounts are matched to identities

---

### User Story 2 - Configure Correlation Thresholds (Priority: P1)

An admin configures two confidence thresholds for a connector: an auto-confirm threshold (above which matches are automatically linked) and a manual review threshold (above which matches are sent to the review queue). Scores below the manual review threshold are treated as no-match. The admin can also enable "tuning mode" which routes all matches to manual review regardless of scores, useful during initial setup.

**Why this priority**: Thresholds control the automation/accuracy tradeoff and must be configured before running correlation jobs. Combined with US1, this forms the minimum viable configuration.

**Independent Test**: Navigate to a connector's threshold settings, set auto-confirm to 95 and manual review to 70, enable tuning mode, save — verify settings persist on reload.

**Acceptance Scenarios**:

1. **Given** a connector exists, **When** admin opens threshold configuration, **Then** they see auto-confirm threshold (0-100), manual review threshold (0-100), and a tuning mode toggle
2. **Given** the threshold form is displayed, **When** admin sets auto-confirm to 95 and manual review to 70, **Then** validation passes (auto-confirm must be >= manual review)
3. **Given** admin sets auto-confirm to 60 and manual review to 80, **When** they submit, **Then** validation fails with a message that auto-confirm threshold must be greater than or equal to manual review threshold
4. **Given** thresholds are saved, **When** admin reloads the page, **Then** the previously saved values are displayed
5. **Given** tuning mode is enabled, **When** a correlation job runs, **Then** all matches above the manual review threshold are routed to manual review (none auto-confirmed)

---

### User Story 3 - Execute Correlation Jobs (Priority: P1)

An admin triggers a batch correlation job for a connector to evaluate all uncorrelated accounts. The job runs asynchronously and the admin can monitor its status (pending, running, completed, failed). Upon completion, the admin sees a summary showing how many accounts were processed, how many were auto-confirmed, how many went to manual review, and how many had no match.

**Why this priority**: Job execution is the core action that produces correlation results. Without it, rules and thresholds have no effect.

**Independent Test**: Navigate to a connector, trigger a correlation job, see it appear with "running" status, poll until complete, view the results summary.

**Acceptance Scenarios**:

1. **Given** a connector with rules and thresholds configured, **When** admin clicks "Run Correlation", **Then** a job is created and its status shows as "pending" or "running"
2. **Given** a job is running, **When** admin views the job status, **Then** they see a progress indicator or status badge that updates
3. **Given** a job completes, **When** admin views the results, **Then** they see total accounts processed, auto-confirmed count, manual review count, and no-match count
4. **Given** a job fails, **When** admin views it, **Then** they see an error message explaining the failure
5. **Given** a job is already running for a connector, **When** admin tries to start another, **Then** they receive a message that a job is already in progress
6. **Given** a job is running, **When** admin clicks "Cancel Job" and confirms, **Then** the job status changes to "cancelled" and processing stops

---

### User Story 4 - Review and Resolve Correlation Cases (Priority: P1)

An admin opens the correlation case management queue to see uncertain matches that need human review. Each case shows the account attributes alongside one or more candidate identity matches with per-attribute confidence scores. The admin can take one of four actions: confirm (link the account to the selected identity), reject (mark as not a match), create new identity (the account belongs to a new person), or reassign (link to a different identity by search).

**Why this priority**: Case management is essential for handling matches that fall between the auto-confirm and no-match thresholds. This is the human-in-the-loop component.

**Independent Test**: Navigate to the case review queue, open a case, see account vs. candidate identity with attribute scores, confirm one match — verify case resolves.

**Acceptance Scenarios**:

1. **Given** correlation cases exist, **When** admin navigates to the case queue, **Then** they see a paginated list of pending cases with account name, candidate count, highest confidence score, and creation date
2. **Given** cases are listed, **When** admin filters by status (pending/confirmed/rejected), **Then** only matching cases are shown
3. **Given** a case is opened, **When** admin views the detail, **Then** they see the account attributes on one side and candidate identities on the other, with per-attribute confidence scores and an overall match score
4. **Given** a case detail is shown, **When** admin clicks "Confirm" on a candidate, **Then** the account is linked to that identity, the case status becomes "confirmed", and it is removed from the pending queue
5. **Given** a case detail is shown, **When** admin clicks "Reject" on a candidate, **Then** the match is marked as rejected
6. **Given** a case detail is shown, **When** admin clicks "Create Identity", **Then** a new identity is created from the account attributes and the account is linked to it
7. **Given** a case detail is shown, **When** admin clicks "Reassign", **Then** they can search for an existing identity and link the account to it
8. **Given** no pending cases exist, **When** admin views the queue, **Then** they see an empty state indicating all cases have been reviewed

---

### User Story 5 - Manage Identity Correlation Rules (Priority: P2)

An admin manages tenant-wide identity correlation rules used for duplicate detection across all connectors. These rules differ from connector correlation rules — they compare identity-to-identity rather than account-to-identity. Each rule specifies source and target attribute names, match type, weight, and tier. These rules power the detection of duplicate identities that may have been created from different connectors.

**Why this priority**: Identity-level rules complement connector-level rules by catching duplicates that span multiple data sources. Important but not required for basic correlation.

**Independent Test**: Navigate to Identity Correlation Rules, create a rule matching "email" with exact type and weight 100, see it in the list, delete it.

**Acceptance Scenarios**:

1. **Given** admin navigates to Identity Correlation Rules, **When** the page loads, **Then** they see a list of tenant-wide rules with source attribute, target attribute, match type, weight, and tier
2. **Given** the rules list is shown, **When** admin clicks "Add Rule" and fills in valid values, **Then** the rule is created and appears in the list
3. **Given** a rule exists, **When** admin edits its weight and saves, **Then** the updated weight is displayed
4. **Given** a rule exists, **When** admin deletes it, **Then** it is removed from the list
5. **Given** no identity rules exist, **When** admin views the page, **Then** they see an empty state with guidance on when to use identity correlation rules

---

### User Story 6 - View Correlation Statistics (Priority: P2)

An admin views a statistics dashboard showing per-connector correlation metrics: auto-confirmed count and percentage, manual review count and percentage, no-match count and percentage, average confidence score, and review queue depth. The dashboard also shows trend data (how metrics changed over recent periods) to help admins assess whether rule tuning is improving match quality.

**Why this priority**: Statistics provide feedback on rule and threshold effectiveness, enabling iterative improvement. Important for operational maturity but not required for basic functionality.

**Independent Test**: Navigate to the statistics dashboard, see per-connector metrics with counts and percentages, verify trend charts show historical data.

**Acceptance Scenarios**:

1. **Given** correlation jobs have been run, **When** admin opens the statistics dashboard, **Then** they see per-connector summary cards showing auto-confirmed, manual review, and no-match counts with percentages
2. **Given** statistics are displayed, **When** admin views a connector's metrics, **Then** they see average confidence score and current review queue depth
3. **Given** historical data exists, **When** admin views the trends section, **Then** they see how auto-confirm rate, average confidence, and queue depth have changed over time
4. **Given** no correlation jobs have been run, **When** admin views the dashboard, **Then** they see an empty state suggesting to configure rules and run a job first

---

### User Story 7 - Browse Correlation Audit Trail (Priority: P3)

An admin views a filterable log of all correlation decisions (both automatic and manual). Each audit entry shows the event type (auto-confirm, manual-confirm, reject, create-identity, reassign), the outcome, the confidence score at time of decision, the operator (system or admin user), and snapshots of the rule configuration and thresholds that were active when the decision was made. The admin can filter by connector, event type, date range, and operator.

**Why this priority**: Audit trail supports compliance requirements and debugging of correlation logic. Important for governance but not blocking core functionality.

**Independent Test**: Navigate to the audit trail, see a list of correlation events, filter by event type "auto-confirm", click an entry to see the full decision context including rule/threshold snapshots.

**Acceptance Scenarios**:

1. **Given** correlation decisions have been recorded, **When** admin opens the audit trail, **Then** they see a paginated list of events with timestamp, event type, account name, identity name, confidence score, and operator
2. **Given** the audit list is displayed, **When** admin filters by connector and event type, **Then** only matching events are shown
3. **Given** the audit list is displayed, **When** admin filters by date range, **Then** only events within that range are shown
4. **Given** an audit entry exists, **When** admin clicks on it, **Then** they see the full decision context including the account/identity details, the confidence breakdown, the rule snapshots, and the threshold values at time of decision
5. **Given** no audit entries exist, **When** admin views the trail, **Then** they see an empty state

---

### Edge Cases

- What happens when a connector has no correlation rules configured and a job is triggered? The system should prevent job execution and display a message to configure rules first.
- What happens when all candidates for a case are rejected? The case should move to a "no-match" status, and the admin can later reassign or create a new identity.
- What happens when a correlation rule references an attribute that doesn't exist on some accounts? The rule should be skipped for those accounts with no error.
- What happens when threshold auto-confirm equals manual review threshold? All matches at or above that threshold should be auto-confirmed with nothing going to manual review.
- What happens when a case's candidate identity is deleted or merged before review? The case should show the candidate as unavailable and offer the remaining candidates or create-identity option.
- What happens when an admin tries to delete a correlation rule while a job is running? The system should prevent deletion or queue the change for after job completion.
- What happens when two admins try to resolve the same case simultaneously? The second submission should fail with a conflict error indicating the case was already resolved, prompting the admin to refresh.
- What happens when an admin cancels a running job? The job status transitions to "cancelled", any already-processed results remain, and the admin can start a new job.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to create, read, update, and delete correlation rules scoped to a specific connector
- **FR-002**: Each correlation rule MUST specify a source attribute, target attribute, match type (exact, fuzzy, phonetic, expression), weight (0-100), tier, and optional definitive flag
- **FR-003**: When match type is "expression", the system MUST require an expression value to be provided
- **FR-004**: System MUST allow admins to configure auto-confirm and manual review thresholds per connector
- **FR-005**: Auto-confirm threshold MUST be validated to be greater than or equal to the manual review threshold
- **FR-006**: System MUST support a "tuning mode" that routes all matches to manual review regardless of confidence scores
- **FR-007**: System MUST allow admins to trigger batch correlation jobs per connector
- **FR-008**: System MUST display job status (pending, running, completed, failed) and results summary upon completion
- **FR-009**: System MUST prevent starting a new correlation job for a connector that already has a running job
- **FR-009a**: System MUST allow admins to cancel a running correlation job; cancelled jobs retain already-processed results
- **FR-010**: System MUST present uncertain matches as cases in a review queue with account attributes and candidate identities
- **FR-011**: Each case MUST display per-attribute confidence scores and an overall match score per candidate
- **FR-012**: System MUST support four case resolution actions: confirm, reject, create identity, and reassign
- **FR-013**: System MUST allow admins to create, read, update, and delete tenant-wide identity correlation rules
- **FR-014**: System MUST display per-connector correlation statistics including auto-confirmed, manual review, and no-match counts with percentages
- **FR-015**: System MUST display average confidence scores and review queue depth per connector
- **FR-016**: System MUST show trend data for correlation metrics over time
- **FR-017**: System MUST maintain a filterable audit log of all correlation decisions
- **FR-018**: Each audit entry MUST include event type, outcome, confidence score, operator, and snapshots of active rules and thresholds
- **FR-019**: All mutation operations (create, update, delete rules; configure thresholds; trigger jobs; resolve cases) MUST require admin role
- **FR-020**: System MUST paginate all list views (rules, cases, audit entries, statistics)

### Key Entities

- **Correlation Rule**: Defines how an account attribute matches an identity attribute for a specific connector. Key attributes: source_attribute, target_attribute, match_type, weight, tier, is_definitive, expression
- **Identity Correlation Rule**: Tenant-wide rule for identity-to-identity duplicate detection. Similar attributes to correlation rules but not scoped to a connector
- **Threshold Configuration**: Per-connector settings controlling auto-confirm and manual review boundaries. Key attributes: auto_confirm_threshold, manual_review_threshold, tuning_mode_enabled
- **Correlation Job**: A batch processing run that evaluates uncorrelated accounts. Key attributes: status (pending, running, completed, failed, cancelled), total_processed, auto_confirmed, manual_review, no_match, error
- **Correlation Case**: An uncertain match requiring human review. Key attributes: account, candidates (with per-attribute scores), status, resolution, resolved_by
- **Correlation Statistic**: Per-connector aggregated metrics. Key attributes: connector_id, auto_confirmed_count, manual_review_count, no_match_count, average_confidence, queue_depth
- **Correlation Audit Entry**: Record of a correlation decision. Key attributes: event_type, outcome, confidence_score, operator, rule_snapshot, threshold_snapshot

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can configure a complete correlation setup (rules + thresholds) for a connector in under 5 minutes
- **SC-002**: Correlation jobs process accounts and display results without requiring page refresh (status polling)
- **SC-003**: Case review queue allows an admin to resolve a case (confirm/reject/create/reassign) in under 30 seconds per case
- **SC-004**: Statistics dashboard loads per-connector metrics within 2 seconds
- **SC-005**: Audit trail supports filtering by connector, event type, date range, and operator with results displayed within 2 seconds
- **SC-006**: All CRUD operations provide immediate visual feedback (success/error messages)
- **SC-007**: The feature integrates seamlessly with existing connector management — correlation configuration is accessible from the connector detail page
- **SC-008**: 100% of mutation endpoints enforce admin role authorization

## Clarifications

### Session 2026-02-12

- Q: Can admins cancel a running correlation job? → A: Yes — adds cancel action to job UI, job transitions to "cancelled" state, already-processed results are retained
- Q: How should concurrent case resolution be handled (two admins resolving the same case)? → A: Backend handles with optimistic concurrency — second submission fails with conflict error, admin must refresh

## Assumptions

- The xavyo-idp backend already implements all correlation engine APIs (rules CRUD, thresholds, job execution, cases, statistics, audit) — the frontend consumes these existing endpoints
- Correlation rules are scoped per connector using the connector_id from the existing connector management feature
- Identity correlation rules are tenant-scoped and not tied to any specific connector
- The backend handles all correlation logic (matching algorithms, scoring, threshold evaluation) — the frontend only triggers and displays results
- Statistics trends are computed server-side and returned as time-series data
- Audit snapshots are stored server-side at decision time — the frontend displays them read-only

# Feature Specification: Outlier Detection & Peer Groups

**Feature Branch**: `022-outlier-detection-peer-groups`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Outlier Detection & Peer Groups (Phase 022): Implement complete UI for identity access outlier detection and peer group management."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Outlier Summary Dashboard (Priority: P1)

As an admin, I want to view a summary dashboard showing outlier detection results so I can quickly assess the current state of access anomalies across the organization.

**Why this priority**: The summary dashboard is the primary entry point for the outlier detection feature. It provides at-a-glance visibility into total outliers detected, severity distribution, and recent analysis activity — essential for admin oversight.

**Independent Test**: Can be fully tested by navigating to the outlier detection page and verifying summary cards display total outliers, severity breakdown (high/medium/low), and recent analysis information.

**Acceptance Scenarios**:

1. **Given** an admin is logged in, **When** they navigate to `/governance/outliers`, **Then** they see a Summary tab with cards showing total outliers, distribution by severity, and recent analyses.
2. **Given** the summary data is loading, **When** the page renders, **Then** skeleton loading states are shown for all summary cards.
3. **Given** no outlier analyses have been run yet, **When** the admin views the summary, **Then** the dashboard shows zero counts with a prompt to run the first analysis.

---

### User Story 2 - Outlier Analysis Management (Priority: P1)

As an admin, I want to trigger new outlier detection analyses and view past analysis results so I can proactively identify users with anomalous access patterns.

**Why this priority**: Analysis management is core to the feature — without the ability to trigger and view analyses, no outlier data exists. This is co-P1 with the dashboard since they work together.

**Independent Test**: Can be fully tested by navigating to the Analyses tab, triggering a new analysis, and verifying it appears in the list with correct status and timestamps.

**Acceptance Scenarios**:

1. **Given** an admin is on the Analyses tab, **When** they click "New Analysis", **Then** a dialog appears with optional scope and peer group selection fields.
2. **Given** an admin submits a new analysis request, **When** the backend accepts it (202), **Then** a success toast is shown and the analysis appears in the list with "pending" status.
3. **Given** analyses exist, **When** the admin views the list, **Then** each analysis shows its status, timestamps, scope, and total outliers found.
4. **Given** the admin filters by status, **When** they select "completed", **Then** only completed analyses are shown.

---

### User Story 3 - Outlier Results Browsing (Priority: P1)

As an admin, I want to browse outlier detection results showing which users have anomalous access, their outlier scores, affected entitlements, and peer group deviations so I can investigate and take action.

**Why this priority**: Results are the actionable output of analyses. Admins need to see who the outliers are and understand why they were flagged to make informed decisions.

**Independent Test**: Can be fully tested by navigating to the Results tab, selecting an analysis, viewing the results table, filtering by minimum score, and clicking into a result detail to see the full breakdown.

**Acceptance Scenarios**:

1. **Given** an admin is on the Results tab, **When** results exist, **Then** a table shows user, outlier score, affected entitlements count, peer group, and deviation summary.
2. **Given** results are displayed, **When** the admin sets a minimum score filter (e.g., 0.7), **Then** only results with score >= 0.7 are shown.
3. **Given** a result row is displayed, **When** the admin clicks on it, **Then** the result detail page shows full breakdown with all affected entitlements, deviation metrics, and peer group comparison.
4. **Given** results are loading, **When** the table renders, **Then** skeleton rows are shown with pagination controls.

---

### User Story 4 - Outlier Detection Configuration (Priority: P2)

As an admin, I want to configure outlier detection settings including sensitivity thresholds, analysis scope, and enable/disable the feature so I can tune detection to my organization's needs.

**Why this priority**: Configuration is important but not blocking for initial use. Defaults can be used for the first analyses.

**Independent Test**: Can be fully tested by navigating to the Config tab, viewing current settings, toggling enable/disable, updating sensitivity, and verifying changes persist.

**Acceptance Scenarios**:

1. **Given** an admin is on the Config tab, **When** detection is enabled, **Then** a green "Enabled" badge is shown with an option to disable.
2. **Given** an admin clicks "Disable Detection", **When** the backend confirms (204), **Then** the status changes to "Disabled" with an option to enable.
3. **Given** an admin updates the sensitivity threshold, **When** they save, **Then** the new value is persisted and reflected in the UI.
4. **Given** detection is disabled, **When** an admin tries to trigger a new analysis, **Then** they see a warning that detection is currently disabled.

---

### User Story 5 - Outlier Alerts (Priority: P2)

As an admin, I want to view alerts generated from outlier detection so I can be notified of newly detected anomalies and respond promptly.

**Why this priority**: Alerts provide proactive notification of new outliers, enhancing the operational value of the detection system beyond manual browsing.

**Independent Test**: Can be fully tested by navigating to the Alerts tab, viewing the alert list with severity badges, and checking the alert summary counts.

**Acceptance Scenarios**:

1. **Given** an admin is on the Alerts tab, **When** alerts exist, **Then** a table shows each alert with severity, affected user, timestamp, and brief description.
2. **Given** alerts exist, **When** the admin filters by severity (e.g., "high"), **Then** only high-severity alerts are shown.
3. **Given** the Alerts tab loads, **When** the alert summary is displayed, **Then** summary counts show total alerts and breakdown by severity.

---

### User Story 6 - Outlier Dispositions (Priority: P2)

As an admin, I want to record and track dispositions on outlier findings (accepted, remediated, dismissed) so I can maintain an audit trail of how anomalies were handled.

**Why this priority**: Dispositions close the loop on outlier detection by providing decision tracking and compliance evidence.

**Independent Test**: Can be fully tested by navigating to the Dispositions tab, viewing the list of disposition decisions, and filtering by disposition type.

**Acceptance Scenarios**:

1. **Given** an admin is on the Dispositions tab, **When** dispositions exist, **Then** a table shows result reference, disposition type (accepted/remediated/dismissed), decision date, and decision maker.
2. **Given** dispositions exist, **When** the admin filters by type "remediated", **Then** only remediated dispositions are shown.
3. **Given** the admin filters by result_id, **When** results match, **Then** only dispositions for that specific result are shown.

---

### User Story 7 - Peer Group Management (Priority: P2)

As an admin, I want to create, view, edit, and delete peer groups that define sets of users with similar access patterns so outlier detection can compare users against their peers.

**Why this priority**: Peer groups enhance outlier detection accuracy by providing meaningful comparison baselines. The feature works without custom groups (using defaults) but benefits significantly from admin-defined groups.

**Independent Test**: Can be fully tested by navigating to `/governance/peer-groups`, creating a new group with name and criteria, viewing the list, opening the detail page, editing the group, and deleting it.

**Acceptance Scenarios**:

1. **Given** an admin navigates to `/governance/peer-groups`, **When** the page loads, **Then** a list of peer groups is shown with name, description, and member criteria summary.
2. **Given** an admin clicks "Create Peer Group", **When** they fill name, optional description, and criteria, **Then** the group is created and appears in the list.
3. **Given** a peer group exists, **When** the admin clicks on it, **Then** the detail page shows full group information with criteria details.
4. **Given** a peer group detail page, **When** the admin clicks "Edit", **Then** they can modify name, description, and criteria.
5. **Given** a peer group detail page, **When** the admin clicks "Delete" and confirms, **Then** the group is removed and the admin is redirected to the list.

---

### User Story 8 - User Outlier History (Priority: P3)

As an admin, I want to view a specific user's outlier detection history showing their historical scores and which analyses flagged them so I can understand patterns over time.

**Why this priority**: Per-user history provides deeper investigation capability but is supplementary to the main results view.

**Independent Test**: Can be fully tested by navigating to a user's outlier history view, verifying historical scores are listed with analysis references and timestamps.

**Acceptance Scenarios**:

1. **Given** an admin provides a user ID, **When** the history loads, **Then** a list shows each time the user was flagged as an outlier with score, analysis reference, and date.
2. **Given** no outlier history exists for a user, **When** the history loads, **Then** an empty state message indicates no outlier records found.

---

### User Story 9 - Outlier Reports (Priority: P3)

As an admin, I want to generate comprehensive outlier reports for compliance purposes and export analysis results so I can provide evidence to auditors and stakeholders.

**Why this priority**: Reporting is important for compliance but is supplementary to the core detection and investigation workflow.

**Independent Test**: Can be fully tested by triggering a report generation request and verifying the system accepts the request.

**Acceptance Scenarios**:

1. **Given** an admin is on the outlier section, **When** they click "Generate Report", **Then** a dialog allows selecting an analysis and format.
2. **Given** a report request is submitted, **When** the backend accepts it, **Then** a success message is shown confirming the report is being generated.

---

### Edge Cases

- What happens when an analysis is triggered while another is already running? The system accepts it (backend handles queuing).
- What happens when the admin disables detection and then views existing results? Existing results remain viewable; only new analysis triggering is affected.
- What happens when a peer group is deleted that was referenced by a past analysis? Past analysis results remain intact; the peer group reference may show as "deleted group".
- How does the system handle very large result sets (1000+ outliers)? Pagination with configurable limit (default 20 per page).
- What happens when the summary endpoint returns zero outliers? Show zero counts with informative empty states encouraging the admin to run an analysis.
- What happens when the user ID in the user outlier history doesn't exist? Show an empty state indicating no records found.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an outlier summary dashboard with total outliers, severity distribution, and recent analysis count.
- **FR-002**: System MUST allow admins to view a paginated list of outlier analyses with status, timestamps, and scope.
- **FR-003**: System MUST allow admins to trigger a new outlier analysis with optional scope and peer group selection.
- **FR-004**: System MUST display paginated outlier results with user, outlier score, affected entitlements, peer group, and deviation details.
- **FR-005**: System MUST allow filtering results by minimum outlier score threshold.
- **FR-006**: System MUST display a detail view for individual outlier results showing full breakdown of affected entitlements and deviation metrics.
- **FR-007**: System MUST allow admins to view and update outlier detection configuration (sensitivity, scope).
- **FR-008**: System MUST allow admins to enable or disable outlier detection.
- **FR-009**: System MUST display paginated alerts with severity, affected user, and timestamps.
- **FR-010**: System MUST provide alert summary counts by severity.
- **FR-011**: System MUST allow admins to filter alerts by severity level.
- **FR-012**: System MUST display a paginated list of outlier dispositions with type, result reference, and decision details.
- **FR-013**: System MUST allow filtering dispositions by type and result ID.
- **FR-014**: System MUST allow admins to create peer groups with name, optional description, and criteria.
- **FR-015**: System MUST display a paginated list of peer groups.
- **FR-016**: System MUST provide a detail page for each peer group showing name, description, and criteria.
- **FR-017**: System MUST allow admins to edit peer group name, description, and criteria.
- **FR-018**: System MUST allow admins to delete peer groups with confirmation.
- **FR-019**: System MUST display per-user outlier history with historical scores and analysis references.
- **FR-020**: System MUST allow admins to generate outlier reports for specified analyses.
- **FR-021**: System MUST restrict all outlier detection and peer group management to admin users only.
- **FR-022**: System MUST use tab-based navigation for the outlier section (Summary, Analyses, Results, Alerts, Dispositions, Config).

### Key Entities

- **Outlier Config**: Detection settings including sensitivity threshold, enabled status, and analysis scope.
- **Outlier Analysis**: A detection run with ID, status (pending/running/completed/failed), scope, timestamps, and result counts.
- **Outlier Result**: An individual finding linking a user to an analysis with outlier score, affected entitlements, peer group, and deviation metrics.
- **Outlier Alert**: A notification generated when a new outlier is detected, with severity (low/medium/high/critical), affected user, and timestamp.
- **Outlier Disposition**: An admin decision on an outlier finding (accepted/remediated/dismissed) with decision maker and timestamp.
- **Outlier Report**: A generated compliance report for a specific analysis or time period.
- **Peer Group**: A named set of criteria defining users with similar access patterns. Has ID, name, description, and criteria object.

## Assumptions

- Backend API endpoints follow the standard governance pagination format: `{items, total, limit, offset}`.
- Outlier detection configuration has reasonable defaults so the feature is usable without initial configuration.
- Peer group criteria is an opaque JSON object defined by the backend; the frontend stores and displays it but does not enforce its structure.
- Alert severity levels are: low, medium, high, critical.
- Disposition types are: accepted, remediated, dismissed.
- Analysis statuses are: pending, running, completed, failed.
- The feature is admin-only (requires admin or super_admin role).
- Report generation is asynchronous — the POST returns a confirmation, and the report becomes available later.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can view the outlier summary dashboard within 2 seconds of navigation.
- **SC-002**: Admins can trigger a new outlier analysis in under 3 clicks from the outlier section.
- **SC-003**: Outlier results are paginated and filterable, displaying 20 results per page by default.
- **SC-004**: All CRUD operations for peer groups (create, read, update, delete) complete successfully with appropriate feedback.
- **SC-005**: Tab navigation between all 6 outlier section tabs (Summary, Analyses, Results, Alerts, Dispositions, Config) works without page reload.
- **SC-006**: All pages display appropriate empty states when no data exists.
- **SC-007**: All pages support both light and dark themes.
- **SC-008**: Feature is restricted to admin users; non-admin users cannot access outlier or peer group pages.
- **SC-009**: All new UI components have corresponding unit tests with 80%+ coverage.

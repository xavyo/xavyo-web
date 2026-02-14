# Feature Specification: Risk Dashboard & Management

**Feature Branch**: `001-risk-dashboard`
**Created**: 2026-02-14
**Status**: Draft
**Input**: Phase 042 — Admin UI for comprehensive identity risk management covering risk alerts, risk scores, risk factors, risk events, and risk thresholds.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Risk Alerts Dashboard (Priority: P1)

A security admin navigates to the Risk Dashboard and immediately sees a summary section with key metrics: total open alerts, critical-severity count, high-severity count, and a count of high-risk users. Below the summary, a filterable list shows all risk alerts with their severity (critical, high, medium, low), status (open, acknowledged, dismissed), affected user, alert type, description, and creation date. The admin can filter by severity and status, and view alert details. From the alert detail, the admin can acknowledge or dismiss alerts.

**Why this priority**: Risk alerts are the primary action trigger for security teams. Without visibility into active alerts and the ability to triage them, admins cannot respond to identity risks in a timely manner. This is the most operationally critical view.

**Independent Test**: Can be fully tested by navigating to the Risk Dashboard, verifying summary cards display counts, the alert list renders with correct columns, filters work, and acknowledge/dismiss actions update the alert status.

**Acceptance Scenarios**:

1. **Given** risk alerts exist in various states, **When** the admin opens the Risk Dashboard, **Then** summary cards show accurate counts for total open, critical, high, and high-risk users
2. **Given** the alert list is displayed, **When** the admin filters by severity "critical", **Then** only critical alerts appear
3. **Given** the alert list is displayed, **When** the admin filters by status "open", **Then** only open alerts appear
4. **Given** an open alert, **When** the admin clicks on it, **Then** the alert detail is shown with full description, affected user, and action buttons
5. **Given** an open alert detail, **When** the admin clicks "Acknowledge", **Then** the alert status changes to acknowledged and the summary counts update
6. **Given** an open or acknowledged alert, **When** the admin clicks "Dismiss", **Then** the alert status changes to dismissed
7. **Given** no risk alerts exist, **When** the admin opens the dashboard, **Then** summary cards show zeros and an empty state message appears

---

### User Story 2 - Risk Scores Overview (Priority: P1)

A security admin navigates to the Risk Scores page and sees a table of all users with their computed risk scores. The table shows user name, risk score (numeric), risk level (derived from thresholds: critical, high, medium, low), and last updated date. The admin can filter by minimum and maximum score ranges, and search by user. Clicking on a user row opens a detail view showing the risk score breakdown by contributing factors (each factor's name, weight, and contribution to the total score).

**Why this priority**: Risk scores provide the quantitative foundation for risk-based decisions. Security admins need to identify high-risk users and understand why they are flagged. This view enables proactive risk management alongside the alert-driven reactive approach of US1.

**Independent Test**: Can be tested by navigating to Risk Scores, verifying the table lists users with scores, filters by score range work, and clicking a user shows the factor breakdown.

**Acceptance Scenarios**:

1. **Given** users have computed risk scores, **When** the admin opens the Risk Scores page, **Then** a table shows all users with their score, risk level, and last updated date
2. **Given** the scores table, **When** the admin filters by minimum score 80, **Then** only users with scores >= 80 appear
3. **Given** a user in the table, **When** the admin clicks on the user row, **Then** a detail view shows the risk score breakdown with each contributing factor's name, weight, and contribution
4. **Given** no risk scores exist, **When** the admin opens the page, **Then** an empty state message is shown
5. **Given** the scores table, **When** the admin searches for a specific user, **Then** results are filtered to matching users

---

### User Story 3 - Risk Events Log (Priority: P2)

A security admin navigates to the Risk Events page and sees a chronological log of all risk-related events in the system. Each event shows the event type, severity, affected user, description, and timestamp. The admin can filter events by event type, severity, and user. Clicking an event row shows the full event details.

**Why this priority**: Risk events provide the audit trail and timeline for understanding what happened and when. While alerts (US1) show current state and scores (US2) show aggregated risk, events show the individual incidents that contributed to those states. This is essential for investigation and compliance.

**Independent Test**: Can be tested by navigating to Risk Events, verifying the log renders events chronologically, filters work correctly, and event detail shows full information.

**Acceptance Scenarios**:

1. **Given** risk events exist, **When** the admin opens the Risk Events page, **Then** events are listed chronologically with type, severity, user, description, and timestamp
2. **Given** the events list, **When** the admin filters by severity "critical", **Then** only critical events appear
3. **Given** the events list, **When** the admin filters by event type, **Then** only events of that type appear
4. **Given** the events list, **When** the admin filters by a specific user, **Then** only events for that user appear
5. **Given** an event in the list, **When** the admin clicks on it, **Then** the full event details are displayed
6. **Given** no risk events exist, **When** the admin opens the page, **Then** an empty state message is shown

---

### User Story 4 - Risk Factors Administration (Priority: P2)

A security admin navigates to the Risk Factors page and sees a list of all configured risk factors with their name, description, weight, category, and enabled/disabled status. The admin can create new risk factors by providing a name, description, weight, and category. Existing factors can be edited, enabled/disabled, and deleted. Risk factors define what contributes to a user's risk score — for example, "Failed login attempts", "Inactive for 90+ days", or "Excessive permissions".

**Why this priority**: Risk factors are the configuration backbone of the risk scoring engine. Admins need to tune which factors contribute to risk scores and with what weight. This is an administrative feature that customizes how risk is assessed, but depends on the viewing capabilities of US1-US3 being in place to observe the effects.

**Independent Test**: Can be tested by creating a risk factor with a name and weight, viewing it in the list, editing its weight, disabling it, re-enabling it, and deleting it.

**Acceptance Scenarios**:

1. **Given** the Risk Factors page, **When** the admin views the list, **Then** all factors are shown with name, description, weight, category, and enabled status
2. **Given** the create form, **When** the admin fills in name, weight, and category and submits, **Then** the factor is created and appears in the list
3. **Given** an existing factor, **When** the admin edits its weight and saves, **Then** the factor is updated
4. **Given** an enabled factor, **When** the admin disables it, **Then** the factor status changes to disabled
5. **Given** a disabled factor, **When** the admin enables it, **Then** the factor status changes to enabled
6. **Given** a factor, **When** the admin deletes it and confirms, **Then** the factor is removed from the list
7. **Given** the create form, **When** the admin submits without a name, **Then** a validation error is shown

---

### User Story 5 - Risk Thresholds Configuration (Priority: P3)

A security admin navigates to the Risk Thresholds page and sees the current threshold configuration that maps numeric risk scores to risk levels (critical, high, medium, low). For example: scores above 90 = critical, 70-89 = high, 40-69 = medium, below 40 = low. The admin can adjust these threshold values and save the updated configuration. Changes take effect immediately for how risk scores are displayed across all risk views.

**Why this priority**: Threshold configuration allows organizations to calibrate what constitutes "critical" or "high" risk according to their own risk appetite. This is a configuration feature that fine-tunes the display of US2 (Risk Scores), but has a reasonable default that works out of the box.

**Independent Test**: Can be tested by viewing the current thresholds, modifying a threshold value, saving, and verifying the updated thresholds persist on page reload.

**Acceptance Scenarios**:

1. **Given** the Risk Thresholds page, **When** the admin opens it, **Then** the current threshold values are displayed for each risk level
2. **Given** the thresholds form, **When** the admin changes the critical threshold from 90 to 85 and saves, **Then** the threshold is updated and a success message is shown
3. **Given** the thresholds form, **When** the admin enters an invalid value (e.g., high threshold greater than critical), **Then** a validation error is shown
4. **Given** updated thresholds, **When** the admin navigates to Risk Scores, **Then** risk levels reflect the new threshold boundaries

---

### Edge Cases

- What happens when a risk alert references a user that has been deleted? The system should display the user ID with a "deleted user" indicator.
- How does the system handle acknowledging an already-acknowledged alert? The action button should be hidden for already-acknowledged alerts; only "Dismiss" should remain.
- What happens when all risk factors are disabled? Risk scores should display as zero or show a warning that no factors are configured.
- How does the system handle a risk score of exactly a threshold boundary value? The system should use inclusive lower bounds (e.g., score of 70 with high threshold at 70 = high).
- What happens when the admin sets overlapping or inverted threshold values? The form should validate that critical > high > medium > low boundaries.
- How does the system handle risk events for users in different tenants? All data is tenant-scoped; the admin only sees data for their own tenant.
- What happens when deleting a risk factor that contributes to existing scores? The deletion succeeds, but existing scores are not retroactively recalculated — this is handled by the backend's next scoring cycle.

## Requirements *(mandatory)*

### Functional Requirements

**Risk Alerts Dashboard (US1)**
- **FR-001**: System MUST display a summary section with total open alerts, critical count, high count, and high-risk user count
- **FR-002**: System MUST display risk alerts in a filterable, paginated list with severity, status, user, type, description, and date
- **FR-003**: System MUST allow filtering alerts by severity (critical, high, medium, low) and status (open, acknowledged, dismissed)
- **FR-004**: System MUST allow admins to acknowledge an open alert
- **FR-005**: System MUST allow admins to dismiss an open or acknowledged alert
- **FR-006**: System MUST display alert details including full description and affected user information

**Risk Scores (US2)**
- **FR-007**: System MUST display a paginated table of users with their risk score, risk level, and last updated date
- **FR-008**: System MUST allow filtering by minimum and maximum score range
- **FR-009**: System MUST allow searching scores by user identifier
- **FR-010**: System MUST display a score breakdown showing each contributing factor's name, weight, and contribution

**Risk Events (US3)**
- **FR-011**: System MUST display risk events in a chronological, filterable, paginated list
- **FR-012**: System MUST allow filtering events by event type, severity, and user
- **FR-013**: System MUST display full event details when an event is selected

**Risk Factors (US4)**
- **FR-014**: System MUST display all risk factors with name, description, weight, category, and enabled status
- **FR-015**: System MUST allow admins to create risk factors with name, description, weight, and category
- **FR-016**: System MUST allow admins to edit existing risk factors
- **FR-017**: System MUST allow admins to enable and disable individual risk factors
- **FR-018**: System MUST allow admins to delete risk factors with confirmation
- **FR-019**: System MUST validate all input fields before submission

**Risk Thresholds (US5)**
- **FR-020**: System MUST display current risk threshold values for each risk level
- **FR-021**: System MUST allow admins to update threshold values
- **FR-022**: System MUST validate that threshold boundaries are consistent (critical > high > medium > low)

**Access Control**
- **FR-023**: All risk management pages MUST be restricted to admin users
- **FR-024**: System MUST redirect non-admin users to the dashboard

**Navigation**
- **FR-025**: System MUST include a "Risk Management" entry in the sidebar navigation under the Governance section

### Key Entities

- **Risk Alert**: A notification about an identity risk condition, with severity (critical/high/medium/low), status (open/acknowledged/dismissed), affected user, alert type, description, and timestamps
- **Risk Score**: A computed numeric score for a user representing their overall identity risk level, with a breakdown of contributing factors
- **Risk Factor**: A configurable parameter that contributes to risk score calculation, with name, description, numeric weight, category, and enabled/disabled status
- **Risk Event**: An individual risk-related incident record, with event type, severity, affected user, description, and timestamp
- **Risk Threshold**: Configuration that maps numeric score ranges to risk levels (critical, high, medium, low), defining the boundaries between levels

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can view the risk alerts dashboard with summary metrics and alert list within 3 seconds of page load
- **SC-002**: Admins can acknowledge or dismiss an alert with a maximum of 3 clicks from the dashboard
- **SC-003**: Admins can identify high-risk users from the scores table within 10 seconds of opening the page
- **SC-004**: Admins can view a user's full risk score breakdown within 2 seconds of clicking their name
- **SC-005**: Admins can create a new risk factor in under 1 minute
- **SC-006**: Admins can update risk thresholds and see the changes reflected immediately
- **SC-007**: All list views support pagination and filtering for datasets of any size
- **SC-008**: 100% of admin-only operations enforce role-based access control
- **SC-009**: All form inputs are validated before submission with clear error messages
- **SC-010**: All 5 backend risk API groups have corresponding frontend UI coverage

## Assumptions

- The backend API for all 5 risk endpoint groups is already implemented and functional
- Risk scores are computed server-side; the frontend only displays pre-calculated values
- Risk levels (critical, high, medium, low) are derived by applying threshold configuration to numeric scores — this mapping can happen client-side using the threshold values
- Risk factor categories are free-form strings defined by the admin, not a fixed enum
- Risk alerts are generated by the backend based on configured rules; the frontend does not create alerts (only acknowledges/dismisses them)
- The summary endpoint returns pre-aggregated counts; the frontend does not compute them from the alert list
- All list endpoints follow the standard governance pagination format
- Risk event creation from the frontend is not needed for initial release (events are system-generated); the create endpoint may be used in future for manual event logging

# Feature Specification: Provisioning Operations & Reconciliation

**Feature Branch**: `021-provisioning-reconciliation`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Implement complete UI for managing identity provisioning operations and connector reconciliation. This extends the Connector Management (Phase 020) with operational visibility and identity sync management."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operations Queue & Detail (Priority: P1)

An administrator needs to monitor all provisioning operations happening across connectors in a single view. They navigate to the Operations page, which shows a table of all operations with type (create/update/delete), status (pending, in_progress, completed, failed, dead_letter, awaiting_system, resolved, cancelled), connector name, associated user, priority, retry count, and timestamps. The administrator filters by connector, status, operation type, and date range. They click on an operation row to view its full details, including a status timeline, error messages, payload JSON, and execution attempt history (attempt number, start/end times, success flag, error codes, duration). From the detail page, the administrator can retry failed operations, cancel pending ones, or resolve dead-letter operations with optional notes.

**Why this priority**: Operations queue is the primary monitoring interface. Without it, administrators have no visibility into what the provisioning system is doing, making all other features less useful.

**Independent Test**: Can be fully tested by listing operations, filtering by various criteria, viewing operation detail, and performing retry/cancel/resolve actions. Delivers immediate operational monitoring value.

**Acceptance Scenarios**:

1. **Given** an administrator on the Operations page, **When** the page loads, **Then** all operations across connectors are listed in a paginated table with type, status, connector name, user, priority, retry count, and timestamps.
2. **Given** an operations list with multiple connectors, **When** the administrator selects a connector filter, **Then** only operations for that connector are shown.
3. **Given** an operations list, **When** the administrator filters by status "failed", **Then** only failed operations appear.
4. **Given** an operations list, **When** the administrator filters by operation type "create" and a date range, **Then** only matching operations appear.
5. **Given** a failed operation detail page, **When** the administrator clicks "Retry", **Then** the operation is resubmitted and a success confirmation is shown.
6. **Given** a pending operation detail page, **When** the administrator clicks "Cancel", **Then** the operation is cancelled and the status updates.
7. **Given** a dead-letter operation detail page, **When** the administrator enters resolution notes and clicks "Resolve", **Then** the operation is marked resolved with the notes recorded.
8. **Given** an operation detail page, **When** the page loads, **Then** the execution attempts history shows each attempt with its number, start time, end time, success status, error code, and duration.

---

### User Story 2 - Queue Statistics Dashboard (Priority: P1)

An administrator needs a high-level overview of provisioning queue health. The statistics dashboard shows cards with counts for pending, in progress, completed, failed, dead letter, awaiting system operations, and the average processing time. The administrator can filter statistics by connector to see per-connector health.

**Why this priority**: Tied with operations queue because statistics provide the "at a glance" health view that determines whether an administrator needs to drill into individual operations.

**Independent Test**: Can be tested by loading the statistics view and verifying card counts match expected values. Filter by connector and confirm counts update accordingly.

**Acceptance Scenarios**:

1. **Given** the administrator opens the queue statistics view, **When** the page loads, **Then** dashboard cards display counts for each status category and average processing time.
2. **Given** queue statistics, **When** the administrator selects a specific connector, **Then** the cards update to show only that connector's statistics.
3. **Given** no operations exist, **When** statistics load, **Then** all counters show zero and average processing time shows "N/A".

---

### User Story 3 - Dead Letter Queue Management (Priority: P2)

An administrator needs to manage operations that have exceeded maximum retries and landed in the dead letter queue. A dedicated DLQ view shows these problematic operations with their error details. The administrator can retry individual operations or resolve them with explanatory notes.

**Why this priority**: DLQ operations represent provisioning failures that need manual intervention. This is the critical recovery path after the monitoring (P1) identifies problems.

**Independent Test**: Can be tested by viewing the DLQ list, verifying error details are displayed, retrying an operation, and resolving an operation with notes.

**Acceptance Scenarios**:

1. **Given** operations in the dead letter queue, **When** the administrator opens the DLQ view, **Then** all dead-letter operations are listed with error details, connector name, and timestamps.
2. **Given** a DLQ operation, **When** the administrator clicks "Retry", **Then** the operation is resubmitted for processing.
3. **Given** a DLQ operation, **When** the administrator enters notes and clicks "Resolve", **Then** the operation is marked as resolved and removed from the DLQ view.
4. **Given** the DLQ is empty, **When** the page loads, **Then** an empty state message indicates no dead-letter operations exist.

---

### User Story 4 - Reconciliation Runs (Priority: P2)

An administrator managing a specific connector needs to trigger and monitor reconciliation runs. From the connector's reconciliation page, they can start a new run choosing full or delta mode with an optional dry-run flag. The list of past runs shows status, statistics (accounts processed, discrepancies found, duration). Clicking a run shows a detailed report with discrepancy summary, action summary, top mismatched attributes, and performance metrics. The administrator can also cancel an in-progress run or resume a paused one.

**Why this priority**: Reconciliation runs are the core mechanism for detecting identity sync issues. This is essential once administrators can see operational problems and need to diagnose root causes.

**Independent Test**: Can be tested by navigating to a connector's reconciliation page, triggering a run, viewing run status and statistics, and examining the detailed report.

**Acceptance Scenarios**:

1. **Given** a connector detail page, **When** the administrator navigates to the reconciliation section, **Then** past reconciliation runs are listed with status, statistics, and duration.
2. **Given** the reconciliation page, **When** the administrator selects "Full" mode and clicks "Start Run", **Then** a new reconciliation run is triggered and appears in the list with "running" status.
3. **Given** a completed reconciliation run, **When** the administrator clicks on it, **Then** a detailed report shows discrepancy summary, action summary, top mismatched attributes, and performance metrics.
4. **Given** a running reconciliation, **When** the administrator clicks "Cancel", **Then** the run is cancelled.
5. **Given** a dry-run option selected, **When** the administrator triggers a run, **Then** no actual changes are made and the report shows what would have happened.

---

### User Story 5 - Discrepancy Management (Priority: P2)

After a reconciliation run identifies discrepancies, the administrator needs to review and resolve them. The discrepancy list shows each discrepancy with a type badge (missing, orphan, mismatch, collision, unlinked, deleted), filterable by type and resolution status. For each discrepancy, the administrator can remediate (choosing an action and direction), preview the changes before applying, or ignore it. Bulk remediation allows resolving up to 100 discrepancies at once.

**Why this priority**: Discrepancy management is the actionable follow-up to reconciliation runs. Without it, discovering discrepancies provides no path to resolution.

**Independent Test**: Can be tested by viewing discrepancies from a run, filtering by type, previewing a remediation, applying a remediation, ignoring a discrepancy, and performing bulk remediation.

**Acceptance Scenarios**:

1. **Given** discrepancies from a reconciliation run, **When** the discrepancy list loads, **Then** each discrepancy shows its type as a color-coded badge, affected identity, and resolution status.
2. **Given** a discrepancy list, **When** the administrator filters by type "mismatch", **Then** only mismatch discrepancies are shown.
3. **Given** a discrepancy, **When** the administrator clicks "Preview", **Then** the proposed changes are displayed without applying them.
4. **Given** a discrepancy, **When** the administrator selects an action (e.g., "update") and direction (e.g., "xavyo_to_target") and clicks "Remediate", **Then** the discrepancy is resolved and the list updates.
5. **Given** multiple discrepancies selected (up to 100), **When** the administrator clicks "Bulk Remediate", **Then** all selected discrepancies are processed with the chosen action and direction.
6. **Given** a discrepancy, **When** the administrator clicks "Ignore", **Then** the discrepancy is marked as ignored and no longer flagged.

---

### User Story 6 - Reconciliation Schedules (Priority: P3)

Administrators need to set up automatic recurring reconciliation runs per connector. They configure a schedule with frequency (hourly, daily, weekly, monthly, or cron expression), mode (full or delta), and time settings. Schedules can be enabled or disabled with a toggle. A global view shows all connector schedules in one place.

**Why this priority**: Scheduling automates the reconciliation process. While lower priority than manual runs and discrepancy handling, it is essential for ongoing operational maturity.

**Independent Test**: Can be tested by creating a schedule for a connector, verifying it appears in both the per-connector and global views, toggling enable/disable, editing settings, and deleting the schedule.

**Acceptance Scenarios**:

1. **Given** a connector's reconciliation settings, **When** the administrator creates a schedule with daily frequency and full mode, **Then** the schedule is saved and shown as active.
2. **Given** an active schedule, **When** the administrator clicks the disable toggle, **Then** the schedule is disabled and will not trigger runs.
3. **Given** the global schedules view, **When** the page loads, **Then** all connector schedules are listed with their connector name, frequency, mode, and enabled status.
4. **Given** a schedule, **When** the administrator edits the frequency to weekly and saves, **Then** the schedule updates accordingly.
5. **Given** a schedule, **When** the administrator deletes it, **Then** it is removed from both per-connector and global views.

---

### User Story 7 - Discrepancy Trend (Priority: P3)

Administrators need to track discrepancy trends over time to understand whether identity sync quality is improving or degrading. A trend visualization shows discrepancy counts over time, filterable by connector and date range.

**Why this priority**: Trend analysis provides strategic insight. Lower priority because it does not address immediate operational needs but supports long-term governance decisions.

**Independent Test**: Can be tested by viewing the trend chart, filtering by connector, adjusting the date range, and verifying the visualization updates correctly.

**Acceptance Scenarios**:

1. **Given** the discrepancy trend view, **When** the page loads, **Then** a time-series visualization shows discrepancy counts over the default period.
2. **Given** the trend view, **When** the administrator selects a specific connector, **Then** the chart updates to show only that connector's discrepancies.
3. **Given** the trend view, **When** the administrator adjusts the date range, **Then** the chart refreshes to show data for the selected period.
4. **Given** no reconciliation data exists, **When** the trend view loads, **Then** an empty state indicates no data is available yet.

---

### User Story 8 - Conflict Resolution (Priority: P3)

When provisioning operations conflict with each other (e.g., simultaneous updates to the same attribute), administrators need to view and manually resolve these conflicts. The conflict list shows each conflict with its type, affected attributes, and status. The administrator resolves conflicts by selecting an outcome (applied, superseded, merged, or rejected) with optional notes.

**Why this priority**: Conflict resolution handles rare but critical edge cases. Lower priority because conflicts are less common than standard operational issues, but essential for data integrity.

**Independent Test**: Can be tested by viewing the conflict list, examining a conflict's details, and resolving it with a selected outcome and notes.

**Acceptance Scenarios**:

1. **Given** provisioning conflicts exist, **When** the administrator opens the conflicts view, **Then** all conflicts are listed with type, affected attributes, and status.
2. **Given** a conflict detail, **When** the administrator selects "merged" as the outcome and adds notes, **Then** the conflict is resolved and the status updates.
3. **Given** a resolved conflict, **When** viewing the list, **Then** it shows as resolved and the chosen outcome is displayed.
4. **Given** no conflicts exist, **When** the page loads, **Then** an empty state message indicates no conflicts.

---

### Edge Cases

- What happens when retrying an operation that has been resolved by another administrator? The system should show a message that the operation is no longer retryable and refresh the status.
- What happens when a reconciliation run is triggered while another is already in progress for the same connector? The system should prevent the duplicate run and show an appropriate message.
- What happens when bulk remediation includes discrepancies that have already been resolved? Those items should be skipped with a summary indicating how many were skipped and why.
- What happens when the selected date range for discrepancy trend yields no data? An empty state should be shown rather than a broken chart.
- What happens when a connector is deleted while it has pending operations? Operations should show a "deleted connector" indicator rather than failing.
- What happens when the administrator loses their session mid-resolution of a dead-letter operation? The resolution notes should not be partially saved; the operation remains in its current state.
- What happens when the DLQ has hundreds of items? Pagination must be supported with standard limit/offset controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all provisioning operations across connectors in a single paginated table with operation type, status, connector name, user, priority, retry count, and timestamps.
- **FR-002**: System MUST allow filtering operations by connector, status, operation type, and date range.
- **FR-003**: System MUST display operation detail including status timeline, error messages, payload JSON, and execution attempt history.
- **FR-004**: System MUST allow retrying failed operations from the detail page.
- **FR-005**: System MUST allow cancelling pending operations from the detail page.
- **FR-006**: System MUST allow resolving dead-letter operations with optional resolution notes.
- **FR-007**: System MUST display queue statistics cards showing counts per status and average processing time, filterable by connector.
- **FR-008**: System MUST provide a dedicated dead letter queue view with error details and retry/resolve actions.
- **FR-009**: System MUST allow triggering reconciliation runs per connector with full or delta mode and optional dry-run flag.
- **FR-010**: System MUST display reconciliation run history per connector with status, statistics, and duration.
- **FR-011**: System MUST display a detailed reconciliation report with discrepancy summary, action summary, top mismatched attributes, and performance metrics.
- **FR-012**: System MUST allow cancelling in-progress reconciliation runs.
- **FR-013**: System MUST allow resuming paused reconciliation runs.
- **FR-014**: System MUST list discrepancies from reconciliation runs with type badges (missing, orphan, mismatch, collision, unlinked, deleted).
- **FR-015**: System MUST allow filtering discrepancies by type and resolution status.
- **FR-016**: System MUST allow remediating individual discrepancies by selecting an action and direction.
- **FR-017**: System MUST allow previewing remediation changes before applying them.
- **FR-018**: System MUST allow ignoring discrepancies.
- **FR-019**: System MUST support bulk remediation of up to 100 discrepancies at once.
- **FR-020**: System MUST allow creating, editing, enabling, disabling, and deleting reconciliation schedules per connector.
- **FR-021**: System MUST support schedule frequencies of hourly, daily, weekly, monthly, and cron expression.
- **FR-022**: System MUST provide a global view of all connector reconciliation schedules.
- **FR-023**: System MUST display discrepancy trends over time with connector and date range filtering.
- **FR-024**: System MUST list provisioning conflicts with type, affected attributes, and status.
- **FR-025**: System MUST allow resolving conflicts by selecting an outcome (applied, superseded, merged, rejected) with optional notes.
- **FR-026**: System MUST restrict all provisioning and reconciliation management features to administrators only.
- **FR-027**: System MUST display operation logs for each operation.
- **FR-028**: System MUST display a reconciliation actions audit log per connector.

### Key Entities

- **Provisioning Operation**: A single provisioning action (create, update, or delete) targeting an identity in an external system through a connector. Has a lifecycle status, priority, retry count, associated connector and user, payload, and execution attempts.
- **Execution Attempt**: A record of one attempt to execute a provisioning operation, including timing, success/failure status, and error details.
- **Operation Log**: Timestamped log entries for a provisioning operation's lifecycle events.
- **Provisioning Conflict**: A clash between two or more operations affecting the same identity or attribute. Has a type, affected attributes, and resolution outcome.
- **Reconciliation Run**: A single execution of identity reconciliation for a connector, either full or delta mode. Produces a report with statistics and discrepancies.
- **Reconciliation Report**: Detailed output of a reconciliation run including discrepancy summary, action summary, top mismatched attributes, and performance metrics.
- **Discrepancy**: A difference found between the identity system and an external connector during reconciliation. Typed as missing, orphan, mismatch, collision, unlinked, or deleted.
- **Remediation Action**: The corrective action taken for a discrepancy, specifying what to do (create, update, delete, link, unlink, inactivate) and in which direction (system-to-target or target-to-system).
- **Reconciliation Schedule**: A recurring schedule configuration for automatic reconciliation runs, with frequency, mode, and timing parameters.
- **Discrepancy Trend**: Time-series data showing discrepancy counts over a period, aggregated per connector.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can view and filter all provisioning operations across connectors within 2 seconds of page load.
- **SC-002**: Administrators can identify and act on failed operations (retry, cancel, resolve) within 3 clicks from the operations list.
- **SC-003**: Queue statistics dashboard loads within 2 seconds and accurately reflects current operation counts.
- **SC-004**: Dead letter queue operations can be retried or resolved in under 30 seconds per operation.
- **SC-005**: Administrators can trigger a reconciliation run and see it appear in the run list within 3 seconds.
- **SC-006**: Discrepancy list supports filtering and displays type badges, with results loading within 2 seconds.
- **SC-007**: Bulk remediation of up to 100 discrepancies completes within a single user action.
- **SC-008**: Reconciliation schedules can be created, modified, or deleted in under 1 minute.
- **SC-009**: Discrepancy trend visualization loads within 3 seconds and accurately reflects historical data.
- **SC-010**: Conflict resolution workflow can be completed in under 5 clicks from conflict list to resolution.
- **SC-011**: All provisioning and reconciliation features are accessible only to administrators with proper authorization.
- **SC-012**: 100% of provisioning operation statuses are visible in the UI, with no hidden or unrepresented states.

## Assumptions

- The backend API endpoints for operations, reconciliation, conflicts, and schedules are fully implemented and available at the documented paths.
- The existing connector management (Phase 020) is complete and provides the connector selection context for per-connector features.
- Administrator authentication and authorization are already handled by the existing auth framework.
- The identity platform handles all provisioning logic; the frontend only provides visibility and manual intervention capabilities.
- Discrepancy trend visualization will use simple HTML/CSS bar charts or similar lightweight approach, not requiring external charting libraries.
- The operation logs endpoint returns chronologically ordered log entries with timestamps and messages.
- The reconciliation report structure matches the documented response format with discrepancy summary, action summary, mismatched attributes, and performance metrics.
- Pagination follows the standard `{items/operations, total, limit, offset}` format consistent with other endpoints in the platform.
- The connector list is available for populating filter dropdowns (reusing the existing connectors API).

## Scope Boundaries

### In Scope

- Operations queue (list, filter, detail, retry, cancel, resolve)
- Queue statistics dashboard
- Dead letter queue management
- Reconciliation runs (trigger, list, detail, report, cancel, resume)
- Discrepancy management (list, filter, remediate, preview, ignore, bulk remediate)
- Reconciliation schedules (CRUD, enable/disable, global view)
- Discrepancy trend visualization
- Conflict resolution
- Operation logs and reconciliation action audit logs

### Out of Scope

- Automatic provisioning policy configuration (this is backend configuration, not UI)
- Connector configuration changes (handled by Phase 020)
- Real-time push notifications for operation status changes (polling-based refresh is sufficient)
- Export/download of reconciliation reports (can be added later)
- Custom remediation scripts or workflow automation
- Integration with external ticketing systems for DLQ operations

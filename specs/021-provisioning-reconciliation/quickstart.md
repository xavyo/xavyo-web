# Quickstart: Provisioning Operations & Reconciliation

**Date**: 2026-02-11 | **Branch**: `021-provisioning-reconciliation`

## Prerequisites

1. xavyo-idp backend running on `localhost:8080` with operations & reconciliation endpoints
2. At least one connector configured (Phase 020)
3. Admin user logged in with valid session

## Scenario 1: Monitor Operations Queue

1. Navigate to `/connectors/operations`
2. See paginated table of all provisioning operations
3. Filter by connector using the dropdown
4. Filter by status (e.g., "failed")
5. Filter by operation type (e.g., "create")
6. Set date range for time-bounded search
7. Click an operation row to see detail page

**Expected**: Table loads with columns for type, status, connector, user, priority, retry count, timestamps. Filters reduce results. Detail page shows full operation info.

## Scenario 2: Handle Failed Operation

1. From operations list, find a "failed" operation
2. Click to open detail page
3. See error message, payload JSON, execution attempts
4. Click "Retry" button
5. Confirm the operation returns to "pending" status

**Expected**: Operation status changes, toast confirms action. Attempts history shows each past attempt.

## Scenario 3: Manage Dead Letter Queue

1. Navigate to `/connectors/operations/dlq`
2. See list of dead-letter operations with error details
3. Click "Resolve" on an operation
4. Enter resolution notes in the dialog
5. Confirm resolution

**Expected**: Operation removed from DLQ, marked as resolved with notes.

## Scenario 4: View Queue Statistics

1. On the operations page, see the statistics cards at the top
2. Cards show: pending, in_progress, completed, failed, dead_letter, awaiting_system, avg time
3. Select a connector to filter statistics

**Expected**: Cards update to show per-connector counts.

## Scenario 5: Trigger Reconciliation Run

1. Navigate to connector detail → Reconciliation tab
2. Select "Full" mode, check "Dry Run"
3. Click "Start Run"
4. See new run appear in list with "running" status
5. Wait for completion, click run to see report

**Expected**: Run shows progress, report includes discrepancy summary, action summary, performance metrics.

## Scenario 6: Manage Discrepancies

1. From a completed reconciliation run, navigate to discrepancies
2. See list with type badges (missing, orphan, mismatch, etc.)
3. Filter by type "mismatch"
4. Click "Preview" on a discrepancy to see proposed changes
5. Select action "update", direction "xavyo_to_target"
6. Click "Remediate"

**Expected**: Discrepancy resolved, list updates.

## Scenario 7: Bulk Remediate

1. On discrepancy list, select multiple items (up to 100)
2. Click "Bulk Remediate" in toolbar
3. Choose action and direction in dialog
4. Confirm

**Expected**: All selected discrepancies processed. Summary shows success/failure count.

## Scenario 8: Configure Reconciliation Schedule

1. Navigate to connector → Reconciliation → Schedule
2. Create schedule: daily, full mode, hour 02:00
3. Toggle enabled/disabled
4. Navigate to `/connectors/reconciliation` for global view
5. See all connector schedules

**Expected**: Schedule saved, toggle works, global view shows all schedules.

## Scenario 9: View Discrepancy Trend

1. On global reconciliation page, see trend chart
2. Select a connector to filter
3. Adjust date range

**Expected**: Bar chart updates showing discrepancy counts over time.

## Scenario 10: Resolve Conflict

1. Navigate to `/connectors/conflicts`
2. See list of provisioning conflicts
3. Click conflict to see details (type, attributes, operations)
4. Select outcome "merged"
5. Add notes and confirm

**Expected**: Conflict resolved, status updates in list.

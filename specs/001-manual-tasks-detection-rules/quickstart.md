# Quickstart: Manual Provisioning Tasks & Detection Rules

## Prerequisites

- xavyo-idp backend running on localhost:8080
- Admin user logged into xavyo-web
- At least one governance application created (for semi-manual config)

## Test Scenarios

### 1. Manual Task Dashboard

1. Navigate to `/governance/manual-tasks`
2. Verify dashboard cards show: Pending, In Progress, SLA At Risk, SLA Breached, Completed Today, Avg Completion Time
3. Verify empty state if no tasks exist (all metrics zero)

### 2. Manual Task Lifecycle

1. If tasks exist, click a pending task to open detail
2. Click "Claim" → task assigned to current user
3. Click "Start" → status changes to in_progress
4. Click "Confirm" → enter notes → status changes to completed
5. Navigate back to list → verify counts updated

### 3. Task Rejection

1. Open an in-progress task
2. Click "Reject" → enter reason (min 5 chars) → status changes to rejected
3. Verify reason is visible on detail page

### 4. Task Cancellation

1. Open a pending task
2. Click "Cancel" → confirm → status changes to cancelled

### 5. Task Filtering

1. On the task list page, select status filter "pending"
2. Verify only pending tasks shown
3. Toggle SLA breached filter
4. Verify filtered results

### 6. Semi-Manual Configuration

1. Navigate to `/governance/semi-manual`
2. Click "Configure Application"
3. Select an application, enable semi-manual
4. Optionally link ticketing config and SLA policy
5. Save → application appears in list
6. Click "Remove" → application removed from list

### 7. Detection Rule CRUD

1. Navigate to `/governance/detection-rules`
2. Click "Create Rule"
3. Fill: name="Inactive 60 Days", type=Inactive, priority=10, days_threshold=60
4. Save → rule appears in list
5. Click the rule → detail page with edit/disable/delete
6. Click "Edit" → change threshold to 45 → save
7. Click "Disable" → rule shows as disabled
8. Click "Enable" → rule shows as enabled
9. Click "Delete" → confirm → rule removed

### 8. Detection Rule Defaults

1. On detection rules list (empty), click "Seed Defaults"
2. Verify 3 rules appear: No Manager, Terminated, Inactive (90 days)
3. Click "Seed Defaults" again → verify graceful handling

### 9. Detection Rule Type-Specific Fields

1. Create rule with type "No Manager" → no parameter fields
2. Create rule with type "Inactive" → days_threshold field appears
3. Create rule with type "Custom" → expression field appears

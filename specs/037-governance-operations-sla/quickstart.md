# Quickstart: Governance Operations & SLA Management

## Prerequisites

- xavyo-idp backend running on localhost:8080
- Admin user account with `admin` or `super_admin` role
- Tenant created with at least one escalation policy (for SLA linking)

## Test Scenarios

### Scenario 1: SLA Policy CRUD

1. Navigate to `/governance/operations`
2. Click "SLA Policies" tab (default)
3. Verify empty state with "Create SLA Policy" CTA
4. Click "Create SLA Policy" → fill form (name, category=access_request, target=48h, warning=24h)
5. Submit → redirected to detail page
6. Verify detail shows all fields correctly
7. Click "Edit" → change description → "Save Changes"
8. Verify detail updated
9. Click "Delete" → confirm → redirected to hub
10. Verify policy removed from list

### Scenario 2: Ticketing Configuration

1. Navigate to `/governance/operations` → "Ticketing" tab
2. Verify empty state
3. Click "Create Configuration" → select system_type=jira
4. Verify Jira-specific fields appear (project_key required)
5. Fill form (name, base_url, api_key, project_key, issue_type, auto_create_on=access_request)
6. Submit → redirected to detail page
7. Verify all fields displayed (api_key masked)
8. Edit → change enabled=false → save
9. Delete → confirm

### Scenario 3: Bulk Action Workflow

1. Navigate to `/governance/operations` → "Bulk Actions" tab
2. Click "Create Bulk Action"
3. Fill: name, action_type=revoke, target_expression, filter_expression
4. Submit → detail page in "draft" status
5. Click "Validate Expression" → verify validation result
6. Click "Preview" → see affected count and sample items
7. Click "Execute" → confirm dialog → monitor progress
8. Verify status transitions: draft → executing → completed

### Scenario 4: Failed Operations

1. Navigate to `/governance/operations` → "Failed Operations" tab
2. View list of failed operations (may be empty in fresh system)
3. If operations exist: click one to see error details
4. Click "Retry" → verify retry count increments
5. Click "Dismiss" on another → verify status changes

### Scenario 5: Bulk State Operations

1. Navigate to `/governance/operations` → "Bulk State" tab
2. Click "Create Bulk State Operation"
3. Fill: object_type, target_state, filter_expression
4. Submit → detail page with "queued" status
5. Click "Process" → monitor progress bar
6. (Or) Click "Cancel" → verify cancelled status

### Scenario 6: Scheduled Transitions

1. Navigate to `/governance/operations` → "Scheduled" tab
2. View list of scheduled transitions
3. Filter by status (pending/executed/cancelled/failed)
4. Click a pending transition → view detail
5. Click "Cancel" → confirm → verify status changed

### Scenario 7: Sidebar Navigation

1. Verify "Operations" appears under Governance section in sidebar
2. Verify existing connector operations renamed to "Provisioning Ops"
3. Click "Operations" → navigates to `/governance/operations`

### Scenario 8: Dark/Light Mode

1. Toggle dark mode on operations hub
2. Verify all 6 tabs render correctly in dark mode
3. Verify status badges have appropriate dark mode colors
4. Verify forms are readable in dark mode

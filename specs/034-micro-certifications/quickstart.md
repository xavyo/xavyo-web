# Quickstart: Micro Certifications E2E Validation

## Prerequisites

- Dev server running on localhost:3004 (or configured port)
- Backend xavyo-idp running on localhost:8080
- Admin user logged in

## Scenario 1: View Empty Hub

1. Navigate to `/governance/micro-certifications`
2. Verify 4 tabs: "My Pending", "All Certifications", "Trigger Rules", "Statistics"
3. "My Pending" tab shows empty state: "No pending certifications"
4. "All Certifications" tab shows empty state (admin only)
5. "Trigger Rules" tab shows empty state with "Create trigger rule" button
6. "Statistics" tab shows zero counts

## Scenario 2: Create Trigger Rule

1. Navigate to "Trigger Rules" tab → click "Create trigger rule"
2. Fill: name="Role Change Review", trigger_type="role_change", scope_type="global", reviewer_type="manager"
3. Set timeout_secs=86400, reminder_threshold_percent=75, auto_revoke=true
4. Submit → verify redirect to trigger rules list
5. Verify rule appears with name, type badge, scope, active status

## Scenario 3: Trigger Rule Lifecycle

1. On trigger rules list, click into "Role Change Review" detail
2. Verify all fields displayed correctly
3. Click "Disable" → verify status changes to inactive
4. Click "Enable" → verify status changes back to active
5. Click "Set as Default" → verify default badge appears
6. Click "Edit" → change timeout to 172800 → save → verify update

## Scenario 4: Manual Trigger

1. Navigate to "Trigger" (manual trigger page)
2. Fill: user_id (valid UUID), entitlement_id (valid UUID), reason="Ad-hoc review"
3. Submit → verify success message and new certification created
4. Navigate to "My Pending" or "All Certifications" → verify new item appears

## Scenario 5: Certification Decision

1. From "My Pending" tab (or "All Certifications"), click into a pending certification
2. Verify detail page shows: user, entitlement, trigger rule, status, deadline, events
3. Click "Certify" → enter comment "Access verified" → submit
4. Verify status changes to "certified"
5. Verify event appears in events timeline: "decided" by current user

## Scenario 6: Delegate Certification

1. Open a pending certification detail
2. Click "Delegate" → enter delegate_to UUID and comment → submit
3. Verify status changes to "delegated"
4. Verify delegation event in timeline

## Scenario 7: Skip Certification

1. Open a pending certification detail
2. Click "Skip" → enter optional reason → submit
3. Verify status changes to "skipped"
4. Verify skip event in timeline

## Scenario 8: Bulk Operations

1. On "All Certifications" tab, check multiple pending certifications
2. Click "Bulk Certify" → enter comment → confirm
3. Verify all selected items change to "certified"
4. Check "Statistics" tab → verify counts updated

## Scenario 9: Statistics Dashboard

1. Navigate to "Statistics" tab
2. Verify cards: Total, Pending, Certified, Revoked, Delegated, Skipped, Expired, Overdue
3. Verify average decision time displays (with "N/A" if no decisions yet)

## Scenario 10: Audit Events

1. Navigate to certification detail → verify events timeline shows chronological events
2. On hub, check global events search (if available as tab or link)
3. Verify events include: creation, decisions, delegations, skips

## Scenario 11: Dark Mode

1. Toggle dark mode via theme toggle
2. Verify all pages render correctly: hub, detail, create forms, statistics
3. Verify badge colors are readable in dark mode

## Scenario 12: Delete Trigger Rule

1. Navigate to trigger rule detail
2. Click "Delete" → confirm dialog appears with rule name
3. Confirm → verify redirect to trigger rules list
4. Verify rule no longer appears in list

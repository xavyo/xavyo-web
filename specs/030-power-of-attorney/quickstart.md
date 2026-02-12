# Quickstart: Power of Attorney & Identity Delegation

## Test Scenarios

### Scenario 1: Grant PoA (US1)
1. Log in as admin user (pascal@leclech.fr)
2. Navigate to Governance → Power of Attorney
3. Click "Grant PoA"
4. Select a grantee user, set scope, dates (today to +30 days), and reason
5. Submit → verify grant appears in "Outgoing" list with "active" status

### Scenario 2: View Incoming PoA (US1)
1. Log in as the grantee user
2. Navigate to Governance → Power of Attorney
3. Switch to "Incoming" direction
4. Verify the grant from Scenario 1 appears with correct details

### Scenario 3: Assume Identity (US2)
1. As grantee, click on the active incoming PoA
2. On the detail page, click "Assume Identity"
3. Verify the header shows "Acting as [Grantor Name]" indicator
4. Navigate to other pages — verify indicator persists
5. Click "Drop" on the indicator
6. Verify indicator disappears, back to own identity

### Scenario 4: Admin View and Force-Revoke (US3)
1. Log in as admin
2. Navigate to Power of Attorney → Admin tab
3. Verify all PoA grants across the org are visible
4. Filter by status "active"
5. Force-revoke a grant with reason
6. Verify status changes to "revoked"

### Scenario 5: Audit Trail (US4)
1. Navigate to a PoA detail page that has had multiple events
2. Verify audit timeline shows: granted → assumed → dropped events
3. Filter by event type "assumed" — verify only assumption events shown

### Scenario 6: Extend PoA (US5)
1. Navigate to an active PoA detail page (as grantor)
2. Click "Extend" and set new end date (within 90-day max)
3. Verify end date updated, "extended" event in audit trail

### Scenario 7: Revoke PoA (US1)
1. As grantor, navigate to an active PoA detail page
2. Click "Revoke" with reason "No longer needed"
3. Verify status changes to "revoked"

### Scenario 8: Validation Errors
1. Try to grant PoA with end date > 90 days from start → error
2. Try to grant PoA with start date in the past → error
3. Try to grant PoA to yourself → error
4. Try to extend past 90-day max → error
5. Try to assume expired/revoked PoA → error

## Prerequisites

- xavyo-idp backend running on localhost:8080
- At least 2 user accounts in the same tenant
- Admin role for admin-specific tests

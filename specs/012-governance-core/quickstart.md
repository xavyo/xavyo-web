# Quickstart: Governance Core

## Prerequisites
- xavyo-idp backend running on localhost:8080
- Admin user account with admin role
- At least one tenant created

## Test Scenarios

### Scenario 1: Entitlement CRUD
1. Login as admin → Navigate to Governance → Entitlements tab
2. Click "Create Entitlement" → Fill form (name, risk_level, classification) → Submit
3. Verify entitlement appears in list
4. Click entitlement → View detail page
5. Click "Edit" → Modify description → Save
6. Click "Delete" → Confirm → Verify removed from list
7. Test filters: filter by risk_level=high, filter by classification=sensitive

### Scenario 2: Access Request Workflow
1. Login as regular user → Navigate to "My Requests" (or governance if admin)
2. Click "New Request" → Select an entitlement → Add justification (20+ chars) → Submit
3. Verify request appears in list with status "pending"
4. Login as admin → Navigate to Governance → Access Requests tab
5. View the pending request → Click "Approve" with optional notes
6. Login as requester → Verify request status changed to "approved"
7. Repeat with "Reject" for another request

### Scenario 3: SoD Rules and Violations
1. Create two entitlements (e.g., "Create PO" and "Approve PO")
2. Navigate to Governance → SoD tab
3. Click "Create Rule" → Select the two entitlements → Set severity → Submit
4. View violations report (may be empty initially)
5. Assign both entitlements to a user via backend
6. Refresh violations → Verify violation appears
7. Test disable/enable rule toggle

### Scenario 4: Certification Campaign
1. Navigate to Governance → Certifications tab
2. Click "Create Campaign" → Set name, scope (all_users), reviewer_type, deadline → Submit
3. Verify campaign appears with "draft" status
4. Click "Launch" → Verify status changes to "active"
5. View campaign items → Certify some, revoke others
6. Check progress bar updates

### Scenario 5: Risk Dashboard
1. Navigate to Governance → Risk tab
2. View risk summary (counts by risk level)
3. View top-risk users list
4. View risk alerts summary
5. Test with no data → Verify empty state shown

## Quick API Test (curl)

```bash
# Get entitlements
curl -s http://localhost:8080/governance/entitlements \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" | jq

# Create entitlement
curl -s -X POST http://localhost:8080/governance/entitlements \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Entitlement",
    "risk_level": "low",
    "data_protection_classification": "none"
  }' | jq

# Risk score summary
curl -s http://localhost:8080/governance/risk-scores/summary \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-ID: $TENANT_ID" | jq
```

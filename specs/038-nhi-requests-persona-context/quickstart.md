# Quickstart: NHI Access Requests & Persona Context

## Scenario 1: Submit and Review an NHI Request

1. Login as a regular user
2. Navigate to NHI > NHI Requests
3. Click "New Request"
4. Fill in: name="Test Service Account", purpose="Automated testing service for CI/CD pipeline", type=service_account
5. Submit — verify request appears in list with "Pending" badge
6. Switch to admin user
7. Navigate to NHI > NHI Requests
8. Click the pending request
9. Click "Approve" with comment "Approved for CI/CD use"
10. Verify status changes to "Approved"

## Scenario 2: View NHI Usage and Staleness

1. Login as admin
2. Navigate to NHI main page
3. Verify summary cards appear (total, active, suspended, etc.)
4. Click on any NHI entity (agent, tool, or service account)
5. Click the "Usage" tab
6. Verify usage history and summary stats display
7. Navigate to NHI > Staleness Report
8. Verify report lists entities sorted by inactivity

## Scenario 3: Enhanced NHI Certification Campaign

1. Login as admin
2. Navigate to NHI > Governance > Certifications
3. Click "New Campaign"
4. Fill in name and scope, submit
5. Verify campaign created in "draft" status
6. Click "Launch" — verify status changes to "active"
7. View campaign items — verify NHI entities listed
8. Select an item, decide "certify"
9. Select multiple items, use "Bulk Decide" to revoke
10. Verify campaign summary updates (decided/pending counts)

## Scenario 4: Persona Context Switching

1. Login as a user who has an active persona assigned
2. Navigate to Personas > Context
3. View current context (physical user identity shown)
4. Click "Switch to Persona" for an active persona, optionally enter reason
5. Verify context indicator appears in the header showing persona name
6. Verify the current context page shows persona as active
7. Click "Switch Back" to return to physical identity
8. Verify context indicator clears
9. View session history — verify both switches recorded

## Scenario 5: Persona Expiry and Propagation

1. Login as admin
2. Navigate to Personas > Expiring
3. View list of personas approaching expiration
4. Click "Extend" on a persona
5. Set new expiration date and reason
6. Verify extension result (approved or pending approval)
7. Navigate to a persona detail page
8. Click "Propagate Attributes" button
9. Verify success confirmation

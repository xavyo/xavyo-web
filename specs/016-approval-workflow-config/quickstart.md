# Quickstart: Approval Workflow Configuration

## Scenario 1: Set Up First Approval Workflow (Critical Path)

1. Admin navigates to Governance > Approval Config
2. Admin sees empty state on Workflows tab
3. Admin clicks "Create Workflow"
4. Admin enters name "Standard Approval" and description
5. Admin is redirected to workflow detail page
6. **Now admin needs a group first** — navigates to Groups tab
7. Admin creates a group "Security Reviewers" with description
8. Admin adds themselves as a member of the group
9. Admin returns to workflow detail page
10. Admin adds a step: group "Security Reviewers", required approvals: 1
11. Admin clicks "Set as Default"
12. **Verification**: Navigate to My Requests, create an access request → no more "No approval workflow configured" error

## Scenario 2: Multi-Step Workflow with Escalation

1. Admin creates two groups: "Team Leads" and "Security Officers"
2. Admin creates an escalation policy "48h Auto-Reject"
3. Admin adds a level: target "Security Officers", timeout 48h, action "auto_reject"
4. Admin creates a workflow "Elevated Access"
5. Admin adds step 1: group "Team Leads", required: 1, no escalation
6. Admin adds step 2: group "Security Officers", required: 1, escalation policy "48h Auto-Reject", timeout 24h
7. **Verification**: Workflow shows 2 steps with correct groups and escalation config

## Scenario 3: SoD Exemption

1. Admin navigates to Governance > SoD > a specific rule detail
2. Admin sees rule blocks certain access combinations
3. Admin clicks "Create Exemption"
4. Admin selects the user, provides justification "Emergency project access needed", sets expiry to 30 days
5. Admin creates the exemption
6. **Verification**: Exemption appears in exemptions list with active status, expiry date visible

## Scenario 4: Escalation History on Access Request

1. An access request is pending and has been escalated (timeout passed)
2. Admin views the access request detail page
3. Admin sees "Escalation History" section with events showing:
   - When escalation was triggered
   - What action was taken (notify, reassign, etc.)
   - Current escalation level
4. Admin clicks "Cancel Escalation" to stop the timer
5. **Verification**: Escalation history shows cancellation event

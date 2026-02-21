# Quickstart: Policy Simulations & What-If Analysis

## Prerequisites
- xavyo-idp running on localhost:8080
- Admin user logged in to xavyo-web
- At least one tenant with users

## Scenario 1: Create & Execute a Policy Simulation (US1)

1. Navigate to Governance > Simulations
2. Click "Create Policy Simulation"
3. Fill in:
   - Name: "Test SoD Rule - Finance Separation"
   - Type: "SoD Rule"
   - Policy Config: `{"role_a": "finance_approver", "role_b": "finance_submitter"}`
4. Click "Create" — simulation appears in Draft status
5. Click "Execute" — wait for status to change to "Executed"
6. View Results tab — see per-user violations with severity badges
7. Check Impact Summary cards — total analyzed, affected, by severity

## Scenario 2: Create & Execute a Batch Simulation (US2)

1. Navigate to Governance > Simulations > Batch tab
2. Click "Create Batch Simulation"
3. Fill in:
   - Name: "Add Viewer Role to Engineering"
   - Operation: "Role Add"
   - Selection: "Filter"
   - Department: "Engineering"
   - Target Role: (select a role)
4. Click "Create" — simulation appears in Draft status
5. Click "Execute" — wait for results
6. View Results — see per-user access gained/lost and warnings
7. Note scope warning banner if many users affected

## Scenario 3: Apply Batch to Production (US3)

1. From executed batch simulation detail page
2. Click "Apply to Production"
3. In dialog:
   - Enter justification: "Approved by VP Engineering"
   - Check "I acknowledge this will affect N users"
4. Click "Confirm Apply"
5. Status changes to "Applied" with applied_at timestamp

## Scenario 4: Compare Two Simulations (US4)

1. Navigate to Comparisons tab
2. Click "Create Comparison"
3. Select:
   - Name: "Compare strict vs lenient SoD"
   - Type: "Simulation vs Simulation"
   - Simulation A: (select first policy sim)
   - Simulation B: (select second policy sim)
4. Click "Create" — comparison generates
5. View detail page — see delta summary cards and delta table

## Scenario 5: Lifecycle & Export (US5)

1. From any executed simulation detail
2. Click "Archive" — simulation hidden from default list
3. Toggle "Show Archived" — simulation appears
4. Click "Restore" — back in main list
5. Edit notes field — save
6. Click "Export" > "CSV" — file downloads
7. Check staleness indicator after making user changes

## Verification Checks
- [ ] Policy simulation create/execute/view results works
- [ ] Batch simulation create/execute/view results works
- [ ] Batch apply requires justification + acknowledgment
- [ ] Comparison shows delta view with summary cards
- [ ] Archive/restore hides and shows simulations
- [ ] Export downloads valid JSON/CSV
- [ ] Staleness indicator appears when data changes
- [ ] Notes can be edited and saved
- [ ] All pages admin-only (non-admin redirected)
- [ ] Empty states shown when no simulations exist

# Quickstart: Governance Meta-Roles

## Prerequisites

- xavyo-idp backend running on localhost:8080 (Docker)
- Admin user logged in (e2e-admin@test.xavyo.com / E2eTestPass99+)
- At least one governance entitlement created (for entitlement mapping)

## Scenario 1: Create and Configure a Meta-Role

1. Navigate to Governance > Meta-Roles
2. Click "Create Meta-Role"
3. Fill in:
   - Name: "High Risk Policy"
   - Description: "Automatically enforce MFA for high-risk entitlements"
   - Priority: 10
   - Criteria Logic: AND
4. Click Create
5. On the detail page, go to Criteria tab
6. Add criterion: field=risk_level, operator=eq, value="high"
7. Go to Entitlements tab
8. Add entitlement: select an existing entitlement, permission_type=grant
9. Go to Constraints tab
10. Add constraint: type=require_mfa, value={"enabled": true}

**Expected**: Meta-role created with 1 criterion, 1 entitlement, 1 constraint. Stats summary shows counts.

## Scenario 2: View Inheritances and Re-evaluate

1. Open a meta-role with criteria that match existing roles
2. Click Inheritances tab
3. View list of matching roles with status, match reason, matched date
4. Click "Re-evaluate"
5. View updated stats summary

**Expected**: Inheritance list shows roles matching criteria. Re-evaluation updates counts.

## Scenario 3: Simulate and Cascade Changes

1. Open a meta-role detail page
2. Click Simulation tab
3. Select type: "criteria_change"
4. Enter new criteria to simulate
5. Review impact: roles to add/remove, conflicts, safety summary
6. If safe, go to cascade and trigger with dry_run=true first
7. Review dry-run results
8. Trigger actual cascade

**Expected**: Simulation shows projected impact. Cascade progress shows real-time counts.

## Scenario 4: Resolve Conflicts

1. Navigate to a meta-role with unresolved conflicts (Conflicts tab)
2. View conflict details: two meta-roles, affected role, conflict type
3. Choose resolution strategy:
   - "Resolve by Priority" for auto-resolution
   - "Resolve Manually" and pick the winning meta-role
   - "Ignore" with optional comment
4. Verify conflict status updates

**Expected**: Conflict resolved with chosen strategy, status badge updates.

## Scenario 5: Review Audit Trail

1. Open a meta-role detail page
2. Click Events tab
3. View chronological event list
4. Filter by event type (e.g., "inheritance_applied")
5. View event statistics summary

**Expected**: Events show all actions with type, actor, timestamp, and details.

## Scenario 6: Enable/Disable Lifecycle

1. From meta-role detail page, click "Disable"
2. Verify status changes to "Disabled"
3. Check Inheritances tab — active inheritances should show as "Suspended"
4. Click "Enable"
5. Verify status changes to "Active"
6. Check Inheritances tab — suspended inheritances should re-evaluate

**Expected**: Enable/disable toggles status and affects inheritance statuses.

## Scenario 7: Delete Meta-Role

1. Open a meta-role with no active inheritances
2. Click "Delete"
3. Confirm deletion
4. Verify redirect to list page
5. Verify meta-role no longer appears in list

**Expected**: Meta-role deleted, redirected to list, meta-role gone.

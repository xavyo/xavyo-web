# Quickstart: Self-Service Request Catalog & Birthright Access

**Date**: 2026-02-12
**Feature**: 031-catalog-birthright
**Prerequisites**: Running xavyo-idp backend on localhost:8080, authenticated user session

## E2E Test Scenarios

### Scenario 1: Admin Creates Catalog Structure

1. Login as admin (pascal@leclech.fr)
2. Navigate to `/governance/catalog/admin`
3. **Create root category**: Name="Applications", Description="Application access"
4. **Create child category**: Name="Engineering Tools", Parent="Applications"
5. **Create catalog item**: Type=Entitlement, Name="GitHub Enterprise Access", Category="Engineering Tools", Tags=["engineering", "devtools"]
6. Set requestability: self_request=true, manager_request=true
7. **Create second item**: Type=Role, Name="Developer Role", Category="Engineering Tools"
8. **Verify**: Both items appear in admin item list
9. **Disable** "Developer Role" item
10. **Verify**: Item shows as disabled in admin list

### Scenario 2: User Browses Catalog

1. Navigate to `/governance/catalog`
2. **Verify**: Category sidebar shows "Applications" > "Engineering Tools"
3. Click "Engineering Tools" category
4. **Verify**: Only "GitHub Enterprise Access" visible (Developer Role is disabled)
5. **Verify**: Item shows "Add to Cart" button (requestability: can_request=true)
6. Search for "GitHub" in search bar
7. **Verify**: "GitHub Enterprise Access" appears in search results
8. Filter by type "Entitlement"
9. **Verify**: Only entitlement-type items shown

### Scenario 3: Shopping Cart Workflow

1. From catalog, click "Add to Cart" on "GitHub Enterprise Access"
2. **Verify**: Cart badge shows "1"
3. Navigate to `/governance/catalog/cart`
4. **Verify**: Cart shows "GitHub Enterprise Access" item
5. Click "Validate"
6. **Verify**: Validation shows "valid: true" (no issues, no SoD violations)
7. Enter justification: "Need GitHub access for project Alpha"
8. Click "Submit"
9. **Verify**: Toast shows "Access requests submitted successfully"
10. **Verify**: Redirected to My Requests page
11. **Verify**: Access request appears in list

### Scenario 4: Cart with SoD Warning

1. Add two items that have SoD conflict to cart
2. Navigate to cart page
3. Click "Validate"
4. **Verify**: SoD violation warning shown with rule name and conflicting items
5. **Verify**: Submit button still enabled (warnings don't block)
6. Submit with justification
7. **Verify**: Requests created despite warnings

### Scenario 5: Admin Manages Birthright Policy

1. Navigate to `/governance/birthright-policies`
2. Click "Create Policy"
3. Fill form:
   - Name: "Engineering Default Access"
   - Priority: 10
   - Evaluation Mode: AllMatch
   - Condition 1: attribute="department", operator=Equals, value="Engineering"
   - Condition 2: attribute="location", operator=In, value=["US", "EU"]
   - Entitlements: Select "GitHub Enterprise Access" entitlement
   - Grace Period: 30 days
4. Save
5. **Verify**: Policy appears in list with status "Active"
6. Click policy to view detail
7. **Verify**: Conditions and entitlements displayed correctly

### Scenario 6: Policy Simulation

1. Open "Engineering Default Access" policy detail
2. Click "Simulate"
3. Enter attributes: department="Engineering", location="US"
4. Click "Run Simulation"
5. **Verify**: Result shows "Match" with both conditions passing
6. Change location to "APAC"
7. Click "Run Simulation"
8. **Verify**: Result shows "No Match", location condition failed
9. Navigate to birthright policies list
10. Click "Simulate All"
11. Enter attributes: department="Engineering", location="US"
12. **Verify**: Shows all matching policies with combined entitlements

### Scenario 7: Category Hierarchy

1. Admin creates: Root "Infrastructure" > "Cloud" > "AWS"
2. User browses catalog
3. **Verify**: Sidebar shows collapsible tree: Infrastructure > Cloud > AWS
4. Click "AWS" — items filtered to AWS category
5. Click "Cloud" — items from Cloud and all children shown

### Scenario 8: Disable/Enable Item Lifecycle

1. Admin disables "GitHub Enterprise Access" item
2. User browses catalog
3. **Verify**: Item NOT visible
4. Admin re-enables the item
5. User browses catalog
6. **Verify**: Item visible again with "Add to Cart" button

### Scenario 9: Delete Protection

1. Admin tries to delete "Engineering Tools" category (has items)
2. **Verify**: Error message "Cannot delete category with existing items"
3. Admin moves items out or deletes them first
4. Admin deletes empty category
5. **Verify**: Category removed successfully

### Scenario 10: Policy Enable/Disable/Archive

1. Disable "Engineering Default Access" policy
2. **Verify**: Status shows disabled, policy no longer auto-assigns
3. Re-enable the policy
4. **Verify**: Status shows Active
5. Archive (delete) the policy
6. **Verify**: Policy status becomes "Archived", hidden from default list
7. Filter by "Archived" status
8. **Verify**: Archived policy visible in filtered list

## Validation Checklist

- [ ] Categories support 4-level nesting (root > L1 > L2 > L3)
- [ ] Search works across all categories
- [ ] Type filter (Role/Entitlement/Resource) works
- [ ] Requestability status shown correctly per user
- [ ] Cart persists across page navigations
- [ ] Cart validation catches SoD violations
- [ ] Cart submission creates access requests
- [ ] Admin can CRUD categories with hierarchy
- [ ] Admin can CRUD items with requestability rules
- [ ] Disabled items not visible to non-admin users
- [ ] Birthright policy CRUD works (create, edit, enable, disable, archive)
- [ ] Policy simulation shows match/no-match results
- [ ] Simulate All shows combined entitlements
- [ ] Sidebar nav shows "Request Catalog" and "Birthright Policies"
- [ ] Both light and dark theme work correctly

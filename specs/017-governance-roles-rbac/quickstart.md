# Quickstart: Governance Roles & RBAC

**Feature**: 017-governance-roles-rbac
**Date**: 2026-02-11

## Prerequisites

1. xavyo-idp backend running on localhost:8080 (Docker)
2. Admin user account (e.g., `e2e@test.xavyo.com`)
3. Tenant provisioned with governance features enabled
4. At least one governance entitlement created (for entitlement mapping tests)

## Test Scenarios

### Scenario 1: Role CRUD (P1 - MVP)

1. **Login** as admin → navigate to Governance → Roles
2. **Create role**: Click "Create Role" → name: "Engineering", description: "Engineering department" → Submit
3. **Verify**: Role appears in list with name, depth 0, not abstract
4. **View detail**: Click role name → see detail page with tabs
5. **Edit**: Change name to "Engineering Team" → Save → verify updated
6. **Delete**: Click Delete → confirm dialog → verify removed from list

### Scenario 2: Role Hierarchy (P2)

1. **Create parent**: Create role "Engineering"
2. **Create children**: Create "Frontend" with parent "Engineering", create "Backend" with parent "Engineering"
3. **Tree view**: Toggle to tree view → verify indented hierarchy
4. **Move role**: Move "Frontend" to be child of new role "Product" → verify tree updates
5. **Impact analysis**: View Engineering impact → see descendant count and affected users
6. **Ancestors**: View Frontend ancestors → see "Product" listed

### Scenario 3: Role Entitlements (P3)

1. **Prerequisite**: Create entitlement "Repository Access" in governance entitlements
2. **Add to role**: On Engineering detail → Entitlements tab → Add entitlement → select "Repository Access"
3. **View direct**: See "Repository Access" in direct entitlements
4. **View effective**: Switch to effective view → see direct + inherited counts
5. **Remove**: Remove entitlement → verify removed from list
6. **Recompute**: Trigger recomputation → verify counts update

### Scenario 4: Role Parameters (P4)

1. **Add parameter**: On Engineering detail → Parameters tab → Add parameter
   - Name: "access_level", Type: enum, Required: true
   - Default: "read", Constraints: allowed_values ["read", "write", "admin"]
2. **Verify**: Parameter appears in list with correct type and constraints
3. **Edit**: Change description and default value → verify saved
4. **Validate**: Test validation with invalid value → see error
5. **Delete**: Remove parameter → verify removed

### Scenario 5: Inheritance Blocks (P5)

1. **Prerequisite**: Parent-child roles with entitlement on parent
2. **Add block**: On parent detail → Inheritance Blocks tab → Add block
   - Select child role, reason: "Security restriction"
3. **Verify**: Block appears in list with reason
4. **Remove**: Delete block → verify removed

### Edge Case Scenarios

- **Empty state**: No roles → see empty state with CTA
- **Delete with children**: Try to delete role that has children → see error
- **Concurrent edit**: Edit role in two tabs → second save shows version conflict
- **Deep tree**: Create 5+ level hierarchy → verify tree renders correctly

## Verification Commands

```bash
# TypeScript check
npm run check

# Unit tests
npx vitest run

# Dev server
npm run dev
```

## Browser Test Flow (Chrome MCP)

1. Navigate to `http://localhost:5173/governance/roles`
2. Verify empty state or role list
3. Create a role via the form
4. Navigate to role detail page
5. Test each tab (Details, Entitlements, Parameters, Hierarchy, Blocks)
6. Test tree view toggle
7. Verify dark mode rendering

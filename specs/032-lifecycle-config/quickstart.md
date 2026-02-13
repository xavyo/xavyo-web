# Quickstart: Lifecycle Configuration

## E2E Test Scenarios

### Scenario 1: Create and Configure a Complete Lifecycle

1. Navigate to `/governance/lifecycle`
2. Verify empty state message
3. Click "Create Lifecycle Config"
4. Fill: name "Employee Lifecycle", type "User", description "Standard employee lifecycle"
5. Submit → verify redirect to list, config appears
6. Click on "Employee Lifecycle" → detail page loads
7. **States tab**: Add states:
   - "Onboarding" (initial, grant, position 1)
   - "Active" (intermediate, no_change, position 2)
   - "Suspended" (intermediate, revoke, position 3)
   - "Terminated" (terminal, revoke, position 4)
8. **Transitions tab**: Add transitions:
   - "Activate" from Onboarding → Active
   - "Suspend" from Active → Suspended (requires approval)
   - "Reactivate" from Suspended → Active (grace period: 48h)
   - "Terminate" from Active → Terminated
   - "Terminate from Suspended" from Suspended → Terminated
9. Verify all states show correct badges (Initial/Terminal) and entitlement actions
10. Verify all transitions show state names, approval badges, grace periods

### Scenario 2: Transition Conditions

1. From the detail page, select "Suspend" transition
2. Add condition: type "attribute_check", path "user.department", expression "!= 'Executive'"
3. Save conditions
4. Click "Evaluate" → enter context: `{"user": {"department": "Engineering"}}`
5. Verify result: allowed (condition passes)
6. Evaluate with: `{"user": {"department": "Executive"}}`
7. Verify result: not allowed

### Scenario 3: State Actions

1. Select "Onboarding" state → Actions section
2. Add entry action: type "send_notification", parameters: `{"template": "welcome_email", "to": "user.email"}`
3. Add exit action: type "trigger_provisioning", parameters: `{"action": "provision_accounts"}`
4. Save → verify both actions display

### Scenario 4: Edit and Delete

1. Edit config: change description → save → verify updated
2. Delete a transition → verify removed
3. Delete a state (not referenced) → verify removed
4. Delete the config → verify removed from list

### Scenario 5: Filter and Pagination

1. Create configs for User, Role, and Group types
2. Filter by "User" → only user configs shown
3. Filter by "Role" → only role configs shown
4. Clear filter → all configs shown

### Scenario 6: Dark Mode

1. Toggle to dark mode
2. Verify lifecycle hub, detail page, badges all render correctly
3. Toggle back to light mode

## Quick Verification Commands

```bash
# Type check
npx svelte-check --threshold error

# Unit tests
npx vitest run src/lib/api/lifecycle
npx vitest run src/lib/schemas/lifecycle
npx vitest run src/lib/components/lifecycle
npx vitest run src/routes/\\(app\\)/governance/lifecycle

# Full test suite
npx vitest run
```

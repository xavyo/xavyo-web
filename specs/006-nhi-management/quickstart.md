# Quickstart Validation: NHI (Non-Human Identity) Management

**Feature**: 006-nhi-management
**Date**: 2026-02-10

## Prerequisites

- xavyo-web running on `localhost:3000`
- xavyo-idp running on `localhost:8080`
- Logged in as an admin user with a provisioned tenant

## Validation Scenarios

### Scenario 1: NHI Unified List Displays

1. Navigate to `/nhi`
2. **Expected**: Page shows "Non-Human Identities" header and a data table with columns: Name, Type, Lifecycle State, Description, Created
3. **Expected**: Filter dropdowns for Type and Lifecycle State are visible
4. **Expected**: "Create" dropdown or navigation button is visible

### Scenario 2: NHI List Type Filtering

1. Navigate to `/nhi` (with NHIs of multiple types)
2. Select "Tool" from the Type filter
3. **Expected**: Table shows only tool NHIs
4. Clear the type filter
5. **Expected**: Full list restores

### Scenario 3: NHI List State Filtering

1. Navigate to `/nhi` (with NHIs in multiple lifecycle states)
2. Select "Active" from the Lifecycle State filter
3. **Expected**: Table shows only active NHIs
4. Clear the state filter
5. **Expected**: Full list restores

### Scenario 4: Combined Filtering

1. Navigate to `/nhi`
2. Select "Agent" from Type and "Active" from State
3. **Expected**: Table shows only active agents (AND logic)
4. Clear all filters
5. **Expected**: Full list restores

### Scenario 5: Create Tool

1. Navigate to `/nhi`
2. Click "Create" → "Tool" (or navigate to `/nhi/tools/create`)
3. **Expected**: Form shows fields: Name, Description, Category, Input Schema (textarea), Output Schema (textarea), Requires Approval (checkbox), Max Calls Per Hour, Provider
4. Fill in: name "Weather API", input_schema `{"type": "object", "properties": {"city": {"type": "string"}}}`
5. Submit
6. **Expected**: Redirected to `/nhi` with success toast
7. **Expected**: New tool appears in the table with "inactive" state badge

### Scenario 6: Create Tool Validation

1. Navigate to `/nhi/tools/create`
2. Submit the empty form
3. **Expected**: Inline errors for name ("required") and input_schema ("required")
4. Enter malformed JSON in input_schema, submit
5. **Expected**: Error about invalid JSON

### Scenario 7: Create Agent

1. Navigate to `/nhi/agents/create`
2. **Expected**: Form shows fields: Name, Description, Agent Type, Model Provider, Model Name, Model Version, Max Token Lifetime, Requires Human Approval
3. Fill in: name "Code Assistant", agent_type "copilot"
4. Submit
5. **Expected**: Redirected to `/nhi` with success toast

### Scenario 8: Create Service Account

1. Navigate to `/nhi/service-accounts/create`
2. **Expected**: Form shows fields: Name, Description, Purpose, Environment
3. Fill in: name "CI Pipeline", purpose "Continuous integration builds"
4. Submit
5. **Expected**: Redirected to `/nhi` with success toast

### Scenario 9: Tool Detail Page

1. Navigate to `/nhi` and click on a tool NHI name
2. **Expected**: Navigates to `/nhi/tools/[id]` showing: name, description, type, lifecycle state badge, created/updated dates
3. **Expected**: Tool-specific fields visible: category, input_schema, output_schema, requires_approval, max_calls_per_hour, provider
4. **Expected**: Credentials section visible at bottom

### Scenario 10: Edit NHI

1. Navigate to a tool detail page
2. Click "Edit"
3. Change the description
4. Save
5. **Expected**: Success toast, page shows updated description

### Scenario 11: Delete NHI

1. Navigate to an NHI detail page
2. Click "Delete"
3. **Expected**: Confirmation dialog
4. Click "Cancel" — dialog closes
5. Click "Delete" again, then confirm
6. **Expected**: Redirected to `/nhi` with success toast

### Scenario 12: Issue Credential

1. Navigate to an NHI detail page
2. In the Credentials section, click "Issue credential"
3. **Expected**: Dialog with credential type selector (api_key, secret, certificate) and optional validity days
4. Select "api_key", submit
5. **Expected**: Secret displayed in a one-time dialog with copy button and warning
6. Close the dialog
7. **Expected**: New credential appears in the list with masked value and expiry date

### Scenario 13: Credential Secret One-Time View

1. After issuing a credential (Scenario 12), close the secret dialog
2. **Expected**: The plaintext secret is no longer visible anywhere on the page
3. **Expected**: The credential list shows only a masked value (e.g., "••••••••")

### Scenario 14: Rotate Credential

1. Navigate to an NHI detail page with an existing credential
2. Click "Rotate" on a credential
3. **Expected**: Dialog shows the new secret (one-time view) and mentions grace period for old credential
4. Close the dialog
5. **Expected**: The old credential shows grace period info, new credential appears

### Scenario 15: Revoke Credential

1. Navigate to an NHI detail page with an existing credential
2. Click "Revoke" on a credential
3. **Expected**: Confirmation dialog
4. Confirm
5. **Expected**: Credential marked as inactive or removed from list, success toast

### Scenario 16: Lifecycle - Activate

1. Navigate to a detail page for an NHI in "inactive" state
2. **Expected**: "Activate" button is visible
3. Click "Activate"
4. **Expected**: State changes to "active", success toast

### Scenario 17: Lifecycle - Suspend

1. Navigate to a detail page for an NHI in "active" state
2. **Expected**: "Suspend" and "Deprecate" buttons are visible
3. Click "Suspend"
4. **Expected**: Optional reason dialog
5. Enter a reason (or leave empty), confirm
6. **Expected**: State changes to "suspended", success toast

### Scenario 18: Lifecycle - Deprecate

1. Navigate to a detail page for an NHI in "active" state
2. Click "Deprecate"
3. **Expected**: State changes to "deprecated", success toast

### Scenario 19: Lifecycle - Archive

1. Navigate to a detail page for an NHI in "deprecated" state
2. **Expected**: "Archive" button is visible
3. Click "Archive"
4. **Expected**: Confirmation dialog with warning about terminal state
5. Confirm
6. **Expected**: State changes to "archived", success toast
7. **Expected**: No lifecycle action buttons are shown (archived is terminal)

### Scenario 20: Lifecycle - Reactivate from Suspended

1. Navigate to a detail page for an NHI in "suspended" state
2. **Expected**: "Activate" button is visible (reactivation)
3. Click "Activate"
4. **Expected**: State changes to "active", success toast

### Scenario 21: Archived State - No Actions

1. Navigate to a detail page for an NHI in "archived" state
2. **Expected**: No lifecycle action buttons shown
3. **Expected**: No edit controls available (FR-015)

### Scenario 22: State Badges Visual Check

1. Navigate to `/nhi` with NHIs in all 5 lifecycle states
2. **Expected**: Each state has a distinct color:
   - active: green
   - inactive: outline/neutral
   - suspended: orange
   - deprecated: amber
   - archived: gray

### Scenario 23: Empty State

1. Navigate to `/nhi` with no NHIs
2. **Expected**: "No identities found" empty state message
3. Filter by a type with no results
4. **Expected**: "No identities found" with filters applied

### Scenario 24: Create Dropdown Navigation

1. Navigate to `/nhi`
2. Click the "Create" dropdown
3. **Expected**: Options for "Tool", "Agent", "Service Account"
4. Click "Tool"
5. **Expected**: Navigates to `/nhi/tools/create`

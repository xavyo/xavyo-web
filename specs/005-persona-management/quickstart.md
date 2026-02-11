# Quickstart Validation: Persona & Archetype Management

**Feature**: 005-persona-management
**Date**: 2026-02-10

## Prerequisites

- xavyo-web running on `localhost:3000`
- xavyo-idp running on `localhost:8080`
- Logged in as an admin user with a provisioned tenant

## Validation Scenarios

### Scenario 1: Archetype List Displays

1. Navigate to `/personas/archetypes`
2. **Expected**: Page shows "Archetypes" header and a data table with columns: Name, Description, Status, Personas Count, Created
3. **Expected**: Search input is visible above the table
4. **Expected**: "Create archetype" button is visible

### Scenario 2: Create Archetype

1. Navigate to `/personas/archetypes`
2. Click "Create archetype"
3. **Expected**: Navigates to `/personas/archetypes/create` with a form
4. Fill in: name "Admin Template", naming pattern "admin.{username}", description "Template for admin personas"
5. Submit
6. **Expected**: Redirected to `/personas/archetypes` with success toast
7. **Expected**: New archetype appears in the table

### Scenario 3: Create Archetype Validation

1. Navigate to `/personas/archetypes/create`
2. Submit the empty form
3. **Expected**: Inline errors for name ("required") and naming pattern ("required")
4. Fill in name only, submit
5. **Expected**: Error for naming pattern still shown

### Scenario 4: Archetype Detail and Edit

1. Navigate to `/personas/archetypes`
2. Click on an archetype name
3. **Expected**: Navigates to `/personas/archetypes/[id]` with archetype details: name, description, naming pattern, lifecycle policy, status, persona count, dates
4. Click "Edit"
5. Change the description
6. Save
7. **Expected**: Success toast, page shows updated description

### Scenario 5: Archetype Activate/Deactivate

1. Navigate to an archetype detail page (active archetype)
2. Click "Deactivate"
3. **Expected**: Status changes to "Inactive", success toast
4. Click "Activate"
5. **Expected**: Status changes to "Active", success toast

### Scenario 6: Archetype Delete

1. Navigate to an archetype detail page
2. Click "Delete"
3. **Expected**: Confirmation dialog with archetype name
4. Click "Cancel"
5. **Expected**: Dialog closes, nothing changes
6. Click "Delete" again, then "Confirm delete"
7. **Expected**: Redirected to archetype list, success toast

### Scenario 7: Persona List Displays

1. Navigate to `/personas`
2. **Expected**: Page shows "Personas" header and a data table with columns: Persona Name, Display Name, Archetype, Physical User, Status, Valid From, Valid Until
3. **Expected**: Filter dropdowns for Status and Archetype are visible
4. **Expected**: "Create persona" button is visible

### Scenario 8: Persona List Filtering

1. Navigate to `/personas` (with personas in various statuses)
2. Select "active" from the Status filter
3. **Expected**: Table shows only active personas
4. Clear the status filter
5. Select an archetype from the Archetype filter
6. **Expected**: Table shows only personas using that archetype
7. Clear all filters
8. **Expected**: Full persona list restores

### Scenario 9: Create Persona

1. Navigate to `/personas`
2. Click "Create persona"
3. **Expected**: Navigates to `/personas/create` with a form showing archetype dropdown, user dropdown, optional dates
4. Select an archetype and a physical user
5. Submit
6. **Expected**: Redirected to `/personas` with success toast
7. **Expected**: New persona appears with "draft" status badge

### Scenario 10: Persona Detail

1. Navigate to `/personas`
2. Click on a persona name
3. **Expected**: Navigates to `/personas/[id]` showing: persona name, display name, archetype, physical user, status badge, validity dates, created/updated timestamps
4. **Expected**: Attributes section shows inherited, overrides, and persona-specific attributes in grouped cards

### Scenario 11: Persona Lifecycle - Activate

1. Navigate to a persona detail page (draft status)
2. Click "Activate"
3. **Expected**: Status changes to "active", success toast

### Scenario 12: Persona Lifecycle - Deactivate

1. Navigate to a persona detail page (active status)
2. Click "Deactivate"
3. **Expected**: Dialog appears with reason textarea
4. Enter less than 5 characters
5. **Expected**: Validation error shown
6. Enter a valid reason (5+ characters)
7. Click "Confirm"
8. **Expected**: Status changes to "suspended", success toast

### Scenario 13: Persona Lifecycle - Archive

1. Navigate to a persona detail page (any non-archived status)
2. Click "Archive"
3. **Expected**: Dialog appears with reason textarea and warning that this is permanent
4. Enter a valid reason
5. Click "Confirm"
6. **Expected**: Status changes to "archived", success toast
7. **Expected**: Activate/Deactivate buttons are no longer available (archived is terminal)

### Scenario 14: Status Badges Visual Check

1. Navigate to `/personas` with personas in all 6 statuses
2. **Expected**: Each status has a distinct color:
   - draft: neutral/outline style
   - active: green
   - expiring: amber/yellow
   - expired: red
   - suspended: orange
   - archived: gray

### Scenario 15: Empty States

1. Navigate to `/personas/archetypes` with no archetypes
2. **Expected**: "No archetypes found" empty state message
3. Navigate to `/personas` with no personas
4. **Expected**: "No personas found" empty state message
5. Filter personas to a status with no results
6. **Expected**: "No personas found" with filters applied

### Scenario 16: Archetype Search

1. Navigate to `/personas/archetypes`
2. Type part of an archetype name in the search field
3. **Expected**: After ~300ms debounce, table updates to show matching archetypes
4. Clear the search
5. **Expected**: Full archetype list restores

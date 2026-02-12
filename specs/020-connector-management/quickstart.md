# Quickstart: Connector Management

**Feature**: 020-connector-management
**Date**: 2026-02-11

## Quick Verification Scenarios

### Scenario 1: View Connector List (US1 - MVP)

1. Log in as an admin user
2. Navigate to `/connectors`
3. Verify the page shows a table with columns: Name, Type, Status, Health, Last Checked, Created
4. Verify pagination controls are present at the bottom
5. Verify "Create Connector" button in the page header
6. If no connectors exist, verify empty state with CTA

### Scenario 2: Create LDAP Connector (US2)

1. Navigate to `/connectors/create`
2. Fill in name: "Corporate LDAP"
3. Select connector type: "LDAP"
4. Verify LDAP-specific fields appear (host, port, bind DN, etc.)
5. Fill in configuration:
   - Host: ldap.example.com
   - Port: 636
   - Bind DN: cn=admin,dc=example,dc=com
   - Bind Password: secret
   - Base DN: dc=example,dc=com
   - Use SSL: checked
6. Submit the form
7. Verify redirect to the connector detail page with success toast
8. Verify the new connector appears on the list page

### Scenario 3: Create Database Connector (US2)

1. Navigate to `/connectors/create`
2. Select connector type: "Database"
3. Verify database-specific fields appear (host, port, database, username, password, driver)
4. Fill in and submit
5. Verify success redirect

### Scenario 4: Create REST API Connector (US2)

1. Navigate to `/connectors/create`
2. Select connector type: "REST API"
3. Verify REST API-specific fields appear (base URL, auth type, auth config)
4. Fill in and submit
5. Verify success redirect

### Scenario 5: View Connector Detail (US3)

1. Navigate to `/connectors/{id}` for an existing connector
2. Verify Overview tab shows: name, description, type badge, status badge, dates
3. Click Configuration tab — verify configuration fields displayed (passwords masked)
4. Click Health tab — verify health metrics displayed

### Scenario 6: Edit Connector (US4)

1. Navigate to `/connectors/{id}`
2. Click "Edit" button
3. Verify edit form pre-populated with current values
4. Change the name and description
5. Submit the form
6. Verify redirect to detail page with updated values

### Scenario 7: Test Connection (US5)

1. Navigate to `/connectors/{id}`
2. Click "Test Connection" button
3. Verify loading state (spinner/disabled button)
4. Wait for result
5. Verify success or failure message with response time

### Scenario 8: Activate/Deactivate (US6)

1. Navigate to `/connectors/{id}` for an inactive connector
2. Click "Activate"
3. Verify status changes to "Active" with success toast
4. Click "Deactivate"
5. Verify status changes to "Inactive" with success toast

### Scenario 9: Delete Connector (US7)

1. Navigate to `/connectors/{id}` for an inactive connector
2. Click "Delete"
3. Verify confirmation dialog appears
4. Confirm deletion
5. Verify redirect to list page with success toast
6. Verify connector no longer appears in the list

### Scenario 10: Admin-Only Access

1. Log in as a non-admin user
2. Navigate to `/connectors`
3. Verify redirect to `/dashboard`

### Scenario 11: Dark Mode

1. Toggle dark mode
2. Verify all connector pages render correctly with dark styling
3. Verify badges, tables, forms, and tabs all have proper dark mode colors

## Non-Admin User Flow

Non-admin users should:
- Not see "Connectors" in the sidebar navigation
- Be redirected to `/dashboard` if they manually navigate to `/connectors`
- Have no access to any connector management endpoints (BFF returns 401)

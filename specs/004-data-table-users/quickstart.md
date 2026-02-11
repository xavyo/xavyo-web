# Quickstart Validation: Data Table + User Management

**Feature**: 004-data-table-users
**Date**: 2026-02-10

## Prerequisites

- xavyo-web running on `localhost:3000`
- xavyo-idp running on `localhost:8080`
- Logged in as an admin user with a provisioned tenant

## Validation Scenarios

### Scenario 1: User List Displays

1. Navigate to `/users`
2. **Expected**: Page shows "Users" header and a data table with columns: Email, Status, Roles, Verified, Created, Actions
3. **Expected**: At least the current admin user appears in the table
4. **Expected**: Active users show a green "Active" badge, inactive show muted "Inactive" badge

### Scenario 2: Pagination Works

1. Ensure more than 20 users exist in the tenant (or adjust page size for testing)
2. Navigate to `/users`
3. Click "Next" in pagination controls
4. **Expected**: Table updates with next page of results
5. **Expected**: Pagination shows current page info and total count
6. Click "Previous"
7. **Expected**: Returns to first page

### Scenario 3: Search Filters Users

1. Navigate to `/users`
2. Type a partial email in the search field
3. **Expected**: After ~300ms debounce, table updates to show only matching users
4. Clear the search field
5. **Expected**: Table resets to show all users from page 1

### Scenario 4: Create User

1. Navigate to `/users`
2. Click "Create user" button
3. **Expected**: Navigates to `/users/create` with a form
4. Fill in: email, password (8+ chars), select "user" role
5. Submit the form
6. **Expected**: Redirected to `/users` with a "User created successfully" toast
7. **Expected**: New user appears in the table

### Scenario 5: Create User Validation

1. Navigate to `/users/create`
2. Submit the empty form
3. **Expected**: Inline errors for email ("required"), password ("required"), roles ("at least one role")
4. Fill in an email that already exists, valid password, select a role
5. Submit
6. **Expected**: Error message indicating email is taken

### Scenario 6: View User Detail

1. Navigate to `/users`
2. Click on a user row
3. **Expected**: Navigates to `/users/[id]` showing user details: email, username, roles, active status, email verified, created date, updated date

### Scenario 7: Edit User

1. From a user detail page, click "Edit"
2. **Expected**: Form appears with current values pre-filled
3. Change the email to a new valid email
4. Submit
5. **Expected**: Success toast, page shows updated email
6. Click "Cancel" during edit
7. **Expected**: Returns to view mode without changes

### Scenario 8: Enable/Disable User

1. Navigate to a user detail page for an active user (not yourself)
2. Click "Disable"
3. **Expected**: Confirmation prompt asking to disable the user
4. Confirm
5. **Expected**: Status badge changes to "Inactive", success toast
6. Click "Enable"
7. **Expected**: Status badge changes to "Active" immediately (no confirmation), success toast

### Scenario 9: Delete User

1. Navigate to a user detail page
2. Click "Delete"
3. **Expected**: Confirmation dialog showing user's email
4. Click "Cancel"
5. **Expected**: Dialog closes, nothing changes
6. Click "Delete" again, then "Confirm delete"
7. **Expected**: Redirected to `/users`, success toast "User deleted", user no longer in list

### Scenario 10: Empty State

1. Search for a non-existent email (e.g., "zzzznotfound@example.com")
2. **Expected**: Table shows empty state message (e.g., "No users found")
3. Clear search
4. **Expected**: Full user list restores

### Scenario 11: Self-Deactivation Prevention

1. Navigate to your own user detail page
2. **Expected**: The "Disable" button is either hidden or clicking it shows an error preventing self-deactivation

### Scenario 12: Loading State

1. Navigate to `/users` with network throttling enabled
2. **Expected**: Table shows loading skeleton while data is being fetched
3. **Expected**: Once loaded, skeleton is replaced with actual data

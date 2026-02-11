# Feature Specification: Data Table + User Management

**Feature Branch**: `004-data-table-users`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "Admin users manage tenant users through a paginated, searchable data table. Users can be created, viewed, edited, enabled/disabled, and deleted. A reusable data table component provides pagination, search, and empty states for use across the application."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reusable Data Table Component (Priority: P1)

A reusable data table component is available for use throughout the application. It accepts column definitions and data, renders a responsive table with sortable column headers, provides a search toolbar with configurable placeholder text, displays pagination controls (previous/next, current page, total count), and shows appropriate empty states and loading indicators. This component will be reused for Personas and NHI lists in future features.

**Why this priority**: The data table is a shared building block that the user list and all future list pages depend on. It must be built first.

**Independent Test**: Render the data table component with mock data and column definitions, verify columns render, pagination works, search input filters, and empty state shows when no data.

**Acceptance Scenarios**:

1. **Given** the data table receives column definitions and row data, **When** it renders, **Then** all columns and rows are displayed correctly
2. **Given** the data table has pagination enabled, **When** there are more items than the page size, **Then** pagination controls show page navigation and total count
3. **Given** the search toolbar is enabled, **When** the user types a query, **Then** a search callback fires after debounce with the search term
4. **Given** no data is available, **When** the table renders, **Then** an empty state message is shown instead of table rows
5. **Given** data is loading, **When** the table renders, **Then** a loading skeleton is shown in place of data rows

---

### User Story 2 - User List with Data Table (Priority: P1)

An admin navigates to the Users section from the sidebar. They see a data table listing all users in their organization. The table shows each user's email, active/inactive status as a colored badge, assigned roles, email verification status, and creation date. The admin can search users by email address — the table updates as they type (with debounce). Pagination controls at the bottom allow navigating through pages, with a display of total user count. When no users match the search, an empty state message is shown.

**Why this priority**: The user list is the foundation for all user management actions. Without it, admins cannot see or interact with their users.

**Independent Test**: Navigate to /users while logged in as admin, verify table renders with column headers and user data, search by email and verify filtered results, navigate between pages.

**Acceptance Scenarios**:

1. **Given** an admin is logged in and has users in their tenant, **When** they navigate to /users, **Then** they see a data table with columns: Email, Status, Roles, Verified, Created, and Actions
2. **Given** the user list is displayed, **When** the admin types an email in the search field, **Then** the table filters to show only matching users after a brief debounce delay
3. **Given** more users exist than the page size (20), **When** the admin clicks "Next", **Then** the next page of results loads with updated pagination info
4. **Given** a search returns no results, **When** the table is empty, **Then** an empty state message is displayed indicating no users match the criteria
5. **Given** the table is loading data, **When** the request is in progress, **Then** a loading skeleton or indicator is shown

---

### User Story 3 - Create User (Priority: P1)

An admin clicks "Create user" from the user list page to navigate to a creation form. The form requires email and password, allows selecting one or more roles, and optionally accepts a username. On successful submission, the admin is redirected back to the user list with a success toast notification. Validation errors (duplicate email, weak password) are displayed inline on the form.

**Why this priority**: Creating users is a core admin action required for organization setup. It pairs with the user list as the minimum viable user management workflow.

**Independent Test**: Navigate to /users/create, fill in the form with valid data, submit, verify redirect to /users with success toast. Then test with invalid data (empty fields, duplicate email) and verify inline errors.

**Acceptance Scenarios**:

1. **Given** an admin is on the user list page, **When** they click "Create user", **Then** they are taken to the user creation form at /users/create
2. **Given** the creation form is displayed, **When** the admin fills in a valid email, password, and selects roles, **Then** the form submits successfully and they are redirected to /users with a success toast
3. **Given** the creation form is displayed, **When** the admin submits with an email that already exists, **Then** an error message is shown indicating the email is taken
4. **Given** the creation form is displayed, **When** required fields are left empty, **Then** validation errors are shown inline next to each invalid field
5. **Given** the creation form has a username field, **When** the admin leaves it blank, **Then** the form still submits successfully (username is optional)

---

### User Story 4 - User Detail and Edit (Priority: P1)

An admin clicks on a user row in the list to view the user's detail page. The detail page shows all user information: email, username, roles, active status, email verification status, creation date, and last update date. The admin can edit the user's email, username, and roles through an edit form. Changes are saved on submission with a success toast.

**Why this priority**: Viewing and editing user details completes the CRUD workflow and is essential for day-to-day admin operations.

**Independent Test**: Click a user from the list, verify detail page shows correct info, edit the email, submit, verify the change persists and a success toast appears.

**Acceptance Scenarios**:

1. **Given** the user list is displayed, **When** the admin clicks on a user row, **Then** they are taken to the user detail page at /users/[id]
2. **Given** the user detail page is displayed, **When** the admin views it, **Then** they see the user's email, username, roles, active status, email verified status, created date, and updated date
3. **Given** the user detail page is displayed, **When** the admin clicks "Edit", **Then** an edit form is shown with the current values pre-filled
4. **Given** the edit form is displayed, **When** the admin changes the email and submits, **Then** the updated email is saved and a success toast appears
5. **Given** the edit form is displayed, **When** validation fails (e.g., invalid email format), **Then** inline errors are shown

---

### User Story 5 - Enable/Disable User (Priority: P2)

An admin can toggle a user's active status. From the user detail page, the admin can disable an active user or enable a disabled user. Disabling a user shows a brief confirmation prompt. The status badge updates immediately after the action. A toast notification confirms the action.

**Why this priority**: Account lifecycle management is important but secondary to basic CRUD. Admins need this to handle offboarding and security incidents.

**Independent Test**: From the user detail page, click "Disable" on an active user, confirm, verify the status badge changes to "Inactive" and a toast appears. Then re-enable and verify the reverse.

**Acceptance Scenarios**:

1. **Given** an active user's detail page, **When** the admin clicks "Disable", **Then** a confirmation prompt appears asking if they want to disable the user
2. **Given** the confirmation prompt is shown, **When** the admin confirms, **Then** the user is disabled, the status badge changes to "Inactive", and a success toast appears
3. **Given** an inactive user's detail page, **When** the admin clicks "Enable", **Then** the user is enabled immediately (no confirmation needed), the badge changes to "Active", and a success toast appears
4. **Given** the user list, **When** looking at a disabled user row, **Then** the status column shows an "Inactive" badge in a warning/muted color

---

### User Story 6 - Delete User (Priority: P2)

An admin can delete a user from the user detail page. Clicking "Delete" shows a confirmation dialog with the user's email prominently displayed. The admin must confirm the action. On successful deletion, they are redirected to the user list with a toast notification.

**Why this priority**: Deletion is a destructive action needed for data management but less frequent than other operations.

**Independent Test**: From a user detail page, click "Delete", see the confirmation dialog with the user's email, confirm, verify redirect to /users with success toast, verify the user no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** a user detail page, **When** the admin clicks "Delete", **Then** a confirmation dialog appears showing the user's email and asking for confirmation
2. **Given** the confirmation dialog, **When** the admin clicks "Confirm delete", **Then** the user is deleted, the admin is redirected to /users, and a success toast says the user was deleted
3. **Given** the confirmation dialog, **When** the admin clicks "Cancel", **Then** the dialog closes and nothing changes
4. **Given** the user was just deleted, **When** the admin views the user list, **Then** the deleted user no longer appears

---

### Edge Cases

- What happens when the admin tries to disable themselves? The system prevents self-deactivation with an error message.
- What happens when the admin deletes the last admin user? The backend returns an error preventing it; the frontend shows this error as a toast.
- What happens when the user list has thousands of entries? Pagination limits results to 20 per page with server-side filtering, so the client only loads one page at a time.
- How does the table handle network errors during pagination? An error toast is shown and the table retains its current state.
- What happens if a user is modified by another admin while being viewed? The detail page shows the data as loaded; edits use the latest server state on submit (last-write-wins).
- What happens when the search field is cleared? The table resets to show all users from page 1.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated table of tenant users with columns for email, status, roles, verified, created date, and actions
- **FR-002**: System MUST support server-side pagination with a default page size of 20 users and a maximum of 100
- **FR-003**: System MUST provide email search filtering that queries the server with debounced input (300ms delay)
- **FR-004**: System MUST allow admins to create new users by providing email, password, at least one role, and an optional username
- **FR-005**: System MUST validate user creation input: email format, password minimum length (8 characters), at least one role selected
- **FR-006**: System MUST display a user detail page showing all user attributes when a user is selected from the list
- **FR-007**: System MUST allow admins to edit a user's email, username, and roles from the detail page
- **FR-008**: System MUST allow admins to disable an active user with a confirmation prompt
- **FR-009**: System MUST allow admins to enable a disabled user without requiring confirmation
- **FR-010**: System MUST allow admins to delete a user with a confirmation dialog that displays the user's email
- **FR-011**: System MUST redirect to the user list with a success toast after creating or deleting a user
- **FR-012**: System MUST show inline validation errors on forms for invalid input
- **FR-013**: System MUST display appropriate empty states when no users exist or no search results match
- **FR-014**: System MUST display loading indicators while data is being fetched
- **FR-015**: System MUST show error toasts for server errors during any user management action
- **FR-016**: System MUST provide a reusable data table component with configurable columns, pagination, search, empty states, and loading states
- **FR-017**: System MUST prevent an admin from disabling their own account
- **FR-018**: System MUST display user status as colored badges (active = green, inactive = muted/warning)

### Key Entities

- **User**: Represents a person in the tenant with email, username, password, roles, active status, email verification status, and timestamps (created, updated)
- **Role**: A label assigned to a user determining their permissions within the tenant (e.g., "admin", "user")
- **Pagination**: Metadata describing the current result set — total count, current offset, page size, and whether more pages exist

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can view, search, and paginate through their user list within 2 seconds per page load
- **SC-002**: Admins can create a new user in under 1 minute using the creation form
- **SC-003**: Admins can locate a specific user by email search within 5 seconds
- **SC-004**: All user management actions (create, edit, enable, disable, delete) provide clear feedback via toast notifications within 1 second of completion
- **SC-005**: The data table component is reusable — it can be configured for any entity type with different columns without modification to its core logic
- **SC-006**: 100% of form validation errors are shown inline before submission reaches the server
- **SC-007**: Zero data table rendering errors when handling edge cases (empty data, single user, maximum page size)

## Scope

### In Scope

- User list with data table (pagination, search, sorting UI)
- User creation form with validation
- User detail/edit page
- Enable/disable toggle with confirmation
- Delete with confirmation dialog
- Reusable data table component
- Toast notifications for all actions
- Client-side proxy endpoint for table data fetching

### Out of Scope

- Bulk actions (select multiple users, bulk delete/disable)
- User import/export (CSV, SCIM)
- Password reset by admin
- Custom attributes management
- Lifecycle state management
- Manager hierarchy assignment
- Role management (creating/editing role definitions)
- Audit log of user changes

## Assumptions

- The admin is always authenticated and has the "admin" role (enforced by the existing auth guard)
- Available roles are a predefined set: "admin" and "user" (no custom role creation in this feature)
- The backend validates unique email constraint and returns appropriate error codes
- The backend supports partial email matching for search (case-insensitive)
- Default page size is 20, matching the backend default limit
- The data table component will be extended in future features (Personas, NHI) without breaking changes
- Password requirements are validated server-side; the frontend enforces minimum length (8 characters) only

## Dependencies

- Feature 003 (Onboarding + App Shell): The app shell layout, auth guard, sidebar navigation, and toast system must be in place
- Backend API endpoints for user management must be available and functional

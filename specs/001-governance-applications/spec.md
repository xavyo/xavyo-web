# Feature Specification: Governance Applications Management UI

**Feature Branch**: `001-governance-applications`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "Build CRUD pages for governance applications with list, create, edit, delete functionality. Backend API fully supports CRUD at /governance/applications (admin-only). Partial BFF/API client code exists."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Applications (Priority: P1)

As an administrator, I want to view a list of all governance applications so that I can monitor which applications are registered in the system and their current status.

**Why this priority**: The list page is the entry point for all application management. Without it, administrators cannot discover or navigate to any application. It is the foundation for all other stories.

**Independent Test**: Can be fully tested by navigating to the applications list page and verifying that registered applications appear in a paginated table with relevant columns.

**Acceptance Scenarios**:

1. **Given** I am logged in as an administrator, **When** I navigate to the applications section from the sidebar, **Then** I see a paginated table of applications showing name, type, status, description, and creation date.
2. **Given** there are no applications registered, **When** I view the list, **Then** I see an empty state message encouraging me to create the first application.
3. **Given** there are more applications than fit on one page, **When** I navigate between pages, **Then** I see the correct subset of applications with accurate pagination controls.
4. **Given** I am not an administrator, **When** I attempt to access the applications list, **Then** I am denied access with an appropriate message.

---

### User Story 2 - Create Application (Priority: P1)

As an administrator, I want to register a new application so that I can associate entitlements with it and manage its governance lifecycle.

**Why this priority**: Creating applications is essential — entitlements cannot be created without at least one application. This directly unblocks the "No applications found" issue.

**Independent Test**: Can be fully tested by filling the creation form, submitting it, and verifying the new application appears in the list.

**Acceptance Scenarios**:

1. **Given** I am on the applications list page, **When** I click "Create application", **Then** I am taken to a creation form with fields for name, type, description, external ID, and delegability.
2. **Given** I fill in the required fields (name and type), **When** I submit the form, **Then** the application is created and I am redirected to the applications list with a success notification.
3. **Given** I submit the form with a missing required field, **When** validation runs, **Then** I see specific error messages indicating which fields need attention.
4. **Given** I submit the form with a name that exceeds the maximum length, **When** validation runs, **Then** I see a validation error for the name field.

---

### User Story 3 - View and Edit Application (Priority: P2)

As an administrator, I want to view the full details of an application and update its properties so that I can keep application records accurate and manage their lifecycle status.

**Why this priority**: After creating applications, administrators need to be able to review and maintain them. Editing status (active/inactive) is particularly important for lifecycle management.

**Independent Test**: Can be fully tested by clicking on an application in the list, viewing its details, modifying a field, saving, and verifying the change persists.

**Acceptance Scenarios**:

1. **Given** I am on the applications list, **When** I click on an application row, **Then** I am taken to a detail page showing all application properties including read-only fields (ID, creation date, last update date).
2. **Given** I am viewing an application, **When** I modify the name and save, **Then** the change is persisted and I see a success notification.
3. **Given** I am viewing an application, **When** I change its status from active to inactive and save, **Then** the status is updated accordingly.
4. **Given** I submit invalid data (e.g., empty name), **When** validation runs, **Then** I see appropriate error messages and the form is not submitted.

---

### User Story 4 - Delete Application (Priority: P3)

As an administrator, I want to delete an application that is no longer needed so that the application registry stays clean and relevant.

**Why this priority**: Deletion is a less frequent operation and is only safe when the application has no associated entitlements. It is the least critical CRUD operation.

**Independent Test**: Can be fully tested by attempting to delete an application with and without associated entitlements and verifying the correct outcome in each case.

**Acceptance Scenarios**:

1. **Given** I am viewing an application with no associated entitlements, **When** I click "Delete" and confirm, **Then** the application is removed and I am redirected to the list.
2. **Given** I am viewing an application that has associated entitlements, **When** I attempt to delete it, **Then** I see a clear error message explaining the application cannot be deleted because it has entitlements.
3. **Given** I click "Delete", **When** the confirmation prompt appears, **Then** I can cancel the operation and return to the detail page without any changes.

---

### User Story 5 - Sidebar Navigation (Priority: P1)

As an administrator, I want to access the applications management section from the sidebar so that I can quickly navigate to it from anywhere in the application.

**Why this priority**: Without a navigation entry, the feature is unreachable. This is a prerequisite for all other stories in practice.

**Independent Test**: Can be tested by verifying the sidebar contains an "Applications" link under the Governance section that navigates to the correct page.

**Acceptance Scenarios**:

1. **Given** I am logged in as an administrator, **When** I look at the sidebar under the Governance section, **Then** I see an "Applications" link.
2. **Given** I click the "Applications" link in the sidebar, **When** the page loads, **Then** I am on the applications list page.

---

### Edge Cases

- What happens when the backend returns an unexpected error during create/update/delete? The user should see a meaningful error message, not a generic failure.
- What happens when an application is deleted by another admin while the current admin is viewing its detail page? The system should handle the 404 gracefully.
- What happens when the session expires while filling out a form? Standard session handling should redirect to login.
- What happens when the backend returns a 412 (Precondition Failed) on delete? The UI should display a specific message about existing entitlements preventing deletion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated list of governance applications accessible from the sidebar navigation.
- **FR-002**: System MUST allow administrators to create a new application with name (required, 1-255 characters), type (required, internal or external), description (optional, max 2000 characters), external ID (optional, max 255 characters), and delegability flag (optional, defaults to true).
- **FR-003**: System MUST allow administrators to view all details of a single application including its ID, creation date, and last update date as read-only information.
- **FR-004**: System MUST allow administrators to update an application's name, status, description, external ID, and delegability flag.
- **FR-005**: System MUST allow administrators to delete an application, provided it has no associated entitlements.
- **FR-006**: System MUST display a specific error message when deletion fails due to existing entitlements (backend 412 response).
- **FR-007**: System MUST restrict all application management operations to users with administrator roles only.
- **FR-008**: System MUST validate all form inputs on the client side before submission, with clear per-field error messages.
- **FR-009**: System MUST provide a navigation entry in the sidebar under the Governance section for accessing the applications list.
- **FR-010**: System MUST show appropriate empty states when no applications exist, guiding the user to create the first one.

### Key Entities

- **Application**: A registered application in the governance system. Has a name, type (internal/external), status (active/inactive), optional description, optional external ID, optional metadata, and a delegability flag. Can be associated with multiple entitlements. Created and managed by administrators.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can navigate to the applications list from the sidebar in a single click.
- **SC-002**: Administrators can create a new application and see it in the list within a single workflow (form submission + redirect).
- **SC-003**: Administrators can update any editable field of an application and see the change reflected immediately after save.
- **SC-004**: Administrators receive a clear, specific error message when attempting to delete an application with existing entitlements.
- **SC-005**: All form validations provide per-field error feedback before any server request is made.
- **SC-006**: The applications list supports pagination for large numbers of applications.
- **SC-007**: Non-administrator users cannot access any application management functionality.

## Assumptions

- The backend API is fully operational and stable at `/governance/applications`.
- The `owner_id` and `metadata` fields are omitted from the UI forms as power-user features; they can be added in a future iteration.
- The application type (`app_type`) is set at creation time and is displayed as read-only on the edit page (changing type after creation could break entitlement associations).
- Standard session management (HttpOnly cookies, BFF pattern) is already in place and handles authentication/authorization.
- The existing governance UI patterns (entitlements, SoD rules, campaigns) serve as the reference for design consistency.

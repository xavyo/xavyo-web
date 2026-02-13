# Feature Specification: Bulk User Import & SCIM Administration

**Feature Branch**: `025-bulk-import-scim`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Add bulk user import (CSV) and SCIM administration features"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bulk CSV User Import (Priority: P1)

As a tenant administrator, I want to import multiple users at once by uploading a CSV file, so that I can onboard large teams without creating users one by one.

The admin navigates to Settings > Imports, clicks "New Import", selects a CSV file, optionally toggles "Send invitation emails", and submits. The system creates an asynchronous import job. The admin can monitor job progress on the imports list page.

**Why this priority**: Bulk import is the highest-value feature for enterprise customers onboarding hundreds or thousands of users. Manual one-by-one user creation is a critical friction point.

**Independent Test**: Can be fully tested by uploading a CSV file and verifying the import job appears in the list with correct status and counts.

**Acceptance Scenarios**:

1. **Given** an admin on the Imports page, **When** they upload a valid CSV file with 5 users and submit, **Then** a new import job is created with status "pending" and total_rows=5.
2. **Given** an admin on the Imports page, **When** they upload a CSV and toggle "Send invitation emails" on, **Then** the import job processes and invitation emails are queued for successfully imported users.
3. **Given** an admin on the Imports page, **When** they upload a file that is not CSV, **Then** the system shows a validation error "Only .csv files are accepted".
4. **Given** a non-admin user, **When** they try to access the Imports page, **Then** they are redirected to the dashboard.

---

### User Story 2 - Import Job Monitoring & Error Handling (Priority: P1)

As a tenant administrator, I want to view the status of my import jobs, see detailed error information for failed rows, and download an error report CSV, so that I can fix data issues and re-import.

The admin sees a list of all import jobs with their status (pending/processing/completed/failed/cancelled), total/success/error/skip counts. Clicking a job opens a detail page showing full job info, a progress summary, and a paginated list of per-row errors. The admin can download errors as CSV and bulk-resend invitations for successfully imported users.

**Why this priority**: Without error visibility, admins cannot troubleshoot failed imports. This is essential for the import workflow to be usable.

**Independent Test**: Can be tested by creating an import with known errors and verifying the job detail page shows correct error breakdown and downloadable CSV.

**Acceptance Scenarios**:

1. **Given** an import job list exists, **When** the admin views the Imports page, **Then** all jobs are listed with status badges, row counts, and creation dates.
2. **Given** a completed import job with 3 errors, **When** the admin clicks on the job, **Then** the detail page shows total/success/error/skip counts and a paginated error list.
3. **Given** a job detail page with errors, **When** the admin clicks "Download Error CSV", **Then** a CSV file downloads containing row numbers, error types, and error messages.
4. **Given** a completed import job with successful users, **When** the admin clicks "Resend Invitations", **Then** invitation emails are resent to all successfully imported users from that job.

---

### User Story 3 - Invitation Acceptance Flow (Priority: P2)

As a newly imported user who received an invitation email, I want to click the invitation link, set my password, and activate my account, so that I can start using the platform.

The user clicks the link in their invitation email, which takes them to a public page at `/invite/:token`. The page validates the token and shows the user's email. The user enters and confirms a new password, then submits. On success, their account is activated and they are redirected to the login page.

**Why this priority**: Without an acceptance flow, imported users cannot actually access the platform. This completes the import-to-activation pipeline.

**Independent Test**: Can be tested by navigating to an invitation URL with a valid token and completing the password setup form.

**Acceptance Scenarios**:

1. **Given** a valid invitation token, **When** the user navigates to `/invite/:token`, **Then** the page shows their email address and a password form.
2. **Given** a valid invitation page, **When** the user enters a password meeting requirements (8-128 chars) and confirms it, **Then** the account is activated and the user is redirected to login with a success message.
3. **Given** an expired invitation token (>7 days old), **When** the user navigates to `/invite/:token`, **Then** the page shows "This invitation has expired" with a link to contact their admin.
4. **Given** an already-accepted invitation token, **When** the user navigates to `/invite/:token`, **Then** the page shows "This invitation has already been used" with a link to login.
5. **Given** the password form, **When** the user enters a password shorter than 8 characters, **Then** the form shows a validation error.

---

### User Story 4 - SCIM Token Management (Priority: P2)

As a tenant administrator, I want to create and manage SCIM provisioning tokens, so that I can connect external identity providers (like Okta, Azure AD) for automated user provisioning.

The admin navigates to Settings > SCIM and sees the Tokens tab. They can view existing tokens (name, token prefix, creation date, last used date), create new tokens (with the raw token displayed only once), and revoke existing tokens.

**Why this priority**: SCIM tokens are the prerequisite for any SCIM-based provisioning. Without tokens, SCIM integration cannot be configured.

**Independent Test**: Can be tested by creating a SCIM token, verifying the one-time raw token display, and confirming it appears in the token list.

**Acceptance Scenarios**:

1. **Given** an admin on the SCIM Tokens page, **When** they click "Create Token" and provide a name, **Then** a new token is created and the raw token value is displayed once with a copy button.
2. **Given** a newly created token, **When** the admin dismisses the token display, **Then** the raw token is no longer retrievable and only the prefix is shown in the list.
3. **Given** a token list with existing tokens, **When** the admin clicks "Revoke" on a token and confirms, **Then** the token is deleted and can no longer be used for SCIM requests.
4. **Given** a non-admin user, **When** they try to access the SCIM page, **Then** they are redirected to the dashboard.

---

### User Story 5 - SCIM Attribute Mappings (Priority: P3)

As a tenant administrator, I want to view and edit how SCIM attributes map to platform user fields, so that I can customize how provisioned user data is translated.

The admin navigates to the Mappings tab on the SCIM page. They see a table of current attribute mappings (SCIM path, platform field, transform, required flag). They can edit mappings inline or via an edit form, changing the transform (lowercase, uppercase, trim, none) and required flag.

**Why this priority**: Most tenants can use default mappings. Custom mapping is an advanced configuration feature needed only when SCIM attribute names differ from the platform's expectations.

**Independent Test**: Can be tested by viewing the default mappings and editing a transform value, then verifying the change persists.

**Acceptance Scenarios**:

1. **Given** an admin on the SCIM Mappings page, **When** the page loads, **Then** all current attribute mappings are displayed in a table with SCIM path, platform field, transform, and required columns.
2. **Given** the mappings table, **When** the admin changes a transform from "none" to "lowercase" and saves, **Then** the mapping is updated and the change is reflected in the table.
3. **Given** the mappings table, **When** the admin toggles the "required" flag on a mapping and saves, **Then** the required flag is updated.

---

### Edge Cases

- What happens when an admin uploads a CSV with 0 valid data rows (only headers)? The system should create the job but complete with 0 successes.
- What happens when an admin tries to start a new import while another is still processing? The system should show an error "Only one concurrent import per tenant is allowed."
- What happens when a CSV contains duplicate emails within the same file? The system should report `duplicate_in_file` errors for duplicate rows.
- What happens when a CSV contains emails that already exist in the tenant? The system should report `duplicate_in_tenant` errors for those rows.
- What happens when the CSV file exceeds the size limit (~10MB)? The system should reject the upload with a clear size limit error.
- What happens when the CSV has more than 10,000 rows? The system should reject with a row limit error.
- What happens when a SCIM token name is empty? The system should show a validation error.
- What happens when an invitation token is malformed (not a valid UUID)? The system should show "Invalid invitation link."
- What happens when the user enters mismatched passwords on the invitation acceptance page? The system should show a validation error.

## Requirements *(mandatory)*

### Functional Requirements

**Bulk Import:**
- **FR-001**: System MUST allow admins to upload a CSV file to create multiple user accounts in a single operation.
- **FR-002**: System MUST accept only `.csv` files with a maximum size of approximately 10MB and 10,000 rows.
- **FR-003**: System MUST process import jobs asynchronously, with status progression: pending, processing, completed, failed, or cancelled.
- **FR-004**: System MUST allow only one concurrent import job per tenant to prevent resource conflicts.
- **FR-005**: System MUST provide an option to send invitation emails to successfully imported users.
- **FR-006**: System MUST display a list of all import jobs with their status, row counts (total, success, error, skip), and timestamps.
- **FR-007**: System MUST provide a job detail page showing progress, per-row errors with pagination, and error categorization (validation, duplicate_in_file, duplicate_in_tenant, role_not_found, group_error, attribute_error, system).
- **FR-008**: System MUST allow downloading per-row errors as a CSV file for offline analysis.
- **FR-009**: System MUST allow bulk resending of invitation emails for a completed import job.

**Invitation Acceptance:**
- **FR-010**: System MUST provide a public (unauthenticated) page at `/invite/:token` for new users to accept invitations.
- **FR-011**: System MUST validate the invitation token and display the user's email address on the acceptance page.
- **FR-012**: System MUST allow users to set a password (8-128 characters) and confirm it to activate their account.
- **FR-013**: System MUST show clear error states for expired tokens (>7 days), already-used tokens, and invalid tokens.
- **FR-014**: System MUST redirect users to the login page after successful account activation.

**SCIM Token Management:**
- **FR-015**: System MUST allow admins to create SCIM provisioning tokens with a human-readable name.
- **FR-016**: System MUST display the raw token value exactly once at creation time, with a copy-to-clipboard option.
- **FR-017**: System MUST display a list of tokens showing name, token prefix (first few characters), creation date, and last-used date.
- **FR-018**: System MUST allow admins to revoke (delete) SCIM tokens with a confirmation step.

**SCIM Attribute Mappings:**
- **FR-019**: System MUST display current SCIM-to-platform attribute mappings in a table format.
- **FR-020**: System MUST allow admins to edit the transform applied to each mapping (lowercase, uppercase, trim, or none).
- **FR-021**: System MUST allow admins to toggle the "required" flag on each mapping.
- **FR-022**: System MUST save all mapping changes as a batch update.

### Key Entities

- **Import Job**: Represents a single CSV import operation. Key attributes: status (pending/processing/completed/failed/cancelled), file name, total rows, successful rows, error rows, skipped rows, whether invitations were sent, timestamps.
- **Import Error**: A per-row error within an import job. Key attributes: row number, error type (validation/duplicate_in_file/duplicate_in_tenant/role_not_found/group_error/attribute_error/system), error message, field name, raw row data.
- **Invitation**: A pending invitation for a user to set their password and activate. Key attributes: token, email, expiry (7 days from creation), status (pending/accepted/expired).
- **SCIM Token**: An authentication token for SCIM provisioning requests. Key attributes: name, token prefix (visible portion), creation timestamp, last-used timestamp.
- **Attribute Mapping**: A mapping between SCIM attribute paths and platform user fields. Key attributes: SCIM path (e.g., "userName"), platform field (e.g., "email"), transform (lowercase/uppercase/trim/none), required flag.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can import a 100-user CSV file and see the job complete with correct success/error counts within the imports list page.
- **SC-002**: Per-row import errors are displayed with clear categorization, and the error CSV download contains all error details.
- **SC-003**: Newly imported users can accept their invitation and set a password within 2 minutes of receiving the email.
- **SC-004**: SCIM tokens can be created, displayed once, and revoked, with the token list always reflecting current state.
- **SC-005**: SCIM attribute mappings can be viewed and edited, with changes persisting across page reloads.
- **SC-006**: All admin-only pages redirect non-admin users to the dashboard.
- **SC-007**: The invitation acceptance page handles all error states (expired, used, invalid) with clear user-facing messages.
- **SC-008**: All features work correctly in both light and dark themes.

## Assumptions

- The backend CSV parser handles column ordering and header matching; the frontend only needs to upload the raw file.
- Import job processing happens asynchronously on the backend; the frontend polls or displays current state on page load.
- The invitation acceptance page is part of the `(auth)` route group (unauthenticated), similar to login/signup pages.
- SCIM attribute mappings have a finite, backend-defined set; the frontend displays and edits existing mappings rather than creating new ones from scratch.
- The `xscim_` prefix format for SCIM tokens is a backend convention; the frontend displays whatever prefix the backend returns.

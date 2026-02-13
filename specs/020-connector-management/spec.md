# Feature Specification: Connector Management

**Feature Branch**: `020-connector-management`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Connector Management (Phase 020): Implement complete UI for managing identity connectors (LDAP, Database, REST API)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connector List & Overview (Priority: P1)

As an admin, I want to see all identity connectors at a glance so I can monitor their status and health. The list page shows all connectors with their type (LDAP, Database, REST API), status (active, inactive, error), and basic health indicators. I can search by name, filter by type and status, and paginate through results.

**Why this priority**: The list view is the entry point for all connector management. Without it, admins cannot see or navigate to any connectors. This is the MVP — it delivers visibility into the connector landscape.

**Independent Test**: Navigate to /connectors, verify the list loads with correct columns (Name, Type, Status, Health, Last Checked, Created), badges for type and status, search by name, filter by type and status, and pagination controls.

**Acceptance Scenarios**:

1. **Given** connectors exist in the system, **When** admin navigates to /connectors, **Then** a paginated table displays all connectors with name, type badge, status badge, health indicator, last checked time, and created date
2. **Given** the connector list is displayed, **When** admin types in the search field, **Then** the list filters to show only connectors whose name contains the search term
3. **Given** the connector list is displayed, **When** admin selects a type filter (ldap/database/rest_api), **Then** only connectors of that type are shown
4. **Given** the connector list is displayed, **When** admin selects a status filter (active/inactive/error), **Then** only connectors with that status are shown
5. **Given** no connectors exist, **When** admin navigates to /connectors, **Then** an empty state is shown with a call-to-action to create the first connector

---

### User Story 2 - Create Connector (Priority: P2)

As an admin, I want to create a new identity connector by specifying its type (LDAP, Database, or REST API) and providing the connection configuration. The form adapts based on the selected connector type, showing relevant fields for that type (e.g., host/port/bind DN for LDAP, connection string for database, base URL/auth for REST API).

**Why this priority**: Creating connectors is the second most important action — admins must be able to add new connectors before they can manage them. Depends on US1 for the redirect target after creation.

**Independent Test**: Navigate to /connectors/create, select a connector type, fill in configuration fields, submit the form, and verify redirect to the connector detail page with success toast.

**Acceptance Scenarios**:

1. **Given** admin is on the create connector page, **When** they fill in name, select connector type "ldap", and provide LDAP configuration (host, port, bind DN, bind password, base DN), **Then** the connector is created and admin is redirected to the connector detail page
2. **Given** admin is on the create connector page, **When** they select connector type "database", **Then** the configuration fields change to show database-specific fields (host, port, database name, username, password, driver)
3. **Given** admin is on the create connector page, **When** they select connector type "rest_api", **Then** the configuration fields change to show REST API-specific fields (base URL, auth type, auth config)
4. **Given** admin submits the form with invalid data (e.g., empty name), **When** validation runs, **Then** appropriate error messages are displayed inline
5. **Given** the backend rejects the configuration (e.g., invalid host format), **When** the server responds with an error, **Then** the error message is displayed to the admin

---

### User Story 3 - Connector Detail & Health (Priority: P3)

As an admin, I want to view a connector's full details including its configuration, current status, and health metrics. The detail page has tabs for Overview (name, type, status, dates), Configuration (connection settings), and Health (last check time, response time, error count).

**Why this priority**: After listing and creating connectors, admins need to inspect individual connectors. This provides the foundation for all per-connector actions (edit, test, activate/deactivate, delete).

**Independent Test**: Navigate to /connectors/{id}, verify all three tabs display correct information, health metrics show last check time and response time.

**Acceptance Scenarios**:

1. **Given** a connector exists, **When** admin navigates to /connectors/{id}, **Then** the Overview tab shows connector name, description, type badge, status badge, created date, and updated date
2. **Given** admin is on the connector detail page, **When** they click the Configuration tab, **Then** the connector's configuration is displayed (with sensitive fields like passwords masked)
3. **Given** admin is on the connector detail page, **When** they click the Health tab, **Then** health metrics are displayed: status indicator, last check time, response time in milliseconds, and error count
4. **Given** a connector does not exist, **When** admin navigates to /connectors/{invalid-id}, **Then** a 404 error page is displayed

---

### User Story 4 - Edit Connector (Priority: P4)

As an admin, I want to update a connector's name, description, and configuration so I can fix connection issues or update credentials without recreating the connector.

**Why this priority**: Editing is essential for maintaining connectors over time (credential rotation, configuration changes) but depends on the detail page (US3) being in place.

**Independent Test**: Navigate to /connectors/{id}, click Edit, modify fields, submit, verify changes are saved and reflected on the detail page.

**Acceptance Scenarios**:

1. **Given** admin is on the connector detail page, **When** they click the "Edit" button, **Then** the edit form is displayed pre-populated with the connector's current values
2. **Given** admin is on the edit form, **When** they change the name and description and submit, **Then** the connector is updated and admin is redirected to the detail page with updated values
3. **Given** admin is on the edit form, **When** they update the configuration and submit, **Then** the new configuration is saved
4. **Given** admin submits invalid data, **When** validation fails, **Then** error messages are shown and the form retains the entered values

---

### User Story 5 - Test Connection (Priority: P5)

As an admin, I want to test a connector's connectivity to verify the configuration is correct before relying on it for sync/provisioning. The test may take several seconds, so a loading state is shown during the operation.

**Why this priority**: Testing connectivity is a verification action that adds confidence but is not strictly required for basic connector management. Depends on the detail page (US3).

**Independent Test**: Navigate to /connectors/{id}, click "Test Connection", verify loading state appears, then see success/failure result with response time.

**Acceptance Scenarios**:

1. **Given** admin is on the connector detail page, **When** they click "Test Connection", **Then** a loading indicator is shown while the test runs
2. **Given** the connection test succeeds, **When** the result returns, **Then** a success message is displayed with the response time in milliseconds
3. **Given** the connection test fails, **When** the result returns, **Then** a failure message is displayed with the error details
4. **Given** a test is already in progress, **When** admin clicks "Test Connection" again, **Then** the button is disabled to prevent duplicate requests

---

### User Story 6 - Activate & Deactivate Connector (Priority: P6)

As an admin, I want to activate or deactivate connectors so I can control which connectors participate in sync/provisioning operations. Only active connectors are used for identity operations.

**Why this priority**: Lifecycle management is important for operational control but depends on having connectors visible (US1) and inspectable (US3).

**Independent Test**: Navigate to /connectors/{id} for an inactive connector, click Activate, verify status changes to active. Then deactivate and verify status changes to inactive.

**Acceptance Scenarios**:

1. **Given** a connector is inactive, **When** admin clicks "Activate", **Then** the connector status changes to "active" and the page updates to reflect the new status
2. **Given** a connector is active, **When** admin clicks "Deactivate", **Then** the connector status changes to "inactive" and the page updates
3. **Given** a connector is in "error" status, **When** admin views the detail page, **Then** they can attempt to activate (if the underlying issue is resolved) or deactivate the connector
4. **Given** admin activates a connector, **When** the action succeeds, **Then** a success toast is displayed confirming the status change

---

### User Story 7 - Delete Connector (Priority: P7)

As an admin, I want to delete a connector that is no longer needed. Deletion should require confirmation and is only allowed for inactive connectors with no active sync operations.

**Why this priority**: Deletion is a destructive operation that is rarely used compared to other management actions. It requires all other CRUD operations to be in place first.

**Independent Test**: Navigate to /connectors/{id} for an inactive connector, click Delete, confirm in dialog, verify redirect to list page with success toast.

**Acceptance Scenarios**:

1. **Given** a connector is inactive, **When** admin clicks "Delete" and confirms the dialog, **Then** the connector is deleted and admin is redirected to the connector list with a success toast
2. **Given** a connector is active, **When** admin views the detail page, **Then** the Delete button is either hidden or disabled with a tooltip explaining the connector must be deactivated first
3. **Given** admin clicks "Delete", **When** the confirmation dialog appears, **Then** admin can cancel the action and return to the detail page without deleting
4. **Given** the backend rejects the deletion (e.g., active syncs exist), **When** the error is returned, **Then** an error message is displayed explaining why the connector cannot be deleted

---

### Edge Cases

- What happens when a connector's health check has never run (last_check_at is null)? Display "Never checked" in the health column
- How does the system handle very long configuration JSON? The configuration display uses a scrollable container with proper formatting
- What happens when the backend is unreachable during a connection test? A timeout error is displayed after a reasonable period
- How does the system handle concurrent edits to the same connector? Last-write-wins semantics (standard for this application)
- What happens when filtering produces no results? An empty state message explains no connectors match the current filters
- What happens when a connector's health status is "error"? An error badge is displayed with red styling on both list and detail pages

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated list of connectors with name, type, status, health indicator, last checked time, and created date
- **FR-002**: System MUST support searching connectors by name via a text input field
- **FR-003**: System MUST support filtering connectors by type (ldap, database, rest_api) and by status (active, inactive, error)
- **FR-004**: System MUST provide a form to create new connectors with name, optional description, connector type selection, and type-specific configuration fields
- **FR-005**: System MUST adapt the configuration form fields dynamically based on the selected connector type
- **FR-006**: System MUST display connector details with three tabs: Overview, Configuration, and Health
- **FR-007**: System MUST allow editing a connector's name, description, and configuration
- **FR-008**: System MUST provide a "Test Connection" action that shows a loading state during the test and displays the result (success/failure, response time, error details)
- **FR-009**: System MUST allow activating an inactive connector and deactivating an active connector
- **FR-010**: System MUST allow deleting an inactive connector with a confirmation dialog
- **FR-011**: System MUST prevent deletion of active connectors (disable or hide the delete button)
- **FR-012**: System MUST restrict all connector management features to admin users only
- **FR-013**: System MUST display appropriate status badges: type badges (ldap=blue, database=purple, rest_api=green) and status badges (active=green, inactive=default, error=red)
- **FR-014**: System MUST mask sensitive configuration fields (passwords, secrets) when displaying connector configuration
- **FR-015**: System MUST display health metrics on both the list page (status indicator) and detail page (full metrics: status, last check time, response time, error count)

### Key Entities

- **Connector**: An identity connector that bridges an external identity source with the platform. Key attributes: name, description, connector type (ldap/database/rest_api), configuration (JSON object), status (active/inactive/error), created and updated timestamps
- **Connector Configuration**: A type-dependent JSON object containing connection details. Varies by connector type: LDAP (host, port, bind DN, base DN, SSL), Database (host, port, database, credentials, driver), REST API (base URL, auth type, auth config, headers)
- **Health Status**: Passive health metrics collected by the backend. Attributes: status, last check time, response time in milliseconds, error count, and optional details
- **Test Result**: The outcome of an on-demand connectivity test. Attributes: success flag, message, optional details, and response time in milliseconds

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can view and navigate through the full list of connectors within 2 seconds of page load
- **SC-002**: Admins can create a new connector of any type (LDAP, Database, REST API) in under 3 minutes including configuration
- **SC-003**: Admins can test a connector's connectivity and see the result within 30 seconds (including network latency)
- **SC-004**: Admins can identify connector health issues at a glance from the list page through color-coded status badges
- **SC-005**: The connector management feature passes all automated tests including unit tests for API clients, schema validation, BFF proxies, and component rendering
- **SC-006**: Both light and dark themes render correctly for all connector management pages
- **SC-007**: All connector management pages are accessible only to admin users; non-admin users are redirected

## Assumptions

- The backend API at `/admin/connectors` is fully operational and returns data in the documented formats
- Health checks are performed passively by the backend on a schedule; the frontend only reads the results
- Configuration validation is primarily handled by the backend; the frontend provides basic field-level validation (required fields, format hints)
- The `{items, total, limit, offset}` pagination format is used consistently by the backend
- DELETE returns HTTP 204 with no body (frontend handles accordingly)
- Test connection may take up to 30 seconds; the frontend shows a loading state during this period
- Sensitive fields in configuration (passwords, secrets) should be masked in the UI but sent in full during create/edit

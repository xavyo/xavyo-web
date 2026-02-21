# Feature Specification: Provisioning Scripts & Hook Bindings

**Feature Branch**: `036-provisioning-scripts`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Phase 036: Provisioning Scripts & Hook Bindings — Governance feature for managing provisioning automation scripts with version control, hook bindings to connectors, script templates, testing/validation, and execution analytics."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Script Management with Version Control (Priority: P1)

An admin navigates to the Provisioning Scripts hub and sees a list of all scripts with their status (draft, active, inactive) and current version number. The admin creates a new script by providing a name, description, and script body. Once created, the script starts in draft status. The admin can edit metadata, activate/deactivate scripts, and delete them. For version control, the admin creates new versions with change descriptions, views the version history, rolls back to a previous version, and compares two versions side-by-side with a diff view.

**Why this priority**: Scripts are the foundational entity — all other features (bindings, templates, testing, analytics) depend on having scripts to work with. Without script CRUD and versioning, nothing else functions.

**Independent Test**: Can be fully tested by creating a script, editing it, creating multiple versions, viewing version history, comparing two versions, rolling back, and verifying the lifecycle (activate/deactivate/delete). Delivers core script management value.

**Acceptance Scenarios**:

1. **Given** an admin on the Scripts hub, **When** they click "Create Script" and fill in name/description/body, **Then** a new script is created in draft status with version 1
2. **Given** a draft script, **When** the admin activates it, **Then** the script status changes to active
3. **Given** an active script, **When** the admin deactivates it, **Then** the script status changes to inactive
4. **Given** a script with version 1, **When** the admin creates a new version with updated body and change description, **Then** version 2 is created and current_version is updated to 2
5. **Given** a script with 3 versions, **When** the admin views version history, **Then** all 3 versions are listed with version numbers, change descriptions, and creation dates
6. **Given** a script at version 3, **When** the admin rolls back, **Then** the script reverts to the previous version content
7. **Given** two versions selected, **When** the admin clicks "Compare", **Then** a side-by-side diff view shows additions, deletions, and changes between the two versions
8. **Given** a script with no active bindings, **When** the admin deletes it, **Then** the script is removed from the list

---

### User Story 2 - Hook Binding Management (Priority: P1)

An admin navigates to a script's detail page and sees a "Bindings" tab showing all hook bindings for that script. The admin creates a new binding by selecting a connector, choosing the hook phase (before/after), selecting an operation type (create/update/delete/enable/disable), setting the execution order, configuring the failure policy (abort/continue/retry with max retries), and setting a timeout. Bindings can be enabled/disabled, edited, reordered, and deleted. The admin can also view all bindings for a specific connector from the connector detail page.

**Why this priority**: Hook bindings are how scripts are connected to actual provisioning operations — they are the execution mechanism. Without bindings, scripts exist in isolation and cannot run during provisioning.

**Independent Test**: Can be tested by creating a binding between a script and a connector operation, verifying it appears in the bindings list, editing its failure policy, disabling it, and deleting it. Delivers the script-to-connector connection value.

**Acceptance Scenarios**:

1. **Given** a script detail page, **When** the admin opens the Bindings tab and clicks "Add Binding", **Then** a form appears with connector selector, hook phase, operation type, execution order, failure policy, retries, and timeout fields
2. **Given** the binding creation form, **When** the admin fills all fields and submits, **Then** the binding is created and appears in the bindings list
3. **Given** an existing binding, **When** the admin changes the failure policy from "abort" to "retry" with max 3 retries, **Then** the binding is updated with the new configuration
4. **Given** an enabled binding, **When** the admin disables it, **Then** the binding shows as disabled and is skipped during provisioning
5. **Given** multiple bindings for the same connector and operation, **When** the admin views them, **Then** they are ordered by execution_order
6. **Given** a binding, **When** the admin deletes it, **Then** the binding is removed
7. **Given** a connector detail page, **When** the admin views its script bindings, **Then** all bindings for that connector are listed

---

### User Story 3 - Script Templates (Priority: P2)

An admin navigates to the Templates tab on the Provisioning Scripts hub and sees a list of available templates organized by category (attribute mapping, value generation, conditional logic, data formatting, custom). The admin can create new templates with a name, description, category, template body, and placeholder annotations. From a template, the admin can instantiate a new script, which pre-fills the script body from the template. Templates can also be edited and deleted.

**Why this priority**: Templates accelerate script creation by providing starting points for common patterns. They are a productivity enhancement but not required for core functionality.

**Independent Test**: Can be tested by creating a template, viewing it, editing it, instantiating a script from it, and verifying the new script body matches the template. Delivers reusable script pattern value.

**Acceptance Scenarios**:

1. **Given** the Templates tab, **When** the admin views the list, **Then** templates are shown with name, category badge, and description
2. **Given** the Templates tab, **When** the admin filters by category "attribute_mapping", **Then** only attribute mapping templates are shown
3. **Given** the template create form, **When** the admin fills in name, description, category, body, and annotations, **Then** the template is created
4. **Given** a template, **When** the admin clicks "Use Template" or "Instantiate", **Then** a new script is created with the template body pre-filled
5. **Given** a template, **When** the admin edits its body, **Then** the template is updated (existing scripts are not affected)
6. **Given** a non-system template, **When** the admin deletes it, **Then** the template is removed

---

### User Story 4 - Testing & Validation (Priority: P2)

An admin working on a script can validate its syntax to check for errors before deploying it. The admin can also dry-run a script by providing a custom input context (JSON) and seeing the output, errors, and execution duration. For version-specific testing, the admin can dry-run a specific version of a script. Validation errors show line numbers and column positions so the admin can quickly locate and fix issues.

**Why this priority**: Testing and validation prevent broken scripts from being deployed to production connectors. This is a safety net that reduces risk but is not required for basic script operation.

**Independent Test**: Can be tested by validating a script with known syntax errors (verifying error locations are reported), validating a correct script (verifying success), and dry-running a script with sample context (verifying output). Delivers script quality assurance value.

**Acceptance Scenarios**:

1. **Given** a script body with syntax errors, **When** the admin clicks "Validate", **Then** validation errors are shown with line number, column, and error message
2. **Given** a valid script body, **When** the admin clicks "Validate", **Then** a success message is shown
3. **Given** a script and a JSON input context, **When** the admin clicks "Dry Run", **Then** the output, duration (ms), and success/failure status are displayed
4. **Given** a script that fails during dry-run, **When** the admin runs it, **Then** the error message and duration are shown
5. **Given** a script with multiple versions, **When** the admin selects a specific version and clicks "Dry Run", **Then** that version's code is executed with the provided context

---

### User Story 5 - Analytics & Execution Logs (Priority: P3)

An admin navigates to the Analytics tab on the Provisioning Scripts hub and sees a dashboard summary showing total scripts, active scripts, total executions, overall success rate, and average duration. The admin can drill into per-script analytics showing execution trends (daily), success/failure rates, duration percentiles (p95), and top errors. A separate execution logs section allows the admin to browse and filter individual execution records by script, status, and date, with detailed log views showing input context, output, error details, and duration.

**Why this priority**: Analytics and logs provide operational visibility and debugging capability. They are monitoring/observability features that enhance the admin experience but are not required for core script or binding functionality.

**Independent Test**: Can be tested by viewing the analytics dashboard (verifying summary metrics render), drilling into a script's analytics (verifying trend data and top errors), and browsing execution logs with filters. Delivers operational insight value.

**Acceptance Scenarios**:

1. **Given** the Analytics tab, **When** the admin views the dashboard, **Then** summary cards show total scripts, active count, total executions, success rate, and average duration
2. **Given** the dashboard, **When** the admin clicks on a script row, **Then** detailed per-script analytics are shown with daily trends chart and top errors
3. **Given** the execution logs view, **When** the admin filters by status "failure", **Then** only failed execution logs are shown
4. **Given** an execution log entry, **When** the admin clicks to view details, **Then** the full log is shown including input context, output, error, duration, and script version
5. **Given** the analytics dashboard, **When** there are no executions yet, **Then** the dashboard shows zero-state with appropriate messaging

---

### Edge Cases

- What happens when deleting a script that has active bindings? The system should prevent deletion or warn the admin.
- How does the system handle concurrent version creation for the same script? The backend should serialize version creation to prevent gaps.
- What happens when instantiating from a deleted template? The operation should fail gracefully with a clear message.
- How does dry-run behave when the script references external resources unavailable in test mode? The dry-run should return a meaningful error indicating the resource is unavailable.
- What happens when a binding references a connector that has been deleted? The binding should show as orphaned/broken with a warning.
- How does the system handle a script body that exceeds size limits? Validation should reject oversized scripts with a clear error.
- What happens when rolling back a script that only has one version? The rollback should fail with a message that there is no previous version to roll back to.
- How are audit events displayed when the actor no longer exists? The system should show the actor ID with a "deleted user" indicator.

## Requirements *(mandatory)*

### Functional Requirements

**Script Management (US1)**
- **FR-001**: System MUST allow admins to create provisioning scripts with a name, description, and script body
- **FR-002**: System MUST support script lifecycle states: draft, active, and inactive
- **FR-003**: System MUST allow admins to activate and deactivate scripts
- **FR-004**: System MUST allow admins to delete scripts
- **FR-005**: System MUST support script version control with sequential version numbers
- **FR-006**: System MUST allow admins to create new script versions with updated body and change description
- **FR-007**: System MUST allow admins to view the complete version history of a script
- **FR-008**: System MUST allow admins to view the content of any specific version
- **FR-009**: System MUST allow admins to roll back a script to a previous version
- **FR-010**: System MUST allow admins to compare two versions of a script with a diff view showing additions and deletions
- **FR-011**: System MUST display scripts in a filterable list with status and search capabilities
- **FR-012**: System MUST protect system scripts (is_system flag) from deletion

**Hook Bindings (US2)**
- **FR-013**: System MUST allow admins to create hook bindings linking a script to a connector operation
- **FR-014**: System MUST support hook phases: before and after
- **FR-015**: System MUST support operation types: create, update, delete, enable, and disable
- **FR-016**: System MUST support failure policies: abort, continue, and retry (with configurable max retries)
- **FR-017**: System MUST allow configurable timeout per binding (in seconds)
- **FR-018**: System MUST allow configurable execution order for bindings on the same connector/operation
- **FR-019**: System MUST allow admins to enable/disable individual bindings
- **FR-020**: System MUST allow admins to edit and delete bindings
- **FR-021**: System MUST allow viewing all bindings for a specific connector

**Script Templates (US3)**
- **FR-022**: System MUST allow admins to create script templates with name, description, category, body, and placeholder annotations
- **FR-023**: System MUST support template categories: attribute_mapping, value_generation, conditional_logic, data_formatting, and custom
- **FR-024**: System MUST allow admins to instantiate a new script from a template, pre-filling the script body
- **FR-025**: System MUST allow filtering templates by category and searching by name
- **FR-026**: System MUST allow admins to edit and delete non-system templates

**Testing & Validation (US4)**
- **FR-027**: System MUST allow admins to validate script syntax and report errors with line/column positions
- **FR-028**: System MUST allow admins to dry-run a script with a custom JSON input context
- **FR-029**: System MUST allow admins to dry-run a specific version of a script
- **FR-030**: System MUST display dry-run results including success/failure status, output, error, and duration

**Analytics & Logs (US5)**
- **FR-031**: System MUST display an analytics dashboard with total scripts, active count, total executions, success rate, and average duration
- **FR-032**: System MUST display per-script analytics with daily execution trends, success rate, duration percentiles, and top errors
- **FR-033**: System MUST allow browsing execution logs with filtering by script, status, and date
- **FR-034**: System MUST display execution log details including input context, output, error, duration, script version, and dry-run flag
- **FR-035**: System MUST display script audit events with action, actor, details, and timestamp

**Access Control**
- **FR-036**: All script management operations (create, edit, delete, activate, deactivate) MUST be restricted to admin users
- **FR-037**: All binding management operations (create, edit, delete) MUST be restricted to admin users
- **FR-038**: All template management operations (create, edit, delete) MUST be restricted to admin users

### Key Entities

- **Provisioning Script**: The automation script entity with name, description, current version, lifecycle status (draft/active/inactive), system flag, and audit metadata (created_by, timestamps)
- **Script Version**: An immutable snapshot of a script's body at a point in time, with sequential version number, change description, and creation metadata
- **Hook Binding**: The link between a script and a connector operation, defining when the script runs (before/after), for which operation (create/update/delete/enable/disable), with execution order, failure handling policy, retries, timeout, and enabled state
- **Script Template**: A reusable starting point for scripts, categorized by purpose (attribute mapping, value generation, conditional logic, data formatting, custom), with template body and placeholder annotations
- **Execution Log**: A record of a script execution, capturing input context, output, errors, duration, success/failure status, dry-run flag, and the script version used
- **Audit Event**: A record of administrative actions on scripts (create, edit, activate, delete, etc.) with actor and details

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create a script, add versions, and compare diffs within 3 minutes
- **SC-002**: Admins can bind a script to a connector operation in under 1 minute
- **SC-003**: Script validation provides actionable error feedback with line/column positions within 2 seconds
- **SC-004**: Dry-run execution completes and displays results within 5 seconds
- **SC-005**: Analytics dashboard loads with summary metrics and per-script data within 3 seconds
- **SC-006**: All 32 backend API endpoints have corresponding frontend UI coverage
- **SC-007**: All CRUD operations for scripts, bindings, and templates provide immediate visual feedback (success/error toasts)
- **SC-008**: Script version comparison displays clear visual diff showing additions and deletions
- **SC-009**: 100% of admin-only operations enforce role-based access control
- **SC-010**: All list views support pagination and filtering for datasets of any size

## Assumptions

- The backend API for all 32 endpoints is already implemented and functional
- Script body content is plain text (the backend handles interpretation/execution)
- Version numbers are sequential integers managed by the backend
- The diff comparison endpoint returns structured data suitable for rendering a side-by-side diff
- Connector list is available from the existing connectors API for the binding creation form
- Analytics data is computed server-side; the frontend only displays pre-aggregated metrics
- Execution logs are read-only from the frontend perspective
- Template instantiation creates a new draft script — it does not auto-activate
- The `is_system` flag on scripts and templates is set by the backend and cannot be changed via the frontend

# Feature Specification: NHI (Non-Human Identity) Management

**Feature Branch**: `006-nhi-management`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "NHI Management — Admin users manage non-human identities (Tools, Agents, Service Accounts) through the NHI section of the app, including type-specific CRUD, credential management, and lifecycle actions."

## User Scenarios & Testing

### User Story 1 - NHI Unified List (Priority: P1)

An admin navigates to the NHI section and sees a unified, paginated list of all non-human identities across all three types (Tools, Agents, Service Accounts). The list displays the NHI name, type indicator, lifecycle state badge, description, and creation date. The admin can filter by NHI type and lifecycle state using dropdown selectors.

**Why this priority**: The list is the entry point for all NHI management. Without it, admins cannot discover or navigate to any NHI. This is the foundational page for the entire feature.

**Independent Test**: Navigate to /nhi, see all NHI entries in a paginated table, filter by type and state.

**Acceptance Scenarios**:

1. **Given** the admin is logged in, **When** they navigate to /nhi, **Then** they see a paginated table with columns: Name, Type, Lifecycle State, Description, Created
2. **Given** NHIs of multiple types exist, **When** the admin selects "tool" from the type filter, **Then** only tools are displayed
3. **Given** NHIs in multiple states exist, **When** the admin selects "active" from the state filter, **Then** only active NHIs are displayed
4. **Given** no NHIs exist, **When** the admin visits /nhi, **Then** an empty state message "No identities found" is shown

---

### User Story 2 - Create Tool (Priority: P1)

An admin creates a new Tool NHI by navigating to /nhi/tools/create and filling out a form with the tool's name, description, category, input schema (JSON), output schema (JSON), and configuration options (requires approval, max calls per hour, provider).

**Why this priority**: Tools are the most common NHI type and creating them is the first action admins need after seeing the list.

**Independent Test**: Navigate to /nhi/tools/create, fill form, submit, see new tool in list.

**Acceptance Scenarios**:

1. **Given** the admin is on /nhi/tools/create, **When** they fill required fields (name, input_schema) and submit, **Then** the tool is created and they are redirected to the NHI list with a success notification
2. **Given** an empty form, **When** the admin submits, **Then** inline validation errors are shown for required fields
3. **Given** valid form data with optional fields (category, provider, max_calls_per_hour), **When** the admin submits, **Then** all fields are saved correctly

---

### User Story 3 - Create Agent (Priority: P1)

An admin creates a new Agent NHI by navigating to /nhi/agents/create and filling out a form with the agent's name, description, agent type, model provider, model name, max token lifetime, and approval settings.

**Why this priority**: Agents are the second most common NHI type and follow the same creation pattern as tools.

**Independent Test**: Navigate to /nhi/agents/create, fill form, submit, see new agent in list.

**Acceptance Scenarios**:

1. **Given** the admin is on /nhi/agents/create, **When** they fill required fields (name, agent_type) and submit, **Then** the agent is created and they are redirected to the NHI list with a success notification
2. **Given** an empty form, **When** the admin submits, **Then** inline validation errors are shown for required fields

---

### User Story 4 - Create Service Account (Priority: P1)

An admin creates a new Service Account NHI by navigating to /nhi/service-accounts/create and filling out a form with the account's name, description, purpose, and environment.

**Why this priority**: Service accounts complete the trio of NHI types that can be created.

**Independent Test**: Navigate to /nhi/service-accounts/create, fill form, submit, see new service account in list.

**Acceptance Scenarios**:

1. **Given** the admin is on /nhi/service-accounts/create, **When** they fill required fields (name, purpose) and submit, **Then** the service account is created and they are redirected to the NHI list with a success notification
2. **Given** an empty form, **When** the admin submits, **Then** inline validation errors are shown for required fields

---

### User Story 5 - NHI Detail & Edit (Priority: P1)

An admin clicks on an NHI name from the list and sees a detail page showing the base identity fields (name, description, type, state, dates) plus type-specific extension fields. The admin can edit the NHI's fields and save changes. The admin can also delete the NHI.

**Why this priority**: Viewing and editing are essential management operations that complete the CRUD cycle.

**Independent Test**: Click an NHI from the list, see all details, edit a field, save, verify change persists. Delete an NHI and verify removal.

**Acceptance Scenarios**:

1. **Given** a tool NHI exists, **When** the admin clicks its name, **Then** they see the tool's base fields and tool-specific fields (category, input_schema, requires_approval, etc.)
2. **Given** the admin is viewing an NHI, **When** they click Edit, change the description, and save, **Then** a success notification appears and the updated description is shown
3. **Given** the admin is viewing an NHI, **When** they click Delete and confirm, **Then** they are redirected to the NHI list with a success notification

---

### User Story 6 - Credential Management (Priority: P2)

An admin views and manages credentials for an NHI on its detail page. They can issue a new credential (the plaintext secret is displayed once and cannot be retrieved again), see existing credentials with masked values and expiry dates, rotate a credential (which invalidates the old one after a grace period and returns a new secret), and revoke a credential immediately.

**Why this priority**: Credentials are critical for NHI authentication but require the detail page (US5) to exist first.

**Independent Test**: Issue a credential, see it listed with masked value, rotate it, revoke it.

**Acceptance Scenarios**:

1. **Given** the admin is on an NHI detail page, **When** they click "Issue credential" and select a type, **Then** a new credential is created and the plaintext secret is displayed in a one-time-view dialog
2. **Given** the secret dialog is shown, **When** the admin closes it, **Then** the secret can never be retrieved again (only masked value shown in list)
3. **Given** an existing credential, **When** the admin clicks "Rotate", **Then** a new credential is issued, the old credential enters a grace period, and the new secret is displayed once
4. **Given** an existing credential, **When** the admin clicks "Revoke" and confirms, **Then** the credential is immediately deactivated and no longer usable

---

### User Story 7 - NHI Lifecycle Actions (Priority: P2)

An admin performs lifecycle transitions on an NHI from its detail page. Available actions depend on the current state: Activate (from inactive/suspended), Suspend (from active, with optional reason), Deprecate (from non-archived), and Archive (from deprecated only, terminal).

**Why this priority**: Lifecycle management builds on the detail page and is essential for operational control.

**Independent Test**: Activate an inactive NHI, suspend an active NHI with reason, deprecate it, archive it.

**Acceptance Scenarios**:

1. **Given** an inactive NHI, **When** the admin clicks "Activate", **Then** the state changes to "active" with a success notification
2. **Given** an active NHI, **When** the admin clicks "Suspend" and optionally enters a reason, **Then** the state changes to "suspended" with a success notification
3. **Given** a non-archived NHI, **When** the admin clicks "Deprecate", **Then** the state changes to "deprecated" with a success notification
4. **Given** a deprecated NHI, **When** the admin clicks "Archive" and confirms, **Then** the state changes to "archived" (terminal) with a success notification, and no further lifecycle actions are available
5. **Given** an archived NHI, **When** the admin views its detail page, **Then** no lifecycle action buttons are shown

---

### Edge Cases

- What happens when the admin tries to delete an NHI that has active credentials? The system proceeds with deletion (backend handles credential cleanup).
- What happens when the admin issues a credential and navigates away before copying the secret? The secret is permanently lost and a new credential must be issued.
- What happens when a credential rotation grace period overlaps with another rotation? Each rotation creates an independent credential; multiple can coexist.
- What happens when filtering by both type and state simultaneously? Both filters are applied (AND logic), and the result shows only matching entries.
- What happens when the admin tries to perform an invalid lifecycle transition? The action button is not shown for invalid transitions.
- What happens when the input_schema JSON for a tool is malformed? Client-side validation warns the user before submission.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a unified paginated list of all NHI types at /nhi with columns for name (as link), type, lifecycle state (badge), description (truncated), and created date
- **FR-002**: System MUST allow filtering the NHI list by NHI type (tool, agent, service_account) and lifecycle state (active, inactive, suspended, deprecated, archived)
- **FR-003**: System MUST provide type-specific creation forms at /nhi/tools/create, /nhi/agents/create, and /nhi/service-accounts/create
- **FR-004**: System MUST validate required fields on creation forms: name for all types, input_schema for tools, agent_type for agents, purpose for service accounts
- **FR-005**: System MUST display type-specific detail pages at /nhi/tools/[id], /nhi/agents/[id], and /nhi/service-accounts/[id] showing both base and type-specific fields
- **FR-006**: System MUST allow editing NHI fields via an inline edit mode on the detail page
- **FR-007**: System MUST allow deleting an NHI with a confirmation dialog
- **FR-008**: System MUST display a credentials section on NHI detail pages showing existing credentials with masked secret values, credential type, and expiry dates
- **FR-009**: System MUST allow issuing new credentials with a selectable type (api_key, secret, certificate) and optional validity period
- **FR-010**: System MUST display the issued credential secret exactly once in a dialog, with a copy button and clear warning that it cannot be retrieved again
- **FR-011**: System MUST allow rotating a credential, displaying the new secret once and showing the grace period for the old credential
- **FR-012**: System MUST allow revoking a credential with a confirmation dialog
- **FR-013**: System MUST show lifecycle action buttons on the detail page that correspond to valid transitions from the current state
- **FR-014**: System MUST support lifecycle transitions: activate (inactive→active, suspended→active), suspend (active→suspended with optional reason), deprecate (non-archived→deprecated), archive (deprecated→archived)
- **FR-015**: System MUST hide all lifecycle action buttons and edit controls when an NHI is in the archived state
- **FR-016**: System MUST display distinct lifecycle state badges with semantic colors: active (green), inactive (outline), suspended (orange), deprecated (amber), archived (gray)
- **FR-017**: System MUST show a "Create" dropdown or navigation in the NHI list header allowing selection of which type to create (Tool, Agent, Service Account)
- **FR-018**: System MUST display an empty state message when no NHIs match the current filters

### Key Entities

- **NHI Identity**: A non-human identity with a type (tool, agent, service_account), lifecycle state, name, description, owner, and timestamps. The base entity shared by all types.
- **Tool Extension**: Additional fields for tool NHIs including category, input/output schemas, approval requirements, rate limits, and provider info.
- **Agent Extension**: Additional fields for agent NHIs including agent type, model provider/name/version, token lifetime, approval requirements.
- **Service Account Extension**: Additional fields for service account NHIs including purpose and environment.
- **Credential**: An authentication credential linked to an NHI, with a type (api_key, secret, certificate), validity period, active status, and hashed secret. The plaintext secret is only available at creation or rotation time.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can create any NHI type (tool, agent, service account) and see it in the unified list within 3 actions (navigate, fill form, submit)
- **SC-002**: All 5 lifecycle states display visually distinct badges that are recognizable at a glance in the list view
- **SC-003**: Credential issuance displays the secret exactly once, with a copy mechanism, and the secret is never retrievable afterward
- **SC-004**: All lifecycle transitions that are valid from the current state are available as action buttons; invalid transitions are never shown
- **SC-005**: The NHI list supports pagination and dual-filter (type + state) with results updating without full page reload
- **SC-006**: Admin can complete the full NHI lifecycle (create → activate → suspend → deprecate → archive) in under 2 minutes
- **SC-007**: The credential section shows all credentials for an NHI with masked values, and supports issue, rotate, and revoke operations

## Assumptions

- Only admin users have access to NHI management (enforced by existing auth middleware)
- The backend NHI API is available and functional at /nhi endpoints
- NHI pagination uses `{ data, total, limit, offset }` format (different from both users and governance APIs)
- Credential secrets use secure random generation on the backend; the frontend only displays them
- The input_schema field for tools accepts any valid JSON object
- NHI identities start in "inactive" lifecycle state upon creation
- The existing DataTable component is reused for the unified NHI list
- The sidebar already has an "NHI" navigation entry pointing to /nhi

## Scope

### In Scope

- Unified NHI list with type and state filtering
- Type-specific creation forms (tool, agent, service account)
- Type-specific detail pages with edit and delete
- Credential management (issue, list, rotate, revoke) on detail pages
- Lifecycle actions (activate, suspend, deprecate, archive)
- Lifecycle state badges with semantic colors

### Out of Scope

- NHI permission assignments (who can use which NHI)
- Audit logging of NHI operations (handled by backend)
- Automated lifecycle transitions (e.g., auto-suspend on inactivity)
- Certification campaigns for NHI review
- Bulk operations on multiple NHIs
- NHI-to-NHI relationships (e.g., agent uses tool)
- Risk scoring display or management

## Dependencies

- Feature 004 (Data Table + Users): Provides the reusable DataTable component
- Feature 005 (Personas): Provides pattern for lifecycle badges and lifecycle action dialogs
- Backend NHI API endpoints must be available

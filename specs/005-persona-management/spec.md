# Feature Specification: Persona & Archetype Management

**Feature Branch**: `005-persona-management`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "Persona & Archetype Management — Admin users manage persona archetypes and personas through the governance section of the app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Archetype List (Priority: P1)

As an admin, I want to see all persona archetypes in a paginated, searchable list so I can browse and find templates for creating personas.

**Why this priority**: Archetypes are the foundation for personas. Without the ability to see available archetypes, admins cannot create or manage personas. This is the entry point for the entire feature.

**Independent Test**: Navigate to /personas/archetypes and see a data table with archetype records. Search by name, paginate through results.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin, **When** I navigate to /personas/archetypes, **Then** I see a data table listing archetypes with columns: Name, Description, Status (Active/Inactive), Personas Count, Created Date
2. **Given** the archetype list has more than one page of results, **When** I click "Next", **Then** the table updates with the next page
3. **Given** I am on the archetype list, **When** I type a name in the search field, **Then** the list filters to show only archetypes matching that name

---

### User Story 2 - Create Archetype (Priority: P1)

As an admin, I want to create a new persona archetype so I can define a template that personas will be based on.

**Why this priority**: Without the ability to create archetypes, no personas can be created. This is a prerequisite for all persona functionality.

**Independent Test**: Navigate to /personas/archetypes/create, fill the form, submit, and verify the new archetype appears in the list.

**Acceptance Scenarios**:

1. **Given** I am on the archetype list, **When** I click "Create archetype", **Then** I am navigated to /personas/archetypes/create with a form
2. **Given** I am on the create form, **When** I fill in name, naming pattern, and submit, **Then** a new archetype is created, I am redirected to the list, and a success message appears
3. **Given** I am on the create form, **When** I submit without required fields, **Then** I see inline validation errors for name and naming pattern
4. **Given** I am on the create form, **When** I fill in the optional lifecycle policy fields (default validity days, max validity days, notification days), **Then** these values are saved with the archetype

---

### User Story 3 - Archetype Detail & Edit (Priority: P1)

As an admin, I want to view and edit archetype details, activate or deactivate an archetype, and delete an archetype so I can manage template configurations.

**Why this priority**: Admins need to maintain and update archetype definitions as organizational needs change. Activation control determines which archetypes are available for persona creation.

**Independent Test**: Click an archetype from the list, view its details, edit fields, toggle active status, delete with confirmation.

**Acceptance Scenarios**:

1. **Given** I am on the archetype list, **When** I click an archetype name, **Then** I am navigated to /personas/archetypes/[id] showing full archetype details
2. **Given** I am viewing an archetype, **When** I click "Edit", **Then** I can modify the name, description, naming pattern, and lifecycle policy fields
3. **Given** I am viewing an active archetype, **When** I click "Deactivate", **Then** the archetype status changes to Inactive and it is no longer available for new personas
4. **Given** I am viewing an inactive archetype, **When** I click "Activate", **Then** the archetype status changes to Active
5. **Given** I am viewing an archetype, **When** I click "Delete" and confirm, **Then** the archetype is deleted and I am redirected to the list

---

### User Story 4 - Persona List (Priority: P1)

As an admin, I want to see all personas in a paginated list with status badges and filters so I can monitor persona assignments across the organization.

**Why this priority**: The persona list is the primary view for persona management. Status badges provide at-a-glance information about persona health (expired, suspended, etc.).

**Independent Test**: Navigate to /personas and see a data table with persona records, filter by status and archetype.

**Acceptance Scenarios**:

1. **Given** I am logged in as an admin, **When** I navigate to /personas, **Then** I see a data table with columns: Persona Name, Display Name, Archetype, Physical User, Status, Valid From, Valid Until
2. **Given** personas exist with different statuses, **When** I view the list, **Then** each persona shows a color-coded status badge (draft, active, expiring, expired, suspended, archived)
3. **Given** I am on the persona list, **When** I select a status from the filter dropdown, **Then** the list shows only personas with that status
4. **Given** I am on the persona list, **When** I select an archetype from the filter dropdown, **Then** the list shows only personas using that archetype

---

### User Story 5 - Create Persona (Priority: P1)

As an admin, I want to create a new persona by selecting an archetype and a physical user so I can assign a role-based identity to a user.

**Why this priority**: Creating personas is the core action of this feature. Without it, the entire persona system is unusable.

**Independent Test**: Navigate to /personas/create, select an archetype and user, submit, and verify the persona appears in the list.

**Acceptance Scenarios**:

1. **Given** I am on the persona list, **When** I click "Create persona", **Then** I am navigated to /personas/create with a form
2. **Given** I am on the create form, **When** I select an archetype and a physical user and submit, **Then** a new persona is created in "draft" status and I am redirected to the persona list with a success message
3. **Given** I am on the create form, **When** I submit without selecting an archetype or user, **Then** I see validation errors
4. **Given** I am on the create form, **When** I optionally set validity dates and submit, **Then** the persona is created with those dates

---

### User Story 6 - Persona Detail & Edit (Priority: P2)

As an admin, I want to view detailed persona information including inherited and overridden attributes, and update the persona display name and validity dates.

**Why this priority**: Persona details provide the full picture of a persona's configuration. While important, the core CRUD flow (list + create) is sufficient for an MVP.

**Independent Test**: Click a persona from the list, view all details including attributes section, edit display name and validity.

**Acceptance Scenarios**:

1. **Given** I am on the persona list, **When** I click a persona name, **Then** I am navigated to /personas/[id] showing full persona details: persona name, display name, archetype, physical user, status, validity dates, created/updated timestamps
2. **Given** I am viewing a persona, **When** I look at the attributes section, **Then** I see inherited attributes (from the physical user), overrides, and persona-specific attributes displayed in organized groups
3. **Given** I am viewing a persona, **When** I click "Edit", **Then** I can modify the display name, attribute overrides, and validity end date
4. **Given** I am editing a persona, **When** I save changes, **Then** the persona is updated and I see a success message

---

### User Story 7 - Persona Lifecycle Actions (Priority: P2)

As an admin, I want to manage persona lifecycle transitions (activate, deactivate, archive) so I can control which personas are active and which are retired.

**Why this priority**: Lifecycle management ensures personas are properly controlled. Deactivation and archiving require reasons for auditability.

**Independent Test**: From a persona detail page, activate a draft persona, deactivate an active persona (with reason), archive a persona (with reason).

**Acceptance Scenarios**:

1. **Given** I am viewing a persona in "draft" status, **When** I click "Activate", **Then** the persona status changes to "active" and a success message appears
2. **Given** I am viewing an active persona, **When** I click "Deactivate", **Then** a dialog appears asking for a reason (minimum 5 characters)
3. **Given** I have entered a deactivation reason, **When** I confirm, **Then** the persona status changes to "suspended" and a success message appears
4. **Given** I am viewing a persona (any non-archived status), **When** I click "Archive", **Then** a dialog appears asking for a reason (minimum 5 characters)
5. **Given** I have entered an archive reason, **When** I confirm, **Then** the persona status changes to "archived" (terminal state) and a success message appears
6. **Given** I am viewing a suspended persona, **When** I click "Activate", **Then** the persona returns to "active" status

---

### Edge Cases

- What happens when an admin tries to create a persona with an inactive archetype? The system shows only active archetypes in the selection.
- What happens when an admin tries to delete an archetype that has associated personas? The system displays the backend error message in a toast.
- What happens when a persona's validity end date has passed? The system displays it with "expired" status badge. Lifecycle transition happens on the backend.
- What happens when an admin enters a deactivation or archive reason shorter than 5 characters? The system shows an inline validation error requiring at least 5 characters.
- What happens when the archetype or persona list is empty? The system shows an appropriate empty state message.
- What happens when a network error occurs during a lifecycle action? The system shows an error toast with the failure message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated list of archetypes at /personas/archetypes with columns for name, description, active status, persona count, and creation date
- **FR-002**: System MUST allow admins to search archetypes by name with a debounced search input
- **FR-003**: System MUST allow admins to create an archetype with required fields (name, naming pattern) and optional fields (description, lifecycle policy settings)
- **FR-004**: System MUST allow admins to view full archetype details on a dedicated detail page
- **FR-005**: System MUST allow admins to edit archetype fields (name, description, naming pattern, lifecycle policy)
- **FR-006**: System MUST allow admins to activate and deactivate archetypes
- **FR-007**: System MUST allow admins to delete an archetype with a confirmation dialog
- **FR-008**: System MUST display a paginated list of personas at /personas with columns for persona name, display name, archetype, physical user, status, and validity dates
- **FR-009**: System MUST display color-coded status badges for all six persona statuses: draft (neutral), active (green), expiring (amber), expired (red), suspended (orange), archived (gray)
- **FR-010**: System MUST allow admins to filter personas by status and by archetype
- **FR-011**: System MUST allow admins to create a persona by selecting an active archetype and a physical user, with optional validity dates
- **FR-012**: System MUST allow admins to view detailed persona information including inherited, overridden, and persona-specific attributes
- **FR-013**: System MUST allow admins to edit a persona's display name, attribute overrides, and validity end date
- **FR-014**: System MUST allow admins to activate a persona (from draft or suspended status)
- **FR-015**: System MUST require a reason (minimum 5 characters) when deactivating a persona and display a dialog for input
- **FR-016**: System MUST require a reason (minimum 5 characters) when archiving a persona and display a dialog for input
- **FR-017**: System MUST treat "archived" as a terminal state — once archived, a persona cannot be reactivated
- **FR-018**: System MUST show only active archetypes in the archetype selection when creating a persona
- **FR-019**: System MUST reuse the existing DataTable component for both archetype and persona lists with server-side pagination
- **FR-020**: System MUST display validation errors inline for form fields and show toast notifications for action results

### Key Entities

- **Archetype**: A template defining how personas are configured. Has a name, description, naming pattern (for generating persona names), lifecycle policy (validity and notification settings), and active/inactive status. One archetype can have many personas.
- **Persona**: A role-based identity assigned to a physical user based on an archetype. Has a generated persona name, display name, status (draft/active/expiring/expired/suspended/archived), validity period, and attribute overrides. Belongs to one archetype and one physical user.
- **Lifecycle Policy**: Configuration embedded in an archetype that defines default validity duration, maximum validity duration, notification timing before expiry, and auto-extension rules.
- **Persona Attributes**: Three categories of attributes on a persona — inherited (propagated from the physical user), overrides (persona-specific values overriding inherited ones), and persona-only (attributes unique to the persona).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create an archetype and then create a persona using that archetype in under 3 minutes
- **SC-002**: Admins can locate any persona by filtering by status or archetype within 10 seconds
- **SC-003**: All six persona status states are visually distinct and identifiable at a glance in the list view
- **SC-004**: Lifecycle actions (activate, deactivate, archive) complete and reflect the updated status within 2 seconds
- **SC-005**: All form validations prevent invalid data submission and provide clear error messages within 1 second
- **SC-006**: Paginated lists load and display results within 2 seconds for lists of up to 1000 items
- **SC-007**: 100% of archetype CRUD operations (create, read, update, delete) function correctly with appropriate confirmation and feedback

## Assumptions

- Only admin users with appropriate permissions can manage archetypes and personas. Permission enforcement is handled by the backend.
- The sidebar navigation already has entries for "Personas" and "Archetypes" or will be added as part of this feature.
- Physical user selection during persona creation will use a simple dropdown or search field listing users from the existing user management system.
- Attribute overrides during persona creation are optional and can be provided as key-value pairs.
- The "expiring" status is determined server-side (based on validity dates and notification window) — the frontend only displays it.
- Archetype lifecycle policy fields use sensible defaults: 365 days default validity, 730 days max validity, 7 days notification before expiry.

## Scope Boundaries

### In Scope

- Archetype CRUD (create, read, update, delete) with list pagination and search
- Archetype activate/deactivate toggle
- Persona create, read, update with list pagination and filters
- Persona lifecycle actions: activate, deactivate (with reason), archive (with reason)
- Status badges for all six persona states
- Persona detail view with grouped attributes display
- Sidebar navigation entries for Personas and Archetypes

### Out of Scope

- Context switching (switching active identity to a persona)
- Persona expiration reports and batch operations
- Entitlement management on personas
- Attribute propagation triggers
- Audit log viewing
- Persona extension workflows
- Archetype attribute mapping configuration UI (complex JSON — to be addressed in a future feature)
- Archetype default entitlements configuration UI

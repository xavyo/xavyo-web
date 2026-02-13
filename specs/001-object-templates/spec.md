# Feature Specification: Object Templates & Lifecycle Rule Automation

**Feature Branch**: `001-object-templates`
**Created**: 2026-02-12
**Status**: Draft
**Input**: Phase 040: Object Templates & Lifecycle Rule Automation — Admin UI for defining object templates that automatically apply rules (defaults, validations, normalizations, computed values) to users, roles, or entitlements during their lifecycle.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Template CRUD (Priority: P1)

As a governance administrator, I need to create, list, edit, and delete object templates so that I can define reusable rule sets that automatically apply to identity objects during their lifecycle.

Each template targets a specific object type (user, role, or entitlement), has a priority for conflict ordering, and can be toggled active/inactive. The template list supports filtering by object type and active status to quickly find relevant templates.

**Why this priority**: Templates are the foundational entity — rules, scopes, merge policies, and simulation all depend on a template existing first. Without template CRUD, no other functionality is possible.

**Independent Test**: Can be fully tested by creating a template with name/description/object_type/priority, verifying it appears in the list, editing its properties, and deleting it.

**Acceptance Scenarios**:

1. **Given** an admin on the Object Templates page, **When** they click "Create Template" and submit a form with name, description, object_type (user), priority (10), and is_active (true), **Then** the template is created and appears in the template list with the correct details.
2. **Given** a list of templates exists, **When** the admin filters by object_type "role", **Then** only templates targeting roles are displayed.
3. **Given** a list of templates exists, **When** the admin filters by is_active "true", **Then** only active templates are displayed.
4. **Given** an existing template, **When** the admin navigates to its detail page and clicks "Edit", **Then** they can modify the name, description, priority, and is_active fields, and changes persist after save.
5. **Given** an existing template, **When** the admin clicks "Delete" and confirms, **Then** the template and its associated rules and scopes are removed, and the admin is redirected to the template list.

---

### User Story 2 - Template Rules Management (Priority: P1)

As a governance administrator, I need to add, edit, reorder, and delete rules within a template so that I can define the specific transformations (set defaults, validate constraints, normalize data, compute derived values) that fire when matching identity objects are created or modified.

Each rule targets a specific attribute, has a condition that determines when it fires, an action type (set_default, validate, normalize, compute), an action value defining what happens, and an order for sequencing within the template.

**Why this priority**: Rules are the core mechanism that gives templates their power. A template without rules has no effect, so rule management is equally critical as template CRUD.

**Independent Test**: Can be fully tested by opening a template's Rules tab, adding a rule with attribute/condition/action_type/action_value/order, editing it, reordering, and deleting it.

**Acceptance Scenarios**:

1. **Given** a template detail page with the Rules tab active, **When** the admin adds a rule with attribute "department", condition "is_empty", action_type "set_default", action_value "Engineering", and order 1, **Then** the rule appears in the rules list with correct details.
2. **Given** a template with multiple rules, **When** the admin edits a rule's action_value, **Then** the change is saved and reflected in the rules list.
3. **Given** a template with multiple rules, **When** the admin deletes a rule and confirms, **Then** the rule is removed from the list.
4. **Given** a template with rules at orders 1, 2, 3, **When** the admin views the Rules tab, **Then** rules are displayed sorted by their order field.

---

### User Story 3 - Template Scopes (Priority: P2)

As a governance administrator, I need to define scopes on a template to control which objects it applies to, so that templates can be targeted to specific departments, roles, locations, or applied universally.

Each scope has a type (department, role, location, all) and a value. Multiple scopes can be added to a template. When scope_type is "all", no scope_value is needed.

**Why this priority**: Scopes refine template targeting but are not required for basic functionality — a template with no scopes can still be simulated and tested. Scopes add precision for production use.

**Independent Test**: Can be fully tested by opening a template's Scopes tab, adding scopes of different types, verifying they appear in the list, and deleting them.

**Acceptance Scenarios**:

1. **Given** a template detail page with the Scopes tab active, **When** the admin adds a scope with scope_type "department" and scope_value "Engineering", **Then** the scope appears in the scopes list.
2. **Given** a template detail page, **When** the admin adds a scope with scope_type "all", **Then** the scope is created without requiring a scope_value.
3. **Given** a template with multiple scopes, **When** the admin deletes a scope, **Then** it is removed from the list.

---

### User Story 4 - Merge Policy & Simulation (Priority: P2)

As a governance administrator, I need to set a merge policy for conflict resolution when multiple templates match the same object, and I need to simulate a template against sample data to preview its effect before activation.

The merge policy strategy can be: first_match, last_match, highest_priority, or merge_all. Simulation accepts a JSON sample data object and returns the original data, transformed data, list of rules applied with before/after values, and any warnings.

**Why this priority**: Merge policy and simulation are essential for safe deployment of templates in production but are not needed for initial template definition. They add a safety net for administrators.

**Independent Test**: Can be fully tested by setting a merge policy on a template and running a simulation with sample JSON data, then verifying the transformation preview.

**Acceptance Scenarios**:

1. **Given** a template detail page with the Simulation tab active, **When** the admin selects merge policy "highest_priority" and saves, **Then** the merge policy is updated and displayed correctly.
2. **Given** a template with rules, **When** the admin enters sample JSON data (e.g., `{"department": "", "title": "Engineer"}`) and clicks "Simulate", **Then** the system displays original data, transformed data, rules applied with before/after values, and any warnings.
3. **Given** a template with no rules, **When** the admin runs a simulation, **Then** the transformed data matches the original data with an empty rules_applied list.
4. **Given** invalid JSON in the sample data field, **When** the admin clicks "Simulate", **Then** a validation error is shown.

---

### User Story 5 - Template Lifecycle (Priority: P3)

As a governance administrator, I need to quickly enable or disable templates, view their rules and scopes counts at a glance, and manage priority ordering so that I can control which templates are active in production and in what order they evaluate.

**Why this priority**: Lifecycle management is a convenience layer on top of existing CRUD functionality. Admins can already toggle is_active via edit, but dedicated enable/disable actions and summary counts improve the operational experience.

**Independent Test**: Can be fully tested by toggling a template's active status from the detail page, verifying the status badge changes, and confirming rules_count and scopes_count display correctly.

**Acceptance Scenarios**:

1. **Given** an active template, **When** the admin clicks "Disable", **Then** the template status changes to inactive and the status badge updates.
2. **Given** an inactive template, **When** the admin clicks "Enable", **Then** the template status changes to active and the status badge updates.
3. **Given** a template with 3 rules and 2 scopes, **When** the admin views its detail page, **Then** the rules count (3) and scopes count (2) are displayed in the details section.

---

### Edge Cases

- What happens when a template is deleted that has rules and scopes? All associated rules and scopes are cascade-deleted by the backend.
- What happens when the admin enters invalid JSON in the simulation sample data field? A client-side validation error is shown before the request is sent.
- What happens when two templates have the same priority? The merge policy strategy determines conflict resolution; the UI allows same-priority templates without error.
- What happens when the admin tries to create a rule with a duplicate order number within the same template? The backend accepts it (order is advisory for display sorting), and the UI shows them in order sequence.
- What happens when no scopes are defined on a template? The template exists but its applicability is determined by the backend's default scoping logic.
- What happens when the admin creates a scope with scope_type "all" and provides a scope_value? The form disables the scope_value field when "all" is selected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to create object templates with name, description, object_type (user, role, or entitlement), priority (integer), and is_active (boolean).
- **FR-002**: System MUST display a paginated list of templates with filtering by object_type and active status.
- **FR-003**: System MUST allow administrators to view a template's full details including rules count, scopes count, merge policy, and timestamps.
- **FR-004**: System MUST allow administrators to edit a template's name, description, priority, and is_active status.
- **FR-005**: System MUST allow administrators to delete a template with confirmation.
- **FR-006**: System MUST allow administrators to add rules to a template with attribute, condition, action_type (set_default, validate, normalize, compute), action_value, and order.
- **FR-007**: System MUST allow administrators to edit and delete individual rules within a template.
- **FR-008**: System MUST display rules sorted by their order field within a template.
- **FR-009**: System MUST allow administrators to add scopes to a template with scope_type (department, role, location, all) and scope_value.
- **FR-010**: System MUST allow administrators to delete individual scopes from a template.
- **FR-011**: System MUST allow administrators to set a merge policy strategy (first_match, last_match, highest_priority, merge_all) on a template.
- **FR-012**: System MUST allow administrators to simulate a template against user-provided sample JSON data and display the original data, transformed data, rules applied with before/after values, and warnings.
- **FR-013**: System MUST allow administrators to enable and disable templates from the detail page.
- **FR-014**: System MUST restrict all template management operations to users with admin roles.
- **FR-015**: System MUST validate that sample data for simulation is valid JSON before sending to the backend.

### Key Entities

- **ObjectTemplate**: A named configuration targeting a specific object type (user, role, entitlement) with a priority, active status, merge policy, and associated rules and scopes. Key attributes: id, name, description, object_type, priority, is_active, merge_policy, rules_count, scopes_count.
- **TemplateRule**: An individual transformation rule within a template. Targets a specific attribute with a condition that triggers an action (set_default, validate, normalize, compute). Key attributes: id, template_id, attribute, condition, action_type, action_value, order.
- **TemplateScope**: A targeting constraint that determines which objects a template applies to. Key attributes: id, template_id, scope_type (department, role, location, all), scope_value.
- **MergePolicy**: The conflict resolution strategy when multiple templates match the same object. Values: first_match, last_match, highest_priority, merge_all.
- **SimulationResult**: The preview output showing how a template would transform sample data. Contains original_data, transformed_data, rules_applied (with before/after per rule), and warnings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a new object template in under 1 minute with all required fields.
- **SC-002**: Administrators can add a rule to a template in under 30 seconds.
- **SC-003**: Template list page loads and displays results within 2 seconds, including filter application.
- **SC-004**: Simulation of a template against sample data returns a preview within 3 seconds.
- **SC-005**: All template management operations (CRUD, rules, scopes, merge policy, simulation) are accessible only to admin users.
- **SC-006**: 100% of template CRUD operations, rule management, scope management, merge policy changes, and simulations complete successfully without errors for valid input.
- **SC-007**: Template detail page displays all four tabs (Details, Rules, Scopes, Simulation) and navigating between them preserves template context.

## Assumptions

- The backend API for all 14 object template endpoints is already implemented and functional.
- Template deletion cascades to remove associated rules and scopes on the backend.
- The merge_policy field on the template detail response contains the current strategy as a string.
- Simulation is a stateless preview operation — it does not persist results or modify the template.
- The order field on rules is an integer used for display sorting; the backend does not enforce uniqueness.
- Admin role check uses the existing hasAdminRole() utility that checks both admin and super_admin roles.

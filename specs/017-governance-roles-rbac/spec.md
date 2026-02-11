# Feature Specification: Governance Roles & RBAC

**Feature Branch**: `017-governance-roles-rbac`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Governance Roles & RBAC (Phase 017): Implement complete UI coverage for the backend governance role management, role hierarchy, entitlements mapping, and parametric roles API endpoints."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Role CRUD Management (Priority: P1)

As an admin, I need to create, view, edit, and delete governance roles so that I can define the organizational access structure. I can see all roles in a list with pagination, create new roles with a name, description, and optional parent role for hierarchy placement, edit existing role details, and delete roles that are no longer needed.

**Why this priority**: Roles are the foundational building block of RBAC. Without role CRUD, no other role-related features (hierarchy, entitlements, parameters) can function. This is the MVP slice.

**Independent Test**: Can be fully tested by creating a role, viewing it in the list, editing its name/description, and deleting it. Delivers immediate value as a role catalog for the organization.

**Acceptance Scenarios**:

1. **Given** I am an admin on the governance roles page, **When** I click "Create Role" and fill in name "Engineering" with description "Engineering department access", **Then** the role appears in the role list.
2. **Given** a role "Engineering" exists, **When** I navigate to its detail page and edit the name to "Engineering Team", **Then** the updated name is reflected in the list and detail views.
3. **Given** a role "Engineering Team" exists with no children or entitlements, **When** I click delete and confirm, **Then** the role is removed from the list.
4. **Given** I am on the roles list page, **When** I view the list, **Then** I see role names, descriptions, hierarchy depth, abstract status, and creation date with pagination controls.
5. **Given** I try to create a role with an empty name, **When** I submit the form, **Then** I see a validation error and the role is not created.

---

### User Story 2 - Role Hierarchy Visualization & Management (Priority: P2)

As an admin, I need to see roles organized in a tree hierarchy and manage parent-child relationships. I can toggle between a flat list view and a tree view, move roles to different parents (re-parenting), and view the ancestry/descendants of any role. I can also run impact analysis to understand how changes to a role affect users and entitlements.

**Why this priority**: Hierarchy is the core value proposition of governance roles — without it, roles are just flat labels. However, it depends on P1 (roles must exist first).

**Independent Test**: Can be tested by creating 3+ roles in a parent-child-grandchild hierarchy, viewing the tree, moving a child to a different parent, and verifying the tree updates correctly.

**Acceptance Scenarios**:

1. **Given** roles exist in a parent-child hierarchy (e.g., Engineering > Frontend, Engineering > Backend), **When** I switch to tree view, **Then** I see an indented tree with Engineering as parent and Frontend/Backend as children.
2. **Given** a role "Frontend" is a child of "Engineering", **When** I move "Frontend" to be a child of "Product" instead, **Then** the tree view reflects the new hierarchy and the role's depth is updated.
3. **Given** a role "Engineering" has children and grandchildren, **When** I view its impact analysis, **Then** I see the count of descendant roles and affected users.
4. **Given** a role "Frontend" has a parent "Engineering", **When** I view the ancestors of "Frontend", **Then** I see "Engineering" listed as an ancestor.
5. **Given** I try to move a role to create a circular hierarchy, **Then** I see an error message and the hierarchy remains unchanged.

---

### User Story 3 - Role Entitlement Mapping (Priority: P3)

As an admin, I need to assign entitlements (permissions) to roles and see both direct and inherited entitlements. I can add existing entitlements to a role, remove entitlement mappings, view the effective entitlements a role grants (including those inherited from parent roles), and trigger recomputation when hierarchy changes occur.

**Why this priority**: Entitlement mapping connects roles to actual access permissions. It's the mechanism that makes roles meaningful for access control, but requires both roles (P1) and optionally hierarchy (P2) to be in place.

**Independent Test**: Can be tested by creating a role, adding an entitlement to it, viewing direct vs effective entitlements, and removing the entitlement.

**Acceptance Scenarios**:

1. **Given** a role "Engineering" exists and entitlements exist in the system, **When** I add entitlement "Repository Access" to the role, **Then** it appears in the role's direct entitlements list.
2. **Given** role "Frontend" inherits from "Engineering" which has entitlement "Repository Access", **When** I view "Frontend" effective entitlements, **Then** I see "Repository Access" marked as inherited, along with counts of direct vs inherited entitlements.
3. **Given** role "Engineering" has entitlement "Repository Access" directly assigned, **When** I remove it, **Then** it no longer appears in direct entitlements and is no longer inherited by child roles.
4. **Given** I've made hierarchy changes, **When** I trigger entitlement recomputation for a role, **Then** the effective entitlements are recalculated and the counts update.

---

### User Story 4 - Parametric Role Configuration (Priority: P4)

As an admin, I need to define parameters on roles that allow for flexible, context-specific access grants. I can add parameters with types (string, integer, boolean, date, enum), set default values and constraints (e.g., allowed values for enums), mark parameters as required, and set display ordering. I can also validate parameter values before creating assignments.

**Why this priority**: Parameters add sophistication to the RBAC model by enabling context-dependent roles. This is an advanced feature that builds on the core role functionality.

**Independent Test**: Can be tested by adding parameters of different types to a role, editing parameter defaults, validating parameter values, and removing parameters.

**Acceptance Scenarios**:

1. **Given** role "Engineering" exists, **When** I add a parameter "access_level" of type enum with allowed values ["read", "write", "admin"] and default "read", **Then** the parameter appears in the role's parameters tab.
2. **Given** a role has parameters defined, **When** I edit a parameter's description and default value, **Then** the changes are saved and reflected in the parameter list.
3. **Given** a role has a required enum parameter with allowed values ["read", "write", "admin"], **When** I validate the value "superuser", **Then** validation fails with a descriptive error.
4. **Given** a role has multiple parameters, **When** I view them, **Then** they are displayed in display order, showing type, required status, default value, and constraints.
5. **Given** a role has a parameter, **When** I delete the parameter, **Then** it is removed from the role's parameter list.

---

### User Story 5 - Inheritance Blocks (Priority: P5)

As an admin, I need to selectively block entitlement inheritance between roles to handle exceptions in the hierarchy. I can add an inheritance block with a reason, view active blocks on a role, and remove blocks when they are no longer needed.

**Why this priority**: Inheritance blocks are an exception-handling mechanism that refines the hierarchy. They are only meaningful once hierarchy (P2) and entitlement mapping (P3) are functional.

**Independent Test**: Can be tested by creating a parent-child role pair with an entitlement, adding an inheritance block, and verifying the child no longer inherits the blocked entitlement.

**Acceptance Scenarios**:

1. **Given** role "Frontend" inherits from "Engineering", **When** I add an inheritance block on "Engineering" targeting "Frontend" with reason "Security restriction", **Then** the block appears in the inheritance blocks list.
2. **Given** an inheritance block exists, **When** I view the blocks for the role, **Then** I see the blocked role identifier and the reason for the block.
3. **Given** an inheritance block exists, **When** I remove it, **Then** the block is deleted and inheritance resumes normally.

---

### Edge Cases

- What happens when an admin tries to delete a role that has child roles? The system should prevent deletion and show an error indicating the role has descendants.
- What happens when an admin tries to move a role to create a circular hierarchy? The backend should reject the operation and the UI should display the error.
- What happens when an admin edits a role that was concurrently modified by another admin? The optimistic concurrency version check should fail and the UI should show a conflict message prompting the user to reload.
- What happens when an admin tries to add a duplicate entitlement to a role? The system should prevent duplicates and show an appropriate error.
- What happens when the role tree is very deep (e.g., 10+ levels)? The tree view should handle deep nesting with proper indentation and remain usable.
- What happens when there are no roles yet? The list page should show an empty state with a call-to-action to create the first role.
- What happens when a parameter validation request contains invalid or missing required fields? The UI should display clear validation errors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to create governance roles with a name, optional description, and optional parent role selection.
- **FR-002**: System MUST display governance roles in a paginated list showing name, description, hierarchy depth, abstract status, and creation date.
- **FR-003**: System MUST allow admins to toggle between a flat list view and an indented tree view of roles.
- **FR-004**: System MUST allow admins to edit a role's name, description, and abstract status, with optimistic concurrency protection (version tracking).
- **FR-005**: System MUST allow admins to delete roles that have no child roles.
- **FR-006**: System MUST display role hierarchy as a tree with expandable/collapsible nodes showing role name, entitlement counts, and assigned user counts.
- **FR-007**: System MUST allow admins to move a role to a different parent (re-parenting) with version-based concurrency control.
- **FR-008**: System MUST show ancestors and descendants of any role on its detail page.
- **FR-009**: System MUST provide impact analysis showing how changes to a role affect descendant roles and users.
- **FR-010**: System MUST allow admins to add entitlements to a role by selecting from existing entitlements.
- **FR-011**: System MUST allow admins to remove entitlement mappings from a role.
- **FR-012**: System MUST display both direct entitlements and effective (direct + inherited) entitlements for a role, with clear visual distinction.
- **FR-013**: System MUST allow admins to trigger recomputation of effective entitlements for a role.
- **FR-014**: System MUST allow admins to define parameters on roles with types: string, integer, boolean, date, and enum.
- **FR-015**: System MUST support parameter constraints (e.g., allowed values for enum types), default values, required flag, display name, and display ordering.
- **FR-016**: System MUST allow admins to edit and delete role parameters.
- **FR-017**: System MUST provide parameter value validation before assignment creation.
- **FR-018**: System MUST allow admins to add inheritance blocks between roles with a reason for the block.
- **FR-019**: System MUST allow admins to view and remove inheritance blocks on a role.
- **FR-020**: System MUST restrict all role management actions to admin users only.
- **FR-021**: System MUST display appropriate error messages for concurrency conflicts, validation failures, and constraint violations.

### Key Entities

- **Governance Role**: Represents an access role in the organizational hierarchy. Has a name, description, optional parent role, abstract flag, hierarchy depth, and version for concurrency control. May have child roles, entitlements, parameters, and inheritance blocks.
- **Role Tree Node**: A hierarchical view of a role including its children (recursive), entitlement counts (direct and effective), and assigned user count. Used for tree visualization.
- **Role Entitlement**: A mapping between a role and an entitlement, indicating the role grants that specific permission. Can be direct (explicitly assigned) or inherited (from parent roles).
- **Role Parameter**: A configurable parameter on a role that allows context-specific access grants. Has a type (string, integer, boolean, date, enum), constraints, default value, required flag, and display ordering.
- **Inheritance Block**: An exception that prevents a specific child role from inheriting entitlements from a parent role. Includes a reason for the block.
- **Impact Analysis**: A summary of how changes to a role would affect descendant roles and their assigned users. Shows descendant count and total affected users.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create a new governance role and see it in the list within 3 seconds.
- **SC-002**: The role hierarchy tree renders correctly for structures up to 5 levels deep with 50+ roles.
- **SC-003**: Admins can complete a full role lifecycle (create, assign entitlements, configure parameters, delete) in under 5 minutes.
- **SC-004**: 100% of role CRUD operations display clear success or error feedback within 2 seconds.
- **SC-005**: The effective entitlements view accurately distinguishes between direct and inherited entitlements with clear labeling.
- **SC-006**: Concurrent edit conflicts are detected and communicated to the user with clear instructions to reload.
- **SC-007**: All role management pages are accessible only to admin users; non-admin users see no role management navigation or pages.

## Assumptions

- The backend governance role APIs are fully functional and accessible via the existing BFF pattern (all endpoints verified returning 200).
- The create role request uses `parent_id` field while the response returns `parent_role_id` — the frontend must handle this asymmetry.
- Update and move operations require a `version` field for optimistic concurrency — the frontend must track and send the current version.
- Role entitlement lists and inheritance block lists may return raw arrays (not paginated) from some endpoints — the frontend should handle both formats.
- Existing governance entitlements are available for selection when adding entitlements to roles (entitlement CRUD already exists).
- Admin role checking uses the existing admin role utility that checks both admin and super_admin roles.
- Meta-role viewing and parametric assignments are read-only/secondary features in this phase; full meta-role and role-mining management will be a separate future phase.

## Scope Boundaries

### In Scope
- Role CRUD (create, read, update, delete)
- Role hierarchy tree visualization and re-parenting
- Role entitlement mapping (add/remove/view direct and effective)
- Role parameter CRUD and validation
- Inheritance block management
- Impact analysis display
- Sidebar navigation entry under Governance

### Out of Scope
- Meta-role CRUD (creating/editing meta-roles with criteria) — future phase
- Role mining job management — future phase
- Parametric assignment creation (creating user-to-role assignments with parameter values) — future phase
- Role templates management — future phase
- Bulk role operations — future phase
- Role user assignment management (which users have which roles) — future phase

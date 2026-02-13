# Feature Specification: Self-Service Request Catalog & Birthright Access

**Feature Branch**: `031-catalog-birthright`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Phase 031: Self-Service Request Catalog & Birthright Access — Governance feature enabling users to browse and request access through a catalog with shopping cart workflow, plus admin-managed birthright policies for automatic entitlement assignment."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Catalog Browsing (Priority: P1)

Users can browse a categorized access catalog to discover available roles, entitlements, and resources. The catalog presents items organized by categories (which may be nested hierarchically), with search and filtering capabilities. Each item shows its requestability status — whether the current user can request it, and if not, why (e.g., missing prerequisites, department restriction, already assigned).

**Why this priority**: This is the foundation of the self-service experience. Without catalog browsing, users cannot discover what access is available to request. It delivers immediate value by replacing manual processes (emailing admins, reading documentation) with a searchable, self-service interface.

**Independent Test**: Navigate to the catalog page, see categories in a sidebar, click a category to see items, use the search bar to find items by name, filter by item type (Role/Entitlement/Resource), and verify each item shows whether it can be requested.

**Acceptance Scenarios**:

1. **Given** a user navigates to the catalog, **When** categories exist, **Then** the user sees a list of categories in a sidebar with their names and optional icons
2. **Given** a user clicks a category, **When** the category has items, **Then** the user sees a grid/list of catalog items filtered to that category
3. **Given** a user types in the search bar, **When** matching items exist, **Then** the results update to show only items matching the search text
4. **Given** a user views a catalog item, **When** the item has prerequisites the user does not meet, **Then** the item displays as non-requestable with a reason (e.g., "Requires Developer role")
5. **Given** a user views a catalog item, **When** the user already has the entitlement, **Then** the item indicates it is already assigned
6. **Given** categories are nested (parent-child hierarchy), **When** the user browses categories, **Then** child categories appear under their parent in the sidebar navigation
7. **Given** a user selects the item type filter, **When** "Role" is selected, **Then** only items of type Role are shown

---

### User Story 2 - Shopping Cart & Submission (Priority: P1)

Users can add requestable catalog items to a shopping cart, review their selections, validate the cart for issues (including SoD violations), provide a justification, and submit the cart to create access requests. The cart persists across page navigations within the session.

**Why this priority**: The cart-and-submit workflow is the core action that converts catalog browsing into actual access requests. Without it, the catalog is read-only and delivers no operational value. Together with US1, this forms the MVP.

**Independent Test**: Add multiple items to the cart, navigate to the cart page, run validation (see SoD warnings if applicable), enter a justification, submit, and verify access requests are created.

**Acceptance Scenarios**:

1. **Given** a user views a requestable catalog item, **When** they click "Add to Cart", **Then** the item is added to their cart and a cart badge/count updates
2. **Given** a user has items in their cart, **When** they navigate to the cart page, **Then** they see all cart items with names, types, and any parameters
3. **Given** a cart item requires parameters (e.g., parametric role), **When** the user views the cart, **Then** they can fill in the required parameter values
4. **Given** a user clicks "Validate", **When** the cart has SoD conflicts, **Then** warnings are displayed listing the conflicting items and the SoD rule name
5. **Given** a user clicks "Validate", **When** the cart has missing required fields, **Then** validation issues are shown with descriptions of what needs to be fixed
6. **Given** a user clicks "Submit" with a justification, **When** the cart is valid, **Then** access requests are created for each item and the user is redirected to their requests page
7. **Given** a user wants to remove an item, **When** they click "Remove" on a cart item, **Then** the item is removed and the cart updates
8. **Given** a user wants to start over, **When** they click "Clear Cart", **Then** all items are removed after a confirmation prompt

---

### User Story 3 - Catalog Administration (Priority: P1)

Administrators can manage the catalog by creating and organizing categories (including hierarchical nesting), and creating, editing, enabling, and disabling catalog items. Each item can have requestability rules, form fields for data collection, tags for search, and a reference to an existing role or entitlement.

**Why this priority**: Without admin catalog management, the catalog would be empty. Admins must be able to populate and maintain the catalog for end users to browse it. This is a prerequisite for US1 and US2 to deliver value.

**Independent Test**: Admin creates a category, creates a catalog item in that category with requestability rules and tags, verifies the item appears in the user-facing catalog, then disables it and confirms it no longer appears.

**Acceptance Scenarios**:

1. **Given** an admin navigates to catalog administration, **When** no categories exist, **Then** an empty state prompts them to create the first category
2. **Given** an admin creates a category with a name and optional parent, **When** saved, **Then** the category appears in the category list (nested under its parent if applicable)
3. **Given** an admin creates a catalog item with type, name, category, and tags, **When** saved, **Then** the item appears in the admin item list
4. **Given** an admin edits an item's requestability rules (e.g., "self-request only" or "requires prerequisite role X"), **When** saved, **Then** the rules take effect in the user-facing catalog
5. **Given** an admin disables a catalog item, **When** a user browses the catalog, **Then** the disabled item is not visible to users
6. **Given** an admin tries to delete a category that has child categories or items, **When** they confirm, **Then** the system rejects the deletion with an explanation
7. **Given** an admin re-enables a previously disabled item, **When** a user browses the catalog, **Then** the item is visible again

---

### User Story 4 - Birthright Policy Management (Priority: P2)

Administrators can create and manage birthright policies that automatically assign entitlements to users based on their attributes (e.g., department, location, job title). Each policy has a priority, conditions with flexible operators, and a set of entitlements to grant when conditions match.

**Why this priority**: Birthright policies automate repetitive access assignments, reducing manual work and ensuring consistency. This is valuable but not essential for the basic catalog workflow (US1-US3).

**Independent Test**: Admin creates a birthright policy with conditions (e.g., department equals "Engineering"), links entitlements, enables it, and verifies it appears in the policy list with correct status.

**Acceptance Scenarios**:

1. **Given** an admin navigates to birthright policies, **When** policies exist, **Then** a list shows policy name, priority, status (Active/Archived), and condition count
2. **Given** an admin creates a policy with name, priority, conditions, and entitlement selections, **When** saved, **Then** the policy appears in the list
3. **Given** an admin views a policy detail, **When** the policy has conditions, **Then** each condition shows the attribute, operator, and expected value
4. **Given** an admin disables a policy, **When** the policy status changes to disabled, **Then** it no longer auto-assigns entitlements
5. **Given** an admin archives (deletes) a policy, **When** confirmed, **Then** the policy status becomes "Archived" and it is hidden from the default list view
6. **Given** an admin sets evaluation mode to "FirstMatch", **When** a user matches the first condition, **Then** remaining conditions are not evaluated
7. **Given** an admin configures a grace period (e.g., 30 days), **When** a user no longer matches conditions, **Then** entitlements are revoked only after the grace period

---

### User Story 5 - Policy Simulation (Priority: P2)

Administrators can simulate birthright policies by providing a set of user attributes and seeing which policies match and which entitlements would be granted. This enables safe testing of policy configurations before enabling them.

**Why this priority**: Simulation prevents misconfiguration by letting admins preview policy behavior without affecting real users. It complements US4 but is not required for basic policy management.

**Independent Test**: Admin opens a policy's simulation view, enters test attributes (e.g., department=Engineering, location=US), clicks "Simulate", and sees which conditions matched and which entitlements would be granted.

**Acceptance Scenarios**:

1. **Given** an admin opens a policy's detail page, **When** they click "Simulate", **Then** a form appears to enter attribute key-value pairs
2. **Given** an admin enters attributes and runs a single policy simulation, **When** the attributes match, **Then** results show "Match" with each condition result (passed/failed)
3. **Given** an admin enters attributes and runs a single policy simulation, **When** the attributes do not match, **Then** results show "No Match" with which conditions failed
4. **Given** an admin uses the "Simulate All" function from the policy list page, **When** they enter attributes, **Then** results show all matching policies and the combined entitlements that would be granted
5. **Given** an admin runs impact analysis on a policy, **When** results are returned, **Then** they see estimated affected user counts

---

### User Story 6 - Manager Requests (Priority: P3)

Managers can browse the catalog and request access on behalf of their direct reports. The beneficiary context changes the requestability evaluation (checking the beneficiary's current access and prerequisites rather than the manager's).

**Why this priority**: Manager requests are a convenience feature that extends the core catalog workflow. The core self-service flow (US1-US2) must work first.

**Independent Test**: Manager selects a team member as beneficiary, browses the catalog (seeing requestability from the team member's perspective), adds items to cart, and submits — creating requests attributed to the beneficiary.

**Acceptance Scenarios**:

1. **Given** a manager navigates to the catalog, **When** they select a team member as beneficiary, **Then** the catalog items' requestability status reflects the team member's current access
2. **Given** a manager adds items to the cart for a beneficiary, **When** they view the cart, **Then** the cart clearly shows who the request is for
3. **Given** a manager submits the cart for a beneficiary, **When** access requests are created, **Then** the requests are attributed to the beneficiary with the manager recorded as requester

---

### Edge Cases

- What happens when a user adds an item to the cart that becomes disabled by an admin before submission? The validation step catches this and reports the issue.
- What happens when a user tries to submit an empty cart? The system prevents submission and displays a message.
- What happens when a catalog item's underlying entitlement/role is deleted? The item should appear with an error state indicating the reference is broken.
- What happens when a user submits a cart with SoD violations? SoD violations are warnings (not blocking); the user can still submit but the violations are noted in the access request for approver review.
- What happens when a category is deeply nested (3+ levels)? The sidebar navigation displays the full hierarchy with collapsible sections.
- What happens when the cart already contains a duplicate item? The system prevents adding the same item twice and notifies the user.
- What happens when a birthright policy has conflicting conditions (e.g., department=Engineering AND department=Sales)? The policy evaluates conditions logically; conflicting conditions simply result in no matches.
- What happens when multiple birthright policies grant the same entitlement? The entitlement is assigned once; duplicate assignments are idempotent.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display catalog categories in a hierarchical sidebar navigation, supporting parent-child nesting
- **FR-002**: System MUST display catalog items as a browsable grid or list within the selected category
- **FR-003**: System MUST support searching catalog items by name across all categories
- **FR-004**: System MUST support filtering catalog items by type (Role, Entitlement, Resource)
- **FR-005**: System MUST evaluate and display requestability status for each catalog item based on the current user's access and prerequisites
- **FR-006**: System MUST maintain a per-user shopping cart that persists across page navigations
- **FR-007**: System MUST support adding, updating (parameters/form values), and removing items from the cart
- **FR-008**: System MUST validate the cart before submission, reporting missing fields and SoD violations
- **FR-009**: System MUST create one access request per cart item upon successful submission
- **FR-010**: System MUST allow administrators to create, edit, and delete catalog categories with hierarchy support
- **FR-011**: System MUST allow administrators to create, edit, enable, disable, and delete catalog items
- **FR-012**: System MUST support requestability rules on catalog items (self-request, manager-request, department restriction, archetype restriction, prerequisite roles, prerequisite entitlements)
- **FR-013**: System MUST support custom form fields on catalog items for data collection during request
- **FR-014**: System MUST allow administrators to create, edit, enable, disable, and archive birthright policies
- **FR-015**: System MUST support policy conditions with operators (Equals, NotEquals, In, NotIn, Contains, StartsWith, EndsWith)
- **FR-016**: System MUST support policy simulation against provided attributes, showing match results and entitlements
- **FR-017**: System MUST support impact analysis for birthright policies
- **FR-018**: System MUST support manager-initiated requests with a beneficiary selector
- **FR-019**: System MUST prevent adding duplicate items to the cart
- **FR-020**: System MUST prevent submission of an empty cart
- **FR-021**: System MUST allow clearing the entire cart with user confirmation
- **FR-022**: System MUST require a global justification text when submitting the cart
- **FR-023**: System MUST support tagging catalog items and filtering by tags
- **FR-024**: System MUST prevent deletion of categories that have children or items
- **FR-025**: System MUST support policy evaluation modes: FirstMatch (stop on first matching condition) and AllMatch (all conditions must match)

### Key Entities

- **Category**: A grouping for catalog items, supporting hierarchical nesting (parent-child). Has a name, optional description, optional icon, and display order.
- **Catalog Item**: A requestable access item (Role, Entitlement, or Resource) within a category. Has requestability rules, optional form fields, tags, and a reference to an existing governance object. Can be enabled or disabled.
- **Shopping Cart**: A per-user collection of catalog items pending submission. Contains cart items with optional parameters and form values. Tied to a beneficiary (self or another user for manager requests).
- **Cart Item**: A single catalog item in a user's cart, with optional parameters for parametric items and form values for custom fields.
- **Birthright Policy**: A rule that automatically assigns entitlements to users based on attribute conditions. Has a priority, evaluation mode, conditions, linked entitlements, optional grace period, and an Active/Archived lifecycle.
- **Policy Condition**: A single condition in a birthright policy, specifying an attribute name, operator, and expected value.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can discover available access items and add them to their cart within 60 seconds of navigating to the catalog
- **SC-002**: Users can complete the full request flow (browse, add to cart, validate, submit) in under 3 minutes
- **SC-003**: Administrators can create a new catalog category and item in under 2 minutes
- **SC-004**: Cart validation provides clear, actionable feedback on all issues within 2 seconds of clicking Validate
- **SC-005**: Birthright policy simulation returns results within 3 seconds for any attribute set
- **SC-006**: 100% of catalog items correctly display their requestability status to the current user
- **SC-007**: All cart submissions result in exactly one access request per cart item, with no duplicates or missing requests
- **SC-008**: Disabled catalog items are never visible to non-admin users in the catalog
- **SC-009**: Category hierarchy correctly renders up to 4 levels of nesting
- **SC-010**: All administrative actions (create, edit, enable, disable, delete, archive) provide immediate visual feedback via success or error notifications

## Assumptions

- The backend access request workflow (approval, provisioning) already exists and is reused — this feature only creates the requests via cart submission.
- Users are already authenticated and have an established session before accessing the catalog.
- The existing governance entitlement and role data model provides the reference objects that catalog items link to.
- Birthright policy execution (actually assigning entitlements to users) is handled by the backend; this feature only provides the admin UI for policy management and simulation.
- Tags are free-form strings managed by administrators when creating/editing catalog items; there is no separate tag management interface.
- Cart persistence is server-side (via the backend cart API), not client-side (localStorage).
- Manager requests use the `beneficiary_id` parameter; the system determines the manager relationship from the backend.
- SoD violations from cart validation are warnings displayed to the user and included in the access request metadata; they do not block submission.

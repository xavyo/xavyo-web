# Tasks: Governance Roles & RBAC

**Input**: Design documents from `/specs/017-governance-roles-rbac/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/governance-roles-api.md, quickstart.md

**Tests**: Included per constitution (TDD requirement). Tests for schemas, API clients, components, and pages.

**Organization**: Tasks grouped by user story (US1-US5) from spec.md priorities (P1-P5).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Includes exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No additional setup needed — project structure exists from prior phases.

- [X] T001 Verify branch `017-governance-roles-rbac` is checked out and prior tests pass via `npx vitest run`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, schemas, and API clients that ALL user stories depend on. MUST complete before any story work.

**WARNING**: No user story work can begin until this phase is complete.

- [X] T002 Add GovernanceRole types to `src/lib/api/types.ts` — GovernanceRole, RoleTreeNode, RoleEntitlement, EffectiveEntitlementsResponse, RoleParameter, InheritanceBlock, ImpactAnalysis, RoleMoveResponse, RoleListResponse, ParameterType enum, plus Create/Update/Move request types
- [X] T003 Create Zod validation schemas in `src/lib/schemas/governance-roles.ts` — createRoleSchema (name required, description optional, parent_id optional uuid), updateRoleSchema (name, description, is_abstract, version required), moveRoleSchema (parent_id nullable uuid, version required), addEntitlementSchema (entitlement_id uuid, role_name string), addParameterSchema (name, parameter_type enum, description, is_required, default_value, constraints, display_name, display_order), updateParameterSchema, validateParameterSchema, addInheritanceBlockSchema (blocked_role_id uuid, reason string)
- [X] T004 Create server-side API client in `src/lib/api/governance-roles.ts` — listRoles, createRole, getRole, updateRole, deleteRole, getRoleTree, getRoleAncestors, getRoleChildren, getRoleDescendants, moveRole, getRoleImpact, listRoleEntitlements, addRoleEntitlement, removeRoleEntitlement, getEffectiveEntitlements, recomputeEffectiveEntitlements, listRoleParameters, addRoleParameter, getRoleParameter, updateRoleParameter, deleteRoleParameter, validateRoleParameters, listInheritanceBlocks, addInheritanceBlock, removeInheritanceBlock
- [X] T005 Create client-side API client in `src/lib/api/governance-roles-client.ts` — fetch wrappers for all BFF proxy endpoints at `/api/governance/roles/...`
- [X] T006 [P] Write tests for Zod schemas in `src/lib/schemas/governance-roles.test.ts` — validate all schemas with valid/invalid data, test field constraints, test enum validation for parameter_type
- [X] T007 [P] Write tests for server-side API client in `src/lib/api/governance-roles.test.ts` — mock fetch, test all 24 functions, verify correct URL construction, headers, request bodies
- [X] T008 [P] Write tests for client-side API client in `src/lib/api/governance-roles-client.test.ts` — mock fetch, test all client functions, verify proxy URL paths

**Checkpoint**: Foundation ready — all types, schemas, and API clients in place. User story implementation can begin.

---

## Phase 3: User Story 1 — Role CRUD Management (Priority: P1) MVP

**Goal**: Admins can create, list, view, edit, and delete governance roles with pagination and optimistic concurrency.

**Independent Test**: Create a role, see it in the list, edit its name, delete it. Empty state shows CTA when no roles exist.

### BFF Proxies for US1

- [X] T009 [P] [US1] Create BFF proxy for role list + create at `src/routes/api/governance/roles/+server.ts` — GET (list with limit/offset query params) and POST (create with name, description, parent_id body)
- [X] T010 [P] [US1] Create BFF proxy for role detail + update + delete at `src/routes/api/governance/roles/[id]/+server.ts` — GET, PUT (with version in body), DELETE

### Pages for US1

- [X] T011 [US1] Create role list page server load in `src/routes/(app)/governance/roles/+page.server.ts` — load roles with pagination, admin guard via hasAdminRole
- [X] T012 [US1] Create role list page UI in `src/routes/(app)/governance/roles/+page.svelte` — PageHeader with "Create Role" button, DataTable with columns (name, description, hierarchy_depth, is_abstract badge, created_at), pagination, EmptyState when no roles, link to detail page
- [X] T013 [US1] Create role create page server load + action in `src/routes/(app)/governance/roles/create/+page.server.ts` — Superforms load with createRoleSchema, form action that calls createRole API, redirect to list on success
- [X] T014 [US1] Create role create page UI in `src/routes/(app)/governance/roles/create/+page.svelte` — form with name (required), description (textarea), parent role selector (dropdown fetched from roles list), submit/cancel buttons
- [X] T015 [US1] Create role detail page server load + actions in `src/routes/(app)/governance/roles/[id]/+page.server.ts` — load role by ID, Superforms for edit with updateRoleSchema, edit action (PUT with version), delete action (DELETE with redirect), handle 409 conflict
- [X] T016 [US1] Create role detail page UI in `src/routes/(app)/governance/roles/[id]/+page.svelte` — PageHeader with role name, tab layout (Details tab active by default), Details tab with edit form (name, description, is_abstract checkbox, hidden version field), Delete button with confirm dialog, 409 conflict alert with Reload button
- [X] T017 [US1] Add "Roles" sidebar navigation item in `src/routes/(app)/+layout.svelte` — under Governance section, admin-only, with ShieldCheck icon from lucide-svelte, href `/governance/roles`

### Tests for US1

- [X] T018 [P] [US1] Write tests for role list page in `src/routes/(app)/governance/roles/governance-roles-list.test.ts` — test renders role table, pagination, empty state, create button link
- [X] T019 [P] [US1] Write tests for role create page in `src/routes/(app)/governance/roles/create/governance-roles-create.test.ts` — test form renders, validation errors, parent selector
- [X] T020 [P] [US1] Write tests for role detail page in `src/routes/(app)/governance/roles/[id]/governance-roles-detail.test.ts` — test detail renders, edit form, delete dialog, version conflict handling

**Checkpoint**: Role CRUD fully functional. Admins can create/list/edit/delete roles. MVP complete.

---

## Phase 4: User Story 2 — Role Hierarchy Visualization & Management (Priority: P2)

**Goal**: Admins can view roles as a tree, move roles between parents, view ancestors/descendants, and run impact analysis.

**Independent Test**: Create 3 roles in hierarchy, toggle to tree view, move a child to different parent, view impact analysis.

### BFF Proxies for US2

- [X] T021 [P] [US2] Create BFF proxy for role tree at `src/routes/api/governance/roles/tree/+server.ts` — GET returns recursive tree structure
- [X] T022 [P] [US2] Create BFF proxy for move role at `src/routes/api/governance/roles/[id]/move/+server.ts` — POST with parent_id and version
- [X] T023 [P] [US2] Create BFF proxy for impact analysis at `src/routes/api/governance/roles/[id]/impact/+server.ts` — GET returns descendant count and affected users
- [X] T024 [P] [US2] Create BFF proxy for ancestors at `src/routes/api/governance/roles/[id]/ancestors/+server.ts` — GET returns raw array
- [X] T025 [P] [US2] Create BFF proxy for children at `src/routes/api/governance/roles/[id]/children/+server.ts` — GET returns raw array
- [X] T026 [P] [US2] Create BFF proxy for descendants at `src/routes/api/governance/roles/[id]/descendants/+server.ts` — GET returns raw array

### Components for US2

- [X] T027 [US2] Create recursive tree node component in `src/lib/components/governance/role-tree-node.svelte` — renders one node (name, depth indent, entitlement counts, user count, is_abstract badge, expand/collapse chevron), recursively renders children via svelte:self, click navigates to detail page
- [X] T028 [US2] Create tree container component in `src/lib/components/governance/role-tree.svelte` — wraps tree nodes, manages expanded state as $state Set of node IDs, expand all / collapse all buttons, empty state if no roots

### Page Updates for US2

- [X] T029 [US2] Update role list page `src/routes/(app)/governance/roles/+page.svelte` — add toggle button (List / Tree), when Tree selected fetch tree data via client-side API and render role-tree component instead of DataTable
- [X] T030 [US2] Add Hierarchy tab to role detail page `src/routes/(app)/governance/roles/[id]/+page.svelte` — tab shows ancestors list (fetched client-side), children list, descendants count, Move Role form (select new parent from dropdown, version hidden field), Impact Analysis section (descendant count, affected users)

### Tests for US2

- [X] T031 [P] [US2] Write tests for role-tree-node component in `src/lib/components/governance/role-tree-node.test.ts` — test renders name, depth indent, expand/collapse, children rendering
- [X] T032 [P] [US2] Write tests for role-tree component in `src/lib/components/governance/role-tree.test.ts` — test renders roots, expand all/collapse all, empty state
- [X] T033 [P] [US2] Write tests for hierarchy tab integration in `src/routes/(app)/governance/roles/[id]/governance-roles-hierarchy.test.ts` — test ancestors/children/descendants display, move form, impact section

**Checkpoint**: Tree visualization and hierarchy management working. Toggle between list and tree views.

---

## Phase 5: User Story 3 — Role Entitlement Mapping (Priority: P3)

**Goal**: Admins can add/remove entitlements to roles and view direct vs inherited (effective) entitlements.

**Independent Test**: Add entitlement to role, view in direct list, view effective entitlements with inheritance counts, remove entitlement.

### BFF Proxies for US3

- [X] T034 [P] [US3] Create BFF proxy for role entitlements list + add at `src/routes/api/governance/roles/[id]/entitlements/+server.ts` — GET returns raw array, POST with entitlement_id and role_name
- [X] T035 [P] [US3] Create BFF proxy for remove entitlement at `src/routes/api/governance/roles/[id]/entitlements/[eid]/+server.ts` — DELETE
- [X] T036 [P] [US3] Create BFF proxy for effective entitlements at `src/routes/api/governance/roles/[id]/effective-entitlements/+server.ts` — GET returns {items, direct_count, inherited_count, total}
- [X] T037 [P] [US3] Create BFF proxy for recompute at `src/routes/api/governance/roles/[id]/effective-entitlements/recompute/+server.ts` — POST triggers recomputation

### Component for US3

- [X] T038 [US3] Create entitlements tab component in `src/lib/components/governance/role-entitlements-tab.svelte` — shows direct entitlements list with remove button, "Add Entitlement" dialog with dropdown selector (fetches existing entitlements from governance entitlements API), effective entitlements section with direct_count/inherited_count badges, Recompute button

### Page Update for US3

- [X] T039 [US3] Add Entitlements tab to role detail page `src/routes/(app)/governance/roles/[id]/+page.svelte` — tab renders role-entitlements-tab component, passes role ID and role name, fetches entitlements client-side on tab activation

### Tests for US3

- [X] T040 [P] [US3] Write tests for role-entitlements-tab component in `src/lib/components/governance/role-entitlements-tab.test.ts` — test direct entitlement list, add dialog, remove action, effective counts, recompute button

**Checkpoint**: Entitlement mapping fully functional. Direct and inherited entitlements visible with clear distinction.

---

## Phase 6: User Story 4 — Parametric Role Configuration (Priority: P4)

**Goal**: Admins can define, edit, validate, and delete parameters on roles with various types and constraints.

**Independent Test**: Add enum parameter with allowed_values, edit default, validate invalid value, delete parameter.

### BFF Proxies for US4

- [X] T041 [P] [US4] Create BFF proxy for parameters list + add at `src/routes/api/governance/roles/[id]/parameters/+server.ts` — GET returns {items, total}, POST with name, parameter_type, etc.
- [X] T042 [P] [US4] Create BFF proxy for parameter detail + update + delete at `src/routes/api/governance/roles/[id]/parameters/[pid]/+server.ts` — GET, PUT, DELETE
- [X] T043 [P] [US4] Create BFF proxy for parameter validation at `src/routes/api/governance/roles/[id]/parameters/validate/+server.ts` — POST with parameters array

### Page Update for US4

- [X] T044 [US4] Add Parameters tab to role detail page `src/routes/(app)/governance/roles/[id]/+page.svelte` — tab shows parameter list (name, type badge, required badge, default value, constraints display), "Add Parameter" dialog with form (name, parameter_type dropdown [string/integer/boolean/date/enum], description, is_required checkbox, default_value, constraints JSON for enum), edit parameter inline or dialog, delete parameter with confirm, "Validate" button with test values form, display order sorting

### Tests for US4

- [X] T045 [P] [US4] Write tests for parameters tab in `src/routes/(app)/governance/roles/[id]/governance-roles-parameters.test.ts` — test parameter list display, add dialog, type selection, constraints for enum, edit, delete, validate action

**Checkpoint**: Parametric roles fully functional. Parameters with all 5 types, constraints, and validation working.

---

## Phase 7: User Story 5 — Inheritance Blocks (Priority: P5)

**Goal**: Admins can add and remove inheritance blocks between roles with reasons.

**Independent Test**: Add block with reason on parent targeting child, view blocks list, remove block.

### BFF Proxies for US5

- [X] T046 [P] [US5] Create BFF proxy for inheritance blocks list + add at `src/routes/api/governance/roles/[id]/inheritance-blocks/+server.ts` — GET returns raw array, POST with blocked_role_id and reason
- [X] T047 [P] [US5] Create BFF proxy for remove inheritance block at `src/routes/api/governance/roles/[id]/inheritance-blocks/[bid]/+server.ts` — DELETE

### Page Update for US5

- [X] T048 [US5] Add Blocks tab to role detail page `src/routes/(app)/governance/roles/[id]/+page.svelte` — tab shows inheritance blocks list (blocked role name/ID, reason, created date), "Add Block" dialog with child role selector (dropdown from children/descendants), reason text input, remove button with confirm

### Tests for US5

- [X] T049 [P] [US5] Write tests for blocks tab in `src/routes/(app)/governance/roles/[id]/governance-roles-blocks.test.ts` — test blocks list display, add dialog, remove action, empty state

**Checkpoint**: All 5 user stories complete. Full governance roles RBAC feature ready.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validation, integration testing, and final quality checks.

- [X] T050 Run TypeScript check via `npm run check` — fix any type errors across all new files
- [X] T051 Run full test suite via `npx vitest run` — ensure all existing tests still pass + new tests pass
- [X] T052 E2E test via Chrome MCP: Login as admin, navigate to Governance > Roles, create a role, view in list, edit, delete — verify full CRUD flow
- [X] T053 E2E test via Chrome MCP: Create parent/child roles, toggle tree view, move role, view impact — verify hierarchy features
- [X] T054 E2E test via Chrome MCP: Add entitlement to role, view effective entitlements, add parameter, validate, add inheritance block — verify all tabs
- [X] T055 Verify dark mode rendering of all new pages via Chrome MCP — toggle theme, check tree view, badges, forms

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verify environment
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — Role CRUD is MVP
- **US2 (Phase 4)**: Depends on US1 (roles must exist for hierarchy)
- **US3 (Phase 5)**: Depends on US1 (roles must exist for entitlement mapping)
- **US4 (Phase 6)**: Depends on US1 (roles must exist for parameters)
- **US5 (Phase 7)**: Depends on US2 + US3 (hierarchy + entitlements needed for blocks to be meaningful)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No story dependencies (MVP)
- **US2 (P2)**: Can start after US1 — Needs roles to exist for tree
- **US3 (P3)**: Can start after US1 — Needs roles for entitlement mapping (can run parallel with US2)
- **US4 (P4)**: Can start after US1 — Needs roles for parameters (can run parallel with US2/US3)
- **US5 (P5)**: Can start after US1 — Needs roles for blocks (can run parallel with US2/US3/US4)

### Within Each User Story

- BFF proxies before page components (pages call proxies)
- Components before page updates (pages render components)
- Tests can run in parallel with each other [P]

### Parallel Opportunities

- T006, T007, T008 (schema + API tests) can all run in parallel
- T009, T010 (US1 BFF proxies) can run in parallel
- T021-T026 (US2 BFF proxies) can all run in parallel
- T034-T037 (US3 BFF proxies) can all run in parallel
- T041-T043 (US4 BFF proxies) can all run in parallel
- T046, T047 (US5 BFF proxies) can run in parallel
- US3, US4, US5 can run in parallel after US1 completes (different files, different tabs)
- All test tasks marked [P] within a phase can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# After T002-T005 complete sequentially (types → schemas → server API → client API):
# Launch all foundational tests in parallel:
Task T006: "Write schema tests in governance-roles.test.ts"
Task T007: "Write server API tests in governance-roles.test.ts"
Task T008: "Write client API tests in governance-roles-client.test.ts"
```

## Parallel Example: US2 BFF Proxies

```bash
# All 6 BFF proxies for hierarchy can be created in parallel:
Task T021: "BFF proxy for tree"
Task T022: "BFF proxy for move"
Task T023: "BFF proxy for impact"
Task T024: "BFF proxy for ancestors"
Task T025: "BFF proxy for children"
Task T026: "BFF proxy for descendants"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (verify environment)
2. Complete Phase 2: Foundational (types, schemas, API clients + tests)
3. Complete Phase 3: US1 — Role CRUD (BFF proxies, list/create/detail pages, sidebar nav, tests)
4. **STOP and VALIDATE**: Create a role, list, edit, delete via browser
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Types and API layer ready
2. US1 → Role CRUD MVP → Test independently
3. US2 → Tree view + hierarchy → Test independently
4. US3 → Entitlement mapping → Test independently
5. US4 → Parameters → Test independently
6. US5 → Inheritance blocks → Test independently
7. Polish → Full validation + E2E

---

## Notes

- [P] tasks = different files, no dependencies within the phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after its phase
- Optimistic concurrency: track `version` field in forms, handle 409 with reload prompt
- API field asymmetry: create uses `parent_id`, response uses `parent_role_id`
- Raw array responses: entitlements, blocks, ancestors/children/descendants return `[]` not paginated
- BFF proxies follow established pattern from `src/routes/api/governance/` (auth guard, error handling)
- All schemas use `import { z } from 'zod/v3'` per project convention
- Total tasks: 55 (1 setup + 7 foundational + 12 US1 + 13 US2 + 7 US3 + 5 US4 + 4 US5 + 6 polish)

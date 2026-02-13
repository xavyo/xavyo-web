# Tasks: Governance Meta-Roles (Business Roles)

**Input**: Design documents from `/specs/018-governance-meta-roles/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/meta-roles-api.md, quickstart.md

**Tests**: Included (TDD required per constitution Principle II)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types & Schemas)

**Purpose**: Add TypeScript types and Zod validation schemas shared by all user stories

- [x] T001 Add meta-role TypeScript types to `src/lib/api/types.ts` — MetaRole, MetaRoleWithDetails, MetaRoleCriteria, MetaRoleEntitlement, MetaRoleConstraint, MetaRoleInheritance, MetaRoleConflict, MetaRoleEvent, MetaRoleEventStats, SimulationResult, CascadeStatus, all enums (MetaRoleStatus, CriteriaLogic, PermissionType, InheritanceStatus, ResolutionStatus, ConflictType, CriteriaOperator, SimulationType, EventType, ConstraintType), and request types (CreateMetaRoleRequest, UpdateMetaRoleRequest, AddCriterionRequest, AddEntitlementRequest, AddConstraintRequest, ResolveConflictRequest, SimulateRequest, CascadeRequest)
- [x] T002 Create Zod validation schemas in `src/lib/schemas/meta-roles.ts` — createMetaRoleSchema (name 1-255, description max 2000, priority 1-1000, criteria_logic enum), updateMetaRoleSchema (all optional), addCriterionSchema (field enum, operator enum, value required), addEntitlementSchema (entitlement_id uuid, permission_type enum), addConstraintSchema (constraint_type enum, constraint_value required), resolveConflictSchema (resolution_status enum, resolution_choice optional, comment max 2000), simulateSchema (simulation_type enum, criteria_changes optional, limit optional), cascadeSchema (dry_run boolean default false)
- [x] T003 Create Zod schema tests in `src/lib/schemas/meta-roles.test.ts` — test all schemas for valid/invalid inputs, boundary conditions (name length, priority range, enum values)

---

## Phase 2: Foundational (API Clients & BFF Proxies)

**Purpose**: Server-side API client, client-side API, and all BFF proxy endpoints. MUST complete before user story phases.

### Tests

- [x] T004 [P] Create server-side API client tests in `src/lib/api/meta-roles.test.ts` — test all 22 functions with mock fetch: listMetaRoles, createMetaRole, getMetaRole, updateMetaRole, deleteMetaRole, enableMetaRole, disableMetaRole, addCriterion, removeCriterion, addEntitlement, removeEntitlement, addConstraint, removeConstraint, listInheritances, reevaluate, simulate, cascade, listConflicts, resolveConflict, listEvents, getEventStats
- [x] T005 [P] Create client-side API client tests in `src/lib/api/meta-roles-client.test.ts` — test all client-side fetch wrappers with mock responses

### Implementation

- [x] T006 Create server-side API client in `src/lib/api/meta-roles.ts` — implement all 22 functions using apiClient pattern (token, tenantId, fetch params), matching contracts/meta-roles-api.md endpoints exactly
- [x] T007 Create client-side API client in `src/lib/api/meta-roles-client.ts` — implement client-side fetch wrappers that call BFF proxy endpoints at `/api/governance/meta-roles/...`
- [x] T008 [P] Create BFF proxy `src/routes/api/governance/meta-roles/+server.ts` — GET (list with query params) and POST (create)
- [x] T009 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/+server.ts` — GET (detail), PUT (update), DELETE
- [x] T010 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/enable/+server.ts` — POST enable
- [x] T011 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/disable/+server.ts` — POST disable
- [x] T012 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/criteria/+server.ts` — POST add criterion
- [x] T013 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/criteria/[criteriaId]/+server.ts` — DELETE criterion
- [x] T014 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/entitlements/+server.ts` — POST add entitlement
- [x] T015 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/entitlements/[entitlementId]/+server.ts` — DELETE entitlement
- [x] T016 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/constraints/+server.ts` — POST add constraint
- [x] T017 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/constraints/[constraintId]/+server.ts` — DELETE constraint
- [x] T018 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/inheritances/+server.ts` — GET with query params (status, limit, offset)
- [x] T019 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/reevaluate/+server.ts` — POST
- [x] T020 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/simulate/+server.ts` — POST with JSON body
- [x] T021 [P] Create BFF proxy `src/routes/api/governance/meta-roles/[id]/cascade/+server.ts` — POST with JSON body
- [x] T022 [P] Create BFF proxy `src/routes/api/governance/meta-roles/conflicts/+server.ts` — GET with query params
- [x] T023 [P] Create BFF proxy `src/routes/api/governance/meta-roles/conflicts/[conflictId]/resolve/+server.ts` — POST with JSON body
- [x] T024 [P] Create BFF proxy `src/routes/api/governance/meta-roles/events/+server.ts` — GET with query params (meta_role_id required)
- [x] T025 [P] Create BFF proxy `src/routes/api/governance/meta-roles/events/stats/+server.ts` — GET with query params

**Checkpoint**: All API infrastructure ready — user story UI implementation can begin

---

## Phase 3: User Story 1 — Meta-Role CRUD and Lifecycle (Priority: P1) MVP

**Goal**: Create, list, view, edit, enable/disable, and delete meta-roles

**Independent Test**: Create a meta-role, view it in list, edit details, toggle enable/disable, delete it

### Tests

- [x] T026 [P] [US1] Create list page tests in `src/routes/(app)/governance/meta-roles/meta-roles-list.test.ts` — test rendering meta-role list, status badges, priority display, search input, status filter, create button link, empty state
- [x] T027 [P] [US1] Create create page tests in `src/routes/(app)/governance/meta-roles/create/meta-roles-create.test.ts` — test form rendering (name, description, priority, criteria_logic), validation errors, successful submission
- [x] T028 [P] [US1] Create detail page tests in `src/routes/(app)/governance/meta-roles/[id]/meta-roles-detail.test.ts` — test detail rendering, edit form, enable/disable buttons, delete with confirmation, tab navigation, stats summary

### Implementation

- [x] T029 [US1] Create list page server load in `src/routes/(app)/governance/meta-roles/+page.server.ts` — load meta-roles list with query params (status, name, limit, offset)
- [x] T030 [US1] Create list page in `src/routes/(app)/governance/meta-roles/+page.svelte` — paginated list with name (link to detail), priority, status badge (active/disabled), criteria logic, created date, search input, status filter dropdown, "Create Meta-Role" button
- [x] T031 [US1] Create create page server load and actions in `src/routes/(app)/governance/meta-roles/create/+page.server.ts` — load form with superform, create action calling createMetaRole, redirect to detail on success
- [x] T032 [US1] Create create page in `src/routes/(app)/governance/meta-roles/create/+page.svelte` — form with name, description (textarea), priority (number input 1-1000), criteria_logic (select AND/OR), submit button
- [x] T033 [US1] Create detail page server load and actions in `src/routes/(app)/governance/meta-roles/[id]/+page.server.ts` — load meta-role with details (getMetaRole), edit action (updateMetaRole), enable/disable actions, delete action with redirect
- [x] T034 [US1] Create detail page in `src/routes/(app)/governance/meta-roles/[id]/+page.svelte` — tabbed layout (Details, Criteria, Entitlements, Constraints, Inheritances, Conflicts, Simulation, Events). Details tab: edit form (name, description, priority, criteria_logic), enable/disable button, delete button with confirm dialog. Stats summary cards (active_inheritances, unresolved_conflicts, criteria_count, entitlements_count, constraints_count)
- [x] T035 [US1] Add "Meta-Roles" sidebar nav item in `src/routes/(app)/+layout.svelte` — admin-only, under Governance section, with Layers icon from lucide-svelte

**Checkpoint**: Meta-role CRUD functional — can create, list, view, edit, enable/disable, delete

---

## Phase 4: User Story 2 — Dynamic Criteria Management (Priority: P2)

**Goal**: Add/remove matching criteria on meta-roles with field/operator/value

**Independent Test**: Add a criterion to a meta-role, verify it displays, remove it

### Implementation

- [x] T036 [US2] Implement Criteria tab in `src/routes/(app)/governance/meta-roles/[id]/+page.svelte` — display criteria list (field, operator, value in readable format), "Add Criterion" button opening inline form, remove button per criterion with confirmation. Form: field dropdown (risk_level, application_id, owner_id, status, name, is_delegable, metadata), operator dropdown (eq, neq, in, not_in, gt, gte, lt, lte, contains, starts_with), value input (dynamic: text for scalar operators, textarea for in/not_in accepting JSON array). Client-side fetch via addCriterionClient/removeCriterionClient

**Checkpoint**: Criteria management works — can add/view/remove criteria on any meta-role

---

## Phase 5: User Story 3 — Entitlement and Constraint Mapping (Priority: P3)

**Goal**: Map entitlements (grant/deny) and policy constraints to meta-roles

**Independent Test**: Add an entitlement and a constraint to a meta-role, view them, remove them

### Implementation

- [x] T037 [US3] Implement Entitlements tab in `src/routes/(app)/governance/meta-roles/[id]/+page.svelte` — display entitlement mappings with enriched details (name, application_name, risk_level, permission_type badge grant/deny), "Add Entitlement" button opening form with entitlement dropdown (fetch from governance entitlements API) and permission_type select (Grant/Deny), remove button per mapping. Client-side fetch via addEntitlementClient/removeEntitlementClient
- [x] T038 [US3] Implement Constraints tab in `src/routes/(app)/governance/meta-roles/[id]/+page.svelte` — display constraints with human-readable type labels and formatted values, "Add Constraint" button opening form with constraint_type dropdown (max_session_duration, require_mfa, ip_whitelist, approval_required), dynamic value input per type: boolean toggle for require_mfa, number input for max_session_duration hours, textarea for ip_whitelist CIDRs, select for approval_required type. Remove button per constraint. Show error if duplicate type. Client-side fetch via addConstraintClient/removeConstraintClient

**Checkpoint**: Entitlement and constraint mapping works — full meta-role configuration possible

---

## Phase 6: User Story 4 — Inheritance Tracking and Re-evaluation (Priority: P4)

**Goal**: View which roles inherit from a meta-role and trigger re-evaluation

**Independent Test**: View Inheritances tab, filter by status, trigger re-evaluation

### Implementation

- [x] T039 [US4] Implement Inheritances tab in `src/routes/(app)/governance/meta-roles/[id]/+page.svelte` — paginated list of inheritances showing child_role name (link if applicable), application_name, status badge (active/suspended/removed), match_reason (expandable JSON display), matched_at date. Status filter dropdown. Pagination controls. "Re-evaluate" button that calls reevaluateClient and shows updated stats summary toast. Client-side fetch via fetchInheritancesClient

**Checkpoint**: Inheritance visibility works — admins can see matching roles and trigger re-evaluation

---

## Phase 7: User Story 5 — Conflict Detection and Resolution (Priority: P5)

**Goal**: View and resolve conflicts between meta-roles

**Independent Test**: View Conflicts tab, filter conflicts, resolve with each strategy

### Implementation

- [x] T040 [US5] Implement Conflicts tab in `src/routes/(app)/governance/meta-roles/[id]/+page.svelte` — paginated list of conflicts showing meta_role_a name, meta_role_b name, affected_role name, conflict_type badge (entitlement/constraint/policy), resolution_status badge (unresolved/resolved_priority/resolved_manual/ignored). Filter dropdowns for conflict_type and resolution_status. For unresolved conflicts: expandable resolution panel with 3 buttons — "Resolve by Priority" (auto, calls resolveConflictClient with resolved_priority), "Resolve Manually" (shows meta-role picker for winner, calls with resolved_manual + resolution_choice), "Ignore" (shows optional comment textarea, calls with ignored). Client-side fetch via fetchConflictsClient/resolveConflictClient

**Checkpoint**: Conflict management works — admins can view and resolve all conflict types

---

## Phase 8: User Story 6 — Simulation and Cascade (Priority: P6)

**Goal**: Preview impact of changes via simulation and trigger cascade propagation

**Independent Test**: Run a simulation, review results, trigger cascade with dry-run

### Implementation

- [x] T041 [US6] Implement Simulation tab in `src/routes/(app)/governance/meta-roles/[id]/+page.svelte` — form with simulation_type select (create, update, delete, criteria_change, enable, disable), dynamic fields based on type (criteria_changes textarea for criteria_change type, limit input), "Run Simulation" button. Results display: summary card (total_roles_affected, roles_gaining/losing_inheritance, new/resolved_conflicts, is_safe indicator, warnings list), collapsible sections for roles_to_add and roles_to_remove (showing role name, application, reason), potential_conflicts list. Client-side fetch via simulateClient
- [x] T042 [US6] Implement Cascade section in `src/routes/(app)/governance/meta-roles/[id]/+page.svelte` — within Simulation tab or as sub-section: "Cascade" button with dry_run checkbox, progress display (processed_count/remaining_count progress bar, success_count, failure_count), failure details list if any. Poll cascade status every 2 seconds until completion. Client-side fetch via cascadeClient

**Checkpoint**: Simulation and cascade work — admins can preview and apply changes safely

---

## Phase 9: User Story 7 — Audit Events and Statistics (Priority: P7)

**Goal**: View audit trail and event statistics for a meta-role

**Independent Test**: View Events tab, filter by type and date, view statistics

### Implementation

- [x] T043 [US7] Implement Events tab in `src/routes/(app)/governance/meta-roles/[id]/+page.svelte` — paginated event list showing event_type badge, actor_id, created_at timestamp, changes (expandable JSON), affected_roles count. Filter controls: event_type dropdown (all 13 types), from_date and to_date date inputs. Event statistics summary cards at top showing counts by category (CRUD ops, inheritance changes, conflicts, cascades). Client-side fetch via fetchEventsClient/getEventStatsClient

**Checkpoint**: Audit trail works — full visibility into meta-role history

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, E2E testing, dark mode verification

- [x] T044 Run `npm run check` to verify zero TypeScript errors
- [x] T045 Run `npx vitest run` to verify all tests pass (existing + new)
- [x] T046 E2E test: Navigate to Governance > Meta-Roles, verify list page loads, create a meta-role with name/description/priority/criteria_logic, verify it appears in list
- [x] T047 E2E test: Open meta-role detail, test all 8 tabs — Details (edit name/priority), Criteria (add/remove criterion), Entitlements (add/remove with grant/deny), Constraints (add require_mfa constraint), Inheritances (view list, trigger re-evaluate), Conflicts (view list), Simulation (run criteria_change simulation), Events (view events, filter by type)
- [x] T048 E2E test: Test enable/disable lifecycle — disable meta-role, verify status badge, enable it back
- [x] T049 E2E test: Test delete flow — delete meta-role, verify redirect to list, verify it's gone
- [x] T050 E2E test: Toggle dark mode, verify all meta-role pages render correctly (list, create, detail with all tabs)
- [x] T051 Update MEMORY.md with Phase 018 completion, any new gotchas discovered

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — types and schemas first
- **Phase 2 (Foundational)**: Depends on Phase 1 — API clients need types, BFF proxies need API client
- **Phase 3-9 (User Stories)**: All depend on Phase 2 — UI pages need API clients and BFF proxies
- **Phase 10 (Polish)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories. MVP.
- **US2 (P2)**: Can start after Phase 2 — independent, but Criteria tab is on the same detail page as US1
- **US3 (P3)**: Can start after Phase 2 — independent, uses governance entitlements API for dropdown
- **US4 (P4)**: Can start after Phase 2 — independent tab on detail page
- **US5 (P5)**: Can start after Phase 2 — independent tab on detail page
- **US6 (P6)**: Can start after Phase 2 — independent tab on detail page
- **US7 (P7)**: Can start after Phase 2 — independent tab on detail page

**Note**: US2-US7 all add tabs to the same detail page file (`[id]/+page.svelte`). While conceptually independent, they modify the same file, so they should be implemented sequentially (US1 → US2 → US3 → ... → US7).

### Parallel Opportunities

- T004 + T005 (test files) can run in parallel
- T008-T025 (BFF proxies) can all run in parallel (different files)
- T026-T028 (US1 tests) can run in parallel
- Phase 10 E2E tests (T046-T050) are sequential (depend on working UI)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Types + Schemas (T001-T003)
2. Complete Phase 2: API Clients + BFF Proxies (T004-T025)
3. Complete Phase 3: Meta-Role CRUD (T026-T035)
4. **STOP and VALIDATE**: Create, list, edit, enable/disable, delete meta-roles
5. Test count target: ~2050+ (1997 existing + ~50 new)

### Incremental Delivery

1. Setup + Foundation → API infrastructure ready
2. US1 (CRUD) → MVP deployable
3. US2 (Criteria) → Meta-roles can match roles
4. US3 (Entitlements + Constraints) → Meta-roles have practical effect
5. US4 (Inheritances) → Visibility into matching
6. US5 (Conflicts) → Governance integrity
7. US6 (Simulation + Cascade) → Safe change management
8. US7 (Events) → Audit compliance

---

## Notes

- All BFF proxies follow existing pattern from governance roles (Phase 017)
- Detail page uses 8 tabs — same pattern as governance roles (5 tabs) but more
- Client-side tab data loading via fetch to BFF proxy endpoints
- Criteria value input is dynamic based on operator (text for scalar, textarea for arrays)
- Constraint value input is specific to constraint type (toggle, number, textarea, select)
- Cascade polling interval: 2 seconds until completion
- All pages support light and dark themes

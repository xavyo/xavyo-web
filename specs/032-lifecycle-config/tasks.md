# Tasks: Lifecycle Configuration

**Input**: Design documents from `/specs/032-lifecycle-config/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**Tests**: Required (TDD mandated by constitution)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US6)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add lifecycle types and Zod schemas shared across all user stories

- [x] T001 Add lifecycle TypeScript types to src/lib/api/types.ts (LifecycleConfig, LifecycleConfigDetail, LifecycleState, LifecycleTransition, TransitionCondition, LifecycleAction, UserLifecycleStatus, LifecycleObjectType, EntitlementAction enums, and list/create/update request/response types)
- [x] T002 Create Zod validation schemas in src/lib/schemas/lifecycle.ts (createLifecycleConfigSchema, updateLifecycleConfigSchema, createStateSchema, updateStateSchema, createTransitionSchema, updateConditionsSchema, evaluateConditionsSchema, updateActionsSchema)
- [x] T003 Create Zod schema tests in src/lib/schemas/lifecycle.test.ts (valid/invalid inputs for all schemas)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server-side API client, client-side API, and tests — MUST complete before user stories

- [x] T004 Create server-side API client in src/lib/api/lifecycle.ts (listLifecycleConfigs, createLifecycleConfig, getLifecycleConfig, updateLifecycleConfig, deleteLifecycleConfig, createState, updateState, deleteState, createTransition, deleteTransition, getTransitionConditions, updateTransitionConditions, evaluateTransitionConditions, getStateActions, updateStateActions, getUserLifecycleStatus)
- [x] T005 Create server-side API client tests in src/lib/api/lifecycle.test.ts (mock fetch for all 16 functions)
- [x] T006 Create client-side API in src/lib/api/lifecycle-client.ts (fetchLifecycleConfigs, addState, updateStateClient, deleteStateClient, addTransition, deleteTransitionClient, fetchConditions, saveConditions, evaluateConditions, fetchStateActions, saveStateActions, fetchUserLifecycleStatus)
- [x] T007 Create client-side API tests in src/lib/api/lifecycle-client.test.ts (mock fetch for all client functions)

**Checkpoint**: Foundation ready — API layer complete and tested

---

## Phase 3: User Story 1 — Lifecycle Config Management (Priority: P1)

**Goal**: Admins can list, create, edit, and delete lifecycle configurations with object type filtering

**Independent Test**: Create a config for "User" type, verify in list, edit name, delete it

### BFF Proxies for US1

- [x] T008 [P] [US1] Create BFF proxy for config list+create in src/routes/api/governance/lifecycle/configs/+server.ts (GET list with object_type/is_active/limit/offset query params, POST create)
- [x] T009 [P] [US1] Create BFF proxy for config detail+update+delete in src/routes/api/governance/lifecycle/configs/[configId]/+server.ts (GET detail, PATCH update, DELETE)

### Pages for US1

- [x] T010 [US1] Create lifecycle hub server load in src/routes/(app)/governance/lifecycle/+page.server.ts (load configs list with filters, admin guard)
- [x] T011 [US1] Create lifecycle hub page in src/routes/(app)/governance/lifecycle/+page.svelte (config list with object_type and is_active filters, empty state, link to create)
- [x] T012 [US1] Create lifecycle hub page tests in src/routes/(app)/governance/lifecycle/lifecycle.test.ts
- [x] T013 [US1] Create config create server load+actions in src/routes/(app)/governance/lifecycle/create/+page.server.ts (form action with Superforms, redirect to list on success)
- [x] T014 [US1] Create config create page in src/routes/(app)/governance/lifecycle/create/+page.svelte (form: name, object_type select, description textarea, auto_assign checkbox)
- [x] T015 [US1] Create config create page tests in src/routes/(app)/governance/lifecycle/create/lifecycle-create.test.ts
- [x] T016 [US1] Create config detail server load+actions in src/routes/(app)/governance/lifecycle/[id]/+page.server.ts (load config detail with states/transitions, update/delete actions)
- [x] T017 [US1] Create config detail page in src/routes/(app)/governance/lifecycle/[id]/+page.svelte (Details tab with edit form, enable/disable toggle, delete with confirmation — tabs placeholder for States/Transitions)
- [x] T018 [US1] Create config detail page tests in src/routes/(app)/governance/lifecycle/[id]/lifecycle-detail.test.ts

**Checkpoint**: Config CRUD fully functional — can list, create, edit, delete configs

---

## Phase 4: User Story 2 — State Management (Priority: P1)

**Goal**: Admins can add, edit, and remove states within a lifecycle config, with initial/terminal badges and entitlement action display

**Independent Test**: Add states "Onboarding" (initial, grant), "Active" (no_change), "Terminated" (terminal, revoke) — verify badges and order

### Components for US2

- [x] T019 [P] [US2] Create state-badge component in src/lib/components/lifecycle/state-badge.svelte (Initial/Terminal/Intermediate badges with distinct colors)
- [x] T020 [P] [US2] Create state-badge tests in src/lib/components/lifecycle/state-badge.test.ts
- [x] T021 [P] [US2] Create entitlement-action-badge component in src/lib/components/lifecycle/entitlement-action-badge.svelte (grant=green, revoke=red, no_change=gray badges)
- [x] T022 [P] [US2] Create entitlement-action-badge tests in src/lib/components/lifecycle/entitlement-action-badge.test.ts

### BFF Proxies for US2

- [x] T023 [P] [US2] Create BFF proxy for state create in src/routes/api/governance/lifecycle/configs/[configId]/states/+server.ts (POST create state)
- [x] T024 [P] [US2] Create BFF proxy for state update+delete in src/routes/api/governance/lifecycle/configs/[configId]/states/[stateId]/+server.ts (PATCH update, DELETE)

### UI Integration for US2

- [x] T025 [US2] Add States tab to config detail page in src/routes/(app)/governance/lifecycle/[id]/+page.svelte (state list sorted by position, add state form with name/description/is_initial/is_terminal/entitlement_action/position, edit inline, delete with confirmation — uses state-badge and entitlement-action-badge components)
- [x] T026 [US2] Update config detail tests for States tab in src/routes/(app)/governance/lifecycle/[id]/lifecycle-detail.test.ts

**Checkpoint**: States fully manageable — add/edit/delete states with visual badges

---

## Phase 5: User Story 3 — Transition Management (Priority: P1)

**Goal**: Admins can define transitions between states with approval requirements and grace periods

**Independent Test**: Create transition "Activate" from Onboarding→Active, verify state names display, delete it

### Components for US3

- [x] T027 [P] [US3] Create transition-card component in src/lib/components/lifecycle/transition-card.svelte (displays from→to state names, approval badge, grace period badge, delete button)
- [x] T028 [P] [US3] Create transition-card tests in src/lib/components/lifecycle/transition-card.test.ts

### BFF Proxies for US3

- [x] T029 [P] [US3] Create BFF proxy for transition create in src/routes/api/governance/lifecycle/configs/[configId]/transitions/+server.ts (POST create transition)
- [x] T030 [P] [US3] Create BFF proxy for transition delete in src/routes/api/governance/lifecycle/configs/[configId]/transitions/[transitionId]/+server.ts (DELETE)

### UI Integration for US3

- [x] T031 [US3] Add Transitions tab to config detail page in src/routes/(app)/governance/lifecycle/[id]/+page.svelte (transition list using transition-card, add form with name/from_state/to_state dropdowns/requires_approval checkbox/grace_period_hours input, delete with confirmation)
- [x] T032 [US3] Update config detail tests for Transitions tab in src/routes/(app)/governance/lifecycle/[id]/lifecycle-detail.test.ts

**Checkpoint**: Full state machine definition — configs + states + transitions all manageable

---

## Phase 6: User Story 4 — Transition Conditions (Priority: P2)

**Goal**: Admins can attach attribute-based conditions to transitions and test-evaluate them

**Independent Test**: Add condition on transition, evaluate with matching and non-matching context

### Components for US4

- [x] T033 [P] [US4] Create condition-editor component in src/lib/components/lifecycle/condition-editor.svelte (list of conditions with add/remove, fields: condition_type, attribute_path, expression; evaluate button with JSON context input and result display)
- [x] T034 [P] [US4] Create condition-editor tests in src/lib/components/lifecycle/condition-editor.test.ts

### BFF Proxies for US4

- [x] T035 [P] [US4] Create BFF proxy for conditions get+update in src/routes/api/governance/lifecycle/configs/[configId]/transitions/[transitionId]/conditions/+server.ts (GET, PUT)
- [x] T036 [P] [US4] Create BFF proxy for conditions evaluate in src/routes/api/governance/lifecycle/configs/[configId]/transitions/[transitionId]/conditions/evaluate/+server.ts (POST)

### UI Integration for US4

- [x] T037 [US4] Add conditions management to Transitions tab in src/routes/(app)/governance/lifecycle/[id]/+page.svelte (expand transition to show conditions, use condition-editor component with evaluate functionality)
- [x] T038 [US4] Update config detail tests for conditions in src/routes/(app)/governance/lifecycle/[id]/lifecycle-detail.test.ts

**Checkpoint**: Transitions enriched with conditions and evaluation capability

---

## Phase 7: User Story 5 — State Actions (Priority: P2)

**Goal**: Admins can configure entry and exit actions for states

**Independent Test**: Add entry action "send_notification" and exit action "trigger_provisioning" to a state

### Components for US5

- [x] T039 [P] [US5] Create action-editor component in src/lib/components/lifecycle/action-editor.svelte (separate entry/exit action lists, add/remove actions with action_type input and parameters JSON editor)
- [x] T040 [P] [US5] Create action-editor tests in src/lib/components/lifecycle/action-editor.test.ts

### BFF Proxies for US5

- [x] T041 [P] [US5] Create BFF proxy for state actions get+update in src/routes/api/governance/lifecycle/configs/[configId]/states/[stateId]/actions/+server.ts (GET, PUT)

### UI Integration for US5

- [x] T042 [US5] Add actions management to States tab in src/routes/(app)/governance/lifecycle/[id]/+page.svelte (expand state to show actions, use action-editor component)
- [x] T043 [US5] Update config detail tests for actions in src/routes/(app)/governance/lifecycle/[id]/lifecycle-detail.test.ts

**Checkpoint**: States enriched with configurable entry/exit actions

---

## Phase 8: User Story 6 — User Lifecycle Status (Priority: P3)

**Goal**: User profile shows current lifecycle status (config name, state, entry date)

**Independent Test**: Navigate to user profile, verify lifecycle status section displays

### Components for US6

- [x] T044 [P] [US6] Create lifecycle-status component in src/lib/components/lifecycle/lifecycle-status.svelte (displays config name, current state with badge, entered_at date, handles no-assignment state)
- [x] T045 [P] [US6] Create lifecycle-status tests in src/lib/components/lifecycle/lifecycle-status.test.ts

### BFF Proxy for US6

- [x] T046 [P] [US6] Create BFF proxy for user lifecycle status in src/routes/api/governance/lifecycle/user-status/[userId]/+server.ts (GET)

### UI Integration for US6

- [x] T047 [US6] Add lifecycle status section to user detail page in src/routes/(app)/users/[id]/+page.svelte (load user lifecycle status in page.server.ts, render lifecycle-status component)
- [x] T048 [US6] Update user detail page server load in src/routes/(app)/users/[id]/+page.server.ts (add getUserLifecycleStatus call, handle 404 gracefully)

**Checkpoint**: User profiles show lifecycle status

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar navigation, final integration, cleanup

- [x] T049 Add "Lifecycle" sidebar navigation item under Governance section in src/routes/(app)/+layout.svelte (admin-only, after existing governance items)
- [x] T050 Run svelte-check and fix any TypeScript errors (13 errors, 12 pre-existing from other phases, 1 lifecycle fixed)
- [x] T051 Run full test suite (npx vitest run) and fix any failures (4452 tests pass, 273 files)
- [x] T052 Run quickstart.md E2E validation scenarios via Chrome DevTools MCP (all scenarios validated — config CRUD, state management, transitions, conditions panel, actions panel, user lifecycle status)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (types + schemas)
- **Phases 3-5 (US1-US3, all P1)**: Depend on Phase 2 — should be done sequentially (US1→US2→US3) since US2/US3 build on the detail page created in US1
- **Phases 6-7 (US4-US5, P2)**: Depend on Phases 4-5 (need states and transitions to exist)
- **Phase 8 (US6, P3)**: Depends on Phase 2 only (independent of other stories, modifies user detail page)
- **Phase 9 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Config CRUD)**: Foundation only — creates the pages that US2-US5 extend
- **US2 (States)**: Depends on US1 detail page existing
- **US3 (Transitions)**: Depends on US2 (needs states for from/to dropdowns)
- **US4 (Conditions)**: Depends on US3 (needs transitions to attach conditions to)
- **US5 (Actions)**: Depends on US2 (needs states to attach actions to)
- **US6 (User Status)**: Independent — only needs Foundation + modifies user detail page

### Parallel Opportunities

Within Phase 1: T002 and T003 can run after T001
Within Phase 2: T004+T005 and T006+T007 can run in parallel
Within each US: BFF proxies and components (marked [P]) can run in parallel
US5 and US4 can run in parallel (both extend the detail page but different tabs)
US6 can run in parallel with US4/US5

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Setup (types + schemas)
2. Phase 2: Foundation (API clients)
3. Phase 3: US1 — Config CRUD with list/create/detail/edit/delete
4. **STOP and VALIDATE**: Full config management works independently

### Incremental Delivery

1. Setup + Foundation → API layer ready
2. US1 → Config management (MVP)
3. US2 → Add state management to detail page
4. US3 → Add transition management to detail page
5. US4 → Add transition conditions with evaluation
6. US5 → Add state entry/exit actions
7. US6 → User profile lifecycle status
8. Polish → Sidebar nav, E2E validation

---

## Notes

- All BFF proxies require admin guard (hasAdminRole check) except user-status (may be self-service)
- Use `$derived(data.config)` for server data reactivity on detail page
- Client-side mutations (add state, add transition, etc.) should call `invalidateAll()` after success
- Detail page uses ARIA tabs pattern (matching existing governance features)
- Condition evaluation JSON context input should use a textarea with JSON validation
- Action parameters use JSON editor (textarea with JSON.parse validation)
- Total: 52 tasks across 9 phases

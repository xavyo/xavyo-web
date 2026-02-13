# Tasks: Birthright Policies & Lifecycle Workflows

**Input**: Design documents from `/specs/029-birthright-lifecycle/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-routes.md, quickstart.md

**Tests**: TDD is mandatory per constitution (Principle II). Tests included for all modules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types & Schemas)

**Purpose**: Add TypeScript types and Zod validation schemas — foundational for all subsequent work

- [ ] T001 Add ~20 birthright/lifecycle types (BirthrightPolicy, PolicyCondition, LifecycleEvent, LifecycleAction, AccessSnapshotSummary, enums, request/response types) to src/lib/api/types.ts
- [ ] T002 Create Zod schemas (createBirthrightPolicySchema, updateBirthrightPolicySchema, createLifecycleEventSchema, simulatePolicySchema) in src/lib/schemas/birthright.ts
- [ ] T003 Write schema validation tests (valid/invalid inputs for all schemas) in src/lib/schemas/birthright.test.ts

---

## Phase 2: Foundational (API Clients & BFF Proxies)

**Purpose**: Server-side and client-side API clients + all BFF proxy endpoints. MUST complete before any page/component work.

**CRITICAL**: No user story work can begin until this phase is complete.

### Server API Client

- [ ] T004 Create server-side API client with 15 functions (listBirthrightPolicies, getBirthrightPolicy, createBirthrightPolicy, updateBirthrightPolicy, archiveBirthrightPolicy, enableBirthrightPolicy, disableBirthrightPolicy, simulatePolicy, simulateAllPolicies, analyzeImpact, listLifecycleEvents, getLifecycleEvent, createLifecycleEvent, processLifecycleEvent, triggerLifecycleEvent) in src/lib/api/birthright.ts
- [ ] T005 Write server API client tests (mock fetch, verify URL/method/headers/body for each function) in src/lib/api/birthright.test.ts

### Client API Client

- [ ] T006 Create client-side API client with 15 functions calling /api/governance/birthright-policies/* and /api/governance/lifecycle-events/* BFF proxies in src/lib/api/birthright-client.ts
- [ ] T007 Write client API tests (mock fetch, verify BFF proxy URLs and request bodies) in src/lib/api/birthright-client.test.ts

### BFF Proxy Endpoints (Birthright Policies)

- [ ] T008 [P] Create BFF proxy for list + create birthright policies (GET, POST) in src/routes/api/governance/birthright-policies/+server.ts
- [ ] T009 [P] Create BFF proxy for get + update + archive policy (GET, PUT, DELETE) in src/routes/api/governance/birthright-policies/[id]/+server.ts
- [ ] T010 [P] Create BFF proxy for enable policy (POST) in src/routes/api/governance/birthright-policies/[id]/enable/+server.ts
- [ ] T011 [P] Create BFF proxy for disable policy (POST) in src/routes/api/governance/birthright-policies/[id]/disable/+server.ts
- [ ] T012 [P] Create BFF proxy for simulate single policy (POST) in src/routes/api/governance/birthright-policies/[id]/simulate/+server.ts
- [ ] T013 [P] Create BFF proxy for simulate all policies (POST) in src/routes/api/governance/birthright-policies/simulate/+server.ts
- [ ] T014 [P] Create BFF proxy for impact analysis (POST) in src/routes/api/governance/birthright-policies/[id]/impact/+server.ts

### BFF Proxy Endpoints (Lifecycle Events)

- [ ] T015 [P] Create BFF proxy for list + create lifecycle events (GET, POST) in src/routes/api/governance/lifecycle-events/+server.ts
- [ ] T016 [P] Create BFF proxy for get lifecycle event detail (GET) in src/routes/api/governance/lifecycle-events/[id]/+server.ts
- [ ] T017 [P] Create BFF proxy for process lifecycle event (POST) in src/routes/api/governance/lifecycle-events/[id]/process/+server.ts
- [ ] T018 [P] Create BFF proxy for trigger lifecycle event (POST) in src/routes/api/governance/lifecycle-events/trigger/+server.ts

**Checkpoint**: All API infrastructure ready. User story implementation can now begin.

---

## Phase 3: User Story 1 + 2 — Birthright Policy CRUD & Condition Builder (Priority: P1) MVP

**Goal**: Admins can list, create, edit, archive, enable/disable birthright policies with an interactive condition builder and entitlement selection.

**Independent Test**: Navigate to /governance/birthright → see Policies tab → create policy with conditions and entitlements → view detail → edit → disable → enable → archive.

### Components for US1+US2

- [ ] T019 [P] [US2] Create condition-row component (attribute text input, operator select, value input adapting to operator type) in src/lib/components/birthright/condition-row.svelte
- [ ] T020 [P] [US2] Write condition-row tests (renders fields, operator change updates value field, emits remove event) in src/lib/components/birthright/condition-row.test.ts
- [ ] T021 [US2] Create condition-builder component (add/remove condition rows, min 1 validation, passes conditions array up) in src/lib/components/birthright/condition-builder.svelte
- [ ] T022 [US2] Write condition-builder tests (add row, remove row, min 1 enforcement, initial conditions) in src/lib/components/birthright/condition-builder.test.ts
- [ ] T023 [P] [US1] Create entitlement-picker component (checkbox list with search filter, loads entitlements, emits selected IDs) in src/lib/components/birthright/entitlement-picker.svelte
- [ ] T024 [P] [US1] Write entitlement-picker tests (renders entitlements, search filters, selection emits array) in src/lib/components/birthright/entitlement-picker.test.ts

### Hub Page (Policies Tab)

- [ ] T025 [US1] Create hub page server load (load policies list with status filter + pagination, load lifecycle events for Events tab) in src/routes/(app)/governance/birthright/+page.server.ts
- [ ] T026 [US1] Create hub page with 2-tab layout (Policies tab with policy table, status badges, filter, pagination; Events tab placeholder) in src/routes/(app)/governance/birthright/+page.svelte
- [ ] T027 [US1] Write hub page tests (renders tabs, policies table, empty state, status badges, filter, pagination) in src/routes/(app)/governance/birthright/birthright-hub.test.ts

### Policy Create Page

- [ ] T028 [US1] Create policy create page server load (load entitlements for picker) and form action (validate with schema, call createBirthrightPolicy, redirect to detail) in src/routes/(app)/governance/birthright/policies/create/+page.server.ts
- [ ] T029 [US1] Create policy create page with Superforms form (name, description, priority, evaluation_mode, grace_period_days, condition-builder, entitlement-picker) in src/routes/(app)/governance/birthright/policies/create/+page.svelte
- [ ] T030 [US1] Write policy create page tests (renders form fields, validates required fields, shows condition builder, shows entitlement picker, submit creates policy) in src/routes/(app)/governance/birthright/policies/create/birthright-policy-create.test.ts

### Policy Detail Page

- [ ] T031 [US1] Create policy detail page server load (load policy by ID, load entitlements for display names) and actions (enable, disable, archive) in src/routes/(app)/governance/birthright/policies/[id]/+page.server.ts
- [ ] T032 [US1] Create policy detail page showing policy info, conditions list, entitlement names, status badge, enable/disable/archive buttons in src/routes/(app)/governance/birthright/policies/[id]/+page.svelte
- [ ] T033 [US1] Write policy detail page tests (renders policy info, conditions, entitlements, action buttons, status badge, enable/disable/archive actions) in src/routes/(app)/governance/birthright/policies/[id]/birthright-policy-detail.test.ts

### Policy Edit Page

- [ ] T034 [US1] Create policy edit page server load (load policy + entitlements) and form action (validate with updateSchema, call updateBirthrightPolicy, redirect to detail) in src/routes/(app)/governance/birthright/policies/[id]/edit/+page.server.ts
- [ ] T035 [US1] Create policy edit page with pre-populated Superforms form (same fields as create, pre-filled from existing policy) in src/routes/(app)/governance/birthright/policies/[id]/edit/+page.svelte
- [ ] T036 [US1] Write policy edit page tests (renders pre-filled form, conditions, entitlements, submit updates policy) in src/routes/(app)/governance/birthright/policies/[id]/edit/birthright-policy-edit.test.ts

### Sidebar Navigation

- [ ] T037 [US1] Add "Birthright & JML" sidebar nav item (admin-only, under Governance section, links to /governance/birthright) in src/routes/(app)/+layout.svelte

**Checkpoint**: Policy CRUD with condition builder is fully functional and testable.

---

## Phase 4: User Story 3 — Policy Simulation (Priority: P1)

**Goal**: Admins can simulate a single policy or all active policies against sample user attributes and view matched entitlements.

**Independent Test**: Open policy detail → enter JSON attributes → click Simulate → see match/no-match result with entitlements. Simulate all from hub.

### Components

- [ ] T038 [P] [US3] Create simulation-panel component (JSON textarea input, validate button, simulate button, display results: match boolean, matched conditions, entitlement IDs; also "Simulate All" mode showing matching policies + total entitlements) in src/lib/components/birthright/simulation-panel.svelte
- [ ] T039 [P] [US3] Write simulation-panel tests (renders JSON input, validates JSON, displays match result, displays no-match, simulate-all mode shows policy list) in src/lib/components/birthright/simulation-panel.test.ts

### Page Integration

- [ ] T040 [US3] Add simulation panel to policy detail page (single policy simulation) in src/routes/(app)/governance/birthright/policies/[id]/+page.svelte
- [ ] T041 [US3] Add "Simulate All Policies" button and simulation panel to hub page Policies tab in src/routes/(app)/governance/birthright/+page.svelte
- [ ] T042 [US3] Write simulation integration tests (detail page simulate single, hub page simulate all, JSON validation errors, empty results) in src/routes/(app)/governance/birthright/birthright-simulation.test.ts

**Checkpoint**: Policy simulation works for single and all policies.

---

## Phase 5: User Story 4 — Impact Analysis (Priority: P2)

**Goal**: Admins can run impact analysis on a policy to see how it would affect existing users, broken down by department and location.

**Independent Test**: Open policy detail → click "Analyze Impact" → see total affected, users gaining/losing, breakdown by department and location.

### Components

- [ ] T043 [P] [US4] Create impact-panel component (trigger button, loading state, display: total_affected, users_gaining, users_losing, by_department table, by_location table, empty state) in src/lib/components/birthright/impact-panel.svelte
- [ ] T044 [P] [US4] Write impact-panel tests (renders summary cards, department breakdown, location breakdown, empty state, loading state) in src/lib/components/birthright/impact-panel.test.ts

### Page Integration

- [ ] T045 [US4] Add impact analysis panel to policy detail page in src/routes/(app)/governance/birthright/policies/[id]/+page.svelte
- [ ] T046 [US4] Write impact integration tests (detail page shows impact section, triggers analysis, displays results) in src/routes/(app)/governance/birthright/policies/[id]/birthright-impact.test.ts

**Checkpoint**: Impact analysis is functional on policy detail pages.

---

## Phase 6: User Story 5 — Lifecycle Event Management (Priority: P1)

**Goal**: Admins can view lifecycle events with filters and manually trigger events for users.

**Independent Test**: Navigate to Lifecycle Events tab → see event list → filter by type → trigger a joiner event → see event in list.

### Components

- [ ] T047 [P] [US5] Create event-trigger-dialog component (user ID input, event type select (joiner/mover/leaver), conditional JSON textareas: attributes_after for joiner, attributes_before + attributes_after for mover, none for leaver, source field, submit/cancel) in src/lib/components/birthright/event-trigger-dialog.svelte
- [ ] T048 [P] [US5] Write event-trigger-dialog tests (renders fields, event type changes shown fields, validates required attributes per type, submits correctly) in src/lib/components/birthright/event-trigger-dialog.test.ts

### Hub Page Events Tab

- [ ] T049 [US5] Complete hub page Events tab (lifecycle events table with user, type badge, source, processed status, date; filters for event_type, processed status, date range; "Trigger Event" button opening dialog; process pending events button) in src/routes/(app)/governance/birthright/+page.svelte
- [ ] T050 [US5] Update hub page server load to handle event trigger action (validate with createLifecycleEventSchema, call triggerLifecycleEvent) in src/routes/(app)/governance/birthright/+page.server.ts
- [ ] T051 [US5] Write lifecycle events tab tests (renders events table, filters work, trigger dialog opens, event created, process button works) in src/routes/(app)/governance/birthright/birthright-events.test.ts

**Checkpoint**: Lifecycle event viewing, filtering, and triggering works.

---

## Phase 7: User Story 6 + 7 — Event Processing & Detail (Priority: P2)

**Goal**: Admins can process pending events and view event detail with action log, access snapshot, and processing summary.

**Independent Test**: Trigger joiner event → process → see summary → click event → see detail with action log and attributes.

### Components

- [ ] T052 [P] [US6] Create action-log component (table: action type badge, entitlement ID, policy ID, scheduled_at, executed_at, cancelled_at, error_message; empty state) in src/lib/components/birthright/action-log.svelte
- [ ] T053 [P] [US6] Write action-log tests (renders action rows, type badges, timestamps, error messages, empty state) in src/lib/components/birthright/action-log.test.ts

### Event Detail Page

- [ ] T054 [US7] Create event detail page server load (load event with actions + snapshot by ID) and process action (call processLifecycleEvent, invalidateAll) in src/routes/(app)/governance/birthright/events/[id]/+page.server.ts
- [ ] T055 [US7] Create event detail page showing: event metadata (user, type badge, source, dates), attributes_before/attributes_after side-by-side JSON display, summary card (provisioned/revoked/scheduled/skipped counts), action-log component, access snapshot section (if present), "Process Event" button (if unprocessed) in src/routes/(app)/governance/birthright/events/[id]/+page.svelte
- [ ] T056 [US7] Write event detail page tests (renders event info, attributes display, summary counts, action log, snapshot, process button for pending, no process button for processed) in src/routes/(app)/governance/birthright/events/[id]/birthright-event-detail.test.ts

**Checkpoint**: Event processing and detail view fully functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, type checking, and full test suite pass

- [ ] T057 Run TypeScript + Svelte type checks (npm run check) and fix any errors
- [ ] T058 Run full test suite (npx vitest run) and verify all existing + new tests pass
- [ ] T059 E2E testing with Chrome DevTools MCP: hub page, policy CRUD, simulation, impact analysis, lifecycle events, event detail, dark/light mode
- [ ] T060 Update specs/029-birthright-lifecycle/tasks.md — mark all tasks complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — types and schemas first
- **Phase 2 (Foundational)**: Depends on Phase 1 — API clients need types, BFF proxies need API client
- **Phase 3 (US1+US2)**: Depends on Phase 2 — pages need API clients and BFF proxies
- **Phase 4 (US3)**: Depends on Phase 3 — simulation is on policy detail page
- **Phase 5 (US4)**: Depends on Phase 3 — impact is on policy detail page
- **Phase 6 (US5)**: Depends on Phase 2 — events tab needs API clients (can parallel with Phase 3)
- **Phase 7 (US6+US7)**: Depends on Phase 6 — event detail needs events to exist
- **Phase 8 (Polish)**: Depends on all previous phases

### User Story Dependencies

- **US1+US2 (Policy CRUD + Condition Builder)**: Can start after Phase 2 — MVP
- **US3 (Simulation)**: Depends on US1 (adds to policy detail page)
- **US4 (Impact Analysis)**: Depends on US1 (adds to policy detail page), parallel with US3
- **US5 (Lifecycle Events)**: Can start after Phase 2 (parallel with US1 for the events tab)
- **US6+US7 (Event Processing + Detail)**: Depends on US5

### Within Each User Story

- Components before pages (components are used by pages)
- Server load + actions before page templates (pages need data)
- Tests alongside implementation (TDD)

### Parallel Opportunities

- T008-T018: All BFF proxies can be created in parallel
- T019, T023: Condition-row and entitlement-picker components in parallel
- T038, T043, T047, T052: All standalone components in parallel (if their parent story dependencies allow)
- US3 (Simulation) and US4 (Impact) can be parallelized once US1 detail page exists
- US5 (Events tab) can start parallel to US1 policy pages

---

## Parallel Example: Phase 2 BFF Proxies

```bash
# All 11 BFF proxies can be created simultaneously:
T008: birthright-policies/+server.ts
T009: birthright-policies/[id]/+server.ts
T010: birthright-policies/[id]/enable/+server.ts
T011: birthright-policies/[id]/disable/+server.ts
T012: birthright-policies/[id]/simulate/+server.ts
T013: birthright-policies/simulate/+server.ts
T014: birthright-policies/[id]/impact/+server.ts
T015: lifecycle-events/+server.ts
T016: lifecycle-events/[id]/+server.ts
T017: lifecycle-events/[id]/process/+server.ts
T018: lifecycle-events/trigger/+server.ts
```

## Parallel Example: Phase 3 Components

```bash
# Condition-row and entitlement-picker can be created simultaneously:
T019+T020: condition-row.svelte + tests
T023+T024: entitlement-picker.svelte + tests
# Then condition-builder (depends on condition-row):
T021+T022: condition-builder.svelte + tests
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Types + Schemas
2. Complete Phase 2: API Clients + BFF Proxies
3. Complete Phase 3: Policy CRUD + Condition Builder
4. **STOP and VALIDATE**: Test policy CRUD independently
5. Proceed to US3 (Simulation) → US4 (Impact) → US5 (Events) → US6+US7 (Detail)

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1+US2 → Policy CRUD works → MVP!
3. US3 → Simulation works on detail page
4. US4 → Impact analysis works on detail page
5. US5 → Lifecycle events tab works
6. US6+US7 → Event processing and detail works
7. Polish → Full test suite, E2E validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All Zod schemas use `import { z } from 'zod/v3'` (Superforms compatibility)
- All page server loads use `hasAdminRole()` guard from `$lib/server/auth`
- All BFF proxies extract token + tenantId from cookies and forward to backend
- Condition value field adapts: text for equals/not_equals/starts_with/contains, multi-value for in/not_in
- Pagination format: `{items, total, limit, offset}` (standard governance format)
- Hub page Events tab filters: event_type, processed, date range (from/to)

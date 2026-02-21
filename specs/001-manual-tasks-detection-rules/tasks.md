# Tasks: Manual Provisioning Tasks & Detection Rules

**Input**: Design documents from `/specs/001-manual-tasks-detection-rules/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.md, research.md, quickstart.md

**Tests**: Included (TDD per constitution — write tests for schemas, API clients, components, and pages)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add TypeScript types, Zod schemas, and shared API clients used across all user stories

- [x] T001 Add ManualTask, ManualTaskDashboard, SemiManualApplication, DetectionRule types to src/lib/api/types.ts
- [x] T002 Create Zod validation schemas (confirmTaskSchema, rejectTaskSchema, configureSemiManualSchema, createDetectionRuleSchema, updateDetectionRuleSchema) in src/lib/schemas/manual-tasks-detection-rules.ts
- [x] T003 [P] Create server-side manual tasks API client (listManualTasks, getManualTask, getManualTaskDashboard, claimTask, startTask, confirmTask, rejectTask, cancelTask) in src/lib/api/manual-tasks.ts
- [x] T004 [P] Create server-side semi-manual API client (listSemiManualApplications, getSemiManualApplication, configureSemiManual, removeSemiManualConfig) in src/lib/api/semi-manual.ts
- [x] T005 [P] Create server-side detection rules API client (listDetectionRules, getDetectionRule, createDetectionRule, updateDetectionRule, deleteDetectionRule, enableDetectionRule, disableDetectionRule, seedDefaultRules) in src/lib/api/detection-rules.ts
- [x] T006 [P] Create client-side manual tasks API (fetchManualTasks, fetchManualTaskDashboard, claimTaskClient, startTaskClient, confirmTaskClient, rejectTaskClient, cancelTaskClient) in src/lib/api/manual-tasks-client.ts
- [x] T007 [P] Create client-side semi-manual API (fetchSemiManualApplications, configureSemiManualClient, removeSemiManualConfigClient) in src/lib/api/semi-manual-client.ts
- [x] T008 [P] Create client-side detection rules API (fetchDetectionRules, createDetectionRuleClient, deleteDetectionRuleClient, enableDetectionRuleClient, disableDetectionRuleClient, seedDefaultRulesClient) in src/lib/api/detection-rules-client.ts
- [ ] T009 [P] Create Zod schema tests in src/lib/schemas/manual-tasks-detection-rules.test.ts
- [ ] T010 [P] Create server-side manual tasks API tests in src/lib/api/manual-tasks.test.ts
- [ ] T011 [P] Create server-side semi-manual API tests in src/lib/api/semi-manual.test.ts
- [ ] T012 [P] Create server-side detection rules API tests in src/lib/api/detection-rules.test.ts
- [ ] T013 [P] Create client-side manual tasks API tests in src/lib/api/manual-tasks-client.test.ts
- [ ] T014 [P] Create client-side semi-manual API tests in src/lib/api/semi-manual-client.test.ts
- [ ] T015 [P] Create client-side detection rules API tests in src/lib/api/detection-rules-client.test.ts

---

## Phase 2: Foundational (BFF Proxy Endpoints)

**Purpose**: Create all 20 BFF proxy endpoints that MUST exist before any page can function

**CRITICAL**: No page work can begin until these proxies are in place

- [ ] T016 [P] Create manual tasks list BFF proxy (GET) in src/routes/api/governance/manual-tasks/+server.ts
- [ ] T017 [P] Create manual tasks dashboard BFF proxy (GET) in src/routes/api/governance/manual-tasks/dashboard/+server.ts
- [ ] T018 [P] Create manual task detail BFF proxy (GET) in src/routes/api/governance/manual-tasks/[id]/+server.ts
- [ ] T019 [P] Create manual task claim BFF proxy (POST) in src/routes/api/governance/manual-tasks/[id]/claim/+server.ts
- [ ] T020 [P] Create manual task start BFF proxy (POST) in src/routes/api/governance/manual-tasks/[id]/start/+server.ts
- [ ] T021 [P] Create manual task confirm BFF proxy (POST) in src/routes/api/governance/manual-tasks/[id]/confirm/+server.ts
- [ ] T022 [P] Create manual task reject BFF proxy (POST) in src/routes/api/governance/manual-tasks/[id]/reject/+server.ts
- [ ] T023 [P] Create manual task cancel BFF proxy (POST) in src/routes/api/governance/manual-tasks/[id]/cancel/+server.ts
- [ ] T024 [P] Create semi-manual applications list BFF proxy (GET) in src/routes/api/governance/semi-manual/applications/+server.ts
- [ ] T025 [P] Create semi-manual application detail BFF proxy (GET, PUT, DELETE) in src/routes/api/governance/semi-manual/applications/[id]/+server.ts
- [ ] T026 [P] Create detection rules list+create BFF proxy (GET, POST) in src/routes/api/governance/detection-rules/+server.ts
- [ ] T027 [P] Create detection rule detail BFF proxy (GET, PUT, DELETE) in src/routes/api/governance/detection-rules/[id]/+server.ts
- [ ] T028 [P] Create detection rule enable BFF proxy (POST) in src/routes/api/governance/detection-rules/[id]/enable/+server.ts
- [ ] T029 [P] Create detection rule disable BFF proxy (POST) in src/routes/api/governance/detection-rules/[id]/disable/+server.ts
- [ ] T030 [P] Create detection rule seed-defaults BFF proxy (POST) in src/routes/api/governance/detection-rules/seed-defaults/+server.ts

**Checkpoint**: All BFF proxies ready — page implementation can begin

---

## Phase 3: User Story 1 — Manual Task Dashboard & List (Priority: P1) MVP

**Goal**: Admins see a dashboard with 6 metric cards and a filterable task list

**Independent Test**: Navigate to /governance/manual-tasks, verify dashboard cards and filtered list render correctly

### Components for User Story 1

- [ ] T031 [P] [US1] Create task-status-badge component (pending/in_progress/completed/rejected/cancelled) in src/lib/components/manual-tasks/task-status-badge.svelte
- [ ] T032 [P] [US1] Create operation-type-badge component (grant/revoke/modify) in src/lib/components/manual-tasks/operation-type-badge.svelte
- [ ] T033 [P] [US1] Create sla-indicator component (normal/at-risk/breached with color coding) in src/lib/components/manual-tasks/sla-indicator.svelte
- [ ] T034 [P] [US1] Create dashboard-metric-card component (label, value, optional color variant) in src/lib/components/manual-tasks/dashboard-metric-card.svelte
- [ ] T035 [P] [US1] Create component tests for task-status-badge in src/lib/components/manual-tasks/task-status-badge.test.ts
- [ ] T036 [P] [US1] Create component tests for operation-type-badge in src/lib/components/manual-tasks/operation-type-badge.test.ts
- [ ] T037 [P] [US1] Create component tests for sla-indicator in src/lib/components/manual-tasks/sla-indicator.test.ts
- [ ] T038 [P] [US1] Create component tests for dashboard-metric-card in src/lib/components/manual-tasks/dashboard-metric-card.test.ts

### Pages for User Story 1

- [ ] T039 [US1] Create manual tasks hub page server load (dashboard + list with filters) in src/routes/(app)/governance/manual-tasks/+page.server.ts
- [ ] T040 [US1] Create manual tasks hub page (dashboard cards + filterable task list) in src/routes/(app)/governance/manual-tasks/+page.svelte
- [ ] T041 [US1] Create manual tasks hub page tests in src/routes/(app)/governance/manual-tasks/manual-tasks.test.ts

**Checkpoint**: Dashboard and task list visible and filterable

---

## Phase 4: User Story 2 — Manual Task Lifecycle (Priority: P1)

**Goal**: Operators can claim, start, confirm, reject, or cancel tasks from the detail page

**Independent Test**: Open a task detail, perform lifecycle actions (claim → start → confirm), verify status transitions

### Components for User Story 2

- [ ] T042 [P] [US2] Create confirm-dialog component (with optional notes textarea) in src/lib/components/manual-tasks/confirm-dialog.svelte
- [ ] T043 [P] [US2] Create reject-dialog component (with required reason textarea, 5-1000 chars) in src/lib/components/manual-tasks/reject-dialog.svelte
- [ ] T044 [P] [US2] Create confirm-dialog tests in src/lib/components/manual-tasks/confirm-dialog.test.ts
- [ ] T045 [P] [US2] Create reject-dialog tests in src/lib/components/manual-tasks/reject-dialog.test.ts

### Pages for User Story 2

- [ ] T046 [US2] Create manual task detail page server load (task data + lifecycle actions) in src/routes/(app)/governance/manual-tasks/[id]/+page.server.ts
- [ ] T047 [US2] Create manual task detail page (info display + claim/start/confirm/reject/cancel buttons based on status) in src/routes/(app)/governance/manual-tasks/[id]/+page.svelte
- [ ] T048 [US2] Create manual task detail page tests in src/routes/(app)/governance/manual-tasks/[id]/manual-task-detail.test.ts

**Checkpoint**: Full manual task lifecycle operational (claim → start → confirm/reject/cancel)

---

## Phase 5: User Story 3 — Semi-Manual Application Config (Priority: P2)

**Goal**: Admins configure which applications require manual provisioning, linking ticketing and SLA policies

**Independent Test**: Navigate to /governance/semi-manual, configure an app as semi-manual, verify config persists, remove config

### Pages for User Story 3

- [ ] T049 [US3] Create semi-manual config page server load (list apps + configure/remove actions) in src/routes/(app)/governance/semi-manual/+page.server.ts
- [ ] T050 [US3] Create semi-manual config page (app list with configure dialog, ticketing/SLA selectors, remove action) in src/routes/(app)/governance/semi-manual/+page.svelte
- [ ] T051 [US3] Create semi-manual config page tests in src/routes/(app)/governance/semi-manual/semi-manual.test.ts

**Checkpoint**: Semi-manual application configuration fully functional

---

## Phase 6: User Story 4 — Detection Rule Management (Priority: P2)

**Goal**: Admins create, edit, enable/disable, and delete detection rules with type-specific parameters

**Independent Test**: Create rules of each type, edit parameters, toggle enabled, delete a rule

### Components for User Story 4

- [ ] T052 [P] [US4] Create rule-type-badge component (NoManager/Terminated/Inactive/Custom) in src/lib/components/detection-rules/rule-type-badge.svelte
- [ ] T053 [P] [US4] Create rule-params-editor component (type-specific parameter fields: days_threshold for Inactive, expression for Custom, empty for NoManager/Terminated) in src/lib/components/detection-rules/rule-params-editor.svelte
- [ ] T054 [P] [US4] Create rule-type-badge tests in src/lib/components/detection-rules/rule-type-badge.test.ts
- [ ] T055 [P] [US4] Create rule-params-editor tests in src/lib/components/detection-rules/rule-params-editor.test.ts

### Pages for User Story 4

- [ ] T056 [US4] Create detection rules list page server load (list + filter by type/enabled + seed-defaults/enable/disable/delete actions) in src/routes/(app)/governance/detection-rules/+page.server.ts
- [ ] T057 [US4] Create detection rules list page (filterable list with type/enabled badges, action buttons) in src/routes/(app)/governance/detection-rules/+page.svelte
- [ ] T058 [US4] Create detection rule create page server load (form action) in src/routes/(app)/governance/detection-rules/create/+page.server.ts
- [ ] T059 [US4] Create detection rule create page (form with name, type, priority, description, type-specific params) in src/routes/(app)/governance/detection-rules/create/+page.svelte
- [ ] T060 [US4] Create detection rule detail page server load (rule data + enable/disable/delete actions) in src/routes/(app)/governance/detection-rules/[id]/+page.server.ts
- [ ] T061 [US4] Create detection rule detail page (info display with enable/disable/delete buttons) in src/routes/(app)/governance/detection-rules/[id]/+page.svelte
- [ ] T062 [US4] Create detection rule edit page server load (form action) in src/routes/(app)/governance/detection-rules/[id]/edit/+page.server.ts
- [ ] T063 [US4] Create detection rule edit page (pre-populated form with type-specific params) in src/routes/(app)/governance/detection-rules/[id]/edit/+page.svelte
- [ ] T064 [US4] Create detection rules list page tests in src/routes/(app)/governance/detection-rules/detection-rules.test.ts
- [ ] T065 [US4] Create detection rule create page tests in src/routes/(app)/governance/detection-rules/create/detection-rule-create.test.ts
- [ ] T066 [US4] Create detection rule detail page tests in src/routes/(app)/governance/detection-rules/[id]/detection-rule-detail.test.ts

**Checkpoint**: Detection rule CRUD fully operational with type-specific parameter editing

---

## Phase 7: User Story 5 — Detection Rule Defaults (Priority: P3)

**Goal**: Admins can seed system default detection rules with a single click

**Independent Test**: Click "Seed Defaults" on empty list, verify 3 default rules appear

### Implementation for User Story 5

- [ ] T067 [US5] Add "Seed Defaults" button and handler to detection rules list page in src/routes/(app)/governance/detection-rules/+page.svelte (integrate with T057)
- [ ] T068 [US5] Add seed defaults test cases to detection rules list page tests in src/routes/(app)/governance/detection-rules/detection-rules.test.ts (extend T064)

**Checkpoint**: Seed defaults operational, default rules customizable after seeding

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar navigation, final integration, and test validation

- [ ] T069 Add "Manual Tasks" and "Detection Rules" sidebar navigation entries (admin-only) in src/routes/(app)/+layout.svelte
- [ ] T070 Run full test suite (`npm run test:unit`) and fix any failures
- [ ] T071 Run type check (`npm run check`) and fix any TypeScript errors
- [ ] T072 Run E2E validation via Chrome DevTools MCP per quickstart.md scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — types + schemas + API clients first
- **Phase 2 (BFF Proxies)**: Depends on Phase 1 (needs API client functions) — BLOCKS all pages
- **Phase 3 (US1)**: Depends on Phase 2 — dashboard + list page
- **Phase 4 (US2)**: Depends on Phase 2 — task detail page (can run parallel with US1)
- **Phase 5 (US3)**: Depends on Phase 2 — semi-manual config page (can run parallel with US1/US2)
- **Phase 6 (US4)**: Depends on Phase 2 — detection rules pages (can run parallel with US1-US3)
- **Phase 7 (US5)**: Depends on Phase 6 — extends detection rules list page
- **Phase 8 (Polish)**: Depends on all user stories

### User Story Dependencies

- **US1 (Dashboard & List)**: Independent after Phase 2
- **US2 (Task Lifecycle)**: Independent after Phase 2 (task detail is a separate page from dashboard)
- **US3 (Semi-Manual Config)**: Independent after Phase 2 (separate page)
- **US4 (Detection Rules)**: Independent after Phase 2 (separate page group)
- **US5 (Rule Defaults)**: Depends on US4 (extends detection rules list)

### Parallel Opportunities

**Phase 1**: T003-T008 (6 API clients), T009-T015 (7 test files) — all parallel
**Phase 2**: T016-T030 (15 BFF proxies) — all parallel
**Phase 3**: T031-T038 (components + tests) — all parallel; then T039-T041 sequential
**Phase 4**: T042-T045 (dialogs + tests) — all parallel; then T046-T048 sequential
**Phase 5**: T049-T051 sequential
**Phase 6**: T052-T055 (components + tests) — all parallel; then T056-T066 sequential
**Phase 7**: T067-T068 sequential (extends US4 files)

---

## Parallel Example: Phase 1 API Clients

```bash
# Launch all API client files together (different files, no deps):
Task T003: "Create server-side manual tasks API in src/lib/api/manual-tasks.ts"
Task T004: "Create server-side semi-manual API in src/lib/api/semi-manual.ts"
Task T005: "Create server-side detection rules API in src/lib/api/detection-rules.ts"
Task T006: "Create client-side manual tasks API in src/lib/api/manual-tasks-client.ts"
Task T007: "Create client-side semi-manual API in src/lib/api/semi-manual-client.ts"
Task T008: "Create client-side detection rules API in src/lib/api/detection-rules-client.ts"
```

## Parallel Example: Phase 2 BFF Proxies

```bash
# Launch all BFF proxy files together (different files, no deps):
Task T016-T030: All 15 BFF proxy endpoints in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Types + schemas + API clients + tests
2. Complete Phase 2: All BFF proxies
3. Complete Phase 3: Manual task dashboard + list (US1)
4. Complete Phase 4: Manual task detail + lifecycle (US2)
5. **STOP and VALIDATE**: Dashboard visible, task lifecycle operational
6. Deploy/demo — operators can manage their manual provisioning queue

### Incremental Delivery

1. Setup + Foundational → BFF layer ready
2. US1 + US2 → Manual task management (MVP!)
3. US3 → Semi-manual config adds provisioning setup capability
4. US4 + US5 → Detection rules add orphan governance
5. Polish → Sidebar nav, full test pass, E2E validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 together form the MVP (dashboard + lifecycle = core manual task management)
- US3 is independent (semi-manual config is a separate page)
- US5 depends on US4 (extends the detection rules list page with seed button)
- All BFF proxies follow the established pattern: validate session, check admin role, forward to backend, handle ApiError
- Constitution requires TDD — test files included for all components, API clients, schemas, and pages

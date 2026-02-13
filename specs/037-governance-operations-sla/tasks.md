# Tasks: Governance Operations & SLA Management

**Input**: Design documents from `/specs/037-governance-operations-sla/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add all shared types, schemas, API clients, and components used across all 6 user stories

- [X] T001 Add all 7 governance operations types (SlaPolicy, TicketingConfig, BulkAction, BulkActionPreview, FailedOperation, BulkStateOperation, ScheduledTransition, ExpressionValidationResult) to `src/lib/api/types.ts`
- [X] T002 Create Zod validation schemas for all 6 form types (createSlaPolicy, updateSlaPolicy, createTicketingConfig, updateTicketingConfig, createBulkAction, updateBulkAction, createBulkStateOperation, updateFailedOperationStatus, validateExpression) in `src/lib/schemas/governance-operations.ts`
- [X] T003 Create server-side API client with all 28 endpoint functions in `src/lib/api/governance-operations.ts`
- [X] T004 Create client-side API client for tab-level data fetching in `src/lib/api/governance-operations-client.ts`

**Checkpoint**: All shared infrastructure ready — user story phases can begin

---

## Phase 2: Foundational (BFF Proxies — Blocks All User Stories)

**Purpose**: All 20 BFF proxy files must exist before any pages can work

### SLA Policy BFF Proxies
- [X] T005 [P] Create SLA policies list + create BFF proxy in `src/routes/api/governance/sla-policies/+server.ts`
- [X] T006 [P] Create SLA policy detail + update + delete BFF proxy in `src/routes/api/governance/sla-policies/[id]/+server.ts`

### Ticketing Configuration BFF Proxies
- [X] T007 [P] Create ticketing config list + create BFF proxy in `src/routes/api/governance/ticketing-configuration/+server.ts`
- [X] T008 [P] Create ticketing config detail + update + delete BFF proxy in `src/routes/api/governance/ticketing-configuration/[id]/+server.ts`

### Bulk Actions BFF Proxies
- [X] T009 [P] Create bulk actions list + create BFF proxy in `src/routes/api/governance/bulk-actions/+server.ts`
- [X] T010 [P] Create bulk action detail + update BFF proxy in `src/routes/api/governance/bulk-actions/[id]/+server.ts`
- [X] T011 [P] Create bulk action preview BFF proxy in `src/routes/api/governance/bulk-actions/[id]/preview/+server.ts`
- [X] T012 [P] Create bulk action execute BFF proxy in `src/routes/api/governance/bulk-actions/[id]/execute/+server.ts`
- [X] T013 [P] Create bulk action validate expression BFF proxy in `src/routes/api/governance/bulk-actions/validate/+server.ts`

### Failed Operations BFF Proxies
- [X] T014 [P] Create failed operations list BFF proxy in `src/routes/api/governance/failed-operations/+server.ts`
- [X] T015 [P] Create failed operation detail + update BFF proxy in `src/routes/api/governance/failed-operations/[id]/+server.ts`
- [X] T016 [P] Create failed operation retry BFF proxy in `src/routes/api/governance/failed-operations/[id]/retry/+server.ts`

### Bulk State Operations BFF Proxies
- [X] T017 [P] Create bulk state operations create BFF proxy in `src/routes/api/governance/bulk-state-operations/+server.ts`
- [X] T018 [P] Create bulk state operation detail BFF proxy in `src/routes/api/governance/bulk-state-operations/[id]/+server.ts`
- [X] T019 [P] Create bulk state operation cancel BFF proxy in `src/routes/api/governance/bulk-state-operations/[id]/cancel/+server.ts`
- [X] T020 [P] Create bulk state operation process BFF proxy in `src/routes/api/governance/bulk-state-operations/[id]/process/+server.ts`

### Scheduled Transitions BFF Proxies
- [X] T021 [P] Create scheduled transitions list BFF proxy in `src/routes/api/governance/scheduled-transitions/+server.ts`
- [X] T022 [P] Create scheduled transition detail + delete BFF proxy in `src/routes/api/governance/scheduled-transitions/[id]/+server.ts`

### Shared Components
- [X] T023 [P] Create SLA status badge component in `src/lib/components/operations/sla-status-badge.svelte`
- [X] T024 [P] Create ticketing type badge component in `src/lib/components/operations/ticketing-type-badge.svelte`
- [X] T025 [P] Create bulk action status badge component in `src/lib/components/operations/bulk-action-status-badge.svelte`
- [X] T026 [P] Create failed operation status badge component in `src/lib/components/operations/failed-op-status-badge.svelte`
- [X] T027 [P] Create bulk state operation status badge component in `src/lib/components/operations/bulk-state-status-badge.svelte`
- [X] T028 [P] Create scheduled transition status badge component in `src/lib/components/operations/scheduled-status-badge.svelte`

**Checkpoint**: All BFF proxies and shared components ready — page implementation can begin

---

## Phase 3: User Story 1 — SLA Policy Management (Priority: P1) MVP

**Goal**: Admins can create, edit, list, filter, and delete SLA policies for governance processes

**Independent Test**: Navigate to Operations hub → SLA Policies tab → Create policy → View detail → Edit → Delete

### Implementation for User Story 1

- [X] T029 [US1] Create Operations hub page server load (load SLA policies list, ticketing configs, etc.) in `src/routes/(app)/governance/operations/+page.server.ts`
- [X] T030 [US1] Create Operations hub page with 6-tab layout (SLA Policies as default tab) in `src/routes/(app)/governance/operations/+page.svelte`
- [X] T031 [US1] Create SLA policy create page server (form load + create action) in `src/routes/(app)/governance/operations/sla/create/+page.server.ts`
- [X] T032 [US1] Create SLA policy create page form (name, description, category, target hours, warning hours, escalation policy, status) in `src/routes/(app)/governance/operations/sla/create/+page.svelte`
- [X] T033 [US1] Create SLA policy detail page server (load policy + delete action) in `src/routes/(app)/governance/operations/sla/[id]/+page.server.ts`
- [X] T034 [US1] Create SLA policy detail page (info card, actions: Edit/Delete) in `src/routes/(app)/governance/operations/sla/[id]/+page.svelte`
- [X] T035 [US1] Create SLA policy edit page server (form load + update action) in `src/routes/(app)/governance/operations/sla/[id]/edit/+page.server.ts`
- [X] T036 [US1] Create SLA policy edit page form in `src/routes/(app)/governance/operations/sla/[id]/edit/+page.svelte`
- [X] T037 [US1] Add "Operations" sidebar nav entry under Governance section and rename existing connector "Operations" to "Provisioning Ops" in `src/routes/(app)/+layout.svelte`

**Checkpoint**: SLA Policy CRUD fully functional with hub tab, create, detail, edit, delete

---

## Phase 4: User Story 2 — Ticketing Integration Configuration (Priority: P1)

**Goal**: Admins can configure external ticketing system connections with type-specific forms

**Independent Test**: Navigate to Operations hub → Ticketing tab → Create config (ServiceNow/Jira/Webhook) → View detail → Edit → Delete

### Implementation for User Story 2

- [X] T038 [US2] Create ticketing config create page server (form load + create action) in `src/routes/(app)/governance/operations/ticketing/create/+page.server.ts`
- [X] T039 [US2] Create ticketing config create page with dynamic type-specific fields (ServiceNow/Jira/Webhook) in `src/routes/(app)/governance/operations/ticketing/create/+page.svelte`
- [X] T040 [US2] Create ticketing config detail page server (load config + delete action) in `src/routes/(app)/governance/operations/ticketing/[id]/+page.server.ts`
- [X] T041 [US2] Create ticketing config detail page (info card with masked API key, actions: Edit/Delete) in `src/routes/(app)/governance/operations/ticketing/[id]/+page.svelte`
- [X] T042 [US2] Create ticketing config edit page server (form load + update action) in `src/routes/(app)/governance/operations/ticketing/[id]/edit/+page.server.ts`
- [X] T043 [US2] Create ticketing config edit page with dynamic type fields in `src/routes/(app)/governance/operations/ticketing/[id]/edit/+page.svelte`

**Checkpoint**: Ticketing Configuration CRUD fully functional with type-specific forms

---

## Phase 5: User Story 3 — Bulk Actions Management (Priority: P2)

**Goal**: Admins can define expression-based bulk operations, preview affected items, validate expressions, and execute with progress monitoring

**Independent Test**: Navigate to Operations hub → Bulk Actions tab → Create action → Preview → Execute → Monitor progress

### Implementation for User Story 3

- [X] T044 [US3] Create bulk action create page server (form load + create action) in `src/routes/(app)/governance/operations/bulk-actions/create/+page.server.ts`
- [X] T045 [US3] Create bulk action create page form (name, description, action_type, target_expression, filter_expression) in `src/routes/(app)/governance/operations/bulk-actions/create/+page.svelte`
- [X] T046 [US3] Create bulk action detail page server (load action + update action for edit) in `src/routes/(app)/governance/operations/bulk-actions/[id]/+page.server.ts`
- [X] T047 [US3] Create bulk action detail page with preview panel, execute button, progress display, and edit (draft only) in `src/routes/(app)/governance/operations/bulk-actions/[id]/+page.svelte`

**Checkpoint**: Bulk Action CRUD with preview/validate/execute workflow fully functional

---

## Phase 6: User Story 4 — Failed Operations Dashboard (Priority: P2)

**Goal**: Admins can view failed governance operations, examine error details, retry, and dismiss

**Independent Test**: Navigate to Operations hub → Failed Operations tab → View list → Filter by status → Retry/Dismiss operations

### Implementation for User Story 4

- [X] T048 [US4] Update hub page to include Failed Operations tab with list, detail expansion, retry/dismiss actions, and status/type filters in `src/routes/(app)/governance/operations/+page.svelte`

**Checkpoint**: Failed Operations dashboard fully functional with retry/dismiss actions

---

## Phase 7: User Story 5 — Bulk State Operations (Priority: P3)

**Goal**: Admins can trigger mass lifecycle state transitions with progress tracking and cancel

**Independent Test**: Navigate to Operations hub → Bulk State tab → Create operation → Monitor → Cancel

### Implementation for User Story 5

- [X] T049 [US5] Update hub page to include Bulk State tab with create form, operation list, detail with progress, process/cancel actions in `src/routes/(app)/governance/operations/+page.svelte`

**Checkpoint**: Bulk State Operations fully functional with create/monitor/cancel

---

## Phase 8: User Story 6 — Scheduled Transitions (Priority: P3)

**Goal**: Admins can view and cancel pre-scheduled future state transitions

**Independent Test**: Navigate to Operations hub → Scheduled tab → View list → Filter → Cancel pending transition

### Implementation for User Story 6

- [X] T050 [US6] Update hub page to include Scheduled Transitions tab with list, filter by status/type, detail view, and cancel action in `src/routes/(app)/governance/operations/+page.svelte`

**Checkpoint**: Scheduled Transitions list with cancel fully functional

---

## Phase 9: Tests

**Purpose**: Unit tests for all modules

### Schema + API Tests
- [X] T051 [P] Create Zod schema tests (valid/invalid inputs for all 9 schemas) in `src/lib/schemas/governance-operations.test.ts`
- [X] T052 [P] Create server-side API client tests (mock fetch for all 28 endpoints) in `src/lib/api/governance-operations.test.ts`
- [X] T053 [P] Create client-side API client tests in `src/lib/api/governance-operations-client.test.ts`

### Component Tests
- [X] T054 [P] Create status badge component tests (all 6 badges) in `src/lib/components/operations/operations-badges.test.ts`

### Page Tests
- [X] T055 [P] Create Operations hub page tests (6 tabs, empty states, data rendering) in `src/routes/(app)/governance/operations/operations-hub.test.ts`
- [X] T056 [P] Create SLA policy create page tests in `src/routes/(app)/governance/operations/sla/create/sla-create.test.ts`
- [X] T057 [P] Create SLA policy detail page tests in `src/routes/(app)/governance/operations/sla/[id]/sla-detail.test.ts`
- [X] T058 [P] Create SLA policy edit page tests in `src/routes/(app)/governance/operations/sla/[id]/edit/sla-edit.test.ts`
- [X] T059 [P] Create ticketing config create page tests in `src/routes/(app)/governance/operations/ticketing/create/ticketing-create.test.ts`
- [X] T060 [P] Create ticketing config detail page tests in `src/routes/(app)/governance/operations/ticketing/[id]/ticketing-detail.test.ts`
- [X] T061 [P] Create ticketing config edit page tests in `src/routes/(app)/governance/operations/ticketing/[id]/edit/ticketing-edit.test.ts`
- [X] T062 [P] Create bulk action create page tests in `src/routes/(app)/governance/operations/bulk-actions/create/bulk-action-create.test.ts`
- [X] T063 [P] Create bulk action detail page tests (preview, execute, edit) in `src/routes/(app)/governance/operations/bulk-actions/[id]/bulk-action-detail.test.ts`

### BFF Proxy Tests
- [X] T064 [P] Create SLA policies BFF proxy tests in `src/routes/api/governance/sla-policies/sla-policies-proxy.test.ts`
- [X] T065 [P] Create ticketing configuration BFF proxy tests in `src/routes/api/governance/ticketing-configuration/ticketing-proxy.test.ts`
- [X] T066 [P] Create bulk actions BFF proxy tests in `src/routes/api/governance/bulk-actions/bulk-actions-proxy.test.ts`
- [X] T067 [P] Create failed operations BFF proxy tests in `src/routes/api/governance/failed-operations/failed-ops-proxy.test.ts`
- [X] T068 [P] Create bulk state operations BFF proxy tests in `src/routes/api/governance/bulk-state-operations/bulk-state-proxy.test.ts`
- [X] T069 [P] Create scheduled transitions BFF proxy tests in `src/routes/api/governance/scheduled-transitions/scheduled-proxy.test.ts`

**Checkpoint**: All tests pass — run `npm run test:unit` to verify

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T070 Run `npm run check` to verify TypeScript compilation
- [X] T071 Run full test suite `npm run test:unit` and fix any failures
- [ ] T072 E2E test with Chrome DevTools MCP: all 6 tabs, SLA CRUD, ticketing CRUD, bulk action workflow, dark/light mode

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately. T001→T002→T003+T004 (sequential: types before schemas before API clients)
- **Phase 2 (BFF Proxies + Components)**: Depends on Phase 1 — all T005-T028 can run in parallel
- **Phase 3 (US1 - SLA)**: Depends on Phase 2 — T029→T030, then T031-T037 can be parallelized
- **Phase 4 (US2 - Ticketing)**: Depends on Phase 2 — can run in parallel with Phase 3
- **Phase 5 (US3 - Bulk Actions)**: Depends on Phase 2 — can run in parallel with Phases 3-4
- **Phase 6 (US4 - Failed Ops)**: Depends on Phase 3 (hub page exists) — adds tab content
- **Phase 7 (US5 - Bulk State)**: Depends on Phase 3 (hub page exists) — adds tab content
- **Phase 8 (US6 - Scheduled)**: Depends on Phase 3 (hub page exists) — adds tab content
- **Phase 9 (Tests)**: Depends on Phases 1-8 completion
- **Phase 10 (Polish)**: Depends on Phase 9

### User Story Dependencies

- **US1 (SLA)**: Creates hub page — all other stories depend on this for the hub shell
- **US2 (Ticketing)**: Independent of US1 content, but needs hub page from US1
- **US3 (Bulk Actions)**: Independent, needs hub page from US1
- **US4 (Failed Ops)**: Independent, needs hub page from US1
- **US5 (Bulk State)**: Independent, needs hub page from US1
- **US6 (Scheduled)**: Independent, needs hub page from US1

### Parallel Opportunities

- T005-T028: All 24 BFF proxies and components can be created in parallel
- T031-T036 + T038-T043 + T044-T047: SLA/Ticketing/Bulk Action pages in parallel
- T051-T069: All 19 test files can be created in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Types + Schemas + API Clients
2. Complete Phase 2: BFF Proxies + Components
3. Complete Phase 3: SLA Policy CRUD (hub + create + detail + edit)
4. **STOP and VALIDATE**: Test SLA CRUD via browser

### Incremental Delivery

1. Setup + Foundational → BFF Proxies ready
2. Add US1 (SLA) → Test → Hub works with first tab
3. Add US2 (Ticketing) → Test → Two tabs working
4. Add US3 (Bulk Actions) → Test → Three tabs with complex workflow
5. Add US4 (Failed Ops) → Test → Dashboard tab
6. Add US5 (Bulk State) → Test → Five tabs working
7. Add US6 (Scheduled) → Test → All 6 tabs complete
8. Tests → Polish → E2E → Done

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Hub page (T030) is created in US1 with stub content for all 6 tabs, then enriched by US4-US6
- Failed Ops, Bulk State, and Scheduled tabs are simpler (no separate create/detail pages needed — all inline in hub)
- Ticketing create form uses conditional rendering for type-specific fields (like connector management in Phase 020)
- Total: 72 tasks across 10 phases

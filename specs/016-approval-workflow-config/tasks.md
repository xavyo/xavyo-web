# Tasks: Approval Workflow Configuration

**Input**: Design documents from `/specs/016-approval-workflow-config/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD is mandated by the constitution. Unit tests for all components, schemas, and API clients.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4, US5)
- Exact file paths included

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types, schemas, and API clients shared across all user stories

- [ ] T001 Add approval workflow, group, escalation policy, SoD exemption, and escalation event types to `src/lib/api/types.ts`
- [ ] T002 Create Zod validation schemas in `src/lib/schemas/approval-workflows.ts`
- [ ] T003 Create Zod schema tests in `src/lib/schemas/approval-workflows.test.ts`
- [ ] T004 Create server-side API client in `src/lib/api/approval-workflows.ts`
- [ ] T005 Create server-side API client tests in `src/lib/api/approval-workflows.test.ts`
- [ ] T006 [P] Create client-side API in `src/lib/api/approval-workflows-client.ts`
- [ ] T007 [P] Create client-side API tests in `src/lib/api/approval-workflows-client.test.ts`

**Checkpoint**: All shared types, schemas, and API clients ready

---

## Phase 2: Foundational (BFF Proxy Endpoints)

**Purpose**: All BFF proxy endpoints that forward requests to the backend

**⚠️ CRITICAL**: Pages cannot function until proxy endpoints exist

- [ ] T008 [P] Create BFF proxy for approval workflows CRUD in `src/routes/api/governance/approval-workflows/+server.ts` and `src/routes/api/governance/approval-workflows/[id]/+server.ts`
- [ ] T009 [P] Create BFF proxy for workflow set-default in `src/routes/api/governance/approval-workflows/[id]/set-default/+server.ts`
- [ ] T010 [P] Create BFF proxy for approval groups CRUD in `src/routes/api/governance/approval-groups/+server.ts` and `src/routes/api/governance/approval-groups/[id]/+server.ts`
- [ ] T011 [P] Create BFF proxy for group enable/disable in `src/routes/api/governance/approval-groups/[id]/enable/+server.ts` and `src/routes/api/governance/approval-groups/[id]/disable/+server.ts`
- [ ] T012 [P] Create BFF proxy for group members in `src/routes/api/governance/approval-groups/[id]/members/+server.ts`
- [ ] T013 [P] Create BFF proxy for escalation policies CRUD in `src/routes/api/governance/escalation-policies/+server.ts` and `src/routes/api/governance/escalation-policies/[id]/+server.ts`
- [ ] T014 [P] Create BFF proxy for escalation policy set-default and levels in `src/routes/api/governance/escalation-policies/[id]/set-default/+server.ts`, `src/routes/api/governance/escalation-policies/[id]/levels/+server.ts`, `src/routes/api/governance/escalation-policies/[id]/levels/[levelId]/+server.ts`
- [ ] T015 [P] Create BFF proxy for SoD exemptions in `src/routes/api/governance/sod-exemptions/+server.ts`, `src/routes/api/governance/sod-exemptions/[id]/+server.ts`, `src/routes/api/governance/sod-exemptions/[id]/revoke/+server.ts`
- [ ] T016 [P] Create BFF proxy for access request escalation in `src/routes/api/governance/access-requests/[id]/escalation-history/+server.ts`, `src/routes/api/governance/access-requests/[id]/cancel-escalation/+server.ts`, `src/routes/api/governance/access-requests/[id]/reset-escalation/+server.ts`

**Checkpoint**: All 20+ BFF proxy endpoints ready

---

## Phase 3: User Story 1 - Approval Workflow Management (Priority: P1) 🎯 MVP

**Goal**: Admins can create workflows with steps, set a default, edit, and delete workflows

**Independent Test**: Create a workflow, add steps, set as default → access requests now work

### Tests for User Story 1

- [ ] T017 [P] [US1] Write hub page test in `src/routes/(app)/governance/approval-config/approval-config.test.ts`
- [ ] T018 [P] [US1] Write workflow create page test in `src/routes/(app)/governance/approval-config/workflows/create/workflow-create.test.ts`
- [ ] T019 [P] [US1] Write workflow detail page test in `src/routes/(app)/governance/approval-config/workflows/[id]/workflow-detail.test.ts`
- [ ] T020 [P] [US1] Write workflows-tab component test in `src/lib/components/governance/workflows-tab.test.ts`

### Implementation for User Story 1

- [ ] T021 [US1] Create workflows-tab component in `src/lib/components/governance/workflows-tab.svelte`
- [ ] T022 [US1] Create approval config hub page with tabs in `src/routes/(app)/governance/approval-config/+page.svelte` and `src/routes/(app)/governance/approval-config/+page.server.ts`
- [ ] T023 [US1] Create workflow create page in `src/routes/(app)/governance/approval-config/workflows/create/+page.svelte` and `src/routes/(app)/governance/approval-config/workflows/create/+page.server.ts`
- [ ] T024 [US1] Create workflow detail page with edit, set-default, delete, and step management in `src/routes/(app)/governance/approval-config/workflows/[id]/+page.svelte` and `src/routes/(app)/governance/approval-config/workflows/[id]/+page.server.ts`
- [ ] T025 [US1] Add "Approval Config" sidebar nav item in `src/routes/(app)/+layout.svelte`

**Checkpoint**: Workflows fully functional — create, view steps, edit, set-default, delete

---

## Phase 4: User Story 2 - Approval Group Management (Priority: P1)

**Goal**: Admins can create groups, manage members, enable/disable groups

**Independent Test**: Create a group, add members, verify group appears in workflow step selectors

### Tests for User Story 2

- [ ] T026 [P] [US2] Write group create page test in `src/routes/(app)/governance/approval-config/groups/create/group-create.test.ts`
- [ ] T027 [P] [US2] Write group detail page test in `src/routes/(app)/governance/approval-config/groups/[id]/group-detail.test.ts`
- [ ] T028 [P] [US2] Write groups-tab component test in `src/lib/components/governance/groups-tab.test.ts`

### Implementation for User Story 2

- [ ] T029 [US2] Create groups-tab component in `src/lib/components/governance/groups-tab.svelte`
- [ ] T030 [US2] Add Groups tab to hub page in `src/routes/(app)/governance/approval-config/+page.svelte`
- [ ] T031 [US2] Create group create page in `src/routes/(app)/governance/approval-config/groups/create/+page.svelte` and `src/routes/(app)/governance/approval-config/groups/create/+page.server.ts`
- [ ] T032 [US2] Create group detail page with member management, enable/disable, edit, delete in `src/routes/(app)/governance/approval-config/groups/[id]/+page.svelte` and `src/routes/(app)/governance/approval-config/groups/[id]/+page.server.ts`

**Checkpoint**: Groups fully functional — create, add/remove members, enable/disable, delete

---

## Phase 5: User Story 3 - Escalation Policy Configuration (Priority: P2)

**Goal**: Admins can create escalation policies with levels, set default, manage levels

**Independent Test**: Create a policy, add levels with timeouts and actions, set as default

### Tests for User Story 3

- [ ] T033 [P] [US3] Write escalation policy create page test in `src/routes/(app)/governance/approval-config/escalation-policies/create/escalation-create.test.ts`
- [ ] T034 [P] [US3] Write escalation policy detail page test in `src/routes/(app)/governance/approval-config/escalation-policies/[id]/escalation-detail.test.ts`
- [ ] T035 [P] [US3] Write escalation-policies-tab component test in `src/lib/components/governance/escalation-policies-tab.test.ts`

### Implementation for User Story 3

- [ ] T036 [US3] Create escalation-policies-tab component in `src/lib/components/governance/escalation-policies-tab.svelte`
- [ ] T037 [US3] Add Escalation Policies tab to hub page in `src/routes/(app)/governance/approval-config/+page.svelte`
- [ ] T038 [US3] Create escalation policy create page in `src/routes/(app)/governance/approval-config/escalation-policies/create/+page.svelte` and `src/routes/(app)/governance/approval-config/escalation-policies/create/+page.server.ts`
- [ ] T039 [US3] Create escalation policy detail page with level management, set-default, edit, delete in `src/routes/(app)/governance/approval-config/escalation-policies/[id]/+page.svelte` and `src/routes/(app)/governance/approval-config/escalation-policies/[id]/+page.server.ts`

**Checkpoint**: Escalation policies fully functional — create, add/remove levels, set-default

---

## Phase 6: User Story 4 - Access Request Escalation Visibility (Priority: P3)

**Goal**: Escalation history visible on access request detail pages with cancel/reset actions

**Independent Test**: View an access request with escalation events, verify history section shows events

### Tests for User Story 4

- [ ] T040 [P] [US4] Write updated access request detail page test (escalation section) in `src/routes/(app)/governance/access-requests/[id]/access-request-escalation.test.ts`

### Implementation for User Story 4

- [ ] T041 [US4] Modify access request detail page server load to fetch escalation history in `src/routes/(app)/governance/access-requests/[id]/+page.server.ts`
- [ ] T042 [US4] Add escalation history section and cancel/reset actions to `src/routes/(app)/governance/access-requests/[id]/+page.svelte`

**Checkpoint**: Access request detail shows escalation history with cancel/reset actions

---

## Phase 7: User Story 5 - SoD Exemption Management (Priority: P3)

**Goal**: Admins can create, view, and revoke SoD exemptions

**Independent Test**: Create an exemption for a rule/user, verify in list, revoke it

### Tests for User Story 5

- [ ] T043 [P] [US5] Write SoD exemptions tab component test in `src/lib/components/governance/sod-exemptions-tab.test.ts`
- [ ] T044 [P] [US5] Write exemption create page test in `src/routes/(app)/governance/sod/exemptions/create/exemption-create.test.ts`

### Implementation for User Story 5

- [ ] T045 [US5] Create sod-exemptions-tab component in `src/lib/components/governance/sod-exemptions-tab.svelte`
- [ ] T046 [US5] Create exemption create page in `src/routes/(app)/governance/sod/exemptions/create/+page.svelte` and `src/routes/(app)/governance/sod/exemptions/create/+page.server.ts`
- [ ] T047 [US5] Add Exemptions access from SoD section (link on SoD hub or detail pages)

**Checkpoint**: SoD exemptions fully functional — create, list, revoke

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verification, svelte-check, full test suite pass

- [ ] T048 Run `npm run check` to verify zero TypeScript/Svelte errors
- [ ] T049 Run `npm run test:unit` to verify all tests pass (target: ~1750+ tests)
- [ ] T050 E2E test via Chrome DevTools MCP: Create group → create workflow with step → set as default → submit access request → verify no "No workflow configured" error
- [ ] T051 Update CLAUDE.md with Phase 016 in completed features list

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — types, schemas, API clients
- **Phase 2 (BFF Proxies)**: Depends on Phase 1 (types)
- **Phase 3 (US1 Workflows)**: Depends on Phase 2 (proxy endpoints)
- **Phase 4 (US2 Groups)**: Depends on Phase 2 — can run in parallel with US1
- **Phase 5 (US3 Escalation)**: Depends on Phase 2 — can run in parallel with US1/US2
- **Phase 6 (US4 Escalation Visibility)**: Depends on Phase 2 — independent
- **Phase 7 (US5 SoD Exemptions)**: Depends on Phase 2 — independent
- **Phase 8 (Polish)**: Depends on all story phases

### User Story Dependencies

- **US1 (Workflows)**: Independent after Phase 2
- **US2 (Groups)**: Independent after Phase 2 (groups are created before workflows reference them, but the UI doesn't enforce this order)
- **US3 (Escalation Policies)**: Independent after Phase 2
- **US4 (Escalation Visibility)**: Independent after Phase 2
- **US5 (SoD Exemptions)**: Independent after Phase 2

### Parallel Opportunities

- T006/T007 can run in parallel with T004/T005
- All T008-T016 BFF proxy tasks are independent and parallelizable
- All test tasks within each phase are parallelizable
- US1-US5 can all proceed in parallel once Phase 2 is complete

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Types + schemas + API clients
2. Complete Phase 2: All BFF proxy endpoints
3. Complete Phase 4 (US2 Groups): Create groups first (prerequisite for workflow steps)
4. Complete Phase 3 (US1 Workflows): Create workflows with steps referencing groups
5. **STOP and VALIDATE**: Set default workflow → access requests work

### Incremental Delivery

1. Setup + BFF → Foundation ready
2. US2 (Groups) → US1 (Workflows) → MVP! Access requests now work
3. US3 (Escalation Policies) → Enhanced workflows with escalation
4. US4 (Escalation Visibility) → Better access request detail pages
5. US5 (SoD Exemptions) → Compliance flexibility

---

## Notes

- Total tasks: 51
- US1 tasks: 9, US2 tasks: 7, US3 tasks: 7, US4 tasks: 3, US5 tasks: 5
- Setup + Foundation: 16 tasks
- Polish: 4 tasks
- Parallel opportunities: T006/T007, all BFF proxies (T008-T016), all test tasks within phases
- Suggested MVP: US2 (Groups) + US1 (Workflows) = first 2 user stories

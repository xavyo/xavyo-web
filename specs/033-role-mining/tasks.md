# Tasks: Role Mining Analytics & Recommendations

**Input**: Design documents from `/specs/033-role-mining/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Required (TDD mandated by constitution)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US5)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add role mining TypeScript types, Zod schemas, and shared API infrastructure

- [x] T001 Add role mining TypeScript types to src/lib/api/types.ts (MiningJob, MiningJobParameters, MiningJobStatus, RoleCandidate, CandidatePromotionStatus, AccessPattern, ExcessivePrivilege, PrivilegeFlagStatus, PrivilegeReviewAction, ConsolidationSuggestion, ConsolidationStatus, Simulation, SimulationChanges, ScenarioType, SimulationStatus, RoleMetrics, EntitlementUsage, TrendDirection, and all list/create/update request/response types)
- [x] T002 Create Zod validation schemas in src/lib/schemas/role-mining.ts (createMiningJobSchema, promoteCandidateSchema, dismissCandidateSchema, reviewPrivilegeSchema, dismissConsolidationSchema, createSimulationSchema)
- [x] T003 Create Zod schema tests in src/lib/schemas/role-mining.test.ts (valid/invalid inputs for all schemas)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server-side API client, client-side API, and tests — MUST complete before user stories

- [x] T004 Create server-side API client in src/lib/api/role-mining.ts (26 functions: listMiningJobs, getMiningJob, createMiningJob, runMiningJob, cancelMiningJob, listCandidates, getCandidate, promoteCandidate, dismissCandidate, listAccessPatterns, getAccessPattern, listExcessivePrivileges, getExcessivePrivilege, reviewExcessivePrivilege, listConsolidationSuggestions, getConsolidationSuggestion, dismissConsolidationSuggestion, listSimulations, getSimulation, createSimulation, executeSimulation, applySimulation, cancelSimulation, listRoleMetrics, getRoleMetrics, calculateRoleMetrics)
- [x] T005 Create server-side API client tests in src/lib/api/role-mining.test.ts (mock fetch for all 26 functions)
- [x] T006 Create client-side API in src/lib/api/role-mining-client.ts (fetchMiningJobs, runJobClient, cancelJobClient, deleteJobClient, fetchCandidates, promoteCandidateClient, dismissCandidateClient, fetchAccessPatterns, fetchExcessivePrivileges, reviewPrivilegeClient, fetchConsolidationSuggestions, dismissConsolidationClient, fetchSimulations, createSimulationClient, executeSimulationClient, applySimulationClient, cancelSimulationClient, fetchRoleMetrics, calculateMetricsClient)
- [x] T007 Create client-side API tests in src/lib/api/role-mining-client.test.ts (mock fetch for all client functions)

**Checkpoint**: Foundation ready — API layer complete and tested

---

## Phase 3: User Story 1 — Mining Job Management (Priority: P1)

**Goal**: Admins can create, run, cancel, and delete role mining jobs with configurable parameters and status filtering

**Independent Test**: Create a job with parameters, run it, cancel another, delete a completed one, filter by status

### BFF Proxies for US1

- [x] T008 [P] [US1] Create BFF proxy for jobs list+create in src/routes/api/governance/role-mining/jobs/+server.ts (GET with status/limit/offset, POST create)
- [x] T009 [P] [US1] Create BFF proxy for job detail+cancel in src/routes/api/governance/role-mining/jobs/[jobId]/+server.ts (GET detail, DELETE cancel)
- [x] T010 [P] [US1] Create BFF proxy for job run in src/routes/api/governance/role-mining/jobs/[jobId]/run/+server.ts (POST run)

### Components for US1

- [x] T011 [P] [US1] Create job-status-badge component in src/lib/components/role-mining/job-status-badge.svelte (pending=gray, running=blue+spinner, completed=green, failed=red, cancelled=yellow)
- [x] T012 [P] [US1] Create job-status-badge tests in src/lib/components/role-mining/job-status-badge.test.ts

### Pages for US1

- [x] T013 [US1] Create role mining hub server load in src/routes/(app)/governance/role-mining/+page.server.ts (load jobs list with status filter, admin guard)
- [x] T014 [US1] Create role mining hub page in src/routes/(app)/governance/role-mining/+page.svelte (6-tab layout: Jobs/Patterns/Privileges/Consolidation/Simulations/Metrics, Jobs tab shows list with status badges, run/cancel/delete actions, link to create)
- [x] T015 [US1] Create hub page tests in src/routes/(app)/governance/role-mining/role-mining.test.ts
- [x] T016 [US1] Create job create server load+actions in src/routes/(app)/governance/role-mining/create/+page.server.ts (form action with Superforms, redirect to hub on success)
- [x] T017 [US1] Create job create page in src/routes/(app)/governance/role-mining/create/+page.svelte (form: name, min_users, min_entitlements, confidence_threshold, include_excessive_privilege, include_consolidation, consolidation_threshold, deviation_threshold, peer_group_attribute)
- [x] T018 [US1] Create job create page tests in src/routes/(app)/governance/role-mining/create/role-mining-create.test.ts
- [x] T019 [US1] Create job detail server load in src/routes/(app)/governance/role-mining/jobs/[id]/+page.server.ts (load job detail + candidates list, run/cancel/delete actions)
- [x] T020 [US1] Create job detail page in src/routes/(app)/governance/role-mining/jobs/[id]/+page.svelte (job info with parameters, status badge, metrics section with candidate_count/excessive_privilege_count/consolidation_suggestion_count, run/cancel/delete buttons based on status)
- [x] T021 [US1] Create job detail page tests in src/routes/(app)/governance/role-mining/jobs/[id]/job-detail.test.ts

**Checkpoint**: Job CRUD fully functional — can create, run, cancel, delete, filter jobs

---

## Phase 4: User Story 2 — Candidate Review & Promotion (Priority: P1)

**Goal**: Admins can review discovered role candidates, view details, promote to real roles, or dismiss

**Independent Test**: View candidate list for a completed job, promote one, dismiss another

### BFF Proxies for US2

- [x] T022 [P] [US2] Create BFF proxy for candidates list in src/routes/api/governance/role-mining/jobs/[jobId]/candidates/+server.ts (GET with status/min_confidence/limit/offset)
- [x] T023 [P] [US2] Create BFF proxy for candidate detail in src/routes/api/governance/role-mining/candidates/[candidateId]/+server.ts (GET)
- [x] T024 [P] [US2] Create BFF proxy for candidate promote in src/routes/api/governance/role-mining/candidates/[candidateId]/promote/+server.ts (POST with role_name, description)
- [x] T025 [P] [US2] Create BFF proxy for candidate dismiss in src/routes/api/governance/role-mining/candidates/[candidateId]/dismiss/+server.ts (POST with reason)

### Components for US2

- [x] T026 [P] [US2] Create candidate-card component in src/lib/components/role-mining/candidate-card.svelte (displays proposed_name, confidence_score as percentage bar, member_count, entitlement count, promotion_status badge, promote/dismiss buttons)
- [x] T027 [P] [US2] Create candidate-card tests in src/lib/components/role-mining/candidate-card.test.ts

### UI Integration for US2

- [x] T028 [US2] Add candidates section to job detail page in src/routes/(app)/governance/role-mining/jobs/[id]/+page.svelte (candidate list with candidate-card components, promote dialog with role_name input, dismiss dialog with reason input)
- [x] T029 [US2] Update job detail page tests for candidates in src/routes/(app)/governance/role-mining/jobs/[id]/job-detail.test.ts

**Checkpoint**: Candidate review fully functional — promote/dismiss candidates from job detail

---

## Phase 5: User Story 3 — Access Pattern Analysis + Excessive Privileges (Priority: P2)

**Goal**: View access patterns and excessive privilege flags scoped to a completed job, with privilege review actions

**Independent Test**: Select a completed job, view patterns, view privileges, review a privilege flag

### BFF Proxies for US3

- [x] T030 [P] [US3] Create BFF proxy for patterns list in src/routes/api/governance/role-mining/jobs/[jobId]/patterns/+server.ts (GET with min_frequency/limit/offset)
- [x] T031 [P] [US3] Create BFF proxy for pattern detail in src/routes/api/governance/role-mining/patterns/[patternId]/+server.ts (GET)
- [x] T032 [P] [US3] Create BFF proxy for excessive privileges list in src/routes/api/governance/role-mining/jobs/[jobId]/excessive-privileges/+server.ts (GET with status/user_id/limit/offset)
- [x] T033 [P] [US3] Create BFF proxy for privilege detail in src/routes/api/governance/role-mining/excessive-privileges/[flagId]/+server.ts (GET)
- [x] T034 [P] [US3] Create BFF proxy for privilege review in src/routes/api/governance/role-mining/excessive-privileges/[flagId]/review/+server.ts (POST with action, notes)

### Components for US3

- [x] T035 [P] [US3] Create job-selector component in src/lib/components/role-mining/job-selector.svelte (dropdown showing completed jobs, emits selected job_id)
- [x] T036 [P] [US3] Create job-selector tests in src/lib/components/role-mining/job-selector.test.ts
- [x] T037 [P] [US3] Create pattern-card component in src/lib/components/role-mining/pattern-card.svelte (displays entitlement_ids count, frequency, user_count, sample users)
- [x] T038 [P] [US3] Create pattern-card tests in src/lib/components/role-mining/pattern-card.test.ts
- [x] T039 [P] [US3] Create privilege-flag-card component in src/lib/components/role-mining/privilege-flag-card.svelte (displays user_id, deviation_percent, excess_entitlements count, status badge, accept/remediate buttons with notes input)
- [x] T040 [P] [US3] Create privilege-flag-card tests in src/lib/components/role-mining/privilege-flag-card.test.ts

### UI Integration for US3

- [x] T041 [US3] Add Patterns tab to hub page in src/routes/(app)/governance/role-mining/+page.svelte (job-selector + pattern list loaded client-side, min_frequency filter)
- [x] T042 [US3] Add Privileges tab to hub page in src/routes/(app)/governance/role-mining/+page.svelte (job-selector + privilege flag list, accept/remediate actions with invalidateAll)
- [x] T043 [US3] Update hub page tests for Patterns and Privileges tabs in src/routes/(app)/governance/role-mining/role-mining.test.ts

**Checkpoint**: Access pattern analysis and privilege review fully functional

---

## Phase 6: User Story 4 — Role Consolidation Suggestions (Priority: P2)

**Goal**: View and manage consolidation suggestions scoped to a completed job

**Independent Test**: Select a completed job, view consolidation suggestions, dismiss one

### BFF Proxies for US4

- [x] T044 [P] [US4] Create BFF proxy for consolidation list in src/routes/api/governance/role-mining/jobs/[jobId]/consolidation-suggestions/+server.ts (GET with status/min_overlap/limit/offset)
- [x] T045 [P] [US4] Create BFF proxy for consolidation detail in src/routes/api/governance/role-mining/consolidation-suggestions/[suggestionId]/+server.ts (GET)
- [x] T046 [P] [US4] Create BFF proxy for consolidation dismiss in src/routes/api/governance/role-mining/consolidation-suggestions/[suggestionId]/dismiss/+server.ts (POST with reason)

### Components for US4

- [x] T047 [P] [US4] Create consolidation-card component in src/lib/components/role-mining/consolidation-card.svelte (displays role_a_id, role_b_id, overlap_percent as bar, shared/unique entitlement counts, status badge, dismiss button with reason)
- [x] T048 [P] [US4] Create consolidation-card tests in src/lib/components/role-mining/consolidation-card.test.ts

### UI Integration for US4

- [x] T049 [US4] Add Consolidation tab to hub page in src/routes/(app)/governance/role-mining/+page.svelte (job-selector + consolidation list, dismiss action)
- [x] T050 [US4] Update hub page tests for Consolidation tab in src/routes/(app)/governance/role-mining/role-mining.test.ts

**Checkpoint**: Consolidation suggestions viewable and dismissible

---

## Phase 7: User Story 5 — Simulations (Priority: P3)

**Goal**: Admins can create, execute, apply, and cancel simulations to preview impact of role changes

**Independent Test**: Create a simulation, execute it, view impact, apply or cancel

### BFF Proxies for US5

- [x] T051 [P] [US5] Create BFF proxy for simulations list+create in src/routes/api/governance/role-mining/simulations/+server.ts (GET with status/scenario_type/limit/offset, POST create)
- [x] T052 [P] [US5] Create BFF proxy for simulation detail+cancel in src/routes/api/governance/role-mining/simulations/[simulationId]/+server.ts (GET, DELETE cancel)
- [x] T053 [P] [US5] Create BFF proxy for simulation execute in src/routes/api/governance/role-mining/simulations/[simulationId]/execute/+server.ts (POST)
- [x] T054 [P] [US5] Create BFF proxy for simulation apply in src/routes/api/governance/role-mining/simulations/[simulationId]/apply/+server.ts (POST)

### Components for US5

- [x] T055 [P] [US5] Create simulation-status-badge component in src/lib/components/role-mining/simulation-status-badge.svelte (draft=gray, executed=blue, applied=green, cancelled=yellow)
- [x] T056 [P] [US5] Create simulation-status-badge tests in src/lib/components/role-mining/simulation-status-badge.test.ts

### Pages for US5

- [x] T057 [US5] Add Simulations tab to hub page in src/routes/(app)/governance/role-mining/+page.svelte (simulation list with status badges, create button, link to detail)
- [x] T058 [US5] Create simulation detail server load in src/routes/(app)/governance/role-mining/simulations/[id]/+page.server.ts (load simulation detail)
- [x] T059 [US5] Create simulation detail page in src/routes/(app)/governance/role-mining/simulations/[id]/+page.svelte (simulation info with changes, status badge, impact view with affected_users/access_gained/access_lost, execute/apply/cancel buttons based on status)
- [x] T060 [US5] Create simulation detail page tests in src/routes/(app)/governance/role-mining/simulations/[id]/simulation-detail.test.ts
- [x] T061 [US5] Update hub page tests for Simulations tab in src/routes/(app)/governance/role-mining/role-mining.test.ts

**Checkpoint**: Full simulation lifecycle: create → execute → apply/cancel

---

## Phase 8: Metrics (Bonus — discovered during backend research)

**Goal**: Admins can view per-role utilization metrics with trend indicators and trigger recalculation

**Independent Test**: View metrics list, check per-role detail, recalculate metrics

### BFF Proxies for Metrics

- [x] T062 [P] Create BFF proxy for metrics list in src/routes/api/governance/role-mining/metrics/+server.ts (GET with role_id/trend_direction/min_utilization/max_utilization/limit/offset)
- [x] T063 [P] Create BFF proxy for role metrics detail in src/routes/api/governance/role-mining/metrics/[roleId]/+server.ts (GET)
- [x] T064 [P] Create BFF proxy for metrics calculate in src/routes/api/governance/role-mining/metrics/calculate/+server.ts (POST with optional role_ids)

### Components for Metrics

- [x] T065 [P] Create metrics-card component in src/lib/components/role-mining/metrics-card.svelte (displays role_id, utilization_rate as bar, coverage_rate, user_count/active_user_count, trend_direction arrow icon)
- [x] T066 [P] Create metrics-card tests in src/lib/components/role-mining/metrics-card.test.ts

### UI Integration for Metrics

- [x] T067 Add Metrics tab to hub page in src/routes/(app)/governance/role-mining/+page.svelte (metrics list with metrics-card components, recalculate button, trend_direction filter)
- [x] T068 Update hub page tests for Metrics tab in src/routes/(app)/governance/role-mining/role-mining.test.ts

**Checkpoint**: Role metrics viewable with recalculation capability

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar navigation, final integration, cleanup

- [x] T069 Add "Role Mining" sidebar navigation item under Governance section in src/routes/(app)/+layout.svelte (admin-only, after existing governance items, lucide icon)
- [x] T070 Run svelte-check and fix any TypeScript errors
- [x] T071 Run full test suite (npx vitest run) and fix any failures
- [x] T072 Run quickstart.md E2E validation scenarios via Chrome DevTools MCP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (types + schemas)
- **Phases 3-4 (US1-US2, both P1)**: Depend on Phase 2 — should be sequential (US1→US2) since US2 adds to job detail page
- **Phases 5-6 (US3-US4, both P2)**: Depend on Phase 2 + job-selector from US3 — sequential (US3→US4)
- **Phase 7 (US5, P3)**: Depends on Phase 2 only — can run in parallel with US3/US4
- **Phase 8 (Metrics)**: Depends on Phase 2 only — can run in parallel with other stories
- **Phase 9 (Polish)**: Depends on all feature phases

### User Story Dependencies

- **US1 (P1)**: Foundation only — creates hub, job CRUD, job detail page
- **US2 (P1)**: Builds on US1 — adds candidates to job detail page
- **US3 (P2)**: Foundation + US1 hub — adds Patterns/Privileges tabs with job-selector
- **US4 (P2)**: Foundation + US3 job-selector — adds Consolidation tab
- **US5 (P3)**: Foundation + US1 hub — adds Simulations tab + detail page
- **Metrics**: Foundation + US1 hub — adds Metrics tab

### Parallel Opportunities

**Phase 1** (all parallelizable):
```
T001 (types) | T002 (schemas) — parallel after T001
T003 (schema tests) — after T002
```

**Phase 2** (all parallelizable):
```
T004 (server API) + T006 (client API) — parallel
T005 (server tests) + T007 (client tests) — parallel after their APIs
```

**Phase 3 US1 BFF** (all parallelizable):
```
T008 + T009 + T010 — 3 BFF proxies in parallel
T011 + T012 — component + tests in parallel
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (types, schemas)
2. Complete Phase 2: Foundation (API clients)
3. Complete Phase 3: US1 (job CRUD, hub page, create page, detail page)
4. **STOP and VALIDATE**: Can create, run, cancel, delete mining jobs

### Incremental Delivery

1. Setup + Foundation → API layer ready
2. US1 (Jobs) → Hub + job management → MVP
3. US2 (Candidates) → Promote/dismiss from job detail
4. US3 (Patterns + Privileges) → Analytical tabs with review
5. US4 (Consolidation) → Consolidation tab
6. US5 (Simulations) → Simulation lifecycle
7. Metrics → Role utilization tracking
8. Polish → Sidebar, tests, E2E

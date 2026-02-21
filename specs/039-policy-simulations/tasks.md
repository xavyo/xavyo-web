# Tasks: Policy Simulations & What-If Analysis

**Input**: Design documents from `/specs/039-policy-simulations/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add simulation types, schemas, API clients, and shared components

- [x] T001 [P] Add all simulation TypeScript types to src/lib/api/types.ts (PolicySimulation, PolicySimulationResult, ImpactSummary, BatchSimulation, BatchSimulationResult, BatchImpactSummary, FilterCriteria, ChangeSpec, AccessItem, SimulationComparison, ComparisonSummary, DeltaResults, DeltaEntry, ModifiedEntry, and all enums)
- [x] T002 [P] Create Zod validation schemas in src/lib/schemas/simulations.ts (createPolicySimulationSchema, createBatchSimulationSchema, createComparisonSchema, applyBatchSchema, updateNotesSchema, filterCriteriaSchema, changeSpecSchema)
- [x] T003 [P] Create server-side API client in src/lib/api/simulations.ts (all 29 endpoint functions: policy CRUD+lifecycle, batch CRUD+lifecycle+apply, comparison CRUD)
- [x] T004 [P] Create client-side API client in src/lib/api/simulations-client.ts (client-side fetch wrappers for actions: execute, cancel, archive, restore, apply, delete, notes update)
- [x] T005 [P] Create schema tests in src/lib/schemas/simulations.test.ts
- [x] T006 [P] Create server API client tests in src/lib/api/simulations.test.ts
- [x] T007 [P] Create client API tests in src/lib/api/simulations-client.test.ts

**Checkpoint**: Types, schemas, and API clients ready

---

## Phase 2: Foundational (BFF Proxies)

**Purpose**: BFF proxy endpoints that MUST be complete before any page can work

**CRITICAL**: No page work can begin until BFF proxies exist

- [x] T008 [P] Create BFF proxy src/routes/api/governance/simulations/policy/+server.ts (GET list + POST create)
- [x] T009 [P] Create BFF proxy src/routes/api/governance/simulations/policy/[id]/+server.ts (GET detail + DELETE)
- [x] T010 [P] Create BFF proxy src/routes/api/governance/simulations/policy/[id]/execute/+server.ts (POST)
- [x] T011 [P] Create BFF proxy src/routes/api/governance/simulations/policy/[id]/cancel/+server.ts (POST)
- [x] T012 [P] Create BFF proxy src/routes/api/governance/simulations/policy/[id]/archive/+server.ts (POST)
- [x] T013 [P] Create BFF proxy src/routes/api/governance/simulations/policy/[id]/restore/+server.ts (POST)
- [x] T014 [P] Create BFF proxy src/routes/api/governance/simulations/policy/[id]/notes/+server.ts (PATCH)
- [x] T015 [P] Create BFF proxy src/routes/api/governance/simulations/policy/[id]/results/+server.ts (GET)
- [x] T016 [P] Create BFF proxy src/routes/api/governance/simulations/policy/[id]/staleness/+server.ts (GET)
- [x] T017 [P] Create BFF proxy src/routes/api/governance/simulations/policy/[id]/export/+server.ts (GET)
- [x] T018 [P] Create BFF proxy src/routes/api/governance/simulations/batch/+server.ts (GET list + POST create)
- [x] T019 [P] Create BFF proxy src/routes/api/governance/simulations/batch/[id]/+server.ts (GET detail + DELETE)
- [x] T020 [P] Create BFF proxy src/routes/api/governance/simulations/batch/[id]/execute/+server.ts (POST)
- [x] T021 [P] Create BFF proxy src/routes/api/governance/simulations/batch/[id]/apply/+server.ts (POST)
- [x] T022 [P] Create BFF proxy src/routes/api/governance/simulations/batch/[id]/cancel/+server.ts (POST)
- [x] T023 [P] Create BFF proxy src/routes/api/governance/simulations/batch/[id]/archive/+server.ts (POST)
- [x] T024 [P] Create BFF proxy src/routes/api/governance/simulations/batch/[id]/restore/+server.ts (POST)
- [x] T025 [P] Create BFF proxy src/routes/api/governance/simulations/batch/[id]/notes/+server.ts (PATCH)
- [x] T026 [P] Create BFF proxy src/routes/api/governance/simulations/batch/[id]/results/+server.ts (GET)
- [x] T027 [P] Create BFF proxy src/routes/api/governance/simulations/batch/[id]/export/+server.ts (GET)
- [x] T028 [P] Create BFF proxy src/routes/api/governance/simulations/comparisons/+server.ts (GET list + POST create)
- [x] T029 [P] Create BFF proxy src/routes/api/governance/simulations/comparisons/[id]/+server.ts (GET detail + DELETE)
- [x] T030 [P] Create BFF proxy src/routes/api/governance/simulations/comparisons/[id]/export/+server.ts (GET)

**Checkpoint**: All 29 BFF proxies ready — pages can now be built

---

## Phase 3: User Story 1 — Policy Simulation CRUD & Execution (Priority: P1)

**Goal**: Admins create policy simulations (SoD/birthright), execute them, view per-user impact results with severity breakdown

**Independent Test**: Create a simulation, execute it, filter results by impact type, delete it

### Shared Components for US1

- [x] T031 [P] [US1] Create simulation-status-badge component in src/lib/components/simulations/simulation-status-badge.svelte (status + severity + impact type badges)
- [x] T032 [P] [US1] Create impact-summary-cards component in src/lib/components/simulations/impact-summary-cards.svelte (total analyzed, affected, by-severity, by-impact-type cards)
- [x] T033 [P] [US1] Create policy-results-table component in src/lib/components/simulations/policy-results-table.svelte (paginated per-user results with impact_type and severity badges, filter by impact_type)
- [x] T034 [P] [US1] Create export-button component in src/lib/components/simulations/export-button.svelte (dropdown: JSON/CSV, triggers download)
- [x] T035 [P] [US1] Create component tests in src/lib/components/simulations/simulation-status-badge.test.ts
- [x] T036 [P] [US1] Create component tests in src/lib/components/simulations/impact-summary-cards.test.ts
- [x] T037 [P] [US1] Create component tests in src/lib/components/simulations/policy-results-table.test.ts
- [x] T038 [P] [US1] Create component tests in src/lib/components/simulations/export-button.test.ts

### Pages for US1

- [x] T039 [US1] Create simulation hub page src/routes/(app)/governance/simulations/+page.server.ts (load policy simulations list + batch simulations list)
- [x] T040 [US1] Create simulation hub page src/routes/(app)/governance/simulations/+page.svelte (3-tab layout: Policy, Batch, Comparisons — with policy list table, empty states, create button)
- [x] T041 [US1] Create policy simulation create page src/routes/(app)/governance/simulations/policy/create/+page.server.ts (form action to create policy simulation)
- [x] T042 [US1] Create policy simulation create page src/routes/(app)/governance/simulations/policy/create/+page.svelte (form: name, type select, policy_id, policy_config textarea)
- [x] T043 [US1] Create policy simulation detail page src/routes/(app)/governance/simulations/policy/[id]/+page.server.ts (load simulation + results + staleness)
- [x] T044 [US1] Create policy simulation detail page src/routes/(app)/governance/simulations/policy/[id]/+page.svelte (detail header, impact summary cards, results table, execute/cancel/delete actions)
- [x] T045 [US1] Add "Simulations" sidebar nav entry in src/routes/(app)/+layout.svelte (under Governance section, admin-only)
- [x] T046 [P] [US1] Create hub page tests in src/routes/(app)/governance/simulations/simulations-hub.test.ts
- [x] T047 [P] [US1] Create policy create page tests in src/routes/(app)/governance/simulations/policy/create/policy-create.test.ts
- [x] T048 [P] [US1] Create policy detail page tests in src/routes/(app)/governance/simulations/policy/[id]/policy-detail.test.ts

**Checkpoint**: Policy simulation CRUD, execution, and result viewing fully functional

---

## Phase 4: User Story 2 — Batch Simulation CRUD & Execution (Priority: P1)

**Goal**: Admins create batch simulations (role/entitlement add/remove), execute to preview per-user access changes with scope warnings

**Independent Test**: Create a batch simulation with filter criteria, execute it, view per-user access gained/lost

### Components for US2

- [x] T049 [P] [US2] Create filter-criteria-builder component in src/lib/components/simulations/filter-criteria-builder.svelte (form fields: department, status, role_ids, entitlement_ids, title, metadata)
- [x] T050 [P] [US2] Create batch-results-table component in src/lib/components/simulations/batch-results-table.svelte (per-user access gained/lost/warnings table with filter by has_warnings)
- [x] T051 [P] [US2] Create component tests in src/lib/components/simulations/filter-criteria-builder.test.ts
- [x] T052 [P] [US2] Create component tests in src/lib/components/simulations/batch-results-table.test.ts

### Pages for US2

- [x] T053 [US2] Create batch simulation create page src/routes/(app)/governance/simulations/batch/create/+page.server.ts (form action with filter_criteria + change_spec)
- [x] T054 [US2] Create batch simulation create page src/routes/(app)/governance/simulations/batch/create/+page.svelte (form: name, batch_type select, selection_mode toggle, user_ids or filter_criteria, change_spec)
- [x] T055 [US2] Create batch simulation detail page src/routes/(app)/governance/simulations/batch/[id]/+page.server.ts (load batch sim + results)
- [x] T056 [US2] Create batch simulation detail page src/routes/(app)/governance/simulations/batch/[id]/+page.svelte (detail header, scope warning banner, batch impact summary, results table, execute/cancel/delete)
- [x] T057 [US2] Update hub page batch tab in src/routes/(app)/governance/simulations/+page.svelte (batch list table with type/status badges, create button)
- [x] T058 [P] [US2] Create batch create page tests in src/routes/(app)/governance/simulations/batch/create/batch-create.test.ts
- [x] T059 [P] [US2] Create batch detail page tests in src/routes/(app)/governance/simulations/batch/[id]/batch-detail.test.ts

**Checkpoint**: Batch simulation CRUD with filter criteria and execution fully functional

---

## Phase 5: User Story 3 — Apply Batch Changes to Production (Priority: P2)

**Goal**: After reviewing batch results, apply changes to production with 2-step confirmation (justification + scope acknowledgment)

**Independent Test**: Click "Apply to Production" on executed batch sim, fill justification, acknowledge scope, confirm — status changes to "Applied"

### Components for US3

- [x] T060 [P] [US3] Create apply-dialog component in src/lib/components/simulations/apply-dialog.svelte (dialog with justification textarea + scope acknowledgment checkbox + confirm button)
- [x] T061 [P] [US3] Create component tests in src/lib/components/simulations/apply-dialog.test.ts

### Pages for US3

- [x] T062 [US3] Add apply action to batch detail page src/routes/(app)/governance/simulations/batch/[id]/+page.svelte (Apply to Production button, disabled when not executed, opens apply-dialog)
- [x] T063 [P] [US3] Create apply action tests in src/routes/(app)/governance/simulations/batch/[id]/batch-apply.test.ts

**Checkpoint**: Full batch lifecycle: create → execute → review → apply to production

---

## Phase 6: User Story 4 — Simulation Comparisons (Priority: P2)

**Goal**: Create side-by-side comparisons of two simulations or simulation-vs-current, view delta summary and detailed results

**Independent Test**: Create comparison between two executed simulations, view delta summary cards and delta table

### Components for US4

- [x] T064 [P] [US4] Create delta-view component in src/lib/components/simulations/delta-view.svelte (summary cards: users in both/only A/only B/different, delta table with added/removed/modified entries)
- [x] T065 [P] [US4] Create component tests in src/lib/components/simulations/delta-view.test.ts

### Pages for US4

- [x] T066 [US4] Create comparison create page src/routes/(app)/governance/simulations/comparisons/create/+page.server.ts (form action to create comparison)
- [x] T067 [US4] Create comparison create page src/routes/(app)/governance/simulations/comparisons/create/+page.svelte (form: name, comparison_type, simulation_a select, simulation_b select)
- [x] T068 [US4] Create comparison detail page src/routes/(app)/governance/simulations/comparisons/[id]/+page.server.ts (load comparison with delta results)
- [x] T069 [US4] Create comparison detail page src/routes/(app)/governance/simulations/comparisons/[id]/+page.svelte (summary cards, delta-view, export, delete)
- [x] T070 [US4] Update hub page comparisons tab in src/routes/(app)/governance/simulations/+page.svelte (comparison list with type badges, create button, delete)
- [x] T071 [P] [US4] Create comparison create page tests in src/routes/(app)/governance/simulations/comparisons/create/comparison-create.test.ts
- [x] T072 [P] [US4] Create comparison detail page tests in src/routes/(app)/governance/simulations/comparisons/[id]/comparison-detail.test.ts

**Checkpoint**: Comparison workflow: create between two sims, view delta, delete

---

## Phase 7: User Story 5 — Simulation Lifecycle & Export (Priority: P3)

**Goal**: Archive/restore simulations, staleness detection, notes editing, export to JSON/CSV

**Independent Test**: Archive simulation (hidden from list), restore, check staleness indicator, edit notes, export CSV/JSON

### Implementation for US5

- [x] T073 [US5] Add archive/restore actions to policy detail page src/routes/(app)/governance/simulations/policy/[id]/+page.svelte
- [x] T074 [US5] Add archive/restore actions to batch detail page src/routes/(app)/governance/simulations/batch/[id]/+page.svelte
- [x] T075 [US5] Add staleness indicator to policy detail page (check on load, show banner if stale with re-execute suggestion)
- [x] T076 [US5] Add staleness indicator to batch detail page
- [x] T077 [US5] Add notes editing to policy detail page (inline editable textarea with save)
- [x] T078 [US5] Add notes editing to batch detail page
- [x] T079 [US5] Add export buttons to policy detail page (JSON/CSV download via BFF proxy)
- [x] T080 [US5] Add export buttons to batch detail page
- [x] T081 [US5] Add export button to comparison detail page
- [x] T082 [US5] Add "Show Archived" toggle to hub policy and batch tabs (filter archived simulations)
- [x] T083 [P] [US5] Create lifecycle + export tests in src/routes/(app)/governance/simulations/lifecycle-export.test.ts

**Checkpoint**: Full lifecycle management and export for all simulation types

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, sidebar nav, overall verification

- [x] T084 Run npm run check — fix any TypeScript errors
- [x] T085 Run npm run test:unit — fix any failing tests
- [x] T086 Run quickstart.md E2E validation via Chrome DevTools MCP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — all tasks parallelizable
- **Phase 2 (BFF Proxies)**: Depends on T003 (API client) — all proxies parallelizable
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 3 (hub page exists)
- **Phase 5 (US3)**: Depends on Phase 4 (batch detail page exists)
- **Phase 6 (US4)**: Depends on Phase 3 (hub page exists)
- **Phase 7 (US5)**: Depends on Phases 3, 4, 6 (detail pages exist)
- **Phase 8 (Polish)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Independent — core policy simulation
- **US2 (P1)**: Depends on US1 hub page existing (adds batch tab content)
- **US3 (P2)**: Depends on US2 batch detail page
- **US4 (P2)**: Depends on US1 hub page existing (adds comparisons tab content)
- **US5 (P3)**: Depends on US1, US2, US4 detail pages existing

### Parallel Opportunities

Phase 1: T001-T007 all parallel (different files)
Phase 2: T008-T030 all parallel (different BFF proxy files)
Phase 3: T031-T038 parallel (different components), T046-T048 parallel (different test files)
Phase 4: T049-T052 parallel, T058-T059 parallel
Phase 5: T060-T061 parallel
Phase 6: T064-T065 parallel, T071-T072 parallel

---

## Implementation Strategy

### MVP First (US1 Only)
1. Complete Phase 1: Types + schemas + API clients
2. Complete Phase 2: All BFF proxies
3. Complete Phase 3: Policy simulation CRUD + execute + results
4. **VALIDATE**: E2E test policy simulation workflow

### Incremental Delivery
1. Phases 1-3 → Policy simulations working (MVP)
2. Phase 4 → Add batch simulations
3. Phase 5 → Add batch apply to production
4. Phase 6 → Add simulation comparisons
5. Phase 7 → Add lifecycle management + export
6. Phase 8 → Polish and final verification

---

## Summary

- **Total tasks**: 86
- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (BFF Proxies)**: 23 tasks
- **Phase 3 (US1)**: 18 tasks
- **Phase 4 (US2)**: 11 tasks
- **Phase 5 (US3)**: 4 tasks
- **Phase 6 (US4)**: 9 tasks
- **Phase 7 (US5)**: 11 tasks
- **Phase 8 (Polish)**: 3 tasks

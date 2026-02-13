# Tasks: Provisioning Operations & Reconciliation

**Input**: Design documents from `/specs/021-provisioning-reconciliation/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are included per project convention (Vitest + @testing-library/svelte).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types, Schemas, API Clients)

**Purpose**: Add all TypeScript types, Zod schemas, and server/client API clients needed by all user stories.

- [ ] T001 Add provisioning/reconciliation types to `src/lib/api/types.ts` — ProvisioningOperation, ExecutionAttempt, OperationLog, ProvisioningConflict, QueueStatistics, ReconciliationRun, ReconciliationReport, DiscrepancySummary, ActionSummary, MismatchedAttribute, PerformanceMetrics, Discrepancy, RemediationResult, ReconciliationSchedule, ReconciliationAction, DiscrepancyTrendPoint, and all enums (OperationType, OperationStatus, DiscrepancyType, RemediationAction, RemediationDirection, ResolutionStatus, ConflictOutcome, ScheduleFrequency, ReconciliationMode, ReconciliationRunStatus)
- [ ] T002 Create Zod schemas in `src/lib/schemas/operations.ts` — resolveOperationSchema (resolution_notes), triggerOperationSchema, resolveConflictSchema (outcome, notes), triggerRunSchema (mode, dry_run), remediateDiscrepancySchema (action, direction, identity_id, dry_run), bulkRemediateSchema (items array, dry_run), createScheduleSchema (mode, frequency, day_of_week, day_of_month, hour_of_day, enabled)
- [ ] T003 [P] Create server-side operations API client `src/lib/api/operations.ts` — listOperations, triggerOperation, getOperation, getOperationStats, getOperationsDlq, retryOperation, cancelOperation, resolveOperation, getOperationLogs, getOperationAttempts, listConflicts, getConflict, resolveConflict
- [ ] T004 [P] Create server-side reconciliation API client `src/lib/api/reconciliation.ts` — triggerRun, listRuns, getRun, cancelRun, resumeRun, getRunReport, listDiscrepancies, getDiscrepancy, remediateDiscrepancy, bulkRemediate, previewRemediation, ignoreDiscrepancy, listReconciliationActions, getSchedule, upsertSchedule, deleteSchedule, enableSchedule, disableSchedule, listAllSchedules, getDiscrepancyTrend
- [ ] T005 [P] Create client-side operations API `src/lib/api/operations-client.ts` — fetchOperations, fetchOperationStats, fetchOperationsDlq, retryOperationClient, cancelOperationClient, resolveOperationClient, fetchConflicts, resolveConflictClient
- [ ] T006 [P] Create client-side reconciliation API `src/lib/api/reconciliation-client.ts` — fetchRuns, triggerRunClient, fetchDiscrepancies, remediateClient, bulkRemediateClient, previewClient, ignoreClient, fetchSchedule, fetchAllSchedules, fetchTrend

**Checkpoint**: All types, schemas, and API clients ready.

---

## Phase 2: Foundational (BFF Proxies + Shared Components)

**Purpose**: BFF proxy endpoints and shared UI components needed by multiple user stories.

**⚠️ CRITICAL**: No page work can begin until proxies and shared components are complete.

### BFF Proxy Endpoints — Operations

- [ ] T007 [P] Create `src/routes/api/operations/+server.ts` — GET (list), POST (trigger)
- [ ] T008 [P] Create `src/routes/api/operations/stats/+server.ts` — GET stats
- [ ] T009 [P] Create `src/routes/api/operations/dlq/+server.ts` — GET DLQ list
- [ ] T010 [P] Create `src/routes/api/operations/[id]/+server.ts` — GET detail
- [ ] T011 [P] Create `src/routes/api/operations/[id]/retry/+server.ts` — POST retry
- [ ] T012 [P] Create `src/routes/api/operations/[id]/cancel/+server.ts` — POST cancel
- [ ] T013 [P] Create `src/routes/api/operations/[id]/resolve/+server.ts` — POST resolve
- [ ] T014 [P] Create `src/routes/api/operations/[id]/logs/+server.ts` — GET logs
- [ ] T015 [P] Create `src/routes/api/operations/[id]/attempts/+server.ts` — GET attempts

### BFF Proxy Endpoints — Conflicts

- [ ] T016 [P] Create `src/routes/api/operations/conflicts/+server.ts` — GET list
- [ ] T017 [P] Create `src/routes/api/operations/conflicts/[id]/+server.ts` — GET detail
- [ ] T018 [P] Create `src/routes/api/operations/conflicts/[id]/resolve/+server.ts` — POST resolve

### BFF Proxy Endpoints — Reconciliation (per-connector)

- [ ] T019 [P] Create `src/routes/api/connectors/[id]/reconciliation/runs/+server.ts` — GET list, POST trigger
- [ ] T020 [P] Create `src/routes/api/connectors/[id]/reconciliation/runs/[runId]/+server.ts` — GET detail
- [ ] T021 [P] Create `src/routes/api/connectors/[id]/reconciliation/runs/[runId]/cancel/+server.ts` — POST
- [ ] T022 [P] Create `src/routes/api/connectors/[id]/reconciliation/runs/[runId]/resume/+server.ts` — POST
- [ ] T023 [P] Create `src/routes/api/connectors/[id]/reconciliation/runs/[runId]/report/+server.ts` — GET
- [ ] T024 [P] Create `src/routes/api/connectors/[id]/reconciliation/discrepancies/+server.ts` — GET list
- [ ] T025 [P] Create `src/routes/api/connectors/[id]/reconciliation/discrepancies/[discrepancyId]/+server.ts` — GET detail
- [ ] T026 [P] Create `src/routes/api/connectors/[id]/reconciliation/discrepancies/[discrepancyId]/remediate/+server.ts` — POST
- [ ] T027 [P] Create `src/routes/api/connectors/[id]/reconciliation/discrepancies/[discrepancyId]/ignore/+server.ts` — POST
- [ ] T028 [P] Create `src/routes/api/connectors/[id]/reconciliation/discrepancies/bulk-remediate/+server.ts` — POST
- [ ] T029 [P] Create `src/routes/api/connectors/[id]/reconciliation/discrepancies/preview/+server.ts` — POST
- [ ] T030 [P] Create `src/routes/api/connectors/[id]/reconciliation/actions/+server.ts` — GET
- [ ] T031 [P] Create `src/routes/api/connectors/[id]/reconciliation/schedule/+server.ts` — GET, PUT, DELETE
- [ ] T032 [P] Create `src/routes/api/connectors/[id]/reconciliation/schedule/enable/+server.ts` — POST
- [ ] T033 [P] Create `src/routes/api/connectors/[id]/reconciliation/schedule/disable/+server.ts` — POST

### BFF Proxy Endpoints — Global Reconciliation

- [ ] T034 [P] Create `src/routes/api/reconciliation/schedules/+server.ts` — GET all schedules
- [ ] T035 [P] Create `src/routes/api/reconciliation/trend/+server.ts` — GET trend data

### Shared Components

- [ ] T036 [P] Create `src/lib/components/operations/operation-status-badge.svelte` — badge with color mapping (pending=gray, in_progress=blue, completed=green, failed=red, dead_letter=amber, awaiting_system=purple, resolved=teal, cancelled=muted)
- [ ] T037 [P] Create `src/lib/components/operations/operation-type-badge.svelte` — badge for create/update/delete
- [ ] T038 [P] Create `src/lib/components/operations/discrepancy-type-badge.svelte` — badge with color mapping (missing=red, orphan=orange, mismatch=yellow, collision=purple, unlinked=blue, deleted=gray)
- [ ] T039 [P] Create `src/lib/components/operations/execution-attempts.svelte` — table showing attempt_number, started_at, completed_at, success, error_code, error_message, duration_ms
- [ ] T040 [P] Create `src/lib/components/operations/queue-stats-cards.svelte` — cards for pending, in_progress, completed, failed, dead_letter, awaiting_system, avg_processing_time_secs
- [ ] T041 [P] Create `src/lib/components/operations/trend-chart.svelte` — simple HTML/CSS bar chart from DiscrepancyTrendPoint[] array

**Checkpoint**: Foundation ready — all proxies and components available for page implementation.

---

## Phase 3: User Story 1 — Operations Queue & Detail (Priority: P1) 🎯 MVP

**Goal**: Admin can list, filter, and drill into individual provisioning operations. Can retry, cancel, or resolve operations.

**Independent Test**: Navigate to /connectors/operations, filter by status/connector/type/date, click operation row, perform retry/cancel/resolve.

### Implementation for User Story 1

- [ ] T042 [US1] Create `src/routes/(app)/connectors/operations/+page.server.ts` — load operations list with filters (connector_id, status, operation_type, from_date, to_date), load stats, load connector list for filter dropdown
- [ ] T043 [US1] Create `src/routes/(app)/connectors/operations/+page.svelte` — operations queue page with QueueStatsCards at top, DataTable with OperationStatusBadge/OperationTypeBadge, filter dropdowns (connector, status, type), date range inputs, pagination, link rows to detail
- [ ] T044 [US1] Create `src/routes/(app)/connectors/operations/[id]/+page.server.ts` — load operation detail, execution attempts, operation logs. Form actions: retry, cancel, resolve (with resolution_notes)
- [ ] T045 [US1] Create `src/routes/(app)/connectors/operations/[id]/+page.svelte` — operation detail page with status badge, type badge, payload JSON display, error message, ExecutionAttempts component, logs timeline, action buttons (Retry for failed, Cancel for pending, Resolve dialog for dead_letter with notes textarea)

**Checkpoint**: Operations queue and detail fully functional with all actions.

---

## Phase 4: User Story 2 — Queue Statistics Dashboard (Priority: P1)

**Goal**: Admin sees at-a-glance queue health with per-connector filtering.

**Independent Test**: View stats cards on operations page, filter by connector, verify counts update.

### Implementation for User Story 2

- [ ] T046 [US2] Integrate QueueStatsCards into operations page `src/routes/(app)/connectors/operations/+page.svelte` with connector filter reactivity — stats reload when connector filter changes (use client-side fetch from operations-client.ts). Show "N/A" for avg time when no operations exist.

**Checkpoint**: Statistics dashboard integrated and reactive to connector filtering.

---

## Phase 5: User Story 3 — Dead Letter Queue Management (Priority: P2)

**Goal**: Dedicated DLQ view with retry and resolve actions for dead-letter operations.

**Independent Test**: Navigate to /connectors/operations/dlq, see DLQ operations with error details, retry one, resolve one with notes.

### Implementation for User Story 3

- [ ] T047 [US3] Create `src/routes/(app)/connectors/operations/dlq/+page.server.ts` — load DLQ operations with optional connector_id filter, pagination. Form actions: retry, resolve (with notes)
- [ ] T048 [US3] Create `src/routes/(app)/connectors/operations/dlq/+page.svelte` — DLQ page with DataTable showing operation type, connector name, error message, retry count, timestamps. Connector filter dropdown. "Retry" and "Resolve" action buttons per row. Resolve dialog with notes textarea. EmptyState when DLQ is empty.

**Checkpoint**: DLQ management complete.

---

## Phase 6: User Story 4 — Reconciliation Runs (Priority: P2)

**Goal**: Admin can trigger, list, view, cancel, and resume reconciliation runs per connector. Run detail shows full report.

**Independent Test**: Navigate to /connectors/[id]/reconciliation, trigger a run, view run list, click run for report, cancel/resume.

### Implementation for User Story 4

- [ ] T049 [US4] Create `src/routes/(app)/connectors/[id]/reconciliation/+page.server.ts` — load reconciliation runs list with filters (mode, status), pagination. Form action: trigger run (mode, dry_run)
- [ ] T050 [US4] Create `src/routes/(app)/connectors/[id]/reconciliation/+page.svelte` — reconciliation runs page with trigger form (mode select, dry_run checkbox, Start Run button), DataTable of runs with status badge, mode, accounts_processed, discrepancies_found, duration, dry_run indicator. Link rows to run detail.
- [ ] T051 [US4] Create `src/routes/(app)/connectors/[id]/reconciliation/runs/[runId]/+page.server.ts` — load run detail + report. Form actions: cancel (for running), resume (for paused)
- [ ] T052 [US4] Create `src/routes/(app)/connectors/[id]/reconciliation/runs/[runId]/+page.svelte` — run detail page with status, mode, dry_run flag, timestamps, statistics. Report section: discrepancy summary (by_type breakdown), action summary (by_action breakdown), top mismatched attributes table, performance metrics (duration, accounts/sec, API calls). Cancel/Resume buttons based on status. Link to discrepancies list.

**Checkpoint**: Reconciliation run management complete.

---

## Phase 7: User Story 5 — Discrepancy Management (Priority: P2)

**Goal**: Admin can list, filter, remediate, preview, ignore, and bulk-remediate discrepancies from reconciliation runs.

**Independent Test**: Navigate to discrepancies, filter by type/status, preview one, remediate one, ignore one, select multiple and bulk remediate.

### Implementation for User Story 5

- [ ] T053 [US5] Create `src/routes/(app)/connectors/[id]/reconciliation/discrepancies/+page.server.ts` — load discrepancies with filters (run_id, discrepancy_type, resolution_status), pagination. Form actions: remediate (action, direction, identity_id, dry_run), ignore, bulk-remediate
- [ ] T054 [US5] Create `src/routes/(app)/connectors/[id]/reconciliation/discrepancies/+page.svelte` — discrepancy list page with DataTable showing DiscrepancyTypeBadge, identity_id, external_uid, attribute_name, expected/actual values, resolution_status. Filter dropdowns (type, status). Checkbox selection for bulk operations. Toolbar with "Bulk Remediate" button (max 100). Individual row actions: Remediate dialog (action select, direction select), Preview button (fetches preview and shows changes), Ignore button. EmptyState when no discrepancies.

**Checkpoint**: Discrepancy management complete with individual and bulk actions.

---

## Phase 8: User Story 6 — Reconciliation Schedules (Priority: P3)

**Goal**: Admin can create, edit, enable/disable, delete per-connector schedules. Global view of all schedules.

**Independent Test**: Create a schedule, toggle enable/disable, edit frequency, delete, verify global view shows all.

### Implementation for User Story 6

- [ ] T055 [US6] Create `src/routes/(app)/connectors/[id]/reconciliation/schedule/+page.server.ts` — load schedule (or 404), form actions: create/update (upsert), delete, enable, disable
- [ ] T056 [US6] Create `src/routes/(app)/connectors/[id]/reconciliation/schedule/+page.svelte` — schedule page with form (mode select, frequency select, conditional day_of_week/day_of_month/hour_of_day inputs, cron_expression input for cron frequency, enabled toggle). Save/Delete buttons. Show last_run_at and next_run_at. EmptyState if no schedule exists with "Create Schedule" CTA.
- [ ] T057 [US6] Create `src/routes/(app)/connectors/reconciliation/+page.server.ts` — load all schedules + trend data
- [ ] T058 [US6] Create `src/routes/(app)/connectors/reconciliation/+page.svelte` — global reconciliation page with tab layout: Schedules tab (DataTable of all schedules with connector_name, mode, frequency, enabled status, last/next run timestamps, link to per-connector schedule), Trend tab (trend chart with connector filter and date range)

**Checkpoint**: Schedule management and global view complete.

---

## Phase 9: User Story 7 — Discrepancy Trend (Priority: P3)

**Goal**: Admin can view discrepancy trends over time with connector and date range filtering.

**Independent Test**: View trend chart on global reconciliation page, filter by connector, change date range.

### Implementation for User Story 7

- [ ] T059 [US7] Integrate trend chart into `src/routes/(app)/connectors/reconciliation/+page.svelte` — Trend tab with TrendChart component, connector filter dropdown (client-side fetch to update chart), date range inputs (from/to), EmptyState when no data. Fetch trend data via reconciliation-client.ts on filter change.

**Checkpoint**: Trend visualization complete.

---

## Phase 10: User Story 8 — Conflict Resolution (Priority: P3)

**Goal**: Admin can view and resolve provisioning conflicts between operations.

**Independent Test**: Navigate to /connectors/conflicts, view conflict list, click detail, resolve with outcome and notes.

### Implementation for User Story 8

- [ ] T060 [US8] Create `src/routes/(app)/connectors/conflicts/+page.server.ts` — load conflicts with filters (conflict_type, pending_only), pagination
- [ ] T061 [US8] Create `src/routes/(app)/connectors/conflicts/+page.svelte` — conflicts list page with DataTable showing conflict_type, affected_attributes (as tags), status, created_at. Filter by type and pending_only toggle. Link rows to detail. EmptyState when no conflicts.
- [ ] T062 [US8] Create `src/routes/(app)/connectors/conflicts/[id]/+page.server.ts` — load conflict detail with both operations. Form action: resolve (outcome, notes)
- [ ] T063 [US8] Create `src/routes/(app)/connectors/conflicts/[id]/+page.svelte` — conflict detail page showing conflict type, affected attributes, status, both linked operations (with links to operation detail), outcome (if resolved), notes. Resolve dialog with outcome select (applied/superseded/merged/rejected) and notes textarea. Only show resolve button for pending conflicts.

**Checkpoint**: Conflict resolution complete.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar navigation, test suite, final integration.

- [ ] T064 Update sidebar navigation in `src/routes/(app)/+layout.svelte` — add "Operations" section under Connectors with sub-items: Operations Queue (/connectors/operations), Dead Letter Queue (/connectors/operations/dlq), Conflicts (/connectors/conflicts), Reconciliation (/connectors/reconciliation). Admin-only visibility.
- [ ] T065 [P] Create tests for schemas `src/lib/schemas/operations.test.ts` — validate all schema definitions with valid/invalid inputs
- [ ] T066 [P] Create tests for operations API client `src/lib/api/operations.test.ts` — mock fetch, verify all endpoints
- [ ] T067 [P] Create tests for reconciliation API client `src/lib/api/reconciliation.test.ts` — mock fetch, verify all endpoints
- [ ] T068 [P] Create tests for operations client API `src/lib/api/operations-client.test.ts`
- [ ] T069 [P] Create tests for reconciliation client API `src/lib/api/reconciliation-client.test.ts`
- [ ] T070 [P] Create component tests for operation-status-badge `src/lib/components/operations/operation-status-badge.test.ts`
- [ ] T071 [P] Create component tests for operation-type-badge `src/lib/components/operations/operation-type-badge.test.ts`
- [ ] T072 [P] Create component tests for discrepancy-type-badge `src/lib/components/operations/discrepancy-type-badge.test.ts`
- [ ] T073 [P] Create component tests for queue-stats-cards `src/lib/components/operations/queue-stats-cards.test.ts`
- [ ] T074 [P] Create component tests for execution-attempts `src/lib/components/operations/execution-attempts.test.ts`
- [ ] T075 [P] Create component tests for trend-chart `src/lib/components/operations/trend-chart.test.ts`
- [ ] T076 [P] Create page tests for operations queue `src/routes/(app)/connectors/operations/operations.test.ts`
- [ ] T077 [P] Create page tests for operation detail `src/routes/(app)/connectors/operations/[id]/operation-detail.test.ts`
- [ ] T078 [P] Create page tests for DLQ `src/routes/(app)/connectors/operations/dlq/dlq.test.ts`
- [ ] T079 [P] Create page tests for reconciliation runs `src/routes/(app)/connectors/[id]/reconciliation/recon-runs.test.ts`
- [ ] T080 [P] Create page tests for run detail `src/routes/(app)/connectors/[id]/reconciliation/runs/[runId]/run-detail.test.ts`
- [ ] T081 [P] Create page tests for discrepancies `src/routes/(app)/connectors/[id]/reconciliation/discrepancies/discrepancies.test.ts`
- [ ] T082 [P] Create page tests for schedule `src/routes/(app)/connectors/[id]/reconciliation/schedule/schedule.test.ts`
- [ ] T083 [P] Create page tests for global reconciliation `src/routes/(app)/connectors/reconciliation/global-recon.test.ts`
- [ ] T084 [P] Create page tests for conflicts list `src/routes/(app)/connectors/conflicts/conflicts.test.ts`
- [ ] T085 [P] Create page tests for conflict detail `src/routes/(app)/connectors/conflicts/[id]/conflict-detail.test.ts`
- [ ] T086 Run `npm run check` — TypeScript + Svelte compilation passes
- [ ] T087 Run `npm run test:unit` — all tests pass
- [ ] T088 Run quickstart.md E2E validation with Chrome DevTools MCP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types + API clients) — BLOCKS all user stories
- **US1 Operations Queue (Phase 3)**: Depends on Phase 2
- **US2 Queue Statistics (Phase 4)**: Depends on Phase 3 (stats integrated into operations page)
- **US3 DLQ (Phase 5)**: Depends on Phase 2 (independent of US1/US2)
- **US4 Reconciliation Runs (Phase 6)**: Depends on Phase 2 (independent of US1-3)
- **US5 Discrepancies (Phase 7)**: Depends on Phase 2 (independent, but conceptually follows US4)
- **US6 Schedules (Phase 8)**: Depends on Phase 2 (independent of US1-5)
- **US7 Trend (Phase 9)**: Depends on Phase 8 (integrated into global reconciliation page)
- **US8 Conflicts (Phase 10)**: Depends on Phase 2 (independent of US1-7)
- **Polish (Phase 11)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependencies on other stories
- **US2 (P1)**: After US1 — stats are integrated into the operations page
- **US3 (P2)**: After Foundational — independent (separate /dlq route)
- **US4 (P2)**: After Foundational — independent (per-connector route)
- **US5 (P2)**: After Foundational — independent (per-connector discrepancy route)
- **US6 (P3)**: After Foundational — independent (per-connector + global schedule)
- **US7 (P3)**: After US6 — trend chart integrated into global reconciliation page
- **US8 (P3)**: After Foundational — independent (separate /conflicts route)

### Within Each User Story

- Server load file (+page.server.ts) before page file (+page.svelte)
- Form actions defined in server file, consumed by page
- Components from Phase 2 available for all pages

### Parallel Opportunities

- T003/T004/T005/T006 (API clients) can run in parallel
- All BFF proxy endpoints (T007-T035) can run in parallel
- All shared components (T036-T041) can run in parallel
- US3 (DLQ), US4 (Recon Runs), US5 (Discrepancies), US6 (Schedules), US8 (Conflicts) can all run in parallel after Phase 2
- All test tasks (T065-T085) can run in parallel

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Types, schemas, API clients
2. Complete Phase 2: BFF proxies + shared components
3. Complete Phase 3: Operations Queue & Detail (US1)
4. Complete Phase 4: Queue Statistics (US2)
5. **STOP and VALIDATE**: Test operations monitoring independently

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 + US2 (Operations) → MVP deployed
3. US3 (DLQ) → Recovery path added
4. US4 + US5 (Reconciliation) → Full reconciliation workflow
5. US6 + US7 (Schedules + Trend) → Automation & analytics
6. US8 (Conflicts) → Edge case handling
7. Polish → Tests, sidebar, E2E validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each phase completion
- Total tasks: 88
- Estimated new tests: ~80-100

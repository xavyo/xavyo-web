# Tasks: Identity Correlation Engine

**Input**: Design documents from `/specs/028-correlation-engine/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-routes.md

**Tests**: Required (Constitution Principle II: TDD mandatory)

**Organization**: Tasks grouped by user story. Connector-scoped features (US1-US3, US6) integrate into existing connector detail page. Global features (US4-US5, US7) use new governance correlation hub.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types, Schemas, API Clients)

**Purpose**: Core data types, validation schemas, and API client functions shared across all user stories

- [x] T001 Add correlation engine types to `src/lib/api/types.ts` — CorrelationRule, IdentityCorrelationRule, CorrelationThreshold, CorrelationJob, CorrelationCase, CorrelationCaseDetail, CorrelationCandidate, CorrelationStatistics, CorrelationTrends, DailyTrend, CorrelationAuditEvent, ValidateExpressionRequest/Response, and all request/response types per data-model.md
- [x] T002 [P] Create Zod validation schemas in `src/lib/schemas/correlation.ts` — createCorrelationRuleSchema, updateCorrelationRuleSchema, createIdentityCorrelationRuleSchema, updateIdentityCorrelationRuleSchema, upsertThresholdSchema (auto_confirm >= manual_review), validateExpressionSchema, confirmCaseSchema, rejectCaseSchema, createIdentityFromCaseSchema, reassignCaseSchema
- [x] T003 [P] Create schema tests in `src/lib/schemas/correlation.test.ts` — valid/invalid inputs for all 10 schemas, threshold cross-field validation, expression required when match_type is expression
- [x] T004 Create server-side API client in `src/lib/api/correlation.ts` — 24 functions per contracts/api-routes.md (rules CRUD, validate-expression, thresholds get/upsert, trigger/status jobs, cases list/get/confirm/reject/create-identity/reassign, identity rules CRUD, audit list/get, statistics get/trends)
- [x] T005 [P] Create server API client tests in `src/lib/api/correlation.test.ts` — mock fetch for all 24 functions, verify correct HTTP methods, paths, headers, error handling
- [x] T006 Create client-side API client in `src/lib/api/correlation-client.ts` — 24 client functions that call BFF proxy endpoints per contracts/api-routes.md
- [x] T007 [P] Create client API tests in `src/lib/api/correlation-client.test.ts` — mock fetch for all 24 client functions

**Checkpoint**: All types, schemas, and API functions ready. No UI yet.

---

## Phase 2: Foundational (BFF Proxy Endpoints)

**Purpose**: BFF proxy endpoints that ALL user stories depend on. Must complete before any UI work.

**CRITICAL**: No user story work can begin until this phase is complete.

### Connector-Scoped BFF Proxies

- [x] T008 [P] Create rules BFF proxy in `src/routes/api/connectors/[connectorId]/correlation/rules/+server.ts` — GET (list with match_type/is_active/tier/limit/offset filters) and POST (create, admin guard)
- [x] T009 [P] Create rule detail BFF proxy in `src/routes/api/connectors/[connectorId]/correlation/rules/[id]/+server.ts` — GET, PATCH (update, admin guard), DELETE (admin guard)
- [x] T010 [P] Create validate-expression BFF proxy in `src/routes/api/connectors/[connectorId]/correlation/rules/validate-expression/+server.ts` — POST (admin guard)
- [x] T011 [P] Create thresholds BFF proxy in `src/routes/api/connectors/[connectorId]/correlation/thresholds/+server.ts` — GET and PUT (upsert, admin guard)
- [x] T012 [P] Create evaluate BFF proxy in `src/routes/api/connectors/[connectorId]/correlation/evaluate/+server.ts` — POST (trigger job, admin guard)
- [x] T013 [P] Create job status BFF proxy in `src/routes/api/connectors/[connectorId]/correlation/jobs/[jobId]/+server.ts` — GET
- [x] T014 [P] Create statistics BFF proxy in `src/routes/api/connectors/[connectorId]/correlation/statistics/+server.ts` — GET with start_date/end_date params
- [x] T015 [P] Create trends BFF proxy in `src/routes/api/connectors/[connectorId]/correlation/statistics/trends/+server.ts` — GET with required start_date/end_date params

### Global BFF Proxies

- [x] T016 [P] Create cases list BFF proxy in `src/routes/api/governance/correlation/cases/+server.ts` — GET with status/connector_id/assigned_to/trigger_type/date/sort/limit/offset filters
- [x] T017 [P] Create case detail BFF proxy in `src/routes/api/governance/correlation/cases/[caseId]/+server.ts` — GET
- [x] T018 [P] Create case confirm BFF proxy in `src/routes/api/governance/correlation/cases/[caseId]/confirm/+server.ts` — POST (admin guard, body: candidate_id + reason)
- [x] T019 [P] Create case reject BFF proxy in `src/routes/api/governance/correlation/cases/[caseId]/reject/+server.ts` — POST (admin guard, body: reason)
- [x] T020 [P] Create case create-identity BFF proxy in `src/routes/api/governance/correlation/cases/[caseId]/create-identity/+server.ts` — POST (admin guard, body: reason)
- [x] T021 [P] Create case reassign BFF proxy in `src/routes/api/governance/correlation/cases/[caseId]/reassign/+server.ts` — POST (admin guard, body: assigned_to + reason)
- [x] T022 [P] Create identity rules BFF proxy in `src/routes/api/governance/correlation/identity-rules/+server.ts` — GET (list with filters) and POST (create, admin guard)
- [x] T023 [P] Create identity rule detail BFF proxy in `src/routes/api/governance/correlation/identity-rules/[id]/+server.ts` — GET, PUT (update, admin guard), DELETE (admin guard)
- [x] T024 [P] Create audit list BFF proxy in `src/routes/api/governance/correlation/audit/+server.ts` — GET with connector_id/event_type/outcome/date/actor_id/limit/offset filters
- [x] T025 [P] Create audit detail BFF proxy in `src/routes/api/governance/correlation/audit/[eventId]/+server.ts` — GET

**Checkpoint**: All 18 BFF proxy endpoints ready. UI implementation can begin.

---

## Phase 3: User Story 1 — Manage Correlation Rules per Connector (Priority: P1) MVP

**Goal**: Admins can create, view, edit, and delete correlation rules scoped to a connector via tabs on the connector detail page.

**Independent Test**: Navigate to connector detail → Correlation Rules tab → see rule list → create rule → edit → delete.

### Tests for User Story 1

- [x] T026 [P] [US1] Create rule-form component tests in `src/lib/components/correlation/rule-form.test.ts` — render form fields (name, source_attribute, target_attribute, match_type selector, algorithm selector for fuzzy, threshold, weight, expression for expression type, tier, is_definitive, normalize, priority), validate expression required when expression selected, submit calls create/update
- [x] T027 [P] [US1] Create rules-table component tests in `src/lib/components/correlation/rules-table.test.ts` — renders list with columns, empty state, delete confirmation dialog, edit triggers callback

### Implementation for User Story 1

- [x] T028 [P] [US1] Create rule-form component in `src/lib/components/correlation/rule-form.svelte` — Superforms form with all fields from CorrelationRule (name, source_attribute, target_attribute, match_type radio/select, algorithm dropdown shown conditionally for fuzzy, threshold 0-1 displayed as percentage, weight float input, expression textarea shown conditionally, tier number, is_definitive checkbox, normalize checkbox, priority number), "Test Expression" button calling validate-expression client API
- [x] T029 [P] [US1] Create rules-table component in `src/lib/components/correlation/rules-table.svelte` — DataTable displaying rules sorted by tier then priority, columns: name, source→target, match_type badge, threshold %, weight, tier, definitive flag, actions (edit/delete), empty state with "Add Rule" CTA, delete confirmation dialog
- [x] T030 [US1] Modify connector detail page `src/routes/(app)/connectors/[id]/+page.server.ts` — load correlation rules via listCorrelationRules() in page load, pass to page data
- [x] T031 [US1] Modify connector detail page `src/routes/(app)/connectors/[id]/+page.svelte` — add "Correlation Rules" tab rendering rules-table, "Add Rule" button opening rule-form in dialog/inline, edit rule opening rule-form pre-populated, handle create/update/delete via client-side API calls with toast feedback

**Checkpoint**: US1 complete — connector has a Correlation Rules tab with full CRUD.

---

## Phase 4: User Story 2 — Configure Correlation Thresholds (Priority: P1)

**Goal**: Admins configure auto-confirm and manual review thresholds plus tuning mode per connector.

**Independent Test**: Navigate to connector detail → Thresholds tab → set values → save → reload → verify persisted.

### Tests for User Story 2

- [x] T032 [P] [US2] Create threshold-form component tests in `src/lib/components/correlation/threshold-form.test.ts` — renders auto_confirm, manual_review inputs (displayed as %, stored as 0-1), tuning_mode toggle, include_deactivated checkbox, batch_size input, validation error when auto < manual, save calls upsert API

### Implementation for User Story 2

- [x] T033 [US2] Create threshold-form component in `src/lib/components/correlation/threshold-form.svelte` — form with auto_confirm_threshold (number input displayed as %, converts to 0-1), manual_review_threshold, tuning_mode switch, include_deactivated checkbox, batch_size number input, cross-field validation (auto >= manual), save button calling upsertCorrelationThresholdsClient
- [x] T034 [US2] Update connector detail page load in `src/routes/(app)/connectors/[id]/+page.server.ts` — also load thresholds via getCorrelationThresholds() (catch 404 for unconfigured)
- [x] T035 [US2] Update connector detail page `src/routes/(app)/connectors/[id]/+page.svelte` — add "Thresholds" tab rendering threshold-form with pre-loaded values, toast on save success/error

**Checkpoint**: US2 complete — connector has Thresholds tab with save/load.

---

## Phase 5: User Story 3 — Execute Correlation Jobs (Priority: P1)

**Goal**: Admins trigger batch correlation jobs and monitor status with polling.

**Independent Test**: Navigate to connector → Jobs tab → click "Run Correlation" → see status update → view results.

### Tests for User Story 3

- [x] T036 [P] [US3] Create job-status component tests in `src/lib/components/correlation/job-status.test.ts` — renders job status badge (running/completed/failed), progress bar, result summary (total, auto-confirmed, manual review, no-match, errors), "Run Correlation" button disabled when job running, polling behavior mock

### Implementation for User Story 3

- [x] T037 [US3] Create job-status component in `src/lib/components/correlation/job-status.svelte` — displays current/latest job status with badge, progress (processed/total), result summary cards when completed, "Run Correlation" button (disabled while running), uses setInterval polling (5s) via onMount to check job status, auto-stops polling when completed/failed
- [x] T038 [US3] Update connector detail page load in `src/routes/(app)/connectors/[id]/+page.server.ts` — no server-side job load needed (client-side polling handles it)
- [x] T039 [US3] Update connector detail page `src/routes/(app)/connectors/[id]/+page.svelte` — add "Correlation Jobs" tab rendering job-status component, trigger job via triggerCorrelationClient, store current job_id in $state for polling

**Checkpoint**: US3 complete — connector has Jobs tab with trigger + polling.

---

## Phase 6: User Story 4 — Review and Resolve Correlation Cases (Priority: P1)

**Goal**: Global case review queue with detail view and 4 resolution actions.

**Independent Test**: Navigate to governance/correlation → Cases tab → open case → see attributes + candidates → confirm match.

### Tests for User Story 4

- [x] T040 [P] [US4] Create candidate-card component tests in `src/lib/components/correlation/candidate-card.test.ts` — renders identity name, aggregate confidence as %, per-attribute score bars, deactivated badge, definitive match indicator, confirm/reject buttons
- [x] T041 [P] [US4] Create case-detail page tests in `src/routes/(app)/governance/correlation/cases/[caseId]/case-detail.test.ts` — renders account attributes, candidate list, confirm/reject/create-identity/reassign actions, empty state for no candidates, status badge

### Implementation for User Story 4

- [x] T042 [P] [US4] Create candidate-card component in `src/lib/components/correlation/candidate-card.svelte` — displays identity_display_name, aggregate_confidence as percentage bar, per_attribute_scores as key-value list with mini progress bars, is_deactivated warning badge, is_definitive_match highlight, "Confirm" and "Reject" buttons as props callbacks
- [x] T043 [US4] Create case detail page server in `src/routes/(app)/governance/correlation/cases/[caseId]/+page.server.ts` — load case detail via getCorrelationCase(), admin guard
- [x] T044 [US4] Create case detail page in `src/routes/(app)/governance/correlation/cases/[caseId]/+page.svelte` — PageHeader with case ID + status badge, left panel: account attributes (key-value list), right panel: candidates rendered as candidate-card components, action buttons: Confirm (needs candidate selection), Reject (needs reason input dialog), Create Identity (confirmation dialog with optional reason), Reassign (user search dialog with reason), all actions call client API + redirect back to cases list on success
- [x] T045 [US4] Create governance correlation hub page server in `src/routes/(app)/governance/correlation/+page.server.ts` — load cases list via listCorrelationCases({status: 'pending'}), admin guard
- [x] T046 [US4] Create governance correlation hub page in `src/routes/(app)/governance/correlation/+page.svelte` — tab layout with "Cases" as first tab (Identity Rules and Audit added in later phases), cases tab shows DataTable with columns: account_identifier, connector_name, trigger_type badge, candidate_count, highest_confidence %, status badge, created_at, row click navigates to case detail, status filter (pending/confirmed/rejected/identity_created), pagination

**Checkpoint**: US4 complete — global case queue + case detail with all 4 actions.

---

## Phase 7: User Story 5 — Manage Identity Correlation Rules (Priority: P2)

**Goal**: Tenant-wide identity correlation rules CRUD in the governance correlation hub.

**Independent Test**: Navigate to governance/correlation → Identity Rules tab → create rule → edit → delete.

### Tests for User Story 5

- [x] T047 [P] [US5] Create identity-rules-table component tests in `src/lib/components/correlation/identity-rules-table.test.ts` — renders list with columns (name, attribute, match_type, threshold, weight, active badge), empty state, create/edit/delete actions

### Implementation for User Story 5

- [x] T048 [US5] Create identity-rules-table component in `src/lib/components/correlation/identity-rules-table.svelte` — DataTable with columns: name, attribute, match_type badge, threshold %, weight, is_active toggle badge, actions (edit/delete), "Add Rule" button opens inline form (reuse similar pattern to rule-form but with single `attribute` field instead of source/target), delete with confirmation dialog
- [x] T049 [US5] Update governance correlation hub page server `src/routes/(app)/governance/correlation/+page.server.ts` — also load identity rules via listIdentityCorrelationRules()
- [x] T050 [US5] Update governance correlation hub page `src/routes/(app)/governance/correlation/+page.svelte` — add "Identity Rules" tab rendering identity-rules-table, handle CRUD via client-side API calls with toast feedback

**Checkpoint**: US5 complete — correlation hub has Identity Rules tab with full CRUD.

---

## Phase 8: User Story 6 — View Correlation Statistics (Priority: P2)

**Goal**: Per-connector statistics dashboard with summary cards and daily trends table.

**Independent Test**: Navigate to connector detail → Statistics tab → see metrics → view daily trends.

### Tests for User Story 6

- [x] T051 [P] [US6] Create statistics-cards component tests in `src/lib/components/correlation/statistics-cards.test.ts` — renders auto-confirmed/manual-review/no-match cards with counts + percentages, average confidence, queue depth, suggestions list, empty state
- [x] T052 [P] [US6] Create trends-table component tests in `src/lib/components/correlation/trends-table.test.ts` — renders daily trend rows with date, total, auto-confirmed, manual, no-match, avg confidence columns, empty state

### Implementation for User Story 6

- [x] T053 [P] [US6] Create statistics-cards component in `src/lib/components/correlation/statistics-cards.svelte` — summary cards grid: total_evaluated, auto-confirmed (count + %), manual review (count + %), no-match (count + %), average_confidence as %, review_queue_depth, suggestions displayed as info alert list
- [x] T054 [P] [US6] Create trends-table component in `src/lib/components/correlation/trends-table.svelte` — simple HTML table with daily_trends rows: date, total_evaluated, auto_confirmed, manual_review, no_match, average_confidence %, date range selector (last 7/14/30 days)
- [x] T055 [US6] Update connector detail page `src/routes/(app)/connectors/[id]/+page.svelte` — add "Statistics" tab rendering statistics-cards and trends-table, load stats + trends via client-side API on tab activation, date range selection triggers trends refetch

**Checkpoint**: US6 complete — connector has Statistics tab with summary + trends.

---

## Phase 9: User Story 7 — Browse Correlation Audit Trail (Priority: P3)

**Goal**: Filterable audit log of all correlation decisions in the governance correlation hub.

**Independent Test**: Navigate to governance/correlation → Audit tab → see events → filter by type → click entry → see detail.

### Tests for User Story 7

- [x] T056 [P] [US7] Create audit-table component tests in `src/lib/components/correlation/audit-table.test.ts` — renders event list with columns (timestamp, event_type badge, account, identity, confidence %, actor, outcome badge), filters (connector, event_type, date range), click opens detail, empty state

### Implementation for User Story 7

- [x] T057 [US7] Create audit-table component in `src/lib/components/correlation/audit-table.svelte` — DataTable with columns: created_at (formatted), event_type badge (auto_confirm=green, manual_confirm=blue, reject=red, create_identity=purple, reassign=orange), account_id, identity_id, confidence_score %, actor_type + actor_id, outcome badge, filter bar: connector_id select, event_type select, date range inputs, pagination, row click opens detail dialog/panel showing full audit event including rules_snapshot and thresholds_snapshot as JSON display
- [x] T058 [US7] Update governance correlation hub page server `src/routes/(app)/governance/correlation/+page.server.ts` — also load initial audit events via listCorrelationAuditEvents()
- [x] T059 [US7] Update governance correlation hub page `src/routes/(app)/governance/correlation/+page.svelte` — add "Audit" tab rendering audit-table, filter changes trigger client-side refetch, click event opens detail dialog with full snapshots

**Checkpoint**: US7 complete — correlation hub has Audit tab with filters and detail view.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Navigation, sidebar, type checks, and final integration

- [x] T060 Update sidebar navigation in `src/routes/(app)/+layout.svelte` — add "Correlation" entry under Governance section (admin-only, icon: GitCompare or Link), links to `/governance/correlation`
- [x] T061 Run `npm run check` — fix any TypeScript/Svelte errors across all new files
- [x] T062 Run `npm run test:unit` — ensure all existing + new tests pass (target: ~3200+ tests) — RESULT: 3601 tests pass across 217 files
- [x] T063 E2E test with Chrome DevTools MCP — navigate correlation hub, verify all 3 tabs render, test case detail, verify connector correlation tabs load, test rule CRUD flow, test threshold save/load, verify dark mode rendering — ALL PASSED

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (types) and T004/T006 (API clients) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — connector detail page modification
- **US2 (Phase 4)**: Depends on Phase 2 — connector detail page modification (can parallel with US1 since different tab)
- **US3 (Phase 5)**: Depends on Phase 2 — connector detail page modification (can parallel with US1/US2)
- **US4 (Phase 6)**: Depends on Phase 2 — creates the governance correlation hub page
- **US5 (Phase 7)**: Depends on US4 (T046 creates the hub page) — adds tab to hub
- **US6 (Phase 8)**: Depends on Phase 2 — connector detail page modification (can parallel with US1/US2/US3)
- **US7 (Phase 9)**: Depends on US4 (T046 creates the hub page) — adds tab to hub
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2
- **US2 (P1)**: Independent after Phase 2 (parallel with US1)
- **US3 (P1)**: Independent after Phase 2 (parallel with US1/US2)
- **US4 (P1)**: Independent after Phase 2 (creates hub page)
- **US5 (P2)**: Depends on US4 (hub page must exist)
- **US6 (P2)**: Independent after Phase 2 (parallel with US1-US4)
- **US7 (P3)**: Depends on US4 (hub page must exist)

### Within Each User Story

- Tests written FIRST (must FAIL before implementation)
- Components before page integration
- Page server load before page svelte
- Client-side actions after components

### Parallel Opportunities

- Phase 1: T002+T003 parallel, T005+T007 parallel
- Phase 2: ALL BFF proxies (T008-T025) can run in parallel
- US1+US2+US3+US6 can all run in parallel (different connector tabs)
- US4 must come before US5 and US7 (hub page creation)
- Within each story: test tasks marked [P] can run in parallel

---

## Parallel Example: Phase 2 (Maximum Parallelism)

```bash
# All 18 BFF proxy files can be created simultaneously:
T008: rules/+server.ts
T009: rules/[id]/+server.ts
T010: validate-expression/+server.ts
T011: thresholds/+server.ts
T012: evaluate/+server.ts
T013: jobs/[jobId]/+server.ts
T014: statistics/+server.ts
T015: statistics/trends/+server.ts
T016: cases/+server.ts
T017: cases/[caseId]/+server.ts
T018: cases/[caseId]/confirm/+server.ts
T019: cases/[caseId]/reject/+server.ts
T020: cases/[caseId]/create-identity/+server.ts
T021: cases/[caseId]/reassign/+server.ts
T022: identity-rules/+server.ts
T023: identity-rules/[id]/+server.ts
T024: audit/+server.ts
T025: audit/[eventId]/+server.ts
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (types, schemas, API clients)
2. Complete Phase 2: BFF proxies (all needed for any UI work)
3. Complete Phase 3: US1 — Correlation Rules on connector
4. Complete Phase 4: US2 — Thresholds on connector
5. **STOP and VALIDATE**: Test rules CRUD + threshold config independently

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Rules) + US2 (Thresholds) → Configuration MVP
3. US3 (Jobs) → Can trigger and monitor correlation
4. US4 (Cases) → Review queue for uncertain matches
5. US5 (Identity Rules) + US6 (Statistics) → Operational maturity
6. US7 (Audit) → Compliance coverage
7. Polish → Sidebar nav, E2E validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Backend match types: `exact`, `fuzzy`, `expression` only (NO `phonetic` — see research.md)
- Backend weights are floats (1.0), thresholds are 0-1 (display as % in UI)
- Identity rules use single `attribute` field (not source/target pair)
- Case "reassign" means reassign to different reviewer (not different identity)
- No job cancel endpoint exists in backend — removed from scope
- Statistics include `suggestions: string[]` from backend AI — display as info cards
- Total tasks: 63

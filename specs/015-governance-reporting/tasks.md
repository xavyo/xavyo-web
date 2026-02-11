# Tasks: Governance Reporting & Analytics

**Input**: Design documents from `/specs/015-governance-reporting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included (Constitution Principle II: TDD is mandatory)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3, US4)
- Exact file paths included

---

## Phase 1: Setup (Types, Schemas, API Clients)

**Purpose**: Create the foundational data types, validation schemas, and API client modules that all user stories depend on.

- [ ] T001 Add reporting types (ReportTemplate, GeneratedReport, ReportSchedule, enums, list responses) to `src/lib/api/types.ts`
- [ ] T002 [P] Create Zod validation schemas (createTemplateSchema, generateReportSchema, createScheduleSchema, cloneTemplateSchema, updateTemplateSchema, updateScheduleSchema) in `src/lib/schemas/governance-reporting.ts`
- [ ] T003 [P] Create schema tests (valid/invalid inputs for all schemas) in `src/lib/schemas/governance-reporting.test.ts`
- [ ] T004 Create server-side API client with all functions (listTemplates, getTemplate, createTemplate, updateTemplate, archiveTemplate, cloneTemplate, listReports, generateReport, getReport, getReportData, deleteReport, cleanupReports, listSchedules, getSchedule, createSchedule, updateSchedule, deleteSchedule, pauseSchedule, resumeSchedule) in `src/lib/api/governance-reporting.ts`
- [ ] T005 [P] Create server API client tests (mock fetch, verify URL/method/body for all functions) in `src/lib/api/governance-reporting.test.ts`
- [ ] T006 [P] Create client-side API (fetchTemplates, fetchReports, fetchReportData, generateReportClient, deleteReportClient, cleanupReportsClient, fetchSchedules, pauseScheduleClient, resumeScheduleClient, deleteScheduleClient, cloneTemplateClient, archiveTemplateClient) in `src/lib/api/governance-reporting-client.ts`
- [ ] T007 [P] Create client API tests (mock fetch, verify /api/ proxy calls) in `src/lib/api/governance-reporting-client.test.ts`

**Checkpoint**: Types, schemas, and API clients ready. All tests pass.

---

## Phase 2: Foundational (BFF Proxy Endpoints)

**Purpose**: Create all BFF proxy endpoints that forward browser requests to the backend. MUST complete before user story UI work.

**CRITICAL**: No page/component work can begin until these proxies exist.

### Template Proxies

- [ ] T008 [P] Create GET (list) + POST (create) proxy in `src/routes/api/governance/reports/templates/+server.ts`
- [ ] T009 [P] Create GET + PUT + DELETE proxy in `src/routes/api/governance/reports/templates/[id]/+server.ts`
- [ ] T010 [P] Create POST (clone) proxy in `src/routes/api/governance/reports/templates/[id]/clone/+server.ts`

### Report Proxies

- [ ] T011 [P] Create GET (list) + POST (generate) proxy in `src/routes/api/governance/reports/+server.ts`
- [ ] T012 [P] Create GET + DELETE proxy in `src/routes/api/governance/reports/[id]/+server.ts`
- [ ] T013 [P] Create GET (report data) proxy in `src/routes/api/governance/reports/[id]/data/+server.ts`
- [ ] T014 [P] Create POST (cleanup) proxy in `src/routes/api/governance/reports/cleanup/+server.ts`

### Schedule Proxies

- [ ] T015 [P] Create GET (list) + POST (create) proxy in `src/routes/api/governance/reports/schedules/+server.ts`
- [ ] T016 [P] Create GET + PUT + DELETE proxy in `src/routes/api/governance/reports/schedules/[id]/+server.ts`
- [ ] T017 [P] Create POST (pause) proxy in `src/routes/api/governance/reports/schedules/[id]/pause/+server.ts`
- [ ] T018 [P] Create POST (resume) proxy in `src/routes/api/governance/reports/schedules/[id]/resume/+server.ts`

**Checkpoint**: All 14 BFF proxy endpoints created. `npm run check` passes.

---

## Phase 3: User Story 1 — Browse and Generate Compliance Reports (Priority: P1) MVP

**Goal**: Admin can browse report templates, generate a report, and view the completed report data.

**Independent Test**: Navigate to Reports page, view template list, generate a report from a template, see it in Generated Reports tab with completed status, view the report data.

### Tests for User Story 1

- [ ] T019 [P] [US1] Create hub page server load test (admin guard, redirect non-admin) in `src/routes/(app)/governance/reports/governance-reports.test.ts`
- [ ] T020 [P] [US1] Create report templates tab component test (render template list, system badge, generate link) in `src/lib/components/governance/report-templates-tab.test.ts`
- [ ] T021 [P] [US1] Create generated reports tab component test (render report list, status badges, view data link) in `src/lib/components/governance/generated-reports-tab.test.ts`
- [ ] T022 [P] [US1] Create report data viewer component test (render JSON data, render tabular data) in `src/lib/components/governance/report-data-viewer.test.ts`

### Implementation for User Story 1

- [ ] T023 [US1] Create reports hub page server load (admin guard, return empty for client-side tabs) in `src/routes/(app)/governance/reports/+page.server.ts`
- [ ] T024 [US1] Create report templates tab component (list with name, type, standard, system/custom badge, "Generate" link) in `src/lib/components/governance/report-templates-tab.svelte`
- [ ] T025 [US1] Create generated reports tab component (list with name, status badge, format, record count, timestamps, "View Data" link) in `src/lib/components/governance/generated-reports-tab.svelte`
- [ ] T026 [US1] Create report data viewer component (JSON display for objects, table display for array-of-objects data) in `src/lib/components/governance/report-data-viewer.svelte`
- [ ] T027 [US1] Create reports hub page with 3 tabs (Templates, Generated Reports, Schedules), client-side data fetching per tab, loading/error states in `src/routes/(app)/governance/reports/+page.svelte`
- [ ] T028 [US1] Create generate report form page (template_id from URL param, name input, output_format select, parameters JSON textarea, submit action) in `src/routes/(app)/governance/reports/generate/+page.server.ts` and `+page.svelte`

**Checkpoint**: Admin can browse templates, generate reports, and view report data. US1 independently testable.

---

## Phase 4: User Story 2 — Manage Report Templates (Priority: P2)

**Goal**: Admin can create custom templates, clone system templates, edit custom templates, and archive custom templates.

**Independent Test**: Create a custom template with definition, clone a system template, edit the cloned template, archive it, verify it disappears from active list.

### Tests for User Story 2

- [ ] T029 [P] [US2] Create template definition editor component test (render JSON editor, validate JSON, display errors) in `src/lib/components/governance/template-definition-editor.test.ts`
- [ ] T030 [P] [US2] Create template create page test (admin guard, form validation, submit action) in `src/routes/(app)/governance/reports/templates/create/template-create.test.ts`
- [ ] T031 [P] [US2] Create template detail page test (load template, edit form, archive action, clone action, system template read-only) in `src/routes/(app)/governance/reports/templates/[id]/template-detail.test.ts`

### Implementation for User Story 2

- [ ] T032 [US2] Create template definition editor component (JSON textarea with syntax validation, preview of parsed structure) in `src/lib/components/governance/template-definition-editor.svelte`
- [ ] T033 [US2] Create template create page (form with name, description, template_type select, compliance_standard select, definition editor, Superforms + Zod validation) in `src/routes/(app)/governance/reports/templates/create/+page.server.ts` and `+page.svelte`
- [ ] T034 [US2] Create template detail/edit page (view template details, edit form for custom templates, read-only for system templates, clone button, archive button with confirmation) in `src/routes/(app)/governance/reports/templates/[id]/+page.server.ts` and `+page.svelte`

**Checkpoint**: Admin can create, clone, edit, and archive custom templates. US2 independently testable.

---

## Phase 5: User Story 3 — Schedule Recurring Reports (Priority: P2)

**Goal**: Admin can create, edit, pause, resume, and delete report schedules with daily/weekly/monthly frequency.

**Independent Test**: Create a daily schedule, create a weekly schedule (verify day-of-week required), pause it, resume it, edit recipients, delete it.

### Tests for User Story 3

- [ ] T035 [P] [US3] Create report schedules tab component test (render schedule list, status badges, pause/resume buttons, failure count) in `src/lib/components/governance/report-schedules-tab.test.ts`
- [ ] T036 [P] [US3] Create schedule create page test (admin guard, form validation, frequency-dependent fields) in `src/routes/(app)/governance/reports/schedules/create/schedule-create.test.ts`
- [ ] T037 [P] [US3] Create schedule detail page test (load schedule, edit form, pause/resume/delete actions) in `src/routes/(app)/governance/reports/schedules/[id]/schedule-detail.test.ts`

### Implementation for User Story 3

- [ ] T038 [US3] Create report schedules tab component (list with name, frequency, status badge, next run, last run, failures, pause/resume buttons) in `src/lib/components/governance/report-schedules-tab.svelte`
- [ ] T039 [US3] Create schedule create page (form with template select, name, frequency select, conditional day inputs, hour select, recipients comma-input, output_format, Superforms validation) in `src/routes/(app)/governance/reports/schedules/create/+page.server.ts` and `+page.svelte`
- [ ] T040 [US3] Create schedule detail/edit page (view schedule details, edit form, pause/resume toggle, delete with confirmation, show last error for disabled schedules) in `src/routes/(app)/governance/reports/schedules/[id]/+page.server.ts` and `+page.svelte`

**Checkpoint**: Admin can create, manage, and control report schedules. US3 independently testable.

---

## Phase 6: User Story 4 — View and Manage Generated Reports (Priority: P3)

**Goal**: Admin can filter reports by status/template, view report details and data, delete failed reports, and trigger cleanup of expired reports.

**Independent Test**: Generate multiple reports, filter by status, view a completed report's data, delete a failed report, trigger cleanup.

### Tests for User Story 4

- [ ] T041 [P] [US4] Create report filter and management tests (status filter, template filter, delete action, cleanup action) — extend tests in `src/lib/components/governance/generated-reports-tab.test.ts`

### Implementation for User Story 4

- [ ] T042 [US4] Add status and template filter dropdowns to generated reports tab in `src/lib/components/governance/generated-reports-tab.svelte`
- [ ] T043 [US4] Add delete action for pending/failed reports (button with confirmation dialog, disabled for completed/generating) in `src/lib/components/governance/generated-reports-tab.svelte`
- [ ] T044 [US4] Add cleanup expired reports button with result toast (shows deleted count) in `src/lib/components/governance/generated-reports-tab.svelte`
- [ ] T045 [US4] Add report detail view (navigate to report, show metadata + data viewer for completed reports, error message for failed) in `src/routes/(app)/governance/reports/+page.svelte` (inline detail or modal)

**Checkpoint**: Admin can filter, manage, and clean up generated reports. US4 independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Navigation integration, final verification, and E2E testing.

- [ ] T046 Add "Reports" sidebar nav item (admin-only, after "Governance" entry, FileBarChart icon from lucide-svelte) in `src/routes/(app)/+layout.svelte`
- [ ] T047 Run `npm run check` — fix any TypeScript/Svelte errors
- [ ] T048 Run `npm run test:unit` — verify all existing + new tests pass (target: ~1500+ tests)
- [ ] T049 E2E test with Chrome DevTools MCP: browse templates, generate report, view data, create custom template, clone, schedule, pause/resume, filter reports, cleanup, verify dark mode
- [ ] T050 Honest review: verify no dead code, no hardcoded values, proper error handling, accessible UI, constitution compliance

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (types) and T004 (API client) — BFF proxies import API functions
- **US1 (Phase 3)**: Depends on Phase 2 completion (BFF proxies must exist for client-side fetches)
- **US2 (Phase 4)**: Depends on Phase 2 completion. Can run in parallel with US1.
- **US3 (Phase 5)**: Depends on Phase 2 completion. Can run in parallel with US1/US2.
- **US4 (Phase 6)**: Depends on US1 (extends generated-reports-tab from US1)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2 — no cross-story deps
- **US2 (P2)**: Independent after Phase 2 — no cross-story deps
- **US3 (P2)**: Independent after Phase 2 — no cross-story deps
- **US4 (P3)**: Extends US1 components (filter/delete/cleanup added to existing tab)

### Within Each User Story

- Tests written FIRST, verified to FAIL
- Components before pages (pages import components)
- Server load before page svelte (pages import load data)

### Parallel Opportunities

- T002, T003, T005, T006, T007 all in parallel (different files)
- All Phase 2 proxy endpoints (T008-T018) in parallel
- All test tasks within each story phase in parallel
- US1, US2, US3 can run in parallel after Phase 2

---

## Parallel Example: Phase 1 Setup

```bash
# These can all run in parallel:
Task: "T002 — Zod schemas in src/lib/schemas/governance-reporting.ts"
Task: "T003 — Schema tests in src/lib/schemas/governance-reporting.test.ts"
Task: "T005 — API client tests in src/lib/api/governance-reporting.test.ts"
Task: "T006 — Client API in src/lib/api/governance-reporting-client.ts"
Task: "T007 — Client API tests in src/lib/api/governance-reporting-client.test.ts"
```

## Parallel Example: Phase 2 Foundational

```bash
# All 11 BFF proxy endpoints can run in parallel:
Task: "T008-T018 — All proxy +server.ts files (different directories)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, schemas, API clients)
2. Complete Phase 2: Foundational (BFF proxies)
3. Complete Phase 3: User Story 1 (browse templates, generate reports, view data)
4. **STOP and VALIDATE**: Test US1 independently with Chrome MCP
5. Deploy/demo if ready — admin can generate compliance reports

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Generate & view reports (MVP!)
3. Add US2 → Custom template management
4. Add US3 → Scheduled report automation
5. Add US4 → Report management & cleanup
6. Polish → Nav integration, E2E, review

---

## Notes

- [P] tasks = different files, no dependencies
- Constitution requires TDD — write tests first, verify they fail
- All BFF proxies MUST check `locals.accessToken`, `locals.tenantId`, and `hasAdminRole()`
- Backend pagination uses `{items, total, page, page_size}` — different from NHI `{data, total, limit, offset}`
- Template definition editing uses JSON textarea (per research.md decision R1)
- Report data viewing uses JSON display + auto-table for arrays (per research.md decision R2)
- Use `zod/v3` for all schemas (Superforms compatibility)
- Commit after each task or logical group

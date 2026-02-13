# Tasks: Audit & Compliance

**Input**: Design documents from `/specs/010-audit-compliance/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add TypeScript types and Zod schemas shared across all user stories

- [x] T001 Add audit and alert TypeScript types to `src/lib/api/types.ts` — LoginAttempt, SecurityAlert, LoginAttemptStats, FailureReasonCount, HourlyCount, CursorPaginatedResponse (generic), AlertType/Severity/AuthMethod union types per data-model.md
- [x] T002 [P] Create Zod validation schemas in `src/lib/schemas/audit.ts` — loginHistoryFilterSchema (start_date, end_date, success), adminAuditFilterSchema (user_id, email, auth_method, start_date, end_date, success), alertFilterSchema (type, severity, acknowledged), dateRangeSchema with end >= start validation
- [x] T003 [P] Create audit API client in `src/lib/api/audit.ts` — getLoginHistory(params, fetch), getAdminLoginAttempts(params, fetch), getAdminLoginStats(start_date, end_date, fetch) functions that call BFF proxy endpoints
- [x] T004 [P] Create alerts API client in `src/lib/api/alerts.ts` — getAlerts(params, fetch), acknowledgeAlert(id, fetch), getUnacknowledgedCount(fetch) functions that call BFF proxy endpoints

---

## Phase 2: Foundational (BFF Proxy Endpoints + Shared Components)

**Purpose**: Server-side proxy endpoints and reusable components that MUST be complete before user story pages

**CRITICAL**: No user story page work can begin until this phase is complete

- [x] T005 Create BFF proxy endpoint `src/routes/api/alerts/+server.ts` — GET handler that validates session, forwards query params (cursor, limit, type, severity, acknowledged) to `GET /security-alerts` on xavyo-idp, returns JSON response
- [x] T006 [P] Create BFF proxy endpoint `src/routes/api/alerts/[id]/acknowledge/+server.ts` — POST handler that validates session, forwards to `POST /security-alerts/{id}/acknowledge` on xavyo-idp, returns JSON response
- [x] T007 [P] Create BFF proxy endpoint `src/routes/api/audit/login-history/+server.ts` — GET handler that validates session, forwards query params (cursor, limit, start_date, end_date, success) to `GET /audit/login-history` on xavyo-idp
- [x] T008 [P] Create BFF proxy endpoint `src/routes/api/audit/admin/login-attempts/+server.ts` — GET handler that validates session + admin role, forwards query params (cursor, limit, user_id, email, start_date, end_date, success, auth_method) to `GET /admin/audit/login-attempts` on xavyo-idp
- [x] T009 [P] Create BFF proxy endpoint `src/routes/api/audit/admin/stats/+server.ts` — GET handler that validates session + admin role, forwards required query params (start_date, end_date) to `GET /admin/audit/login-attempts/stats` on xavyo-idp
- [x] T010 Create date-range-filter component `src/lib/components/audit/date-range-filter.svelte` — Two native `<input type="date">` elements (start, end) with client-side validation (end >= start), emits `onchange` with {start_date, end_date} as ISO 8601 strings, uses Svelte 5 $props/$state
- [x] T011 [P] Create alert-card component `src/lib/components/audit/alert-card.svelte` — Displays single SecurityAlert with severity badge (color-coded: info=blue, warning=amber, critical=red), alert type badge, title, message, metadata, timestamp, acknowledge button (hidden if already acknowledged), uses $props

**Checkpoint**: BFF proxy endpoints and shared components ready — user story page implementation can now begin

---

## Phase 3: User Story 1 — Security Alerts (Priority: P1)

**Goal**: Users can view, filter, and acknowledge security alerts from the Settings page with an unacknowledged count badge in navigation

**Independent Test**: Navigate to Settings > Alerts tab, verify alert list renders with filters, acknowledge an alert, verify badge count updates

### Implementation

- [x] T012 [US1] Create alert-list component `src/lib/components/audit/alert-list.svelte` — Fetches alerts from `/api/alerts` with cursor pagination, renders list of alert-card components, includes filter controls (type select, severity select, acknowledged select), "Load more" button when next_cursor exists, empty state when no alerts, error state with retry, uses $state for items array and next_cursor
- [x] T013 [US1] Create alerts-tab component `src/routes/(app)/settings/alerts-tab.svelte` — Wrapper that renders alert-list, accepts unacknowledgedCount prop, handles acknowledge callback to decrement count optimistically
- [x] T014 [US1] Update Settings page to include Alerts tab in `src/routes/(app)/settings/+page.svelte` — Add "Alerts" tab to existing Tabs component with badge showing unacknowledged count, render alerts-tab component in tab content
- [x] T015 [US1] Update Settings page server load to fetch unacknowledged count in `src/routes/(app)/settings/+page.server.ts` — Call alerts API with limit=1&acknowledged=false to get unacknowledged_count, pass to page data
- [x] T016 [US1] Add unacknowledged alert count badge to sidebar navigation in `src/lib/components/layout/sidebar.svelte` — Show badge next to "Settings" nav item when unacknowledgedAlertCount > 0, receive count from layout data
- [x] T017 [US1] Update app layout to pass alert count to sidebar in `src/routes/(app)/+layout.server.ts` — Fetch unacknowledged_count from alerts API (lightweight limit=1 call), include in layout data for sidebar badge

**Checkpoint**: Security alerts fully functional — users can view, filter, acknowledge alerts with badge in navigation

---

## Phase 4: User Story 2 — Personal Login History (Priority: P2)

**Goal**: Users can view their login history with date range and success filters from the Settings page

**Independent Test**: Navigate to Settings > Login History tab, verify list renders with login details, apply date range filter, filter by success/failure

### Implementation

- [x] T018 [US2] Create login-attempt-list component `src/lib/components/audit/login-attempt-list.svelte` — Fetches login history from a configurable endpoint URL with cursor pagination, renders list of login attempts with success/fail badge, auth method, IP address, user agent (truncated), geo location (country flag + city), new device/location badges, "Load more" button, empty state, error state with retry, date-range-filter and success filter controls, uses $state/$props
- [x] T019 [US2] Create login-history-tab component `src/routes/(app)/settings/login-history-tab.svelte` — Wrapper that renders login-attempt-list configured to fetch from `/api/audit/login-history`
- [x] T020 [US2] Update Settings page to include Login History tab in `src/routes/(app)/settings/+page.svelte` — Add "Login History" tab to existing Tabs component, render login-history-tab component in tab content

**Checkpoint**: Personal login history fully functional — users can view and filter their login attempts

---

## Phase 5: User Story 3 — Admin Audit Dashboard (Priority: P3)

**Goal**: Administrators can view tenant-wide login activity with filters and aggregated statistics

**Independent Test**: Log in as admin, navigate to Audit in sidebar, verify stats panel and login list render, apply filters, change date range

### Implementation

- [x] T021 [US3] Create stats-panel component `src/lib/components/audit/stats-panel.svelte` — Displays LoginAttemptStats with stat cards (total, success, failed, success rate, unique users, new devices, new locations), failure reasons list, hourly-chart component, loading skeleton state, error state with retry, uses $props
- [x] T022 [P] [US3] Create hourly-chart component `src/lib/components/audit/hourly-chart.svelte` — Pure CSS bar chart rendering HourlyCount[] array as 24 vertical bars, height proportional to max count, hour labels (0-23) below bars, uses flex items-end layout with Tailwind, supports dark mode, uses $props
- [x] T023 [US3] Create admin audit dashboard page `src/routes/(app)/audit/+page.svelte` — Layout with stats-panel at top and login-attempt-list below, shared date-range-filter that controls both panels, additional filters for admin (email input, auth method select), fetches stats from `/api/audit/admin/stats` and list from `/api/audit/admin/login-attempts`, responsive layout
- [x] T024 [US3] Create admin audit page server load `src/routes/(app)/audit/+page.server.ts` — Validate admin role (redirect to /dashboard if not admin), return minimal data for client-side fetching (role check only)
- [x] T025 [US3] Add "Audit" item to sidebar navigation (admin-only) in `src/lib/components/layout/sidebar.svelte` — Add Audit nav item with ClipboardList icon from lucide-svelte, only visible when user has admin role, active state styling
- [x] T026 [US3] Update app layout to pass user role to sidebar in `src/routes/(app)/+layout.server.ts` — Ensure user role from JWT claims is included in layout data so sidebar can conditionally show admin-only items

**Checkpoint**: Admin audit dashboard fully functional — admins can view tenant-wide activity and statistics

---

## Phase 6: User Story 4 — Per-User Activity Timeline (Priority: P4)

**Goal**: Administrators see a user's recent login activity on the user detail page

**Independent Test**: Navigate to Users > select a user, verify activity timeline section shows login attempts, click "View all" for full history

### Implementation

- [x] T027 [US4] Create activity-timeline component `src/lib/components/audit/activity-timeline.svelte` — Compact version of login-attempt-list showing last N entries (default: 10) for a specific user_id, "View all" link/button to expand to full paginated list, empty state for no activity, uses $props for userId and endpoint URL
- [x] T028 [US4] Update user detail page to include activity timeline in `src/routes/(app)/users/[id]/+page.svelte` — Add "Activity" section below existing user detail content, render activity-timeline component with the user's ID, fetch from `/api/audit/admin/login-attempts?user_id={id}`
- [x] T029 [US4] Update user detail page server load in `src/routes/(app)/users/[id]/+page.server.ts` — Ensure user ID is available in page data for the activity timeline component (should already be there from existing user detail load)

**Checkpoint**: Per-user activity timeline visible on user detail pages

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Tests, validation, and final integration

- [x] T030 [P] Write unit tests for API clients in `src/lib/api/audit.test.ts` — Test getLoginHistory, getAdminLoginAttempts, getAdminLoginStats with mocked fetch, verify query param construction and response parsing
- [x] T031 [P] Write unit tests for alerts API client in `src/lib/api/alerts.test.ts` — Test getAlerts, acknowledgeAlert, getUnacknowledgedCount with mocked fetch
- [x] T032 [P] Write unit tests for Zod schemas in `src/lib/schemas/audit.test.ts` — Test all filter schemas with valid/invalid inputs, date range validation (end >= start)
- [x] T033 [P] Write unit tests for alert-card component in `src/lib/components/audit/alert-card.test.ts` — Test rendering with different severities, acknowledge button visibility, click handler
- [x] T034 [P] Write unit tests for date-range-filter component in `src/lib/components/audit/date-range-filter.test.ts` — Test date input rendering, validation (end >= start), onChange callback with ISO strings
- [x] T035 [P] Write unit tests for hourly-chart component in `src/lib/components/audit/hourly-chart.test.ts` — Test bar rendering with sample data, empty state, max count normalization
- [x] T036 [P] Write unit tests for stats-panel component in `src/lib/components/audit/stats-panel.test.ts` — Test stat card rendering, failure reasons display, loading/error states
- [x] T037 [P] Write unit tests for alert-list component in `src/lib/components/audit/alert-list.test.ts` — Test filter controls rendering, empty state, error state, pagination button visibility
- [x] T038 [P] Write unit tests for login-attempt-list component in `src/lib/components/audit/login-attempt-list.test.ts` — Test list rendering with login data, filter controls, geo location display, new device/location badges, pagination
- [x] T039 [P] Write unit tests for activity-timeline component in `src/lib/components/audit/activity-timeline.test.ts` — Test compact display, "View all" button, empty state
- [x] T040 [P] Write tests for settings page alerts/login-history tabs in `src/routes/(app)/settings/alerts-tab.test.ts` and `src/routes/(app)/settings/login-history-tab.test.ts`
- [x] T041 [P] Write tests for admin audit page in `src/routes/(app)/audit/audit-page.test.ts` — Test admin-only access, stats panel rendering, filter controls
- [x] T042 Run `npm run check` to verify zero TypeScript errors across all new files
- [x] T043 Run `npm run test:unit` to verify all existing + new tests pass
- [x] T044 E2E verification with Chrome DevTools MCP — Test settings alerts tab, login history tab, admin audit dashboard, per-user activity timeline, both light and dark mode, responsive at 375px mobile width

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on T001 (types) — BFF endpoints need type imports
- **Phase 3 (US1 Security Alerts)**: Depends on Phase 2 (BFF endpoints + shared components)
- **Phase 4 (US2 Login History)**: Depends on Phase 2 + T010 (date-range-filter from Phase 2)
- **Phase 5 (US3 Admin Dashboard)**: Depends on Phase 2 + T010/T018 (reuses login-attempt-list from US2)
- **Phase 6 (US4 Activity Timeline)**: Depends on T018 (reuses login-attempt-list) + T027 (activity-timeline)
- **Phase 7 (Polish)**: Depends on all implementation phases

### User Story Dependencies

- **US1 (Security Alerts)**: Independent after Phase 2
- **US2 (Login History)**: Independent after Phase 2
- **US3 (Admin Dashboard)**: Depends on US2 (reuses login-attempt-list component)
- **US4 (Activity Timeline)**: Depends on US2 (reuses login-attempt-list) or US3 (reuses admin endpoint)

### Within Each User Story

- BFF endpoints (Phase 2) before components
- Components before page integration
- Page integration before navigation updates

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different files, depend only on T001)
- T005-T009 BFF proxy endpoints can all run in parallel (different files)
- T010, T011 shared components can run in parallel
- T021, T022 stats panel + hourly chart can run in parallel
- T030-T041 all test tasks can run in parallel (different test files)

---

## Parallel Example: Phase 2

```bash
# After T001 (types) completes, launch all BFF endpoints in parallel:
Task: "Create BFF proxy /api/alerts in src/routes/api/alerts/+server.ts"
Task: "Create BFF proxy /api/alerts/[id]/acknowledge in src/routes/api/alerts/[id]/acknowledge/+server.ts"
Task: "Create BFF proxy /api/audit/login-history in src/routes/api/audit/login-history/+server.ts"
Task: "Create BFF proxy /api/audit/admin/login-attempts in src/routes/api/audit/admin/login-attempts/+server.ts"
Task: "Create BFF proxy /api/audit/admin/stats in src/routes/api/audit/admin/stats/+server.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + schemas + API clients)
2. Complete Phase 2: Foundational (BFF endpoints + shared components)
3. Complete Phase 3: User Story 1 (Security Alerts)
4. **STOP and VALIDATE**: Test alerts tab, filters, acknowledge, badge
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Alerts) → Test independently → MVP!
3. Add US2 (Login History) → Test independently → Settings complete
4. Add US3 (Admin Dashboard) → Test independently → Admin features ready
5. Add US4 (Activity Timeline) → Test independently → User pages enriched
6. Polish (tests, validation) → Production ready

### Sequential Flow (Single Developer)

Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Cursor-based pagination: accumulate items in $state array, store next_cursor
- All BFF endpoints follow existing pattern: validate session → forward to xavyo-idp → return JSON
- Admin endpoints additionally check user role from JWT claims
- Date-range-filter uses native HTML date inputs per research.md R2
- Hourly chart uses pure CSS (flexbox + Tailwind) per research.md R5
- Alert count badge fetched in app layout with lightweight limit=1 call per research.md R6

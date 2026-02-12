# Tasks: Connector Management

**Input**: Design documents from `/specs/020-connector-management/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included per constitution (TDD mandatory — Principle II).

**Organization**: Tasks grouped by user story. 7 user stories: P1 List, P2 Create, P3 Detail/Health, P4 Edit, P5 Test Connection, P6 Activate/Deactivate, P7 Delete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types & Schemas)

**Purpose**: Add TypeScript types and Zod validation schemas shared by all user stories

- [x] T001 Add Connector types to `src/lib/api/types.ts` — Connector interface (id, tenant_id, name, description, connector_type, configuration, status, created_at, updated_at), ConnectorType ('ldap' | 'database' | 'rest_api'), ConnectorStatus ('active' | 'inactive' | 'error'), ConnectorListResponse ({items, total, limit, offset}), CreateConnectorRequest ({name, description?, connector_type, configuration}), UpdateConnectorRequest ({name?, description?, configuration?}), HealthStatus ({status, last_check_at, response_time_ms, error_count, details}), TestResult ({success, message, details?, response_time_ms})
- [x] T002 Create Zod schemas in `src/lib/schemas/connectors.ts` — createConnectorSchema (name: z.string().min(1), description: z.string().optional(), connector_type: z.enum(['ldap', 'database', 'rest_api'])), editConnectorSchema (name: z.string().min(1), description: z.string().optional()). Import from zod/v3
- [x] T003 [P] Create schema tests in `src/lib/schemas/connectors.test.ts` — valid create data, invalid (empty name), valid edit data, connector_type enum validation

**Checkpoint**: Types and schemas ready for API clients

---

## Phase 2: Foundational (API Clients & BFF Proxies)

**Purpose**: Server-side API client, client-side API, and BFF proxy endpoints. MUST complete before UI pages.

- [x] T004 Create server-side API client in `src/lib/api/connectors.ts` — listConnectors(params, token, tenantId, fetch), createConnector(body, token, tenantId, fetch), getConnector(id, token, tenantId, fetch), updateConnector(id, body, token, tenantId, fetch), deleteConnector(id, token, tenantId, fetch), testConnection(id, token, tenantId, fetch), activateConnector(id, token, tenantId, fetch), deactivateConnector(id, token, tenantId, fetch), getConnectorHealth(id, token, tenantId, fetch). Backend path prefix: `/admin/connectors`. DELETE returns 204 (no body parse)
- [x] T005 [P] Create client-side API client in `src/lib/api/connectors-client.ts` — fetchConnectors(params, fetchFn), createConnectorClient(data, fetchFn), getConnectorClient(id, fetchFn), updateConnectorClient(id, data, fetchFn), deleteConnectorClient(id, fetchFn), testConnectionClient(id, fetchFn), activateConnectorClient(id, fetchFn), deactivateConnectorClient(id, fetchFn), getConnectorHealthClient(id, fetchFn). BFF path prefix: `/api/connectors`
- [x] T006 [P] Create server-side API client tests in `src/lib/api/connectors.test.ts` — mock fetch, verify URLs contain `/admin/connectors`, verify headers (Authorization, X-Tenant-Id), test all 9 functions, verify DELETE does not parse body
- [x] T007 [P] Create client-side API client tests in `src/lib/api/connectors-client.test.ts` — mock fetch, verify URLs contain `/api/connectors`, test all 9 functions
- [x] T008 [P] Create BFF proxy for list+create in `src/routes/api/connectors/+server.ts` — GET handler (forward query params name, connector_type, status, limit, offset to listConnectors), POST handler (parse JSON body, call createConnector). Both validate accessToken/tenantId from cookies, return 401 if missing
- [x] T009 [P] Create BFF proxy for detail+update+delete in `src/routes/api/connectors/[id]/+server.ts` — GET handler (call getConnector), PUT handler (parse body, call updateConnector), DELETE handler (call deleteConnector, return 204). Validate auth cookies
- [x] T010 [P] Create BFF proxy for test connection in `src/routes/api/connectors/[id]/test/+server.ts` — POST handler (call testConnection with params.id). Validate auth cookies
- [x] T011 [P] Create BFF proxy for activate in `src/routes/api/connectors/[id]/activate/+server.ts` — POST handler (call activateConnector with params.id). Validate auth cookies
- [x] T012 [P] Create BFF proxy for deactivate in `src/routes/api/connectors/[id]/deactivate/+server.ts` — POST handler (call deactivateConnector with params.id). Validate auth cookies
- [x] T013 [P] Create BFF proxy for health in `src/routes/api/connectors/[id]/health/+server.ts` — GET handler (call getConnectorHealth with params.id). Validate auth cookies

**Checkpoint**: All API infrastructure ready — UI pages can now be built

---

## Phase 3: User Story 1 — Connector List (Priority: P1)

**Goal**: Paginated list of connectors with type/status badges, name search, type filter, status filter

**Independent Test**: Navigate to /connectors, verify list loads with correct columns, badges, search, and filters

### Tests for User Story 1

- [x] T014 [P] [US1] Create list page tests in `src/routes/(app)/connectors/connectors.test.ts` — test load function redirects non-admin, test load function returns connector data, test page renders connector rows with name/type/status/health/dates, test search and filter params forwarded

### Implementation for User Story 1

- [x] T015 [US1] Create list page server load in `src/routes/(app)/connectors/+page.server.ts` — admin guard with hasAdminRole, call listConnectors with query params (name, connector_type, status, limit, offset), return { connectors: items, total, limit, offset }
- [x] T016 [US1] Create list page in `src/routes/(app)/connectors/+page.svelte` — PageHeader with title "Connectors" and "Create Connector" button link, search input for name, type filter dropdown (All/LDAP/Database/REST API), status filter dropdown (All/Active/Inactive/Error), connector table with columns: Name (link to detail), Type (badge: ldap=blue, database=purple, rest_api=green), Status (badge: active=green, inactive=default, error=destructive), Health (colored dot indicator), Last Checked (relative time or "Never"), Created (date). EmptyState when no connectors. Pagination controls at bottom

**Checkpoint**: List page fully functional — admins can view and filter all connectors

---

## Phase 4: User Story 2 — Create Connector (Priority: P2)

**Goal**: Form to create a connector with type-dependent configuration fields and success redirect

**Independent Test**: Navigate to /connectors/create, select type, fill fields, submit, verify redirect to detail page

### Tests for User Story 2

- [x] T017 [P] [US2] Create create page tests in `src/routes/(app)/connectors/create/connectors-create.test.ts` — test load redirects non-admin, test action validates name required, test action calls createConnector and redirects on success, test action handles ApiError

### Implementation for User Story 2

- [x] T018 [US2] Create create page server in `src/routes/(app)/connectors/create/+page.server.ts` — admin guard, superValidate with createConnectorSchema, action: validate form, extract connector_type and build configuration JSON from type-specific form fields (LDAP: host/port/bind_dn/bind_password/base_dn/use_ssl/search_filter, Database: host/port/database/username/password/driver/query, REST API: base_url/auth_type/auth_config/headers), call createConnector(body, token, tenantId, fetch), redirect to /connectors/{id} on success, handle ApiError with message()
- [x] T019 [US2] Create create page in `src/routes/(app)/connectors/create/+page.svelte` — PageHeader "Create Connector", Card with form: name input (required), description textarea (optional), connector_type select dropdown. Dynamic configuration section that changes based on selected type using $derived: LDAP fields (host, port number, bind_dn, bind_password type=password, base_dn, use_ssl checkbox, search_filter optional), Database fields (host, port number, database, username, password type=password, driver select postgres/mysql/mssql/oracle, query textarea optional), REST API fields (base_url, auth_type select bearer/basic/api_key/none, auth_config textarea for JSON, headers textarea optional for JSON). Submit button "Create Connector", cancel link back to /connectors. Show $message errors. Use superForm with onResult for success toast

**Checkpoint**: Admins can create connectors of any type

---

## Phase 5: User Story 3 — Connector Detail & Health (Priority: P3)

**Goal**: Detail page with Overview, Configuration, and Health tabs

**Independent Test**: Navigate to /connectors/{id}, verify three tabs with correct data, health metrics display

### Tests for User Story 3

- [x] T020 [P] [US3] Create detail page tests in `src/routes/(app)/connectors/[id]/connectors-detail.test.ts` — test load redirects non-admin, test load returns connector and health data, test page renders overview tab with name/type/status, test configuration tab masks passwords, test health tab shows metrics

### Implementation for User Story 3

- [x] T021 [US3] Create detail page server load in `src/routes/(app)/connectors/[id]/+page.server.ts` — admin guard, call getConnector(id) and getConnectorHealth(id) in parallel (Promise.all, catch health errors gracefully — health may be unavailable for new connectors), return { connector, health }
- [x] T022 [US3] Create detail page in `src/routes/(app)/connectors/[id]/+page.svelte` — PageHeader with connector name and action buttons (Edit, Test Connection, Activate/Deactivate, Delete). Tabs component with 3 tabs: **Overview tab**: name, description, type badge, status badge, created_at, updated_at in a Card layout. **Configuration tab**: display configuration fields in a definition list, mask sensitive fields (bind_password, password) with bullet characters. **Health tab**: health status indicator (green=healthy, yellow=degraded, red=unhealthy, gray=unknown), last_check_at (or "Never checked"), response_time_ms, error_count. Handle 404 with error page

**Checkpoint**: Admins can view full connector details with health metrics

---

## Phase 6: User Story 4 — Edit Connector (Priority: P4)

**Goal**: Edit form pre-populated with current values, type-dependent configuration fields

**Independent Test**: Navigate to /connectors/{id}/edit, modify fields, submit, verify updates

### Tests for User Story 4

- [x] T023 [P] [US4] Create edit page tests in `src/routes/(app)/connectors/[id]/edit/connectors-edit.test.ts` — test load redirects non-admin, test load returns pre-populated form, test action validates and updates, test action handles ApiError

### Implementation for User Story 4

- [x] T024 [US4] Create edit page server in `src/routes/(app)/connectors/[id]/edit/+page.server.ts` — admin guard, load connector via getConnector(id), superValidate pre-populated with connector's name and description, action: validate form, extract configuration from type-specific form fields (same pattern as create), call updateConnector(id, body, token, tenantId, fetch), redirect to /connectors/{id} on success
- [x] T025 [US4] Create edit page in `src/routes/(app)/connectors/[id]/edit/+page.svelte` — PageHeader "Edit Connector", Card with form: name input (pre-populated), description textarea (pre-populated), connector_type displayed as read-only badge (type cannot change after creation). Dynamic configuration section matching the connector's type, pre-populated with current config values. Submit button "Save Changes", cancel link back to /connectors/{id}. Show $message errors

**Checkpoint**: Admins can update connector configuration

---

## Phase 7: User Story 5 — Test Connection (Priority: P5)

**Goal**: Client-side test connection action with loading state and result display on detail page

**Independent Test**: Navigate to /connectors/{id}, click "Test Connection", verify loading → result

### Tests for User Story 5

- [x] T026 [P] [US5] Add test connection tests to `src/routes/(app)/connectors/[id]/connectors-detail.test.ts` (extend existing) — test "Test Connection" button triggers client-side fetch, test loading state shown during test, test success result displayed, test failure result displayed

### Implementation for User Story 5

- [x] T027 [US5] Add test connection UI to `src/routes/(app)/connectors/[id]/+page.svelte` — Add $state for isTesting (boolean) and testResult (TestResult | null). "Test Connection" button: on click, set isTesting=true, call testConnectionClient(id) via client-side API, set testResult on completion, set isTesting=false. Show spinner when isTesting. Display result card: green success or red failure with message, response_time_ms, and optional details. Disable button while test is in progress

**Checkpoint**: Admins can verify connector connectivity

---

## Phase 8: User Story 6 — Activate & Deactivate (Priority: P6)

**Goal**: Toggle connector status between active and inactive via form actions on detail page

**Independent Test**: On detail page, click Activate (inactive→active), click Deactivate (active→inactive)

### Tests for User Story 6

- [x] T028 [P] [US6] Add activate/deactivate tests to `src/routes/(app)/connectors/[id]/connectors-detail.test.ts` (extend existing) — test activate action calls activateConnector, test deactivate action calls deactivateConnector, test actions return success, test error handling

### Implementation for User Story 6

- [x] T029 [US6] Add activate and deactivate form actions to `src/routes/(app)/connectors/[id]/+page.server.ts` — named actions: activate (validate id, call activateConnector), deactivate (validate id, call deactivateConnector). Both handle ApiError. Return redirect to same page on success
- [x] T030 [US6] Add activate/deactivate buttons to `src/routes/(app)/connectors/[id]/+page.svelte` — Conditional button in header: if status==='inactive' or status==='error', show "Activate" button (form action=?/activate with hidden id). If status==='active', show "Deactivate" button (form action=?/deactivate with hidden id). Use enhance for AJAX submission. Show success toast via onResult callback

**Checkpoint**: Admins can manage connector lifecycle

---

## Phase 9: User Story 7 — Delete Connector (Priority: P7)

**Goal**: Delete inactive connector with confirmation dialog, redirect to list

**Independent Test**: On detail page for inactive connector, click Delete, confirm, verify redirect to list

### Tests for User Story 7

- [x] T031 [P] [US7] Add delete tests to `src/routes/(app)/connectors/[id]/connectors-detail.test.ts` (extend existing) — test delete action calls deleteConnector, test delete action redirects to /connectors on success, test delete button disabled for active connectors

### Implementation for User Story 7

- [x] T032 [US7] Add delete form action to `src/routes/(app)/connectors/[id]/+page.server.ts` — named action: delete (validate id, call deleteConnector — returns 204 no body, redirect to /connectors). Handle ApiError with message
- [x] T033 [US7] Add delete button to `src/routes/(app)/connectors/[id]/+page.svelte` — "Delete" button: disabled when status==='active' (with tooltip "Deactivate first"). When clicked, show confirmation dialog ("Are you sure you want to delete this connector?"). On confirm, submit form action=?/delete with hidden id input. Use enhance with onResult: on redirect, show success toast "Connector deleted". Call update() for redirect to work

**Checkpoint**: Full connector lifecycle works — create, list, detail, edit, test, activate/deactivate, delete

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar nav, TypeScript check, full test suite, E2E testing

- [x] T034 Add "Connectors" nav item to `src/routes/(app)/+layout.svelte` — Add entry with Plug icon (from lucide-svelte) in admin section, href="/connectors", place after existing admin links. Admin-only visibility (inside `if (data.isAdmin)` block)
- [x] T035 Run `npm run check` to verify zero TypeScript errors
- [x] T036 Run `npx vitest run` to verify all tests pass
- [x] T037 E2E test: Navigate to Connectors page, verify list loads, create LDAP connector, verify type/status badges, test connection, activate, deactivate, delete
- [x] T038 E2E test: Create Database and REST API connectors, verify dynamic form fields change per type
- [x] T039 E2E test: Dark mode verified — all connector pages render correctly with proper dark styling
- [x] T040 Update MEMORY.md with Phase 020 completion and any new gotchas discovered

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — types and schemas first
- **Phase 2 (Foundational)**: Depends on Phase 1 — API clients need types
- **Phase 3-9 (User Stories)**: All depend on Phase 2 — UI pages need API clients and BFF proxies
- **Phase 10 (Polish)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories. MVP.
- **US2 (P2)**: Can start after Phase 2 — independent of US1 (create page doesn't depend on list page)
- **US3 (P3)**: Can start after Phase 2 — independent (detail page is a new route)
- **US4 (P4)**: Depends on US3 — edit page loads connector data like detail page
- **US5 (P5)**: Depends on US3 — test connection is added to the detail page
- **US6 (P6)**: Depends on US3 — activate/deactivate actions are added to the detail page
- **US7 (P7)**: Depends on US3 + US6 — delete requires checking active status (from US6 logic)

### Parallel Opportunities

- T002 + T003 (schemas + tests) can run in parallel
- T005/T006/T007/T008/T009/T010/T011/T012/T013 all marked [P] in Phase 2
- T014 + T017 + T020 (US1/US2/US3 tests) can run in parallel
- T015/T016 (US1) + T018/T019 (US2) + T021/T022 (US3) can run in parallel (different files)
- US4/US5/US6/US7 must be sequential after US3 (they modify the detail page)
- T037-T039 (E2E tests) are sequential

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Types + Schemas (T001-T003)
2. Complete Phase 2: API Clients + BFF Proxies (T004-T013)
3. Complete Phase 3: List Page (T014-T016)
4. **STOP and VALIDATE**: Navigate to /connectors, verify list renders

### Incremental Delivery

1. Setup + Foundational → All API infrastructure ready
2. Add US1 (List) → Admins can view connectors → MVP!
3. Add US2 (Create) → Admins can create + view → Core flow complete
4. Add US3 (Detail) → Full inspection capability
5. Add US4 (Edit) → Maintenance capability
6. Add US5 (Test) → Connectivity verification
7. Add US6 (Activate/Deactivate) → Lifecycle management
8. Add US7 (Delete) → Full lifecycle
9. Polish → Sidebar nav, E2E tests, memory update

---

## Notes

- Backend uses `{items, total, limit, offset}` response format (consistent with governance pagination)
- DELETE /admin/connectors/{id} returns 204 with no body (NOT 200 with updated object)
- Connector type cannot be changed after creation — edit form shows type as read-only
- Configuration is type-dependent JSON — use structured form fields per type, not raw JSON editor
- Sensitive fields (bind_password, password) masked with bullets in read view, shown as password inputs in edit
- Test connection uses client-side fetch (not form action) due to potentially long response time (up to 30s)
- Health data fetched in parallel with connector detail — gracefully handle if health endpoint fails
- Must use `import { z } from 'zod/v3'` for Superforms compatibility

# Tasks: SIEM Export & Audit Streaming

**Input**: Design documents from `/specs/035-siem-export/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/siem-api.md

**Tests**: Included (Constitution Principle II -- TDD is mandatory)

**Organization**: Tasks grouped by phase and user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Types, Schemas, Tests)

**Purpose**: Core data types and validation schemas shared across all user stories

- [x] T001 [P] Add all SIEM types to `src/lib/api/types.ts` -- SiemDestination, SiemBatchExport, SiemHealthSummary, SiemDeliveryHealth, SiemExportEvent, TestConnectivityResponse, RedeliverResponse, DestinationType enum (`syslog_tcp_tls` | `syslog_udp` | `webhook` | `splunk_hec`), ExportFormat enum (`cef` | `syslog_rfc5424` | `json` | `csv`), CircuitState enum (`closed` | `open` | `half_open`), BatchExportStatus enum (`pending` | `processing` | `completed` | `failed`), DeliveryStatus enum, EventCategory enum (9 categories), AuthConfig type, and all list/create/update request/response types per data-model.md
- [x] T002 [P] Create Zod validation schemas in `src/lib/schemas/siem.ts` -- createSiemDestinationSchema (name 1-255, destination_type, endpoint_host, endpoint_port conditional for syslog types, export_format, event_type_filter array of EventCategory, rate_limit_per_second >= 1, queue_buffer_size >= 100, circuit_breaker_threshold >= 1, circuit_breaker_cooldown_secs >= 1, enabled, splunk fields optional, syslog_facility 0-23, tls_verify_cert, auth_config optional nested), updateSiemDestinationSchema (all fields optional), createSiemExportSchema (date_range_start, date_range_end with cross-field validation end > start and max 90 days, event_type_filter, output_format), authConfigSchema (auth_type enum, conditional token/api_key/username/password/header_name)
- [x] T003 [P] Write schema validation tests in `src/lib/schemas/siem.test.ts` -- valid/invalid inputs for all 4 schemas: createSiemDestinationSchema (valid syslog_tcp_tls with port, missing port for syslog rejects, valid webhook without port, valid splunk_hec with splunk fields, name too long, invalid destination_type, rate_limit < 1 rejects, facility > 23 rejects), updateSiemDestinationSchema (partial updates valid, empty object valid), createSiemExportSchema (valid range, end before start rejects, range > 90 days rejects, empty event_type_filter rejects), authConfigSchema (none type valid, bearer_token requires token, api_key requires api_key, basic requires username+password)

**Checkpoint**: Types and schemas ready. No API or UI code yet.

---

## Phase 2: Foundational (API Clients, BFF Proxies, Sidebar)

**Purpose**: Server/client API clients and ALL 14 BFF proxy endpoints. MUST complete before any UI work.

**CRITICAL**: No user story work can begin until this phase is complete.

### API Clients

- [x] T004 [P] Create server-side API client in `src/lib/api/siem.ts` -- 14 functions: listSiemDestinations, createSiemDestination, getSiemDestination, updateSiemDestination, deleteSiemDestination, testSiemDestination, getSiemHealthSummary, getSiemHealthHistory, listSiemDeadLetter, redeliverSiemDeadLetter, listSiemExports, createSiemExport, getSiemExport, downloadSiemExport -- all with (params/body/id, token, tenantId, fetch) signature per contracts/siem-api.md
- [x] T005 [P] Write server API client tests in `src/lib/api/siem.test.ts` -- mock fetch for all 14 functions, verify correct HTTP methods (GET/POST/PUT/DELETE), paths, Authorization + X-Tenant-Id headers, query param serialization, error handling for 400/404/409/410
- [x] T006 [P] Create client-side API functions in `src/lib/api/siem-client.ts` -- 14 client functions: fetchSiemDestinations, fetchSiemDestination, createSiemDestinationClient, updateSiemDestinationClient, deleteSiemDestinationClient, testSiemDestinationClient, fetchSiemHealthSummary, fetchSiemHealthHistory, fetchSiemDeadLetter, redeliverSiemDeadLetterClient, fetchSiemExports, createSiemExportClient, fetchSiemExport, downloadSiemExportUrl -- all calling BFF proxy endpoints at /api/governance/siem/
- [x] T007 [P] Write client API tests in `src/lib/api/siem-client.test.ts` -- mock fetch for all 14 client functions, verify correct BFF proxy paths, request body forwarding, error propagation

### BFF Proxies -- Destinations

- [x] T008 [P] Create destinations list + create BFF proxy in `src/routes/api/governance/siem/destinations/+server.ts` -- GET (list with enabled/destination_type/limit/offset query params) and POST (create, validate body with createSiemDestinationSchema, admin guard)
- [x] T009 [P] Create destination detail BFF proxy in `src/routes/api/governance/siem/destinations/[id]/+server.ts` -- GET (get by id), PUT (update, validate body with updateSiemDestinationSchema, admin guard), DELETE (admin guard)
- [x] T010 [P] Create test connectivity BFF proxy in `src/routes/api/governance/siem/destinations/[id]/test/+server.ts` -- POST (empty body, admin guard, forward to backend)
- [x] T011 [P] Create health summary BFF proxy in `src/routes/api/governance/siem/destinations/[id]/health/+server.ts` -- GET (forward to backend)
- [x] T012 [P] Create health history BFF proxy in `src/routes/api/governance/siem/destinations/[id]/health/history/+server.ts` -- GET (forward limit/offset query params)
- [x] T013 [P] Create dead letter list BFF proxy in `src/routes/api/governance/siem/destinations/[id]/dead-letter/+server.ts` -- GET (forward limit/offset query params)
- [x] T014 [P] Create dead letter redeliver BFF proxy in `src/routes/api/governance/siem/destinations/[id]/dead-letter/redeliver/+server.ts` -- POST (empty body, admin guard, forward to backend)

### BFF Proxies -- Batch Exports

- [x] T015 [P] Create exports list + create BFF proxy in `src/routes/api/governance/siem/exports/+server.ts` -- GET (list with status/output_format/limit/offset query params) and POST (create, validate body with createSiemExportSchema, admin guard)
- [x] T016 [P] Create export detail BFF proxy in `src/routes/api/governance/siem/exports/[id]/+server.ts` -- GET (get by id)
- [x] T017 [P] Create export download BFF proxy in `src/routes/api/governance/siem/exports/[id]/download/+server.ts` -- GET (stream response from backend with Content-Disposition: attachment header)

### Sidebar Navigation

- [x] T018 [P] Update sidebar navigation in `src/routes/(app)/+layout.svelte` -- add "SIEM" entry under Governance section (admin-only, icon: Radio or Send from lucide-svelte), links to `/governance/siem`, positioned after Licenses entry

**Checkpoint**: All 14 BFF proxy endpoints ready, API clients complete, sidebar updated. UI implementation can begin.

---

## Phase 3: US1 -- SIEM Destination Management (Priority: P1) MVP

**Goal**: Admin can create, view, edit, enable/disable, test, and delete SIEM destinations from a hub page with destination list, detail page with 3 tabs, create page, and edit page.

**Independent Test**: Create a destination -> view in list -> view detail -> test connectivity -> edit -> disable -> enable -> delete.

### Tests for User Story 1

- [x] T019 [P] [US1] Write hub page tests in `src/routes/(app)/governance/siem/siem.test.ts` -- renders 2 tabs (Destinations, Batch Exports), Destinations tab shows destination list with columns (Name, Type, Host, Format, Status, Circuit State, Created), empty state with "Add Destination" CTA, pagination works
- [x] T020 [P] [US1] Write create destination page tests in `src/routes/(app)/governance/siem/create/create.test.ts` -- form renders all fields, destination_type selector shows 4 options, conditional fields appear/hide per type (splunk fields for splunk_hec, syslog_facility for syslog types, tls_verify_cert for syslog_tcp_tls), event_type_filter multi-select shows 9 categories, auth_config section with auth_type selector, validation errors display, successful creation redirects to detail page
- [x] T021 [P] [US1] Write destination detail page tests in `src/routes/(app)/governance/siem/[id]/detail.test.ts` -- renders 3 tabs (Details, Health, Dead Letter), Details tab shows all config fields read-only, enable/disable toggle button, "Test Connection" button shows spinner then result, "Edit" button links to edit page, "Delete" button shows confirmation dialog, circuit state badge renders with correct color
- [x] T022 [P] [US1] Write edit destination page tests in `src/routes/(app)/governance/siem/[id]/edit/edit.test.ts` -- form pre-fills all fields from existing destination, conditional fields shown per destination_type, auth_config shows "credentials configured" indicator when has_auth_config is true, validation errors display, successful update redirects to detail page

### Implementation for User Story 1

- [x] T023 [US1] Create hub page server load in `src/routes/(app)/governance/siem/+page.server.ts` -- load destinations list via listSiemDestinations() and exports list via listSiemExports(), admin guard with hasAdminRole()
- [x] T024 [US1] Create hub page in `src/routes/(app)/governance/siem/+page.svelte` -- PageHeader "SIEM Export", Bits UI Tabs with "Destinations" and "Batch Exports" tabs, Destinations tab renders table with columns (Name link to detail, Type badge, Host:Port, Format, Enabled status badge, Circuit State via circuit-state-badge component, Created date), "Add Destination" button links to /governance/siem/create, pagination with limit/offset
- [x] T025 [US1] Create destination create page server in `src/routes/(app)/governance/siem/create/+page.server.ts` -- Superforms load with createSiemDestinationSchema defaults, form action validates with createSiemDestinationSchema, calls createSiemDestination(), redirects to /governance/siem/[id] on success
- [x] T026 [US1] Create destination create page in `src/routes/(app)/governance/siem/create/+page.svelte` -- Superforms form with: name input, destination_type select (4 options), endpoint_host input, endpoint_port input (shown conditionally, required for syslog types), export_format select (4 options), event_type_filter multi-checkbox (9 categories), rate_limit_per_second number input, queue_buffer_size number input, circuit_breaker_threshold number input, circuit_breaker_cooldown_secs number input, enabled toggle, conditional Splunk fields (splunk_source, splunk_sourcetype, splunk_index, splunk_ack_enabled) shown when splunk_hec selected, conditional syslog_facility shown for syslog types, tls_verify_cert shown for syslog_tcp_tls, auth_config section with auth_type select and conditional credential fields
- [x] T027 [US1] Create destination detail page server in `src/routes/(app)/governance/siem/[id]/+page.server.ts` -- load destination via getSiemDestination(), load health summary via getSiemHealthSummary() (catch errors gracefully), load dead letter list via listSiemDeadLetter(), admin guard, form actions for test (testSiemDestination), enable/disable (updateSiemDestination with {enabled}), delete (deleteSiemDestination with redirect to /governance/siem)
- [x] T028 [US1] Create destination detail page in `src/routes/(app)/governance/siem/[id]/+page.svelte` -- PageHeader with destination name + circuit-state-badge + enabled status badge, action buttons (Edit link, Test Connection, Enable/Disable toggle, Delete with confirm dialog), Bits UI Tabs with 3 tabs (Details, Health, Dead Letter), Details tab shows all config in read-only summary (key-value pairs), has_auth_config shown as "Configured" / "Not configured" indicator, test connection shows spinner then success/failure toast with latency
- [x] T029 [US1] Create destination edit page server in `src/routes/(app)/governance/siem/[id]/edit/+page.server.ts` -- load destination via getSiemDestination(), Superforms load pre-filling all fields, form action validates with updateSiemDestinationSchema, calls updateSiemDestination(), redirects to /governance/siem/[id] on success
- [x] T030 [US1] Create destination edit page in `src/routes/(app)/governance/siem/[id]/edit/+page.svelte` -- same form layout as create page but pre-filled with existing values, auth_config section shows "Credentials currently configured" when has_auth_config is true with option to overwrite, submit updates destination

**Checkpoint**: US1 complete -- full destination CRUD with conditional forms, test connectivity, enable/disable, and delete.

---

## Phase 4: US2 -- Health Monitoring & Circuit Breaker Status (Priority: P1)

**Goal**: Admin can view delivery health metrics, circuit breaker status, and health history on the destination detail Health tab.

**Independent Test**: View destination detail -> Health tab shows summary cards -> circuit state badge -> health history table with time windows.

### Tests for User Story 2

- [x] T031 [P] [US2] Write circuit-state-badge component tests in `src/lib/components/siem/circuit-state-badge.test.ts` -- renders "Closed" with green styling for closed state, "Open" with red styling for open state, "Half Open" with yellow styling for half_open state, handles undefined/null gracefully
- [x] T032 [P] [US2] Write health-summary-cards component tests in `src/lib/components/siem/health-summary-cards.test.ts` -- renders all metric cards (Total Sent, Delivered, Failed, Dropped, Success Rate %, Avg Latency ms, Dead Letter Count), formats numbers with toLocaleString, shows circuit state badge, shows last success/failure timestamps, handles null avg_latency_ms gracefully, empty state when no data

### Implementation for User Story 2

- [x] T033 [US2] Create circuit-state-badge component in `src/lib/components/siem/circuit-state-badge.svelte` -- accepts `state: CircuitState` prop, renders badge with color: closed=green, open=red, half_open=yellow, displays human-readable text ("Closed", "Open", "Half Open")
- [x] T034 [US2] Create health-summary-cards component in `src/lib/components/siem/health-summary-cards.svelte` -- accepts `health: SiemHealthSummary` prop, renders grid of metric cards: total_events_sent, total_events_delivered (with success indicator), total_events_failed, total_events_dropped, success_rate_percent (formatted to 2 decimal places), avg_latency_ms (with "ms" unit, "N/A" when null), dead_letter_count, circuit_state via circuit-state-badge, last_success_at and last_failure_at formatted timestamps
- [x] T035 [US2] Update destination detail page `src/routes/(app)/governance/siem/[id]/+page.svelte` -- Health tab renders health-summary-cards component with server-loaded health data, health history table below summary cards showing time-windowed entries (window_start-window_end, events_sent, delivered, failed, dropped, avg_latency_ms, p95_latency_ms), client-side polling with setInterval (30s) via $effect to refresh health summary when Health tab is active, cleanup on tab change/unmount

**Checkpoint**: US2 complete -- Health tab shows delivery metrics, circuit state badge, and history timeline.

---

## Phase 5: US3 -- Batch Export Management (Priority: P2)

**Goal**: Admin can create batch exports of audit events, view export list on the hub page Batch Exports tab, and download completed exports.

**Independent Test**: Navigate to Batch Exports tab -> create export -> see pending status -> (wait for processing) -> download completed export -> filter by status.

### Tests for User Story 3

- [x] T036 [P] [US3] Write export-status-badge component tests in `src/lib/components/siem/export-status-badge.test.ts` -- renders "Pending" with gray styling, "Processing" with blue styling, "Completed" with green styling, "Failed" with red styling, handles unknown status gracefully
- [x] T037 [P] [US3] Write export create page tests in `src/routes/(app)/governance/siem/exports/create/export-create.test.ts` -- form renders date range picker (start/end), output format selector (4 options), event_type_filter multi-checkbox (9 categories), validation: end date before start date shows error, range > 90 days shows error, empty event filter shows error, successful submission redirects to hub

### Implementation for User Story 3

- [x] T038 [US3] Create export-status-badge component in `src/lib/components/siem/export-status-badge.svelte` -- accepts `status: BatchExportStatus` prop, renders badge with color: pending=gray, processing=blue, completed=green, failed=red
- [x] T039 [US3] Update hub page `src/routes/(app)/governance/siem/+page.svelte` -- Batch Exports tab renders exports table with columns (Date Range start-end formatted, Format, Status via export-status-badge, Total Events, File Size in human-readable KB/MB, Created date), "Create Export" button links to /governance/siem/exports/create, status filter dropdown (all/pending/processing/completed/failed), download link for completed exports (href to /api/governance/siem/exports/[id]/download), error_detail shown inline for failed exports, pagination
- [x] T040 [US3] Create export create page server in `src/routes/(app)/governance/siem/exports/create/+page.server.ts` -- Superforms load with createSiemExportSchema defaults, form action validates with createSiemExportSchema, calls createSiemExport(), redirects to /governance/siem on success with toast
- [x] T041 [US3] Create export create page in `src/routes/(app)/governance/siem/exports/create/+page.svelte` -- Superforms form with: date_range_start date input, date_range_end date input, output_format select (cef/syslog_rfc5424/json/csv), event_type_filter multi-checkbox (9 event categories), submit button "Create Export"

**Checkpoint**: US3 complete -- batch export create, list with status filter, and download for completed exports.

---

## Phase 6: US4 -- Dead Letter Queue Management (Priority: P2)

**Goal**: Admin can view failed event deliveries in the dead letter queue and redeliver all events for a destination.

**Independent Test**: View destination detail -> Dead Letter tab -> see failed events with error details -> click "Redeliver All" -> see requeued count toast.

### Tests for User Story 4

- [x] T042 [P] [US4] Write dead letter tab tests (integrated in detail page tests) in `src/routes/(app)/governance/siem/[id]/detail.test.ts` -- Dead Letter tab renders table with columns (Event Type, Timestamp, Retry Count, Error Detail), "Redeliver All" button visible when items exist, redeliver action shows spinner then success toast with events_requeued count, empty state message when no dead letter events, pagination works

### Implementation for User Story 4

- [x] T043 [US4] Update destination detail page `src/routes/(app)/governance/siem/[id]/+page.svelte` -- Dead Letter tab renders table with columns (source_event_type badge, event_timestamp formatted, retry_count, error_detail truncated with hover tooltip, last_attempt_at), "Redeliver All" button calls redeliverSiemDeadLetterClient(id) with spinner, success toast showing "X events requeued for delivery", empty state "No failed deliveries -- all events are being delivered successfully", pagination with limit/offset via client-side API refetch

**Checkpoint**: US4 complete -- Dead Letter tab with failed event list and redeliver action.

---

## Final Phase: Polish & Cleanup

**Purpose**: Badge component, type checks, final test run, and E2E validation

- [x] T044 [P] Create destination-type-badge component in `src/lib/components/siem/destination-type-badge.svelte` -- accepts `type: DestinationType` prop, renders badge with label: syslog_tcp_tls="Syslog TLS", syslog_udp="Syslog UDP", webhook="Webhook", splunk_hec="Splunk HEC", distinct colors per type
- [x] T045 [P] Write destination-type-badge component tests in `src/lib/components/siem/destination-type-badge.test.ts` -- renders correct label and styling for each of the 4 destination types
- [ ] T046 Run `npm run check` -- fix any TypeScript/Svelte errors across all new files
- [ ] T047 Run `npm run test:unit` -- ensure all existing + new tests pass
- [ ] T048 E2E test with Chrome DevTools MCP -- navigate SIEM hub, verify both tabs render, create destination with Splunk HEC type and verify conditional fields, test connectivity, view Health tab with summary cards and circuit badge, view Dead Letter tab, create batch export with date range, verify sidebar "SIEM" nav item, verify dark mode rendering

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies -- can start immediately. T001-T003 all parallel.
- **Foundational (Phase 2)**: Depends on T001 (types) and T002 (schemas). T004-T018 all parallel after dependencies met. BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Phase 2 complete -- creates hub page and destination CRUD.
- **US2 (Phase 4)**: Depends on US1 (T028 creates detail page with tab structure) -- adds Health tab content.
- **US3 (Phase 5)**: Depends on US1 (T024 creates hub page with Batch Exports tab) -- populates the tab.
- **US4 (Phase 6)**: Depends on US1 (T028 creates detail page with Dead Letter tab placeholder) -- populates the tab.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### Parallel Opportunities

- Phase 1: T001 + T002 + T003 all parallel (different files)
- Phase 2: T004-T018 all parallel after Phase 1 (different files, no dependencies between BFF proxies)
- Phase 3: T019-T022 test tasks all parallel, T025+T026 parallel with T029+T030 (create and edit are independent pages)
- Phase 4: T031 + T032 test tasks parallel
- Phase 5: T036 + T037 test tasks parallel
- Within each story: test tasks [P] can run in parallel with each other

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2 -- creates hub + detail pages
- **US2 (P1)**: Depends on US1 (detail page must exist with Health tab)
- **US3 (P2)**: Depends on US1 (hub page must exist with Batch Exports tab)
- **US4 (P2)**: Depends on US1 (detail page must exist with Dead Letter tab)

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (types, schemas, tests)
2. Complete Phase 2: BFF proxies + API clients + sidebar
3. Complete Phase 3: US1 -- Destination CRUD with hub and detail pages
4. **STOP and VALIDATE**: Test full destination lifecycle independently

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. US1 (Destination CRUD) -> MVP with list/create/detail/edit/delete/test/enable/disable
3. US2 (Health Monitoring) -> Health tab with summary cards + circuit badge + history
4. US3 (Batch Exports) -> Batch Exports tab on hub + create export + download
5. US4 (Dead Letter Queue) -> Dead Letter tab with redeliver action
6. Polish -> Type badge component, type checks, full test run, E2E

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Auth config is write-only: backend never returns raw credentials, only `has_auth_config` boolean
- Circuit state is read-only from UI: managed by backend delivery pipeline
- Dead letter redeliver is bulk-only (all events for a destination), not per-event
- Batch export download uses streaming via BFF proxy with Content-Disposition header
- Health polling: 30-second interval via $effect with cleanup, pauses when Health tab not active
- Event type filter values: authentication, user_lifecycle, group_changes, access_requests, provisioning, administrative, security, entitlement, sod_violation
- Pagination format: `{items, total, limit, offset}` (standard governance pattern)
- Total tasks: 48

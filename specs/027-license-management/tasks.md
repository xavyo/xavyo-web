# Tasks: License Management

**Input**: Design documents from `/specs/027-license-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/license-api.md, quickstart.md

**Tests**: Included (Constitution Principle II — TDD is mandatory)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US7)
- Exact file paths included in descriptions

---

## Phase 1: Setup

**Purpose**: Add license management TypeScript types to shared types file

- [ ] T001 Add all license management types (LicensePool, LicenseAssignment, ReclamationRule, LicenseIncompatibility, LicenseEntitlementLink, LicenseAuditEvent, LicenseSummary, LicensePoolStats, VendorCost, LicenseRecommendation, ExpiringPoolInfo, BulkOperationResult, ComplianceReport, all enums) to src/lib/api/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Zod schemas, API clients (server + client), and tests — MUST complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] Create Zod validation schemas (createPoolSchema, updatePoolSchema, assignLicenseSchema, bulkAssignSchema, bulkReclaimSchema, createReclamationRuleSchema, updateReclamationRuleSchema, createIncompatibilitySchema, createEntitlementLinkSchema, complianceReportSchema) in src/lib/schemas/licenses.ts
- [ ] T003 [P] Write schema validation tests (valid + invalid inputs for all schemas) in src/lib/schemas/licenses.test.ts
- [ ] T004 [P] Create server-side API client with all license endpoint functions (listPools, createPool, getPool, updatePool, deletePool, archivePool, listAssignments, createAssignment, getAssignment, deallocateAssignment, bulkAssign, bulkReclaim, listReclamationRules, createReclamationRule, getReclamationRule, updateReclamationRule, deleteReclamationRule, listIncompatibilities, createIncompatibility, getIncompatibility, deleteIncompatibility, listEntitlementLinks, createEntitlementLink, getEntitlementLink, deleteEntitlementLink, toggleEntitlementLink, getDashboard, getRecommendations, getExpiringPools, generateComplianceReport, getAuditTrail) in src/lib/api/licenses.ts
- [ ] T005 [P] Write server API client tests (mock fetch for all functions) in src/lib/api/licenses.test.ts
- [ ] T006 [P] Create client-side API functions (fetchPools, fetchAssignments, fetchDashboard, fetchRecommendations, fetchExpiringPools, fetchAuditTrail, fetchReclamationRules, fetchIncompatibilities, fetchEntitlementLinks, deallocateAssignmentClient, deletePoolClient, archivePoolClient, deleteRuleClient, deleteIncompatibilityClient, deleteEntitlementLinkClient, toggleEntitlementLinkClient, generateComplianceReportClient) in src/lib/api/licenses-client.ts
- [ ] T007 [P] Write client API tests in src/lib/api/licenses-client.test.ts

**Checkpoint**: Foundation ready — schemas validated, API plumbing complete, all tests pass

---

## Phase 3: User Story 1 — License Pool Management (Priority: P1) MVP

**Goal**: Admin can create, view, edit, archive, delete license pools with utilization metrics and filters

**Independent Test**: Create a pool → view in list → view detail → edit → archive → create another → delete it

### Tests for User Story 1

- [ ] T008 [P] [US1] Write hub page tests (renders 7 tabs, Pools tab shows pool list with columns, filters work) in src/routes/(app)/governance/licenses/licenses.test.ts
- [ ] T009 [P] [US1] Write pool create page tests (form renders all fields, validation errors, successful creation redirects) in src/routes/(app)/governance/licenses/pools/create/pool-create.test.ts
- [ ] T010 [P] [US1] Write pool detail page tests (displays pool info, edit form, archive/delete actions, error handling) in src/routes/(app)/governance/licenses/pools/[id]/pool-detail.test.ts

### BFF Proxies for User Story 1

- [ ] T011 [P] [US1] Create pools list + create BFF proxy (GET list with filters, POST create) in src/routes/api/governance/licenses/pools/+server.ts
- [ ] T012 [P] [US1] Create pool detail BFF proxy (GET, PUT, DELETE) in src/routes/api/governance/licenses/pools/[id]/+server.ts
- [ ] T013 [P] [US1] Create pool archive BFF proxy (POST) in src/routes/api/governance/licenses/pools/[id]/archive/+server.ts

### Implementation for User Story 1

- [ ] T014 [US1] Create License Management hub page with 7 tabs (Pools, Assignments, Analytics, Reclamation Rules, Incompatibilities, Entitlement Links, Compliance), Pools tab shows paginated pool list with name, vendor, capacity, utilization %, status badge, expiration date, and vendor/type/status filters in src/routes/(app)/governance/licenses/+page.server.ts and src/routes/(app)/governance/licenses/+page.svelte
- [ ] T015 [US1] Create pool create page with form (name, vendor, description, total_capacity, cost_per_license, currency select, billing_period select, license_type select, expiration_date, expiration_policy select, warning_days) and server action in src/routes/(app)/governance/licenses/pools/create/+page.server.ts and src/routes/(app)/governance/licenses/pools/create/+page.svelte
- [ ] T016 [US1] Create pool detail page with pool info display, utilization metrics (allocated/available/utilization %), edit form (Superforms), archive action, delete action (with confirmation), status badges in src/routes/(app)/governance/licenses/pools/[id]/+page.server.ts and src/routes/(app)/governance/licenses/pools/[id]/+page.svelte

**Checkpoint**: Pool CRUD fully functional — create, list, view, edit, archive, delete with filters and utilization metrics

---

## Phase 4: User Story 2 — License Assignment Management (Priority: P2)

**Goal**: Admin can assign licenses to users, deallocate, and perform bulk assign/reclaim operations

**Independent Test**: Assign license to user → verify in list → deallocate → bulk assign 3 users → bulk reclaim with reason

### Tests for User Story 2

- [ ] T017 [P] [US2] Write assign page tests (form with pool/user selects, validation, successful assignment) in src/routes/(app)/governance/licenses/assignments/assign/assign.test.ts
- [ ] T018 [P] [US2] Write bulk operations page tests (bulk assign form, bulk reclaim form, result display with success/failure counts) in src/routes/(app)/governance/licenses/assignments/bulk/bulk.test.ts

### BFF Proxies for User Story 2

- [ ] T019 [P] [US2] Create assignments list + create BFF proxy (GET with pool/user/status/source filters, POST create) in src/routes/api/governance/licenses/assignments/+server.ts
- [ ] T020 [P] [US2] Create assignment detail BFF proxy (GET, DELETE deallocate) in src/routes/api/governance/licenses/assignments/[id]/+server.ts
- [ ] T021 [P] [US2] Create bulk assign BFF proxy (POST) in src/routes/api/governance/licenses/assignments/bulk/+server.ts
- [ ] T022 [P] [US2] Create bulk reclaim BFF proxy (POST) in src/routes/api/governance/licenses/assignments/bulk-reclaim/+server.ts

### Implementation for User Story 2

- [ ] T023 [US2] Update hub page Assignments tab to show paginated assignment list with pool name, user email, source badge, status badge, assigned date, deallocate action, and pool/user/status/source filters in src/routes/(app)/governance/licenses/+page.svelte
- [ ] T024 [US2] Create assign license page with pool selector, user ID input, source select, notes textarea, and server action in src/routes/(app)/governance/licenses/assignments/assign/+page.server.ts and src/routes/(app)/governance/licenses/assignments/assign/+page.svelte
- [ ] T025 [US2] Create bulk operations page with two sections: bulk assign (pool selector + user IDs textarea up to 1000) and bulk reclaim (pool selector + assignment IDs + reason), showing BulkOperationResult with success/failure counts and failure details in src/routes/(app)/governance/licenses/assignments/bulk/+page.server.ts and src/routes/(app)/governance/licenses/assignments/bulk/+page.svelte

**Checkpoint**: Assignment management fully functional — assign, deallocate, bulk assign, bulk reclaim with result summaries

---

## Phase 5: User Story 3 — Analytics Dashboard (Priority: P2)

**Goal**: Admin views license utilization metrics, cost breakdown, recommendations, and expiring pool alerts

**Independent Test**: Navigate to Analytics tab → verify summary cards, pool stats table, vendor cost table, recommendations list, expiring pools list

### Tests for User Story 3

- [ ] T026 [P] [US3] Write analytics tab tests (summary cards render, pool stats table, vendor cost table, recommendations with type badges, expiring pools list) in src/routes/(app)/governance/licenses/licenses.test.ts (extend hub tests)

### BFF Proxies for User Story 3

- [ ] T027 [P] [US3] Create analytics dashboard BFF proxy (GET) in src/routes/api/governance/licenses/analytics/dashboard/+server.ts
- [ ] T028 [P] [US3] Create recommendations BFF proxy (GET) in src/routes/api/governance/licenses/analytics/recommendations/+server.ts
- [ ] T029 [P] [US3] Create expiring pools BFF proxy (GET with within_days param) in src/routes/api/governance/licenses/analytics/expiring/+server.ts

### Implementation for User Story 3

- [ ] T030 [US3] Update hub page Analytics tab with client-side data loading: summary cards (total pools, total capacity, total allocated, total available, utilization %, monthly cost, expiring count), per-pool stats table, vendor cost breakdown table, recommendations list with type badges and potential savings, expiring pools list with days until expiration in src/routes/(app)/governance/licenses/+page.svelte

**Checkpoint**: Analytics dashboard fully functional — all metrics, recommendations, and alerts displayed

---

## Phase 6: User Story 4 — Reclamation Rules (Priority: P3)

**Goal**: Admin can create, view, edit, and delete reclamation rules with inactivity or lifecycle state triggers

**Independent Test**: Navigate to Reclamation Rules tab → create rule with Inactivity trigger → verify in list → edit threshold → delete

### Tests for User Story 4

- [ ] T031 [P] [US4] Write reclamation rule create page tests (form with pool select, trigger type toggle, conditional fields, validation) in src/routes/(app)/governance/licenses/reclamation-rules/create/rule-create.test.ts

### BFF Proxies for User Story 4

- [ ] T032 [P] [US4] Create reclamation rules list + create BFF proxy (GET with pool/trigger/enabled filters, POST create) in src/routes/api/governance/licenses/reclamation-rules/+server.ts
- [ ] T033 [P] [US4] Create reclamation rule detail BFF proxy (GET, PUT, DELETE) in src/routes/api/governance/licenses/reclamation-rules/[id]/+server.ts

### Implementation for User Story 4

- [ ] T034 [US4] Update hub page Reclamation Rules tab to show paginated rule list with pool name, trigger type badge, threshold/state, notification days, enabled toggle, created date, and pool/trigger/enabled filters with delete action in src/routes/(app)/governance/licenses/+page.svelte
- [ ] T035 [US4] Create reclamation rule create page with pool selector, trigger type radio (Inactivity/LifecycleState), conditional fields (threshold_days for Inactivity, lifecycle_state for LifecycleState), notification_days_before, and server action in src/routes/(app)/governance/licenses/reclamation-rules/create/+page.server.ts and src/routes/(app)/governance/licenses/reclamation-rules/create/+page.svelte

**Checkpoint**: Reclamation rules fully functional — create with conditional fields, list with filters, edit, delete

---

## Phase 7: User Story 5 — License Incompatibilities (Priority: P3)

**Goal**: Admin can create and delete incompatibility rules between two license pools

**Independent Test**: Navigate to Incompatibilities tab → create rule between two pools → verify in list → delete

### Tests for User Story 5

- [ ] T036 [P] [US5] Write incompatibility create page tests (two pool selectors, reason input, validation, pools can't be same) in src/routes/(app)/governance/licenses/incompatibilities/create/incompat-create.test.ts

### BFF Proxies for User Story 5

- [ ] T037 [P] [US5] Create incompatibilities list + create BFF proxy (GET with pool_id filter, POST create) in src/routes/api/governance/licenses/incompatibilities/+server.ts
- [ ] T038 [P] [US5] Create incompatibility detail BFF proxy (GET, DELETE) in src/routes/api/governance/licenses/incompatibilities/[id]/+server.ts

### Implementation for User Story 5

- [ ] T039 [US5] Update hub page Incompatibilities tab to show list with Pool A name+vendor, Pool B name+vendor, reason, created date, pool filter, and delete action in src/routes/(app)/governance/licenses/+page.svelte
- [ ] T040 [US5] Create incompatibility create page with two pool selectors (Pool A, Pool B), reason textarea, validation (pools must differ), and server action in src/routes/(app)/governance/licenses/incompatibilities/create/+page.server.ts and src/routes/(app)/governance/licenses/incompatibilities/create/+page.svelte

**Checkpoint**: Incompatibility rules fully functional — create with bidirectional constraint, list with pool filter, delete

---

## Phase 8: User Story 6 — License-Entitlement Links (Priority: P3)

**Goal**: Admin can link license pools to governance entitlements with priority and enable/disable toggle

**Independent Test**: Navigate to Entitlement Links tab → create link → verify in list → toggle enabled → delete

### Tests for User Story 6

- [ ] T041 [P] [US6] Write entitlement link create page tests (pool selector, entitlement selector, priority input, validation) in src/routes/(app)/governance/licenses/entitlement-links/create/link-create.test.ts

### BFF Proxies for User Story 6

- [ ] T042 [P] [US6] Create entitlement links list + create BFF proxy (GET with pool/entitlement/enabled filters, POST create) in src/routes/api/governance/licenses/entitlement-links/+server.ts
- [ ] T043 [P] [US6] Create entitlement link detail BFF proxy (GET, DELETE) in src/routes/api/governance/licenses/entitlement-links/[id]/+server.ts
- [ ] T044 [P] [US6] Create entitlement link enabled toggle BFF proxy (PUT) in src/routes/api/governance/licenses/entitlement-links/[id]/enabled/+server.ts

### Implementation for User Story 6

- [ ] T045 [US6] Update hub page Entitlement Links tab to show list with pool name+vendor, entitlement name, priority, enabled badge, created date, pool/entitlement/enabled filters, toggle enabled action, and delete action in src/routes/(app)/governance/licenses/+page.svelte
- [ ] T046 [US6] Create entitlement link create page with pool selector, entitlement selector (from governance entitlements API), priority number input, and server action in src/routes/(app)/governance/licenses/entitlement-links/create/+page.server.ts and src/routes/(app)/governance/licenses/entitlement-links/create/+page.svelte

**Checkpoint**: Entitlement links fully functional — create, list with filters, toggle enabled, delete

---

## Phase 9: User Story 7 — Compliance Reporting (Priority: P3)

**Goal**: Admin can generate compliance reports with filters and view paginated audit trail

**Independent Test**: Navigate to Compliance tab → generate report → view report data → view audit trail with filters

### Tests for User Story 7

- [ ] T047 [P] [US7] Write compliance tab tests (report generation form, report display, audit trail table with filters) in src/routes/(app)/governance/licenses/licenses.test.ts (extend hub tests)

### BFF Proxies for User Story 7

- [ ] T048 [P] [US7] Create compliance report generation BFF proxy (POST) in src/routes/api/governance/licenses/reports/compliance/+server.ts
- [ ] T049 [P] [US7] Create audit trail BFF proxy (GET with pool/user/action/date filters + pagination) in src/routes/api/governance/licenses/reports/audit-trail/+server.ts

### Implementation for User Story 7

- [ ] T050 [US7] Update hub page Compliance tab with two sections: (1) Report Generation form with optional pool IDs, vendor, from/to date filters and inline report display, (2) Audit Trail paginated table with pool, user, action, actor, timestamp, details columns and pool/user/action/date range filters in src/routes/(app)/governance/licenses/+page.svelte

**Checkpoint**: Compliance reporting fully functional — report generation with filters and paginated audit trail

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar navigation, final verification, cleanup

- [ ] T051 Add "Licenses" sidebar navigation entry (admin-only, under Governance section with Scale icon) in src/routes/(app)/+layout.svelte
- [ ] T052 Run `npm run check` and fix all TypeScript errors
- [ ] T053 Run `npm run test:unit` and verify all new + existing tests pass
- [ ] T054 E2E verification: navigate to /governance/licenses, test Pool CRUD, Assignment flow, Analytics tab, create reclamation rule, create incompatibility, create entitlement link, generate compliance report, view audit trail via Chrome DevTools MCP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types) — BLOCKS all user stories
- **US1 Pools (Phase 3)**: Depends on Phase 2 — MVP, start first
- **US2 Assignments (Phase 4)**: Depends on Phase 2 — can start after US1 or in parallel
- **US3 Analytics (Phase 5)**: Depends on Phase 2 — independent, can run in parallel
- **US4 Reclamation Rules (Phase 6)**: Depends on Phase 2 — independent
- **US5 Incompatibilities (Phase 7)**: Depends on Phase 2 — independent
- **US6 Entitlement Links (Phase 8)**: Depends on Phase 2 — independent
- **US7 Compliance (Phase 9)**: Depends on Phase 2 — independent
- **Polish (Phase 10)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: No story dependencies — MVP
- **US2 (P2)**: Independently testable; assignment list benefits from pools existing
- **US3 (P2)**: Independently testable; meaningful analytics requires pools/assignments
- **US4 (P3)**: Independently testable; rules reference pools
- **US5 (P3)**: Independently testable; incompatibilities reference pools
- **US6 (P3)**: Independently testable; links reference pools + entitlements
- **US7 (P3)**: Independently testable; audit trail populated by other operations

### Within Each User Story

- Tests written FIRST (verify they FAIL before implementation)
- BFF proxies before UI pages (API plumbing before UI)
- Hub tab update + create pages in sequence (hub depends on list data)

### Parallel Opportunities

- **Phase 2**: T002-T007 all parallel (different files)
- **Phase 3**: T008-T010 parallel (tests), T011-T013 parallel (BFF proxies)
- **Phase 4**: T017-T018 parallel (tests), T019-T022 parallel (BFF proxies)
- **Phase 5**: T027-T029 parallel (BFF proxies)
- **Phase 6**: T032-T033 parallel (BFF proxies)
- **Phase 7**: T037-T038 parallel (BFF proxies)
- **Phase 8**: T042-T044 parallel (BFF proxies)
- **Phase 9**: T048-T049 parallel (BFF proxies)
- **Cross-phase**: Once Phase 2 completes, US1-US7 can all proceed in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests in parallel:
Task: "Write hub page tests in licenses.test.ts"
Task: "Write pool create page tests in pool-create.test.ts"
Task: "Write pool detail page tests in pool-detail.test.ts"

# Launch all US1 BFF proxies in parallel:
Task: "Create pools list+create BFF in pools/+server.ts"
Task: "Create pool detail BFF in pools/[id]/+server.ts"
Task: "Create pool archive BFF in pools/[id]/archive/+server.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types)
2. Complete Phase 2: Foundational (schemas, API clients, tests)
3. Complete Phase 3: User Story 1 (Pool CRUD)
4. **STOP and VALIDATE**: Test pool create/list/detail/edit/archive/delete
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Pools) → Test independently → MVP!
3. Add US2 (Assignments) + US3 (Analytics) → Core features complete
4. Add US4-US7 (Rules, Incompatibilities, Links, Compliance) → Full feature set
5. Polish + E2E verification → Ship

---

## Notes

- All BFF proxies follow existing pattern: validate session cookie, extract token, forward to backend
- Hub page tabs use client-side data loading (same pattern as NHI Governance hub)
- Pool list and assignment list use server-side load; other tabs use client-side fetch
- Conditional form fields for reclamation rules (Inactivity vs LifecycleState) use class:hidden pattern
- Bulk operations textarea accepts one UUID per line, parsed on submit
- Analytics summary cards reuse existing dashboard card styling

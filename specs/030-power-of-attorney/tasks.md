# Tasks: Power of Attorney & Identity Delegation

**Input**: Design documents from `/specs/030-power-of-attorney/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/power-of-attorney-api.md

**Tests**: TDD required per constitution (Principle II). Test tasks included for all modules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add PoA types, schemas, and API clients that all user stories depend on

- [x] T001 Add PoA types (PoaGrant, PoaScope, PoaAuditEvent, PoaStatus, PoaEventType, AssumeIdentityResponse, CurrentAssumptionStatus) to src/lib/api/types.ts
- [x] T002 Create Zod validation schemas (grantPoaSchema, revokePoaSchema, extendPoaSchema) in src/lib/schemas/power-of-attorney.ts
- [x] T003 Create server-side API client with all 11 functions (grantPoa, listPoa, getPoa, revokePoa, extendPoa, assumeIdentity, dropIdentity, getCurrentAssumption, getPoaAudit, adminListPoa, adminRevokePoa) in src/lib/api/power-of-attorney.ts
- [x] T004 Create client-side API (listPoaClient, revokePoaClient, extendPoaClient, assumeIdentityClient, dropIdentityClient, getCurrentAssumptionClient, getPoaAuditClient, adminListPoaClient, adminRevokePoaClient) in src/lib/api/power-of-attorney-client.ts

---

## Phase 2: Foundational (Tests + BFF Proxies)

**Purpose**: Tests for Phase 1 modules and all BFF proxy endpoints — MUST complete before user story pages

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Create schema tests (valid/invalid inputs for grant, revoke, extend) in src/lib/schemas/power-of-attorney.test.ts
- [x] T006 [P] Create server-side API client tests (mock fetch for all 11 functions) in src/lib/api/power-of-attorney.test.ts
- [x] T007 [P] Create client-side API tests (mock fetch for all client functions) in src/lib/api/power-of-attorney-client.test.ts
- [x] T008 [P] Create BFF proxy for list + grant PoA (GET + POST) in src/routes/api/governance/power-of-attorney/+server.ts
- [x] T009 [P] Create BFF proxy for get single PoA (GET) in src/routes/api/governance/power-of-attorney/[id]/+server.ts
- [x] T010 [P] Create BFF proxy for revoke PoA (POST) in src/routes/api/governance/power-of-attorney/[id]/revoke/+server.ts
- [x] T011 [P] Create BFF proxy for extend PoA (POST) in src/routes/api/governance/power-of-attorney/[id]/extend/+server.ts
- [x] T012 [P] Create BFF proxy for assume identity (POST) in src/routes/api/governance/power-of-attorney/[id]/assume/+server.ts
- [x] T013 [P] Create BFF proxy for audit trail (GET) in src/routes/api/governance/power-of-attorney/[id]/audit/+server.ts
- [x] T014 [P] Create BFF proxy for drop assumption (POST) in src/routes/api/governance/power-of-attorney/drop/+server.ts
- [x] T015 [P] Create BFF proxy for current assumption status (GET) in src/routes/api/governance/power-of-attorney/current-assumption/+server.ts
- [x] T016 [P] Create BFF proxy for admin list all PoA (GET) in src/routes/api/governance/power-of-attorney/admin/+server.ts
- [x] T017 [P] Create BFF proxy for admin force-revoke (POST) in src/routes/api/governance/power-of-attorney/admin/[id]/revoke/+server.ts

**Checkpoint**: Foundation ready — all API clients tested, all BFF proxies in place

---

## Phase 3: User Story 1 — Grant and Manage PoA (Priority: P1) 🎯 MVP

**Goal**: Users can grant PoA to another user with scope/duration, view incoming/outgoing grants, and revoke grants

**Independent Test**: Grant a PoA, verify it appears in both users' lists, then revoke it

### Components for User Story 1

- [x] T018 [P] [US1] Create poa-status-badge.svelte component (pending/active/expired/revoked with colors) in src/lib/components/poa/poa-status-badge.svelte
- [x] T019 [P] [US1] Create poa-scope-display.svelte component (shows apps + workflow types) in src/lib/components/poa/poa-scope-display.svelte
- [x] T020 [P] [US1] Create poa-status-badge.test.ts in src/lib/components/poa/poa-status-badge.test.ts
- [x] T021 [P] [US1] Create poa-scope-display.test.ts in src/lib/components/poa/poa-scope-display.test.ts

### Hub Page for User Story 1

- [x] T022 [US1] Create hub page server load (load user outgoing PoA list, check admin role) in src/routes/(app)/governance/power-of-attorney/+page.server.ts
- [x] T023 [US1] Create hub page with 2-tab layout (My PoA with incoming/outgoing toggle, Admin tab) in src/routes/(app)/governance/power-of-attorney/+page.svelte
- [x] T024 [US1] Create hub page test in src/routes/(app)/governance/power-of-attorney/power-of-attorney-hub.test.ts

### Grant Page for User Story 1

- [x] T025 [US1] Create grant page server load + form action (validate with grantPoaSchema, call grantPoa, redirect) in src/routes/(app)/governance/power-of-attorney/grant/+page.server.ts
- [x] T026 [US1] Create grant page with form (grantee selector, scope multi-selects, date pickers, reason textarea) in src/routes/(app)/governance/power-of-attorney/grant/+page.svelte
- [x] T027 [US1] Create grant page test in src/routes/(app)/governance/power-of-attorney/grant/grant-poa.test.ts

### Detail Page for User Story 1

- [x] T028 [US1] Create detail page server load (load PoA by id) + revoke action in src/routes/(app)/governance/power-of-attorney/[id]/+page.server.ts
- [x] T029 [US1] Create detail page with PoA info, scope display, status badge, and revoke button with confirm dialog in src/routes/(app)/governance/power-of-attorney/[id]/+page.svelte
- [x] T030 [US1] Create detail page test in src/routes/(app)/governance/power-of-attorney/[id]/poa-detail.test.ts

### Sidebar Navigation

- [x] T031 [US1] Add "Power of Attorney" nav item under Governance section in src/routes/(app)/+layout.svelte

**Checkpoint**: User Story 1 complete — can grant, list (incoming/outgoing), view detail, and revoke PoA

---

## Phase 4: User Story 2 — Assume and Drop Identity (Priority: P1)

**Goal**: Grantees can assume the grantor's identity via an active PoA and drop it when done

**Independent Test**: Click "Assume Identity" on active PoA, verify session changes, click "Drop", verify return to own identity

### Implementation for User Story 2

- [x] T032 [US2] Add assume identity button + drop button to detail page with status guards (only show on active incoming PoA) in src/routes/(app)/governance/power-of-attorney/[id]/+page.svelte
- [x] T033 [US2] Add assume identity server action (call assumeIdentity API, swap access_token cookie, redirect) in src/routes/(app)/governance/power-of-attorney/[id]/+page.server.ts
- [x] T034 [US2] Add drop identity action (call dropIdentity API, restore original access_token cookie) — can use BFF proxy from client side via src/routes/api/governance/power-of-attorney/drop/+server.ts
- [x] T035 [US2] Update detail page test with assume/drop scenarios in src/routes/(app)/governance/power-of-attorney/[id]/poa-detail.test.ts

**Checkpoint**: User Story 2 complete — can assume and drop identity from detail page

---

## Phase 5: User Story 3 — Admin PoA Management (Priority: P1)

**Goal**: Admins can view all PoA grants across the org, filter by status/user, and force-revoke any grant

**Independent Test**: Admin views org-wide PoA list, filters by status, force-revokes a grant

### Implementation for User Story 3

- [x] T036 [US3] Add admin tab content to hub page — client-side fetch from admin BFF endpoint with status/grantor/grantee filters in src/routes/(app)/governance/power-of-attorney/+page.svelte
- [x] T037 [US3] Add admin force-revoke action (confirm dialog + call adminRevokePoa API, refresh list) in src/routes/(app)/governance/power-of-attorney/+page.svelte
- [x] T038 [US3] Update hub page server load to pass admin role flag for tab visibility in src/routes/(app)/governance/power-of-attorney/+page.server.ts
- [x] T039 [US3] Update hub page test with admin tab and force-revoke scenarios in src/routes/(app)/governance/power-of-attorney/power-of-attorney-hub.test.ts

**Checkpoint**: User Story 3 complete — admin can manage all PoA grants

---

## Phase 6: User Story 4 — PoA Audit Trail (Priority: P2)

**Goal**: View audit events per PoA with event type and date filters

**Independent Test**: View audit trail for a PoA, see chronological events, filter by type

### Components for User Story 4

- [x] T040 [P] [US4] Create poa-audit-timeline.svelte component (event list with type icons, timestamps, actor names, details) in src/lib/components/poa/poa-audit-timeline.svelte
- [x] T041 [P] [US4] Create poa-audit-timeline.test.ts in src/lib/components/poa/poa-audit-timeline.test.ts

### Integration for User Story 4

- [x] T042 [US4] Add audit trail section to detail page — load audit events in server load, add event type filter and date range filter in src/routes/(app)/governance/power-of-attorney/[id]/+page.svelte
- [x] T043 [US4] Update detail page server load to fetch audit events in src/routes/(app)/governance/power-of-attorney/[id]/+page.server.ts
- [x] T044 [US4] Update detail page test with audit trail rendering and filter scenarios in src/routes/(app)/governance/power-of-attorney/[id]/poa-detail.test.ts

**Checkpoint**: User Story 4 complete — audit trail visible on detail page with filters

---

## Phase 7: User Story 5 — PoA Extension (Priority: P2)

**Goal**: Grantors can extend an active PoA's end date within the 90-day maximum

**Independent Test**: Extend an active PoA, verify new end date, verify 90-day validation

### Implementation for User Story 5

- [x] T045 [US5] Add extend button + dialog with date picker (validate 90-day max) to detail page in src/routes/(app)/governance/power-of-attorney/[id]/+page.svelte
- [x] T046 [US5] Add extend server action (validate with extendPoaSchema, call extendPoa API) in src/routes/(app)/governance/power-of-attorney/[id]/+page.server.ts
- [x] T047 [US5] Update detail page test with extend scenarios (success, 90-day rejection, non-active rejection) in src/routes/(app)/governance/power-of-attorney/[id]/poa-detail.test.ts

**Checkpoint**: User Story 5 complete — can extend active PoA with validation

---

## Phase 8: User Story 6 — Assumed Identity Indicator (Priority: P3)

**Goal**: Global header indicator showing "Acting as [Name]" with one-click drop when operating under assumed identity

**Independent Test**: Assume identity, verify indicator appears on all pages, click drop, verify it disappears

### Components for User Story 6

- [x] T048 [P] [US6] Create assumed-identity-indicator.svelte component (warning-colored banner with "Acting as [Name]" text and Drop button) in src/lib/components/poa/assumed-identity-indicator.svelte
- [x] T049 [P] [US6] Create assumed-identity-indicator.test.ts in src/lib/components/poa/assumed-identity-indicator.test.ts

### Integration for User Story 6

- [x] T050 [US6] Add current-assumption check to app layout server load (call getCurrentAssumption, pass to layout) in src/routes/(app)/+layout.server.ts
- [x] T051 [US6] Add assumed-identity-indicator to app layout header (conditionally render when is_assuming is true) in src/routes/(app)/+layout.svelte
- [x] T052 [US6] Update app layout test with assumed-identity indicator rendering in src/routes/(app)/layout.test.ts

**Checkpoint**: User Story 6 complete — global indicator visible when assuming identity

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, TypeScript checks, and test suite verification

- [x] T053 Run TypeScript check (npm run check) and fix any errors
- [x] T054 Run full test suite (npm run test:unit) and fix any failures
- [x] T055 Update CLAUDE.md with Phase 030 completed feature entry and project structure
- [x] T056 Run quickstart.md E2E validation via Chrome DevTools MCP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP target
- **US2 (Phase 4)**: Depends on Phase 3 (adds to detail page)
- **US3 (Phase 5)**: Depends on Phase 3 (adds admin tab to hub page)
- **US4 (Phase 6)**: Depends on Phase 3 (adds audit section to detail page)
- **US5 (Phase 7)**: Depends on Phase 3 (adds extend action to detail page)
- **US6 (Phase 8)**: Depends on Phase 2 only (modifies app layout, not PoA pages)
- **Polish (Phase 9)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Foundation only — no story dependencies
- **US2 (P1)**: Depends on US1 (detail page must exist)
- **US3 (P1)**: Depends on US1 (hub page must exist)
- **US4 (P2)**: Depends on US1 (detail page must exist)
- **US5 (P2)**: Depends on US1 (detail page must exist)
- **US6 (P3)**: Foundation only — modifies app layout independently

### Parallel Opportunities

- T005, T006, T007 (all tests) can run in parallel
- T008–T017 (all BFF proxies) can run in parallel
- T018–T021 (components + their tests) can run in parallel
- T040–T041 (audit component + test) can run in parallel
- T048–T049 (indicator component + test) can run in parallel
- US6 (Phase 8) can run in parallel with US2–US5 since it only touches app layout

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, schemas, API clients)
2. Complete Phase 2: Foundational (tests, BFF proxies)
3. Complete Phase 3: User Story 1 (hub, grant, detail, revoke)
4. **STOP and VALIDATE**: Test US1 independently via Chrome DevTools MCP
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (grant/list/revoke) → Test → **MVP!**
3. US2 (assume/drop) → Test → Core delegation working
4. US3 (admin management) → Test → Admin oversight
5. US4 (audit trail) → Test → Compliance visibility
6. US5 (extension) → Test → Convenience feature
7. US6 (global indicator) → Test → Safety enhancement
8. Polish → Final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Constitution requires TDD: write tests first, verify they fail, then implement
- All BFF proxies validate session cookies before forwarding (Principle I)
- Use `zod/v3` for all schemas (Superforms compatibility)
- Assume identity swaps the access_token cookie server-side — never expose JWT to client
- Use `$derived` for server-loaded data, `$state` for client-side state
- Follow existing governance patterns (entitlements, certifications) for page structure

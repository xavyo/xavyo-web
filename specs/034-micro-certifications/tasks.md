# Tasks: Micro Certifications & Event-Driven Reviews

**Input**: Design documents from `/specs/034-micro-certifications/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/

**Tests**: Included — unit tests for all components, schemas, APIs, and pages.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Types, Schemas, API Clients)

**Purpose**: Core types, validation schemas, and API clients that all stories depend on

- [x] T001 Add MicroCertification, TriggerRule, CertificationEvent, MicroCertificationStats types to `src/lib/api/types.ts`
- [x] T002 [P] Create Zod validation schemas (decide, delegate, skip, bulk-decide, manual-trigger, create/update trigger rule) in `src/lib/schemas/micro-certifications.ts`
- [x] T003 [P] Create server-side API client with all 20 endpoint functions in `src/lib/api/micro-certifications.ts`
- [x] T004 [P] Create client-side API for browser-initiated requests in `src/lib/api/micro-certifications-client.ts`
- [x] T005 [P] Create schema tests in `src/lib/schemas/micro-certifications.test.ts`
- [x] T006 [P] Create server-side API client tests in `src/lib/api/micro-certifications.test.ts`
- [x] T007 [P] Create client-side API tests in `src/lib/api/micro-certifications-client.test.ts`

**Checkpoint**: All types, schemas, and API clients ready for use by BFF and pages

---

## Phase 2: Foundational (BFF Proxies + Shared Components)

**Purpose**: BFF proxy endpoints and reusable components that multiple stories share

**⚠️ CRITICAL**: No user story pages can function without BFF proxies

### BFF Proxies

- [x] T008 [P] Create certifications list + bulk-decide proxy in `src/routes/api/governance/micro-certifications/+server.ts` (GET list, POST bulk-decide)
- [x] T009 [P] Create my-pending proxy in `src/routes/api/governance/micro-certifications/my-pending/+server.ts` (GET)
- [x] T010 [P] Create stats proxy in `src/routes/api/governance/micro-certifications/stats/+server.ts` (GET)
- [x] T011 [P] Create manual trigger proxy in `src/routes/api/governance/micro-certifications/trigger/+server.ts` (POST)
- [x] T012 [P] Create global events search proxy in `src/routes/api/governance/micro-certifications/events/+server.ts` (GET)
- [x] T013 [P] Create certification detail proxy in `src/routes/api/governance/micro-certifications/[id]/+server.ts` (GET)
- [x] T014 [P] Create decide proxy in `src/routes/api/governance/micro-certifications/[id]/decide/+server.ts` (POST)
- [x] T015 [P] Create delegate proxy in `src/routes/api/governance/micro-certifications/[id]/delegate/+server.ts` (POST)
- [x] T016 [P] Create skip proxy in `src/routes/api/governance/micro-certifications/[id]/skip/+server.ts` (POST)
- [x] T017 [P] Create certification events proxy in `src/routes/api/governance/micro-certifications/[id]/events/+server.ts` (GET)
- [x] T018 [P] Create trigger rules list + create proxy in `src/routes/api/governance/micro-certifications/triggers/+server.ts` (GET, POST)
- [x] T019 [P] Create trigger rule detail + update + delete proxy in `src/routes/api/governance/micro-certifications/triggers/[id]/+server.ts` (GET, PUT, DELETE)
- [x] T020 [P] Create trigger rule enable proxy in `src/routes/api/governance/micro-certifications/triggers/[id]/enable/+server.ts` (POST)
- [x] T021 [P] Create trigger rule disable proxy in `src/routes/api/governance/micro-certifications/triggers/[id]/disable/+server.ts` (POST)
- [x] T022 [P] Create trigger rule set-default proxy in `src/routes/api/governance/micro-certifications/triggers/[id]/set-default/+server.ts` (POST)

### Shared Components

- [x] T023 [P] Create cert-status-badge component in `src/lib/components/micro-certifications/cert-status-badge.svelte` (pending/certified/revoked/delegated/skipped/expired badges)
- [x] T024 [P] Create cert-status-badge tests in `src/lib/components/micro-certifications/cert-status-badge.test.ts`
- [x] T025 [P] Create trigger-rule-badge component in `src/lib/components/micro-certifications/trigger-rule-badge.svelte` (trigger_type + scope_type badges)
- [x] T026 [P] Create trigger-rule-badge tests in `src/lib/components/micro-certifications/trigger-rule-badge.test.ts`

**Checkpoint**: All BFF proxies and shared components ready — user story pages can now function

---

## Phase 3: User Story 1 — Certification Review Dashboard (Priority: P1) 🎯 MVP

**Goal**: Reviewers see pending micro certifications and can certify, revoke, delegate, or skip

**Independent Test**: Navigate to hub → "My Pending" tab shows items → perform actions → verify status changes

### Components for US1

- [x] T027 [P] [US1] Create cert-decision-dialog component (certify/revoke with comment) in `src/lib/components/micro-certifications/cert-decision-dialog.svelte`
- [x] T028 [P] [US1] Create cert-decision-dialog tests in `src/lib/components/micro-certifications/cert-decision-dialog.test.ts`
- [x] T029 [P] [US1] Create cert-delegate-dialog component (delegate_to UUID + comment) in `src/lib/components/micro-certifications/cert-delegate-dialog.svelte`
- [x] T030 [P] [US1] Create cert-delegate-dialog tests in `src/lib/components/micro-certifications/cert-delegate-dialog.test.ts`
- [x] T031 [P] [US1] Create cert-events-timeline component (chronological events list) in `src/lib/components/micro-certifications/cert-events-timeline.svelte`
- [x] T032 [P] [US1] Create cert-events-timeline tests in `src/lib/components/micro-certifications/cert-events-timeline.test.ts`

### Hub Page (My Pending + All Certifications tabs)

- [x] T033 [US1] Create hub page server load (my-pending + admin: all certifications + stats) in `src/routes/(app)/governance/micro-certifications/+page.server.ts`
- [x] T034 [US1] Create hub page with 4 tabs (My Pending, All Certifications, Trigger Rules, Statistics) in `src/routes/(app)/governance/micro-certifications/+page.svelte`
- [x] T035 [P] [US1] Create hub page server tests in `src/routes/(app)/governance/micro-certifications/micro-certifications-server.test.ts`
- [x] T036 [P] [US1] Create hub page component tests in `src/routes/(app)/governance/micro-certifications/micro-certifications.test.ts`

### Certification Detail Page

- [x] T037 [US1] Create certification detail server load + decide/delegate/skip actions in `src/routes/(app)/governance/micro-certifications/[id]/+page.server.ts`
- [x] T038 [US1] Create certification detail page (info, actions, events timeline) in `src/routes/(app)/governance/micro-certifications/[id]/+page.svelte`
- [x] T039 [US1] Create certification detail tests in `src/routes/(app)/governance/micro-certifications/[id]/cert-detail.test.ts`

**Checkpoint**: Reviewers can view pending certifications, make decisions, delegate, skip — core flow complete

---

## Phase 4: User Story 2 — Trigger Rule Management (Priority: P1)

**Goal**: Admins create, edit, enable/disable, set-default, and delete trigger rules

**Independent Test**: Navigate to Trigger Rules tab → create rule → edit → enable/disable → set-default → delete

### Trigger Rule Create Page

- [x] T040 [P] [US2] Create trigger rule create page server load + action in `src/routes/(app)/governance/micro-certifications/triggers/create/+page.server.ts`
- [x] T041 [US2] Create trigger rule create form page (name, trigger_type, scope_type, scope_id, reviewer_type, specific_reviewer_id, fallback_reviewer_id, timeout_secs, reminder_threshold_percent, auto_revoke, revoke_triggering_assignment, priority, metadata) in `src/routes/(app)/governance/micro-certifications/triggers/create/+page.svelte`
- [x] T042 [P] [US2] Create trigger rule create page tests in `src/routes/(app)/governance/micro-certifications/triggers/create/trigger-create.test.ts`

### Trigger Rule Detail Page

- [x] T043 [US2] Create trigger rule detail server load + edit/enable/disable/set-default/delete actions in `src/routes/(app)/governance/micro-certifications/triggers/[id]/+page.server.ts`
- [x] T044 [US2] Create trigger rule detail page (display all fields, edit form, lifecycle actions) in `src/routes/(app)/governance/micro-certifications/triggers/[id]/+page.svelte`
- [x] T045 [US2] Create trigger rule detail tests in `src/routes/(app)/governance/micro-certifications/triggers/[id]/trigger-detail.test.ts`

**Checkpoint**: Admins can manage complete trigger rule lifecycle

---

## Phase 5: User Story 3 — Bulk Operations & Statistics (Priority: P2)

**Goal**: Admin bulk certify/revoke + statistics dashboard

**Independent Test**: View statistics tab → verify metric counts → select multiple certs → bulk certify → verify updates

### Statistics Component

- [x] T046 [P] [US3] Create cert-stats-cards component (total, pending, certified, revoked, delegated, skipped, expired, overdue, avg decision time) in `src/lib/components/micro-certifications/cert-stats-cards.svelte`
- [x] T047 [P] [US3] Create cert-stats-cards tests in `src/lib/components/micro-certifications/cert-stats-cards.test.ts`

### Bulk + Statistics Integration in Hub

- [x] T048 [US3] Add bulk select checkboxes + bulk decide action to "All Certifications" tab in `src/routes/(app)/governance/micro-certifications/+page.svelte`
- [x] T049 [US3] Add Statistics tab content using cert-stats-cards in `src/routes/(app)/governance/micro-certifications/+page.svelte`
- [x] T050 [US3] Add bulk-decide server action to hub page in `src/routes/(app)/governance/micro-certifications/+page.server.ts`
- [x] T051 [US3] Update hub page tests for bulk operations and statistics tab in `src/routes/(app)/governance/micro-certifications/micro-certifications.test.ts`

**Checkpoint**: Admins can bulk decide and view statistics dashboard

---

## Phase 6: User Story 4 — Audit Trail & Events (Priority: P2)

**Goal**: Per-certification event timeline + global events search

**Independent Test**: Open certification detail → verify event timeline → search global events → filter by type/date

### Global Events in Hub

- [x] T052 [US4] Add global events search as inline section or link on hub page in `src/routes/(app)/governance/micro-certifications/+page.svelte` and `+page.server.ts`
- [x] T053 [US4] Update certification detail tests to verify events timeline rendering in `src/routes/(app)/governance/micro-certifications/[id]/cert-detail.test.ts`
- [x] T054 [US4] Create event search tests for hub in `src/routes/(app)/governance/micro-certifications/micro-certifications.test.ts`

**Checkpoint**: Full audit trail visible on certification details + global events searchable

---

## Phase 7: User Story 5 — Manual Triggering (Priority: P3)

**Goal**: Admin manually triggers certification for user-entitlement pair

**Independent Test**: Navigate to manual trigger page → fill user/entitlement → submit → verify new certification

- [x] T055 [P] [US5] Create manual trigger page server load + action in `src/routes/(app)/governance/micro-certifications/trigger/+page.server.ts`
- [x] T056 [US5] Create manual trigger form page (user_id, entitlement_id, trigger_rule_id, reviewer_id, reason) in `src/routes/(app)/governance/micro-certifications/trigger/+page.svelte`
- [x] T057 [US5] Create manual trigger page tests in `src/routes/(app)/governance/micro-certifications/trigger/manual-trigger.test.ts`

**Checkpoint**: Admins can manually trigger certifications for ad-hoc reviews

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Navigation, final integration, validation

- [x] T058 Add "Micro Certs" sidebar navigation entry under Governance section (admin-only) in `src/routes/(app)/+layout.svelte`
- [x] T059 Run `npm run check` — verify TypeScript + Svelte checks pass
- [x] T060 Run `npm run test:unit` — verify all existing + new tests pass
- [x] T061 E2E validation via Chrome DevTools MCP following quickstart.md scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types + API clients must exist for BFF proxies)
- **US1 (Phase 3)**: Depends on Phase 2 (BFF proxies + shared components)
- **US2 (Phase 4)**: Depends on Phase 2 — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 3 (builds on hub page created in US1)
- **US4 (Phase 6)**: Depends on Phase 3 (events timeline component created in US1, enhances hub + detail)
- **US5 (Phase 7)**: Depends on Phase 2 — can run in parallel with US1/US2
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no dependency on other stories
- **US2 (P1)**: After Phase 2 — no dependency on other stories
- **US3 (P2)**: After US1 (adds bulk operations + statistics to the hub page)
- **US4 (P2)**: After US1 (enhances certification detail + adds global events search)
- **US5 (P3)**: After Phase 2 — no dependency on other stories

### Within Each User Story

- Components before pages
- Server load before page component
- Page implementation before tests

### Parallel Opportunities

- T002-T007 (schemas + API clients + all tests) can all run in parallel
- T008-T026 (all BFF proxies + shared components) can all run in parallel
- T027-T032 (US1 components) can all run in parallel
- T040-T042 (US2 create page) can start in parallel with US1 pages
- T046-T047 (US3 stats component) can run in parallel with other US3 tasks

---

## Parallel Example: Phase 1

```bash
# All these tasks target different files and can run in parallel:
Task T002: "Create Zod schemas in src/lib/schemas/micro-certifications.ts"
Task T003: "Create server API client in src/lib/api/micro-certifications.ts"
Task T004: "Create client API in src/lib/api/micro-certifications-client.ts"
Task T005: "Create schema tests in src/lib/schemas/micro-certifications.test.ts"
Task T006: "Create server API tests in src/lib/api/micro-certifications.test.ts"
Task T007: "Create client API tests in src/lib/api/micro-certifications-client.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, schemas, API clients)
2. Complete Phase 2: Foundational (BFF proxies, shared components)
3. Complete Phase 3: US1 (hub + detail pages with review actions)
4. **STOP and VALIDATE**: Test certification review flow independently
5. Deploy/demo — reviewers can already act on pending certifications

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 → Reviewers can decide on certifications (MVP!)
3. Add US2 → Admins configure trigger rules
4. Add US3 → Bulk operations + statistics dashboard
5. Add US4 → Audit trail + global events search
6. Add US5 → Manual triggering for ad-hoc reviews
7. Polish → Sidebar nav, final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story independently testable after completion
- Total: 61 tasks (7 setup + 19 foundational + 13 US1 + 6 US2 + 6 US3 + 3 US4 + 3 US5 + 4 polish)
- Estimated new tests: ~300

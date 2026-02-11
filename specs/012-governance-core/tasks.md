# Tasks: Governance Core

**Input**: Design documents from `/specs/012-governance-core/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks grouped by user story. Constitution requires TDD (Principle II).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US5)
- Exact file paths included

---

## Phase 1: Setup

**Purpose**: Add governance types, Zod schemas, and API client modules

- [x] T001 Add governance TypeScript types (Entitlement, AccessRequest, SodRule, CertificationCampaign, CertificationItem, RiskScore, RiskSummary, and all related enums/request/response types) to `src/lib/api/types.ts`
- [x] T002 [P] Create Zod validation schemas for governance forms (createEntitlementSchema, updateEntitlementSchema, createSodRuleSchema, createCampaignSchema, createAccessRequestSchema, approveRequestSchema, rejectRequestSchema) in `src/lib/schemas/governance.ts`
- [x] T003 [P] Write unit tests for governance Zod schemas in `src/lib/schemas/governance.test.ts`

---

## Phase 2: Foundational (API Clients + BFF Proxies)

**Purpose**: Server-side API clients and BFF proxy endpoints — MUST complete before UI work

**⚠️ CRITICAL**: No user story UI work can begin until API clients exist

- [x] T004 [P] Create server-side governance API client (entitlement CRUD, SoD CRUD, certification CRUD) in `src/lib/api/governance.ts`
- [x] T005 [P] Write unit tests for governance server API client in `src/lib/api/governance.test.ts`
- [x] T006 [P] Create server-side access-requests API client (list, create, get, cancel, approve, reject, my-approvals) in `src/lib/api/access-requests.ts`
- [x] T007 [P] Write unit tests for access-requests server API client in `src/lib/api/access-requests.test.ts`
- [x] T008 [P] Create server-side risk API client (list scores, summary, user score, history, alerts summary, list alerts) in `src/lib/api/risk.ts`
- [x] T009 [P] Write unit tests for risk server API client in `src/lib/api/risk.test.ts`
- [x] T010 [P] Create client-side governance fetch wrappers in `src/lib/api/governance-client.ts`
- [x] T011 [P] Write unit tests for governance client wrappers in `src/lib/api/governance-client.test.ts`
- [x] T012 [P] Create client-side access-requests fetch wrappers in `src/lib/api/access-requests-client.ts`
- [x] T013 [P] Write unit tests for access-requests client wrappers in `src/lib/api/access-requests-client.test.ts`
- [x] T014 [P] Create client-side risk fetch wrappers in `src/lib/api/risk-client.ts`
- [x] T015 [P] Write unit tests for risk client wrappers in `src/lib/api/risk-client.test.ts`
- [x] T016 [P] Create BFF proxy for entitlements: `src/routes/api/governance/entitlements/+server.ts` (GET list, POST create) and `src/routes/api/governance/entitlements/[id]/+server.ts` (GET, PUT, DELETE) and `src/routes/api/governance/entitlements/[id]/owner/+server.ts` (PUT, DELETE)
- [x] T017 [P] Create BFF proxy for access-requests: `src/routes/api/governance/access-requests/+server.ts` (GET, POST), `src/routes/api/governance/access-requests/[id]/+server.ts` (GET), `src/routes/api/governance/access-requests/[id]/approve/+server.ts`, `src/routes/api/governance/access-requests/[id]/reject/+server.ts`, `src/routes/api/governance/access-requests/[id]/cancel/+server.ts`, `src/routes/api/governance/my-approvals/+server.ts`
- [x] T018 [P] Create BFF proxy for SoD: `src/routes/api/governance/sod-rules/+server.ts` (GET, POST), `src/routes/api/governance/sod-rules/[id]/+server.ts` (GET, PUT, DELETE), `src/routes/api/governance/sod-rules/[id]/enable/+server.ts`, `src/routes/api/governance/sod-rules/[id]/disable/+server.ts`, `src/routes/api/governance/sod-violations/+server.ts` (GET)
- [x] T019 [P] Create BFF proxy for certifications: `src/routes/api/governance/certification-campaigns/+server.ts` (GET, POST), `src/routes/api/governance/certification-campaigns/[id]/+server.ts` (GET, PUT, DELETE), `src/routes/api/governance/certification-campaigns/[id]/launch/+server.ts`, `src/routes/api/governance/certification-campaigns/[id]/cancel/+server.ts`, `src/routes/api/governance/certification-campaigns/[id]/progress/+server.ts`, `src/routes/api/governance/certification-campaigns/[id]/items/+server.ts`, `src/routes/api/governance/certification-items/[id]/decide/+server.ts`, `src/routes/api/governance/my-certifications/+server.ts`
- [x] T020 [P] Create BFF proxy for risk: `src/routes/api/governance/risk/scores/+server.ts` (GET), `src/routes/api/governance/risk/scores/summary/+server.ts`, `src/routes/api/governance/risk/alerts/+server.ts` (GET), `src/routes/api/governance/risk/alerts/summary/+server.ts`

**Checkpoint**: All API clients and BFF proxies ready — UI work can now begin

---

## Phase 3: User Story 1 — Entitlement Management (Priority: P1) 🎯 MVP

**Goal**: Admin CRUD for entitlements with pagination, filters, GDPR classification, and risk levels

**Independent Test**: Create, list, edit, delete entitlements; filter by classification/risk

- [x] T021 [US1] Create entitlement-form component (name, description, risk_level select, data_protection_classification select, legal_basis select, is_delegable checkbox, retention fields, purposes) in `src/lib/components/governance/entitlement-form.svelte`
- [x] T022 [US1] Create governance main page with tab layout (Entitlements, Access Requests, SoD, Certifications, Risk) — admin guard in `src/routes/(app)/governance/+page.server.ts` and tab UI in `src/routes/(app)/governance/+page.svelte`
- [x] T023 [US1] Implement entitlement list tab content within governance page — DataTable with columns (name, risk_level badge, classification badge, status badge, actions), pagination, filter dropdowns for risk_level and classification
- [x] T024 [US1] Create entitlement create page with Superforms in `src/routes/(app)/governance/entitlements/create/+page.server.ts` and `src/routes/(app)/governance/entitlements/create/+page.svelte`
- [x] T025 [US1] Create entitlement detail/edit page with view mode, edit mode, delete confirmation, owner management in `src/routes/(app)/governance/entitlements/[id]/+page.server.ts` and `src/routes/(app)/governance/entitlements/[id]/+page.svelte`
- [x] T026 [US1] Add "Governance" item to sidebar navigation in `src/routes/(app)/+layout.svelte` with Shield icon from lucide-svelte

**Checkpoint**: Entitlement CRUD fully functional — can create, list, filter, edit, delete entitlements

---

## Phase 4: User Story 2 — Access Request Workflows (Priority: P2)

**Goal**: Users submit access requests, admins approve/reject, users view their own requests

**Independent Test**: User submits request → admin approves/rejects → user sees status update

- [x] T027 [US2] Create access-request-form component (entitlement selector, justification textarea min 20 chars, optional expiry date) in `src/lib/components/governance/access-request-form.svelte`
- [x] T028 [US2] Implement access requests tab content within governance page — DataTable showing all requests (admin view) with status badges, requester, entitlement name, date, SoD warning indicator
- [x] T029 [US2] Create access request detail page with approve/reject actions for admins in `src/routes/(app)/governance/access-requests/[id]/+page.server.ts` and `src/routes/(app)/governance/access-requests/[id]/+page.svelte`
- [x] T030 [US2] Create "My Requests" page for users — list of own requests with status, cancel action for pending, in `src/routes/(app)/my-requests/+page.server.ts` and `src/routes/(app)/my-requests/+page.svelte`
- [x] T031 [US2] Create "New Request" page for users — select entitlement, add justification, submit in `src/routes/(app)/my-requests/create/+page.server.ts` and `src/routes/(app)/my-requests/create/+page.svelte`
- [x] T032 [US2] Add "My Requests" item to sidebar navigation for all authenticated users in `src/routes/(app)/+layout.svelte`

**Checkpoint**: Full access request workflow — user submits, admin reviews, user tracks status

---

## Phase 5: User Story 3 — Separation of Duties Rules (Priority: P3)

**Goal**: Admin CRUD for SoD rules (incompatible entitlement pairs), violations report

**Independent Test**: Create SoD rule selecting two entitlements, view violations list

- [x] T033 [US3] Create sod-rule-form component (name, description, severity select, first_entitlement select, second_entitlement select, business_rationale) in `src/lib/components/governance/sod-rule-form.svelte`
- [x] T034 [US3] Create sod-violation-list component (table showing user, rule name, conflicting entitlements, severity badge) in `src/lib/components/governance/sod-violation-list.svelte`
- [x] T035 [P] [US3] Write unit tests for sod-violation-list component in `src/lib/components/governance/sod-violation-list.test.ts`
- [x] T036 [US3] Implement SoD tab content within governance page — sub-tabs or sections for "Rules" (DataTable with name, severity badge, status badge, entitlement pair, enable/disable toggle) and "Violations" (sod-violation-list)
- [x] T037 [US3] Create SoD rule create page in `src/routes/(app)/governance/sod/create/+page.server.ts` and `src/routes/(app)/governance/sod/create/+page.svelte`
- [x] T038 [US3] Create SoD rule detail/edit page with enable/disable toggle and delete in `src/routes/(app)/governance/sod/[id]/+page.server.ts` and `src/routes/(app)/governance/sod/[id]/+page.svelte`

**Checkpoint**: SoD rules CRUD + violations display functional

---

## Phase 6: User Story 4 — Certification Campaigns (Priority: P4)

**Goal**: Admin creates campaigns, launches them, reviewers certify/revoke items

**Independent Test**: Create campaign → launch → review items → track progress

- [x] T039 [US4] Create campaign-form component (name, description, scope_type select with conditional scope_config fields, reviewer_type select with conditional specific_reviewers, deadline date picker) in `src/lib/components/governance/campaign-form.svelte`
- [x] T040 [US4] Create campaign-progress component (progress bar with counts: pending, approved, revoked, completion percentage) in `src/lib/components/governance/campaign-progress.svelte`
- [x] T041 [P] [US4] Write unit tests for campaign-progress component in `src/lib/components/governance/campaign-progress.test.ts`
- [x] T042 [US4] Implement certifications tab content within governance page — DataTable with campaign name, status badge, scope, deadline, progress bar, actions (launch/cancel)
- [x] T043 [US4] Create certification campaign create page in `src/routes/(app)/governance/certifications/create/+page.server.ts` and `src/routes/(app)/governance/certifications/create/+page.svelte`
- [x] T044 [US4] Create certification campaign detail page with launch/cancel actions, items list with certify/revoke buttons, progress display in `src/routes/(app)/governance/certifications/[id]/+page.server.ts` and `src/routes/(app)/governance/certifications/[id]/+page.svelte`

**Checkpoint**: Full certification campaign lifecycle functional

---

## Phase 7: User Story 5 — Risk Dashboard (Priority: P5)

**Goal**: Admin views aggregate risk summary, top-risk users, risk alerts

**Independent Test**: View dashboard with risk summary cards, top users list, alert counts

- [x] T045 [US5] Create risk-summary-card component (displays risk level counts with colored badges, average score, total users) in `src/lib/components/governance/risk-summary-card.svelte`
- [x] T046 [P] [US5] Write unit tests for risk-summary-card component in `src/lib/components/governance/risk-summary-card.test.ts`
- [x] T047 [US5] Implement risk tab content within governance page — risk summary cards, top-risk users DataTable (user name, score, risk level badge), risk alerts summary, empty state when no data

**Checkpoint**: Risk dashboard fully functional

---

## Phase 8: Tests & Validation

**Purpose**: Component tests, page tests, svelte-check, full test suite

- [x] T048 [P] Write unit tests for governance-overview component in `src/lib/components/governance/governance-overview.test.ts`
- [x] T049 [P] Write tests for governance page (tab layout, admin guard) in `src/routes/(app)/governance/governance-page.test.ts`
- [x] T050 [P] Write tests for my-requests page in `src/routes/(app)/my-requests/my-requests.test.ts`
- [x] T051 Run `npm run check` to verify zero TypeScript errors across all new files
- [x] T052 Run `npm run test:unit` to verify all existing + new tests pass
- [x] T053 E2E verification with Chrome DevTools MCP — Test entitlement CRUD (create, list, filter, edit, delete), access request workflow (submit, approve, reject, cancel), SoD rules (create, violations), certifications (create, launch, review items), risk dashboard, both light and dark mode

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on T001 (types) — blocks all UI work
- **Phase 3 (US1 Entitlements)**: Depends on Phase 2 completion
- **Phase 4 (US2 Access Requests)**: Depends on Phase 2 completion; partially references entitlements
- **Phase 5 (US3 SoD)**: Depends on Phase 2; SoD rules reference entitlements from US1
- **Phase 6 (US4 Certifications)**: Depends on Phase 2; campaigns reference entitlements
- **Phase 7 (US5 Risk)**: Depends on Phase 2; risk data computed from entitlements
- **Phase 8 (Tests)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Entitlements)**: Foundation only — no cross-story deps
- **US2 (Access Requests)**: Uses entitlement data (entitlement selector references US1 API)
- **US3 (SoD)**: Uses entitlement data (rule form selects entitlement pairs)
- **US4 (Certifications)**: Uses entitlement data (items reference entitlements)
- **US5 (Risk)**: Read-only — uses risk API independently

### Parallel Opportunities

Within Phase 2, tasks T004-T020 (all marked [P]) can run in parallel.
User stories are largely sequential (US1 → US2 → US3 → US4 → US5) since they share the governance page tab layout, but API clients/BFF proxies for each can be built in parallel during Phase 2.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + schemas)
2. Complete Phase 2: Foundational (API clients + BFF proxies)
3. Complete Phase 3: Entitlement Management
4. **STOP and VALIDATE**: Test entitlement CRUD independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add Entitlements (US1) → Test → Deploy (MVP!)
3. Add Access Requests (US2) → Test → Deploy
4. Add SoD Rules (US3) → Test → Deploy
5. Add Certifications (US4) → Test → Deploy
6. Add Risk Dashboard (US5) → Test → Deploy
7. Tests & E2E Validation → Final Deploy

# Tasks: Identity Deduplication & Merging

**Input**: Design documents from `/specs/026-identity-dedup-merging/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD is MANDATORY per constitution Principle II. Write tests FIRST, verify they FAIL, then implement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add TypeScript types and Zod schemas shared across all user stories

- [x] T001 Add dedup/merge TypeScript types to `src/lib/api/types.ts` — DuplicateCandidateResponse, DuplicateDetailResponse, IdentitySummary, AttributeComparison, RuleMatchResponse, DismissDuplicateRequest, RunDetectionScanRequest, DetectionScanResponse, MergePreviewRequest, MergePreviewResponse, EntitlementsPreview, MergeEntitlementSummary, MergeSodCheckResponse, MergeSodViolationResponse, MergeExecuteRequest, MergeOperationResponse, BatchMergeRequest, BatchMergePreviewRequest, BatchMergePreviewResponse, BatchMergeCandidatePreviewResponse, BatchMergeResponse, ListMergeAuditsQuery, MergeAuditSummaryResponse, MergeAuditDetailResponse, MergeErrorResponse, DuplicateStatus, MergeOperationStatus, EntitlementStrategy, AttributeResolutionRule, BatchMergeStatus, ListDuplicatesQuery
- [x] T002 [P] Create dedup Zod schemas in `src/lib/schemas/dedup.ts` — dismissDuplicateSchema (reason required min 1), runDetectionSchema (min_confidence optional number 0-100), mergeExecuteSchema (source_identity_id uuid, target_identity_id uuid, entitlement_strategy enum, attribute_selections optional, entitlement_selections optional array of uuid, sod_override_reason optional), batchMergeSchema (candidate_ids required min 1 uuid array, entitlement_strategy enum, attribute_rule enum, min_confidence optional, skip_sod_violations boolean default false). Use `import { z } from 'zod/v3'`
- [x] T003 [P] Create dedup schema tests in `src/lib/schemas/dedup.test.ts` — valid/invalid dismiss reason, valid/invalid detection confidence, valid/invalid merge execute params (matching UUIDs rejected, missing strategy), valid/invalid batch merge (empty candidate_ids, valid attribute_rule enum values)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server-side API clients, client-side API, and BFF proxy endpoints that all stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Server-side API client

- [x] T004 Create server-side dedup API client in `src/lib/api/dedup.ts` — listDuplicates(params, token, tenantId, fetch), getDuplicate(id, token, tenantId, fetch), dismissDuplicate(id, reason, token, tenantId, fetch), detectDuplicates(minConfidence, token, tenantId, fetch), listMergeOperations(params, token, tenantId, fetch), previewMerge(body, token, tenantId, fetch), executeMerge(body, token, tenantId, fetch), getMergeOperation(id, token, tenantId, fetch), executeBatchMerge(body, token, tenantId, fetch), previewBatchMerge(body, token, tenantId, fetch), listMergeAudits(params, token, tenantId, fetch), getMergeAudit(id, token, tenantId, fetch). Pattern: follow `src/lib/api/imports.ts`
- [x] T005 [P] Create dedup API client tests in `src/lib/api/dedup.test.ts` — mock fetch for all 12 functions, verify correct endpoint/method/params/headers

### Client-side API (for BFF proxy calls)

- [x] T006 [P] Create client-side dedup API in `src/lib/api/dedup-client.ts` — fetchDuplicates(params), fetchDuplicateDetail(id), dismissDuplicateClient(id, reason), runDetection(minConfidence), fetchMergePreview(body), executeMergeClient(body), fetchBatchPreview(body), executeBatchMergeClient(body), fetchMergeAudits(params), fetchMergeAuditDetail(id). All call `/api/governance/duplicates/...` or `/api/governance/merges/...` BFF proxies

### BFF Proxy Endpoints

- [x] T007 [P] Create duplicates list + detect BFF proxy in `src/routes/api/governance/duplicates/+server.ts` — GET (list with query params: status, min_confidence, max_confidence, identity_id, limit, offset) and POST (detect with min_confidence body)
- [x] T008 [P] Create duplicate detail BFF proxy in `src/routes/api/governance/duplicates/[id]/+server.ts` — GET (forward to backend)
- [x] T009 [P] Create duplicate dismiss BFF proxy in `src/routes/api/governance/duplicates/[id]/dismiss/+server.ts` — POST (forward reason body)
- [x] T010 [P] Create merges list BFF proxy in `src/routes/api/governance/merges/+server.ts` — GET (list with limit/offset)
- [x] T011 [P] Create merge preview BFF proxy in `src/routes/api/governance/merges/preview/+server.ts` — POST (forward preview request body)
- [x] T012 [P] Create merge execute BFF proxy in `src/routes/api/governance/merges/execute/+server.ts` — POST (forward execute request body)
- [x] T013 [P] Create merge detail BFF proxy in `src/routes/api/governance/merges/[id]/+server.ts` — GET (forward to backend)
- [x] T014 [P] Create batch merge BFF proxy in `src/routes/api/governance/merges/batch/+server.ts` — POST (forward batch execute request body)
- [x] T015 [P] Create batch merge preview BFF proxy in `src/routes/api/governance/merges/batch/preview/+server.ts` — POST (forward batch preview request body)
- [x] T016 [P] Create merge audit list BFF proxy in `src/routes/api/governance/merges/audit/+server.ts` — GET (list with query params: identity_id, operator_id, from_date, to_date, limit, offset)
- [x] T017 [P] Create merge audit detail BFF proxy in `src/routes/api/governance/merges/audit/[id]/+server.ts` — GET (forward to backend)

### Sidebar Navigation

- [x] T018 Add "Deduplication" link to sidebar in `src/routes/(app)/+layout.svelte` — admin-only, under Governance section, with GitMerge icon from lucide-svelte

**Checkpoint**: Foundation ready — all API clients, BFF proxies, types, and schemas are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — View Duplicate Candidates (Priority: P1) + User Story 2 — Preview & Execute Merge (Priority: P1) — MVP

**Goal**: Admin can see detected duplicate pairs with confidence scores, click into detail with attribute comparison, preview a merge with field-level selection, and execute the merge.

**Independent Test**: Navigate to dedup hub → see duplicate list → click pair → see comparison → click Merge → select attributes + strategy → preview → execute → verify merged.

**Note**: US1 and US2 are tightly coupled (viewing duplicates leads directly to merging), so they are combined into a single MVP phase.

### Tests for US1+US2

- [x] T019 [P] [US1] Create dedup hub page server tests in `src/routes/(app)/governance/dedup/dedup.test.ts` — load: admin guard redirect, returns duplicate list with pagination; load: filters by status and min_confidence
- [x] T020 [P] [US2] Create dedup detail page server tests in `src/routes/(app)/governance/dedup/[id]/dedup-detail.test.ts` — load: admin guard, returns duplicate detail with comparison; actions.dismiss: calls dismissDuplicate with reason, returns success; actions.dismiss on empty reason: returns validation error
- [x] T021 [P] [US2] Create merge page server tests in `src/routes/(app)/governance/dedup/[id]/merge/merge.test.ts` — load: calls previewMerge, returns preview data; actions.execute: calls executeMerge with selections, redirects on success; actions.execute with SoD violations and no override: returns error; actions.execute on ApiError: returns error message

### Implementation for US1+US2

- [x] T022 [P] [US1] Create confidence-badge component in `src/lib/components/dedup/confidence-badge.svelte` — color-coded badge: low (0-50 gray), medium (50-80 yellow), high (80-100 green). Props: score (number), size optional
- [x] T023 [P] [US1] Create confidence-badge tests in `src/lib/components/dedup/confidence-badge.test.ts` — renders score, applies correct color class for each tier
- [x] T024 [P] [US1] Create attribute-comparison component in `src/lib/components/dedup/attribute-comparison.svelte` — side-by-side table with attribute name, value A, value B, match/differ indicator. Props: comparisons (AttributeComparison[]), identityA (IdentitySummary), identityB (IdentitySummary)
- [x] T025 [P] [US1] Create attribute-comparison tests in `src/lib/components/dedup/attribute-comparison.test.ts` — renders all attributes, highlights differing values, shows identity headers
- [x] T026 [P] [US2] Create sod-violations component in `src/lib/components/dedup/sod-violations.svelte` — displays SoD violation list with rule name, severity, conflicting entitlements. Props: sodCheck (MergeSodCheckResponse)
- [x] T027 [P] [US2] Create sod-violations tests in `src/lib/components/dedup/sod-violations.test.ts` — renders violations, shows "no violations" when empty, shows override-able indicator
- [x] T028 [P] [US2] Create entitlement-preview component in `src/lib/components/dedup/entitlement-preview.svelte` — displays entitlements in 4 categories: source-only, target-only, common, merged. Props: preview (EntitlementsPreview), strategy (EntitlementStrategy)
- [x] T029 [P] [US2] Create entitlement-preview tests in `src/lib/components/dedup/entitlement-preview.test.ts` — renders all 4 categories, shows application names, handles empty arrays
- [x] T030 [US1] Create dedup hub page server in `src/routes/(app)/governance/dedup/+page.server.ts` — load: hasAdminRole guard, listDuplicates with status/min_confidence/limit/offset from URL params; actions.detect: call detectDuplicates with optional min_confidence, return scan results
- [x] T031 [US1] Create dedup hub page in `src/routes/(app)/governance/dedup/+page.svelte` — 3-tab layout (Duplicates | Batch Merge | Merge History) using ARIA tabs; Duplicates tab: filter controls (status select, min confidence input), paginated list table with columns: identities (names/emails), confidence badge, status badge, detected date, link to detail; "Run Detection" button with confidence threshold input and confirm dialog; empty state for no duplicates
- [x] T032 [US1] Create dedup detail page server in `src/routes/(app)/governance/dedup/[id]/+page.server.ts` — load: hasAdminRole guard, getDuplicate(id); actions.dismiss: validate reason with dismissDuplicateSchema, call dismissDuplicate, redirect to hub on success
- [x] T033 [US1] Create dedup detail page in `src/routes/(app)/governance/dedup/[id]/+page.svelte` — header with confidence badge and status, side-by-side identity summaries using attribute-comparison component, rule match breakdown table (rule name, attribute, similarity, weighted score), "Merge" button (link to merge page), "Dismiss" button with reason dialog
- [x] T034 [US2] Create merge page server in `src/routes/(app)/governance/dedup/[id]/merge/+page.server.ts` — load: hasAdminRole guard, getDuplicate(id) for identities, previewMerge with default union strategy; actions.execute: validate with mergeExecuteSchema, call executeMerge, redirect to hub on success; handle SoD violation errors
- [x] T035 [US2] Create merge page in `src/routes/(app)/governance/dedup/[id]/merge/+page.svelte` — side-by-side identity display, for each differing attribute: radio buttons (source/target) to select value; entitlement strategy select (union/intersection/manual); if manual: checkboxes for each entitlement; entitlement-preview component showing merged result; sod-violations component if violations exist; SoD override reason textarea (required if violations); "Execute Merge" button (disabled if SoD violations without override reason); "Cancel" link back to detail

**Checkpoint**: User Stories 1+2 complete. Admin can view duplicates, drill into detail, and execute merges with full preview.

---

## Phase 4: User Story 3 — Dismiss False Positives (Priority: P2) + User Story 4 — Run Detection Scan (Priority: P2)

**Goal**: Admin can dismiss false positive pairs and trigger manual detection scans.

**Independent Test**: Dismiss a pair with reason → verify removed from pending. Run detection → verify results displayed.

**Note**: These are already partially implemented in Phase 3 (dismiss action on detail page, detect action on hub). This phase adds dedicated tests and polish.

### Tests for US3+US4

- [x] T036 [P] [US3] Create dismiss-specific tests in `src/routes/(app)/governance/dedup/[id]/dedup-detail.test.ts` — append tests: dismiss with empty reason returns validation error; dismiss on ApiError returns error message; dismiss with valid reason redirects to hub
- [x] T037 [P] [US4] Create detection-specific tests in `src/routes/(app)/governance/dedup/dedup.test.ts` — append tests: actions.detect with default confidence returns scan results; actions.detect with custom threshold passes param; actions.detect on ApiError returns error

**Checkpoint**: User Stories 3+4 complete. False positive management and manual detection are fully functional.

---

## Phase 5: User Story 5 — Batch Merge Operations (Priority: P2)

**Goal**: Admin can select multiple duplicate pairs and merge them in batch with configurable strategy and attribute resolution rules.

**Independent Test**: Navigate to Batch Merge tab → configure settings → preview → execute → see results summary.

### Tests for US5

- [x] T038 [P] [US5] Create batch merge page server tests in `src/routes/(app)/governance/dedup/batch/batch.test.ts` — load: admin guard, returns pending duplicates for selection; actions.preview: calls previewBatchMerge, returns preview; actions.execute: calls executeBatchMerge, returns results with counts; actions.execute on ApiError: returns error

### Implementation for US5

- [x] T039 [US5] Create batch merge page server in `src/routes/(app)/governance/dedup/batch/+page.server.ts` — load: hasAdminRole guard, listDuplicates with status=pending for selection; actions.preview: parse candidate_ids + strategy + attribute_rule from FormData, call previewBatchMerge, return preview; actions.execute: parse batch params, call executeBatchMerge, return results
- [x] T040 [US5] Create batch merge page in `src/routes/(app)/governance/dedup/batch/+page.svelte` — candidate selection (checkboxes in table of pending pairs with confidence scores); entitlement strategy select (union/intersection/manual); attribute resolution rule select (newest_wins/oldest_wins/prefer_non_null); "skip SoD violations" checkbox; "Preview" button → shows list of pairs to be merged; "Execute Batch" button → shows results card with total, successful, failed, skipped counts; back link to dedup hub

**Checkpoint**: User Story 5 complete. Batch merge operations are functional.

---

## Phase 6: User Story 6 — Merge Audit Trail (Priority: P3)

**Goal**: Admin can view the complete audit history of merge operations with full pre/post snapshots.

**Independent Test**: Navigate to Merge History tab → see audit list → click entry → see full audit detail with snapshots.

### Tests for US6

- [x] T041 [P] [US6] Create audit detail page server tests in `src/routes/(app)/governance/dedup/audit/[id]/audit-detail.test.ts` — load: admin guard, returns audit detail with snapshots; load on not found: returns error

### Implementation for US6

- [x] T042 [P] [US6] Create merge-preview component (reusable snapshot display) in `src/lib/components/dedup/merge-preview.svelte` — displays an IdentitySummary with all fields in a card format. Props: identity (IdentitySummary), title (string). Reused for source/target/merged snapshots in audit detail
- [x] T043 [P] [US6] Create merge-preview tests in `src/lib/components/dedup/merge-preview.test.ts` — renders identity fields, handles null values, shows title
- [x] T044 [US6] Add audit list to dedup hub page — in `src/routes/(app)/governance/dedup/+page.svelte`, populate Merge History tab with client-side fetch of audit list (fetchMergeAudits), table with columns: operation, source/target identities, operator, date, link to detail; filter by date range
- [x] T045 [US6] Create audit detail page server in `src/routes/(app)/governance/dedup/audit/[id]/+page.server.ts` — load: hasAdminRole guard, getMergeAudit(id), return full audit detail
- [x] T046 [US6] Create audit detail page in `src/routes/(app)/governance/dedup/audit/[id]/+page.svelte` — header with operation info and timestamp; 3-panel layout: source snapshot (merge-preview component), target snapshot, merged result; attribute decisions table (attribute, source value, target value, selected source/target); entitlement decisions section (strategy, lists of source/target/merged/excluded); SoD violations section if present (with override reason); back link to dedup hub

**Checkpoint**: User Story 6 complete. Full merge audit trail with snapshots is accessible.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Type checking, full test suite verification, E2E testing

- [x] T047 Run `npm run check` — fix any TypeScript or Svelte compilation errors
- [x] T048 Run `npx vitest run` — verify all existing + new tests pass (target: 2800+ tests)
- [ ] T049 E2E test: Duplicate list — navigate to /governance/dedup, verify list loads with filters, click into detail, verify attribute comparison and rule matches
- [ ] T050 E2E test: Merge flow — from duplicate detail click Merge, select attributes, choose strategy, preview, execute, verify success
- [ ] T051 E2E test: Dismiss — from duplicate detail, dismiss with reason, verify removed from pending
- [ ] T052 E2E test: Detection scan — click Run Detection, verify results displayed
- [ ] T053 E2E test: Batch merge — select pairs, configure, preview, execute, verify results
- [ ] T054 E2E test: Audit trail — navigate to Merge History, click audit entry, verify snapshots and decisions displayed
- [ ] T055 Verify dark mode rendering for all new pages via Chrome DevTools MCP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types) — BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Phase 2 — MVP delivery
- **US3+US4 (Phase 4)**: Depends on Phase 3 (extends existing pages with additional tests)
- **US5 (Phase 5)**: Depends on Phase 2 only — can run in parallel with Phase 3
- **US6 (Phase 6)**: Depends on Phase 2 only — can run in parallel with Phase 3/5
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1+US2 (P1)**: After Phase 2 — No dependencies on other stories
- **US3+US4 (P2)**: After Phase 3 — Extends US1 pages with additional test coverage
- **US5 (P2)**: After Phase 2 — Independent of US1-US4 (uses batch endpoint only)
- **US6 (P3)**: After Phase 2 — Independent of US1-US5 (uses audit endpoint only)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Components before pages
- Page server before page svelte
- Core implementation before integration

### Parallel Opportunities

- T002, T003 can run in parallel (schemas + tests)
- T005, T006 can run in parallel (API tests + client API)
- T007-T017 can ALL run in parallel (BFF proxies are independent files)
- T019-T029 can ALL run in parallel (tests + components are independent)
- Phase 5 (batch) and Phase 6 (audit) can run in parallel with Phase 3

---

## Implementation Strategy

### MVP First (User Stories 1+2 Only)

1. Complete Phase 1: Setup (types + schemas)
2. Complete Phase 2: Foundational (API clients + BFF proxies)
3. Complete Phase 3: US1+US2 (duplicate list + merge preview/execute)
4. **STOP and VALIDATE**: Test duplicate viewing and merging independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1+US2 → Test independently → Deploy/Demo (MVP!)
3. Add US3+US4 → Test dismiss + detection → Deploy/Demo
4. Add US5 → Test batch merge → Deploy/Demo
5. Add US6 → Test audit trail → Deploy/Demo
6. Each story adds value without breaking previous stories

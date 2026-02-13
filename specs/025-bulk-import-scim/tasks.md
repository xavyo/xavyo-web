# Tasks: Bulk User Import & SCIM Administration

**Input**: Design documents from `/specs/025-bulk-import-scim/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD is MANDATORY per constitution Principle II. Write tests FIRST, verify they FAIL, then implement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add TypeScript types and Zod schemas shared across all user stories

- [X] T001 Add import and SCIM TypeScript types to `src/lib/api/types.ts` — ImportJobSummary, ImportJobDetail, ImportError, ImportJobCreatedResponse, BulkResendResponse, InvitationValidationResponse, AcceptInvitationRequest, AcceptInvitationResponse, ScimTokenInfo, ScimTokenCreated, ScimAttributeMapping, ImportJobStatus type, ImportErrorType type
- [X] T002 [P] Create import Zod schemas in `src/lib/schemas/imports.ts` — acceptInvitationSchema (password 8-128 + confirm_password match), import validation (file accept .csv)
- [X] T003 [P] Create SCIM Zod schemas in `src/lib/schemas/scim.ts` — createScimTokenSchema (name required, min 1), mappingRequestSchema (scim_path, xavyo_field, transform enum, required bool)
- [X] T004 [P] Create import schema tests in `src/lib/schemas/imports.test.ts` — valid/invalid password, password mismatch, length constraints
- [X] T005 [P] Create SCIM schema tests in `src/lib/schemas/scim.test.ts` — valid/invalid token name, valid/invalid mapping transforms

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server-side API clients, client-side API, and BFF proxy endpoints that all stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Server-side API clients

- [X] T006 [P] Create server-side import API client in `src/lib/api/imports.ts` — uploadImport (multipart), listImportJobs, getImportJob, listImportErrors, downloadImportErrors, resendInvitations, validateInvitation, acceptInvitation (public endpoints don't need auth)
- [X] T007 [P] Create server-side SCIM API client in `src/lib/api/scim.ts` — listScimTokens, createScimToken, revokeScimToken, listScimMappings, updateScimMappings
- [X] T008 [P] Create import API client tests in `src/lib/api/imports.test.ts` — mock fetch for all 8 functions, verify correct endpoint/method/params
- [X] T009 [P] Create SCIM API client tests in `src/lib/api/scim.test.ts` — mock fetch for all 5 functions, verify correct endpoint/method/params

### Client-side API (for BFF proxy calls)

- [X] T010 [P] Create client-side import API in `src/lib/api/imports-client.ts` — fetchImportJobs, fetchImportJob, fetchImportErrors, downloadErrorCsv (window.open for download), resendInvitationsClient
- [X] T011 [P] Create client-side SCIM API in `src/lib/api/scim-client.ts` — fetchScimTokens, createScimTokenClient, revokeScimTokenClient, fetchScimMappings, updateScimMappingsClient

### BFF Proxy Endpoints — Imports

- [X] T012 [P] Create import list + upload BFF proxy in `src/routes/api/admin/imports/+server.ts` — GET (list with pagination params) and POST (multipart forward: extract file from FormData, create new FormData, forward to backend with token/tenantId)
- [X] T013 [P] Create import detail BFF proxy in `src/routes/api/admin/imports/[id]/+server.ts` — GET (forward to backend)
- [X] T014 [P] Create import errors BFF proxy in `src/routes/api/admin/imports/[id]/errors/+server.ts` — GET (forward with pagination params)
- [X] T015 [P] Create import error CSV download BFF proxy in `src/routes/api/admin/imports/[id]/errors/download/+server.ts` — GET (stream CSV response with Content-Type: text/csv, Content-Disposition: attachment)
- [X] T016 [P] Create import resend invitations BFF proxy in `src/routes/api/admin/imports/[id]/resend-invitations/+server.ts` — POST (forward to backend)

### BFF Proxy Endpoints — SCIM

- [X] T017 [P] Create SCIM tokens BFF proxy in `src/routes/api/admin/scim/tokens/+server.ts` — GET (list tokens), POST (create token, forward JSON body)
- [X] T018 [P] Create SCIM token revoke BFF proxy in `src/routes/api/admin/scim/tokens/[id]/+server.ts` — DELETE (revoke token)
- [X] T019 [P] Create SCIM mappings BFF proxy in `src/routes/api/admin/scim/mappings/+server.ts` — GET (list mappings), PUT (upsert mappings array)

### Sidebar Navigation

- [X] T020 Add "Imports" and "SCIM" links to sidebar in `src/routes/(app)/+layout.svelte` — admin-only, under Settings section, with Upload and Key icons from lucide-svelte

**Checkpoint**: Foundation ready — all API clients, BFF proxies, types, and schemas are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Bulk CSV Import (Priority: P1) + User Story 2 — Job Monitoring (Priority: P1) — MVP

**Goal**: Admin can upload a CSV file to import users, view job list with status badges, click into job detail with error drill-down, download error CSV, and resend invitations.

**Independent Test**: Upload a CSV → verify job appears in list → click job → see error breakdown → download CSV → resend invitations.

**Note**: US1 and US2 are tightly coupled (upload produces the job that monitoring displays), so they are combined into a single phase.

### Tests for US1+US2

- [X] T021 [P] [US1] Create imports page server tests in `src/routes/(app)/settings/imports/imports.test.ts` — load: admin guard redirect, returns job list; actions.upload: creates job, returns redirect; actions.upload with non-csv: returns error; actions.upload with send_invitations toggle
- [X] T022 [P] [US2] Create import detail page server tests in `src/routes/(app)/settings/imports/[id]/import-detail.test.ts` — load: admin guard, returns job detail + errors; actions.resend: calls resendInvitations, returns success; actions.resend on ApiError: returns error message

### Implementation for US1+US2

- [X] T023 [US1] Create imports list + upload page server in `src/routes/(app)/settings/imports/+page.server.ts` — load: hasAdminRole guard, listImportJobs with pagination from URL params; action upload: read FormData file + send_invitations, call uploadImport, redirect to list on success, return fail on error (409 concurrent, 413 too large, 400 invalid)
- [X] T024 [US1] Create imports list + upload page in `src/routes/(app)/settings/imports/+page.svelte` — file upload form (input type="file" accept=".csv", checkbox for send_invitations, submit button), job list table below with columns: file name, status badge (color-coded), total/success/error/skip counts, created date, link to detail; pagination controls; empty state when no jobs
- [X] T025 [US2] Create import detail page server in `src/routes/(app)/settings/imports/[id]/+page.server.ts` — load: hasAdminRole guard, getImportJob + listImportErrors with pagination; actions.resend: resendInvitations, return success/error; actions.download: handled client-side via BFF proxy
- [X] T026 [US2] Create import detail page in `src/routes/(app)/settings/imports/[id]/+page.svelte` — job summary card (status badge, file name, file size, counts bar chart or grid), error list table (line number, email, column, error type badge, message) with pagination, "Download Error CSV" button (links to BFF download proxy), "Resend Invitations" button (form action with confirm dialog), back link to imports list

**Checkpoint**: User Stories 1+2 complete. Admin can upload CSV, see job status, drill into errors, download error CSV, and resend invitations.

---

## Phase 4: User Story 3 — Invitation Acceptance Flow (Priority: P2)

**Goal**: Imported users can click their invitation link, see their email, set a password, and activate their account.

**Independent Test**: Navigate to `/invite/:token` with a valid token → see email → set password → redirected to login.

### Tests for US3

- [X] T027 [P] [US3] Create invitation acceptance page server tests in `src/routes/(auth)/invite/[token]/invite.test.ts` — load: valid token shows email + form; load: expired token shows error; load: invalid token shows error; actions.default: valid password activates account; actions.default: short password returns validation error; actions.default: mismatched passwords returns error; actions.default: backend error returns message

### Implementation for US3

- [X] T028 [US3] Create invitation acceptance page server in `src/routes/(auth)/invite/[token]/+page.server.ts` — load: call validateInvitation(token) directly to backend (no auth needed), return validation result + superForm; action default: validate password with acceptInvitationSchema, call acceptInvitation(token, password), redirect to /login on success, return error on failure
- [X] T029 [US3] Create invitation acceptance page in `src/routes/(auth)/invite/[token]/+page.svelte` — if valid: show email, password + confirm_password fields, submit button; if expired: show "This invitation has expired" with admin contact hint; if already_accepted: show "This invitation has already been used" with login link; if invalid: show "Invalid invitation link"; use (auth) layout branded styling matching login/signup pages

**Checkpoint**: User Story 3 complete. Imported users can accept invitations and activate their accounts.

---

## Phase 5: User Story 4 — SCIM Token Management (Priority: P2)

**Goal**: Admins can create SCIM tokens (with one-time raw token display), view token list, and revoke tokens.

**Independent Test**: Create a token → see raw token once → dismiss → verify prefix in list → revoke → verify removed.

### Tests for US4

- [X] T030 [P] [US4] Create SCIM page server tests in `src/routes/(app)/settings/scim/scim.test.ts` — load: admin guard redirect, returns tokens + mappings; actions.createToken: returns created token with raw value; actions.createToken with empty name: returns validation error; actions.revokeToken: calls revokeScimToken, returns success; actions.revokeToken on ApiError: returns error

### Implementation for US4

- [X] T031 [US4] Create SCIM admin page server in `src/routes/(app)/settings/scim/+page.server.ts` — load: hasAdminRole guard, listScimTokens + listScimMappings; actions.createToken: validate name with createScimTokenSchema, call createScimToken, return created token data (with raw token); actions.revokeToken: read id from FormData, call revokeScimToken, return success/error
- [X] T032 [US4] Create SCIM admin page (tokens tab) in `src/routes/(app)/settings/scim/+page.svelte` — two-tab layout (Tokens | Mappings) using ARIA tabs; Tokens tab: "Create Token" button → form with name input; on success: show raw token in highlighted card with copy-to-clipboard button + warning text; token list table: name, prefix, created date, last used date, revoke button with confirm dialog; empty state when no tokens

**Checkpoint**: User Story 4 complete. Admins can manage SCIM provisioning tokens.

---

## Phase 6: User Story 5 — SCIM Attribute Mappings (Priority: P3)

**Goal**: Admins can view and edit SCIM attribute mappings (transform and required flag).

**Independent Test**: View mappings table → change a transform → save → reload → verify change persisted.

### Tests for US5

- [X] T033 [P] [US5] Create SCIM mappings tests in `src/routes/(app)/settings/scim/scim-mappings.test.ts` — actions.updateMappings: sends full mappings array to backend, returns success; actions.updateMappings on ApiError: returns error message

### Implementation for US5

- [X] T034 [US5] Add mappings action to SCIM page server in `src/routes/(app)/settings/scim/+page.server.ts` — actions.updateMappings: parse mappings from FormData (parallel arrays: scim_path[], xavyo_field[], transform[], required[]), call updateScimMappings, return success/error
- [X] T035 [US5] Add Mappings tab to SCIM page in `src/routes/(app)/settings/scim/+page.svelte` — Mappings tab content: table with columns (SCIM Path read-only, Platform Field read-only, Transform dropdown select: none/lowercase/uppercase/trim, Required checkbox), "Save Changes" button that submits all mappings as batch update via form action; success toast on save

**Checkpoint**: User Story 5 complete. All SCIM attribute mapping management is functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Type checking, full test suite verification, E2E testing

- [X] T036 Run `npm run check` — 0 errors, 121 warnings (all expected state_referenced_locally from Superforms)
- [X] T037 Run `npx vitest run` — 2762 tests pass across 182 test files (1 pre-existing Bits UI body-scroll-lock error)
- [X] T038 E2E test: Import flow — upload CSV with 4 rows (3 valid, 1 invalid email), job detail shows 3 success/1 error, error detail shows "Email must contain exactly one '@'" on line 5
- [X] T039 E2E test: Invitation acceptance — tested invalid token (error page), valid token (accept form), password validation, successful acceptance → redirect to /login. **Bug fixed**: backend returned `/auth/login` redirect but SvelteKit route is `/login`
- [X] T040 E2E test: SCIM tokens — create token with one-time display, copy button works, revoke with confirm dialog. **Bug fixed**: toast duplication from `$effect` + `$page.form` re-firing — replaced with `use:svelteEnhance` callbacks
- [X] T041 E2E test: SCIM mappings — Mappings tab shows empty state correctly, tab switching works
- [X] T042 Verify dark mode rendering — all pages (imports list, import detail, SCIM tokens/mappings, invitation acceptance) render correctly in both light and dark modes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types) — BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Phase 2 — MVP delivery
- **US3 (Phase 4)**: Depends on Phase 2 only — can run in parallel with Phase 3
- **US4 (Phase 5)**: Depends on Phase 2 only — can run in parallel with Phase 3/4
- **US5 (Phase 6)**: Depends on Phase 5 (shares SCIM page)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1+US2 (P1)**: After Phase 2 — No dependencies on other stories
- **US3 (P2)**: After Phase 2 — Independent of US1+US2 (uses separate endpoints)
- **US4 (P2)**: After Phase 2 — Independent of US1-US3
- **US5 (P3)**: After US4 — Shares SCIM page server and page component

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Page server before page component
- Core implementation before integration

### Parallel Opportunities

- T002, T003, T004, T005 can all run in parallel (different files)
- T006-T019 can all run in parallel (different files)
- T021, T022 can run in parallel (different test files)
- US1+US2, US3, and US4 can start in parallel after Phase 2
- T030, T033 can run in parallel (different test files)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# All API clients and BFF proxies can be created in parallel:
Task: "Create import API client in src/lib/api/imports.ts"
Task: "Create SCIM API client in src/lib/api/scim.ts"
Task: "Create import client-side API in src/lib/api/imports-client.ts"
Task: "Create SCIM client-side API in src/lib/api/scim-client.ts"
Task: "Create import BFF proxy in src/routes/api/admin/imports/+server.ts"
# ... all BFF proxies in parallel
```

---

## Implementation Strategy

### MVP First (US1+US2 Only)

1. Complete Phase 1: Setup (types + schemas)
2. Complete Phase 2: Foundational (API clients + BFF proxies)
3. Complete Phase 3: US1+US2 (import upload + job monitoring)
4. **STOP and VALIDATE**: Upload a CSV, verify job list, drill into errors
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1+US2 → Test independently → Deploy/Demo (MVP!)
3. Add US3 → Test invitation flow → Deploy/Demo
4. Add US4 → Test SCIM tokens → Deploy/Demo
5. Add US5 → Test SCIM mappings → Deploy/Demo
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Constitution Principle II (TDD) is mandatory — tests written before implementation
- Constitution Principle VIII (Backend Fidelity) — all endpoints verified in xavyo-idp
- Multipart upload in BFF proxy: do NOT set Content-Type header manually, let fetch auto-set boundary
- SCIM tokens/mappings return flat arrays, NOT paginated responses
- Invitation page is in (auth) route group (unauthenticated)
- Import pagination uses {items, total, limit, offset} format

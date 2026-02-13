# Tasks: User Invitations

**Input**: Design documents from `/specs/019-user-invitations/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included per constitution (TDD mandatory — Principle II).

**Organization**: Tasks grouped by user story. 3 user stories: P1 List, P2 Create, P3 Resend/Cancel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Types & Schemas)

**Purpose**: Add TypeScript types and Zod validation schemas shared by all user stories

- [x] T001 Add Invitation types to `src/lib/api/types.ts` — Invitation interface (id, email, status, role_template_id, invited_by_user_id, expires_at, created_at, accepted_at), InvitationListResponse ({invitations, total, limit, offset}), CreateInvitationRequest ({email, roles?})
- [x] T002 Create Zod schemas in `src/lib/schemas/invitations.ts` — createInvitationSchema (email: z.string().email()), import from zod/v3
- [x] T003 [P] Create schema tests in `src/lib/schemas/invitations.test.ts` — valid email, invalid email, empty email

**Checkpoint**: Types and schemas ready for API clients

---

## Phase 2: Foundational (API Clients & BFF Proxies)

**Purpose**: Server-side API client, client-side API, and BFF proxy endpoints. MUST complete before UI pages.

- [x] T004 Create server-side API client in `src/lib/api/invitations.ts` — listInvitations(params, token, tenantId, fetch), createInvitation(body, token, tenantId, fetch), resendInvitation(id, token, tenantId, fetch), cancelInvitation(id, token, tenantId, fetch). Backend path prefix: `/admin/invitations`
- [x] T005 [P] Create client-side API client in `src/lib/api/invitations-client.ts` — fetchInvitations(params, fetchFn), createInvitationClient(data, fetchFn), resendInvitationClient(id, fetchFn), cancelInvitationClient(id, fetchFn). BFF path prefix: `/api/invitations`
- [x] T006 [P] Create server-side API client tests in `src/lib/api/invitations.test.ts` — mock fetch, verify URLs contain `/admin/invitations`, verify headers, test all 4 functions
- [x] T007 [P] Create client-side API client tests in `src/lib/api/invitations-client.test.ts` — mock fetch, verify URLs contain `/api/invitations`, test all 4 functions
- [x] T008 [P] Create BFF proxy for list+create in `src/routes/api/invitations/+server.ts` — GET handler (forward query params to listInvitations), POST handler (parse JSON body, call createInvitation). Both validate accessToken/tenantId from cookies, return 401 if missing
- [x] T009 [P] Create BFF proxy for cancel in `src/routes/api/invitations/[id]/+server.ts` — DELETE handler (call cancelInvitation with params.id). Validate auth cookies
- [x] T010 [P] Create BFF proxy for resend in `src/routes/api/invitations/[id]/resend/+server.ts` — POST handler (call resendInvitation with params.id). Validate auth cookies

**Checkpoint**: All API infrastructure ready — UI pages can now be built

---

## Phase 3: User Story 1 — Invitation List & Management (Priority: P1)

**Goal**: Paginated list of invitations with status badges, email search, and status filter

**Independent Test**: Navigate to /invitations, verify list loads with correct columns, badges, search, and filter

### Tests for User Story 1

- [x] T011 [P] [US1] Create list page tests in `src/routes/(app)/invitations/invitations.test.ts` — test load function redirects non-admin, test load function returns invitations data, test page renders invitation rows with email/status/dates

### Implementation for User Story 1

- [x] T012 [US1] Create list page server load in `src/routes/(app)/invitations/+page.server.ts` — admin guard with hasAdminRole, call listInvitations with query params (status, email, limit, offset), return { invitations, total, limit, offset }
- [x] T013 [US1] Create list page in `src/routes/(app)/invitations/+page.svelte` — PageHeader with title "Invitations" and "Invite User" button link, search input for email, status filter dropdown (All/Sent/Cancelled/Accepted), invitation table with columns: Email, Status (badge), Invited Date, Expires Date. Status badges: sent=default, cancelled=destructive, accepted=success. Compute expired: status==='sent' && new Date(expires_at) < new Date() shows "Expired" badge. EmptyState when no invitations. Pagination controls at bottom

**Checkpoint**: List page fully functional — admins can view and filter all invitations

---

## Phase 4: User Story 2 — Create Invitation (Priority: P2)

**Goal**: Form to invite a user by email with validation and success redirect

**Independent Test**: Navigate to /invitations/create, enter email, submit, verify redirect to list with success toast

### Tests for User Story 2

- [x] T014 [P] [US2] Create create page tests in `src/routes/(app)/invitations/create/invitations-create.test.ts` — test load redirects non-admin, test action validates email, test action calls createInvitation and redirects on success, test action handles ApiError

### Implementation for User Story 2

- [x] T015 [US2] Create create page server in `src/routes/(app)/invitations/create/+page.server.ts` — admin guard, superValidate with createInvitationSchema, action: validate form, call createInvitation(body, token, tenantId, fetch), redirect to /invitations on success, handle ApiError with message()
- [x] T016 [US2] Create create page in `src/routes/(app)/invitations/create/+page.svelte` — PageHeader "Invite User", Card with form: email input (required, type=email), submit button "Send Invitation", cancel link back to /invitations. Show $message errors. Use superForm with onResult for success toast

**Checkpoint**: Admins can now create invitations — full create+list flow works

---

## Phase 5: User Story 3 — Resend & Cancel Actions (Priority: P3)

**Goal**: Resend and cancel actions on the list page for "sent" status invitations

**Independent Test**: Create invitation, click Resend (verify toast), click Cancel (verify confirmation dialog, status change)

### Tests for User Story 3

- [x] T017 [P] [US3] Create action tests in `src/routes/(app)/invitations/invitations.test.ts` (merged into US1 test file) — test resend action calls resendInvitation and returns success, test cancel action calls cancelInvitation and returns success, test actions handle errors

### Implementation for User Story 3

- [x] T018 [US3] Add resend and cancel form actions to `src/routes/(app)/invitations/+page.server.ts` — named actions: resend (validate id, call resendInvitation), cancel (validate id, call cancelInvitation). Both handle ApiError. Return { success: true } or fail with message
- [x] T019 [US3] Add resend/cancel action buttons to `src/routes/(app)/invitations/+page.svelte` — For each invitation row with status==='sent' and not expired: show "Resend" button (form action=?/resend with hidden id input), show "Cancel" button (form action=?/cancel with hidden id input, confirm dialog before submit). Disable both buttons for cancelled/accepted/expired invitations. Use enhance for AJAX submission. Show success/error toasts via onResult callback. After action success, invalidateAll() to refresh list

**Checkpoint**: Full invitation lifecycle works — create, list, resend, cancel

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar nav, TypeScript check, full test suite, E2E testing

- [x] T020 Add "Invitations" nav item to `src/routes/(app)/+layout.svelte` — Add entry with Mail icon (from lucide-svelte) in admin section, href="/invitations", place after "Users" link. Admin-only visibility (inside `if (data.isAdmin)` block)
- [x] T021 Run `npm run check` to verify zero TypeScript errors — 0 errors, 85 warnings (all state_referenced_locally)
- [x] T022 Run `npx vitest run` to verify all tests pass — 2205 tests passing across 154 files
- [x] T023 E2E test: Navigate to Invitations page, verify list loads, create invitation (newuser@example.com), verify "Sent" badge and Resend/Cancel buttons
- [x] T024 E2E test: Resend invitation (toast "Invitation resent successfully"), cancel invitation (confirm dialog, status changed to "Cancelled", actions disabled showing "—")
- [x] T025 E2E test: Dark mode verified — list page and create page render correctly with proper dark styling
- [x] T026 Update MEMORY.md with Phase 019 completion and any new gotchas discovered

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — types and schemas first
- **Phase 2 (Foundational)**: Depends on Phase 1 — API clients need types
- **Phase 3-5 (User Stories)**: All depend on Phase 2 — UI pages need API clients and BFF proxies
- **Phase 6 (Polish)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories. MVP.
- **US2 (P2)**: Can start after Phase 2 — independent of US1 (create page doesn't depend on list page)
- **US3 (P3)**: Depends on US1 — resend/cancel actions are added to the list page from US1

### Parallel Opportunities

- T002 + T003 (schemas + tests) can run in parallel
- T004-T010 (API clients + BFF proxies) — T005/T006/T007/T008/T009/T010 all marked [P]
- T011 + T014 (US1 tests + US2 tests) can run in parallel
- T012/T013 (US1) + T015/T016 (US2) can run in parallel since they're different files
- T023-T025 (E2E tests) are sequential

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Types + Schemas (T001-T003)
2. Complete Phase 2: API Clients + BFF Proxies (T004-T010)
3. Complete Phase 3: List Page (T011-T013)
4. **STOP and VALIDATE**: Navigate to /invitations, verify list renders

### Incremental Delivery

1. Setup + Foundational → All API infrastructure ready
2. Add US1 (List) → Admins can view invitations → MVP!
3. Add US2 (Create) → Admins can create + view → Core flow complete
4. Add US3 (Resend/Cancel) → Full lifecycle management
5. Polish → Sidebar nav, E2E tests, memory update

---

## Notes

- Backend uses `{invitations, total, limit, offset}` response format (NOT `{items, total}`)
- DELETE /admin/invitations/{id} returns 200 with updated invitation (NOT 204)
- "Expired" is a computed frontend state: `status === 'sent' && expires_at < now`
- Actions (resend/cancel) only available for "sent" status AND not expired
- Must use `import { z } from 'zod/v3'` for Superforms compatibility

# Tasks: Governance Applications Management UI

**Input**: Design documents from `/specs/001-governance-applications/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Included per constitution (Principle II — TDD mandatory).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — project already exists. Skip to foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types, API client, schemas, BFF proxy — ALL user stories depend on these.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T001 [P] Add `CreateApplicationRequest` and `UpdateApplicationRequest` interfaces to `src/lib/api/types.ts`
- [ ] T002 [P] Add `createApplicationSchema` and `updateApplicationSchema` to `src/lib/schemas/governance.ts` using `zod/v3`
- [ ] T003 [P] Write unit tests for application Zod schemas in `src/lib/schemas/governance.test.ts` (or co-located test file)
- [ ] T004 Add `getApplication()`, `updateApplication()`, `deleteApplication()` to `src/lib/api/governance.ts` and update `createApplication()` body type to `CreateApplicationRequest`
- [ ] T005 Write unit tests for new API client functions in `src/lib/api/governance.test.ts`
- [ ] T006 Create BFF proxy `src/routes/api/governance/applications/[id]/+server.ts` with GET, PUT, DELETE handlers

**Checkpoint**: Foundation ready — all API types, client functions, schemas, and BFF proxy in place.

---

## Phase 3: User Story 5 — Sidebar Navigation (Priority: P1)

**Goal**: Make the applications section reachable from the sidebar under Governance.

**Independent Test**: Sidebar shows "Applications" link under Governance section that navigates to `/governance/applications`.

### Implementation for User Story 5

- [ ] T007 [US5] Add `Grid3X3` import and "Applications" nav entry to Governance section in `src/routes/(app)/+layout.svelte` — insert as first item before "Overview"

**Checkpoint**: Sidebar link is visible and clickable (page will 404 until list page is created).

---

## Phase 4: User Story 1 — Browse Applications (Priority: P1) MVP

**Goal**: Administrators can view a paginated list of applications from the sidebar.

**Independent Test**: Navigate to `/governance/applications`, see a table of applications (or empty state), with pagination.

### Tests for User Story 1

- [ ] T008 [P] [US1] Write unit tests for list page server load in `src/routes/(app)/governance/applications/applications-list.test.ts`

### Implementation for User Story 1

- [ ] T009 [US1] Create list page server `src/routes/(app)/governance/applications/+page.server.ts` — admin check via `hasAdminRole()`, load applications with `listApplications()`, return `{ applications, total, limit, offset, form }`
- [ ] T010 [US1] Create list page UI `src/routes/(app)/governance/applications/+page.svelte` — PageHeader with "Create application" button, TanStack Table with columns (Name, Type badge, Status badge, Description truncated, Created), row click navigates to `/governance/applications/[id]`, empty state when no applications

**Checkpoint**: Can browse applications list, see empty state, pagination works.

---

## Phase 5: User Story 2 — Create Application (Priority: P1)

**Goal**: Administrators can create a new application via a form and see it in the list.

**Independent Test**: Fill creation form, submit, get redirected to list, new application appears.

### Tests for User Story 2

- [ ] T011 [P] [US2] Write unit tests for create page server load and action in `src/routes/(app)/governance/applications/create/applications-create.test.ts`

### Implementation for User Story 2

- [ ] T012 [US2] Create create page server `src/routes/(app)/governance/applications/create/+page.server.ts` — admin check, `superValidate(zod(createApplicationSchema))`, default action: validate → `createApplication()` → redirect to `/governance/applications`
- [ ] T013 [US2] Create create page UI `src/routes/(app)/governance/applications/create/+page.svelte` — Superform with fields: name (Input), app_type (select: internal/external), description (textarea), external_id (Input), is_delegable (checkbox), error display, cancel link

**Checkpoint**: Can create applications. Entitlements create page should now find applications in the dropdown.

---

## Phase 6: User Story 3 — View and Edit Application (Priority: P2)

**Goal**: Administrators can view full details and update application properties.

**Independent Test**: Click application in list, see detail page, edit name/status, save, verify change.

### Tests for User Story 3

- [ ] T014 [P] [US3] Write unit tests for detail page server load and update action in `src/routes/(app)/governance/applications/[id]/applications-detail.test.ts`

### Implementation for User Story 3

- [ ] T015 [US3] Create detail page server `src/routes/(app)/governance/applications/[id]/+page.server.ts` — admin check, `getApplication(params.id)`, pre-populate `updateApplicationSchema`, `update` action: validate → `updateApplication()` → success message, `delete` action: `deleteApplication()` → redirect or 412 error
- [ ] T016 [US3] Create detail page UI `src/routes/(app)/governance/applications/[id]/+page.svelte` — Edit form: name, app_type (read-only display), status (select: active/inactive), description, external_id, is_delegable. Read-only section: ID, created_at, updated_at. Delete button with 412 error handling.

**Checkpoint**: Can view and edit applications. Full CRUD minus delete edge case testing.

---

## Phase 7: User Story 4 — Delete Application (Priority: P3)

**Goal**: Administrators can delete applications (blocked if entitlements exist).

**Independent Test**: Delete an application without entitlements → redirected to list. Try deleting one with entitlements → see 412 error.

### Implementation for User Story 4

Note: Delete action is already implemented in T015 (detail page server). This phase focuses on testing the delete flow.

- [ ] T017 [US4] Write unit test for delete action (success + 412 error handling) in `src/routes/(app)/governance/applications/[id]/applications-detail.test.ts`

**Checkpoint**: Delete flow works correctly with proper 412 error handling.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verification, cleanup, and honest review.

- [ ] T018 Run `npm run check` — fix any TypeScript errors
- [ ] T019 Run `npm run test:unit` — fix any failing tests
- [ ] T020 Honest review: verify all constitution principles are met, no dead code, no unused imports, components render correctly
- [ ] T021 Run quickstart.md validation checklist manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **US5 Sidebar (Phase 3)**: No dependencies on Phase 2 (just editing layout)
- **US1 Browse (Phase 4)**: Depends on Phase 2 (needs API client + types)
- **US2 Create (Phase 5)**: Depends on Phase 2 (needs schemas + API client)
- **US3 Edit (Phase 6)**: Depends on Phase 2 (needs schemas + API client + BFF proxy)
- **US4 Delete (Phase 7)**: Depends on Phase 6 (delete action is in detail page)
- **Polish (Phase 8)**: Depends on all phases complete

### User Story Dependencies

- **US5 (Sidebar)**: Independent — can start immediately, in parallel with Phase 2
- **US1 (Browse)**: Depends on foundational only — independent of other stories
- **US2 (Create)**: Depends on foundational only — independent of other stories
- **US3 (Edit)**: Depends on foundational only — independent of other stories
- **US4 (Delete)**: Depends on US3 (delete is part of detail page)

### Within Each User Story

- Tests written FIRST and verified to FAIL
- Server-side code before UI code
- Implementation verified before moving on

### Parallel Opportunities

Within Phase 2:
- T001, T002, T003 can all run in parallel (different files)
- T004 depends on T001 (uses new types)
- T005 depends on T004
- T006 depends on T004

Phase 3 (US5) can run in parallel with Phase 2.

After Phase 2 completes, US1/US2/US3 can all start in parallel.

---

## Parallel Example: Foundational Phase

```bash
# These three tasks can run simultaneously:
Task T001: "Add request types to src/lib/api/types.ts"
Task T002: "Add Zod schemas to src/lib/schemas/governance.ts"
Task T003: "Write schema tests"

# Then sequentially:
Task T004: "Add API client functions (depends on T001)"
Task T005: "Write API client tests (depends on T004)"
Task T006: "Create BFF proxy (depends on T004)"
```

---

## Implementation Strategy

### MVP First (US5 + US1 + US2)

1. Complete Phase 2: Foundational types, schemas, API client, BFF proxy
2. Complete Phase 3: Sidebar navigation (US5)
3. Complete Phase 4: Browse applications list (US1)
4. Complete Phase 5: Create application (US2)
5. **STOP and VALIDATE**: Can navigate, see list, create applications — entitlement creation unblocked

### Incremental Delivery

1. Foundational → Types + Schemas + API + BFF ready
2. US5 (Sidebar) → Navigation works
3. US1 (Browse) → List page functional
4. US2 (Create) → Create flow works, entitlements unblocked
5. US3 (Edit) → Detail/edit page works
6. US4 (Delete) → Delete with 412 handling
7. Polish → Clean, reviewed, all tests green

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- Constitution requires TDD: write tests first, verify they fail, then implement
- Total tasks: 21
- Tasks per story: US5=1, US1=3, US2=3, US3=3, US4=1, Foundational=6, Polish=4
- Parallel opportunities: T001/T002/T003, T008/T011/T014, US1/US2/US3 after Phase 2

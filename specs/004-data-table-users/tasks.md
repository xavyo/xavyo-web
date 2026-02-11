# Tasks: Data Table + User Management

**Input**: Design documents from `/specs/004-data-table-users/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD is required per Constitution Principle II. Tests are written FIRST.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new TypeScript types, API client module, and Zod schemas shared across user stories.

- [x] T001 Add User types to src/lib/api/types.ts: UserResponse (id, email, is_active, email_verified, roles, created_at, updated_at, custom_attributes), UserListResponse (users, pagination), PaginationMeta (total_count, offset, limit, has_more), CreateUserRequest (email, password, roles, username?), UpdateUserRequest (email?, roles?, is_active?, username?)
- [x] T002 Create API client module src/lib/api/users.ts: listUsers(params, token, tenantId, fetch), createUser(data, token, tenantId, fetch), getUser(id, token, tenantId, fetch), updateUser(id, data, token, tenantId, fetch), deleteUser(id, token, tenantId, fetch) — all using apiClient from client.ts
- [x] T003 Create Zod schemas in src/lib/schemas/user.ts: createUserSchema (email: email required, password: min 8 required, roles: string array min 1, username: optional max 100), updateUserSchema (email: email optional, roles: string array min 1 when provided, username: optional max 100)

**Checkpoint**: Types, API client, and schemas ready for all user stories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TDD — write failing tests for schemas, then create the data table component that all list pages depend on.

### Tests (TDD — write FIRST, verify they FAIL)

- [x] T004 [P] Write failing unit tests for user schemas in src/lib/schemas/user.test.ts: createUserSchema — valid input, missing email, invalid email, short password, empty roles, optional username, username too long; updateUserSchema — valid partial update, empty email rejected, valid roles update, empty roles rejected
- [x] T005 [P] Write failing unit tests for data table component in src/lib/components/data-table/data-table.test.ts: renders columns and rows, shows empty state when no data, shows loading skeleton when isLoading=true, renders pagination controls, search input fires callback

### Implementation

- [x] T006 Verify T004 user schema tests pass (green) — schemas already created in T003
- [x] T007 Implement data table component in src/lib/components/data-table/data-table.svelte: accept columns (TanStack ColumnDef[]), data array, pageCount, pagination state ({pageIndex, pageSize}), onPaginationChange callback, searchValue/onSearchChange (optional), isLoading boolean, emptyMessage string; use createSvelteTable with manualPagination; render HTML table with thead/tbody, FlexRender for cells
- [x] T008 Implement pagination sub-component in src/lib/components/data-table/data-table-pagination.svelte: Previous/Next buttons (disabled at boundaries), page info display ("Page X of Y"), total count display, accept table instance as prop
- [x] T009 Implement search toolbar sub-component in src/lib/components/data-table/data-table-toolbar.svelte: Input field with configurable placeholder, 300ms debounce via setTimeout/clearTimeout, calls onSearchChange callback with debounced value
- [x] T010 Verify T005 data table tests pass (green)

**Checkpoint**: Schemas validated, data table component functional with pagination, search, empty/loading states

---

## Phase 3: User Story 1 — Reusable Data Table Component (Priority: P1)

**Goal**: Data table component is complete and ready for use by any list page

**Independent Test**: Render data table with mock data, verify columns, pagination, search, empty state, loading state

This story's implementation is fully covered by Phase 2 (T007–T010). The data table component IS the deliverable.

**Checkpoint**: Data table component ready for integration

---

## Phase 4: User Story 2 — User List with Data Table (Priority: P1)

**Goal**: Admin sees paginated, searchable user list at /users

**Independent Test**: Navigate to /users, see data table with user data, search by email, paginate

### Implementation

- [x] T011 [US2] Create proxy endpoint src/routes/api/users/+server.ts: GET handler reads access_token and tenant_id cookies, validates session (return 401 if missing), forwards query params (offset, limit, email) to listUsers API, returns JSON response
- [x] T012 [US2] Create src/routes/(app)/users/+page.server.ts: load function returns empty object (data fetched client-side via proxy), no server-side user list loading needed
- [x] T013 [US2] Create src/routes/(app)/users/+page.svelte: PageHeader "Users" with "Create user" button link, data table integration with client-side fetch to /api/users, $state for pagination ({pageIndex: 0, pageSize: 20}), $state for search term, $effect to fetch data on pagination/search changes, column definitions (email as link to /users/[id], status Badge, roles joined, verified checkmark, created_at formatted, actions dropdown), loading and empty states

**Checkpoint**: User list page works with pagination and search

---

## Phase 5: User Story 3 — Create User (Priority: P1)

**Goal**: Admin creates a new user via form at /users/create

**Independent Test**: Navigate to /users/create, fill form, submit, verify redirect and toast

### Implementation

- [x] T014 [US3] Create src/routes/(app)/users/create/+page.server.ts: load returns superValidate(zod(createUserSchema)) form; default action validates form, calls createUser API, on success redirects to /users, on error returns message with ApiError status
- [x] T015 [US3] Create src/routes/(app)/users/create/+page.svelte: PageHeader "Create user", Card with form using Superforms enhance, fields for email (Input), password (Input type=password), username (Input, optional), roles (checkboxes for "admin" and "user"), inline validation errors, submit Button, cancel link to /users, toast on success via onResult callback

**Checkpoint**: User creation form works with validation, creates user and redirects

---

## Phase 6: User Story 4 — User Detail and Edit (Priority: P1)

**Goal**: Admin views and edits user details at /users/[id]

**Independent Test**: Click user from list, see detail, edit email, save, verify update

### Implementation

- [x] T016 [US4] Create src/routes/(app)/users/[id]/+page.server.ts: load function calls getUser(params.id) and returns user data + superValidate form pre-filled with user values; named actions: update (validate updateUserSchema, call updateUser API), delete (call deleteUser, redirect to /users), enable (call updateUser with is_active:true), disable (call updateUser with is_active:false)
- [x] T017 [US4] Create src/routes/(app)/users/[id]/+page.svelte: two modes via $state isEditing boolean; VIEW mode: PageHeader with user email, Card showing all fields (email, username, roles as badges, status Badge, email verified, created_at, updated_at), "Edit" button, "Back to users" link; EDIT mode: form with Superforms (email, username, roles checkboxes), Save/Cancel buttons; action buttons section: Enable/Disable button (with confirmation for disable, hidden for self), Delete button (opens dialog); toast notifications on all actions

**Checkpoint**: Full user detail page with view/edit modes, enable/disable, and delete

---

## Phase 7: User Story 5 — Enable/Disable User (Priority: P2)

**Goal**: Admin toggles user active status with appropriate confirmation

**Independent Test**: Disable active user with confirmation, re-enable without confirmation

This story's implementation is integrated into T016/T017 (user detail page actions). No additional files needed.

### Implementation

- [x] T018 [US5] Add self-deactivation prevention in src/routes/(app)/users/[id]/+page.svelte: compare user.id with data.currentUserId (from parent layout), if same user hide disable button or show error toast on attempt
- [x] T019 [US5] Update src/routes/(app)/users/[id]/+page.server.ts: load function also returns currentUserId from locals.user.sub; disable action checks if params.id === locals.user.sub and returns error if so

**Checkpoint**: Enable/disable works with confirmation and self-deactivation prevention

---

## Phase 8: User Story 6 — Delete User (Priority: P2)

**Goal**: Admin deletes user via confirmation dialog

**Independent Test**: Click delete, see dialog with email, confirm, verify redirect and toast

### Implementation

- [x] T020 [US6] Add delete confirmation dialog to src/routes/(app)/users/[id]/+page.svelte: use Bits UI Dialog component, show user email in dialog body, "Cancel" and "Confirm delete" buttons, form action triggers delete action, redirect handled by server

**Checkpoint**: Delete works with confirmation dialog, redirects to /users

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T021 Run full test suite: npx vitest run — all tests pass
- [x] T022 Run type check: npm run check — zero errors
- [x] T023 Run quickstart.md validation checklist — all 12 scenarios validated
- [x] T024 Honest review per Constitution Principle III

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 Data Table (Phase 3)**: Delivered by Phase 2 completion
- **US2 User List (Phase 4)**: Depends on Phase 2 (needs data table + API client)
- **US3 Create User (Phase 5)**: Depends on Phase 1 (needs schemas + API client), can run parallel with Phase 4
- **US4 User Detail (Phase 6)**: Depends on Phase 4 (user list links to detail)
- **US5 Enable/Disable (Phase 7)**: Depends on Phase 6 (extends detail page)
- **US6 Delete (Phase 8)**: Depends on Phase 6 (extends detail page), can run parallel with Phase 7
- **Polish (Phase 9)**: Depends on all previous phases

### Within Each Phase

- Tests MUST be written first and FAIL before implementation
- Types before API client
- API client before page server
- Page server before page svelte
- Schema before form page

### Parallel Opportunities

```bash
# Schema tests + data table tests in parallel:
T004, T005

# Data table sub-components in parallel:
T007, T008, T009

# User list + Create user in parallel (different routes):
Phase 4 (T011-T013), Phase 5 (T014-T015)

# Enable/disable + Delete in parallel (both extend detail page but different concerns):
Phase 7 (T018-T019), Phase 8 (T020)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup (types, API client, schemas)
2. Complete Phase 2: Foundational (tests, data table component)
3. Complete Phase 4: User List (US2)
4. Complete Phase 5: Create User (US3)
5. **STOP and VALIDATE**: Data table shows users, new users can be created

### Full Delivery

1. Setup → Foundational → US2 (List) → US3 (Create) → US4 (Detail) → US5 (Enable/Disable) → US6 (Delete) → Polish
2. Each phase validated before proceeding
3. Honest review at the end (T024)

---

## Notes

- Total tasks: 24
- Setup tasks: 3 (T001–T003)
- Foundational tasks: 7 (T004–T010)
- US2 (User List) tasks: 3 (T011–T013)
- US3 (Create User) tasks: 2 (T014–T015)
- US4 (User Detail) tasks: 2 (T016–T017)
- US5 (Enable/Disable) tasks: 2 (T018–T019)
- US6 (Delete) tasks: 1 (T020)
- Polish tasks: 4 (T021–T024)
- Parallel opportunities: T004+T005 (tests), T007+T008+T009 (data table parts), Phase 4+Phase 5 (different routes), Phase 7+Phase 8 (different concerns)

# Tasks: Tenant Administration & Self-Service Dashboards

**Input**: Design documents from `/specs/023-tenant-admin-selfservice/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests included for schemas, API clients, and page components following existing project TDD pattern.

**Organization**: Tasks grouped by user story. US1 (Branding) and US2 (OAuth Clients) are P1 priority, US3 (Groups) and US4 (My Approvals) are P2, US5 (My Certifications) is P3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared types and Zod schemas used across all five feature areas

- [ ] T001 Add BrandingConfig, OAuthClient, UserGroup, GroupMember, ApprovalItem, CertificationItem types and list response types to src/lib/api/types.ts
- [ ] T002 [P] Create branding Zod schemas (updateBrandingSchema with URL and hex color validation) in src/lib/schemas/branding.ts
- [ ] T003 [P] Create OAuth client Zod schemas (createOAuthClientSchema, updateOAuthClientSchema with redirect URI, grant type, scope validation) in src/lib/schemas/oauth-clients.ts
- [ ] T004 [P] Create group Zod schemas (createGroupSchema, updateGroupSchema, addMembersSchema) in src/lib/schemas/groups.ts
- [ ] T005 [P] Create branding schema tests in src/lib/schemas/branding.test.ts
- [ ] T006 [P] Create OAuth client schema tests in src/lib/schemas/oauth-clients.test.ts
- [ ] T007 [P] Create group schema tests in src/lib/schemas/groups.test.ts

---

## Phase 2: Foundational (API Clients + BFF Proxies)

**Purpose**: Server-side and client-side API clients plus all BFF proxy endpoints. MUST complete before any page work.

**⚠️ CRITICAL**: No user story page work can begin until this phase is complete

### Server-side API Clients

- [ ] T008 [P] Create server-side branding API client (getBranding, updateBranding) in src/lib/api/branding.ts
- [ ] T009 [P] Create server-side OAuth clients API client (listOAuthClients, createOAuthClient, getOAuthClient, updateOAuthClient, deleteOAuthClient) in src/lib/api/oauth-clients.ts
- [ ] T010 [P] Create server-side groups API client (listGroups, createGroup, getGroup, updateGroup, deleteGroup, addMembers, removeMember) in src/lib/api/groups.ts
- [ ] T011 [P] Create server-side my-approvals API client (listMyApprovals, approveApproval, rejectApproval) in src/lib/api/my-approvals.ts
- [ ] T012 [P] Create server-side my-certifications API client (listMyCertifications, certifyItem, revokeItem) in src/lib/api/my-certifications.ts

### Server-side API Client Tests

- [ ] T013 [P] Create branding API client tests in src/lib/api/branding.test.ts
- [ ] T014 [P] Create OAuth clients API client tests in src/lib/api/oauth-clients.test.ts
- [ ] T015 [P] Create groups API client tests in src/lib/api/groups.test.ts
- [ ] T016 [P] Create my-approvals API client tests in src/lib/api/my-approvals.test.ts
- [ ] T017 [P] Create my-certifications API client tests in src/lib/api/my-certifications.test.ts

### Client-side API Modules

- [ ] T018 [P] Create client-side groups API (fetchGroups, addMembersClient, removeMemberClient) in src/lib/api/groups-client.ts
- [ ] T019 [P] Create client-side my-approvals API (fetchMyApprovals, approveApprovalClient, rejectApprovalClient) in src/lib/api/my-approvals-client.ts
- [ ] T020 [P] Create client-side my-certifications API (fetchMyCertifications, certifyItemClient, revokeItemClient) in src/lib/api/my-certifications-client.ts

### BFF Proxy Endpoints

- [ ] T021 [P] Create branding BFF proxy (GET, PUT) in src/routes/api/admin/branding/+server.ts
- [ ] T022 [P] Create OAuth clients list+create BFF proxy (GET, POST) in src/routes/api/admin/oauth-clients/+server.ts
- [ ] T023 [P] Create OAuth client detail BFF proxy (GET, PUT, DELETE) in src/routes/api/admin/oauth-clients/[id]/+server.ts
- [ ] T024 [P] Create groups list+create BFF proxy (GET, POST) in src/routes/api/admin/groups/+server.ts
- [ ] T025 [P] Create group detail BFF proxy (GET, PUT, DELETE) in src/routes/api/admin/groups/[id]/+server.ts
- [ ] T026 [P] Create group members BFF proxy (POST add members) in src/routes/api/admin/groups/[id]/members/+server.ts
- [ ] T027 [P] Create group member remove BFF proxy (DELETE) in src/routes/api/admin/groups/[id]/members/[userId]/+server.ts
- [ ] T028 [P] Create my-approvals list BFF proxy (GET) in src/routes/api/governance/my-approvals/+server.ts
- [ ] T029 [P] Create my-approvals approve BFF proxy (POST) in src/routes/api/governance/my-approvals/[id]/approve/+server.ts
- [ ] T030 [P] Create my-approvals reject BFF proxy (POST) in src/routes/api/governance/my-approvals/[id]/reject/+server.ts
- [ ] T031 [P] Create my-certifications list BFF proxy (GET) in src/routes/api/governance/my-certifications/+server.ts
- [ ] T032 [P] Create my-certifications certify BFF proxy (POST) in src/routes/api/governance/my-certifications/[itemId]/certify/+server.ts
- [ ] T033 [P] Create my-certifications revoke BFF proxy (POST) in src/routes/api/governance/my-certifications/[itemId]/revoke/+server.ts

**Checkpoint**: All API infrastructure ready — page implementation can begin

---

## Phase 3: User Story 1 — Tenant Branding Customization (Priority: P1) 🎯 MVP

**Goal**: Admin can view and edit tenant branding settings (logos, colors, login page, legal URLs)

**Independent Test**: Navigate to Settings → Branding tab, update primary color and logo URL, save, reload, verify persisted

### Implementation for User Story 1

- [ ] T034 [US1] Create branding settings page server load + update action in src/routes/(app)/settings/branding/+page.server.ts
- [ ] T035 [US1] Create branding settings form page (grouped fields: Logos, Colors, Login Page, Legal URLs) in src/routes/(app)/settings/branding/+page.svelte
- [ ] T036 [US1] Create branding page tests in src/routes/(app)/settings/branding/branding.test.ts

**Checkpoint**: Branding settings fully functional — admin can view/edit/save branding config

---

## Phase 4: User Story 2 — OAuth Client Management (Priority: P1)

**Goal**: Admin can list, create, view, edit, enable/disable, and delete OAuth/OIDC clients

**Independent Test**: Create new OAuth client, verify client_secret shown once, list clients, edit client, toggle active, delete client

### Implementation for User Story 2

- [ ] T037 [US2] Create OAuth clients list page server load in src/routes/(app)/settings/oauth-clients/+page.server.ts
- [ ] T038 [US2] Create OAuth clients list page with DataTable (name, client_id, type, grant types, active badge) in src/routes/(app)/settings/oauth-clients/+page.svelte
- [ ] T039 [US2] Create OAuth client create page server load + action (return client_secret in response) in src/routes/(app)/settings/oauth-clients/create/+page.server.ts
- [ ] T040 [US2] Create OAuth client create form page with secret display dialog in src/routes/(app)/settings/oauth-clients/create/+page.svelte
- [ ] T041 [US2] Create OAuth client detail page server load + actions (edit, toggle active, delete) in src/routes/(app)/settings/oauth-clients/[id]/+page.server.ts
- [ ] T042 [US2] Create OAuth client detail page (view/edit mode, enable/disable toggle, delete with confirm) in src/routes/(app)/settings/oauth-clients/[id]/+page.svelte
- [ ] T043 [P] [US2] Create OAuth clients list page tests in src/routes/(app)/settings/oauth-clients/oauth-clients.test.ts
- [ ] T044 [P] [US2] Create OAuth client create page tests in src/routes/(app)/settings/oauth-clients/create/oauth-client-create.test.ts
- [ ] T045 [P] [US2] Create OAuth client detail page tests in src/routes/(app)/settings/oauth-clients/[id]/oauth-client-detail.test.ts

**Checkpoint**: OAuth client CRUD fully functional — admin can manage all client lifecycle

---

## Phase 5: User Story 3 — User Group Management (Priority: P2)

**Goal**: Admin can list, create, view, edit, and delete groups and manage group membership

**Independent Test**: Create group, add member, view group detail with member list, remove member, delete group

### Implementation for User Story 3

- [ ] T046 [US3] Create groups list page server load in src/routes/(app)/groups/+page.server.ts
- [ ] T047 [US3] Create groups list page with DataTable (name, description, member count) in src/routes/(app)/groups/+page.svelte
- [ ] T048 [US3] Create group create page server load + action in src/routes/(app)/groups/create/+page.server.ts
- [ ] T049 [US3] Create group create form page in src/routes/(app)/groups/create/+page.svelte
- [ ] T050 [US3] Create group detail page server load + actions (edit, delete, add members, remove member) in src/routes/(app)/groups/[id]/+page.server.ts
- [ ] T051 [US3] Create group detail page with member list and add/remove member actions in src/routes/(app)/groups/[id]/+page.svelte
- [ ] T052 [P] [US3] Create groups list page tests in src/routes/(app)/groups/groups.test.ts
- [ ] T053 [P] [US3] Create group create page tests in src/routes/(app)/groups/create/group-create.test.ts
- [ ] T054 [P] [US3] Create group detail page tests in src/routes/(app)/groups/[id]/group-detail.test.ts

**Checkpoint**: Group management fully functional — admin can CRUD groups and manage membership

---

## Phase 6: User Story 4 — My Approvals Dashboard (Priority: P2)

**Goal**: Approver can view pending approval requests, approve or reject with comments, filter by status

**Independent Test**: Navigate to My Approvals, view pending items, approve one with comment, reject another, verify status changes

### Implementation for User Story 4

- [ ] T055 [US4] Create my-approvals page server load (list approvals with status filter) in src/routes/(app)/my-approvals/+page.server.ts
- [ ] T056 [US4] Create my-approvals page with approval list, approve/reject actions with comment dialog, status filter in src/routes/(app)/my-approvals/+page.svelte
- [ ] T057 [US4] Create my-approvals page tests in src/routes/(app)/my-approvals/my-approvals.test.ts

**Checkpoint**: My Approvals fully functional — approvers can process pending requests

---

## Phase 7: User Story 5 — My Certifications Dashboard (Priority: P3)

**Goal**: Reviewer can view assigned certification items, certify or revoke, filter by campaign and status

**Independent Test**: Navigate to My Certifications, view items, certify one, revoke another, filter by campaign

### Implementation for User Story 5

- [ ] T058 [US5] Create my-certifications page server load (list items with campaign/status filter) in src/routes/(app)/my-certifications/+page.server.ts
- [ ] T059 [US5] Create my-certifications page with item list, certify/revoke actions, campaign filter in src/routes/(app)/my-certifications/+page.svelte
- [ ] T060 [US5] Create my-certifications page tests in src/routes/(app)/my-certifications/my-certifications.test.ts

**Checkpoint**: My Certifications fully functional — reviewers can process certification items

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar nav, TypeScript check, full test suite, E2E validation

- [ ] T061 Add sidebar navigation entries for Groups, My Approvals, My Certifications in src/routes/(app)/+layout.svelte
- [ ] T062 Run svelte-kit sync to generate route types for new routes
- [ ] T063 Run TypeScript check (npm run check) and fix any type errors
- [ ] T064 Run full test suite (npm run test:unit) and fix any failures
- [ ] T065 Run quickstart.md E2E validation via Chrome MCP DevTools

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (types) — BLOCKS all user stories
- **US1 Branding (Phase 3)**: Depends on Phase 2 (T008, T021 specifically)
- **US2 OAuth (Phase 4)**: Depends on Phase 2 (T009, T022, T023 specifically)
- **US3 Groups (Phase 5)**: Depends on Phase 2 (T010, T018, T024-T027 specifically)
- **US4 Approvals (Phase 6)**: Depends on Phase 2 (T011, T019, T028-T030 specifically)
- **US5 Certifications (Phase 7)**: Depends on Phase 2 (T012, T020, T031-T033 specifically)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Branding)**: Independent — no cross-story dependencies
- **US2 (OAuth Clients)**: Independent — no cross-story dependencies
- **US3 (Groups)**: Independent — no cross-story dependencies
- **US4 (My Approvals)**: Independent — no cross-story dependencies
- **US5 (My Certifications)**: Independent — no cross-story dependencies

### Within Each User Story

- Server load + action before page component
- Page component before page tests
- Tests can run in parallel with other story tests

### Parallel Opportunities

Within Phase 1:
- T002, T003, T004 (schemas) can all run in parallel
- T005, T006, T007 (schema tests) can all run in parallel

Within Phase 2:
- T008-T012 (server API clients) can all run in parallel
- T013-T017 (API client tests) can all run in parallel
- T018-T020 (client-side APIs) can all run in parallel
- T021-T033 (BFF proxies) can all run in parallel

User Stories:
- US1-US5 can all proceed in parallel after Phase 2 completes

---

## Parallel Example: Phase 2 — API Clients

```bash
# Launch all 5 server API clients in parallel:
Task: "Create branding API client in src/lib/api/branding.ts"
Task: "Create OAuth clients API client in src/lib/api/oauth-clients.ts"
Task: "Create groups API client in src/lib/api/groups.ts"
Task: "Create my-approvals API client in src/lib/api/my-approvals.ts"
Task: "Create my-certifications API client in src/lib/api/my-certifications.ts"

# Launch all 13 BFF proxies in parallel:
Task: "Create branding BFF proxy in src/routes/api/admin/branding/+server.ts"
Task: "Create OAuth clients BFF proxies in src/routes/api/admin/oauth-clients/"
# ... etc
```

---

## Implementation Strategy

### MVP First (US1 Branding + US2 OAuth Only)

1. Complete Phase 1: Setup (types + schemas)
2. Complete Phase 2: Foundational (API clients + BFF proxies)
3. Complete Phase 3: US1 Branding
4. Complete Phase 4: US2 OAuth Clients
5. **STOP and VALIDATE**: Both admin settings features work

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 Branding → Admin can customize tenant appearance
3. US2 OAuth Clients → Admin can manage application registrations
4. US3 Groups → Admin can organize users into groups
5. US4 My Approvals → Approvers have their action dashboard
6. US5 My Certifications → Reviewers have their action dashboard
7. Polish → Sidebar nav, type check, full test suite

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after Phase 2
- All 5 user stories have zero cross-story dependencies
- Pagination formats differ per endpoint — see data-model.md
- OAuth client_secret display pattern follows NHI credential section UX
- Branding uses partial update (PUT with subset of fields)
- Groups use sub-object pagination `{groups, pagination: {limit, offset, has_more}}`
- My Certifications use page-based pagination `{items, total, page, page_size}`

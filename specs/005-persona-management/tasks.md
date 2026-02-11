# Tasks: Persona & Archetype Management

**Input**: Design documents from `/specs/005-persona-management/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD is required per Constitution Principle II. Tests are written FIRST.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new TypeScript types, API client module, and Zod schemas shared across user stories.

- [x] T001 Add Persona and Archetype types to src/lib/api/types.ts: PersonaStatus type, ArchetypeResponse (id, name, description, naming_pattern, attribute_mappings, default_entitlements, lifecycle_policy, is_active, personas_count, created_at, updated_at), LifecyclePolicyResponse, ArchetypeListResponse (items, total, limit, offset), CreateArchetypeRequest, LifecyclePolicyRequest, UpdateArchetypeRequest, PersonaResponse (id, archetype_id, archetype_name, physical_user_id, physical_user_name, persona_name, display_name, status, valid_from, valid_until, created_at, updated_at, deactivated_at), PersonaDetailResponse (extends PersonaResponse with attributes), PersonaAttributesResponse (inherited, overrides, persona_specific, last_propagation_at), PersonaListResponse, CreatePersonaRequest, UpdatePersonaRequest, DeactivatePersonaRequest, ArchivePersonaRequest
- [x] T002 Create API client module src/lib/api/personas.ts: listArchetypes(params, token, tenantId, fetch), createArchetype(data, token, tenantId, fetch), getArchetype(id, token, tenantId, fetch), updateArchetype(id, data, token, tenantId, fetch), deleteArchetype(id, token, tenantId, fetch), activateArchetype(id, token, tenantId, fetch), deactivateArchetype(id, token, tenantId, fetch), listPersonas(params, token, tenantId, fetch), createPersona(data, token, tenantId, fetch), getPersona(id, token, tenantId, fetch), updatePersona(id, data, token, tenantId, fetch), activatePersona(id, token, tenantId, fetch), deactivatePersona(id, reason, token, tenantId, fetch), archivePersona(id, reason, token, tenantId, fetch)
- [x] T003 Create Zod schemas in src/lib/schemas/persona.ts: createArchetypeSchema (name: required max 255, naming_pattern: required max 255, description: optional max 1000, default_validity_days: optional coerce int 1-3650, max_validity_days: optional coerce int 1-3650, notification_before_expiry_days: optional coerce int min 1), updateArchetypeSchema (all optional), createPersonaSchema (archetype_id: required, physical_user_id: required, valid_from: optional, valid_until: optional), updatePersonaSchema (display_name: optional, valid_until: optional), reasonSchema (reason: min 5 max 1000)

**Checkpoint**: Types, API client, and schemas ready for all user stories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TDD — write failing tests for schemas and API client, then create shared components.

### Tests (TDD — write FIRST, verify they FAIL)

- [x] T004 [P] Write failing unit tests for persona schemas in src/lib/schemas/persona.test.ts: createArchetypeSchema — valid input, missing name, missing naming_pattern, description too long, valid lifecycle policy, invalid validity days; updateArchetypeSchema — valid partial update, all optional; createPersonaSchema — valid input, missing archetype_id, missing physical_user_id, with optional dates; updatePersonaSchema — valid partial; reasonSchema — valid reason, too short (under 5 chars), too long (over 1000)
- [x] T005 [P] Write failing unit tests for personas API client in src/lib/api/personas.test.ts: listArchetypes with no params, with name_contains filter; createArchetype with body; getArchetype by id; updateArchetype by id; deleteArchetype by id; activateArchetype by id; deactivateArchetype by id; listPersonas with no params, with status filter, with archetype_id filter; createPersona with body; getPersona by id; updatePersona by id; activatePersona by id; deactivatePersona with reason; archivePersona with reason

### Implementation

- [x] T006 Verify T004 persona schema tests pass (green) — schemas already created in T003
- [x] T007 Verify T005 API client tests pass (green) — API client already created in T002
- [x] T008 [P] Create persona status badge component in src/routes/(app)/personas/persona-status-badge.svelte: accept status prop (PersonaStatus), render Badge with color mapping: draft=outline, active=default (green), expiring=amber, expired=destructive, suspended=orange, archived=secondary (gray)
- [x] T009 [P] Create archetype status badge component in src/routes/(app)/personas/archetype-status-badge.svelte: accept isActive boolean prop, render Active (green) or Inactive (gray) Badge

**Checkpoint**: Schemas validated, API client tested, status badges ready

---

## Phase 3: User Story 1 — Archetype List (Priority: P1)

**Goal**: Admin sees paginated, searchable archetype list at /personas/archetypes

**Independent Test**: Navigate to /personas/archetypes, see data table with archetype data, search by name, paginate

### Implementation

- [x] T010 [US1] Create proxy endpoint src/routes/api/archetypes/+server.ts: GET handler reads access_token and tenant_id cookies, validates session (return 401 if missing), forwards query params (offset, limit, name_contains, is_active) to listArchetypes API, returns JSON response
- [x] T011 [US1] Create src/routes/(app)/personas/archetypes/+page.server.ts: load function returns empty object (data fetched client-side via proxy)
- [x] T012 [US1] Create src/routes/(app)/personas/archetypes/+page.svelte: PageHeader "Archetypes" with "Create archetype" button link, data table integration with client-side fetch to /api/archetypes, $state for pagination ({pageIndex: 0, pageSize: 20}), $state for search term, $effect to fetch data on pagination/search changes, column definitions (name as link to /personas/archetypes/[id], description truncated, status Badge via archetype-status-badge, personas_count, created_at formatted)
- [x] T013 [P] [US1] Create archetype name link component in src/routes/(app)/personas/archetype-name-link.svelte: accept name and href props, render as styled link

**Checkpoint**: Archetype list page works with pagination and search

---

## Phase 4: User Story 2 — Create Archetype (Priority: P1)

**Goal**: Admin creates a new archetype via form at /personas/archetypes/create

**Independent Test**: Navigate to /personas/archetypes/create, fill form, submit, verify redirect and toast

### Implementation

- [x] T014 [US2] Create src/routes/(app)/personas/archetypes/create/+page.server.ts: load returns superValidate(zod(createArchetypeSchema)) form; default action validates form, builds CreateArchetypeRequest with optional lifecycle_policy from form fields, calls createArchetype API, on success redirects to /personas/archetypes, on error returns message with ApiError status
- [x] T015 [US2] Create src/routes/(app)/personas/archetypes/create/+page.svelte: PageHeader "Create archetype", Card with form using Superforms enhance, fields for name (Input), naming_pattern (Input), description (Input/textarea), lifecycle policy section: default_validity_days (Input number), max_validity_days (Input number), notification_before_expiry_days (Input number) — all optional with placeholder defaults, inline validation errors, submit Button, cancel link to /personas/archetypes, toast on success

**Checkpoint**: Archetype creation form works with validation

---

## Phase 5: User Story 3 — Archetype Detail & Edit (Priority: P1)

**Goal**: Admin views, edits, activates/deactivates, and deletes archetype at /personas/archetypes/[id]

**Independent Test**: Click archetype from list, see details, edit fields, toggle active, delete with confirmation

### Implementation

- [x] T016 [US3] Create src/routes/(app)/personas/archetypes/[id]/+page.server.ts: load function calls getArchetype(params.id) and returns archetype data + superValidate form pre-filled; named actions: update (validate updateArchetypeSchema, call updateArchetype API), delete (call deleteArchetype, redirect to /personas/archetypes), activate (call activateArchetype), deactivate (call deactivateArchetype)
- [x] T017 [US3] Create src/routes/(app)/personas/archetypes/[id]/+page.svelte: two modes via $state isEditing; VIEW mode: PageHeader with archetype name, Card showing all fields (name, description, naming_pattern, lifecycle policy details, status badge, personas_count, created_at, updated_at), Edit button, Back link; EDIT mode: form with Superforms (name, description, naming_pattern, lifecycle policy fields), Save/Cancel buttons; action buttons: Activate/Deactivate toggle, Delete button with confirmation Dialog; toast notifications on all actions

**Checkpoint**: Full archetype detail page with view/edit modes, activate/deactivate, and delete

---

## Phase 6: User Story 4 — Persona List (Priority: P1)

**Goal**: Admin sees paginated persona list with status badges and filter dropdowns at /personas

**Independent Test**: Navigate to /personas, see data table, filter by status and archetype

### Implementation

- [x] T018 [US4] Create proxy endpoint src/routes/api/personas/+server.ts: GET handler reads cookies, validates session, forwards query params (offset, limit, status, archetype_id) to listPersonas API, returns JSON response
- [x] T019 [US4] Create filter dropdowns component in src/lib/components/data-table/data-table-filters.svelte: accept filters array prop (each with label, options, value, onChange), render Select dropdowns inline, support clearing filters
- [x] T020 [US4] Create src/routes/(app)/personas/+page.server.ts: load function returns empty object (data fetched client-side)
- [x] T021 [US4] Create src/routes/(app)/personas/+page.svelte: PageHeader "Personas" with "Create persona" button link, filter section with status dropdown (all 6 statuses) and archetype dropdown (fetched from /api/archetypes), data table with client-side fetch to /api/personas, $state for pagination, filters, $effect to fetch on changes, column definitions (persona_name as link to /personas/[id], display_name, archetype_name, physical_user_name, status via persona-status-badge, valid_from formatted, valid_until formatted)
- [x] T022 [P] [US4] Create persona name link component in src/routes/(app)/personas/persona-name-link.svelte: accept name and href props, render as styled link

**Checkpoint**: Persona list page works with pagination, status and archetype filters

---

## Phase 7: User Story 5 — Create Persona (Priority: P1)

**Goal**: Admin creates a new persona by selecting archetype and physical user

**Independent Test**: Navigate to /personas/create, select archetype and user, submit, see persona in list

### Implementation

- [x] T023 [US5] Create src/routes/(app)/personas/create/+page.server.ts: load returns superValidate(zod(createPersonaSchema)) form + fetch active archetypes (via listArchetypes with is_active=true) + fetch users (via listUsers with limit=100); default action validates form, builds CreatePersonaRequest, calls createPersona API, on success redirects to /personas, on error returns message
- [x] T024 [US5] Create src/routes/(app)/personas/create/+page.svelte: PageHeader "Create persona", Card with form using Superforms enhance, fields: archetype selection (Select with active archetypes from load data), physical user selection (Select with users from load data), valid_from (Input date, optional), valid_until (Input date, optional), inline validation errors, submit Button, cancel link to /personas, toast on success

**Checkpoint**: Persona creation form works with archetype and user selection

---

## Phase 8: User Story 6 — Persona Detail & Edit (Priority: P2)

**Goal**: Admin views persona details with grouped attributes, edits display name and validity

**Independent Test**: Click persona from list, see all details including attributes, edit fields

### Implementation

- [x] T025 [US6] Create src/routes/(app)/personas/[id]/+page.server.ts: load function calls getPersona(params.id) and returns persona detail data + superValidate(updatePersonaSchema) form pre-filled; named action: update (validate updatePersonaSchema, call updatePersona API)
- [x] T026 [US6] Create src/routes/(app)/personas/[id]/+page.svelte: two modes via $state isEditing; VIEW mode: PageHeader with persona name, info Card showing all fields (persona_name, display_name, archetype_name as link, physical_user_name, status badge, valid_from, valid_until, deactivated_at if present, created_at, updated_at), attributes Card with three sections: Inherited attributes, Overrides, Persona-specific (each showing key-value pairs from the JSON objects), Edit button, Back to personas link; EDIT mode: form with display_name Input, valid_until date Input, Save/Cancel buttons; toast on save

**Checkpoint**: Persona detail page with view/edit and attributes display

---

## Phase 9: User Story 7 — Persona Lifecycle Actions (Priority: P2)

**Goal**: Admin activates, deactivates (with reason), and archives (with reason) personas

**Independent Test**: Activate draft persona, deactivate active persona with reason, archive persona with reason

### Implementation

- [x] T027 [US7] Add lifecycle actions to src/routes/(app)/personas/[id]/+page.server.ts: named actions: activate (call activatePersona), deactivate (validate reasonSchema from request, call deactivatePersona with reason), archive (validate reasonSchema from request, call archivePersona with reason)
- [x] T028 [US7] Add lifecycle action UI to src/routes/(app)/personas/[id]/+page.svelte: Actions card with conditional buttons based on status — Activate (shown for draft/suspended), Deactivate (shown for active/expiring), Archive (shown for all non-archived); Deactivate Dialog with textarea for reason (min 5 chars client-side validation), confirm button submits form action; Archive Dialog with textarea for reason + warning "This action cannot be undone", confirm button; hide all action buttons when status is archived; toast notifications on all actions

**Checkpoint**: Full lifecycle management with reason dialogs

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T029 Update sidebar navigation in src/routes/(app)/+layout.svelte if needed: verify /personas link works for both persona list and archetype sub-routes
- [x] T030 Run full test suite: npx vitest run — all tests pass
- [x] T031 Run type check: npm run check — zero errors
- [x] T032 Run quickstart.md validation checklist — all 16 scenarios validated
- [x] T033 Honest review per Constitution Principle III

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 Archetype List (Phase 3)**: Depends on Phase 2 (needs API client + badges)
- **US2 Create Archetype (Phase 4)**: Depends on Phase 1 (needs schemas + API client), can run parallel with Phase 3
- **US3 Archetype Detail (Phase 5)**: Depends on Phase 3 (archetype list links to detail)
- **US4 Persona List (Phase 6)**: Depends on Phase 2 (needs API client + badges)
- **US5 Create Persona (Phase 7)**: Depends on Phase 1 (needs schemas + API client), needs archetypes + users from API
- **US6 Persona Detail (Phase 8)**: Depends on Phase 6 (persona list links to detail)
- **US7 Persona Lifecycle (Phase 9)**: Depends on Phase 8 (extends persona detail page)
- **Polish (Phase 10)**: Depends on all previous phases

### Within Each Phase

- Tests MUST be written first and FAIL before implementation
- Types before API client
- API client before page server
- Page server before page svelte
- Schema before form page

### Parallel Opportunities

```bash
# Schema tests + API client tests in parallel:
T004, T005

# Status badge components in parallel:
T008, T009

# Archetype list + Create archetype in parallel (different routes):
Phase 3 (T010-T013), Phase 4 (T014-T015)

# Persona list + Create persona in parallel (different routes):
Phase 6 (T018-T022), Phase 7 (T023-T024)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 + US4 + US5)

1. Complete Phase 1: Setup (types, API client, schemas)
2. Complete Phase 2: Foundational (tests, badges)
3. Complete Phase 3: Archetype List (US1)
4. Complete Phase 4: Create Archetype (US2)
5. Complete Phase 5: Archetype Detail (US3)
6. Complete Phase 6: Persona List (US4)
7. Complete Phase 7: Create Persona (US5)
8. **STOP and VALIDATE**: Archetypes fully managed, personas listed and created

### Full Delivery

1. Setup → Foundational → US1 (Archetype List) → US2 (Create Archetype) → US3 (Archetype Detail) → US4 (Persona List) → US5 (Create Persona) → US6 (Persona Detail) → US7 (Persona Lifecycle) → Polish
2. Each phase validated before proceeding
3. Honest review at the end (T033)

---

## Notes

- Total tasks: 33
- Setup tasks: 3 (T001–T003)
- Foundational tasks: 6 (T004–T009)
- US1 (Archetype List) tasks: 4 (T010–T013)
- US2 (Create Archetype) tasks: 2 (T014–T015)
- US3 (Archetype Detail) tasks: 2 (T016–T017)
- US4 (Persona List) tasks: 5 (T018–T022)
- US5 (Create Persona) tasks: 2 (T023–T024)
- US6 (Persona Detail) tasks: 2 (T025–T026)
- US7 (Persona Lifecycle) tasks: 2 (T027–T028)
- Polish tasks: 5 (T029–T033)
- Parallel opportunities: T004+T005 (tests), T008+T009 (badges), Phase 3+Phase 4 (archetypes), Phase 6+Phase 7 (personas)

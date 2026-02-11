# Tasks: NHI (Non-Human Identity) Management

**Input**: Design documents from `/specs/006-nhi-management/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD is required per Constitution Principle II. Tests are written FIRST.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add new TypeScript types, API client module, and Zod schemas shared across user stories.

- [x] T001 Add NHI types to src/lib/api/types.ts: NhiType type ('tool' | 'agent' | 'service_account'), NhiLifecycleState type ('active' | 'inactive' | 'suspended' | 'deprecated' | 'archived'), NhiIdentityResponse (id, tenant_id, nhi_type, name, description, owner_id, lifecycle_state, suspension_reason, expires_at, created_at, updated_at), NhiToolExtension (category, input_schema, output_schema, requires_approval, max_calls_per_hour, provider, provider_verified, checksum), NhiAgentExtension (agent_type, model_provider, model_name, model_version, max_token_lifetime_secs, requires_human_approval), NhiServiceAccountExtension (purpose, environment), NhiDetailResponse (extends NhiIdentityResponse with optional tool, agent, service_account), NhiListResponse (data, total, limit, offset), CreateToolRequest, CreateAgentRequest, CreateServiceAccountRequest, UpdateToolRequest, UpdateAgentRequest, UpdateServiceAccountRequest, NhiCredentialResponse (id, nhi_id, credential_type, valid_from, valid_until, is_active, created_at), CredentialIssuedResponse (credential, secret), IssueCredentialRequest (credential_type, valid_days?), RotateCredentialRequest (grace_period_hours?), SuspendNhiRequest (reason?)
- [x] T002 Create API client module src/lib/api/nhi.ts: listNhi(params, token, tenantId, fetch), createTool(data, token, tenantId, fetch), getTool(id, token, tenantId, fetch), updateTool(id, data, token, tenantId, fetch), deleteTool(id, token, tenantId, fetch), createAgent(data, token, tenantId, fetch), getAgent(id, token, tenantId, fetch), updateAgent(id, data, token, tenantId, fetch), deleteAgent(id, token, tenantId, fetch), createServiceAccount(data, token, tenantId, fetch), getServiceAccount(id, token, tenantId, fetch), updateServiceAccount(id, data, token, tenantId, fetch), deleteServiceAccount(id, token, tenantId, fetch), activateNhi(id, token, tenantId, fetch), suspendNhi(id, reason, token, tenantId, fetch), reactivateNhi(id, token, tenantId, fetch), deprecateNhi(id, token, tenantId, fetch), archiveNhi(id, token, tenantId, fetch), listCredentials(nhiId, token, tenantId, fetch), issueCredential(nhiId, data, token, tenantId, fetch), rotateCredential(nhiId, credId, data, token, tenantId, fetch), revokeCredential(nhiId, credId, token, tenantId, fetch)
- [x] T003 Create Zod schemas in src/lib/schemas/nhi.ts: createToolSchema (name: required max 255, description: optional max 1000, category: optional max 100, input_schema: required string for JSON, output_schema: optional string, requires_approval: boolean default false, max_calls_per_hour: optional coerce int min 1, provider: optional max 255), createAgentSchema (name: required max 255, description: optional max 1000, agent_type: required max 100, model_provider: optional max 255, model_name: optional max 255, model_version: optional max 100, max_token_lifetime_secs: optional coerce int min 1, requires_human_approval: boolean default false), createServiceAccountSchema (name: required max 255, description: optional max 1000, purpose: required max 1000, environment: optional max 100), updateToolSchema (all optional), updateAgentSchema (all optional), updateServiceAccountSchema (all optional), issueCredentialSchema (credential_type: enum api_key/secret/certificate, valid_days: optional coerce int 1-3650), suspendNhiSchema (reason: optional max 1000)

**Checkpoint**: Types, API client, and schemas ready for all user stories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TDD — write failing tests for schemas and API client, then create shared components.

### Tests (TDD — write FIRST, verify they FAIL)

- [x] T004 [P] Write failing unit tests for NHI schemas in src/lib/schemas/nhi.test.ts: createToolSchema — valid input, missing name, missing input_schema, description too long, valid optional fields; createAgentSchema — valid input, missing name, missing agent_type; createServiceAccountSchema — valid input, missing name, missing purpose; updateToolSchema — valid partial update, all optional; updateAgentSchema — valid partial; updateServiceAccountSchema — valid partial; issueCredentialSchema — valid api_key, valid secret, valid certificate, missing credential_type, invalid credential_type, valid_days too large; suspendNhiSchema — valid with reason, valid empty, reason too long
- [x] T005 [P] Write failing unit tests for NHI API client in src/lib/api/nhi.test.ts: listNhi with no params, with nhi_type filter, with lifecycle_state filter; createTool with body; getTool by id; updateTool by id; deleteTool by id; createAgent with body; getAgent by id; updateAgent by id; deleteAgent by id; createServiceAccount with body; getServiceAccount by id; updateServiceAccount by id; deleteServiceAccount by id; activateNhi by id; suspendNhi with reason; reactivateNhi by id; deprecateNhi by id; archiveNhi by id; listCredentials by nhiId; issueCredential by nhiId with body; rotateCredential by nhiId and credId; revokeCredential by nhiId and credId

### Implementation

- [x] T006 Verify T004 NHI schema tests pass (green) — schemas already created in T003
- [x] T007 Verify T005 API client tests pass (green) — API client already created in T002
- [x] T008 [P] Create NHI lifecycle state badge component in src/routes/(app)/nhi/nhi-state-badge.svelte: accept state prop (NhiLifecycleState), render Badge with color mapping: active=default (green), inactive=outline, suspended=orange, deprecated=amber, archived=secondary (gray)
- [x] T009 [P] Create NHI type badge component in src/routes/(app)/nhi/nhi-type-badge.svelte: accept type prop (NhiType), render Badge with label: tool="Tool", agent="Agent", service_account="Service Account"
- [x] T010 [P] Create NHI name link component in src/routes/(app)/nhi/nhi-name-link.svelte: accept name, href, and nhiType props, render as styled link that routes to /nhi/{type-path}/[id] based on nhi_type

**Checkpoint**: Schemas validated, API client tested, badge and link components ready

---

## Phase 3: User Story 1 — NHI Unified List (Priority: P1)

**Goal**: Admin sees paginated, filterable list of all NHI types at /nhi

**Independent Test**: Navigate to /nhi, see data table with NHI data, filter by type and state, paginate

### Implementation

- [x] T011 [US1] Create proxy endpoint src/routes/api/nhi/+server.ts: GET handler reads access_token and tenant_id cookies, validates session (return 401 if missing), forwards query params (offset, limit, nhi_type, lifecycle_state) to listNhi API, returns JSON response
- [x] T012 [US1] Create src/routes/(app)/nhi/+page.server.ts: load function returns empty object (data fetched client-side via proxy)
- [x] T013 [US1] Create src/routes/(app)/nhi/+page.svelte: PageHeader "Non-Human Identities" with Create dropdown (DropdownMenu with links to /nhi/tools/create, /nhi/agents/create, /nhi/service-accounts/create), filter section with NHI type dropdown (tool, agent, service_account) and lifecycle state dropdown (active, inactive, suspended, deprecated, archived), data table integration with client-side fetch to /api/nhi, $state for pagination ({pageIndex: 0, pageSize: 20}), $state for filters (nhiType, lifecycleState), $effect to fetch data on pagination/filter changes, column definitions (name as link via nhi-name-link routing to /nhi/{tools|agents|service-accounts}/[id] based on nhi_type, type via nhi-type-badge, lifecycle_state via nhi-state-badge, description truncated, created_at formatted), empty state "No identities found"

**Checkpoint**: NHI unified list page works with pagination and dual filtering

---

## Phase 4: User Story 2 — Create Tool (Priority: P1)

**Goal**: Admin creates a new Tool NHI via form at /nhi/tools/create

**Independent Test**: Navigate to /nhi/tools/create, fill form, submit, verify redirect and toast

### Implementation

- [x] T014 [US2] Create src/routes/(app)/nhi/tools/create/+page.server.ts: load returns superValidate(zod(createToolSchema)) form; default action validates form, parses input_schema and output_schema from JSON strings to objects (return validation error if invalid JSON), builds CreateToolRequest, calls createTool API, on success redirects to /nhi, on error returns message with ApiError status
- [x] T015 [US2] Create src/routes/(app)/nhi/tools/create/+page.svelte: PageHeader "Create tool", Card with form using Superforms enhance, fields for name (Input), description (Input/textarea), category (Input), input_schema (textarea with monospace font, placeholder JSON example), output_schema (textarea optional), requires_approval (checkbox), max_calls_per_hour (Input number), provider (Input), inline validation errors, submit Button, cancel link to /nhi, toast on success

**Checkpoint**: Tool creation form works with JSON validation

---

## Phase 5: User Story 3 — Create Agent (Priority: P1)

**Goal**: Admin creates a new Agent NHI via form at /nhi/agents/create

**Independent Test**: Navigate to /nhi/agents/create, fill form, submit, verify redirect and toast

### Implementation

- [x] T016 [P] [US3] Create src/routes/(app)/nhi/agents/create/+page.server.ts: load returns superValidate(zod(createAgentSchema)) form; default action validates form, builds CreateAgentRequest, calls createAgent API, on success redirects to /nhi, on error returns message
- [x] T017 [P] [US3] Create src/routes/(app)/nhi/agents/create/+page.svelte: PageHeader "Create agent", Card with form using Superforms enhance, fields for name (Input), description (Input/textarea), agent_type (Input, e.g. "autonomous", "copilot"), model_provider (Input), model_name (Input), model_version (Input), max_token_lifetime_secs (Input number), requires_human_approval (checkbox), inline validation errors, submit Button, cancel link to /nhi, toast on success

**Checkpoint**: Agent creation form works with validation

---

## Phase 6: User Story 4 — Create Service Account (Priority: P1)

**Goal**: Admin creates a new Service Account NHI via form at /nhi/service-accounts/create

**Independent Test**: Navigate to /nhi/service-accounts/create, fill form, submit, verify redirect and toast

### Implementation

- [x] T018 [P] [US4] Create src/routes/(app)/nhi/service-accounts/create/+page.server.ts: load returns superValidate(zod(createServiceAccountSchema)) form; default action validates form, builds CreateServiceAccountRequest, calls createServiceAccount API, on success redirects to /nhi, on error returns message
- [x] T019 [P] [US4] Create src/routes/(app)/nhi/service-accounts/create/+page.svelte: PageHeader "Create service account", Card with form using Superforms enhance, fields for name (Input), description (Input/textarea), purpose (Input/textarea, required), environment (Input, e.g. "production", "staging"), inline validation errors, submit Button, cancel link to /nhi, toast on success

**Checkpoint**: Service account creation form works with validation

---

## Phase 7: User Story 5 — NHI Detail & Edit (Priority: P1)

**Goal**: Admin views, edits, and deletes NHI at type-specific detail pages

**Independent Test**: Click NHI from list, see all details including type-specific fields, edit a field, save, delete with confirmation

### Implementation

- [x] T020 [US5] Create src/routes/(app)/nhi/tools/[id]/+page.server.ts: load function calls getTool(params.id) and returns NHI detail data + superValidate(updateToolSchema) form pre-filled with current values (input_schema and output_schema stringified); named actions: update (validate updateToolSchema, parse JSON strings for schemas, call updateTool API), delete (call deleteTool, redirect to /nhi)
- [x] T021 [US5] Create src/routes/(app)/nhi/tools/[id]/+page.svelte: two modes via $state isEditing; VIEW mode: PageHeader with tool name + nhi-state-badge, Card showing base fields (name, description, type, lifecycle_state, created_at, updated_at) + tool-specific fields (category, input_schema as formatted JSON, output_schema, requires_approval, max_calls_per_hour, provider, provider_verified, checksum), Edit button, Back to /nhi link; EDIT mode: form with Superforms (name, description, category, input_schema textarea, output_schema textarea, requires_approval checkbox, max_calls_per_hour, provider), Save/Cancel buttons; Delete button with confirmation Dialog; toast notifications on all actions; hide edit/delete when archived (FR-015)
- [x] T022 [P] [US5] Create src/routes/(app)/nhi/agents/[id]/+page.server.ts: load function calls getAgent(params.id) and returns NHI detail data + superValidate(updateAgentSchema) form pre-filled; named actions: update (validate updateAgentSchema, call updateAgent API), delete (call deleteAgent, redirect to /nhi)
- [x] T023 [P] [US5] Create src/routes/(app)/nhi/agents/[id]/+page.svelte: same view/edit pattern as tool detail; base fields + agent-specific fields (agent_type, model_provider, model_name, model_version, max_token_lifetime_secs, requires_human_approval); edit form with agent fields; Delete dialog; hide edit/delete when archived
- [x] T024 [P] [US5] Create src/routes/(app)/nhi/service-accounts/[id]/+page.server.ts: load function calls getServiceAccount(params.id) and returns NHI detail data + superValidate(updateServiceAccountSchema) form pre-filled; named actions: update (validate updateServiceAccountSchema, call updateServiceAccount API), delete (call deleteServiceAccount, redirect to /nhi)
- [x] T025 [P] [US5] Create src/routes/(app)/nhi/service-accounts/[id]/+page.svelte: same view/edit pattern as tool detail; base fields + SA-specific fields (purpose, environment); edit form with SA fields; Delete dialog; hide edit/delete when archived

**Checkpoint**: Full CRUD for all three NHI types with type-specific detail pages

---

## Phase 8: User Story 6 — Credential Management (Priority: P2)

**Goal**: Admin issues, views, rotates, and revokes credentials on NHI detail pages

**Independent Test**: Issue a credential on any NHI detail page, see it listed with masked value, rotate it, revoke it

### Implementation

- [x] T026 [US6] Create credentials section component in src/routes/(app)/nhi/credentials-section.svelte: accept nhiId prop and credentials array prop; display table of credentials (credential_type, masked value "••••••••", valid_from, valid_until formatted, is_active badge); "Issue credential" button opens Dialog with credential_type Select (api_key, secret, certificate), valid_days Input (optional), submit calls parent form action; secret display Dialog (shown after issue/rotate) with monospace secret text, copy button using navigator.clipboard, warning "This secret will not be shown again", close button; each credential row has "Rotate" button (opens confirmation, submits rotate action) and "Revoke" button (opens confirmation Dialog, submits revoke action); hide all actions when NHI is archived
- [x] T027 [US6] Add credential server actions to src/routes/(app)/nhi/tools/[id]/+page.server.ts: update load to also call listCredentials(params.id); add named actions: issueCredential (parse credential_type and valid_days from formData, call issueCredential API, return credential + secret), rotateCredential (parse credential_id from formData, call rotateCredential API, return credential + secret), revokeCredential (parse credential_id from formData, call revokeCredential API)
- [x] T028 [US6] Integrate credentials-section into src/routes/(app)/nhi/tools/[id]/+page.svelte: import and render credentials-section below the detail Card, pass nhiId and credentials from load data, handle form action results for issue/rotate (show secret dialog), handle revoke (refresh credentials list)
- [x] T029 [P] [US6] Add credential server actions to src/routes/(app)/nhi/agents/[id]/+page.server.ts (same pattern as T027) and integrate credentials-section into src/routes/(app)/nhi/agents/[id]/+page.svelte (same pattern as T028)
- [x] T030 [P] [US6] Add credential server actions to src/routes/(app)/nhi/service-accounts/[id]/+page.server.ts (same pattern as T027) and integrate credentials-section into src/routes/(app)/nhi/service-accounts/[id]/+page.svelte (same pattern as T028)

**Checkpoint**: Credential management (issue, list, rotate, revoke) works on all three detail pages

---

## Phase 9: User Story 7 — NHI Lifecycle Actions (Priority: P2)

**Goal**: Admin performs lifecycle transitions from NHI detail pages based on current state

**Independent Test**: Activate an inactive NHI, suspend an active NHI with reason, deprecate it, archive it

### Implementation

- [x] T031 [US7] Add lifecycle server actions to src/routes/(app)/nhi/tools/[id]/+page.server.ts: named actions: activate (call activateNhi API), suspend (parse optional reason from formData, call suspendNhi API), reactivate (call reactivateNhi API), deprecate (call deprecateNhi API), archive (call archiveNhi API)
- [x] T032 [US7] Add lifecycle action UI to src/routes/(app)/nhi/tools/[id]/+page.svelte: Actions section with conditional buttons based on lifecycle_state — Activate (shown for inactive/suspended), Suspend (shown for active) with optional reason Dialog, Deprecate (shown for active), Archive (shown for deprecated) with confirmation Dialog + warning "This action cannot be undone"; hide all action buttons when state is archived; toast notifications on all actions
- [x] T033 [P] [US7] Add lifecycle server actions to src/routes/(app)/nhi/agents/[id]/+page.server.ts (same pattern as T031) and add lifecycle action UI to src/routes/(app)/nhi/agents/[id]/+page.svelte (same pattern as T032)
- [x] T034 [P] [US7] Add lifecycle server actions to src/routes/(app)/nhi/service-accounts/[id]/+page.server.ts (same pattern as T031) and add lifecycle action UI to src/routes/(app)/nhi/service-accounts/[id]/+page.svelte (same pattern as T032)

**Checkpoint**: Full lifecycle management with state-dependent action buttons and reason dialogs

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T035 Update sidebar navigation in src/routes/(app)/+layout.svelte if needed: verify /nhi link works for NHI list and all sub-routes (tools, agents, service-accounts)
- [x] T036 Run full test suite: npx vitest run — all tests pass
- [x] T037 Run type check: npm run check — zero errors
- [x] T038 Run quickstart.md validation checklist — all 24 scenarios validated
- [x] T039 Honest review per Constitution Principle III

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 NHI List (Phase 3)**: Depends on Phase 2 (needs API client + badges)
- **US2 Create Tool (Phase 4)**: Depends on Phase 1 (needs schemas + API client), can run parallel with Phase 3
- **US3 Create Agent (Phase 5)**: Depends on Phase 1, can run parallel with Phases 3-4
- **US4 Create SA (Phase 6)**: Depends on Phase 1, can run parallel with Phases 3-5
- **US5 Detail & Edit (Phase 7)**: Depends on Phase 3 (NHI list links to detail pages)
- **US6 Credentials (Phase 8)**: Depends on Phase 7 (extends detail pages)
- **US7 Lifecycle (Phase 9)**: Depends on Phase 7 (extends detail pages), can run parallel with Phase 8
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

# Badge + link components in parallel:
T008, T009, T010

# All three create forms in parallel (different routes):
Phase 4 (T014-T015), Phase 5 (T016-T017), Phase 6 (T018-T019)

# Agent + SA detail pages in parallel (after tool detail as pattern):
T022+T023, T024+T025

# Credential integration for agent + SA in parallel:
T029, T030

# Lifecycle integration for agent + SA in parallel:
T033, T034

# Credentials (Phase 8) + Lifecycle (Phase 9) in parallel (different concerns):
Phase 8, Phase 9
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 + US4 + US5)

1. Complete Phase 1: Setup (types, API client, schemas)
2. Complete Phase 2: Foundational (tests, badges, links)
3. Complete Phase 3: NHI List (US1)
4. Complete Phases 4-6: Create Forms (US2, US3, US4) — in parallel
5. Complete Phase 7: Detail & Edit (US5)
6. **STOP and VALIDATE**: All NHI types can be created, viewed, edited, deleted

### Full Delivery

1. Setup → Foundational → US1 (NHI List) → US2+US3+US4 (Create Forms) → US5 (Detail & Edit) → US6 (Credentials) + US7 (Lifecycle) → Polish
2. Each phase validated before proceeding
3. Honest review at the end (T039)

---

## Notes

- Total tasks: 39
- Setup tasks: 3 (T001–T003)
- Foundational tasks: 7 (T004–T010)
- US1 (NHI List) tasks: 3 (T011–T013)
- US2 (Create Tool) tasks: 2 (T014–T015)
- US3 (Create Agent) tasks: 2 (T016–T017)
- US4 (Create SA) tasks: 2 (T018–T019)
- US5 (Detail & Edit) tasks: 6 (T020–T025)
- US6 (Credentials) tasks: 5 (T026–T030)
- US7 (Lifecycle) tasks: 4 (T031–T034)
- Polish tasks: 5 (T035–T039)
- Parallel opportunities: T004+T005 (tests), T008+T009+T010 (components), Phases 4+5+6 (create forms), T022-T025 (detail pages), T029+T030 (credentials), T033+T034 (lifecycle), Phase 8+Phase 9 (credentials + lifecycle)

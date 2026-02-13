# Tasks: Webhooks & Authorization Policy Management

**Input**: Design documents from `/specs/024-webhooks-authz-policies/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included (constitution mandates TDD).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Types & Schemas)

**Purpose**: Add TypeScript types and Zod schemas shared across all user stories

- [x] T001 Add webhook types (WebhookSubscription, WebhookDelivery, WebhookDlqEntry, WebhookEventType, list/create/update request/response types) to src/lib/api/types.ts — match backend DTOs exactly per data-model.md and contracts/webhooks-api.md. Use `enabled: boolean` + `consecutive_failures: number` (not status enum). Pagination format: `{items, total, limit, offset}`.
- [x] T002 Add authorization types (AuthorizationPolicy, PolicyCondition, EntitlementActionMapping, AuthorizationDecision, list/create/update request/response types) to src/lib/api/types.ts — use `resource_type` + `action` (not patterns), structured conditions with `condition_type`/`attribute_path`/`operator`/`value`, `priority` field, `status: 'active' | 'inactive'`. Pagination format: `{items, total, limit, offset}`.
- [x] T003 [P] Create webhook Zod schemas in src/lib/schemas/webhooks.ts — `createWebhookSubscriptionSchema` (name required, url required valid URL, event_types min 1 item, secret optional, description optional), `updateWebhookSubscriptionSchema` (all optional), derive from `zod/v3`.
- [x] T004 [P] Create authorization Zod schemas in src/lib/schemas/authorization.ts — `createPolicySchema` (name required, effect enum allow/deny, resource_type required, action required, priority optional number, description optional, conditions optional array of structured conditions), `updatePolicySchema` (all optional including status active/inactive), `createMappingSchema` (entitlement_id uuid, action required, resource_type required), `authCheckSchema` (user_id uuid, action required, resource_type required, resource_id optional). Derive from `zod/v3`.
- [x] T005 [P] Write webhook schema tests in src/lib/schemas/webhooks.test.ts — test valid/invalid inputs for create and update schemas (name required, url format, event_types non-empty array, optional fields).
- [x] T006 [P] Write authorization schema tests in src/lib/schemas/authorization.test.ts — test valid/invalid inputs for all schemas (create policy, update policy, create mapping, auth check). Test effect enum constraint, condition structure validation, uuid format for entitlement_id.

---

## Phase 2: Foundational (API Clients & BFF Proxies)

**Purpose**: Server/client API clients and BFF proxy endpoints — MUST complete before any page work

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Create server-side webhook API client in src/lib/api/webhooks.ts — functions: `listWebhookEventTypes`, `listWebhookSubscriptions` (with limit/offset), `createWebhookSubscription`, `getWebhookSubscription`, `updateWebhookSubscription` (PATCH), `deleteWebhookSubscription`, `listWebhookDeliveries` (subscription id + limit/offset), `listDlqEntries` (limit/offset), `replayDlqEntry`, `deleteDlqEntry`. Use apiClient pattern from existing src/lib/api/groups.ts. Backend paths: `/webhooks/...`
- [x] T008 [P] Create client-side webhook API in src/lib/api/webhooks-client.ts — functions: `fetchWebhookEventTypes`, `fetchWebhookSubscriptions`, `fetchWebhookDeliveries`, `fetchDlqEntries`, `replayDlqEntryClient`, `deleteDlqEntryClient`. Pattern: fetch from `/api/admin/webhooks/...` BFF endpoints.
- [x] T009 [P] Create server-side authorization API client in src/lib/api/authorization.ts — functions: `listPolicies` (limit/offset), `createPolicy`, `getPolicy`, `updatePolicy` (PUT), `deletePolicy` (soft delete), `listMappings` (limit/offset), `createMapping`, `deleteMapping`, `checkAuthorization` (GET with query params: user_id, action, resource_type, resource_id?). Use apiClient pattern. Backend paths: `/admin/authorization/...`
- [x] T010 [P] Create client-side authorization API in src/lib/api/authorization-client.ts — functions: `fetchPolicies`, `fetchMappings`, `checkAuthorizationClient` (GET with query params). Pattern: fetch from `/api/admin/authorization/...` BFF endpoints.
- [x] T011 [P] Write webhook API client tests in src/lib/api/webhooks.test.ts — mock fetch, test all server-side functions for success and error paths. Verify correct HTTP methods (POST for create, PATCH for update, DELETE for delete), URL construction, and response parsing.
- [x] T012 [P] Write authorization API client tests in src/lib/api/authorization.test.ts — mock fetch, test all server-side functions. Verify PUT for update, DELETE for soft-delete, GET with query params for check. Test pagination params forwarding.
- [x] T013 [P] Create webhook BFF proxies for event-types and subscription list/create in src/routes/api/admin/webhooks/event-types/+server.ts (GET) and src/routes/api/admin/webhooks/subscriptions/+server.ts (GET, POST) — validate session, forward to backend via server API client, return JSON response. Follow pattern from existing src/routes/api/admin/groups/+server.ts.
- [x] T014 [P] Create webhook BFF proxy for subscription detail/update/delete in src/routes/api/admin/webhooks/subscriptions/[id]/+server.ts (GET, PATCH, DELETE) — validate session, forward to backend, handle 404.
- [x] T015 [P] Create webhook BFF proxies for deliveries and DLQ in src/routes/api/admin/webhooks/subscriptions/[id]/deliveries/+server.ts (GET), src/routes/api/admin/webhooks/dlq/+server.ts (GET), src/routes/api/admin/webhooks/dlq/[entryId]/+server.ts (DELETE), src/routes/api/admin/webhooks/dlq/[entryId]/replay/+server.ts (POST).
- [x] T016 [P] Create authorization BFF proxy for policy list/create in src/routes/api/admin/authorization/policies/+server.ts (GET, POST) — validate session, forward to backend.
- [x] T017 [P] Create authorization BFF proxy for policy detail/update/delete in src/routes/api/admin/authorization/policies/[id]/+server.ts (GET, PUT, DELETE).
- [x] T018 [P] Create authorization BFF proxies for mappings and check in src/routes/api/admin/authorization/mappings/+server.ts (GET, POST), src/routes/api/admin/authorization/mappings/[id]/+server.ts (DELETE), src/routes/api/admin/authorization/check/+server.ts (GET).
- [x] T019 Add sidebar navigation entries in src/routes/(app)/+layout.svelte — add "Webhooks" link under Settings section (href="/settings/webhooks", admin-only) and "Authorization" link under Governance section (href="/governance/authorization", admin-only). Use lucide-svelte icons (Webhook for webhooks, ShieldCheck for authorization).

**Checkpoint**: Foundation ready — all API clients, BFF proxies, schemas, and types in place. User story page implementation can now begin.

---

## Phase 3: User Story 1 - Webhook Subscription Management (Priority: P1) MVP

**Goal**: Full CRUD for webhook subscriptions with delivery history viewing, pause/resume toggle, and delete.

**Independent Test**: Create subscription → verify in list → view detail with deliveries → edit → pause/resume → delete.

### Implementation for User Story 1

- [x] T020 [US1] Create webhook subscription list page — src/routes/(app)/settings/webhooks/+page.server.ts (load subscriptions with pagination, require admin) and src/routes/(app)/settings/webhooks/+page.svelte (DataTable with columns: Name, URL, Event Types count, Status badge derived from enabled+consecutive_failures, Created). Include "Create Subscription" button link. Status logic: enabled && failures===0 → Active (green), enabled && failures>0 → Failing (red), !enabled → Paused (yellow). Add clickable rows linking to `/settings/webhooks/[id]`.
- [x] T021 [US1] Create webhook subscription create page — src/routes/(app)/settings/webhooks/create/+page.server.ts (load event types for multi-select, validate with createWebhookSubscriptionSchema, call createWebhookSubscription, redirect to detail) and src/routes/(app)/settings/webhooks/create/+page.svelte (form with: name input, description textarea, url input, event type checkboxes grouped by category, secret input type=password). Use Superforms with zod adapter.
- [x] T022 [US1] Create webhook subscription detail page — src/routes/(app)/settings/webhooks/[id]/+page.server.ts (load subscription + deliveries, actions for pause/resume/delete) and src/routes/(app)/settings/webhooks/[id]/+page.svelte. Show: info card (name, url, description, event types list, status badge, failure count, timestamps), action buttons (Edit link, Pause/Resume toggle via form POST that PATCHes enabled, Delete with confirm dialog). Delivery history table below (event_type, status badge, response_code, latency_ms, created_at). Pause action: PATCH {enabled: false}. Resume: PATCH {enabled: true}. Delete: call deleteWebhookSubscription then redirect to /settings/webhooks.
- [x] T023 [US1] Create webhook subscription edit page — src/routes/(app)/settings/webhooks/[id]/edit/+page.server.ts (load subscription + event types, pre-fill form, validate with updateWebhookSubscriptionSchema, call updateWebhookSubscription PATCH) and src/routes/(app)/settings/webhooks/[id]/edit/+page.svelte (same form layout as create but pre-filled, secret field shows placeholder "Leave blank to keep current").
- [x] T024 [P] [US1] Write webhook page tests in src/routes/(app)/settings/webhooks/webhooks.test.ts — test list page renders subscriptions table with status badges, create page renders form with event type checkboxes, detail page shows info + delivery history + action buttons, edit page pre-fills form. Test status derivation logic (active/paused/failing).

**Checkpoint**: Webhook subscription CRUD is fully functional — create, list, view detail with deliveries, edit, pause/resume, delete.

---

## Phase 4: User Story 2 - Authorization Policy Management (Priority: P1)

**Goal**: Full CRUD for authorization policies with structured conditions, enable/disable toggle, and soft-delete.

**Independent Test**: Create policy → verify in list → view detail with conditions → edit → disable/enable → deactivate (delete).

### Implementation for User Story 2

- [x] T025 [US2] Create authorization policy list page — src/routes/(app)/governance/authorization/+page.server.ts (load policies with pagination, require admin) and src/routes/(app)/governance/authorization/+page.svelte (DataTable with columns: Name, Effect badge (allow=green/deny=red), Status badge (active/inactive), Priority, Resource Type, Action, Created). Include "Create Policy" button link. Add clickable rows linking to `/governance/authorization/[id]`. Add navigation tabs at top: Policies (current), Mappings (/governance/authorization/mappings), Test (/governance/authorization/test).
- [x] T026 [US2] Create policy create page — src/routes/(app)/governance/authorization/create/+page.server.ts (validate with createPolicySchema, call createPolicy, redirect to detail) and src/routes/(app)/governance/authorization/create/+page.svelte (form with: name input, description textarea, effect select (allow/deny), priority number input default 100, resource_type input, action input, conditions section with "Add Condition" button — each condition has: condition_type select (time_window/user_attribute/entitlement_check), attribute_path input, operator select (equals/not_equals/contains/in_list), value input as JSON). Use Superforms with zod adapter.
- [x] T027 [US2] Create policy detail page — src/routes/(app)/governance/authorization/[id]/+page.server.ts (load policy, actions for enable/disable/deactivate) and src/routes/(app)/governance/authorization/[id]/+page.svelte. Show: info card (name, description, effect badge, status badge, priority, resource_type, action, timestamps, created_by), conditions list (each condition shows type/attribute/operator/value), action buttons (Edit link, Enable/Disable toggle via form POST that PUTs status, Delete/Deactivate with confirm dialog). Enable: PUT {status:"active"}. Disable: PUT {status:"inactive"}. Deactivate: call deletePolicy then redirect.
- [x] T028 [US2] Create policy edit page — src/routes/(app)/governance/authorization/[id]/edit/+page.server.ts (load policy, pre-fill form, validate with updatePolicySchema, call updatePolicy PUT) and src/routes/(app)/governance/authorization/[id]/edit/+page.svelte (same layout as create but pre-filled, include existing conditions with remove button for each).
- [x] T029 [P] [US2] Write authorization policy page tests in src/routes/(app)/governance/authorization/authorization.test.ts — test list page renders policies table with effect/status badges, create page renders form with condition builder, detail page shows info + conditions + action buttons, edit page pre-fills form with existing conditions.

**Checkpoint**: Authorization policy CRUD is fully functional — create with conditions, list, view detail, edit, enable/disable, deactivate.

---

## Phase 5: User Story 3 - Entitlement-to-Action Mappings (Priority: P2)

**Goal**: List, create, and delete entitlement-to-action mappings that link governance entitlements to authorization resource/action pairs.

**Independent Test**: View mappings list → create new mapping → verify in list → delete mapping.

### Implementation for User Story 3

- [x] T030 [US3] Create mappings list page — src/routes/(app)/governance/authorization/mappings/+page.server.ts (load mappings with pagination, require admin) and src/routes/(app)/governance/authorization/mappings/+page.svelte (DataTable with columns: Entitlement ID (or resolved name if entitlement list available), Resource Type, Action, Created). Include "Create Mapping" button link. Show navigation tabs matching authorization hub (Policies, Mappings (active), Test). Add delete action per row via form POST.
- [x] T031 [US3] Create mapping create page — src/routes/(app)/governance/authorization/mappings/create/+page.server.ts (load entitlements list from governance API for dropdown, validate with createMappingSchema, call createMapping, redirect to mappings list) and src/routes/(app)/governance/authorization/mappings/create/+page.svelte (form with: entitlement select dropdown populated from governance entitlements, resource_type input, action input). Use Superforms with zod adapter.
- [x] T032 [P] [US3] Write mapping page tests in src/routes/(app)/governance/authorization/mappings/mappings.test.ts — test list page renders mappings table, create page renders form with entitlement dropdown, delete action works.

**Checkpoint**: Entitlement mapping CRUD is functional — list, create with entitlement selector, delete.

---

## Phase 6: User Story 4 - Authorization Test Tool (Priority: P2)

**Goal**: "Can I?" test tool that checks authorization for a given subject/resource/action and displays the decision with reason and source.

**Independent Test**: Enter user ID + resource + action → submit → see allowed/denied with reason and source info.

### Implementation for User Story 4

- [x] T033 [US4] Create authorization test tool page — src/routes/(app)/governance/authorization/test/+page.server.ts (validate with authCheckSchema, call checkAuthorization GET with query params, return result) and src/routes/(app)/governance/authorization/test/+page.svelte (form with: user_id input, resource_type input, action input, optional resource_id input, "Check" submit button). Display result card below form showing: Allowed/Denied badge (green/red), reason text, source badge (policy/entitlement/default_deny), policy_id if present (link to policy detail), decision_id. Show navigation tabs matching authorization hub (Policies, Mappings, Test (active)). Use Superforms for form handling.
- [x] T034 [P] [US4] Write test tool page tests in src/routes/(app)/governance/authorization/test/auth-test.test.ts — test form renders with all fields, test result display shows allowed/denied badge + reason + source, test empty state before submission.

**Checkpoint**: Authorization test tool is functional — enter subject/resource/action, see decision.

---

## Phase 7: User Story 5 - Webhook DLQ Management (Priority: P3)

**Goal**: View, replay, and delete dead letter queue entries for failed webhook deliveries.

**Independent Test**: View DLQ list → replay entry → delete entry → verify empty state.

### Implementation for User Story 5

- [x] T035 [US5] Create DLQ management page — src/routes/(app)/settings/webhooks/dlq/+page.server.ts (load DLQ entries with pagination, actions for replay and delete) and src/routes/(app)/settings/webhooks/dlq/+page.svelte (DataTable with columns: Event Type, Subscription ID, Error Message, Retry Count, Created At. Action buttons per row: Replay (form POST calling replayDlqEntry), Delete (form POST with confirm). Show link back to webhooks list. Empty state when no DLQ entries.). Add link to DLQ page from webhook list page header.
- [x] T036 [P] [US5] Write DLQ page tests in src/routes/(app)/settings/webhooks/dlq/dlq.test.ts — test list page renders DLQ entries table, replay action, delete action with confirmation, empty state.

**Checkpoint**: DLQ management is functional — list, replay, delete entries.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validation, cleanup, and E2E testing

- [x] T037 Run `npm run check` (svelte-check) and fix any TypeScript errors across all new files
- [x] T038 Run `npm run test:unit` and fix any test failures — ensure all new + existing tests pass
- [x] T039 E2E testing with Chrome DevTools MCP — test all flows from quickstart.md: webhook CRUD + pause/resume + delivery history, policy CRUD + enable/disable + conditions, mapping CRUD, auth test tool, DLQ management. Verify both light and dark themes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (types + schemas must exist first) — BLOCKS all user stories
- **US1 Webhooks (Phase 3)**: Depends on Phase 2 — no dependencies on other stories
- **US2 Policies (Phase 4)**: Depends on Phase 2 — no dependencies on other stories
- **US3 Mappings (Phase 5)**: Depends on Phase 2 — benefits from US2 nav tabs but independent
- **US4 Test Tool (Phase 6)**: Depends on Phase 2 — benefits from US2 nav tabs but independent
- **US5 DLQ (Phase 7)**: Depends on Phase 2 — benefits from US1 webhook pages for navigation but independent
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Independent — can start after Phase 2
- **US2 (P1)**: Independent — can start after Phase 2 (parallel with US1)
- **US3 (P2)**: Independent — can start after Phase 2 (shares authorization nav tabs with US2)
- **US4 (P2)**: Independent — can start after Phase 2 (shares authorization nav tabs with US2)
- **US5 (P3)**: Independent — can start after Phase 2 (shares webhook nav with US1)

### Within Each User Story

- Schema tests verify schemas work before page implementation
- Server load functions before page components
- List page before create page
- Detail page before edit page
- Tests can run in parallel with page implementation (different files)

### Parallel Opportunities

- T003, T004, T005, T006 can all run in parallel (different schema files)
- T007-T018 can all run in parallel (different API/proxy files)
- US1 and US2 can run in parallel after Phase 2
- US3, US4 can run in parallel after Phase 2
- Test tasks (T024, T029, T032, T034, T036) are all parallelizable

---

## Parallel Example: User Story 1

```bash
# After Phase 2 is complete, launch US1 tasks:
# Sequential (same route directory):
Task: "T020 [US1] Create webhook list page"
Task: "T021 [US1] Create webhook create page"  # can run after T020
Task: "T022 [US1] Create webhook detail page"   # can run after T020
Task: "T023 [US1] Create webhook edit page"      # can run after T022

# Parallel with all above (different file):
Task: "T024 [P] [US1] Write webhook page tests"
```

## Parallel Example: US1 + US2 in parallel

```bash
# After Phase 2, launch both P1 stories simultaneously:
# Team A: US1 (Webhooks)
Task: "T020-T024 Webhook subscription pages + tests"

# Team B: US2 (Authorization)
Task: "T025-T029 Authorization policy pages + tests"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + schemas)
2. Complete Phase 2: Foundational (API clients + BFF proxies + sidebar nav)
3. Complete Phase 3: US1 — Webhook Subscription Management
4. **STOP and VALIDATE**: Test webhook CRUD independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Webhooks) → Test independently → MVP!
3. Add US2 (Policies) → Test independently → Core authorization
4. Add US3 (Mappings) + US4 (Test Tool) → Test independently → Full authorization
5. Add US5 (DLQ) → Test independently → Complete feature
6. Polish → E2E validation → Done

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Webhook status is derived: `enabled` + `consecutive_failures` → Active/Paused/Failing
- Backend uses PATCH for webhook updates, PUT for policy updates
- Backend DELETE on policies = soft delete (deactivation), not permanent
- Auth check uses GET with query params (not POST with body)
- Conditions are structured objects (not freeform JSON)
- Custom headers removed from scope (backend doesn't support)
- All pages are admin-only (check role in server load)

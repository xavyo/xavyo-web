# Tasks: NHI Protocols & Advanced

**Input**: Design documents from `/specs/013-nhi-protocols-advanced/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks grouped by user story. Constitution requires TDD (Principle II).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US4)
- Exact file paths included

---

## Phase 1: Setup

**Purpose**: Add NHI protocol TypeScript types, Zod schemas

- [x] T001 Add NHI protocol TypeScript types (McpTool, McpToolsResponse, McpCallRequest, McpContext, McpCallResponse, McpErrorResponse, McpErrorCode, A2aTaskState, A2aTaskResponse, A2aTaskListResponse, CreateA2aTaskRequest, CreateA2aTaskResponse, CancelA2aTaskResponse, NhiToolPermission, GrantToolPermissionRequest, NhiNhiPermission, GrantNhiPermissionRequest, NhiUserPermission, RevokeResponse, PaginatedPermissionResponse, AgentCard, AgentCapabilities, AgentAuthentication, AgentSkill) to `src/lib/api/types.ts`
- [x] T002 [P] Create Zod validation schemas for NHI protocol forms (createA2aTaskSchema, mcpInvokeSchema, grantToolPermissionSchema, grantNhiPermissionSchema, grantUserPermissionSchema) in `src/lib/schemas/nhi-protocols.ts`
- [x] T003 [P] Write unit tests for NHI protocol Zod schemas in `src/lib/schemas/nhi-protocols.test.ts`

---

## Phase 2: Foundational (API Clients + BFF Proxies)

**Purpose**: Server-side API clients, client-side fetch wrappers, and BFF proxy endpoints — MUST complete before UI work

**⚠️ CRITICAL**: No user story UI work can begin until API clients and BFF proxies exist

- [x] T004 [P] Create server-side MCP API client (listTools, callTool) in `src/lib/api/mcp.ts`
- [x] T005 [P] Write unit tests for MCP server API client in `src/lib/api/mcp.test.ts`
- [x] T006 [P] Create server-side A2A API client (listTasks, createTask, getTask, cancelTask, getAgentCard) in `src/lib/api/a2a.ts`
- [x] T007 [P] Write unit tests for A2A server API client in `src/lib/api/a2a.test.ts`
- [x] T008 [P] Create server-side NHI permissions API client (grantToolPermission, revokeToolPermission, listAgentTools, listToolAgents, grantNhiPermission, revokeNhiPermission, listCallers, listCallees, grantUserPermission, revokeUserPermission, listNhiUsers, listUserNhis) in `src/lib/api/nhi-permissions.ts`
- [x] T009 [P] Write unit tests for NHI permissions server API client in `src/lib/api/nhi-permissions.test.ts`
- [x] T010 [P] Create client-side MCP fetch wrappers in `src/lib/api/mcp-client.ts`
- [x] T011 [P] Write unit tests for MCP client wrappers in `src/lib/api/mcp-client.test.ts`
- [x] T012 [P] Create client-side A2A fetch wrappers in `src/lib/api/a2a-client.ts`
- [x] T013 [P] Write unit tests for A2A client wrappers in `src/lib/api/a2a-client.test.ts`
- [x] T014 [P] Create client-side NHI permissions fetch wrappers in `src/lib/api/nhi-permissions-client.ts`
- [x] T015 [P] Write unit tests for NHI permissions client wrappers in `src/lib/api/nhi-permissions-client.test.ts`
- [x] T016 [P] Create BFF proxy for MCP: `src/routes/api/nhi/mcp/tools/+server.ts` (GET list tools) and `src/routes/api/nhi/mcp/tools/[name]/call/+server.ts` (POST invoke tool)
- [x] T017 [P] Create BFF proxy for A2A: `src/routes/api/nhi/a2a/tasks/+server.ts` (GET list, POST create), `src/routes/api/nhi/a2a/tasks/[id]/+server.ts` (GET detail), `src/routes/api/nhi/a2a/tasks/[id]/cancel/+server.ts` (POST cancel), `src/routes/api/nhi/a2a/agent-card/[id]/+server.ts` (GET agent card)
- [x] T018 [P] Create BFF proxy for agent-to-tool permissions: `src/routes/api/nhi/permissions/agents/[agentId]/tools/+server.ts` (GET list), `src/routes/api/nhi/permissions/agents/[agentId]/tools/[toolId]/grant/+server.ts` (POST), `src/routes/api/nhi/permissions/agents/[agentId]/tools/[toolId]/revoke/+server.ts` (POST), `src/routes/api/nhi/permissions/tools/[toolId]/agents/+server.ts` (GET list)
- [x] T019 [P] Create BFF proxy for NHI-to-NHI permissions: `src/routes/api/nhi/permissions/[id]/call/[targetId]/grant/+server.ts` (POST), `src/routes/api/nhi/permissions/[id]/call/[targetId]/revoke/+server.ts` (POST), `src/routes/api/nhi/permissions/[id]/callers/+server.ts` (GET), `src/routes/api/nhi/permissions/[id]/callees/+server.ts` (GET)
- [x] T020 [P] Create BFF proxy for user-to-NHI permissions: `src/routes/api/nhi/permissions/[id]/users/+server.ts` (GET list), `src/routes/api/nhi/permissions/[id]/users/[userId]/grant/+server.ts` (POST), `src/routes/api/nhi/permissions/[id]/users/[userId]/revoke/+server.ts` (POST), `src/routes/api/nhi/permissions/users/[userId]/accessible/+server.ts` (GET)

**Checkpoint**: All API clients and BFF proxies ready — UI work can now begin

---

## Phase 3: User Story 1 — MCP Tool Discovery & Invocation (Priority: P1) 🎯 MVP

**Goal**: Admin views MCP tools on NHI detail pages, expands to see schema, test-invokes with JSON parameters

**Independent Test**: Navigate to agent/tool detail → MCP Tools tab → expand tool → invoke → see result/error

- [x] T021 [US1] Create json-display.svelte reusable component (formatted JSON with syntax highlighting, copy-to-clipboard, collapsible for large payloads) in `src/lib/components/nhi/json-display.svelte`
- [x] T022 [P] [US1] Write unit tests for json-display component in `src/lib/components/nhi/json-display.test.ts`
- [x] T023 [US1] Create mcp-tool-card.svelte component (expandable card showing tool name, description, status badge, input schema via json-display, invoke form with JSON textarea, result/error display with call_id and latency_ms) in `src/lib/components/nhi/mcp-tool-card.svelte`
- [x] T024 [US1] Create mcp-tools-tab.svelte component (lists tools with loading skeleton, empty state, passes NHI entity ID, fetches tools client-side via BFF proxy) in `src/lib/components/nhi/mcp-tools-tab.svelte`
- [x] T025 [US1] Modify agent detail page to add Bits UI Tabs layout (Details, MCP Tools tabs) wrapping existing content as "Details" tab, integrating mcp-tools-tab for "MCP Tools" tab in `src/routes/(app)/nhi/agents/[id]/+page.svelte`
- [x] T026 [US1] Modify tool detail page to add Bits UI Tabs layout (Details, MCP Tools tabs) wrapping existing content as "Details" tab, integrating mcp-tools-tab for "MCP Tools" tab in `src/routes/(app)/nhi/tools/[id]/+page.svelte`

**Checkpoint**: MCP tool discovery and invocation functional on agent and tool detail pages

---

## Phase 4: User Story 2 — A2A Task Management (Priority: P2)

**Goal**: Admin views, creates, filters, and cancels A2A tasks in a dedicated sub-page

**Independent Test**: Navigate to A2A Tasks → view list → filter by state → create task → view detail → cancel task

- [x] T027 [US2] Create A2A tasks list page with DataTable (columns: task_type, source_agent_id, target_agent_id, state badge, created_at), state filter dropdown, pagination, empty state in `src/routes/(app)/nhi/a2a/+page.server.ts` and `src/routes/(app)/nhi/a2a/+page.svelte`
- [x] T028 [US2] Create A2A task create page with Superforms (target_agent_id select, task_type input, input JSON textarea, optional callback_url, optional source_agent_id) in `src/routes/(app)/nhi/a2a/create/+page.server.ts` and `src/routes/(app)/nhi/a2a/create/+page.svelte`
- [x] T029 [US2] Create A2A task detail page with json-display for input/result, error display, timestamps, cancel button (disabled for terminal states), confirmation dialog in `src/routes/(app)/nhi/a2a/[id]/+page.server.ts` and `src/routes/(app)/nhi/a2a/[id]/+page.svelte`
- [x] T030 [US2] Add "A2A Tasks" item to NHI sub-navigation in sidebar in `src/routes/(app)/+layout.svelte`

**Checkpoint**: Full A2A task lifecycle — list, filter, create, view detail, cancel

---

## Phase 5: User Story 3 — NHI Permission Management (Priority: P3)

**Goal**: Admin manages agent-to-tool, NHI-to-NHI, and user-to-NHI permissions via tabs on entity detail pages

**Independent Test**: Navigate to agent detail → Permissions tab → grant tool access → revoke → grant NHI calling permission → grant user access

- [x] T031 [US3] Create grant-tool-permission-dialog.svelte (Bits UI Dialog with tool selector, optional expiry date picker) in `src/lib/components/nhi/grant-tool-permission-dialog.svelte`
- [x] T032 [US3] Create grant-nhi-permission-dialog.svelte (Bits UI Dialog with target NHI selector, permission_type input, optional allowed_actions JSON textarea, max_calls_per_hour input, optional expiry date picker) in `src/lib/components/nhi/grant-nhi-permission-dialog.svelte`
- [x] T033 [US3] Create grant-user-permission-dialog.svelte (Bits UI Dialog with user selector) in `src/lib/components/nhi/grant-user-permission-dialog.svelte`
- [x] T034 [US3] Create permissions-tab.svelte component (3 sections: "Tool Access" with grant/revoke for agent-to-tool, "Calling Permissions" with grant/revoke for NHI-to-NHI callees + "Callers" list, "Users" with grant/revoke for user-to-NHI; each section has loading skeleton, empty state, paginated list, revoke confirmation dialog) in `src/lib/components/nhi/permissions-tab.svelte`
- [x] T035 [US3] Add Permissions tab to agent detail page (extending existing tabs from T025) in `src/routes/(app)/nhi/agents/[id]/+page.svelte`
- [x] T036 [US3] Add Permissions tab to tool detail page (extending existing tabs from T026, showing only "Agents with Access" section via listToolAgents) in `src/routes/(app)/nhi/tools/[id]/+page.svelte`
- [x] T037 [US3] Add Bits UI Tabs to service-account detail page (Details, Permissions tabs) with permissions-tab showing NHI-to-NHI and user-to-NHI sections in `src/routes/(app)/nhi/service-accounts/[id]/+page.svelte`

**Checkpoint**: All three permission categories manageable across all entity types

---

## Phase 6: User Story 4 — Agent Card Discovery (Priority: P4)

**Goal**: Admin views A2A Agent Card on agent detail pages with capabilities and skills

**Independent Test**: Navigate to agent detail → Agent Card tab → see name, version, capabilities, skills; inactive agent shows unavailable message

- [x] T038 [US4] Create agent-card-tab.svelte component (fetches agent card client-side, displays name, description, URL, version, protocol_version, capabilities badges for streaming/push_notifications, authentication schemes list, skills table with id/name/description, loading skeleton, error state for inactive agents) in `src/lib/components/nhi/agent-card-tab.svelte`
- [x] T039 [US4] Add Agent Card tab to agent detail page (extending existing tabs) in `src/routes/(app)/nhi/agents/[id]/+page.svelte`

**Checkpoint**: Agent card discovery fully functional on agent detail pages

---

## Phase 7: Tests & Validation

**Purpose**: Component tests, page tests, svelte-check, full test suite

- [x] T040 [P] Write unit tests for mcp-tool-card component in `src/lib/components/nhi/mcp-tool-card.test.ts`
- [x] T041 [P] Write unit tests for mcp-tools-tab component in `src/lib/components/nhi/mcp-tools-tab.test.ts`
- [x] T042 [P] Write unit tests for permissions-tab component in `src/lib/components/nhi/permissions-tab.test.ts`
- [x] T043 [P] Write unit tests for agent-card-tab component in `src/lib/components/nhi/agent-card-tab.test.ts`
- [x] T044 [P] Write tests for A2A tasks list page in `src/routes/(app)/nhi/a2a/a2a-tasks.test.ts`
- [x] T045 Run `npm run check` to verify zero TypeScript errors across all new files
- [x] T046 Run `npm run test:unit` to verify all existing + new tests pass
- [x] T047 E2E verification with Chrome DevTools MCP — Test MCP tool discovery (list tools, expand schema, invoke), A2A task management (list, filter, create, detail, cancel), permissions (grant/revoke all 3 types), agent card display, both light and dark mode

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on T001 (types) — blocks all UI work
- **Phase 3 (US1 MCP Tools)**: Depends on Phase 2 completion
- **Phase 4 (US2 A2A Tasks)**: Depends on Phase 2 completion
- **Phase 5 (US3 Permissions)**: Depends on Phase 2 completion; tab layout from US1
- **Phase 6 (US4 Agent Card)**: Depends on Phase 2 completion; tab layout from US1
- **Phase 7 (Tests)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (MCP Tools)**: Foundation only — introduces tab layout on detail pages
- **US2 (A2A Tasks)**: Independent sub-page — no cross-story deps
- **US3 (Permissions)**: Uses tab layout from US1 (extends existing tabs)
- **US4 (Agent Card)**: Uses tab layout from US1 (extends existing tabs)

### Parallel Opportunities

Within Phase 2, tasks T004-T020 (all marked [P]) can run in parallel.
US1 and US2 are fully independent and can run in parallel.
US3 and US4 depend on the tab layout introduced by US1 but are independent of each other.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + schemas)
2. Complete Phase 2: Foundational (API clients + BFF proxies)
3. Complete Phase 3: MCP Tool Discovery
4. **STOP and VALIDATE**: Test MCP tool discovery independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add MCP Tools (US1) → Test → Deploy (MVP!)
3. Add A2A Tasks (US2) → Test → Deploy
4. Add Permissions (US3) → Test → Deploy
5. Add Agent Card (US4) → Test → Deploy
6. Tests & E2E Validation → Final Deploy

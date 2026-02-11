# Research: NHI Protocols & Advanced

## R1: How to Add Tabs to Existing NHI Detail Pages

**Decision**: Use Bits UI Tabs component (already used in settings pages from 009) to wrap existing NHI detail page content into a tabbed layout.

**Rationale**: The existing NHI detail pages (agents, tools, service-accounts) use a vertical card stack with no tabs. Adding Tabs component provides consistent UX with the settings pages. The existing content becomes the "Details" tab, and new tabs (MCP Tools, Permissions, Agent Card) are added alongside.

**Alternatives considered**:
- Separate pages per section (rejected: too many routes, breaks context)
- Accordion/collapsible sections (rejected: harder to navigate, inconsistent with settings pattern)

## R2: Backend MCP Endpoints Structure

**Decision**: Backend provides 2 MCP endpoints: `GET /mcp/tools` (list available tools) and `POST /mcp/tools/:name/call` (invoke tool). Tools are fetched for the authenticated agent's context, not per-NHI-entity.

**Rationale**: Verified from `crates/xavyo-api-nhi/src/handlers/mcp.rs`. The MCP endpoints use the JWT claims of the calling agent to determine available tools. For admin UI, we'll need a proxy that lists tools associated with a specific NHI entity.

**Key types**: `McpTool { name, description, input_schema (JSON), status, deprecated }`, `McpCallRequest { parameters (JSON), context? }`, `McpCallResponse { call_id, result (JSON), latency_ms }`, `McpErrorCode` enum.

## R3: Backend A2A Endpoints Structure

**Decision**: Backend provides 4 A2A endpoints: `POST /a2a/tasks` (create), `GET /a2a/tasks` (list with filter/pagination), `GET /a2a/tasks/:id` (detail), `POST /a2a/tasks/:id/cancel` (cancel). Plus public discovery at `GET /.well-known/agents/:id`.

**Rationale**: Verified from `crates/xavyo-api-nhi/src/handlers/a2a.rs`. Task states: pending, running, completed, failed, cancelled. Pagination: `{tasks, total, limit, offset}`. Admin can view all tasks and create on behalf of agents.

**Key types**: `A2aTaskResponse { id, source_agent_id?, target_agent_id?, task_type, state, result?, error_code?, error_message?, created_at, started_at?, completed_at? }`, `CreateA2aTaskRequest { target_agent_id, task_type, input (JSON), callback_url?, source_agent_id? }`.

## R4: Backend Permission Endpoints Structure

**Decision**: Backend provides 3 permission categories with 11 endpoints total:
- Agent-to-Tool: grant (`POST /nhi/agents/:agent_id/tools/:tool_id/grant`), revoke, list agent tools, list tool agents
- NHI-to-NHI: grant (`POST /nhi/:id/call/:target_id/grant`), revoke, list callers, list callees
- User-to-NHI: grant (`POST /nhi/:id/users/:user_id/grant`), revoke, list NHI users, list user NHIs

**Rationale**: Verified from `crates/xavyo-api-nhi/src/handlers/permissions.rs`. Pagination: `{data, limit, offset}` format. All admin-only.

**Key types**: `GrantPermissionRequest { expires_at? }`, `GrantNhiPermissionRequest { permission_type, allowed_actions?, max_calls_per_hour?, expires_at? }`, `RevokeResponse { revoked: bool }`.

## R5: Agent Card Discovery

**Decision**: Public endpoint at `GET /.well-known/agents/:id` returns `AgentCard { name, description, url, version, protocol_version, capabilities, authentication, skills }`. No auth required. Returns 404 for inactive agents.

**Rationale**: Uses SECURITY DEFINER SQL functions to bypass RLS. The frontend fetches this via BFF proxy to display as a read-only view.

## R6: JSON Display Component

**Decision**: Use `<pre><code>` with Tailwind typography classes for JSON display. Add copy-to-clipboard button. No external JSON viewer library.

**Rationale**: Keeps dependency count minimal (Principle V). The JSON payloads (tool schemas, task inputs/results) are typically small. A collapsible `<details>` element handles large JSON. Copy-to-clipboard uses `navigator.clipboard.writeText()`.

## R7: Tab Loading Strategy

**Decision**: Load data for the active tab only (lazy loading). The Details tab data comes from the existing server load. MCP Tools, Permissions, and Agent Card data are fetched client-side when their tab is activated.

**Rationale**: Avoids loading all data upfront (slow initial page load). Client-side fetch via BFF proxy endpoints matches existing patterns (governance page tabs use the same approach). Tab state can be persisted in URL search params for deep linking.

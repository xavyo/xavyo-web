# Feature Specification: NHI Protocols & Advanced

**Feature Branch**: `013-nhi-protocols-advanced`
**Created**: 2026-02-11
**Status**: Draft
**Input**: Extend the existing NHI module with advanced protocol management and machine identity governance — MCP tool discovery, A2A task management, NHI permission management, and agent card discovery.

## User Scenarios & Testing

### User Story 1 - MCP Tool Discovery & Invocation (Priority: P1)

An admin navigates to an NHI agent or tool's detail page and sees a "MCP Tools" section listing all Model Context Protocol tools registered by that entity. Each tool displays its name, description, status, and input schema (formatted as JSON). The admin can expand a tool to view its full JSON Schema definition. The admin can test-invoke a tool by filling in parameters (JSON editor) and seeing the result, call ID, and latency. This enables admins to verify that MCP tools are properly registered and functioning before granting agents access.

**Why this priority**: MCP tool discovery is the foundational capability — admins need visibility into what tools are available before configuring permissions or delegating tasks. It provides immediate operational value.

**Independent Test**: Navigate to any NHI entity's detail page, view the MCP Tools tab, expand a tool to see its schema, invoke a tool with test parameters and verify the result is displayed with latency metrics.

**Acceptance Scenarios**:

1. **Given** an admin views an NHI agent's detail page, **When** they click the "MCP Tools" tab, **Then** they see a list of tools with name, description, and status badge.
2. **Given** an admin views the tools list, **When** they expand a tool, **Then** they see the full JSON Schema for that tool's input parameters.
3. **Given** an admin expands a tool, **When** they enter valid JSON parameters and click "Test Invoke", **Then** they see the result JSON, call ID, and latency in milliseconds.
4. **Given** an admin invokes a tool with invalid parameters, **When** the backend returns an error, **Then** they see a clear error message with the error code.
5. **Given** an NHI entity has no MCP tools, **When** the admin views the MCP Tools tab, **Then** they see an empty state message.

---

### User Story 2 - A2A Task Management (Priority: P2)

An admin navigates to a dedicated "A2A Tasks" section within the NHI area to view all agent-to-agent tasks across the organization. The task list shows source agent, target agent, task type, state (pending/running/completed/failed/cancelled), and timestamps. Admins can filter by state and target agent. Clicking a task shows full details including input payload, result (if completed), error information (if failed), and timestamps. Admins can cancel pending or running tasks. Additionally, admins can create new tasks by selecting a target agent, specifying a task type and input JSON, with optional callback URL.

**Why this priority**: A2A task management provides operational oversight of inter-agent communication. After MCP tools are discoverable, admins need to manage the tasks agents delegate to each other.

**Independent Test**: View the A2A task list, filter by state, create a new task targeting an agent, view task details, and cancel a pending task.

**Acceptance Scenarios**:

1. **Given** an admin navigates to A2A Tasks, **When** the page loads, **Then** they see a paginated list of tasks with source agent, target agent, task type, state badge, and created date.
2. **Given** the task list is displayed, **When** the admin filters by state "failed", **Then** only failed tasks are shown.
3. **Given** an admin clicks a task, **When** the detail page loads, **Then** they see full task details including input JSON, result JSON (if completed), error details (if failed), and all timestamps.
4. **Given** an admin views a pending task, **When** they click "Cancel", **Then** the task state changes to "cancelled" with a confirmation.
5. **Given** an admin clicks "Create Task", **When** they fill in target agent, task type, input JSON, and submit, **Then** a new task is created in "pending" state.
6. **Given** an admin views a completed task, **When** the cancel button state is checked, **Then** the cancel action is disabled for terminal states.

---

### User Story 3 - NHI Permission Management (Priority: P3)

An admin manages permissions between entities in three categories: (a) agent-to-tool permissions — which agents can use which MCP tools, (b) NHI-to-NHI calling permissions — which NHI entities can call other NHI entities, and (c) user-to-NHI permissions — which users can interact with which NHI entities. Each NHI entity's detail page has a "Permissions" tab showing granted permissions with the ability to grant new ones or revoke existing ones. Permissions can have optional expiration dates and rate limits (for NHI-to-NHI).

**Why this priority**: Permission management is the access control layer. It depends on understanding the NHI ecosystem (US1 MCP tools, US2 A2A tasks) before configuring who can access what.

**Independent Test**: Navigate to an NHI entity's permissions tab, view current permissions, grant a new agent-to-tool permission with an expiry date, grant an NHI-to-NHI calling permission with rate limits, grant a user-to-NHI permission, and revoke an existing permission.

**Acceptance Scenarios**:

1. **Given** an admin views an agent's Permissions tab, **When** the tab loads, **Then** they see three sections: "Tool Access" (agent-to-tool), "Calling Permissions" (NHI-to-NHI callees), and "Callers" (NHI-to-NHI callers).
2. **Given** the Tool Access section, **When** the admin clicks "Grant Tool Access", **Then** a dialog lets them select a tool and optionally set an expiry date.
3. **Given** an agent has tool permissions, **When** the admin clicks "Revoke" on a permission, **Then** the permission is removed after confirmation.
4. **Given** the Calling Permissions section, **When** the admin clicks "Grant Calling Permission", **Then** a dialog lets them select a target NHI, set permission type, optional allowed actions JSON, max calls per hour, and expiry date.
5. **Given** an NHI entity's detail page, **When** the admin views the "Users" section, **Then** they see which users have access to this NHI entity.
6. **Given** the Users section, **When** the admin clicks "Grant User Access", **Then** they can select a user to grant access.
7. **Given** any granted permission, **When** the admin clicks "Revoke", **Then** the permission is removed after confirmation.

---

### User Story 4 - Agent Card Discovery (Priority: P4)

An admin can view the public A2A Agent Card for any active NHI agent. The agent card displays the agent's name, description, URL, version, protocol version, capabilities (streaming, push notifications), authentication schemes, and skills list. This is the public discovery document that other agents use to find and communicate with this agent.

**Why this priority**: Agent card discovery is a read-only view that provides transparency into what information is publicly exposed about each agent. Lower priority because it's informational rather than actionable.

**Independent Test**: Navigate to an NHI agent's detail page, click "View Agent Card", and verify the card displays all discovery fields including capabilities and skills.

**Acceptance Scenarios**:

1. **Given** an admin views an active agent's detail page, **When** they click "View Agent Card", **Then** they see the agent's discovery card with name, description, URL, version, and protocol version.
2. **Given** the agent card is displayed, **When** checking capabilities, **Then** streaming and push notification support indicators are shown.
3. **Given** the agent card is displayed, **When** checking skills, **Then** each skill shows id, name, and description.
4. **Given** an inactive agent, **When** the admin tries to view the agent card, **Then** they see a message that discovery is unavailable for inactive agents.

---

### Edge Cases

- What happens when an MCP tool invocation times out? System displays timeout error with latency.
- What happens when a tool's input schema is deeply nested or very large? JSON display truncates with expand option.
- What happens when granting a permission that already exists? System shows informative error (409 conflict).
- What happens when cancelling a task that is already in a terminal state? Cancel button disabled; if race condition, shows error toast.
- What happens when an NHI entity is deleted while permissions reference it? Backend handles cascading; UI refreshes show updated state.
- How does pagination work with large permission lists? Consistent offset/limit pagination with page controls.
- What happens when the MCP tool call returns a very large result? JSON result display truncates with copy-to-clipboard.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display MCP tools available to an NHI entity with name, description, status, and input schema.
- **FR-002**: System MUST allow admins to test-invoke MCP tools with JSON parameters and display result, call ID, and latency.
- **FR-003**: System MUST display MCP error responses with error code and message when invocations fail.
- **FR-004**: System MUST list A2A tasks with pagination, showing source/target agents, task type, state, and timestamps.
- **FR-005**: System MUST support filtering A2A tasks by state and target agent.
- **FR-006**: System MUST allow admins to create new A2A tasks with target agent, task type, input JSON, and optional callback URL.
- **FR-007**: System MUST allow admins to cancel pending or running A2A tasks.
- **FR-008**: System MUST display full A2A task details including input, result, error information, and all timestamps.
- **FR-009**: System MUST manage agent-to-tool permissions with grant (with optional expiry) and revoke operations.
- **FR-010**: System MUST manage NHI-to-NHI calling permissions with grant (permission type, allowed actions, rate limits, expiry) and revoke.
- **FR-011**: System MUST manage user-to-NHI permissions with grant and revoke operations.
- **FR-012**: System MUST list all permissions for an NHI entity organized by category (tool access, callers, callees, users).
- **FR-013**: System MUST display A2A agent cards with name, description, URL, version, capabilities, authentication, and skills.
- **FR-014**: System MUST prevent actions on terminal-state tasks (cancel on completed/failed/cancelled).
- **FR-015**: System MUST use consistent pagination (offset/limit) across all list views.
- **FR-016**: System MUST require admin role for all management operations.

### Key Entities

- **MCP Tool**: A Model Context Protocol tool registered to an NHI entity — has name, description, input schema (JSON Schema), status, and deprecated flag.
- **A2A Task**: An asynchronous task delegated between agents — has source/target agents, task type, input/result JSON, state lifecycle (pending, running, completed, failed, cancelled), timestamps.
- **Agent-to-Tool Permission**: Links an agent to a tool it can use — optional expiry date.
- **NHI-to-NHI Permission**: Links two NHI entities for calling — has permission type, allowed actions, max calls per hour, optional expiry.
- **User-to-NHI Permission**: Links a user to an NHI entity they can interact with.
- **Agent Card**: Public discovery document for A2A agents — name, description, URL, version, protocol version, capabilities, authentication schemes, skills.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admins can discover and inspect all MCP tools for any NHI entity within 3 clicks from the NHI list page.
- **SC-002**: MCP tool test invocations display results within the backend's response time plus 1 second of UI overhead.
- **SC-003**: Admins can create, view, filter, and cancel A2A tasks through the UI with the same efficiency as other CRUD operations in the system.
- **SC-004**: Permission grant and revoke operations complete with immediate visual feedback (optimistic UI or fast response).
- **SC-005**: All list views support pagination and handle empty states gracefully.
- **SC-006**: Agent card information matches the backend's public discovery endpoint exactly.
- **SC-007**: All new pages follow the established design system (dark/light mode, responsive layout, skeleton loading, empty states).

## Assumptions

- The existing NHI entity detail pages (from feature 006) serve as the primary navigation point for MCP tools, permissions, and agent cards — these are added as new tabs.
- A2A Tasks get their own sub-page under the NHI section since tasks span multiple entities.
- Credential management (issue, rotate, revoke) is already implemented in feature 006 — this feature does NOT duplicate that work.
- The backend MCP endpoints use the NHI entity's JWT context (not admin's JWT) for tool listing — the admin views tools available to a specific entity.
- JSON editors for tool invocation and task creation use simple textarea inputs with syntax highlighting rather than a full-featured editor component.
- The `.well-known/agents/:id` discovery endpoint is publicly accessible and does not require authentication.

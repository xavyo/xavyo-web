# Data Model: NHI Protocols & Advanced

## Entities

### McpTool

Represents an MCP tool available to an NHI entity.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Tool name (unique identifier) |
| description | string? | Human-readable description |
| input_schema | JSON | JSON Schema defining input parameters |
| status | string | Tool status (e.g., "active") |
| deprecated | boolean? | Whether tool is deprecated |

### A2aTask

Represents an asynchronous task delegated between agents.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Task identifier |
| source_agent_id | UUID? | Agent that created the task |
| target_agent_id | UUID? | Agent assigned to execute |
| task_type | string | Type/category of the task |
| state | A2aTaskState | Current lifecycle state |
| input | JSON | Task input payload |
| result | JSON? | Task result (when completed) |
| error_code | string? | Error code (when failed) |
| error_message | string? | Error message (when failed) |
| callback_url | string? | Webhook URL for completion notification |
| created_at | datetime | When task was created |
| started_at | datetime? | When execution began |
| completed_at | datetime? | When task reached terminal state |

**State Machine: A2aTaskState**

```text
pending → running → completed
                  → failed
       → cancelled
running → cancelled
```

Valid states: `pending`, `running`, `completed`, `failed`, `cancelled`

Terminal states: `completed`, `failed`, `cancelled`

### NhiToolPermission (Agent-to-Tool)

Grants an agent access to use a specific MCP tool.

| Field | Type | Description |
|-------|------|-------------|
| agent_id | UUID | The agent receiving access |
| tool_id | UUID | The tool being granted |
| expires_at | datetime? | Optional expiration |
| created_at | datetime | When permission was granted |

### NhiNhiPermission (NHI-to-NHI)

Grants one NHI entity permission to call another.

| Field | Type | Description |
|-------|------|-------------|
| source_id | UUID | The NHI entity initiating calls |
| target_id | UUID | The NHI entity being called |
| permission_type | string | Type of permission |
| allowed_actions | JSON? | Optional action restrictions |
| max_calls_per_hour | integer? | Rate limit |
| expires_at | datetime? | Optional expiration |
| created_at | datetime | When permission was granted |

### NhiUserPermission (User-to-NHI)

Grants a user access to interact with an NHI entity.

| Field | Type | Description |
|-------|------|-------------|
| nhi_id | UUID | The NHI entity |
| user_id | UUID | The user receiving access |
| created_at | datetime | When permission was granted |

### AgentCard

Public discovery document for A2A agents.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Agent name |
| description | string? | Agent description |
| url | string | Agent endpoint URL |
| version | string | Agent version |
| protocol_version | string | A2A protocol version (e.g., "0.3") |
| capabilities | AgentCapabilities | Supported capabilities |
| authentication | AgentAuthentication | Auth schemes |
| skills | AgentSkill[] | List of skills |

**AgentCapabilities**: `{ streaming: boolean, push_notifications: boolean }`

**AgentAuthentication**: `{ schemes: string[] }`

**AgentSkill**: `{ id: string, name: string, description?: string }`

### McpCallResult

Result of an MCP tool invocation.

| Field | Type | Description |
|-------|------|-------------|
| call_id | UUID | Unique call identifier |
| result | JSON | Tool execution result |
| latency_ms | number | Execution time in milliseconds |

### McpError

Error from an MCP tool invocation.

| Field | Type | Description |
|-------|------|-------------|
| error_code | McpErrorCode | Typed error code |
| message | string | Human-readable message |
| details | JSON? | Additional error details |

**McpErrorCode enum**: `InvalidParameters`, `Unauthorized`, `NotFound`, `RateLimitExceeded`, `ExecutionFailed`, `Timeout`, `InternalError`

## Relationships

```text
NhiIdentity (existing) ──1:N──→ McpTool (via MCP endpoint)
NhiIdentity ──N:M──→ NhiIdentity (via NhiNhiPermission)
NhiAgent ──N:M──→ McpTool (via NhiToolPermission)
User ──N:M──→ NhiIdentity (via NhiUserPermission)
NhiAgent ──1:N──→ A2aTask (as source or target)
NhiAgent ──1:1──→ AgentCard (via discovery endpoint)
```

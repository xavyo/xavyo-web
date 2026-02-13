# A2A API Contracts

## BFF Proxy Endpoints

### GET /api/nhi/a2a/tasks
List A2A tasks with pagination and filters.

**Query Parameters**:
- `state` (optional): Filter by state (pending, running, completed, failed, cancelled)
- `target_agent_id` (optional, UUID): Filter by target agent
- `limit` (optional, default 20, max 100)
- `offset` (optional, default 0)

**Proxies to**: `GET /a2a/tasks`

**Response 200**:
```json
{
  "tasks": [
    {
      "id": "uuid",
      "source_agent_id": "uuid | null",
      "target_agent_id": "uuid | null",
      "task_type": "string",
      "state": "pending | running | completed | failed | cancelled",
      "result": "object | null",
      "error_code": "string | null",
      "error_message": "string | null",
      "created_at": "datetime",
      "started_at": "datetime | null",
      "completed_at": "datetime | null"
    }
  ],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

### POST /api/nhi/a2a/tasks
Create a new A2A task.

**Request Body**:
```json
{
  "target_agent_id": "uuid",
  "task_type": "string",
  "input": {},
  "callback_url": "string?",
  "source_agent_id": "uuid?"
}
```

**Response 201**:
```json
{
  "task_id": "uuid",
  "status": "pending",
  "created_at": "datetime"
}
```

### GET /api/nhi/a2a/tasks/[id]
Get A2A task detail.

**Response 200**: Single `A2aTaskResponse` object (same schema as list item).

### POST /api/nhi/a2a/tasks/[id]/cancel
Cancel a pending or running task.

**Response 200**:
```json
{
  "task_id": "uuid",
  "state": "cancelled",
  "cancelled_at": "datetime"
}
```

### GET /api/nhi/a2a/agent-card/[id]
Get public agent card for an NHI agent.

**Proxies to**: `GET /.well-known/agents/:id` (public, no auth needed but proxied for consistency)

**Response 200**:
```json
{
  "name": "string",
  "description": "string | null",
  "url": "string",
  "version": "string",
  "protocol_version": "string",
  "capabilities": {
    "streaming": false,
    "push_notifications": false
  },
  "authentication": {
    "schemes": ["bearer"]
  },
  "skills": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null"
    }
  ]
}
```

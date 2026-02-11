# NHI Permissions API Contracts

## BFF Proxy Endpoints

### Agent-to-Tool Permissions

#### POST /api/nhi/agents/[agentId]/tools/[toolId]/grant
Grant an agent access to a tool.

**Request Body**:
```json
{
  "expires_at": "datetime?"
}
```

**Response 201**: Permission object.

#### POST /api/nhi/agents/[agentId]/tools/[toolId]/revoke
Revoke an agent's access to a tool.

**Response 200**:
```json
{
  "revoked": true
}
```

#### GET /api/nhi/agents/[agentId]/tools
List tools an agent has access to.

**Query Parameters**: `limit` (default 20), `offset` (default 0)

**Response 200**:
```json
{
  "data": [...],
  "limit": 20,
  "offset": 0
}
```

#### GET /api/nhi/tools/[toolId]/agents
List agents that have access to a tool.

**Query Parameters**: `limit` (default 20), `offset` (default 0)

**Response 200**: Same pagination format as above.

### NHI-to-NHI Calling Permissions

#### POST /api/nhi/[id]/call/[targetId]/grant
Grant calling permission from one NHI to another.

**Request Body**:
```json
{
  "permission_type": "string",
  "allowed_actions": "object?",
  "max_calls_per_hour": "integer?",
  "expires_at": "datetime?"
}
```

**Response 201**: Permission object.

#### POST /api/nhi/[id]/call/[targetId]/revoke
Revoke calling permission.

**Response 200**:
```json
{
  "revoked": true
}
```

#### GET /api/nhi/[id]/callers
List NHI entities that can call this NHI.

**Query Parameters**: `limit` (default 20), `offset` (default 0)

**Response 200**: Paginated permission list `{data, limit, offset}`.

#### GET /api/nhi/[id]/callees
List NHI entities this NHI can call.

**Query Parameters**: `limit` (default 20), `offset` (default 0)

**Response 200**: Paginated permission list `{data, limit, offset}`.

### User-to-NHI Permissions

#### POST /api/nhi/[id]/users/[userId]/grant
Grant user access to an NHI entity.

**Response 201**: Permission object.

#### POST /api/nhi/[id]/users/[userId]/revoke
Revoke user access.

**Response 200**:
```json
{
  "revoked": true
}
```

#### GET /api/nhi/[id]/users
List users with access to this NHI entity.

**Query Parameters**: `limit` (default 20), `offset` (default 0)

**Response 200**: Paginated user list `{data, limit, offset}`.

#### GET /api/nhi/users/[userId]/accessible
List NHI entities accessible by a user.

**Query Parameters**: `limit` (default 20), `offset` (default 0)

**Response 200**: Paginated NHI list `{data, limit, offset}`.

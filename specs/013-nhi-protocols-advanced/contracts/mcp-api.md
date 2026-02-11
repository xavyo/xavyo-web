# MCP API Contracts

## BFF Proxy Endpoints

### GET /api/nhi/mcp/tools
List MCP tools for an NHI entity.

**Query Parameters**: `nhi_id` (required, UUID)

**Proxies to**: `GET /mcp/tools` (using NHI entity context)

**Response 200**:
```json
{
  "tools": [
    {
      "name": "string",
      "description": "string | null",
      "input_schema": {},
      "status": "string",
      "deprecated": "boolean | null"
    }
  ]
}
```

### POST /api/nhi/mcp/tools/[name]/call
Invoke an MCP tool for testing.

**Path Parameters**: `name` (tool name)

**Request Body**:
```json
{
  "nhi_id": "uuid",
  "parameters": {},
  "context": {
    "conversation_id": "string?",
    "session_id": "string?",
    "user_instruction": "string?"
  }
}
```

**Response 200**:
```json
{
  "call_id": "uuid",
  "result": {},
  "latency_ms": 123.45
}
```

**Error 4xx/5xx**:
```json
{
  "error_code": "InvalidParameters | Unauthorized | NotFound | RateLimitExceeded | ExecutionFailed | Timeout | InternalError",
  "message": "string",
  "details": {}
}
```

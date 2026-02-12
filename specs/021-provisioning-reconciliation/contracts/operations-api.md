# Operations API Contracts

## Operations

### GET /operations
List provisioning operations with filtering and pagination.

**Query Parameters**:
- `connector_id` (uuid, optional) — Filter by connector
- `user_id` (uuid, optional) — Filter by user
- `status` (OperationStatus, optional) — Filter by status
- `operation_type` (OperationType, optional) — Filter by type
- `from_date` (datetime, optional) — Start of date range
- `to_date` (datetime, optional) — End of date range
- `limit` (integer, optional, default 20) — Page size
- `offset` (integer, optional, default 0) — Page offset

**Response**: `200 OK`
```json
{
  "operations": [ProvisioningOperation],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### POST /operations
Trigger a new provisioning operation.

**Request Body**:
```json
{
  "connector_id": "uuid",
  "user_id": "uuid",
  "operation_type": "create|update|delete",
  "object_class": "string",
  "target_uid": "string (optional)",
  "payload": {},
  "priority": 0
}
```

**Response**: `201 Created` → ProvisioningOperation

### GET /operations/{id}
Get operation detail.

**Response**: `200 OK` → ProvisioningOperation (full detail with error_message, payload)

### GET /operations/stats
Queue statistics.

**Query Parameters**:
- `connector_id` (uuid, optional) — Filter by connector

**Response**: `200 OK`
```json
{
  "pending": 5,
  "in_progress": 2,
  "completed": 100,
  "failed": 3,
  "dead_letter": 1,
  "awaiting_system": 0,
  "avg_processing_time_secs": 2.5
}
```

### GET /operations/dlq
Dead letter queue operations.

**Query Parameters**:
- `connector_id` (uuid, optional) — Filter by connector
- `limit` (integer, optional) — Page size
- `offset` (integer, optional) — Page offset

**Response**: `200 OK`
```json
{
  "operations": [ProvisioningOperation],
  "offset": 0,
  "limit": 20
}
```

### POST /operations/{id}/retry
Retry a failed or dead-letter operation.

**Response**: `200 OK` → ProvisioningOperation (status reset to pending)

### POST /operations/{id}/cancel
Cancel a pending operation.

**Response**: `200 OK` → ProvisioningOperation (status set to cancelled)

### POST /operations/{id}/resolve
Resolve a dead-letter operation.

**Request Body**:
```json
{
  "resolution_notes": "string (optional)"
}
```

**Response**: `200 OK` → ProvisioningOperation (status set to resolved)

### GET /operations/{id}/logs
Get operation log entries.

**Response**: `200 OK`
```json
{
  "logs": [OperationLog],
  "operation_id": "uuid"
}
```

### GET /operations/{id}/attempts
Get execution attempts.

**Response**: `200 OK`
```json
{
  "attempts": [ExecutionAttempt],
  "operation_id": "uuid"
}
```

## Conflicts

### GET /operations/conflicts
List provisioning conflicts.

**Query Parameters**:
- `operation_id` (uuid, optional) — Filter by operation
- `conflict_type` (string, optional) — Filter by conflict type
- `pending_only` (boolean, optional) — Show only unresolved
- `limit` (integer, optional) — Page size
- `offset` (integer, optional) — Page offset

**Response**: `200 OK`
```json
{
  "conflicts": [ProvisioningConflict],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

### GET /operations/conflicts/{id}
Get conflict detail.

**Response**: `200 OK` → ProvisioningConflict

### POST /operations/conflicts/{id}/resolve
Resolve a conflict.

**Request Body**:
```json
{
  "outcome": "applied|superseded|merged|rejected",
  "notes": "string (optional)"
}
```

**Response**: `200 OK` → ProvisioningConflict (resolved)

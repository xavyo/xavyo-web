# API Contract: Bulk State Operations

## BFF Proxy Endpoints

### POST /api/governance/bulk-state-operations

Create and queue a bulk state transition.

**Request Body**:
```json
{
  "object_type": "string (required)",
  "target_state": "string (required)",
  "filter_expression": "string (required)"
}
```

**Response** (201): `BulkStateOperation` (status: queued)

**Backend**: `POST /governance/bulk-state-operations`

### GET /api/governance/bulk-state-operations/[id]

Get bulk state operation detail.

**Response** (200): `BulkStateOperation`

**Backend**: `GET /governance/bulk-state-operations/{id}`

### POST /api/governance/bulk-state-operations/[id]/cancel

Cancel a queued or processing operation.

**Request Body**: None

**Response** (200): `BulkStateOperation` (status: cancelled)

**Backend**: `POST /governance/bulk-state-operations/{id}/cancel`

### POST /api/governance/bulk-state-operations/[id]/process

Process/resume a queued bulk operation.

**Request Body**: None

**Response** (200): `BulkStateOperation` (status: processing)

**Backend**: `POST /governance/bulk-state-operations/{id}/process`

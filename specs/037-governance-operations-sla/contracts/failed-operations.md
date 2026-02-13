# API Contract: Failed Operations

## BFF Proxy Endpoints

### GET /api/governance/failed-operations

List failed operations with filtering.

**Query Parameters**:
- `status` (optional): `pending_retry` | `retrying` | `dismissed` | `resolved`
- `operation_type` (optional): Filter by operation type
- `page` (optional): Page number
- `page_size` (optional): Items per page

**Response** (200):
```json
{
  "items": [FailedOperation],
  "total": number,
  "limit": number,
  "offset": number
}
```

**Backend**: `GET /governance/failed-operations?status=&operation_type=&page=&page_size=`

### GET /api/governance/failed-operations/[id]

Get failed operation detail.

**Response** (200): `FailedOperation`

**Backend**: `GET /governance/failed-operations/{id}`

### POST /api/governance/failed-operations/[id]/retry

Retry a failed operation.

**Request Body**: None

**Response** (200): `FailedOperation` (status: retrying, retry_count incremented)

**Backend**: `POST /governance/failed-operations/{id}/retry`

### PATCH /api/governance/failed-operations/[id]

Update failed operation status (dismiss/acknowledge).

**Request Body**:
```json
{
  "status": "dismissed|resolved"
}
```

**Response** (200): `FailedOperation`

**Backend**: `PATCH /governance/failed-operations/{id}`

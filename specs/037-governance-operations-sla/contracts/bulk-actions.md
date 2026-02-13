# API Contract: Bulk Actions

## BFF Proxy Endpoints

### GET /api/governance/bulk-actions

List bulk actions with filtering.

**Query Parameters**:
- `status` (optional): `draft` | `validated` | `executing` | `completed` | `failed` | `cancelled`
- `action_type` (optional): `grant` | `revoke` | `enable` | `disable` | `delete` | `transition`
- `page` (optional): Page number
- `page_size` (optional): Items per page

**Response** (200):
```json
{
  "items": [BulkAction],
  "total": number,
  "limit": number,
  "offset": number
}
```

**Backend**: `GET /governance/bulk-actions?status=&action_type=&page=&page_size=`

### POST /api/governance/bulk-actions

Create bulk action definition.

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "action_type": "grant|revoke|enable|disable|delete|transition",
  "target_expression": "string (required)",
  "filter_expression": "string (optional)"
}
```

**Response** (201): `BulkAction` (status: draft)

**Backend**: `POST /governance/bulk-actions`

### GET /api/governance/bulk-actions/[id]

Get bulk action detail.

**Response** (200): `BulkAction`

**Backend**: `GET /governance/bulk-actions/{id}`

### PUT /api/governance/bulk-actions/[id]

Update bulk action (draft status only).

**Request Body**: Same as POST (all fields optional)

**Response** (200): `BulkAction`

**Backend**: `PUT /governance/bulk-actions/{id}`

### POST /api/governance/bulk-actions/[id]/preview

Preview bulk action (dry run).

**Request Body**: None (uses stored expressions)

**Response** (200):
```json
{
  "total_affected": number,
  "sample_items": [
    { "id": "string", "name": "string", "type": "string", "current_state": "string" }
  ],
  "expression_valid": boolean,
  "warnings": ["string"]
}
```

**Backend**: `POST /governance/bulk-actions/{id}/preview`

### POST /api/governance/bulk-actions/[id]/execute

Execute bulk action.

**Request Body**: None

**Response** (200): `BulkAction` (status: executing)

**Backend**: `POST /governance/bulk-actions/{id}/execute`

### POST /api/governance/bulk-actions/validate

Validate a bulk action expression.

**Request Body**:
```json
{
  "expression": "string (required)"
}
```

**Response** (200):
```json
{
  "valid": boolean,
  "errors": ["string"],
  "warnings": ["string"]
}
```

**Backend**: `POST /governance/bulk-actions/validate`

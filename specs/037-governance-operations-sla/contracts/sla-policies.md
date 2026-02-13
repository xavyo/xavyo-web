# API Contract: SLA Policies

## BFF Proxy Endpoints

### GET /api/governance/sla-policies

List SLA policies with optional filtering.

**Query Parameters**:
- `status` (optional): `active` | `inactive`
- `category` (optional): `access_request` | `certification` | `provisioning` | `review`
- `page` (optional): Page number (default: 1)
- `page_size` (optional): Items per page (default: 20)

**Response** (200):
```json
{
  "items": [SlaPolicy],
  "total": number,
  "limit": number,
  "offset": number
}
```

**Backend**: `GET /governance/sla-policies?status=&category=&page=&page_size=`

### POST /api/governance/sla-policies

Create a new SLA policy.

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "category": "access_request|certification|provisioning|review",
  "target_duration_hours": "number (required, >0)",
  "warning_threshold_hours": "number (required, >0, < target_duration_hours)",
  "escalation_policy_id": "uuid (optional)",
  "status": "active|inactive (default: active)"
}
```

**Response** (201): `SlaPolicy`

**Backend**: `POST /governance/sla-policies`

### GET /api/governance/sla-policies/[id]

Get SLA policy detail.

**Response** (200): `SlaPolicy`
**Response** (404): Not found

**Backend**: `GET /governance/sla-policies/{id}`

### PUT /api/governance/sla-policies/[id]

Update SLA policy.

**Request Body**: Same as POST (all fields optional for update)

**Response** (200): `SlaPolicy`

**Backend**: `PUT /governance/sla-policies/{id}`

### DELETE /api/governance/sla-policies/[id]

Delete SLA policy.

**Response** (204): No content

**Backend**: `DELETE /governance/sla-policies/{id}`

# API Contract: Scheduled Transitions

## BFF Proxy Endpoints

### GET /api/governance/scheduled-transitions

List scheduled transitions with filtering.

**Query Parameters**:
- `status` (optional): `pending` | `executed` | `cancelled` | `failed`
- `object_type` (optional): Filter by object type
- `page` (optional): Page number
- `page_size` (optional): Items per page

**Response** (200):
```json
{
  "items": [ScheduledTransition],
  "total": number,
  "limit": number,
  "offset": number
}
```

**Backend**: `GET /governance/scheduled-transitions?status=&object_type=`

### GET /api/governance/scheduled-transitions/[id]

Get scheduled transition detail.

**Response** (200): `ScheduledTransition`

**Backend**: `GET /governance/scheduled-transitions/{id}`

### DELETE /api/governance/scheduled-transitions/[id]

Cancel/delete a scheduled transition.

**Response** (204): No content

**Backend**: `DELETE /governance/scheduled-transitions/{id}`

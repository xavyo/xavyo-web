# API Contracts: Power of Attorney

**Base URL**: `http://localhost:8080/governance`

## User Endpoints

### POST /power-of-attorney — Grant PoA

**Request**:
```json
{
  "grantor_id": "uuid",
  "grantee_id": "uuid",
  "scope": {
    "application_ids": ["uuid", "uuid"],
    "workflow_types": ["approval", "certification"]
  },
  "starts_at": "2026-02-12T00:00:00Z",
  "ends_at": "2026-03-12T00:00:00Z",
  "reason": "Planned vacation"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "grantor_id": "uuid",
  "grantee_id": "uuid",
  "scope": { "application_ids": [], "workflow_types": [] },
  "starts_at": "2026-02-12T00:00:00Z",
  "ends_at": "2026-03-12T00:00:00Z",
  "reason": "Planned vacation",
  "status": "active",
  "revocation_reason": null,
  "created_at": "2026-02-12T10:00:00Z",
  "updated_at": "2026-02-12T10:00:00Z"
}
```

### GET /power-of-attorney — List User PoA

**Query Parameters**:
- `direction`: `incoming` | `outgoing` (required)
- `status`: `pending` | `active` | `expired` | `revoked` (optional)
- `limit`: number (default 20)
- `offset`: number (default 0)

**Response** (200):
```json
{
  "items": [{ "...PoaGrant" }],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

### GET /power-of-attorney/{id} — Get Single PoA

**Response** (200): `PoaGrant` object

### POST /power-of-attorney/{id}/revoke — Revoke PoA

**Request**:
```json
{
  "reason": "No longer needed"
}
```

**Response** (200): Updated `PoaGrant` with `status: "revoked"`

### POST /power-of-attorney/{id}/extend — Extend PoA

**Request**:
```json
{
  "new_ends_at": "2026-04-01T00:00:00Z"
}
```

**Response** (200): Updated `PoaGrant` with new `ends_at`

### POST /power-of-attorney/{id}/assume — Assume Identity

**Request**: Empty body `{}`

**Response** (200):
```json
{
  "access_token": "eyJ...",
  "assumed_user_id": "uuid",
  "poa_id": "uuid",
  "expires_at": "2026-03-12T00:00:00Z"
}
```

### POST /power-of-attorney/drop — Drop Assumed Identity

**Request**: Empty body `{}`

**Response** (200):
```json
{
  "message": "Identity assumption dropped"
}
```

### GET /power-of-attorney/current-assumption — Current Assumption Status

**Response** (200):
```json
{
  "is_assuming": true,
  "poa_id": "uuid",
  "assumed_identity": {
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### GET /power-of-attorney/{id}/audit — Audit Trail

**Query Parameters**:
- `event_type`: PoaEventType (optional)
- `from`: ISO 8601 datetime (optional)
- `to`: ISO 8601 datetime (optional)
- `limit`: number (default 20)
- `offset`: number (default 0)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "poa_id": "uuid",
      "event_type": "granted",
      "actor_id": "uuid",
      "details": {},
      "created_at": "2026-02-12T10:00:00Z"
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

## Admin Endpoints

### GET /admin/power-of-attorney — Admin List All PoA

**Query Parameters**:
- `grantor_id`: UUID (optional)
- `grantee_id`: UUID (optional)
- `status`: PoaStatus (optional)
- `limit`: number (default 20)
- `offset`: number (default 0)

**Response** (200): Same pagination format as user list

### POST /admin/power-of-attorney/{id}/revoke — Admin Force-Revoke

**Request**:
```json
{
  "reason": "Security concern"
}
```

**Response** (200): Updated `PoaGrant` with `status: "revoked"`

## BFF Proxy Mapping

| Frontend Route | Method | Backend Endpoint |
|---------------|--------|-----------------|
| `/api/governance/power-of-attorney` | GET | `/governance/power-of-attorney` |
| `/api/governance/power-of-attorney` | POST | `/governance/power-of-attorney` |
| `/api/governance/power-of-attorney/[id]` | GET | `/governance/power-of-attorney/{id}` |
| `/api/governance/power-of-attorney/[id]/revoke` | POST | `/governance/power-of-attorney/{id}/revoke` |
| `/api/governance/power-of-attorney/[id]/extend` | POST | `/governance/power-of-attorney/{id}/extend` |
| `/api/governance/power-of-attorney/[id]/assume` | POST | `/governance/power-of-attorney/{id}/assume` |
| `/api/governance/power-of-attorney/[id]/audit` | GET | `/governance/power-of-attorney/{id}/audit` |
| `/api/governance/power-of-attorney/drop` | POST | `/governance/power-of-attorney/drop` |
| `/api/governance/power-of-attorney/current-assumption` | GET | `/governance/power-of-attorney/current-assumption` |
| `/api/governance/power-of-attorney/admin` | GET | `/governance/admin/power-of-attorney` |
| `/api/governance/power-of-attorney/admin/[id]/revoke` | POST | `/governance/admin/power-of-attorney/{id}/revoke` |

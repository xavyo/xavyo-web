# SCIM Admin API Contracts

## Backend Endpoints (xavyo-idp)

### GET /admin/scim/tokens
**Description**: List all SCIM provisioning tokens
**Auth**: Admin required

**Response** (200):
```json
[
  {
    "id": "uuid",
    "name": "Okta Provisioning",
    "token_prefix": "xscim_...a1b2",
    "created_at": "2026-01-01T00:00:00Z",
    "last_used_at": "2026-01-15T12:00:00Z",
    "revoked_at": null,
    "created_by": "uuid"
  }
]
```

Note: Returns a flat array, NOT a paginated response.

---

### POST /admin/scim/tokens
**Description**: Create a new SCIM token (raw token returned ONCE)
**Auth**: Admin required

**Request Body** (JSON):
```json
{
  "name": "Okta Provisioning"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "Okta Provisioning",
  "token": "xscim_a1b2c3d4e5f6...full_raw_token",
  "created_at": "2026-01-01T00:00:00Z",
  "warning": "Save this token - it will not be shown again"
}
```

---

### DELETE /admin/scim/tokens/:id
**Description**: Revoke (delete) a SCIM token
**Auth**: Admin required

**Response** (204 No Content)

**Errors**: 404 (token not found)

---

### GET /admin/scim/mappings
**Description**: List all SCIM attribute mappings
**Auth**: Admin required

**Response** (200):
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "scim_path": "userName",
    "xavyo_field": "email",
    "transform": "lowercase",
    "required": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  },
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "scim_path": "name.givenName",
    "xavyo_field": "first_name",
    "transform": null,
    "required": false,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
]
```

Note: Returns a flat array, NOT a paginated response.

---

### PUT /admin/scim/mappings
**Description**: Upsert all attribute mappings (full replacement)
**Auth**: Admin required

**Request Body** (JSON):
```json
{
  "mappings": [
    {
      "scim_path": "userName",
      "xavyo_field": "email",
      "transform": "lowercase",
      "required": true
    },
    {
      "scim_path": "name.givenName",
      "xavyo_field": "first_name",
      "transform": null,
      "required": false
    }
  ]
}
```

**Response** (200): Returns updated mappings array (same format as GET)

---

## BFF Proxy Mapping

| BFF Route | Method | Backend Route |
|-----------|--------|---------------|
| /api/admin/scim/tokens | GET | GET /admin/scim/tokens |
| /api/admin/scim/tokens | POST | POST /admin/scim/tokens |
| /api/admin/scim/tokens/[id] | DELETE | DELETE /admin/scim/tokens/:id |
| /api/admin/scim/mappings | GET | GET /admin/scim/mappings |
| /api/admin/scim/mappings | PUT | PUT /admin/scim/mappings |

## Key Gotchas

- SCIM token list returns a **flat array**, not paginated `{items, total, limit, offset}`
- SCIM mappings list also returns a **flat array**
- PUT mappings is a **full replacement** (upsert) — must send ALL mappings, not just changed ones
- Token `token` field is only present in creation response — never returned again
- `revoked_at` being non-null indicates the token has been revoked
- Transform values are lowercase strings: `"lowercase"`, `"uppercase"`, `"trim"`, or `null` (no transform)

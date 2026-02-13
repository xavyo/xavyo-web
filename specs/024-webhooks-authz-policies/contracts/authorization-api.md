# Authorization API Contract

## BFF Proxy Endpoints

All authorization BFF proxies live under `src/routes/api/admin/authorization/` and forward to the xavyo-idp backend at `/admin/authorization/`.

---

### GET /api/admin/authorization/policies

List authorization policies with pagination.

**Backend**: `GET /admin/authorization/policies?limit=20&offset=0`

**Query Parameters**:
- `limit` (integer, optional, default 20)
- `offset` (integer, optional, default 0)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "name": "Allow admin read",
      "description": "Admins can read all resources",
      "effect": "allow",
      "priority": 100,
      "status": "active",
      "resource_type": "users",
      "action": "read",
      "conditions": [],
      "created_by": "uuid",
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### POST /api/admin/authorization/policies

Create a new authorization policy.

**Backend**: `POST /admin/authorization/policies`

**Request**:
```json
{
  "name": "Allow admin read",
  "description": "Admins can read all resources",
  "effect": "allow",
  "priority": 100,
  "resource_type": "users",
  "action": "read",
  "conditions": [
    {
      "condition_type": "user_attribute",
      "attribute_path": "role",
      "operator": "equals",
      "value": "admin"
    }
  ]
}
```

**Response** (201): `PolicyResponse`

---

### GET /api/admin/authorization/policies/[id]

Get policy detail.

**Backend**: `GET /admin/authorization/policies/:id`

**Response** (200): `PolicyResponse`

---

### PUT /api/admin/authorization/policies/[id]

Update policy configuration. Used for both field edits and status changes (enable/disable).

**Backend**: `PUT /admin/authorization/policies/:id`

**Request** (partial — all fields optional):
```json
{
  "name": "Updated policy name",
  "description": "Updated description",
  "effect": "deny",
  "priority": 200,
  "status": "inactive",
  "resource_type": "groups",
  "action": "write"
}
```

**Response** (200): `PolicyResponse`

---

### DELETE /api/admin/authorization/policies/[id]

Deactivate a policy (soft delete — sets status to inactive).

**Backend**: `DELETE /admin/authorization/policies/:id`

**Response** (204): No content

---

### GET /api/admin/authorization/mappings

List entitlement-to-action mappings with pagination.

**Backend**: `GET /admin/authorization/mappings?limit=20&offset=0`

**Query Parameters**:
- `limit` (integer, optional, default 20)
- `offset` (integer, optional, default 0)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "entitlement_id": "uuid",
      "action": "read",
      "resource_type": "users",
      "created_by": "uuid",
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### POST /api/admin/authorization/mappings

Create an entitlement-to-action mapping.

**Backend**: `POST /admin/authorization/mappings`

**Request**:
```json
{
  "entitlement_id": "uuid",
  "action": "read",
  "resource_type": "users"
}
```

**Response** (201): `MappingResponse`

---

### DELETE /api/admin/authorization/mappings/[id]

Delete a mapping permanently.

**Backend**: `DELETE /admin/authorization/mappings/:id`

**Response** (204): No content

---

### GET /api/admin/authorization/check

Test authorization for a user against a resource/action.

**Backend**: `GET /admin/authorization/check?user_id=uuid&action=read&resource_type=users`

**Query Parameters**:
- `user_id` (UUID, required) — Subject to check
- `action` (string, required) — Action to check
- `resource_type` (string, required) — Resource type to check
- `resource_id` (UUID, optional) — Specific resource instance

**Response** (200):
```json
{
  "allowed": true,
  "reason": "Matched policy 'Allow admin read'",
  "source": "policy",
  "policy_id": "uuid",
  "decision_id": "uuid"
}
```

`source` enum values: `"policy"`, `"entitlement"`, `"default_deny"`

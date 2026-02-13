# API Contract: User Invitations

## Backend Endpoints (xavyo-idp)

### GET /admin/invitations

List all invitations for the current tenant.

**Headers**: `Authorization: Bearer <token>`, `X-Tenant-Id: <uuid>`

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | integer | 20 | Max items per page |
| offset | integer | 0 | Pagination offset |
| status | string | (none) | Filter by status: sent, cancelled, accepted |
| email | string | (none) | Search by email (partial match) |

**Response 200**:
```json
{
  "invitations": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "status": "sent",
      "role_template_id": null,
      "invited_by_user_id": "uuid",
      "expires_at": "2026-02-18T23:27:21Z",
      "created_at": "2026-02-11T23:27:21Z",
      "accepted_at": null
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### POST /admin/invitations

Create a new invitation.

**Headers**: `Authorization: Bearer <token>`, `X-Tenant-Id: <uuid>`, `Content-Type: application/json`

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "roles": ["role-id-1"]
}
```

Note: `roles` is optional. If omitted, invited user gets default tenant roles.

**Response 201**:
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "status": "sent",
  "role_template_id": null,
  "invited_by_user_id": "uuid",
  "expires_at": "2026-02-18T23:27:21Z",
  "created_at": "2026-02-11T23:27:21Z",
  "accepted_at": null
}
```

**Error 400**: Invalid email or duplicate invitation.

---

### POST /admin/invitations/{id}/resend

Resend the invitation email.

**Headers**: `Authorization: Bearer <token>`, `X-Tenant-Id: <uuid>`

**Response 200**:
```json
{
  "message": "Invitation resent successfully"
}
```

**Error 404**: Invitation not found.
**Error 400**: Invitation not in "sent" status.

---

### DELETE /admin/invitations/{id}

Cancel an invitation (sets status to "cancelled").

**Headers**: `Authorization: Bearer <token>`, `X-Tenant-Id: <uuid>`

**Response 200**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "status": "cancelled",
  "role_template_id": null,
  "invited_by_user_id": "uuid",
  "expires_at": "2026-02-18T23:27:21Z",
  "created_at": "2026-02-11T23:27:21Z",
  "accepted_at": null
}
```

Note: Returns 200 with updated invitation (not 204).

---

## BFF Proxy Endpoints (SvelteKit)

| BFF Route | Method | Backend Endpoint |
|-----------|--------|-----------------|
| `/api/invitations` | GET | `GET /admin/invitations` |
| `/api/invitations` | POST | `POST /admin/invitations` |
| `/api/invitations/[id]/resend` | POST | `POST /admin/invitations/{id}/resend` |
| `/api/invitations/[id]` | DELETE | `DELETE /admin/invitations/{id}` |

All BFF endpoints:
- Read `accessToken` and `tenantId` from cookies
- Return 401 if not authenticated
- Forward request to backend with proper headers
- Return backend response as-is

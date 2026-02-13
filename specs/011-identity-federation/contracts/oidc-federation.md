# API Contract: OIDC Federation

## BFF Proxy Endpoints

All endpoints proxy through SvelteKit server to xavyo-idp backend.

### GET /api/federation/identity-providers

**Backend**: `GET /admin/federation/identity-providers`
**Auth**: Admin role required

**Query Parameters**:
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| offset | number | 0 | Pagination offset |
| limit | number | 20 | Items per page (max 100) |
| is_enabled | boolean | - | Filter by enabled status |

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Okta Corporate",
      "provider_type": "oidc",
      "issuer_url": "https://corp.okta.com",
      "client_id": "abc123",
      "scopes": ["openid", "profile", "email"],
      "claim_mapping": { "email": "email", "name": "preferred_username" },
      "sync_on_login": true,
      "is_enabled": true,
      "validation_status": "valid",
      "last_validated_at": "2026-02-10T12:00:00Z",
      "created_at": "2026-02-01T10:00:00Z",
      "updated_at": "2026-02-10T12:00:00Z"
    }
  ],
  "total": 3,
  "offset": 0,
  "limit": 20
}
```

### POST /api/federation/identity-providers

**Backend**: `POST /admin/federation/identity-providers`
**Auth**: Admin role required

**Request Body**:
```json
{
  "name": "Okta Corporate",
  "provider_type": "oidc",
  "issuer_url": "https://corp.okta.com",
  "client_id": "abc123",
  "client_secret": "secret456",
  "scopes": ["openid", "profile", "email"],
  "claim_mapping": { "email": "email" },
  "sync_on_login": true,
  "domains": ["acme.com"]
}
```

**Response** (201): Same as single IdentityProvider object

### GET /api/federation/identity-providers/[id]

**Backend**: `GET /admin/federation/identity-providers/{id}`
**Auth**: Admin role required

**Response** (200): Single IdentityProvider object with `linked_users_count` and `domains[]`

### PUT /api/federation/identity-providers/[id]

**Backend**: `PUT /admin/federation/identity-providers/{id}`
**Auth**: Admin role required

**Request Body**: Partial update — only include changed fields
```json
{
  "name": "Updated Name",
  "scopes": ["openid", "profile", "email", "groups"],
  "claim_mapping": { "email": "email", "groups": "groups" }
}
```

**Response** (200): Updated IdentityProvider object

### DELETE /api/federation/identity-providers/[id]

**Backend**: `DELETE /admin/federation/identity-providers/{id}`
**Auth**: Admin role required

**Response** (204): No content

### POST /api/federation/identity-providers/[id]/validate

**Backend**: `POST /admin/federation/identity-providers/{id}/validate`
**Auth**: Admin role required

**Response** (200):
```json
{
  "is_valid": true,
  "discovered_endpoints": {
    "authorization_endpoint": "https://corp.okta.com/authorize",
    "token_endpoint": "https://corp.okta.com/token",
    "userinfo_endpoint": "https://corp.okta.com/userinfo",
    "jwks_uri": "https://corp.okta.com/.well-known/jwks.json"
  },
  "error": null
}
```

### POST /api/federation/identity-providers/[id]/toggle

**Backend**: `POST /admin/federation/identity-providers/{id}/toggle`
**Auth**: Admin role required

**Request Body**:
```json
{
  "is_enabled": true
}
```

**Response** (200): Updated IdentityProvider object

### GET /api/federation/identity-providers/[id]/domains

**Backend**: `GET /admin/federation/identity-providers/{id}/domains`
**Auth**: Admin role required

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "domain": "acme.com",
      "priority": 0,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ]
}
```

### POST /api/federation/identity-providers/[id]/domains

**Backend**: `POST /admin/federation/identity-providers/{id}/domains`
**Auth**: Admin role required

**Request Body**:
```json
{
  "domain": "acme.com",
  "priority": 0
}
```

**Response** (201): Created domain object

### DELETE /api/federation/identity-providers/[id]/domains/[domainId]

**Backend**: `DELETE /admin/federation/identity-providers/{id}/domains/{domain_id}`
**Auth**: Admin role required

**Response** (204): No content

# API Contract: Social Login

## Admin Endpoints (BFF Proxy)

### GET /api/federation/social/providers

**Backend**: `GET /admin/social-providers`
**Auth**: Admin role required

**Response** (200):
```json
{
  "providers": [
    {
      "provider": "google",
      "enabled": true,
      "client_id": "abc123.apps.googleusercontent.com",
      "has_client_secret": true,
      "scopes": ["openid", "profile", "email"],
      "additional_config": null,
      "created_at": "2026-02-01T10:00:00Z",
      "updated_at": "2026-02-05T10:00:00Z"
    },
    {
      "provider": "microsoft",
      "enabled": false,
      "client_id": null,
      "has_client_secret": false,
      "scopes": [],
      "additional_config": null,
      "created_at": null,
      "updated_at": null
    },
    {
      "provider": "apple",
      "enabled": false,
      "client_id": null,
      "has_client_secret": false,
      "scopes": [],
      "additional_config": null,
      "created_at": null,
      "updated_at": null
    },
    {
      "provider": "github",
      "enabled": false,
      "client_id": null,
      "has_client_secret": false,
      "scopes": [],
      "additional_config": null,
      "created_at": null,
      "updated_at": null
    }
  ]
}
```

### PUT /api/federation/social/providers/[provider]

**Backend**: `PUT /admin/social-providers/{provider}`
**Auth**: Admin role required

**Request Body**:
```json
{
  "enabled": true,
  "client_id": "abc123.apps.googleusercontent.com",
  "client_secret": "secret456",
  "scopes": ["openid", "profile", "email"],
  "additional_config": {
    "azure_tenant": "common"
  }
}
```

**Response** (200): Updated provider config

### DELETE /api/federation/social/providers/[provider]

**Backend**: `DELETE /admin/social-providers/{provider}`
**Auth**: Admin role required

**Response** (204): No content (disables provider)

---

## User Endpoints (BFF Proxy)

### GET /api/social/connections

**Backend**: `GET /auth/social/connections`
**Auth**: Authenticated user required

**Response** (200):
```json
{
  "connections": [
    {
      "id": "uuid",
      "provider": "google",
      "email": "user@gmail.com",
      "display_name": "John Doe",
      "is_private_email": false,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ]
}
```

### GET /api/social/link/[provider]/authorize

**Backend**: `GET /auth/social/link/{provider}/authorize`
**Auth**: Authenticated user required

**Response** (302): Redirect to social provider OAuth authorization URL

**Notes**: This endpoint initiates the OAuth linking flow. The browser follows the redirect to the social provider, then the provider redirects back to the backend callback URL which completes the linking.

### POST /api/social/link/[provider]

**Backend**: `POST /auth/social/link/{provider}`
**Auth**: Authenticated user required

**Request Body**:
```json
{
  "code": "auth-code-from-callback",
  "state": "state-token"
}
```

**Response** (200): Created SocialConnection object

### DELETE /api/social/unlink/[provider]

**Backend**: `DELETE /auth/social/unlink/{provider}`
**Auth**: Authenticated user required

**Response** (204): No content

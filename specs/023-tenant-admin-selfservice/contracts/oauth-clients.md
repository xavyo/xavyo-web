# API Contract: OAuth Clients

## GET /admin/oauth/clients

List all registered OAuth clients.

**Auth**: Admin role required
**Response 200**:
```json
{
  "clients": [
    {
      "id": "uuid",
      "client_id": "abc123",
      "name": "My App",
      "client_type": "confidential",
      "redirect_uris": ["https://app.example.com/callback"],
      "grant_types": ["authorization_code", "refresh_token"],
      "scopes": ["openid", "profile", "email"],
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

## POST /admin/oauth/clients

Create a new OAuth client.

**Auth**: Admin role required
**Request Body**:
```json
{
  "name": "My New App",
  "client_type": "confidential",
  "redirect_uris": ["https://app.example.com/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "scopes": ["openid", "profile"]
}
```
**Response 201**: Created client including `client_secret` (shown once)
```json
{
  "id": "uuid",
  "client_id": "generated-client-id",
  "client_secret": "generated-secret-shown-once",
  "name": "My New App",
  "client_type": "confidential",
  "redirect_uris": ["https://app.example.com/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "scopes": ["openid", "profile"],
  "is_active": true,
  "created_at": "2026-02-11T00:00:00Z",
  "updated_at": "2026-02-11T00:00:00Z"
}
```

## GET /admin/oauth/clients/{id}

Get a specific OAuth client.

**Auth**: Admin role required
**Response 200**: Single client object (same fields as list item, no secret)

## PUT /admin/oauth/clients/{id}

Update a client.

**Auth**: Admin role required
**Request Body**: Partial update
```json
{
  "name": "Updated Name",
  "redirect_uris": ["https://new-app.example.com/callback"],
  "is_active": false
}
```
**Response 200**: Updated client object

## DELETE /admin/oauth/clients/{id}

Delete a client.

**Auth**: Admin role required
**Response 204**: No content

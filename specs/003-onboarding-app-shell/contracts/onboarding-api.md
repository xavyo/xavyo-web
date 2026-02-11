# API Contracts: Onboarding + App Shell

**Feature**: 003-onboarding-app-shell
**Created**: 2026-02-10

## Backend Endpoints Used

### POST /tenants/provision

**Auth**: JWT Bearer token (access_token from signup)
**Headers**: `Authorization: Bearer <access_token>`, `Content-Type: application/json`

**Request**:
```json
{
  "organization_name": "Acme Corp"
}
```

**Response (201)**:
```json
{
  "tenant": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "acme-corp",
    "name": "Acme Corp"
  },
  "admin": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "email": "admin@acme.com",
    "api_key": "xavyo_sk_live_a1b2c3d4e5f6789012345678901234567890"
  },
  "oauth_client": {
    "client_id": "client_a1b2c3d4e5f6",
    "client_secret": "secret_x9y8z7w6v5u4t3s2r1q0"
  },
  "endpoints": {
    "api": "https://api.xavyo.net",
    "auth": "https://auth.xavyo.net"
  },
  "next_steps": [
    "Store your API key securely",
    "Configure OAuth client in your application",
    "Log in to your new tenant"
  ]
}
```

**Error (400)**:
```json
{
  "error": "organization_name is required"
}
```

**Error (409)**:
```json
{
  "error": "Organization name already taken"
}
```

### POST /auth/logout

**Auth**: None (refresh token in body)
**Headers**: `Content-Type: application/json`

**Request**:
```json
{
  "refresh_token": "..."
}
```

**Response**: 204 No Content

**Error (400)**:
```json
{
  "error": "Missing refresh token"
}
```

## SvelteKit Routes

### GET /onboarding (Page Load)

**Auth guard**: Requires access_token (via (app) layout auth guard)
**Behavior**:
- If `locals.tenantId` exists (user already has tenant) → redirect 302 to `/dashboard`
- Otherwise → return Superforms form with onboardingSchema

### POST /onboarding (Form Action)

**Auth guard**: Requires access_token
**Request**: FormData with `organizationName`
**Behavior**:
1. Validate with Superforms + onboardingSchema
2. Call `provisionTenant(organizationName, locals.accessToken, fetch)`
3. Set `tenant_id` cookie to `response.tenant.id`
4. Return provisioning result to page for credential display

### GET /logout (Page Load)

**Auth guard**: Within (app) group
**Behavior**:
1. Read refresh_token from cookies
2. Call `logout(refreshToken, fetch)` (best-effort, errors are caught)
3. Call `clearAuthCookies(cookies)`
4. Redirect 302 to `/login`

### GET /dashboard (Page Load)

**Auth guard**: Via (app) layout
**Returns**: `{ user: locals.user }` for welcome message display

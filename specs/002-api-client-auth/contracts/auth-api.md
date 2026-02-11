# Auth API Contract

**Base URL**: `http://localhost:8080` (configured via `API_BASE_URL` env var)

## POST /auth/signup

**Headers**: `Content-Type: application/json`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "display_name": "John Doe"
}
```

**Response 200**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "email_verified": false,
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Errors**: 400 (validation), 409 (email exists)

---

## POST /auth/login

**Headers**: `Content-Type: application/json`, `X-Tenant-Id: <uuid>`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Errors**: 400 (validation), 401 (invalid credentials), 423 (account locked)

---

## POST /auth/refresh

**Headers**: `Content-Type: application/json`

**Request**:
```json
{
  "refresh_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response 200**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Errors**: 401 (invalid/expired refresh token)

---

## POST /auth/logout

**Headers**: `Content-Type: application/json`

**Request**:
```json
{
  "refresh_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response**: 204 No Content

---

## POST /auth/forgot-password

**Headers**: `Content-Type: application/json`

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response 200**:
```json
{
  "message": "If an account exists with that email, a password reset link has been sent"
}
```

---

## POST /auth/reset-password

**Headers**: `Content-Type: application/json`

**Request**:
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v",
  "new_password": "newpassword123"
}
```

**Response 200**:
```json
{
  "message": "Password has been reset successfully"
}
```

**Errors**: 400 (invalid/expired token, validation)

---

## POST /auth/verify-email

**Headers**: `Content-Type: application/json`

**Request**:
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v"
}
```

**Response 200**:
```json
{
  "message": "Email verified successfully",
  "already_verified": false
}
```

**Errors**: 400 (invalid/expired token)

---

## POST /tenants/provision

**Headers**: `Content-Type: application/json`, `Authorization: Bearer <access_token>`

**Request**:
```json
{
  "organization_name": "Acme Corp"
}
```

**Response 200**:
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
    "api_key": "xavyo_sk_live_a1b2c3d4..."
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
    "Configure OAuth client for SSO"
  ]
}
```

**Errors**: 401 (unauthorized), 400 (validation)

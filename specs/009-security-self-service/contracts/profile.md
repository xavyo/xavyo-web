# API Contract: Profile & Email

## BFF Proxy Endpoints

### GET /api/me/profile
**Backend**: `GET /me/profile`

**Response** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "display_name": "John Doe",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "email_verified": true,
  "created_at": "2026-01-01T00:00:00Z"
}
```

### PUT /api/me/profile
**Backend**: `PUT /me/profile`

**Request**:
```json
{
  "display_name": "Jane Doe",
  "first_name": "Jane",
  "last_name": "Doe",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Response** (200): Same as GET response with updated fields.

**Errors**: 400 (validation), 401 (unauthorized)

### POST /api/me/email/change
**Backend**: `POST /me/email/change`

**Request**:
```json
{
  "new_email": "newemail@example.com",
  "current_password": "currentpass"
}
```

**Response** (200):
```json
{
  "message": "Verification email sent",
  "expires_at": "2026-02-12T00:00:00Z"
}
```

**Errors**: 400 (invalid email), 401 (wrong password), 409 (email in use)

### POST /api/me/email/verify
**Backend**: `POST /me/email/verify`

**Request**:
```json
{
  "token": "43-character-verification-token-string-here"
}
```

**Response** (200):
```json
{
  "message": "Email updated successfully",
  "new_email": "newemail@example.com"
}
```

**Errors**: 400 (invalid/expired token), 409 (email taken)

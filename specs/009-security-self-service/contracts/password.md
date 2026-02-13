# API Contract: Password Change

## BFF Proxy Endpoint

### PUT /api/me/password
**Backend**: `PUT /auth/password`

**Request**:
```json
{
  "current_password": "oldpassword",
  "new_password": "NewStr0ng!Pass",
  "revoke_other_sessions": true
}
```

**Response** (200):
```json
{
  "message": "Password changed successfully",
  "sessions_revoked": 3
}
```

**Errors**:
- 400: Validation failed (password too short, recently used, policy violation)
- 401: Invalid current password
- 403: Password was recently changed (min age policy)

# API Contract: Sessions

## BFF Proxy Endpoints

### GET /api/sessions
**Backend**: `GET /users/me/sessions`

**Response** (200):
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "device_name": "Chrome on macOS",
      "device_type": "desktop",
      "browser": "Chrome",
      "os": "macOS",
      "ip_address": "192.168.1.100",
      "is_current": true,
      "created_at": "2026-02-10T08:00:00Z",
      "last_activity_at": "2026-02-11T06:00:00Z"
    },
    {
      "id": "session-uuid-2",
      "device_name": "Safari on iPhone",
      "device_type": "mobile",
      "browser": "Safari",
      "os": "iOS",
      "ip_address": "10.0.0.50",
      "is_current": false,
      "created_at": "2026-02-09T12:00:00Z",
      "last_activity_at": "2026-02-10T22:00:00Z"
    }
  ],
  "total": 2
}
```

### DELETE /api/sessions/[id]
**Backend**: `DELETE /users/me/sessions/{id}`

**Response**: 204 No Content

**Errors**: 401 (unauthorized), 404 (not found), 409 (cannot revoke current session)

### DELETE /api/sessions (bulk)
**Backend**: `DELETE /users/me/sessions`

**Response** (200):
```json
{
  "revoked_count": 3,
  "message": "3 session(s) revoked"
}
```

**Errors**: 401 (unauthorized)

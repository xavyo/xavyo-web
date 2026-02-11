# API Contract: Security Overview

## BFF Proxy Endpoint

### GET /api/me/security
**Backend**: `GET /me/security`

**Response** (200):
```json
{
  "mfa_enabled": true,
  "mfa_methods": ["totp"],
  "trusted_devices_count": 2,
  "active_sessions_count": 3,
  "last_password_change": "2026-01-15T10:00:00Z",
  "recent_security_alerts_count": 0,
  "password_expires_at": null
}
```

**Errors**: 401 (unauthorized)

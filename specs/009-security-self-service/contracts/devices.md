# API Contract: Devices

## BFF Proxy Endpoints

### GET /api/devices
**Backend**: `GET /devices`

**Response** (200):
```json
{
  "items": [
    {
      "id": "device-uuid",
      "device_fingerprint": "a1b2c3d4",
      "device_name": "Work Laptop",
      "device_type": "desktop",
      "browser": "Chrome",
      "browser_version": "120.0",
      "os": "macOS",
      "os_version": "14.2",
      "is_trusted": true,
      "trust_expires_at": "2026-03-11T00:00:00Z",
      "first_seen_at": "2026-01-01T00:00:00Z",
      "last_seen_at": "2026-02-11T06:00:00Z",
      "login_count": 42,
      "is_current": true
    }
  ],
  "total": 1
}
```

### PUT /api/devices/[id]
**Backend**: `PUT /devices/{id}`

**Request**:
```json
{
  "device_name": "Personal MacBook"
}
```

**Response** (200):
```json
{
  "id": "device-uuid",
  "device_name": "Personal MacBook"
}
```

**Errors**: 400 (validation), 401, 404

### DELETE /api/devices/[id]
**Backend**: `DELETE /devices/{id}`

**Response**: 204 No Content

**Errors**: 401, 404

### POST /api/devices/[id]/trust
**Backend**: `POST /devices/{id}/trust`

**Request**:
```json
{
  "trust_duration_days": 30
}
```

**Response** (200):
```json
{
  "id": "device-uuid",
  "is_trusted": true,
  "trust_expires_at": "2026-03-13T00:00:00Z"
}
```

**Errors**: 401, 403 (policy disallows), 404

### DELETE /api/devices/[id]/trust
**Backend**: `DELETE /devices/{id}/trust`

**Response** (200):
```json
{
  "id": "device-uuid",
  "is_trusted": false,
  "trust_expires_at": null
}
```

**Errors**: 401, 404

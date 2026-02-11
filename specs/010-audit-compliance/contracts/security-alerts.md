# Contract: Security Alerts

## GET /security-alerts

**Purpose**: Retrieve the current user's security alerts
**Auth**: Required (user-scoped, JWT from HttpOnly cookie)
**BFF Proxy**: `GET /api/alerts`

### Request

Query parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| cursor | DateTime (ISO 8601) | No | null | Pagination cursor (created_at of last item) |
| limit | integer | No | 20 | Items per page (1-100) |
| type | string | No | null | Filter: "new_device", "new_location", "failed_attempts", "password_change", "mfa_disabled" |
| severity | string | No | null | Filter: "info", "warning", "critical" |
| acknowledged | boolean | No | null | Filter: true=acknowledged, false=unacknowledged, null=all |

### Response (200 OK)

```json
{
  "items": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "alert_type": "new_device",
      "severity": "warning",
      "title": "Login from new device",
      "message": "A login was detected from a new device: Chrome on Windows",
      "metadata": {
        "device": "Chrome on Windows",
        "ip_address": "192.168.1.1",
        "location": "San Francisco, US"
      },
      "acknowledged_at": null,
      "created_at": "2026-02-11T10:30:00Z"
    }
  ],
  "total": 25,
  "unacknowledged_count": 3,
  "next_cursor": "2026-02-10T08:15:00Z"
}
```

### Error Responses

- 401 Unauthorized: Missing or invalid session

---

## POST /security-alerts/{id}/acknowledge

**Purpose**: Mark a security alert as acknowledged
**Auth**: Required (user can only acknowledge their own alerts)
**BFF Proxy**: `POST /api/alerts/{id}/acknowledge`

### Request

Path parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Alert ID to acknowledge |

Request body: None (empty POST)

### Response (200 OK)

Returns the updated alert:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "alert_type": "new_device",
  "severity": "warning",
  "title": "Login from new device",
  "message": "A login was detected from a new device: Chrome on Windows",
  "metadata": { ... },
  "acknowledged_at": "2026-02-11T11:00:00Z",
  "created_at": "2026-02-11T10:30:00Z"
}
```

### Error Responses

- 401 Unauthorized: Missing or invalid session
- 404 Not Found: Alert does not exist or does not belong to user
- 409 Conflict: Alert already acknowledged

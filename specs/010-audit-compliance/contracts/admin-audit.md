# Contract: Admin Audit

## GET /admin/audit/login-attempts

**Purpose**: Retrieve tenant-wide login attempts (admin only)
**Auth**: Required (admin role, JWT from HttpOnly cookie)
**BFF Proxy**: `GET /api/audit/admin/login-attempts`

### Request

Query parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| cursor | DateTime (ISO 8601) | No | null | Pagination cursor (created_at of last item) |
| limit | integer | No | 20 | Items per page (1-100) |
| user_id | UUID | No | null | Filter: specific user |
| email | string | No | null | Filter: email (partial match) |
| start_date | DateTime (ISO 8601) | No | null | Filter: start of date range |
| end_date | DateTime (ISO 8601) | No | null | Filter: end of date range |
| success | boolean | No | null | Filter: true=successful, false=failed, null=all |
| auth_method | string | No | null | Filter: "password", "social", "sso", "mfa", "refresh" |

### Response (200 OK)

```json
{
  "items": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "email": "user@example.com",
      "success": true,
      "failure_reason": null,
      "auth_method": "password",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0 ...",
      "device_fingerprint": "abc123",
      "geo_country": "US",
      "geo_city": "San Francisco",
      "is_new_device": false,
      "is_new_location": false,
      "created_at": "2026-02-11T10:30:00Z"
    }
  ],
  "total": 500,
  "next_cursor": "2026-02-10T08:15:00Z"
}
```

### Error Responses

- 401 Unauthorized: Missing or invalid session
- 403 Forbidden: User is not an admin

---

## GET /admin/audit/login-attempts/stats

**Purpose**: Retrieve aggregated login statistics for a date range (admin only)
**Auth**: Required (admin role, JWT from HttpOnly cookie)
**BFF Proxy**: `GET /api/audit/admin/stats`

### Request

Query parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| start_date | DateTime (ISO 8601) | **Yes** | — | Start of date range |
| end_date | DateTime (ISO 8601) | **Yes** | — | End of date range |

### Response (200 OK)

```json
{
  "total_attempts": 1250,
  "successful_attempts": 1100,
  "failed_attempts": 150,
  "success_rate": 88.0,
  "failure_reasons": [
    { "reason": "invalid_password", "count": 120 },
    { "reason": "account_locked", "count": 30 }
  ],
  "hourly_distribution": [
    { "hour": 0, "count": 15 },
    { "hour": 1, "count": 8 },
    { "hour": 9, "count": 145 },
    { "hour": 10, "count": 160 }
  ],
  "unique_users": 85,
  "new_device_logins": 12,
  "new_location_logins": 5
}
```

### Error Responses

- 400 Bad Request: Missing required start_date or end_date
- 401 Unauthorized: Missing or invalid session
- 403 Forbidden: User is not an admin

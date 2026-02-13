# Contract: Login History

## GET /audit/login-history

**Purpose**: Retrieve the current user's login history
**Auth**: Required (user-scoped, JWT from HttpOnly cookie)
**BFF Proxy**: `GET /api/audit/login-history`

### Request

Query parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| cursor | DateTime (ISO 8601) | No | null | Pagination cursor (created_at of last item) |
| limit | integer | No | 20 | Items per page (1-100) |
| start_date | DateTime (ISO 8601) | No | null | Filter: start of date range |
| end_date | DateTime (ISO 8601) | No | null | Filter: end of date range |
| success | boolean | No | null | Filter: true=successful only, false=failed only, null=all |

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
  "total": 150,
  "next_cursor": "2026-02-10T08:15:00Z"
}
```

### Error Responses

- 401 Unauthorized: Missing or invalid session

# Webhooks API Contract

## BFF Proxy Endpoints

All webhook BFF proxies live under `src/routes/api/admin/webhooks/` and forward to the xavyo-idp backend at `/webhooks/`.

---

### GET /api/admin/webhooks/event-types

List available event types for subscription configuration.

**Backend**: `GET /webhooks/event-types`

**Response** (200):
```json
{
  "event_types": [
    {
      "event_type": "user.created",
      "category": "user",
      "description": "Fired when a new user is created"
    }
  ]
}
```

---

### GET /api/admin/webhooks/subscriptions

List webhook subscriptions with pagination.

**Backend**: `GET /webhooks/subscriptions?limit=20&offset=0`

**Query Parameters**:
- `limit` (integer, optional, default 20)
- `offset` (integer, optional, default 0)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "name": "My Webhook",
      "description": "Sends user events",
      "url": "https://example.com/webhook",
      "event_types": ["user.created", "user.updated"],
      "enabled": true,
      "consecutive_failures": 0,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

### POST /api/admin/webhooks/subscriptions

Create a new webhook subscription.

**Backend**: `POST /webhooks/subscriptions`

**Request**:
```json
{
  "name": "User Events Hook",
  "description": "Receives user lifecycle events",
  "url": "https://example.com/webhook",
  "secret": "optional-hmac-secret",
  "event_types": ["user.created", "user.updated", "user.deleted"]
}
```

**Response** (201): `WebhookSubscriptionResponse`

---

### GET /api/admin/webhooks/subscriptions/[id]

Get subscription detail.

**Backend**: `GET /webhooks/subscriptions/:id`

**Response** (200): `WebhookSubscriptionResponse`

---

### PATCH /api/admin/webhooks/subscriptions/[id]

Update subscription configuration. All fields optional.

**Backend**: `PATCH /webhooks/subscriptions/:id`

**Request** (partial):
```json
{
  "name": "Updated Name",
  "url": "https://new-url.com/webhook",
  "event_types": ["user.created"],
  "enabled": false,
  "secret": "new-secret"
}
```

**Response** (200): `WebhookSubscriptionResponse`

---

### DELETE /api/admin/webhooks/subscriptions/[id]

Delete a webhook subscription permanently.

**Backend**: `DELETE /webhooks/subscriptions/:id`

**Response** (204): No content

---

### GET /api/admin/webhooks/subscriptions/[id]/deliveries

List delivery history for a subscription.

**Backend**: `GET /webhooks/subscriptions/:id/deliveries?limit=20&offset=0`

**Query Parameters**:
- `limit` (integer, optional, default 20)
- `offset` (integer, optional, default 0)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "subscription_id": "uuid",
      "event_id": "uuid",
      "event_type": "user.created",
      "status": "success",
      "attempt_number": 1,
      "response_code": 200,
      "latency_ms": 150,
      "error_message": null,
      "created_at": "2026-01-15T10:00:00Z",
      "completed_at": "2026-01-15T10:00:01Z"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

---

### GET /api/admin/webhooks/dlq

List dead letter queue entries.

**Backend**: `GET /webhooks/dlq?limit=20&offset=0`

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "subscription_id": "uuid",
      "event_id": "uuid",
      "event_type": "user.created",
      "payload": {},
      "error_message": "Connection refused",
      "original_failure_at": "2026-01-15T10:00:00Z",
      "retry_count": 3,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### POST /api/admin/webhooks/dlq/[entryId]/retry

Replay a single DLQ entry.

**Backend**: `POST /webhooks/dlq/:id/replay`

**Request**: Empty body

**Response** (200): Replayed delivery result

---

### DELETE /api/admin/webhooks/dlq/[entryId]

Delete a DLQ entry permanently.

**Backend**: `DELETE /webhooks/dlq/:id`

**Response** (204): No content

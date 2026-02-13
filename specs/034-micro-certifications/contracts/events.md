# API Contract: Micro Certification Events

## GET /governance/micro-certifications/{id}/events

Get events for a specific certification.

**Response 200**:
```json
{
  "items": [CertificationEvent],
  "total": 5
}
```

**CertificationEvent**:
```json
{
  "id": "uuid",
  "certification_id": "uuid",
  "event_type": "created | decided | delegated | skipped | escalated | expired",
  "actor_id": "uuid | null",
  "details": { "decision": "certify", "comment": "Approved" },
  "created_at": "2026-02-13T10:00:00Z"
}
```

**Auth**: Admin or assigned reviewer

## GET /governance/micro-cert-events

Search all certification events globally.

**Query Parameters**:
- `event_type` (string, optional): Filter by event type
- `actor_id` (UUID, optional): Filter by actor
- `certification_id` (UUID, optional): Filter by certification
- `from_date` (string, optional): Start date filter
- `to_date` (string, optional): End date filter
- `limit` (integer, optional, default: 20)
- `offset` (integer, optional, default: 0)

**Response 200**:
```json
{
  "items": [CertificationEvent],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

**Auth**: Admin only

# API Contract: Duplicate Candidates

Base path: `/governance/duplicates`

## GET /governance/duplicates

List duplicate candidates with optional filters.

**Query Parameters**:
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| status | string | - | Filter: pending, merged, dismissed |
| min_confidence | number | - | Minimum confidence (0-100) |
| max_confidence | number | - | Maximum confidence (0-100) |
| identity_id | UUID | - | Filter by identity involved |
| limit | number | 50 | Max 100 |
| offset | number | 0 | |

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "identity_a_id": "uuid",
      "identity_b_id": "uuid",
      "confidence_score": 85.50,
      "status": "pending",
      "detected_at": "2026-02-12T10:00:00Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

## GET /governance/duplicates/{id}

Get duplicate detail with identity summaries and attribute comparison.

**Response 200**:
```json
{
  "id": "uuid",
  "identity_a_id": "uuid",
  "identity_b_id": "uuid",
  "confidence_score": 85.50,
  "identity_a": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "display_name": "John Doe",
    "department": "Engineering",
    "attributes": {}
  },
  "identity_b": {
    "id": "uuid",
    "email": "j.doe@example.com",
    "display_name": "J. Doe",
    "department": "Engineering",
    "attributes": {}
  },
  "attribute_comparison": [
    {
      "attribute": "email",
      "value_a": "john.doe@example.com",
      "value_b": "j.doe@example.com",
      "is_different": true
    },
    {
      "attribute": "department",
      "value_a": "Engineering",
      "value_b": "Engineering",
      "is_different": false
    }
  ],
  "rule_matches": [
    {
      "rule_id": "uuid",
      "rule_name": "Email similarity",
      "attribute": "email",
      "similarity": 0.82,
      "weighted_score": 41.0
    }
  ]
}
```

## POST /governance/duplicates/{id}/dismiss

Dismiss a duplicate pair as a false positive.

**Request**:
```json
{
  "reason": "Different people with similar names"
}
```

**Response 200**: Updated DuplicateCandidate with status "dismissed"

## POST /governance/duplicates/detect

Trigger a manual duplicate detection scan.

**Request**:
```json
{
  "min_confidence": 70.0
}
```

**Response 200**:
```json
{
  "scan_id": "uuid",
  "users_processed": 500,
  "duplicates_found": 12,
  "new_duplicates": 8,
  "duration_ms": 2340
}
```

# API Contract: Merge Operations

Base path: `/governance/merges`

## GET /governance/merges

List merge operations.

**Query Parameters**:
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| limit | number | 50 | Max 100 |
| offset | number | 0 | |

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "source_identity_id": "uuid",
      "target_identity_id": "uuid",
      "status": "completed",
      "entitlement_strategy": "union",
      "operator_id": "uuid",
      "started_at": "2026-02-12T10:00:00Z",
      "completed_at": "2026-02-12T10:00:05Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

## POST /governance/merges/preview

Preview merge result before executing.

**Request**:
```json
{
  "source_identity_id": "uuid",
  "target_identity_id": "uuid",
  "entitlement_strategy": "union",
  "attribute_selections": {
    "email": { "source": "target" },
    "display_name": { "source": "source" }
  }
}
```

**Response 200**:
```json
{
  "source_identity": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "display_name": "John Doe",
    "department": "Engineering",
    "attributes": {}
  },
  "target_identity": {
    "id": "uuid",
    "email": "j.doe@example.com",
    "display_name": "J. Doe",
    "department": "Engineering",
    "attributes": {}
  },
  "merged_preview": {
    "id": "uuid",
    "email": "j.doe@example.com",
    "display_name": "John Doe",
    "department": "Engineering",
    "attributes": {}
  },
  "entitlements_preview": {
    "source_only": [{ "id": "uuid", "name": "Admin Access", "application": "App A" }],
    "target_only": [{ "id": "uuid", "name": "Read Only", "application": "App B" }],
    "common": [{ "id": "uuid", "name": "Basic Access", "application": "App A" }],
    "merged": [
      { "id": "uuid", "name": "Admin Access", "application": "App A" },
      { "id": "uuid", "name": "Read Only", "application": "App B" },
      { "id": "uuid", "name": "Basic Access", "application": "App A" }
    ]
  },
  "sod_check": {
    "has_violations": false,
    "can_override": true,
    "violations": []
  }
}
```

## POST /governance/merges/execute

Execute a merge operation.

**Request**:
```json
{
  "source_identity_id": "uuid",
  "target_identity_id": "uuid",
  "entitlement_strategy": "union",
  "attribute_selections": {
    "email": { "source": "target" }
  },
  "entitlement_selections": null,
  "sod_override_reason": null
}
```

**Response 200**:
```json
{
  "id": "uuid",
  "source_identity_id": "uuid",
  "target_identity_id": "uuid",
  "status": "completed",
  "entitlement_strategy": "union",
  "operator_id": "uuid",
  "started_at": "2026-02-12T10:00:00Z",
  "completed_at": "2026-02-12T10:00:05Z"
}
```

**Error 409** (merge already in progress):
```json
{
  "error": "merge_in_progress",
  "message": "A merge is already in progress for this identity",
  "pending_operation_id": "uuid"
}
```

**Error 400** (SoD violations without override):
```json
{
  "error": "sod_violations",
  "message": "Merge would create SoD violations",
  "violations": [
    {
      "rule_id": "uuid",
      "rule_name": "Segregation of admin and approver",
      "severity": "high",
      "entitlement_being_added": "uuid",
      "conflicting_entitlement_id": "uuid",
      "has_exemption": false
    }
  ]
}
```

## GET /governance/merges/{id}

Get merge operation detail.

**Response 200**: MergeOperation object (same as list item)

## POST /governance/merges/batch

Execute batch merge.

**Request**:
```json
{
  "candidate_ids": ["uuid1", "uuid2", "uuid3"],
  "entitlement_strategy": "union",
  "attribute_rule": "newest_wins",
  "min_confidence": null,
  "skip_sod_violations": false
}
```

**Response 200**:
```json
{
  "job_id": "uuid",
  "status": "completed",
  "total_pairs": 3,
  "processed": 3,
  "successful": 2,
  "failed": 0,
  "skipped": 1
}
```

## POST /governance/merges/batch/preview

Preview batch merge.

**Request**:
```json
{
  "candidate_ids": ["uuid1", "uuid2"],
  "min_confidence": null,
  "entitlement_strategy": "union",
  "attribute_rule": "newest_wins",
  "limit": 50,
  "offset": 0
}
```

**Response 200**:
```json
{
  "total_candidates": 2,
  "candidates": [
    {
      "candidate_id": "uuid",
      "source_identity_id": "uuid",
      "target_identity_id": "uuid",
      "confidence_score": 92.5
    }
  ],
  "entitlement_strategy": "union",
  "attribute_rule": "newest_wins"
}
```

## GET /governance/merges/audit

List merge audit entries.

**Query Parameters**:
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| identity_id | UUID | - | Filter by identity involved |
| operator_id | UUID | - | Filter by operator |
| from_date | datetime | - | Start of date range |
| to_date | datetime | - | End of date range |
| limit | number | 50 | Max 100 |
| offset | number | 0 | |

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "operation_id": "uuid",
      "source_identity_id": "uuid",
      "target_identity_id": "uuid",
      "operator_id": "uuid",
      "created_at": "2026-02-12T10:00:05Z"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

## GET /governance/merges/audit/{id}

Get full merge audit detail with snapshots.

**Response 200**:
```json
{
  "id": "uuid",
  "operation_id": "uuid",
  "source_snapshot": { "id": "uuid", "email": "...", "display_name": "...", "attributes": {}, "entitlements": [] },
  "target_snapshot": { "id": "uuid", "email": "...", "display_name": "...", "attributes": {}, "entitlements": [] },
  "merged_snapshot": { "id": "uuid", "email": "...", "display_name": "...", "attributes": {}, "entitlements": [] },
  "attribute_decisions": [
    { "attribute": "email", "source": "target", "selected_value": "j.doe@example.com", "source_value": "john.doe@example.com", "target_value": "j.doe@example.com" }
  ],
  "entitlement_decisions": {
    "strategy": "union",
    "source_entitlements": [],
    "target_entitlements": [],
    "merged_entitlements": [],
    "excluded_entitlements": []
  },
  "sod_violations": null,
  "created_at": "2026-02-12T10:00:05Z"
}
```

# API Contract: Access Patterns

## 1. List Patterns

```
GET /governance/role-mining/jobs/{job_id}/patterns
```

### Path Parameters

| Parameter | Type | Notes            |
|-----------|------|------------------|
| job_id    | UUID | Parent mining job |

### Query Parameters

| Parameter     | Type   | Default | Notes                                       |
|---------------|--------|---------|---------------------------------------------|
| limit         | number | 50      | Max 100                                     |
| offset        | number | 0       |                                              |
| min_frequency | number | —       | Filter patterns with frequency >= this value |

### Response — 200 OK

```json
{
  "items": [AccessPattern],
  "total": 28,
  "page": 1,
  "page_size": 50
}
```

#### AccessPattern Fields

| Field           | Type     | Notes                           |
|-----------------|----------|---------------------------------|
| id              | UUID     | Primary key                     |
| job_id          | UUID     | FK to MiningJob                 |
| entitlement_ids | UUID[]   | Co-occurring entitlements       |
| frequency       | number   | How often this pattern appears  |
| user_count      | number   | Users with this pattern         |
| sample_user_ids | UUID[]   | Sample of matching users        |
| created_at      | datetime | Auto-set                        |

### Status Codes

| Code | Condition         |
|------|-------------------|
| 200  | Success           |
| 401  | Not authenticated |
| 403  | Not admin         |
| 404  | Job not found     |

---

## 2. Get Pattern

```
GET /governance/role-mining/patterns/{pattern_id}
```

### Path Parameters

| Parameter  | Type | Notes            |
|------------|------|------------------|
| pattern_id | UUID | Pattern to fetch |

### Response — 200 OK

Returns a single `AccessPattern` object (same shape as list items above).

### Status Codes

| Code | Condition           |
|------|---------------------|
| 200  | Success             |
| 401  | Not authenticated   |
| 403  | Not admin           |
| 404  | Pattern not found   |

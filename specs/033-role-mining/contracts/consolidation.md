# API Contract: Consolidation Suggestions

## 1. List Consolidation Suggestions

```
GET /governance/role-mining/jobs/{job_id}/consolidation-suggestions
```

### Path Parameters

| Parameter | Type | Notes            |
|-----------|------|------------------|
| job_id    | UUID | Parent mining job |

### Query Parameters

| Parameter | Type   | Default | Notes                                                                |
|-----------|--------|---------|----------------------------------------------------------------------|
| limit     | number | 50      | Max 100                                                              |
| offset    | number | 0       |                                                                      |
| status    | string | —       | Filter by ConsolidationStatus: `pending`, `merged`, `dismissed`      |

### Response — 200 OK

```json
{
  "items": [ConsolidationSuggestion],
  "total": 4,
  "page": 1,
  "page_size": 50
}
```

#### ConsolidationSuggestion Fields

| Field               | Type                | Notes                          |
|---------------------|---------------------|--------------------------------|
| id                  | UUID                | Primary key                    |
| job_id              | UUID                | FK to MiningJob                |
| role_a_id           | UUID                | First overlapping role         |
| role_b_id           | UUID                | Second overlapping role        |
| overlap_percent     | number              | 0-100                          |
| shared_entitlements | UUID[]              | Entitlements in both roles     |
| unique_to_a         | UUID[]              | Entitlements only in role A    |
| unique_to_b         | UUID[]              | Entitlements only in role B    |
| status              | ConsolidationStatus | See enum below                 |
| dismissed_reason    | string?             | Reason for dismissal           |
| created_at          | datetime            | Auto-set                       |

### Status Codes

| Code | Condition         |
|------|-------------------|
| 200  | Success           |
| 401  | Not authenticated |
| 403  | Not admin         |
| 404  | Job not found     |

---

## 2. Get Consolidation Suggestion

```
GET /governance/role-mining/consolidation-suggestions/{suggestion_id}
```

### Path Parameters

| Parameter     | Type | Notes                |
|---------------|------|----------------------|
| suggestion_id | UUID | Suggestion to fetch  |

### Response — 200 OK

Returns a single `ConsolidationSuggestion` object (same shape as list items above).

### Status Codes

| Code | Condition              |
|------|------------------------|
| 200  | Success                |
| 401  | Not authenticated      |
| 403  | Not admin              |
| 404  | Suggestion not found   |

---

## 3. Dismiss Consolidation Suggestion

```
POST /governance/role-mining/consolidation-suggestions/{suggestion_id}/dismiss
```

Marks the consolidation suggestion as dismissed, indicating the admin has reviewed it and decided not to merge the overlapping roles.

### Path Parameters

| Parameter     | Type | Notes                 |
|---------------|------|-----------------------|
| suggestion_id | UUID | Suggestion to dismiss |

### Request Body

| Field  | Type   | Required | Notes                   |
|--------|--------|----------|-------------------------|
| reason | string | No       | Reason for dismissal    |

### Response — 200 OK

Returns the updated `ConsolidationSuggestion` object with:
- `status: "dismissed"`
- `dismissed_reason` set if provided

### Status Codes

| Code | Condition                                                      |
|------|----------------------------------------------------------------|
| 200  | Dismissed successfully                                         |
| 401  | Not authenticated                                              |
| 403  | Not admin                                                      |
| 404  | Suggestion not found                                           |
| 409  | Suggestion is not in `pending` status (already merged/dismissed) |

---

## Enums

### ConsolidationStatus

`pending` | `merged` | `dismissed`

### State Transitions

```
pending --> merged
        --> dismissed
```

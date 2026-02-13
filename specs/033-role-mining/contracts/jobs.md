# API Contract: Mining Jobs

## 1. List Mining Jobs

```
GET /governance/role-mining/jobs
```

### Query Parameters

| Parameter | Type   | Default | Notes                                                        |
|-----------|--------|---------|--------------------------------------------------------------|
| limit     | number | 50      | Max 100                                                      |
| offset    | number | 0       |                                                              |
| status    | string | —       | Filter by MiningJobStatus: `pending`, `running`, `completed`, `failed`, `cancelled` |

### Response — 200 OK

```json
{
  "items": [MiningJob],
  "total": 42,
  "page": 1,
  "page_size": 50
}
```

#### MiningJob Fields

| Field                          | Type                | Notes                          |
|--------------------------------|---------------------|--------------------------------|
| id                             | UUID                | Primary key                    |
| tenant_id                      | UUID                | Tenant scope                   |
| name                           | string              | User-provided                  |
| status                         | MiningJobStatus     | See enum below                 |
| parameters                     | MiningJobParameters | Nested object                  |
| progress_percent               | number              | 0-100                          |
| candidate_count                | number              | Result count                   |
| excessive_privilege_count      | number              | Result count                   |
| consolidation_suggestion_count | number              | Result count                   |
| started_at                     | datetime?           | Set when run starts            |
| completed_at                   | datetime?           | Set when job finishes          |
| error_message                  | string?             | Set on failure                 |
| created_by                     | UUID                | Admin who created              |
| created_at                     | datetime            | Auto-set                       |
| updated_at                     | datetime            | Auto-set                       |

#### MiningJobParameters Fields

| Field                        | Type    | Default | Notes                              |
|------------------------------|---------|--------:|------------------------------------|
| min_users                    | number  |       3 | Minimum users sharing a pattern    |
| min_entitlements             | number  |       2 | Minimum entitlements in a pattern  |
| confidence_threshold         | number  |     0.6 | 0.0-1.0, minimum confidence score  |
| include_excessive_privilege  | boolean |    true | Run excessive privilege analysis   |
| include_consolidation        | boolean |    true | Run consolidation analysis         |
| consolidation_threshold      | number  |    70.0 | Minimum overlap % for suggestions  |
| deviation_threshold          | number  |    50.0 | Deviation % for excessive privs    |
| peer_group_attribute         | string? |    null | Attribute for peer grouping        |

### Status Codes

| Code | Condition        |
|------|------------------|
| 200  | Success          |
| 401  | Not authenticated|
| 403  | Not admin        |

---

## 2. Get Mining Job

```
GET /governance/role-mining/jobs/{job_id}
```

### Path Parameters

| Parameter | Type | Notes       |
|-----------|------|-------------|
| job_id    | UUID | Job to fetch|

### Response — 200 OK

Returns a single `MiningJob` object (same shape as list items above).

### Status Codes

| Code | Condition              |
|------|------------------------|
| 200  | Success                |
| 401  | Not authenticated      |
| 403  | Not admin              |
| 404  | Job not found          |

---

## 3. Create Mining Job

```
POST /governance/role-mining/jobs
```

### Request Body

| Field      | Type                | Required | Notes                     |
|------------|---------------------|----------|---------------------------|
| name       | string              | Yes      | Job name                  |
| parameters | MiningJobParameters | No       | Defaults applied per field |

All `MiningJobParameters` fields are optional; server applies defaults listed above.

### Response — 201 Created

Returns the created `MiningJob` object with `status: "pending"`.

### Status Codes

| Code | Condition              |
|------|------------------------|
| 201  | Created                |
| 400  | Validation error       |
| 401  | Not authenticated      |
| 403  | Not admin              |

---

## 4. Run Mining Job

```
POST /governance/role-mining/jobs/{job_id}/run
```

### Path Parameters

| Parameter | Type | Notes      |
|-----------|------|------------|
| job_id    | UUID | Job to run |

### Request Body

None.

### Response — 200 OK

Returns the updated `MiningJob` object with `status: "running"` and `started_at` set.

### Status Codes

| Code | Condition                                    |
|------|----------------------------------------------|
| 200  | Job started                                  |
| 401  | Not authenticated                            |
| 403  | Not admin                                    |
| 404  | Job not found                                |
| 409  | Job is not in `pending` status (cannot run)  |

---

## 5. Cancel / Delete Mining Job

```
DELETE /governance/role-mining/jobs/{job_id}
```

### Path Parameters

| Parameter | Type | Notes                  |
|-----------|------|------------------------|
| job_id    | UUID | Job to cancel or delete|

If the job is `running`, the backend cancels it (transitions to `cancelled`).
If the job is in a terminal state (`completed`, `failed`, `cancelled`), the backend deletes it and all associated data (candidates, patterns, excessive privileges, consolidation suggestions).

### Response — 204 No Content

No body.

### Status Codes

| Code | Condition                                               |
|------|---------------------------------------------------------|
| 204  | Cancelled or deleted                                    |
| 401  | Not authenticated                                       |
| 403  | Not admin                                               |
| 404  | Job not found                                           |
| 409  | Job is in `pending` status and cannot be cancelled/deleted in this state |

---

## Enums

### MiningJobStatus

`pending` | `running` | `completed` | `failed` | `cancelled`

### State Transitions

```
pending  --> running --> completed
                    --> failed
         running --> cancelled
```

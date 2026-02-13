# API Contract: Excessive Privileges

## 1. List Excessive Privileges

```
GET /governance/role-mining/jobs/{job_id}/excessive-privileges
```

### Path Parameters

| Parameter | Type | Notes            |
|-----------|------|------------------|
| job_id    | UUID | Parent mining job |

### Query Parameters

| Parameter | Type   | Default | Notes                                                                              |
|-----------|--------|---------|------------------------------------------------------------------------------------|
| limit     | number | 50      | Max 100                                                                            |
| offset    | number | 0       |                                                                                    |
| status    | string | —       | Filter by PrivilegeFlagStatus: `pending`, `reviewed`, `remediated`, `accepted`     |

### Response — 200 OK

```json
{
  "items": [ExcessivePrivilege],
  "total": 7,
  "page": 1,
  "page_size": 50
}
```

#### ExcessivePrivilege Fields

| Field                | Type                 | Notes                                       |
|----------------------|----------------------|---------------------------------------------|
| id                   | UUID                 | Primary key (flag_id)                       |
| job_id               | UUID                 | FK to MiningJob                             |
| user_id              | UUID                 | Flagged user                                |
| peer_group_id        | UUID?                | Peer group used for comparison              |
| deviation_percent    | number               | How much user deviates from peers           |
| excess_entitlements  | UUID[]               | Entitlements flagged as excessive            |
| peer_average         | number               | Average entitlement count in peer group     |
| user_count           | number               | User's actual entitlement count             |
| status               | PrivilegeFlagStatus  | See enum below                              |
| notes                | string?              | Review notes                                |
| reviewed_by          | UUID?                | Reviewer admin                              |
| reviewed_at          | datetime?            | Review timestamp                            |
| created_at           | datetime             | Auto-set                                    |

### Status Codes

| Code | Condition         |
|------|-------------------|
| 200  | Success           |
| 401  | Not authenticated |
| 403  | Not admin         |
| 404  | Job not found     |

---

## 2. Get Excessive Privilege

```
GET /governance/role-mining/excessive-privileges/{flag_id}
```

### Path Parameters

| Parameter | Type | Notes          |
|-----------|------|----------------|
| flag_id   | UUID | Flag to fetch  |

### Response — 200 OK

Returns a single `ExcessivePrivilege` object (same shape as list items above).

### Status Codes

| Code | Condition           |
|------|---------------------|
| 200  | Success             |
| 401  | Not authenticated   |
| 403  | Not admin           |
| 404  | Flag not found      |

---

## 3. Review Excessive Privilege

```
POST /governance/role-mining/excessive-privileges/{flag_id}/review
```

Records an admin review decision on a flagged excessive privilege.

### Path Parameters

| Parameter | Type | Notes           |
|-----------|------|-----------------|
| flag_id   | UUID | Flag to review  |

### Request Body

| Field  | Type                  | Required | Notes                                      |
|--------|-----------------------|----------|--------------------------------------------|
| action | PrivilegeReviewAction | Yes      | `accept` or `remediate`                    |
| notes  | string                | No       | Review notes explaining the decision       |

### Response — 200 OK

Returns the updated `ExcessivePrivilege` object with:
- `status` set to `accepted` (if action was `accept`) or `remediated` (if action was `remediate`)
- `reviewed_by` set to the current admin's ID
- `reviewed_at` set to the current timestamp
- `notes` set if provided

### Status Codes

| Code | Condition                                                         |
|------|-------------------------------------------------------------------|
| 200  | Reviewed successfully                                             |
| 400  | Invalid action value                                              |
| 401  | Not authenticated                                                 |
| 403  | Not admin                                                         |
| 404  | Flag not found                                                    |
| 409  | Flag is not in `pending` status (already reviewed/remediated/accepted) |

---

## Enums

### PrivilegeFlagStatus

`pending` | `reviewed` | `remediated` | `accepted`

### PrivilegeReviewAction

`accept` | `remediate`

### State Transitions

```
pending --> accepted    (via action: "accept")
        --> remediated  (via action: "remediate")
```

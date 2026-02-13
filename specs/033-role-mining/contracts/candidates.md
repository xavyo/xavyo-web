# API Contract: Role Candidates

## 1. List Candidates

```
GET /governance/role-mining/jobs/{job_id}/candidates
```

### Path Parameters

| Parameter | Type | Notes              |
|-----------|------|--------------------|
| job_id    | UUID | Parent mining job   |

### Query Parameters

| Parameter        | Type   | Default | Notes                                                                  |
|------------------|--------|---------|------------------------------------------------------------------------|
| limit            | number | 50      | Max 100                                                                |
| offset           | number | 0       |                                                                        |
| promotion_status | string | —       | Filter by CandidatePromotionStatus: `pending`, `promoted`, `dismissed` |

### Response — 200 OK

```json
{
  "items": [RoleCandidate],
  "total": 15,
  "page": 1,
  "page_size": 50
}
```

#### RoleCandidate Fields

| Field            | Type                       | Notes                                    |
|------------------|----------------------------|------------------------------------------|
| id               | UUID                       | Primary key                              |
| job_id           | UUID                       | FK to MiningJob                          |
| proposed_name    | string                     | Auto-generated name                      |
| confidence_score | number                     | 0.0-1.0                                  |
| member_count     | number                     | Users matching pattern                   |
| entitlement_ids  | UUID[]                     | Entitlements in candidate                |
| user_ids         | UUID[]                     | Users matching                           |
| promotion_status | CandidatePromotionStatus   | See enum below                           |
| promoted_role_id | UUID?                      | FK to governance role (when promoted)    |
| dismissed_reason | string?                    | Reason for dismissal                     |
| created_at       | datetime                   | Auto-set                                 |

### Status Codes

| Code | Condition         |
|------|-------------------|
| 200  | Success           |
| 401  | Not authenticated |
| 403  | Not admin         |
| 404  | Job not found     |

---

## 2. Get Candidate

```
GET /governance/role-mining/candidates/{candidate_id}
```

### Path Parameters

| Parameter    | Type | Notes              |
|--------------|------|--------------------|
| candidate_id | UUID | Candidate to fetch |

### Response — 200 OK

Returns a single `RoleCandidate` object (same shape as list items above).

### Status Codes

| Code | Condition             |
|------|-----------------------|
| 200  | Success               |
| 401  | Not authenticated     |
| 403  | Not admin             |
| 404  | Candidate not found   |

---

## 3. Promote Candidate

```
POST /governance/role-mining/candidates/{candidate_id}/promote
```

Promotes the candidate to a real governance role. The backend creates the governance role from the candidate's entitlement definition.

### Path Parameters

| Parameter    | Type | Notes                |
|--------------|------|----------------------|
| candidate_id | UUID | Candidate to promote |

### Request Body

None. The backend uses the candidate's `proposed_name` and `entitlement_ids` to create the role.

### Response — 200 OK

Returns the updated `RoleCandidate` object with:
- `promotion_status: "promoted"`
- `promoted_role_id` set to the newly created governance role's ID

### Status Codes

| Code | Condition                                                  |
|------|------------------------------------------------------------|
| 200  | Promoted successfully                                      |
| 401  | Not authenticated                                          |
| 403  | Not admin                                                  |
| 404  | Candidate not found                                        |
| 409  | Candidate is not in `pending` status (already promoted/dismissed) |

---

## 4. Dismiss Candidate

```
POST /governance/role-mining/candidates/{candidate_id}/dismiss
```

Marks the candidate as dismissed so it is visually de-emphasized in the UI.

### Path Parameters

| Parameter    | Type | Notes                |
|--------------|------|----------------------|
| candidate_id | UUID | Candidate to dismiss |

### Request Body

| Field  | Type   | Required | Notes              |
|--------|--------|----------|--------------------|
| reason | string | No       | Reason for dismiss |

### Response — 200 OK

Returns the updated `RoleCandidate` object with:
- `promotion_status: "dismissed"`
- `dismissed_reason` set if provided

### Status Codes

| Code | Condition                                                  |
|------|------------------------------------------------------------|
| 200  | Dismissed successfully                                     |
| 401  | Not authenticated                                          |
| 403  | Not admin                                                  |
| 404  | Candidate not found                                        |
| 409  | Candidate is not in `pending` status (already promoted/dismissed) |

---

## Enums

### CandidatePromotionStatus

`pending` | `promoted` | `dismissed`

### State Transitions

```
pending --> promoted
        --> dismissed
```

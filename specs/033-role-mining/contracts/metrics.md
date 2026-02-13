# API Contract: Role Metrics

## 1. List Metrics

```
GET /governance/role-mining/metrics
```

### Query Parameters

| Parameter       | Type   | Default | Notes                                              |
|-----------------|--------|---------|-----------------------------------------------------|
| limit           | number | 50      | Max 100                                             |
| offset          | number | 0       |                                                      |
| trend_direction | string | —       | Filter by TrendDirection: `up`, `stable`, `down`    |

### Response — 200 OK

```json
{
  "items": [RoleMetrics],
  "total": 22,
  "page": 1,
  "page_size": 50
}
```

#### RoleMetrics Fields

| Field             | Type               | Notes                                        |
|-------------------|--------------------|----------------------------------------------|
| id                | UUID               | Primary key                                  |
| tenant_id         | UUID               | Tenant scope                                 |
| role_id           | UUID               | FK to governance role                        |
| utilization_rate  | number             | 0.0-1.0, how much of the role is used       |
| coverage_rate     | number             | 0.0-1.0, how well the role covers needs     |
| user_count        | number             | Total users with this role                   |
| active_user_count | number             | Users actively using role entitlements       |
| entitlement_usage | EntitlementUsage[] | Per-entitlement usage stats                  |
| trend_direction   | TrendDirection     | See enum below                               |
| calculated_at     | datetime           | When metrics were last calculated            |

#### EntitlementUsage Fields

| Field          | Type   | Notes                           |
|----------------|--------|---------------------------------|
| entitlement_id | UUID   | FK to entitlement               |
| used_by_count  | number | Users using this entitlement    |
| total_users    | number | Users with this entitlement     |
| usage_rate     | number | used_by_count / total_users     |

### Status Codes

| Code | Condition         |
|------|-------------------|
| 200  | Success           |
| 401  | Not authenticated |
| 403  | Not admin         |

---

## 2. Get Role Metrics

```
GET /governance/role-mining/metrics/{role_id}
```

### Path Parameters

| Parameter | Type | Notes                        |
|-----------|------|------------------------------|
| role_id   | UUID | Governance role to get metrics for |

### Response — 200 OK

Returns a single `RoleMetrics` object (same shape as list items above).

### Status Codes

| Code | Condition                               |
|------|-----------------------------------------|
| 200  | Success                                 |
| 401  | Not authenticated                       |
| 403  | Not admin                               |
| 404  | Metrics not found for this role         |

---

## 3. Calculate Metrics

```
POST /governance/role-mining/metrics/calculate
```

Triggers a recalculation of role metrics for the tenant. This is an asynchronous operation; the backend recomputes utilization, coverage, and trend data for all roles.

### Request Body

| Field    | Type   | Required | Notes                                                      |
|----------|--------|----------|------------------------------------------------------------|
| role_ids | UUID[] | No       | Specific roles to recalculate. If omitted, all roles are recalculated. |

### Response — 200 OK

```json
{
  "roles_calculated": 22,
  "calculated_at": "2026-02-13T10:30:00Z"
}
```

| Field            | Type     | Notes                                    |
|------------------|----------|------------------------------------------|
| roles_calculated | number   | Number of roles whose metrics were updated |
| calculated_at    | datetime | Timestamp of the calculation             |

### Status Codes

| Code | Condition         |
|------|-------------------|
| 200  | Calculation complete |
| 401  | Not authenticated |
| 403  | Not admin         |

---

## Enums

### TrendDirection

`up` | `stable` | `down`

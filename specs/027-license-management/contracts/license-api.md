# API Contracts: License Management

**Feature**: 027-license-management
**Date**: 2026-02-12
**Base URL**: Backend `http://localhost:8080`, BFF proxy `/api/governance/licenses`

## Authentication

All endpoints require:
- `Authorization: Bearer <access_token>` header
- `X-Tenant-Id: <tenant_id>` header
- Admin role (checked by backend)

## Pagination Format

All list endpoints return: `{ items: T[], total: number, limit: number, offset: number }`
Default: limit=20 (max 100), offset=0

---

## License Pools

### List Pools
```
GET /governance/license-pools?vendor=&license_type=&status=&limit=20&offset=0
BFF: GET /api/governance/licenses/pools?vendor=&license_type=&status=&limit=20&offset=0

Response 200: { items: LicensePool[], total: number, limit: number, offset: number }
```

### Create Pool
```
POST /governance/license-pools
BFF: POST /api/governance/licenses/pools

Request: {
  name: string,           // 1-255 chars, required
  vendor: string,         // 1-255 chars, required
  description?: string,
  total_capacity: number, // >= 0, required
  cost_per_license?: number,
  currency: string,       // 3-char ISO, default "USD"
  billing_period: "Monthly" | "Annual" | "Perpetual",
  license_type: "Named" | "Concurrent",  // default Named
  expiration_date?: string,  // ISO 8601 datetime
  expiration_policy: "BlockNew" | "RevokeAll" | "WarnOnly",  // default BlockNew
  warning_days: number    // 1-365, default 60
}

Response 201: LicensePool
```

### Get Pool
```
GET /governance/license-pools/{id}
BFF: GET /api/governance/licenses/pools/{id}

Response 200: LicensePool
```

### Update Pool
```
PUT /governance/license-pools/{id}
BFF: PUT /api/governance/licenses/pools/{id}

Request: {
  name?: string,
  vendor?: string,
  description?: string,
  total_capacity?: number,
  cost_per_license?: number,
  currency?: string,
  billing_period?: "Monthly" | "Annual" | "Perpetual",
  expiration_date?: string,
  expiration_policy?: "BlockNew" | "RevokeAll" | "WarnOnly",
  warning_days?: number
}

Response 200: LicensePool
```

### Delete Pool
```
DELETE /governance/license-pools/{id}
BFF: DELETE /api/governance/licenses/pools/{id}

Response 204: (no content, only if no active assignments)
Error 409: { error: "Pool has active assignments" }
```

### Archive Pool
```
POST /governance/license-pools/{id}/archive
BFF: POST /api/governance/licenses/pools/{id}/archive

Response 200: LicensePool (status: "Archived")
```

---

## License Assignments

### List Assignments
```
GET /governance/license-assignments?license_pool_id=&user_id=&status=&source=&limit=20&offset=0
BFF: GET /api/governance/licenses/assignments?license_pool_id=&user_id=&status=&source=&limit=20&offset=0

Response 200: { items: LicenseAssignment[], total: number, limit: number, offset: number }
```

### Create Assignment
```
POST /governance/license-assignments
BFF: POST /api/governance/licenses/assignments

Request: {
  license_pool_id: string,  // UUID, required
  user_id: string,          // UUID, required
  source: "Manual" | "Automatic" | "Entitlement",  // default Manual
  notes?: string
}

Response 201: LicenseAssignment
Error 409: { error: "Pool at capacity" } or { error: "Incompatible license" }
```

### Get Assignment
```
GET /governance/license-assignments/{id}
BFF: GET /api/governance/licenses/assignments/{id}

Response 200: LicenseAssignment
```

### Deallocate Assignment
```
DELETE /governance/license-assignments/{id}
BFF: DELETE /api/governance/licenses/assignments/{id}

Response 204: (no content)
```

### Bulk Assign
```
POST /governance/license-assignments/bulk
BFF: POST /api/governance/licenses/assignments/bulk

Request: {
  license_pool_id: string,  // UUID, required
  user_ids: string[],       // 1-1000 UUIDs, required
  source: "Manual" | "Automatic" | "Entitlement"  // default Manual
}

Response 200: { success_count: number, failure_count: number, failures: [{ item_id: string, error: string }] }
```

### Bulk Reclaim
```
POST /governance/license-assignments/bulk-reclaim
BFF: POST /api/governance/licenses/assignments/bulk-reclaim

Request: {
  license_pool_id: string,  // UUID, required
  assignment_ids: string[], // 1-1000 UUIDs, required
  reason: string            // required, non-empty
}

Response 200: { success_count: number, failure_count: number, failures: [{ item_id: string, error: string }] }
```

---

## Reclamation Rules

### List Rules
```
GET /governance/license-reclamation-rules?license_pool_id=&trigger_type=&enabled=&limit=20&offset=0
BFF: GET /api/governance/licenses/reclamation-rules?license_pool_id=&trigger_type=&enabled=&limit=20&offset=0

Response 200: { items: ReclamationRule[], total: number, limit: number, offset: number }
```

### Create Rule
```
POST /governance/license-reclamation-rules
BFF: POST /api/governance/licenses/reclamation-rules

Request: {
  license_pool_id: string,    // UUID, required
  trigger_type: "Inactivity" | "LifecycleState",
  threshold_days?: number,    // >= 1, required if Inactivity
  lifecycle_state?: string,   // required if LifecycleState
  notification_days_before: number  // 0-365, default 7
}

Response 201: ReclamationRule
```

### Get Rule
```
GET /governance/license-reclamation-rules/{id}
BFF: GET /api/governance/licenses/reclamation-rules/{id}

Response 200: ReclamationRule
```

### Update Rule
```
PUT /governance/license-reclamation-rules/{id}
BFF: PUT /api/governance/licenses/reclamation-rules/{id}

Request: {
  threshold_days?: number,
  lifecycle_state?: string,
  notification_days_before?: number,
  enabled?: boolean
}

Response 200: ReclamationRule
```

### Delete Rule
```
DELETE /governance/license-reclamation-rules/{id}
BFF: DELETE /api/governance/licenses/reclamation-rules/{id}

Response 204: (no content)
```

---

## License Incompatibilities

### List Incompatibilities
```
GET /governance/license-incompatibilities?pool_id=&limit=20&offset=0
BFF: GET /api/governance/licenses/incompatibilities?pool_id=&limit=20&offset=0

Response 200: { items: LicenseIncompatibility[], total: number, limit: number, offset: number }
```

### Create Incompatibility
```
POST /governance/license-incompatibilities
BFF: POST /api/governance/licenses/incompatibilities

Request: {
  pool_a_id: string,  // UUID, required
  pool_b_id: string,  // UUID, required, != pool_a_id
  reason: string      // required, non-empty
}

Response 201: LicenseIncompatibility
```

### Get Incompatibility
```
GET /governance/license-incompatibilities/{id}
BFF: GET /api/governance/licenses/incompatibilities/{id}

Response 200: LicenseIncompatibility
```

### Delete Incompatibility
```
DELETE /governance/license-incompatibilities/{id}
BFF: DELETE /api/governance/licenses/incompatibilities/{id}

Response 204: (no content)
```

---

## License-Entitlement Links

### List Links
```
GET /governance/license-entitlement-links?license_pool_id=&entitlement_id=&enabled=&limit=20&offset=0
BFF: GET /api/governance/licenses/entitlement-links?license_pool_id=&entitlement_id=&enabled=&limit=20&offset=0

Response 200: { items: LicenseEntitlementLink[], total: number, limit: number, offset: number }
```

### Create Link
```
POST /governance/license-entitlement-links
BFF: POST /api/governance/licenses/entitlement-links

Request: {
  license_pool_id: string,  // UUID, required
  entitlement_id: string,   // UUID, required
  priority: number          // >= 0, default 0
}

Response 201: LicenseEntitlementLink
```

### Get Link
```
GET /governance/license-entitlement-links/{id}
BFF: GET /api/governance/licenses/entitlement-links/{id}

Response 200: LicenseEntitlementLink
```

### Delete Link
```
DELETE /governance/license-entitlement-links/{id}
BFF: DELETE /api/governance/licenses/entitlement-links/{id}

Response 204: (no content)
```

### Toggle Link Enabled
```
PUT /governance/license-entitlement-links/{id}/enabled
BFF: PUT /api/governance/licenses/entitlement-links/{id}/enabled

Request: { enabled: boolean }

Response 200: LicenseEntitlementLink
```

---

## Analytics

### Dashboard
```
GET /governance/license-analytics/dashboard
BFF: GET /api/governance/licenses/analytics/dashboard

Response 200: {
  summary: {
    total_pools: number,
    total_capacity: number,
    total_allocated: number,
    total_available: number,
    overall_utilization: number,
    total_monthly_cost: number,
    expiring_soon_count: number
  },
  pools: LicensePoolStats[],
  cost_by_vendor: VendorCost[],
  recent_events: LicenseAuditEntry[]
}
```

### Recommendations
```
GET /governance/license-analytics/recommendations
BFF: GET /api/governance/licenses/analytics/recommendations

Response 200: LicenseRecommendation[]
```

### Expiring Pools
```
GET /governance/license-analytics/expiring?within_days=90
BFF: GET /api/governance/licenses/analytics/expiring?within_days=90

Response 200: {
  pools: ExpiringPoolInfo[],
  total_expiring: number
}
```

---

## Reports

### Generate Compliance Report
```
POST /governance/license-reports/compliance
BFF: POST /api/governance/licenses/reports/compliance

Request (optional): {
  pool_ids?: string[],
  vendor?: string,
  from_date?: string,   // ISO 8601
  to_date?: string      // ISO 8601
}

Response 200: ComplianceReport
```

### Audit Trail
```
GET /governance/license-reports/audit-trail?pool_id=&user_id=&action=&from_date=&to_date=&limit=20&offset=0
BFF: GET /api/governance/licenses/reports/audit-trail?pool_id=&user_id=&action=&from_date=&to_date=&limit=20&offset=0

Response 200: { items: LicenseAuditEntry[], total: number, limit: number, offset: number }
```

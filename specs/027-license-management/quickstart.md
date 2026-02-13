# Quickstart: License Management

**Feature**: 027-license-management
**Date**: 2026-02-12

## Prerequisites

1. Backend (xavyo-idp) running on `http://localhost:8080` with migration 065 applied
2. Frontend (xavyo-web) dev server on `http://localhost:5173`
3. Admin user logged in with `admin` or `super_admin` role
4. At least one tenant created

## Quick Verification Steps

### 1. Verify Backend Endpoints Exist

```bash
# Check license pools endpoint (should return empty list, not 404)
curl -s -H "Authorization: Bearer $TOKEN" -H "X-Tenant-Id: $TENANT_ID" \
  http://localhost:8080/governance/license-pools | jq .

# Expected: { "items": [], "total": 0, "limit": 20, "offset": 0 }
```

### 2. Create a License Pool

```bash
curl -s -X POST http://localhost:8080/governance/license-pools \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Microsoft 365 E3",
    "vendor": "Microsoft",
    "total_capacity": 100,
    "cost_per_license": 36.00,
    "currency": "USD",
    "billing_period": "Monthly",
    "license_type": "Named",
    "expiration_policy": "BlockNew",
    "warning_days": 60
  }' | jq .
```

### 3. Assign a License

```bash
curl -s -X POST http://localhost:8080/governance/license-assignments \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Tenant-Id: $TENANT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "license_pool_id": "<pool_id>",
    "user_id": "<user_id>",
    "source": "Manual"
  }' | jq .
```

### 4. Check Analytics Dashboard

```bash
curl -s -H "Authorization: Bearer $TOKEN" -H "X-Tenant-Id: $TENANT_ID" \
  http://localhost:8080/governance/license-analytics/dashboard | jq .
```

## E2E Test Scenarios

### Scenario 1: Pool CRUD (P1)
1. Navigate to `/governance/licenses`
2. Click "Create Pool" → fill form → submit
3. Verify pool appears in Pools tab
4. Click pool → view detail page
5. Edit pool → verify changes saved
6. Archive pool → verify status badge changes
7. Create another pool → delete it

### Scenario 2: Assignment Flow (P2)
1. Create a pool with capacity 5
2. Navigate to Assignments tab → click "Assign License"
3. Select pool + user → submit
4. Verify assignment in list, pool utilization updates
5. Deallocate → verify pool capacity restored

### Scenario 3: Bulk Operations (P2)
1. Navigate to `/governance/licenses/assignments/bulk`
2. Select pool, enter 3 user IDs → bulk assign
3. Verify result summary (success/failure counts)
4. Select assignments → bulk reclaim with reason
5. Verify result summary

### Scenario 4: Analytics (P2)
1. Click Analytics tab
2. Verify summary cards display (total pools, utilization, cost)
3. Check per-pool stats table
4. Check vendor cost breakdown
5. View recommendations
6. View expiring pools

### Scenario 5: Reclamation Rules (P3)
1. Click Reclamation Rules tab → "Create Rule"
2. Select pool, choose Inactivity trigger, set 90 days threshold
3. Verify rule in list
4. Edit threshold → verify update
5. Delete rule

### Scenario 6: Incompatibilities (P3)
1. Click Incompatibilities tab → "Create Incompatibility"
2. Select two pools, provide reason
3. Verify rule in list
4. Try assigning both pools to same user → expect error

### Scenario 7: Compliance (P3)
1. Click Compliance tab
2. Generate compliance report (no filters)
3. View report data
4. Check audit trail → filter by action

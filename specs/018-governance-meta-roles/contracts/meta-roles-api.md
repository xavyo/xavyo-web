# API Contracts: Governance Meta-Roles

All endpoints prefixed with `/governance`. Require Bearer token + `X-Tenant-Id` header.

## CRUD

### GET /governance/meta-roles
List meta-roles with pagination and filtering.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | - | Filter: "active" or "disabled" |
| name | string | - | Partial name search |
| created_by | UUID | - | Filter by creator |
| limit | int | 50 | Max 100 |
| offset | int | 0 | Pagination offset |

**Response 200**:
```json
{
  "items": [MetaRoleResponse],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

### POST /governance/meta-roles
Create a new meta-role.

**Request Body**:
```json
{
  "name": "High Risk Policy",
  "description": "Auto-apply governance to high-risk entitlements",
  "priority": 10,
  "criteria_logic": "and",
  "criteria": [
    { "field": "risk_level", "operator": "eq", "value": "high" }
  ],
  "entitlements": [
    { "entitlement_id": "uuid", "permission_type": "grant" }
  ],
  "constraints": [
    { "constraint_type": "require_mfa", "constraint_value": { "enabled": true } }
  ]
}
```

**Response 201**: MetaRoleResponse

### GET /governance/meta-roles/{id}
Get meta-role with full details.

**Response 200**: MetaRoleWithDetailsResponse (includes criteria[], entitlements[], constraints[], stats)

### PUT /governance/meta-roles/{id}
Update meta-role details.

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "priority": 20,
  "criteria_logic": "or"
}
```

**Response 200**: MetaRoleResponse

### DELETE /governance/meta-roles/{id}
Delete a meta-role.

**Response 204**: No content

## Lifecycle

### POST /governance/meta-roles/{id}/enable
Enable a disabled meta-role.

**Response 200**: MetaRoleResponse (status: "active")

### POST /governance/meta-roles/{id}/disable
Disable an active meta-role.

**Response 200**: MetaRoleResponse (status: "disabled")

## Criteria

### POST /governance/meta-roles/{id}/criteria
Add a matching criterion.

**Request Body**:
```json
{
  "field": "risk_level",
  "operator": "eq",
  "value": "high"
}
```

**Response 201**: MetaRoleCriteriaResponse

### DELETE /governance/meta-roles/{id}/criteria/{criteria_id}
Remove a criterion.

**Response 204**: No content

## Entitlements

### POST /governance/meta-roles/{id}/entitlements
Add an entitlement mapping.

**Request Body**:
```json
{
  "entitlement_id": "uuid",
  "permission_type": "grant"
}
```

**Response 201**: MetaRoleEntitlementResponse

### DELETE /governance/meta-roles/{id}/entitlements/{entitlement_id}
Remove an entitlement mapping.

**Response 204**: No content

## Constraints

### POST /governance/meta-roles/{id}/constraints
Add a policy constraint.

**Request Body**:
```json
{
  "constraint_type": "require_mfa",
  "constraint_value": { "enabled": true }
}
```

**Response 201**: MetaRoleConstraintResponse

### DELETE /governance/meta-roles/{id}/constraints/{constraint_id}
Remove a constraint.

**Response 204**: No content

## Inheritances

### GET /governance/meta-roles/{id}/inheritances
List active inheritance relationships.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | - | Filter: active/suspended/removed |
| limit | int | 50 | Max 100 |
| offset | int | 0 | Pagination offset |

**Response 200**:
```json
{
  "items": [InheritanceResponse],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

## Re-evaluate

### POST /governance/meta-roles/{id}/reevaluate
Trigger re-evaluation of criteria against all roles.

**Response 200**: MetaRoleStats
```json
{
  "active_inheritances": 12,
  "unresolved_conflicts": 2,
  "criteria_count": 3,
  "entitlements_count": 5,
  "constraints_count": 2
}
```

## Simulate

### POST /governance/meta-roles/{id}/simulate
Simulate meta-role changes.

**Request Body**:
```json
{
  "simulation_type": "criteria_change",
  "criteria_changes": [
    { "field": "risk_level", "operator": "in", "value": ["high", "critical"] }
  ],
  "limit": 100
}
```

**Response 200**: SimulationResult

## Cascade

### POST /governance/meta-roles/{id}/cascade
Trigger cascade propagation.

**Request Body**:
```json
{
  "meta_role_id": "uuid",
  "dry_run": false
}
```

**Response 202**: CascadeStatus

## Conflicts

### GET /governance/meta-roles/conflicts
List conflicts across meta-roles.

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| affected_role_id | UUID | - | Filter by affected role |
| meta_role_id | UUID | - | Filter by involved meta-role |
| conflict_type | string | - | Filter: entitlement_conflict/constraint_conflict/policy_conflict |
| resolution_status | string | - | Filter: unresolved/resolved_priority/resolved_manual/ignored |
| limit | int | 50 | Max 100 |
| offset | int | 0 | Pagination offset |

**Response 200**:
```json
{
  "items": [ConflictResponse],
  "total": 3,
  "limit": 50,
  "offset": 0
}
```

### POST /governance/meta-roles/conflicts/{conflict_id}/resolve
Resolve a conflict.

**Request Body**:
```json
{
  "resolution_status": "resolved_manual",
  "resolution_choice": { "winning_meta_role_id": "uuid" },
  "comment": "Chose higher-priority policy"
}
```

**Response 200**: ConflictResponse (updated)

## Events

### GET /governance/meta-roles/events
List audit events (requires meta_role_id).

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| meta_role_id | UUID | REQUIRED | Filter by meta-role |
| event_type | string | - | Filter by event type |
| actor_id | UUID | - | Filter by actor |
| from_date | datetime | - | Date range start |
| to_date | datetime | - | Date range end |
| limit | int | 50 | Max 100 |
| offset | int | 0 | Pagination offset |

**Response 200**:
```json
{
  "items": [EventResponse],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

### GET /governance/meta-roles/events/stats
Get event statistics.

**Query Parameters**: Same as events list (meta_role_id REQUIRED).

**Response 200**: EventStats
```json
{
  "total": 100,
  "created": 5,
  "updated": 12,
  "deleted": 1,
  "disabled": 3,
  "enabled": 2,
  "inheritance_applied": 45,
  "inheritance_removed": 10,
  "conflict_detected": 8,
  "conflict_resolved": 6,
  "cascade_started": 4,
  "cascade_completed": 3,
  "cascade_failed": 1
}
```

## Response Types Reference

### MetaRoleResponse
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "name": "string",
  "description": "string | null",
  "priority": 10,
  "status": "active | disabled",
  "criteria_logic": "and | or",
  "created_by": "uuid",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

### MetaRoleWithDetailsResponse
Extends MetaRoleResponse with:
```json
{
  "criteria": [MetaRoleCriteriaResponse],
  "entitlements": [MetaRoleEntitlementResponse],
  "constraints": [MetaRoleConstraintResponse],
  "stats": {
    "active_inheritances": 12,
    "unresolved_conflicts": 2,
    "criteria_count": 3,
    "entitlements_count": 5,
    "constraints_count": 2
  }
}
```

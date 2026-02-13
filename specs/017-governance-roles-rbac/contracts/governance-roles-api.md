# API Contracts: Governance Roles & RBAC

**Feature**: 017-governance-roles-rbac
**Date**: 2026-02-11

All endpoints require `Authorization: Bearer {token}` and `X-Tenant-Id: {tenant_id}` headers.
Admin role required for all operations.

## Role CRUD

### GET /governance/roles
List governance roles with pagination.

**Query Parameters**: `limit` (int, default 50), `offset` (int, default 0)

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "parent_role_id": "uuid | null",
      "is_abstract": false,
      "hierarchy_depth": 0,
      "version": 1,
      "created_by": "uuid",
      "created_at": "ISO datetime",
      "updated_at": "ISO datetime"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### POST /governance/roles
Create a new governance role.

**Request Body**:
```json
{
  "name": "string (required)",
  "description": "string | null",
  "parent_id": "uuid | null"
}
```
Note: Field is `parent_id`, NOT `parent_role_id`.

**Response 201**: GovernanceRole object

### GET /governance/roles/{role_id}
Get a single role by ID.

**Response 200**: GovernanceRole object

### PUT /governance/roles/{role_id}
Update a governance role.

**Request Body**:
```json
{
  "name": "string",
  "description": "string | null",
  "is_abstract": false,
  "version": 1
}
```
Note: `version` is required for optimistic concurrency.

**Response 200**: Updated GovernanceRole object
**Response 409**: Version conflict

### DELETE /governance/roles/{role_id}
Delete a governance role.

**Response 204**: No content
**Response 400/409**: Role has children or other constraints

---

## Role Hierarchy

### GET /governance/roles/tree
Get the full role hierarchy as a tree structure.

**Response 200**:
```json
{
  "roots": [
    {
      "id": "uuid",
      "name": "string",
      "depth": 0,
      "is_abstract": false,
      "direct_entitlement_count": 0,
      "effective_entitlement_count": 0,
      "assigned_user_count": 0,
      "children": [/* recursive RoleTreeNode */]
    }
  ]
}
```

### GET /governance/roles/{role_id}/ancestors
Get ancestor roles (from immediate parent to root).

**Response 200**: `GovernanceRole[]` (raw array)

### GET /governance/roles/{role_id}/children
Get direct child roles.

**Response 200**: `GovernanceRole[]` (raw array)

### GET /governance/roles/{role_id}/descendants
Get all descendant roles (recursive).

**Response 200**: `GovernanceRole[]` (raw array)

### POST /governance/roles/{role_id}/move
Move a role to a new parent.

**Request Body**:
```json
{
  "parent_id": "uuid | null",
  "version": 1
}
```

**Response 200**:
```json
{
  "role": { /* GovernanceRole */ },
  "affected_roles_count": 1,
  "recomputed": true
}
```
**Response 409**: Version conflict

### GET /governance/roles/{role_id}/impact
Get impact analysis for a role.

**Response 200**:
```json
{
  "role_id": "uuid",
  "role_name": "string",
  "descendant_count": 0,
  "total_affected_users": 0,
  "descendants": []
}
```

---

## Role Entitlements

### GET /governance/roles/{role_id}/entitlements
List direct entitlements for a role.

**Response 200**: `RoleEntitlement[]` (raw array)
```json
[
  {
    "id": "uuid",
    "tenant_id": "uuid",
    "entitlement_id": "uuid",
    "role_name": "string",
    "created_at": "ISO datetime",
    "created_by": "uuid"
  }
]
```

### POST /governance/roles/{role_id}/entitlements
Add an entitlement to a role.

**Request Body**:
```json
{
  "entitlement_id": "uuid (required)",
  "role_name": "string (required)"
}
```

**Response 201**: RoleEntitlement object

### DELETE /governance/roles/{role_id}/entitlements/{entitlement_id}
Remove an entitlement from a role.

**Response 204**: No content

### GET /governance/roles/{role_id}/effective-entitlements
Get effective entitlements (direct + inherited).

**Response 200**:
```json
{
  "items": [],
  "direct_count": 0,
  "inherited_count": 0,
  "total": 0
}
```

### POST /governance/roles/{role_id}/effective-entitlements/recompute
Trigger recomputation of effective entitlements.

**Response 200**: Recompute result

---

## Role Parameters

### GET /governance/roles/{role_id}/parameters
List parameters for a role.

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "role_id": "uuid",
      "name": "string",
      "description": "string | null",
      "parameter_type": "string | integer | boolean | date | enum",
      "is_required": true,
      "default_value": "any | null",
      "constraints": { "allowed_values": ["a", "b"] },
      "display_name": "string | null",
      "display_order": 0,
      "created_at": "ISO datetime",
      "updated_at": "ISO datetime"
    }
  ],
  "total": 0
}
```

### POST /governance/roles/{role_id}/parameters
Add a parameter to a role.

**Request Body**:
```json
{
  "name": "string (required)",
  "parameter_type": "string | integer | boolean | date | enum (required)",
  "description": "string | null",
  "is_required": false,
  "default_value": "any | null",
  "constraints": "object | null",
  "display_name": "string | null",
  "display_order": 0
}
```

**Response 201**: RoleParameter object

### GET /governance/roles/{role_id}/parameters/{parameter_id}
Get a specific parameter.

**Response 200**: RoleParameter object

### PUT /governance/roles/{role_id}/parameters/{parameter_id}
Update a parameter.

**Request Body**:
```json
{
  "description": "string | null",
  "is_required": true,
  "default_value": "any | null",
  "constraints": "object | null",
  "display_name": "string | null",
  "display_order": 0
}
```

**Response 200**: Updated RoleParameter object

### DELETE /governance/roles/{role_id}/parameters/{parameter_id}
Delete a parameter.

**Response 204**: No content

### POST /governance/roles/{role_id}/parameters/validate
Validate parameter values.

**Request Body**:
```json
{
  "parameters": [
    { "name": "string", "value": "any" }
  ]
}
```

**Response 200**:
```json
{
  "is_valid": true,
  "results": [],
  "errors": []
}
```

---

## Inheritance Blocks

### GET /governance/roles/{role_id}/inheritance-blocks
List inheritance blocks for a role.

**Response 200**: `InheritanceBlock[]` (raw array)

### POST /governance/roles/{role_id}/inheritance-blocks
Add an inheritance block.

**Request Body**:
```json
{
  "blocked_role_id": "uuid (required)",
  "reason": "string (required)"
}
```

**Response 201**: InheritanceBlock object

### DELETE /governance/roles/{role_id}/inheritance-blocks/{block_id}
Remove an inheritance block.

**Response 204**: No content

---

## BFF Proxy Mapping

| Frontend Route | Backend Endpoint |
|----------------|-----------------|
| GET/POST /api/governance/roles | GET/POST /governance/roles |
| GET/PUT/DELETE /api/governance/roles/[id] | GET/PUT/DELETE /governance/roles/{role_id} |
| GET /api/governance/roles/tree | GET /governance/roles/tree |
| GET /api/governance/roles/[id]/ancestors | GET /governance/roles/{role_id}/ancestors |
| GET /api/governance/roles/[id]/children | GET /governance/roles/{role_id}/children |
| GET /api/governance/roles/[id]/descendants | GET /governance/roles/{role_id}/descendants |
| POST /api/governance/roles/[id]/move | POST /governance/roles/{role_id}/move |
| GET /api/governance/roles/[id]/impact | GET /governance/roles/{role_id}/impact |
| GET/POST /api/governance/roles/[id]/entitlements | GET/POST /governance/roles/{role_id}/entitlements |
| DELETE /api/governance/roles/[id]/entitlements/[eid] | DELETE /governance/roles/{role_id}/entitlements/{eid} |
| GET /api/governance/roles/[id]/effective-entitlements | GET /governance/roles/{role_id}/effective-entitlements |
| POST /api/governance/roles/[id]/effective-entitlements/recompute | POST .../recompute |
| GET/POST /api/governance/roles/[id]/parameters | GET/POST /governance/roles/{role_id}/parameters |
| GET/PUT/DELETE /api/governance/roles/[id]/parameters/[pid] | GET/PUT/DELETE .../parameters/{pid} |
| POST /api/governance/roles/[id]/parameters/validate | POST .../parameters/validate |
| GET/POST /api/governance/roles/[id]/inheritance-blocks | GET/POST .../inheritance-blocks |
| DELETE /api/governance/roles/[id]/inheritance-blocks/[bid] | DELETE .../inheritance-blocks/{bid} |

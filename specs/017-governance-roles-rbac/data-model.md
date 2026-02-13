# Data Model: Governance Roles & RBAC

**Feature**: 017-governance-roles-rbac
**Date**: 2026-02-11

## Entities

### GovernanceRole

The core entity representing an access role in the organizational RBAC hierarchy.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| name | string | Yes | Role name (unique within tenant) |
| description | string or null | No | Human-readable description |
| parent_role_id | UUID or null | No | Parent role for hierarchy (null = root) |
| is_abstract | boolean | Yes | Whether role can be directly assigned |
| hierarchy_depth | integer | Yes | Depth in the hierarchy tree (0 = root) |
| version | integer | Yes | Optimistic concurrency version |
| created_by | UUID | Yes | User who created the role |
| created_at | ISO datetime | Yes | Creation timestamp |
| updated_at | ISO datetime | Yes | Last update timestamp |

**Relationships**:
- Has many child GovernanceRoles (via parent_role_id)
- Has many RoleEntitlements (direct)
- Has many RoleParameters
- Has many InheritanceBlocks
- Belongs to one parent GovernanceRole (optional)

**Validation**:
- name: required, non-empty string
- description: optional string
- parent_id (on create): optional UUID, must reference existing role
- version (on update/move): required integer, must match current version

---

### RoleTreeNode

A recursive hierarchical view of a role for tree visualization.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Role identifier |
| name | string | Yes | Role name |
| depth | integer | Yes | Tree depth (0 = root) |
| is_abstract | boolean | Yes | Whether role is abstract |
| direct_entitlement_count | integer | Yes | Count of directly assigned entitlements |
| effective_entitlement_count | integer | Yes | Count of direct + inherited entitlements |
| assigned_user_count | integer | Yes | Number of users assigned this role |
| children | RoleTreeNode[] | Yes | Recursive child nodes |

**Relationships**:
- Recursive: each node has children of the same type
- Mapped from GovernanceRole hierarchy

---

### RoleEntitlement

A mapping between a role and an entitlement (permission grant).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Mapping identifier |
| tenant_id | UUID | Yes | Tenant context |
| entitlement_id | UUID | Yes | The entitlement being granted |
| role_name | string | Yes | The role this entitlement belongs to |
| created_at | ISO datetime | Yes | When mapping was created |
| created_by | UUID | Yes | Who created the mapping |

**Validation** (on create):
- entitlement_id: required UUID, must reference existing entitlement
- role_name: required string, must match the role's name

---

### EffectiveEntitlement

An entitlement granted to a role through either direct assignment or inheritance.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | object[] | Yes | List of effective entitlements |
| direct_count | integer | Yes | Number of directly assigned |
| inherited_count | integer | Yes | Number inherited from ancestors |
| total | integer | Yes | Total effective entitlements |

---

### RoleParameter

A configurable parameter defined on a role for context-specific access.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Parameter identifier |
| tenant_id | UUID | Yes | Tenant context |
| role_id | UUID | Yes | The role this parameter belongs to |
| name | string | Yes | Parameter name (unique within role) |
| description | string or null | No | Human-readable description |
| parameter_type | ParameterType enum | Yes | One of: string, integer, boolean, date, enum |
| is_required | boolean | Yes | Whether parameter must be provided |
| default_value | any or null | No | Default value for the parameter |
| constraints | object or null | No | Type-specific constraints (e.g., allowed_values for enum) |
| display_name | string or null | No | Human-friendly display label |
| display_order | integer | Yes | Sort order for display |
| created_at | ISO datetime | Yes | Creation timestamp |
| updated_at | ISO datetime | Yes | Last update timestamp |

**Validation** (on create):
- name: required, non-empty string
- parameter_type: required, one of [string, integer, boolean, date, enum]
- is_required: optional boolean (defaults to false)
- constraints: optional object (for enum type, should contain `allowed_values` array)

**ParameterType enum**: `string` | `integer` | `boolean` | `date` | `enum`

---

### InheritanceBlock

An exception that prevents entitlement inheritance between a parent and child role.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Block identifier |
| blocked_role_id | UUID | Yes | The child role being blocked from inheriting |
| reason | string | Yes | Human-readable reason for the block |

**Validation** (on create):
- blocked_role_id: required UUID, must reference existing role
- reason: required string

---

### ImpactAnalysis

A summary of how changes to a role affect its descendants and users.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role_id | UUID | Yes | The role being analyzed |
| role_name | string | Yes | Name of the role |
| descendant_count | integer | Yes | Number of descendant roles |
| total_affected_users | integer | Yes | Total users affected by changes |
| descendants | object[] | Yes | List of descendant details |

---

### RoleMove

Result of a role re-parenting operation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | GovernanceRole | Yes | The updated role |
| affected_roles_count | integer | Yes | Number of roles affected by the move |
| recomputed | boolean | Yes | Whether entitlements were recomputed |

## Entity Relationship Diagram

```
GovernanceRole (root)
├── GovernanceRole (child) [via parent_role_id]
│   ├── GovernanceRole (grandchild)
│   └── ...
├── RoleEntitlement[] [direct entitlements]
├── RoleParameter[] [configurable parameters]
└── InheritanceBlock[] [inheritance exceptions]

GovernanceRole → Entitlement [via RoleEntitlement mapping]
GovernanceRole → GovernanceRole [via InheritanceBlock.blocked_role_id]
```

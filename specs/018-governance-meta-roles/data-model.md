# Data Model: Governance Meta-Roles

## Entities

### MetaRole

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| tenant_id | UUID | FK → tenants | Tenant isolation |
| name | string | 1-255 chars, unique per tenant | Display name |
| description | string | max 2000 chars, nullable | Description |
| priority | integer | 1-1000 | Conflict resolution priority (lower = higher) |
| status | enum | active, disabled | Lifecycle status |
| criteria_logic | enum | and, or | How criteria combine |
| created_by | UUID | | Creator user ID |
| created_at | datetime | | Creation timestamp |
| updated_at | datetime | | Last update timestamp |

**State Transitions**: active ↔ disabled (via enable/disable endpoints)

### MetaRoleCriteria

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| meta_role_id | UUID | FK → meta_roles | Parent meta-role |
| field | string | required | Matching field (risk_level, application_id, etc.) |
| operator | enum | required | Comparison operator |
| value | JSON | required | Match value (scalar or array) |
| created_at | datetime | | Creation timestamp |

**Supported Fields**: risk_level, application_id, owner_id, status, name, is_delegable, metadata

**Supported Operators**: eq, neq, in, not_in, gt, gte, lt, lte, contains, starts_with

### MetaRoleEntitlement

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| meta_role_id | UUID | FK → meta_roles | Parent meta-role |
| entitlement_id | UUID | FK → gov_entitlements | Linked entitlement |
| permission_type | enum | grant, deny | Permission direction |
| created_at | datetime | | Creation timestamp |

**Unique Constraint**: (meta_role_id, entitlement_id) — one mapping per entitlement per meta-role

**Enriched Response** includes nested `entitlement` object with: id, name, application_id, application_name, risk_level

### MetaRoleConstraint

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| meta_role_id | UUID | FK → meta_roles | Parent meta-role |
| constraint_type | string | required | Constraint category |
| constraint_value | JSON | required | Constraint configuration |
| created_at | datetime | | Creation timestamp |

**Unique Constraint**: (meta_role_id, constraint_type) — one per type per meta-role

**Supported Constraint Types**:
- `max_session_duration` → `{"hours": number}`
- `require_mfa` → `{"enabled": boolean}`
- `ip_whitelist` → `{"cidrs": string[]}`
- `approval_required` → `{"approval_type": string}`

### MetaRoleInheritance

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| tenant_id | UUID | FK → tenants | Tenant isolation |
| meta_role_id | UUID | FK → meta_roles | Source meta-role |
| child_role_id | UUID | FK → gov_entitlements | Inheriting role |
| match_reason | JSON | | Why role matched criteria |
| status | enum | active, suspended, removed | Inheritance status |
| matched_at | datetime | | When role was matched |
| updated_at | datetime | | Last status change |

**Enriched Response** includes nested `meta_role` {id, name, priority, status} and `child_role` {id, name, application_id, application_name}

### MetaRoleConflict

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| tenant_id | UUID | FK → tenants | Tenant isolation |
| meta_role_a_id | UUID | FK → meta_roles | First conflicting meta-role |
| meta_role_b_id | UUID | FK → meta_roles | Second conflicting meta-role |
| affected_role_id | UUID | FK → gov_entitlements | Role affected by conflict |
| conflict_type | enum | entitlement_conflict, constraint_conflict, policy_conflict | Category |
| conflicting_items | JSON | | Conflict details |
| resolution_status | enum | unresolved, resolved_priority, resolved_manual, ignored | Resolution state |
| resolved_by | UUID | nullable | Resolver user ID |
| resolution_choice | JSON | nullable | Resolution details |
| detected_at | datetime | | Detection timestamp |
| resolved_at | datetime | nullable | Resolution timestamp |

**CHECK Constraint**: meta_role_a_id < meta_role_b_id

**Enriched Response** includes nested `meta_role_a`, `meta_role_b` {id, name, priority, status} and `affected_role` {id, name, application_id, application_name}

### MetaRoleEvent

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Unique identifier |
| tenant_id | UUID | FK → tenants | Tenant isolation |
| meta_role_id | UUID | nullable | Related meta-role |
| event_type | enum | see below | Event category |
| actor_id | UUID | nullable | Who triggered it |
| changes | JSON | nullable | Before/after state |
| affected_roles | JSON | nullable | List of affected role IDs |
| metadata | JSON | nullable | Additional context |
| created_at | datetime | | Event timestamp |

**Event Types**: created, updated, deleted, disabled, enabled, inheritance_applied, inheritance_removed, conflict_detected, conflict_resolved, cascade_started, cascade_completed, cascade_failed

## Relationships

```
MetaRole 1──* MetaRoleCriteria (criteria for matching)
MetaRole 1──* MetaRoleEntitlement (entitlements to apply)
MetaRole 1──* MetaRoleConstraint (constraints to enforce)
MetaRole 1──* MetaRoleInheritance (active role matches)
MetaRole *──* MetaRoleConflict (conflicts between meta-roles)
MetaRole 1──* MetaRoleEvent (audit trail)
MetaRoleEntitlement *──1 Entitlement (from governance entitlements)
```

## Aggregated Stats (on MetaRoleWithDetailsResponse)

```
stats: {
  active_inheritances: count of inheritances with status=active
  unresolved_conflicts: count of conflicts with resolution_status=unresolved
  criteria_count: count of criteria
  entitlements_count: count of entitlement mappings
  constraints_count: count of constraints
}
```

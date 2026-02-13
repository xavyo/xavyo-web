# Data Model: Power of Attorney & Identity Delegation

**Date**: 2026-02-12

## Entities

### PoaGrant

Represents a Power of Attorney delegation from a grantor to a grantee.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| tenant_id | UUID | Yes | Tenant scope |
| grantor_id | UUID | Yes | User granting PoA |
| grantee_id | UUID | Yes | User receiving PoA |
| scope | PoaScope | Yes | Applications and workflow types |
| starts_at | ISO 8601 datetime | Yes | When the grant becomes active |
| ends_at | ISO 8601 datetime | Yes | When the grant expires |
| reason | string | Yes | Why the PoA was granted |
| status | PoaStatus | Yes | Current lifecycle status |
| revocation_reason | string | No | Reason for revocation (if revoked) |
| created_at | ISO 8601 datetime | Yes | Creation timestamp |
| updated_at | ISO 8601 datetime | Yes | Last update timestamp |

**Validation Rules**:
- `starts_at` must be current or future
- `ends_at` must be after `starts_at`
- `ends_at - starts_at` must not exceed 90 days
- `grantor_id` must not equal `grantee_id` (no self-delegation)
- Both `grantor_id` and `grantee_id` must be valid users in the same tenant

### PoaScope

Defines the boundaries of the delegation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| application_ids | string[] | Yes | Applications the grantee can access (empty = all) |
| workflow_types | string[] | Yes | Workflow types the grantee can perform (empty = all) |

### PoaAuditEvent

Records lifecycle events for a PoA grant.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| poa_id | UUID | Yes | Associated PoA grant |
| event_type | PoaEventType | Yes | Type of event |
| actor_id | UUID | Yes | User who performed the action |
| details | object | No | Event-specific details (reason, new_ends_at, etc.) |
| created_at | ISO 8601 datetime | Yes | When the event occurred |

### AssumeIdentityResponse

Transient response from the assume identity operation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| access_token | string | Yes | New JWT for the assumed identity |
| assumed_user_id | UUID | Yes | The user being impersonated |
| poa_id | UUID | Yes | The PoA grant authorizing this |
| expires_at | ISO 8601 datetime | Yes | When the assumption expires |

### CurrentAssumptionStatus

Current assumption state for a user.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| is_assuming | boolean | Yes | Whether the user is currently assuming another identity |
| poa_id | UUID | No | Active PoA grant (if assuming) |
| assumed_identity | object | No | Details of the assumed user (if assuming) |

## Enums

### PoaStatus

| Value | Description |
|-------|-------------|
| pending | Grant created but start date is in the future |
| active | Grant is within its date range and not revoked |
| expired | Grant's end date has passed |
| revoked | Grant was manually revoked by grantor or admin |

### PoaEventType

| Value | Description |
|-------|-------------|
| granted | PoA was created |
| activated | PoA became active (start date reached) |
| assumed | Grantee assumed the grantor's identity |
| dropped | Grantee dropped the assumed identity |
| extended | PoA end date was extended |
| revoked | PoA was revoked |
| expired | PoA expired naturally |

## State Transitions

```
[created] → pending (if starts_at is future)
[created] → active (if starts_at is now)
pending → active (when starts_at reached)
pending → revoked (by grantor or admin)
active → expired (when ends_at reached)
active → revoked (by grantor or admin)
```

Terminal states: `expired`, `revoked`

## Relationships

- **PoaGrant** → **User** (grantor): Many-to-one
- **PoaGrant** → **User** (grantee): Many-to-one
- **PoaGrant** → **PoaAuditEvent**: One-to-many
- **PoaScope** → **Application**: Many-to-many (via application_ids)

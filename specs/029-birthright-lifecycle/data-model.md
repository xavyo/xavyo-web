# Data Model: Birthright Policies & Lifecycle Workflows

**Feature**: 029-birthright-lifecycle
**Date**: 2026-02-12

## Entities

### BirthrightPolicy

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| tenant_id | uuid | Yes | Tenant scope |
| name | string (1-255) | Yes | Unique per tenant |
| description | string \| null | No | Optional description |
| priority | number (i32) | Yes | Evaluation order (lower = higher priority) |
| conditions | PolicyCondition[] | Yes | Array of matching conditions (min 1) |
| entitlement_ids | uuid[] | Yes | Array of entitlement references (min 1) |
| status | BirthrightPolicyStatus | Yes | active \| inactive \| archived |
| evaluation_mode | EvaluationMode | Yes | first_match \| all_match |
| grace_period_days | number (0-365) | Yes | Days before mover revocation executes |
| created_by | uuid | Yes | User who created the policy |
| created_at | string (ISO datetime) | Yes | Creation timestamp |
| updated_at | string (ISO datetime) | Yes | Last update timestamp |

### PolicyCondition (embedded in BirthrightPolicy.conditions)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attribute | string | Yes | User attribute path (e.g., "department", "metadata.cost_center") |
| operator | ConditionOperator | Yes | equals \| not_equals \| in \| not_in \| starts_with \| contains |
| value | string \| string[] | Yes | Expected value(s). Array for in/not_in operators |

### LifecycleEvent

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| tenant_id | uuid | Yes | Tenant scope |
| user_id | uuid | Yes | Target user |
| event_type | LifecycleEventType | Yes | joiner \| mover \| leaver |
| attributes_before | object \| null | Mover only | User attributes before change |
| attributes_after | object \| null | Joiner/Mover | User attributes after change |
| source | string | Yes | api \| scim \| trigger \| webhook |
| processed_at | string \| null | No | Set when event is processed |
| created_at | string (ISO datetime) | Yes | Creation timestamp |

### LifecycleAction (returned in ProcessEventResult)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | Primary key |
| event_id | uuid | Yes | Parent lifecycle event |
| action_type | ActionType | Yes | provision \| revoke \| schedule_revoke \| cancel_revoke \| skip |
| assignment_id | uuid \| null | No | Created/removed entitlement assignment |
| policy_id | uuid \| null | No | Policy that triggered this action |
| entitlement_id | uuid | Yes | Target entitlement |
| scheduled_at | string \| null | No | For schedule_revoke: when revocation executes |
| executed_at | string \| null | No | When action was executed |
| cancelled_at | string \| null | No | If scheduled action was cancelled |
| error_message | string \| null | No | Error details if action failed |
| created_at | string (ISO datetime) | Yes | Action creation timestamp |

### AccessSnapshotSummary (returned in ProcessEventResult)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| snapshot_type | string | Yes | PreMover \| PreLeaver |
| user_id | uuid | Yes | Target user |
| assignments | SnapshotAssignment[] | Yes | List of captured assignments |
| captured_at | string (ISO datetime) | Yes | When snapshot was taken |

## Enums

```
BirthrightPolicyStatus = "active" | "inactive" | "archived"
EvaluationMode = "first_match" | "all_match"
ConditionOperator = "equals" | "not_equals" | "in" | "not_in" | "starts_with" | "contains"
LifecycleEventType = "joiner" | "mover" | "leaver"
ActionType = "provision" | "revoke" | "schedule_revoke" | "cancel_revoke" | "skip"
```

## State Transitions

### BirthrightPolicy Status
```
[created] → active
active → inactive (disable)
active → archived (archive/delete)
inactive → active (enable)
inactive → archived (archive/delete)
archived → (terminal, no further transitions)
```

### LifecycleEvent Processing
```
[created] → pending (processed_at = null)
pending → processed (processed_at = timestamp, via /process or /trigger)
processed → (terminal, cannot reprocess)
```

## Request/Response Types

### CreateBirthrightPolicyRequest
```
{
  name: string (1-255),
  description?: string,
  priority: number,
  conditions: PolicyCondition[] (min 1),
  entitlement_ids: uuid[] (min 1),
  evaluation_mode: EvaluationMode (default: "all_match"),
  grace_period_days: number (0-365, default: 7)
}
```

### UpdateBirthrightPolicyRequest
```
{
  name?: string (1-255),
  description?: string,
  priority?: number,
  conditions?: PolicyCondition[] (min 1),
  entitlement_ids?: uuid[] (min 1),
  evaluation_mode?: EvaluationMode,
  grace_period_days?: number (0-365)
}
```

### BirthrightPolicyListResponse
```
{
  items: BirthrightPolicy[],
  total: number,
  limit: number,
  offset: number
}
```

### SimulatePolicyRequest
```
{
  attributes: Record<string, unknown>  // JSON object of user attributes
}
```

### SimulatePolicyResponse (single policy)
```
{
  matches: boolean,
  entitlement_ids: uuid[],
  matched_conditions: PolicyCondition[]
}
```

### SimulateAllPoliciesResponse
```
{
  matching_policies: {
    policy_id: uuid,
    policy_name: string,
    entitlement_ids: uuid[]
  }[],
  total_entitlements: uuid[]  // deduplicated combined set
}
```

### ImpactAnalysisResponse
```
{
  total_affected: number,
  users_gaining: number,
  users_losing: number,
  by_department: { department: string, count: number }[],
  by_location: { location: string, count: number }[]
}
```

### CreateLifecycleEventRequest
```
{
  user_id: uuid,
  event_type: LifecycleEventType,
  attributes_before?: Record<string, unknown>,  // required for mover
  attributes_after?: Record<string, unknown>,   // required for joiner/mover
  source?: string (default: "api")
}
```

### ProcessEventResult
```
{
  event: LifecycleEvent,
  actions: LifecycleAction[],
  snapshot: AccessSnapshotSummary | null,
  summary: {
    provisioned: number,
    revoked: number,
    skipped: number,
    scheduled: number
  }
}
```

### LifecycleEventListResponse
```
{
  items: LifecycleEvent[],
  total: number,
  limit: number,
  offset: number
}
```

## Relationships

- BirthrightPolicy → Entitlement (many-to-many via entitlement_ids array)
- BirthrightPolicy → User (created_by FK)
- LifecycleEvent → User (user_id FK)
- LifecycleAction → LifecycleEvent (event_id FK)
- LifecycleAction → BirthrightPolicy (policy_id FK, nullable)
- LifecycleAction → Entitlement (entitlement_id FK)

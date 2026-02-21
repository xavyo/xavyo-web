# Data Model: Policy Simulations & What-If Analysis

**Feature**: 039-policy-simulations
**Date**: 2026-02-12

## Entities

### PolicySimulation

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | Yes | Primary key |
| tenant_id | string (UUID) | Yes | Tenant scope |
| name | string | Yes | Display name |
| simulation_type | `sod_rule` \| `birthright_policy` | Yes | What policy type to simulate |
| policy_id | string (UUID) \| null | No | Reference to existing policy |
| policy_config | Record<string, unknown> | Yes | Policy configuration JSON |
| status | SimulationStatus | Yes | draft → executed → applied/cancelled |
| affected_user_count | number \| null | No | Populated after execution |
| impact_summary | ImpactSummary \| null | No | Populated after execution |
| data_snapshot_at | string (ISO datetime) \| null | No | When data was captured for execution |
| is_stale | boolean | Yes | Whether underlying data has changed |
| is_archived | boolean | Yes | Soft-archive flag |
| notes | string \| null | No | Free-text admin notes |
| created_by | string (UUID) | Yes | Creator user ID |
| created_at | string (ISO datetime) | Yes | Creation timestamp |
| executed_at | string (ISO datetime) \| null | No | Execution timestamp |

### PolicySimulationResult

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | Yes | Primary key |
| simulation_id | string (UUID) | Yes | FK to PolicySimulation |
| user_id | string (UUID) | Yes | Affected user |
| impact_type | ImpactType | Yes | violation/entitlement_gain/entitlement_loss/no_change/warning |
| details | Record<string, unknown> | Yes | Impact-specific details JSON |
| severity | Severity | Yes | critical/high/medium/low |
| created_at | string (ISO datetime) | Yes | Result creation timestamp |

### ImpactSummary (embedded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| total_users_analyzed | number | Yes | Total users in scope |
| affected_users | number | Yes | Users with non-no_change impact |
| by_severity | SeverityBreakdown | Yes | {critical, high, medium, low} counts |
| by_impact_type | ImpactTypeBreakdown | Yes | {violation, entitlement_gain, entitlement_loss, no_change, warning} counts |

### BatchSimulation

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | Yes | Primary key |
| tenant_id | string (UUID) | Yes | Tenant scope |
| name | string | Yes | Display name |
| batch_type | BatchSimulationType | Yes | role_add/role_remove/entitlement_add/entitlement_remove |
| selection_mode | `user_list` \| `filter` | Yes | How users are selected |
| user_ids | string[] \| null | No | Explicit user list (when selection_mode=user_list) |
| filter_criteria | FilterCriteria \| null | No | Filter config (when selection_mode=filter) |
| change_spec | ChangeSpec | Yes | What change to simulate |
| total_users | number \| null | No | Total matched users (after execution) |
| processed_users | number \| null | No | Users processed (after execution) |
| status | SimulationStatus | Yes | draft → executed → applied/cancelled |
| impact_summary | BatchImpactSummary \| null | No | Populated after execution |
| has_scope_warning | boolean | Yes | True if large scope detected |
| data_snapshot_at | string (ISO datetime) \| null | No | When data was captured |
| is_archived | boolean | Yes | Soft-archive flag |
| notes | string \| null | No | Free-text admin notes |
| created_by | string (UUID) | Yes | Creator user ID |
| created_at | string (ISO datetime) | Yes | Creation timestamp |
| executed_at | string (ISO datetime) \| null | No | Execution timestamp |
| applied_at | string (ISO datetime) \| null | No | Apply timestamp |
| applied_by | string (UUID) \| null | No | Who applied |

### BatchSimulationResult

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | Yes | Primary key |
| simulation_id | string (UUID) | Yes | FK to BatchSimulation |
| user_id | string (UUID) | Yes | Affected user |
| access_gained | AccessItem[] | Yes | List of access items gained |
| access_lost | AccessItem[] | Yes | List of access items lost |
| warnings | string[] | Yes | Warning messages |
| created_at | string (ISO datetime) | Yes | Result creation timestamp |

### BatchImpactSummary (embedded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| total_users | number | Yes | Total users processed |
| affected_users | number | Yes | Users with changes |
| entitlements_gained | number | Yes | Total entitlements added |
| entitlements_lost | number | Yes | Total entitlements removed |
| sod_violations_introduced | number | Yes | New SoD violations |
| warnings | string[] | Yes | Scope/impact warnings |

### FilterCriteria (embedded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| department | string \| null | No | Department filter |
| status | string \| null | No | User status filter |
| role_ids | string[] \| null | No | Filter by role membership |
| entitlement_ids | string[] \| null | No | Filter by entitlement membership |
| title | string \| null | No | Job title filter |
| metadata | Record<string, string> \| null | No | Custom metadata filters |

### ChangeSpec (embedded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| operation | BatchSimulationType | Yes | What operation to perform |
| role_id | string (UUID) \| null | No | Target role (for role operations) |
| entitlement_id | string (UUID) \| null | No | Target entitlement (for entitlement operations) |
| justification | string \| null | No | Reason for the change |

### AccessItem (embedded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| type | string | Yes | "role" or "entitlement" |
| id | string (UUID) | Yes | Role or entitlement ID |
| name | string | Yes | Display name |

### SimulationComparison

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string (UUID) | Yes | Primary key |
| tenant_id | string (UUID) | Yes | Tenant scope |
| name | string | Yes | Display name |
| comparison_type | ComparisonType | Yes | simulation_vs_simulation/simulation_vs_current |
| simulation_a_id | string (UUID) | Yes | First simulation ID |
| simulation_a_type | string | Yes | "policy" or "batch" |
| simulation_b_id | string (UUID) \| null | No | Second simulation ID (null for vs_current) |
| simulation_b_type | string \| null | No | "policy" or "batch" (null for vs_current) |
| summary_stats | ComparisonSummary \| null | No | Aggregated delta statistics |
| delta_results | DeltaResults \| null | No | Detailed delta entries |
| is_stale | boolean | Yes | Whether source simulations changed |
| created_by | string (UUID) | Yes | Creator user ID |
| created_at | string (ISO datetime) | Yes | Creation timestamp |

### ComparisonSummary (embedded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| users_in_both | number | Yes | Users appearing in both simulations |
| users_only_in_a | number | Yes | Users only in simulation A |
| users_only_in_b | number | Yes | Users only in simulation B |
| different_impacts | number | Yes | Users with different impact types |
| total_additions | number | Yes | Net new impacts |
| total_removals | number | Yes | Net removed impacts |

### DeltaResults (embedded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| added | DeltaEntry[] | Yes | Users/impacts only in B |
| removed | DeltaEntry[] | Yes | Users/impacts only in A |
| modified | ModifiedEntry[] | Yes | Users with changed impacts |

### DeltaEntry (embedded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| user_id | string (UUID) | Yes | Affected user |
| impact_type | string | Yes | Impact classification |
| severity | string \| null | No | Severity level |
| details | Record<string, unknown> \| null | No | Additional details |

### ModifiedEntry (embedded)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| user_id | string (UUID) | Yes | Affected user |
| impact_a | Record<string, unknown> | Yes | Impact in simulation A |
| impact_b | Record<string, unknown> | Yes | Impact in simulation B |

## Enums

| Enum | Values |
|------|--------|
| SimulationStatus | `draft`, `executed`, `applied`, `cancelled` |
| PolicySimulationType | `sod_rule`, `birthright_policy` |
| BatchSimulationType | `role_add`, `role_remove`, `entitlement_add`, `entitlement_remove` |
| ImpactType | `violation`, `entitlement_gain`, `entitlement_loss`, `no_change`, `warning` |
| Severity | `critical`, `high`, `medium`, `low` |
| ComparisonType | `simulation_vs_simulation`, `simulation_vs_current` |
| SelectionMode | `user_list`, `filter` |

## Relationships

```
PolicySimulation 1──* PolicySimulationResult (simulation_id)
BatchSimulation 1──* BatchSimulationResult (simulation_id)
SimulationComparison *──1 PolicySimulation/BatchSimulation (simulation_a_id, simulation_b_id)
```

## State Transitions

### SimulationStatus
```
draft ──[execute]──> executed
draft ──[cancel]──> cancelled
executed ──[apply]──> applied (batch only)
executed ──[archive]──> (is_archived=true, status unchanged)
executed ──[re-execute]──> executed (overwrite results)
```

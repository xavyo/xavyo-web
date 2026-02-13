# Data Model: Role Mining Analytics & Recommendations

## Entities

### MiningJob

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant scope |
| name | string | Required, user-provided |
| status | MiningJobStatus | pending/running/completed/failed/cancelled |
| parameters | MiningJobParameters | Nested object |
| progress_percent | number | 0-100, updated during run |
| candidate_count | number | Result count |
| excessive_privilege_count | number | Result count |
| consolidation_suggestion_count | number | Result count |
| started_at | datetime? | Set when run starts |
| completed_at | datetime? | Set when job finishes |
| error_message | string? | Set on failure |
| created_by | UUID | Admin who created |
| created_at | datetime | Auto-set |
| updated_at | datetime | Auto-set |

### MiningJobParameters

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| min_users | number | 3 | Minimum users sharing a pattern |
| min_entitlements | number | 2 | Minimum entitlements in a pattern |
| confidence_threshold | number | 0.6 | 0.0-1.0, minimum confidence score |
| include_excessive_privilege | boolean | true | Run excessive privilege analysis |
| include_consolidation | boolean | true | Run consolidation analysis |
| consolidation_threshold | number | 70.0 | Minimum overlap % for suggestions |
| deviation_threshold | number | 50.0 | Deviation % for excessive privileges |
| peer_group_attribute | string? | null | Attribute for peer grouping |

### MiningJobStatus (enum)

`pending` | `running` | `completed` | `failed` | `cancelled`

### RoleCandidate

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| job_id | UUID | FK to MiningJob |
| proposed_name | string | Auto-generated name |
| confidence_score | number | 0.0-1.0 |
| member_count | number | Users matching pattern |
| entitlement_ids | UUID[] | Entitlements in candidate |
| user_ids | UUID[] | Users matching |
| promotion_status | CandidatePromotionStatus | pending/promoted/dismissed |
| promoted_role_id | UUID? | FK to governance role (when promoted) |
| dismissed_reason | string? | Reason for dismissal |
| created_at | datetime | Auto-set |

### CandidatePromotionStatus (enum)

`pending` | `promoted` | `dismissed`

### AccessPattern

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| job_id | UUID | FK to MiningJob |
| entitlement_ids | UUID[] | Co-occurring entitlements |
| frequency | number | How often this pattern appears |
| user_count | number | Users with this pattern |
| sample_user_ids | UUID[] | Sample of matching users |
| created_at | datetime | Auto-set |

### ExcessivePrivilege

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key (flag_id) |
| job_id | UUID | FK to MiningJob |
| user_id | UUID | Flagged user |
| peer_group_id | UUID? | Peer group used for comparison |
| deviation_percent | number | How much user deviates from peers |
| excess_entitlements | UUID[] | Entitlements flagged as excessive |
| peer_average | number | Average entitlement count in peer group |
| user_count | number | User's actual entitlement count |
| status | PrivilegeFlagStatus | pending/reviewed/remediated/accepted |
| notes | string? | Review notes |
| reviewed_by | UUID? | Reviewer admin |
| reviewed_at | datetime? | Review timestamp |
| created_at | datetime | Auto-set |

### PrivilegeFlagStatus (enum)

`pending` | `reviewed` | `remediated` | `accepted`

### PrivilegeReviewAction (enum)

`accept` | `remediate`

### ConsolidationSuggestion

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| job_id | UUID | FK to MiningJob |
| role_a_id | UUID | First overlapping role |
| role_b_id | UUID | Second overlapping role |
| overlap_percent | number | 0-100 |
| shared_entitlements | UUID[] | Entitlements in both roles |
| unique_to_a | UUID[] | Entitlements only in role A |
| unique_to_b | UUID[] | Entitlements only in role B |
| status | ConsolidationStatus | pending/merged/dismissed |
| dismissed_reason | string? | Reason for dismissal |
| created_at | datetime | Auto-set |

### ConsolidationStatus (enum)

`pending` | `merged` | `dismissed`

### Simulation

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant scope |
| name | string | User-provided |
| scenario_type | ScenarioType | Type of change being simulated |
| target_role_id | UUID? | Role being modified (if applicable) |
| changes | SimulationChanges | Change specification |
| status | SimulationStatus | draft/executed/applied/cancelled |
| affected_users | UUID[] | Users impacted (populated after execute) |
| access_gained | JSON | Access that would be added |
| access_lost | JSON | Access that would be removed |
| applied_by | UUID? | Admin who applied |
| applied_at | datetime? | When applied |
| created_by | UUID | Admin who created |
| created_at | datetime | Auto-set |

### SimulationChanges

| Field | Type | Notes |
|-------|------|-------|
| change_type | string? | Type of change (mapped from `type`) |
| role_id | UUID? | Target role |
| entitlement_id | UUID? | Single entitlement |
| entitlement_ids | UUID[]? | Multiple entitlements |
| user_ids | UUID[]? | Users to modify |
| role_name | string? | For add_role scenarios |
| role_description | string? | For add_role scenarios |

### ScenarioType (enum)

`add_entitlement` | `remove_entitlement` | `add_role` | `remove_role` | `modify_role`

### SimulationStatus (enum)

`draft` | `executed` | `applied` | `cancelled`

### RoleMetrics

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant scope |
| role_id | UUID | FK to governance role |
| utilization_rate | number | 0.0-1.0, how much of the role is actually used |
| coverage_rate | number | 0.0-1.0, how well the role covers user needs |
| user_count | number | Total users with this role |
| active_user_count | number | Users actively using role entitlements |
| entitlement_usage | EntitlementUsage[] | Per-entitlement usage stats |
| trend_direction | TrendDirection | up/stable/down |
| calculated_at | datetime | When metrics were last calculated |

### EntitlementUsage

| Field | Type | Notes |
|-------|------|-------|
| entitlement_id | UUID | FK to entitlement |
| used_by_count | number | Users using this entitlement |
| total_users | number | Users with this entitlement |
| usage_rate | number | used_by_count / total_users |

### TrendDirection (enum)

`up` | `stable` | `down`

## Relationships

- MiningJob → many RoleCandidates (via job_id)
- MiningJob → many AccessPatterns (via job_id)
- MiningJob → many ExcessivePrivileges (via job_id)
- MiningJob → many ConsolidationSuggestions (via job_id)
- RoleCandidate → one promoted GovernanceRole (via promoted_role_id, optional)
- ExcessivePrivilege → one User (via user_id)
- ConsolidationSuggestion → two GovernanceRoles (via role_a_id, role_b_id)
- Simulation → many affected Users (via affected_users array)
- RoleMetrics → one GovernanceRole (via role_id)

## State Transitions

### MiningJob: pending → running → completed/failed | running → cancelled
### RoleCandidate: pending → promoted/dismissed
### ExcessivePrivilege: pending → reviewed/remediated/accepted
### ConsolidationSuggestion: pending → merged/dismissed
### Simulation: draft → executed → applied | draft/executed → cancelled

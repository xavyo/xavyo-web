# Data Model: Identity Deduplication & Merging

## Entities

### DuplicateCandidate

A detected pair of potentially duplicate identities.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| identity_a_id | UUID | First identity (canonical order: a < b) |
| identity_b_id | UUID | Second identity |
| confidence_score | number | 0.00-100.00, weighted from rule matches |
| status | DuplicateStatus | pending, merged, dismissed |
| detected_at | datetime | When the pair was detected |

### DuplicateDetail

Extended duplicate info with identity summaries and comparison.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Same as DuplicateCandidate.id |
| identity_a_id | UUID | |
| identity_b_id | UUID | |
| confidence_score | number | |
| identity_a | IdentitySummary | Full summary of first identity |
| identity_b | IdentitySummary | Full summary of second identity |
| attribute_comparison | AttributeComparison[] | Per-field comparison |
| rule_matches | RuleMatch[] | Rules that triggered this match |

### IdentitySummary

Lightweight representation of a user identity.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| email | string | null | |
| display_name | string | null | |
| department | string | null | |
| attributes | object | Additional attributes as JSON |

### AttributeComparison

Field-level comparison between two identities.

| Field | Type | Notes |
|-------|------|-------|
| attribute | string | Field name |
| value_a | any | null | Value from identity A |
| value_b | any | null | Value from identity B |
| is_different | boolean | Whether values differ |

### RuleMatch

A correlation rule that contributed to the confidence score.

| Field | Type | Notes |
|-------|------|-------|
| rule_id | UUID | |
| rule_name | string | |
| attribute | string | Which attribute was matched |
| similarity | number | 0.0-1.0 raw similarity |
| weighted_score | number | Contribution to total confidence |

### MergePreviewResponse

Result of a merge preview request.

| Field | Type | Notes |
|-------|------|-------|
| source_identity | IdentitySummary | Identity being merged from |
| target_identity | IdentitySummary | Identity being merged into |
| merged_preview | IdentitySummary | Resulting merged identity |
| entitlements_preview | EntitlementsPreview | Entitlement consolidation preview |
| sod_check | MergeSodCheck | SoD violation check result |

### EntitlementsPreview

Breakdown of entitlements by consolidation category.

| Field | Type | Notes |
|-------|------|-------|
| source_only | EntitlementSummary[] | Entitlements only in source |
| target_only | EntitlementSummary[] | Entitlements only in target |
| common | EntitlementSummary[] | Entitlements in both |
| merged | EntitlementSummary[] | Final merged set |

### EntitlementSummary

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| name | string | |
| application | string | null | |

### MergeSodCheck

SoD violation check result for a merge operation.

| Field | Type | Notes |
|-------|------|-------|
| has_violations | boolean | Whether any SoD violations exist |
| can_override | boolean | Whether admin can override |
| violations | MergeSodViolation[] | Individual violations |

### MergeSodViolation

| Field | Type | Notes |
|-------|------|-------|
| rule_id | UUID | SoD rule that would be violated |
| rule_name | string | |
| severity | string | |
| entitlement_being_added | UUID | |
| conflicting_entitlement_id | UUID | |
| has_exemption | boolean | Whether an exemption exists |

### MergeOperation

Tracks the status of a merge operation.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| source_identity_id | UUID | |
| target_identity_id | UUID | |
| status | MergeOperationStatus | in_progress, completed, failed, cancelled |
| entitlement_strategy | EntitlementStrategy | union, intersection, manual |
| operator_id | UUID | Admin who performed the merge |
| started_at | datetime | |
| completed_at | datetime | null | |

### BatchMergeResponse

Result of a batch merge operation.

| Field | Type | Notes |
|-------|------|-------|
| job_id | UUID | |
| status | BatchMergeStatus | queued, running, completed, failed |
| total_pairs | number | |
| processed | number | |
| successful | number | |
| failed | number | |
| skipped | number | |

### MergeAuditSummary

Summary of a merge audit entry (for list view).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| operation_id | UUID | |
| source_identity_id | UUID | |
| target_identity_id | UUID | |
| operator_id | UUID | |
| created_at | datetime | |

### MergeAuditDetail

Full audit record with snapshots.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| operation_id | UUID | |
| source_snapshot | object | Pre-merge snapshot of source identity |
| target_snapshot | object | Pre-merge snapshot of target identity |
| merged_snapshot | object | Post-merge result |
| attribute_decisions | object | Per-attribute source/target decisions |
| entitlement_decisions | object | Entitlement consolidation decisions |
| sod_violations | object | null | SoD violations if any were overridden |
| created_at | datetime | |

### DetectionScanResponse

Result of triggering a duplicate detection scan.

| Field | Type | Notes |
|-------|------|-------|
| scan_id | UUID | |
| users_processed | number | |
| duplicates_found | number | |
| new_duplicates | number | |
| duration_ms | number | |

## Enums

### DuplicateStatus
- `pending` — Awaiting review
- `merged` — Successfully merged
- `dismissed` — Dismissed as false positive

### MergeOperationStatus
- `in_progress` — Merge in progress
- `completed` — Merge completed
- `failed` — Merge failed
- `cancelled` — Merge cancelled

### EntitlementStrategy
- `union` — Keep all entitlements from both identities
- `intersection` — Keep only common entitlements
- `manual` — Manual selection of entitlements

### AttributeResolutionRule (batch only)
- `newest_wins` — Use values from the newer record
- `oldest_wins` — Use values from the older record
- `prefer_non_null` — Prefer non-null values

### BatchMergeStatus
- `queued` — Job queued
- `running` — Job in progress
- `completed` — Job completed
- `failed` — Job failed

## State Transitions

### Duplicate Candidate Lifecycle
```
pending → merged    (via merge execution)
pending → dismissed (via admin dismissal)
```

### Merge Operation Lifecycle
```
in_progress → completed  (merge succeeded)
in_progress → failed     (merge error)
in_progress → cancelled  (cancelled by operator)
```

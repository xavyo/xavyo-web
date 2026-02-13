# Data Model: Identity Correlation Engine

**Date**: 2026-02-12 | **Branch**: `028-correlation-engine`

## Entities

### CorrelationRule (connector-scoped)

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| tenant_id | string (UUID) | Tenant scope |
| connector_id | string (UUID) | FK to connector |
| name | string | Human-readable rule name |
| source_attribute | string | Account attribute name |
| target_attribute | string | Identity attribute name |
| match_type | enum | `exact` \| `fuzzy` \| `expression` |
| algorithm | string \| null | `levenshtein` \| `jaro_winkler` (fuzzy only) |
| threshold | number | 0.0-1.0 similarity threshold |
| weight | number | Float, e.g., 1.0, 1.5 |
| expression | string \| null | Required when match_type is `expression` |
| tier | number | Evaluation priority tier |
| is_definitive | boolean | Auto-confirm on match |
| normalize | boolean | Normalize values before comparison |
| is_active | boolean | Active/inactive toggle |
| priority | number | Sort priority within tier |
| created_at | string (ISO 8601) | |
| updated_at | string (ISO 8601) | |

### IdentityCorrelationRule (tenant-wide)

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| name | string | Human-readable rule name |
| attribute | string | Single attribute to compare across identities |
| match_type | enum | `exact` \| `fuzzy` \| `expression` |
| algorithm | string \| null | `levenshtein` \| `jaro_winkler` (fuzzy only) |
| threshold | number | 0.0-1.0 similarity threshold |
| weight | number | Float weight |
| is_active | boolean | Active/inactive toggle |
| priority | number | Sort priority |
| created_at | string (ISO 8601) | |
| updated_at | string (ISO 8601) | |

### CorrelationThreshold (connector-scoped)

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| connector_id | string (UUID) | FK to connector |
| auto_confirm_threshold | number | 0.0-1.0, must be >= manual_review_threshold |
| manual_review_threshold | number | 0.0-1.0 |
| tuning_mode | boolean | Route all to manual review |
| include_deactivated | boolean | Include deactivated accounts |
| batch_size | number | Accounts per batch |
| created_at | string (ISO 8601) | |
| updated_at | string (ISO 8601) | |

### CorrelationJob

| Field | Type | Notes |
|-------|------|-------|
| job_id | string (UUID) | Primary key |
| status | enum | `running` \| `completed` \| `failed` |
| total_accounts | number | Total accounts to process |
| processed_accounts | number | Processed so far |
| auto_confirmed | number | Auto-confirmed count |
| queued_for_review | number | Sent to manual review |
| no_match | number | No match found |
| errors | number | Error count |
| started_at | string (ISO 8601) | |
| completed_at | string (ISO 8601) \| null | |

### CorrelationCase

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| connector_id | string (UUID) | FK to connector |
| connector_name | string | Denormalized for display |
| account_identifier | string | Account display name/email |
| account_id | string \| null | FK to account (if linked) |
| status | enum | `pending` \| `confirmed` \| `rejected` \| `identity_created` |
| trigger_type | enum | `import` \| `reconciliation` \| `manual` |
| highest_confidence | number | 0.0-1.0 |
| candidate_count | number | Number of candidates |
| assigned_to | string \| null | Reviewer user UUID |
| created_at | string (ISO 8601) | |
| updated_at | string (ISO 8601) | |

### CorrelationCaseDetail (extends CorrelationCase)

| Field | Type | Notes |
|-------|------|-------|
| account_attributes | Record<string, unknown> | Key-value pairs |
| candidates | CorrelationCandidate[] | Candidate matches |
| resolved_by | string \| null | User who resolved |
| resolved_at | string \| null | Resolution timestamp |
| resolution_reason | string \| null | |
| rules_snapshot | Record<string, unknown> | Rules at evaluation time |

### CorrelationCandidate

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Candidate ID |
| identity_id | string (UUID) | FK to identity |
| identity_display_name | string | |
| identity_attributes | Record<string, unknown> | Key-value pairs |
| aggregate_confidence | number | 0.0-1.0 |
| per_attribute_scores | Record<string, number> | Attribute → score |
| is_deactivated | boolean | |
| is_definitive_match | boolean | |

### CorrelationStatistics

| Field | Type | Notes |
|-------|------|-------|
| connector_id | string (UUID) | |
| period_start | string (ISO 8601) | |
| period_end | string (ISO 8601) | |
| total_evaluated | number | |
| auto_confirmed_count | number | |
| auto_confirmed_percentage | number | |
| manual_review_count | number | |
| manual_review_percentage | number | |
| no_match_count | number | |
| no_match_percentage | number | |
| average_confidence | number | |
| review_queue_depth | number | |
| suggestions | string[] | AI-generated tuning tips |

### CorrelationTrends

| Field | Type | Notes |
|-------|------|-------|
| connector_id | string (UUID) | |
| period_start | string (ISO 8601) | |
| period_end | string (ISO 8601) | |
| daily_trends | DailyTrend[] | Per-day breakdown |
| suggestions | string[] | |

### DailyTrend

| Field | Type | Notes |
|-------|------|-------|
| date | string | YYYY-MM-DD |
| total_evaluated | number | |
| auto_confirmed | number | |
| manual_review | number | |
| no_match | number | |
| average_confidence | number | |

### CorrelationAuditEvent

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| connector_id | string (UUID) | |
| account_id | string (UUID) | |
| case_id | string (UUID) | |
| identity_id | string (UUID) | |
| event_type | enum | `auto_confirm` \| `manual_confirm` \| `reject` \| `create_identity` \| `reassign` |
| outcome | enum | `success` \| `failure` |
| confidence_score | number | 0.0-1.0 |
| candidate_count | number | |
| candidates_summary | Record<string, unknown> | |
| rules_snapshot | Record<string, unknown> | |
| thresholds_snapshot | Record<string, unknown> | |
| actor_type | enum | `user` \| `system` |
| actor_id | string \| null | User UUID or null for system |
| reason | string \| null | |
| created_at | string (ISO 8601) | |

## State Transitions

### CorrelationCase Status

```
pending → confirmed    (via confirm action)
pending → rejected     (via reject action)
pending → identity_created (via create-identity action)
```

### CorrelationJob Status

```
running → completed    (all accounts processed)
running → failed       (error during processing)
```

## Pagination

All list endpoints use `{items, total, limit, offset}` format (standard governance pagination).

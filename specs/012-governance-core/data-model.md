# Data Model: Governance Core

## Entities

### Entitlement

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant isolation |
| application_id | UUID | Parent application reference |
| name | string (1-255) | Required |
| description | string (max 2000) | Optional |
| risk_level | enum | `low`, `medium`, `high`, `critical` |
| status | enum | `active`, `inactive`, `suspended` |
| owner_id | UUID | Optional, references a user |
| external_id | string (max 255) | Optional external reference |
| metadata | JSON object | Optional key-value metadata |
| is_delegable | boolean | Default true |
| data_protection_classification | enum | `none`, `personal`, `sensitive`, `special_category` |
| legal_basis | enum | `consent`, `contract`, `legal_obligation`, `vital_interest`, `public_task`, `legitimate_interest` |
| retention_period_days | integer | Optional |
| data_controller | string (max 500) | Optional |
| data_processor | string (max 500) | Optional |
| purposes | string[] | Optional |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |

**State transitions**: active ↔ inactive ↔ suspended (via status field, set on update)

### Access Request

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| requester_id | UUID | User who submitted |
| entitlement_id | UUID | Target entitlement |
| workflow_id | UUID | Optional workflow reference |
| current_step | integer | Current approval step |
| status | enum | See lifecycle below |
| justification | string (min 20) | Required |
| requested_expires_at | DateTime | Optional expiry |
| has_sod_warning | boolean | SoD conflict detected |
| sod_violations | SodViolationInfo[] | Inline violation details |
| provisioned_assignment_id | UUID | After provisioning |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |
| expires_at | DateTime | Optional |

**Status lifecycle**:
- `pending` → `pending_approval` → `approved` → `provisioned`
- `pending` → `rejected`
- `pending` → `cancelled`
- `pending` → `expired`
- `approved` → `failed`

### SoD Rule

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | string (1-255) | Required |
| description | string (max 1000) | Optional |
| first_entitlement_id | UUID | First conflicting entitlement |
| second_entitlement_id | UUID | Second conflicting entitlement |
| severity | enum | `low`, `medium`, `high`, `critical` |
| status | enum | `active`, `inactive` |
| business_rationale | string (max 2000) | Optional |
| created_by | UUID | Creator user |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |

### SoD Violation

| Field | Type | Notes |
|-------|------|-------|
| rule_id | UUID | Violated rule |
| rule_name | string | Rule name |
| severity | enum | `low`, `medium`, `high`, `critical` |
| first_entitlement_id | UUID | First entitlement |
| second_entitlement_id | UUID | Second entitlement |
| user_already_has | UUID | Entitlement user holds |

### Certification Campaign

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant isolation |
| name | string (1-255) | Required |
| description | string | Optional |
| scope_type | enum | `all_users`, `department`, `application`, `entitlement` |
| scope_config | JSON object | Scope-specific config |
| reviewer_type | enum | `user_manager`, `application_owner`, `entitlement_owner`, `specific_users` |
| status | enum | `draft`, `active`, `completed`, `cancelled`, `overdue` |
| deadline | DateTime | Required, must be future |
| launched_at | DateTime | Set on launch |
| completed_at | DateTime | Set on completion |
| created_by | UUID | Creator user |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |

**Status lifecycle**: draft → active (launch) → completed/cancelled/overdue

### Certification Item

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| campaign_id | UUID | Parent campaign |
| user_id | UUID | User being reviewed |
| entitlement_id | UUID | Entitlement under review |
| reviewer_id | UUID | Assigned reviewer |
| status | enum | `pending`, `approved`, `revoked`, `skipped` |
| assignment_snapshot | JSON | Snapshot at campaign creation |
| decided_at | DateTime | Decision timestamp |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |

### Risk Score

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | Scored user |
| total_score | integer (0-100) | Composite score |
| risk_level | enum | `low` (0-25), `medium` (26-50), `high` (51-75), `critical` (76-100) |
| static_score | integer | From static factors |
| dynamic_score | integer | From dynamic factors |
| factor_breakdown | FactorContribution[] | Individual factor scores |
| peer_comparison | PeerComparison | Optional peer context |
| calculated_at | DateTime | Last calculation |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |

### Risk Score Summary (Aggregate)

| Field | Type | Notes |
|-------|------|-------|
| total_users | integer | Users with scores |
| low_count | integer | Users at low risk |
| medium_count | integer | Users at medium risk |
| high_count | integer | Users at high risk |
| critical_count | integer | Users at critical risk |
| average_score | float | Mean risk score |

## Relationships

- Entitlement → many Access Requests (via entitlement_id)
- Entitlement → many SoD Rules (via first/second_entitlement_id)
- Entitlement → many Certification Items (via entitlement_id)
- User → many Access Requests (via requester_id)
- User → many Certification Items (via user_id)
- User → one Risk Score (via user_id)
- SoD Rule → many SoD Violations (computed at query time)
- Certification Campaign → many Certification Items (via campaign_id)

## Pagination Format

All list endpoints use consistent pagination:
```
{ items: T[], total: number, limit: number, offset: number }
```

Default limit: 50, Max limit: 100, Default offset: 0

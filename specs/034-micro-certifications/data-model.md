# Data Model: Micro Certifications & Event-Driven Reviews

## Entities

### MicroCertification

An individual access review request targeting a specific user-entitlement assignment.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| tenant_id | UUID | Yes | Tenant scope |
| user_id | UUID | Yes | User whose access is being reviewed |
| assignment_id | UUID | No | Related entitlement assignment |
| entitlement_id | UUID | Yes | Entitlement being reviewed |
| trigger_rule_id | UUID | No | Rule that triggered this certification |
| reviewer_id | UUID | Yes | Currently assigned reviewer |
| status | Enum | Yes | pending, certified, revoked, delegated, skipped, expired |
| decision | String | No | Decision type (certify/revoke) when decided |
| comment | String | No | Comment provided with decision |
| decided_at | DateTime | No | When decision was made |
| delegated_to | UUID | No | User delegated to (when status=delegated) |
| escalated | Boolean | Yes | Whether certification has been escalated |
| past_deadline | Boolean | Yes | Whether certification is past its deadline |
| from_date | DateTime | No | Valid from date |
| to_date | DateTime | No | Deadline date |
| created_at | DateTime | Yes | Creation timestamp |

**Status State Machine**:
```
pending → certified (via decide)
pending → revoked (via decide)
pending → delegated (via delegate)
pending → skipped (via skip)
pending → expired (via timeout)
```

### TriggerRule

Configuration defining when and how micro certifications are generated.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| tenant_id | UUID | Yes | Tenant scope |
| name | String | Yes | Human-readable rule name |
| trigger_type | Enum | Yes | role_change, entitlement_assignment, risk_change, periodic, manual |
| scope_type | Enum | Yes | global, application, entitlement |
| scope_id | UUID | No | Application/entitlement ID when scope is not global |
| reviewer_type | Enum | Yes | manager, owner, specific |
| specific_reviewer_id | UUID | No | Required when reviewer_type=specific |
| fallback_reviewer_id | UUID | No | Fallback reviewer if primary unavailable |
| timeout_secs | Integer | No | Seconds before certification expires |
| reminder_threshold_percent | Integer | No | Percentage of timeout before sending reminder |
| auto_revoke | Boolean | Yes | Whether to auto-revoke on expiration |
| revoke_triggering_assignment | Boolean | Yes | Whether to revoke the assignment on revocation |
| is_active | Boolean | Yes | Whether rule is currently active |
| is_default | Boolean | Yes | Whether this is the default trigger rule |
| priority | Integer | No | Rule evaluation priority |
| metadata | JSON | No | Optional metadata key-value pairs |
| created_at | DateTime | Yes | Creation timestamp |

### CertificationEvent

Immutable audit record of actions taken on a micro certification.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| certification_id | UUID | Yes | Related micro certification |
| event_type | String | Yes | Event action type (created, decided, delegated, skipped, escalated, expired) |
| actor_id | UUID | No | User who performed the action |
| details | JSON | No | Additional event-specific data |
| created_at | DateTime | Yes | Event timestamp |

### MicroCertificationStats

Aggregated metrics (read-only, computed by backend).

| Field | Type | Description |
|-------|------|-------------|
| total | Integer | Total certifications count |
| pending | Integer | Currently pending |
| certified | Integer | Certified count |
| revoked | Integer | Revoked count |
| delegated | Integer | Delegated count |
| skipped | Integer | Skipped count |
| expired | Integer | Expired count |
| overdue | Integer | Past deadline but still pending |
| avg_decision_time_secs | Float | Average time to make a decision |

## Relationships

```
TriggerRule 1──∞ MicroCertification (trigger_rule_id)
MicroCertification 1──∞ CertificationEvent (certification_id)
User 1──∞ MicroCertification (user_id - subject of review)
User 1──∞ MicroCertification (reviewer_id - assigned reviewer)
```

## Pagination

All list endpoints use `{items, total, limit, offset}` format (same as governance pattern).

# Data Model: Webhooks & Authorization Policy Management

## Webhook Entities

### WebhookEventType
Predefined event categories available for subscription.

| Field | Type | Notes |
|-------|------|-------|
| event_type | string | Event identifier (e.g., "user.created") |
| category | string | Category grouping (e.g., "user", "authentication") |
| description | string | Human-readable description |

### WebhookSubscription
A registered endpoint that receives event notifications.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | Owning tenant |
| name | string | Display name |
| description | string? | Optional description |
| url | string | Target webhook URL |
| event_types | string[] | Subscribed event types |
| enabled | boolean | Active delivery toggle |
| consecutive_failures | integer | Failure count (0 = healthy) |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

**Derived Status Logic**:
- `enabled=true` && `consecutive_failures=0` → "Active"
- `enabled=true` && `consecutive_failures>0` → "Failing" (with count)
- `enabled=false` → "Paused"

**State Transitions**:
- Create → Active (enabled=true, failures=0)
- Active → Paused (PATCH enabled=false)
- Paused → Active (PATCH enabled=true)
- Active → Failing (automatic, on delivery failure)
- Failing → Active (automatic, on successful delivery)

### WebhookDelivery
A single delivery attempt for a webhook event.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| subscription_id | UUID | FK to subscription |
| event_id | UUID | Source event ID |
| event_type | string | Event type name |
| status | string | Delivery status |
| attempt_number | integer | Retry attempt count |
| response_code | integer? | HTTP response code (null if no response) |
| latency_ms | integer? | Delivery duration in ms |
| error_message | string? | Error details (null on success) |
| created_at | datetime | When delivery was attempted |
| completed_at | datetime? | When delivery completed |

### WebhookDlqEntry
A failed delivery moved to the dead letter queue.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| subscription_id | UUID | FK to subscription |
| event_id | UUID | Source event ID |
| event_type | string | Event type |
| payload | JSON | Original event payload |
| error_message | string | Last failure reason |
| original_failure_at | datetime | When first failed |
| retry_count | integer | Number of replay attempts |
| created_at | datetime | When moved to DLQ |

## Authorization Entities

### AuthorizationPolicy
A fine-grained access control rule.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | Owning tenant |
| name | string | Policy name |
| description | string? | Optional description |
| effect | enum | "allow" or "deny" |
| priority | integer | Evaluation priority (higher = first) |
| status | enum | "active" or "inactive" |
| resource_type | string? | Resource type pattern |
| action | string? | Action pattern |
| conditions | Condition[] | Structured conditions |
| created_by | UUID? | Creator user ID |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

**State Transitions**:
- Create → Active (default status)
- Active → Inactive (PUT status="inactive")
- Inactive → Active (PUT status="active")
- Any → Deactivated (DELETE = soft delete)

### PolicyCondition
A structured condition on a policy.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| policy_id | UUID | FK to policy |
| condition_type | enum | "time_window", "user_attribute", "entitlement_check" |
| attribute_path | string? | Attribute to evaluate |
| operator | enum? | "equals", "not_equals", "contains", "in_list" |
| value | JSON | Condition value |

### EntitlementActionMapping
Links a governance entitlement to a concrete resource/action pair.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | Owning tenant |
| entitlement_id | UUID | FK to governance entitlement |
| action | string | Action name |
| resource_type | string | Resource type |
| created_by | UUID? | Creator user ID |
| created_at | datetime | Creation timestamp |

### AuthorizationDecision
Result of an authorization check (not persisted, returned as response).

| Field | Type | Notes |
|-------|------|-------|
| allowed | boolean | Whether access is granted |
| reason | string | Human-readable explanation |
| source | enum | "policy", "entitlement", "default_deny" |
| policy_id | UUID? | Matched policy (if source=policy) |
| decision_id | UUID | Unique decision identifier |

## Entity Relationships

```
WebhookSubscription 1──∞ WebhookDelivery
WebhookSubscription 1──∞ WebhookDlqEntry
AuthorizationPolicy 1──∞ PolicyCondition
EntitlementActionMapping ∞──1 GovernanceEntitlement (existing)
```

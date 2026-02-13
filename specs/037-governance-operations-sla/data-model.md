# Data Model: Governance Operations & SLA Management

## Entities

### SlaPolicy

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| tenant_id | uuid | FK to tenant |
| name | string | Required, display name |
| description | string | Optional |
| category | enum | access_request, certification, provisioning, review |
| target_duration_hours | number | Required, positive integer |
| warning_threshold_hours | number | Required, positive integer, < target_duration_hours |
| escalation_policy_id | uuid | Optional FK to escalation policy |
| status | enum | active, inactive |
| created_by | string | Optional, user who created |
| created_at | datetime | Auto-set |
| updated_at | datetime | Auto-updated |

**Validation Rules**:
- `warning_threshold_hours` must be less than `target_duration_hours`
- `category` must be one of the 4 allowed values
- `name` is required, non-empty

### TicketingConfig

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| tenant_id | uuid | FK to tenant |
| name | string | Required, display name |
| system_type | enum | servicenow, jira, custom_webhook |
| base_url | string | Required, URL of external system |
| api_key_encrypted | string | Encrypted on backend, sent as plain text on create/update |
| project_key | string | Optional, required for Jira |
| issue_type | string | Optional, ticket/issue type name |
| webhook_secret | string | Optional, for custom_webhook type |
| auto_create_on | enum | access_request, certification, sod_violation |
| enabled | boolean | Whether this integration is active |
| created_by | string | Optional |
| created_at | datetime | Auto-set |
| updated_at | datetime | Auto-updated |

**Validation Rules**:
- `base_url` must be a valid URL
- `system_type` must be one of the 3 allowed values
- `project_key` required when system_type is `jira`

### BulkAction

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| tenant_id | uuid | FK to tenant |
| name | string | Required |
| description | string | Optional |
| action_type | enum | grant, revoke, enable, disable, delete, transition |
| target_expression | string | Expression for target selection |
| filter_expression | string | Additional filter expression |
| status | enum | draft, validated, executing, completed, failed, cancelled |
| affected_count | number | Total items affected (from preview) |
| processed_count | number | Items processed so far |
| failed_count | number | Items that failed during execution |
| created_by | string | Optional |
| created_at | datetime | Auto-set |
| executed_at | datetime | When execution started |
| completed_at | datetime | When execution finished |

**State Transitions**: draft → validated → executing → completed/failed/cancelled

### BulkActionPreview

| Field | Type | Notes |
|-------|------|-------|
| total_affected | number | Count of items matching expression |
| sample_items | array | Array of {id, name, type, current_state} |
| expression_valid | boolean | Whether expression is syntactically valid |
| warnings | string[] | Any warnings about the expression |

**Read-only** — returned by preview endpoint, not stored.

### FailedOperation

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| tenant_id | uuid | FK to tenant |
| operation_type | string | Type of operation that failed |
| operation_id | string | ID of the original operation |
| error_message | string | Human-readable error |
| error_code | string | Machine-readable error code |
| retry_count | number | Times retried |
| max_retries | number | Maximum auto-retries allowed |
| status | enum | pending_retry, retrying, dismissed, resolved |
| context | object | JSON context data for debugging |
| created_at | datetime | When the failure was recorded |
| last_retry_at | datetime | When last retry was attempted |
| resolved_at | datetime | When the operation was resolved |

### BulkStateOperation

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| tenant_id | uuid | FK to tenant |
| object_type | string | Type of objects to transition |
| target_state | string | Target lifecycle state |
| filter_expression | string | Expression to select objects |
| status | enum | queued, processing, completed, failed, cancelled |
| total_count | number | Total objects to process |
| processed_count | number | Objects processed so far |
| failed_count | number | Objects that failed |
| created_by | string | Optional |
| created_at | datetime | Auto-set |
| started_at | datetime | When processing began |
| completed_at | datetime | When processing finished |

**State Transitions**: queued → processing → completed/failed/cancelled

### ScheduledTransition

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| tenant_id | uuid | FK to tenant |
| object_id | string | ID of the target object |
| object_type | string | Type of the target object |
| target_state | string | State to transition to |
| scheduled_at | datetime | When the transition should execute |
| reason | string | Optional reason for the transition |
| status | enum | pending, executed, cancelled, failed |
| created_by | string | Optional |
| created_at | datetime | Auto-set |
| executed_at | datetime | When actually executed |

## Relationships

- **SlaPolicy** → **EscalationPolicy** (optional FK via `escalation_policy_id`)
- **FailedOperation** → Various operations via `operation_id` (polymorphic reference)
- **ScheduledTransition** → Various objects via `object_id` + `object_type` (polymorphic)
- No direct relationships between the 6 entity types within this feature

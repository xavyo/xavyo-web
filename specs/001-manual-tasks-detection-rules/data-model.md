# Data Model: Manual Provisioning Tasks & Detection Rules

**Date**: 2026-02-13

## Entities

### ManualTask

A provisioning work item that an IT operator must complete manually.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| assignment_id | UUID | Related role assignment |
| application_id | UUID | Target application |
| application_name | string (nullable) | Application display name |
| user_id | UUID | Affected user |
| user_name | string (nullable) | User display name |
| entitlement_id | UUID | Entitlement being provisioned |
| entitlement_name | string (nullable) | Entitlement display name |
| operation_type | enum | grant, revoke, modify |
| status | enum | pending, in_progress, completed, rejected, cancelled |
| assignee_id | UUID (nullable) | Assigned operator |
| assignee_name | string (nullable) | Operator display name |
| sla_deadline | datetime (nullable) | SLA deadline timestamp |
| sla_warning_sent | boolean | Whether SLA warning was sent |
| sla_breached | boolean | Whether SLA is breached |
| retry_count | integer | Number of retry attempts |
| next_retry_at | datetime (nullable) | Next retry timestamp |
| notes | string (nullable) | Completion/rejection notes |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |
| completed_at | datetime (nullable) | Completion timestamp |

**State Transitions**:
```
pending → in_progress (via start, requires claim first)
pending → cancelled (via cancel)
in_progress → completed (via confirm)
in_progress → rejected (via reject)
```

**Validation Rules**:
- Reject reason: 5-1000 characters, mandatory
- Confirm notes: optional, no length limit
- Claim: only on unassigned pending tasks
- Start: only by assignee on pending tasks

### ManualTaskDashboard

Aggregated metrics for the manual task queue.

| Field | Type | Description |
|-------|------|-------------|
| pending_count | integer | Tasks in pending status |
| in_progress_count | integer | Tasks in in_progress status |
| sla_at_risk_count | integer | Tasks nearing SLA deadline |
| sla_breached_count | integer | Tasks past SLA deadline |
| completed_today | integer | Tasks completed today |
| average_completion_time_seconds | float (nullable) | Average time to complete |

### SemiManualApplication

Configuration marking an application as requiring manual provisioning.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Application ID |
| name | string | Application name |
| description | string (nullable) | Application description |
| is_semi_manual | boolean | Whether semi-manual mode is enabled |
| ticketing_config_id | UUID (nullable) | Linked ticketing configuration |
| sla_policy_id | UUID (nullable) | Linked SLA policy |
| requires_approval_before_ticket | boolean | Whether approval is needed before ticket creation |
| status | string | Application status |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

**Validation Rules**:
- is_semi_manual: required boolean
- requires_approval_before_ticket: required boolean, default false
- ticketing_config_id: optional UUID reference
- sla_policy_id: optional UUID reference

### DetectionRule

A rule for detecting orphan or problematic accounts.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| name | string | Rule name (1-100 chars, unique per tenant) |
| rule_type | enum | NoManager, Terminated, Inactive, Custom |
| is_enabled | boolean | Whether rule is active |
| priority | integer | Execution priority (min: 1, default: 100) |
| parameters | JSON | Type-specific parameters |
| description | string (nullable) | Rule description (max 500 chars) |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

**Type-Specific Parameters**:
- NoManager: `{}` (empty)
- Terminated: `{}` (empty)
- Inactive: `{ "days_threshold": number }` (default: 90)
- Custom: `{ "expression": string }`

**Validation Rules**:
- name: 1-100 characters, unique per tenant
- description: max 500 characters
- priority: minimum 1
- rule_type: one of NoManager, Terminated, Inactive, Custom

## Relationships

```
ManualTask → Application (via application_id)
ManualTask → User (via user_id)
ManualTask → Operator (via assignee_id)
ManualTask → Entitlement (via entitlement_id)
ManualTask → RoleAssignment (via assignment_id)
SemiManualApplication → TicketingConfig (via ticketing_config_id, optional)
SemiManualApplication → SlaPolicy (via sla_policy_id, optional)
```

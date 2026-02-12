# Data Model: Approval Workflow Configuration

## Entities

### ApprovalWorkflow

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| tenant_id | UUID | Yes | Owning tenant |
| name | string | Yes | Workflow name (1-200 chars) |
| description | string | No | Optional description |
| status | WorkflowStatus | Yes | active, disabled, archived |
| is_default | boolean | Yes | Whether this is the tenant default |
| steps | ApprovalStep[] | Yes | Ordered list of approval steps |
| created_at | datetime | Yes | Creation timestamp |
| updated_at | datetime | Yes | Last update timestamp |
| created_by | UUID | No | Creator user ID |

### ApprovalStep

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| workflow_id | UUID | Yes | Parent workflow |
| step_order | number | Yes | Position in workflow (1-based) |
| group_id | UUID | Yes | Approval group for this step |
| required_approvals | number | Yes | How many approvals needed (min 1) |
| timeout_hours | number | No | Hours before escalation triggers |
| escalation_policy_id | UUID | No | Escalation policy to apply |
| created_at | datetime | Yes | Creation timestamp |

### ApprovalGroup

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| tenant_id | UUID | Yes | Owning tenant |
| name | string | Yes | Group name (1-200 chars) |
| description | string | No | Optional description |
| status | GroupStatus | Yes | active, disabled |
| members | GroupMember[] | Yes | List of group members |
| created_at | datetime | Yes | Creation timestamp |
| updated_at | datetime | Yes | Last update timestamp |

### GroupMember

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| user_id | UUID | Yes | Member user ID |
| role | string | Yes | Member role (e.g., "approver", "admin") |
| added_at | datetime | Yes | When member was added |

### EscalationPolicy

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| tenant_id | UUID | Yes | Owning tenant |
| name | string | Yes | Policy name (1-200 chars) |
| description | string | No | Optional description |
| is_default | boolean | Yes | Whether this is the tenant default |
| levels | EscalationLevel[] | Yes | Ordered escalation levels |
| created_at | datetime | Yes | Creation timestamp |
| updated_at | datetime | Yes | Last update timestamp |

### EscalationLevel

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| policy_id | UUID | Yes | Parent policy |
| level_order | number | Yes | Position in policy (1-based) |
| target_group_id | UUID | Yes | Group to escalate to |
| timeout_hours | number | Yes | Hours before this level triggers (min 1) |
| action | EscalationAction | Yes | notify, reassign, auto_approve, auto_reject |

### EscalationEvent

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| request_id | UUID | Yes | Related access request |
| event_type | string | Yes | Type of escalation event |
| level | number | No | Escalation level that triggered |
| action_taken | string | No | Action that was executed |
| details | object | No | Additional event details |
| created_at | datetime | Yes | Event timestamp |

### SodExemption

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier |
| tenant_id | UUID | Yes | Owning tenant |
| rule_id | UUID | Yes | SoD rule being exempted |
| user_id | UUID | Yes | User granted the exemption |
| justification | string | Yes | Business justification |
| granted_by | UUID | Yes | Admin who granted it |
| expires_at | datetime | No | Optional expiration date |
| status | ExemptionStatus | Yes | active, expired, revoked |
| created_at | datetime | Yes | Creation timestamp |
| revoked_at | datetime | No | When revoked (if applicable) |
| revoked_by | UUID | No | Admin who revoked (if applicable) |

## Enums

| Enum | Values |
|------|--------|
| WorkflowStatus | active, disabled, archived |
| GroupStatus | active, disabled |
| EscalationAction | notify, reassign, auto_approve, auto_reject |
| ExemptionStatus | active, expired, revoked |

## Relationships

- ApprovalWorkflow → has many ApprovalSteps (ordered by step_order)
- ApprovalStep → belongs to one ApprovalGroup
- ApprovalStep → optionally belongs to one EscalationPolicy
- ApprovalGroup → has many GroupMembers
- EscalationPolicy → has many EscalationLevels (ordered by level_order)
- EscalationLevel → references one ApprovalGroup (target)
- SodExemption → references one SoD Rule and one User
- AccessRequest → has many EscalationEvents

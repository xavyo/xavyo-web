# Data Model: Provisioning Scripts & Hook Bindings

## Entities

### ProvisioningScript
| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| tenant_id | string (UUID) | Tenant scope |
| name | string | Script name |
| description | string | Optional description |
| current_version | number | Current active version number |
| status | enum | draft, active, inactive |
| is_system | boolean | System-managed, cannot delete |
| created_by | string | Actor ID |
| created_at | string (ISO 8601) | |
| updated_at | string (ISO 8601) | |

### ScriptVersion
| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| script_id | string (UUID) | FK to ProvisioningScript |
| version_number | number | Sequential version number |
| script_body | string | The script content |
| change_description | string | What changed in this version |
| created_by | string | Actor ID |
| created_at | string (ISO 8601) | |

### HookBinding
| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| tenant_id | string (UUID) | Tenant scope |
| script_id | string (UUID) | FK to ProvisioningScript |
| connector_id | string (UUID) | FK to Connector |
| hook_phase | enum | before, after |
| operation_type | enum | create, update, delete, enable, disable |
| execution_order | number | Ordering for same connector/operation |
| failure_policy | enum | abort, continue, retry |
| max_retries | number | Only applies when failure_policy = retry |
| timeout_seconds | number | Execution timeout |
| enabled | boolean | Active/inactive |
| created_by | string | Actor ID |
| created_at | string (ISO 8601) | |
| updated_at | string (ISO 8601) | |

### ScriptTemplate
| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| tenant_id | string (UUID) | Tenant scope |
| name | string | Template name |
| description | string | Optional description |
| category | enum | attribute_mapping, value_generation, conditional_logic, data_formatting, custom |
| template_body | string | The template content |
| placeholder_annotations | string | JSON string describing placeholders |
| is_system | boolean | System-managed, cannot delete |
| created_by | string | Actor ID |
| created_at | string (ISO 8601) | |
| updated_at | string (ISO 8601) | |

### ValidationResult
| Field | Type | Notes |
|-------|------|-------|
| valid | boolean | Whether script is syntactically valid |
| errors | array | List of {line, column, message} |

### DryRunResult
| Field | Type | Notes |
|-------|------|-------|
| success | boolean | Whether execution succeeded |
| output | string | Script output |
| error | string | Error message if failed |
| duration_ms | number | Execution time in milliseconds |

### AnalyticsDashboard
| Field | Type | Notes |
|-------|------|-------|
| total_scripts | number | Total script count |
| active_scripts | number | Active script count |
| total_executions | number | Total execution count |
| success_rate | number | Success percentage (0-100) |
| avg_duration_ms | number | Average execution duration |
| scripts | array | Per-script summary items |

### ScriptAnalytics
| Field | Type | Notes |
|-------|------|-------|
| script_id | string (UUID) | |
| name | string | Script name |
| total_executions | number | |
| success_rate | number | |
| avg_duration_ms | number | |
| p95_duration_ms | number | 95th percentile duration |
| daily_trends | array | {date, executions, successes, failures, avg_duration_ms} |
| top_errors | array | {error_message, count, last_occurred} |

### ExecutionLog
| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| tenant_id | string (UUID) | |
| script_id | string (UUID) | FK to ProvisioningScript |
| binding_id | string (UUID) | FK to HookBinding |
| connector_id | string (UUID) | FK to Connector |
| script_version | number | Version that was executed |
| status | enum | success, failure, timeout, skipped |
| dry_run | boolean | Whether this was a dry-run |
| input_context | string | JSON input |
| output | string | Script output |
| error | string | Error message if failed |
| duration_ms | number | Execution time |
| executed_by | string | Actor ID |
| executed_at | string (ISO 8601) | |

### AuditEvent
| Field | Type | Notes |
|-------|------|-------|
| event_id | string (UUID) | Primary key |
| script_id | string (UUID) | FK to ProvisioningScript |
| action | string | Action performed (create, update, activate, etc.) |
| actor_id | string | Who performed the action |
| details | string | JSON details |
| created_at | string (ISO 8601) | |

## Relationships

- ProvisioningScript 1:N ScriptVersion (versions belong to a script)
- ProvisioningScript 1:N HookBinding (bindings reference a script)
- HookBinding N:1 Connector (bindings reference a connector)
- ProvisioningScript 1:N ExecutionLog (logs reference a script)
- HookBinding 1:N ExecutionLog (logs reference a binding)
- ProvisioningScript 1:N AuditEvent (audit events reference a script)

## Pagination

All list endpoints use `{items, total, limit, offset}` format (standard governance pagination).

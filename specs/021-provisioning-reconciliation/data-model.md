# Data Model: Provisioning Operations & Reconciliation

**Date**: 2026-02-11 | **Branch**: `021-provisioning-reconciliation`

## Enums

### OperationType
Values: `create`, `update`, `delete`

### OperationStatus
Values: `pending`, `in_progress`, `completed`, `failed`, `dead_letter`, `awaiting_system`, `resolved`, `cancelled`

### DiscrepancyType
Values: `missing`, `orphan`, `mismatch`, `collision`, `unlinked`, `deleted`

### RemediationAction
Values: `create`, `update`, `delete`, `link`, `unlink`, `inactivate_identity`

### RemediationDirection
Values: `xavyo_to_target`, `target_to_xavyo`

### ResolutionStatus
Values: `pending`, `resolved`, `ignored`

### ConflictOutcome
Values: `applied`, `superseded`, `merged`, `rejected`

### ScheduleFrequency
Values: `hourly`, `daily`, `weekly`, `monthly`, `cron`

### ReconciliationMode
Values: `full`, `delta`

### ReconciliationRunStatus
Values: `pending`, `running`, `completed`, `failed`, `cancelled`, `paused`

## Entities

### ProvisioningOperation
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Unique identifier |
| tenant_id | uuid | Tenant |
| connector_id | uuid | Associated connector |
| connector_name | string | Connector display name (denormalized) |
| user_id | uuid | Associated user |
| operation_type | OperationType | create/update/delete |
| object_class | string | Target object class (e.g., "account") |
| target_uid | string? | External system identifier |
| status | OperationStatus | Current lifecycle status |
| priority | integer | Operation priority (higher = more urgent) |
| retry_count | integer | Number of retry attempts |
| max_retries | integer | Maximum retries before DLQ |
| error_message | string? | Last error message |
| payload | object | Operation payload (JSON) |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |
| completed_at | datetime? | Completion timestamp |
| resolution_notes | string? | Notes when resolved from DLQ |

### ExecutionAttempt
| Field | Type | Description |
|-------|------|-------------|
| attempt_number | integer | Sequential attempt number |
| started_at | datetime | Attempt start time |
| completed_at | datetime? | Attempt completion time |
| success | boolean | Whether attempt succeeded |
| error_code | string? | Error code if failed |
| error_message | string? | Error message if failed |
| duration_ms | integer | Duration in milliseconds |

### OperationLog
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Log entry ID |
| operation_id | uuid | Parent operation |
| timestamp | datetime | Log timestamp |
| level | string | Log level (info/warn/error) |
| message | string | Log message |

### ProvisioningConflict
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Unique identifier |
| tenant_id | uuid | Tenant |
| operation_id_a | uuid | First conflicting operation |
| operation_id_b | uuid | Second conflicting operation |
| conflict_type | string | Type of conflict |
| affected_attributes | string[] | Attributes involved |
| status | string | pending/resolved |
| outcome | ConflictOutcome? | Resolution outcome |
| notes | string? | Resolution notes |
| created_at | datetime | Detection timestamp |
| resolved_at | datetime? | Resolution timestamp |
| resolved_by | uuid? | User who resolved |

### ReconciliationRun
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Run identifier |
| connector_id | uuid | Target connector |
| mode | ReconciliationMode | full or delta |
| dry_run | boolean | Whether this is a dry run |
| status | ReconciliationRunStatus | Current status |
| started_at | datetime | Run start time |
| completed_at | datetime? | Run completion time |
| accounts_processed | integer | Number of accounts checked |
| discrepancies_found | integer | Number of discrepancies |
| duration_seconds | number? | Total duration |
| created_by | uuid | User who triggered |

### ReconciliationReport
| Field | Type | Description |
|-------|------|-------------|
| run_id | uuid | Associated run |
| discrepancy_summary | DiscrepancySummary | Counts by type |
| action_summary | ActionSummary | Counts by action taken |
| top_mismatched_attributes | MismatchedAttribute[] | Most common mismatches |
| performance_metrics | PerformanceMetrics | Timing and throughput |

### DiscrepancySummary
| Field | Type | Description |
|-------|------|-------------|
| total | integer | Total discrepancies |
| by_type | Record<DiscrepancyType, integer> | Counts per type |

### ActionSummary
| Field | Type | Description |
|-------|------|-------------|
| total | integer | Total actions |
| by_action | Record<string, integer> | Counts per action type |

### MismatchedAttribute
| Field | Type | Description |
|-------|------|-------------|
| attribute_name | string | Attribute that mismatched |
| count | integer | Number of mismatches |

### PerformanceMetrics
| Field | Type | Description |
|-------|------|-------------|
| total_duration_ms | integer | Total run duration |
| accounts_per_second | number | Processing throughput |
| api_calls_made | integer | External API calls |

### Discrepancy
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Unique identifier |
| connector_id | uuid | Connector |
| run_id | uuid | Reconciliation run |
| discrepancy_type | DiscrepancyType | Type classification |
| identity_id | uuid? | Internal identity ID |
| external_uid | string? | External system identifier |
| attribute_name | string? | Mismatched attribute (for mismatch type) |
| expected_value | string? | Expected value |
| actual_value | string? | Actual value found |
| resolution_status | ResolutionStatus | Current resolution state |
| resolved_at | datetime? | Resolution timestamp |
| resolved_by | uuid? | User who resolved |
| created_at | datetime | Detection timestamp |

### RemediationResult
| Field | Type | Description |
|-------|------|-------------|
| discrepancy_id | uuid | Target discrepancy |
| action | RemediationAction | Action taken |
| direction | RemediationDirection | Direction of change |
| success | boolean | Whether remediation succeeded |
| error | string? | Error if failed |
| changes | object? | Description of changes made |

### ReconciliationSchedule
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Schedule identifier |
| connector_id | uuid | Target connector |
| connector_name | string? | Connector display name |
| mode | ReconciliationMode | full or delta |
| frequency | ScheduleFrequency | How often to run |
| day_of_week | integer? | 0-6 for weekly |
| day_of_month | integer? | 1-31 for monthly |
| hour_of_day | integer | 0-23 hour to run |
| cron_expression | string? | Custom cron (for cron frequency) |
| enabled | boolean | Whether schedule is active |
| last_run_at | datetime? | Last execution time |
| next_run_at | datetime? | Next scheduled execution |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

### ReconciliationAction (Audit Log Entry)
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Action identifier |
| connector_id | uuid | Connector |
| discrepancy_id | uuid? | Related discrepancy |
| action_type | string | Type of action |
| result | string | Action result |
| dry_run | boolean | Whether it was a dry run |
| performed_by | uuid | User who performed |
| performed_at | datetime | Timestamp |
| details | object? | Additional details |

### DiscrepancyTrendPoint
| Field | Type | Description |
|-------|------|-------------|
| date | string | Date label (ISO date) |
| total | integer | Total discrepancies |
| by_type | Record<DiscrepancyType, integer>? | Optional breakdown |

### QueueStatistics
| Field | Type | Description |
|-------|------|-------------|
| pending | integer | Pending count |
| in_progress | integer | In-progress count |
| completed | integer | Completed count |
| failed | integer | Failed count |
| dead_letter | integer | Dead letter count |
| awaiting_system | integer | Awaiting system count |
| avg_processing_time_secs | number | Average processing time |

## Relationships

- ProvisioningOperation → Connector (many-to-one via connector_id)
- ProvisioningOperation → ExecutionAttempt (one-to-many)
- ProvisioningOperation → OperationLog (one-to-many)
- ProvisioningConflict → ProvisioningOperation (many-to-two via operation_id_a/b)
- ReconciliationRun → Connector (many-to-one via connector_id)
- ReconciliationRun → ReconciliationReport (one-to-one)
- ReconciliationRun → Discrepancy (one-to-many)
- Discrepancy → RemediationResult (one-to-one, optional)
- ReconciliationSchedule → Connector (one-to-one)
- ReconciliationAction → Discrepancy (many-to-one, optional)

## State Transitions

### Operation Lifecycle
```
pending → in_progress → completed
                     → failed → [retry] → pending
                             → dead_letter → [retry] → pending
                                          → resolved
pending → cancelled
```

### Reconciliation Run Lifecycle
```
pending → running → completed
                 → failed
                 → cancelled
                 → paused → [resume] → running
```

### Discrepancy Resolution
```
pending → resolved (via remediation)
       → ignored
```

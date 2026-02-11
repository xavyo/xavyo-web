# Data Model: Governance Reporting & Analytics

## Entities

### ReportTemplate

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID or null | Null for system templates |
| name | string | Unique per tenant |
| description | string or null | Optional |
| template_type | enum | access_review, sod_violations, certification_status, user_access, audit_trail |
| compliance_standard | enum or null | sox, gdpr, hipaa, custom |
| definition | TemplateDefinition | Nested structure (see below) |
| is_system | boolean | True for built-in templates |
| cloned_from | UUID or null | Source template if cloned |
| status | enum | active, archived |
| created_by | UUID or null | User who created |
| created_at | datetime | |
| updated_at | datetime | |

### TemplateDefinition (nested)

| Field | Type | Notes |
|-------|------|-------|
| data_sources | string[] | e.g., ["entitlements", "users"] |
| filters | TemplateFilter[] | Configurable filter fields |
| columns | TemplateColumn[] | Report output columns |
| grouping | string[] | Fields to group by |
| default_sort | { field, direction } or null | Default sort configuration |

### TemplateFilter (nested)

| Field | Type | Notes |
|-------|------|-------|
| field | string | Filter field name |
| type | string | Filter type (text, select, date, etc.) |
| required | boolean | Whether filter is required |
| options | object or null | Available options for select filters |
| default | any or null | Default value |

### TemplateColumn (nested)

| Field | Type | Notes |
|-------|------|-------|
| field | string | Column data field |
| label | string | Display label |
| sortable | boolean | Whether column is sortable |

### GeneratedReport

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | |
| template_id | UUID | FK to ReportTemplate |
| name | string | Report name |
| status | enum | pending, generating, completed, failed |
| parameters | object | Generation parameters |
| output_format | enum | json, csv |
| record_count | integer or null | Number of records (when completed) |
| file_size_bytes | integer or null | Output size (when completed) |
| error_message | string or null | Error details (when failed) |
| progress_percent | integer | 0-100 |
| started_at | datetime or null | |
| completed_at | datetime or null | |
| generated_by | UUID | User who triggered |
| schedule_id | UUID or null | FK to schedule (if scheduled) |
| retention_until | datetime | Auto-cleanup date |
| created_at | datetime | |

### ReportSchedule

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | |
| template_id | UUID | FK to ReportTemplate |
| name | string | Unique per tenant |
| frequency | enum | daily, weekly, monthly |
| schedule_hour | integer | 0-23 |
| schedule_day_of_week | integer or null | 0-6 (0=Sunday), required for weekly |
| schedule_day_of_month | integer or null | 1-31, required for monthly |
| parameters | object | Generation parameters |
| recipients | string[] | Email addresses |
| output_format | enum | json, csv |
| status | enum | active, paused, disabled |
| last_run_at | datetime or null | |
| next_run_at | datetime | |
| consecutive_failures | integer | Auto-disable at 3 |
| last_error | string or null | Most recent error |
| created_by | UUID | |
| created_at | datetime | |
| updated_at | datetime | |

## State Transitions

### ReportTemplate.status
```
active → archived (admin archive action, custom only)
```

### GeneratedReport.status
```
pending → generating → completed
pending → generating → failed
```

### ReportSchedule.status
```
active → paused (admin pause)
paused → active (admin resume)
active → disabled (3+ consecutive failures)
disabled → active (admin resume)
```

## Relationships

- ReportTemplate 1:N GeneratedReport (template_id)
- ReportTemplate 1:N ReportSchedule (template_id)
- ReportSchedule 1:N GeneratedReport (schedule_id)
- User 1:N GeneratedReport (generated_by)
- User 1:N ReportSchedule (created_by)
- User 1:N ReportTemplate (created_by, custom only)

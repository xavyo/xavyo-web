# Data Model: Object Templates

## Entities

### ObjectTemplate
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| tenant_id | UUID | Tenant isolation |
| name | string | Template name |
| description | string? | Optional description |
| object_type | enum: user, role, entitlement | Target object type |
| priority | integer | Ordering priority (higher = more important) |
| is_active | boolean | Whether template is currently active |
| merge_policy | string? | Conflict resolution strategy |
| rules_count | integer | Number of rules (computed) |
| scopes_count | integer | Number of scopes (computed) |
| created_at | datetime | |
| updated_at | datetime | |

### TemplateRule
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| template_id | UUID | FK to ObjectTemplate |
| attribute | string | Target attribute name |
| condition | string | When rule fires |
| action_type | enum: set_default, validate, normalize, compute | What the rule does |
| action_value | string | Action parameter/value |
| order | integer | Execution order within template |
| created_at | datetime | |

### TemplateScope
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| template_id | UUID | FK to ObjectTemplate |
| scope_type | enum: department, role, location, all | Scope category |
| scope_value | string? | Scope value (null for "all" type) |
| created_at | datetime | |

### SimulationResult (transient, not persisted)
| Field | Type | Notes |
|-------|------|-------|
| original_data | object | Input sample data |
| transformed_data | object | Output after rules applied |
| rules_applied | array | List of {rule_id, attribute, action_type, before_value, after_value} |
| warnings | string[] | Any warnings during simulation |

## Relationships

- ObjectTemplate 1:N TemplateRule (cascade delete)
- ObjectTemplate 1:N TemplateScope (cascade delete)
- ObjectTemplate has one merge_policy (stored as field, not separate entity)

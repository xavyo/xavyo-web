# Data Model: Self-Service Request Catalog & Birthright Access

**Date**: 2026-02-12
**Feature**: 031-catalog-birthright

## Entities

### CatalogCategory

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | yes | Unique identifier |
| tenant_id | UUID | yes | Tenant scope |
| name | string (1-255) | yes | Category display name |
| description | string (0-2000) | no | Category description |
| parent_id | UUID | no | Parent category for hierarchy (null = root) |
| icon | string | no | Icon identifier |
| display_order | integer | yes | Sort order within parent (default: 0) |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Last update timestamp |

**Relationships**: Self-referential parent-child hierarchy. Has many CatalogItems.

### CatalogItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | yes | Unique identifier |
| tenant_id | UUID | yes | Tenant scope |
| category_id | UUID | no | Parent category (null = uncategorized) |
| item_type | enum: Role, Entitlement, Resource | yes | Type of access item |
| name | string (1-255) | yes | Item display name |
| description | string (0-10000) | no | Detailed description |
| reference_id | UUID | no | Link to existing role/entitlement in governance |
| requestability_rules | RequestabilityRules | no | Who can request this item |
| form_fields | FormField[] | no | Custom form fields for data collection |
| tags | string[] | no | Search tags (max 50) |
| icon | string | no | Icon identifier |
| is_enabled | boolean | yes | Whether item is visible to users |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Last update timestamp |

**Computed fields** (added by backend per-request):
- `can_request`: boolean — whether current user/beneficiary can request this
- `cannot_request_reason`: string | null — reason if not requestable

### RequestabilityRules

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| self_request | boolean | no | User can request for themselves |
| manager_request | boolean | no | Manager can request on behalf of reports |
| department_restriction | string[] | no | Only users in these departments |
| archetype_restriction | string[] | no | Only users with these archetypes |
| prerequisite_roles | UUID[] | no | Must have these roles already |
| prerequisite_entitlements | UUID[] | no | Must have these entitlements already |

### FormField

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Field identifier |
| label | string | yes | Display label |
| field_type | string | yes | Input type (text, number, select, textarea) |
| required | boolean | yes | Whether field is mandatory |
| options | string[] | no | Options for select fields |
| placeholder | string | no | Placeholder text |

### Cart

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| requester_id | UUID | yes | User who owns the cart |
| beneficiary_id | UUID | no | Who the request is for (null = self) |
| items | CartItem[] | yes | Items in the cart |
| item_count | integer | yes | Total items |
| created_at | datetime | yes | Cart creation timestamp |
| updated_at | datetime | yes | Last modification timestamp |

### CartItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | yes | Cart item identifier |
| catalog_item_id | UUID | yes | Reference to catalog item |
| catalog_item_name | string | yes | Denormalized item name |
| catalog_item_type | enum | yes | Denormalized item type |
| parameters | JSON | no | Parametric role values |
| form_values | JSON | no | Custom form field values |
| added_at | datetime | yes | When added to cart |

### CartValidationResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| valid | boolean | yes | Whether cart passes validation |
| issues | ValidationIssue[] | yes | Blocking issues |
| sod_violations | SodViolation[] | yes | Warning-level SoD conflicts |

### ValidationIssue

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cart_item_id | UUID | no | Specific item with issue (null = cart-level) |
| code | string | yes | Issue code (e.g., MISSING_FIELD, ITEM_DISABLED) |
| message | string | yes | Human-readable description |

### CartSodViolation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rule_id | UUID | yes | SoD rule identifier |
| rule_name | string | yes | SoD rule name |
| conflicting_item_ids | UUID[] | yes | Cart items that conflict |
| description | string | yes | Conflict description |

### CartSubmissionResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| submission_id | UUID | yes | Groups all created requests |
| items | SubmissionItem[] | yes | Per-item results |
| request_count | integer | yes | Total requests created |

### SubmissionItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cart_item_id | UUID | yes | Original cart item |
| access_request_id | UUID | yes | Created access request |

### BirthrightPolicy

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | yes | Unique identifier |
| tenant_id | UUID | yes | Tenant scope |
| name | string (1-255) | yes | Policy name |
| description | string | no | Policy description |
| priority | integer | yes | Higher = evaluated first |
| status | enum: Active, Archived | yes | Policy lifecycle status |
| conditions | PolicyCondition[] | yes | Match conditions (min 1) |
| entitlement_ids | UUID[] | yes | Entitlements to grant (min 1) |
| evaluation_mode | enum: FirstMatch, AllMatch | yes | How conditions are evaluated |
| grace_period_days | integer (0-365) | no | Delay before revoking on unmatch |
| is_enabled | boolean | yes | Whether policy is active |
| created_by | UUID | yes | Admin who created |
| created_at | datetime | yes | Creation timestamp |
| updated_at | datetime | yes | Last update timestamp |

### PolicyCondition

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attribute | string | yes | User attribute to check (e.g., "department") |
| operator | enum: Equals, NotEquals, In, NotIn, Contains, StartsWith, EndsWith | yes | Comparison operator |
| value | JSON | yes | Expected value (string for simple ops, array for In/NotIn) |

### SimulatePolicyResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| matches | boolean | yes | Whether policy matched |
| condition_results | ConditionResult[] | yes | Per-condition evaluation |

### ConditionResult

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attribute | string | yes | Attribute checked |
| operator | string | yes | Operator used |
| expected | JSON | yes | Expected value |
| actual | JSON | no | Actual value found |
| matched | boolean | yes | Whether condition matched |

### SimulateAllPoliciesResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attributes | JSON | yes | Input attributes (echoed back) |
| matching_policies | MatchingPolicy[] | yes | Policies that matched |
| total_entitlements | UUID[] | yes | Combined entitlements from all matches |

### MatchingPolicy

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| policy_id | UUID | yes | Policy that matched |
| policy_name | string | yes | Policy name |
| entitlement_ids | UUID[] | yes | Entitlements this policy grants |

## State Transitions

### CatalogItem Lifecycle
```
Created (enabled) → Disabled → Re-enabled → Deleted
```
- Only admins can change state
- Disabled items not visible to users
- Delete fails if item is in any cart

### BirthrightPolicy Lifecycle
```
Created (Active, enabled) → Disabled → Re-enabled → Archived (soft-delete)
```
- Only admins can change state
- Archived policies are hidden from default list
- Disabled policies don't auto-assign entitlements

## Pagination

All list endpoints use `{items, total, limit, offset}` format (same as governance pattern).
Default limit: 50. Maximum limit: 100.

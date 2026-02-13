# API Contract: Micro Certification Trigger Rules

## GET /governance/micro-cert-triggers

List trigger rules with filtering.

**Query Parameters**:
- `trigger_type` (string, optional): Filter by type
- `scope_type` (string, optional): Filter by scope
- `is_active` (boolean, optional): Filter by active status
- `limit` (integer, optional, default: 20)
- `offset` (integer, optional, default: 0)

**Response 200**:
```json
{
  "items": [TriggerRule],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

**Auth**: Admin only

## GET /governance/micro-cert-triggers/{id}

Get trigger rule detail.

**Response 200**: `TriggerRule`
**Response 404**: Not found

**Auth**: Admin only

## POST /governance/micro-cert-triggers

Create a new trigger rule.

**Request Body**:
```json
{
  "name": "string (required)",
  "trigger_type": "role_change | entitlement_assignment | risk_change | periodic | manual",
  "scope_type": "global | application | entitlement",
  "scope_id": "uuid (required when scope_type != global)",
  "reviewer_type": "manager | owner | specific",
  "specific_reviewer_id": "uuid (required when reviewer_type = specific)",
  "fallback_reviewer_id": "uuid (optional)",
  "timeout_secs": "integer (optional)",
  "reminder_threshold_percent": "integer 0-100 (optional)",
  "auto_revoke": "boolean (default: false)",
  "revoke_triggering_assignment": "boolean (default: false)",
  "is_default": "boolean (default: false)",
  "priority": "integer (optional)",
  "metadata": "object (optional)"
}
```

**Response 201**: Created `TriggerRule`
**Response 400**: Validation error

**Auth**: Admin only

## PUT /governance/micro-cert-triggers/{id}

Update a trigger rule.

**Request Body**: Same fields as POST (all optional)

**Response 200**: Updated `TriggerRule`
**Response 404**: Not found

**Auth**: Admin only

## DELETE /governance/micro-cert-triggers/{id}

Delete a trigger rule.

**Response 204**: Deleted
**Response 404**: Not found

**Auth**: Admin only

## POST /governance/micro-cert-triggers/{id}/enable

Enable a trigger rule.

**Response 200**: Updated `TriggerRule` (is_active: true)
**Response 404**: Not found

**Auth**: Admin only

## POST /governance/micro-cert-triggers/{id}/disable

Disable a trigger rule.

**Response 200**: Updated `TriggerRule` (is_active: false)
**Response 404**: Not found

**Auth**: Admin only

## POST /governance/micro-cert-triggers/{id}/set-default

Set a trigger rule as the default.

**Response 200**: Updated `TriggerRule` (is_default: true)
**Response 404**: Not found

**Auth**: Admin only

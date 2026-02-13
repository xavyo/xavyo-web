# API Contract: Micro Certifications

## GET /governance/micro-certifications

List micro certifications with filtering.

**Query Parameters**:
- `status` (string, optional): Filter by status (pending, certified, revoked, delegated, skipped, expired)
- `user_id` (UUID, optional): Filter by subject user
- `reviewer_id` (UUID, optional): Filter by assigned reviewer
- `entitlement_id` (UUID, optional): Filter by entitlement
- `escalated` (boolean, optional): Filter by escalation flag
- `past_deadline` (boolean, optional): Filter by overdue flag
- `limit` (integer, optional, default: 20): Page size
- `offset` (integer, optional, default: 0): Page offset

**Response 200**:
```json
{
  "items": [MicroCertification],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

**Auth**: Admin only (hasAdminRole)

## GET /governance/micro-certifications/my-pending

Get current user's pending certifications.

**Query Parameters**:
- `limit` (integer, optional)
- `offset` (integer, optional)

**Response 200**:
```json
{
  "items": [MicroCertification],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

**Auth**: Any authenticated user

## GET /governance/micro-certifications/{id}

Get micro certification detail.

**Response 200**: `MicroCertification`
**Response 404**: Not found

**Auth**: Admin or assigned reviewer

## POST /governance/micro-certifications/{id}/decide

Make decision on a certification.

**Request Body**:
```json
{
  "decision": "certify" | "revoke",
  "comment": "string (optional for certify, required for revoke)"
}
```

**Response 200**: Updated `MicroCertification`
**Response 400**: Invalid decision or certification not in pending state
**Response 403**: Not the assigned reviewer
**Response 404**: Not found

**Auth**: Assigned reviewer

## POST /governance/micro-certifications/{id}/delegate

Delegate certification to another reviewer.

**Request Body**:
```json
{
  "delegate_to": "uuid",
  "comment": "string (optional)"
}
```

**Response 200**: Updated `MicroCertification`
**Response 400**: Cannot delegate to self, certification not pending
**Response 404**: Not found

**Auth**: Assigned reviewer

## POST /governance/micro-certifications/{id}/skip

Skip a certification.

**Request Body**:
```json
{
  "comment": "string (optional)"
}
```

**Response 200**: Updated `MicroCertification`
**Response 400**: Certification not pending
**Response 404**: Not found

**Auth**: Assigned reviewer

## POST /governance/micro-certifications/bulk-decide

Bulk decision on multiple certifications.

**Request Body**:
```json
{
  "certification_ids": ["uuid", "uuid"],
  "decision": "certify" | "revoke",
  "comment": "string (optional)"
}
```

**Response 200**: Bulk result with success/failure counts
**Response 400**: Empty certification_ids array

**Auth**: Admin only

## POST /governance/micro-certifications/trigger

Manually trigger a micro certification.

**Request Body**:
```json
{
  "user_id": "uuid",
  "entitlement_id": "uuid",
  "trigger_rule_id": "uuid (optional)",
  "reviewer_id": "uuid (optional)",
  "reason": "string"
}
```

**Response 201**: Created `MicroCertification`
**Response 400**: Invalid user-entitlement combination
**Response 409**: Pending certification already exists for this pair

**Auth**: Admin only

# API Contract: My Approvals

## GET /governance/my-approvals

List approval items assigned to the current user.

**Auth**: Any authenticated user
**Query**: `?status=pending&limit=20&offset=0`
**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "request_id": "uuid",
      "requester_id": "uuid",
      "requester_email": "alice@example.com",
      "resource_type": "entitlement",
      "resource_name": "Admin Access",
      "reason": "Need admin access for project X",
      "status": "pending",
      "decision_comment": null,
      "submitted_at": "2026-02-10T14:00:00Z",
      "decided_at": null
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

## POST /governance/my-approvals/{id}/approve

Approve a pending request.

**Auth**: Any authenticated user (must be assigned approver)
**Request Body**:
```json
{
  "comment": "Approved for project X"
}
```
**Response 200**: Updated approval item with status "approved"

## POST /governance/my-approvals/{id}/reject

Reject a pending request.

**Auth**: Any authenticated user (must be assigned approver)
**Request Body**:
```json
{
  "comment": "Insufficient justification"
}
```
**Response 200**: Updated approval item with status "rejected"

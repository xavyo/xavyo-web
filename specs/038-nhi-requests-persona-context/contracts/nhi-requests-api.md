# NHI Requests API Contract

## POST /governance/nhis/requests
Submit a new NHI access request.
- Body: `{ name: string, purpose: string, requested_permissions?: string[], requested_expiration?: string, rotation_interval_days?: number }`
- Response 201: `NhiAccessRequest`

## GET /governance/nhis/requests
List NHI requests with filtering.
- Query: `status?`, `requester_id?`, `pending_only?`, `limit?`, `offset?`
- Response 200: `{ items: NhiAccessRequest[], total: number, limit: number, offset: number }`

## GET /governance/nhis/requests/summary
Get request summary counts.
- Response 200: `NhiRequestSummary`

## GET /governance/nhis/requests/my-pending
List current user's pending requests.
- Response 200: `{ items: NhiAccessRequest[], total: number }`

## GET /governance/nhis/requests/{request_id}
Get request detail.
- Response 200: `NhiAccessRequest`

## POST /governance/nhis/requests/{request_id}/approve
Approve a pending request (admin only).
- Body: `{ comments?: string }`
- Response 200: `NhiAccessRequest`

## POST /governance/nhis/requests/{request_id}/reject
Reject a pending request (admin only).
- Body: `{ reason: string }` (min 5 chars)
- Response 200: `NhiAccessRequest`

## POST /governance/nhis/requests/{request_id}/cancel
Cancel own pending request.
- Response 200: `NhiAccessRequest`

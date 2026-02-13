# API Contract: Access Requests

## List User's Access Requests
```
GET /governance/access-requests?status={status}&entitlement_id={id}&limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": AccessRequestResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

## Submit Access Request (User Self-Service)
```
POST /governance/access-requests
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Body:
{
  "entitlement_id": "UUID",
  "justification": "string (min 20 chars)",
  "requested_expires_at?": "DateTime"
}

Response 201:
{
  "request": AccessRequestResponse,
  "sod_warning_message?": "string"
}
```

## Get Access Request
```
GET /governance/access-requests/{id}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200: AccessRequestResponse
```

## Cancel Access Request (User)
```
POST /governance/access-requests/{id}/cancel
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200: AccessRequestResponse
```

## Approve Access Request (Admin)
```
POST /governance/access-requests/{id}/approve
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Body:
{
  "notes?": "string"
}

Response 200: AccessRequestResponse
```

## Reject Access Request (Admin)
```
POST /governance/access-requests/{id}/reject
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Body:
{
  "reason": "string"
}

Response 200: AccessRequestResponse
```

## List Pending Approvals (Admin)
```
GET /governance/my-approvals?limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": AccessRequestResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

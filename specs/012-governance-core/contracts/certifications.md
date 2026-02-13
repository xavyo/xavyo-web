# API Contract: Certification Campaigns

## List Campaigns
```
GET /governance/certification-campaigns?status={status}&limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": CertificationCampaignResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

## Create Campaign
```
POST /governance/certification-campaigns
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Body:
{
  "name": "string (1-255)",
  "description?": "string",
  "scope_type": "all_users|department|application|entitlement",
  "scope_config": {
    "application_id?": "UUID",
    "entitlement_id?": "UUID",
    "department?": "string"
  },
  "reviewer_type": "user_manager|application_owner|entitlement_owner|specific_users",
  "specific_reviewers?": "UUID[]",
  "deadline": "DateTime (must be future)"
}

Response 201: CertificationCampaignResponse
```

## Get Campaign
```
GET /governance/certification-campaigns/{id}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200: CertificationCampaignResponse
```

## Update Campaign (draft only)
```
PUT /governance/certification-campaigns/{id}
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Body: (same as create, all fields optional)

Response 200: CertificationCampaignResponse
```

## Delete Campaign
```
DELETE /governance/certification-campaigns/{id}
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Response 204
```

## Launch Campaign
```
POST /governance/certification-campaigns/{id}/launch
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Response 200: CertificationCampaignResponse (status: active)
```

## Cancel Campaign
```
POST /governance/certification-campaigns/{id}/cancel
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Response 200: CertificationCampaignResponse (status: cancelled)
```

## Get Campaign Progress
```
GET /governance/certification-campaigns/{id}/progress
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "total_items": number,
  "pending_items": number,
  "approved_items": number,
  "revoked_items": number,
  "completion_percentage": number (0-100)
}
```

## List Campaign Items
```
GET /governance/certification-campaigns/{campaignId}/items?limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": CertificationItemResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

## Get Certification Item
```
GET /governance/certification-items/{id}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200: CertificationItemResponse
```

## Decide on Certification Item
```
POST /governance/certification-items/{id}/decide
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Body:
{
  "decision": "approved|revoked",
  "notes?": "string"
}

Response 200: CertificationItemResponse
```

## My Pending Certifications
```
GET /governance/my-certifications?limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": CertificationItemResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

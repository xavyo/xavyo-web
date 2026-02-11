# API Contract: Entitlements

## List Entitlements
```
GET /governance/entitlements?status={status}&risk_level={level}&classification={class}&limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": EntitlementResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

## Create Entitlement
```
POST /governance/entitlements
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Body:
{
  "application_id": "UUID",
  "name": "string (1-255)",
  "description?": "string (max 2000)",
  "risk_level": "low|medium|high|critical",
  "owner_id?": "UUID",
  "external_id?": "string (max 255)",
  "metadata?": {},
  "is_delegable?": true,
  "data_protection_classification": "none|personal|sensitive|special_category",
  "legal_basis?": "consent|contract|legal_obligation|vital_interest|public_task|legitimate_interest",
  "retention_period_days?": number,
  "data_controller?": "string (max 500)",
  "data_processor?": "string (max 500)",
  "purposes?": string[]
}

Response 201: EntitlementResponse
```

## Get Entitlement
```
GET /governance/entitlements/{id}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200: EntitlementResponse
```

## Update Entitlement
```
PUT /governance/entitlements/{id}
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Body: (same as create, all fields optional)

Response 200: EntitlementResponse
```

## Delete Entitlement
```
DELETE /governance/entitlements/{id}
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Response 204
```

## Set Entitlement Owner
```
PUT /governance/entitlements/{id}/owner
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Body: { "owner_id": "UUID" }

Response 200: EntitlementResponse
```

## Remove Entitlement Owner
```
DELETE /governance/entitlements/{id}/owner
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200: EntitlementResponse
```

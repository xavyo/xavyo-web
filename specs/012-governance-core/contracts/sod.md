# API Contract: Separation of Duties (SoD)

## List SoD Rules
```
GET /governance/sod-rules?status={status}&severity={sev}&entitlement_id={id}&limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": SodRuleResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

## Create SoD Rule
```
POST /governance/sod-rules
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Body:
{
  "name": "string (1-255)",
  "description?": "string (max 1000)",
  "first_entitlement_id": "UUID",
  "second_entitlement_id": "UUID",
  "severity": "low|medium|high|critical",
  "business_rationale?": "string (max 2000)"
}

Response 201: SodRuleResponse
```

## Get SoD Rule
```
GET /governance/sod-rules/{id}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200: SodRuleResponse
```

## Update SoD Rule
```
PUT /governance/sod-rules/{id}
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Body: (same as create, all fields optional)

Response 200: SodRuleResponse
```

## Delete SoD Rule
```
DELETE /governance/sod-rules/{id}
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Response 204
```

## Enable SoD Rule
```
POST /governance/sod-rules/{id}/enable
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Response 200: SodRuleResponse
```

## Disable SoD Rule
```
POST /governance/sod-rules/{id}/disable
Authorization: Bearer {token} (admin required)
X-Tenant-ID: {tenantId}

Response 200: SodRuleResponse
```

## List SoD Violations
```
GET /governance/sod-violations?limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": SodViolationResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

## SoD Pre-flight Check
```
POST /governance/sod-check
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Body:
{
  "entitlement_id": "UUID",
  "user_id": "UUID"
}

Response 200:
{
  "has_violations": boolean,
  "violations": SodViolationInfo[]
}
```

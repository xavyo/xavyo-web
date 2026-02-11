# API Contract: SAML Service Providers & Certificates

## BFF Proxy Endpoints

### GET /api/federation/saml/service-providers

**Backend**: `GET /admin/saml/service-providers`
**Auth**: Admin role required

**Query Parameters**:
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| offset | number | 0 | Pagination offset |
| limit | number | 20 | Items per page |
| enabled | boolean | - | Filter by enabled status |

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Salesforce SSO",
      "entity_id": "https://salesforce.com/sp",
      "acs_urls": ["https://salesforce.com/acs"],
      "certificate": "-----BEGIN CERTIFICATE-----...",
      "attribute_mapping": { "email": "emailAddress" },
      "name_id_format": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
      "sign_assertions": true,
      "validate_signatures": false,
      "assertion_validity_seconds": 300,
      "enabled": true,
      "metadata_url": "https://salesforce.com/metadata",
      "created_at": "2026-02-01T10:00:00Z",
      "updated_at": "2026-02-05T10:00:00Z"
    }
  ],
  "total": 1,
  "offset": 0,
  "limit": 20
}
```

### POST /api/federation/saml/service-providers

**Backend**: `POST /admin/saml/service-providers`
**Auth**: Admin role required

**Request Body**:
```json
{
  "name": "Salesforce SSO",
  "entity_id": "https://salesforce.com/sp",
  "acs_urls": ["https://salesforce.com/acs"],
  "certificate": "-----BEGIN CERTIFICATE-----...",
  "attribute_mapping": { "email": "emailAddress" },
  "name_id_format": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  "sign_assertions": true,
  "validate_signatures": false,
  "assertion_validity_seconds": 300,
  "metadata_url": "https://salesforce.com/metadata"
}
```

**Response** (201): Created ServiceProvider object

### GET /api/federation/saml/service-providers/[id]

**Backend**: `GET /admin/saml/service-providers/{id}`
**Auth**: Admin role required

**Response** (200): Single ServiceProvider object

### PUT /api/federation/saml/service-providers/[id]

**Backend**: `PUT /admin/saml/service-providers/{id}`
**Auth**: Admin role required

**Request Body**: Partial update
**Response** (200): Updated ServiceProvider object

### DELETE /api/federation/saml/service-providers/[id]

**Backend**: `DELETE /admin/saml/service-providers/{id}`
**Auth**: Admin role required

**Response** (204): No content

---

## Certificate Endpoints

### GET /api/federation/saml/certificates

**Backend**: `GET /admin/saml/certificates`
**Auth**: Admin role required

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "key_id": "signing-key-2026",
      "subject_dn": "CN=xavyo-idp, O=Xavyo",
      "issuer_dn": "CN=xavyo-idp, O=Xavyo",
      "not_before": "2026-01-01T00:00:00Z",
      "not_after": "2027-01-01T00:00:00Z",
      "is_active": true,
      "created_at": "2026-01-01T10:00:00Z"
    }
  ]
}
```

### POST /api/federation/saml/certificates

**Backend**: `POST /admin/saml/certificates`
**Auth**: Admin role required

**Request Body**:
```json
{
  "certificate": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
  "key_id": "signing-key-2026",
  "subject_dn": "CN=xavyo-idp, O=Xavyo",
  "issuer_dn": "CN=xavyo-idp, O=Xavyo",
  "not_before": "2026-01-01T00:00:00Z",
  "not_after": "2027-01-01T00:00:00Z"
}
```

**Response** (201): Created CertificateInfo object (without private_key)

### POST /api/federation/saml/certificates/[id]/activate

**Backend**: `POST /admin/saml/certificates/{id}/activate`
**Auth**: Admin role required

**Response** (200): Success confirmation
**Side effect**: Deactivates any previously active certificate

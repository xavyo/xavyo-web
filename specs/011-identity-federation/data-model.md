# Data Model: Identity Federation

## Entities

### IdentityProvider (OIDC)

Represents an external OIDC-compliant identity provider configured for federated SSO.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | Primary key |
| name | string | yes | Display name (1-255 chars) |
| provider_type | string | yes | e.g., "oidc", "okta", "azure_ad" |
| issuer_url | string (URL) | yes | OIDC issuer URL for discovery |
| client_id | string | yes | OAuth2 client ID |
| client_secret | string | yes | OAuth2 client secret (encrypted at rest) |
| scopes | string[] | no | OAuth2 scopes (defaults to ["openid", "profile", "email"]) |
| claim_mapping | JSON | no | Maps external claims to internal attributes |
| sync_on_login | boolean | no | Whether to sync user attributes on each login |
| is_enabled | boolean | yes | Whether IdP is active for login |
| validation_status | string | no | "valid" / "invalid" / null (not validated) |
| last_validated_at | datetime | no | Last validation timestamp |
| linked_users_count | number | no | Count of users linked to this IdP (read-only) |
| created_at | datetime | auto | Creation timestamp |
| updated_at | datetime | auto | Last update timestamp |

### IdentityProviderDomain (HRD)

Associates email domains with an IdP for Home Realm Discovery routing.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | Primary key |
| domain | string | yes | Email domain (e.g., "acme.com") |
| priority | number | no | Routing priority (lower = higher priority) |
| identity_provider_id | UUID | yes | FK to IdentityProvider |
| created_at | datetime | auto | Creation timestamp |

**Constraints**: Unique (tenant_id, identity_provider_id, domain). Domain cannot be assigned to multiple IdPs within same tenant.

### ServiceProvider (SAML)

Represents a SAML 2.0 Service Provider (relying party) configuration.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | Primary key |
| name | string | yes | Display name |
| entity_id | string | yes | SAML entity ID (unique per tenant) |
| acs_urls | string[] | yes | Assertion Consumer Service URLs (at least 1) |
| certificate | string | no | SP's public certificate for signature validation |
| attribute_mapping | JSON | no | Maps IdP attributes to SP expected attributes |
| name_id_format | string | no | SAML NameID format (default: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress") |
| sign_assertions | boolean | no | Whether to sign SAML assertions (default: true) |
| validate_signatures | boolean | no | Whether to validate SP request signatures |
| assertion_validity_seconds | number | no | Assertion lifetime (default: 300) |
| enabled | boolean | yes | Whether SP is active |
| metadata_url | string | no | SP metadata URL for auto-configuration |
| created_at | datetime | auto | Creation timestamp |
| updated_at | datetime | auto | Last update timestamp |

### IdPCertificate

IdP signing certificate for SAML assertion signing.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | Primary key |
| certificate | string | yes | PEM-encoded X.509 certificate |
| private_key | string | yes | PEM-encoded private key (encrypted at rest) |
| key_id | string | yes | Certificate key identifier (unique per tenant) |
| subject_dn | string | no | Certificate subject distinguished name |
| issuer_dn | string | no | Certificate issuer distinguished name |
| not_before | datetime | no | Certificate validity start |
| not_after | datetime | no | Certificate validity end |
| is_active | boolean | yes | Whether certificate is used for signing |
| created_at | datetime | auto | Creation timestamp |

**Constraints**: Only one certificate can be `is_active=true` per tenant (enforced by backend trigger).

### SocialProviderConfig

Tenant-level social login provider configuration.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| provider | string | PK | "google" / "microsoft" / "apple" / "github" |
| enabled | boolean | yes | Whether provider is available for login |
| client_id | string | yes | OAuth2 client ID |
| client_secret | string | yes | OAuth2 client secret (encrypted at rest) |
| scopes | string[] | no | OAuth2 scopes |
| additional_config | JSON | no | Provider-specific config (azure_tenant, team_id, key_id) |
| has_client_secret | boolean | read-only | Whether client secret is configured (secret never returned) |
| created_at | datetime | auto | Creation timestamp |
| updated_at | datetime | auto | Last update timestamp |

**Provider-specific additional_config**:
- **Microsoft**: `{ azure_tenant: "common" | "organizations" | "{tenant-id}" }`
- **Apple**: `{ team_id: string, key_id: string, private_key: string }`
- **Google**: `{}` (no additional config)
- **GitHub**: `{}` (no additional config)

### SocialConnection

User-level link between a local account and an external social account.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | auto | Primary key |
| provider | string | yes | "google" / "microsoft" / "apple" / "github" |
| email | string | no | External account email |
| display_name | string | no | External account display name |
| is_private_email | boolean | no | Whether email is a private relay (Apple) |
| created_at | datetime | auto | When account was linked |

### ValidationResult

Response from IdP validation endpoint (not persisted, response-only).

| Field | Type | Notes |
|-------|------|-------|
| is_valid | boolean | Whether IdP config is valid |
| discovered_endpoints | object | { authorization_endpoint, token_endpoint, userinfo_endpoint, jwks_uri } |
| error | string | Error message if invalid |

## Relationships

```
IdentityProvider  1──N  IdentityProviderDomain   (IdP has many domains for HRD)
IdentityProvider  1──N  UserIdentityLink         (IdP has many linked users)
Tenant            1──N  IdentityProvider         (tenant isolation)
Tenant            1──N  ServiceProvider          (tenant isolation)
Tenant            1──N  IdPCertificate           (tenant isolation)
Tenant            1──4  SocialProviderConfig     (max 4 providers per tenant)
User              1──N  SocialConnection         (user has many social links)
```

## Pagination

All list endpoints use offset/limit pagination:

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}
```

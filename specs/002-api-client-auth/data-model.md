# Data Model: API Client + Authentication

**Feature**: 002-api-client-auth
**Created**: 2026-02-10

## TypeScript Types (mirroring Rust DTOs)

### Auth Request Types

#### SignupRequest
| Field | Type | Required | Validation | Rust Source |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email, max 255 chars | `SignupRequest.email` |
| password | string | Yes | 8-128 chars | `SignupRequest.password` |
| display_name | string | No | Max 255 chars | `SignupRequest.display_name` |

#### LoginRequest
| Field | Type | Required | Validation | Rust Source |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email | `LoginRequest.email` |
| password | string | Yes | 1-1024 chars | `LoginRequest.password` |

#### RefreshRequest
| Field | Type | Required | Rust Source |
|-------|------|----------|-------------|
| refresh_token | string | Yes | `RefreshRequest.refresh_token` |

#### LogoutRequest
| Field | Type | Required | Rust Source |
|-------|------|----------|-------------|
| refresh_token | string | Yes | `LogoutRequest.refresh_token` |

#### ForgotPasswordRequest
| Field | Type | Required | Validation | Rust Source |
|-------|------|----------|------------|-------------|
| email | string | Yes | Valid email | `ForgotPasswordRequest.email` |

#### ResetPasswordRequest
| Field | Type | Required | Validation | Rust Source |
|-------|------|----------|------------|-------------|
| token | string | Yes | Exactly 43 chars | `ResetPasswordRequest.token` |
| new_password | string | Yes | 8-128 chars | `ResetPasswordRequest.new_password` |

#### VerifyEmailRequest
| Field | Type | Required | Validation | Rust Source |
|-------|------|----------|------------|-------------|
| token | string | Yes | Exactly 43 chars | `VerifyEmailRequest.token` |

### Auth Response Types

#### SignupResponse
| Field | Type | Rust Source |
|-------|------|-------------|
| user_id | string (UUID) | `SignupResponse.user_id` |
| email | string | `SignupResponse.email` |
| email_verified | boolean | `SignupResponse.email_verified` |
| access_token | string | `SignupResponse.access_token` |
| token_type | string | `SignupResponse.token_type` |
| expires_in | number | `SignupResponse.expires_in` |

#### TokenResponse
| Field | Type | Rust Source |
|-------|------|-------------|
| access_token | string | `TokenResponse.access_token` |
| refresh_token | string | `TokenResponse.refresh_token` |
| token_type | string | `TokenResponse.token_type` |
| expires_in | number | `TokenResponse.expires_in` |

#### ForgotPasswordResponse
| Field | Type | Rust Source |
|-------|------|-------------|
| message | string | `ForgotPasswordResponse.message` |

#### ResetPasswordResponse
| Field | Type | Rust Source |
|-------|------|-------------|
| message | string | `ResetPasswordResponse.message` |

#### VerifyEmailResponse
| Field | Type | Rust Source |
|-------|------|-------------|
| message | string | `VerifyEmailResponse.message` |
| already_verified | boolean | `VerifyEmailResponse.already_verified` |

### Tenant Types

#### ProvisionTenantRequest
| Field | Type | Required | Rust Source |
|-------|------|----------|-------------|
| organization_name | string | Yes | `ProvisionTenantRequest.organization_name` |

#### ProvisionTenantResponse
| Field | Type | Rust Source |
|-------|------|-------------|
| tenant | TenantInfo | `ProvisionTenantResponse.tenant` |
| admin | AdminInfo | `ProvisionTenantResponse.admin` |
| oauth_client | OAuthClientInfo | `ProvisionTenantResponse.oauth_client` |
| endpoints | EndpointInfo | `ProvisionTenantResponse.endpoints` |
| next_steps | string[] | `ProvisionTenantResponse.next_steps` |

#### TenantInfo
| Field | Type | Rust Source |
|-------|------|-------------|
| id | string (UUID) | `TenantInfo.id` |
| slug | string | `TenantInfo.slug` |
| name | string | `TenantInfo.name` |

#### AdminInfo
| Field | Type | Rust Source |
|-------|------|-------------|
| id | string (UUID) | `AdminInfo.id` |
| email | string | `AdminInfo.email` |
| api_key | string | `AdminInfo.api_key` |

#### OAuthClientInfo
| Field | Type | Rust Source |
|-------|------|-------------|
| client_id | string | `OAuthClientInfo.client_id` |
| client_secret | string | `OAuthClientInfo.client_secret` |

#### EndpointInfo
| Field | Type | Rust Source |
|-------|------|-------------|
| api | string | `EndpointInfo.api` |
| auth | string | `EndpointInfo.auth` |

### JWT Claims

#### JwtClaims
| Field | Type | Required | Rust Source |
|-------|------|----------|-------------|
| sub | string | Yes | `JwtClaims.sub` (user_id) |
| iss | string | Yes | `JwtClaims.iss` |
| aud | string[] | Yes | `JwtClaims.aud` |
| exp | number | Yes | `JwtClaims.exp` |
| iat | number | Yes | `JwtClaims.iat` |
| jti | string | Yes | `JwtClaims.jti` |
| tid | string (UUID) | No | `JwtClaims.tid` (tenant_id) |
| roles | string[] | Yes | `JwtClaims.roles` |
| purpose | string | No | `JwtClaims.purpose` |
| email | string | No | `JwtClaims.email` |

### App.Locals (SvelteKit server context)

#### App.Locals
| Field | Type | Description |
|-------|------|-------------|
| user | { id: string; email: string; roles: string[] } \| undefined | Decoded from JWT claims |
| accessToken | string \| undefined | Raw JWT for API calls |
| tenantId | string \| undefined | From tid claim or tenant_id cookie |

## Relationships

```
SignupRequest  →  POST /auth/signup    →  SignupResponse
LoginRequest   →  POST /auth/login     →  TokenResponse
RefreshRequest →  POST /auth/refresh   →  TokenResponse
LogoutRequest  →  POST /auth/logout    →  204
ForgotPasswordRequest → POST /auth/forgot-password → ForgotPasswordResponse
ResetPasswordRequest  → POST /auth/reset-password  → ResetPasswordResponse
VerifyEmailRequest    → POST /auth/verify-email    → VerifyEmailResponse

TokenResponse.access_token → HttpOnly cookie → hooks.server.ts → JwtClaims → App.Locals
TokenResponse.refresh_token → HttpOnly cookie → hooks.server.ts (auto-refresh)
```

## Zod Schemas (Form Validation)

| Schema | Fields | Used By |
|--------|--------|---------|
| loginSchema | email (email), password (min 1) | /login page |
| signupSchema | email (email), password (min 8, max 128), displayName (optional, max 255) | /signup page |
| forgotPasswordSchema | email (email) | /forgot-password page |
| resetPasswordSchema | token (length 43), newPassword (min 8, max 128) | /reset-password page |

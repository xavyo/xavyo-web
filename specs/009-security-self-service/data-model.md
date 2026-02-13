# Data Model: Security & Self-Service

**Feature**: 009-security-self-service | **Date**: 2026-02-11

## Entities

All types are defined in `src/lib/api/types.ts` and mirror the Rust DTOs from xavyo-idp exactly.

### UserProfile

Represents the authenticated user's editable profile.

```typescript
interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  created_at: string; // ISO 8601
}
```

**Source**: `GET /me/profile` → `ProfileResponse`

### UpdateProfileRequest

```typescript
interface UpdateProfileRequest {
  display_name?: string;  // 1-100 chars
  first_name?: string;    // 1-100 chars
  last_name?: string;     // 1-100 chars
  avatar_url?: string;    // valid URL, max 2048 chars
}
```

**Source**: `PUT /me/profile` request body

### PasswordChangeRequest / PasswordChangeResponse

```typescript
interface PasswordChangeRequest {
  current_password: string;
  new_password: string;      // 8-128 chars
  revoke_other_sessions: boolean; // defaults true
}

interface PasswordChangeResponse {
  message: string;
  sessions_revoked: number;
}
```

**Source**: `PUT /auth/password`

### MfaStatus

Represents the user's MFA configuration state.

```typescript
interface MfaStatus {
  totp_enabled: boolean;
  webauthn_enabled: boolean;
  recovery_codes_remaining: number;
  available_methods: MfaMethod[];
  setup_at: string | null;    // ISO 8601
  last_used_at: string | null; // ISO 8601
}

type MfaMethod = 'totp' | 'webauthn' | 'recovery';
```

**Source**: `GET /users/me/mfa/status` → `MfaStatusResponse`

### TotpSetupResponse / TotpVerifySetupRequest / TotpVerifySetupResponse

```typescript
interface TotpSetupResponse {
  secret: string;        // Base32-encoded TOTP secret
  otpauth_uri: string;   // otpauth:// URI for manual entry
  qr_code: string;       // Base64-encoded PNG image
}

interface TotpVerifySetupRequest {
  code: string; // 6-digit TOTP code
}

interface TotpVerifySetupResponse {
  recovery_codes: string[];
  message: string;
}
```

**Source**: `POST /auth/mfa/totp/setup`, `POST /auth/mfa/totp/verify-setup`

### TotpDisableRequest

```typescript
interface TotpDisableRequest {
  password: string;
  code: string; // 6-digit TOTP code
}
```

**Source**: `DELETE /auth/mfa/totp`

### RecoveryRegenerateRequest / RecoveryCodesResponse

```typescript
interface RecoveryRegenerateRequest {
  password: string;
}

interface RecoveryCodesResponse {
  recovery_codes: string[];
  message: string;
}
```

**Source**: `POST /auth/mfa/recovery/generate`

### WebAuthnCredential

```typescript
interface WebAuthnCredential {
  id: string;
  name: string;
  created_at: string; // ISO 8601
}

interface WebAuthnCredentialList {
  credentials: WebAuthnCredential[];
  count: number;
}
```

**Source**: `GET /auth/mfa/webauthn/credentials` → `CredentialListResponse`

### WebAuthn Registration Types

```typescript
interface StartRegistrationRequest {
  name?: string; // Optional friendly name
}

// Response is the standard WebAuthn PublicKeyCredentialCreationOptions
// Passed directly to navigator.credentials.create()
interface RegistrationOptionsResponse {
  // Flattened CreationChallengeResponse from webauthn-rs
  // Contains: rp, user, challenge, pubKeyCredParams, timeout, attestation, etc.
  [key: string]: unknown;
}

interface RegistrationResponse {
  credential: WebAuthnCredential;
  message: string;
}

interface UpdateCredentialRequest {
  name: string; // 1-100 chars
}
```

**Source**: `POST /auth/mfa/webauthn/register/start`, `/finish`, `PATCH /auth/mfa/webauthn/credentials/{id}`

### Session

Represents an active login session.

```typescript
interface SessionInfo {
  id: string;
  device_name: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  is_current: boolean;
  created_at: string;     // ISO 8601
  last_activity_at: string; // ISO 8601
}

interface SessionList {
  sessions: SessionInfo[];
  total: number;
}

interface RevokeAllSessionsResponse {
  revoked_count: number;
  message: string;
}
```

**Source**: `GET /users/me/sessions`, `DELETE /users/me/sessions`

### Device

Represents a registered device.

```typescript
interface DeviceInfo {
  id: string;
  device_fingerprint: string;
  device_name: string | null;
  device_type: string | null;
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  os_version: string | null;
  is_trusted: boolean;
  trust_expires_at: string | null; // ISO 8601
  first_seen_at: string;           // ISO 8601
  last_seen_at: string;            // ISO 8601
  login_count: number;
  is_current: boolean | null;
}

interface DeviceList {
  items: DeviceInfo[];
  total: number;
}

interface TrustDeviceRequest {
  trust_duration_days?: number; // 0-365, 0 = permanent
}

interface TrustDeviceResponse {
  id: string;
  is_trusted: boolean;
  trust_expires_at: string | null;
}

interface RenameDeviceRequest {
  device_name: string; // 1-100 chars
}

interface RenameDeviceResponse {
  id: string;
  device_name: string;
}
```

**Source**: `GET /devices`, `POST/DELETE /devices/{id}/trust`, `PUT /devices/{id}`

### EmailChange Types

```typescript
interface EmailChangeRequest {
  new_email: string;       // valid email, max 255 chars
  current_password: string;
}

interface EmailChangeInitiatedResponse {
  message: string;
  expires_at: string; // ISO 8601
}

interface EmailVerifyChangeRequest {
  token: string; // exactly 43 chars
}

interface EmailChangeCompletedResponse {
  message: string;
  new_email: string;
}
```

**Source**: `POST /me/email/change`, `POST /me/email/verify`

### SecurityOverview

Aggregated security health data.

```typescript
interface SecurityOverview {
  mfa_enabled: boolean;
  mfa_methods: string[];
  trusted_devices_count: number;
  active_sessions_count: number;
  last_password_change: string | null; // ISO 8601
  recent_security_alerts_count: number;
  password_expires_at: string | null;  // ISO 8601
}
```

**Source**: `GET /me/security` → `SecurityOverviewResponse`

## Relationships

```
UserProfile ──1:1──> SecurityOverview (aggregated from below)
UserProfile ──1:1──> MfaStatus
UserProfile ──1:N──> Session
UserProfile ──1:N──> Device
UserProfile ──1:N──> WebAuthnCredential
```

## Validation Rules

| Entity | Field | Rule |
|--------|-------|------|
| UserProfile | display_name | 1-100 chars, required |
| UserProfile | first_name | 0-100 chars, optional |
| UserProfile | last_name | 0-100 chars, optional |
| UserProfile | avatar_url | Valid URL or empty, max 2048 chars |
| PasswordChange | current_password | Required, non-empty |
| PasswordChange | new_password | 8-128 chars |
| PasswordChange | confirm_password | Must match new_password (client-side only) |
| TotpVerify | code | Exactly 6 digits |
| TotpDisable | password | Required |
| TotpDisable | code | Exactly 6 digits |
| RecoveryRegenerate | password | Required |
| WebAuthn | name | 1-100 chars, optional on create |
| EmailChange | new_email | Valid email, max 255 chars |
| EmailChange | current_password | Required |
| EmailVerify | token | Exactly 43 chars |
| DeviceRename | device_name | 1-100 chars |
| DeviceTrust | trust_duration_days | 0-365, optional |

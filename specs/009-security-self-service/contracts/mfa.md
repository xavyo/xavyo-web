# API Contract: MFA (TOTP, WebAuthn, Recovery)

## BFF Proxy Endpoints

### GET /api/mfa/status
**Backend**: `GET /users/me/mfa/status`

**Response** (200):
```json
{
  "totp_enabled": true,
  "webauthn_enabled": false,
  "recovery_codes_remaining": 8,
  "available_methods": ["totp", "recovery"],
  "setup_at": "2026-01-15T10:00:00Z",
  "last_used_at": "2026-02-10T08:30:00Z"
}
```

---

### POST /api/mfa/totp/setup
**Backend**: `POST /auth/mfa/totp/setup`

**Request**: Empty body (POST with no payload)

**Response** (200):
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "otpauth_uri": "otpauth://totp/xavyo:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=xavyo",
  "qr_code": "iVBORw0KGgoAAAANSUhEUg..."
}
```

### POST /api/mfa/totp/verify-setup
**Backend**: `POST /auth/mfa/totp/verify-setup`

**Request**:
```json
{
  "code": "123456"
}
```

**Response** (200):
```json
{
  "recovery_codes": [
    "ABCD-1234-EFGH",
    "IJKL-5678-MNOP",
    "QRST-9012-UVWX"
  ],
  "message": "MFA enabled successfully"
}
```

**Errors**: 400 (invalid code)

### DELETE /api/mfa/totp/disable
**Backend**: `DELETE /auth/mfa/totp`

**Request** (body with DELETE):
```json
{
  "password": "currentpass",
  "code": "123456"
}
```

**Response** (200):
```json
{
  "message": "MFA disabled successfully"
}
```

**Errors**: 400 (policy requires MFA), 401 (wrong password/code)

---

### POST /api/mfa/recovery/generate
**Backend**: `POST /auth/mfa/recovery/generate`

**Request**:
```json
{
  "password": "currentpass"
}
```

**Response** (200):
```json
{
  "recovery_codes": [
    "ABCD-1234-EFGH",
    "IJKL-5678-MNOP"
  ],
  "message": "Recovery codes regenerated"
}
```

**Errors**: 401 (wrong password)

---

### POST /api/mfa/webauthn/register/start
**Backend**: `POST /auth/mfa/webauthn/register/start`

**Request**:
```json
{
  "name": "MacBook Touch ID"
}
```

**Response** (200): WebAuthn `PublicKeyCredentialCreationOptions` (passed to `navigator.credentials.create()`):
```json
{
  "rp": { "name": "xavyo", "id": "localhost" },
  "user": { "id": "base64url", "name": "user@example.com", "displayName": "John" },
  "challenge": "base64url-encoded-challenge",
  "pubKeyCredParams": [{ "type": "public-key", "alg": -7 }],
  "timeout": 60000,
  "attestation": "none"
}
```

### POST /api/mfa/webauthn/register/finish
**Backend**: `POST /auth/mfa/webauthn/register/finish`

**Request**: `RegisterPublicKeyCredential` (from `navigator.credentials.create()` result, base64url-encoded)

**Response** (201):
```json
{
  "credential": {
    "id": "credential-uuid",
    "name": "MacBook Touch ID",
    "created_at": "2026-02-11T10:00:00Z"
  },
  "message": "Security key registered"
}
```

**Errors**: 400 (invalid), 404 (challenge expired), 409 (duplicate)

### GET /api/mfa/webauthn/credentials
**Backend**: `GET /auth/mfa/webauthn/credentials`

**Response** (200):
```json
{
  "credentials": [
    {
      "id": "credential-uuid",
      "name": "MacBook Touch ID",
      "created_at": "2026-02-11T10:00:00Z"
    }
  ],
  "count": 1
}
```

### PATCH /api/mfa/webauthn/credentials?id={credential_id}
**Backend**: `PATCH /auth/mfa/webauthn/credentials/{credential_id}`

**Request**:
```json
{
  "name": "New Name"
}
```

**Response** (200):
```json
{
  "credential": { "id": "uuid", "name": "New Name", "created_at": "..." },
  "message": "Credential updated"
}
```

### DELETE /api/mfa/webauthn/credentials?id={credential_id}
**Backend**: `DELETE /auth/mfa/webauthn/credentials/{credential_id}`

**Response**: 204 No Content

**Errors**: 404 (not found), 409 (last MFA method when required)

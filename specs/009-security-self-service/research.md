# Research: Security & Self-Service

**Feature**: 009-security-self-service | **Date**: 2026-02-11

## R1: Backend API Endpoint Discovery

**Decision**: All 10 backend API categories confirmed available in xavyo-idp with exact DTO shapes documented.

**Rationale**: Explored the Rust source code in `xavyo-idp/crates/xavyo-api-auth/src/` to find handler functions, models, and route definitions. All endpoints documented in the spec exist and are functional.

**Key Findings**:
- Profile: `GET/PUT /me/profile` — `ProfileResponse` and `UpdateProfileRequest` with validation
- Password: `PUT /auth/password` — `PasswordChangeRequest` with `revoke_other_sessions` bool (defaults true)
- TOTP: `POST /auth/mfa/totp/setup` returns QR code as base64 PNG, `POST /auth/mfa/totp/verify-setup` returns recovery codes
- WebAuthn: Uses `webauthn-rs` crate — `POST /auth/mfa/webauthn/register/start` returns `CreationChallengeResponse`, `/finish` accepts `RegisterPublicKeyCredential`
- Sessions: `GET /users/me/sessions` returns `SessionListResponse` with `is_current` flag, `DELETE /users/me/sessions` for bulk revocation
- Devices: `GET /devices` returns `DeviceListResponse` with `is_current` and trust info, `POST/DELETE /devices/{id}/trust` for trust management
- Email: `POST /me/email/change` requires current password, `POST /me/email/verify` accepts 43-char token
- Security: `GET /me/security` returns `SecurityOverviewResponse` with aggregated counts

**Alternatives considered**: None — the backend is the source of truth.

## R2: WebAuthn Browser API Integration Pattern

**Decision**: Use the native `navigator.credentials.create()` and `navigator.credentials.get()` APIs directly. No third-party WebAuthn client library needed.

**Rationale**: The backend provides WebAuthn challenge/response via `webauthn-rs`. The browser API is standardized and well-supported. The flow is:
1. Client calls BFF proxy → backend returns `PublicKeyCredentialCreationOptions`
2. Client calls `navigator.credentials.create({ publicKey: options })` — browser handles biometric/key interaction
3. Client sends the `PublicKeyCredential` response back through BFF proxy → backend verifies

**Key Considerations**:
- Feature detection: `window.PublicKeyCredential` check before showing WebAuthn UI
- Credential response serialization: `ArrayBuffer` fields need base64url encoding for JSON transport
- The `@simplewebauthn/browser` package could simplify encoding, but adds a dependency for minimal gain
- Decision: Use manual base64url encoding helpers (2 small utility functions) to avoid dependency

**Alternatives considered**:
- `@simplewebauthn/browser` — Adds ~5KB, provides `startRegistration()` helper. Rejected: too much abstraction for 2 API calls.
- Custom WebAuthn wrapper library — YAGNI, violates Minimal Complexity principle.

## R3: Password Strength Evaluation Approach

**Decision**: Client-side password strength evaluation using a pure function with scoring based on length, character variety, and common pattern detection.

**Rationale**: The spec requires a real-time strength indicator. Server-side validation is handled by the backend's password policy service. Client-side evaluation provides immediate UX feedback without round-trips.

**Scoring Algorithm**:
- Base score from length: <8 = 0, 8-11 = 1, 12-15 = 2, 16+ = 3
- Character variety bonus: +1 for each of (lowercase, uppercase, digits, symbols) present
- Common pattern penalty: -2 for sequential characters, repeated characters, dictionary words (top 100)
- Final mapping: 0-2 = weak, 3-4 = fair, 5-6 = strong, 7+ = very strong

**Alternatives considered**:
- `zxcvbn` library (~400KB) — Excellent strength estimation but too large for this use case. Rejected for bundle size.
- `zxcvbn-ts` — Tree-shakeable version (~50KB). Considered but still adds unnecessary dependency.
- Custom scoring (chosen) — Simple, transparent, <50 lines. Adequate for UX feedback; real validation happens server-side.

## R4: QR Code Display Strategy

**Decision**: Display the QR code as a base64-encoded PNG image returned directly from the backend.

**Rationale**: The xavyo-idp backend generates the QR code server-side and returns it as a `qr_code: String` field (base64 PNG) in the `TotpSetupResponse`. No client-side QR generation library needed.

**Implementation**: Simply render `<img src="data:image/png;base64,{qr_code}" alt="TOTP QR Code" />`.

**Alternatives considered**:
- Client-side QR generation with `qrcode` npm package — Rejected because backend already provides it.
- SVG-based QR rendering — Unnecessary complexity.

## R5: Recovery Codes Download Implementation

**Decision**: Use Blob API to create a downloadable text file client-side.

**Rationale**: Recovery codes are displayed once after MFA setup. Users need to save them. Two actions required:
1. **Copy all**: `navigator.clipboard.writeText(codes.join('\n'))`
2. **Download**: Create a `Blob` with text content, generate an object URL, trigger download via hidden `<a>` element

No server-side file generation needed. This is a standard browser pattern.

## R6: Settings Tab Navigation with URL State

**Decision**: Use URL query parameter `?tab=profile|security|sessions|devices` to persist active tab state. Default to `profile` when no parameter present.

**Rationale**: URL-based tab state enables:
- Direct linking to specific tabs (e.g., header dropdown → `/settings?tab=security`)
- Browser back/forward navigation between tabs
- Refresh preserves current tab
- SvelteKit's `$page.url.searchParams` provides reactive access

**Implementation**: The Tabs component from Phase 008 accepts an `activeTab` prop. Read from URL params in `+page.svelte`, update URL with `goto()` or `replaceState()` on tab change.

**Alternatives considered**:
- Separate routes per tab (`/settings/profile`, `/settings/security`) — More SvelteKit-idiomatic but creates unnecessary server load functions. All tab data can be loaded in a single `+page.server.ts`.
- Client-only state (`$state`) — Loses tab state on refresh. Poor UX.

## R7: Sidebar and Header Navigation Updates

**Decision**: Add "Settings" nav item to sidebar between NHI and future items. Update header dropdown "Settings" link from `/dashboard` to `/settings`.

**Rationale**: The spec requires settings accessible from both sidebar and header dropdown. The header already has a Settings link (from Phase 008) that currently points to `/dashboard` as a placeholder.

**Changes needed**:
1. `src/routes/(app)/+layout.svelte` — Add `{ label: 'Settings', href: '/settings', icon: Settings }` to navItems array
2. `src/lib/components/layout/header.svelte` — Change Settings link `href` from `/dashboard` to `/settings`

## R8: Existing BFF Pattern Analysis

**Decision**: Follow the established proxy endpoint pattern from existing modules (users, personas, archetypes, NHI).

**Rationale**: All existing API proxy endpoints in `src/routes/api/` follow the same pattern:
1. Check `locals.accessToken` and `locals.tenantId` — error 401 if missing
2. Parse request body or query params
3. Call API client function with token, tenantId, and SvelteKit's `fetch`
4. Return `json(result)` or appropriate status

**API Client Pattern** (`src/lib/api/client.ts`):
- `apiClient(path, options)` — Generic fetch wrapper that prepends the API base URL and sets auth headers
- Each module exports named functions: `getProfile()`, `updateProfile()`, etc.
- Functions accept `(data, token, tenantId, fetch)` parameters

**Superforms Pattern**:
- Schemas in `src/lib/schemas/` use `zod/v3`
- Server load functions return `superValidate(data, zod(schema))`
- Form actions use `superValidate(request, zod(schema))` → validate → call API → return `message(form, 'Success')`
- Client uses `superForm(data.form)` with `$form`, `$errors`, `$delayed`

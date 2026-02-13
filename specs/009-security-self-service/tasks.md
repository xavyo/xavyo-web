# Tasks: Security & Self-Service

**Input**: Design documents from `/specs/009-security-self-service/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks grouped by user story. Constitution mandates TDD — test tasks included.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US8)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types, schemas, utilities shared across all user stories

- [x] T001 Add all security/self-service TypeScript interfaces to `src/lib/api/types.ts` — UserProfile, UpdateProfileRequest, PasswordChangeRequest, PasswordChangeResponse, MfaStatus, MfaMethod, TotpSetupResponse, TotpVerifySetupRequest, TotpVerifySetupResponse, TotpDisableRequest, RecoveryRegenerateRequest, RecoveryCodesResponse, WebAuthnCredential, WebAuthnCredentialList, StartRegistrationRequest, RegistrationOptionsResponse, RegistrationResponse, UpdateCredentialRequest, SessionInfo, SessionList, RevokeAllSessionsResponse, DeviceInfo, DeviceList, TrustDeviceRequest, TrustDeviceResponse, RenameDeviceRequest, RenameDeviceResponse, EmailChangeRequest, EmailChangeInitiatedResponse, EmailVerifyChangeRequest, EmailChangeCompletedResponse, SecurityOverview (per data-model.md)
- [x] T002 Create Zod validation schemas in `src/lib/schemas/settings.ts` — updateProfileSchema (display_name 1-100 required, first_name/last_name 0-100 optional, avatar_url valid URL or empty), passwordChangeSchema (current_password required, new_password 8-128, confirm_password must match), totpVerifySchema (code exactly 6 digits), totpDisableSchema (password required, code 6 digits), recoveryRegenerateSchema (password required), webauthnNameSchema (name 1-100 optional), emailChangeSchema (new_email valid email max 255, current_password required), emailVerifySchema (token exactly 43 chars), deviceRenameSchema (device_name 1-100), deviceTrustSchema (trust_duration_days 0-365 optional). Use `import { z } from 'zod/v3'`
- [x] T003 [P] Write tests for Zod schemas in `src/lib/schemas/settings.test.ts` — test valid/invalid inputs for all 10 schemas (valid passes, missing required fails, boundary values)
- [x] T004 [P] Create password strength utility in `src/lib/utils/password-strength.ts` — pure function `evaluatePasswordStrength(password: string): { score: number; level: 'weak' | 'fair' | 'strong' | 'very-strong'; feedback: string[] }`. Scoring: base from length (<8=0, 8-11=1, 12-15=2, 16+=3), +1 per character class (lower/upper/digit/symbol), -2 for common patterns. Levels: 0-2=weak, 3-4=fair, 5-6=strong, 7+=very-strong
- [x] T005 [P] Write tests for password strength utility in `src/lib/utils/password-strength.test.ts` — test weak ("abc"), fair ("Password1"), strong ("MyP@ssw0rd12"), very-strong ("C0mpl3x!P@ss#2026") passwords, edge cases (empty string, single char, all same char)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API client modules and BFF proxy endpoints. MUST complete before user story UI work.

### API Client Modules

- [x] T006 Create `src/lib/api/me.ts` — getProfile(token, tenantId, fetch), updateProfile(data, token, tenantId, fetch), changePassword(data, token, tenantId, fetch), getSecurityOverview(token, tenantId, fetch), initiateEmailChange(data, token, tenantId, fetch), verifyEmailChange(data, token, tenantId, fetch). All use apiClient() from client.ts
- [x] T007 [P] Write tests for me.ts in `src/lib/api/me.test.ts` — mock apiClient, test each function calls correct endpoint with correct method/body/params, test error propagation
- [x] T008 [P] Create `src/lib/api/mfa.ts` — getMfaStatus(token, tenantId, fetch), setupTotp(token, tenantId, fetch), verifyTotpSetup(data, token, tenantId, fetch), disableTotp(data, token, tenantId, fetch), regenerateRecoveryCodes(data, token, tenantId, fetch), startWebauthnRegistration(data, token, tenantId, fetch), finishWebauthnRegistration(data, token, tenantId, fetch), listWebauthnCredentials(token, tenantId, fetch), updateWebauthnCredential(id, data, token, tenantId, fetch), deleteWebauthnCredential(id, token, tenantId, fetch)
- [x] T009 [P] Write tests for mfa.ts in `src/lib/api/mfa.test.ts` — mock apiClient, test each of the 10 functions
- [x] T010 [P] Create `src/lib/api/sessions.ts` — listSessions(token, tenantId, fetch), revokeSession(id, token, tenantId, fetch), revokeAllOtherSessions(token, tenantId, fetch)
- [x] T011 [P] Write tests for sessions.ts in `src/lib/api/sessions.test.ts` — mock apiClient, test 3 functions
- [x] T012 [P] Create `src/lib/api/devices.ts` — listDevices(token, tenantId, fetch), renameDevice(id, data, token, tenantId, fetch), removeDevice(id, token, tenantId, fetch), trustDevice(id, data, token, tenantId, fetch), untrustDevice(id, token, tenantId, fetch)
- [x] T013 [P] Write tests for devices.ts in `src/lib/api/devices.test.ts` — mock apiClient, test 5 functions

### BFF Proxy Endpoints

- [x] T014 [P] Create `src/routes/api/me/profile/+server.ts` — GET handler (getProfile), PUT handler (updateProfile). Check locals.accessToken/tenantId, call API, return json
- [x] T015 [P] Create `src/routes/api/me/password/+server.ts` — PUT handler (changePassword). Parse body, call API, return json
- [x] T016 [P] Create `src/routes/api/me/security/+server.ts` — GET handler (getSecurityOverview)
- [x] T017 [P] Create `src/routes/api/me/email/change/+server.ts` — POST handler (initiateEmailChange)
- [x] T018 [P] Create `src/routes/api/me/email/verify/+server.ts` — POST handler (verifyEmailChange)
- [x] T019 [P] Create `src/routes/api/mfa/status/+server.ts` — GET handler (getMfaStatus)
- [x] T020 [P] Create `src/routes/api/mfa/totp/setup/+server.ts` — POST handler (setupTotp)
- [x] T021 [P] Create `src/routes/api/mfa/totp/verify-setup/+server.ts` — POST handler (verifyTotpSetup)
- [x] T022 [P] Create `src/routes/api/mfa/totp/disable/+server.ts` — DELETE handler (disableTotp, pass body)
- [x] T023 [P] Create `src/routes/api/mfa/recovery/generate/+server.ts` — POST handler (regenerateRecoveryCodes)
- [x] T024 [P] Create `src/routes/api/mfa/webauthn/register/start/+server.ts` — POST handler (startWebauthnRegistration)
- [x] T025 [P] Create `src/routes/api/mfa/webauthn/register/finish/+server.ts` — POST handler (finishWebauthnRegistration)
- [x] T026 [P] Create `src/routes/api/mfa/webauthn/credentials/+server.ts` — GET handler (listWebauthnCredentials), PATCH handler (updateWebauthnCredential, id from query param), DELETE handler (deleteWebauthnCredential, id from query param)
- [x] T027 [P] Create `src/routes/api/sessions/+server.ts` — GET handler (listSessions), DELETE handler (revokeAllOtherSessions)
- [x] T028 [P] Create `src/routes/api/sessions/[id]/+server.ts` — DELETE handler (revokeSession)
- [x] T029 [P] Create `src/routes/api/devices/+server.ts` — GET handler (listDevices)
- [x] T030 [P] Create `src/routes/api/devices/[id]/+server.ts` — PUT handler (renameDevice), DELETE handler (removeDevice)
- [x] T031 [P] Create `src/routes/api/devices/[id]/trust/+server.ts` — POST handler (trustDevice), DELETE handler (untrustDevice)

### Navigation Updates

- [x] T032 Update `src/routes/(app)/+layout.svelte` — add `{ label: 'Settings', href: '/settings', icon: Settings }` to navItems array after NHI item. Import `Settings` from lucide-svelte
- [x] T033 Update `src/lib/components/layout/header.svelte` — change Settings link href from `/dashboard` to `/settings`, change Profile link href from `/dashboard` to `/settings?tab=profile`

**Checkpoint**: All API infrastructure ready. Navigation updated. User story UI implementation can begin.

---

## Phase 3: User Story 1 — Settings Hub with Profile Management (Priority: P1) 🎯 MVP

**Goal**: Settings page with tabbed layout (Profile, Security, Sessions, Devices) and profile editing form with validation.

**Independent Test**: Navigate to /settings, verify 4 tabs render, edit display name, save, verify update persists on refresh.

### Tests for US1

- [x] T034 [P] [US1] Write tests for settings page in `src/routes/(app)/settings/settings-page.test.ts` — test: tabs render (Profile, Security, Sessions, Devices), Profile tab active by default, tab switching works, URL query param sets active tab (?tab=security), settings page renders with profile data
- [x] T035 [P] [US1] Write tests for profile-tab in `src/routes/(app)/settings/profile-tab.test.ts` — test: renders profile form with display_name, first_name, last_name, avatar_url fields, pre-fills form with current data, shows email as read-only, shows validation errors for empty display_name, shows validation errors for invalid avatar_url, submit calls API, shows success toast

### Implementation for US1

- [x] T036 [US1] Create `src/routes/(app)/settings/+page.server.ts` — load function: call getProfile, getMfaStatus, getSecurityOverview via locals.accessToken/tenantId/fetch. Return profile, mfaStatus, securityOverview. Handle API errors with try/catch returning null for non-critical data. Add form actions: updateProfile (validate with updateProfileSchema, call updateProfile API, return message)
- [x] T037 [US1] Create `src/routes/(app)/settings/+page.svelte` — settings hub page. Import Tabs from Phase 008. Read `?tab` query param from $page.url.searchParams (default 'profile'). Render PageHeader with "Settings" title. Render Tabs with 4 tabs: Profile (User icon), Security (Shield icon), Sessions (Monitor icon), Devices (Smartphone icon). On tab change, update URL with `goto('/settings?tab=' + tab, { replaceState: true })`. Conditionally render tab components: profile-tab, security-tab, sessions-tab, devices-tab
- [x] T038 [US1] Create `src/routes/(app)/settings/profile-tab.svelte` — profile editing form using Superforms. Accept profile data as prop. Display email (read-only with "Change email" button). Fields: display_name (input), first_name (input), last_name (input), avatar_url (input). Show avatar preview if URL provided. Submit button "Save changes" with $delayed loading state. Success/error toast via message(). Use zodClient(updateProfileSchema) for client-side validation

**Checkpoint**: Settings page with Profile tab functional. Navigate to /settings, edit profile, save.

---

## Phase 4: User Story 2 — Password Change (Priority: P1)

**Goal**: Password change form with real-time strength indicator and revoke-sessions option.

**Independent Test**: Navigate to /settings?tab=security, change password with strength indicator feedback, verify success.

### Tests for US2

- [x] T039 [P] [US2] Write tests for password-strength component in `src/lib/components/ui/password-strength/password-strength.test.ts` — test: renders strength bar, shows "weak" for short passwords, shows "fair" for medium passwords, shows "strong" for long diverse passwords, shows "very strong" for excellent passwords, updates in real-time as password prop changes
- [x] T040 [P] [US2] Write tests for password-change-form in `src/routes/(app)/settings/password-change-form.test.ts` — test: renders current password, new password, confirm password fields, shows strength indicator for new password, shows validation error when passwords don't match, shows error for incorrect current password, shows success toast on change, checkbox for "Revoke other sessions" present

### Implementation for US2

- [x] T041 [US2] Create `src/lib/components/ui/password-strength/password-strength.svelte` — accepts `password: string` prop. Uses evaluatePasswordStrength() utility. Renders colored bar (red=weak, orange=fair, green=strong, emerald=very-strong) with label text. Renders feedback list if any. Export via `src/lib/components/ui/password-strength/index.ts`
- [x] T042 [US2] Create `src/routes/(app)/settings/password-change-form.svelte` — standalone form component (not using page-level Superforms — uses fetch to /api/me/password). Fields: current_password (type=password), new_password (type=password) with PasswordStrength component below, confirm_password (type=password). Checkbox: "Revoke all other sessions" (default checked). Client-side validation with passwordChangeSchema. On submit: POST to /api/me/password proxy. Show success toast with sessions_revoked count. Show error for 401 (wrong current password)
- [x] T043 [US2] Add password change action to `src/routes/(app)/settings/+page.server.ts` — add 'changePassword' form action: validate with passwordChangeSchema, call changePassword API, return message with sessions_revoked count. Handle 401 (invalid current password) and 400 (policy violation) errors

**Checkpoint**: Password change functional with strength indicator. Settings page has Profile + Password working.

---

## Phase 5: User Story 3 — MFA Enrollment TOTP (Priority: P2)

**Goal**: TOTP setup wizard (QR code → verify → recovery codes), disable TOTP, regenerate recovery codes.

**Independent Test**: Navigate to /settings?tab=security, click "Set up MFA", view QR code, enter code, view recovery codes, copy/download, acknowledge, verify MFA enabled.

### Tests for US3

- [x] T044 [P] [US3] Write tests for mfa-status-section in `src/routes/(app)/settings/mfa-status-section.test.ts` — test: shows "Not enabled" when MFA disabled with "Set up MFA" button, shows "Enabled" with TOTP when enabled, shows recovery codes remaining count, shows "Disable MFA" button when enabled, shows "Regenerate recovery codes" button when enabled
- [x] T045 [P] [US3] Write tests for totp-setup-wizard in `src/routes/(app)/settings/totp-setup-wizard.test.ts` — test: renders step 1 with QR code image and manual key, step 2 with 6-digit code input and verify button, step 3 with recovery codes list + copy/download buttons + acknowledgment checkbox, "Complete setup" button disabled until acknowledged, navigates between steps correctly
- [x] T046 [P] [US3] Write tests for recovery-codes-dialog in `src/routes/(app)/settings/recovery-codes-dialog.test.ts` — test: renders list of recovery codes, "Copy all" button copies to clipboard, "Download" button triggers file download, acknowledgment checkbox toggles, close button respects acknowledgment state

### Implementation for US3

- [x] T047 [US3] Create `src/routes/(app)/settings/mfa-status-section.svelte` — accepts mfaStatus: MfaStatus prop. If MFA disabled: show alert with "Set up MFA" button → opens TOTP wizard. If MFA enabled: show status card (TOTP enabled badge, setup date, last used, recovery codes remaining). Show "Disable MFA" button (opens confirmation dialog requiring password + TOTP code). Show "Regenerate recovery codes" button (opens dialog requiring password)
- [x] T048 [US3] Create `src/routes/(app)/settings/totp-setup-wizard.svelte` — multi-step wizard with $state for currentStep (1|2|3). Step 1: call POST /api/mfa/totp/setup, display QR code as `<img src="data:image/png;base64,{qr_code}">`, show manual entry key (otpauth_uri secret part) in monospace copyable text. Step 2: 6-digit code input with auto-focus, verify button calls POST /api/mfa/totp/verify-setup. Step 3: display recovery codes from response, show RecoveryCodesDialog. On wizard complete: dispatch 'complete' event to refresh MFA status. Handle errors with retry (don't reset wizard state)
- [x] T049 [US3] Create `src/routes/(app)/settings/recovery-codes-dialog.svelte` — accepts recoveryCodes: string[] prop. Display codes in monospace grid. "Copy all" button: navigator.clipboard.writeText(codes.join('\n')), show copied confirmation. "Download" button: create Blob text file, trigger download via hidden anchor. Acknowledgment checkbox: "I have saved my recovery codes". Close/complete button disabled until acknowledged. Reusable for both initial setup and regeneration flows

**Checkpoint**: Full TOTP MFA enrollment flow working. Can set up, disable, regenerate.

---

## Phase 6: User Story 4 — WebAuthn/FIDO2 Credential Management (Priority: P2)

**Goal**: Register WebAuthn security keys, list credentials, rename, delete. Browser feature detection.

**Independent Test**: Navigate to /settings?tab=security, register security key (if supported), view in list, rename, delete.

### Tests for US4

- [x] T050 [P] [US4] Write tests for webauthn-section in `src/routes/(app)/settings/webauthn-section.test.ts` — test: shows "Register security key" button when WebAuthn supported, shows unsupported message when not supported, renders credentials list, rename action updates name, delete action removes credential with confirmation, shows warning when deleting last credential

### Implementation for US4

- [x] T051 [US4] Create WebAuthn base64url helpers in `src/lib/utils/webauthn.ts` — bufferToBase64url(buffer: ArrayBuffer): string, base64urlToBuffer(base64url: string): ArrayBuffer. These convert between ArrayBuffer and base64url encoding for WebAuthn API responses
- [x] T052 [P] [US4] Write tests for WebAuthn helpers in `src/lib/utils/webauthn.test.ts` — test round-trip encoding/decoding, empty buffers, standard test vectors
- [x] T053 [US4] Create `src/routes/(app)/settings/webauthn-section.svelte` — accepts credentials: WebAuthnCredential[] prop. Feature detection: check `window.PublicKeyCredential` existence. If unsupported: show info message. "Register security key" button: (1) prompt for optional name, (2) POST /api/mfa/webauthn/register/start with name, (3) decode challenge options and call navigator.credentials.create(), (4) encode response and POST /api/mfa/webauthn/register/finish, (5) refresh list on success. Credentials list: each row shows name, created_at, actions (rename icon, delete icon). Rename: inline edit or small dialog. Delete: confirmation dialog, warn if last credential. Handle browser prompt cancellation gracefully

**Checkpoint**: WebAuthn credential management working alongside TOTP.

---

## Phase 7: User Story 5 — Session Management (Priority: P2)

**Goal**: List active sessions with current session indicator, revoke individual and all other sessions.

**Independent Test**: Navigate to /settings?tab=sessions, verify current session marked, revoke another session.

### Tests for US5

- [x] T054 [P] [US5] Write tests for sessions-tab in `src/routes/(app)/settings/sessions-tab.test.ts` — test: renders session list with device info, marks current session with badge, disables revoke for current session, revoke button calls DELETE API for non-current session, confirmation dialog before revoke, "Revoke all other sessions" button present, bulk revoke disabled when no other sessions, shows success toast after revoke, empty state when only current session

### Implementation for US5

- [x] T055 [US5] Create `src/routes/(app)/settings/sessions-tab.svelte` — fetches sessions from /api/sessions on mount. Renders list/cards for each session: device_name, browser + os, ip_address, last_activity_at (relative time), is_current badge ("This device"). Revoke button per session (disabled for current). Confirmation dialog before revoke. "Revoke all other sessions" button at top (disabled if only current session). On revoke: call DELETE /api/sessions/[id] or DELETE /api/sessions, refresh list, show toast with count. Empty state if no other sessions

**Checkpoint**: Session management functional. Users can see and revoke sessions.

---

## Phase 8: User Story 6 — Device Management (Priority: P3)

**Goal**: List devices with trust status, rename, trust/untrust with duration, remove non-current devices.

**Independent Test**: Navigate to /settings?tab=devices, verify current device listed, rename, trust with duration, remove another device.

### Tests for US6

- [x] T056 [P] [US6] Write tests for devices-tab in `src/routes/(app)/settings/devices-tab.test.ts` — test: renders device list with all attributes (name, type, browser, os, trust status, login count), marks current device, disables remove for current device, rename action calls PUT API, trust action opens duration picker and calls POST trust API, untrust calls DELETE trust API, remove with confirmation calls DELETE device API, shows trust badge with expiration date, empty state when no devices

### Implementation for US6

- [x] T057 [US6] Create `src/routes/(app)/settings/devices-tab.svelte` — fetches devices from /api/devices on mount. Renders list/cards for each device: device_name (editable), device_type icon (Desktop/Mobile/Tablet from lucide), browser + browser_version, os + os_version, trust status badge (Trusted/Untrusted), trust_expires_at, first_seen_at, last_seen_at, login_count, is_current indicator. Actions: rename (inline edit), trust (dialog with duration select: 7/14/30/90/365 days or permanent), untrust, remove (disabled for current, confirmation dialog). On each action: call appropriate API, refresh list, show toast

**Checkpoint**: Device management functional. Full Devices tab working.

---

## Phase 9: User Story 7 — Security Overview (Priority: P3)

**Goal**: Dashboard cards showing aggregated security health at top of Security tab.

**Independent Test**: Navigate to /settings?tab=security, verify overview shows correct MFA status, device count, session count, last password change.

### Tests for US7

- [x] T058 [P] [US7] Write tests for security-overview in `src/routes/(app)/settings/security-overview.test.ts` — test: renders MFA status card (enabled/disabled), renders trusted devices count, renders active sessions count, renders last password change date, renders alerts count badge, shows "Set up MFA" prompt when disabled, links navigate to correct tabs, handles null values gracefully

### Implementation for US7

- [x] T059 [US7] Create `src/routes/(app)/settings/security-overview.svelte` — accepts securityOverview: SecurityOverview prop. Render grid of metric cards (2x3 or responsive): (1) MFA Status — Shield icon, enabled/disabled with method list, link to MFA section below, (2) Trusted Devices — Smartphone icon, count, link to ?tab=devices, (3) Active Sessions — Monitor icon, count, link to ?tab=sessions, (4) Last Password Change — Key icon, relative date or "Never", (5) Password Expiry — Clock icon, date or "No expiry", (6) Security Alerts — AlertTriangle icon, count with badge or "None". Each card: icon, label, value, optional link/action
- [x] T060 [US7] Create `src/routes/(app)/settings/security-tab.svelte` — composes security-overview, mfa-status-section, password-change-form, and webauthn-section. Accepts securityOverview, mfaStatus props. Layout: SecurityOverview at top, then MfaStatusSection, then WebAuthnSection, then PasswordChangeForm. Each section has a heading and appropriate spacing

**Checkpoint**: Security tab fully composed with overview dashboard.

---

## Phase 10: User Story 8 — Email Change (Priority: P3)

**Goal**: Email change dialog with two-step verification flow (initiate + verify token).

**Independent Test**: Navigate to /settings?tab=profile, click "Change email", enter new email and password, verify confirmation, enter token, verify email updated.

### Tests for US8

- [x] T061 [P] [US8] Write tests for email-change-dialog in `src/routes/(app)/settings/email-change-dialog.test.ts` — test: renders with new email and current password fields, validates email format, validates password required, shows "Send verification" button, after submit shows verification token input, token field validates 43 chars, shows success toast on verify, shows error for taken email (409), shows error for wrong password (401), shows error for expired token

### Implementation for US8

- [x] T062 [US8] Create `src/routes/(app)/settings/email-change-dialog.svelte` — two-phase dialog using $state for phase ('initiate' | 'verify'). Phase 1: new_email input, current_password input, "Send verification" button. Validate with emailChangeSchema. POST to /api/me/email/change. On success: show expires_at, switch to phase 2. Phase 2: token input (43 chars), "Verify" button. Validate with emailVerifySchema. POST to /api/me/email/verify. On success: close dialog, show toast with new email, dispatch 'emailChanged' event to refresh profile. Error handling: 409 (email taken), 401 (wrong password), 400 (expired token)
- [x] T063 [US8] Update `src/routes/(app)/settings/profile-tab.svelte` — add "Change email" button next to email display. On click: open email-change-dialog. On emailChanged event: refresh profile data to show new email

**Checkpoint**: Email change flow complete. Profile tab has full self-service.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Integration, responsive design, dark mode verification, final tests

- [x] T064 Update sidebar and header tests to verify Settings nav item in `src/lib/components/layout/sidebar.test.ts` and `src/lib/components/layout/header.test.ts`
- [x] T065 [P] Verify all settings components work in dark mode — ensure correct use of semantic color tokens (bg-card, text-foreground, border, etc.) in all new components
- [x] T066 [P] Verify all interactive elements meet 44px minimum touch target size — buttons, form inputs, tab triggers, action icons
- [x] T067 [P] Verify responsive layout — settings page adapts for mobile (tabs stack or scroll horizontally), forms are single-column on narrow screens
- [x] T068 Run `npm run check` — fix any TypeScript errors
- [x] T069 Run `npm run test:unit` — ensure all existing + new tests pass (target: 293 existing + ~80 new)
- [x] T070 Run quickstart.md scenarios via Chrome DevTools MCP for E2E validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (types must exist for API modules)
- **Phase 3 (US1)**: Depends on Phase 2 (needs proxy endpoints + navigation)
- **Phase 4 (US2)**: Depends on Phase 2 + Phase 1 (T004/T005 for password strength)
- **Phase 5 (US3)**: Depends on Phase 2 (needs MFA proxy endpoints)
- **Phase 6 (US4)**: Depends on Phase 2 (needs WebAuthn proxy endpoints)
- **Phase 7 (US5)**: Depends on Phase 2 (needs sessions proxy endpoints)
- **Phase 8 (US6)**: Depends on Phase 2 (needs devices proxy endpoints)
- **Phase 9 (US7)**: Depends on Phase 5 + Phase 4 (composes MFA + password sections)
- **Phase 10 (US8)**: Depends on Phase 3 (extends profile-tab)
- **Phase 11 (Polish)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2
- **US2 (P1)**: Independent after Phase 2 (password strength from Phase 1)
- **US3 (P2)**: Independent after Phase 2
- **US4 (P2)**: Independent after Phase 2
- **US5 (P2)**: Independent after Phase 2
- **US6 (P3)**: Independent after Phase 2
- **US7 (P3)**: Depends on US2 (password form), US3 (MFA status), US4 (WebAuthn) — composes them
- **US8 (P3)**: Depends on US1 (profile tab)

### Within Each User Story

- Tests FIRST → verify they FAIL → implement → verify they PASS
- API/proxy endpoints before UI components
- Parent components before child components

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 all parallel (different files)
- **Phase 2**: T006-T013 API modules all parallel. T014-T031 proxy endpoints all parallel
- **User Stories**: US1+US2 can run in parallel after Phase 2. US3+US4+US5 all parallel. US6 parallel with others.
- **Within each story**: Test tasks marked [P] can run in parallel

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (types, schemas, utils)
2. Complete Phase 2: Foundational (API modules, proxies, navigation)
3. Complete Phase 3: US1 — Settings page + Profile editing
4. Complete Phase 4: US2 — Password change with strength indicator
5. **STOP and VALIDATE**: Test Profile + Password flows independently
6. Deploy/demo: basic settings with profile editing and password change

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 (Settings + Profile) → First functional increment
3. US2 (Password Change) → Core security self-service
4. US3 (TOTP MFA) → Critical security feature
5. US4 (WebAuthn) → Phishing-resistant auth
6. US5 (Sessions) → Security visibility
7. US7 (Security Overview) → Composes US2+US3+US4
8. US6 (Devices) → Extended security
9. US8 (Email Change) → Complete self-service
10. Polish → Cross-cutting concerns, responsive, dark mode

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Constitution mandates TDD: tests FIRST, verify FAIL, then implement
- All Zod schemas use `import { z } from 'zod/v3'` (Superforms compatibility)
- WebAuthn section hidden (not errored) on unsupported browsers
- All proxy endpoints follow established BFF pattern: check locals → call API → return json
- Password strength is client-side UX only; real validation on backend
- Recovery codes displayed ONCE — user must acknowledge saving them
- Total: 70 tasks across 11 phases

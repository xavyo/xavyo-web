# Feature Specification: Security & Self-Service

**Feature Branch**: `009-security-self-service`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Phase 009: Security & Self-Service — user-facing security management and self-service features for the xavyo-web identity governance platform"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Settings Hub with Profile Management (Priority: P1)

An authenticated administrator navigates to the Settings page via the sidebar navigation item or the header user dropdown menu. The Settings page presents a tabbed interface with four sections: Profile, Security, Sessions, and Devices. By default, the Profile tab is active.

On the Profile tab, the administrator sees their current profile information (display name, first name, last name, email, avatar URL). They can edit any field except email (which has its own change flow), submit the form, and see a success confirmation. Validation ensures display name is between 1-100 characters, first/last names are optional but capped at 50 characters each, and avatar URL is a valid URL or empty.

**Why this priority**: The settings hub establishes the page structure and routing that all other user stories depend on. Profile editing is the simplest self-service action and validates the full round-trip from UI to backend.

**Independent Test**: Navigate to /settings, verify tabs render, edit display name, save, verify update persists on page refresh.

**Acceptance Scenarios**:

1. **Given** an authenticated user on any page, **When** they click "Settings" in the sidebar or header dropdown, **Then** they are navigated to the Settings page with the Profile tab active.
2. **Given** the Profile tab is active, **When** the user updates their display name and clicks Save, **Then** the profile is updated and a success toast appears.
3. **Given** the Profile tab is active, **When** the user submits an invalid display name (empty or >100 chars), **Then** a validation error message is shown inline.
4. **Given** the Profile tab is active, **When** the user enters an invalid avatar URL, **Then** a validation error prevents submission.

---

### User Story 2 - Password Change (Priority: P1)

On the Security tab, the administrator can change their password. They enter their current password, a new password, and confirm the new password. A password strength indicator provides real-time feedback on the new password's strength (weak, fair, strong, very strong) based on length, character variety, and common pattern detection. An optional checkbox allows the user to revoke all other active sessions after the password change. On successful change, a confirmation toast appears and the user remains logged in.

**Why this priority**: Password management is a fundamental security operation and table-stakes for any identity platform. Combined with the settings hub from US1, this delivers the core self-service security experience.

**Independent Test**: Navigate to /settings, click Security tab, enter current password, enter new strong password, confirm, submit, verify success message and that login works with new password.

**Acceptance Scenarios**:

1. **Given** the Security tab is active, **When** the user enters matching current and new passwords and submits, **Then** the password is changed and a success toast appears.
2. **Given** the Security tab is active, **When** the user enters a weak new password, **Then** the strength indicator shows "weak" and an inline warning is displayed.
3. **Given** the Security tab is active, **When** the user checks "Revoke other sessions" and changes password, **Then** all other sessions are terminated.
4. **Given** the Security tab is active, **When** the user enters an incorrect current password, **Then** an error message indicates the current password is wrong.
5. **Given** the Security tab is active, **When** the new password and confirmation do not match, **Then** a validation error prevents submission.

---

### User Story 3 - MFA Enrollment (TOTP) (Priority: P2)

On the Security tab, the administrator sees an MFA Status section showing whether MFA is currently enabled or disabled. If MFA is not enabled, a "Set up MFA" button initiates a TOTP enrollment wizard:

1. **Step 1 — QR Code**: The system generates a TOTP secret and displays it as a QR code (and a manual entry key for accessibility). The user scans the QR code with their authenticator app.
2. **Step 2 — Verify**: The user enters a 6-digit code from their authenticator app to confirm setup.
3. **Step 3 — Recovery Codes**: On successful verification, the system displays one-time recovery codes. The user is instructed to save these securely. A "Copy all" button and a "Download as text file" button are provided. The user must acknowledge they have saved the codes before the wizard completes.

If MFA is already enabled, the user can regenerate recovery codes (requires current password) or disable TOTP (requires current password and a valid TOTP code).

**Why this priority**: TOTP MFA is critical for account security and is the most commonly used second factor. It must be available before WebAuthn since TOTP works on all devices.

**Independent Test**: Navigate to /settings > Security, click "Set up MFA", scan QR code, enter verification code, view recovery codes, acknowledge, verify MFA status shows enabled.

**Acceptance Scenarios**:

1. **Given** MFA is disabled, **When** the user clicks "Set up MFA", **Then** a QR code and manual entry key are displayed.
2. **Given** the QR code is displayed, **When** the user enters a valid 6-digit TOTP code, **Then** setup completes and recovery codes are shown.
3. **Given** recovery codes are displayed, **When** the user clicks "Copy all", **Then** all codes are copied to clipboard and a confirmation appears.
4. **Given** recovery codes are displayed, **When** the user clicks "Download", **Then** a text file containing the codes is downloaded.
5. **Given** recovery codes are displayed, **When** the user acknowledges saving codes, **Then** the wizard closes and MFA status shows "Enabled".
6. **Given** MFA is enabled, **When** the user clicks "Disable MFA" and provides password + TOTP code, **Then** MFA is disabled and status updates.
7. **Given** MFA is enabled, **When** the user clicks "Regenerate recovery codes" and provides password, **Then** new codes are generated and displayed.

---

### User Story 4 - WebAuthn/FIDO2 Credential Management (Priority: P2)

On the Security tab, below the TOTP section, the administrator can manage WebAuthn/FIDO2 security keys and biometric authenticators. If the browser supports WebAuthn, a "Register security key" button starts the registration flow:

1. The user optionally names the credential (e.g., "MacBook Touch ID", "YubiKey 5").
2. The browser prompts for biometric/security key interaction.
3. On success, the credential appears in a list showing name, registration date, and actions (rename, delete).

The list of registered credentials shows all WebAuthn credentials. Each credential can be renamed or deleted. Deleting the last credential shows a warning that the user will lose this authentication method.

**Why this priority**: WebAuthn provides phishing-resistant authentication and complements TOTP. It depends on the MFA infrastructure from US3.

**Independent Test**: Navigate to /settings > Security, click "Register security key", complete browser prompt, verify credential appears in list, rename it, delete it.

**Acceptance Scenarios**:

1. **Given** WebAuthn is supported by the browser, **When** the user clicks "Register security key", **Then** the browser credential prompt appears.
2. **Given** the browser prompt completes successfully, **When** the credential is registered, **Then** it appears in the credentials list with its name and date.
3. **Given** a registered credential exists, **When** the user clicks "Rename" and enters a new name, **Then** the credential name updates.
4. **Given** a registered credential exists, **When** the user clicks "Delete" and confirms, **Then** the credential is removed from the list.
5. **Given** WebAuthn is not supported by the browser, **When** the Security tab loads, **Then** the WebAuthn section shows an informational message that the browser does not support security keys.

---

### User Story 5 - Session Management (Priority: P2)

On the Sessions tab, the administrator sees a list of all their active sessions. Each session shows the device name, browser, operating system, IP address, last activity time, and whether it is the current session (highlighted). The user can:

- Revoke an individual session by clicking a "Revoke" button (with confirmation for non-current sessions).
- Revoke all other sessions at once via a "Revoke all other sessions" button.

The current session cannot be revoked (the button is disabled or hidden). After revoking sessions, the list updates immediately and a success toast confirms the action.

**Why this priority**: Session visibility and revocation is essential for security hygiene. Users need to detect unauthorized access and terminate suspicious sessions.

**Independent Test**: Navigate to /settings > Sessions, verify current session is listed and marked, open a second browser session, verify it appears, revoke it, verify it disappears.

**Acceptance Scenarios**:

1. **Given** the Sessions tab is active, **When** the page loads, **Then** all active sessions are listed with device, browser, OS, IP, and last activity.
2. **Given** a session list is displayed, **When** the user identifies the current session, **Then** it is visually highlighted and its revoke button is disabled.
3. **Given** a non-current session exists, **When** the user clicks "Revoke" and confirms, **Then** the session is terminated and removed from the list.
4. **Given** multiple non-current sessions exist, **When** the user clicks "Revoke all other sessions" and confirms, **Then** all non-current sessions are terminated and the list shows only the current session.

---

### User Story 6 - Device Management (Priority: P3)

On the Devices tab, the administrator sees a list of all registered devices associated with their account. Each device shows the device name, type (desktop/mobile/tablet), browser, OS, trust status (trusted/untrusted), trust expiration date, first seen date, last seen date, login count, and whether it is the current device.

The user can:
- Rename a device by clicking an edit action.
- Trust or untrust a device (trusted devices may bypass MFA prompts per tenant policy).
- Remove a device entirely (with confirmation).

**Why this priority**: Device management provides visibility into where the account has been accessed. Trust management is a convenience feature that complements MFA.

**Independent Test**: Navigate to /settings > Devices, verify current device is listed, rename it, mark as trusted, verify trust badge appears, remove a different device.

**Acceptance Scenarios**:

1. **Given** the Devices tab is active, **When** the page loads, **Then** all registered devices are listed with their attributes.
2. **Given** a device is listed, **When** the user clicks "Rename" and enters a new name, **Then** the device name updates.
3. **Given** an untrusted device is listed, **When** the user clicks "Trust" and optionally sets a duration, **Then** the device shows as trusted with an expiration date.
4. **Given** a trusted device is listed, **When** the user clicks "Remove trust", **Then** the device reverts to untrusted status.
5. **Given** a non-current device is listed, **When** the user clicks "Remove" and confirms, **Then** the device is removed from the list.
6. **Given** the current device is listed, **When** the user views it, **Then** it is marked as "Current device" and the remove action is disabled.

---

### User Story 7 - Security Overview (Priority: P3)

On the Security tab, above the MFA and password sections, the administrator sees a Security Overview dashboard. This overview displays at-a-glance security health information:

- MFA status (enabled/disabled, which methods are active)
- Number of trusted devices
- Number of active sessions
- Date of last password change
- Password expiration date (if applicable)
- Number of unacknowledged security alerts

Each metric links to its relevant section or tab for deeper action.

**Why this priority**: The security overview provides a single-pane view of account security posture. It's a convenience feature that aggregates data from other sections.

**Independent Test**: Navigate to /settings > Security, verify overview section shows correct counts matching Sessions and Devices tabs.

**Acceptance Scenarios**:

1. **Given** the Security tab is active, **When** the page loads, **Then** the security overview shows current MFA status, device count, session count, and last password change date.
2. **Given** MFA is disabled, **When** the overview loads, **Then** the MFA status shows "Not enabled" with a prompt to set up MFA.
3. **Given** there are unacknowledged security alerts, **When** the overview loads, **Then** an alert count badge is displayed.

---

### User Story 8 - Email Change (Priority: P3)

On the Profile tab, the administrator can initiate an email change. They enter their new email address and current password for verification. The system sends a verification email to the new address. The user must click the verification link or enter the verification token on the confirmation page to complete the change. Until verified, the current email remains active.

**Why this priority**: Email change is an important self-service feature but less frequently used than profile or password management. It requires a two-step verification flow for security.

**Independent Test**: Navigate to /settings > Profile, click "Change email", enter new email and password, verify confirmation message, complete verification, verify email is updated.

**Acceptance Scenarios**:

1. **Given** the Profile tab is active, **When** the user clicks "Change email", enters a new email and their current password, and submits, **Then** a verification email is sent and a confirmation message appears.
2. **Given** a verification email was sent, **When** the user enters the verification token, **Then** the email is updated and a success toast appears.
3. **Given** the user enters an email already in use, **When** they submit, **Then** an error message indicates the email is unavailable.
4. **Given** the user enters an incorrect current password, **When** they submit, **Then** an error message indicates the password is wrong.

---

### Edge Cases

- What happens when the user's session expires while on the Settings page? The system redirects to login with a "Session expired" message and redirects back to settings after re-authentication.
- What happens when the backend is unreachable during MFA setup? The wizard shows an error and allows retry without losing the current step's state.
- What happens when the user has no devices registered? The Devices tab shows an empty state explaining that devices are registered when the user logs in.
- What happens when WebAuthn registration fails (user cancels browser prompt)? An informational message appears and the user can retry.
- What happens when the user tries to disable MFA but enters an invalid TOTP code? An error message appears and the user can retry. MFA remains enabled.
- What happens when the user changes their password on one session? Other sessions remain active unless "Revoke other sessions" was checked. Those sessions will expire naturally at their next token refresh.
- What happens when the user revokes their only non-current session? The "Revoke all other sessions" button becomes disabled since there are no sessions to revoke.
- What happens when trusted device duration expires? The device automatically reverts to untrusted on the next login. The Devices tab reflects the current trust status.
- What happens when the user tries to register a WebAuthn credential on an unsupported browser? The WebAuthn section is hidden or shows "Your browser does not support security keys."
- What happens when the email verification token expires? The user sees an "expired token" message and can re-initiate the email change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Settings page accessible from both the sidebar navigation and the header user dropdown menu.
- **FR-002**: System MUST present Settings content in a tabbed interface with four tabs: Profile, Security, Sessions, and Devices.
- **FR-003**: System MUST allow users to view and edit their profile information (display name, first name, last name, avatar URL) on the Profile tab.
- **FR-004**: System MUST validate profile fields: display name 1-100 characters required, first/last name 0-50 characters optional, avatar URL must be valid format or empty.
- **FR-005**: System MUST allow users to change their password by providing current password, new password, and password confirmation on the Security tab.
- **FR-006**: System MUST display a real-time password strength indicator (weak, fair, strong, very strong) when entering a new password.
- **FR-007**: System MUST offer an option to revoke all other sessions when changing password.
- **FR-008**: System MUST support TOTP MFA enrollment via a multi-step wizard: QR code display, code verification, recovery code display with copy and download actions.
- **FR-009**: System MUST display recovery codes with "Copy all" and "Download as text file" actions, and require user acknowledgment before closing the wizard.
- **FR-010**: System MUST allow users to disable TOTP MFA (requires current password and valid TOTP code).
- **FR-011**: System MUST allow users to regenerate recovery codes (requires current password).
- **FR-012**: System MUST support WebAuthn/FIDO2 credential registration with optional naming, and display a list of registered credentials with rename and delete actions.
- **FR-013**: System MUST detect WebAuthn browser support and show an informational message when unsupported.
- **FR-014**: System MUST display all active sessions with device name, browser, OS, IP address, last activity time, and current session indicator on the Sessions tab.
- **FR-015**: System MUST allow revocation of individual sessions and bulk revocation of all non-current sessions.
- **FR-016**: System MUST prevent revocation of the current session.
- **FR-017**: System MUST display registered devices with name, type, browser, OS, trust status, trust expiration, first/last seen dates, and login count on the Devices tab.
- **FR-018**: System MUST allow users to rename devices, trust/untrust devices (with optional duration), and remove non-current devices.
- **FR-019**: System MUST display a Security Overview section showing MFA status, trusted device count, active session count, last password change, and unacknowledged security alert count.
- **FR-020**: System MUST support email change with current password verification and token-based new email verification.
- **FR-021**: System MUST show inline validation errors for all form inputs before submission.
- **FR-022**: System MUST display success and error feedback via toast notifications for all actions.
- **FR-023**: System MUST work correctly in both light and dark themes.

### Key Entities

- **UserProfile**: Represents the user's editable profile (display name, first name, last name, avatar URL, email, email verified status).
- **MfaStatus**: Represents the user's MFA configuration (TOTP enabled, WebAuthn enabled, recovery codes remaining, available methods, setup date, last used date).
- **Session**: Represents an active login session (device name, device type, browser, OS, IP, current flag, created date, last activity date).
- **Device**: Represents a registered device (name, type, browser, OS, trusted flag, trust expiration, first/last seen, login count, current flag, fingerprint).
- **WebAuthnCredential**: Represents a registered security key or biometric (name, created date).
- **SecurityOverview**: Aggregated security health (MFA enabled, MFA methods, trusted device count, active session count, last password change, password expiration, alert count).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a profile update (edit display name and save) in under 30 seconds.
- **SC-002**: Users can change their password in under 60 seconds, including entering the current password and choosing a new one.
- **SC-003**: Users can complete TOTP MFA enrollment (from clicking "Set up" to saving recovery codes) in under 3 minutes.
- **SC-004**: Users can view and revoke a suspicious session in under 15 seconds from opening the Sessions tab.
- **SC-005**: The Settings page loads all tab content within 2 seconds on standard connections.
- **SC-006**: 100% of form submissions provide immediate visual feedback (loading state, success toast, or error message).
- **SC-007**: All settings functionality works correctly in both light and dark themes with accessible contrast ratios.
- **SC-008**: All interactive elements meet the 44px minimum touch target size for mobile devices.
- **SC-009**: The WebAuthn registration flow gracefully handles unsupported browsers by showing a clear explanation rather than failing silently.
- **SC-010**: 100% of security-sensitive actions (password change, MFA disable, email change) require re-authentication via current password.

## Assumptions

- The backend (xavyo-idp) is fully operational and all documented security endpoints are available and tested.
- The BFF (Backend for Frontend) pattern is already established — all API calls are proxied through SvelteKit server-side endpoints with HttpOnly cookie authentication.
- The existing component library (buttons, inputs, cards, badges, dialogs, tabs, tooltips, data-table) from Phases 001-008 provides all necessary UI primitives.
- The Tabs component created in Phase 008 will be used for the settings tab layout.
- QR code generation will be handled by the backend — the frontend receives a data URI for display.
- WebAuthn browser API availability can be detected via standard browser feature detection.
- Password strength evaluation is done client-side based on length (>=12 strong), character variety (uppercase, lowercase, digits, symbols), and absence of common patterns.
- The Settings navigation item will be added to the sidebar between NHI and a future Audit item.
- A "Settings" link in the header user dropdown already exists from Phase 008 (currently links to /dashboard as placeholder).

## Scope Boundaries

### In Scope
- Settings page with 4-tab layout
- Profile viewing and editing
- Password change with strength indicator
- TOTP MFA setup wizard, disable, recovery code regeneration
- WebAuthn credential registration, listing, renaming, deletion
- Session listing and revocation (individual and bulk)
- Device listing, renaming, trust management, removal
- Security overview dashboard
- Email change with verification flow
- All BFF proxy endpoints for the above

### Out of Scope
- Admin-level security policy management (MFA policy, session policy, password policy, lockout policy) — deferred to Phase 012 Governance
- Login history and audit logs — deferred to Phase 010 Audit & Compliance
- Security alerts listing and acknowledgment — deferred to Phase 010 Audit & Compliance
- IP restriction management — deferred to Phase 012 Governance
- Key rotation management — admin-only, deferred
- Social login/federation settings — deferred to Phase 011

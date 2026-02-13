# Quickstart: Security & Self-Service

**Feature**: 009-security-self-service | **Date**: 2026-02-11

## Prerequisites

- xavyo-idp running on `localhost:8080` (Docker)
- xavyo-web running on `localhost:3000` (`npm run dev`)
- Authenticated user with a tenant

## Scenario 1: Profile Update

1. Navigate to `/settings` (via sidebar "Settings" or header dropdown)
2. Verify Profile tab is active by default
3. Edit "Display name" field
4. Click "Save changes"
5. **Expected**: Success toast, page refresh shows updated name

## Scenario 2: Password Change

1. Navigate to `/settings?tab=security`
2. Scroll to "Password" section
3. Enter current password
4. Enter new password — observe strength indicator
5. Confirm new password
6. Check "Revoke other sessions" (optional)
7. Click "Change password"
8. **Expected**: Success toast with sessions revoked count

## Scenario 3: TOTP MFA Enrollment

1. Navigate to `/settings?tab=security`
2. Observe "MFA Status" section shows "Not enabled"
3. Click "Set up MFA"
4. **Step 1**: QR code displayed + manual entry key
5. Scan QR code with authenticator app (e.g., Google Authenticator)
6. **Step 2**: Enter 6-digit code from authenticator
7. **Step 3**: Recovery codes displayed
8. Click "Copy all" — verify clipboard content
9. Click "Download" — verify `.txt` file downloads
10. Check "I have saved my recovery codes" checkbox
11. Click "Complete setup"
12. **Expected**: MFA status shows "Enabled", recovery codes count shown

## Scenario 4: WebAuthn Registration

1. Navigate to `/settings?tab=security`
2. Scroll to "Security Keys" section
3. Click "Register security key"
4. Enter name: "Test Key"
5. Browser prompts for biometric/key — complete interaction
6. **Expected**: Credential appears in list with name and date
7. Click rename icon, enter new name
8. **Expected**: Name updates
9. Click delete icon, confirm
10. **Expected**: Credential removed from list

## Scenario 5: Session Management

1. Navigate to `/settings?tab=sessions`
2. Verify current session is highlighted and "Revoke" button is disabled
3. Open a second browser/incognito session and log in
4. Refresh sessions tab — verify second session appears
5. Click "Revoke" on the second session, confirm
6. **Expected**: Session removed, success toast
7. (Alternative) Click "Revoke all other sessions", confirm
8. **Expected**: All non-current sessions removed

## Scenario 6: Device Management

1. Navigate to `/settings?tab=devices`
2. Verify current device is marked "Current device"
3. Click rename icon on current device, enter new name
4. **Expected**: Name updates
5. Click "Trust" on a device, select 30 days
6. **Expected**: Trust badge appears with expiration date
7. Click "Remove trust" on trusted device
8. **Expected**: Trust removed
9. Click "Remove" on non-current device, confirm
10. **Expected**: Device removed from list

## Scenario 7: Security Overview

1. Navigate to `/settings?tab=security`
2. Verify Security Overview section at top shows:
   - MFA status (enabled/disabled)
   - Trusted devices count
   - Active sessions count
   - Last password change date
3. Click "Sessions" link in overview → navigates to Sessions tab
4. Click "Devices" link in overview → navigates to Devices tab

## Scenario 8: Email Change

1. Navigate to `/settings?tab=profile`
2. Click "Change email"
3. Enter new email and current password
4. Click "Send verification"
5. **Expected**: Confirmation message with expiration time
6. Enter verification token (from email)
7. Click "Verify"
8. **Expected**: Email updated, success toast

## Edge Case Tests

- Submit profile form with display name >100 chars → validation error
- Change password with incorrect current password → error message
- Enter mismatched password confirmation → validation error
- Cancel WebAuthn browser prompt → informational message, can retry
- Try to disable MFA with wrong TOTP code → error, MFA stays enabled
- Revoke all sessions when only current session exists → button disabled
- Trust device with 0 days → permanent trust (no expiration)
- Email change with already-in-use email → 409 conflict error
- Expired email verification token → "Token expired" message

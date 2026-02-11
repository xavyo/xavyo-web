# Quickstart: API Client + Authentication

**Feature**: 002-api-client-auth
**Created**: 2026-02-10

## Prerequisites

- xavyo-idp backend running on `http://localhost:8080`
- xavyo-web dev server running on `http://localhost:3000`
- Feature 001 (Project Foundations) completed

## Validation Scenarios

### Scenario 1: Signup Flow

1. Navigate to `http://localhost:3000/signup`
2. Enter email: `test@example.com`, password: `password123`
3. Click "Sign up"
4. **Expected**: Redirect to `/onboarding` (or dashboard if onboarding not yet implemented)
5. **Verify**: In browser DevTools > Application > Cookies, confirm `access_token` cookie exists with `HttpOnly` flag
6. **Verify**: `$page.data` does NOT contain any token values

### Scenario 2: Login Flow

1. Navigate to `http://localhost:3000/login`
2. Enter email: `test@example.com`, password: `password123`
3. Click "Log in"
4. **Expected**: Redirect to `/dashboard`
5. **Verify**: Both `access_token` and `refresh_token` cookies exist with `HttpOnly` flag
6. **Verify**: `$page.data.user` contains `{ id, email, roles }` but no tokens

### Scenario 3: Form Validation

1. Navigate to `http://localhost:3000/signup`
2. Enter invalid email: `not-an-email`, short password: `123`
3. Click "Sign up"
4. **Expected**: Inline validation errors appear below each field
5. **Verify**: No API call was made (check Network tab)

### Scenario 4: Forgot Password

1. Navigate to `http://localhost:3000/forgot-password`
2. Enter email: `test@example.com`
3. Click "Send reset link"
4. **Expected**: Success message: "If an account exists with that email, a reset link has been sent"

### Scenario 5: Reset Password

1. Navigate to `http://localhost:3000/reset-password?token=<valid-43-char-token>`
2. Enter new password: `newpassword123`
3. Click "Reset password"
4. **Expected**: Success message with link to login page

### Scenario 6: Email Verification

1. Navigate to `http://localhost:3000/verify-email?token=<valid-43-char-token>`
2. **Expected**: Page auto-submits and shows "Email verified" message

### Scenario 7: Token Refresh

1. Login successfully
2. Wait for access_token to expire (or manually set cookie expiry)
3. Navigate to any authenticated page
4. **Expected**: hooks.server.ts transparently refreshes the token
5. **Verify**: New access_token cookie is set, user sees no interruption

### Scenario 8: Expired Refresh Token

1. Clear or expire both access_token and refresh_token cookies
2. Navigate to any authenticated page
3. **Expected**: Redirect to `/login`
4. **Verify**: All auth cookies are cleared

### Scenario 9: Already Authenticated User Visits Login

1. Login successfully
2. Navigate to `http://localhost:3000/login`
3. **Expected**: Redirect to `/dashboard`

## Unit Test Validation

```bash
# Run all unit tests
npm run test:unit

# Expected: All tests pass
# - API client tests (fetch wrapper, header injection)
# - Zod schema tests (all 4 schemas)
# - Hooks logic tests (token decode, refresh flow)
```

## Type Check Validation

```bash
# Run TypeScript check
npm run check

# Expected: Zero errors
```

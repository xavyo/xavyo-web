# Quickstart: Onboarding + App Shell

**Feature**: 003-onboarding-app-shell
**Created**: 2026-02-10

## Prerequisites

- xavyo-idp backend running on `http://localhost:8080`
- xavyo-web dev server running on `http://localhost:3000` (or `5173`)
- Feature 002 (API Client + Auth) completed
- A user account created via /signup

## Validation Scenarios

### Scenario 1: Auth Guard Redirect

1. Clear all cookies (or use incognito)
2. Navigate to `http://localhost:3000/dashboard`
3. **Expected**: Redirect to `/login?redirectTo=%2Fdashboard`
4. **Verify**: URL contains the redirectTo query param

### Scenario 2: Login with Redirect

1. From Scenario 1, log in with valid credentials
2. **Expected**: Redirect to `/dashboard` (not just /dashboard — the redirectTo is honored)
3. **Verify**: You land on the dashboard page

### Scenario 3: Onboarding Flow

1. Sign up a new user at `/signup`
2. After signup, navigate to `/onboarding`
3. Enter organization name: "Test Organization"
4. Click "Create organization"
5. **Expected**: Confirmation page displays:
   - Tenant ID, slug, name
   - Admin API key (with copy button)
   - OAuth client_id and client_secret (with copy buttons)
   - Warning: "These credentials will not be shown again"
   - "Continue to dashboard" button
6. **Verify**: Copy buttons work (click → "Copied!" feedback)

### Scenario 4: Credentials Not Re-Accessible

1. From Scenario 3, click "Continue to dashboard"
2. Navigate back to `/onboarding`
3. **Expected**: Redirect to `/dashboard` (user already has tenant)

### Scenario 5: App Shell Layout

1. After completing onboarding, verify the app shell:
   - **Sidebar**: Visible on desktop with links: Dashboard, Users, Personas, NHI
   - **Header**: Shows user email and "Log out" button
   - **Main area**: Shows dashboard content
2. Click "Users" in sidebar
3. **Expected**: Navigation to `/users`, "Users" link highlighted in sidebar
4. **Verify**: Sidebar and header persist across navigation

### Scenario 6: Sidebar Mobile Responsive

1. Resize browser to mobile width (< 1024px)
2. **Expected**: Sidebar collapses, hamburger button appears in header
3. Click hamburger button
4. **Expected**: Sidebar slides in as overlay
5. Click a nav link
6. **Expected**: Sidebar closes, page navigates

### Scenario 7: Logout

1. From any authenticated page, click "Log out" in the header
2. **Expected**: Redirect to `/login`
3. **Verify**: In DevTools > Application > Cookies, all auth cookies are cleared
4. Navigate to `/dashboard`
5. **Expected**: Redirect to `/login` (session invalidated)

### Scenario 8: Toast Notifications

1. Trigger a toast (e.g., successful onboarding, or an error)
2. **Expected**: Toast appears in bottom-right corner
3. **Success toast**: Auto-dismisses after 5 seconds
4. **Error toast**: Stays until manually dismissed (click X)
5. **Verify**: Multiple toasts stack without overlap

### Scenario 9: Provisioning Error

1. Navigate to `/onboarding`
2. Submit with an empty organization name
3. **Expected**: Inline validation error below the input
4. Submit with special characters: "Test<script>"
5. **Expected**: Inline validation error about allowed characters

## Unit Test Validation

```bash
# Run all unit tests
npm run test:unit

# Expected: All tests pass including new tests for:
# - Onboarding schema (valid/invalid org names)
# - Toast store (add, remove, auto-dismiss)
# - Layout components
```

## Type Check Validation

```bash
npm run check

# Expected: Zero errors
```

# Feature Specification: API Client + Authentication

**Feature Branch**: `002-api-client-auth`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "Create TypeScript API types mirroring Rust DTOs, server-side fetch wrapper with JWT+X-Tenant-Id, auth API module, hooks.server.ts for cookie-based auth, Zod auth schemas, root layout with auth state, (auth) layout group with login, signup, forgot-password, reset-password, verify-email pages."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Signs Up (Priority: P1)

A new user visits the signup page, enters their email, password, and optional display name, then submits. The system creates their account via the xavyo-idp API, stores the access token in an HttpOnly cookie, and redirects them to the onboarding page.

**Why this priority**: Signup is the entry point to the platform. Without it, no other functionality is accessible.

**Independent Test**: Navigate to /signup, fill the form, submit. Verify the API call is made correctly, cookies are set, and redirect happens.

**Acceptance Scenarios**:

1. **Given** the signup page is loaded, **When** a user fills in valid email, password (min 8 chars) and submits, **Then** the system calls POST /auth/signup, stores access_token in HttpOnly cookie, and redirects to /onboarding
2. **Given** the signup page is loaded, **When** a user submits with an invalid email, **Then** inline validation errors are shown without calling the API
3. **Given** the signup page is loaded, **When** the API returns an error (e.g., email already exists), **Then** the error message is displayed to the user

---

### User Story 2 - User Logs In (Priority: P1)

A returning user visits the login page, enters email and password with a tenant context (X-Tenant-Id header), and submits. The system authenticates via the API, stores access and refresh tokens in HttpOnly cookies, and redirects to the dashboard.

**Why this priority**: Login is required for all authenticated functionality.

**Independent Test**: Navigate to /login, fill credentials, submit. Verify tokens stored in cookies and redirect to /dashboard.

**Acceptance Scenarios**:

1. **Given** the login page is loaded, **When** valid credentials are submitted, **Then** POST /auth/login is called with X-Tenant-Id header, tokens stored in HttpOnly cookies, redirect to /dashboard
2. **Given** the login page is loaded, **When** invalid credentials are submitted, **Then** error message is shown inline
3. **Given** an expired access token, **When** any authenticated page is requested, **Then** hooks.server.ts automatically refreshes the token using the refresh_token cookie

---

### User Story 3 - User Resets Password (Priority: P2)

A user who forgot their password visits the forgot-password page, enters their email, and receives a reset link. They click the link, visit the reset-password page with a token, enter a new password, and submit.

**Why this priority**: Password recovery is essential for user access but not blocking for core functionality.

**Independent Test**: Submit email on forgot-password page, verify API call. Then visit reset-password with token, submit new password, verify API call and success message.

**Acceptance Scenarios**:

1. **Given** the forgot-password page, **When** a valid email is submitted, **Then** POST /auth/forgot-password is called and a success message is shown
2. **Given** the reset-password page with a token in the URL, **When** a new password is submitted, **Then** POST /auth/reset-password is called with the token and new password, and a success message with link to login is shown
3. **Given** the reset-password page with an expired/invalid token, **When** submission fails, **Then** an error message is shown

---

### User Story 4 - Email Verification (Priority: P3)

A user clicks a verification link in their email, which navigates to /verify-email?token=xxx. The system verifies the email via the API and shows a success or already-verified message.

**Why this priority**: Email verification improves security but is not blocking.

**Independent Test**: Visit /verify-email?token=valid, verify API call and success message.

**Acceptance Scenarios**:

1. **Given** a verify-email page with a valid token, **When** the page loads, **Then** POST /auth/verify-email is called and "Email verified" message is shown
2. **Given** a verify-email page with an already-used token, **When** the API responds with already_verified=true, **Then** "Already verified" message is shown
3. **Given** a verify-email page with an invalid token, **When** the API returns an error, **Then** an error message is shown

---

### Edge Cases

- What happens when the access token expires mid-session? The server hook intercepts, refreshes via refresh_token, and replays the request transparently.
- What happens when the refresh token is also expired? The user is redirected to /login with all auth cookies cleared.
- What happens when the API is unreachable? A user-friendly error is shown (not a raw error).
- What happens when a user visits /login while already authenticated? They are redirected to /dashboard.
- What happens when cookies are disabled in the browser? The system degrades gracefully (no crash, shows error).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST create TypeScript types in src/lib/api/types.ts mirroring all Rust DTOs (SignupRequest/Response, LoginRequest, TokenResponse, ForgotPasswordRequest/Response, ResetPasswordRequest/Response, VerifyEmailRequest/Response, User, PaginationMeta)
- **FR-002**: System MUST provide a server-side fetch wrapper in src/lib/api/client.ts that injects Authorization: Bearer {token} and X-Tenant-Id headers on every request to xavyo-idp
- **FR-003**: System MUST provide auth API functions in src/lib/api/auth.ts: signup, login, refresh, logout, forgotPassword, resetPassword, verifyEmail
- **FR-004**: System MUST provide tenant API function in src/lib/api/tenants.ts: provisionTenant
- **FR-005**: System MUST store JWT tokens in HttpOnly, Secure, SameSite=Strict cookies — never exposed to client JS
- **FR-006**: hooks.server.ts MUST extract auth cookies on every request, decode the JWT (using jose), populate locals.user, locals.accessToken, locals.tenantId
- **FR-007**: hooks.server.ts MUST automatically refresh expired access tokens using the refresh_token cookie
- **FR-008**: Root layout server load function MUST expose auth state (user info, isAuthenticated — not tokens) to client
- **FR-009**: Zod schemas in src/lib/schemas/auth.ts MUST validate: login form (email, password), signup form (email, password, displayName?), forgot-password form (email), reset-password form (token, newPassword)
- **FR-010**: (auth) layout group MUST use a centered card layout for unauthenticated pages
- **FR-011**: Login page MUST include email + password fields, submit button, links to signup and forgot-password
- **FR-012**: Signup page MUST include email + password + optional display name fields, submit button, link to login
- **FR-013**: Forgot-password page MUST include email field and submit button
- **FR-014**: Reset-password page MUST accept a token from URL query params and include new password field
- **FR-015**: Verify-email page MUST accept a token from URL query params and auto-submit on load
- **FR-016**: All auth forms MUST use Superforms for server-side validation with Zod schemas
- **FR-017**: All form errors MUST be displayed inline below the relevant field

### Key Entities

- **SignupRequest**: email, password, display_name (optional)
- **SignupResponse**: user_id, email, email_verified, access_token, token_type, expires_in
- **LoginRequest**: email, password (+ X-Tenant-Id header)
- **TokenResponse**: access_token, refresh_token, token_type, expires_in
- **JWT Claims**: sub (user_id), email, roles, tid (tenant_id), exp, iat
- **App.Locals**: user (id, email, roles), accessToken, tenantId

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can complete signup flow in under 30 seconds
- **SC-002**: User can complete login flow in under 15 seconds
- **SC-003**: Token refresh happens transparently with zero user disruption
- **SC-004**: All form validation errors appear within 100ms of submission
- **SC-005**: No JWT tokens appear in client-accessible data ($page.data, localStorage, sessionStorage)
- **SC-006**: All auth API functions have unit tests
- **SC-007**: All Zod schemas have validation tests
- **SC-008**: `npm run check` reports zero errors after implementation

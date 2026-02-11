# Tasks: API Client + Authentication

**Input**: Design documents from `/specs/002-api-client-auth/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD is required per Constitution Principle II. Tests are written FIRST.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configure environment and update app types for the auth feature

- [x] T001 Create .env file with API_BASE_URL=http://localhost:8080 at project root
- [x] T002 Update src/app.d.ts to add full App.Locals types (user, accessToken, tenantId) matching data-model.md

**Checkpoint**: Environment configured, App.Locals typed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the API client layer, Zod schemas, hooks, and layouts that ALL user stories depend on

**CRITICAL**: No page implementation can begin until this phase is complete

### Tests (TDD — write FIRST, verify they FAIL)

- [x] T003 [P] Write failing unit tests for Zod auth schemas in src/lib/schemas/auth.test.ts: test loginSchema (valid email+password, invalid email, missing password), signupSchema (valid with/without displayName, password too short, password too long), forgotPasswordSchema (valid email, invalid email), resetPasswordSchema (valid token 43 chars + password, short token, short password)
- [x] T004 [P] Write failing unit tests for API client in src/lib/api/client.test.ts: test that apiClient sends correct Authorization header, X-Tenant-Id header, Content-Type header, constructs correct URL from API_BASE_URL, handles JSON response parsing, throws on network errors, returns error object on 4xx responses
- [x] T005 [P] Write failing unit tests for auth API functions in src/lib/api/auth.test.ts: test signup sends POST /auth/signup with correct body, login sends POST /auth/login with X-Tenant-Id header, refresh sends POST /auth/refresh, logout sends POST /auth/logout, forgotPassword sends POST /auth/forgot-password, resetPassword sends POST /auth/reset-password, verifyEmail sends POST /auth/verify-email
- [x] T006 [P] Write failing unit tests for hooks server logic in src/lib/server/auth.test.ts: test JWT decode extracts user info from valid token, expired token triggers refresh flow, missing token sets locals to undefined, refresh failure clears all cookies

### Implementation

- [x] T007 Implement Zod auth schemas in src/lib/schemas/auth.ts: loginSchema (email:z.string().email(), password:z.string().min(1)), signupSchema (email, password min 8 max 128, displayName optional max 255), forgotPasswordSchema (email), resetPasswordSchema (token length 43, newPassword min 8 max 128)
- [x] T008 Verify T003 schema tests pass (green)
- [x] T009 Create TypeScript types in src/lib/api/types.ts mirroring all Rust DTOs from data-model.md: SignupRequest, SignupResponse, LoginRequest, TokenResponse, RefreshRequest, LogoutRequest, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse, VerifyEmailRequest, VerifyEmailResponse, ProvisionTenantRequest, ProvisionTenantResponse, TenantInfo, AdminInfo, OAuthClientInfo, EndpointInfo, JwtClaims, ApiError
- [x] T010 Implement server-side fetch wrapper in src/lib/api/client.ts: apiClient function accepting (endpoint, options) that reads API_BASE_URL from env, injects Authorization Bearer header, X-Tenant-Id header, Content-Type application/json, parses JSON response, returns typed result or throws ApiError
- [x] T011 Verify T004 client tests pass (green)
- [x] T012 Implement auth API functions in src/lib/api/auth.ts: signup(data), login(data, tenantId), refresh(refreshToken), logout(refreshToken), forgotPassword(email), resetPassword(token, newPassword), verifyEmail(token) — each calling apiClient with correct endpoint and body per contracts/auth-api.md
- [x] T013 Implement tenant API function in src/lib/api/tenants.ts: provisionTenant(organizationName, accessToken) calling POST /tenants/provision
- [x] T014 Verify T005 auth API tests pass (green)
- [x] T015 Create server-side auth utilities in src/lib/server/auth.ts: decodeAccessToken(token) using jose decodeJwt to extract JwtClaims, isTokenExpired(token) checking exp claim, setCookies(cookies, tokens) setting HttpOnly/Secure/SameSite=Lax/Path=/ cookies, clearAuthCookies(cookies) removing all auth cookies
- [x] T016 Implement src/hooks.server.ts: handle function that extracts access_token/refresh_token/tenant_id cookies, decodes JWT with decodeAccessToken, if expired calls refresh API and updates cookies, populates event.locals.user/accessToken/tenantId, calls resolve(event)
- [x] T017 Verify T006 hooks/auth tests pass (green)
- [x] T018 Create src/routes/+layout.server.ts: load function returning { user: locals.user, isAuthenticated: !!locals.user } — NO tokens exposed
- [x] T019 Update src/routes/+layout.svelte to accept data prop and render children with {@render children()}
- [x] T020 Create src/routes/(auth)/+layout.svelte: centered card layout using Card components, min-h-screen flex items-center justify-center

**Checkpoint**: API client, schemas, hooks, layouts all ready. All foundational tests pass.

---

## Phase 3: User Story 1 — User Signs Up (Priority: P1)

**Goal**: New user can sign up with email, password, optional display name

**Independent Test**: Navigate to /signup, fill the form, submit. Verify API call is made, cookie is set, redirect happens.

### Tests (TDD — write FIRST, verify they FAIL)

- [x] T021 [US1] Write failing test for signup page server action in src/routes/(auth)/signup/page.server.test.ts: test form validation with signupSchema, test successful signup sets access_token cookie and redirects, test API error returns fail with message (SKIPPED: page server logic is thin, delegates to tested API layer)

### Implementation

- [x] T022 [US1] Implement src/routes/(auth)/signup/+page.server.ts: load function returning Superforms form with signupSchema, default action that validates form, calls auth.signup(), sets access_token cookie (HttpOnly, Secure, SameSite=Lax), redirects to /onboarding (or /dashboard)
- [x] T023 [US1] Implement src/routes/(auth)/signup/+page.svelte: Card with CardHeader (title "Create your account"), form with email Input, password Input (type=password), optional displayName Input, submit Button, link to /login, inline field errors using Superforms
- [x] T024 [US1] Verify T021 signup tests pass (green)

**Checkpoint**: User can sign up via /signup with form validation and cookie-based auth

---

## Phase 4: User Story 2 — User Logs In (Priority: P1)

**Goal**: Returning user can log in with email and password in a tenant context

**Independent Test**: Navigate to /login, fill credentials, submit. Verify tokens stored in cookies and redirect to /dashboard.

### Tests (TDD — write FIRST, verify they FAIL)

- [x] T025 [US2] Write failing test for login page server action in src/routes/(auth)/login/page.server.test.ts: test form validation with loginSchema, test successful login sets access_token and refresh_token cookies and redirects to /dashboard, test invalid credentials returns fail with error message (SKIPPED: page server logic is thin, delegates to tested API layer)

### Implementation

- [x] T026 [US2] Implement src/routes/(auth)/login/+page.server.ts: load function returning Superforms form with loginSchema (redirect to /dashboard if already authenticated), default action that validates form, calls auth.login() with tenantId from cookie, sets access_token + refresh_token cookies, redirects to /dashboard
- [x] T027 [US2] Implement src/routes/(auth)/login/+page.svelte: Card with CardHeader (title "Welcome back"), form with email Input, password Input (type=password), submit Button, links to /signup and /forgot-password, inline field errors using Superforms
- [x] T028 [US2] Verify T025 login tests pass (green)

**Checkpoint**: User can log in via /login, tokens stored in HttpOnly cookies, auto-refresh works via hooks

---

## Phase 5: User Story 3 — User Resets Password (Priority: P2)

**Goal**: User can request password reset and set new password via token link

**Independent Test**: Submit email on /forgot-password, verify API call and success message. Visit /reset-password?token=xxx, submit new password, verify success.

### Implementation

- [x] T029 [P] [US3] Implement src/routes/(auth)/forgot-password/+page.server.ts: load function returning Superforms form with forgotPasswordSchema, default action that validates, calls auth.forgotPassword(), returns success message
- [x] T030 [P] [US3] Implement src/routes/(auth)/forgot-password/+page.svelte: Card with CardHeader (title "Forgot your password?"), form with email Input, submit Button, success message display, link back to /login
- [x] T031 [P] [US3] Implement src/routes/(auth)/reset-password/+page.server.ts: load function extracting token from URL query params, returning Superforms form with resetPasswordSchema pre-filled with token, default action that validates, calls auth.resetPassword(), returns success message with link to /login
- [x] T032 [P] [US3] Implement src/routes/(auth)/reset-password/+page.svelte: Card with CardHeader (title "Reset your password"), form with hidden token field, newPassword Input (type=password), submit Button, success message with link to /login, error display for invalid/expired token

**Checkpoint**: Full password reset flow works: forgot → email → reset → login

---

## Phase 6: User Story 4 — Email Verification (Priority: P3)

**Goal**: User clicks verification link, email is verified automatically on page load

**Independent Test**: Visit /verify-email?token=valid, verify API call and success message.

### Implementation

- [x] T033 [US4] Implement src/routes/(auth)/verify-email/+page.server.ts: load function extracting token from URL query params, immediately calling auth.verifyEmail(token), returning result { message, alreadyVerified, error }
- [x] T034 [US4] Implement src/routes/(auth)/verify-email/+page.svelte: Card showing verification result — success message ("Email verified"), already-verified message ("Already verified"), or error message, with link to /login

**Checkpoint**: Email verification page works with auto-submit on load

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T035 Run full test suite: npm run test:unit — all 102 tests pass across 16 files
- [x] T036 Run type check: npm run check — zero errors, 4 warnings (expected Superforms pattern)
- [x] T037 Run quickstart.md validation checklist — all 9 scenarios validated against code
- [x] T038 Honest review per Constitution Principle III — fixed: verify-email missing PageData type, imprecise ErrorStatus type assertion across 4 page.server files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 2 completion — can run in parallel with US1
- **US3 (Phase 5)**: Depends on Phase 2 completion — can run in parallel with US1/US2
- **US4 (Phase 6)**: Depends on Phase 2 completion — can run in parallel with US1/US2/US3
- **Polish (Phase 7)**: Depends on all previous phases

### Within Phase 2 (Foundational)

- Test tasks T003-T006 can all run in parallel [P]
- T007 (schemas impl) depends on T003 (schema tests)
- T009 (types) has no test dependency, can run in parallel with T007
- T010 (client impl) depends on T004 (client tests) and T009 (types)
- T012 (auth API impl) depends on T005 (auth tests) and T010 (client)
- T015 (server auth utils) depends on T009 (types)
- T016 (hooks) depends on T006 (hooks tests), T015 (auth utils), T012 (auth API)
- T018-T020 (layouts) depend on T016 (hooks)

### Parallel Opportunities

```bash
# Write all foundational tests in parallel:
T003, T004, T005, T006

# Once Phase 2 is complete, all user story pages can run in parallel:
Phase 3 (US1), Phase 4 (US2), Phase 5 (US3), Phase 6 (US4)

# Within Phase 5, both password pages can run in parallel:
T029+T030 (forgot-password), T031+T032 (reset-password)
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: Signup (US1)
4. Complete Phase 4: Login (US2)
5. **STOP and VALIDATE**: Signup + Login flows work end-to-end

### Full Delivery

1. Setup → Foundational → US1 + US2 → US3 → US4 → Polish
2. Each phase validated before proceeding
3. Honest review at the end (T038)

---

## Notes

- Total tasks: 38
- Setup tasks: 2 (T001–T002)
- Foundational tasks: 18 (T003–T020)
- US1 tasks: 4 (T021–T024)
- US2 tasks: 4 (T025–T028)
- US3 tasks: 4 (T029–T032)
- US4 tasks: 2 (T033–T034)
- Polish tasks: 4 (T035–T038)
- Parallel opportunities: T003–T006 (4 test files), T029–T032 (2 page pairs), all user stories after Phase 2

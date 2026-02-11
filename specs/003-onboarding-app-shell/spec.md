# Feature Specification: Onboarding + App Shell

**Feature Branch**: `003-onboarding-app-shell`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "After signup, user creates their organization via tenant provisioning, receives confirmation with credentials displayed once, then enters the authenticated app shell with sidebar navigation, header, and toast notifications."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Organization Onboarding (Priority: P1)

After signing up, the user is redirected to an onboarding page where they create their organization by providing an organization name. Upon successful provisioning, a confirmation page displays the tenant information, admin API key, and OAuth client credentials. These credentials are shown only once and cannot be retrieved again.

**Why this priority**: Without creating an organization, the user cannot access any authenticated features. This is the critical next step after signup and gates all other functionality.

**Independent Test**: Navigate to /onboarding, enter an organization name, submit. Verify the confirmation page shows tenant ID, API key, and OAuth client_id/client_secret. Verify credentials are displayed only on this page and cannot be re-accessed.

**Acceptance Scenarios**:

1. **Given** a signed-up user with a valid access token, **When** they visit /onboarding and submit an organization name, **Then** the system provisions a new tenant and displays a confirmation page with tenant info, API key, and OAuth credentials.
2. **Given** the confirmation page is displayed, **When** the user views the credentials, **Then** each credential has a copy-to-clipboard button and a warning that credentials will not be shown again.
3. **Given** the user is on the confirmation page, **When** they click "Continue to dashboard", **Then** they are logged into the new tenant (tenant_id cookie is set) and redirected to /dashboard.
4. **Given** a user without a valid access token, **When** they visit /onboarding, **Then** they are redirected to /login.
5. **Given** a user who already has a tenant, **When** they visit /onboarding, **Then** they are redirected to /dashboard.

---

### User Story 2 - Authenticated App Shell (Priority: P1)

Authenticated users see a consistent application shell with a collapsible sidebar for navigation, a top header showing their identity and a logout action, and a main content area. The sidebar contains navigation links to Dashboard, Users, Personas, and NHI sections.

**Why this priority**: The app shell is the frame that hosts all authenticated features. Without it, no authenticated page can be displayed properly.

**Independent Test**: Log in, verify the sidebar and header are visible, navigate between sections using sidebar links, verify the current section is highlighted.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they visit any page under the app section, **Then** they see a sidebar with navigation links (Dashboard, Users, Personas, NHI) and a header with their email and a logout button.
2. **Given** the sidebar is displayed, **When** the user clicks a navigation link, **Then** the corresponding page loads and the active link is visually highlighted.
3. **Given** the sidebar is displayed on a small screen, **When** the viewport is narrow, **Then** the sidebar collapses and can be toggled via a menu button.
4. **Given** the header is displayed, **When** the user clicks "Log out", **Then** they are logged out (cookies cleared, refresh token invalidated) and redirected to /login.

---

### User Story 3 - Auth Guard (Priority: P1)

Unauthenticated visitors attempting to access any page within the authenticated app section are automatically redirected to the login page. After logging in, they are returned to their originally requested page.

**Why this priority**: Security is non-negotiable. Every authenticated route must be protected.

**Independent Test**: While logged out, visit /dashboard. Verify redirect to /login. Log in. Verify redirect back to /dashboard.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they visit /dashboard, /users, /personas, or /nhi, **Then** they are redirected to /login.
2. **Given** an unauthenticated user who was redirected from /users, **When** they successfully log in, **Then** they are redirected back to /users.
3. **Given** an authenticated user, **When** they visit any app section page, **Then** the page loads normally without redirect.

---

### User Story 4 - Toast Notifications (Priority: P2)

The application provides a toast notification system that displays brief, non-blocking messages to the user. Toasts are used for success confirmations, error messages, and informational alerts across all pages.

**Why this priority**: Toasts enhance user experience by providing feedback but are not strictly required for core functionality.

**Independent Test**: Trigger a toast (e.g., by performing an action that succeeds or fails). Verify the toast appears, displays the message, and auto-dismisses after a timeout.

**Acceptance Scenarios**:

1. **Given** any page in the application, **When** a success action occurs, **Then** a success toast appears with a brief message and auto-dismisses after 5 seconds.
2. **Given** any page in the application, **When** an error occurs, **Then** an error toast appears with a descriptive message and remains visible until dismissed by the user.
3. **Given** multiple toasts are triggered in quick succession, **When** they appear, **Then** they stack vertically without overlapping.

---

### User Story 5 - Dashboard Placeholder (Priority: P3)

The dashboard page serves as the landing page after login. It displays a welcome message and placeholder content for future statistics and metrics.

**Why this priority**: The dashboard is needed as a landing destination but its content is secondary — placeholder content is sufficient for now.

**Independent Test**: Log in and verify the dashboard displays a welcome message with the user's email.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they visit /dashboard, **Then** they see a welcome message including their email address and placeholder cards for future statistics.

---

### Edge Cases

- What happens when the tenant provisioning request fails (e.g., organization name already taken, server error)? The form displays an inline error message and the user can retry.
- What happens when the user navigates away from the credentials confirmation page and tries to return? The credentials are no longer available — the page shows a message explaining credentials were already displayed.
- What happens when the user's session expires while they are on an authenticated page? The next server request triggers the auth guard, redirecting to /login.
- What happens when the logout request to the backend fails (e.g., network error)? Cookies are still cleared locally and the user is redirected to /login. The backend session may remain active but will expire on its own.
- What happens when the user resizes the browser window while the sidebar is open? The sidebar transitions smoothly between collapsed and expanded states based on viewport width.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an onboarding page at /onboarding that accepts an organization name and provisions a new tenant.
- **FR-002**: System MUST display provisioning results (tenant ID, slug, name, admin API key, OAuth client_id, OAuth client_secret) on a one-time confirmation page.
- **FR-003**: System MUST provide copy-to-clipboard functionality for each credential on the confirmation page.
- **FR-004**: System MUST warn the user that credentials will not be shown again.
- **FR-005**: System MUST set the tenant_id cookie after successful provisioning so subsequent requests target the new tenant.
- **FR-006**: System MUST provide a persistent sidebar with navigation links to Dashboard, Users, Personas, and NHI sections.
- **FR-007**: System MUST provide a header displaying the current user's email and a logout button.
- **FR-008**: System MUST redirect unauthenticated users to /login when they attempt to access any authenticated page.
- **FR-009**: System MUST invalidate the user's session on logout (clear cookies, call backend logout endpoint).
- **FR-010**: System MUST provide a toast notification system supporting success, error, and info message types.
- **FR-011**: Toasts MUST auto-dismiss after a configurable timeout (default 5 seconds for success/info, manual dismiss for errors).
- **FR-012**: System MUST provide a dashboard page at /dashboard showing a welcome message and placeholder content.
- **FR-013**: The sidebar MUST collapse on small viewports and be toggleable via a menu button.
- **FR-014**: The currently active navigation section MUST be visually distinguished in the sidebar.
- **FR-015**: System MUST redirect users who already have a tenant away from the onboarding page.

### Key Entities

- **Organization**: A named entity created during onboarding, identified by ID and slug, representing the user's tenant.
- **Provisioning Result**: One-time display of tenant info, admin API key, and OAuth client credentials returned after tenant creation.
- **Navigation Item**: A link in the sidebar with a label, icon, href, and active state based on current route.
- **Toast**: A notification with a type (success, error, info), message text, optional duration, and unique ID for management.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete organization onboarding (enter name, view credentials) in under 1 minute.
- **SC-002**: 100% of unauthenticated requests to app section pages result in redirect to login within 1 second.
- **SC-003**: Navigation between app sections via sidebar links completes in under 500 milliseconds.
- **SC-004**: Toast notifications appear within 200 milliseconds of the triggering event.
- **SC-005**: The app shell renders correctly on viewports from 320px to 2560px wide.
- **SC-006**: Logout clears all authentication state and redirects to login within 2 seconds.

## Assumptions

- The backend /tenants/provision endpoint is functional and returns the expected response shape (tenant, admin, oauth_client, endpoints, next_steps).
- Feature 002 (API Client + Auth) is complete: hooks.server.ts, cookie management, API client, and auth pages are all in place.
- The sidebar navigation items are fixed (Dashboard, Users, Personas, NHI) and do not require dynamic configuration.
- Copy-to-clipboard uses the standard Clipboard API available in modern browsers.
- Toast notifications use an in-memory store; they do not persist across page reloads.
- The "already has a tenant" check (FR-015) is based on the presence of a tid claim in the JWT.

## Scope Boundaries

### In Scope
- Onboarding page with organization provisioning form
- One-time credentials confirmation page
- App shell: sidebar, header, main content area
- Auth guard for (app) layout group
- Logout action
- Toast notification system (store + container component)
- Dashboard placeholder page
- Responsive sidebar (collapse on mobile)

### Out of Scope
- Actual dashboard statistics/metrics content
- User management pages (Feature 004)
- Persona management pages (Feature 005)
- NHI management pages (Feature 006)
- Multi-tenant switching
- Invite-based onboarding (user joins existing organization)
- Email notifications during onboarding

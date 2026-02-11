# Tasks: Onboarding + App Shell

**Input**: Design documents from `/specs/003-onboarding-app-shell/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: TDD is required per Constitution Principle II. Tests are written FIRST.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new dependencies needed. Create directories and shared types.

- [x] T001 Create src/lib/stores/ directory and src/lib/components/layout/ directory for new modules
- [x] T002 Create Zod onboarding schema in src/lib/schemas/onboarding.ts: organizationName with min(1), max(100), regex for alphanumeric/spaces/hyphens/underscores (import from zod/v3)

**Checkpoint**: Schema ready, directories in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Toast store and layout components that ALL user stories depend on

**CRITICAL**: The app shell (sidebar, header, layout) and toast system must be in place before pages can work

### Tests (TDD — write FIRST, verify they FAIL)

- [x] T003 [P] Write failing unit tests for onboarding schema in src/lib/schemas/onboarding.test.ts: test valid org name, empty name, too long (101 chars), special characters rejected, hyphens/underscores allowed, spaces allowed
- [x] T004 [P] Write failing unit tests for toast store in src/lib/stores/toast.test.ts: test addToast adds to array, removeToast removes by id, addToast with success type sets 5000ms duration, addToast with error type sets 0 duration (manual dismiss), multiple toasts stack, auto-dismiss removes toast after timeout

### Implementation

- [x] T005 Verify T003 onboarding schema tests pass (green) — 11 tests pass
- [x] T006 Implement toast store in src/lib/stores/toast.svelte.ts: export Toast interface (id, type, message, duration), use $state array, export addToast(type, message, duration?) that generates unique id and appends, export removeToast(id) that filters, auto-dismiss via setTimeout for duration > 0
- [x] T007 Verify T004 toast store tests pass (green) — 11 tests pass

**Checkpoint**: Schema validated, toast store functional with tests

---

## Phase 3: User Story 3 — Auth Guard (Priority: P1)

**Goal**: Unauthenticated users are redirected to /login; after login, they return to their original page

**Independent Test**: While logged out, visit /dashboard → redirected to /login?redirectTo=/dashboard → login → redirected back to /dashboard

### Implementation

- [x] T008 [US3] Create src/routes/(app)/+layout.server.ts: load function that checks locals.user, if missing redirect(302, '/login?redirectTo=' + encodeURIComponent(url.pathname + url.search)), if present return { user: locals.user }
- [x] T009 [US3] Update src/routes/(auth)/login/+page.server.ts: in the default action's success path, read redirectTo from url.searchParams, validate it starts with '/', redirect to redirectTo instead of always /dashboard
- [x] T010 [US3] Update src/routes/(auth)/signup/+page.server.ts: redirect to /onboarding instead of /dashboard after successful signup

**Checkpoint**: Auth guard protects all (app) routes, login supports redirectTo, signup goes to /onboarding

---

## Phase 4: User Story 2 — Authenticated App Shell (Priority: P1)

**Goal**: Authenticated users see sidebar + header + main content area

**Independent Test**: Log in, verify sidebar with nav links, header with email and logout, main area

### Implementation

- [x] T011 [P] [US2] Implement sidebar component in src/lib/components/layout/sidebar.svelte: accept NavItem[] and currentPath as props, render nav links with active state (compare href with currentPath), use Tailwind for styling, highlight active link with bg-accent class
- [x] T012 [P] [US2] Implement header component in src/lib/components/layout/header.svelte: accept user (email) and onToggleSidebar callback as props, display user email, render "Log out" as <a href="/logout">, render hamburger button (visible on mobile only) that calls onToggleSidebar
- [x] T013 [P] [US2] Implement page-header component in src/lib/components/layout/page-header.svelte: accept title and optional description as props, render h1 + p with consistent styling
- [x] T014 [US2] Implement toast-container component in src/lib/components/layout/toast-container.svelte: import toasts from toast store, render each toast with appropriate styling (success=green, error=red, info=blue), position fixed bottom-right, close button calls removeToast, stack vertically with gap
- [x] T015 [US2] Create src/routes/(app)/+layout.svelte: import sidebar, header, toast-container, define static navItems array, use $state for sidebarOpen toggle, pass $page.url.pathname as currentPath, layout structure: sidebar + header + content + toast container
- [x] T016 [US2] Create src/routes/(app)/logout/+page.server.ts: load function that reads refresh_token cookie, calls auth.logout() in try/catch (best effort), calls clearAuthCookies(cookies), redirects to /login

**Checkpoint**: Full app shell renders with sidebar, header, responsive toggle, logout, and toast container

---

## Phase 5: User Story 1 — Organization Onboarding (Priority: P1)

**Goal**: New user creates org, sees one-time credentials, continues to dashboard

**Independent Test**: Navigate to /onboarding, enter org name, submit, see credentials, click continue

### Implementation

- [x] T017 [US1] Create src/routes/(app)/onboarding/+page.server.ts: load function that checks locals.tenantId — if present redirect to /dashboard; return Superforms form with onboardingSchema. Default action: validate form, call provisionTenant, set tenant_id cookie, return { form, result }
- [x] T018 [US1] Create src/routes/(app)/onboarding/+page.svelte: two states — form view and confirmation view with copy-to-clipboard, warning banner, and continue to dashboard link

**Checkpoint**: Full onboarding flow works: form → provision → credentials → dashboard

---

## Phase 6: User Story 5 — Dashboard Placeholder (Priority: P3)

**Goal**: Landing page with welcome message and placeholder cards

**Independent Test**: Log in, verify dashboard shows welcome with user email

### Implementation

- [x] T019 [US5] Create src/routes/(app)/dashboard/+page.server.ts: load function returning { user } from parent
- [x] T020 [US5] Create src/routes/(app)/dashboard/+page.svelte: PageHeader, welcome message, 4 placeholder Skeleton cards

**Checkpoint**: Dashboard renders with welcome message and placeholder content

---

## Phase 7: User Story 4 — Toast Notifications Integration (Priority: P2)

**Goal**: Toasts appear in response to actions across the app

**Independent Test**: Perform an action, verify toast appears and auto-dismisses

### Implementation

- [x] T021 [US4] Integrate toast into onboarding page: addToast('success') called in superForm onResult callback on successful provisioning
- [x] T022 [US4] Integrate toast into logout: SKIPPED — logout redirects to /login, toast would be invisible

**Checkpoint**: Toasts fire on key actions and display correctly

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T023 Run full test suite: npm run test:unit — all 124 tests pass across 18 files
- [x] T024 Run type check: npm run check — zero errors, 5 warnings (expected Superforms pattern)
- [x] T025 Run quickstart.md validation checklist — all 9 scenarios validated
- [x] T026 Honest review per Constitution Principle III — found & fixed open redirect vulnerability in login redirectTo validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US3 Auth Guard (Phase 3)**: Depends on Phase 2 — should be done first since all (app) pages need it
- **US2 App Shell (Phase 4)**: Depends on Phase 2 + Phase 3 (auth guard for layout)
- **US1 Onboarding (Phase 5)**: Depends on Phase 4 (needs app shell layout)
- **US5 Dashboard (Phase 6)**: Depends on Phase 4 (needs app shell layout)
- **US4 Toast Integration (Phase 7)**: Depends on Phase 5 (integrates with onboarding)
- **Polish (Phase 8)**: Depends on all previous phases

### Within Each Phase

- Tests MUST be written first and FAIL before implementation
- Schema before page server
- Page server before page svelte
- Layout components before layout assembly

### Parallel Opportunities

```bash
# Foundational tests in parallel:
T003, T004

# Layout components in parallel (Phase 4):
T011, T012, T013

# Dashboard + Toast integration in parallel (after app shell):
Phase 6 (T019-T020), Phase 7 (T021-T022)
```

---

## Implementation Strategy

### MVP First (US3 + US2 + US1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (schema + toast store)
3. Complete Phase 3: Auth Guard (US3)
4. Complete Phase 4: App Shell (US2)
5. Complete Phase 5: Onboarding (US1)
6. **STOP and VALIDATE**: Auth guard + app shell + onboarding flow works end-to-end

### Full Delivery

1. Setup → Foundational → US3 → US2 → US1 → US5 → US4 → Polish
2. Each phase validated before proceeding
3. Honest review at the end (T026)

---

## Notes

- Total tasks: 26
- Setup tasks: 2 (T001–T002)
- Foundational tasks: 5 (T003–T007)
- US3 (Auth Guard) tasks: 3 (T008–T010)
- US2 (App Shell) tasks: 6 (T011–T016)
- US1 (Onboarding) tasks: 2 (T017–T018)
- US5 (Dashboard) tasks: 2 (T019–T020)
- US4 (Toast Integration) tasks: 2 (T021–T022)
- Polish tasks: 4 (T023–T026)
- Parallel opportunities: T003+T004 (tests), T011+T012+T013 (layout components), Phase 6 + Phase 7

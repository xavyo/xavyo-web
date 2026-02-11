# Tasks: Identity Federation

**Input**: Design documents from `/specs/011-identity-federation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add TypeScript types, Zod schemas, and API clients shared across all user stories

- [x] T001 Add federation TypeScript types to `src/lib/api/types.ts` — IdentityProvider, IdentityProviderDomain, IdentityProviderListResponse, CreateIdentityProviderRequest, UpdateIdentityProviderRequest, ValidationResult, ToggleRequest, CreateDomainRequest, ServiceProvider, ServiceProviderListResponse, CreateServiceProviderRequest, UpdateServiceProviderRequest, IdPCertificate, CertificateListResponse, UploadCertificateRequest, SocialProviderConfig, SocialProviderListResponse, UpdateSocialProviderRequest, SocialConnection, SocialConnectionsResponse per data-model.md
- [x] T002 [P] Create Zod validation schemas in `src/lib/schemas/federation.ts` — createIdentityProviderSchema, updateIdentityProviderSchema, createServiceProviderSchema, updateServiceProviderSchema, uploadCertificateSchema, updateSocialProviderSchema, addDomainSchema per data-model.md field constraints
- [x] T003 [P] Create federation server-side API client in `src/lib/api/federation.ts` — listIdentityProviders, createIdentityProvider, getIdentityProvider, updateIdentityProvider, deleteIdentityProvider, validateIdentityProvider, toggleIdentityProvider, listDomains, addDomain, removeDomain, listServiceProviders, createServiceProvider, getServiceProvider, updateServiceProvider, deleteServiceProvider, listCertificates, uploadCertificate, activateCertificate (all using apiClient with token/tenantId)
- [x] T004 [P] Create federation browser-safe client in `src/lib/api/federation-client.ts` — same function signatures as T003 but calling /api/federation/* BFF proxy endpoints using browser fetch
- [x] T005 [P] Create social server-side API client in `src/lib/api/social.ts` — listSocialProviders, updateSocialProvider, deleteSocialProvider, listSocialConnections, unlinkSocialAccount (using apiClient with token/tenantId)
- [x] T006 [P] Create social browser-safe client in `src/lib/api/social-client.ts` — same function signatures as T005 but calling /api/federation/social/* BFF proxy endpoints using browser fetch

---

## Phase 2: Foundational (BFF Proxy Endpoints)

**Purpose**: Server-side proxy endpoints that MUST be complete before user story pages

**CRITICAL**: No user story page work can begin until this phase is complete

### OIDC Federation Proxies

- [x] T007 Create BFF proxy `src/routes/api/federation/identity-providers/+server.ts` — GET (list with offset/limit/is_enabled params) and POST (create) handlers, validate session + admin role
- [x] T008 [P] Create BFF proxy `src/routes/api/federation/identity-providers/[id]/+server.ts` — GET (detail), PUT (update), DELETE handlers, validate session + admin role
- [x] T009 [P] Create BFF proxy `src/routes/api/federation/identity-providers/[id]/validate/+server.ts` — POST handler, validate session + admin role, forward to backend validation endpoint
- [x] T010 [P] Create BFF proxy `src/routes/api/federation/identity-providers/[id]/toggle/+server.ts` — POST handler with is_enabled body, validate session + admin role
- [x] T011 [P] Create BFF proxy `src/routes/api/federation/identity-providers/[id]/domains/+server.ts` — GET (list) and POST (add domain) handlers, validate session + admin role
- [x] T012 [P] Create BFF proxy `src/routes/api/federation/identity-providers/[id]/domains/[domainId]/+server.ts` — DELETE handler, validate session + admin role

### SAML Proxies

- [x] T013 [P] Create BFF proxy `src/routes/api/federation/saml/service-providers/+server.ts` — GET (list with offset/limit/enabled params) and POST (create) handlers, validate session + admin role
- [x] T014 [P] Create BFF proxy `src/routes/api/federation/saml/service-providers/[id]/+server.ts` — GET (detail), PUT (update), DELETE handlers, validate session + admin role
- [x] T015 [P] Create BFF proxy `src/routes/api/federation/saml/certificates/+server.ts` — GET (list) and POST (upload) handlers, validate session + admin role
- [x] T016 [P] Create BFF proxy `src/routes/api/federation/saml/certificates/[id]/activate/+server.ts` — POST handler, validate session + admin role

### Social Proxies

- [x] T017 [P] Create BFF proxy `src/routes/api/federation/social/providers/+server.ts` — GET (list all providers) handler, validate session + admin role
- [x] T018 [P] Create BFF proxy `src/routes/api/federation/social/providers/[provider]/+server.ts` — PUT (update) and DELETE handlers, validate session + admin role
- [x] T019 [P] Create BFF proxy `src/routes/api/federation/social/connections/+server.ts` — GET handler, validate session (user-level, no admin required)
- [x] T020 [P] Create BFF proxy `src/routes/api/federation/social/link/[provider]/authorize/+server.ts` — GET handler that redirects to backend OAuth flow, validate session
- [x] T021 [P] Create BFF proxy `src/routes/api/federation/social/link/[provider]/+server.ts` — POST handler for completing account linking, validate session
- [x] T022 [P] Create BFF proxy `src/routes/api/federation/social/unlink/[provider]/+server.ts` — DELETE handler, validate session

**Checkpoint**: BFF proxy endpoints ready — user story page implementation can now begin

---

## Phase 3: User Story 1 — OIDC Federation Management (Priority: P1)

**Goal**: Administrators can manage external OIDC Identity Providers with validation, HRD domains, and enable/disable

**Independent Test**: Navigate to Federation > OIDC tab, create IdP, validate, add domain, enable, verify list shows correct status

### Components

- [x] T023 [US1] Create validation-result component `src/lib/components/federation/validation-result.svelte` — Displays ValidationResult with success/failure indicators, discovered endpoints list (authorization, token, userinfo, JWKS), error message display, uses $props
- [x] T024 [P] [US1] Create domain-list component `src/lib/components/federation/domain-list.svelte` — Lists domains for an IdP with remove button, add domain form (domain input + priority), empty state when no domains, uses $state for domain list and $props for idpId/onchange
- [x] T025 [P] [US1] Create idp-form component `src/lib/components/federation/idp-form.svelte` — Superforms-based form for creating/editing IdP: name, issuer URL, client ID, client secret, scopes (comma-separated input), claim mapping (JSON textarea), sync_on_login toggle. Reuses existing Input/Label/Button/Card components

### Pages

- [x] T026 [US1] Create federation page server load `src/routes/(app)/federation/+page.server.ts` — Validate admin role (redirect to /dashboard if not admin), return empty data for client-side tab fetching
- [x] T027 [US1] Create federation page with tab layout `src/routes/(app)/federation/+page.svelte` — PageHeader with "Federation" title, Tabs component with Overview/OIDC/SAML/Social tabs using URL query param (?tab=overview default). OIDC tab: fetch and render IdP list with status badges (Enabled/Disabled, Valid/Invalid), "Add Identity Provider" button linking to /federation/oidc/create, pagination controls
- [x] T028 [US1] Create OIDC IdP create page server load `src/routes/(app)/federation/oidc/create/+page.server.ts` — Validate admin role, initialize empty Superforms form with createIdentityProviderSchema, handle form action: validate, build CreateIdentityProviderRequest, call API, redirect to /federation?tab=oidc
- [x] T029 [US1] Create OIDC IdP create page `src/routes/(app)/federation/oidc/create/+page.svelte` — Render idp-form component with create mode, back link to /federation?tab=oidc
- [x] T030 [US1] Create OIDC IdP detail page server load `src/routes/(app)/federation/oidc/[id]/+page.server.ts` — Validate admin role, fetch IdP detail and domains, initialize edit form with updateIdentityProviderSchema, handle actions: update (PUT), delete (DELETE with redirect), validate (POST validate), toggle (POST toggle)
- [x] T031 [US1] Create OIDC IdP detail page `src/routes/(app)/federation/oidc/[id]/+page.svelte` — IdP detail display with edit form (idp-form), validation-result display, domain-list component, enable/disable toggle button, delete button with confirmation dialog, status badges

### Navigation

- [x] T032 [US1] Add "Federation" item to sidebar navigation (admin-only) in `src/routes/(app)/+layout.svelte` — Add Federation nav item with Network icon from lucide-svelte, only visible when data.isAdmin is true, positioned between NHI and Audit in the nav list

**Checkpoint**: OIDC federation management fully functional — admins can CRUD IdPs, validate, manage domains, enable/disable

---

## Phase 4: User Story 2 — SAML Service Provider Management (Priority: P2)

**Goal**: Administrators can manage SAML 2.0 Service Providers and IdP signing certificates

**Independent Test**: Navigate to Federation > SAML tab, upload certificate, create SP, activate certificate, verify list

### Components

- [x] T033 [US2] Create certificate-list component `src/lib/components/federation/certificate-list.svelte` — Lists IdP certificates with key_id, subject, issuer, validity dates, active badge, "Activate" button (disabled if already active), empty state, uses $props for certificates array and callbacks
- [x] T034 [P] [US2] Create certificate-form component `src/lib/components/federation/certificate-form.svelte` — Form with textarea for PEM certificate, textarea for PEM private key, text inputs for key_id/subject_dn/issuer_dn, date inputs for not_before/not_after, submit button
- [x] T035 [P] [US2] Create sp-form component `src/lib/components/federation/sp-form.svelte` — Superforms-based form for creating/editing SP: name, entity_id, acs_urls (dynamic list with add/remove), certificate (textarea), attribute_mapping (JSON textarea), name_id_format (select), sign_assertions/validate_signatures (checkboxes), assertion_validity_seconds (number input), metadata_url (URL input)

### Pages

- [x] T036 [US2] Update federation page SAML tab in `src/routes/(app)/federation/+page.svelte` — SAML tab content: fetch and render SP list with enabled/disabled badges, "Add Service Provider" button linking to /federation/saml/create, certificates section with certificate-list and "Upload Certificate" expandable form, pagination for SP list
- [x] T037 [US2] Create SAML SP create page server load `src/routes/(app)/federation/saml/create/+page.server.ts` — Validate admin role, initialize empty Superforms form with createServiceProviderSchema, handle form action: validate, build CreateServiceProviderRequest, call API, redirect to /federation?tab=saml
- [x] T038 [US2] Create SAML SP create page `src/routes/(app)/federation/saml/create/+page.svelte` — Render sp-form component with create mode, back link to /federation?tab=saml
- [x] T039 [US2] Create SAML SP detail page server load `src/routes/(app)/federation/saml/[id]/+page.server.ts` — Validate admin role, fetch SP detail, initialize edit form with updateServiceProviderSchema, handle actions: update (PUT), delete (DELETE with redirect)
- [x] T040 [US2] Create SAML SP detail page `src/routes/(app)/federation/saml/[id]/+page.svelte` — SP detail display with edit form (sp-form), delete button with confirmation dialog, enabled/disabled badge

**Checkpoint**: SAML management fully functional — admins can CRUD SPs and manage signing certificates

---

## Phase 5: User Story 3 — Social Login Configuration (Priority: P3)

**Goal**: Administrators can configure social providers, users can link/unlink social accounts

**Independent Test**: Navigate to Federation > Social tab, configure Google with client ID/secret, enable it. As user, go to Settings > Social Connections, verify Google linkable.

### Components

- [x] T041 [US3] Create social-provider-card component `src/lib/components/federation/social-provider-card.svelte` — Card for one provider (Google/Microsoft/Apple/GitHub) showing: provider icon and name, enabled/disabled badge, client_id display (if configured), expand/collapse for config fields (client_id, client_secret, scopes textarea), provider-specific fields (Azure tenant for Microsoft, team_id/key_id for Apple), save button, enable/disable toggle, uses $state for expanded and $props for provider data
- [x] T042 [P] [US3] Create social-connections-list component `src/lib/components/federation/social-connections-list.svelte` — Lists user's linked social accounts with provider icon, email, display_name, creation date, "Unlink" button with confirmation. Shows available (enabled but not linked) providers with "Link" button. Empty state when no connections.

### Pages

- [x] T043 [US3] Update federation page Social tab in `src/routes/(app)/federation/+page.svelte` — Social tab content: fetch all 4 provider configs, render social-provider-card for each provider (Google, Microsoft, Apple, GitHub)
- [x] T044 [US3] Create social-connections-tab component `src/routes/(app)/settings/social-connections-tab.svelte` — Wrapper that fetches /api/federation/social/connections and available providers, renders social-connections-list, handles link (redirect to OAuth) and unlink (DELETE with confirmation) actions
- [x] T045 [US3] Update Settings page to include Social Connections tab in `src/routes/(app)/settings/+page.svelte` — Add "Social Connections" tab with Link icon from lucide-svelte to existing Tabs component, render social-connections-tab in tab content

**Checkpoint**: Social login configuration functional — admins can configure providers, users can link/unlink accounts

---

## Phase 6: User Story 4 — Federation Overview Dashboard (Priority: P4)

**Goal**: Administrators see a summary dashboard of all federation connections

**Independent Test**: Navigate to Federation, verify overview tab shows counts for OIDC/SAML/Social with status indicators and working navigation links

### Components

- [x] T046 [US4] Create federation-overview component `src/lib/components/federation/federation-overview.svelte` — Dashboard with 3 summary cards: OIDC IdPs (enabled/total count, validation status summary, "Manage" link to ?tab=oidc), SAML SPs (count, enabled count, "Manage" link to ?tab=saml), Social (enabled/total count per provider icons, "Manage" link to ?tab=social). Loading skeleton state, error state with retry.

### Pages

- [x] T047 [US4] Update federation page Overview tab in `src/routes/(app)/federation/+page.svelte` — Overview tab content: fetch summary data from OIDC, SAML, Social endpoints (parallel client-side fetches), pass aggregated counts to federation-overview component

**Checkpoint**: Overview dashboard shows at-a-glance federation status

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Tests, validation, and final integration

- [x] T048 [P] Write unit tests for federation API client in `src/lib/api/federation.test.ts` — Test all server-side functions with mocked fetch, verify query param construction and request body building
- [x] T049 [P] Write unit tests for federation client-side API in `src/lib/api/federation-client.test.ts` — Test all browser-safe functions with mocked fetch, verify BFF endpoint URLs
- [x] T050 [P] Write unit tests for social API client in `src/lib/api/social.test.ts` — Test all server-side social functions
- [x] T051 [P] Write unit tests for social client-side API in `src/lib/api/social-client.test.ts` — Test all browser-safe social functions
- [x] T052 [P] Write unit tests for Zod schemas in `src/lib/schemas/federation.test.ts` — Test all schemas with valid/invalid inputs, URL validation, JSON validation, required fields
- [x] T053 [P] Write unit tests for validation-result component in `src/lib/components/federation/validation-result.test.ts` — Test success/failure rendering, endpoint display
- [x] T054 [P] Write unit tests for domain-list component in `src/lib/components/federation/domain-list.test.ts` — Test domain listing, add form, remove button, empty state
- [x] T055 [P] Write unit tests for certificate-list component in `src/lib/components/federation/certificate-list.test.ts` — Test certificate display, active badge, activate button
- [x] T056 [P] Write unit tests for social-provider-card component in `src/lib/components/federation/social-provider-card.test.ts` — Test expand/collapse, provider-specific fields, save action
- [x] T057 [P] Write unit tests for social-connections-list component in `src/lib/components/federation/social-connections-list.test.ts` — Test connection display, link/unlink buttons, empty state
- [x] T058 [P] Write unit tests for federation-overview component in `src/lib/components/federation/federation-overview.test.ts` — Test count display, loading/error states, navigation links
- [x] T059 [P] Write tests for federation page in `src/routes/(app)/federation/federation-page.test.ts` — Test tab layout, admin-only access, tab navigation
- [x] T060 [P] Write tests for social-connections-tab in `src/routes/(app)/settings/social-connections-tab.test.ts` — Test connections loading, link/unlink actions
- [x] T061 Run `npm run check` to verify zero TypeScript errors across all new files
- [x] T062 Run `npm run test:unit` to verify all existing + new tests pass
- [x] T063 E2E verification with Chrome DevTools MCP — Test federation OIDC tab (create IdP, validate, domains, toggle), SAML tab (create SP, certificates), Social tab (configure provider), Settings Social Connections tab, overview dashboard, both light and dark mode

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on T001 (types) — BFF endpoints need type imports
- **Phase 3 (US1 OIDC)**: Depends on Phase 2 (BFF endpoints)
- **Phase 4 (US2 SAML)**: Depends on Phase 2 + Phase 3 (federation page created in US1)
- **Phase 5 (US3 Social)**: Depends on Phase 2 + Phase 3 (federation page created in US1)
- **Phase 6 (US4 Overview)**: Depends on Phases 3-5 (all tabs populated for aggregation)
- **Phase 7 (Polish)**: Depends on all implementation phases

### User Story Dependencies

- **US1 (OIDC)**: Creates the federation page with tab layout — MUST be first
- **US2 (SAML)**: Adds SAML tab content to federation page — depends on US1 creating the page
- **US3 (Social)**: Adds Social tab content + Settings tab — depends on US1 creating the page
- **US4 (Overview)**: Populates Overview tab — depends on US1/US2/US3 providing data

### Within Each User Story

- BFF proxy endpoints (Phase 2) before pages
- Components before page integration
- Page server load before page component
- Navigation updates after pages

### Parallel Opportunities

- T002, T003, T004, T005, T006 can run in parallel (different files, depend only on T001)
- T007-T022 BFF proxy endpoints can all run in parallel (different files)
- T033, T034, T035 SAML components can run in parallel
- T041, T042 Social components can run in parallel
- T048-T060 all test tasks can run in parallel (different test files)

---

## Parallel Example: Phase 2

```bash
# After T001 (types) completes, launch all BFF proxies in parallel:
Task: "Create BFF proxy /api/federation/identity-providers in src/routes/api/federation/identity-providers/+server.ts"
Task: "Create BFF proxy /api/federation/identity-providers/[id] in src/routes/api/federation/identity-providers/[id]/+server.ts"
Task: "Create BFF proxy /api/federation/saml/service-providers in src/routes/api/federation/saml/service-providers/+server.ts"
Task: "Create BFF proxy /api/federation/social/providers in src/routes/api/federation/social/providers/+server.ts"
# ... etc.
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + schemas + API clients)
2. Complete Phase 2: Foundational (BFF proxy endpoints)
3. Complete Phase 3: User Story 1 (OIDC Federation Management)
4. **STOP and VALIDATE**: Test create IdP, validate, domains, enable/disable
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (OIDC) → Test independently → MVP!
3. Add US2 (SAML) → Test independently → Federation protocols complete
4. Add US3 (Social) → Test independently → All providers configurable
5. Add US4 (Overview) → Test independently → Dashboard complete
6. Polish (tests, validation) → Production ready

### Sequential Flow (Single Developer)

Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All BFF endpoints follow existing pattern: validate session → forward to xavyo-idp → return JSON
- Admin endpoints check `hasAdminRole(locals.user?.roles)` (handles super_admin)
- Social user endpoints only require authenticated session (not admin)
- API module split: server-side (`federation.ts`, `social.ts`) vs browser-safe (`*-client.ts`)
- Zod schemas use `import { z } from 'zod/v3'` for Superforms compatibility
- Superforms use `value={String($form.field ?? '')}` instead of `bind:value`
- Federation page tab state tracked via URL query param (?tab=overview)

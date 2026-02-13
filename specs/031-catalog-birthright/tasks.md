# Tasks: Self-Service Request Catalog & Birthright Access

**Input**: Design documents from `/specs/031-catalog-birthright/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/catalog-birthright-api.md

**Tests**: TDD required per constitution (Principle II). Test tasks included for all modules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add catalog + birthright types, schemas, and API clients that all user stories depend on

- [ ] T001 Add catalog types (CatalogCategory, CatalogItem, CatalogItemType, RequestabilityRules, FormField, Cart, CartItem, CartValidationResponse, ValidationIssue, CartSodViolation, CartSubmissionResponse, SubmissionItem, CatalogCategoryListResponse, CatalogItemListResponse, CartResponse, CartItemResponse) to src/lib/api/types.ts
- [ ] T002 Add birthright types (BirthrightPolicy, BirthrightPolicyStatus, PolicyCondition, PolicyConditionOperator, EvaluationMode, SimulatePolicyResponse, ConditionResult, SimulateAllPoliciesResponse, MatchingPolicy, ImpactAnalysisResponse, BirthrightPolicyListResponse) to src/lib/api/types.ts
- [ ] T003 Create Zod validation schemas for catalog (createCategorySchema, updateCategorySchema, createCatalogItemSchema, updateCatalogItemSchema, addToCartSchema, updateCartItemSchema, submitCartSchema) in src/lib/schemas/catalog.ts
- [ ] T004 Create Zod validation schemas for birthright (createBirthrightPolicySchema, updateBirthrightPolicySchema, simulatePolicySchema) in src/lib/schemas/birthright.ts
- [ ] T005 Create server-side catalog API client with 17 functions (listCategories, getCategory, listCatalogItems, getCatalogItem, getCart, addToCart, updateCartItem, removeCartItem, clearCart, validateCart, submitCart, adminListCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminListItems, adminCreateItem, adminUpdateItem, adminEnableItem, adminDisableItem, adminDeleteItem) in src/lib/api/catalog.ts
- [ ] T006 Create server-side birthright API client with 10 functions (listBirthrightPolicies, getBirthrightPolicy, createBirthrightPolicy, updateBirthrightPolicy, archiveBirthrightPolicy, enableBirthrightPolicy, disableBirthrightPolicy, simulatePolicy, simulateAllPolicies, impactAnalysis) in src/lib/api/birthright.ts
- [ ] T007 Create client-side catalog API (listCategoriesClient, listCatalogItemsClient, getCatalogItemClient, getCartClient, addToCartClient, updateCartItemClient, removeCartItemClient, clearCartClient, validateCartClient, submitCartClient) in src/lib/api/catalog-client.ts
- [ ] T008 Create client-side birthright API (listBirthrightPoliciesClient, simulatePolicyClient, simulateAllPoliciesClient, impactAnalysisClient) in src/lib/api/birthright-client.ts

---

## Phase 2: Foundational (Tests + BFF Proxies)

**Purpose**: Tests for Phase 1 modules and all BFF proxy endpoints — MUST complete before user story pages

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 [P] Create catalog schema tests (valid/invalid inputs for all 7 schemas) in src/lib/schemas/catalog.test.ts
- [ ] T010 [P] Create birthright schema tests (valid/invalid inputs for all 3 schemas) in src/lib/schemas/birthright.test.ts
- [ ] T011 [P] Create server-side catalog API tests (mock fetch for all 17+ functions) in src/lib/api/catalog.test.ts
- [ ] T012 [P] Create server-side birthright API tests (mock fetch for all 10 functions) in src/lib/api/birthright.test.ts
- [ ] T013 [P] Create client-side catalog API tests in src/lib/api/catalog-client.test.ts
- [ ] T014 [P] Create client-side birthright API tests in src/lib/api/birthright-client.test.ts
- [ ] T015 [P] Create BFF proxy for catalog categories (GET list) in src/routes/api/governance/catalog/categories/+server.ts
- [ ] T016 [P] Create BFF proxy for catalog category detail (GET) in src/routes/api/governance/catalog/categories/[id]/+server.ts
- [ ] T017 [P] Create BFF proxy for catalog items (GET list) in src/routes/api/governance/catalog/items/+server.ts
- [ ] T018 [P] Create BFF proxy for catalog item detail (GET) in src/routes/api/governance/catalog/items/[id]/+server.ts
- [ ] T019 [P] Create BFF proxy for cart (GET + DELETE clear) in src/routes/api/governance/catalog/cart/+server.ts
- [ ] T020 [P] Create BFF proxy for cart items (POST add) in src/routes/api/governance/catalog/cart/items/+server.ts
- [ ] T021 [P] Create BFF proxy for cart item (PUT update + DELETE remove) in src/routes/api/governance/catalog/cart/items/[itemId]/+server.ts
- [ ] T022 [P] Create BFF proxy for cart validate (POST) in src/routes/api/governance/catalog/cart/validate/+server.ts
- [ ] T023 [P] Create BFF proxy for cart submit (POST) in src/routes/api/governance/catalog/cart/submit/+server.ts
- [ ] T024 [P] Create BFF proxy for admin categories (GET list + POST create) in src/routes/api/governance/catalog/admin/categories/+server.ts
- [ ] T025 [P] Create BFF proxy for admin category (PUT update + DELETE) in src/routes/api/governance/catalog/admin/categories/[id]/+server.ts
- [ ] T026 [P] Create BFF proxy for admin items (GET list + POST create) in src/routes/api/governance/catalog/admin/items/+server.ts
- [ ] T027 [P] Create BFF proxy for admin item (PUT update + DELETE) in src/routes/api/governance/catalog/admin/items/[id]/+server.ts
- [ ] T028 [P] Create BFF proxy for admin enable item (POST) in src/routes/api/governance/catalog/admin/items/[id]/enable/+server.ts
- [ ] T029 [P] Create BFF proxy for admin disable item (POST) in src/routes/api/governance/catalog/admin/items/[id]/disable/+server.ts
- [ ] T030 [P] Create BFF proxy for birthright policies (GET list + POST create) in src/routes/api/governance/birthright-policies/+server.ts
- [ ] T031 [P] Create BFF proxy for birthright policy (GET + PUT + DELETE archive) in src/routes/api/governance/birthright-policies/[id]/+server.ts
- [ ] T032 [P] Create BFF proxy for enable policy (POST) in src/routes/api/governance/birthright-policies/[id]/enable/+server.ts
- [ ] T033 [P] Create BFF proxy for disable policy (POST) in src/routes/api/governance/birthright-policies/[id]/disable/+server.ts
- [ ] T034 [P] Create BFF proxy for simulate single policy (POST) in src/routes/api/governance/birthright-policies/[id]/simulate/+server.ts
- [ ] T035 [P] Create BFF proxy for simulate all policies (POST) in src/routes/api/governance/birthright-policies/simulate/+server.ts
- [ ] T036 [P] Create BFF proxy for impact analysis (POST) in src/routes/api/governance/birthright-policies/[id]/impact/+server.ts

**Checkpoint**: Foundation ready — all API clients tested, all BFF proxies in place

---

## Phase 3: User Story 1 — Catalog Browsing (Priority: P1) 🎯 MVP

**Goal**: Users can browse categorized catalog, search/filter items, view requestability status

**Independent Test**: Navigate to catalog page, see categories in sidebar, click category to see items, search by name, filter by type

### Components for User Story 1

- [ ] T037 [P] [US1] Create category-sidebar.svelte component (hierarchical tree with collapsible nodes, active category highlighting) in src/lib/components/catalog/category-sidebar.svelte
- [ ] T038 [P] [US1] Create catalog-item-card.svelte component (item card with type badge, requestability indicator, Add to Cart button) in src/lib/components/catalog/catalog-item-card.svelte
- [ ] T039 [P] [US1] Create category-sidebar.test.ts in src/lib/components/catalog/category-sidebar.test.ts
- [ ] T040 [P] [US1] Create catalog-item-card.test.ts in src/lib/components/catalog/catalog-item-card.test.ts

### Pages for User Story 1

- [ ] T041 [US1] Create catalog browse page server load (load categories + items, pass to page) in src/routes/(app)/governance/catalog/+page.server.ts
- [ ] T042 [US1] Create catalog browse page with category sidebar, item grid, search bar, type filter in src/routes/(app)/governance/catalog/+page.svelte
- [ ] T043 [US1] Create catalog browse page test in src/routes/(app)/governance/catalog/catalog-browse.test.ts

### Sidebar Navigation

- [ ] T044 [US1] Add "Request Catalog" nav item under Governance section in src/routes/(app)/+layout.svelte

**Checkpoint**: User Story 1 complete — can browse catalog, search, filter, see requestability

---

## Phase 4: User Story 2 — Shopping Cart & Submission (Priority: P1)

**Goal**: Users can add items to cart, validate (SoD check), submit with justification to create access requests

**Independent Test**: Add items to cart, navigate to cart page, validate, enter justification, submit, verify access requests created

### Components for User Story 2

- [ ] T045 [P] [US2] Create cart-badge.svelte component (item count badge for header/nav) in src/lib/components/catalog/cart-badge.svelte
- [ ] T046 [P] [US2] Create cart-item-row.svelte component (single cart item with parameters, form values, remove button) in src/lib/components/catalog/cart-item-row.svelte
- [ ] T047 [P] [US2] Create validation-results.svelte component (issues list + SoD violations section) in src/lib/components/catalog/validation-results.svelte
- [ ] T048 [P] [US2] Create cart-badge.test.ts in src/lib/components/catalog/cart-badge.test.ts
- [ ] T049 [P] [US2] Create cart-item-row.test.ts in src/lib/components/catalog/cart-item-row.test.ts
- [ ] T050 [P] [US2] Create validation-results.test.ts in src/lib/components/catalog/validation-results.test.ts

### Pages for User Story 2

- [ ] T051 [US2] Create cart page server load (load cart via server-side API) in src/routes/(app)/governance/catalog/cart/+page.server.ts
- [ ] T052 [US2] Create cart page with item list, validate button, justification textarea, submit button, clear cart button in src/routes/(app)/governance/catalog/cart/+page.svelte
- [ ] T053 [US2] Create cart page test in src/routes/(app)/governance/catalog/cart/catalog-cart.test.ts

### Integration

- [ ] T054 [US2] Add cart badge to catalog browse page header (shows item count, links to cart) in src/routes/(app)/governance/catalog/+page.svelte
- [ ] T055 [US2] Add "Add to Cart" client-side action to catalog-item-card (call addToCartClient, update badge count) in src/lib/components/catalog/catalog-item-card.svelte

**Checkpoint**: User Story 2 complete — full cart workflow: add, review, validate, submit

---

## Phase 5: User Story 3 — Catalog Administration (Priority: P1)

**Goal**: Admins can manage categories (hierarchy) and catalog items (CRUD, enable/disable, requestability rules)

**Independent Test**: Admin creates category, creates item in category, verifies in user catalog, disables item, confirms hidden

### Pages for User Story 3

- [ ] T056 [US3] Create admin catalog hub page server load (load admin categories + items) in src/routes/(app)/governance/catalog/admin/+page.server.ts
- [ ] T057 [US3] Create admin catalog hub page with 2-tab layout (Categories + Items tabs) in src/routes/(app)/governance/catalog/admin/+page.svelte
- [ ] T058 [US3] Create admin catalog hub page test in src/routes/(app)/governance/catalog/admin/catalog-admin.test.ts
- [ ] T059 [US3] Create admin category create page server load + form action (validate with createCategorySchema) in src/routes/(app)/governance/catalog/admin/categories/create/+page.server.ts
- [ ] T060 [US3] Create admin category create page with form (name, description, parent selector, icon, display order) in src/routes/(app)/governance/catalog/admin/categories/create/+page.svelte
- [ ] T061 [US3] Create admin category create page test in src/routes/(app)/governance/catalog/admin/categories/create/category-create.test.ts
- [ ] T062 [US3] Create admin category detail page server load + update/delete actions in src/routes/(app)/governance/catalog/admin/categories/[id]/+page.server.ts
- [ ] T063 [US3] Create admin category detail page with edit form + delete button in src/routes/(app)/governance/catalog/admin/categories/[id]/+page.svelte
- [ ] T064 [US3] Create admin category detail page test in src/routes/(app)/governance/catalog/admin/categories/[id]/category-detail.test.ts
- [ ] T065 [US3] Create admin item create page server load + form action (validate with createCatalogItemSchema, load categories for selector) in src/routes/(app)/governance/catalog/admin/items/create/+page.server.ts
- [ ] T066 [US3] Create admin item create page with form (type, name, description, category, reference_id, requestability rules, form fields, tags) in src/routes/(app)/governance/catalog/admin/items/create/+page.svelte
- [ ] T067 [US3] Create admin item create page test in src/routes/(app)/governance/catalog/admin/items/create/item-create.test.ts
- [ ] T068 [US3] Create admin item detail page server load + update/enable/disable/delete actions in src/routes/(app)/governance/catalog/admin/items/[id]/+page.server.ts
- [ ] T069 [US3] Create admin item detail page with edit form, enable/disable toggle, delete button in src/routes/(app)/governance/catalog/admin/items/[id]/+page.svelte
- [ ] T070 [US3] Create admin item detail page test in src/routes/(app)/governance/catalog/admin/items/[id]/item-detail.test.ts

**Checkpoint**: User Story 3 complete — admin can CRUD categories and items

---

## Phase 6: User Story 4 — Birthright Policy Management (Priority: P2)

**Goal**: Admins can create/manage birthright policies with attribute conditions and entitlement assignments

**Independent Test**: Admin creates policy with conditions, links entitlements, enables it, verifies in list

### Components for User Story 4

- [ ] T071 [P] [US4] Create condition-builder.svelte component (inline condition rows with attribute/operator/value, add/remove buttons) in src/lib/components/catalog/condition-builder.svelte
- [ ] T072 [P] [US4] Create condition-builder.test.ts in src/lib/components/catalog/condition-builder.test.ts

### Pages for User Story 4

- [ ] T073 [US4] Create birthright policy list page server load (load policies) in src/routes/(app)/governance/birthright-policies/+page.server.ts
- [ ] T074 [US4] Create birthright policy list page with status filter (Active/Archived), policy cards with name/priority/status in src/routes/(app)/governance/birthright-policies/+page.svelte
- [ ] T075 [US4] Create birthright policy list page test in src/routes/(app)/governance/birthright-policies/birthright-list.test.ts
- [ ] T076 [US4] Create birthright policy create page server load + form action (validate with createBirthrightPolicySchema, load entitlements for selector) in src/routes/(app)/governance/birthright-policies/create/+page.server.ts
- [ ] T077 [US4] Create birthright policy create page with form (name, description, priority, evaluation mode, conditions via condition-builder, entitlement multi-select, grace period) in src/routes/(app)/governance/birthright-policies/create/+page.svelte
- [ ] T078 [US4] Create birthright policy create page test in src/routes/(app)/governance/birthright-policies/create/birthright-create.test.ts
- [ ] T079 [US4] Create birthright policy detail page server load + enable/disable/archive/update actions in src/routes/(app)/governance/birthright-policies/[id]/+page.server.ts
- [ ] T080 [US4] Create birthright policy detail page with info card, conditions display, entitlements list, action buttons (enable/disable/archive) in src/routes/(app)/governance/birthright-policies/[id]/+page.svelte
- [ ] T081 [US4] Create birthright policy detail page test in src/routes/(app)/governance/birthright-policies/[id]/birthright-detail.test.ts

### Sidebar Navigation

- [ ] T082 [US4] Add "Birthright Policies" nav item under Governance section (admin-only) in src/routes/(app)/+layout.svelte

**Checkpoint**: User Story 4 complete — admin can CRUD birthright policies

---

## Phase 7: User Story 5 — Policy Simulation (Priority: P2)

**Goal**: Admins can simulate policies against attribute sets to preview which entitlements would be granted

**Independent Test**: Admin opens policy simulation, enters attributes, sees match/no-match results with condition details

### Components for User Story 5

- [ ] T083 [P] [US5] Create simulation-results.svelte component (match/no-match indicator, condition result rows with pass/fail, entitlements granted list) in src/lib/components/catalog/simulation-results.svelte
- [ ] T084 [P] [US5] Create simulation-results.test.ts in src/lib/components/catalog/simulation-results.test.ts

### Integration for User Story 5

- [ ] T085 [US5] Add simulation tab/section to birthright policy detail page — attribute key-value input form, "Simulate" button, results display using simulation-results component in src/routes/(app)/governance/birthright-policies/[id]/+page.svelte
- [ ] T086 [US5] Add "Simulate All" button to birthright policy list page — opens dialog with attribute input, shows all matching policies and combined entitlements in src/routes/(app)/governance/birthright-policies/+page.svelte
- [ ] T087 [US5] Add impact analysis button to birthright policy detail page — shows affected user counts in src/routes/(app)/governance/birthright-policies/[id]/+page.svelte
- [ ] T088 [US5] Update birthright detail page test with simulation and impact analysis scenarios in src/routes/(app)/governance/birthright-policies/[id]/birthright-detail.test.ts
- [ ] T089 [US5] Update birthright list page test with simulate-all scenario in src/routes/(app)/governance/birthright-policies/birthright-list.test.ts

**Checkpoint**: User Story 5 complete — policy simulation and impact analysis working

---

## Phase 8: User Story 6 — Manager Requests (Priority: P3)

**Goal**: Managers can request access on behalf of team members (beneficiary_id flow)

**Independent Test**: Manager selects beneficiary, browses catalog with beneficiary context, adds items, submits

### Integration for User Story 6

- [ ] T090 [US6] Add beneficiary selector to catalog browse page — user search dropdown at top, changes all item requestability to beneficiary context in src/routes/(app)/governance/catalog/+page.svelte
- [ ] T091 [US6] Update cart page to show beneficiary banner ("Requesting for: [Name]") and pass beneficiary_id to all cart API calls in src/routes/(app)/governance/catalog/cart/+page.svelte
- [ ] T092 [US6] Update catalog browse page test with beneficiary selection scenarios in src/routes/(app)/governance/catalog/catalog-browse.test.ts
- [ ] T093 [US6] Update cart page test with beneficiary display and submission scenarios in src/routes/(app)/governance/catalog/cart/catalog-cart.test.ts

**Checkpoint**: User Story 6 complete — manager can request on behalf of team members

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, TypeScript checks, and test suite verification

- [ ] T094 Run TypeScript check (npm run check) and fix any errors
- [ ] T095 Run full test suite (npm run test:unit) and fix any failures
- [ ] T096 Update CLAUDE.md with Phase 031 completed feature entry and project structure
- [ ] T097 Run quickstart.md E2E validation via Chrome DevTools MCP

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP target (catalog browsing)
- **US2 (Phase 4)**: Depends on Phase 3 (adds cart to catalog browse page)
- **US3 (Phase 5)**: Depends on Phase 2 only (admin pages are independent of user catalog)
- **US4 (Phase 6)**: Depends on Phase 2 only (birthright policies are independent)
- **US5 (Phase 7)**: Depends on Phase 6 (adds simulation to policy detail page)
- **US6 (Phase 8)**: Depends on Phase 3 + Phase 4 (adds beneficiary to catalog + cart)
- **Polish (Phase 9)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Foundation only — no story dependencies
- **US2 (P1)**: Depends on US1 (catalog browse page must exist for cart integration)
- **US3 (P1)**: Foundation only — admin pages are independent
- **US4 (P2)**: Foundation only — birthright pages are independent
- **US5 (P2)**: Depends on US4 (policy detail page must exist for simulation)
- **US6 (P3)**: Depends on US1 + US2 (catalog + cart pages must exist for beneficiary flow)

### Parallel Opportunities

- T001, T002 (types) are sequential (same file), then T003-T008 can run in parallel
- T009–T036 (all tests + BFF proxies) can run in parallel
- T037–T040 (US1 components + tests) can run in parallel
- T045–T050 (US2 components + tests) can run in parallel
- US3 (Phase 5) can run in parallel with US1+US2 since it only touches admin pages
- US4 (Phase 6) can run in parallel with US1+US2+US3 since it only touches birthright pages
- T071–T072 (US4 condition builder) can run in parallel with US4 pages
- T083–T084 (US5 simulation results) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 + 3)

1. Complete Phase 1: Setup (types, schemas, API clients)
2. Complete Phase 2: Foundational (tests, BFF proxies)
3. Complete Phase 3: User Story 1 (catalog browsing)
4. Complete Phase 5: User Story 3 (catalog admin) — in parallel with US1 if possible
5. **STOP and VALIDATE**: Test browsing + admin independently via Chrome DevTools MCP
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (catalog browse) + US3 (admin) → Test → **MVP!**
3. US2 (shopping cart) → Test → Core request workflow working
4. US4 (birthright policies) → Test → Policy management working
5. US5 (simulation) → Test → Policy testing working
6. US6 (manager requests) → Test → Delegation workflow
7. Polish → Final validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Constitution requires TDD: write tests first, verify they fail, then implement
- All BFF proxies validate session cookies before forwarding (Principle I)
- Use `zod/v3` for all schemas (Superforms compatibility)
- Use `$derived` for server-loaded data, `$state` for client-side state
- Follow existing governance patterns (entitlements, certifications) for page structure
- Catalog item `form_fields` are rendered dynamically in cart — use standard HTML inputs
- SoD violations from cart validation are warnings, not blocking — always allow submit
- Admin BFF proxies must check `hasAdminRole()` before forwarding

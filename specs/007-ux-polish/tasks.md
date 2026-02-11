# Tasks: Polish & UX Refinements

**Input**: Design documents from `/specs/007-ux-polish/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Tests are included per the constitution's TDD requirement (Principle II).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project setup needed — extending existing project. Skip to foundational phase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared components and extend existing infrastructure that all user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 [P] Create EmptyState component in src/lib/components/ui/empty-state/empty-state.svelte with props: title, description, icon, actionLabel, actionHref
- [x] T002 [P] Create barrel export in src/lib/components/ui/empty-state/index.ts
- [x] T003 Write tests for EmptyState component in src/lib/components/ui/empty-state/empty-state.test.ts

**Checkpoint**: Foundation ready — EmptyState component tested and available for all stories.

---

## Phase 3: User Story 1 — Loading Feedback During Data Retrieval (Priority: P1)

**Goal**: All list pages show skeleton rows while data fetches, replacing the current "Loading..." text.

**Independent Test**: Navigate to any list page — skeleton rows appear during fetch, matching table column count.

### Tests for User Story 1

- [x] T004 [US1] Write tests for DataTable skeleton loading in src/lib/components/data-table/data-table.test.ts (verify skeleton rows render when isLoading=true, correct column count, replaced by data)

### Implementation for User Story 1

- [x] T005 [US1] Enhance DataTable to render skeleton rows when isLoading in src/lib/components/data-table/data-table.svelte — add skeletonRows prop (default 5), render Skeleton components per cell, add overflow-x-auto wrapper for horizontal scroll
- [x] T006 [US1] Update DataTable test to verify overflow-x-auto wrapper in src/lib/components/data-table/data-table.test.ts

**Checkpoint**: DataTable now shows skeleton rows instead of "Loading..." text. All list pages benefit automatically since they already pass `isLoading` to DataTable.

---

## Phase 4: User Story 2 — Empty State Guidance (Priority: P2)

**Goal**: All list pages show contextual empty states with CTAs when no data exists, and filtered-empty states when filters return zero results.

**Independent Test**: Access any list page with no data — see meaningful message with create link. Apply filters with no matches — see "No results" with clear option.

### Tests for User Story 2

- [x] T007 [P] [US2] Write tests for users list empty state in src/routes/(app)/users/+page.test.ts (verify empty state renders with CTA when data=[], distinct filtered-empty state)
- [x] T008 [P] [US2] Write tests for personas list empty state in src/routes/(app)/personas/+page.test.ts
- [x] T009 [P] [US2] Write tests for archetypes list empty state in src/routes/(app)/personas/archetypes/+page.test.ts
- [x] T010 [P] [US2] Write tests for NHI list empty state in src/routes/(app)/nhi/+page.test.ts

### Implementation for User Story 2

- [x] T011 [P] [US2] Update users list page with EmptyState CTA in src/routes/(app)/users/+page.svelte — pass EmptyState-based emptyMessage with "No users yet" + create link
- [x] T012 [P] [US2] Update personas list page with EmptyState CTA in src/routes/(app)/personas/+page.svelte
- [x] T013 [P] [US2] Update archetypes list page with EmptyState CTA in src/routes/(app)/personas/archetypes/+page.svelte
- [x] T014 [P] [US2] Update NHI list page with EmptyState CTA in src/routes/(app)/nhi/+page.svelte — include both "no data" and "no matching filters" states
- [x] T015 [US2] Update credentials-section empty state in src/routes/(app)/nhi/credentials-section.svelte — show "No credentials issued yet" with issue action when empty and not archived

**Checkpoint**: All list pages show meaningful empty states. Credentials section shows empty state.

---

## Phase 5: User Story 3 — Consistent Error Handling (Priority: P3)

**Goal**: Error pages with retry for failed page loads. Toast notifications for background operation failures.

**Independent Test**: Trigger a page load error — see error page with Retry button. Trigger a background operation failure — see toast notification.

### Tests for User Story 3

- [x] T016 [P] [US3] Write tests for app-level error page in src/routes/(app)/+error.test.ts (verify error message, retry button, go-to-dashboard link)
- [x] T017 [P] [US3] Write tests for root error page in src/routes/+error.test.ts

### Implementation for User Story 3

- [x] T018 [P] [US3] Create app-level error page in src/routes/(app)/+error.svelte with error message, status code, Retry button (invalidateAll), and "Go to Dashboard" link
- [x] T019 [P] [US3] Create root-level error page in src/routes/+error.svelte with minimal error display and "Go to Login" link

**Checkpoint**: All page load errors show user-friendly error pages with retry. Background errors already use toast (verified via existing code review).

---

## Phase 6: User Story 4 — Responsive Mobile Experience (Priority: P4)

**Goal**: Sidebar closes on navigation, smooth slide transition. Tables scroll horizontally. Forms stack on mobile.

**Independent Test**: Resize browser < 768px — sidebar hidden, hamburger works, tables scroll, forms stack.

### Tests for User Story 4

- [x] T020 [US4] Write tests for sidebar onNavigate callback in src/lib/components/layout/sidebar.test.ts (verify nav click calls onNavigate)

### Implementation for User Story 4

- [x] T021 [US4] Add onNavigate callback prop to Sidebar component in src/lib/components/layout/sidebar.svelte — call onNavigate on link click, add transition classes
- [x] T022 [US4] Update app layout to pass onNavigate (close sidebar) and add transition to mobile overlay in src/routes/(app)/+layout.svelte

**Checkpoint**: Mobile sidebar auto-closes on navigation with smooth transition. Tables already scroll (from T005 overflow-x-auto). Dialogs already responsive. Forms already stack via Tailwind responsive utilities.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and consistency pass.

- [x] T023 Run type check (npm run check) and fix any errors
- [x] T024 Run all tests (npm run test:unit) and fix any failures
- [x] T025 Honest review — verify all FR-001 through FR-015 are satisfied, fix issues found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — create shared EmptyState component
- **US1 Loading (Phase 3)**: Depends on Phase 2 (EmptyState not needed but DataTable changes are independent)
- **US2 Empty States (Phase 4)**: Depends on Phase 2 (needs EmptyState component)
- **US3 Error Handling (Phase 5)**: Independent of Phase 2 — can run in parallel with US1/US2
- **US4 Responsive (Phase 6)**: Independent — can run in parallel with others
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start immediately — DataTable enhancement is self-contained
- **US2 (P2)**: Depends on T001-T003 (EmptyState component)
- **US3 (P3)**: Can start immediately — error pages are self-contained
- **US4 (P4)**: Can start immediately — sidebar changes are self-contained

### Parallel Opportunities

- T001 + T002 can run in parallel (different files)
- T007 + T008 + T009 + T010 can run in parallel (different test files)
- T011 + T012 + T013 + T014 can run in parallel (different page files)
- T016 + T017 can run in parallel (different test files)
- T018 + T019 can run in parallel (different error pages)
- US1, US3, US4 can all start in parallel (no interdependencies)

---

## Parallel Example: User Story 2

```bash
# Launch all empty state tests together:
Task: "Write tests for users list empty state in src/routes/(app)/users/+page.test.ts"
Task: "Write tests for personas list empty state in src/routes/(app)/personas/+page.test.ts"
Task: "Write tests for archetypes list empty state in src/routes/(app)/personas/archetypes/+page.test.ts"
Task: "Write tests for NHI list empty state in src/routes/(app)/nhi/+page.test.ts"

# Then launch all page updates together:
Task: "Update users list with EmptyState in src/routes/(app)/users/+page.svelte"
Task: "Update personas list with EmptyState in src/routes/(app)/personas/+page.svelte"
Task: "Update archetypes list with EmptyState in src/routes/(app)/personas/archetypes/+page.svelte"
Task: "Update NHI list with EmptyState in src/routes/(app)/nhi/+page.svelte"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (EmptyState component)
2. Complete Phase 3: User Story 1 (DataTable skeleton rows)
3. **STOP and VALIDATE**: All list pages show skeleton loading — most visible improvement

### Incremental Delivery

1. Foundational → EmptyState ready
2. US1 → Skeleton rows on all tables (MVP!)
3. US2 → Empty states on all list pages
4. US3 → Error pages with retry
5. US4 → Responsive sidebar polish
6. Polish → Type check + tests + honest review

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- DataTable skeleton rows (US1) automatically benefit all 4 list pages since they all use DataTable
- Empty states (US2) require per-page customization for entity-specific messages and CTAs
- Error pages (US3) are only 2 files — minimal scope
- Responsive (US4) is mostly already done — only sidebar auto-close and transition needed
- Total: 25 tasks across 7 phases

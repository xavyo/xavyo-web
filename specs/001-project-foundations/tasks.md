# Tasks: Project Foundations

**Input**: Design documents from `/specs/001-project-foundations/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: TDD is required per Constitution Principle II. Tests are written FIRST.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize SvelteKit project, install dependencies, configure build tooling

- [x] T001 Initialize SvelteKit project with Svelte 5 and TypeScript in project root (npx sv create)
- [x] T002 Install runtime dependencies: bits-ui, tailwindcss, @tailwindcss/vite, sveltekit-superforms, zod, @tanstack/svelte-table, jose, clsx, tailwind-merge
- [x] T003 Install dev dependencies: vitest, @testing-library/svelte, jsdom, @sveltejs/vite-plugin-svelte
- [x] T004 Configure vite.config.ts with @tailwindcss/vite plugin and SvelteKit plugin, dev server port 3000
- [x] T005 Configure svelte.config.js with path aliases: $components → src/lib/components, $api → src/lib/api, $schemas → src/lib/schemas
- [x] T006 Configure vitest in vite.config.ts with jsdom environment and svelte testing support
- [x] T007 Verify TypeScript strict mode is enabled in tsconfig.json

**Checkpoint**: `npm run dev` starts on port 3000, `npm run check` passes, `npm run test:unit` runs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create app.css with design tokens and the cn() utility — both are required by ALL UI components

**CRITICAL**: No UI component work can begin until this phase is complete

- [x] T008 Create src/app.css with Tailwind v4 import (@import "tailwindcss") and @theme design tokens (colors: background, foreground, primary, secondary, muted, destructive, accent, border, ring; border-radius: sm, md, lg; font-family: sans, mono)
- [x] T009 Create src/app.html shell that imports app.css
- [x] T010 Create src/app.d.ts with App.Locals stub types (user, accessToken, tenantId as optional)
- [x] T011 Create src/routes/+page.svelte as default index page

**Checkpoint**: Foundation ready — app runs with Tailwind styles applied

---

## Phase 3: User Story 1+2 — Project Bootstrap + cn() Utility (Priority: P1)

**Goal**: Working project with cn() utility that passes all tests

**Independent Test**: `npm run test:unit` passes for cn.test.ts

### Tests (TDD — write FIRST, verify they FAIL)

- [x] T012 [US2] Write failing unit tests in src/lib/utils/cn.test.ts: test class merging (conflicting classes resolve correctly), conditional classes (falsy values ignored), empty/null/undefined inputs handled, multiple class strings concatenated

### Implementation

- [x] T013 [US2] Implement cn() utility in src/lib/utils/cn.ts combining clsx + tailwind-merge
- [x] T014 [US2] Verify all cn.test.ts tests pass (green)

**Checkpoint**: cn() utility fully tested and working

---

## Phase 4: User Story 3 — Base UI Components (Priority: P2)

**Goal**: 11 UI components built with Bits UI, each with unit tests

**Independent Test**: Each component renders in isolation, all tests pass

### Tests (TDD — write FIRST, verify they FAIL)

- [x] T015 [P] [US3] Write failing test in src/lib/components/ui/button/button.test.ts: renders button element, applies variant classes (default, destructive, outline, secondary, ghost, link), applies size classes (default, sm, lg, icon), accepts custom class prop
- [x] T016 [P] [US3] Write failing test in src/lib/components/ui/input/input.test.ts: renders input element, accepts type and placeholder props, applies custom class
- [x] T017 [P] [US3] Write failing test in src/lib/components/ui/label/label.test.ts: renders label element, renders children text, accepts for prop
- [x] T018 [P] [US3] Write failing test in src/lib/components/ui/card/card.test.ts: renders Card with CardHeader, CardContent, CardFooter sub-components, applies correct structure classes
- [x] T019 [P] [US3] Write failing test in src/lib/components/ui/badge/badge.test.ts: renders badge, applies variant classes (default, secondary, destructive, outline)
- [x] T020 [P] [US3] Write failing test in src/lib/components/ui/alert/alert.test.ts: renders Alert with AlertDescription, applies variant classes (default, destructive)
- [x] T021 [P] [US3] Write failing test in src/lib/components/ui/separator/separator.test.ts: renders hr/separator element, supports horizontal and vertical orientation
- [x] T022 [P] [US3] Write failing test in src/lib/components/ui/skeleton/skeleton.test.ts: renders div with animate-pulse class, accepts custom class
- [x] T023 [P] [US3] Write failing test in src/lib/components/ui/dialog/dialog.test.ts: renders dialog trigger, opens dialog on click showing overlay and content panel
- [x] T024 [P] [US3] Write failing test in src/lib/components/ui/select/select.test.ts: renders select trigger, opens dropdown showing options
- [x] T025 [P] [US3] Write failing test in src/lib/components/ui/dropdown-menu/dropdown-menu.test.ts: renders trigger, opens menu showing items

### Implementation — Simple Components (no Bits UI dependency)

- [x] T026 [P] [US3] Implement Button component in src/lib/components/ui/button/button.svelte + index.ts with variants (default, destructive, outline, secondary, ghost, link) and sizes (default, sm, lg, icon) using Svelte 5 runes
- [x] T027 [P] [US3] Implement Input component in src/lib/components/ui/input/input.svelte + index.ts with type, placeholder, disabled props
- [x] T028 [P] [US3] Implement Label component in src/lib/components/ui/label/label.svelte + index.ts with for prop
- [x] T029 [P] [US3] Implement Card components in src/lib/components/ui/card/card.svelte, card-header.svelte, card-content.svelte, card-footer.svelte + index.ts
- [x] T030 [P] [US3] Implement Badge component in src/lib/components/ui/badge/badge.svelte + index.ts with variants (default, secondary, destructive, outline)
- [x] T031 [P] [US3] Implement Alert components in src/lib/components/ui/alert/alert.svelte, alert-description.svelte + index.ts with variants (default, destructive)
- [x] T032 [P] [US3] Implement Separator component in src/lib/components/ui/separator/separator.svelte + index.ts using Bits UI Separator
- [x] T033 [P] [US3] Implement Skeleton component in src/lib/components/ui/skeleton/skeleton.svelte + index.ts with animate-pulse styling

### Implementation — Complex Components (Bits UI primitives)

- [x] T034 [P] [US3] Implement Dialog component in src/lib/components/ui/dialog/dialog.svelte + index.ts wrapping Bits UI Dialog with overlay, content, header, footer, title, description sub-components
- [x] T035 [P] [US3] Implement Select component in src/lib/components/ui/select/select.svelte + index.ts wrapping Bits UI Select with trigger, content, item, label sub-components
- [x] T036 [P] [US3] Implement DropdownMenu component in src/lib/components/ui/dropdown-menu/dropdown-menu.svelte + index.ts wrapping Bits UI DropdownMenu with trigger, content, item, separator sub-components

### Verification

- [x] T037 [US3] Run all component tests and verify they pass (green)
- [x] T038 [US3] Run npm run check and verify zero TypeScript errors

**Checkpoint**: All 11 UI components render correctly with tests passing

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T039 Run full test suite: npm run test:unit — all tests pass
- [x] T040 Run type check: npm run check — zero errors
- [x] T041 Verify dev server starts on port 3000 in under 5 seconds
- [x] T042 Run quickstart.md validation checklist
- [x] T043 Honest review per Constitution Principle III

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion
- **US1+US2 (Phase 3)**: Depends on Phase 2 (needs app.css + cn() test infrastructure)
- **US3 (Phase 4)**: Depends on Phase 3 (components use cn())
- **Polish (Phase 5)**: Depends on all previous phases

### Within Phase 4 (UI Components)

- All test tasks (T015–T025) can run in parallel [P]
- All simple component implementations (T026–T033) can run in parallel [P]
- All complex component implementations (T034–T036) can run in parallel [P]
- Tests MUST be written and FAIL before implementation begins

### Parallel Opportunities

```bash
# Write all component tests in parallel:
T015, T016, T017, T018, T019, T020, T021, T022, T023, T024, T025

# Implement all simple components in parallel:
T026, T027, T028, T029, T030, T031, T032, T033

# Implement all complex components in parallel:
T034, T035, T036
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: cn() utility with tests
4. **STOP and VALIDATE**: Project compiles, tests pass

### Full Delivery

1. Setup → Foundational → cn() → UI Components → Polish
2. Each phase validated before proceeding
3. Honest review at the end (T043)

---

## Notes

- Total tasks: 43
- US1+US2 tasks: 3 (T012–T014)
- US3 tasks: 24 (T015–T038)
- Setup/Foundational: 11 (T001–T011)
- Polish: 5 (T039–T043)
- Parallel opportunities: T015–T025 (11 tests), T026–T033 (8 simple), T034–T036 (3 complex)

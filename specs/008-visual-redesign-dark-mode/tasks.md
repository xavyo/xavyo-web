# Tasks: Visual Redesign + Dark Mode

**Input**: Design documents from `/specs/008-visual-redesign-dark-mode/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: TDD is mandatory per constitution. Test tasks included for all new components.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Install dependencies and establish theme infrastructure

- [x] T001 Install lucide-svelte dependency via `npm install lucide-svelte`
- [x] T002 Add FOWT prevention inline script to `src/app.html` — read localStorage('theme'), check `prefers-color-scheme`, set `.dark` class on `<html>` before body renders
- [x] T003 Add Tailwind v4 dark mode custom variant and dark color palette to `src/app.css` — add `@custom-variant dark (&:where(.dark, .dark *))`, define dark theme OKLCH variables under `.dark` selector for all semantic tokens (background, foreground, primary, secondary, accent, muted, destructive, border, input, ring, card, popover), refine light palette with warmer tones and higher contrast
- [x] T004 Add print stylesheet to `src/app.css` — force light theme via `@media print` that removes `.dark` overrides

---

## Phase 2: Foundational (Theme System)

**Purpose**: Core theme store that MUST be complete before any user story can be implemented

**⚠️ CRITICAL**: All user stories depend on the theme system being functional

- [x] T005 Write failing tests for theme store in `src/lib/stores/theme.svelte.test.ts` — test ThemeMode type ('light'|'dark'|'system'), test `setMode()` updates mode state, test `resolvedTheme` derives correctly from mode and OS preference, test localStorage read/write (mock), test fallback when localStorage unavailable
- [x] T006 Create theme store in `src/lib/stores/theme.svelte.ts` — export `themeStore` with `$state` for mode, `$derived` for resolvedTheme, `$effect` for localStorage persistence, `$effect` for `.dark` class toggle on `document.documentElement`, `$effect` for `matchMedia('(prefers-color-scheme: dark)')` listener (only when mode='system'), expose `setMode(mode: ThemeMode)` function. Types: `type ThemeMode = 'light' | 'dark' | 'system'`
- [x] T007 Run existing test suite (`npm run test:unit`) — verify zero regressions from CSS and HTML changes in Phase 1

**Checkpoint**: Theme system functional — toggling `.dark` class swaps all CSS variables. All existing tests pass.

---

## Phase 3: User Story 1 — Dark/Light Theme Toggle (Priority: P1) 🎯 MVP

**Goal**: User can toggle between light/dark/system themes, preference persists, no FOWT

**Independent Test**: Toggle theme via button → verify page colors change → refresh → verify persistence

### Tests for US1

- [x] T008 [P] [US1] Write failing tests for ThemeToggle component in `src/lib/components/ui/theme-toggle/theme-toggle.test.ts` — test renders sun/moon icon based on resolvedTheme, test clicking cycles through modes (light→dark→system→light), test accessibility (aria-label, button role)

### Implementation for US1

- [x] T009 [P] [US1] Create ThemeToggle component in `src/lib/components/ui/theme-toggle/theme-toggle.svelte` — import Sun, Moon, Monitor icons from lucide-svelte, import themeStore, show current mode icon, onclick cycles modes, button with `aria-label="Toggle theme"`, style with `hover:bg-accent` transition
- [x] T010 [P] [US1] Create barrel export in `src/lib/components/ui/theme-toggle/index.ts` — `export { default as ThemeToggle } from './theme-toggle.svelte'`
- [x] T011 [US1] Integrate ThemeToggle into header — update `src/lib/components/layout/header.svelte` to import and render ThemeToggle in header actions area (before user section)
- [x] T012 [US1] Verify theme toggle E2E — start dev server, use Chrome MCP to load page, click theme toggle, verify `.dark` class appears on `<html>`, verify colors change, refresh page, verify theme persists

**Checkpoint**: Theme toggle works in header. Light/dark/system modes functional. Persistence verified.

---

## Phase 4: User Story 2 — Refined Visual Design Language (Priority: P1)

**Goal**: Polished typography, spacing, transitions, and WCAG AA contrast in both themes

**Independent Test**: Navigate all pages → verify visual consistency, hover/focus states, contrast ratios

### Implementation for US2

- [x] T013 [P] [US2] Refine button component dark mode in `src/lib/components/ui/button/button.svelte` — ensure all 6 variants (default, destructive, outline, secondary, ghost, link) have appropriate contrast in dark mode using semantic tokens, add `transition-colors duration-150` if missing
- [x] T014 [P] [US2] Refine badge component in `src/lib/components/ui/badge/badge.svelte` — verify all 4 variants work in dark mode, ensure `transition-colors` present
- [x] T015 [P] [US2] Refine input component in `src/lib/components/ui/input/input.svelte` — verify border, background, placeholder, focus ring colors in dark mode
- [x] T016 [P] [US2] Refine card components in `src/lib/components/ui/card/card.svelte`, `card-header.svelte`, `card-content.svelte`, `card-footer.svelte` — verify bg-card, shadow, and border render correctly in dark mode
- [x] T017 [P] [US2] Refine dialog component in `src/lib/components/ui/dialog/dialog-content.svelte` — verify overlay opacity, content background, and animations in dark mode
- [x] T018 [P] [US2] Refine alert component in `src/lib/components/ui/alert/alert.svelte` — verify default and destructive variants in dark mode, leverage existing `dark:` prefix usage
- [x] T019 [P] [US2] Refine select components in `src/lib/components/ui/select/select-trigger.svelte` and `select-content.svelte` — verify border, background, selected state in dark mode
- [x] T020 [P] [US2] Refine dropdown-menu components in `src/lib/components/ui/dropdown-menu/dropdown-menu-content.svelte`, `dropdown-menu-item.svelte`, `dropdown-menu-label.svelte`, `dropdown-menu-separator.svelte` — verify backgrounds, hover states, separators in dark mode
- [x] T021 [P] [US2] Refine skeleton component in `src/lib/components/ui/skeleton/skeleton.svelte` — verify pulse animation background in dark mode
- [x] T022 [P] [US2] Refine separator component in `src/lib/components/ui/separator/separator.svelte` — verify border color in dark mode
- [x] T023 [P] [US2] Refine label component in `src/lib/components/ui/label/label.svelte` — verify text color in dark mode
- [x] T024 [P] [US2] Refine empty-state component in `src/lib/components/ui/empty-state/empty-state.svelte` — update to accept optional Svelte component icon prop (alongside existing emoji), verify dark mode colors
- [x] T025 [US2] Refine toast system in `src/lib/components/layout/toast-container.svelte` and `src/lib/stores/toast.svelte.ts` — replace hardcoded green-50/red-50/blue-50 colors with semantic tokens that work in both themes
- [x] T026 [P] [US2] Refine data-table in `src/lib/components/data-table/data-table.svelte` — verify hover:bg-muted/50, header bg, borders in dark mode, add `transition-colors` to rows
- [x] T027 [P] [US2] Refine data-table-toolbar in `src/lib/components/data-table/data-table-toolbar.svelte` — verify search input styling in dark mode
- [x] T028 [P] [US2] Refine data-table-pagination in `src/lib/components/data-table/data-table-pagination.svelte` — verify button styles in dark mode
- [x] T029 [US2] Refine page-header in `src/lib/components/layout/page-header.svelte` — improve typography hierarchy (font sizes, weights), verify dark mode
- [x] T030 [US2] Run full test suite (`npm run test:unit`) — verify zero regressions after all component refinements
- [x] T031 [US2] Visual check with Chrome MCP — navigate to dashboard, users list, user detail, persona list, NHI list in both light and dark modes, verify consistent spacing, typography, contrast

**Checkpoint**: All existing components render correctly in both themes. WCAG AA contrast verified. Transitions smooth.

---

## Phase 5: User Story 3 — Professional Navigation with Icons (Priority: P2)

**Goal**: Replace emoji nav icons with lucide-svelte vector icons, refine sidebar active states

**Independent Test**: View sidebar → all items show vector icons → click through → active states visible in both themes

### Tests for US3

- [x] T032 [P] [US3] Write failing tests for sidebar icon rendering in `src/lib/components/layout/sidebar.test.ts` — test that NavItem accepts Component type for icon, test active state class application, test icon renders (check for SVG element)

### Implementation for US3

- [x] T033 [US3] Update NavItem interface and sidebar component in `src/lib/components/layout/sidebar.svelte` — change `icon: string` to `icon: Component`, render via `<svelte:component this={item.icon} class="h-5 w-5" />`, refine active state styling with better contrast in both themes, add text truncation with ellipsis for long labels
- [x] T034 [US3] Update nav items in `src/routes/(app)/+layout.svelte` — import `LayoutDashboard`, `Users`, `Drama`, `Bot` from `lucide-svelte`, replace emoji strings with component references in navItems array
- [x] T035 [US3] Run tests and visually verify with Chrome MCP — check sidebar in both themes, verify icons render as SVG, verify active/inactive states, check mobile sidebar animation

**Checkpoint**: All sidebar items use vector icons. Active states clear in both themes. No emoji remains.

---

## Phase 6: User Story 4 — User Avatar & Header Actions (Priority: P2)

**Goal**: Avatar with initials in header, dropdown with profile/settings/logout, theme toggle in header

**Independent Test**: View header → avatar shows initials → click → dropdown opens with all actions

### Tests for US4

- [x] T036 [P] [US4] Write failing tests for Avatar component in `src/lib/components/ui/avatar/avatar.test.ts` — test renders initials from name, test falls back to email initial when no name, test renders User icon when no name and no email, test deterministic background color from email hash, test size variants (sm, default, lg)
- [x] T037 [P] [US4] Write failing tests for header dropdown in `src/lib/components/layout/header.test.ts` — test avatar renders in header, test dropdown opens on click, test dropdown contains Profile/Settings/Log out items

### Implementation for US4

- [x] T038 [P] [US4] Create Avatar component in `src/lib/components/ui/avatar/avatar.svelte` — accept name, email, size, class props; compute initials (first letter of name or email); compute background color from email hash (pick from 8 distinct OKLCH colors); render circle div with initials text or User icon fallback; size variants: sm=32px, default=36px, lg=40px
- [x] T039 [P] [US4] Create barrel export in `src/lib/components/ui/avatar/index.ts` — `export { default as Avatar } from './avatar.svelte'`
- [x] T040 [US4] Redesign header in `src/lib/components/layout/header.svelte` — remove plain email text and "Log out" link, add Avatar component with user email/name, add DropdownMenu (using existing Bits UI wrapper) with items: Profile (href="/dashboard" placeholder), Settings (href="/dashboard" placeholder), separator, ThemeToggle inline row, separator, Log out (href="/logout"), style dropdown for both themes
- [x] T041 [US4] Update header props — ensure header receives user name (if available) in addition to email, update `src/routes/(app)/+layout.svelte` to pass name if available from `data.user`
- [x] T042 [US4] Run tests and visually verify with Chrome MCP — check header avatar, click dropdown, verify all menu items work, test in both themes

**Checkpoint**: Header shows avatar, dropdown works, theme toggle accessible from header in both themes.

---

## Phase 7: User Story 5 — Branded Authentication Pages (Priority: P3)

**Goal**: Login, signup, and all auth pages get branded gradient backgrounds and polished card design

**Independent Test**: View login page → branded background visible → switch to dark mode → colors adapt → check on mobile

### Tests for US5

- [x] T043 [P] [US5] Write failing tests for auth layout branding in `src/routes/(auth)/layout.test.ts` — test that auth layout renders branded background class, test xavyo brand text is present

### Implementation for US5

- [x] T044 [US5] Redesign auth layout in `src/routes/(auth)/+layout.svelte` — add gradient background (light: warm subtle gradient using primary tint, dark: deep slate-to-purple gradient), add xavyo brand text/wordmark above the card, ensure card has shadow and refined borders for both themes, add theme toggle for auth pages (so users can switch before logging in)
- [x] T045 [P] [US5] Polish login page in `src/routes/(auth)/login/+page.svelte` — refine form spacing, input styles, button prominence, add subtle card shadow
- [x] T046 [P] [US5] Polish signup page in `src/routes/(auth)/signup/+page.svelte` — same treatment as login
- [x] T047 [P] [US5] Polish forgot-password page in `src/routes/(auth)/forgot-password/+page.svelte` — same treatment
- [x] T048 [P] [US5] Polish reset-password page in `src/routes/(auth)/reset-password/+page.svelte` — same treatment
- [x] T049 [P] [US5] Polish verify-email page in `src/routes/(auth)/verify-email/+page.svelte` — same treatment
- [x] T050 [US5] Run tests and visually verify with Chrome MCP — check all 5 auth pages in both themes, verify gradient backgrounds, card design, responsive layout at 320px and 1440px widths

**Checkpoint**: All auth pages show branded design in both themes. Responsive on mobile.

---

## Phase 8: User Story 6 — Foundational Components (Priority: P3)

**Goal**: Create Tooltip and Tabs components for use by future features (Phase 009+)

**Independent Test**: Render each component in isolation → verify display in both themes → test keyboard nav

### Tests for US6

- [x] T051 [P] [US6] Write failing tests for Tooltip in `src/lib/components/ui/tooltip/tooltip-content.test.ts` — test renders tooltip content text, test applies dark mode classes
- [x] T052 [P] [US6] Write failing tests for Tabs in `src/lib/components/ui/tabs/tabs.test.ts` — test renders tabs list with triggers, test active tab highlighted, test clicking tab changes content, test keyboard arrow navigation

### Implementation for US6

- [x] T053 [P] [US6] Create Tooltip component in `src/lib/components/ui/tooltip/tooltip-content.svelte` — wrap Bits UI Tooltip.Content with Tailwind styling (bg-popover, text-popover-foreground, border, shadow, rounded, animate-in/animate-out), support side prop (top, right, bottom, left)
- [x] T054 [P] [US6] Create Tooltip barrel export in `src/lib/components/ui/tooltip/index.ts` — re-export `Tooltip` root and trigger from Bits UI, export styled `TooltipContent`
- [x] T055 [P] [US6] Create TabsList component in `src/lib/components/ui/tabs/tabs-list.svelte` — wrap Bits UI Tabs.List with Tailwind (bg-muted, rounded-lg, p-1, inline-flex, gap-1)
- [x] T056 [P] [US6] Create TabsTrigger component in `src/lib/components/ui/tabs/tabs-trigger.svelte` — wrap Bits UI Tabs.Trigger with Tailwind (data-[state=active]:bg-background, data-[state=active]:shadow-sm, rounded-md, px-3, py-1.5, text-sm, transition-all)
- [x] T057 [P] [US6] Create TabsContent component in `src/lib/components/ui/tabs/tabs-content.svelte` — wrap Bits UI Tabs.Content with Tailwind (mt-2, focus-visible:outline-none, focus-visible:ring-2)
- [x] T058 [P] [US6] Create Tabs barrel export in `src/lib/components/ui/tabs/index.ts` — re-export `Tabs` root from Bits UI, export styled `TabsList`, `TabsTrigger`, `TabsContent`
- [x] T059 [US6] Run tests and verify in both themes

**Checkpoint**: Tooltip and Tabs components ready. Both work in light and dark mode. Keyboard accessible.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, regression testing, and cleanup

- [x] T060 Run full test suite (`npm run test:unit`) — all 266+ existing tests plus new tests must pass
- [x] T061 Run TypeScript/Svelte check (`npm run check`) — zero errors
- [x] T062 Full E2E visual review with Chrome MCP in light mode — navigate through all pages (login, signup, dashboard, users, user detail, personas, persona detail, archetypes, NHI, NHI tools, NHI agents, NHI service accounts), verify consistent design
- [x] T063 Full E2E visual review with Chrome MCP in dark mode — same pages as T062, verify all dark mode colors, contrast, transitions
- [x] T064 Mobile responsiveness check with Chrome MCP — resize to 375px width, test sidebar toggle, verify all pages render correctly in both themes
- [x] T065 Theme persistence check — set dark mode, refresh page, verify no FOWT, set system mode, verify OS preference detection
- [x] T066 Run E2E provision flow (`node e2e/provision-flow.mjs`) — verify full flow still works after visual changes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 - Theme Toggle)**: Depends on Phase 2 — first user-facing story
- **Phase 4 (US2 - Design Language)**: Depends on Phase 2, can parallel with US1 but benefits from theme toggle being available
- **Phase 5 (US3 - Nav Icons)**: Depends on Phase 2, can parallel with US1/US2
- **Phase 6 (US4 - Avatar/Header)**: Depends on Phase 2, benefits from US1 (theme toggle integration in header)
- **Phase 7 (US5 - Auth Pages)**: Depends on Phase 2, benefits from US2 (design language)
- **Phase 8 (US6 - Tooltip/Tabs)**: Depends on Phase 2, fully independent
- **Phase 9 (Polish)**: Depends on all user stories

### Parallel Opportunities

After Phase 2 completes, these can run in parallel:
- US1 (Theme Toggle) + US3 (Nav Icons) + US6 (Tooltip/Tabs) — all touch different files
- US2 (Design Language) — can overlap with US1 since it touches different components
- US4 (Avatar/Header) — best after US1 for theme toggle integration
- US5 (Auth Pages) — best after US2 for design language refinement

### Within Each User Story

- Tests written first (TDD per constitution)
- Component creation before integration
- Integration before E2E verification

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (lucide-svelte, FOWT script, dark palette)
2. Complete Phase 2: Foundational (theme store)
3. Complete Phase 3: User Story 1 (theme toggle in header)
4. **STOP and VALIDATE**: Theme switching works, persists, no FOWT

### Incremental Delivery

1. Setup + Foundational → Theme system ready
2. US1 (Theme Toggle) → MVP — users can switch themes
3. US2 (Design Language) → All components polished for both themes
4. US3 (Nav Icons) → Professional navigation
5. US4 (Avatar/Header) → Complete header redesign
6. US5 (Auth Pages) → Branded entry experience
7. US6 (Tooltip/Tabs) → Foundation for Phase 009
8. Polish → Full verification pass

---

## Summary

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Setup | 4 (T001-T004) | T002-T004 after T001 |
| Foundational | 3 (T005-T007) | — |
| US1: Theme Toggle | 5 (T008-T012) | T008-T010 parallel |
| US2: Design Language | 19 (T013-T031) | T013-T024, T026-T028 parallel |
| US3: Nav Icons | 4 (T032-T035) | — |
| US4: Avatar/Header | 7 (T036-T042) | T036-T039 parallel |
| US5: Auth Pages | 8 (T043-T050) | T045-T049 parallel |
| US6: Tooltip/Tabs | 9 (T051-T059) | T051-T058 parallel |
| Polish | 7 (T060-T066) | T062-T064 parallel |
| **Total** | **66 tasks** | |

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Constitution requires TDD: tests first, fail, then implement
- All components already use semantic color tokens — dark mode is primarily a CSS variable swap
- Commit after each phase checkpoint

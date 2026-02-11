# Implementation Plan: Visual Redesign + Dark Mode

**Branch**: `008-visual-redesign-dark-mode` | **Date**: 2026-02-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-visual-redesign-dark-mode/spec.md`

## Summary

Complete visual overhaul of xavyo-web: add dark/light/system theme switching with localStorage persistence and FOWT prevention, refine the OKLCH color palette for both modes, replace emoji nav icons with lucide-svelte vector icons, add avatar + dropdown in header, create tooltip/tabs components, brand auth pages, and enhance all component hover/focus states. No new routes or backend changes.

## Technical Context

**Language/Version**: TypeScript 5.9 / Svelte 5.50 (runes mode) + SvelteKit 2.50
**Primary Dependencies**: Bits UI 2.15, Tailwind CSS v4.1, lucide-svelte (new), clsx + tailwind-merge
**Storage**: Browser localStorage for theme preference (no server-side storage)
**Testing**: Vitest 4.0 + @testing-library/svelte 5.3 (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
**Project Type**: Web application (SvelteKit)
**Performance Goals**: Theme transitions < 200ms, no FOWT, WCAG AA contrast in both themes
**Constraints**: Zero regression on 266+ existing tests, no new routes, no new backend API calls
**Scale/Scope**: ~25 existing UI components + 5 layout components + 5 auth pages + ~15 app pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | No token handling changes. Theme is client-only via localStorage. |
| II. Test-Driven Development | PASS | New components get unit tests. Existing test suite must pass with zero regressions. |
| III. Honest Reviews | PASS | Will review after implementation with Chrome DevTools MCP for both themes. |
| IV. Svelte 5 Runes Only | PASS | Theme store uses `$state`/`$derived`/`$effect`. All new components use runes. |
| V. Minimal Complexity | PASS | Theme store is a simple rune store (like toast.svelte.ts). No over-engineering. |
| VI. Type Safety | PASS | Theme type: `'light' | 'dark' | 'system'`. Strict typing on all new components. |
| VII. English Only | PASS | All UI text in English. |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/008-visual-redesign-dark-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app.css                                    # MODIFY: Add dark theme variables under .dark class
├── app.html                                   # MODIFY: Add theme detection script in <head>
├── lib/
│   ├── stores/
│   │   ├── toast.svelte.ts                    # EXISTING (reference pattern)
│   │   └── theme.svelte.ts                    # CREATE: Theme state store (dark/light/system)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button/button.svelte           # MODIFY: Verify dark mode classes
│   │   │   ├── badge/badge.svelte             # MODIFY: Verify dark mode classes
│   │   │   ├── input/input.svelte             # MODIFY: Verify dark mode classes
│   │   │   ├── card/*.svelte                  # MODIFY: Verify dark mode classes
│   │   │   ├── dialog/dialog-content.svelte   # MODIFY: Verify dark mode classes
│   │   │   ├── alert/alert.svelte             # MODIFY: Verify dark mode classes
│   │   │   ├── empty-state/empty-state.svelte # MODIFY: Replace emoji icon, dark mode
│   │   │   ├── skeleton/skeleton.svelte       # MODIFY: Verify dark mode classes
│   │   │   ├── dropdown-menu/*.svelte         # MODIFY: Verify dark mode classes
│   │   │   ├── select/*.svelte                # MODIFY: Verify dark mode classes
│   │   │   ├── separator/separator.svelte     # MODIFY: Verify dark mode classes
│   │   │   ├── label/label.svelte             # MODIFY: Verify dark mode classes
│   │   │   ├── theme-toggle/                  # CREATE: Theme toggle button component
│   │   │   │   ├── theme-toggle.svelte
│   │   │   │   └── index.ts
│   │   │   ├── avatar/                        # CREATE: Avatar with initials fallback
│   │   │   │   ├── avatar.svelte
│   │   │   │   └── index.ts
│   │   │   ├── tooltip/                       # CREATE: Tooltip (Bits UI wrapper)
│   │   │   │   ├── tooltip-content.svelte
│   │   │   │   └── index.ts
│   │   │   └── tabs/                          # CREATE: Tabs component (Bits UI wrapper)
│   │   │       ├── tabs-content.svelte
│   │   │       ├── tabs-list.svelte
│   │   │       ├── tabs-trigger.svelte
│   │   │       └── index.ts
│   │   ├── layout/
│   │   │   ├── sidebar.svelte                 # MODIFY: lucide-svelte icons, refined active states
│   │   │   ├── header.svelte                  # MODIFY: Avatar, theme toggle, user dropdown
│   │   │   ├── page-header.svelte             # MODIFY: Typography refinement
│   │   │   └── toast-container.svelte         # MODIFY: Dark mode toast colors
│   │   └── data-table/
│   │       ├── data-table.svelte              # MODIFY: Dark mode table styles
│   │       ├── data-table-toolbar.svelte      # MODIFY: Dark mode search
│   │       └── data-table-pagination.svelte   # MODIFY: Dark mode pagination
│   └── utils/
│       └── cn.ts                              # EXISTING (no changes needed)
├── routes/
│   ├── (auth)/
│   │   ├── +layout.svelte                     # MODIFY: Branded background, dark mode
│   │   ├── login/+page.svelte                 # MODIFY: Visual polish
│   │   ├── signup/+page.svelte                # MODIFY: Visual polish
│   │   ├── forgot-password/+page.svelte       # MODIFY: Visual polish
│   │   ├── reset-password/+page.svelte        # MODIFY: Visual polish
│   │   └── verify-email/+page.svelte          # MODIFY: Visual polish
│   └── (app)/
│       └── +layout.svelte                     # MODIFY: Updated nav items (Svelte component icons)
```

**Structure Decision**: Follows existing SvelteKit structure. New components created in `src/lib/components/ui/` following the established single-file-per-component pattern with barrel exports. Theme store follows `toast.svelte.ts` pattern in `src/lib/stores/`.

## Design Decisions

### Theme System Architecture

1. **CSS class strategy**: Use `.dark` class on `<html>` element (Tailwind v4 dark mode via `@custom-variant dark (&:where(.dark, .dark *))`)
2. **Theme store**: Svelte 5 rune store in `theme.svelte.ts` managing `mode: 'light' | 'dark' | 'system'` and `resolvedTheme: 'light' | 'dark'`
3. **FOWT prevention**: Inline `<script>` in `app.html` `<head>` that reads localStorage and sets `.dark` class before any rendering
4. **OS preference tracking**: `$effect` in theme store listens to `matchMedia('(prefers-color-scheme: dark)')` changes
5. **Persistence**: `localStorage.setItem('theme', mode)` on mode change

### Color Palette Strategy

1. **Light theme**: Refine existing OKLCH values — slight warm tint, better contrast ratios
2. **Dark theme**: Define dark OKLCH counterparts under `.dark` selector — deep slate backgrounds, muted borders, adjusted foreground
3. **Semantic tokens remain the same**: `--color-primary`, `--color-background`, etc. Components don't change class names — colors swap via CSS variables
4. **All components already use semantic tokens** (e.g., `bg-primary`, `text-muted-foreground`) so no class changes needed for dark mode on most components

### Icon Strategy

1. **Library**: `lucide-svelte` — tree-shakeable, Svelte 5 compatible, 1400+ icons
2. **Sidebar icons**: Pass Svelte component references instead of emoji strings. Change `NavItem.icon` from `string` to `Component` type
3. **Icon mapping**: Dashboard → `LayoutDashboard`, Users → `Users`, Personas → `Drama`, NHI → `Bot`

### Avatar Strategy

1. **Initials extraction**: First letter of display name, or first letter of email if no name
2. **Color**: Deterministic background color based on email hash (consistent per user)
3. **Fallback**: Generic `User` icon from lucide-svelte when no name and no email

### Component Updates

1. **Toast colors**: Move from hardcoded color classes to semantic tokens that respect theme
2. **Empty state icons**: Accept optional Svelte component icon prop alongside emoji fallback
3. **All components**: Already use semantic tokens — dark mode just works via CSS variable swap
4. **Transitions**: Add `transition-colors duration-150` to interactive elements that lack it

## Complexity Tracking

No constitution violations to justify. All changes follow established patterns.

# Research: Visual Redesign + Dark Mode

## Decision 1: Dark Mode CSS Strategy

**Decision**: Use Tailwind v4 `@custom-variant` with `.dark` class on `<html>` element

**Rationale**: Tailwind CSS v4 supports custom variants via `@custom-variant dark (&:where(.dark, .dark *))` in the CSS file. This approach:
- Works with the existing `@theme` block — dark values override via `.dark` scoped CSS custom properties
- Compatible with inline `<script>` FOWT prevention (set class before render)
- Industry standard (shadcn/ui, Bits UI all use this pattern)
- No build-time configuration needed — pure CSS

**Alternatives considered**:
- `prefers-color-scheme` media query only: Rejected — doesn't support manual override
- `data-theme` attribute: Rejected — Tailwind v4 `dark:` variant expects class-based approach
- Server-side cookie for theme: Rejected — adds unnecessary complexity, localStorage is sufficient

## Decision 2: Icon Library

**Decision**: `lucide-svelte` for all vector icons

**Rationale**:
- Tree-shakeable — only imports icons actually used (no bundle bloat)
- 1400+ professionally designed icons with consistent style
- Native Svelte 5 component format — renders as inline SVG
- Active maintenance, MIT licensed
- Used by shadcn-svelte ecosystem (Bits UI companion)

**Alternatives considered**:
- `heroicons`: Fewer icons, less Svelte ecosystem integration
- `phosphor-svelte`: Good but smaller community
- Custom SVGs: Too much maintenance overhead
- `@iconify/svelte`: Universal but heavier runtime

## Decision 3: Theme State Management

**Decision**: Svelte 5 rune store in `theme.svelte.ts` (following `toast.svelte.ts` pattern)

**Rationale**:
- Consistent with existing store patterns in the project
- `$state` for reactive mode, `$derived` for resolved theme
- `$effect` for side effects (localStorage write, class toggle, media query listener)
- No external dependencies needed

**Alternatives considered**:
- Svelte context: Rejected — theme needed globally including in `app.html` before Svelte mounts
- External state library (nanostores): Rejected — YAGNI, rune store is sufficient
- CSS-only with `prefers-color-scheme`: Rejected — doesn't support manual toggle

## Decision 4: FOWT Prevention

**Decision**: Inline `<script>` in `app.html` `<head>` that reads localStorage and sets `.dark` class before body renders

**Rationale**:
- Executes synchronously before any rendering — zero flash
- Reads `localStorage.getItem('theme')` and falls back to `matchMedia`
- Sets `document.documentElement.classList.add/remove('dark')`
- Standard pattern used by Next.js, Nuxt, and SvelteKit dark mode implementations

**Alternatives considered**:
- Server-side rendering with cookie: Adds complexity to BFF layer for a purely cosmetic concern
- CSS `color-scheme` only: Doesn't provide enough control for custom palettes
- Flash then correct: Poor UX, rejected

## Decision 5: Color Palette Design

**Decision**: Refined OKLCH palette with deep slate dark mode and warm light mode

**Rationale**:
- OKLCH provides perceptually uniform colors — dark mode colors look equally "vivid" at lower lightness
- Slate-based dark mode (not pure black) reduces eye strain and looks more professional
- Light mode gets subtle warm tint (shifting from pure achromatic to slight warm hue)
- Primary color (purple) works in both modes with lightness adjustment
- Destructive (red) maintains urgency in both modes

**Light palette refinements**: Slightly warmer backgrounds (hint of warm gray), higher contrast borders
**Dark palette**: `background: oklch(0.13 0.005 270)` (deep slate), `foreground: oklch(0.95 0.005 270)` (soft white), borders at `oklch(0.25 0.005 270)`

## Decision 6: Sidebar Icon Architecture

**Decision**: Change `NavItem.icon` from `string` (emoji) to Svelte `Component` type

**Rationale**:
- lucide-svelte exports each icon as a Svelte component
- Passing component references enables `<svelte:component this={item.icon} />` rendering
- Type-safe — no string-to-icon mapping needed
- Clean migration path — update `NavItem` interface and update all usages

**Icon mapping**:
- Dashboard → `LayoutDashboard`
- Users → `Users`
- Personas → `Drama` (theater masks)
- NHI → `Bot` (robot face)

## Decision 7: Avatar Component Design

**Decision**: Simple initials avatar with deterministic color, no image upload

**Rationale**:
- Scope boundary: spec explicitly excludes image upload
- Initials from display name (first letter) or email (first letter) as fallback
- Background color derived from simple hash of email → pick from a palette of 8 distinct colors
- Fallback to `User` lucide icon when no text available
- Size variants: `sm` (32px), `default` (36px), `lg` (40px)

## Decision 8: Bits UI Component Wrappers

**Decision**: Create Tooltip and Tabs as thin Bits UI wrappers following existing component patterns

**Rationale**:
- Consistent with existing Dialog, Select, DropdownMenu patterns
- Bits UI provides accessible primitives — we add Tailwind styling
- Tabs: `Tabs.Root`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`
- Tooltip: `Tooltip.Root`, `Tooltip.Trigger`, `Tooltip.Content`
- Follow the same barrel export pattern (`index.ts`)

## Decision 9: Auth Page Branding

**Decision**: Gradient background with centered card on auth pages

**Rationale**:
- Auth layout already has centered card pattern — enhance with gradient background
- Light mode: subtle warm gradient (background to primary tint)
- Dark mode: deep gradient (dark slate to dark purple tint)
- Brand "xavyo" displayed as styled text (no logo image file exists)
- Responsive: gradient fills viewport, card stays centered and max-width constrained

## Decision 10: Transition Strategy

**Decision**: CSS `transition-colors duration-150` on all interactive elements, `duration-200` for theme switch

**Rationale**:
- 150ms for hover/focus — fast enough to feel responsive, slow enough to be noticed
- 200ms for theme transition — smooth class toggle on `<html>` with `transition-colors` on all elements
- Use `* { transition-property: color, background-color, border-color; transition-duration: 200ms; }` scoped to theme changes only (to avoid interfering with other transitions)
- Dialog/dropdown animations already use Bits UI built-in transitions — no changes needed

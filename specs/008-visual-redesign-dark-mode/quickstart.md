# Quickstart: Visual Redesign + Dark Mode

## Prerequisites

- Node.js 20+
- Existing xavyo-web project with all dependencies installed
- xavyo-idp backend running on localhost:8080 (for E2E testing only)

## Setup

### 1. Install new dependency

```bash
npm install lucide-svelte
```

### 2. Key files to implement (in order)

1. **Theme foundation**:
   - `src/app.html` — Add inline theme detection script
   - `src/app.css` — Add dark mode custom variant and dark color palette
   - `src/lib/stores/theme.svelte.ts` — Create theme state store

2. **New UI components**:
   - `src/lib/components/ui/theme-toggle/` — Theme toggle button
   - `src/lib/components/ui/avatar/` — Avatar with initials
   - `src/lib/components/ui/tooltip/` — Tooltip (Bits UI wrapper)
   - `src/lib/components/ui/tabs/` — Tabs (Bits UI wrapper)

3. **Layout updates**:
   - `src/lib/components/layout/sidebar.svelte` — lucide-svelte icons
   - `src/lib/components/layout/header.svelte` — Avatar, dropdown, theme toggle
   - `src/routes/(app)/+layout.svelte` — Update nav items to use component icons

4. **Auth pages**:
   - `src/routes/(auth)/+layout.svelte` — Branded background

5. **Component dark mode pass**:
   - Verify all existing components work with dark mode CSS variables

### 3. Verify

```bash
# Run all unit tests (should pass with zero regressions)
npm run test:unit

# TypeScript + Svelte checks
npm run check

# Dev server for visual inspection
npm run dev
```

### 4. Test dark mode

1. Open http://localhost:3000
2. Click theme toggle in header → verify dark mode
3. Refresh page → theme should persist (no flash)
4. Set to "system" → change OS preference → theme should follow
5. Navigate to login page → verify branded design in both themes
6. Check all pages: dashboard, users, personas, NHI

## Architecture Overview

```
localStorage('theme') ──→ app.html script (FOWT prevention)
                              │
                              ▼
                    <html class="dark">
                              │
                              ▼
                    CSS variables swap
                    (.dark { --color-background: ... })
                              │
                              ▼
                    All components inherit
                    (bg-background, text-foreground, etc.)

theme.svelte.ts store ──→ Manages mode state
                              │
                              ├─→ Writes localStorage
                              ├─→ Toggles .dark class
                              └─→ Listens to OS preference
```

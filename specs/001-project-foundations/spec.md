# Feature Specification: Project Foundations

**Feature Branch**: `001-project-foundations`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "Initialize SvelteKit project with Svelte 5, install all dependencies, configure build tooling, and create base UI component library using Bits UI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Bootstraps the Project (Priority: P1)

A developer clones the repo, runs `npm install` and `npm run dev`, and gets a working SvelteKit dev server on `localhost:3000` with Tailwind CSS styles applied. The project compiles with zero TypeScript errors in strict mode.

**Why this priority**: Nothing else can be built until the project scaffolding exists and compiles.

**Independent Test**: Run `npm run dev` and verify the server starts. Run `npm run check` and verify zero errors. Run `npm run test:unit` and verify the test runner works.

**Acceptance Scenarios**:

1. **Given** a fresh clone, **When** `npm install && npm run dev` is executed, **Then** the dev server starts on port 3000 without errors
2. **Given** the project is running, **When** `npm run check` is executed, **Then** zero TypeScript errors are reported
3. **Given** the project is running, **When** `npm run test:unit` is executed, **Then** Vitest runs and reports results

---

### User Story 2 - Developer Uses the cn() Utility (Priority: P1)

A developer imports `cn` from `$lib/utils/cn` and uses it to merge Tailwind classes conditionally. The utility correctly resolves class conflicts (e.g., `cn("px-4", "px-2")` returns `"px-2"`).

**Why this priority**: Every UI component depends on this utility for class merging.

**Independent Test**: Unit test `cn()` with various class conflict scenarios and verify correct output.

**Acceptance Scenarios**:

1. **Given** the cn utility exists, **When** called with conflicting classes like `cn("px-4", "px-2")`, **Then** it returns `"px-2"` (last wins)
2. **Given** the cn utility exists, **When** called with conditional classes like `cn("base", false && "hidden", "flex")`, **Then** it returns `"base flex"`

---

### User Story 3 - Developer Uses Base UI Components (Priority: P2)

A developer imports components from `$lib/components/ui/` (Button, Input, Label, Card, Badge, Alert, Dialog, Select, DropdownMenu, Separator, Skeleton) and uses them to build pages. Each component renders correctly with Tailwind styles and supports standard variants/sizes.

**Why this priority**: All feature pages (auth, users, personas, NHI) need these building blocks.

**Independent Test**: Each component can be rendered in isolation with unit tests. Verify they accept expected props, render correct HTML structure, and apply Tailwind classes.

**Acceptance Scenarios**:

1. **Given** a Button component, **When** rendered with `variant="default"` and `size="default"`, **Then** it displays a styled button with correct Tailwind classes
2. **Given** an Input component, **When** rendered with `type="email"` and `placeholder="Email"`, **Then** it displays a styled input field
3. **Given** a Card component, **When** rendered with header, content, and footer snippets, **Then** it displays a structured card layout
4. **Given** a Dialog component, **When** triggered open, **Then** it renders an overlay with a centered dialog panel
5. **Given** a Skeleton component, **When** rendered, **Then** it displays an animated placeholder

---

### Edge Cases

- What happens when Tailwind v4 CSS import is malformed? Build fails with a clear error.
- What happens when a component receives no props? It renders with sensible defaults.
- What happens when `cn()` receives `undefined` or `null` values? It ignores them gracefully (clsx handles this).
- What happens when a developer imports a non-existent component from `$lib/components/ui/`? TypeScript reports a compile error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Project MUST initialize as a SvelteKit application with Svelte 5 runes mode enabled
- **FR-002**: Project MUST install and configure all required dependencies: bits-ui, tailwindcss v4, @tailwindcss/vite, sveltekit-superforms, zod, @tanstack/svelte-table, jose, clsx, tailwind-merge
- **FR-003**: Project MUST install and configure testing dependencies: vitest, @testing-library/svelte, jsdom
- **FR-004**: Vite config MUST include both the Tailwind CSS plugin and SvelteKit plugin
- **FR-005**: SvelteKit config MUST define path aliases: `$components`, `$api`, `$schemas`
- **FR-006**: App CSS MUST import Tailwind v4 and define design tokens via `@theme` (colors, border-radius, fonts)
- **FR-007**: A `cn()` utility MUST exist at `$lib/utils/cn` combining clsx and tailwind-merge
- **FR-008**: Base UI components MUST be implemented using Bits UI primitives: Button, Input, Label, Card, Badge, Alert, Dialog, Select, DropdownMenu, Separator, Skeleton
- **FR-009**: Each UI component MUST accept a `class` prop for custom styling via `cn()`
- **FR-010**: TypeScript MUST be configured in strict mode
- **FR-011**: Dev server MUST run on port 3000
- **FR-012**: Each component and utility MUST have co-located unit tests

### Key Entities

- **UI Component**: A reusable Svelte 5 component wrapping a Bits UI primitive with Tailwind styling, accepting variant/size props and a `class` override
- **Design Token**: A CSS custom property defined in `@theme` block (colors, spacing, radius) consumed by components
- **Utility Function**: A pure function (`cn`) used across all components for class merging

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Project starts in under 5 seconds with `npm run dev`
- **SC-002**: `npm run check` reports zero errors
- **SC-003**: All 11 base UI components render correctly in unit tests
- **SC-004**: `cn()` utility passes all class-merging test cases
- **SC-005**: `npm run test:unit` executes and all tests pass

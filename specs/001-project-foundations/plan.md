# Implementation Plan: Project Foundations

**Branch**: `001-project-foundations` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-project-foundations/spec.md`

## Summary

Initialize the xavyo-web SvelteKit project with Svelte 5 runes mode, install all required dependencies, configure build tooling (Tailwind CSS v4, Vite, TypeScript strict), create the `cn()` class-merging utility, and build 11 base UI components wrapping Bits UI primitives with Tailwind styling. This is the foundation for all subsequent features.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode)
**Primary Dependencies**: SvelteKit, Bits UI, Tailwind CSS v4 (@tailwindcss/vite), Superforms, Zod, TanStack Table (@tanstack/svelte-table), jose, clsx, tailwind-merge
**Storage**: N/A (no persistence in this feature)
**Testing**: Vitest + @testing-library/svelte + jsdom
**Target Platform**: Web (browser), Node.js server (SvelteKit SSR)
**Project Type**: Web application (SvelteKit — single project, no monorepo)
**Performance Goals**: Dev server starts in <5s, zero TypeScript errors
**Constraints**: Svelte 5 runes only (no legacy patterns), TypeScript strict mode
**Scale/Scope**: 11 UI components, 1 utility, project configuration files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | N/A | No auth/API in this feature |
| II. TDD | PASS | Unit tests planned for all components + cn() |
| III. Honest Reviews | PASS | Will review after implementation |
| IV. Svelte 5 Runes Only | PASS | All components use runes, no legacy |
| V. Minimal Complexity | PASS | One component per file, no abstractions |
| VI. Type Safety | PASS | TypeScript strict, typed props |
| VII. English Only | PASS | All code and UI text in English |

## Project Structure

### Documentation (this feature)

```text
specs/001-project-foundations/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── (N/A — no API contracts for this feature)
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app.html                        # HTML shell
├── app.css                         # Tailwind v4 import + @theme tokens
├── app.d.ts                        # App.Locals types (stub for now)
├── routes/
│   └── +page.svelte                # Default index page
├── lib/
│   ├── utils/
│   │   ├── cn.ts                   # clsx + tailwind-merge
│   │   └── cn.test.ts              # Unit tests for cn()
│   └── components/
│       └── ui/
│           ├── button/
│           │   ├── index.ts        # Re-export
│           │   ├── button.svelte   # Component
│           │   └── button.test.ts  # Unit test
│           ├── input/
│           │   ├── index.ts
│           │   ├── input.svelte
│           │   └── input.test.ts
│           ├── label/
│           │   ├── index.ts
│           │   ├── label.svelte
│           │   └── label.test.ts
│           ├── card/
│           │   ├── index.ts
│           │   ├── card.svelte
│           │   ├── card-header.svelte
│           │   ├── card-content.svelte
│           │   ├── card-footer.svelte
│           │   └── card.test.ts
│           ├── badge/
│           │   ├── index.ts
│           │   ├── badge.svelte
│           │   └── badge.test.ts
│           ├── alert/
│           │   ├── index.ts
│           │   ├── alert.svelte
│           │   ├── alert-description.svelte
│           │   └── alert.test.ts
│           ├── dialog/
│           │   ├── index.ts
│           │   ├── dialog.svelte (uses Bits UI Dialog)
│           │   └── dialog.test.ts
│           ├── select/
│           │   ├── index.ts
│           │   ├── select.svelte (uses Bits UI Select)
│           │   └── select.test.ts
│           ├── dropdown-menu/
│           │   ├── index.ts
│           │   ├── dropdown-menu.svelte (uses Bits UI DropdownMenu)
│           │   └── dropdown-menu.test.ts
│           ├── separator/
│           │   ├── index.ts
│           │   ├── separator.svelte (uses Bits UI Separator)
│           │   └── separator.test.ts
│           └── skeleton/
│               ├── index.ts
│               ├── skeleton.svelte
│               └── skeleton.test.ts
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Structure Decision**: Standard SvelteKit single-project structure. Components organized in `src/lib/components/ui/` with one directory per component containing the Svelte file, an index.ts barrel export, and a co-located test file.

## Complexity Tracking

> No violations — no entries needed.

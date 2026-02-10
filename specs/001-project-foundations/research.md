# Research: Project Foundations

## R1: Svelte 5 Runes + Bits UI Compatibility

**Decision**: Use Bits UI >=1.0 which is built for Svelte 5 runes
**Rationale**: Bits UI v1.x was rewritten for Svelte 5. It uses `$props()` and snippet-based composition. Older versions (0.x) use Svelte 4 patterns.
**Alternatives considered**: shadcn-svelte (also uses Bits UI under the hood, but adds its own abstraction layer — unnecessary complexity per Principle V)

## R2: Tailwind CSS v4 Configuration

**Decision**: Use `@tailwindcss/vite` plugin — no `tailwind.config.js` needed
**Rationale**: Tailwind v4 uses CSS-first configuration via `@theme` blocks in CSS. The Vite plugin replaces PostCSS-based setup. No config file needed.
**Alternatives considered**: PostCSS plugin (legacy approach, more boilerplate)

## R3: Component Structure Pattern

**Decision**: One directory per component with barrel index.ts, .svelte file, and .test.ts
**Rationale**: Co-located tests (Constitution II), easy imports via barrel exports, each component is self-contained. Follows shadcn-svelte convention which developers are familiar with.
**Alternatives considered**: Flat file structure (harder to manage with 11+ components), single index barrel (harder test isolation)

## R4: Testing Setup for Svelte 5

**Decision**: Vitest + @testing-library/svelte + jsdom + @sveltejs/vite-plugin-svelte
**Rationale**: @testing-library/svelte v5 supports Svelte 5 mount/render. Vitest integrates natively with Vite. jsdom provides DOM environment.
**Alternatives considered**: Playwright component testing (overkill for unit tests), happy-dom (less compatible with Bits UI portal rendering)

## R5: Design Tokens Strategy

**Decision**: Use Tailwind v4 `@theme` block with CSS custom properties for colors, radius, fonts
**Rationale**: Native Tailwind v4 approach. Tokens are consumed as standard utility classes. No runtime JS overhead.
**Alternatives considered**: CSS-in-JS (incompatible with Tailwind), separate CSS variables file (fragmented)

## R6: Path Aliases

**Decision**: Define `$components`, `$api`, `$schemas` in svelte.config.js `kit.alias`
**Rationale**: SvelteKit's built-in alias system. Works with both Vite and TypeScript. `$lib` is already built-in.
**Alternatives considered**: tsconfig paths only (doesn't work with Vite without extra config)

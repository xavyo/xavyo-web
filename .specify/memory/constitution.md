<!--
  Sync Impact Report
  Version change: 1.0.0 → 1.1.0 (added Principle VIII)
  Added sections: Principle VIII — Backend Fidelity
  Modified sections: none
  Removed sections: none
  Templates requiring updates: ✅ reviewed (no changes needed)
  Follow-up TODOs: none
-->

# xavyo-web Constitution

## Core Principles

### I. BFF Security (NON-NEGOTIABLE)

- JWT tokens MUST be stored in HttpOnly, Secure, SameSite=Strict cookies
- Tokens MUST NEVER appear in `$page.data`, client-side stores, or browser JS
- All API calls to xavyo-idp MUST go through SvelteKit server
  (`hooks.server.ts`, `+page.server.ts`, `src/routes/api/`)
- Client-side proxy endpoints (`src/routes/api/`) MUST validate
  the session cookie before forwarding requests
- No secrets, API keys, or tokens in client-accessible code

### II. Test-Driven Development (NON-NEGOTIABLE)

- TDD is mandatory: write tests FIRST, verify they FAIL, then implement
- Red-Green-Refactor cycle strictly enforced
- **Unit tests**: Every component, utility, schema, and API client
  function MUST have unit tests using Vitest + @testing-library/svelte
- **E2E tests**: Critical user flows (signup, login, onboarding, CRUD
  operations) MUST be validated using Chrome DevTools MCP for browser
  automation and visual verification
- Test files live alongside source: `*.test.ts` or `*.spec.ts`
- Zod schemas MUST have validation tests for valid and invalid inputs
- Superforms actions MUST have tests for success and error paths

### III. Honest Reviews (NON-NEGOTIABLE)

- After implementing any feature, an honest review MUST be performed
- The review MUST check:
  - Code compiles without errors (`npm run check`)
  - All unit tests pass (`npm run test:unit`)
  - No TypeScript errors in strict mode
  - No security violations (principle I)
  - Components render correctly (verified via Chrome DevTools MCP
    when applicable)
  - No hardcoded values that should be configurable
  - No dead code, unused imports, or TODO comments left behind
- If the review finds issues, they MUST be fixed immediately
- Reviews repeat until all issues are resolved — no exceptions
- A feature is NOT complete until its honest review passes clean

### IV. Svelte 5 Runes Only

- All reactive state MUST use Svelte 5 runes (`$state`, `$derived`,
  `$effect`, `$props`, `$bindable`)
- Legacy Svelte 4 patterns (`$:`, `export let`, stores with `$` prefix)
  are FORBIDDEN
- Components MUST use `<script lang="ts">` with runes mode
- Snippet-based slot replacement using `{#snippet}` and `{@render}`
  instead of `<slot>`

### V. Minimal Complexity

- YAGNI: implement only what the current feature requires
- No abstractions for single-use patterns — three similar lines are
  better than a premature abstraction
- No feature flags or backwards-compatibility shims
- Prefer flat file structures over deep nesting
- Components should do one thing well
- API client functions: one function per endpoint, no clever generics

### VI. Type Safety

- TypeScript strict mode (`"strict": true`) everywhere
- API types in `src/lib/api/types.ts` MUST mirror Rust DTOs exactly
- Zod schemas MUST match TypeScript types
- No `any` type — use `unknown` with proper narrowing when needed
- `app.d.ts` MUST type `App.Locals` (user, accessToken, tenantId)

### VII. English Only

- All code (variables, functions, types, comments) MUST be in English
- UI labels, user-facing text, and error messages MUST be in English
- No i18n framework — all strings inline in English

### VIII. Backend Fidelity (NON-NEGOTIABLE)

- The frontend MUST NEVER mock, stub, or fake backend features that
  do not exist in xavyo-idp
- Every API endpoint called from the web UI MUST exist and be
  functional in the backend — verify before implementing the frontend
- If a backend endpoint is buggy or returns unexpected data, fix the
  backend first (rebuild and redeploy via Docker) rather than working
  around it in the frontend
- E2E testing MUST use the real backend — never a mock server
- If a planned feature depends on a backend endpoint that does not
  exist yet, STOP and either implement it in xavyo-idp or remove
  the feature from the current scope

## Technology Stack

| Layer | Technology | Version/Notes |
|-------|-----------|---------------|
| Framework | SvelteKit | Svelte 5 with runes |
| Components | Bits UI | Headless components for Svelte 5 |
| Styling | Tailwind CSS v4 | Via `@tailwindcss/vite` plugin |
| Forms | Superforms + Zod | Server-side validation |
| Tables | TanStack Table | `@tanstack/svelte-table` |
| JWT | jose | Server-side only (decode/verify) |
| Utilities | clsx + tailwind-merge | Via `cn()` helper |
| Unit Testing | Vitest + @testing-library/svelte | TDD, co-located test files |
| E2E Testing | Chrome DevTools MCP | Browser automation for critical flows |
| Backend | xavyo-idp (Rust/Axum) | REST API on localhost:8080 |

## Development Workflow

1. **Specify**: Define what the feature does (user stories, requirements)
2. **Clarify**: Identify and resolve ambiguities
3. **Plan**: Design the technical approach
4. **Tasks**: Break down into implementable units
5. **Implement** (TDD cycle per task):
   a. Write failing test
   b. Implement minimum code to pass
   c. Refactor if needed
   d. Verify test passes
6. **Honest Review**: Mandatory post-implementation review (see Principle III)
7. **Fix**: Address all review findings, re-review until clean
8. **E2E Verify**: Run Chrome DevTools MCP to validate critical paths

## Governance

- This constitution supersedes all other development practices
- Every code change MUST comply with all principles
- Amendments require updating this file, incrementing the version,
  and documenting the change in the Sync Impact Report comment
- Versioning follows semver: MAJOR (principle removal/redefinition),
  MINOR (new principle/section), PATCH (clarification/typo)
- Use CLAUDE.md for runtime development guidance that supplements
  but does not contradict this constitution

**Version**: 1.1.0 | **Ratified**: 2026-02-10 | **Last Amended**: 2026-02-11

# Contributing to xavyo-web

Thanks for your interest in contributing to xavyo-web!

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A running [xavyo](https://github.com/xavyo/xavyo) backend (localhost:8080)

### Development Setup

```bash
# Clone
git clone https://github.com/xavyo/xavyo-web.git
cd xavyo-web

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start dev server
npm run dev
```

## How to Contribute

### 1. Find an Issue

- Browse [open issues](https://github.com/xavyo/xavyo-web/issues)
- Look for `good first issue` labels for easier tasks
- Comment on the issue to claim it

### 2. Create a Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Write Code

Follow these standards:

```bash
# Type-check
npm run check

# Run tests
npm test

# Lint
npm run lint
```

### 4. Commit

Use [Conventional Commits](https://conventionalcommits.org):

```
feat: add role selector to invitations
fix: resolve redirect loop on login
docs: update deployment guide
refactor: extract reusable badge component
test: add invitation form tests
chore: update dependencies
```

### 5. Open a Pull Request

- Fill out the PR template
- Link related issues
- Ensure CI passes

## Code Guidelines

### TypeScript / Svelte

- Svelte 5 runes mode (`$state`, `$derived`, `$effect`)
- Use `zod/v3` for schemas consumed by Superforms
- Follow existing patterns in `src/lib/components/`
- Use Bits UI primitives for accessible components

### BFF Pattern

All API calls go through the SvelteKit server (BFF), never directly from the browser:

```
Browser → SvelteKit server action / +page.server.ts → xavyo-idp API
```

Session tokens are stored in HttpOnly cookies and attached by server-side code.

### Testing

- Write tests for new functionality
- Tests live alongside source files (`*.test.ts`)
- Use `vitest` and `@testing-library/svelte`

## Pull Request Checklist

- [ ] Type-checks pass (`npm run check`)
- [ ] Tests pass (`npm test`)
- [ ] No lint errors (`npm run lint`)
- [ ] Conventional commit messages
- [ ] Related issue linked

## Questions?

- Open a [Discussion](https://github.com/xavyo/xavyo-web/discussions)
- Check existing issues and docs first

## License

By contributing, you agree that your contributions will be licensed under the BSL 1.1 license.

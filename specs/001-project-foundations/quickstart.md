# Quickstart: Project Foundations

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
git clone <repo-url> xavyo-web
cd xavyo-web
git checkout 001-project-foundations
npm install
```

## Run Dev Server

```bash
npm run dev
```

Server starts at http://localhost:3000

## Run Tests

```bash
# All unit tests
npm run test:unit

# Watch mode
npm run test:unit -- --watch

# Type check
npm run check
```

## Using Components

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
</script>

<Card>
  <CardHeader>Login</CardHeader>
  <CardContent>
    <Input type="email" placeholder="Email" />
    <Button variant="default">Sign In</Button>
  </CardContent>
</Card>
```

## Using cn() Utility

```ts
import { cn } from '$lib/utils/cn';

// Merge classes with conflict resolution
cn("px-4 py-2", "px-2") // → "py-2 px-2"

// Conditional classes
cn("base", isActive && "bg-primary", className)
```

## Validation Checklist

- [ ] `npm run dev` starts without errors on port 3000
- [ ] `npm run check` reports zero TypeScript errors
- [ ] `npm run test:unit` all tests pass
- [ ] Import a Button component and verify it renders
- [ ] Import cn() and verify class merging works

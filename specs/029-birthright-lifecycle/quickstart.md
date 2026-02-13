# Quickstart: Birthright Policies & Lifecycle Workflows

**Feature**: 029-birthright-lifecycle
**Date**: 2026-02-12

## Prerequisites

- Node.js 20+ and npm
- xavyo-idp backend running on localhost:8080 (Docker)
- Existing user with admin role
- At least one entitlement created in the governance module

## Dev Server

```bash
npm run dev
# Open http://localhost:5173
```

## Key Pages

| URL | Description |
|-----|-------------|
| /governance/birthright | Hub page with Policies and Lifecycle Events tabs |
| /governance/birthright/policies/create | Create a new birthright policy |
| /governance/birthright/policies/{id} | View policy detail (conditions, entitlements, simulate, impact) |
| /governance/birthright/policies/{id}/edit | Edit an existing policy |
| /governance/birthright/events/{id} | View lifecycle event detail (actions, snapshot) |

## New Files

### Types & Schemas
- `src/lib/api/types.ts` — Added ~20 birthright/lifecycle types
- `src/lib/schemas/birthright.ts` — Zod schemas (create/update policy, create event, simulate)

### API Clients
- `src/lib/api/birthright.ts` — 15 server-side API functions
- `src/lib/api/birthright-client.ts` — 15 client-side API functions

### BFF Proxies (11 files)
- `src/routes/api/governance/birthright-policies/+server.ts` — List + Create
- `src/routes/api/governance/birthright-policies/simulate/+server.ts` — Simulate all
- `src/routes/api/governance/birthright-policies/[id]/+server.ts` — Get + Update + Archive
- `src/routes/api/governance/birthright-policies/[id]/enable/+server.ts` — Enable
- `src/routes/api/governance/birthright-policies/[id]/disable/+server.ts` — Disable
- `src/routes/api/governance/birthright-policies/[id]/simulate/+server.ts` — Simulate single
- `src/routes/api/governance/birthright-policies/[id]/impact/+server.ts` — Impact analysis
- `src/routes/api/governance/lifecycle-events/+server.ts` — List + Create
- `src/routes/api/governance/lifecycle-events/trigger/+server.ts` — Trigger
- `src/routes/api/governance/lifecycle-events/[id]/+server.ts` — Get detail
- `src/routes/api/governance/lifecycle-events/[id]/process/+server.ts` — Process

### Components
- `src/lib/components/birthright/condition-builder.svelte` — Interactive condition row builder
- `src/lib/components/birthright/condition-row.svelte` — Single condition (attribute, operator, value)
- `src/lib/components/birthright/entitlement-picker.svelte` — Multi-select entitlement checkbox list
- `src/lib/components/birthright/simulation-panel.svelte` — JSON input + results display
- `src/lib/components/birthright/impact-panel.svelte` — Impact analysis results
- `src/lib/components/birthright/action-log.svelte` — Lifecycle action log table
- `src/lib/components/birthright/event-trigger-dialog.svelte` — Trigger lifecycle event form

### Pages
- `src/routes/(app)/governance/birthright/+page.svelte` — Hub page (2 tabs)
- `src/routes/(app)/governance/birthright/+page.server.ts` — Hub server load
- `src/routes/(app)/governance/birthright/policies/create/+page.svelte` — Create form
- `src/routes/(app)/governance/birthright/policies/create/+page.server.ts` — Create server
- `src/routes/(app)/governance/birthright/policies/[id]/+page.svelte` — Detail page
- `src/routes/(app)/governance/birthright/policies/[id]/+page.server.ts` — Detail server
- `src/routes/(app)/governance/birthright/policies/[id]/edit/+page.svelte` — Edit form
- `src/routes/(app)/governance/birthright/policies/[id]/edit/+page.server.ts` — Edit server
- `src/routes/(app)/governance/birthright/events/[id]/+page.svelte` — Event detail
- `src/routes/(app)/governance/birthright/events/[id]/+page.server.ts` — Event detail server

### Modified Files
- `src/routes/(app)/+layout.svelte` — Added "Birthright & JML" sidebar nav item

## Testing

```bash
# Run all tests
npm test

# Run only birthright tests
npx vitest run --reporter=verbose src/lib/components/birthright/ src/lib/api/birthright* src/lib/schemas/birthright* src/routes/\(app\)/governance/birthright/

# Type check
npx svelte-check --tsconfig ./tsconfig.json
```

## Test Workflow (E2E)

1. Log in as admin
2. Navigate to /governance/birthright
3. Create a policy with conditions (department equals Engineering) and select entitlements
4. Simulate the policy with sample JSON attributes
5. Run impact analysis
6. Navigate to Lifecycle Events tab
7. Trigger a joiner event for a user
8. Process the event
9. View event detail with action log
10. Toggle dark mode and verify rendering

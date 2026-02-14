# Quickstart: Governance Applications Management UI

## Prerequisites

- Node.js (for SvelteKit)
- xavyo-idp running on `localhost:8080` (Docker or local)
- Admin user account

## Implementation Order

1. **Types & API Client** (foundation)
   - Add `CreateApplicationRequest`, `UpdateApplicationRequest` to `src/lib/api/types.ts`
   - Add `getApplication()`, `updateApplication()`, `deleteApplication()` to `src/lib/api/governance.ts`
   - Fix `createApplication()` body type

2. **Zod Schemas** (foundation)
   - Add `createApplicationSchema`, `updateApplicationSchema` to `src/lib/schemas/governance.ts`

3. **BFF Proxy** (API layer)
   - Create `src/routes/api/governance/applications/[id]/+server.ts` (GET, PUT, DELETE)

4. **Sidebar Navigation** (visibility)
   - Add "Applications" entry to Governance section in `src/routes/(app)/+layout.svelte`

5. **List Page** (browse)
   - `src/routes/(app)/governance/applications/+page.server.ts`
   - `src/routes/(app)/governance/applications/+page.svelte`

6. **Create Page** (create)
   - `src/routes/(app)/governance/applications/create/+page.server.ts`
   - `src/routes/(app)/governance/applications/create/+page.svelte`

7. **Detail/Edit Page** (read/update/delete)
   - `src/routes/(app)/governance/applications/[id]/+page.server.ts`
   - `src/routes/(app)/governance/applications/[id]/+page.svelte`

## Verification

```bash
npm run check       # TypeScript compilation
npm run test:unit   # Unit tests
```

Then manually test:
1. Navigate to `/governance/applications` from sidebar
2. Create an application
3. Edit the application
4. Delete an application (with/without entitlements)

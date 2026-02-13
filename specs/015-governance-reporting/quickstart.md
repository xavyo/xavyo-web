# Quickstart: Governance Reporting & Analytics

## Prerequisites

- Node.js 18+, npm
- xavyo-idp backend running on localhost:8080 (with governance reporting tables seeded)
- Dev server: `npm run dev` at localhost:5173
- Admin user account (admin or super_admin role)

## Development Commands

```bash
# Run all tests
npm run test:unit

# Run only reporting tests
npx vitest --reporter=verbose src/lib/api/governance-reporting
npx vitest --reporter=verbose src/lib/schemas/governance-reporting
npx vitest --reporter=verbose src/lib/components/governance/
npx vitest --reporter=verbose src/routes/\(app\)/governance/reports/

# Type check
npm run check

# Dev server
npm run dev
```

## Key Files

| Purpose | Path |
|---------|------|
| Types | `src/lib/api/types.ts` (ReportTemplate, GeneratedReport, ReportSchedule) |
| Server API client | `src/lib/api/governance-reporting.ts` |
| Client API | `src/lib/api/governance-reporting-client.ts` |
| Zod schemas | `src/lib/schemas/governance-reporting.ts` |
| Hub page | `src/routes/(app)/governance/reports/+page.svelte` |
| BFF proxies | `src/routes/api/governance/reports/` |
| Components | `src/lib/components/governance/` |

## Architecture

```
Browser → /api/governance/reports/* (SvelteKit BFF) → /governance/reports/* (xavyo-idp)
```

- Server-side: `+page.server.ts` calls `governance-reporting.ts` API client
- Client-side: Components call `governance-reporting-client.ts` which hits `/api/` BFF endpoints
- BFF proxy endpoints validate auth cookies, forward to backend, return JSON

## Testing Strategy

1. **Schema tests**: Valid/invalid inputs for all Zod schemas
2. **API client tests**: Mock fetch, verify correct URL/method/body
3. **Component tests**: Render with props, verify display/interactions
4. **Page tests**: Server load (admin guard, data loading), form actions
5. **E2E**: Chrome DevTools MCP for full user flows

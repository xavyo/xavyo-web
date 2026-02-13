# Quickstart: Bulk User Import & SCIM Administration

## Prerequisites

- Node.js 20+, npm
- xavyo-idp backend running on localhost:8080
- Admin user account with `admin` or `super_admin` role

## Development

```bash
# Start dev server
npm run dev

# Run all tests
npx vitest run

# Run only import/SCIM tests
npx vitest run --reporter=verbose imports scim invite

# Type check
npm run check
```

## Feature Overview

### Bulk Import (Settings > Imports)

1. Navigate to `/settings/imports`
2. Click "New Import" → select CSV file → optionally toggle "Send invitations" → Submit
3. Job appears in list with status badge
4. Click job to see detail with error breakdown
5. Download error CSV or resend invitations from detail page

### SCIM Administration (Settings > SCIM)

1. Navigate to `/settings/scim`
2. **Tokens tab**: Create token → copy raw token (shown once) → manage existing tokens
3. **Mappings tab**: View/edit attribute mappings → change transform/required → Save

### Invitation Acceptance (Public)

1. Imported user receives email with link to `/invite/:token`
2. Page validates token, shows email
3. User sets password → account activated → redirected to login

## File Layout

| Path | Purpose |
|------|---------|
| `src/lib/api/imports.ts` | Server-side import API client |
| `src/lib/api/imports-client.ts` | Client-side import API |
| `src/lib/api/scim.ts` | Server-side SCIM API client |
| `src/lib/api/scim-client.ts` | Client-side SCIM API |
| `src/lib/schemas/imports.ts` | Import Zod schemas |
| `src/lib/schemas/scim.ts` | SCIM Zod schemas |
| `src/routes/(app)/settings/imports/` | Import list + upload page |
| `src/routes/(app)/settings/imports/[id]/` | Import job detail page |
| `src/routes/(app)/settings/scim/` | SCIM admin (tokens + mappings) |
| `src/routes/(auth)/invite/[token]/` | Public invitation acceptance |
| `src/routes/api/admin/imports/` | Import BFF proxies |
| `src/routes/api/admin/scim/` | SCIM BFF proxies |

## Testing Strategy

- **Schema tests**: Valid/invalid inputs for all Zod schemas
- **API client tests**: Mock fetch, verify request/response mapping
- **Page server tests**: Load + actions with mock API calls
- **Component tests**: Rendering, user interactions, error states
- **E2E tests**: Full flows via Chrome DevTools MCP against real backend

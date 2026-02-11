# Data Model: Onboarding + App Shell

**Feature**: 003-onboarding-app-shell
**Created**: 2026-02-10

## New TypeScript Types

### Onboarding Schema (Zod — zod/v3)

```typescript
// src/lib/schemas/onboarding.ts
import { z } from 'zod/v3';

export const onboardingSchema = z.object({
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be 100 characters or less')
    .regex(
      /^[a-zA-Z0-9 \-_]+$/,
      'Only letters, numbers, spaces, hyphens, and underscores are allowed'
    )
});

export type OnboardingSchema = typeof onboardingSchema;
```

**Validation rules** (mirror Rust `ProvisionTenantRequest::validate()`):
- Required (non-empty after trim)
- Max 100 characters
- Allowed characters: alphanumeric, spaces, hyphens, underscores

### Toast Type

```typescript
// src/lib/stores/toast.svelte.ts
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration: number; // ms, 0 = manual dismiss
}
```

**Fields**:
- `id`: Unique identifier (crypto.randomUUID() or counter)
- `type`: Determines styling and auto-dismiss behavior
- `message`: Display text
- `duration`: Auto-dismiss timeout in ms. Default: 5000 for success/info, 0 for error (manual dismiss)

### Navigation Item Type

```typescript
// src/lib/components/layout/sidebar.svelte (inline)
interface NavItem {
  label: string;
  href: string;
  icon: string; // Lucide icon name or SVG snippet
}
```

**Static items**:
| Label | Href | Icon |
|-------|------|------|
| Dashboard | /dashboard | LayoutDashboard |
| Users | /users | Users |
| Personas | /personas | UserCircle |
| NHI | /nhi | Bot |

## Existing Types (from Feature 002, no changes needed)

### ProvisionTenantRequest / Response

Already defined in `src/lib/api/types.ts`:
- `ProvisionTenantRequest`: `{ organization_name: string }`
- `ProvisionTenantResponse`: `{ tenant: TenantInfo, admin: AdminInfo, oauth_client: OAuthClientInfo, endpoints: EndpointInfo, next_steps: string[] }`

### API Tenant Function

Already defined in `src/lib/api/tenants.ts`:
- `provisionTenant(organizationName, accessToken, fetchFn)` → `ProvisionTenantResponse`

### App.Locals

Already defined in `src/app.d.ts`:
- `user?: { id, email, roles }`
- `accessToken?: string`
- `tenantId?: string`

## Relationships

```
User (from JWT claims)
  └── submits → OnboardingForm (organizationName)
       └── calls → provisionTenant()
            └── returns → ProvisionTenantResponse
                 ├── tenant.id → set as tenant_id cookie
                 └── credentials → displayed once on confirmation page

User (authenticated)
  └── sees → AppShell
       ├── Sidebar (NavItem[])
       ├── Header (user.email, logout link)
       └── ToastContainer (Toast[])
```

# Research: Tenant Administration & Self-Service Dashboards

## Decision 1: Branding Settings Location

**Decision**: Place branding under `/settings/branding` as an admin-only tab within the existing Settings page.
**Rationale**: The Settings page already has multiple tabs (Profile, Security, Social Connections). Adding a "Branding" tab for admins follows the existing pattern and avoids creating a new top-level route.
**Alternatives considered**: Separate `/admin/branding` route — rejected because Settings already serves as the admin configuration hub.

## Decision 2: OAuth Client Management Location

**Decision**: Place OAuth clients under `/settings/oauth-clients` as admin-only with its own list/create/detail route structure.
**Rationale**: OAuth clients are a tenant configuration concern. Placing them under settings keeps all admin config in one area. The sub-route pattern (list → create → [id] detail) matches existing patterns like users, connectors, etc.
**Alternatives considered**: Under `/admin/oauth-clients` — rejected because no `/admin/` route group exists in the frontend.

## Decision 3: Group Member Addition UX

**Decision**: Use an inline user search/select component on the group detail page to add members. No separate "Add Member" page.
**Rationale**: Adding members is a quick action — a full page form would be overkill. An inline search (type user email/name → select → add) is more efficient.
**Alternatives considered**: Separate "Add Members" page — rejected as too heavy for single member addition.

## Decision 4: My Approvals vs Existing Access Requests

**Decision**: "My Approvals" is a separate route at `/my-approvals`, distinct from the existing admin-level `/governance/access-requests/` page.
**Rationale**: The existing access-requests page shows ALL requests for admin review. "My Approvals" shows only requests assigned to the current user as an approver — different scope, different audience.
**Alternatives considered**: Adding a filter to the existing access-requests page — rejected because the audience is different (admin vs. individual approver).

## Decision 5: Backend Endpoint Verification

**Decision**: All five feature areas have confirmed backend endpoints (verified via curl against xavyo-idp on localhost:8080):
- `GET /admin/branding` → 200 (full branding config response)
- `GET /admin/oauth/clients` → 200 (client list with `{clients, total}`)
- `GET /admin/groups` → 200 (group list with `{groups, pagination}`)
- `GET /governance/my-approvals` → 200 (approval items with `{items, total, limit, offset}`)
- `GET /governance/my-certifications` → 200 (cert items with `{items, total, page, page_size}`)

**Rationale**: Constitution VIII (Backend Fidelity) requires verification before frontend implementation.
**No issues found**: All endpoints return structured responses as expected.

## Decision 6: Pagination Formats

**Decision**: Handle two pagination formats:
- Admin groups: `{groups: [], pagination: {limit, offset, has_more}}` — different from standard pattern
- OAuth clients: `{clients: [], total}` — flat total, no offset/limit
- My Approvals: `{items, total, limit, offset}` — standard governance pattern
- My Certifications: `{items, total, page, page_size}` — page-based, differs slightly

**Rationale**: Backend APIs have inconsistent pagination formats across modules (this is documented in project memory). Frontend must adapt to each format.
**Alternatives considered**: N/A — must match backend response shapes.

## Decision 7: Client Secret Display Pattern

**Decision**: After creating an OAuth client, show the client_secret in a one-time display dialog with a copy button. Pattern matches existing credential display in NHI management (credential-section with "copy to clipboard" and warning about one-time visibility).
**Rationale**: Reusing the established pattern from NHI credential management ensures consistency.
**Alternatives considered**: Inline display on list page — rejected for security (secret should be prominently displayed with clear "copy now" UX).

# Research: Approval Workflow Configuration

## R1: Workflow Step Management UX Pattern

**Decision**: Steps are managed inline on the workflow detail page using a dynamic list with add/remove buttons, not a separate step editor page.

**Rationale**: This matches the existing pattern used for escalation levels in policies (add levels inline on detail page) and is the standard UX for ordered-list management in admin panels. A separate page per step would be over-engineered for what is typically 2-5 steps.

**Alternatives considered**:
- Separate step creation page: Rejected — too many clicks for a simple ordered list
- Multi-step wizard during workflow creation: Rejected — over-engineered; better to create workflow first, then add steps on detail page

## R2: Group Member Selection Pattern

**Decision**: Use a text input for user ID with client-side search/autocomplete against the existing users list endpoint (`/api/users`). Members are added one at a time via a POST to the members endpoint.

**Rationale**: The existing user management pages already have a users list API. Reusing it for member selection avoids new components. The backend's `POST /governance/approval-groups/{id}/members` expects individual member additions.

**Alternatives considered**:
- Multi-select dropdown: Rejected — doesn't scale for large user lists
- Bulk CSV import: Rejected — YAGNI for current scope

## R3: Backend API Shape Verification

**Decision**: All endpoints confirmed to exist in the running xavyo-idp container. Key observations:
- `GET /governance/approval-workflows` returns `{items, total, limit, offset}` (standard governance pagination)
- `POST /governance/approval-workflows/{id}/set-default` is a simple POST with no body
- `POST /governance/approval-groups/{id}/members` expects `{user_id, role}` body
- `POST /governance/escalation-policies/{policy_id}/levels` expects `{target_group_id, timeout_hours, action}` body
- `POST /governance/sod-exemptions` expects `{rule_id, user_id, justification, expires_at}` body
- `GET /governance/access-requests/{id}/escalation-history` returns `{events: EscalationEvent[]}`

**Rationale**: Backend fidelity principle (VIII) requires verification before implementation.

## R4: SoD Exemptions Integration Point

**Decision**: SoD exemptions will be added as a new tab in a standalone "Exemptions" section accessible from the SoD rule detail page, not embedded in the main governance hub.

**Rationale**: Exemptions are tightly coupled to SoD rules. Adding them as a link/tab from the SoD section makes navigation intuitive. The governance hub already has many tabs; adding more would dilute the UX.

**Alternatives considered**:
- New tab in governance hub: Rejected — governance hub already has 5 tabs (Entitlements, Access Requests, SoD, Certifications, Risk)
- Separate top-level page: Rejected — exemptions are too tightly coupled to SoD to warrant their own section

## R5: Existing Patterns to Follow

**Decision**: Follow the governance reporting pattern (Phase 015) for the hub page with tabs, and the SoD rule pattern (Phase 012) for detail pages with actions.

Key patterns:
- Hub page: Client-side tab switching with async data loading per tab (see `/governance/reports/+page.svelte`)
- Detail pages: Server-loaded data with Superforms for edit, `enhance` from `$app/forms` for simple actions (see schedule detail page)
- BFF proxies: Standard GET/POST/PUT/DELETE handlers extracting cookies and forwarding to backend (see `/api/governance/reports/`)
- Schemas: `zod/v3` with `z.preprocess` for optional number fields

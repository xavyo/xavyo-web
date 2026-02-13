# Research: Power of Attorney & Identity Delegation

**Date**: 2026-02-12
**Status**: Complete — no unknowns requiring research

## Summary

All technical decisions for this feature are predetermined by the existing project architecture (SvelteKit BFF pattern) and the fully-implemented backend API (11 endpoints in xavyo-idp). No NEEDS CLARIFICATION items were identified during planning.

## Decisions

### 1. Identity Assumption Token Management

**Decision**: Store the assumed identity's access_token in the same HttpOnly cookie mechanism used for regular authentication. Preserve the original token for restoration on drop.

**Rationale**: The backend's `/assume` endpoint returns a new `access_token` JWT that represents the assumed identity. The frontend must swap the cookie value and restore the original on `/drop`. This follows the existing BFF security pattern (Constitution Principle I).

**Alternatives Considered**:
- Store assumed token in a separate cookie → rejected (increases cookie complexity, both tokens would be sent on every request)
- Store original token in localStorage for restoration → rejected (violates BFF security principle — no tokens in client-accessible storage)

### 2. Global Assumed Identity State

**Decision**: Check assumed identity status on every authenticated page load via the app layout's server load function, using the `/current-assumption` endpoint.

**Rationale**: The assumed-identity indicator must be visible on all pages (FR-010). Checking on each page load ensures the indicator is always current, even after page refreshes. The `/current-assumption` endpoint is lightweight (simple JWT inspection).

**Alternatives Considered**:
- Client-side polling → rejected (unnecessary complexity, page loads already trigger checks)
- Store assumption state in a cookie/header → rejected (duplicates backend state, risks staleness)

### 3. Hub Page Tab Structure

**Decision**: 2-tab layout matching existing governance patterns — "My PoA" tab (with sub-tabs or direction toggle for incoming/outgoing) and "Admin" tab (admin-only, shows all org-wide grants).

**Rationale**: Follows the established governance hub pattern (entitlements, certifications, SoD all use tabbed layouts). Admin tab visibility controlled by role check, consistent with other admin-only features.

**Alternatives Considered**:
- Separate pages for user vs admin views → rejected (fragments the experience; tab pattern is established)
- Single flat list with role column → rejected (mixes personal and org-wide views, less usable)

### 4. Scope Selection UX

**Decision**: Use multi-select dropdowns for application_ids and workflow_types in the grant form. Application list loaded from governance applications endpoint. Workflow types from a predefined list.

**Rationale**: The backend accepts `PoaScopeRequest { application_ids: string[], workflow_types: string[] }`. Multi-select is the simplest UX for selecting multiple items from a list.

**Alternatives Considered**:
- Checkbox grid → rejected (doesn't scale well with many applications)
- Free-text entry → rejected (error-prone, bad UX)

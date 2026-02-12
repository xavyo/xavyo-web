# Research: License Management

**Feature**: 027-license-management
**Date**: 2026-02-12

## Summary

No NEEDS CLARIFICATION items existed in the technical context. The backend API is fully implemented and documented. This research consolidates the key decisions and patterns.

## Decision 1: Hub Page Layout

**Decision**: 7-tab hub layout (Pools, Assignments, Analytics, Reclamation Rules, Incompatibilities, Entitlement Links, Compliance)

**Rationale**: Matches existing patterns (Governance hub with 5 tabs, Federation hub with 4 tabs, NHI Governance hub with 5 tabs). Tabs provide easy navigation between related feature areas. Pools and Assignments are the most-used tabs (P1/P2) so they come first.

**Alternatives considered**:
- Separate pages without hub: Rejected — fragments the experience, requires more sidebar entries
- Nested sidebar nav: Rejected — clutters sidebar for a single governance sub-feature

## Decision 2: BFF Proxy Structure

**Decision**: BFF proxies at `src/routes/api/governance/licenses/` mapping to backend `/governance/license-*` endpoints

**Rationale**: Follows established BFF pattern (Constitution Principle I). All proxies validate session cookie, extract access token from HttpOnly cookie, and forward with proper authorization headers. Consistent with existing proxies at `src/routes/api/governance/`.

**Alternatives considered**:
- Direct client-to-backend calls: FORBIDDEN by Constitution Principle I
- Single proxy endpoint with action routing: Rejected — more complex, harder to test

## Decision 3: Analytics Data Loading

**Decision**: Analytics tab uses client-side fetches via `licenses-client.ts` (lazy-loaded on tab selection)

**Rationale**: Analytics involves 3 separate API calls (dashboard, recommendations, expiring). Loading all on initial hub page load would slow down the most common use case (viewing pools). Lazy-loading on tab switch provides better UX. This matches the pattern used in NHI Governance hub.

**Alternatives considered**:
- Server-side load all data on page load: Rejected — unnecessary data transfer for non-analytics tabs
- iframe/embedded dashboard: Rejected — breaks consistency, adds complexity

## Decision 4: Bulk Operations UI

**Decision**: Dedicated bulk operations page (`/governance/licenses/assignments/bulk/`) with textarea for user IDs and assignment ID selection

**Rationale**: Bulk operations (up to 1000 items) need a dedicated interface with clear input areas and result display. A modal would be too constrained for reviewing 1000-item results.

**Alternatives considered**:
- Modal dialog: Rejected — too small for reviewing bulk results
- Inline on assignments list: Rejected — clutters the main list view

## Decision 5: Backend Endpoint Paths

**Decision**: Backend uses `/governance/license-pools`, `/governance/license-assignments`, `/governance/license-reclamation-rules`, `/governance/license-incompatibilities`, `/governance/license-entitlement-links`, `/governance/license-analytics/*`, `/governance/license-reports/*`

**Rationale**: Verified directly from backend source code. All endpoints require bearer token + tenant ID header. Pagination format is `{items, total, limit, offset}` (consistent with all governance endpoints).

## Decision 6: Pool Detail Page Structure

**Decision**: Pool detail page shows pool info, utilization metrics, and has sub-sections for assignments, reclamation rules, entitlement links, and incompatibilities related to that specific pool

**Rationale**: Admins frequently need to see all related data for a single pool. The detail page can filter assignments/rules/links by pool ID. This is more useful than forcing navigation back to global tabs.

**Alternatives considered**:
- Detail page shows only pool info: Rejected — requires too much navigation
- Full tab set on detail page: Rejected — over-engineering for a detail view; simple sections suffice

## Key Backend API Details

### Enums

| Enum | Values | Default |
|------|--------|---------|
| LicenseType | `Named`, `Concurrent` | `Named` |
| LicenseBillingPeriod | `Monthly`, `Annual`, `Perpetual` | — |
| LicenseExpirationPolicy | `BlockNew`, `RevokeAll`, `WarnOnly` | `BlockNew` |
| LicensePoolStatus | `Active`, `Expired`, `Archived` | `Active` |
| LicenseAssignmentStatus | `Active`, `Reclaimed`, `Expired`, `Released` | `Active` |
| LicenseAssignmentSource | `Manual`, `Automatic`, `Entitlement` | `Manual` |
| LicenseReclamationTrigger | `Inactivity`, `LifecycleState` | — |
| RecommendationType | `Underutilized`, `HighUtilization`, `ExpiringSoon`, `ReclaimOpportunity` | — |

### Pagination Format

All list endpoints: `{items: T[], total: number, limit: number, offset: number}`
Default limit: 20 (max 100), default offset: 0

### Key Constraints

- Pool name unique per tenant
- Pool-entitlement link unique per tenant
- Incompatibilities are bidirectional (symmetric unique index)
- One active assignment per user per pool
- Allocated count cannot exceed total capacity (atomic increment)
- Bulk operations: 1-1000 items max
- Reclamation rules: Inactivity requires `threshold_days`, LifecycleState requires `lifecycle_state`

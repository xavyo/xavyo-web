# Research: Governance Core

## Decision 1: Entitlement Data Classification

**Decision**: Use backend's GDPR-based classification (`none`, `personal`, `sensitive`, `special_category`) instead of the spec's generic classification (`public`, `internal`, `confidential`, `restricted`).

**Rationale**: The backend already implements GDPR-compliant data protection classification with legal basis tracking. The frontend must match the backend DTOs exactly (Constitution Principle VI: Type Safety, Principle VIII: Backend Fidelity).

**Alternatives considered**: Generic classification labels — rejected because the backend doesn't support them.

## Decision 2: Risk Level Source

**Decision**: Use backend's numeric risk scoring (0-100) with level mapping: low (0-25), medium (26-50), high (51-75), critical (76-100). Risk is calculated server-side with factor breakdown.

**Rationale**: The backend has a comprehensive risk scoring system with static/dynamic factors, peer comparison, and enforcement policies. The frontend only displays computed results.

**Alternatives considered**: Client-side risk calculation — rejected per Backend Fidelity principle.

## Decision 3: Access Request Workflow

**Decision**: Frontend shows single-level approve/reject for admins via `/governance/access-requests/{id}/approve` and `/governance/access-requests/{id}/reject`. Multi-level workflow configuration is available but managed through approval workflow endpoints (out of scope for initial UI).

**Rationale**: The backend supports multi-step approval workflows, but the core user flow is approve/reject. Approval workflow CRUD is advanced configuration that can be added later.

**Alternatives considered**: Full workflow builder UI — rejected as too complex for initial phase.

## Decision 4: Governance Base Path

**Decision**: Backend uses `/governance/` as the base path (not `/admin/governance/`). Admin role enforcement is handled at the handler level via JWT claims, not via URL prefix.

**Rationale**: Confirmed from backend router configuration. The BFF layer adds JWT auth + tenant context, and the backend validates admin role from claims.

**Alternatives considered**: None — must match backend routing.

## Decision 5: SoD Violation Handling

**Decision**: Frontend displays SoD violations read-only with option to view details. Remediation actions (removing conflicting entitlements) shown but handled server-side. SoD exemptions management deferred to a future phase.

**Rationale**: Violations and exemptions are distinct features. Core SoD value is detection and visibility. Exemption management adds complexity without being required for initial compliance visibility.

**Alternatives considered**: Full exemption management UI — deferred for simplicity.

## Decision 6: Certification Campaign Scope

**Decision**: Campaign creation form supports all four scope types: `all_users`, `department`, `application`, `entitlement`. The form dynamically shows relevant scope configuration fields based on selected type. Reviewer type selection includes all four options.

**Rationale**: The backend supports rich campaign scoping and the form can adapt with conditional rendering.

**Alternatives considered**: Simplified "all users only" scope — rejected because it limits usefulness.

## Decision 7: Risk Dashboard Data Sources

**Decision**: Use three backend endpoints for the dashboard:
- `GET /governance/risk-scores/summary` — tenant-wide risk summary
- `GET /governance/risk-scores?sort_by=total_score&limit=10` — top-risk users
- `GET /governance/risk-alerts/summary` — alert counts

**Rationale**: These endpoints provide all the data needed for the dashboard overview. Individual user risk details link to user-specific risk score pages.

**Alternatives considered**: Custom dashboard endpoint — not needed, existing endpoints suffice.

## Decision 8: Entitlement Owner Management

**Decision**: Include entitlement owner assignment (SET/REMOVE owner) in the entitlement detail page. Owner is a user reference selected from existing users.

**Rationale**: Backend supports `PUT /governance/entitlements/{id}/owner` and `DELETE /governance/entitlements/{id}/owner`. Owners are important for certification campaigns that use `entitlement_owner` reviewer type.

**Alternatives considered**: Skip owner management — rejected because it's integral to governance workflows.

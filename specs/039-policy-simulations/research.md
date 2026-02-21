# Research: Policy Simulations & What-If Analysis

**Feature**: 039-policy-simulations
**Date**: 2026-02-12

## Backend API Verification

### Decision: All 29 endpoints confirmed in xavyo-idp governance router
- **Rationale**: Cross-referenced `crates/xavyo-api-governance/src/router.rs` with handler files in `handlers/`. All policy simulation (12), batch simulation (12), and comparison (5) endpoints are implemented.
- **Alternatives considered**: None — backend already exists.

### Decision: Use existing BFF proxy pattern
- **Rationale**: All previous governance features (entitlements, SoD, certifications, reports, roles, meta-roles) use the same `src/routes/api/governance/` BFF proxy pattern. Consistency is more valuable than novelty.
- **Alternatives considered**: Direct client-side API calls (rejected — violates Constitution Principle I).

## Frontend Architecture

### Decision: 3-tab simulation hub at `/governance/simulations`
- **Rationale**: Policy simulations, batch simulations, and comparisons are three distinct domains that share a conceptual parent ("simulations"). A tab layout matches the pattern used in NHI Governance (5 tabs), Federation (4 tabs), and Governance Reports (3 tabs).
- **Alternatives considered**: Separate sidebar entries for each (rejected — clutters navigation). Single merged list (rejected — types are too different to combine).

### Decision: Server-side loading for lists, client-side for actions
- **Rationale**: Hub page loads policy + batch lists via `+page.server.ts` for SSR. Lifecycle actions (execute, archive, apply) and comparison list use client-side fetches to avoid full page reloads. Matches pattern in NHI Governance hub.
- **Alternatives considered**: Full SSR for everything (rejected — poor UX for actions that should feel instant).

### Decision: Reusable impact summary component for both policy and batch
- **Rationale**: Both `ImpactSummary` (policy) and `BatchImpactSummary` (batch) have similar structures (total users, affected users, severity/type breakdowns). A single `impact-summary-cards.svelte` component can handle both with conditional rendering.
- **Alternatives considered**: Separate components (rejected — too much duplication for minimal differences).

### Decision: Export via download link pattern
- **Rationale**: Backend export endpoints return file content directly. Frontend triggers download by navigating to the BFF proxy URL with `?format=csv` or `?format=json`. No need for client-side file generation.
- **Alternatives considered**: Client-side CSV generation from loaded results (rejected — backend already provides this; duplicating logic is wasteful).

## Type Mapping

### Decision: TypeScript types mirror Rust DTOs exactly
- **Rationale**: Constitution Principle VI requires types in `types.ts` to match backend DTOs. Used `serde` field names from Rust handler files for exact mapping.
- **Key mappings**:
  - `PolicySimulationType`: `sod_rule` | `birthright_policy` (snake_case enums)
  - `BatchSimulationType`: `role_add` | `role_remove` | `entitlement_add` | `entitlement_remove`
  - `SimulationStatus`: `draft` | `executed` | `applied` | `cancelled`
  - `ImpactType`: `violation` | `entitlement_gain` | `entitlement_loss` | `no_change` | `warning`
  - `Severity`: `critical` | `high` | `medium` | `low`
  - `ComparisonType`: `simulation_vs_simulation` | `simulation_vs_current`
  - `SelectionMode`: `user_list` | `filter`

## Filter Criteria Builder

### Decision: Simple form-based builder (not a visual query builder)
- **Rationale**: Filter criteria has a fixed, small set of fields (department, status, role_ids, entitlement_ids, title, metadata). A simple form with text inputs and multi-selects is sufficient and matches YAGNI principle.
- **Alternatives considered**: Visual drag-and-drop query builder (rejected — over-engineered for 6 fixed fields). JSON editor (rejected — poor UX for non-technical admins).

## Batch Apply Safety

### Decision: Two-step confirmation dialog
- **Rationale**: SC-005 requires "at minimum 2 explicit confirmations." Implementation: (1) Click "Apply to Production" opens dialog, (2) Dialog requires entering justification text AND checking a scope acknowledgment checkbox before the "Confirm Apply" button enables.
- **Alternatives considered**: Three-step wizard (rejected — overkill for a single action). Single confirmation (rejected — doesn't meet SC-005).

## Staleness Detection

### Decision: Display stale indicator on detail page, not in list
- **Rationale**: Staleness check requires a per-simulation API call (`GET .../staleness`). Checking every simulation in a list would be N+1 calls. Instead, check on detail page load and display a banner if stale.
- **Alternatives considered**: Background polling (rejected — unnecessary complexity). List-level staleness column (rejected — N+1 performance issue).

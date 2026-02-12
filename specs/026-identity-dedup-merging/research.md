# Research: Identity Deduplication & Merging

## Backend API Verification

**Decision**: All 14 backend endpoints verified to exist in xavyo-idp (F062 identity_merge module).
**Rationale**: Deep-dive analysis of `/crates/xavyo-api-governance/src/handlers/identity_merge.rs` and `/crates/xavyo-api-governance/src/router.rs` confirms all routes are registered and functional.
**Alternatives considered**: None — backend is the source of truth per Constitution VIII.

### Verified Endpoints

| Endpoint | Method | Handler | Verified |
|----------|--------|---------|----------|
| `/governance/duplicates` | GET | list_duplicates | Yes |
| `/governance/duplicates/{id}` | GET | get_duplicate | Yes |
| `/governance/duplicates/{id}/dismiss` | POST | dismiss_duplicate | Yes |
| `/governance/duplicates/detect` | POST | detect_duplicates | Yes |
| `/governance/merges` | GET | list_merge_operations | Yes |
| `/governance/merges/preview` | POST | preview_merge | Yes |
| `/governance/merges/execute` | POST | execute_merge | Yes |
| `/governance/merges/{id}` | GET | get_merge_operation | Yes |
| `/governance/merges/batch` | POST | execute_batch_merge | Yes |
| `/governance/merges/batch/preview` | POST | preview_batch_merge | Yes |
| `/governance/merges/batch/{job_id}` | GET | get_batch_job | Yes |
| `/governance/merges/audit` | GET | list_merge_audits | Yes |
| `/governance/merges/audit/{id}` | GET | get_merge_audit | Yes |

## Pagination Pattern

**Decision**: Use `{items, total, limit, offset}` format with default limit 50, max 100.
**Rationale**: Consistent with all other governance endpoints (entitlements, SoD, certifications, reports, etc.).
**Alternatives considered**: Cursor-based pagination — rejected for consistency with existing patterns.

## Entitlement Strategy

**Decision**: Support three strategies: `union`, `intersection`, `manual`.
**Rationale**: Backend `GovEntitlementStrategy` enum has exactly these three values. Union keeps all, intersection keeps common, manual allows per-entitlement selection.
**Alternatives considered**: None — matches backend exactly.

## Attribute Resolution for Batch

**Decision**: Support three rules: `newest_wins`, `oldest_wins`, `prefer_non_null`.
**Rationale**: Backend `AttributeResolutionRule` enum has exactly these values. For batch operations, per-attribute manual selection is impractical, so these automated rules provide sensible defaults.
**Alternatives considered**: None — matches backend exactly.

## Batch Merge Execution Model

**Decision**: Synchronous execution — batch merge API returns results immediately.
**Rationale**: Backend handler executes all merges in a loop and returns the aggregated result. No persistent job queue or async processing.
**Alternatives considered**: Polling-based async — rejected because backend doesn't support it (GET batch/{job_id} always returns 404).

## SoD Violation Handling

**Decision**: Display violations in merge preview. Require override reason for single merges. For batch, provide "skip SoD violations" toggle.
**Rationale**: Backend `MergeSodCheckResponse` includes `has_violations`, `can_override`, and violation details. Backend `MergeExecuteRequest` accepts `sod_override_reason`. Batch request has `skip_sod_violations: bool`.
**Alternatives considered**: Block all merges with SoD violations — rejected because backend explicitly supports overrides with audit trail.

## Confidence Score Visualization

**Decision**: Color-coded badge with three tiers: Low (0-50, gray), Medium (50-80, yellow), High (80-100, green/red depending on context).
**Rationale**: Provides immediate visual feedback on match quality. Industry standard for duplicate detection UIs.
**Alternatives considered**: Numeric-only display — rejected for poor UX; progress bar — rejected as overengineered for a single number.

## Sidebar Navigation Placement

**Decision**: Add "Deduplication" under the Governance section in sidebar, admin-only.
**Rationale**: Deduplication is a governance function. Consistent with NHI Governance, Roles, Meta-Roles placement.
**Alternatives considered**: Under Settings — rejected because it's a governance workflow, not a configuration.

## Component Reusability

**Decision**: Create reusable components for attribute comparison, confidence badge, merge preview, entitlement preview, and SoD violations display.
**Rationale**: Attribute comparison and merge preview are complex enough to warrant dedicated components. They'll be used on both the detail page and the merge page.
**Alternatives considered**: Inline everything in page components — rejected for readability and testability.

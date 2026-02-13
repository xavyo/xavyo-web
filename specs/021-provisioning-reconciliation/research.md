# Research: Provisioning Operations & Reconciliation

**Date**: 2026-02-11 | **Branch**: `021-provisioning-reconciliation`

## R1: Trend Visualization Without External Libraries

**Decision**: Use simple HTML/CSS bar chart with Tailwind CSS utility classes.

**Rationale**: The constitution mandates minimal complexity (Principle V). The trend data is a simple time-series of counts per period. A lightweight approach using `<div>` elements with dynamic heights/widths styled via Tailwind is sufficient. This avoids adding chart.js, d3, or other dependencies.

**Alternatives Considered**:
- chart.js: Full-featured but adds ~60KB bundle weight for one chart. Overkill.
- d3: Even larger, designed for complex data visualizations. Way beyond needs.
- SVG manually: More flexible than div-based but more complex. Not needed for simple bar chart.

**Implementation**: A `trend-chart.svelte` component that takes `{date: string, count: number}[]` and renders vertical bars using `h-[X%]` classes relative to the max count.

## R2: Operations vs Reconciliation API Client Split

**Decision**: Two separate API client files: `operations.ts` (operations + conflicts) and `reconciliation.ts` (reconciliation runs, discrepancies, schedules, trend).

**Rationale**: The backend has two distinct API groups — `/operations/*` and `/connectors/{id}/reconciliation/*` + `/reconciliation/*`. Splitting matches the backend organization and keeps files focused. Each file stays under ~200 lines.

**Alternatives Considered**:
- Single `provisioning.ts`: Would be ~400+ lines covering 35 endpoints. Too large.
- Three files (operations, reconciliation, conflicts): Conflicts has only 3 endpoints. Not worth a separate file.

## R3: Page Organization — Operations Under Connectors

**Decision**: Operations pages at `/connectors/operations/` (cross-connector) and reconciliation at `/connectors/[id]/reconciliation/` (per-connector).

**Rationale**: Operations are logically part of the connector management domain. Placing them under `/connectors/operations/` maintains the information architecture. Per-connector reconciliation naturally nests under the connector detail.

**Alternatives Considered**:
- Top-level `/operations/`: Breaks the connector management grouping. Adds another top-level nav item.
- `/provisioning/`: Too abstract. Operations are tied to connectors.

## R4: Sidebar Navigation for Operations

**Decision**: Add "Operations" nav item under the Connectors section in the sidebar, with sub-items for Operations Queue, Dead Letter Queue, Conflicts, and Reconciliation (global).

**Rationale**: Keeps provisioning features grouped with connectors. Admin-only visibility matches existing patterns.

**Alternatives Considered**:
- Separate top-level section: Too many top-level nav items already.
- Tab on connector list page: Operations are cross-connector, not specific to list view.

## R5: Bulk Remediation UX Pattern

**Decision**: Checkbox selection on discrepancy table rows + "Bulk Remediate" button in toolbar. Opens dialog with action/direction selectors. Max 100 items enforced client-side.

**Rationale**: Matches established patterns from governance (bulk operations in data tables). The toolbar button enables/disables based on selection count.

**Alternatives Considered**:
- "Select All" + paginated: Risk of selecting more than 100. Need explicit cap.
- Individual remediate only: Too slow for large reconciliation runs.

## R6: Date Range Filtering Pattern

**Decision**: Use native HTML date inputs for from/to date range. Submit as query parameters. Convert to ISO format (append T00:00:00Z) before sending to backend.

**Rationale**: Reuses the existing pattern from audit logs (Phase 010) which already handles date range filtering. No additional date picker library needed.

**Known Gotcha**: HTML `<input type="date">` sends `YYYY-MM-DD` but backend expects ISO datetime — must append `T00:00:00Z`.

## R7: Operation Status Color Mapping

**Decision**: Map operation statuses to badge colors:
- pending: secondary (gray)
- in_progress: blue
- completed: green (success)
- failed: red (destructive)
- dead_letter: orange/amber (warning)
- awaiting_system: purple
- resolved: teal
- cancelled: gray (muted)

**Rationale**: Follows existing badge color patterns from NHI lifecycle states and governance statuses. Color-coding provides instant visual feedback.

## R8: Discrepancy Type Color Mapping

**Decision**: Map discrepancy types to badge colors:
- missing: red (something expected is gone)
- orphan: orange (exists but shouldn't)
- mismatch: yellow (values differ)
- collision: purple (duplicate/conflict)
- unlinked: blue (exists but not connected)
- deleted: gray (removed)

**Rationale**: Distinct colors aid rapid visual triage. Red/orange for critical issues, yellow/blue for moderate, gray for informational.

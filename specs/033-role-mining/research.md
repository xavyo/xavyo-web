# Research: Role Mining Analytics & Recommendations

## R1: Backend API Structure

**Decision**: The backend has 26 endpoints (not 17 as originally estimated), organized into 7 functional groups: Jobs (5), Candidates (4), Access Patterns (2), Excessive Privileges (3), Consolidation Suggestions (3), Simulations (6), Metrics (3).

**Rationale**: Deep-dive of the Rust handler at `xavyo-api-governance/src/handlers/role_mining.rs` revealed additional endpoints for reviewing excessive privileges, dismissing consolidation suggestions, executing/applying simulations, and per-role metrics calculation.

**Alternatives considered**: N/A — backend is already implemented, we mirror it faithfully.

## R2: API Scoping Model

**Decision**: Access patterns, excessive privileges, and consolidation suggestions are **scoped to mining jobs** (not global). Patterns are fetched via `/jobs/{job_id}/patterns`, excessive privileges via `/jobs/{job_id}/excessive-privileges`, consolidation via `/jobs/{job_id}/consolidation-suggestions`.

**Rationale**: Each mining job produces its own set of analysis results. The hub tabs should either show results from a selected job or aggregate across jobs.

**UI Impact**: The hub needs a job selector or shows results from the most recent completed job. Individual tabs cannot load independently without a job context.

## R3: Job Parameters

**Decision**: Backend uses `min_users` (default 3), `min_entitlements` (default 2), `confidence_threshold` (default 0.6), `include_excessive_privilege` (default true), `include_consolidation` (default true), `consolidation_threshold` (default 70.0), `deviation_threshold` (default 50.0), `peer_group_attribute` (optional string). NOT `min_support/min_confidence/max_roles` as originally described.

**Rationale**: The Rust `MiningJobParametersRequest` struct has these exact fields. Frontend must mirror them.

## R4: Simulation Lifecycle

**Decision**: Simulations have a 4-step lifecycle: `draft` → `executed` → `applied` (or `cancelled`). There are separate endpoints for create, execute (compute impact), apply (commit changes), and cancel/delete.

**Rationale**: Backend separates creation from execution from application. This gives admins two review points: after execution (see impact) and before application (commit or cancel).

**UI Impact**: Simulation detail page needs execute button (when draft), apply/cancel buttons (when executed), and read-only view (when applied/cancelled).

## R5: Excessive Privilege Review

**Decision**: Excessive privilege flags have a review action with `accept` or `remediate` options, plus optional notes. Status enum: `pending/reviewed/remediated/accepted`.

**Rationale**: Backend provides a formal review workflow for flagged privileges, not just a read-only display.

**UI Impact**: Each excessive privilege flag needs action buttons (Accept/Remediate) with optional notes input.

## R6: Candidate Paths

**Decision**: Candidate GET/promote/dismiss endpoints use `/candidates/{candidate_id}` (NOT `/jobs/{job_id}/candidates/{candidate_id}`). Only the list endpoint is scoped to jobs: `/jobs/{job_id}/candidates`.

**Rationale**: Backend routes candidates at the top level with job_id filtering on list only.

## R7: Metrics vs Summary

**Decision**: Backend provides per-role metrics (utilization_rate, coverage_rate, user_count, entitlement_usage, trend_direction) rather than a simple summary. Includes a calculate endpoint to trigger metric recalculation.

**Rationale**: Metrics are a dedicated analytical view, not just a summary widget.

**UI Impact**: Add a Metrics tab to the hub showing per-role utilization with trend indicators and a "Recalculate" button.

## R8: Hub Architecture

**Decision**: Use a 6-tab hub: Jobs, Patterns, Privileges, Consolidation, Simulations, Metrics. Patterns/Privileges/Consolidation tabs show a job selector dropdown to scope results to a specific job.

**Rationale**: Since results are job-scoped, users need to select which job's results to view. Jobs tab shows all jobs. Simulations and Metrics are independent of jobs.

**Alternatives considered**:
- Single-page with all results from latest job — rejected because users may want to compare across jobs
- Nested under job detail only — rejected because it hides important governance views behind job navigation

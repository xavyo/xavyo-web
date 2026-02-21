# Research: Manual Provisioning Tasks & Detection Rules

**Date**: 2026-02-13
**Status**: Complete — no NEEDS CLARIFICATION items

## Decisions

### 1. Manual Task Status Flow

**Decision**: Frontend displays action buttons based on status + assignment. Terminal states (completed, rejected, cancelled) show no actions.

**Rationale**: Backend enforces transitions; frontend provides UX guidance by hiding invalid actions. Same pattern as all other lifecycle features (NHI entities, certifications, etc.).

**Alternatives considered**: Could show all buttons and let backend reject — rejected for poor UX.

### 2. Dashboard Metric Loading

**Decision**: Load dashboard metrics and task list in parallel via `Promise.all` in `+page.server.ts`.

**Rationale**: Dashboard endpoint (`/dashboard`) and list endpoint (`/manual-tasks`) are independent. Parallel loading reduces page load time.

**Alternatives considered**: Sequential loading (simpler but slower), client-side dashboard fetch (extra round-trip visible to user).

### 3. Semi-Manual Configuration UI Pattern

**Decision**: Dedicated page at `/governance/semi-manual` with list + inline configure dialog (not a separate create page). The PUT endpoint updates existing app configs, so a configure dialog per-app is more natural than a CRUD flow.

**Rationale**: Semi-manual config is a toggle on existing applications, not a standalone entity to create. A dialog with form fields (ticketing_config_id selector, sla_policy_id selector, requires_approval toggle) is sufficient.

**Alternatives considered**: Full CRUD pages (overkill — config is just a toggle + optional links), tab on connector detail page (wrong conceptual grouping).

### 4. Detection Rule Type-Specific Parameters

**Decision**: Use a dynamic form component (`rule-params-editor.svelte`) that renders different fields based on the selected `rule_type`. NoManager/Terminated show "No parameters needed" message, Inactive shows days_threshold number input, Custom shows expression textarea.

**Rationale**: Only 4 types with simple parameter shapes. A switch-based component is simpler than a generic JSON editor.

**Alternatives considered**: Generic JSON editor (overkill for 4 types), separate create pages per type (unnecessary fragmentation).

### 5. SLA Indicator Colors

**Decision**: Three-tier color coding: green (normal — deadline not near), amber/yellow (at-risk — backend flags this), red (breached — past deadline). Use existing badge component patterns with variant colors.

**Rationale**: Industry-standard traffic-light pattern for deadline visualization. Matches the project's existing badge system (status-badge components in other phases).

**Alternatives considered**: Two-tier (ok/breached) — rejected because "at risk" is a distinct backend metric.

### 6. Detection Rule Seeding UX

**Decision**: "Seed Defaults" button on the detection rules list page, visible only to admins. Button triggers POST to `/detection-rules/seed-defaults`. On success, refresh the rule list. If rules already exist, show the backend's response (either duplicates skipped or error).

**Rationale**: Simple one-click action. Backend handles idempotency. No need for a separate page or confirmation dialog — the action is additive, not destructive.

**Alternatives considered**: Confirmation dialog before seeding (unnecessary — action is additive), auto-seed on first visit (too implicit).

### 7. Task Claim/Start/Confirm/Reject/Cancel UI

**Decision**: Action buttons on the task detail page (not inline on the list). Confirm uses a dialog with optional notes textarea. Reject uses a dialog with required reason textarea (validated 5-1000 chars). Cancel and Claim/Start use simple confirmation dialogs.

**Rationale**: Lifecycle actions need context (the operator should see full task details before acting). Dialogs for confirm/reject collect additional input. Matches the project's existing dialog-based action pattern (Bits UI Dialog).

**Alternatives considered**: Inline actions on list (too error-prone without context), full form pages (overkill for single-field inputs).

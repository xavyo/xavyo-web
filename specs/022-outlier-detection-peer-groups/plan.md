# Implementation Plan: Outlier Detection & Peer Groups

**Branch**: `022-outlier-detection-peer-groups` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)

## Summary

Implement complete UI for identity access outlier detection and peer group management. This includes a tabbed outlier governance hub (`/governance/outliers`) with 6 tabs (Summary, Analyses, Results, Alerts, Dispositions, Config), plus peer group management at `/governance/peer-groups` with list/create/detail pages. All pages are admin-only and follow existing governance patterns.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via zod/v3), lucide-svelte
**Storage**: N/A (all data via xavyo-idp REST API through BFF)
**Testing**: Vitest + @testing-library/svelte
**Target Platform**: Web (SvelteKit SSR + client hydration)
**Project Type**: Web SPA with server-side rendering

## Backend API Contracts

### Outlier Detection Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/governance/outliers/config` | Get outlier config |
| PUT | `/governance/outliers/config` | Update outlier config |
| POST | `/governance/outliers/config/enable` | Enable detection |
| POST | `/governance/outliers/config/disable` | Disable detection |
| GET | `/governance/outliers/analyses` | List analyses (paginated) |
| POST | `/governance/outliers/analyses` | Trigger new analysis |
| GET | `/governance/outliers/analyses/{id}` | Get analysis detail |
| POST | `/governance/outliers/analyses/{id}/cancel` | Cancel running analysis |
| GET | `/governance/outliers/results` | List results (paginated, filterable) |
| GET | `/governance/outliers/results/{id}` | Get result detail |
| GET | `/governance/outliers/summary` | Get outlier summary |
| GET | `/governance/outliers/users/{user_id}` | Get user outlier history |
| POST | `/governance/outliers/results/{id}/disposition` | Create disposition |
| GET | `/governance/outliers/dispositions` | List dispositions |
| GET | `/governance/outliers/dispositions/{id}` | Get disposition detail |
| PUT | `/governance/outliers/dispositions/{id}` | Update disposition |
| GET | `/governance/outliers/dispositions/summary` | Disposition summary counts |
| GET | `/governance/outliers/alerts` | List alerts (paginated) |
| GET | `/governance/outliers/alerts/summary` | Alert summary counts |
| POST | `/governance/outliers/alerts/{id}/read` | Mark alert as read |
| POST | `/governance/outliers/alerts/{id}/dismiss` | Dismiss alert |
| POST | `/governance/outliers/reports` | Generate report |

### Peer Group Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/governance/peer-groups` | List peer groups |
| POST | `/governance/peer-groups` | Create peer group |
| GET | `/governance/peer-groups/{id}` | Get peer group detail |
| DELETE | `/governance/peer-groups/{id}` | Delete peer group |
| POST | `/governance/peer-groups/{id}/refresh` | Refresh group stats |
| POST | `/governance/peer-groups/refresh-all` | Refresh all groups |
| GET | `/governance/users/{user_id}/peer-comparison` | User peer comparison |

### Key Type Definitions

**Analysis statuses**: `pending | running | completed | failed`
**Trigger types**: `scheduled | manual | api`
**Classifications**: `normal | outlier | unclassifiable`
**Disposition statuses**: `new | legitimate | requires_remediation | under_investigation | remediated`
**Alert types**: `new_outlier | score_increase | repeated_outlier`
**Alert severities**: `low | medium | high | critical`
**Peer group types**: `department | role | location | custom`
**Pagination format**: `{items, total, limit, offset}` (standard governance pattern)

### Key Data Models

**OutlierConfig**: id, tenant_id, confidence_threshold (f64), frequency_threshold (f64), min_peer_group_size (i32), scoring_weights (object), schedule_cron, retention_days, is_enabled, created_at, updated_at

**OutlierAnalysis**: id, tenant_id, status, triggered_by, started_at, completed_at, users_analyzed, outliers_detected, progress_percent, error_message, created_at

**OutlierResult**: id, analysis_id, user_id, overall_score (f64), classification, peer_scores (array of {peer_group_id, peer_group_name, z_score, deviation_factor, is_outlier}), factor_breakdown (object with role_frequency/entitlement_count/assignment_pattern/peer_group_coverage/historical_deviation each having raw_value/weight/contribution/details), previous_score, score_change, created_at

**OutlierDisposition**: id, result_id, user_id, status, justification, reviewed_by, reviewed_at, expires_at, created_at, updated_at

**OutlierAlert**: id, analysis_id, user_id, alert_type, severity, score, classification, is_read, is_dismissed, created_at

**PeerGroup**: id, name, group_type, attribute_key, attribute_value, user_count, avg_entitlements, stddev_entitlements, created_at, updated_at

**NOTE**: No PUT endpoint for peer groups — groups are immutable after creation (only refresh stats and delete).

## Project Structure

### New Files

```
src/lib/api/outliers.ts                                   — Server API client
src/lib/api/outliers-client.ts                             — Client API (browser)
src/lib/api/peer-groups.ts                                 — Server API client
src/lib/api/peer-groups-client.ts                          — Client API (browser)
src/lib/schemas/outliers.ts                                — Zod schemas
src/lib/schemas/peer-groups.ts                             — Zod schemas
src/routes/api/governance/outliers/config/+server.ts       — BFF proxy
src/routes/api/governance/outliers/config/enable/+server.ts
src/routes/api/governance/outliers/config/disable/+server.ts
src/routes/api/governance/outliers/analyses/+server.ts
src/routes/api/governance/outliers/analyses/[id]/+server.ts
src/routes/api/governance/outliers/analyses/[id]/cancel/+server.ts
src/routes/api/governance/outliers/results/+server.ts
src/routes/api/governance/outliers/results/[id]/+server.ts
src/routes/api/governance/outliers/results/[id]/disposition/+server.ts
src/routes/api/governance/outliers/summary/+server.ts
src/routes/api/governance/outliers/users/[userId]/+server.ts
src/routes/api/governance/outliers/dispositions/+server.ts
src/routes/api/governance/outliers/dispositions/[id]/+server.ts
src/routes/api/governance/outliers/dispositions/summary/+server.ts
src/routes/api/governance/outliers/alerts/+server.ts
src/routes/api/governance/outliers/alerts/[id]/read/+server.ts
src/routes/api/governance/outliers/alerts/[id]/dismiss/+server.ts
src/routes/api/governance/outliers/alerts/summary/+server.ts
src/routes/api/governance/outliers/reports/+server.ts
src/routes/api/governance/peer-groups/+server.ts
src/routes/api/governance/peer-groups/[id]/+server.ts
src/routes/api/governance/peer-groups/[id]/refresh/+server.ts
src/routes/api/governance/peer-groups/refresh-all/+server.ts
src/routes/api/governance/users/[userId]/peer-comparison/+server.ts
src/routes/(app)/governance/outliers/+page.server.ts
src/routes/(app)/governance/outliers/+page.svelte
src/routes/(app)/governance/outliers/results/[id]/+page.server.ts
src/routes/(app)/governance/outliers/results/[id]/+page.svelte
src/routes/(app)/governance/peer-groups/+page.server.ts
src/routes/(app)/governance/peer-groups/+page.svelte
src/routes/(app)/governance/peer-groups/create/+page.server.ts
src/routes/(app)/governance/peer-groups/create/+page.svelte
src/routes/(app)/governance/peer-groups/[id]/+page.server.ts
src/routes/(app)/governance/peer-groups/[id]/+page.svelte
src/lib/components/governance/outlier-summary-cards.svelte
src/lib/components/governance/outlier-config-panel.svelte
src/lib/components/governance/outlier-score-badge.svelte
```

### Modified Files

```
src/lib/api/types.ts                    — Add outlier + peer group types
src/routes/(app)/+layout.svelte         — Add sidebar nav items
```

## Implementation Strategy

1. **Types + Schemas** — Add all TypeScript types and Zod validation schemas
2. **API Clients** — Server-side + client-side API modules
3. **BFF Proxies** — All ~25 proxy endpoints
4. **UI Components** — Summary cards, config panel, score badge
5. **Outlier Hub Page** — Tabbed page with 6 tabs (server load + client interactions)
6. **Result Detail Page** — Individual outlier result breakdown
7. **Peer Group Pages** — List, create, detail
8. **Sidebar Nav** — Add nav entries
9. **Tests** — Unit tests for all new modules

# API Routes: Birthright Policies & Lifecycle Workflows

**Feature**: 029-birthright-lifecycle
**Date**: 2026-02-12

## Backend API (xavyo-idp on localhost:8080)

### Birthright Policies

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET | /governance/birthright-policies | List policies | Query: status, limit, offset | BirthrightPolicyListResponse |
| GET | /governance/birthright-policies/{id} | Get policy | — | BirthrightPolicy |
| POST | /governance/birthright-policies | Create policy | CreateBirthrightPolicyRequest | BirthrightPolicy (201) |
| PUT | /governance/birthright-policies/{id} | Update policy | UpdateBirthrightPolicyRequest | BirthrightPolicy |
| DELETE | /governance/birthright-policies/{id} | Archive policy | — | 204 |
| POST | /governance/birthright-policies/{id}/enable | Enable policy | — | BirthrightPolicy |
| POST | /governance/birthright-policies/{id}/disable | Disable policy | — | BirthrightPolicy |
| POST | /governance/birthright-policies/{id}/simulate | Simulate single | SimulatePolicyRequest | SimulatePolicyResponse |
| POST | /governance/birthright-policies/simulate | Simulate all | SimulatePolicyRequest | SimulateAllPoliciesResponse |
| POST | /governance/birthright-policies/{id}/impact | Impact analysis | — | ImpactAnalysisResponse |

### Lifecycle Events

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|-------------|----------|
| GET | /governance/lifecycle-events | List events | Query: user_id, event_type, from, to, processed, limit, offset | LifecycleEventListResponse |
| GET | /governance/lifecycle-events/{id} | Get event detail | — | ProcessEventResult (with actions + snapshot) |
| POST | /governance/lifecycle-events | Create event | CreateLifecycleEventRequest | LifecycleEvent (201) |
| POST | /governance/lifecycle-events/{id}/process | Process event | — | ProcessEventResult |
| POST | /governance/lifecycle-events/trigger | Create + process | CreateLifecycleEventRequest | ProcessEventResult (201) |

## BFF Proxy Routes (SvelteKit on localhost:5173)

### Birthright Policy Proxies

| BFF Route | File | Methods | Backend Target |
|-----------|------|---------|----------------|
| /api/governance/birthright-policies | src/routes/api/governance/birthright-policies/+server.ts | GET, POST | List + Create |
| /api/governance/birthright-policies/simulate | src/routes/api/governance/birthright-policies/simulate/+server.ts | POST | Simulate all |
| /api/governance/birthright-policies/[id] | src/routes/api/governance/birthright-policies/[id]/+server.ts | GET, PUT, DELETE | Get + Update + Archive |
| /api/governance/birthright-policies/[id]/enable | src/routes/api/governance/birthright-policies/[id]/enable/+server.ts | POST | Enable |
| /api/governance/birthright-policies/[id]/disable | src/routes/api/governance/birthright-policies/[id]/disable/+server.ts | POST | Disable |
| /api/governance/birthright-policies/[id]/simulate | src/routes/api/governance/birthright-policies/[id]/simulate/+server.ts | POST | Simulate single |
| /api/governance/birthright-policies/[id]/impact | src/routes/api/governance/birthright-policies/[id]/impact/+server.ts | POST | Impact analysis |

### Lifecycle Event Proxies

| BFF Route | File | Methods | Backend Target |
|-----------|------|---------|----------------|
| /api/governance/lifecycle-events | src/routes/api/governance/lifecycle-events/+server.ts | GET, POST | List + Create |
| /api/governance/lifecycle-events/trigger | src/routes/api/governance/lifecycle-events/trigger/+server.ts | POST | Trigger (create+process) |
| /api/governance/lifecycle-events/[id] | src/routes/api/governance/lifecycle-events/[id]/+server.ts | GET | Get detail |
| /api/governance/lifecycle-events/[id]/process | src/routes/api/governance/lifecycle-events/[id]/process/+server.ts | POST | Process event |

**Total: 11 BFF proxy files (7 policy + 4 event)**

## SvelteKit Page Routes

| Page Route | File | Purpose |
|------------|------|---------|
| /governance/birthright | src/routes/(app)/governance/birthright/+page.svelte | Hub page (Policies tab + Events tab) |
| /governance/birthright/policies/create | src/routes/(app)/governance/birthright/policies/create/+page.svelte | Create policy form |
| /governance/birthright/policies/[id] | src/routes/(app)/governance/birthright/policies/[id]/+page.svelte | Policy detail page |
| /governance/birthright/policies/[id]/edit | src/routes/(app)/governance/birthright/policies/[id]/edit/+page.svelte | Edit policy form |
| /governance/birthright/events/[id] | src/routes/(app)/governance/birthright/events/[id]/+page.svelte | Event detail page |

## Query Parameters

### GET /governance/birthright-policies
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | string | — | Filter: active, inactive, archived |
| limit | number | 50 | Page size (max 100) |
| offset | number | 0 | Pagination offset |

### GET /governance/lifecycle-events
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| user_id | uuid | — | Filter by user |
| event_type | string | — | Filter: joiner, mover, leaver |
| from | ISO datetime | — | Events created after |
| to | ISO datetime | — | Events created before |
| processed | boolean | — | true=processed, false=pending |
| limit | number | 50 | Page size (max 100) |
| offset | number | 0 | Pagination offset |

## Authentication

All endpoints require:
- Bearer token (JWT) in Authorization header (handled by BFF via HttpOnly cookies)
- Tenant ID from JWT claims (extracted in hooks.server.ts)
- Admin role for all write operations (create, update, archive, enable, disable, simulate, process, trigger)
- Admin role for list/get operations (governance admin feature)

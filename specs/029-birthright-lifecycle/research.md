# Research: Birthright Policies & Lifecycle Workflows

**Feature**: 029-birthright-lifecycle
**Date**: 2026-02-12

## Decision Log

### D1: API Client Structure
- **Decision**: Separate server-side (`birthright.ts`) and client-side (`birthright-client.ts`) API clients following established pattern
- **Rationale**: Matches governance.ts / governance-client.ts pattern used across all governance features. Server functions take (params, token, tenantId, fetchFn), client functions call /api/ BFF proxies
- **Alternatives considered**: Single unified client — rejected because BFF pattern requires separation of server (with auth) and client (no auth) calls

### D2: Route Structure
- **Decision**: Hub page at `/governance/birthright` with 2 tabs (Policies, Lifecycle Events). Separate pages for policy create/detail/edit and event detail
- **Rationale**: Matches governance hub pattern (entitlements, SoD, certifications tabs). Policy CRUD needs dedicated pages due to complex condition builder form
- **Alternatives considered**: Inline modals for create/edit — rejected because condition builder is too complex for a modal

### D3: Condition Builder Component
- **Decision**: Reusable `condition-builder.svelte` component with dynamic rows (attribute, operator, value). Attribute is a text input with common suggestions, operator is a select dropdown, value adapts based on operator (text for equals/starts_with/contains, tag-style multi-input for in/not_in)
- **Rationale**: Conditions are the most complex UI element. A dedicated component keeps the policy form manageable. Text input for attributes allows dot-notation paths (metadata.field) without constraining to a fixed list
- **Alternatives considered**: Fixed attribute dropdown — rejected because attributes include dynamic paths like metadata.* and custom_attributes.*

### D4: Entitlement Selection
- **Decision**: Multi-select entitlement picker loading entitlements from existing governance API. Checkbox list with search filter
- **Rationale**: Policies require multiple entitlements (array). Existing pattern loads entitlements in page server load with limit: 100
- **Alternatives considered**: Single-select repeated — rejected because array selection is cleaner UX

### D5: Simulation UI
- **Decision**: JSON textarea for attribute input with "Simulate" button. Results displayed inline as match/no-match with entitlement list. "Simulate All" available from hub page policies tab
- **Rationale**: JSON input is the most flexible approach — matches any attribute structure including nested fields. Backend already accepts JSON
- **Alternatives considered**: Form-based attribute input — rejected because attribute names are dynamic and unbounded

### D6: Event Trigger Form
- **Decision**: Dialog/inline form with user selector (search by name/email), event type radio (joiner/mover/leaver), and conditional JSON textareas for attributes_before/attributes_after based on event type
- **Rationale**: Event type determines which attribute fields are required. Joiner needs attributes_after only, mover needs both, leaver needs neither
- **Alternatives considered**: Separate create pages per event type — rejected as over-engineering for 3 variants

### D7: Zod Schema Strategy
- **Decision**: Use `zod/v3` for all schemas. Create schema with `.refine()` for cross-field validation (conditions array min length, entitlement_ids min length). Separate simulation schema for JSON validation
- **Rationale**: Matches established pattern. Cross-field validation needed for condition count and entitlement count requirements
- **Alternatives considered**: No schema for simulation (raw JSON parse) — rejected for consistency

### D8: Backend API Base Path
- **Decision**: Backend endpoints at `/governance/birthright-policies` and `/governance/lifecycle-events`. BFF proxies at `/api/governance/birthright-policies` and `/api/governance/lifecycle-events`
- **Rationale**: Matches backend route structure exactly. BFF prefix `/api/` is standard
- **Alternatives considered**: None — must match backend

## Technology Choices

| Area | Choice | Rationale |
|------|--------|-----------|
| Forms | Superforms + Zod (via zod/v3) | Standard pattern for all governance forms |
| Condition builder | Custom Svelte 5 component | No existing library fits the operator-value pattern |
| JSON editor | Plain textarea with validation | Simple, works for simulation input |
| Entitlement picker | Checkbox list with search | Multi-select needed, consistent with existing patterns |
| Date range filter | Native HTML date inputs | Consistent with lifecycle event list filters |
| Tab layout | Custom ARIA tabs | Matches governance hub pattern |

## Backend API Verification

All 15 endpoints verified in xavyo-idp backend:

### Birthright Policies (10 endpoints)
| Endpoint | Method | Path | Verified |
|----------|--------|------|----------|
| List | GET | /governance/birthright-policies | Yes |
| Get | GET | /governance/birthright-policies/{id} | Yes |
| Create | POST | /governance/birthright-policies | Yes |
| Update | PUT | /governance/birthright-policies/{id} | Yes |
| Archive | DELETE | /governance/birthright-policies/{id} | Yes |
| Enable | POST | /governance/birthright-policies/{id}/enable | Yes |
| Disable | POST | /governance/birthright-policies/{id}/disable | Yes |
| Simulate One | POST | /governance/birthright-policies/{id}/simulate | Yes |
| Simulate All | POST | /governance/birthright-policies/simulate | Yes |
| Impact | POST | /governance/birthright-policies/{id}/impact | Yes |

### Lifecycle Events (5 endpoints)
| Endpoint | Method | Path | Verified |
|----------|--------|------|----------|
| List | GET | /governance/lifecycle-events | Yes |
| Get | GET | /governance/lifecycle-events/{id} | Yes |
| Create | POST | /governance/lifecycle-events | Yes |
| Process | POST | /governance/lifecycle-events/{id}/process | Yes |
| Trigger | POST | /governance/lifecycle-events/trigger | Yes |

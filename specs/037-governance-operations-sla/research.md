# Research: Governance Operations & SLA Management

## Phase 0 — No Unknowns

All technologies and patterns are well-established from 36 prior phases. No NEEDS CLARIFICATION items.

## Decisions

### D1: Hub Page Structure (6-tab layout)

**Decision**: Use ARIA-based tab layout matching existing governance hubs (NHI Governance 5-tab, Licenses 7-tab, Reports 3-tab)
**Rationale**: Consistent UX across all governance features; users already familiar with the pattern
**Alternatives considered**: Separate pages per sub-feature — rejected because it increases navigation overhead and the features are conceptually related

### D2: SLA Policy CRUD Pattern

**Decision**: Standard CRUD with list page (hub tab), create page, detail page, edit page — same pattern as governance roles, entitlements, etc.
**Rationale**: Every prior governance CRUD feature follows this exact pattern
**Alternatives considered**: Inline editing in table — rejected for consistency with existing patterns

### D3: Ticketing Configuration Type-Specific Forms

**Decision**: Use conditional rendering based on `system_type` select value to show/hide type-specific fields (ServiceNow vs Jira vs Custom Webhook)
**Rationale**: Similar to connector management where LDAP/Database/REST types show different config forms (Phase 020)
**Alternatives considered**: Separate create pages per type — rejected as overly complex; one form with conditional sections is simpler

### D4: Bulk Action Preview/Execute UX Flow

**Decision**: Detail page shows current state. Preview button triggers client-side fetch to preview endpoint, displaying results inline. Execute button triggers with confirmation dialog.
**Rationale**: Preview is a read-only check that should not require page reload. Execute is destructive and needs confirmation.
**Alternatives considered**: Separate preview page — rejected; inline display is faster and more intuitive

### D5: Failed Operations Retry/Dismiss Pattern

**Decision**: List page with status filter as hub tab. Detail inline in list or via link. Retry and Dismiss as action buttons.
**Rationale**: Failed operations need quick triage — admins scan the list, take action, move on. No separate detail page needed (use inline expansion or modal for error details).
**Alternatives considered**: Full detail page for each failed operation — implemented via detail link for complex cases, but most actions happen from the list

### D6: Bulk State Operations — No Separate List Page

**Decision**: Hub tab shows recent bulk state operations. Create via inline form or button. Detail page for progress tracking.
**Rationale**: Bulk state operations are infrequent and don't need a full CRUD — just create, monitor, and cancel
**Alternatives considered**: Full CRUD with edit — rejected; bulk state operations are fire-and-forget, not editable

### D7: Scheduled Transitions — Read-Only List + Cancel

**Decision**: Hub tab lists scheduled transitions. Detail page with cancel button. No create/edit UI (creation happens in other workflows).
**Rationale**: Spec explicitly states creation happens through other governance workflows; this is purely a monitoring and cancel interface
**Alternatives considered**: Adding create capability — rejected per spec scope

### D8: Sidebar Navigation Naming

**Decision**: Add "Operations" under Governance section. Rename existing connector "Operations" to "Provisioning Ops" to avoid collision.
**Rationale**: Both features need sidebar presence; clear names prevent confusion
**Alternatives considered**: Nesting under existing governance menu — rejected since this is a top-level governance concern

### D9: API Client Module Naming

**Decision**: Single API client file `governance-operations.ts` covering all 6 sub-features (SLA, ticketing, bulk actions, failed ops, bulk state, scheduled)
**Rationale**: The 28 endpoints are conceptually one module (governance operations); splitting into 6 files would be excessive for related endpoints
**Alternatives considered**: Separate files per sub-feature — rejected per Principle V (minimal complexity)

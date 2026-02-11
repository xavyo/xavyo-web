# Research: Governance Reporting & Analytics

## R1: Template Definition Editing Approach

**Decision**: Use a JSON editor for template definitions (data_sources, filters, columns, grouping, default_sort)

**Rationale**: Template definitions are complex nested structures. A structured form would require building custom UI for each sub-field type (filters with options, columns with sortable flag, etc.). The project already has a `json-display` component for NHI tool schemas and the pattern of JSON editing for tool input_schema. A JSON textarea with validation provides maximum flexibility for admin users who are configuring compliance reports.

**Alternatives considered**:
- Structured form builder: Too complex for the current scope, violates Principle V (Minimal Complexity). Would require custom form components for each definition sub-type.
- Hybrid (structured for simple fields, JSON for advanced): Adds complexity without clear benefit. Template definitions are always edited by admins who understand the structure.

## R2: Report Data Display Approach

**Decision**: Use a JSON viewer component for report data, with a table renderer for tabular data when columns are available.

**Rationale**: Report data varies by template type — some produce tabular data (user access lists, entitlement audits), others produce structured summaries. A JSON viewer handles all cases. When the data is an array of objects, render as a table for better readability. The existing `json-display` component pattern from NHI can be reused.

**Alternatives considered**:
- Always table: Doesn't work for non-tabular report data (summaries, hierarchical data).
- Always raw JSON: Works but poor UX for tabular data that most reports produce.
- Download-only: Misses the in-app viewing requirement (FR-012).

## R3: Navigation Placement

**Decision**: Add "Reports" as a sub-item under the existing Governance section in the sidebar.

**Rationale**: Reports are a governance function. Adding as a separate top-level nav item would clutter the sidebar. The existing governance hub already has 5 tabs — reports deserve their own page but linked from governance sidebar. Adding it after "Governance" as an admin-only item is consistent with how "NHI Governance" is placed after NHI items.

**Alternatives considered**:
- Tab in governance hub: The hub already has 5 tabs, adding a 6th makes it crowded.
- Standalone section: Governance reports are tightly coupled to governance data.

## R4: Schedule Recipient Email Input

**Decision**: Use a comma-separated text input for recipient emails with client-side format validation.

**Rationale**: Schedule recipients are email addresses. A simple text input with comma separation is the standard pattern for multi-email entry. Zod schema validates email format. Backend does final validation.

**Alternatives considered**:
- Tag/chip input component: Would need a new component, violates Principle V.
- One email per input row with add/remove: More complex UI, unnecessary for typical 1-5 recipients.

## R5: Pagination Format

**Decision**: Backend uses `{items, total, page, page_size}` format for reporting endpoints.

**Rationale**: This differs from the NHI `{data, total, limit, offset}` and governance `{items, total, limit, offset}` patterns. The reporting API uses `page` and `page_size` instead of `offset` and `limit`. Frontend must adapt — convert page/pageSize to offset/limit for consistency with internal state, or pass page/page_size directly.

**Alternatives considered**:
- Convert to offset/limit in API client: Adds unnecessary translation layer.
- Use page/page_size natively: Simpler, matches backend directly. Selected.

## R6: Backend API Routing

**Decision**: Backend reporting endpoints are under `/governance/reports/` path.

**Rationale**: Confirmed by router analysis. All template, report, and schedule endpoints are grouped under the governance module's report routes. The BFF proxy will mirror this structure under `/api/governance/reports/`.

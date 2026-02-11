# Research: NHI (Non-Human Identity) Management

**Feature**: 006-nhi-management
**Date**: 2026-02-10

## Decision 1: NHI Pagination Format

**Decision**: Use a new `NhiListResponse` type with `{ data, total, limit, offset }` format, distinct from users and governance pagination.

**Rationale**: The NHI API is the third pagination format in the app: users use `{ users, pagination: { total_count, offset, limit, has_more } }`, governance uses `{ items, total, limit, offset }`, and NHI uses `{ data, total, limit, offset }`. Mirror the backend DTOs exactly (Constitution Principle VI: Type Safety).

**Alternatives considered**:
- Shared generic pagination type — rejected because the three formats have different field names (`users` vs `items` vs `data`, and different pagination shapes).
- Adapter to convert NHI format to governance format — rejected as unnecessary complexity (Constitution Principle V: Minimal Complexity).

## Decision 2: Unified List vs Type-Specific Lists

**Decision**: Use a single unified list at `/nhi` showing all three NHI types, with a type filter dropdown to narrow by type.

**Rationale**: The spec requires a unified paginated list (FR-001). The backend provides a single `GET /nhi` endpoint that returns all types with optional `nhi_type` filter. A unified list is the natural match for the API design and reduces page count.

**Alternatives considered**:
- Three separate list pages per type — rejected because it doesn't match the backend API design and increases navigation complexity.
- Tab-based type switching — rejected as it doesn't leverage the existing DataTable filter pattern established in Feature 005.

## Decision 3: NHI Lifecycle State Badge Colors

**Decision**: Use Badge component with 5 distinct color mappings for NHI lifecycle states.

**Rationale**: Must be visually distinct at a glance (SC-002). Map to semantic colors:
- active: `variant="default"` (green — operational state)
- inactive: `variant="outline"` (neutral — exists but not in use)
- suspended: custom orange styling (warning — manually paused)
- deprecated: custom amber styling (warning — pending archival)
- archived: `variant="secondary"` (gray — terminal state)

This differs from persona badges (6 states) but uses the same component and color conventions for consistency.

**Alternatives considered**:
- Reusing persona badge component — rejected because NHI has different state names and different number of states.

## Decision 4: Shared Credentials Section Component

**Decision**: Create a `credentials-section.svelte` component that is reused on all three detail pages (tool, agent, service account).

**Rationale**: Credential management is identical regardless of NHI type. The component accepts `nhiId` as a prop and handles all credential operations (list, issue, rotate, revoke) independently. This avoids triplicating credential management code across three detail pages.

**Alternatives considered**:
- Inline credential management in each detail page — rejected because it would triplicate ~150 lines of credential UI/logic across three files.
- Separate credential management page — rejected because the spec places credentials on the detail page (FR-008).

## Decision 5: Type-Specific Create Routes

**Decision**: Use three separate create routes (`/nhi/tools/create`, `/nhi/agents/create`, `/nhi/service-accounts/create`) with a "Create" dropdown in the NHI list header.

**Rationale**: Each NHI type has significantly different creation fields. Tool needs input_schema (JSON), agent needs agent_type and model info, service account needs purpose. Separate forms keep each form focused and simple (Constitution Principle V: Minimal Complexity). The "Create" dropdown provides a clear navigation path (FR-017).

**Alternatives considered**:
- Single create page with type selector that shows/hides fields — rejected as more complex and harder to validate.
- Wizard-style multi-step form — rejected as over-engineering for a form with 5-8 fields.

## Decision 6: Type-Specific Detail Routes

**Decision**: Use three separate detail routes (`/nhi/tools/[id]`, `/nhi/agents/[id]`, `/nhi/service-accounts/[id]`) rather than a single `/nhi/[id]` route.

**Rationale**: The backend uses type-specific endpoints for GET/PATCH/DELETE (`/nhi/tools/:id`, `/nhi/agents/:id`, `/nhi/service-accounts/:id`). Type-specific routes allow each detail page to know its type and call the correct backend endpoint. The NHI name link in the unified list routes to the correct type-specific detail page based on `nhi_type`.

**Alternatives considered**:
- Single `/nhi/[id]` route that detects type from the response — would require an extra backend call or type lookup. Rejected for simplicity.

## Decision 7: Secret Display Dialog

**Decision**: Display the issued credential secret in a Bits UI Dialog with a copy button and clear warning. The dialog closes on user action and the secret is never stored or retrievable again.

**Rationale**: The spec requires the secret to be displayed exactly once (FR-010, SC-003). A modal dialog ensures the user focuses on copying the secret before it's gone. A copy button makes it easy to transfer the secret. The warning text makes the one-time nature clear.

**Alternatives considered**:
- Toast notification with secret — rejected because toasts auto-dismiss and could lose the secret.
- Inline display on the page — rejected because the user might navigate away before noticing.

## Decision 8: Lifecycle Actions Mapping

**Decision**: Map lifecycle action buttons to the backend's valid transitions:
- Inactive → Activate (calls POST /nhi/:id/activate)
- Active → Suspend (calls POST /nhi/:id/suspend), Deprecate (calls POST /nhi/:id/deprecate)
- Suspended → Activate (calls POST /nhi/:id/reactivate)
- Deprecated → Archive (calls POST /nhi/:id/archive)
- Archived → no buttons

**Rationale**: The spec states available actions depend on the current state (US7). The backend validates transitions server-side, but the frontend hides invalid buttons to prevent errors. Suspend accepts an optional reason. Archive requires confirmation.

**Alternatives considered**:
- Showing all buttons but disabling invalid ones — rejected because disabled buttons are confusing without explanation.

## Decision 9: JSON Schema Input for Tools

**Decision**: Use a textarea with client-side JSON validation for the tool's `input_schema` and `output_schema` fields.

**Rationale**: The spec requires input_schema to accept any valid JSON object (assumption in spec). A textarea allows free-form JSON input. Client-side validation warns on malformed JSON before submission (edge case EC-6). No need for a visual JSON schema builder — that would be over-engineering.

**Alternatives considered**:
- JSON editor component (like CodeMirror) — rejected as over-engineering for the current scope.
- Key-value pair UI — rejected because it can't represent nested JSON schemas.

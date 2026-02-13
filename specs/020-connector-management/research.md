# Research: Connector Management

**Feature**: 020-connector-management
**Date**: 2026-02-11

## Research Topics

### 1. Backend API Verification

**Decision**: Backend provides 9 endpoints under `/admin/connectors` for full connector CRUD, lifecycle, testing, and health monitoring.

**Rationale**: The xavyo-idp backend includes a complete connector management module with:
- `GET /admin/connectors` — List with pagination `{items, total, limit, offset}`
- `POST /admin/connectors` — Create connector
- `GET /admin/connectors/{id}` — Get detail
- `PUT /admin/connectors/{id}` — Update connector
- `DELETE /admin/connectors/{id}` — Delete (returns 204)
- `POST /admin/connectors/{id}/test` — Test connectivity
- `POST /admin/connectors/{id}/activate` — Activate
- `POST /admin/connectors/{id}/deactivate` — Deactivate
- `GET /admin/connectors/{id}/health` — Health status

**Alternatives Considered**: None — these endpoints are provided by the backend.

### 2. Connector Type Configuration Schemas

**Decision**: Use type-dependent structured form fields rather than a generic JSON editor for connector configuration.

**Rationale**: Each connector type has well-defined configuration fields:
- **LDAP**: host, port, bind_dn, bind_password, base_dn, use_ssl, search_filter (optional)
- **Database**: host, port, database, username, password, driver, query (optional)
- **REST API**: base_url, auth_type, auth_config (JSON), headers (optional)

Using structured forms provides better UX with proper field types, labels, and validation. The `configuration` field is sent to the backend as a JSON object regardless.

**Alternatives Considered**:
- Raw JSON textarea: Worse UX, more error-prone, but simpler to implement
- JSON editor component: Over-engineered for 3 well-known schemas

### 3. Pagination Format

**Decision**: Use `{items, total, limit, offset}` format matching governance/NHI patterns.

**Rationale**: The backend connector list endpoint returns `{items: Connector[], total, limit, offset}` — consistent with the governance and NHI pagination formats already implemented in the project.

**Alternatives Considered**: None — must match backend.

### 4. Delete Response Handling

**Decision**: Handle DELETE returning HTTP 204 with no response body.

**Rationale**: Unlike invitations (which return 200 with updated object) or some other endpoints, the connector DELETE returns 204 No Content. The frontend must not attempt to parse a response body.

**Alternatives Considered**: None — must match backend behavior.

### 5. Connection Test UX Pattern

**Decision**: Use client-side fetch with loading state on the detail page, not a server action.

**Rationale**: The test connection action may take up to 30 seconds. Using a client-side fetch (via the BFF proxy) with a loading state ($state for testing flag) provides better UX:
- Button shows spinner during test
- Result displayed inline without page reload
- Can be retried without form submission

This is similar to the pattern used for MCP tool invocation in NHI protocols.

**Alternatives Considered**:
- SvelteKit form action: Would require page reload or complex enhance handling for a long-running operation
- WebSocket: Over-engineered for a simple request-response

### 6. Sensitive Field Masking

**Decision**: Mask password/secret fields in the configuration display view with bullet characters. Show actual values only in edit mode (pre-populated in password inputs).

**Rationale**: The backend returns configuration including sensitive fields. The frontend should mask these in read-only views but allow editing. Standard password input fields handle this naturally in edit forms.

**Alternatives Considered**:
- Backend-side masking: Would prevent editing since actual values would be lost
- Toggle show/hide: More complex, unnecessary since edit mode serves this purpose

### 7. Health Indicator on List Page

**Decision**: Show a simple colored dot indicator on the list page, full metrics on the detail page Health tab.

**Rationale**: The list page needs a quick visual indicator (green/yellow/red dot) next to each connector. Full health metrics (response time, error count, last check time) are shown on the detail page's Health tab. This keeps the list clean while providing depth on demand.

**Alternatives Considered**:
- Full health metrics in list: Too much data for the table view
- No health in list: Admins can't spot issues at a glance

## No NEEDS CLARIFICATION Items

All technical decisions resolved with established project patterns. The connector management feature follows the same architecture as existing CRUD features (users, NHI entities, invitations).

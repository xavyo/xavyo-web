# Research: Bulk User Import & SCIM Administration

## R1: CSV File Upload via Multipart Form Data

**Decision**: Use native HTML `<input type="file" accept=".csv">` with SvelteKit form action that reads the file and forwards as multipart/form-data to the backend.

**Rationale**: SvelteKit's `request.formData()` natively handles multipart uploads. The server action extracts the File object, creates a new FormData with the file blob, and POSTs to `POST /admin/users/import`. No third-party upload library needed.

**Alternatives considered**:
- Client-side direct upload to backend: Rejected — violates BFF security principle (would expose tokens)
- Streaming upload via fetch: Rejected — over-engineered for max 10MB files

## R2: Import Job Status Display Pattern

**Decision**: Server-side load on page visit (no client-side polling). Admin manually refreshes page to check status updates.

**Rationale**: Import jobs are async backend processes. The frontend shows current state on page load. Since processing typically completes quickly (backend handles CSV parsing synchronously), manual refresh is sufficient. Auto-polling adds complexity for minimal benefit.

**Alternatives considered**:
- WebSocket/SSE for real-time updates: Rejected — backend doesn't support WebSocket; over-engineered for this use case
- Client-side setInterval polling: Rejected — adds complexity, battery drain; manual refresh is standard pattern in this codebase

## R3: Error CSV Download

**Decision**: Direct download via BFF proxy that streams the backend response as `Content-Type: text/csv` with `Content-Disposition: attachment`.

**Rationale**: Backend `GET /admin/users/imports/:job_id/errors/download` returns a CSV file. The BFF proxy fetches this and pipes through to the browser as a file download. No client-side CSV generation needed.

**Alternatives considered**:
- Client-side CSV generation from error list: Rejected — backend already provides the download endpoint
- Opening backend URL directly: Rejected — violates BFF security principle

## R4: SCIM Token One-Time Display

**Decision**: After creating a token, display the raw token value in a modal/card with a copy button. Once dismissed, the token is never shown again (only prefix visible in list).

**Rationale**: This is the same pattern used for OAuth client secrets in Phase 023. The backend returns the raw token only in the creation response. Frontend shows it prominently with a "copy to clipboard" button and a warning that it won't be shown again.

**Alternatives considered**:
- Store token in browser localStorage: Rejected — security risk
- Show token on a separate page: Rejected — adds navigation complexity; inline display is simpler and matches existing patterns

## R5: SCIM Attribute Mappings Edit Pattern

**Decision**: Load all mappings on page load, allow inline editing of transform and required fields, save all mappings as a batch PUT request.

**Rationale**: Backend `PUT /admin/scim/mappings` expects the full array of mappings (upsert pattern). The frontend loads the current mappings, lets the admin edit transform dropdowns and required checkboxes, then submits the entire array on save. This matches the backend's batch update API.

**Alternatives considered**:
- Individual mapping PATCH requests: Rejected — backend doesn't support individual mapping updates
- Modal-based editing: Rejected — inline editing is simpler for a small number of mappings

## R6: Invitation Acceptance Page Route

**Decision**: Place at `src/routes/(auth)/invite/[token]/` in the `(auth)` route group (unauthenticated).

**Rationale**: The invitation acceptance page must be accessible without authentication (new users don't have accounts yet). The `(auth)` route group is used for login, signup, and other unauthenticated pages. This follows the established pattern.

**Alternatives considered**:
- Top-level route `/invite/[token]`: Rejected — would bypass the `(auth)` layout with branded styling
- Under `(app)` with special auth bypass: Rejected — unnecessarily complex

## R7: Multipart Form Data Forwarding in BFF

**Decision**: In the BFF proxy `POST /api/admin/imports`, extract the file from the incoming request's FormData, create a new FormData, append the file blob and send_invitations flag, then forward to the backend using `fetch` with the FormData body (no explicit Content-Type header — let fetch set the multipart boundary).

**Rationale**: SvelteKit server endpoints can read `request.formData()` to get uploaded files. The file is a `Blob` object that can be directly appended to a new `FormData` for forwarding. Key gotcha: do NOT set `Content-Type: multipart/form-data` manually — the browser/fetch will auto-set it with the correct boundary.

**Alternatives considered**:
- Using apiClient helper: Rejected — apiClient uses JSON body; multipart needs raw fetch
- Base64 encoding the file: Rejected — increases size by 33%, unnecessary complexity

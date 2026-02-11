# Research: Identity Federation

## R1: Federation Page Tab Layout

**Decision**: Use a tab layout with 4 tabs: Overview, OIDC, SAML, Social — consistent with Settings page tab pattern from Phase 009.

**Rationale**: The existing Settings page uses Bits UI `Tabs` component with URL query params (`?tab=profile`) for tab state. This allows deep-linking and browser back/forward to work. The Federation page will follow the same pattern with `?tab=overview` as default.

**Alternatives considered**:
- Separate routes per module (`/federation/oidc/`, `/federation/saml/`, `/federation/social/`) — rejected because tab layout provides better UX for admins managing all three in one session, and it's consistent with Settings.
- Single page with sections — rejected because the content per module is substantial and tabs provide cleaner separation.

## R2: CRUD Form Pattern for Federation Entities

**Decision**: Use Superforms + Zod with server-side form actions for create/edit operations. Client-side validation with `zodClient()`. Each entity gets its own `create/+page.svelte` and `[id]/+page.svelte` with detail/edit forms.

**Rationale**: Consistent with existing NHI and User CRUD patterns. Server actions handle API calls securely through the BFF layer.

**Alternatives considered**:
- Client-side only forms with fetch — rejected because it bypasses Superforms validation and the established BFF pattern.
- Inline editing in the list — rejected because federation configs have too many fields for inline editing.

## R3: OIDC IdP Validation UX

**Decision**: Validation is triggered by a button on the IdP detail page. The button sends a POST to the BFF proxy, which forwards to `POST /admin/federation/identity-providers/{id}/validate`. Results are displayed inline with discovered endpoints on success or error details on failure.

**Rationale**: The backend already performs OpenID Connect discovery and JWKS validation. The frontend just needs to display results. No client-side validation of OIDC endpoints is needed.

**Alternatives considered**:
- Auto-validation on save — rejected because validation requires network calls to external IdPs and may take several seconds. Explicit user action is better UX.
- Validation in a modal — rejected because the results (discovered endpoints) are informational and fit naturally in the detail page.

## R4: Claim Mapping Configuration

**Decision**: Use a simple JSON textarea for claim mapping configuration, similar to the NHI tool schema input pattern. The backend expects a `ClaimMappingConfig` structure. The frontend will accept raw JSON and validate it as valid JSON before submission.

**Rationale**: Claim mapping is a power-user feature with variable structure. A free-form JSON editor is the simplest approach and consistent with the existing NHI tool schema pattern.

**Alternatives considered**:
- Visual claim mapping builder with drag-and-drop — rejected as overengineering for MVP. Can be added later.
- Key-value pair form fields — rejected because claim mapping can have nested structure (source claim, target attribute, transformation).

## R5: Certificate Upload UX

**Decision**: Use two `<textarea>` elements for PEM certificate and private key input. The admin pastes PEM-encoded content directly. Metadata fields (key_id, subject_dn, issuer_dn, not_before, not_after) are entered manually. The backend validates and encrypts the private key.

**Rationale**: PEM format is text-based and easily pasted. File upload would add complexity without benefit since PEM files are typically small text files. Metadata fields need to be entered because the frontend doesn't parse PEM certificates.

**Alternatives considered**:
- File upload with `<input type="file">` — considered but PEM files are just text, and textarea is simpler.
- Auto-extract metadata from PEM — would require a client-side x509 parser library (heavy dependency). The backend can validate.

## R6: Social Account Linking Flow

**Decision**: The frontend initiates OAuth linking by redirecting to `/api/social/link/{provider}/authorize`, which proxies to the backend. The backend handles the full OAuth flow and redirects back to a completion page. The frontend reads the result from URL params.

**Rationale**: OAuth flows require redirects to external providers. The backend manages state, PKCE, and token exchange. The frontend just needs to initiate and complete.

**Alternatives considered**:
- Popup window for OAuth — rejected because it adds complexity and some providers don't support popup flows.
- In-page iframe — rejected for security reasons (cross-origin restrictions).

## R7: Pagination Pattern for Federation Lists

**Decision**: Use offset/limit pagination for all federation lists, consistent with the existing users and personas patterns. The backend returns `{ items, total, offset, limit }` format.

**Rationale**: All federation admin endpoints use offset/limit pagination (not cursor-based). This is consistent with existing entity management patterns in the codebase.

**Alternatives considered**:
- Cursor-based pagination — not supported by the federation backend endpoints.
- Load-all approach — not suitable for potentially large lists.

## R8: Social Provider Configuration — Provider-Specific Fields

**Decision**: Render provider-specific form fields conditionally based on the selected provider. Microsoft shows Azure tenant field. Apple shows team_id and key_id fields. Google and GitHub use standard OAuth fields only.

**Rationale**: Each social provider has unique requirements beyond standard OAuth2. The UI should guide admins by showing only relevant fields.

**Alternatives considered**:
- Generic JSON config field for all providers — rejected because it provides poor UX for common providers.
- Separate forms per provider — rejected because most fields are shared (client_id, client_secret, scopes).

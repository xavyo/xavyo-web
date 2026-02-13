# Feature Specification: Identity Federation

**Feature Branch**: `011-identity-federation`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Phase 011: Identity Federation — Add federation management to xavyo-web"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - OIDC Federation Management (Priority: P1)

An administrator navigates to the Federation section in the sidebar and manages external OIDC Identity Providers. They can create a new IdP by entering a name, issuer URL, client ID, client secret, scopes, and claim mapping configuration. After creation, they can validate the IdP configuration (verifying OpenID Connect discovery and JWKS endpoints are reachable). They can enable/disable an IdP, manage domain-based routing for Home Realm Discovery (HRD), and edit or delete existing IdPs. The IdP list displays name, provider type, status (enabled/disabled), validation status, and linked domains.

**Why this priority**: OIDC is the most widely adopted federation protocol for enterprise SSO. Organizations need to connect corporate IdPs (Okta, Azure AD, Auth0) before meaningful identity governance can occur. This brings in the federated user population.

**Independent Test**: Navigate to Federation > OIDC tab, create an IdP with issuer URL and client credentials, validate the configuration, add a domain for HRD routing, enable the IdP, verify it appears in the list with correct status.

**Acceptance Scenarios**:

1. **Given** an admin on the Federation page, **When** they click "Add Identity Provider" and fill in name, issuer URL, client ID, client secret, and scopes, **Then** the IdP is created and appears in the list with "Disabled" status.
2. **Given** an existing IdP, **When** the admin clicks "Validate", **Then** the system checks OpenID Connect discovery and reports success (with discovered endpoints) or failure (with error details).
3. **Given** a validated IdP, **When** the admin enables it, **Then** the IdP status changes to "Enabled" and it becomes available for federated login.
4. **Given** an enabled IdP, **When** the admin adds a domain (e.g., "acme.com") for HRD, **Then** users with emails matching that domain are automatically routed to the federated IdP during login.
5. **Given** an IdP with linked domains, **When** the admin removes a domain, **Then** the domain is no longer used for HRD routing.
6. **Given** an existing IdP, **When** the admin edits the configuration (name, scopes, claim mapping), **Then** the changes are saved and reflected in the detail view.
7. **Given** an existing IdP, **When** the admin deletes it, **Then** the IdP is removed from the list after confirmation.

---

### User Story 2 - SAML Service Provider Management (Priority: P2)

An administrator manages SAML 2.0 Service Provider configurations and IdP signing certificates. They can register a new SP by providing entity ID, Assertion Consumer Service (ACS) URLs, optional SP certificate, attribute mapping, name ID format, and signing preferences. They can also manage IdP signing certificates: upload PEM certificates with private keys, and activate a certificate for SAML assertion signing (only one active at a time). The SP list displays name, entity ID, enabled status, and metadata URL.

**Why this priority**: SAML remains critical for enterprise applications (especially legacy systems). However, OIDC is more common for new integrations, making SAML the second priority.

**Independent Test**: Navigate to Federation > SAML tab, upload an IdP certificate, create a Service Provider with entity ID and ACS URL, enable signing, verify SP appears in the list.

**Acceptance Scenarios**:

1. **Given** an admin on the SAML tab, **When** they click "Add Service Provider" and fill in name, entity ID, and at least one ACS URL, **Then** the SP is created and appears in the list.
2. **Given** an existing SP, **When** the admin edits attribute mapping or signing options, **Then** the changes are saved.
3. **Given** an existing SP, **When** the admin deletes it, **Then** the SP is removed after confirmation.
4. **Given** the Certificates section, **When** the admin uploads a PEM certificate and private key, **Then** the certificate is stored and displayed with subject, issuer, and validity dates.
5. **Given** multiple certificates, **When** the admin activates one, **Then** only that certificate is active (previous active certificate is deactivated).

---

### User Story 3 - Social Login Configuration (Priority: P3)

An administrator configures social login providers (Google, Microsoft, Apple, GitHub) for the tenant. For each provider, they enter client ID, client secret, scopes, and provider-specific configuration (Azure tenant ID for Microsoft, team ID and key ID for Apple). They can enable or disable individual providers. Additionally, regular users can view and manage their linked social accounts from their Settings page — linking new accounts and unlinking existing ones.

**Why this priority**: Social login improves user experience for consumer-facing deployments. It's lower priority than enterprise federation (OIDC/SAML) but adds significant convenience.

**Independent Test**: Navigate to Federation > Social tab, configure Google provider with client ID and secret, enable it. Then as a regular user, navigate to Settings > Social Connections, verify Google appears as linkable.

**Acceptance Scenarios**:

1. **Given** an admin on the Social tab, **When** they select a provider (e.g., Google) and enter client ID, client secret, and scopes, **Then** the provider configuration is saved.
2. **Given** a configured provider, **When** the admin toggles it to enabled, **Then** the provider becomes available on the login page.
3. **Given** a configured provider, **When** the admin disables it, **Then** the provider is no longer available for login but existing linked accounts are preserved.
4. **Given** a configured Microsoft provider, **When** the admin enters an Azure tenant ID in additional configuration, **Then** the tenant-specific OAuth flow is used.
5. **Given** a regular user on the Social Connections settings page, **When** they click "Link" for an enabled provider, **Then** they are redirected to the provider's OAuth flow and upon success the account is linked.
6. **Given** a user with a linked social account, **When** they click "Unlink", **Then** the social connection is removed after confirmation.

---

### User Story 4 - Federation Overview Dashboard (Priority: P4)

An administrator sees a Federation overview page that summarizes all configured federation connections across OIDC, SAML, and Social modules. The dashboard shows counts and status indicators: number of enabled/total OIDC IdPs, SAML SPs, and Social providers. Each section has quick-action links to navigate to the respective management pages. The dashboard provides at-a-glance visibility into the tenant's federation posture.

**Why this priority**: The overview is a convenience feature that improves navigation but doesn't add core functionality. All management can be done from the individual tabs.

**Independent Test**: Navigate to Federation, verify the overview tab shows correct counts of configured IdPs/SPs/providers with status indicators and working navigation links.

**Acceptance Scenarios**:

1. **Given** an admin navigating to the Federation page, **When** the page loads, **Then** they see a summary dashboard with counts for OIDC IdPs, SAML SPs, and Social providers.
2. **Given** the overview dashboard, **When** an OIDC IdP is enabled, **Then** the count reflects the enabled/total ratio (e.g., "2 of 3 enabled").
3. **Given** the overview dashboard, **When** the admin clicks a section link (e.g., "Manage OIDC"), **Then** they are navigated to the corresponding tab.

---

### Edge Cases

- What happens when an admin tries to validate an IdP with an unreachable issuer URL? The system displays a clear error message with the specific failure (DNS resolution, connection timeout, invalid response).
- What happens when an admin tries to delete an IdP that has linked users? The system shows a warning with the count of affected users and requires explicit confirmation.
- What happens when an admin uploads an expired certificate? The system accepts the upload but displays a warning about the expiry date.
- What happens when an admin tries to activate a certificate with an invalid private key? The system rejects the activation with a clear error.
- What happens when a user tries to unlink their only authentication method? The system prevents unlinking if the social account is the user's sole authentication method.
- What happens when the admin configures duplicate domains across multiple IdPs? The system rejects the duplicate domain with an error indicating which IdP already owns it.
- What happens when Apple provider configuration is missing required team_id or key_id? The system validates provider-specific required fields and shows specific validation errors.
- What happens when the admin list has many IdPs/SPs? The list is paginated with standard pagination controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to create, read, update, and delete OIDC external Identity Provider configurations
- **FR-002**: System MUST validate OIDC IdP configurations by performing OpenID Connect discovery and JWKS endpoint verification
- **FR-003**: System MUST allow administrators to enable or disable individual OIDC IdPs
- **FR-004**: System MUST allow administrators to manage domain-based routing rules for Home Realm Discovery (HRD) per IdP
- **FR-005**: System MUST support claim mapping configuration for OIDC IdPs to map external claims to internal user attributes
- **FR-006**: System MUST allow administrators to create, read, update, and delete SAML 2.0 Service Provider configurations
- **FR-007**: System MUST allow administrators to upload, list, and activate IdP signing certificates for SAML assertions
- **FR-008**: System MUST enforce that only one IdP signing certificate is active at a time per tenant
- **FR-009**: System MUST allow administrators to configure social login providers (Google, Microsoft, Apple, GitHub) with client credentials and provider-specific settings
- **FR-010**: System MUST allow administrators to enable or disable individual social login providers
- **FR-011**: System MUST allow authenticated users to view their linked social accounts
- **FR-012**: System MUST allow authenticated users to link new social accounts via OAuth flow
- **FR-013**: System MUST allow authenticated users to unlink existing social accounts
- **FR-014**: System MUST display a Federation overview dashboard showing counts and status of all federation connections
- **FR-015**: System MUST restrict all federation management actions to users with the administrator role
- **FR-016**: System MUST paginate lists of IdPs, Service Providers, and certificates when the count exceeds the page size
- **FR-017**: System MUST display validation status (valid/invalid/not validated) for OIDC IdPs
- **FR-018**: System MUST display certificate details including subject, issuer, validity period, and active status
- **FR-019**: System MUST require confirmation before deleting IdPs, SPs, or unlinking social accounts
- **FR-020**: System MUST validate provider-specific required fields (Azure tenant for Microsoft, team_id/key_id for Apple) before saving social provider configuration

### Key Entities

- **Identity Provider (OIDC)**: External OIDC-compliant identity provider. Key attributes: name, provider type, issuer URL, client credentials (encrypted), scopes, claim mapping, enabled status, validation status, associated domains.
- **Service Provider (SAML)**: SAML 2.0 relying party. Key attributes: name, entity ID, ACS URLs, SP certificate, attribute mapping, name ID format, signing options, enabled status, metadata URL.
- **IdP Certificate**: Signing certificate for SAML assertions. Key attributes: certificate PEM, private key (encrypted), key ID, subject DN, issuer DN, validity period, active status.
- **Social Provider Configuration**: Tenant-level OAuth provider settings. Key attributes: provider name (Google/Microsoft/Apple/GitHub), client ID, client secret (encrypted), scopes, additional config, enabled status.
- **Social Connection**: User-level link to a social account. Key attributes: provider, external email, display name, creation date.
- **Identity Provider Domain**: Domain-to-IdP routing rule for HRD. Key attributes: domain name, priority, associated IdP.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create and configure an OIDC Identity Provider in under 3 minutes
- **SC-002**: Administrators can validate an OIDC IdP configuration and receive results within 10 seconds
- **SC-003**: Administrators can register a SAML Service Provider in under 2 minutes
- **SC-004**: Administrators can upload and activate a signing certificate in under 1 minute
- **SC-005**: Administrators can configure a social login provider in under 2 minutes
- **SC-006**: Users can link a social account in under 30 seconds (excluding external provider time)
- **SC-007**: The Federation overview dashboard loads and displays status within 3 seconds
- **SC-008**: All federation management actions are restricted to administrators with 100% enforcement
- **SC-009**: 95% of administrators can complete federation setup tasks on first attempt without documentation

## Assumptions

- The backend (xavyo-idp) provides all required REST APIs for OIDC, SAML, and Social federation management
- Administrator role is determined by JWT claims and includes both "admin" and "super_admin" roles
- Client secrets and private keys are encrypted at rest by the backend; the frontend never stores sensitive credentials
- The BFF proxy pattern is used consistently: all API calls flow through SvelteKit server endpoints
- Social account linking uses OAuth redirect flows handled by the backend; the frontend initiates and completes the flow
- Pagination for IdPs and SPs uses offset/limit format (consistent with existing patterns for users/personas)
- The Federation section is admin-only and appears in the sidebar only for administrators
- Certificate upload accepts PEM format only
- Domain validation for HRD is handled by the backend (the frontend submits domain strings)

## Scope Boundaries

### In Scope
- OIDC IdP CRUD, validation, enable/disable, domain management
- SAML SP CRUD, certificate upload/activate
- Social provider configuration (4 providers), user account linking/unlinking
- Federation overview dashboard
- BFF proxy endpoints for all federation APIs
- Admin-only access controls

### Out of Scope
- SAML SSO flow execution (handled entirely by backend)
- OIDC authorization flow execution (handled entirely by backend)
- Social OAuth login flow (handled by backend; frontend only manages configuration and account linking)
- Domain ownership verification (DNS-based validation)
- Federation session management
- SCIM provisioning
- Certificate generation (admin must provide PEM files)

## Dependencies

- Phase 008 (Visual Redesign): Design system, dark mode, component library
- Phase 009 (Security & Self-Service): Settings page structure for social connections tab
- Phase 010 (Audit & Compliance): Admin role check utility (`hasAdminRole`)

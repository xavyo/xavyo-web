# Data Model: Tenant Administration & Self-Service Dashboards

## Entity: BrandingConfig

Tenant-level appearance configuration. One per tenant, always exists (created with defaults).

| Field | Type | Notes |
|-------|------|-------|
| logo_url | string \| null | Primary logo URL |
| logo_dark_url | string \| null | Logo for dark mode |
| favicon_url | string \| null | Favicon URL |
| email_logo_url | string \| null | Logo used in email templates |
| primary_color | string \| null | Hex color code |
| secondary_color | string \| null | Hex color code |
| accent_color | string \| null | Hex color code |
| background_color | string \| null | Hex color code |
| text_color | string \| null | Hex color code |
| font_family | string \| null | Font family name |
| custom_css | string \| null | Custom CSS (up to 10KB) |
| login_page_title | string \| null | Login page heading |
| login_page_subtitle | string \| null | Login page subheading |
| login_page_background_url | string \| null | Background image URL |
| footer_text | string \| null | Footer text on login page |
| privacy_policy_url | string \| null | Legal URL |
| terms_of_service_url | string \| null | Legal URL |
| support_url | string \| null | Support page URL |
| updated_at | string (ISO datetime) | Last update timestamp |

**Relationships**: None (standalone tenant config)
**Validation**: URL fields must be valid URLs when non-empty. Color fields should match hex pattern.
**State Transitions**: None (always exists, partial update)

## Entity: OAuthClient

A registered OAuth/OIDC application client.

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Internal ID |
| client_id | string | OAuth client identifier (public) |
| name | string | Human-readable client name |
| client_type | 'confidential' \| 'public' | Client classification |
| redirect_uris | string[] | Allowed redirect URIs |
| grant_types | string[] | e.g., 'authorization_code', 'client_credentials', 'refresh_token' |
| scopes | string[] | Allowed OAuth scopes |
| is_active | boolean | Whether client can be used |
| created_at | string (ISO datetime) | |
| updated_at | string (ISO datetime) | |

**Create response also includes**: `client_secret: string` (shown once only)

**Relationships**: Belongs to tenant (implicit via auth context)
**Validation**: name required (1-255 chars), at least one redirect_uri for non-client_credentials grants, client_type required
**State Transitions**: active ↔ inactive (toggle), deletion

## Entity: UserGroup

An organizational group of users (distinct from governance approval groups).

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | |
| name | string | Group name |
| description | string \| null | Optional description |
| member_count | number | Count of members (in list view) |
| members | GroupMember[] | Full member list (in detail view) |
| created_at | string (ISO datetime) | |
| updated_at | string (ISO datetime) | |

### Sub-entity: GroupMember

| Field | Type | Notes |
|-------|------|-------|
| user_id | string (UUID) | |
| email | string | User's email |
| display_name | string \| null | User's display name |
| joined_at | string (ISO datetime) | When added to group |

**Relationships**: Contains many users (via membership)
**Validation**: name required (1-255 chars)
**State Transitions**: None (CRUD only)

## Entity: ApprovalItem

A pending or completed approval task assigned to the current user.

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Approval item ID |
| request_id | string (UUID) | Linked access request |
| requester_id | string (UUID) | Who made the request |
| requester_email | string | Requester email |
| resource_type | string | What was requested (e.g., entitlement) |
| resource_name | string | Name of requested resource |
| reason | string \| null | Requester's justification |
| status | 'pending' \| 'approved' \| 'rejected' | Current status |
| decision_comment | string \| null | Approver's comment |
| submitted_at | string (ISO datetime) | Request submission time |
| decided_at | string \| null (ISO datetime) | When decision was made |

**Relationships**: Links to access request, requester user
**Validation**: N/A (read-only entity, actions are approve/reject)
**State Transitions**: pending → approved, pending → rejected

## Entity: CertificationItem

A review task assigned to the current user as a certification reviewer.

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Item ID |
| campaign_id | string (UUID) | Parent campaign |
| campaign_name | string | Campaign name |
| user_id | string (UUID) | User being certified |
| user_email | string | User's email |
| entitlements | string[] | Entitlement names being certified |
| status | 'pending' \| 'certified' \| 'revoked' | Current status |
| due_date | string \| null (ISO datetime) | Campaign deadline |
| decided_at | string \| null (ISO datetime) | When decision was made |

**Relationships**: Links to certification campaign, user under review
**Validation**: N/A (read-only entity, actions are certify/revoke)
**State Transitions**: pending → certified, pending → revoked

## Pagination Formats

| Endpoint | Format | Key Differences |
|----------|--------|----------------|
| `/admin/groups` | `{groups, pagination: {limit, offset, has_more}}` | Uses `groups` key, pagination in sub-object |
| `/admin/oauth/clients` | `{clients, total}` | Uses `clients` key, flat total, no offset |
| `/governance/my-approvals` | `{items, total, limit, offset}` | Standard governance format |
| `/governance/my-certifications` | `{items, total, page, page_size}` | Page-based (not offset-based) |

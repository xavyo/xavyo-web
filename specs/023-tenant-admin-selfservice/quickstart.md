# Quickstart: Tenant Administration & Self-Service Dashboards

## Prerequisites

- Node.js 20+, npm
- xavyo-idp backend running on `localhost:8080`
- Test credentials: `pascal@leclech.fr` / `TestPass123!` (super_admin)
- Tenant ID: `872b59e4-3b3f-4f77-839b-f97d5045c25e`

## Running the App

```bash
npm run dev
```

Navigate to `http://localhost:5173/login` and sign in.

## Test Scenarios

### Tenant Branding (Admin)

1. Navigate to Settings → Branding tab
2. Verify current branding config loads (may be defaults/nulls)
3. Update primary color to `#EF4444`, login page title to "Welcome to Acme"
4. Save → verify success toast
5. Reload page → verify saved values persist
6. Test validation: enter invalid color format → expect inline error
7. Test partial update: change only one field → other fields unchanged

### OAuth Client Management (Admin)

1. Navigate to Settings → OAuth Clients tab
2. Verify empty state or existing clients listed
3. Click "Create Client" → fill form: name "Test App", type "confidential", redirect URI `https://app.example.com/callback`, grant types [authorization_code, refresh_token], scopes [openid, profile]
4. Submit → verify client created with client_secret shown once
5. Copy/note the secret → navigate away → verify secret no longer visible
6. Click client in list → verify detail page shows all fields
7. Edit client name → save → verify updated
8. Toggle active status → verify badge updates
9. Delete client → confirm dialog → verify removed from list

### User Group Management (Admin)

1. Navigate to Groups in sidebar
2. Verify empty state or existing groups listed
3. Create group: name "Engineering", description "Engineering team"
4. Verify group appears in list with member_count=0
5. Click group → detail page → verify member list empty
6. Add members: search/select users → add → verify member count updates
7. Remove a member → verify removed from list
8. Edit group name/description → save → verify updated
9. Delete group → confirm → verify removed

### My Approvals (Self-Service)

1. Navigate to My Approvals in sidebar
2. Verify list loads (may be empty if no pending approvals)
3. If items exist: verify requester, resource, reason, timestamp shown
4. Click Approve on an item → enter comment → submit → verify status changes
5. Click Reject on another item → enter comment → submit → verify status changes
6. Filter by status: "pending" → only pending shown; "all" → all shown

### My Certifications (Self-Service)

1. Navigate to My Certifications in sidebar
2. Verify list loads (may be empty if no assigned certifications)
3. If items exist: verify user being reviewed, entitlements, campaign, due date shown
4. Click Certify on an item → verify status changes to "certified"
5. Click Revoke on another item → verify status changes to "revoked"
6. Filter by campaign or status

## Running Tests

```bash
npm run test:unit
```

All existing tests plus new Phase 023 tests should pass.

## Key Integration Points

- Branding: `GET/PUT /admin/branding` — partial update semantics
- OAuth Clients: `GET/POST/PUT/DELETE /admin/oauth/clients` — client_secret on create only
- Groups: `GET/POST/PUT/DELETE /admin/groups` + member management sub-endpoints
- My Approvals: `GET /governance/my-approvals` + approve/reject actions with comment
- My Certifications: `GET /governance/my-certifications` + certify/revoke actions

## Pagination Formats

| Endpoint | Format |
|----------|--------|
| Groups | `{groups, pagination: {limit, offset, has_more}}` |
| OAuth Clients | `{clients, total}` |
| My Approvals | `{items, total, limit, offset}` |
| My Certifications | `{items, total, page, page_size}` |

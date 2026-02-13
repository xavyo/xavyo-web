# Quickstart: Identity Federation

## Scenario 1: Configure OIDC Identity Provider (Admin)

1. Log in as admin
2. Navigate to Federation > OIDC tab
3. Click "Add Identity Provider"
4. Fill in:
   - Name: "Corporate Okta"
   - Issuer URL: "https://corp.okta.com"
   - Client ID: "0oa1bcde..."
   - Client Secret: "secret..."
   - Scopes: "openid profile email"
5. Submit form → IdP created with "Disabled" status
6. Click "Validate" → System checks OIDC discovery → Shows discovered endpoints
7. Add domain "acme.com" for HRD routing
8. Click "Enable" → IdP becomes active
9. Verify IdP appears in list with "Enabled" + "Valid" badges

## Scenario 2: Register SAML Service Provider (Admin)

1. Log in as admin
2. Navigate to Federation > SAML tab
3. First, upload a signing certificate:
   - Click "Upload Certificate"
   - Paste PEM certificate and private key
   - Enter key_id, subject_dn, issuer_dn, validity dates
   - Submit → Certificate appears in certificates list
   - Click "Activate" → Certificate becomes active for signing
4. Click "Add Service Provider"
5. Fill in:
   - Name: "Salesforce SSO"
   - Entity ID: "https://salesforce.com/sp"
   - ACS URL: "https://salesforce.com/acs"
   - Sign Assertions: checked
6. Submit → SP appears in list
7. Verify SP detail shows correct configuration

## Scenario 3: Configure Social Login (Admin)

1. Log in as admin
2. Navigate to Federation > Social tab
3. See all 4 providers listed (Google, Microsoft, Apple, GitHub)
4. Click Google card → Enter client ID and secret
5. Toggle "Enable" → Google becomes available for login
6. For Microsoft: also enter Azure tenant ID
7. For Apple: also enter team_id and key_id
8. Verify enabled providers show green status indicators

## Scenario 4: Link Social Account (User)

1. Log in as regular user
2. Navigate to Settings > Social Connections tab
3. See list of available providers (enabled by admin)
4. Click "Link" next to Google
5. Redirected to Google OAuth consent screen
6. Authorize → Redirected back to Settings
7. Google account now shows as linked with email
8. Click "Unlink" → Confirm → Connection removed

## Scenario 5: Federation Overview Dashboard (Admin)

1. Log in as admin
2. Click "Federation" in sidebar
3. Overview tab shows:
   - OIDC: "2 of 3 enabled" with "Manage" link
   - SAML: "1 SP configured" with "Manage" link
   - Social: "2 of 4 enabled" with "Manage" link
4. Click "Manage OIDC" → Navigates to OIDC tab

## Scenario 6: Edge Case — Validate Unreachable IdP

1. Create IdP with bad issuer URL (e.g., "https://nonexistent.example.com")
2. Click "Validate"
3. System shows error: "Failed to discover OIDC configuration: Connection timed out"
4. Validation status shows "Invalid"
5. Admin corrects URL, re-validates → Success

## Scenario 7: Edge Case — Delete IdP with Linked Users

1. Navigate to IdP detail that has linked users
2. Click "Delete"
3. System shows warning: "This IdP has 15 linked users. Deleting will prevent them from logging in via federation."
4. Admin must confirm to proceed

# Quickstart: Webhooks & Authorization Policy Management

## Webhook Subscription Flow

### 1. View Event Types
Navigate to Settings → Webhooks. The create form should show available event types loaded from the backend.

### 2. Create a Subscription
1. Click "Create Subscription"
2. Enter: Name = "Test Webhook", URL = "https://example.com/hook"
3. Select event types: "user.created", "user.updated"
4. Optionally enter a secret for HMAC signature verification
5. Submit → redirected to detail page with toast "Subscription created"

### 3. View Subscription Detail
The detail page shows:
- Configuration (name, URL, event types, enabled status)
- Delivery statistics (derived from delivery history)
- Recent deliveries table with pagination

### 4. Pause/Resume Subscription
- Click "Pause" → PATCH with `enabled: false` → status shows "Paused"
- Click "Resume" → PATCH with `enabled: true` → status shows "Active"

### 5. Edit Subscription
- Click "Edit" → modify fields → Submit → updated configuration shown

### 6. View DLQ
- Navigate to the DLQ tab/page
- See failed deliveries with error details
- Click "Retry" on an entry → replays the delivery
- Click "Delete" → removes the DLQ entry

### 7. Delete Subscription
- Click "Delete" → confirm dialog → redirected to list

## Authorization Policy Flow

### 1. Create a Policy
1. Navigate to Governance → Authorization
2. Click "Create Policy"
3. Enter: Name = "Allow Admin Read Users", Effect = "allow"
4. Resource Type = "users", Action = "read"
5. Priority = 100
6. Optionally add conditions (e.g., user_attribute: role equals admin)
7. Submit → redirected to detail page

### 2. View Policies
The policy list shows all policies with name, effect badge, status badge, priority, and timestamps.

### 3. Enable/Disable a Policy
- On detail page, click "Disable" → PUT with `status: "inactive"`
- Click "Enable" → PUT with `status: "active"`

### 4. Edit a Policy
- Click "Edit" → modify fields → Submit → updated configuration

### 5. Deactivate (Delete) a Policy
- Click "Delete" → confirm dialog → policy is soft-deleted (deactivated)
- Redirected to list

## Entitlement Mappings Flow

### 1. View Mappings
Navigate to Governance → Authorization → Mappings tab/page.

### 2. Create a Mapping
1. Click "Create Mapping"
2. Select an entitlement from dropdown (loaded from governance API)
3. Enter Resource Type = "users", Action = "read"
4. Submit → mapping created

### 3. Delete a Mapping
- Click "Delete" → confirm → mapping removed

## Authorization Test Tool Flow

### 1. Run a Test
1. Navigate to Governance → Authorization → Test tab/page
2. Enter: User ID = "uuid", Resource Type = "users", Action = "read"
3. Click "Check"
4. See result: "Allowed" / "Denied" with reason and source

## Test Scenarios for E2E

1. **Webhook CRUD**: Create subscription → verify in list → edit → pause → resume → delete
2. **Webhook Deliveries**: Create subscription → trigger event → verify delivery in history
3. **DLQ**: View DLQ entries → retry one → delete one
4. **Policy CRUD**: Create policy → verify in list → edit → disable → enable → deactivate
5. **Mapping CRUD**: Create mapping → verify in list → delete
6. **Auth Test**: Create allow policy → test check → expect allowed → disable policy → test again → expect denied

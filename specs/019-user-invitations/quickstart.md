# Quickstart: User Invitations

## Integration Scenarios

### Scenario 1: View Invitation List (P1)

1. Admin navigates to `/invitations`
2. Page loads with paginated list of invitations
3. Each row shows: email, status badge, created date, expires date, actions
4. Admin can filter by status (All/Sent/Cancelled/Accepted)
5. Admin can search by email
6. Empty state shows "Invite User" CTA when no invitations exist

### Scenario 2: Create Invitation (P2)

1. Admin clicks "Invite User" button on list page
2. Navigates to `/invitations/create`
3. Admin enters email address
4. Admin submits form
5. Backend creates invitation and sends email
6. Admin redirected to list page with success toast
7. New invitation appears in list with "sent" status

### Scenario 3: Resend Invitation (P3)

1. Admin sees a "sent" invitation in the list
2. Admin clicks "Resend" button on that row
3. System resends the invitation email
4. Success toast confirms resend
5. No status change (still "sent")

### Scenario 4: Cancel Invitation (P3)

1. Admin sees a "sent" invitation in the list
2. Admin clicks "Cancel" button on that row
3. Confirmation dialog appears
4. Admin confirms cancellation
5. Invitation status changes to "cancelled"
6. Success toast confirms cancellation
7. Cancel/Resend buttons are now disabled for this invitation

### Scenario 5: Expired Invitation Display

1. An invitation was created 8 days ago (past 7-day expiry)
2. Backend still shows status as "sent"
3. Frontend computes: `expires_at < now && status === 'sent'` → shows "Expired" badge
4. Resend and Cancel buttons are disabled for expired invitations

## Test Approach

### Unit Tests
- Zod schemas: valid/invalid email, required fields
- API client functions: mock fetch, verify URLs and headers
- Page server load: admin redirect, data loading
- Page server action: form validation, API error handling

### E2E Tests (Chrome MCP)
- Navigate to invitations list, verify empty state
- Create invitation, verify appears in list
- Resend invitation, verify toast
- Cancel invitation, verify status change
- Filter by status, verify results
- Dark mode toggle, verify rendering

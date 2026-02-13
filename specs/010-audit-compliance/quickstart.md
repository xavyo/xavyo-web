# Quickstart: Audit & Compliance

## Prerequisites

- xavyo-idp running on localhost:8080
- xavyo-web dev server running (`npm run dev`)
- A user account with login history (log in/out a few times to generate data)
- An admin account for testing admin audit features

## Test Scenarios

### Scenario 1: View Security Alerts (US1)

1. Log in to the application
2. Navigate to Settings (sidebar or header dropdown)
3. Click the "Alerts" tab
4. Verify the alerts list shows with type badges, severity indicators, and timestamps
5. Apply filters: select "warning" severity → only warning alerts shown
6. Apply filters: select "unacknowledged" status → only unreviewed alerts shown
7. Click "Acknowledge" on an alert → alert shows acknowledged timestamp, badge count decreases
8. Click "Load more" if pagination available → more alerts appended to list

### Scenario 2: View Personal Login History (US2)

1. Log in to the application
2. Navigate to Settings
3. Click the "Login History" tab
4. Verify the list shows login attempts with status, method, IP, location, and device info
5. Set a date range filter (e.g., last 3 days) → only entries in range shown
6. Filter by "Failed" status → only failed attempts shown with failure reasons
7. Look for "New device" and "New location" badges on applicable entries
8. Click "Load more" if pagination available → more entries appended

### Scenario 3: Admin Audit Dashboard (US3)

1. Log in as an admin user
2. Navigate to "Audit" in the sidebar
3. Verify the page shows:
   - Statistics panel with total/success/fail counts, success rate, unique users
   - Hourly distribution bar chart
   - Failure reasons breakdown (if any)
   - Login attempts list
4. Change the date range → stats and list update
5. Filter by email → only matching user's attempts shown
6. Filter by auth method "password" → only password logins shown
7. Verify a non-admin user does NOT see "Audit" in the sidebar

### Scenario 4: Per-User Activity Timeline (US4)

1. Log in as an admin user
2. Navigate to Users → click on a user
3. Scroll to the "Activity" section on the user detail page
4. Verify it shows the user's recent login attempts (up to 10)
5. Click "View all" → see full paginated login history for that user
6. For a user with no activity, verify an empty state is shown

## Verification Checklist

- [ ] Security alerts list renders with correct data
- [ ] Alert filters (type, severity, acknowledged) work correctly
- [ ] Alert acknowledge updates badge count and alert status
- [ ] Login history renders with all fields
- [ ] Date range filter narrows login history results
- [ ] Success/failure filter works on login history
- [ ] "Load more" pagination works for all lists
- [ ] Admin audit dashboard shows statistics and list
- [ ] Admin statistics update when date range changes
- [ ] Hourly distribution bar chart renders correctly
- [ ] Admin filters (user, email, method, date, success) work
- [ ] Non-admin users cannot access admin audit page
- [ ] Per-user activity timeline shows on user detail page
- [ ] Empty states shown when no data exists
- [ ] Error states with retry shown on API failure
- [ ] Works in both light and dark mode
- [ ] Responsive layout at mobile widths

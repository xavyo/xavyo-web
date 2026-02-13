# Feature Specification: Audit & Compliance

**Feature Branch**: `010-audit-compliance`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Phase 010: Audit & Compliance — Add audit visibility and compliance features to the xavyo-web identity governance platform."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Security Alerts (Priority: P1)

As a user, I want to view and manage security alerts so that I am aware of suspicious activity on my account and can take action. The system generates alerts for events such as logins from new devices, logins from new locations, multiple failed login attempts, password changes, and MFA being disabled. Each alert has a severity level (info, warning, critical) and can be acknowledged to mark it as reviewed.

The alerts are accessible from the Settings page (Security tab) with an unacknowledged count badge displayed in the navigation to draw attention to pending alerts. Users can filter alerts by type, severity, and acknowledgment status.

**Why this priority**: Security alerts are the most critical audit feature — they directly protect user accounts by surfacing suspicious activity that may require immediate action (e.g., unauthorized access from a new device or location).

**Independent Test**: Can be fully tested by triggering alert-generating events (login from new device, failed attempts) and verifying the alerts appear in the list with correct type, severity, and metadata. Acknowledging an alert should update its status. Filtering should narrow results correctly.

**Acceptance Scenarios**:

1. **Given** a user has unacknowledged security alerts, **When** they navigate to the Security Alerts section, **Then** they see a list of alerts with type, severity, title, message, and timestamp, sorted newest first.
2. **Given** a user views their alerts, **When** they apply a filter by type (e.g., "new_device"), **Then** only alerts of that type are displayed.
3. **Given** a user views their alerts, **When** they apply a filter by severity (e.g., "critical"), **Then** only critical alerts are displayed.
4. **Given** a user views their alerts, **When** they filter by acknowledgment status "unacknowledged", **Then** only unreviewed alerts are shown.
5. **Given** a user sees an unacknowledged alert, **When** they click "Acknowledge", **Then** the alert is marked as acknowledged with a timestamp, and the unacknowledged count decreases.
6. **Given** there are more alerts than fit on one page, **When** the user scrolls or clicks "Load more", **Then** additional alerts are loaded using cursor-based pagination.
7. **Given** the user has unacknowledged alerts, **When** they view any page in the application, **Then** a badge on the navigation item shows the unacknowledged count.

---

### User Story 2 - Personal Login History (Priority: P2)

As a user, I want to view my login history so that I can verify all access to my account was authorized. The login history shows each login attempt with success/failure status, authentication method used, IP address, device information (user agent), geographic location (country and city), and indicators for whether the login came from a new device or new location.

Users can filter by date range and success/failure status to investigate specific time periods or suspicious activity.

**Why this priority**: Login history is the second most important audit feature — it gives users direct visibility into who accessed their account and when, enabling them to detect unauthorized access that may not have triggered an alert.

**Independent Test**: Can be fully tested by logging in from different contexts and verifying the history entries appear with correct details. Date range and success filters should narrow results. Cursor pagination should load additional pages.

**Acceptance Scenarios**:

1. **Given** a user has login history, **When** they navigate to the Login History section, **Then** they see a chronological list (newest first) of login attempts with status, method, IP, device info, location, and new device/location indicators.
2. **Given** a user wants to investigate a specific period, **When** they set a date range filter, **Then** only login attempts within that range are displayed.
3. **Given** a user wants to see failed logins, **When** they filter by "Failed" status, **Then** only failed login attempts are displayed, each showing the failure reason.
4. **Given** a login was from a new device, **When** the entry is displayed, **Then** a "New device" indicator is shown alongside the entry.
5. **Given** a login was from a new location, **When** the entry is displayed, **Then** a "New location" indicator is shown alongside the entry.
6. **Given** there are more entries than fit on one page, **When** the user clicks "Load more" or scrolls, **Then** additional entries are loaded using cursor-based pagination.

---

### User Story 3 - Admin Audit Dashboard (Priority: P3)

As an administrator, I want to view tenant-wide login activity and statistics so that I can monitor organizational security posture and detect patterns of suspicious behavior. The admin audit dashboard provides both a detailed list of all login attempts across the tenant and aggregated statistics including total/successful/failed attempt counts, success rate, hourly distribution chart data, unique user count, and counts of logins from new devices and locations.

Administrators can filter the list by specific user, email, authentication method, date range, and success status. The statistics panel provides a high-level overview for a selected date range.

**Why this priority**: The admin dashboard is critical for organizational security but depends on the same data patterns as the personal login history (US2). It adds admin-only capabilities: tenant-wide visibility, per-user filtering, and aggregated statistics.

**Independent Test**: Can be fully tested by having multiple users generate login activity, then verifying the admin can see all tenant activity, filter by user/email/method, and view accurate aggregated statistics for a selected date range.

**Acceptance Scenarios**:

1. **Given** an administrator navigates to the Audit section, **When** the page loads, **Then** they see a list of all tenant login attempts and a statistics summary panel for the default date range (last 7 days).
2. **Given** the admin views the login attempts list, **When** they filter by a specific user ID or email, **Then** only that user's login attempts are shown.
3. **Given** the admin views the login attempts list, **When** they filter by authentication method (e.g., "password", "social", "sso"), **Then** only attempts using that method are shown.
4. **Given** the admin selects a date range, **When** the statistics panel updates, **Then** it shows accurate counts for total attempts, successful attempts, failed attempts, success rate percentage, unique users, new device logins, and new location logins.
5. **Given** the admin views the statistics panel, **When** they look at the hourly distribution, **Then** they see a breakdown of login activity by hour (0-23) for the selected date range.
6. **Given** the admin views the statistics panel, **When** there are failed attempts, **Then** they see a breakdown of failure reasons with counts.
7. **Given** a non-admin user attempts to access the admin audit section, **Then** they are denied access or the section is not visible.

---

### User Story 4 - Per-User Activity Timeline (Priority: P4)

As an administrator viewing a user's detail page, I want to see that user's recent login activity so that I can investigate specific user behavior without leaving the user management context. The activity timeline is embedded as a section or tab within the existing user detail page, showing the user's most recent login attempts with the same detail as the personal login history.

**Why this priority**: This enriches the existing user management pages (from Phase 004) with audit context, providing a natural workflow for admins investigating a specific user. It reuses the same data and components as US2 and US3.

**Independent Test**: Can be fully tested by navigating to an existing user's detail page and verifying the activity timeline section shows that user's login attempts with correct details, filtered to only that user.

**Acceptance Scenarios**:

1. **Given** an administrator views a user's detail page, **When** the page loads, **Then** an activity timeline section shows the user's most recent login attempts (default: last 10).
2. **Given** the activity timeline is displayed, **When** entries exist, **Then** each entry shows timestamp, success/failure, auth method, IP, and location.
3. **Given** the user has more activity than the default display, **When** the admin clicks "View all" or "Load more", **Then** they see the full paginated login history for that user.
4. **Given** the user has no login history, **When** the admin views the activity timeline, **Then** an empty state message is displayed (e.g., "No login activity recorded").

---

### Edge Cases

- What happens when a user has no login history? An empty state with a descriptive message is shown.
- What happens when a user has no security alerts? An empty state is shown and the unacknowledged count badge is hidden.
- What happens when the alert list cannot be loaded (network error)? An error message with retry option is displayed.
- What happens when an admin filters to a date range with no data? An empty state with a message indicating no results for the selected period.
- What happens when the admin statistics endpoint fails but the list loads? The list is shown with a warning that statistics are temporarily unavailable.
- What happens when a user tries to acknowledge an already-acknowledged alert? The system handles it gracefully (no error, the alert remains acknowledged).
- What happens when cursor pagination reaches the end? The "Load more" button is hidden or disabled.
- What happens when a non-admin user tries to access admin audit routes? They are redirected or shown a 403 Forbidden page.
- What happens when the statistics date range is invalid (end before start)? Client-side validation prevents the request.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of the current user's security alerts with type, severity, title, message, metadata, acknowledgment status, and creation timestamp.
- **FR-002**: System MUST allow users to filter security alerts by type (new_device, new_location, failed_attempts, password_change, mfa_disabled), severity (info, warning, critical), and acknowledgment status (all, acknowledged, unacknowledged).
- **FR-003**: System MUST allow users to acknowledge individual security alerts, updating the alert's acknowledged timestamp.
- **FR-004**: System MUST display an unacknowledged alert count badge in the application navigation that updates when alerts are acknowledged.
- **FR-005**: System MUST display the current user's login history with success/failure status, authentication method, IP address, user agent, geographic location (country, city), new device indicator, and new location indicator.
- **FR-006**: System MUST allow users to filter login history by date range (start date, end date) and success/failure status.
- **FR-007**: System MUST support cursor-based pagination for both security alerts and login history, loading additional items on demand.
- **FR-008**: System MUST provide administrators with a tenant-wide view of all login attempts, filterable by user ID, email, authentication method, date range, and success status.
- **FR-009**: System MUST provide administrators with aggregated login statistics for a selected date range, including total attempts, successful attempts, failed attempts, success rate, hourly distribution, unique users count, new device login count, and new location login count.
- **FR-010**: System MUST display a failure reason breakdown with counts when failed login attempts exist in the selected statistics period.
- **FR-011**: System MUST restrict admin audit features to users with administrator privileges; non-admin users MUST NOT see or access admin audit sections.
- **FR-012**: System MUST display a per-user activity timeline on user detail pages showing the selected user's most recent login attempts.
- **FR-013**: System MUST display appropriate empty states when no data exists for any list or timeline view.
- **FR-014**: System MUST display error states with retry options when data loading fails.
- **FR-015**: System MUST validate date range inputs client-side (end date must not precede start date).

### Key Entities

- **Login Attempt**: Represents a single authentication event. Key attributes: success status, failure reason, authentication method, IP address, user agent string, device fingerprint, geographic country and city, new device flag, new location flag, timestamp.
- **Security Alert**: Represents a system-generated notification about a security-relevant event. Key attributes: alert type (new_device, new_location, failed_attempts, password_change, mfa_disabled), severity (info, warning, critical), title, descriptive message, metadata (JSON with event-specific details), acknowledgment timestamp, creation timestamp.
- **Login Statistics**: Aggregated metrics for a date range. Key attributes: total attempts, successful attempts, failed attempts, success rate, hourly distribution, unique user count, new device count, new location count, failure reason breakdown.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their security alerts and login history within 2 seconds of navigating to the respective section.
- **SC-002**: Users can filter alerts and login history by any supported filter and see updated results within 1 second.
- **SC-003**: Users can acknowledge a security alert with a single click, with the acknowledgment reflected immediately in the UI (badge count, alert status).
- **SC-004**: Administrators can view tenant-wide login statistics for any date range up to 90 days and see results within 3 seconds.
- **SC-005**: Administrators can filter tenant-wide login attempts by any combination of user, email, method, date range, and success status, with results updating within 2 seconds.
- **SC-006**: The per-user activity timeline loads within 1 second when viewing a user's detail page.
- **SC-007**: All list views support cursor-based pagination, loading the next page of results within 1 second.
- **SC-008**: 100% of admin-only features are inaccessible to non-admin users (verified by access control testing).
- **SC-009**: All views display appropriate empty states and error states, with error states offering a retry mechanism.

## Assumptions

- The backend (xavyo-idp) already provides all required endpoints with the described request/response formats.
- All API access goes through the BFF (Backend for Frontend) pattern via server-side proxy endpoints — no direct browser-to-API calls.
- Login history retention period is managed by the backend; the frontend displays whatever data the backend returns.
- Alert generation is handled by the backend; the frontend only reads and acknowledges alerts.
- The admin role is determined by the JWT claims already decoded in the BFF layer.
- The existing user detail page (from Phase 004) can be extended with an additional activity timeline section without breaking existing functionality.
- Cursor-based pagination uses the created_at timestamp as the cursor value, consistent with the backend format (items, total, next_cursor).
- The default statistics date range for the admin dashboard is the last 7 days.
- The default page size for all paginated lists is 20 items.
- Geographic location data (country, city) may be null for some login attempts (e.g., when geo-lookup fails) — the UI handles missing location gracefully.
- The hourly distribution in statistics uses a 0-23 hour format (24-hour clock).

## Scope Boundaries

### In Scope

- Security alerts list with filters and acknowledge action
- Unacknowledged alert count badge in navigation
- Personal login history with filters and pagination
- Admin audit dashboard with tenant-wide login attempts and statistics
- Per-user activity timeline on user detail pages
- Empty states and error states for all views
- Access control for admin-only features

### Out of Scope

- Alert notification preferences or email/push notifications for alerts
- CSV/PDF export of audit data (deferred to a future enhancement)
- Real-time alert streaming (alerts refresh on navigation or manual refresh)
- Custom alert rules or thresholds (managed by backend configuration)
- Audit log for non-login events (e.g., profile changes, permission changes)
- Data retention configuration UI (managed at backend/infrastructure level)
- Compliance report generation

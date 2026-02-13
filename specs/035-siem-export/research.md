# Phase 035 — SIEM Export & Audit Streaming: Research Decisions

## 1. Hub Layout

- **Decision**: 2-tab hub at `/governance/siem` with tabs: Destinations (default), Batch Exports
- **Rationale**: Destinations and batch exports are the two main management areas. Follows the pattern used in other governance features (licenses, correlation).
- **Alternatives considered**:
  - Separate pages: Rejected because it adds too many nav items to the sidebar.
  - 4-tab hub with Health and DLQ as separate tabs: Rejected because health and DLQ belong on the destination detail page, not the top-level hub.

## 2. Destination Detail Tabs

- **Decision**: 3-tab detail page — Details (config + actions), Health (summary + history), Dead Letter (failed events + redeliver)
- **Rationale**: Separates concerns cleanly. Users can focus on config, monitoring, or error recovery without context-switching noise.

## 3. Dynamic Form Fields

- **Decision**: Client-side conditional rendering using Svelte 5 `$derived` for conditional field visibility based on `destination_type` selection
- **Rationale**: Different destination types require different configuration fields:
  - `splunk_hec` needs source, sourcetype, index, and ack fields
  - `syslog_tcp_tls` needs facility and tls_verify fields
  - `webhook` needs neither Splunk nor syslog fields

## 4. Auth Config Handling

- **Decision**: Write-only auth config. Base64-encoded field on create/edit, never displayed on detail (backend returns `has_auth_config: boolean` instead of the actual value).
- **Rationale**: Security — credentials must never be exposed in the UI. The boolean flag lets the detail page indicate whether auth is configured without revealing the secret.

## 5. Event Type Filter

- **Decision**: Checkbox group with multi-select checkboxes grouped by category, stored as a JSON array
- **Rationale**: Matches the webhook event type pattern from Phase 024. Grouping by category (e.g., identity events, governance events, authentication events) makes it easier for admins to select relevant event types.

## 6. Circuit Breaker Visualization

- **Decision**: Color-coded badge component (green = closed, yellow = half_open, red = open), read-only
- **Rationale**: Consistent with the existing status badge pattern used across the application. Circuit breaker state is managed by the backend and displayed as informational only.

## 7. Batch Export Status

- **Decision**: Static page load with no auto-refresh. Users refresh the page manually to check updated status.
- **Status badge colors**: pending = gray, processing = blue, completed = green, failed = red
- **Rationale**: Keep implementation simple. Most exports complete quickly, and adding auto-refresh (polling or SSE) introduces complexity without proportional user benefit.

## 8. Component Reuse

- **Decision**: Full reuse of existing component library
- **Components**: DataTable for lists, PageHeader, Tabs, Badge, Button, Dialog, EmptyState, toast notifications
- **Rationale**: Consistency with 34 previous phases. No new base UI components needed.

# Feature Specification: SIEM Export & Audit Streaming

**Feature Branch**: `035-siem-export`
**Created**: 2026-02-13
**Status**: Draft
**Input**: Phase 035 — Enterprise audit log export to SIEM platforms with destination management, batch exports, health monitoring, and dead letter queue

## User Scenarios & Testing *(mandatory)*

### User Story 1 - SIEM Destination Management (Priority: P1)

As a tenant administrator, I want to create, configure, and manage SIEM destinations (Splunk HEC, syslog TCP/TLS, syslog UDP, webhook) so that audit events are continuously streamed to our security monitoring infrastructure.

**Why this priority**: Without destination configuration, no audit events can be exported. This is the foundational capability that all other SIEM features depend on.

**Independent Test**: Can be fully tested by creating a SIEM destination with endpoint details and format, verifying it in the list with status indicators, testing connectivity, editing configuration, enabling/disabling, and deleting it. Delivers immediate value for security teams to set up event streaming.

**Acceptance Scenarios**:

1. **Given** I am on the SIEM settings page, **When** I click "Add Destination", **Then** I see a form with fields for name, destination type (Splunk HEC/Syslog TCP-TLS/Syslog UDP/Webhook), endpoint host, port, export format (CEF/Syslog RFC5424/JSON/CSV), optional auth config, and event type filter.
2. **Given** I select "Splunk HEC" as destination type, **When** the form updates, **Then** I see additional fields for Splunk source, sourcetype, index, and acknowledgment toggle.
3. **Given** I have created a destination, **When** I view the list, **Then** I see columns for Name, Type, Host, Format, Status (enabled/disabled), Circuit State (closed/open/half-open), and Created.
4. **Given** I am viewing a destination detail, **When** I click "Test Connection", **Then** I see connectivity result with latency and any error message.
5. **Given** I want to stop event delivery temporarily, **When** I click "Disable", **Then** the destination is paused and events stop being sent.
6. **Given** a disabled destination, **When** I click "Enable", **Then** delivery resumes.
7. **Given** I want to remove a destination, **When** I click "Delete" and confirm, **Then** the destination is permanently removed.
8. **Given** I am viewing a destination detail, **When** I click "Edit", **Then** I can modify the configuration fields.

---

### User Story 2 - Health Monitoring & Circuit Breaker Status (Priority: P1)

As a tenant administrator, I want to view health metrics, delivery statistics, and circuit breaker status for each SIEM destination so I can ensure reliable event delivery and quickly diagnose issues.

**Why this priority**: Health monitoring is essential for operational awareness. Without visibility into delivery success/failure rates and circuit breaker state, administrators cannot ensure audit events are actually reaching SIEM systems.

**Independent Test**: Can be fully tested by viewing a destination's health summary showing delivery statistics, circuit state indicator, and health history timeline. Delivers immediate value for monitoring event pipeline reliability.

**Acceptance Scenarios**:

1. **Given** I am viewing a destination detail page, **When** I look at the Health tab, **Then** I see total events sent, delivered, failed, dropped, success rate percentage, average latency, and last success/failure timestamps.
2. **Given** a destination has circuit breaker state "open", **When** I view the detail page, **Then** I see a warning indicator showing the circuit is tripped with the last failure time.
3. **Given** I am on the Health tab, **When** I select a date range, **Then** I see historical health data showing delivery metrics over time windows.

---

### User Story 3 - Batch Export (Priority: P2)

As a tenant administrator, I want to create on-demand batch exports of audit events for a specific date range and format so I can generate compliance reports or import historical data into SIEM systems.

**Why this priority**: Batch export is a secondary capability — streaming via destinations is the primary delivery method. Batch export supplements streaming for historical data, compliance audits, and gap filling.

**Independent Test**: Can be fully tested by creating a batch export with date range and format, monitoring its status, and downloading the result. Delivers value for compliance reporting and historical data needs.

**Acceptance Scenarios**:

1. **Given** I am on the Batch Exports tab, **When** I click "Create Export", **Then** I see a form with date range picker, format selector (CEF/JSON/CSV/Syslog), and optional event type filter.
2. **Given** I submit a batch export request, **When** it is queued, **Then** I see the export in the list with status "Pending".
3. **Given** a batch export completes, **When** I view it, **Then** I see total events count, file size, and a download button.
4. **Given** a batch export fails, **When** I view it, **Then** I see the error detail explaining the failure.
5. **Given** I view the exports list, **When** I filter by status, **Then** I see only exports matching the selected status.

---

### User Story 4 - Dead Letter Queue Management (Priority: P2)

As a tenant administrator, I want to view and manage failed event deliveries in the dead letter queue so I can retry delivery of critical events that failed to reach the SIEM destination.

**Why this priority**: DLQ management is an operational concern for reliability. Events end up here after retries are exhausted, so managing them prevents permanent data loss. Less critical than initial setup and monitoring.

**Independent Test**: Can be fully tested by viewing the DLQ for a destination, seeing failed events with error details, retrying delivery, and seeing them clear from the queue. Delivers value for ensuring zero audit event loss.

**Acceptance Scenarios**:

1. **Given** a destination has failed deliveries, **When** I view the Dead Letter tab, **Then** I see a list of failed events with event type, timestamp, retry count, and error detail.
2. **Given** I am viewing a DLQ entry, **When** I click "Redeliver All", **Then** all dead letter events for this destination are requeued and I see a count of requeued events.
3. **Given** the dead letter queue is empty, **When** I view the tab, **Then** I see an empty state with an informative message.

---

### Edge Cases

- What happens when a destination endpoint is unreachable during test? The test returns success=false with an error message and latency is null.
- What happens when creating a destination with a duplicate name? The backend returns 409 Conflict; the UI shows a validation error.
- What happens when a circuit breaker is in "open" state? Events are dropped (delivery_status=dropped). The health summary shows circuit_state="open".
- What happens when a batch export date range has no events? The export completes with total_events=0 and a minimal file.
- What happens when creating a batch export with end date before start date? Client-side Zod validation rejects the form.
- What happens when the auth config is updated to invalid credentials? Test connectivity reveals the error; the circuit breaker may trip after consecutive failures.
- What happens when trying to download an incomplete batch export? The download endpoint returns the current status and a message indicating it's not ready.

## Requirements *(mandatory)*

### Functional Requirements

**Destination Management**:

- **FR-001**: System MUST display a paginated list of SIEM destinations showing name, type, host, format, enabled status, circuit state, and created date.
- **FR-002**: System MUST allow administrators to create SIEM destinations with name, destination type (syslog_tcp_tls/syslog_udp/webhook/splunk_hec), endpoint host, optional port, export format (cef/syslog_rfc5424/json/csv), optional auth config, and event type filter.
- **FR-003**: System MUST show conditional fields based on destination type — Splunk-specific fields (source, sourcetype, index, ack) for splunk_hec; syslog-specific fields (facility, TLS verify) for syslog types.
- **FR-004**: System MUST provide a destination detail view showing all configuration, health summary, delivery history, and dead letter queue.
- **FR-005**: System MUST allow administrators to edit destination configuration.
- **FR-006**: System MUST allow administrators to enable and disable destinations.
- **FR-007**: System MUST allow administrators to test destination connectivity with latency and error feedback.
- **FR-008**: System MUST allow administrators to delete destinations with confirmation.

**Health Monitoring**:

- **FR-009**: System MUST display health summary for each destination showing total events sent/delivered/failed/dropped, success rate, average latency, circuit state, and dead letter count.
- **FR-010**: System MUST display health history with time-windowed metrics for a configurable date range.
- **FR-011**: System MUST visually indicate circuit breaker state with color-coded badges (closed=green, half_open=yellow, open=red).

**Batch Export**:

- **FR-012**: System MUST display a paginated list of batch exports showing date range, format, status, total events, file size, and created date.
- **FR-013**: System MUST allow administrators to create batch exports with date range, output format, and optional event type filter.
- **FR-014**: System MUST allow downloading completed batch exports.
- **FR-015**: System MUST allow filtering the export list by status (pending/processing/completed/failed).

**Dead Letter Queue**:

- **FR-016**: System MUST display the dead letter queue per destination showing event type, timestamp, retry count, error detail.
- **FR-017**: System MUST allow administrators to redeliver all dead letter events for a destination.

### Key Entities

- **SIEM Destination**: A configured endpoint (Splunk, syslog, webhook) that receives streamed audit events. Key attributes: name, type, host, port, format, auth config, event filter, circuit breaker state, rate limiting, enabled status.
- **Batch Export**: A one-time export job for a date range of audit events. Key attributes: date range, format, status, total events, file size, error detail.
- **Health Summary**: Aggregate delivery metrics for a destination. Key attributes: events sent/delivered/failed/dropped, success rate, latency, circuit state.
- **Dead Letter Entry**: A failed event delivery that exhausted retries. Key attributes: event type, timestamp, retry count, error detail.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create a SIEM destination and see it streaming events within one page navigation.
- **SC-002**: Health dashboard shows real-time delivery metrics with success rate percentage and circuit breaker visual indicator.
- **SC-003**: Batch exports can be created, monitored, and downloaded from a single management page.
- **SC-004**: Dead letter queue entries can be redelivered in one click with count feedback.
- **SC-005**: All CRUD operations provide immediate feedback via toast notifications and form validation errors.
- **SC-006**: Destination type selection dynamically shows/hides relevant configuration fields.

## Assumptions

- Event type filter values are predefined categories (authentication, user_lifecycle, group_changes, access_requests, provisioning, administrative, security, entitlement, sod_violation) — not arbitrary strings.
- Auth config is write-only (shown as "configured" on detail view, editable as base64 on edit form). The backend never returns raw auth credentials.
- Circuit breaker state is read-only from the UI perspective — managed automatically by the delivery pipeline.
- Health history windows are server-generated aggregations, not raw event logs.
- Dead letter redeliver requeues ALL events for the destination (not selective per-event).
- Batch export download returns file content or a status message if not yet complete.

## Constraints

- SIEM UI is located at `/governance/siem` with sub-pages for destinations and batch exports.
- Destination detail page uses tabs: Details, Health, Dead Letter.
- All data operations go through BFF proxy endpoints following the established pattern.
- Forms use Superforms + Zod (via `zod/v3`) for validation.
- Lists use the existing DataTable component or simple tables with server-side pagination.
- Admin-only access enforced on all pages.

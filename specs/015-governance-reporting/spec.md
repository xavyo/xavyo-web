# Feature Specification: Governance Reporting & Analytics

**Feature Branch**: `015-governance-reporting`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Governance Reporting & Analytics (Phase 015)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Generate Compliance Reports (Priority: P1)

As a governance administrator, I need to browse available report templates (SOX, GDPR, HIPAA compliance standards) and generate reports on-demand so I can produce compliance evidence for auditors and regulators.

**Why this priority**: Core value proposition — without the ability to generate reports, the entire feature has no utility. Compliance reporting is the primary driver for this feature.

**Independent Test**: Can be fully tested by navigating to the Reports section, viewing template list, selecting a template, generating a report, and viewing/downloading the completed report data.

**Acceptance Scenarios**:

1. **Given** an admin user on the Reports page, **When** they view the Templates tab, **Then** they see a list of system templates organized by compliance standard (SOX, GDPR, HIPAA) with template type, name, and description.
2. **Given** an admin viewing a template, **When** they click "Generate Report", **Then** they can configure output format (JSON or CSV), provide optional parameters, and submit to generate.
3. **Given** a report generation has been submitted, **When** the report completes, **Then** the Generated Reports tab shows the report with "completed" status, record count, and a link to view/download the data.
4. **Given** a completed report, **When** the admin clicks to view report data, **Then** the system displays the report output in a readable format.
5. **Given** a failed report, **When** the admin views it, **Then** they see the error message explaining why generation failed, and can delete the failed report.
6. **Given** a non-admin user, **When** they attempt to access the Reports section, **Then** they are redirected to the dashboard.

---

### User Story 2 - Manage Report Templates (Priority: P2)

As a governance administrator, I need to create custom report templates, clone existing system templates for customization, and archive templates I no longer need, so I can tailor reporting to my organization's specific compliance requirements.

**Why this priority**: Extends the core reporting capability with customization. System templates cover standard compliance needs, but organizations often need custom reports for their specific audit requirements.

**Independent Test**: Can be tested by creating a custom template with data sources, filters, and columns, then verifying it appears in the template list and can be used to generate reports.

**Acceptance Scenarios**:

1. **Given** an admin on the Templates tab, **When** they click "Create Template", **Then** they see a form to define name, description, template type, compliance standard, and template definition (data sources, filters, columns).
2. **Given** a system template, **When** the admin clicks "Clone", **Then** a new custom template is created with a copy of the definition, editable by the admin.
3. **Given** a custom template, **When** the admin edits it, **Then** they can update the name, description, and definition fields.
4. **Given** a custom template, **When** the admin archives it, **Then** it no longer appears in the active template list.
5. **Given** a system template, **When** the admin attempts to edit or archive it, **Then** the system prevents modification with a clear message that system templates cannot be changed.

---

### User Story 3 - Schedule Recurring Reports (Priority: P2)

As a governance administrator, I need to set up recurring report schedules (daily, weekly, monthly) so that compliance reports are automatically generated at regular intervals without manual intervention.

**Why this priority**: Same priority as templates — scheduling is a key enterprise need for ongoing compliance. Organizations must produce reports on regular cadences for regulatory requirements.

**Independent Test**: Can be tested by creating a schedule for a template, verifying it appears in the Schedules tab with correct next run time, and testing pause/resume functionality.

**Acceptance Scenarios**:

1. **Given** an admin on the Schedules tab, **When** they click "Create Schedule", **Then** they see a form to select a template, set frequency (daily/weekly/monthly), configure time and day, add recipient emails, and choose output format.
2. **Given** a weekly schedule, **When** creating it, **Then** the admin must select a day of the week (Sunday through Saturday).
3. **Given** a monthly schedule, **When** creating it, **Then** the admin must select a day of the month (1-31).
4. **Given** an active schedule, **When** the admin clicks "Pause", **Then** the schedule status changes to "paused" and no new reports are generated until resumed.
5. **Given** a paused schedule, **When** the admin clicks "Resume", **Then** the schedule becomes active again with a recalculated next run time.
6. **Given** a schedule with 3+ consecutive failures, **When** viewing the Schedules tab, **Then** the schedule shows as "disabled" with the last error message visible.
7. **Given** a schedule, **When** the admin edits it, **Then** they can update name, frequency, timing, recipients, and output format.
8. **Given** a schedule, **When** the admin deletes it, **Then** it is removed from the list with a confirmation dialog.

---

### User Story 4 - View and Manage Generated Reports (Priority: P3)

As a governance administrator, I need to browse previously generated reports, filter them by status and template, view their data, and clean up expired reports to maintain an organized report archive.

**Why this priority**: Supporting capability for managing the output of report generation. Less critical than generating reports but necessary for a complete workflow.

**Independent Test**: Can be tested by generating several reports, then filtering by status, viewing report details, and triggering cleanup of expired reports.

**Acceptance Scenarios**:

1. **Given** an admin on the Generated Reports tab, **When** they view the list, **Then** they see reports with name, template, status, output format, record count, and creation date.
2. **Given** reports in various statuses, **When** the admin filters by status (pending, generating, completed, failed), **Then** only matching reports are shown.
3. **Given** a completed report, **When** the admin clicks to view details, **Then** they see report metadata and can access the report data.
4. **Given** a failed or pending report, **When** the admin clicks delete, **Then** the report is removed after confirmation.
5. **Given** reports past their retention date, **When** the admin triggers cleanup, **Then** expired completed reports are deleted and a count is shown.

---

### Edge Cases

- What happens when a template definition has no filters or columns? The system should still allow generation with default behavior.
- How does the system handle concurrent generation requests for the same template? Each request creates an independent report instance.
- What happens when a schedule's template is archived? The schedule should still function using the template snapshot, but display a warning.
- What happens when the admin creates a schedule with day_of_month=31 for months with fewer days? The backend handles this by using the last day of the month.
- What happens when report data is very large? The system should handle pagination or truncation of the data view gracefully.
- What happens when all system templates are listed for a fresh tenant? System templates with NULL tenant_id are shared across all tenants and should always appear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a Reports section accessible from the Governance area, restricted to admin users only.
- **FR-002**: System MUST show three tabs: Templates, Generated Reports, and Schedules.
- **FR-003**: System MUST list report templates with name, type, compliance standard, system/custom indicator, and status.
- **FR-004**: System MUST allow filtering templates by template type and compliance standard.
- **FR-005**: System MUST allow admins to create custom report templates with name, description, template type, optional compliance standard, and template definition.
- **FR-006**: System MUST allow admins to clone any template (system or custom) into a new custom template.
- **FR-007**: System MUST allow admins to edit custom templates (name, description, definition) but prevent editing system templates.
- **FR-008**: System MUST allow admins to archive (soft-delete) custom templates but prevent archiving system templates.
- **FR-009**: System MUST allow admins to generate reports by selecting a template, choosing output format (JSON or CSV), and providing optional parameters.
- **FR-010**: System MUST display generated reports with name, status (pending/generating/completed/failed), output format, record count, file size, progress, and timestamps.
- **FR-011**: System MUST allow filtering generated reports by status and template.
- **FR-012**: System MUST allow viewing completed report data in-app.
- **FR-013**: System MUST allow deleting pending or failed reports but prevent deleting completed or in-progress reports.
- **FR-014**: System MUST provide a cleanup action to remove expired reports past retention date.
- **FR-015**: System MUST allow creating report schedules with template selection, name, frequency (daily/weekly/monthly), schedule time, optional day selection, recipient emails, and output format.
- **FR-016**: System MUST enforce that weekly schedules require a day of the week and monthly schedules require a day of the month.
- **FR-017**: System MUST allow pausing active schedules and resuming paused or disabled schedules.
- **FR-018**: System MUST display schedule status (active/paused/disabled), next run time, last run time, and consecutive failure count.
- **FR-019**: System MUST allow editing and deleting report schedules.
- **FR-020**: System MUST show appropriate empty states for each tab when no data exists.
- **FR-021**: System MUST display toast notifications for all create, update, delete, and action operations.
- **FR-022**: System MUST handle and display error messages from the backend for all operations.

### Key Entities

- **Report Template**: A blueprint for generating compliance reports. Includes name, description, template type (access_review, sod_violations, certification_status, user_access, audit_trail), optional compliance standard (SOX, GDPR, HIPAA, custom), a definition with data sources/filters/columns/grouping/sorting, and whether it is a system or custom template.
- **Generated Report**: An instance of a report produced from a template. Has a status lifecycle (pending → generating → completed/failed), output format, record count, file size, generation timestamps, and a retention period.
- **Report Schedule**: A recurring automation rule that generates reports from a template at specified intervals. Has frequency (daily/weekly/monthly), time configuration, recipient list, status (active/paused/disabled), and failure tracking.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can browse all available report templates and generate a compliance report in under 2 minutes.
- **SC-002**: Admins can create a custom report template in under 3 minutes.
- **SC-003**: Admins can set up a recurring report schedule in under 2 minutes.
- **SC-004**: All report statuses (pending, generating, completed, failed) are clearly distinguishable with visual indicators.
- **SC-005**: Generated report data is viewable in-app without requiring external tools.
- **SC-006**: Schedule pause/resume operations complete with immediate visual feedback.
- **SC-007**: The feature maintains consistent behavior across light and dark themes.
- **SC-008**: All existing tests continue to pass with no regressions, and new tests cover all functional requirements.

## Assumptions

- The backend governance reporting API is fully functional and deployed (system templates are seeded).
- Report generation is synchronous — the API returns the completed (or failed) report in the response.
- Report data for completed reports can be retrieved inline via the API (not file-based).
- The cleanup endpoint handles retention logic server-side; the frontend only triggers it.
- Template definitions (data sources, filters, columns) are treated as structured JSON in the UI — admins can view and edit them as structured forms or JSON.
- Schedule execution is handled by the backend scheduler; the frontend only manages schedule configuration.
- Recipients on schedules are email addresses validated by the backend.
- The feature is placed under the existing Governance section in the sidebar navigation.

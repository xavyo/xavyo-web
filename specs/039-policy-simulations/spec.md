# Feature Specification: Policy Simulations & What-If Analysis

**Feature Branch**: `039-policy-simulations`
**Created**: 2026-02-12
**Status**: Draft
**Input**: Phase 039 — Advanced governance simulation engine for testing policy changes before deployment

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Policy Simulation CRUD & Execution (Priority: P1)

An administrator wants to test the impact of a new SoD rule or birthright policy before activating it. They create a policy simulation by naming it, selecting the simulation type (SoD rule or birthright policy), and providing the policy configuration. They execute the simulation, which analyzes all (or a subset of) users and produces results showing who would be affected. The admin reviews the results — broken down by impact type (violations, entitlement gains/losses, warnings) and severity (critical, high, medium, low). This lets them make informed decisions about whether to deploy the policy.

**Why this priority**: Core value proposition — the entire feature exists to let admins safely preview policy impact before deployment. Without this, no other simulation features have context.

**Independent Test**: Can be fully tested by creating a policy simulation, executing it, and viewing impact results. Delivers standalone value as a policy impact analysis tool.

**Acceptance Scenarios**:

1. **Given** an admin is on the simulation hub, **When** they click "Create Policy Simulation" and fill in name, type (SoD Rule), and policy config, **Then** a new simulation is created in "Draft" status
2. **Given** a draft policy simulation exists, **When** the admin clicks "Execute", **Then** the simulation runs and status changes to "Executed" with affected user count and impact summary populated
3. **Given** an executed simulation, **When** the admin views the results tab, **Then** they see a paginated list of per-user results with impact type and severity badges
4. **Given** an executed simulation, **When** the admin filters results by impact type "Violation", **Then** only violation results are displayed
5. **Given** no simulations exist, **When** the admin views the policy simulations list, **Then** an empty state message is shown with a call-to-action to create one
6. **Given** a simulation exists, **When** the admin clicks "Delete" and confirms, **Then** the simulation is permanently removed from the list

---

### User Story 2 - Batch Simulation CRUD & Execution (Priority: P1)

An administrator plans a bulk access change (e.g., adding a role to 200 users, or removing an entitlement from a department). Before making the change, they create a batch simulation to preview the impact. They select the operation type (role add/remove, entitlement add/remove), choose users either by explicit list or by filter criteria (department, status, existing roles/entitlements), and specify what to change. After execution, they review per-user results showing access gained, access lost, and any warnings (e.g., SoD violations that would be introduced).

**Why this priority**: Equally critical to P1 — batch changes affect many users simultaneously, so previewing impact is essential to prevent mass access errors.

**Independent Test**: Can be tested by creating a batch simulation with user selection, executing it, and reviewing the per-user access change preview.

**Acceptance Scenarios**:

1. **Given** an admin is on the batch simulations tab, **When** they create a batch simulation selecting "Role Add" with filter criteria (department: Engineering), **Then** a new batch simulation is created in "Draft" status
2. **Given** a draft batch simulation, **When** the admin executes it, **Then** the simulation processes all matching users and shows total/processed counts, impact summary, and any scope warnings
3. **Given** an executed batch simulation with a scope warning, **When** the admin views the detail page, **Then** a warning banner is displayed about the scope impact
4. **Given** batch simulation results, **When** the admin views a user's result, **Then** they see lists of access gained and access lost, plus any warnings
5. **Given** batch results, **When** the admin filters by "has warnings", **Then** only results with warnings are shown

---

### User Story 3 - Apply Batch Changes to Production (Priority: P2)

After reviewing batch simulation results and confirming the changes are acceptable, the administrator applies the batch changes to production. This requires providing a justification and explicitly acknowledging the scope of the changes. Once applied, the simulation status transitions to "Applied" and records who applied it and when.

**Why this priority**: Depends on US2 for the batch simulation data. Completing the loop from "preview" to "apply" delivers the full batch change workflow.

**Independent Test**: Can be tested by applying a previously executed batch simulation with justification, then verifying the status updates to "Applied" with the applied timestamp and actor recorded.

**Acceptance Scenarios**:

1. **Given** an executed batch simulation, **When** the admin clicks "Apply to Production" and provides justification and acknowledges scope, **Then** the changes are applied, status becomes "Applied", and applied_at/applied_by are recorded
2. **Given** a batch simulation with a scope warning, **When** the admin attempts to apply without acknowledging, **Then** the apply action is blocked with a message requiring acknowledgment
3. **Given** a draft (not yet executed) batch simulation, **When** the admin tries to apply, **Then** the "Apply" button is disabled with a tooltip explaining execution is required first
4. **Given** a cancelled batch simulation, **When** the admin views the detail page, **Then** the "Apply" button is not available

---

### User Story 4 - Simulation Comparisons (Priority: P2)

An administrator wants to compare two simulation results side-by-side to understand the difference in impact between two policy configurations. They create a comparison by selecting two simulations (or comparing a simulation against the current live state). The comparison generates a delta view showing users added/removed/modified between the two, with summary statistics. This helps admins choose the better policy option.

**Why this priority**: Builds on US1/US2 outputs — requires existing simulations to compare. Delivers significant analytical value for policy optimization.

**Independent Test**: Can be tested by creating a comparison between two executed simulations, viewing the delta summary and detailed results.

**Acceptance Scenarios**:

1. **Given** two executed policy simulations, **When** the admin creates a comparison selecting "Simulation vs Simulation" with both IDs, **Then** a comparison is created with summary stats and delta results
2. **Given** an executed simulation, **When** the admin creates a comparison selecting "Simulation vs Current", **Then** a comparison is created showing differences from the current live state
3. **Given** a comparison, **When** the admin views the detail page, **Then** they see summary cards (users in both, only in A, only in B, different impacts) and a delta table with additions/removals/modifications
4. **Given** a comparison, **When** the admin clicks "Delete" and confirms, **Then** the comparison is removed from the list

---

### User Story 5 - Simulation Lifecycle & Export (Priority: P3)

Administrators manage the lifecycle of simulations over time. They can archive simulations they no longer actively use (keeping them for reference), restore archived simulations, check if a simulation's results are stale (data has changed since execution), add notes for documentation, and export results to JSON or CSV for offline analysis or compliance reporting.

**Why this priority**: Enhancement layer on top of core simulation functionality. Lifecycle management and export are important for compliance but not required for the primary simulation workflow.

**Independent Test**: Can be tested by archiving/restoring a simulation, checking staleness, adding notes, and exporting results to CSV/JSON format.

**Acceptance Scenarios**:

1. **Given** an executed simulation, **When** the admin clicks "Archive", **Then** the simulation is marked archived and hidden from the default list view
2. **Given** the admin toggles "Show Archived" on the list, **When** they view an archived simulation, **Then** they can click "Restore" to bring it back to the main list
3. **Given** an executed simulation where underlying data has changed, **When** the admin checks staleness, **Then** a "Stale" indicator appears with a message suggesting re-execution
4. **Given** an executed simulation, **When** the admin edits the notes field and saves, **Then** the notes are persisted and visible on the detail page
5. **Given** a simulation with results, **When** the admin clicks "Export" and selects CSV format, **Then** a CSV file is downloaded containing the simulation metadata and all results
6. **Given** a simulation with results, **When** the admin clicks "Export" and selects JSON format, **Then** a JSON file is downloaded containing the full simulation data

---

### Edge Cases

- What happens when an admin tries to execute a simulation that is already in "Executed" status? The system should allow re-execution (overwriting previous results) or require archiving first.
- What happens when an admin deletes a simulation that is referenced by a comparison? The comparison should either be deleted or show "source simulation deleted" gracefully.
- What happens when a batch simulation targets 0 users (empty filter match)? The execution should complete with 0 affected users and a clear message.
- What happens when a user is deleted between simulation execution and result viewing? Results should still display the user ID even if the user no longer exists.
- How does the system handle concurrent execution requests for the same simulation? Only one execution should proceed; subsequent requests should be rejected while execution is in progress.
- What happens when applying a batch simulation and some individual operations fail? The system should report partial success with details on failed operations.
- What happens when comparing simulations of different types (policy vs batch)? The system should allow cross-type comparisons or clearly indicate incompatibility.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow administrators to create policy simulations with a name, simulation type (SoD rule or birthright policy), optional policy reference, and policy configuration
- **FR-002**: System MUST allow administrators to list policy simulations with filtering by type, status, creator, and archived state
- **FR-003**: System MUST allow administrators to execute a policy simulation, optionally targeting a subset of users, producing per-user impact results
- **FR-004**: System MUST display simulation results with impact type classification (violation, entitlement gain, entitlement loss, no change, warning) and severity levels (critical, high, medium, low)
- **FR-005**: System MUST allow administrators to create batch simulations with an operation type (role add/remove, entitlement add/remove), user selection mode (explicit list or filter), and change specification
- **FR-006**: System MUST support batch simulation filter criteria including department, status, role membership, entitlement membership, title, and custom metadata
- **FR-007**: System MUST allow administrators to execute batch simulations, producing per-user access change previews (access gained, access lost, warnings)
- **FR-008**: System MUST display scope warnings for batch simulations affecting large numbers of users, requiring explicit acknowledgment before applying
- **FR-009**: System MUST allow administrators to apply executed batch simulation results to production, requiring justification text and scope acknowledgment
- **FR-010**: System MUST allow administrators to create simulation comparisons between two simulations or between a simulation and current live state
- **FR-011**: System MUST display comparison results as delta views showing additions, removals, and modifications with summary statistics
- **FR-012**: System MUST support simulation lifecycle operations: archive, restore, cancel, and delete
- **FR-013**: System MUST detect and display staleness when underlying data has changed since a simulation was last executed
- **FR-014**: System MUST allow administrators to add and edit free-text notes on any simulation
- **FR-015**: System MUST support exporting simulation results and comparisons to JSON and CSV formats
- **FR-016**: System MUST display impact summary cards showing total users analyzed, affected users, breakdowns by severity, and breakdowns by impact type
- **FR-017**: System MUST provide a unified simulation hub with separate tabs for policy simulations, batch simulations, and comparisons
- **FR-018**: System MUST restrict all simulation operations to users with administrator privileges
- **FR-019**: System MUST prevent applying batch simulations that have not been executed
- **FR-020**: System MUST record audit metadata (who created, executed, applied) with timestamps on all simulation entities

### Key Entities

- **Policy Simulation**: A named simulation that tests the impact of a SoD rule or birthright policy against the user population. Has a lifecycle (draft, executed, cancelled) and contains impact summary with severity breakdown.
- **Policy Simulation Result**: A per-user impact record within a policy simulation, classifying the effect as violation, entitlement gain/loss, no change, or warning with severity level.
- **Batch Simulation**: A named simulation that previews the effect of a bulk access change (role/entitlement add/remove) across selected users. Supports both explicit user lists and filter-based selection. Can be applied to production after review.
- **Batch Simulation Result**: A per-user access change preview within a batch simulation, listing access gained, access lost, and any warnings.
- **Simulation Comparison**: A named side-by-side analysis of two simulations (or simulation-vs-current), producing delta results with summary statistics.
- **Impact Summary**: Aggregated statistics for a simulation including total users analyzed, affected count, severity distribution, and impact type distribution.
- **Filter Criteria**: A set of conditions for selecting users in batch simulations, supporting department, status, role/entitlement membership, title, and custom metadata filters.
- **Change Specification**: Defines what change a batch simulation tests — the operation type and the target role or entitlement.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can create and execute a policy simulation in under 2 minutes (excluding system processing time)
- **SC-002**: Simulation results load and display within 3 seconds for simulations covering up to 10,000 users
- **SC-003**: 100% of simulation operations (create, execute, archive, delete, export) complete without requiring page refreshes
- **SC-004**: Administrators can identify the highest-severity impacts within 10 seconds of viewing simulation results (through clear visual hierarchy and summary cards)
- **SC-005**: Batch simulation apply workflow requires at minimum 2 explicit confirmations (justification + scope acknowledgment) before production changes proceed
- **SC-006**: Comparison delta views accurately reflect all differences between two simulation results, with 0 false positives or missing entries
- **SC-007**: Export functionality produces valid, parseable files (JSON/CSV) that include all simulation metadata and results
- **SC-008**: All 29 simulation operations are accessible through the unified simulation hub interface without navigating to external pages

## Assumptions

- The backend simulation engine handles the actual policy evaluation and impact calculation; the frontend is responsible for presenting inputs and results.
- Simulation execution may take significant time for large user populations; the frontend should handle asynchronous status updates gracefully.
- The "apply" action for batch simulations triggers server-side provisioning workflows — the frontend only initiates the action and displays the result.
- Staleness detection is computed server-side by comparing the data snapshot timestamp against the latest data modification time.
- Export functionality triggers a server-side file generation; the frontend initiates the download.
- Filter criteria for batch simulations are validated server-side; the frontend provides a form-based builder for constructing the filter object.
- Cross-type comparisons (policy vs batch) are supported by the backend comparison engine; the frontend displays whatever delta results are returned.

## Out of Scope

- Real-time simulation progress tracking (e.g., progress bars showing 50% complete) — simulations complete asynchronously and the user refreshes or re-checks status
- Scheduling simulations for automatic periodic re-execution
- Role-based visibility restrictions on simulations (all admins see all simulations in the tenant)
- Simulation templates or presets for common policy configurations
- Integration with external notification systems (email/Slack) for simulation completion

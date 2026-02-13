# Feature Specification: Role Mining Analytics & Recommendations

**Feature Branch**: `033-role-mining`
**Created**: 2026-02-12
**Status**: Draft
**Input**: Phase 033 — Governance feature enabling admins to discover optimal role structures from actual access patterns, identify excessive privileges, and consolidate roles.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mining Job Management (Priority: P1)

As a governance administrator, I need to create and manage role mining jobs that analyze actual user access patterns across the organization so I can discover candidate roles that reflect real-world access needs rather than manually defining roles based on assumptions.

**Why this priority**: Role mining jobs are the foundation of the entire feature. Without the ability to create and run analysis jobs, no other capabilities (candidate review, patterns, consolidation, simulations) can function. This is the entry point for all role mining workflows.

**Independent Test**: Can be fully tested by creating a mining job with parameters (minimum support threshold, confidence level, maximum roles), running it, monitoring its progress, and verifying it completes or can be cancelled. Delivers value by providing the infrastructure for all downstream analysis.

**Acceptance Scenarios**:

1. **Given** an admin on the Role Mining hub, **When** they click "Create Job" and fill in name, minimum support (e.g., 5), minimum confidence (e.g., 0.7), and maximum roles (e.g., 20), **Then** a new mining job is created in "pending" status and appears in the job list.
2. **Given** a pending mining job, **When** the admin clicks "Run", **Then** the job transitions to "running" status and the UI shows progress indication.
3. **Given** a running mining job, **When** the admin clicks "Cancel", **Then** the job transitions to "cancelled" status and stops processing.
4. **Given** a completed mining job, **When** the admin views the job detail, **Then** they see job metrics including total candidates discovered, entitlements analyzed, and processing duration.
5. **Given** a mining job in any terminal state (completed, failed, cancelled), **When** the admin clicks "Delete", **Then** the job and its associated data are removed after confirmation.
6. **Given** the Role Mining hub, **When** the admin filters by status (e.g., "completed"), **Then** only jobs with that status are displayed.

---

### User Story 2 - Candidate Review & Promotion (Priority: P1)

As a governance administrator, I need to review the role candidates discovered by mining jobs, examine their member counts and entitlement compositions, and either promote promising candidates to real governance roles or dismiss unsuitable ones so that the organization's role model continuously improves based on actual usage data.

**Why this priority**: Candidate review is the primary outcome of role mining. Without the ability to evaluate and act on discovered candidates, mining jobs produce data that cannot be operationalized. This delivers the core business value of the feature.

**Independent Test**: Can be tested by navigating to a completed job's candidate list, reviewing a candidate's details (members, entitlements, confidence score), promoting one candidate to a real role, and dismissing another. Delivers value by enabling data-driven role creation.

**Acceptance Scenarios**:

1. **Given** a completed mining job with discovered candidates, **When** the admin opens the job detail, **Then** they see a list of role candidates sorted by confidence score with member count and entitlement count visible.
2. **Given** a role candidate in "discovered" status, **When** the admin clicks to view its detail, **Then** they see the full list of entitlements the candidate role would include and the count of users who match this pattern.
3. **Given** a discovered candidate with high confidence, **When** the admin clicks "Promote", **Then** the candidate is promoted to a real governance role and its status changes to "promoted".
4. **Given** a discovered candidate that is not useful, **When** the admin clicks "Dismiss", **Then** the candidate's status changes to "dismissed" and it is visually de-emphasized in the list.
5. **Given** a job detail page, **When** multiple candidates exist, **Then** the admin can see confidence scores as percentage bars and support counts to compare candidates at a glance.

---

### User Story 3 - Access Pattern Analysis (Priority: P2)

As a governance administrator, I need to view frequently co-occurring entitlement access patterns and identify users with excessive privileges so I can understand how access is actually being used across the organization and spot over-provisioned users before they become a security risk.

**Why this priority**: Pattern analysis and excessive privilege detection are analytical capabilities that provide insight independent of mining jobs. They help administrators understand the current access landscape and identify immediate remediation targets, but they depend on having access data already available in the system.

**Independent Test**: Can be tested by navigating to the Patterns tab, viewing the top co-occurring entitlement patterns (with frequency and user count), and switching to the Excessive Privileges view to see which users have more access than their peers. Delivers value by providing actionable security intelligence.

**Acceptance Scenarios**:

1. **Given** the Access Patterns tab, **When** it loads, **Then** the admin sees a list of frequently co-occurring entitlement combinations ranked by frequency.
2. **Given** access patterns are displayed, **When** the admin adjusts the minimum frequency filter (e.g., show only patterns held by 10+ users), **Then** the list updates to show only patterns meeting that threshold.
3. **Given** the Excessive Privileges section, **When** it loads, **Then** the admin sees a list of users with privilege counts exceeding organizational norms, including each user's email, excess count, and detail descriptions.
4. **Given** a user with excessive privileges, **When** the admin reviews their detail, **Then** they see which specific entitlements are flagged as excessive and why.

---

### User Story 4 - Role Consolidation Suggestions (Priority: P2)

As a governance administrator, I need to see suggestions for consolidating overlapping roles so I can reduce role sprawl, simplify the role model, and make access management more maintainable over time.

**Why this priority**: Consolidation suggestions build on the existing role model to identify optimization opportunities. While valuable for long-term governance hygiene, this is analytical in nature and does not block other operational workflows.

**Independent Test**: Can be tested by navigating to the Consolidation tab and reviewing suggestions that show overlapping source roles, a proposed target role name, overlap percentage, and the number of affected users. Delivers value by providing actionable role optimization recommendations.

**Acceptance Scenarios**:

1. **Given** the Consolidation tab, **When** it loads, **Then** the admin sees a list of consolidation suggestions showing source roles that overlap significantly.
2. **Given** a consolidation suggestion, **When** the admin reviews it, **Then** they see the overlap percentage between source roles, the proposed consolidated role name, and the number of users who would be affected.
3. **Given** no overlapping roles exist, **When** the Consolidation tab loads, **Then** a message indicates no consolidation opportunities were found.

---

### User Story 5 - Role Mining Simulations (Priority: P3)

As a governance administrator, I need to create simulations that preview the impact of promoting specific role candidates before committing to changes so I can make informed decisions about which candidates to promote and understand the downstream effects on users and entitlements.

**Why this priority**: Simulations provide a safety net for role changes but are only useful after candidates have been identified and reviewed. This is a "nice to have" that increases confidence in decisions but is not required for the core mining-review-promote workflow.

**Independent Test**: Can be tested by selecting one or more candidates from a completed job, creating a simulation, viewing its impact summary (users affected, entitlements changed, coverage analysis), and deleting the simulation when done. Delivers value by reducing risk of role model changes.

**Acceptance Scenarios**:

1. **Given** discovered candidates from a completed job, **When** the admin selects candidates and clicks "Simulate", **Then** a new simulation is created and processing begins.
2. **Given** a completed simulation, **When** the admin views its detail, **Then** they see an impact summary including users affected, entitlement coverage changes, and any potential conflicts.
3. **Given** a simulation that is no longer needed, **When** the admin clicks "Delete", **Then** the simulation is removed after confirmation.
4. **Given** the Simulations tab on the hub, **When** it loads, **Then** the admin sees a list of all simulations with their status and creation date.

---

### Edge Cases

- What happens when a mining job is run but there are no users or entitlements in the system? The system should complete the job with zero candidates and display an informative empty state.
- What happens when a mining job fails during execution? The job status should transition to "failed" and the job detail should display error information.
- What happens when an admin tries to promote a candidate that has already been promoted? The system should prevent duplicate promotion and show an appropriate message.
- What happens when an admin tries to run a job that is already running? The run action should be disabled for jobs not in "pending" status.
- What happens when the system finds no excessive privileges? The Excessive Privileges section should display an empty state indicating the organization's access is within normal bounds.
- What happens when the consolidation analysis finds no overlapping roles? The Consolidation tab should display an empty state indicating no optimization opportunities exist.
- What happens when a simulation is created with no candidate IDs? The system should require at least one candidate to be selected.
- What happens when a mining job is deleted that has associated simulations? The associated simulations should either be cascade-deleted or the deletion should be blocked with an explanation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to create role mining jobs with configurable parameters: name (required), description (optional), minimum support threshold (default: 2), minimum confidence level (default: 0.5), and maximum roles to discover (default: 50).
- **FR-002**: System MUST allow admins to run pending mining jobs, triggering the analysis of user access patterns.
- **FR-003**: System MUST allow admins to cancel running mining jobs, stopping analysis in progress.
- **FR-004**: System MUST allow admins to delete mining jobs in any terminal state (completed, failed, cancelled).
- **FR-005**: System MUST display mining job status using distinct visual indicators for each state: pending, running, completed, failed, cancelled.
- **FR-006**: System MUST display job metrics upon completion including candidates discovered, entitlements analyzed, and processing duration.
- **FR-007**: System MUST allow admins to list mining jobs with filtering by status.
- **FR-008**: System MUST display overall mining metrics (total jobs run, total candidates found, total promoted) on the hub page.
- **FR-009**: System MUST list discovered role candidates for each completed job, showing name, confidence score, support count, member count, and entitlement count.
- **FR-010**: System MUST allow admins to view candidate details including the full list of entitlements and matching users.
- **FR-011**: System MUST allow admins to promote a discovered candidate to a real governance role.
- **FR-012**: System MUST allow admins to dismiss candidates that are not useful, visually distinguishing dismissed candidates from active ones.
- **FR-013**: System MUST display frequently co-occurring access patterns with their frequency and user count.
- **FR-014**: System MUST allow filtering access patterns by minimum frequency threshold.
- **FR-015**: System MUST detect and display users with excessive privileges, showing user identity, excess count, and detailed privilege descriptions.
- **FR-016**: System MUST display role consolidation suggestions showing source roles, proposed target name, overlap percentage, and affected user count.
- **FR-017**: System MUST allow admins to create simulations by selecting one or more role candidates.
- **FR-018**: System MUST display simulation results including impact summary with user and entitlement coverage analysis.
- **FR-019**: System MUST allow admins to delete simulations.
- **FR-020**: System MUST restrict all role mining features to admin users only.

### Key Entities

- **Mining Job**: Represents a single analysis run. Has a name, configuration parameters (support, confidence, max roles), a lifecycle status (pending, running, completed, failed, cancelled), completion metrics, and a collection of discovered candidates.
- **Role Candidate**: A potential role discovered by a mining job. Defined by a set of entitlements that frequently co-occur. Has confidence and support scores, a member count (users matching this pattern), and a lifecycle status (discovered, promoted, dismissed).
- **Access Pattern**: A frequently occurring combination of entitlements observed across users. Characterized by the specific entitlements involved, how many users hold this combination, and how frequently it appears.
- **Excessive Privilege Record**: Identifies a user whose access significantly exceeds organizational norms. Includes the user's identity, the number of excess entitlements, and descriptions of each excessive entitlement.
- **Consolidation Suggestion**: A recommendation to merge overlapping roles. References the source roles being consolidated, proposes a target role name, calculates overlap percentage, and estimates affected users.
- **Simulation**: A what-if analysis for promoting specific candidates. References candidate IDs, computes impact on users and entitlements, and provides a summary of changes that would result from promotion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create, run, and review a mining job end-to-end within 5 minutes of interaction time (excluding backend processing).
- **SC-002**: Admins can evaluate a role candidate (view entitlements, members, confidence) and make a promote/dismiss decision in under 2 minutes per candidate.
- **SC-003**: The Role Mining hub displays all five analytical views (Jobs, Candidates, Patterns, Consolidation, Simulations) in a single navigable interface.
- **SC-004**: Access pattern analysis results load and display within 3 seconds for organizations with up to 10,000 users.
- **SC-005**: 100% of mining job states (pending, running, completed, failed, cancelled) are visually distinguishable without reading text labels.
- **SC-006**: Admins can identify excessive privilege holders in under 30 seconds by viewing the dedicated analysis view.
- **SC-007**: All role mining operations are restricted to admin users; non-admin users see no role mining navigation or content.

## Assumptions

- The backend role mining engine performs the actual pattern analysis; the frontend only manages job lifecycle and displays results.
- Mining job execution time depends on organization size and is handled asynchronously by the backend; the frontend polls or refreshes for status updates.
- Default parameter values (min_support=2, min_confidence=0.5, max_roles=50) are reasonable starting points for most organizations.
- Promoting a candidate to a real role is an immediate action; the backend handles the creation of the governance role from the candidate's entitlement definition.
- Access patterns and excessive privileges are computed on-demand by the backend when the respective views are loaded.
- Consolidation suggestions are generated by the backend based on current role definitions; the frontend only displays the results.
- Role mining is an admin-only feature; regular users never need to interact with mining jobs or results.

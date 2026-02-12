# Feature Specification: Approval Workflow Configuration

**Feature Branch**: `016-approval-workflow-config`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Approval Workflow Configuration (Phase 016): Implement complete UI coverage for the backend approval workflow, approval groups, escalation policy, and SoD exemption API endpoints."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Approval Workflow Management (Priority: P1)

As a governance administrator, I need to create and manage approval workflows so that access requests are routed through the correct multi-step approval process. Without a configured workflow, access requests cannot be submitted (the system rejects them with "No approval workflow configured").

**Why this priority**: This is the highest priority because it unblocks the entire access request system. Without at least one default workflow, the existing access request feature is non-functional.

**Independent Test**: Can be fully tested by creating a workflow with steps, setting it as default, and verifying that access requests can then be submitted. Delivers the foundational approval infrastructure.

**Acceptance Scenarios**:

1. **Given** no approval workflows exist, **When** admin navigates to Approval Config, **Then** they see an empty state with a prompt to create their first workflow
2. **Given** admin is on the workflow creation page, **When** they fill in a name, description, and add at least one step with a group and required approvals count, **Then** a new workflow is created and appears in the list
3. **Given** a workflow exists, **When** admin clicks "Set as Default", **Then** the workflow is marked as the tenant's default and a success notification appears
4. **Given** a workflow exists, **When** admin views its detail page, **Then** they see the workflow name, status, and ordered list of approval steps with group names and required approvals
5. **Given** a workflow detail page, **When** admin edits the name or description and saves, **Then** the changes are persisted and confirmed
6. **Given** a non-default workflow exists, **When** admin deletes it, **Then** the workflow is removed and no longer appears in the list

---

### User Story 2 - Approval Group Management (Priority: P1)

As a governance administrator, I need to create and manage approval groups so that I can assign groups of users to workflow steps. Groups define who is eligible to approve access requests at each step.

**Why this priority**: Groups are a prerequisite for creating meaningful workflows — each workflow step references a group. Without groups, workflows cannot have functional steps.

**Independent Test**: Can be tested by creating a group, adding members, and verifying the group appears in workflow step selectors. Delivers the user grouping needed for approval routing.

**Acceptance Scenarios**:

1. **Given** admin navigates to the Groups tab, **When** no groups exist, **Then** an empty state is shown with a prompt to create a group
2. **Given** admin is on the group creation page, **When** they enter a name and description, **Then** a new group is created in active status
3. **Given** a group exists, **When** admin views its detail page, **Then** they see group name, status, description, and current members list
4. **Given** a group detail page, **When** admin adds a user as a member (by selecting from available users), **Then** the user appears in the group's members list
5. **Given** a group with members, **When** admin removes a member, **Then** the member no longer appears in the group
6. **Given** an active group, **When** admin disables it, **Then** the group status changes to disabled and it cannot be selected for new workflow steps
7. **Given** a disabled group, **When** admin enables it, **Then** the group status returns to active

---

### User Story 3 - Escalation Policy Configuration (Priority: P2)

As a governance administrator, I need to configure escalation policies so that stalled approval steps are automatically escalated. Each policy defines escalation levels with timeouts and actions (notify, reassign, auto-approve, auto-reject).

**Why this priority**: Escalation is important for operational continuity but not required for the basic approval flow to work. Workflows function without escalation — requests simply wait indefinitely.

**Independent Test**: Can be tested by creating a policy with escalation levels and assigning it to a workflow step. Delivers automated timeout handling for approval steps.

**Acceptance Scenarios**:

1. **Given** admin navigates to the Escalation Policies tab, **When** no policies exist, **Then** an empty state is shown
2. **Given** admin creates a new escalation policy with a name, **When** they add a level with a target group, timeout (in hours), and action, **Then** the policy is created with the level
3. **Given** a policy exists, **When** admin views its detail page, **Then** they see the policy name, status, and ordered list of escalation levels
4. **Given** a policy detail page, **When** admin adds another escalation level, **Then** the new level appears in the ordered list
5. **Given** a policy with multiple levels, **When** admin removes a level, **Then** the level is removed from the list
6. **Given** a policy exists, **When** admin sets it as the default escalation policy, **Then** it is marked as default for the tenant

---

### User Story 4 - Access Request Escalation Visibility (Priority: P3)

As a governance administrator reviewing an access request, I need to see escalation history and manage escalation state so that I can understand why a request was reassigned or auto-decided, and intervene if needed.

**Why this priority**: This enhances the existing access request detail page with escalation context. It's valuable but not required for the core approval system to function.

**Independent Test**: Can be tested by viewing an access request that has been escalated and verifying the escalation timeline is visible. Delivers transparency into the escalation process.

**Acceptance Scenarios**:

1. **Given** an access request that has been escalated, **When** admin views its detail page, **Then** they see an "Escalation History" section showing events with timestamps and actions taken
2. **Given** a pending access request with active escalation, **When** admin clicks "Cancel Escalation", **Then** the escalation timer is stopped and a confirmation appears
3. **Given** a pending access request with previously cancelled escalation, **When** admin clicks "Reset Escalation", **Then** the escalation timer restarts from the beginning

---

### User Story 5 - SoD Exemption Management (Priority: P3)

As a governance administrator, I need to manage SoD (Separation of Duties) exemptions so that I can grant time-limited exceptions to SoD rules when business needs require it, while maintaining an audit trail.

**Why this priority**: SoD exemptions are a compliance convenience feature. The existing SoD rules work without exemptions — violations are simply blocked or warned. Exemptions add flexibility for legitimate business needs.

**Independent Test**: Can be tested by creating an exemption for a specific SoD rule and user, verifying it appears in the exemptions list, and revoking it. Delivers exception management for SoD compliance.

**Acceptance Scenarios**:

1. **Given** admin navigates to SoD section and opens the Exemptions tab, **When** no exemptions exist, **Then** an empty state is shown
2. **Given** admin creates a new exemption, **When** they select a SoD rule, a user, provide justification, and optionally set an expiration date, **Then** the exemption is created with active status
3. **Given** active exemptions exist, **When** admin views the exemptions list, **Then** they see each exemption with rule name, user, justification, status, and expiration date
4. **Given** an active exemption, **When** admin revokes it, **Then** the exemption status changes to revoked and can no longer be used
5. **Given** an exemption with an expiration date in the past, **When** admin views the list, **Then** the exemption shows as expired

---

### Edge Cases

- What happens when admin tries to delete a workflow that is set as default? The system should prevent deletion and show an error explaining that the default workflow cannot be deleted.
- What happens when admin tries to delete a group that is referenced by a workflow step? The system should prevent deletion and explain the group is in use.
- What happens when admin tries to disable the only active group in a workflow step? The system should warn that the step will have no active approvers.
- What happens when admin adds a member who is already in the group? The system should show an error or silently ignore the duplicate.
- What happens when admin creates an escalation level with 0-hour timeout? The system should validate minimum timeout (at least 1 hour).
- What happens when admin tries to create a SoD exemption for a non-existent rule? The system should validate the rule exists.
- What happens when all escalation levels are removed from a policy? The policy should still be valid but effectively a no-op.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow admins to create approval workflows with a name, optional description, and ordered list of steps
- **FR-002**: System MUST allow admins to add steps to a workflow, each with an approval group, required approvals count, optional timeout, and optional escalation policy
- **FR-003**: System MUST allow admins to set one workflow as the tenant default, which is used for all new access requests
- **FR-004**: System MUST allow admins to edit workflow name and description
- **FR-005**: System MUST allow admins to delete non-default workflows
- **FR-006**: System MUST allow admins to create approval groups with a name and description
- **FR-007**: System MUST allow admins to add and remove members from approval groups
- **FR-008**: System MUST allow admins to enable and disable approval groups
- **FR-009**: System MUST allow admins to create escalation policies with a name and ordered list of levels
- **FR-010**: System MUST allow admins to add escalation levels with a target group, timeout in hours, and action (notify, reassign, auto-approve, or auto-reject)
- **FR-011**: System MUST allow admins to remove escalation levels from a policy
- **FR-012**: System MUST allow admins to set one escalation policy as the tenant default
- **FR-013**: System MUST display escalation history on access request detail pages when escalation events exist
- **FR-014**: System MUST allow admins to cancel active escalation on pending access requests
- **FR-015**: System MUST allow admins to reset escalation on pending access requests
- **FR-016**: System MUST allow admins to create SoD exemptions with a rule, user, justification, and optional expiration date
- **FR-017**: System MUST allow admins to view all SoD exemptions with status filtering
- **FR-018**: System MUST allow admins to revoke active SoD exemptions
- **FR-019**: System MUST display appropriate empty states when no workflows, groups, policies, or exemptions exist
- **FR-020**: System MUST validate all form inputs before submission and display clear error messages
- **FR-021**: System MUST restrict all approval configuration features to admin users only

### Key Entities

- **Approval Workflow**: Defines a multi-step approval process. Has a name, description, status (active/disabled/archived), and an ordered list of approval steps. One workflow per tenant can be marked as default.
- **Approval Step**: A single step within a workflow. References an approval group, specifies how many approvals are required, and optionally links to an escalation policy with a timeout.
- **Approval Group**: A named collection of users who can approve requests. Has a status (active/disabled) and a list of members with roles.
- **Group Member**: A user within an approval group, with an associated role (e.g., approver, admin).
- **Escalation Policy**: Defines automated escalation behavior when approval steps stall. Contains ordered escalation levels.
- **Escalation Level**: A single escalation tier within a policy. Specifies a target group, timeout in hours, and action (notify, reassign, auto-approve, auto-reject).
- **Escalation Event**: An audit record of an escalation action that occurred, with type, timestamp, and details.
- **SoD Exemption**: A time-limited exception to a SoD rule for a specific user. Has a justification, granting admin, expiration date, and status (active/expired/revoked).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can create a complete approval workflow (with groups and steps) in under 5 minutes
- **SC-002**: After setting a default workflow, 100% of new access requests are routed through the configured approval process (no more "No approval workflow configured" errors)
- **SC-003**: All approval configuration pages load within 2 seconds
- **SC-004**: Admins can manage group membership (add/remove) in under 30 seconds per operation
- **SC-005**: Escalation history is visible on 100% of access requests that have been escalated
- **SC-006**: SoD exemptions can be created and take effect within 1 minute of admin action
- **SC-007**: All CRUD operations across workflows, groups, policies, and exemptions show success/error feedback within 2 seconds

## Assumptions

- Admin users have the `admin` or `super_admin` role, consistent with existing governance features
- The backend API for approval workflows, groups, escalation policies, and SoD exemptions is fully functional
- Group members are selected from existing tenant users (no need to create users inline)
- Workflow steps are ordered sequentially (step 1 must be approved before step 2)
- Escalation policies are optional on workflow steps — steps without a policy simply wait indefinitely
- SoD exemptions are per-user, per-rule (not bulk exemptions)
- The existing access request detail page will be extended with escalation history, not replaced
- One workflow and one escalation policy can be set as default per tenant

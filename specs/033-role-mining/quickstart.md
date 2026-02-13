# Quickstart: Role Mining Analytics & Recommendations

## Prerequisites

- Admin user logged in
- At least one tenant with users and entitlements (for meaningful mining results)
- Backend running on localhost:8080

## E2E Validation Scenarios

### Scenario 1: Mining Job Lifecycle (US1)

1. Navigate to **Governance > Role Mining** in sidebar
2. Verify the hub loads with 6 tabs: Jobs, Patterns, Privileges, Consolidation, Simulations, Metrics
3. Click **"Create Job"** button
4. Fill form:
   - Name: "Q1 Access Analysis"
   - Min Users: 2
   - Min Entitlements: 2
   - Confidence Threshold: 0.5
   - Include Excessive Privilege: checked
   - Include Consolidation: checked
5. Submit → redirected to job list, new job shows with "Pending" badge
6. Click into job detail → verify parameters displayed correctly
7. Click **"Run"** → status changes to "Running", progress bar appears
8. Wait for completion (or verify status polling works)
9. Once "Completed" → verify metrics section shows candidate_count, excessive_privilege_count, consolidation_suggestion_count
10. Return to list → create second job, then **delete** it → confirm dialog → job removed

### Scenario 2: Candidate Review & Promotion (US2)

1. From a completed job detail, click "Candidates" section
2. Verify candidate list shows proposed_name, confidence_score (as bar), member_count, entitlement count
3. Click into a candidate → verify full entitlement_ids and user_ids lists
4. Click **"Promote"** → enter role name and optional description → confirm
5. Verify candidate status changes to "Promoted" and promoted_role_id is set
6. Go back, click another candidate → click **"Dismiss"** with optional reason
7. Verify candidate status changes to "Dismissed" and appears dimmed/de-emphasized

### Scenario 3: Access Patterns (US3)

1. On the hub, switch to **Patterns** tab
2. Select a completed job from the job selector dropdown
3. Verify access patterns load showing entitlement_ids, frequency, user_count
4. Adjust minimum frequency filter → verify list filters correctly
5. Click into a pattern → verify sample_user_ids displayed

### Scenario 4: Excessive Privileges (US3)

1. Switch to **Privileges** tab
2. Select a completed job
3. Verify flagged users display with user_id, deviation_percent, excess_entitlements count
4. Click into a flag → verify full details including peer_average, user_count
5. Click **"Accept"** with notes → verify status changes to "accepted"
6. Click another flag → click **"Remediate"** → verify status changes to "remediated"

### Scenario 5: Consolidation Suggestions (US4)

1. Switch to **Consolidation** tab
2. Select a completed job
3. Verify suggestions show role_a_id, role_b_id, overlap_percent, shared_entitlements count
4. Click into a suggestion → verify full detail with unique_to_a, unique_to_b
5. Click **"Dismiss"** with reason → verify status changes to "dismissed"
6. If no suggestions, verify empty state message

### Scenario 6: Simulations (US5)

1. Switch to **Simulations** tab
2. Click **"Create Simulation"**
3. Fill form:
   - Name: "Test Add Entitlement"
   - Scenario Type: add_entitlement
   - Target Role ID: (select existing role)
   - Entitlement ID: (select entitlement to add)
4. Submit → simulation created in "Draft" status
5. Click **"Execute"** → simulation processes and shows affected_users, access_gained, access_lost
6. Review impact → click **"Apply"** → status changes to "Applied"
7. Create another simulation → click **"Cancel"** → verify removed/cancelled

### Scenario 7: Role Metrics (US-extra)

1. Switch to **Metrics** tab
2. Verify role metrics list shows roles with utilization_rate, coverage_rate, user_count, trend_direction
3. Click into a role → verify per-entitlement usage breakdown
4. Click **"Recalculate"** → verify metrics refresh

### Scenario 8: Dark Mode

1. Toggle dark mode → verify all tabs render correctly
2. Check status badges, progress bars, and metric visualizations in dark theme

### Scenario 9: Admin Guard

1. Log out and log in as non-admin user
2. Verify "Role Mining" does NOT appear in sidebar
3. Navigate directly to /governance/role-mining → verify redirect or 403

### Scenario 10: Edge Cases

1. Create a job and try to run it twice → verify second run is blocked for non-pending jobs
2. View a job with zero candidates → verify empty state message
3. Try to promote an already-promoted candidate → verify appropriate error
4. View Patterns tab with no job selected → verify prompt to select a job

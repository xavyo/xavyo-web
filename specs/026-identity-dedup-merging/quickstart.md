# Quickstart: Identity Deduplication & Merging

## Prerequisites

- xavyo-idp backend running on localhost:8080
- Dev server running on localhost:3000 (`npm run dev -- --port 3000`)
- Logged in as admin user
- At least 2 users in the tenant (for duplicate detection to find pairs)

## E2E Test Flow

### 1. Navigate to Deduplication Hub

1. Open http://localhost:3000/governance/dedup
2. Verify page loads with tabs: Duplicates, Batch Merge, Merge History
3. Verify Duplicates tab is active by default
4. If no duplicates exist, verify empty state with "Run Detection" CTA

### 2. Run Detection Scan

1. Click "Run Detection" button
2. Optionally adjust confidence threshold (default 70)
3. Confirm the scan
4. Verify scan results are displayed (users processed, duplicates found, new duplicates)
5. Verify duplicate list refreshes with newly detected pairs

### 3. View Duplicate Detail

1. Click on a duplicate pair in the list
2. Verify detail page shows:
   - Side-by-side identity summaries (email, display name, department)
   - Attribute comparison table with matching/differing indicators
   - Rule match breakdown with similarity scores
   - "Merge" and "Dismiss" action buttons
3. Verify confidence badge is color-coded appropriately

### 4. Dismiss a False Positive

1. From a duplicate detail page, click "Dismiss"
2. Enter a reason (e.g., "Different people with similar names")
3. Confirm dismissal
4. Verify redirect to duplicate list
5. Verify the pair no longer appears in the "pending" filter
6. Switch filter to "dismissed" and verify the pair appears

### 5. Preview and Execute Merge

1. From a pending duplicate detail page, click "Merge"
2. Verify merge preview page shows:
   - Source and target identities side-by-side
   - For each differing attribute, radio buttons to select source or target value
   - Entitlement strategy selector (union/intersection/manual)
   - Entitlements preview section showing source-only, target-only, common, and merged
   - SoD violations section (if any)
3. Select attribute values and entitlement strategy
4. Click "Execute Merge"
5. Verify success toast and redirect to dedup hub
6. Verify the merged pair no longer appears in pending list

### 6. Batch Merge

1. Navigate to Batch Merge tab on the dedup hub
2. Select candidate pairs (or use "all pending" option)
3. Choose entitlement strategy and attribute resolution rule
4. Click "Preview" to see affected pairs
5. Click "Execute Batch"
6. Verify results summary: successful, failed, skipped counts

### 7. Merge Audit Trail

1. Navigate to Merge History tab on the dedup hub
2. Verify list of past merge operations with timestamps
3. Click an audit entry
4. Verify detail shows:
   - Source/target pre-merge snapshots
   - Merged result
   - Attribute decisions made
   - Entitlement decisions
   - SoD violations (if any were overridden)

### 8. Dark Mode Verification

1. Toggle theme to dark mode
2. Verify all pages render correctly:
   - Dedup hub (list + tabs)
   - Duplicate detail (comparison + rule matches)
   - Merge preview (field selection + entitlement preview)
   - Audit detail (snapshot display)
3. Toggle back to light mode and verify

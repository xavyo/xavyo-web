# Quickstart: NHI Protocols & Advanced

## Prerequisites

- xavyo-idp running on localhost:8080 (Docker)
- xavyo-web dev server running (`npm run dev`)
- Admin user logged in
- At least one NHI agent and one NHI tool created (from feature 006)

## Test Scenarios

### Scenario 1: MCP Tool Discovery

1. Navigate to NHI list → click an agent → "MCP Tools" tab
2. Verify tools list loads (or empty state if no tools)
3. Expand a tool to see JSON Schema
4. Enter test parameters in the invoke form
5. Click "Test Invoke" → verify result, call ID, latency display
6. Try invalid parameters → verify error display

### Scenario 2: A2A Task Management

1. Navigate to NHI → "A2A Tasks" sub-page
2. Verify paginated task list loads
3. Filter by state "pending" → verify filter works
4. Click "Create Task" → fill target agent, task type, input JSON
5. Submit → verify task appears in list with "pending" state
6. Click task → verify detail page with all fields
7. Cancel a pending task → verify state changes to "cancelled"

### Scenario 3: Permission Management

1. Navigate to an agent detail → "Permissions" tab
2. View "Tool Access" section
3. Click "Grant Tool Access" → select a tool → optional expiry → grant
4. Verify permission appears in list
5. Click "Revoke" → confirm → verify removed
6. View "Calling Permissions" section
7. Grant NHI-to-NHI permission with rate limit
8. View "Users" section → grant user access → revoke

### Scenario 4: Agent Card Discovery

1. Navigate to an active agent detail page
2. Click "Agent Card" tab/section
3. Verify card displays: name, description, URL, version, protocol version
4. Verify capabilities and skills sections
5. Navigate to an inactive agent → verify "unavailable" message

### Scenario 5: Dark Mode

1. Toggle dark mode
2. Verify all new tabs and pages render correctly in dark mode
3. Check JSON code blocks have proper contrast
4. Verify badges and status indicators are readable

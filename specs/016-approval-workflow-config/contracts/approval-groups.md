# API Contract: Approval Groups

## BFF Proxy Endpoints

### GET /api/governance/approval-groups
List all groups for the tenant.
- Query: `?limit=100&offset=0`
- Response: `{ items: ApprovalGroup[], total: number, limit: number, offset: number }`

### POST /api/governance/approval-groups
Create a new group.
- Body: `{ name: string, description?: string }`
- Response: `ApprovalGroup`

### GET /api/governance/approval-groups/[id]
Get group detail with members.
- Response: `ApprovalGroup` (includes `members: GroupMember[]`)

### PUT /api/governance/approval-groups/[id]
Update group name/description.
- Body: `{ name?: string, description?: string }`
- Response: `ApprovalGroup`

### DELETE /api/governance/approval-groups/[id]
Delete a group (fails if referenced by workflow steps).
- Response: 204 No Content

### POST /api/governance/approval-groups/[id]/enable
Enable a disabled group.
- Body: none
- Response: `ApprovalGroup`

### POST /api/governance/approval-groups/[id]/disable
Disable an active group.
- Body: none
- Response: `ApprovalGroup`

### POST /api/governance/approval-groups/[id]/members
Add a member to the group.
- Body: `{ user_id: string, role: string }`
- Response: `GroupMember`

## Server-Side Form Actions (SvelteKit)

### Group Create Page (`+page.server.ts`)
- `default` action: Validate with `createGroupSchema`, call POST, redirect to detail page

### Group Detail Page (`+page.server.ts`)
- `load`: Fetch group by ID, fetch users list for member selection
- `edit` action: Validate with `updateGroupSchema`, call PUT
- `enable` action: Call POST enable
- `disable` action: Call POST disable
- `addMember` action: Validate user_id + role, call POST members
- `removeMember` action: Call DELETE member (via PUT with updated members list or specific endpoint)
- `delete` action: Call DELETE, redirect to hub

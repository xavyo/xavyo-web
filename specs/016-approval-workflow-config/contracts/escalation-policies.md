# API Contract: Escalation Policies

## BFF Proxy Endpoints

### GET /api/governance/escalation-policies
List all escalation policies for the tenant.
- Query: `?limit=100&offset=0`
- Response: `{ items: EscalationPolicy[], total: number, limit: number, offset: number }`

### POST /api/governance/escalation-policies
Create a new escalation policy.
- Body: `{ name: string, description?: string }`
- Response: `EscalationPolicy`

### GET /api/governance/escalation-policies/[id]
Get policy detail with levels.
- Response: `EscalationPolicy` (includes `levels: EscalationLevel[]`)

### PUT /api/governance/escalation-policies/[id]
Update policy name/description.
- Body: `{ name?: string, description?: string }`
- Response: `EscalationPolicy`

### DELETE /api/governance/escalation-policies/[id]
Delete a policy.
- Response: 204 No Content

### POST /api/governance/escalation-policies/[id]/set-default
Set policy as tenant default.
- Body: none
- Response: `EscalationPolicy`

### POST /api/governance/escalation-policies/[id]/levels
Add an escalation level.
- Body: `{ target_group_id: string, timeout_hours: number, action: EscalationAction }`
- Response: `EscalationLevel`

### DELETE /api/governance/escalation-policies/[id]/levels/[levelId]
Remove an escalation level.
- Response: 204 No Content

## Server-Side Form Actions (SvelteKit)

### Escalation Policy Create Page (`+page.server.ts`)
- `default` action: Validate with `createEscalationPolicySchema`, call POST, redirect to detail page

### Escalation Policy Detail Page (`+page.server.ts`)
- `load`: Fetch policy by ID, fetch groups for level target selection
- `edit` action: Validate with `updateEscalationPolicySchema`, call PUT
- `setDefault` action: Call POST set-default
- `addLevel` action: Validate with `addLevelSchema`, call POST levels
- `removeLevel` action: Call DELETE level
- `delete` action: Call DELETE, redirect to hub

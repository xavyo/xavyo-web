# API Contract: SoD Exemptions

## BFF Proxy Endpoints

### GET /api/governance/sod-exemptions
List all SoD exemptions for the tenant.
- Query: `?limit=100&offset=0&status=active`
- Response: `{ items: SodExemption[], total: number, limit: number, offset: number }`

### POST /api/governance/sod-exemptions
Create a new SoD exemption.
- Body: `{ rule_id: string, user_id: string, justification: string, expires_at?: string }`
- Response: `SodExemption`

### GET /api/governance/sod-exemptions/[id]
Get exemption detail.
- Response: `SodExemption`

### POST /api/governance/sod-exemptions/[id]/revoke
Revoke an active exemption.
- Body: none
- Response: `SodExemption`

## Access Request Escalation Endpoints

### GET /api/governance/access-requests/[id]/escalation-history
Get escalation events for an access request.
- Response: `{ events: EscalationEvent[] }`

### POST /api/governance/access-requests/[id]/cancel-escalation
Cancel active escalation on a pending request.
- Body: none
- Response: `{ success: boolean }`

### POST /api/governance/access-requests/[id]/reset-escalation
Reset escalation timer on a pending request.
- Body: none
- Response: `{ success: boolean }`

## Server-Side Form Actions (SvelteKit)

### SoD Exemption Create Page (`+page.server.ts`)
- `load`: Fetch SoD rules list + users list for selectors
- `default` action: Validate with `createExemptionSchema`, call POST, redirect to SoD exemptions list

### Access Request Detail Page (modify existing `+page.server.ts`)
- `load`: Add escalation history fetch (existing load + new history call)
- `cancelEscalation` action: Call POST cancel-escalation
- `resetEscalation` action: Call POST reset-escalation

# API Contract: Approval Workflows

## BFF Proxy Endpoints

### GET /api/governance/approval-workflows
List all workflows for the tenant.
- Query: `?limit=100&offset=0`
- Response: `{ items: ApprovalWorkflow[], total: number, limit: number, offset: number }`

### POST /api/governance/approval-workflows
Create a new workflow.
- Body: `{ name: string, description?: string }`
- Response: `ApprovalWorkflow`

### GET /api/governance/approval-workflows/[id]
Get workflow detail with steps.
- Response: `ApprovalWorkflow` (includes `steps: ApprovalStep[]`)

### PUT /api/governance/approval-workflows/[id]
Update workflow name/description.
- Body: `{ name?: string, description?: string }`
- Response: `ApprovalWorkflow`

### DELETE /api/governance/approval-workflows/[id]
Delete a non-default workflow.
- Response: 204 No Content

### POST /api/governance/approval-workflows/[id]/set-default
Set workflow as tenant default.
- Body: none
- Response: `ApprovalWorkflow`

## Server-Side Form Actions (SvelteKit)

### Workflow Create Page (`+page.server.ts`)
- `default` action: Validate with `createWorkflowSchema`, call POST, redirect to detail page

### Workflow Detail Page (`+page.server.ts`)
- `load`: Fetch workflow by ID, prepare edit form
- `edit` action: Validate with `updateWorkflowSchema`, call PUT
- `setDefault` action: Call POST set-default
- `delete` action: Call DELETE, redirect to hub
- `addStep` action: Validate with `addStepSchema`, call POST to add step
- `removeStep` action: Call DELETE to remove step

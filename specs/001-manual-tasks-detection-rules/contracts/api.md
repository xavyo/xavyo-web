# API Contracts: Manual Provisioning Tasks & Detection Rules

## Manual Tasks

### GET /governance/manual-tasks
List manual tasks with filtering.

**Query Parameters**:
- `status` (string[], optional): Filter by status (pending, in_progress, completed, rejected, cancelled)
- `application_id` (UUID, optional): Filter by application
- `user_id` (UUID, optional): Filter by target user
- `sla_breached` (boolean, optional): Filter by SLA breach
- `assignee_id` (UUID, optional): Filter by assignee
- `limit` (integer, optional): Default 50, max 100
- `offset` (integer, optional): Default 0

**Response 200**: `{ items: ManualTask[], total: number, limit: number, offset: number }`

### GET /governance/manual-tasks/dashboard
Get dashboard metrics.

**Response 200**: `ManualTaskDashboard`

### GET /governance/manual-tasks/{id}
Get task detail.

**Response 200**: `ManualTask`
**Response 404**: Task not found

### POST /governance/manual-tasks/{id}/claim
Assign task to current user.

**Response 200**: `ManualTask` (updated)
**Response 409**: Task already assigned

### POST /governance/manual-tasks/{id}/start
Move task to in_progress.

**Response 200**: `ManualTask` (updated)
**Response 409**: Invalid status transition

### POST /governance/manual-tasks/{id}/confirm
Confirm task completion.

**Request Body**: `{ notes?: string }`
**Response 200**: `ManualTask` (updated)
**Response 409**: Invalid status transition

### POST /governance/manual-tasks/{id}/reject
Reject task.

**Request Body**: `{ reason: string }` (5-1000 chars)
**Response 200**: `ManualTask` (updated)
**Response 400**: Invalid reason length
**Response 409**: Invalid status transition

### POST /governance/manual-tasks/{id}/cancel
Cancel pending task.

**Response 200**: `ManualTask` (updated)
**Response 409**: Invalid status transition

## Semi-Manual Configuration

### GET /governance/semi-manual/applications
List semi-manual applications.

**Query Parameters**:
- `limit` (integer, optional): Default 50, max 100
- `offset` (integer, optional): Default 0

**Response 200**: `{ items: SemiManualApplication[], total: number, limit: number, offset: number }`

### GET /governance/semi-manual/applications/{id}
Get semi-manual config for app.

**Response 200**: `SemiManualApplication`
**Response 404**: App not found

### PUT /governance/semi-manual/applications/{id}
Configure app as semi-manual.

**Request Body**: `{ is_semi_manual: boolean, ticketing_config_id?: UUID, sla_policy_id?: UUID, requires_approval_before_ticket: boolean }`
**Response 200**: `SemiManualApplication` (updated)

### DELETE /governance/semi-manual/applications/{id}
Remove semi-manual config.

**Response 200**: `SemiManualApplication`

## Detection Rules

### GET /governance/detection-rules
List detection rules.

**Query Parameters**:
- `rule_type` (string, optional): Filter by type (NoManager, Terminated, Inactive, Custom)
- `is_enabled` (boolean, optional): Filter by enabled
- `limit` (integer, optional): Default 50, max 100
- `offset` (integer, optional): Default 0

**Response 200**: `{ items: DetectionRule[], total: number, limit: number, offset: number }`

### GET /governance/detection-rules/{id}
Get rule detail.

**Response 200**: `DetectionRule`
**Response 404**: Rule not found

### POST /governance/detection-rules
Create detection rule.

**Request Body**: `{ name: string, rule_type: string, is_enabled: boolean, priority: number, parameters?: JSON, description?: string }`
**Response 201**: `DetectionRule`
**Response 409**: Duplicate name

### PUT /governance/detection-rules/{id}
Update detection rule.

**Request Body**: `{ name?: string, is_enabled?: boolean, priority?: number, parameters?: JSON, description?: string }`
**Response 200**: `DetectionRule` (updated)
**Response 409**: Duplicate name

### DELETE /governance/detection-rules/{id}
Delete detection rule.

**Response 204**: No content

### POST /governance/detection-rules/{id}/enable
Enable detection rule.

**Response 200**: `DetectionRule` (updated)

### POST /governance/detection-rules/{id}/disable
Disable detection rule.

**Response 200**: `DetectionRule` (updated)

### POST /governance/detection-rules/seed-defaults
Seed default detection rules.

**Response 200**: `DetectionRule[]` (created rules)

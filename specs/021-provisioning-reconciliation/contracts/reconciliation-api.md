# Reconciliation API Contracts

## Per-Connector Reconciliation Runs

### POST /connectors/{id}/reconciliation/runs
Trigger a new reconciliation run.

**Request Body**:
```json
{
  "mode": "full|delta",
  "dry_run": false
}
```

**Response**: `202 Accepted` → ReconciliationRun

### GET /connectors/{id}/reconciliation/runs
List reconciliation runs.

**Query Parameters**:
- `mode` (string, optional) — Filter by mode
- `status` (string, optional) — Filter by status
- `limit` (integer, optional) — Page size
- `offset` (integer, optional) — Page offset

**Response**: `200 OK`
```json
{
  "runs": [ReconciliationRun],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

### GET /connectors/{id}/reconciliation/runs/{run_id}
Get run detail.

**Response**: `200 OK` → ReconciliationRun

### POST /connectors/{id}/reconciliation/runs/{run_id}/cancel
Cancel an in-progress run.

**Response**: `204 No Content`

### POST /connectors/{id}/reconciliation/runs/{run_id}/resume
Resume a paused run.

**Response**: `200 OK` → ReconciliationRun

### GET /connectors/{id}/reconciliation/runs/{run_id}/report
Get detailed reconciliation report.

**Response**: `200 OK` → ReconciliationReport

## Discrepancies

### GET /connectors/{id}/reconciliation/discrepancies
List discrepancies.

**Query Parameters**:
- `run_id` (uuid, optional) — Filter by run
- `discrepancy_type` (DiscrepancyType, optional) — Filter by type
- `resolution_status` (string, optional) — Filter by resolution
- `identity_id` (uuid, optional) — Filter by identity
- `external_uid` (string, optional) — Filter by external UID
- `limit` (integer, optional) — Page size
- `offset` (integer, optional) — Page offset

**Response**: `200 OK`
```json
{
  "discrepancies": [Discrepancy],
  "total": 25,
  "limit": 20,
  "offset": 0
}
```

### GET /connectors/{id}/reconciliation/discrepancies/{discrepancy_id}
Get discrepancy detail.

**Response**: `200 OK` → Discrepancy

### POST /connectors/{id}/reconciliation/discrepancies/{discrepancy_id}/remediate
Remediate a discrepancy.

**Request Body**:
```json
{
  "action": "create|update|delete|link|unlink|inactivate_identity",
  "direction": "xavyo_to_target|target_to_xavyo",
  "identity_id": "uuid (optional)",
  "dry_run": false
}
```

**Response**: `200 OK` → RemediationResult

### POST /connectors/{id}/reconciliation/discrepancies/bulk-remediate
Bulk remediate up to 100 discrepancies.

**Request Body**:
```json
{
  "items": [
    {
      "discrepancy_id": "uuid",
      "action": "update",
      "direction": "xavyo_to_target"
    }
  ],
  "dry_run": false
}
```

**Response**: `200 OK`
```json
{
  "results": [RemediationResult],
  "total": 50,
  "succeeded": 48,
  "failed": 2
}
```

### POST /connectors/{id}/reconciliation/discrepancies/preview
Preview remediation changes.

**Request Body**:
```json
{
  "discrepancy_ids": ["uuid", "uuid"]
}
```

**Response**: `200 OK`
```json
{
  "previews": [
    {
      "discrepancy_id": "uuid",
      "suggested_action": "update",
      "suggested_direction": "xavyo_to_target",
      "changes": {}
    }
  ]
}
```

### POST /connectors/{id}/reconciliation/discrepancies/{discrepancy_id}/ignore
Ignore a discrepancy.

**Response**: `204 No Content`

## Reconciliation Actions (Audit Log)

### GET /connectors/{id}/reconciliation/actions
List reconciliation actions.

**Query Parameters**:
- `discrepancy_id` (uuid, optional) — Filter by discrepancy
- `action_type` (string, optional) — Filter by action type
- `result` (string, optional) — Filter by result
- `dry_run` (boolean, optional) — Filter by dry-run flag
- `limit` (integer, optional) — Page size
- `offset` (integer, optional) — Page offset

**Response**: `200 OK`
```json
{
  "actions": [ReconciliationAction],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

## Reconciliation Schedules (Per-Connector)

### GET /connectors/{id}/reconciliation/schedule
Get connector's reconciliation schedule.

**Response**: `200 OK` → ReconciliationSchedule (or 404 if none)

### PUT /connectors/{id}/reconciliation/schedule
Create or update schedule.

**Request Body**:
```json
{
  "mode": "full|delta",
  "frequency": "hourly|daily|weekly|monthly|cron",
  "day_of_week": 1,
  "day_of_month": null,
  "hour_of_day": 2,
  "enabled": true
}
```

**Response**: `200 OK` → ReconciliationSchedule

### DELETE /connectors/{id}/reconciliation/schedule
Delete schedule.

**Response**: `204 No Content`

### POST /connectors/{id}/reconciliation/schedule/enable
Enable schedule.

**Response**: `204 No Content`

### POST /connectors/{id}/reconciliation/schedule/disable
Disable schedule.

**Response**: `204 No Content`

## Global Reconciliation

### GET /reconciliation/schedules
List all connector schedules.

**Response**: `200 OK`
```json
{
  "schedules": [ReconciliationSchedule]
}
```

### GET /reconciliation/trend
Discrepancy trend over time.

**Query Parameters**:
- `connector_id` (uuid, optional) — Filter by connector
- `from` (datetime, optional) — Start date
- `to` (datetime, optional) — End date

**Response**: `200 OK`
```json
{
  "data_points": [DiscrepancyTrendPoint],
  "connector_id": "uuid or null",
  "from": "datetime",
  "to": "datetime"
}
```

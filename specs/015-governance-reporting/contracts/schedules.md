# API Contract: Report Schedules

## GET /governance/reports/schedules

List report schedules with optional filtering.

**Query Parameters:**
- `template_id`: UUID (optional)
- `status`: string (optional) — active|paused|disabled
- `limit`: integer (default: 50, max: 100)
- `offset`: integer (default: 0)

**Response 200:**
```json
{
  "items": [ReportSchedule],
  "total": integer,
  "page": integer,
  "page_size": integer
}
```

## POST /governance/reports/schedules

Create a new schedule.

**Request Body:**
```json
{
  "template_id": "UUID (required)",
  "name": "string (required)",
  "frequency": "daily|weekly|monthly",
  "schedule_hour": integer (0-23),
  "schedule_day_of_week": integer (0-6) | null,
  "schedule_day_of_month": integer (1-31) | null,
  "parameters": object | null,
  "recipients": ["email-string"],
  "output_format": "json|csv"
}
```

**Constraints:**
- Weekly requires `schedule_day_of_week`
- Monthly requires `schedule_day_of_month`
- Name unique per tenant

**Response 201:** ReportSchedule

## GET /governance/reports/schedules/{id}

**Response 200:** ReportSchedule

## PUT /governance/reports/schedules/{id}

**Request Body:**
```json
{
  "name": "string (optional)",
  "frequency": "daily|weekly|monthly (optional)",
  "schedule_hour": integer (optional)",
  "schedule_day_of_week": integer | null (optional)",
  "schedule_day_of_month": integer | null (optional)",
  "parameters": object | null (optional)",
  "recipients": ["email-string"] | null (optional)",
  "output_format": "json|csv (optional)"
}
```

**Response 200:** ReportSchedule (recalculated next_run_at if timing changed)

## DELETE /governance/reports/schedules/{id}

**Response 204:** No Content

## POST /governance/reports/schedules/{id}/pause

Pause an active schedule.

**Response 200:** ReportSchedule (status: "paused")
**Error 400:** Already paused

## POST /governance/reports/schedules/{id}/resume

Resume a paused or disabled schedule.

**Response 200:** ReportSchedule (status: "active", recalculated next_run_at, reset consecutive_failures)
**Error 400:** Already active

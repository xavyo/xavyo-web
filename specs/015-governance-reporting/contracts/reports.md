# API Contract: Generated Reports

## GET /governance/reports

List generated reports with optional filtering.

**Query Parameters:**
- `template_id`: UUID (optional)
- `status`: string (optional) — pending|generating|completed|failed
- `from_date`: datetime (optional)
- `to_date`: datetime (optional)
- `limit`: integer (default: 50, max: 100)
- `offset`: integer (default: 0)

**Response 200:**
```json
{
  "items": [GeneratedReport],
  "total": integer,
  "page": integer,
  "page_size": integer
}
```

## POST /governance/reports/generate

Generate a new report on-demand.

**Request Body:**
```json
{
  "template_id": "UUID (required)",
  "name": "string (optional)",
  "parameters": object | null,
  "output_format": "json|csv"
}
```

**Response 201:** GeneratedReport (with final status — completed or failed)

## GET /governance/reports/{id}

**Response 200:** GeneratedReport

## GET /governance/reports/{id}/data

Get the report output data (completed reports only).

**Response 200:** Raw JSON data (serde_json::Value)
**Error 400:** Report not completed
**Error 404:** No inline data (file-based storage)

## DELETE /governance/reports/{id}

Delete a report (pending/failed only).

**Response 204:** No Content
**Error 400:** Cannot delete completed/generating reports

## POST /governance/reports/cleanup

Delete expired reports past retention date.

**Response 200:**
```json
{
  "deleted_count": integer
}
```

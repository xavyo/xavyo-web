# API Contracts: SIEM Export & Audit Streaming

**Feature**: 035-siem-export
**Date**: 2026-02-13
**Base URL**: Backend `http://localhost:8080`, BFF proxy `/api/governance/siem`

## Authentication

All endpoints require:
- `Authorization: Bearer <access_token>` header
- `X-Tenant-Id: <tenant_id>` header
- Admin role (checked by backend via `hasAdminRole()`)

## Pagination Format

All list endpoints return: `{ items: T[], total: number, limit: number, offset: number }`
Default: limit=20 (max 100), offset=0

---

## SIEM Destinations

### List Destinations
```
GET /governance/siem/destinations?enabled=&destination_type=&limit=20&offset=0
BFF: GET /api/governance/siem/destinations?enabled=&destination_type=&limit=20&offset=0

Query Parameters:
  enabled          - boolean (optional) - filter by enabled status
  destination_type - string (optional) - filter by type: syslog_tcp_tls|syslog_udp|webhook|splunk_hec
  limit            - number (optional) - page size (default 20, max 100)
  offset           - number (optional) - pagination offset (default 0)

Response 200:
{
  "items": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "tenant_id": "t1t2t3t4-t5t6-7890-abcd-ef1234567890",
      "name": "Production Splunk",
      "destination_type": "splunk_hec",
      "endpoint_host": "splunk.example.com",
      "endpoint_port": 8088,
      "export_format": "json",
      "has_auth_config": true,
      "event_type_filter": ["authentication", "security", "administrative"],
      "rate_limit_per_second": 500,
      "queue_buffer_size": 10000,
      "circuit_breaker_threshold": 5,
      "circuit_breaker_cooldown_secs": 60,
      "circuit_state": "closed",
      "circuit_last_failure_at": null,
      "enabled": true,
      "splunk_source": "xavyo-idp",
      "splunk_sourcetype": "xavyo:audit",
      "splunk_index": "main",
      "splunk_ack_enabled": true,
      "syslog_facility": 1,
      "tls_verify_cert": true,
      "created_at": "2026-02-01T10:00:00Z",
      "updated_at": "2026-02-10T14:30:00Z",
      "created_by": "u1u2u3u4-u5u6-7890-abcd-ef1234567890"
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

### Create Destination
```
POST /governance/siem/destinations
BFF: POST /api/governance/siem/destinations

Request:
{
  "name": "Production Syslog",
  "destination_type": "syslog_tcp_tls",
  "endpoint_host": "syslog.example.com",
  "endpoint_port": 6514,
  "export_format": "cef",
  "event_type_filter": ["authentication", "security"],
  "rate_limit_per_second": 200,
  "queue_buffer_size": 5000,
  "circuit_breaker_threshold": 3,
  "circuit_breaker_cooldown_secs": 30,
  "enabled": false,
  "syslog_facility": 4,
  "tls_verify_cert": true,
  "auth_config": {
    "auth_type": "none"
  }
}

Response 201: SiemDestination (same shape as list item)

Errors:
  400: { "error": "Invalid destination configuration" }
  409: { "error": "Destination with this name already exists" }
```

### Get Destination
```
GET /governance/siem/destinations/{id}
BFF: GET /api/governance/siem/destinations/{id}

Response 200: SiemDestination (same shape as list item)

Errors:
  404: { "error": "Destination not found" }
```

### Update Destination
```
PUT /governance/siem/destinations/{id}
BFF: PUT /api/governance/siem/destinations/{id}

Request (all fields optional):
{
  "name": "Updated Syslog",
  "endpoint_host": "new-syslog.example.com",
  "endpoint_port": 6515,
  "export_format": "syslog_rfc5424",
  "event_type_filter": ["authentication", "security", "user_lifecycle"],
  "rate_limit_per_second": 300,
  "queue_buffer_size": 8000,
  "circuit_breaker_threshold": 5,
  "circuit_breaker_cooldown_secs": 60,
  "enabled": true,
  "syslog_facility": 1,
  "tls_verify_cert": false,
  "auth_config": {
    "auth_type": "bearer_token",
    "token": "new-secret-token"
  }
}

Response 200: SiemDestination (updated)

Errors:
  400: { "error": "Invalid destination configuration" }
  404: { "error": "Destination not found" }
  409: { "error": "Destination with this name already exists" }
```

### Delete Destination
```
DELETE /governance/siem/destinations/{id}
BFF: DELETE /api/governance/siem/destinations/{id}

Response 204: (no content)

Errors:
  404: { "error": "Destination not found" }
```

---

## Test Connectivity

### Test Destination Connection
```
POST /governance/siem/destinations/{id}/test
BFF: POST /api/governance/siem/destinations/{id}/test

Request: (empty body)

Response 200:
{
  "success": true,
  "latency_ms": 42,
  "error": null
}

Response 200 (failure):
{
  "success": false,
  "latency_ms": null,
  "error": "Connection refused: syslog.example.com:6514"
}

Errors:
  404: { "error": "Destination not found" }
```

---

## Health Monitoring

### Get Health Summary
```
GET /governance/siem/destinations/{id}/health
BFF: GET /api/governance/siem/destinations/{id}/health

Response 200:
{
  "destination_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "total_events_sent": 150432,
  "total_events_delivered": 149800,
  "total_events_failed": 612,
  "total_events_dropped": 20,
  "avg_latency_ms": 23.5,
  "last_success_at": "2026-02-13T10:30:00Z",
  "last_failure_at": "2026-02-12T08:15:00Z",
  "success_rate_percent": 99.58,
  "circuit_state": "closed",
  "dead_letter_count": 47
}

Errors:
  404: { "error": "Destination not found" }
```

### Get Health History
```
GET /governance/siem/destinations/{id}/health/history?limit=24&offset=0
BFF: GET /api/governance/siem/destinations/{id}/health/history?limit=24&offset=0

Query Parameters:
  limit  - number (optional) - page size (default 24 for 24-hour history)
  offset - number (optional) - pagination offset (default 0)

Response 200:
{
  "items": [
    {
      "id": "h1h2h3h4-h5h6-7890-abcd-ef1234567890",
      "destination_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "window_start": "2026-02-13T09:00:00Z",
      "window_end": "2026-02-13T10:00:00Z",
      "events_sent": 6230,
      "events_delivered": 6215,
      "events_failed": 15,
      "events_dropped": 0,
      "avg_latency_ms": 21.3,
      "p95_latency_ms": 45.8,
      "last_success_at": "2026-02-13T09:59:58Z",
      "last_failure_at": "2026-02-13T09:12:33Z",
      "created_at": "2026-02-13T10:00:01Z"
    }
  ],
  "total": 168,
  "limit": 24,
  "offset": 0
}

Errors:
  404: { "error": "Destination not found" }
```

---

## Dead Letter Queue

### List Dead Letter Events
```
GET /governance/siem/destinations/{id}/dead-letter?limit=20&offset=0
BFF: GET /api/governance/siem/destinations/{id}/dead-letter?limit=20&offset=0

Query Parameters:
  limit  - number (optional) - page size (default 20, max 100)
  offset - number (optional) - pagination offset (default 0)

Response 200:
{
  "items": [
    {
      "id": "e1e2e3e4-e5e6-7890-abcd-ef1234567890",
      "destination_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "source_event_id": "s1s2s3s4-s5s6-7890-abcd-ef1234567890",
      "source_event_type": "authentication",
      "event_timestamp": "2026-02-12T08:10:00Z",
      "formatted_payload": "CEF:0|Xavyo|IDP|1.0|AUTH_LOGIN|User Login|3|...",
      "delivery_status": "dead_letter",
      "retry_count": 5,
      "next_retry_at": null,
      "last_attempt_at": "2026-02-12T08:25:00Z",
      "error_detail": "Connection timed out after 30s",
      "delivered_at": null,
      "delivery_latency_ms": null,
      "created_at": "2026-02-12T08:10:01Z"
    }
  ],
  "total": 47,
  "limit": 20,
  "offset": 0
}

Errors:
  404: { "error": "Destination not found" }
```

### Redeliver Dead Letter Events
```
POST /governance/siem/destinations/{id}/dead-letter/redeliver
BFF: POST /api/governance/siem/destinations/{id}/dead-letter/redeliver

Request: (empty body)

Response 200:
{
  "events_requeued": 47
}

Errors:
  404: { "error": "Destination not found" }
  409: { "error": "Circuit breaker is open, cannot redeliver" }
```

---

## Batch Exports

### List Exports
```
GET /governance/siem/exports?status=&output_format=&limit=20&offset=0
BFF: GET /api/governance/siem/exports?status=&output_format=&limit=20&offset=0

Query Parameters:
  status        - string (optional) - filter: pending|processing|completed|failed
  output_format - string (optional) - filter: cef|syslog_rfc5424|json|csv
  limit         - number (optional) - page size (default 20, max 100)
  offset        - number (optional) - pagination offset (default 0)

Response 200:
{
  "items": [
    {
      "id": "x1x2x3x4-x5x6-7890-abcd-ef1234567890",
      "tenant_id": "t1t2t3t4-t5t6-7890-abcd-ef1234567890",
      "requested_by": "u1u2u3u4-u5u6-7890-abcd-ef1234567890",
      "date_range_start": "2026-01-01T00:00:00Z",
      "date_range_end": "2026-01-31T23:59:59Z",
      "event_type_filter": ["authentication", "security"],
      "output_format": "json",
      "status": "completed",
      "total_events": 45230,
      "file_size_bytes": 12582912,
      "error_detail": null,
      "started_at": "2026-02-10T14:00:05Z",
      "completed_at": "2026-02-10T14:02:33Z",
      "expires_at": "2026-02-17T14:02:33Z",
      "created_at": "2026-02-10T14:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

### Create Export
```
POST /governance/siem/exports
BFF: POST /api/governance/siem/exports

Request:
{
  "date_range_start": "2026-01-01T00:00:00Z",
  "date_range_end": "2026-01-31T23:59:59Z",
  "event_type_filter": ["authentication", "user_lifecycle", "security"],
  "output_format": "csv"
}

Response 201: SiemBatchExport (status: "pending")

Errors:
  400: { "error": "Date range exceeds maximum of 90 days" }
  400: { "error": "date_range_end must be after date_range_start" }
```

### Get Export
```
GET /governance/siem/exports/{id}
BFF: GET /api/governance/siem/exports/{id}

Response 200: SiemBatchExport (same shape as list item)

Errors:
  404: { "error": "Export not found" }
```

### Download Export
```
GET /governance/siem/exports/{id}/download
BFF: GET /api/governance/siem/exports/{id}/download

Response 200:
  Content-Type: application/octet-stream (or text/csv, application/json depending on format)
  Content-Disposition: attachment; filename="audit-export-2026-01-01-2026-01-31.json"
  Body: (file content streamed)

Errors:
  404: { "error": "Export not found" }
  409: { "error": "Export not yet completed" }
  410: { "error": "Export download has expired" }
```

---

## Server-Side API Client Functions (src/lib/api/siem.ts)

```typescript
// Destinations
listSiemDestinations(params, token, tenantId, fetch)
createSiemDestination(body, token, tenantId, fetch)
getSiemDestination(id, token, tenantId, fetch)
updateSiemDestination(id, body, token, tenantId, fetch)
deleteSiemDestination(id, token, tenantId, fetch)

// Test
testSiemDestination(id, token, tenantId, fetch)

// Health
getSiemHealthSummary(id, token, tenantId, fetch)
getSiemHealthHistory(id, params, token, tenantId, fetch)

// Dead Letter
listSiemDeadLetter(id, params, token, tenantId, fetch)
redeliverSiemDeadLetter(id, token, tenantId, fetch)

// Batch Exports
listSiemExports(params, token, tenantId, fetch)
createSiemExport(body, token, tenantId, fetch)
getSiemExport(id, token, tenantId, fetch)
downloadSiemExport(id, token, tenantId, fetch)
```

## Client-Side API Functions (src/lib/api/siem-client.ts)

```typescript
// Destinations
fetchSiemDestinations(params?)
fetchSiemDestination(id)
createSiemDestinationClient(body)
updateSiemDestinationClient(id, body)
deleteSiemDestinationClient(id)

// Test
testSiemDestinationClient(id)

// Health
fetchSiemHealthSummary(id)
fetchSiemHealthHistory(id, params?)

// Dead Letter
fetchSiemDeadLetter(id, params?)
redeliverSiemDeadLetterClient(id)

// Batch Exports
fetchSiemExports(params?)
createSiemExportClient(body)
fetchSiemExport(id)
downloadSiemExportUrl(id)   // Returns URL string for direct download link
```

## Zod Schemas (src/lib/schemas/siem.ts)

```typescript
// Destination create/edit
createSiemDestinationSchema    // name, destination_type, endpoint_host, endpoint_port?,
                                // export_format, event_type_filter, rate_limit_per_second,
                                // queue_buffer_size, circuit_breaker_threshold,
                                // circuit_breaker_cooldown_secs, enabled,
                                // splunk_source?, splunk_sourcetype?, splunk_index?,
                                // splunk_ack_enabled, syslog_facility, tls_verify_cert,
                                // auth_config?

updateSiemDestinationSchema    // All fields optional (partial of create)

// Batch export create
createSiemExportSchema         // date_range_start, date_range_end, event_type_filter,
                                // output_format

// Auth config (nested in destination schemas)
authConfigSchema               // auth_type, token?, api_key?, username?, password?,
                                // header_name?
```

## Error Handling

All BFF proxies follow the standard error pattern:
1. Extract `access_token` and `tenant_id` from cookies
2. If missing, return 401 `{ error: 'Unauthorized' }`
3. Validate admin role via `hasAdminRole()`
4. If not admin, return 403 `{ error: 'Forbidden' }`
5. Forward request to backend with `Authorization` and `X-Tenant-Id` headers
6. Return backend response (success or error) with matching status code

BFF proxies that accept request bodies validate against Zod schemas before forwarding.

## BFF Route Summary

| # | BFF Route | Method | Backend Path | Purpose |
|---|-----------|--------|-------------|---------|
| 1 | `/api/governance/siem/destinations` | GET | `/governance/siem/destinations` | List destinations |
| 2 | `/api/governance/siem/destinations` | POST | `/governance/siem/destinations` | Create destination |
| 3 | `/api/governance/siem/destinations/[id]` | GET | `/governance/siem/destinations/{id}` | Get destination |
| 4 | `/api/governance/siem/destinations/[id]` | PUT | `/governance/siem/destinations/{id}` | Update destination |
| 5 | `/api/governance/siem/destinations/[id]` | DELETE | `/governance/siem/destinations/{id}` | Delete destination |
| 6 | `/api/governance/siem/destinations/[id]/test` | POST | `/governance/siem/destinations/{id}/test` | Test connectivity |
| 7 | `/api/governance/siem/destinations/[id]/health` | GET | `/governance/siem/destinations/{id}/health` | Health summary |
| 8 | `/api/governance/siem/destinations/[id]/health/history` | GET | `/governance/siem/destinations/{id}/health/history` | Health history |
| 9 | `/api/governance/siem/destinations/[id]/dead-letter` | GET | `/governance/siem/destinations/{id}/dead-letter` | Dead letter list |
| 10 | `/api/governance/siem/destinations/[id]/dead-letter/redeliver` | POST | `/governance/siem/destinations/{id}/dead-letter/redeliver` | Redeliver dead letters |
| 11 | `/api/governance/siem/exports` | GET | `/governance/siem/exports` | List exports |
| 12 | `/api/governance/siem/exports` | POST | `/governance/siem/exports` | Create export |
| 13 | `/api/governance/siem/exports/[id]` | GET | `/governance/siem/exports/{id}` | Get export |
| 14 | `/api/governance/siem/exports/[id]/download` | GET | `/governance/siem/exports/{id}/download` | Download export |

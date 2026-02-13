# Data Model: Bulk User Import & SCIM Administration

## Entities

### ImportJobSummary (list view)

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| status | `'pending' \| 'processing' \| 'completed' \| 'failed' \| 'cancelled'` | Job lifecycle state |
| file_name | string | Original CSV filename |
| total_rows | number | Total rows in CSV |
| success_count | number | Successfully imported rows |
| error_count | number | Rows with errors |
| skip_count | number | Skipped rows |
| send_invitations | boolean | Whether invitations were requested |
| created_at | string (ISO 8601) | Job creation timestamp |

### ImportJobDetail (detail view)

Extends ImportJobSummary with:

| Field | Type | Notes |
|-------|------|-------|
| tenant_id | string (UUID) | Owning tenant |
| file_hash | string | SHA-256 hex of uploaded file |
| file_size_bytes | number | File size in bytes |
| processed_rows | number | Rows processed so far |
| created_by | string (UUID) \| null | Admin who created the job |
| started_at | string (ISO 8601) \| null | When processing started |
| completed_at | string (ISO 8601) \| null | When processing completed |
| error_message | string \| null | Global error message (for 'failed' status) |
| updated_at | string (ISO 8601) | Last update timestamp |

### ImportError

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| line_number | number | CSV row number (1-based) |
| email | string \| null | Email from the failing row |
| column_name | string \| null | Column that caused the error |
| error_type | `'validation' \| 'duplicate_in_file' \| 'duplicate_in_tenant' \| 'role_not_found' \| 'group_error' \| 'attribute_error' \| 'system'` | Error category |
| error_message | string | Human-readable error description |
| created_at | string (ISO 8601) | When the error was recorded |

### ImportJobCreatedResponse

| Field | Type | Notes |
|-------|------|-------|
| job_id | string (UUID) | Created job ID |
| status | string | Always 'pending' |
| file_name | string | Original filename |
| total_rows | number | Parsed row count |
| message | string \| null | Optional status message |

### BulkResendResponse

| Field | Type | Notes |
|-------|------|-------|
| resent_count | number | Invitations resent |
| skipped_count | number | Invitations skipped (already accepted, etc.) |
| message | string \| null | Optional status message |

### InvitationValidationResponse

| Field | Type | Notes |
|-------|------|-------|
| valid | boolean | Whether the token is valid |
| email | string \| null | Email of the invited user (if valid) |
| tenant_name | string \| null | Tenant name (if valid) |
| reason | string \| null | `'invalid' \| 'already_accepted' \| 'expired'` (if invalid) |
| message | string \| null | Human-readable message |

### AcceptInvitationRequest

| Field | Type | Notes |
|-------|------|-------|
| password | string | New password (8-128 chars) |

### AcceptInvitationResponse

| Field | Type | Notes |
|-------|------|-------|
| success | boolean | Whether activation succeeded |
| message | string \| null | Status message |
| redirect_url | string \| null | Where to redirect after success |

### ScimTokenInfo (list view)

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| name | string | Human-readable token name |
| token_prefix | string | First chars of token (e.g., `xscim_...XXXX`) |
| created_at | string (ISO 8601) | Creation timestamp |
| last_used_at | string (ISO 8601) \| null | Last API call timestamp |
| revoked_at | string (ISO 8601) \| null | Revocation timestamp (null if active) |
| created_by | string (UUID) | Admin who created the token |

### ScimTokenCreated (creation response)

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Token ID |
| name | string | Token name |
| token | string | Raw token value — shown ONCE only |
| created_at | string (ISO 8601) | Creation timestamp |
| warning | string | "Save this token - it will not be shown again" |

### ScimAttributeMapping

| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | Primary key |
| tenant_id | string (UUID) | Owning tenant |
| scim_path | string | SCIM attribute path (e.g., `name.givenName`) |
| xavyo_field | string | Platform field (e.g., `first_name`) |
| transform | string \| null | `'lowercase' \| 'uppercase' \| 'trim'` or null |
| required | boolean | Whether the mapping is required |
| created_at | string (ISO 8601) | Creation timestamp |
| updated_at | string (ISO 8601) | Last update timestamp |

## Pagination Format

All list endpoints use: `{ items: T[], total: number, limit: number, offset: number }`

Exception: Error CSV download returns raw CSV bytes, not JSON.

## State Transitions

### Import Job Status

```
pending → processing → completed
                    → failed
                    → cancelled
```

- `pending`: Job created, awaiting processing
- `processing`: Backend is parsing CSV and creating users
- `completed`: All rows processed (may have errors)
- `failed`: Unrecoverable error during processing
- `cancelled`: Admin cancelled the job (not currently exposed in UI)

### Invitation Status

```
pending → sent → accepted
              → expired (frontend-computed: status='sent' && expires_at < now())
              → cancelled
```

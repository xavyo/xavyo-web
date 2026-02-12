# Import API Contracts

## Backend Endpoints (xavyo-idp)

### POST /admin/users/import
**Description**: Upload CSV file to create an import job
**Auth**: Admin required
**Content-Type**: multipart/form-data

**Request Body** (multipart):
- `file` (File, required): CSV file (.csv, max ~10MB, max ~10K rows)
- `send_invitations` (string, optional): "true" | "false" | "1" | "0" | "yes" | "no"

**Response** (202 Accepted):
```json
{
  "job_id": "uuid",
  "status": "pending",
  "file_name": "users.csv",
  "total_rows": 100,
  "message": null
}
```

**Errors**: 400 (invalid file/format), 409 (concurrent job exists), 413 (file too large)

---

### GET /admin/users/imports
**Description**: List import jobs with pagination
**Auth**: Admin required

**Query Parameters**:
- `status` (string, optional): Filter by status
- `limit` (number, optional): Page size (default 20)
- `offset` (number, optional): Offset (default 0)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "status": "completed",
      "file_name": "users.csv",
      "total_rows": 100,
      "success_count": 95,
      "error_count": 3,
      "skip_count": 2,
      "send_invitations": true,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### GET /admin/users/imports/:job_id
**Description**: Get import job details
**Auth**: Admin required

**Response** (200):
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "status": "completed",
  "file_name": "users.csv",
  "file_hash": "sha256hex",
  "file_size_bytes": 1234567,
  "total_rows": 100,
  "processed_rows": 100,
  "success_count": 95,
  "error_count": 3,
  "skip_count": 2,
  "send_invitations": true,
  "created_by": "uuid",
  "started_at": "2026-01-01T00:00:01Z",
  "completed_at": "2026-01-01T00:00:05Z",
  "error_message": null,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:05Z"
}
```

---

### GET /admin/users/imports/:job_id/errors
**Description**: List per-row errors for an import job
**Auth**: Admin required

**Query Parameters**:
- `limit` (number, optional): Page size (default 20)
- `offset` (number, optional): Offset (default 0)

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "line_number": 5,
      "email": "bad@example.com",
      "column_name": "email",
      "error_type": "duplicate_in_tenant",
      "error_message": "Email already exists in tenant",
      "created_at": "2026-01-01T00:00:02Z"
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

---

### GET /admin/users/imports/:job_id/errors/download
**Description**: Download all errors as CSV file
**Auth**: Admin required

**Response** (200):
- Content-Type: text/csv
- Content-Disposition: attachment; filename="import-errors-{job_id}.csv"
- Body: CSV with columns: line_number, email, column_name, error_type, error_message

---

### POST /admin/users/imports/:job_id/resend-invitations
**Description**: Resend invitations to all successfully imported users from this job
**Auth**: Admin required

**Response** (200):
```json
{
  "resent_count": 90,
  "skipped_count": 5,
  "message": "Invitations resent"
}
```

---

## Public Invitation Endpoints

### GET /invite/:token
**Description**: Validate an invitation token (public, no auth required)

**Response** (200):
```json
{
  "valid": true,
  "email": "user@example.com",
  "tenant_name": "Acme Corp",
  "reason": null,
  "message": null
}
```

Invalid token response:
```json
{
  "valid": false,
  "email": null,
  "tenant_name": null,
  "reason": "expired",
  "message": "This invitation has expired"
}
```

---

### POST /invite/:token
**Description**: Accept invitation and set password (public, no auth required)

**Request Body** (JSON):
```json
{
  "password": "SecurePassword123"
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Account activated successfully",
  "redirect_url": "/login"
}
```

**Errors**: 400 (weak password), 410 (expired/used token)

---

## BFF Proxy Mapping

| BFF Route | Method | Backend Route |
|-----------|--------|---------------|
| /api/admin/imports | GET | GET /admin/users/imports |
| /api/admin/imports | POST | POST /admin/users/import |
| /api/admin/imports/[id] | GET | GET /admin/users/imports/:job_id |
| /api/admin/imports/[id]/errors | GET | GET /admin/users/imports/:job_id/errors |
| /api/admin/imports/[id]/errors/download | GET | GET /admin/users/imports/:job_id/errors/download |
| /api/admin/imports/[id]/resend-invitations | POST | POST /admin/users/imports/:job_id/resend-invitations |

Note: Invitation public endpoints (`/invite/:token`) are called directly from `+page.server.ts` load/actions (no client-side proxy needed since they're server-rendered pages).

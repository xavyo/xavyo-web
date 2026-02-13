# API Contract: Connector Management

**Feature**: 020-connector-management
**Backend Base Path**: `/admin/connectors`
**BFF Proxy Path**: `/api/connectors`

## Endpoints

### 1. List Connectors

**Backend**: `GET /admin/connectors`
**BFF Proxy**: `GET /api/connectors`

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Filter by name (substring match) |
| connector_type | string | No | Filter by type: ldap, database, rest_api |
| status | string | No | Filter by status: active, inactive, error |
| limit | number | No | Page size (default: 20) |
| offset | number | No | Offset for pagination (default: 0) |

**Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "name": "Corporate LDAP",
      "description": "Main directory",
      "connector_type": "ldap",
      "configuration": { ... },
      "status": "active",
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Create Connector

**Backend**: `POST /admin/connectors`
**BFF Proxy**: `POST /api/connectors`

**Request Body**:
```json
{
  "name": "Corporate LDAP",
  "description": "Main corporate directory",
  "connector_type": "ldap",
  "configuration": {
    "host": "ldap.example.com",
    "port": 636,
    "bind_dn": "cn=admin,dc=example,dc=com",
    "bind_password": "secret",
    "base_dn": "dc=example,dc=com",
    "use_ssl": true
  }
}
```

**Response** (201): Created Connector object

**Errors**:
- 400: Invalid configuration or missing required fields
- 409: Connector with same name already exists

---

### 3. Get Connector Detail

**Backend**: `GET /admin/connectors/{id}`
**BFF Proxy**: `GET /api/connectors/{id}`

**Response** (200): Connector object

**Errors**:
- 404: Connector not found

---

### 4. Update Connector

**Backend**: `PUT /admin/connectors/{id}`
**BFF Proxy**: `PUT /api/connectors/{id}`

**Request Body**:
```json
{
  "name": "Updated LDAP",
  "description": "Updated description",
  "configuration": { ... }
}
```

**Response** (200): Updated Connector object

**Errors**:
- 400: Invalid data
- 404: Connector not found

---

### 5. Delete Connector

**Backend**: `DELETE /admin/connectors/{id}`
**BFF Proxy**: `DELETE /api/connectors/{id}`

**Response**: 204 No Content (no body)

**Errors**:
- 400: Cannot delete active connector or connector with active syncs
- 404: Connector not found

---

### 6. Test Connection

**Backend**: `POST /admin/connectors/{id}/test`
**BFF Proxy**: `POST /api/connectors/{id}/test`

**Request Body**: None

**Response** (200):
```json
{
  "success": true,
  "message": "Connection successful",
  "details": { "server_info": "OpenLDAP 2.6" },
  "response_time_ms": 142
}
```

**Error Response** (200 with success=false):
```json
{
  "success": false,
  "message": "Connection refused",
  "details": { "error": "ECONNREFUSED" },
  "response_time_ms": 5023
}
```

**Errors**:
- 404: Connector not found

**Note**: Test may take up to 30 seconds. Frontend must show loading state.

---

### 7. Activate Connector

**Backend**: `POST /admin/connectors/{id}/activate`
**BFF Proxy**: `POST /api/connectors/{id}/activate`

**Request Body**: None

**Response** (200): Updated Connector object with status "active"

**Errors**:
- 400: Connector already active
- 404: Connector not found

---

### 8. Deactivate Connector

**Backend**: `POST /admin/connectors/{id}/deactivate`
**BFF Proxy**: `POST /api/connectors/{id}/deactivate`

**Request Body**: None

**Response** (200): Updated Connector object with status "inactive"

**Errors**:
- 400: Connector already inactive
- 404: Connector not found

---

### 9. Get Health Status

**Backend**: `GET /admin/connectors/{id}/health`
**BFF Proxy**: `GET /api/connectors/{id}/health`

**Response** (200):
```json
{
  "status": "healthy",
  "last_check_at": "2026-02-11T14:30:00Z",
  "response_time_ms": 45,
  "error_count": 0,
  "details": {}
}
```

**Errors**:
- 404: Connector not found

## Authentication

All endpoints require:
- `access_token` cookie (JWT) — validated by BFF proxy
- `tenant_id` cookie — used as `X-Tenant-Id` header to backend
- Admin role — validated by `hasAdminRole(locals.user?.roles)`

## Error Format

Backend errors follow standard ApiError format:
```json
{
  "error": "error_code",
  "message": "Human-readable error message"
}
```

Frontend `ApiError` class extracts `message` for user-facing display.

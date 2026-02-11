# API Contracts: User Management

**Feature**: 004-data-table-users
**Date**: 2026-02-10

## Backend Endpoints (xavyo-idp)

All endpoints require JWT `Authorization: Bearer <token>` and `X-Tenant-Id` headers.
All endpoints require admin role.

### GET /admin/users

List users with pagination and optional email search.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| offset | integer | 0 | Number of items to skip |
| limit | integer | 20 | Page size (1–100) |
| email | string | — | Partial email match (case-insensitive) |

**Response** (200):
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "is_active": true,
      "email_verified": true,
      "roles": ["admin"],
      "created_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-01-15T10:30:00Z",
      "custom_attributes": {}
    }
  ],
  "pagination": {
    "total_count": 42,
    "offset": 0,
    "limit": 20,
    "has_more": true
  }
}
```

### POST /admin/users

Create a new user.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "roles": ["user"],
  "username": "optional-username"
}
```

**Response** (201): `UserResponse`

**Errors**:
- 400: Invalid input (email format, password too short)
- 409: Email already exists

### GET /admin/users/:id

Get a single user by ID.

**Response** (200): `UserResponse`

**Errors**:
- 404: User not found

### PUT /admin/users/:id

Update a user. All fields optional (partial update).

**Request Body**:
```json
{
  "email": "updated@example.com",
  "roles": ["admin", "user"],
  "username": "new-username"
}
```

**Response** (200): `UserResponse`

**Errors**:
- 400: Invalid input
- 404: User not found
- 409: Email already exists

### DELETE /admin/users/:id

Delete a user.

**Response** (204): No content

**Errors**:
- 404: User not found

### PUT /admin/users/:id (with is_active field)

Enable or disable a user via the update endpoint.

**Request Body (disable)**:
```json
{
  "is_active": false
}
```

**Request Body (enable)**:
```json
{
  "is_active": true
}
```

**Response** (200): `UserResponse`

---

## SvelteKit Routes

### GET /api/users (Proxy Endpoint)

Client-side proxy for the user list table. Validates session, forwards to backend.

**Request**: Query params passed through (offset, limit, email)
**Response**: Forwards backend `UserListResponse` as JSON

**Auth**: Reads `access_token` and `tenant_id` cookies from the request.

### /users (Page)

User list page. Initial data loaded via SSR (page.server.ts load function), subsequent pagination/search via client-side fetch to `/api/users`.

### /users/create (Page)

Create user form. Superforms action validates input and calls `POST /admin/users`.

**Actions**:
- `default`: Create user → redirect to `/users` with success toast

### /users/[id] (Page)

User detail/edit page. Loads user data via `GET /admin/users/:id`.

**Actions**:
- `update`: Edit user → `PUT /admin/users/:id`
- `delete`: Delete user → `DELETE /admin/users/:id` → redirect to `/users`
- `enable`: Enable user → `PUT /admin/users/:id` with `{ is_active: true }`
- `disable`: Disable user → `PUT /admin/users/:id` with `{ is_active: false }`

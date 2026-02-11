# Data Model: Data Table + User Management

**Feature**: 004-data-table-users
**Date**: 2026-02-10

## New TypeScript Types (to add to `src/lib/api/types.ts`)

### UserResponse

Mirrors the Rust `UserResponse` struct from `xavyo-api-users/src/models/responses.rs`.

```typescript
interface UserResponse {
  id: string;
  email: string;
  is_active: boolean;
  email_verified: boolean;
  roles: string[];
  created_at: string;    // ISO 8601 datetime
  updated_at: string;    // ISO 8601 datetime
  custom_attributes: Record<string, unknown>;
}
```

### UserListResponse

Mirrors the Rust `UserListResponse` struct.

```typescript
interface UserListResponse {
  users: UserResponse[];
  pagination: PaginationMeta;
}
```

### PaginationMeta

Mirrors the Rust `PaginationMeta` struct. Reusable for Personas and NHI lists.

```typescript
interface PaginationMeta {
  total_count: number;
  offset: number;
  limit: number;
  has_more: boolean;
}
```

### CreateUserRequest

Mirrors the Rust `CreateUserRequest` struct.

```typescript
interface CreateUserRequest {
  email: string;
  password: string;
  roles: string[];
  username?: string;
}
```

### UpdateUserRequest

Mirrors the Rust `UpdateUserRequest` struct.

```typescript
interface UpdateUserRequest {
  email?: string;
  roles?: string[];
  is_active?: boolean;
  username?: string;
}
```

## Zod Schemas (new file: `src/lib/schemas/user.ts`)

### createUserSchema

```
- email: string, email format, required
- password: string, min 8 chars, required
- roles: array of strings, min 1 item, required
- username: string, optional (empty string treated as undefined)
```

### updateUserSchema

```
- email: string, email format, optional
- roles: array of strings, min 1 item when provided
- username: string, optional
```

## Relationships

- **User → Tenant**: Each user belongs to a tenant (enforced by X-Tenant-Id header, not exposed in UI)
- **User → Roles**: A user has one or more roles (string array: "admin", "user")
- **UserList → PaginationMeta**: List responses include pagination metadata

## State Transitions

### User Active Status

```
Active ──[disable]──→ Inactive
Inactive ──[enable]──→ Active
```

- Disable requires confirmation
- Enable does not require confirmation
- Self-deactivation is prevented (backend should reject, frontend also warns)

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| email | Valid email format | "Please enter a valid email address" |
| email | Required on create | "Email is required" |
| password | Min 8 characters | "Password must be at least 8 characters" |
| password | Required on create | "Password is required" |
| roles | At least 1 selected | "At least one role must be selected" |
| username | Optional, max 100 chars | "Username must be 100 characters or less" |

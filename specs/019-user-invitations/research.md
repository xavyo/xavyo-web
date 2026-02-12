# Research: User Invitations

**Date**: 2026-02-11

## Summary

No significant unknowns. All patterns are established from 18 prior features.

## Decisions

### 1. API Response Format

- **Decision**: Backend uses `{invitations, total, limit, offset}` format (not `{items, total, limit, offset}`)
- **Rationale**: Verified via `curl GET /admin/invitations` — response key is `invitations`, not `items`
- **Alternatives**: Could normalize to `items` in API client, but decided to preserve backend naming for simplicity

### 2. Route Placement

- **Decision**: Place invitations at `(app)/invitations/` as a top-level admin route
- **Rationale**: Invitations are a distinct admin workflow, not a sub-feature of users. Similar to how audit, federation, and governance are top-level routes.
- **Alternatives**: Could nest under `/users/invitations/` but this conflates user management with invitation management

### 3. BFF Proxy Path

- **Decision**: Use `/api/invitations/` prefix (matching the app route), mapping to backend `/admin/invitations/`
- **Rationale**: The backend uses `/admin/` prefix but the frontend proxy should use a clean path. Same pattern as other admin routes.
- **Alternatives**: Could use `/api/admin/invitations/` to mirror backend exactly, but this is inconsistent with other BFF routes

### 4. Cancel vs Delete Semantics

- **Decision**: Backend DELETE endpoint returns 200 with updated invitation (status: cancelled), NOT 204 No Content
- **Rationale**: Verified via actual API call. The invitation isn't truly deleted — it's status-transitioned to "cancelled"
- **Alternatives**: None — must match backend behavior

### 5. Expired State Handling

- **Decision**: Frontend computes "expired" status client-side by comparing `expires_at` with current time
- **Rationale**: Backend doesn't have an "expired" status enum — it remains "sent" even after expiry. Frontend must check `expires_at < now && status === 'sent'` to show expired badge.
- **Alternatives**: Could add backend endpoint, but this is a simple date comparison best done in the UI

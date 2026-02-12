# API Contract: User Groups

## GET /admin/groups

List all groups.

**Auth**: Admin role required
**Query**: `?limit=20&offset=0`
**Response 200**:
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "Engineering",
      "description": "Engineering team",
      "member_count": 12,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

## POST /admin/groups

Create a new group.

**Auth**: Admin role required
**Request Body**:
```json
{
  "name": "Marketing",
  "description": "Marketing department"
}
```
**Response 201**: Created group object

## GET /admin/groups/{id}

Get group detail with members.

**Auth**: Admin role required
**Response 200**:
```json
{
  "id": "uuid",
  "name": "Engineering",
  "description": "Engineering team",
  "members": [
    {
      "user_id": "uuid",
      "email": "alice@example.com",
      "display_name": "Alice Smith",
      "joined_at": "2026-01-15T00:00:00Z"
    }
  ],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

## PUT /admin/groups/{id}

Update group metadata.

**Auth**: Admin role required
**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```
**Response 200**: Updated group object

## DELETE /admin/groups/{id}

Delete a group.

**Auth**: Admin role required
**Response 204**: No content

## POST /admin/groups/{id}/members

Add members to a group.

**Auth**: Admin role required
**Request Body**:
```json
{
  "member_ids": ["user-uuid-1", "user-uuid-2"]
}
```
**Response 200**: Updated group object

## DELETE /admin/groups/{id}/members/{userId}

Remove a member from a group.

**Auth**: Admin role required
**Response 204**: No content

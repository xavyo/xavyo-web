# Data Model: User Invitations

## Entities

### Invitation

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| email | string | Invitee email address |
| status | InvitationStatus | Current status (sent, cancelled, accepted) |
| role_template_id | UUID or null | Optional role template to assign on acceptance |
| invited_by_user_id | UUID | Admin who created the invitation |
| expires_at | datetime | Expiry timestamp (7 days from creation) |
| created_at | datetime | Creation timestamp |
| accepted_at | datetime or null | Acceptance timestamp (null until accepted) |

### InvitationStatus (enum)

| Value | Description |
|-------|-------------|
| sent | Invitation sent, waiting for acceptance |
| cancelled | Admin cancelled the invitation |
| accepted | Invitee accepted and created account |

## State Transitions

```
[created] → sent
sent → cancelled (admin cancel action)
sent → accepted (invitee accepts link)
```

Note: "expired" is a computed state (sent + expires_at < now), not a persisted status.

## Relationships

- Invitation → User (invited_by_user_id): The admin who created the invitation
- Invitation → Role Template (role_template_id): Optional role to assign on acceptance

## Validation Rules

- email: Required, valid email format
- role_template_id: Optional UUID
- Only "sent" status invitations can be resent or cancelled
- Expired invitations (sent + past expiry) cannot be acted upon

## List Response Format

```json
{
  "invitations": [...],
  "total": 10,
  "limit": 20,
  "offset": 0
}
```

Note: Uses `invitations` key (not `items`).

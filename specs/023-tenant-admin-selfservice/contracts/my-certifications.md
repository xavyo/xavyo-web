# API Contract: My Certifications

## GET /governance/my-certifications

List certification items assigned to the current user as reviewer.

**Auth**: Any authenticated user
**Query**: `?campaign_id=uuid&status=pending&page=1&page_size=20`
**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "campaign_id": "uuid",
      "campaign_name": "Q1 2026 Access Review",
      "user_id": "uuid",
      "user_email": "bob@example.com",
      "entitlements": ["Admin Access", "Billing Read"],
      "status": "pending",
      "due_date": "2026-03-31T00:00:00Z",
      "decided_at": null
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 20
}
```

## POST /governance/my-certifications/{itemId}/certify

Certify (approve continued access) for a certification item.

**Auth**: Any authenticated user (must be assigned reviewer)
**Request Body**: `{}` (empty or optional comment)
**Response 200**: Updated certification item with status "certified"

## POST /governance/my-certifications/{itemId}/revoke

Revoke (recommend removal) for a certification item.

**Auth**: Any authenticated user (must be assigned reviewer)
**Request Body**: `{}` (empty or optional comment)
**Response 200**: Updated certification item with status "revoked"

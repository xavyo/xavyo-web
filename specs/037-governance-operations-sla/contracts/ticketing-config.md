# API Contract: Ticketing Configuration

## BFF Proxy Endpoints

### GET /api/governance/ticketing-configuration

List ticketing configurations.

**Query Parameters**:
- `page` (optional): Page number
- `page_size` (optional): Items per page

**Response** (200):
```json
{
  "items": [TicketingConfig],
  "total": number,
  "limit": number,
  "offset": number
}
```

**Backend**: `GET /governance/ticketing-configuration`

### POST /api/governance/ticketing-configuration

Create ticketing configuration.

**Request Body**:
```json
{
  "name": "string (required)",
  "system_type": "servicenow|jira|custom_webhook",
  "base_url": "string (required, valid URL)",
  "api_key_encrypted": "string (plain text, encrypted by backend)",
  "project_key": "string (required for jira)",
  "issue_type": "string (optional)",
  "webhook_secret": "string (optional, for custom_webhook)",
  "auto_create_on": "access_request|certification|sod_violation",
  "enabled": "boolean (default: true)"
}
```

**Response** (201): `TicketingConfig`

**Backend**: `POST /governance/ticketing-configuration`

### GET /api/governance/ticketing-configuration/[id]

Get configuration detail.

**Response** (200): `TicketingConfig`

**Backend**: `GET /governance/ticketing-configuration/{id}`

### PUT /api/governance/ticketing-configuration/[id]

Update configuration.

**Request Body**: Same as POST (all fields optional)

**Response** (200): `TicketingConfig`

**Backend**: `PUT /governance/ticketing-configuration/{id}`

### DELETE /api/governance/ticketing-configuration/[id]

Delete configuration.

**Response** (204): No content

**Backend**: `DELETE /governance/ticketing-configuration/{id}`

# Data Model: Audit & Compliance

## Entities

### LoginAttempt

Represents a single authentication event recorded by the backend.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| user_id | UUID (nullable) | User who attempted login (null if user not found) |
| email | string | Email used for login attempt |
| success | boolean | Whether login succeeded |
| failure_reason | string (nullable) | Reason for failure (e.g., "invalid_password", "account_locked") |
| auth_method | string | Authentication method: "password", "social", "sso", "mfa", "refresh" |
| ip_address | string (nullable) | IP address of the client |
| user_agent | string (nullable) | Browser/client user agent string |
| device_fingerprint | string (nullable) | Device fingerprint hash |
| geo_country | string (nullable) | ISO 3166-1 alpha-2 country code |
| geo_city | string (nullable) | City name from geo-lookup |
| is_new_device | boolean | Whether this login was from a previously unseen device |
| is_new_location | boolean | Whether this login was from a previously unseen location |
| created_at | DateTime (UTC) | When the login attempt occurred |

### SecurityAlert

Represents a system-generated notification about a security-relevant event.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| user_id | UUID | User this alert belongs to |
| alert_type | string | One of: "new_device", "new_location", "failed_attempts", "password_change", "mfa_disabled" |
| severity | string | One of: "info", "warning", "critical" |
| title | string | Human-readable alert title |
| message | string | Detailed alert description |
| metadata | JSON object | Alert-type-specific data (e.g., device info, IP, location) |
| acknowledged_at | DateTime (nullable) | When the alert was acknowledged (null if unacknowledged) |
| created_at | DateTime (UTC) | When the alert was generated |

### LoginAttemptStats

Aggregated statistics for a date range (admin only). Not a persisted entity — computed on-demand by the backend.

| Field | Type | Description |
|-------|------|-------------|
| total_attempts | integer | Total login attempts in period |
| successful_attempts | integer | Successful login count |
| failed_attempts | integer | Failed login count |
| success_rate | float | Success percentage (0-100) |
| failure_reasons | FailureReasonCount[] | Breakdown of failure reasons with counts |
| hourly_distribution | HourlyCount[] | Login count by hour of day (0-23) |
| unique_users | integer | Distinct users who attempted login |
| new_device_logins | integer | Logins from new/unseen devices |
| new_location_logins | integer | Logins from new/unseen locations |

### FailureReasonCount

| Field | Type | Description |
|-------|------|-------------|
| reason | string | Failure reason identifier |
| count | integer | Number of occurrences |

### HourlyCount

| Field | Type | Description |
|-------|------|-------------|
| hour | integer | Hour of day (0-23) |
| count | integer | Number of login attempts in that hour |

## Relationships

- **LoginAttempt** → **User**: Many-to-one (each attempt references a user)
- **SecurityAlert** → **User**: Many-to-one (each alert belongs to a user)
- **LoginAttemptStats**: Computed aggregate, not directly related to individual entities

## Pagination Format

All list endpoints use cursor-based pagination:

```
Request: ?cursor=<DateTime>&limit=<int>
Response: { items: T[], total: number, next_cursor: string | null }
```

- `cursor`: ISO 8601 DateTime string (the `created_at` of the last item from previous page)
- `limit`: Number of items per page (default: 20, max: 100)
- `next_cursor`: ISO 8601 DateTime string if more results exist, `null` at end

## Enumerations

### AlertType
- `new_device` — Login from a new/unseen device
- `new_location` — Login from a new/unseen location
- `failed_attempts` — Multiple failed login attempts (threshold: 3+ in 1 hour)
- `password_change` — User changed their password
- `mfa_disabled` — User disabled MFA

### AlertSeverity
- `info` — Informational, normal activity
- `warning` — Suspicious activity, review recommended
- `critical` — Urgent, immediate action required

### AuthMethod
- `password` — Email/password login
- `social` — Social provider login (Google, GitHub, etc.)
- `sso` — Enterprise SSO login
- `mfa` — MFA step in authentication
- `refresh` — Token refresh

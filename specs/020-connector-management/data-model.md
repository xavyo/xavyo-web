# Data Model: Connector Management

**Feature**: 020-connector-management
**Date**: 2026-02-11

## Entities

### Connector

The primary entity representing an identity connector that bridges an external identity source with the platform.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Unique identifier (server-generated) |
| tenant_id | UUID | Yes | Tenant this connector belongs to |
| name | string | Yes | Human-readable connector name |
| description | string | No | Optional description |
| connector_type | ConnectorType | Yes | One of: ldap, database, rest_api |
| configuration | object | Yes | Type-dependent configuration JSON |
| status | ConnectorStatus | Yes | One of: active, inactive, error |
| created_at | datetime | Yes | Creation timestamp |
| updated_at | datetime | Yes | Last update timestamp |

### ConnectorType (enum)

| Value | Label | Description |
|-------|-------|-------------|
| ldap | LDAP | Lightweight Directory Access Protocol connector |
| database | Database | Direct database connection connector |
| rest_api | REST API | REST API endpoint connector |

### ConnectorStatus (enum)

| Value | Label | Description |
|-------|-------|-------------|
| active | Active | Connector is operational and participates in sync/provisioning |
| inactive | Inactive | Connector is paused/disabled |
| error | Error | Connector has encountered errors |

### Connector Configuration (type-dependent)

#### LDAP Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| host | string | Yes | LDAP server hostname |
| port | number | Yes | LDAP server port (default: 389, SSL: 636) |
| bind_dn | string | Yes | Distinguished Name for binding |
| bind_password | string | Yes | Password for binding (sensitive) |
| base_dn | string | Yes | Base DN for searches |
| use_ssl | boolean | Yes | Whether to use SSL/TLS |
| search_filter | string | No | Optional LDAP search filter |

#### Database Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| host | string | Yes | Database server hostname |
| port | number | Yes | Database server port |
| database | string | Yes | Database name |
| username | string | Yes | Database username |
| password | string | Yes | Database password (sensitive) |
| driver | string | Yes | Database driver (postgres, mysql, mssql, oracle) |
| query | string | No | Optional custom query |

#### REST API Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| base_url | string | Yes | Base URL for the REST API |
| auth_type | string | Yes | Authentication type (bearer, basic, api_key, none) |
| auth_config | object | Yes | Auth configuration (token, username/password, api key) |
| headers | object | No | Optional additional HTTP headers |

### HealthStatus

Passive health metrics collected by the backend's periodic health checks.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | Health status (healthy, degraded, unhealthy, unknown) |
| last_check_at | datetime | No | Time of last health check (null if never checked) |
| response_time_ms | number | No | Response time in milliseconds |
| error_count | number | Yes | Number of errors encountered |
| details | object | No | Additional health details |

### TestResult

Result of an on-demand connectivity test.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| success | boolean | Yes | Whether the test succeeded |
| message | string | Yes | Human-readable result message |
| details | object | No | Additional test details |
| response_time_ms | number | Yes | Test response time in milliseconds |

## Relationships

```
Connector (1) ←→ (1) HealthStatus    (fetched separately via /health endpoint)
Connector (1) ←→ (1) Configuration   (embedded JSON in connector record)
Connector (1) ←→ (*) TestResult      (ephemeral, not persisted — returned per request)
```

## State Transitions

```
                  ┌─────────────┐
                  │   Created   │
                  │  (inactive) │
                  └──────┬──────┘
                         │ activate
                         ▼
                  ┌─────────────┐
         ┌───────│   Active     │───────┐
         │       └──────┬──────┘        │
         │ deactivate   │ error         │ deactivate
         │              ▼               │
         │       ┌─────────────┐        │
         │       │    Error    │────────┘
         │       └──────┬──────┘
         │              │ activate (after fix)
         │              │
         ▼              ▼
  ┌─────────────┐
  │  Inactive   │
  │  (can delete)│
  └─────────────┘
```

- Connectors are created in **inactive** status
- Only **inactive** connectors can be deleted
- **Error** status is set by the backend when health checks fail
- Admin can attempt to activate a connector in error status (after fixing the underlying issue)

## Pagination

List endpoint uses `{items, total, limit, offset}` format:

| Field | Type | Description |
|-------|------|-------------|
| items | Connector[] | Array of connectors for the current page |
| total | number | Total count of matching connectors |
| limit | number | Page size |
| offset | number | Number of items skipped |

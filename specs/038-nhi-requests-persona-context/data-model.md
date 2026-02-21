# Data Model: NHI Access Requests & Persona Context

## NHI Request Types

### NhiAccessRequest
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique request identifier |
| requester_id | string (UUID) | User who submitted the request |
| requested_name | string | Name for the requested NHI entity |
| purpose | string | Business justification (min 10 chars) |
| requested_permissions | string[] | List of entitlement UUIDs |
| requested_expiration | string \| null | ISO 8601 datetime |
| rotation_interval_days | number \| null | 1-365 days |
| nhi_type | string | service_account, ai_agent, or tool |
| status | 'pending' \| 'approved' \| 'rejected' \| 'cancelled' | Current status |
| reviewer_id | string \| null | Admin who reviewed |
| review_comments | string \| null | Reviewer comments |
| created_at | string | ISO 8601 datetime |
| reviewed_at | string \| null | ISO 8601 datetime |
| nhi_id | string \| null | Created NHI entity ID (after approval) |

### NhiRequestSummary
| Field | Type | Description |
|-------|------|-------------|
| pending | number | Count of pending requests |
| approved | number | Count of approved requests |
| rejected | number | Count of rejected requests |
| cancelled | number | Count of cancelled requests |

## NHI Usage Types

### NhiUsageRecord
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Usage record ID |
| nhi_id | string (UUID) | NHI entity ID |
| activity_type | string | Type of activity |
| details | string \| null | Activity details |
| performed_at | string | ISO 8601 datetime |
| source_ip | string \| null | Source IP address |

### NhiUsageSummary
| Field | Type | Description |
|-------|------|-------------|
| nhi_id | string (UUID) | NHI entity ID |
| total_events | number | Total usage events |
| last_activity_at | string \| null | Last activity timestamp |
| first_activity_at | string \| null | First activity timestamp |
| activity_types | Record<string, number> | Event counts by type |
| daily_average | number | Average daily events |

### NhiStalenessEntry
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | NHI entity ID |
| name | string | Entity name |
| nhi_type | string | Entity type |
| last_activity_at | string \| null | Last activity |
| days_inactive | number | Days since last activity |
| state | string | Current entity state |

### NhiSummary
| Field | Type | Description |
|-------|------|-------------|
| total | number | Total NHI count |
| active | number | Active entities |
| expired | number | Expired entities |
| suspended | number | Suspended entities |
| needs_certification | number | Needing certification |
| needs_rotation | number | Needing credential rotation |
| inactive | number | Inactive entities |

## NHI Certification Types

### NhiCertCampaign
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Campaign ID |
| name | string | Campaign name |
| description | string \| null | Description |
| scope | string | Campaign scope |
| nhi_type_filter | string \| null | Optional type filter |
| due_date | string \| null | ISO 8601 datetime |
| status | 'draft' \| 'active' \| 'completed' \| 'cancelled' | Campaign status |
| created_at | string | ISO 8601 datetime |
| created_by | string \| null | Creator ID |

### NhiCertCampaignSummary
| Field | Type | Description |
|-------|------|-------------|
| total_items | number | Total items in campaign |
| decided | number | Items with decisions |
| pending | number | Items awaiting decision |
| certified | number | Items certified |
| revoked | number | Items revoked |
| flagged | number | Items flagged |

### NhiCertItem
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Item ID |
| campaign_id | string (UUID) | Parent campaign |
| nhi_id | string (UUID) | NHI entity ID |
| nhi_name | string | Entity name |
| nhi_type | string | Entity type |
| decision | 'certify' \| 'revoke' \| 'flag' \| null | Reviewer decision |
| decided_by | string \| null | Reviewer ID |
| decided_at | string \| null | Decision timestamp |
| notes | string \| null | Decision notes |

## Persona Context Types

### SwitchContextResponse
| Field | Type | Description |
|-------|------|-------------|
| session_id | string (UUID) | Context session ID |
| access_token | string | New JWT for persona context |
| active_persona_id | string \| null | Active persona ID |
| active_persona_name | string \| null | Active persona name |
| switched_at | string | Switch timestamp |

### CurrentContextResponse
| Field | Type | Description |
|-------|------|-------------|
| physical_user_id | string (UUID) | Physical user ID |
| physical_user_name | string \| null | Physical user name |
| is_persona_active | boolean | Whether operating as persona |
| active_persona | object \| null | Active persona details |
| session_started_at | string \| null | Session start time |
| session_expires_at | string \| null | Session expiry time |

### ContextSessionSummary
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Session ID |
| switched_at | string | Switch timestamp |
| from_context | string | Source context name |
| to_context | string | Target context name |
| reason | string \| null | Switch reason |

## Persona Expiry Types

### ExtendPersonaResponse
| Field | Type | Description |
|-------|------|-------------|
| status | 'approved' \| 'pending_approval' | Extension result |
| persona | object \| null | Updated persona (if approved) |
| approval_request_id | string \| null | Pending approval ID |

### ExpiringPersona
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Persona ID |
| name | string | Persona name |
| archetype_name | string \| null | Parent archetype |
| valid_until | string | Expiration date |
| days_until_expiry | number | Days remaining |
| assigned_user_name | string \| null | Assigned user |

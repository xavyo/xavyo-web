# Research: Webhooks & Authorization Policy Management

## Backend Verification (Principle VIII)

Both systems exist and are fully functional in xavyo-idp. Key findings:

### Webhook Backend Differences from Spec

| Spec Assumption | Actual Backend | Impact |
|----------------|----------------|--------|
| PUT for update | PATCH `/webhooks/subscriptions/:id` | Use PATCH method in API client |
| Separate pause/resume endpoints | `enabled` field on update (`PATCH`) | Toggle via update, no separate endpoints |
| Custom headers support | Not in create/update request | Remove custom headers from UI |
| Individual delivery retry | Only DLQ replay (`POST /webhooks/dlq/:id/replay`) | Retry only through DLQ, not per-delivery |
| Status: active/paused/failed | `enabled` (bool) + `consecutive_failures` (int) | Derive status from enabled + failure count |
| Secret in response | Not returned (write-only) | Show as masked placeholder on detail |
| `subscriptions` pagination | `{items, total, limit, offset}` format | Standard pagination (same as governance) |
| DLQ retry | DLQ uses "replay" terminology | Rename UI button to "Replay" or keep "Retry" with replay API |

**Decision**: Remove custom headers feature from UI (backend doesn't support it). Use `enabled` boolean toggle instead of pause/resume endpoints. Retry = DLQ replay.

### Authorization Backend Differences from Spec

| Spec Assumption | Actual Backend | Impact |
|----------------|----------------|--------|
| `resource_pattern` + `action_pattern` | `resource_type` + `action` | Use exact backend field names |
| Freeform JSON conditions | Structured conditions: `{condition_type, attribute_path, operator, value}` | Build condition form with dropdowns |
| POST for auth check | GET `/admin/authorization/check?user_id=&action=&resource_type=` | Use GET with query params |
| Response: `matched_policies[]` | Response: `{allowed, reason, source, policy_id, decision_id}` | Show single matched policy, not list |
| Mapping has `entitlement_name` | Mapping has `entitlement_id` only | Must resolve entitlement name client-side or show ID |
| DELETE policy = permanent | DELETE policy = deactivate (soft delete) | Update UI messaging |
| No priority field | Policies have `priority` (integer) | Add priority to create/edit forms |
| Enable/disable endpoints | Use PUT with `status: "active"/"inactive"` | Use update API for status toggle |

**Decision**: Use exact backend field names (`resource_type`, `action`, not patterns). Build structured condition editor. Auth check via GET query params. Show priority field.

### Condition Types

Backend supports 3 condition types:
1. `time_window` — Time-based access restrictions
2. `user_attribute` — Attribute-based conditions (e.g., department, role)
3. `entitlement_check` — Requires specific entitlement

Operators: `equals`, `not_equals`, `contains`, `in_list`

### Event Type Categories (36 total)

Backend organizes webhook events into categories:
- `user` — User lifecycle events
- `authentication` — Login/logout events
- `group` — Group management events
- `role_entitlement` — Role/entitlement changes
- `governance` — Governance workflow events
- `provisioning` — Provisioning events
- `admin` — Admin action events
- `import` — Data import events
- `scim_provisioning` — SCIM events
- `agent_security` — Agent security events

### Bonus: Circuit Breakers

Backend has circuit breaker endpoints (`GET /webhooks/circuit-breakers`) that track subscription health. Not in original spec but could be shown on subscription detail page as additional health info.

**Decision**: Defer circuit breaker UI to future enhancement. Focus on core subscription CRUD + delivery history + DLQ.

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Webhook status display | Derive from `enabled` + `consecutive_failures` | Backend doesn't have explicit status enum |
| Custom headers | Remove from scope | Backend doesn't support headers field |
| Condition editor | Structured form (type dropdown, operator dropdown, value input) | Backend uses structured conditions, not freeform JSON |
| Auth check method | GET with query params | Matches backend implementation |
| Delivery retry | Only via DLQ replay | Backend only supports DLQ-based replay |
| Policy delete | Show as "Deactivate" not "Delete" | Backend soft-deletes via deactivation |
| Entitlement name in mappings | Resolve from entitlement list or show ID | Backend only returns entitlement_id |

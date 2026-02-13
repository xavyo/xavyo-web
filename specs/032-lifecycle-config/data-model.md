# Data Model: Lifecycle Configuration

## Entities

### LifecycleConfig

The top-level entity representing a complete lifecycle state machine definition.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes (read) | Unique identifier |
| tenant_id | UUID | Yes (read) | Owning tenant |
| name | String (1-100) | Yes | Display name |
| description | String (0-1000) | No | Optional description |
| object_type | LifecycleObjectType | Yes | Target object type |
| is_active | Boolean | Yes | Whether config is active |
| auto_assign_initial_state | Boolean | Yes | Auto-assign initial state to new objects |
| created_at | DateTime | Yes (read) | Creation timestamp |
| updated_at | DateTime | Yes (read) | Last update timestamp |

**Relationships**: Has many LifecycleStates, has many LifecycleTransitions.

### LifecycleState

A state within a lifecycle configuration.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes (read) | Unique identifier |
| config_id | UUID | Yes | Parent lifecycle config |
| name | String | Yes | State name |
| description | String | No | Optional description |
| is_initial | Boolean | Yes | Whether this is the entry state |
| is_terminal | Boolean | Yes | Whether this is an end state |
| entitlement_action | EntitlementAction | Yes | Action on entitlements when entering |
| position | Integer | Yes | Display order |
| created_at | DateTime | Yes (read) | Creation timestamp |
| updated_at | DateTime | Yes (read) | Last update timestamp |

**Relationships**: Belongs to LifecycleConfig, has many entry/exit LifecycleActions, referenced by LifecycleTransitions (as source or target).

### LifecycleTransition

A directed edge between two states in a lifecycle configuration.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes (read) | Unique identifier |
| config_id | UUID | Yes | Parent lifecycle config |
| name | String | Yes | Transition name |
| from_state_id | UUID | Yes | Source state |
| to_state_id | UUID | Yes | Target state |
| requires_approval | Boolean | No | Whether approval is needed |
| grace_period_hours | Integer | No | Grace period in hours |
| created_at | DateTime | Yes (read) | Creation timestamp |

**Relationships**: Belongs to LifecycleConfig, references LifecycleState (from/to), has many TransitionConditions.

### TransitionCondition

An attribute-based condition attached to a transition.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| condition_type | String | Yes | Type of condition (e.g., "attribute_check") |
| attribute_path | String | Yes | Dot-notation path (e.g., "user.department") |
| expression | String | Yes | Expression to evaluate |

**Relationships**: Belongs to LifecycleTransition (stored as array on transition).

### LifecycleAction

An automated action configured for state entry or exit.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action_type | String | Yes | Type of action (e.g., "send_notification") |
| parameters | JSON Object | Yes | Action-specific parameters |

**Relationships**: Belongs to LifecycleState (stored as entry_actions/exit_actions arrays).

### UserLifecycleStatus

Read-only status showing a user's current lifecycle position.

| Field | Type | Description |
|-------|------|-------------|
| user_id | UUID | The user |
| config_id | UUID | Governing lifecycle config |
| config_name | String | Config display name |
| current_state_id | UUID | Current state |
| current_state_name | String | Current state display name |
| entered_at | DateTime | When user entered current state |

## Enums

### LifecycleObjectType

| Value | Description |
|-------|-------------|
| User | User identity objects |
| Role | Role objects |
| Group | Group objects |

### EntitlementAction

| Value | Description |
|-------|-------------|
| grant | Grant entitlements when entering state |
| revoke | Revoke entitlements when entering state |
| no_change | No entitlement changes |

## Validation Rules

- Config name: 1-100 characters, required
- Config description: 0-1000 characters, optional
- Object type: Must be one of User, Role, Group
- State name: Required, non-empty
- State position: Integer >= 0
- Only one state per config can be `is_initial = true`
- Transition from_state_id and to_state_id must belong to same config
- Grace period hours: Positive integer when provided
- Condition attribute_path: Non-empty string
- Condition expression: Non-empty string
- Action type: Non-empty string
- Action parameters: Valid JSON object

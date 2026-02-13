# API Contract: Simulations

## 1. List Simulations

```
GET /governance/role-mining/simulations
```

### Query Parameters

| Parameter     | Type   | Default | Notes                                                                      |
|---------------|--------|---------|----------------------------------------------------------------------------|
| limit         | number | 50      | Max 100                                                                    |
| offset        | number | 0       |                                                                            |
| status        | string | —       | Filter by SimulationStatus: `draft`, `executed`, `applied`, `cancelled`    |
| scenario_type | string | —       | Filter by ScenarioType: `add_entitlement`, `remove_entitlement`, `add_role`, `remove_role`, `modify_role` |

### Response — 200 OK

```json
{
  "items": [Simulation],
  "total": 5,
  "page": 1,
  "page_size": 50
}
```

#### Simulation Fields

| Field          | Type              | Notes                                        |
|----------------|-------------------|----------------------------------------------|
| id             | UUID              | Primary key                                  |
| tenant_id      | UUID              | Tenant scope                                 |
| name           | string            | User-provided                                |
| scenario_type  | ScenarioType      | Type of change being simulated               |
| target_role_id | UUID?             | Role being modified (if applicable)          |
| changes        | SimulationChanges | Change specification                         |
| status         | SimulationStatus  | See enum below                               |
| affected_users | UUID[]            | Users impacted (populated after execute)     |
| access_gained  | JSON              | Access that would be added                   |
| access_lost    | JSON              | Access that would be removed                 |
| applied_by     | UUID?             | Admin who applied                            |
| applied_at     | datetime?         | When applied                                 |
| created_by     | UUID              | Admin who created                            |
| created_at     | datetime          | Auto-set                                     |

#### SimulationChanges Fields

| Field            | Type    | Notes                              |
|------------------|---------|------------------------------------|
| change_type      | string? | Type of change (mapped from type)  |
| role_id          | UUID?   | Target role                        |
| entitlement_id   | UUID?   | Single entitlement                 |
| entitlement_ids  | UUID[]? | Multiple entitlements              |
| user_ids         | UUID[]? | Users to modify                    |
| role_name        | string? | For add_role scenarios             |
| role_description | string? | For add_role scenarios             |

### Status Codes

| Code | Condition         |
|------|-------------------|
| 200  | Success           |
| 401  | Not authenticated |
| 403  | Not admin         |

---

## 2. Get Simulation

```
GET /governance/role-mining/simulations/{simulation_id}
```

### Path Parameters

| Parameter     | Type | Notes               |
|---------------|------|---------------------|
| simulation_id | UUID | Simulation to fetch |

### Response — 200 OK

Returns a single `Simulation` object (same shape as list items above).

### Status Codes

| Code | Condition              |
|------|------------------------|
| 200  | Success                |
| 401  | Not authenticated      |
| 403  | Not admin              |
| 404  | Simulation not found   |

---

## 3. Create Simulation

```
POST /governance/role-mining/simulations
```

### Request Body

| Field          | Type              | Required | Notes                                                         |
|----------------|-------------------|----------|---------------------------------------------------------------|
| name           | string            | Yes      | Simulation name                                               |
| scenario_type  | ScenarioType      | Yes      | Type of change to simulate                                    |
| target_role_id | UUID              | No       | Required for `remove_role` and `modify_role` scenarios        |
| changes        | SimulationChanges | Yes      | Change specification (fields depend on scenario_type)         |

#### changes by scenario_type

| scenario_type        | Required changes fields                                           |
|----------------------|-------------------------------------------------------------------|
| add_entitlement      | `entitlement_id` or `entitlement_ids`, optionally `role_id`      |
| remove_entitlement   | `entitlement_id` or `entitlement_ids`, optionally `role_id`      |
| add_role             | `role_name`, `entitlement_ids`, optionally `role_description`     |
| remove_role          | (no additional fields; `target_role_id` on parent is sufficient)  |
| modify_role          | `entitlement_ids` (new entitlement set for the role)              |

### Response — 201 Created

Returns the created `Simulation` object with `status: "draft"`.

### Status Codes

| Code | Condition              |
|------|------------------------|
| 201  | Created                |
| 400  | Validation error       |
| 401  | Not authenticated      |
| 403  | Not admin              |

---

## 4. Execute Simulation

```
POST /governance/role-mining/simulations/{simulation_id}/execute
```

Runs the simulation to compute impact analysis. After execution, the `affected_users`, `access_gained`, and `access_lost` fields are populated.

### Path Parameters

| Parameter     | Type | Notes                 |
|---------------|------|-----------------------|
| simulation_id | UUID | Simulation to execute |

### Request Body

None.

### Response — 200 OK

Returns the updated `Simulation` object with:
- `status: "executed"`
- `affected_users` populated with impacted user IDs
- `access_gained` populated with access additions
- `access_lost` populated with access removals

### Status Codes

| Code | Condition                                                  |
|------|------------------------------------------------------------|
| 200  | Executed successfully                                      |
| 401  | Not authenticated                                          |
| 403  | Not admin                                                  |
| 404  | Simulation not found                                       |
| 409  | Simulation is not in `draft` status (cannot execute)       |

---

## 5. Apply Simulation

```
POST /governance/role-mining/simulations/{simulation_id}/apply
```

Applies the simulation's changes to the actual role model. This is an irreversible action that modifies real governance roles, entitlements, and user assignments.

### Path Parameters

| Parameter     | Type | Notes                |
|---------------|------|----------------------|
| simulation_id | UUID | Simulation to apply  |

### Request Body

None.

### Response — 200 OK

Returns the updated `Simulation` object with:
- `status: "applied"`
- `applied_by` set to the current admin's ID
- `applied_at` set to the current timestamp

### Status Codes

| Code | Condition                                                  |
|------|------------------------------------------------------------|
| 200  | Applied successfully                                       |
| 401  | Not authenticated                                          |
| 403  | Not admin                                                  |
| 404  | Simulation not found                                       |
| 409  | Simulation is not in `executed` status (cannot apply)      |

---

## 6. Cancel Simulation

```
DELETE /governance/role-mining/simulations/{simulation_id}
```

Cancels and deletes the simulation. Can be performed on simulations in `draft` or `executed` status.

### Path Parameters

| Parameter     | Type | Notes                |
|---------------|------|----------------------|
| simulation_id | UUID | Simulation to cancel |

### Response — 204 No Content

No body.

### Status Codes

| Code | Condition                                                           |
|------|---------------------------------------------------------------------|
| 204  | Cancelled/deleted                                                   |
| 401  | Not authenticated                                                   |
| 403  | Not admin                                                           |
| 404  | Simulation not found                                                |
| 409  | Simulation is in `applied` status (cannot cancel after application) |

---

## Enums

### SimulationStatus

`draft` | `executed` | `applied` | `cancelled`

### ScenarioType

`add_entitlement` | `remove_entitlement` | `add_role` | `remove_role` | `modify_role`

### State Transitions

```
draft --> executed --> applied
draft --> cancelled
executed --> cancelled
```

# API Contract: Policy Simulations

## POST /governance/simulations/policy
Create a new policy simulation.

**Request Body**:
```json
{
  "name": "string (required)",
  "simulation_type": "sod_rule | birthright_policy (required)",
  "policy_id": "string (UUID, optional)",
  "policy_config": "object (required)"
}
```

**Response** (201): `PolicySimulationResponse`

## GET /governance/simulations/policy
List policy simulations with filtering.

**Query Parameters**:
- `simulation_type` (optional): `sod_rule` | `birthright_policy`
- `status` (optional): `draft` | `executed` | `applied` | `cancelled`
- `created_by` (optional): UUID
- `include_archived` (optional): boolean, default false
- `offset` (optional): number, default 0
- `limit` (optional): number, default 20

**Response** (200): `{ items: PolicySimulationResponse[], total: number, limit: number, offset: number }`

## GET /governance/simulations/policy/{simulation_id}
Get policy simulation detail.

**Response** (200): `PolicySimulationResponse`

## POST /governance/simulations/policy/{simulation_id}/execute
Execute a policy simulation.

**Request Body** (optional):
```json
{
  "user_ids": ["string (UUID)"]
}
```

**Response** (200): `PolicySimulationResponse` (status=executed, impact_summary populated)

## POST /governance/simulations/policy/{simulation_id}/cancel
Cancel a running/draft simulation.

**Response** (200): `PolicySimulationResponse` (status=cancelled)

## POST /governance/simulations/policy/{simulation_id}/archive
Archive an executed simulation.

**Response** (200): `PolicySimulationResponse` (is_archived=true)

## POST /governance/simulations/policy/{simulation_id}/restore
Restore an archived simulation.

**Response** (200): `PolicySimulationResponse` (is_archived=false)

## PATCH /governance/simulations/policy/{simulation_id}/notes
Update simulation notes.

**Request Body**:
```json
{
  "notes": "string"
}
```

**Response** (200): `PolicySimulationResponse`

## GET /governance/simulations/policy/{simulation_id}/results
List per-user impact results.

**Query Parameters**:
- `impact_type` (optional): `violation` | `entitlement_gain` | `entitlement_loss` | `no_change` | `warning`
- `severity` (optional): `critical` | `high` | `medium` | `low`
- `user_id` (optional): UUID
- `offset` (optional): number, default 0
- `limit` (optional): number, default 20

**Response** (200): `{ items: PolicySimulationResultResponse[], total: number, limit: number, offset: number }`

## GET /governance/simulations/policy/{simulation_id}/staleness
Check if simulation data is stale.

**Response** (200): `{ is_stale: boolean, data_snapshot_at: string, last_data_change_at: string }`

## DELETE /governance/simulations/policy/{simulation_id}
Delete a simulation permanently.

**Response** (204): No content

## GET /governance/simulations/policy/{simulation_id}/export
Export simulation results.

**Query Parameters**:
- `format` (required): `json` | `csv`

**Response** (200): File content with appropriate Content-Type header

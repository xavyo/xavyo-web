# API Contract: Batch Simulations

## POST /governance/simulations/batch
Create a new batch simulation.

**Request Body**:
```json
{
  "name": "string (required)",
  "batch_type": "role_add | role_remove | entitlement_add | entitlement_remove (required)",
  "selection_mode": "user_list | filter (required)",
  "user_ids": ["string (UUID)"],
  "filter_criteria": {
    "department": "string | null",
    "status": "string | null",
    "role_ids": ["string (UUID)"] ,
    "entitlement_ids": ["string (UUID)"],
    "title": "string | null",
    "metadata": {"key": "value"}
  },
  "change_spec": {
    "operation": "role_add | role_remove | entitlement_add | entitlement_remove",
    "role_id": "string (UUID, optional)",
    "entitlement_id": "string (UUID, optional)",
    "justification": "string (optional)"
  }
}
```

**Response** (201): `BatchSimulationResponse`

## GET /governance/simulations/batch
List batch simulations with filtering.

**Query Parameters**:
- `batch_type` (optional): `role_add` | `role_remove` | `entitlement_add` | `entitlement_remove`
- `status` (optional): `draft` | `executed` | `applied` | `cancelled`
- `created_by` (optional): UUID
- `include_archived` (optional): boolean, default false
- `offset` (optional): number, default 0
- `limit` (optional): number, default 20

**Response** (200): `{ items: BatchSimulationResponse[], total: number, limit: number, offset: number }`

## GET /governance/simulations/batch/{simulation_id}
Get batch simulation detail.

**Response** (200): `BatchSimulationResponse`

## POST /governance/simulations/batch/{simulation_id}/execute
Execute a batch simulation.

**Response** (200): `BatchSimulationResponse` (status=executed, impact_summary populated)

## POST /governance/simulations/batch/{simulation_id}/apply
Apply batch simulation results to production.

**Request Body**:
```json
{
  "justification": "string (required)",
  "acknowledge_scope": true
}
```

**Response** (200): `BatchSimulationResponse` (status=applied, applied_at/applied_by populated)

## POST /governance/simulations/batch/{simulation_id}/cancel
Cancel a batch simulation.

**Response** (200): `BatchSimulationResponse` (status=cancelled)

## POST /governance/simulations/batch/{simulation_id}/archive
Archive a batch simulation.

**Response** (200): `BatchSimulationResponse` (is_archived=true)

## POST /governance/simulations/batch/{simulation_id}/restore
Restore an archived batch simulation.

**Response** (200): `BatchSimulationResponse` (is_archived=false)

## PATCH /governance/simulations/batch/{simulation_id}/notes
Update batch simulation notes.

**Request Body**:
```json
{
  "notes": "string"
}
```

**Response** (200): `BatchSimulationResponse`

## GET /governance/simulations/batch/{simulation_id}/results
List per-user batch results.

**Query Parameters**:
- `user_id` (optional): UUID
- `has_warnings` (optional): boolean
- `offset` (optional): number, default 0
- `limit` (optional): number, default 20

**Response** (200): `{ items: BatchSimulationResultResponse[], total: number, limit: number, offset: number }`

## DELETE /governance/simulations/batch/{simulation_id}
Delete a batch simulation permanently.

**Response** (204): No content

## GET /governance/simulations/batch/{simulation_id}/export
Export batch simulation results.

**Query Parameters**:
- `format` (required): `json` | `csv`

**Response** (200): File content with appropriate Content-Type header

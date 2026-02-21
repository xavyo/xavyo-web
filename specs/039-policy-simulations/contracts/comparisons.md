# API Contract: Simulation Comparisons

## POST /governance/simulations/comparisons
Create a new simulation comparison.

**Request Body**:
```json
{
  "name": "string (required)",
  "comparison_type": "simulation_vs_simulation | simulation_vs_current (required)",
  "simulation_a_id": "string (UUID, required)",
  "simulation_a_type": "policy | batch (required)",
  "simulation_b_id": "string (UUID, optional — required for simulation_vs_simulation)",
  "simulation_b_type": "policy | batch (optional — required for simulation_vs_simulation)"
}
```

**Response** (201): `SimulationComparisonResponse`

## GET /governance/simulations/comparisons
List simulation comparisons.

**Query Parameters**:
- `comparison_type` (optional): `simulation_vs_simulation` | `simulation_vs_current`
- `created_by` (optional): UUID
- `offset` (optional): number, default 0
- `limit` (optional): number, default 20

**Response** (200): `{ items: SimulationComparisonResponse[], total: number, limit: number, offset: number }`

## GET /governance/simulations/comparisons/{comparison_id}
Get comparison detail with delta results.

**Response** (200): `SimulationComparisonResponse` (includes summary_stats and delta_results)

## DELETE /governance/simulations/comparisons/{comparison_id}
Delete a comparison permanently.

**Response** (204): No content

## GET /governance/simulations/comparisons/{comparison_id}/export
Export comparison results.

**Query Parameters**:
- `format` (required): `json` | `csv`

**Response** (200): File content with appropriate Content-Type header

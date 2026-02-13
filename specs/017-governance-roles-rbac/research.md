# Research: Governance Roles & RBAC

**Feature**: 017-governance-roles-rbac
**Date**: 2026-02-11

## R1: Backend API Response Shapes (Verified)

**Decision**: Use exact response shapes from live backend testing.
**Rationale**: All endpoints were tested against localhost:8080 and response shapes captured directly.
**Alternatives considered**: Using OpenAPI spec schemas — rejected because many role schemas are auto-generated from Rust structs and not listed in components/schemas.

### Verified Response Shapes

**RoleResponse** (GET /governance/roles/{id}, POST /governance/roles):
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "parent_role_id": "uuid | null",
  "is_abstract": false,
  "hierarchy_depth": 0,
  "version": 1,
  "created_by": "uuid",
  "created_at": "2026-02-11T21:22:11.138513Z",
  "updated_at": "2026-02-11T21:22:11.138513Z"
}
```

**RoleListResponse** (GET /governance/roles):
```json
{
  "items": [RoleResponse],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**RoleTreeResponse** (GET /governance/roles/tree):
```json
{
  "roots": [{
    "id": "uuid",
    "name": "string",
    "depth": 0,
    "is_abstract": false,
    "direct_entitlement_count": 0,
    "effective_entitlement_count": 0,
    "assigned_user_count": 0,
    "children": []
  }]
}
```

**RoleMoveResponse** (POST /governance/roles/{id}/move):
```json
{
  "role": RoleResponse,
  "affected_roles_count": 1,
  "recomputed": true
}
```

**EffectiveEntitlementsResponse** (GET /governance/roles/{id}/effective-entitlements):
```json
{
  "items": [],
  "direct_count": 0,
  "inherited_count": 0,
  "total": 0
}
```

**ImpactAnalysisResponse** (GET /governance/roles/{id}/impact):
```json
{
  "role_id": "uuid",
  "role_name": "string",
  "descendant_count": 0,
  "total_affected_users": 0,
  "descendants": []
}
```

**RoleParameterResponse** (POST /governance/roles/{id}/parameters):
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "role_id": "uuid",
  "name": "string",
  "description": "string | null",
  "parameter_type": "enum",
  "is_required": true,
  "default_value": "read",
  "constraints": { "allowed_values": ["read", "write", "admin"] },
  "display_order": 0,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**RoleParameterListResponse** (GET /governance/roles/{id}/parameters):
```json
{
  "items": [RoleParameterResponse],
  "total": 0
}
```

**RoleEntitlementResponse** (POST /governance/roles/{id}/entitlements):
```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "entitlement_id": "uuid",
  "role_name": "string",
  "created_at": "timestamp",
  "created_by": "uuid"
}
```

### Response Format Notes
- Role entitlements list: returns raw `[]` array (NOT paginated object)
- Inheritance blocks list: returns raw `[]` array (NOT paginated object)
- Ancestors/children/descendants: return raw `[]` arrays of RoleResponse
- Role tree: returns `{ roots: RoleTreeNode[] }` — recursive children

## R2: API Request Asymmetries

**Decision**: Frontend must handle field name asymmetries between requests and responses.
**Rationale**: Backend Rust structs use different field names for create vs response.

- `CreateRoleRequest`: uses `parent_id` (NOT `parent_role_id`)
- `UpdateRoleRequest`: requires `version` field (optimistic concurrency)
- `MoveRoleRequest`: requires `version` and `parent_id` fields
- `AddRoleEntitlementRequest`: `{ entitlement_id, role_name }` (needs the role name, not ID)
- `AddInheritanceBlockRequest`: `{ blocked_role_id, reason }`

## R3: Tree View Rendering Pattern

**Decision**: Implement tree view as a recursive Svelte component with indentation.
**Rationale**: The backend returns a recursive tree structure (`children: RoleTreeNode[]`). A recursive Svelte component naturally maps to this data shape and supports arbitrary depth.
**Alternatives considered**:
- Flat list with indentation CSS — rejected because state management for expand/collapse would be complex.
- Third-party tree library — rejected per Minimal Complexity principle (YAGNI).

## R4: Client-side vs Server-side Data Fetching Pattern

**Decision**: Use hybrid approach — server-side load for initial page data (role list/detail), client-side fetch for tab content (entitlements, parameters, hierarchy, tree view toggle).
**Rationale**: Follows the pattern established in governance hub (Phase 012) and approval config (Phase 016). Server load ensures SEO-friendly initial render; client-side fetches avoid full page reloads for tab switching.
**Alternatives considered**: Full server-side rendering for all tabs — rejected because it requires full page reloads on tab change.

## R5: Optimistic Concurrency UX Pattern

**Decision**: Track `version` in form state, send with update/move requests, show clear conflict error with "Reload" button on 409.
**Rationale**: Backend enforces version-based concurrency. UI must surface conflicts gracefully.
**Alternatives considered**: Auto-retry with latest version — rejected because user may lose their edits.

## R6: Existing Patterns to Reuse

**Decision**: Follow established patterns from Phase 012 (governance core) and Phase 016 (approval config).
**Rationale**: Consistency with existing codebase. Reduces cognitive load and implementation time.

Patterns to reuse:
- BFF proxy endpoints: `src/routes/api/governance/` pattern (auth guard, error handling)
- Server-side API client: `src/lib/api/` pattern (apiClient, token+tenantId params)
- Client-side API: `src/lib/api/*-client.ts` pattern (fetch from proxy endpoints)
- Zod schemas: `src/lib/schemas/` with `import { z } from 'zod/v3'`
- Superforms: For create/edit forms with `invalidateAll: 'force'`
- Page structure: `+page.server.ts` (load + actions) + `+page.svelte` (UI)
- Component patterns: Card, PageHeader, Button, Alert, Dialog, EmptyState, Separator
- Tab patterns: Client-side tab switching with `$effect` for lazy data loading

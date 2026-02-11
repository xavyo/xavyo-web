# API Contracts: Governance (Personas & Archetypes)

**Feature**: 005-persona-management
**Date**: 2026-02-10

## Backend Endpoints (xavyo-idp)

All endpoints require `Authorization: Bearer <JWT>` and `X-Tenant-Id` headers.

### Archetype Endpoints

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/governance/persona-archetypes` | List archetypes (paginated) | Query: `is_active`, `name_contains`, `limit`, `offset` | `ArchetypeListResponse` |
| POST | `/governance/persona-archetypes` | Create archetype | `CreateArchetypeRequest` | `ArchetypeResponse` (201) |
| GET | `/governance/persona-archetypes/:id` | Get archetype details | — | `ArchetypeResponse` |
| PUT | `/governance/persona-archetypes/:id` | Update archetype | `UpdateArchetypeRequest` | `ArchetypeResponse` |
| DELETE | `/governance/persona-archetypes/:id` | Delete archetype | — | 204 |
| POST | `/governance/persona-archetypes/:id/activate` | Activate archetype | — | `ArchetypeResponse` |
| POST | `/governance/persona-archetypes/:id/deactivate` | Deactivate archetype | — | `ArchetypeResponse` |

### Persona Endpoints

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/governance/personas` | List personas (paginated) | Query: `status`, `archetype_id`, `physical_user_id`, `limit`, `offset` | `PersonaListResponse` |
| POST | `/governance/personas` | Create persona | `CreatePersonaRequest` | `PersonaResponse` (201) |
| GET | `/governance/personas/:id` | Get persona detail | — | `PersonaDetailResponse` |
| PUT | `/governance/personas/:id` | Update persona | `UpdatePersonaRequest` | `PersonaResponse` |
| POST | `/governance/personas/:id/activate` | Activate persona | — | `PersonaResponse` |
| POST | `/governance/personas/:id/deactivate` | Deactivate persona | `DeactivatePersonaRequest` | `PersonaResponse` |
| POST | `/governance/personas/:id/archive` | Archive persona | `ArchivePersonaRequest` | `PersonaResponse` |

### Pagination Format (governance endpoints)

```json
{
  "items": [/* Array of response objects */],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

Default limit: 50, max limit: 100, default offset: 0.

## SvelteKit Proxy Endpoints

### GET /api/personas

Proxy for client-side persona list pagination.

**Implementation**: `src/routes/api/personas/+server.ts`

- Read `access_token` and `tenant_id` from cookies
- Validate session (401 if missing)
- Forward query params: `status`, `archetype_id`, `offset`, `limit`
- Call `listPersonas()` from API client
- Return JSON response

### GET /api/archetypes

Proxy for client-side archetype list pagination.

**Implementation**: `src/routes/api/archetypes/+server.ts` (or under `/api/personas/archetypes/`)

- Read `access_token` and `tenant_id` from cookies
- Validate session (401 if missing)
- Forward query params: `name_contains`, `is_active`, `offset`, `limit`
- Call `listArchetypes()` from API client
- Return JSON response

## SvelteKit Server Routes

### Archetype Routes

| Route | File | Actions |
|-------|------|---------|
| `/personas/archetypes` | `+page.server.ts` | load: empty (data fetched client-side) |
| `/personas/archetypes/create` | `+page.server.ts` | load: superValidate(createArchetypeSchema); default action: create archetype, redirect to list |
| `/personas/archetypes/[id]` | `+page.server.ts` | load: getArchetype(id); actions: update, delete (redirect), activate, deactivate |

### Persona Routes

| Route | File | Actions |
|-------|------|---------|
| `/personas` | `+page.server.ts` | load: empty (data fetched client-side) |
| `/personas/create` | `+page.server.ts` | load: superValidate(createPersonaSchema) + fetch active archetypes + fetch users; default action: create persona, redirect to list |
| `/personas/[id]` | `+page.server.ts` | load: getPersona(id); actions: update, activate, deactivate (with reason), archive (with reason) |

## API Client Functions (src/lib/api/personas.ts)

```typescript
// Archetype functions
listArchetypes(params, token, tenantId, fetchFn?)
createArchetype(data, token, tenantId, fetchFn?)
getArchetype(id, token, tenantId, fetchFn?)
updateArchetype(id, data, token, tenantId, fetchFn?)
deleteArchetype(id, token, tenantId, fetchFn?)
activateArchetype(id, token, tenantId, fetchFn?)
deactivateArchetype(id, token, tenantId, fetchFn?)

// Persona functions
listPersonas(params, token, tenantId, fetchFn?)
createPersona(data, token, tenantId, fetchFn?)
getPersona(id, token, tenantId, fetchFn?)
updatePersona(id, data, token, tenantId, fetchFn?)
activatePersona(id, token, tenantId, fetchFn?)
deactivatePersona(id, reason, token, tenantId, fetchFn?)
archivePersona(id, reason, token, tenantId, fetchFn?)
```

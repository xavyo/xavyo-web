# API Contracts: NHI (Non-Human Identity) Management

**Feature**: 006-nhi-management
**Date**: 2026-02-10

## Backend Endpoints (xavyo-idp)

All endpoints require `Authorization: Bearer <JWT>` and `X-Tenant-Id` headers.

### Unified NHI Endpoints

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/nhi` | List all NHIs (paginated, filterable) | Query: `nhi_type`, `lifecycle_state`, `owner_id`, `limit`, `offset` | `NhiListResponse` |
| GET | `/nhi/:id` | Get NHI details with type-specific extension | — | `NhiDetailResponse` |

### Tool Endpoints

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/nhi/tools` | Create a tool NHI | `CreateToolRequest` | `NhiDetailResponse` (201) |
| GET | `/nhi/tools/:id` | Get tool details | — | `NhiDetailResponse` |
| PATCH | `/nhi/tools/:id` | Update tool | `UpdateToolRequest` | `NhiDetailResponse` |
| DELETE | `/nhi/tools/:id` | Delete tool | — | 204 |

### Agent Endpoints

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/nhi/agents` | Create an agent NHI | `CreateAgentRequest` | `NhiDetailResponse` (201) |
| GET | `/nhi/agents/:id` | Get agent details | — | `NhiDetailResponse` |
| PATCH | `/nhi/agents/:id` | Update agent | `UpdateAgentRequest` | `NhiDetailResponse` |
| DELETE | `/nhi/agents/:id` | Delete agent | — | 204 |

### Service Account Endpoints

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/nhi/service-accounts` | Create a service account NHI | `CreateServiceAccountRequest` | `NhiDetailResponse` (201) |
| GET | `/nhi/service-accounts/:id` | Get service account details | — | `NhiDetailResponse` |
| PATCH | `/nhi/service-accounts/:id` | Update service account | `UpdateServiceAccountRequest` | `NhiDetailResponse` |
| DELETE | `/nhi/service-accounts/:id` | Delete service account | — | 204 |

### Lifecycle Endpoints

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/nhi/:id/activate` | Activate (inactive→active) | — | 200 |
| POST | `/nhi/:id/suspend` | Suspend (active→suspended) | `SuspendNhiRequest` (optional reason) | 200 |
| POST | `/nhi/:id/reactivate` | Reactivate (suspended→active) | — | 200 |
| POST | `/nhi/:id/deprecate` | Deprecate (active→deprecated) | — | 200 |
| POST | `/nhi/:id/archive` | Archive (deprecated→archived) | — | 200 |

### Credential Endpoints

| Method | Path | Description | Request | Response |
|--------|------|-------------|---------|----------|
| GET | `/nhi/:id/credentials` | List credentials for an NHI | — | `NhiCredentialResponse[]` |
| POST | `/nhi/:id/credentials` | Issue new credential | `IssueCredentialRequest` | `CredentialIssuedResponse` (201) |
| POST | `/nhi/:id/credentials/:cred_id/rotate` | Rotate credential | `RotateCredentialRequest` | `CredentialIssuedResponse` |
| DELETE | `/nhi/:id/credentials/:cred_id` | Revoke credential | — | 204 |

### Pagination Format (NHI endpoints)

```json
{
  "data": [/* Array of NhiIdentityResponse objects */],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

Default limit: 20, max limit: 100, default offset: 0. Ordered by `created_at DESC`.

## SvelteKit Proxy Endpoints

### GET /api/nhi

Proxy for client-side unified NHI list pagination.

**Implementation**: `src/routes/api/nhi/+server.ts`

- Read `access_token` and `tenant_id` from cookies
- Validate session (401 if missing)
- Forward query params: `nhi_type`, `lifecycle_state`, `offset`, `limit`
- Call `listNhi()` from API client
- Return JSON response

## SvelteKit Server Routes

### NHI List

| Route | File | Actions |
|-------|------|---------|
| `/nhi` | `+page.server.ts` | load: empty (data fetched client-side via proxy) |

### Tool Routes

| Route | File | Actions |
|-------|------|---------|
| `/nhi/tools/create` | `+page.server.ts` | load: superValidate(createToolSchema); default action: create tool, redirect to /nhi |
| `/nhi/tools/[id]` | `+page.server.ts` | load: getTool(id) + listCredentials(id); actions: update, delete (redirect), activate, suspend, reactivate, deprecate, archive, issueCredential, rotateCredential, revokeCredential |

### Agent Routes

| Route | File | Actions |
|-------|------|---------|
| `/nhi/agents/create` | `+page.server.ts` | load: superValidate(createAgentSchema); default action: create agent, redirect to /nhi |
| `/nhi/agents/[id]` | `+page.server.ts` | load: getAgent(id) + listCredentials(id); actions: update, delete (redirect), activate, suspend, reactivate, deprecate, archive, issueCredential, rotateCredential, revokeCredential |

### Service Account Routes

| Route | File | Actions |
|-------|------|---------|
| `/nhi/service-accounts/create` | `+page.server.ts` | load: superValidate(createServiceAccountSchema); default action: create SA, redirect to /nhi |
| `/nhi/service-accounts/[id]` | `+page.server.ts` | load: getServiceAccount(id) + listCredentials(id); actions: update, delete (redirect), activate, suspend, reactivate, deprecate, archive, issueCredential, rotateCredential, revokeCredential |

## API Client Functions (src/lib/api/nhi.ts)

```typescript
// Unified list
listNhi(params, token, tenantId, fetchFn?)

// Tool CRUD
createTool(data, token, tenantId, fetchFn?)
getTool(id, token, tenantId, fetchFn?)
updateTool(id, data, token, tenantId, fetchFn?)
deleteTool(id, token, tenantId, fetchFn?)

// Agent CRUD
createAgent(data, token, tenantId, fetchFn?)
getAgent(id, token, tenantId, fetchFn?)
updateAgent(id, data, token, tenantId, fetchFn?)
deleteAgent(id, token, tenantId, fetchFn?)

// Service Account CRUD
createServiceAccount(data, token, tenantId, fetchFn?)
getServiceAccount(id, token, tenantId, fetchFn?)
updateServiceAccount(id, data, token, tenantId, fetchFn?)
deleteServiceAccount(id, token, tenantId, fetchFn?)

// Lifecycle
activateNhi(id, token, tenantId, fetchFn?)
suspendNhi(id, reason?, token, tenantId, fetchFn?)
reactivateNhi(id, token, tenantId, fetchFn?)
deprecateNhi(id, token, tenantId, fetchFn?)
archiveNhi(id, token, tenantId, fetchFn?)

// Credentials
listCredentials(nhiId, token, tenantId, fetchFn?)
issueCredential(nhiId, data, token, tenantId, fetchFn?)
rotateCredential(nhiId, credId, data?, token, tenantId, fetchFn?)
revokeCredential(nhiId, credId, token, tenantId, fetchFn?)
```

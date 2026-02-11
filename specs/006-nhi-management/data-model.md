# Data Model: NHI (Non-Human Identity) Management

**Feature**: 006-nhi-management
**Date**: 2026-02-10

## New TypeScript Types (add to src/lib/api/types.ts)

### NHI Enums

```typescript
export type NhiType = 'tool' | 'agent' | 'service_account';
export type NhiLifecycleState = 'active' | 'inactive' | 'suspended' | 'deprecated' | 'archived';
```

### NHI Identity (Base)

```typescript
export interface NhiIdentityResponse {
  id: string;
  tenant_id: string;
  nhi_type: NhiType;
  name: string;
  description: string | null;
  owner_id: string | null;
  lifecycle_state: NhiLifecycleState;
  suspension_reason: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}
```

### Tool Extension

```typescript
export interface NhiToolExtension {
  category: string | null;
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown> | null;
  requires_approval: boolean;
  max_calls_per_hour: number | null;
  provider: string | null;
  provider_verified: boolean;
  checksum: string | null;
}
```

### Agent Extension

```typescript
export interface NhiAgentExtension {
  agent_type: string;
  model_provider: string | null;
  model_name: string | null;
  model_version: string | null;
  max_token_lifetime_secs: number;
  requires_human_approval: boolean;
}
```

### Service Account Extension

```typescript
export interface NhiServiceAccountExtension {
  purpose: string;
  environment: string | null;
}
```

### NHI Detail Response (Polymorphic)

```typescript
export interface NhiDetailResponse extends NhiIdentityResponse {
  tool?: NhiToolExtension;
  agent?: NhiAgentExtension;
  service_account?: NhiServiceAccountExtension;
}
```

### NHI List Response

```typescript
export interface NhiListResponse {
  data: NhiIdentityResponse[];
  total: number;
  limit: number;
  offset: number;
}
```

### Create Requests (Type-Specific)

```typescript
export interface CreateToolRequest {
  name: string;
  description?: string;
  category?: string;
  input_schema: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  requires_approval?: boolean;
  max_calls_per_hour?: number;
  provider?: string;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  agent_type: string;
  model_provider?: string;
  model_name?: string;
  model_version?: string;
  max_token_lifetime_secs?: number;
  requires_human_approval?: boolean;
}

export interface CreateServiceAccountRequest {
  name: string;
  description?: string;
  purpose: string;
  environment?: string;
}
```

### Update Requests (Type-Specific)

```typescript
export interface UpdateToolRequest {
  name?: string;
  description?: string;
  category?: string;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  requires_approval?: boolean;
  max_calls_per_hour?: number;
  provider?: string;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  agent_type?: string;
  model_provider?: string;
  model_name?: string;
  model_version?: string;
  max_token_lifetime_secs?: number;
  requires_human_approval?: boolean;
}

export interface UpdateServiceAccountRequest {
  name?: string;
  description?: string;
  purpose?: string;
  environment?: string;
}
```

### Credential Types

```typescript
export interface NhiCredentialResponse {
  id: string;
  nhi_id: string;
  credential_type: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

export interface CredentialIssuedResponse {
  credential: NhiCredentialResponse;
  secret: string;
}

export interface IssueCredentialRequest {
  credential_type: string;
  valid_days?: number;
}

export interface RotateCredentialRequest {
  grace_period_hours?: number;
}
```

### Lifecycle Action Types

```typescript
export interface SuspendNhiRequest {
  reason?: string;
}
```

## Zod Schemas (src/lib/schemas/nhi.ts)

### Create Tool Schema

```typescript
export const createToolSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  input_schema: z.string().min(1, 'Input schema is required'),
  output_schema: z.string().optional(),
  requires_approval: z.boolean().optional().default(false),
  max_calls_per_hour: z.coerce.number().int().min(1).optional(),
  provider: z.string().max(255).optional()
});
```

Note: `input_schema` and `output_schema` are strings in the form (textarea JSON) and validated/parsed as JSON before sending to the API.

### Create Agent Schema

```typescript
export const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  agent_type: z.string().min(1, 'Agent type is required').max(100),
  model_provider: z.string().max(255).optional(),
  model_name: z.string().max(255).optional(),
  model_version: z.string().max(100).optional(),
  max_token_lifetime_secs: z.coerce.number().int().min(1).optional(),
  requires_human_approval: z.boolean().optional().default(false)
});
```

### Create Service Account Schema

```typescript
export const createServiceAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  purpose: z.string().min(1, 'Purpose is required').max(1000),
  environment: z.string().max(100).optional()
});
```

### Update Schemas (all fields optional)

```typescript
export const updateToolSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  input_schema: z.string().optional(),
  output_schema: z.string().optional(),
  requires_approval: z.boolean().optional(),
  max_calls_per_hour: z.coerce.number().int().min(1).optional(),
  provider: z.string().max(255).optional()
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  agent_type: z.string().min(1).max(100).optional(),
  model_provider: z.string().max(255).optional(),
  model_name: z.string().max(255).optional(),
  model_version: z.string().max(100).optional(),
  max_token_lifetime_secs: z.coerce.number().int().min(1).optional(),
  requires_human_approval: z.boolean().optional()
});

export const updateServiceAccountSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  purpose: z.string().min(1).max(1000).optional(),
  environment: z.string().max(100).optional()
});
```

### Issue Credential Schema

```typescript
export const issueCredentialSchema = z.object({
  credential_type: z.enum(['api_key', 'secret', 'certificate']),
  valid_days: z.coerce.number().int().min(1).max(3650).optional()
});
```

### Suspend Schema

```typescript
export const suspendNhiSchema = z.object({
  reason: z.string().max(1000).optional()
});
```

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| NHI name (all types) | Required, 1-255 chars | "Name is required" |
| Description (all types) | Optional, max 1000 chars | "Description must be 1000 characters or less" |
| Tool input_schema | Required, valid JSON | "Input schema is required" |
| Tool output_schema | Optional, valid JSON | "Output schema must be valid JSON" |
| Tool category | Optional, max 100 chars | — |
| Tool max_calls_per_hour | Optional, min 1 | "Must be at least 1" |
| Tool provider | Optional, max 255 chars | — |
| Agent agent_type | Required, max 100 chars | "Agent type is required" |
| Agent model_provider | Optional, max 255 chars | — |
| Agent model_name | Optional, max 255 chars | — |
| Agent max_token_lifetime_secs | Optional, min 1 | "Must be at least 1" |
| SA purpose | Required, max 1000 chars | "Purpose is required" |
| SA environment | Optional, max 100 chars | — |
| Credential type | Required, one of: api_key, secret, certificate | "Credential type is required" |
| Credential valid_days | Optional, 1-3650 | "Must be between 1 and 3650" |
| Suspend reason | Optional, max 1000 chars | — |

## State Transitions

### NHI Lifecycle

```
    ┌──────────┐
    │ inactive │ ← Initial state on creation
    └────┬─────┘
         │ activate
         ▼
    ┌──────────┐
    │  active  │ ◄──────────────────────────┐
    └──┬───┬───┘                            │
       │   │                                │
       │   │ suspend (optional reason)      │ reactivate
       │   ▼                                │
       │ ┌───────────┐                      │
       │ │ suspended │ ─────────────────────┘
       │ └───────────┘
       │
       │ deprecate
       ▼
    ┌────────────┐
    │ deprecated │
    └─────┬──────┘
          │ archive
          ▼
    ┌──────────┐
    │ archived │ (terminal — no transitions out)
    └──────────┘

Active can also deprecate directly:
  Active ──deprecate──► Deprecated ──archive──► Archived
```

### Valid Transitions Summary

| From | To | Action |
|------|----|--------|
| Inactive | Active | activate |
| Active | Suspended | suspend |
| Active | Deprecated | deprecate |
| Suspended | Active | reactivate (activate) |
| Deprecated | Archived | archive |
| Archived | — | terminal (no transitions) |

# Data Model: Persona & Archetype Management

**Feature**: 005-persona-management
**Date**: 2026-02-10

## New TypeScript Types (add to src/lib/api/types.ts)

### Persona Status Enum

```typescript
export type PersonaStatus = 'draft' | 'active' | 'expiring' | 'expired' | 'suspended' | 'archived';
```

### Archetype Types

```typescript
export interface ArchetypeResponse {
  id: string;
  name: string;
  description: string | null;
  naming_pattern: string;
  attribute_mappings: Record<string, unknown>;
  default_entitlements: Record<string, unknown> | null;
  lifecycle_policy: LifecyclePolicyResponse;
  is_active: boolean;
  personas_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface LifecyclePolicyResponse {
  default_validity_days: number;
  max_validity_days: number;
  notification_before_expiry_days: number;
  auto_extension_allowed: boolean;
  extension_requires_approval: boolean;
  on_physical_user_deactivation: string;
}

export interface ArchetypeListResponse {
  items: ArchetypeResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateArchetypeRequest {
  name: string;
  description?: string;
  naming_pattern: string;
  lifecycle_policy?: LifecyclePolicyRequest;
}

export interface LifecyclePolicyRequest {
  default_validity_days?: number;
  max_validity_days?: number;
  notification_before_expiry_days?: number;
  auto_extension_allowed?: boolean;
  extension_requires_approval?: boolean;
  on_physical_user_deactivation?: string;
}

export interface UpdateArchetypeRequest {
  name?: string;
  description?: string;
  naming_pattern?: string;
  lifecycle_policy?: LifecyclePolicyRequest;
  is_active?: boolean;
}
```

### Persona Types

```typescript
export interface PersonaResponse {
  id: string;
  archetype_id: string;
  archetype_name: string | null;
  physical_user_id: string;
  physical_user_name: string | null;
  persona_name: string;
  display_name: string;
  status: PersonaStatus;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
}

export interface PersonaDetailResponse extends PersonaResponse {
  attributes: PersonaAttributesResponse;
}

export interface PersonaAttributesResponse {
  inherited: Record<string, unknown>;
  overrides: Record<string, unknown>;
  persona_specific: Record<string, unknown>;
  last_propagation_at: string | null;
}

export interface PersonaListResponse {
  items: PersonaResponse[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreatePersonaRequest {
  archetype_id: string;
  physical_user_id: string;
  attribute_overrides?: Record<string, unknown>;
  valid_from?: string;
  valid_until?: string;
}

export interface UpdatePersonaRequest {
  display_name?: string;
  attribute_overrides?: Record<string, unknown>;
  valid_until?: string;
}

export interface DeactivatePersonaRequest {
  reason: string;
}

export interface ArchivePersonaRequest {
  reason: string;
}
```

## Zod Schemas (src/lib/schemas/persona.ts)

### Create Archetype Schema

```typescript
export const createArchetypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  naming_pattern: z.string().min(1, 'Naming pattern is required').max(255),
  default_validity_days: z.coerce.number().int().min(1).max(3650).optional(),
  max_validity_days: z.coerce.number().int().min(1).max(3650).optional(),
  notification_before_expiry_days: z.coerce.number().int().min(1).optional()
});
```

### Update Archetype Schema

```typescript
export const updateArchetypeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  naming_pattern: z.string().min(1).max(255).optional(),
  default_validity_days: z.coerce.number().int().min(1).max(3650).optional(),
  max_validity_days: z.coerce.number().int().min(1).max(3650).optional(),
  notification_before_expiry_days: z.coerce.number().int().min(1).optional()
});
```

### Create Persona Schema

```typescript
export const createPersonaSchema = z.object({
  archetype_id: z.string().min(1, 'Archetype is required'),
  physical_user_id: z.string().min(1, 'Physical user is required'),
  valid_from: z.string().optional(),
  valid_until: z.string().optional()
});
```

### Update Persona Schema

```typescript
export const updatePersonaSchema = z.object({
  display_name: z.string().min(1).optional(),
  valid_until: z.string().optional()
});
```

### Reason Schema (for deactivate/archive)

```typescript
export const reasonSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000)
});
```

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Archetype name | Required, 1-255 chars | "Name is required" |
| Naming pattern | Required, 1-255 chars | "Naming pattern is required" |
| Description | Optional, max 1000 chars | "Description must be 1000 characters or less" |
| Default validity days | Optional, 1-3650 | "Must be between 1 and 3650" |
| Max validity days | Optional, 1-3650 | "Must be between 1 and 3650" |
| Notification days | Optional, min 1 | "Must be at least 1" |
| Archetype ID (persona create) | Required UUID | "Archetype is required" |
| Physical user ID (persona create) | Required UUID | "Physical user is required" |
| Deactivate/Archive reason | Required, 5-1000 chars | "Reason must be at least 5 characters" |

## State Transitions

### Persona Lifecycle

```
    ┌─────────┐
    │  draft  │ ← Initial state on creation
    └────┬────┘
         │ activate
         ▼
    ┌─────────┐    valid_until approaching    ┌──────────┐
    │  active │ ─────────────────────────────▶│ expiring │
    └────┬────┘                               └─────┬────┘
         │                                          │
         │ deactivate (reason)                      │ valid_until passed
         ▼                                          ▼
    ┌───────────┐                            ┌──────────┐
    │ suspended │                            │ expired  │
    └─────┬─────┘                            └──────────┘
          │ activate
          ▼
    ┌─────────┐
    │  active │  (reactivation)
    └─────────┘

    Any non-archived ──archive (reason)──▶ ┌──────────┐
                                           │ archived │ (terminal)
                                           └──────────┘
```

### Archetype Lifecycle

Simple toggle: `active ↔ inactive` (via is_active boolean field). No state machine.

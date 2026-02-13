# API Contract: Lifecycle States

## Create State

```
POST /governance/lifecycle/configs/{config_id}/states
Body: { name: string, description?: string, is_initial: boolean, is_terminal: boolean, entitlement_action: string, position: number }
Response 201: LifecycleState
```

## Update State

```
PATCH /governance/lifecycle/configs/{config_id}/states/{state_id}
Body: { name?: string, description?: string, is_initial?: boolean, is_terminal?: boolean, entitlement_action?: string, position?: number }
Response 200: LifecycleState
```

## Delete State

```
DELETE /governance/lifecycle/configs/{config_id}/states/{state_id}
Response 204: No Content
```

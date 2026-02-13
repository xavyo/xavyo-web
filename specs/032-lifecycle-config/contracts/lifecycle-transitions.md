# API Contract: Lifecycle Transitions

## Create Transition

```
POST /governance/lifecycle/configs/{config_id}/transitions
Body: { name: string, from_state_id: string (UUID), to_state_id: string (UUID), requires_approval?: boolean, grace_period_hours?: number }
Response 201: LifecycleTransition
```

## Delete Transition

```
DELETE /governance/lifecycle/configs/{config_id}/transitions/{transition_id}
Response 204: No Content
```

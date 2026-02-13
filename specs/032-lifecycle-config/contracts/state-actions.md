# API Contract: State Actions

## Get Actions

```
GET /governance/lifecycle/configs/{config_id}/states/{state_id}/actions
Response 200: { entry_actions: LifecycleAction[], exit_actions: LifecycleAction[] }
```

## Update Actions

```
PUT /governance/lifecycle/configs/{config_id}/states/{state_id}/actions
Body: { entry_actions?: [{ action_type: string, parameters: object }], exit_actions?: [{ action_type: string, parameters: object }] }
Response 200: { entry_actions: LifecycleAction[], exit_actions: LifecycleAction[] }
```

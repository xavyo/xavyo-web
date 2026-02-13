# API Contract: Lifecycle Configs

## List Configs

```
GET /governance/lifecycle/configs
Query: object_type?, is_active?, limit?, offset?
Response 200: { items: LifecycleConfig[], total: number, limit: number, offset: number }
```

## Create Config

```
POST /governance/lifecycle/configs
Body: { name: string, object_type: string, description?: string, auto_assign_initial_state?: boolean }
Response 201: LifecycleConfig
```

## Get Config Detail

```
GET /governance/lifecycle/configs/{config_id}
Response 200: LifecycleConfigDetail (includes states[] and transitions[])
```

## Update Config

```
PATCH /governance/lifecycle/configs/{config_id}
Body: { name?: string, description?: string, is_active?: boolean, auto_assign_initial_state?: boolean }
Response 200: LifecycleConfig
```

## Delete Config

```
DELETE /governance/lifecycle/configs/{config_id}
Response 204: No Content
```

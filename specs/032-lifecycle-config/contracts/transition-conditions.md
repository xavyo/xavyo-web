# API Contract: Transition Conditions

## Get Conditions

```
GET /governance/lifecycle/configs/{config_id}/transitions/{transition_id}/conditions
Response 200: { conditions: TransitionCondition[] }
```

## Update Conditions

```
PUT /governance/lifecycle/configs/{config_id}/transitions/{transition_id}/conditions
Body: { conditions: [{ condition_type: string, attribute_path: string, expression: string }] }
Response 200: { conditions: TransitionCondition[] }
```

## Evaluate Conditions

```
POST /governance/lifecycle/configs/{config_id}/transitions/{transition_id}/conditions/evaluate
Body: { context: object }
Response 200: { is_allowed: boolean, results: [{ condition_type: string, passed: boolean, message?: string }] }
```

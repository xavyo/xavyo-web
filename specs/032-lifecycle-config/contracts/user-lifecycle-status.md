# API Contract: User Lifecycle Status

## Get User Lifecycle Status

```
GET /governance/users/{user_id}/lifecycle/status
Response 200: UserLifecycleStatus
Response 404: User has no lifecycle assignment
```

# API Contract: Self-Service Request Catalog & Birthright Access

**Date**: 2026-02-12
**Backend**: xavyo-idp (Rust/Axum) on localhost:8080
**BFF Prefix**: `/api/governance/catalog/` and `/api/governance/birthright-policies/`

## Catalog Browsing Endpoints

### List Categories
- **BFF**: `GET /api/governance/catalog/categories?limit=50&offset=0&parent_id=null`
- **Backend**: `GET /governance/catalog/categories`
- **Query**: `limit` (1-100, default 50), `offset` (default 0), `parent_id` (optional, "null" for root)
- **Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string?",
      "parent_id": "uuid?",
      "icon": "string?",
      "display_order": 0,
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

### Get Category
- **BFF**: `GET /api/governance/catalog/categories/{id}`
- **Backend**: `GET /governance/catalog/categories/{id}`
- **Response** (200): Single `CategoryResponse`

### List Catalog Items
- **BFF**: `GET /api/governance/catalog/items?category_id=&item_type=&search=&tag=&beneficiary_id=&limit=50&offset=0`
- **Backend**: `GET /governance/catalog/items`
- **Query**: `category_id`, `item_type` (Role|Entitlement|Resource), `search`, `tag`, `beneficiary_id`, `limit`, `offset`
- **Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "category_id": "uuid?",
      "item_type": "Role|Entitlement|Resource",
      "name": "string",
      "description": "string?",
      "reference_id": "uuid?",
      "requestability_rules": {},
      "form_fields": [],
      "tags": [],
      "icon": "string?",
      "is_enabled": true,
      "can_request": true,
      "cannot_request_reason": "string?",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

### Get Catalog Item
- **BFF**: `GET /api/governance/catalog/items/{id}?beneficiary_id=`
- **Backend**: `GET /governance/catalog/items/{id}`
- **Response** (200): Single `CatalogItemResponse` with `can_request` and `cannot_request_reason`

---

## Shopping Cart Endpoints

### Get Cart
- **BFF**: `GET /api/governance/catalog/cart?beneficiary_id=`
- **Backend**: `GET /governance/catalog/cart`
- **Response** (200):
```json
{
  "requester_id": "uuid",
  "beneficiary_id": "uuid?",
  "items": [
    {
      "id": "uuid",
      "catalog_item_id": "uuid",
      "catalog_item_name": "string",
      "catalog_item_type": "Role|Entitlement|Resource",
      "parameters": {},
      "form_values": {},
      "added_at": "datetime"
    }
  ],
  "item_count": 0,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Add Item to Cart
- **BFF**: `POST /api/governance/catalog/cart/items`
- **Backend**: `POST /governance/catalog/cart/items`
- **Request**:
```json
{
  "catalog_item_id": "uuid",
  "beneficiary_id": "uuid?",
  "parameters": {},
  "form_values": {}
}
```
- **Response** (201): `CartItemResponse`

### Update Cart Item
- **BFF**: `PUT /api/governance/catalog/cart/items/{itemId}?beneficiary_id=`
- **Backend**: `PUT /governance/catalog/cart/items/{item_id}`
- **Request**:
```json
{
  "parameters": {},
  "form_values": {}
}
```
- **Response** (200): `CartItemResponse`

### Remove Cart Item
- **BFF**: `DELETE /api/governance/catalog/cart/items/{itemId}?beneficiary_id=`
- **Backend**: `DELETE /governance/catalog/cart/items/{item_id}`
- **Response** (204): No content

### Clear Cart
- **BFF**: `DELETE /api/governance/catalog/cart?beneficiary_id=`
- **Backend**: `DELETE /governance/catalog/cart`
- **Response** (204): No content

### Validate Cart
- **BFF**: `POST /api/governance/catalog/cart/validate?beneficiary_id=`
- **Backend**: `POST /governance/catalog/cart/validate`
- **Response** (200):
```json
{
  "valid": true,
  "issues": [
    {
      "cart_item_id": "uuid?",
      "code": "MISSING_FIELD",
      "message": "string"
    }
  ],
  "sod_violations": [
    {
      "rule_id": "uuid",
      "rule_name": "string",
      "conflicting_item_ids": ["uuid"],
      "description": "string"
    }
  ]
}
```

### Submit Cart
- **BFF**: `POST /api/governance/catalog/cart/submit`
- **Backend**: `POST /governance/catalog/cart/submit`
- **Request**:
```json
{
  "beneficiary_id": "uuid?",
  "global_justification": "string?"
}
```
- **Response** (201):
```json
{
  "submission_id": "uuid",
  "items": [
    {
      "cart_item_id": "uuid",
      "access_request_id": "uuid"
    }
  ],
  "request_count": 0
}
```

---

## Catalog Admin Endpoints

### Admin List Categories
- **BFF**: `GET /api/governance/catalog/admin/categories?limit=50&offset=0&parent_id=`
- **Backend**: `GET /governance/admin/catalog/categories`
- **Response** (200): Same as List Categories

### Create Category
- **BFF**: `POST /api/governance/catalog/admin/categories`
- **Backend**: `POST /governance/admin/catalog/categories`
- **Request**:
```json
{
  "name": "string (1-255)",
  "description": "string?",
  "parent_id": "uuid?",
  "icon": "string?",
  "display_order": 0
}
```
- **Response** (201): `CategoryResponse`

### Update Category
- **BFF**: `PUT /api/governance/catalog/admin/categories/{id}`
- **Backend**: `PUT /governance/admin/catalog/categories/{id}`
- **Request**: Same fields as create (all optional)
- **Response** (200): `CategoryResponse`

### Delete Category
- **BFF**: `DELETE /api/governance/catalog/admin/categories/{id}`
- **Backend**: `DELETE /governance/admin/catalog/categories/{id}`
- **Response** (204): No content
- **Error** (409): Category has children or items

### Admin List Items
- **BFF**: `GET /api/governance/catalog/admin/items?category_id=&item_type=&enabled=&search=&tag=&limit=50&offset=0`
- **Backend**: `GET /governance/admin/catalog/items`
- **Response** (200): Same as List Catalog Items (includes disabled items)

### Create Catalog Item
- **BFF**: `POST /api/governance/catalog/admin/items`
- **Backend**: `POST /governance/admin/catalog/items`
- **Request**:
```json
{
  "category_id": "uuid?",
  "item_type": "Role|Entitlement|Resource",
  "name": "string (1-255)",
  "description": "string?",
  "reference_id": "uuid?",
  "requestability_rules": {
    "self_request": true,
    "manager_request": false,
    "department_restriction": [],
    "archetype_restriction": [],
    "prerequisite_roles": [],
    "prerequisite_entitlements": []
  },
  "form_fields": [
    {
      "name": "string",
      "label": "string",
      "field_type": "text|number|select|textarea",
      "required": false,
      "options": [],
      "placeholder": "string?"
    }
  ],
  "tags": []
}
```
- **Response** (201): `CatalogItemResponse`

### Update Catalog Item
- **BFF**: `PUT /api/governance/catalog/admin/items/{id}`
- **Backend**: `PUT /governance/admin/catalog/items/{id}`
- **Request**: Same fields as create (all optional)
- **Response** (200): `CatalogItemResponse`

### Enable Catalog Item
- **BFF**: `POST /api/governance/catalog/admin/items/{id}/enable`
- **Backend**: `POST /governance/admin/catalog/items/{id}/enable`
- **Response** (200): `CatalogItemResponse`

### Disable Catalog Item
- **BFF**: `POST /api/governance/catalog/admin/items/{id}/disable`
- **Backend**: `POST /governance/admin/catalog/items/{id}/disable`
- **Response** (200): `CatalogItemResponse`

### Delete Catalog Item
- **BFF**: `DELETE /api/governance/catalog/admin/items/{id}`
- **Backend**: `DELETE /governance/admin/catalog/items/{id}`
- **Response** (204): No content
- **Error** (409): Item is in active carts

---

## Birthright Policy Endpoints

### List Policies
- **BFF**: `GET /api/governance/birthright-policies?status=&limit=50&offset=0`
- **Backend**: `GET /governance/birthright-policies`
- **Query**: `status` (Active|Archived), `limit`, `offset`
- **Response** (200):
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string?",
      "priority": 0,
      "status": "Active|Archived",
      "conditions": [],
      "entitlement_ids": [],
      "evaluation_mode": "FirstMatch|AllMatch",
      "grace_period_days": 0,
      "is_enabled": true,
      "created_by": "uuid",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "total": 0,
  "limit": 50,
  "offset": 0
}
```

### Get Policy
- **BFF**: `GET /api/governance/birthright-policies/{id}`
- **Backend**: `GET /governance/birthright-policies/{id}`
- **Response** (200): Single `BirthrightPolicyResponse`

### Create Policy
- **BFF**: `POST /api/governance/birthright-policies`
- **Backend**: `POST /governance/birthright-policies`
- **Request**:
```json
{
  "name": "string (1-255)",
  "description": "string?",
  "priority": 0,
  "conditions": [
    {
      "attribute": "string",
      "operator": "Equals|NotEquals|In|NotIn|Contains|StartsWith|EndsWith",
      "value": "any"
    }
  ],
  "entitlement_ids": ["uuid"],
  "evaluation_mode": "FirstMatch|AllMatch",
  "grace_period_days": 0
}
```
- **Response** (201): `BirthrightPolicyResponse`

### Update Policy
- **BFF**: `PUT /api/governance/birthright-policies/{id}`
- **Backend**: `PUT /governance/birthright-policies/{id}`
- **Request**: Same fields as create (all optional)
- **Response** (200): `BirthrightPolicyResponse`

### Archive Policy
- **BFF**: `DELETE /api/governance/birthright-policies/{id}`
- **Backend**: `DELETE /governance/birthright-policies/{id}`
- **Response** (200): `BirthrightPolicyResponse` with status=Archived

### Enable Policy
- **BFF**: `POST /api/governance/birthright-policies/{id}/enable`
- **Backend**: `POST /governance/birthright-policies/{id}/enable`
- **Response** (200): `BirthrightPolicyResponse`

### Disable Policy
- **BFF**: `POST /api/governance/birthright-policies/{id}/disable`
- **Backend**: `POST /governance/birthright-policies/{id}/disable`
- **Response** (200): `BirthrightPolicyResponse`

### Simulate Single Policy
- **BFF**: `POST /api/governance/birthright-policies/{id}/simulate`
- **Backend**: `POST /governance/birthright-policies/{id}/simulate`
- **Request**:
```json
{
  "attributes": {
    "department": "Engineering",
    "location": "US"
  }
}
```
- **Response** (200):
```json
{
  "matches": true,
  "condition_results": [
    {
      "attribute": "department",
      "operator": "Equals",
      "expected": "Engineering",
      "actual": "Engineering",
      "matched": true
    }
  ]
}
```

### Simulate All Policies
- **BFF**: `POST /api/governance/birthright-policies/simulate`
- **Backend**: `POST /governance/birthright-policies/simulate`
- **Request**: Same as single simulate
- **Response** (200):
```json
{
  "attributes": {},
  "matching_policies": [
    {
      "policy_id": "uuid",
      "policy_name": "string",
      "entitlement_ids": ["uuid"]
    }
  ],
  "total_entitlements": ["uuid"]
}
```

### Impact Analysis
- **BFF**: `POST /api/governance/birthright-policies/{id}/impact`
- **Backend**: `POST /governance/birthright-policies/{id}/impact`
- **Request**:
```json
{
  "proposed_conditions": []
}
```
- **Response** (200): Impact analysis results (affected user counts, entitlement counts)

---

## Authentication

All endpoints require:
- `Authorization: Bearer {access_token}` — extracted from HttpOnly cookie in BFF proxy
- `X-Tenant-ID: {tenant_id}` — extracted from HttpOnly cookie in BFF proxy
- Admin endpoints additionally check `hasAdminRole()` in BFF proxy

## Error Responses

Standard error format:
```json
{
  "error": "string",
  "message": "string",
  "status": 400
}
```

Common status codes:
- 400: Invalid request (validation failure)
- 401: Unauthorized (no/expired token)
- 403: Forbidden (not admin for admin endpoints)
- 404: Resource not found
- 409: Conflict (delete category with children, delete item in cart)
- 500: Internal server error

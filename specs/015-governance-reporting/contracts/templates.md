# API Contract: Report Templates

## GET /governance/reports/templates

List report templates with optional filtering.

**Query Parameters:**
- `template_type`: string (optional) — filter by type
- `compliance_standard`: string (optional) — filter by standard
- `include_system`: boolean (default: true)
- `limit`: integer (default: 50, max: 100)
- `offset`: integer (default: 0)

**Response 200:**
```json
{
  "items": [ReportTemplate],
  "total": integer,
  "page": integer,
  "page_size": integer
}
```

## POST /governance/reports/templates

Create a custom report template.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "template_type": "access_review|sod_violations|certification_status|user_access|audit_trail",
  "compliance_standard": "sox|gdpr|hipaa|custom (optional)",
  "definition": {
    "data_sources": ["string"],
    "filters": [{"field": "string", "type": "string", "required": boolean, "options": object|null, "default": any|null}],
    "columns": [{"field": "string", "label": "string", "sortable": boolean}],
    "grouping": ["string"],
    "default_sort": {"field": "string", "direction": "string"} | null
  }
}
```

**Response 201:** ReportTemplate

## GET /governance/reports/templates/{id}

**Response 200:** ReportTemplate

## PUT /governance/reports/templates/{id}

Update a custom template (system templates return 403).

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "definition": TemplateDefinition | null
}
```

**Response 200:** ReportTemplate

## DELETE /governance/reports/templates/{id}

Archive a custom template (system templates return 403).

**Response 200:** ReportTemplate (with status: "archived")

## POST /governance/reports/templates/{id}/clone

Clone a template into a new custom template.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Response 201:** ReportTemplate (new)

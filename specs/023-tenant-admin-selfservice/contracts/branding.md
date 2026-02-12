# API Contract: Branding

## GET /admin/branding

Get current tenant branding configuration.

**Auth**: Admin role required
**Response 200**:
```json
{
  "logo_url": "https://example.com/logo.png",
  "logo_dark_url": null,
  "favicon_url": null,
  "email_logo_url": null,
  "primary_color": "#3B82F6",
  "secondary_color": null,
  "accent_color": null,
  "background_color": null,
  "text_color": null,
  "font_family": null,
  "custom_css": null,
  "login_page_title": "Welcome",
  "login_page_subtitle": null,
  "login_page_background_url": null,
  "footer_text": null,
  "privacy_policy_url": null,
  "terms_of_service_url": null,
  "support_url": null,
  "updated_at": "2026-02-11T10:00:00Z"
}
```

## PUT /admin/branding

Update branding configuration (partial update — only fields present in body are updated).

**Auth**: Admin role required
**Request Body**: Any subset of branding fields
```json
{
  "primary_color": "#EF4444",
  "login_page_title": "Sign In to Acme Corp"
}
```
**Response 200**: Updated full branding config (same shape as GET)

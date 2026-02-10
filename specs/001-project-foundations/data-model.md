# Data Model: Project Foundations

This feature has no persistent data entities. The "entities" are code artifacts:

## UI Component (Code Artifact)

Each UI component follows this structure:

| Property | Type | Description |
|----------|------|-------------|
| name | string | Component name (e.g., "Button") |
| variants | Record | Named style variations (e.g., default, destructive, outline) |
| sizes | Record | Named size options (e.g., default, sm, lg, icon) |
| class | string | Optional Tailwind class override via `cn()` |
| children | Snippet | Content rendered inside the component |

## Design Token (CSS Artifact)

Tokens defined in `@theme` block of `app.css`:

| Token Category | Examples |
|---------------|----------|
| Colors | `--color-background`, `--color-foreground`, `--color-primary`, `--color-muted` |
| Border Radius | `--radius-sm`, `--radius-md`, `--radius-lg` |
| Font Family | `--font-sans`, `--font-mono` |

## Component Variant Map

| Component | Variants | Sizes |
|-----------|----------|-------|
| Button | default, destructive, outline, secondary, ghost, link | default, sm, lg, icon |
| Badge | default, secondary, destructive, outline | — |
| Alert | default, destructive | — |
| Input | — | default, sm, lg |
| Dialog | — | default, sm, lg, full |
| Select | — | default, sm |
| Card, Label, Separator, Skeleton, DropdownMenu | — | — |

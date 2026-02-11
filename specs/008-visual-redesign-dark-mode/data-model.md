# Data Model: Visual Redesign + Dark Mode

## Entities

### ThemeMode (client-side only)

No server-side storage. This is a client-only type stored in localStorage.

| Field | Type | Description |
|-------|------|-------------|
| mode | `'light' \| 'dark' \| 'system'` | User's selected theme mode |

**Storage**: `localStorage.setItem('theme', mode)`
**Default**: `'system'` (auto-detect from OS)

### NavItem (updated interface)

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Display text for navigation item |
| href | `string` | Route path |
| icon | `Component` | Svelte component (lucide-svelte icon) |

**Change from current**: `icon` field changes from `string` (emoji) to `Component` (Svelte component reference)

### AvatarProps

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | `string \| undefined` | No | User's display name for initials |
| email | `string \| undefined` | No | User's email for fallback initials |
| size | `'sm' \| 'default' \| 'lg'` | No | Avatar size (default: `'default'`) |
| class | `string` | No | Additional CSS classes |

**Computed fields**:
- `initials`: First letter of name, or first letter of email, or empty
- `backgroundColor`: Deterministic color from simple hash of email string

## State Transitions

### Theme Mode

```
[Initial Load]
  └─ Read localStorage('theme')
       ├─ Found 'light'  → Apply light theme
       ├─ Found 'dark'   → Apply dark theme
       ├─ Found 'system' → Check OS preference
       │    ├─ OS dark  → Apply dark theme
       │    └─ OS light → Apply light theme
       └─ Not found      → Default to 'system' → Check OS preference

[User Toggle]
  ├─ Select 'light'  → Remove .dark class, save 'light' to localStorage
  ├─ Select 'dark'   → Add .dark class, save 'dark' to localStorage
  └─ Select 'system' → Check OS preference, save 'system' to localStorage

[OS Preference Change] (only when mode = 'system')
  ├─ OS switches to dark  → Add .dark class (no localStorage change)
  └─ OS switches to light → Remove .dark class (no localStorage change)
```

## Relationships

- **Theme** is global application state — affects all components via CSS variables
- **Avatar** depends on user data from `App.Locals` (email, display name) — already available in layout data
- **NavItem** icons are static imports — defined in app layout, no runtime resolution needed

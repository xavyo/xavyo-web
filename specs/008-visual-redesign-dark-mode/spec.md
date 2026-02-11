# Feature Specification: Visual Redesign + Dark Mode

**Feature Branch**: `008-visual-redesign-dark-mode`
**Created**: 2026-02-11
**Status**: Draft
**Input**: Phase 008 — Complete visual overhaul of the xavyo-web identity governance platform with dark/light theming, refined color palette, proper iconography, and enhanced components.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dark/Light Theme Toggle (Priority: P1)

An identity administrator opens the xavyo-web platform and wants to switch between dark and light display modes to match their working environment or personal preference. By default, the application detects the operating system's color scheme preference and applies the corresponding theme. The administrator can override this by toggling between dark, light, or system-follow modes. The selected preference persists across browser sessions so the administrator does not need to re-select each time.

**Why this priority**: Theme support is the foundational requirement of this feature. All other visual changes (colors, components, icons) depend on the theme system being in place. Without it, dark mode variants have nowhere to live.

**Independent Test**: Can be fully tested by toggling the theme switch and verifying that all page elements update their colors appropriately.

**Acceptance Scenarios**:

1. **Given** a first-time visitor with OS dark mode enabled, **When** they load the application, **Then** the interface renders in dark theme.
2. **Given** a first-time visitor with OS light mode enabled, **When** they load the application, **Then** the interface renders in light theme.
3. **Given** the user is on any page, **When** they click the theme toggle, **Then** the interface smoothly transitions between dark and light mode.
4. **Given** the user has manually selected dark mode, **When** they close and reopen the browser, **Then** the interface loads in dark mode regardless of OS setting.
5. **Given** the user has selected "system" mode, **When** the OS theme changes (e.g., scheduled night mode), **Then** the application theme updates in real-time without page refresh.

---

### User Story 2 - Refined Visual Design Language (Priority: P1)

An identity administrator uses the platform daily for managing users, personas, and non-human identities. The interface presents a polished, professional appearance with consistent spacing, clear typography hierarchy, and a refined color palette that communicates trustworthiness appropriate for a security/identity platform. Interactive elements (buttons, links, form fields) have clear hover and focus states with subtle animations that provide feedback without distraction.

**Why this priority**: The visual design language applies to every page and component. Establishing it alongside the theme system ensures a cohesive experience from the start.

**Independent Test**: Can be verified by navigating through all major pages and confirming visual consistency — headings are clearly distinguished from body text, interactive elements have visible hover/focus states, and spacing is uniform.

**Acceptance Scenarios**:

1. **Given** any page in the application, **When** the administrator views it, **Then** heading levels are visually distinct (size, weight) and follow a consistent hierarchy.
2. **Given** any interactive element (button, link, form field), **When** the administrator hovers or focuses it, **Then** a subtle visual transition provides feedback within 150ms.
3. **Given** the application in dark mode, **When** viewing any page, **Then** text has sufficient contrast (WCAG AA: minimum 4.5:1 ratio for normal text).
4. **Given** the application in light mode, **When** viewing any page, **Then** text has sufficient contrast (WCAG AA: minimum 4.5:1 ratio for normal text).

---

### User Story 3 - Professional Navigation with Icons (Priority: P2)

The sidebar navigation currently uses emoji characters as icons. The administrator sees professional, purpose-designed vector icons for each navigation item (Dashboard, Users, Personas, NHI). Active navigation states are clearly distinguished from inactive ones with visual indicators (background highlight, icon color change). The navigation feels intentional and professional.

**Why this priority**: Navigation is the most-used UI element. Replacing emoji with proper icons significantly elevates perceived quality, but this depends on the theme system and design language being established first.

**Independent Test**: Can be tested by visually inspecting the sidebar, clicking through navigation items, and confirming icons render crisply at all display densities.

**Acceptance Scenarios**:

1. **Given** the sidebar navigation, **When** the administrator views it, **Then** each nav item displays a vector icon (not emoji) that visually represents its section.
2. **Given** a navigation item, **When** it is the currently active route, **Then** it has a visually distinct active state (background color, icon emphasis) clearly different from inactive items.
3. **Given** the sidebar in dark mode, **When** viewing navigation items, **Then** icons and labels are clearly visible with appropriate contrast.
4. **Given** the mobile view, **When** the sidebar opens, **Then** it slides in with a smooth animation and icons display at appropriate size for touch targets.

---

### User Story 4 - User Avatar & Header Actions (Priority: P2)

The header currently shows the user's email as plain text with a basic "Log out" link. Instead, the administrator sees their avatar (initials-based, using the first letters of their name or email) alongside a dropdown menu that provides quick access to profile, settings, and log out. The theme toggle is also accessible from the header for easy discovery.

**Why this priority**: The header is visible on every page. An avatar with dropdown is a standard UX pattern that consolidates user actions and provides a natural home for the theme toggle.

**Independent Test**: Can be tested by clicking the avatar to open the dropdown, verifying menu items, and clicking each action.

**Acceptance Scenarios**:

1. **Given** a logged-in administrator, **When** viewing any page, **Then** the header displays an avatar circle with the user's initials.
2. **Given** the header avatar, **When** the administrator clicks it, **Then** a dropdown menu appears with options: Profile, Settings, Log out.
3. **Given** the header, **When** the administrator looks for the theme toggle, **Then** it is visible in the header area (either standalone or within the user dropdown).
4. **Given** the user dropdown is open, **When** clicking "Log out", **Then** the user is logged out and redirected to the login page.

---

### User Story 5 - Branded Authentication Pages (Priority: P3)

When administrators or users reach the login, signup, forgot-password, reset-password, or verify-email pages, they see a polished, branded experience with a visually appealing background (gradient or pattern), centered card layout, and the xavyo brand mark. The authentication pages feel like a premium, trustworthy entry point appropriate for an identity governance platform.

**Why this priority**: Auth pages are the first impression but are used less frequently than the main application. They can be polished after the core design system is in place.

**Independent Test**: Can be tested by viewing each auth page (login, signup, forgot-password, reset-password, verify-email) and confirming the branded layout renders correctly in both light and dark modes.

**Acceptance Scenarios**:

1. **Given** the login page, **When** the user views it, **Then** the page displays a branded background with the form in a centered card.
2. **Given** any auth page in dark mode, **When** the user views it, **Then** the background, card, and form elements all use dark theme colors.
3. **Given** the signup page, **When** the user views it on mobile, **Then** the layout is responsive and the branded background adapts appropriately.
4. **Given** the login page, **When** the user views it, **Then** the xavyo brand name/logo is prominently displayed.

---

### User Story 6 - Foundational Components for Future Features (Priority: P3)

The design system includes new foundational components — tooltips and tabs — that are needed by upcoming features (settings pages, detailed views). These components follow the same design language and support both light and dark themes.

**Why this priority**: These components are needed by Phase 009 (settings tabs) and other future features. Building them now as part of the design system ensures consistency, but they are not user-facing in this phase.

**Independent Test**: Can be tested by rendering each component in isolation, verifying it displays correctly in both themes, and confirming keyboard accessibility.

**Acceptance Scenarios**:

1. **Given** an element with a tooltip, **When** the user hovers over it, **Then** a tooltip appears after a brief delay showing the descriptive text.
2. **Given** a tooltip, **When** the user moves away from the trigger, **Then** the tooltip disappears smoothly.
3. **Given** a tabbed interface, **When** the user clicks a tab, **Then** the corresponding content panel is displayed and the active tab is visually highlighted.
4. **Given** a tabbed interface, **When** the user presses arrow keys while focused on tabs, **Then** focus moves between tabs (keyboard navigation).

---

### Edge Cases

- What happens when the browser does not support the `prefers-color-scheme` media query? The system defaults to light mode.
- What happens when localStorage is unavailable (private browsing)? The system falls back to OS preference detection only, without persistence.
- What happens when the user's display name is empty or only whitespace? The avatar falls back to the first character of the email address.
- What happens when the user's email is empty? The avatar displays a generic user icon.
- What happens during theme transition when a dialog is open? The dialog theme updates in-place without closing.
- What happens with browser "print" mode? Print styles should force light theme for readability.
- What happens on very slow connections? Theme should be determined before first paint to avoid flash of wrong theme (FOWT).
- What happens when text is very long in navigation items? Text truncates with ellipsis while icons remain visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support three theme modes: light, dark, and system (auto-detect from OS).
- **FR-002**: System MUST persist the user's theme preference across browser sessions.
- **FR-003**: System MUST apply the selected theme to all pages and components without exception.
- **FR-004**: System MUST provide a visible, accessible theme toggle in the application header.
- **FR-005**: System MUST use vector-based icons for all navigation items, replacing existing emoji icons.
- **FR-006**: System MUST display a user avatar (initials-based) in the application header for logged-in users.
- **FR-007**: System MUST provide a header dropdown menu with navigation to Profile, Settings, and Log out.
- **FR-008**: System MUST render authentication pages (login, signup, forgot-password, reset-password, verify-email) with a branded visual design including background treatment and centered card layout.
- **FR-009**: System MUST maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text) in both light and dark themes.
- **FR-010**: System MUST provide smooth visual transitions (under 200ms) when switching themes.
- **FR-011**: System MUST provide hover and focus feedback on all interactive elements in both themes.
- **FR-012**: System MUST include a tooltip component that appears on hover with configurable content and position.
- **FR-013**: System MUST include a tabs component with keyboard navigation support and visual active state.
- **FR-014**: System MUST prevent a flash of incorrect theme on initial page load (determine theme before first paint).
- **FR-015**: System MUST fall back gracefully when localStorage is unavailable (use OS preference only).
- **FR-016**: All existing functionality (user CRUD, persona management, NHI management, etc.) MUST continue to work identically after the visual redesign.

### Key Entities

- **Theme Preference**: Stores the user's chosen mode (light, dark, system). Persisted in browser local storage. Determines which visual variant is applied globally.
- **Avatar**: Derived from the user's display name or email. Shows initials in a colored circle. No server-side storage needed — computed client-side.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of application pages and components render correctly in both light and dark themes with no visual artifacts or unreadable text.
- **SC-002**: Theme preference persists across sessions — user returns to the same theme 100% of the time when localStorage is available.
- **SC-003**: All text content meets WCAG AA contrast requirements (4.5:1 for normal text) in both themes, verifiable by automated contrast checking.
- **SC-004**: Theme transitions complete in under 200ms with no layout shift or flash of unstyled content.
- **SC-005**: All 266+ existing unit tests continue to pass after the redesign with zero regressions.
- **SC-006**: Navigation icon replacement covers 100% of sidebar items — no emoji icons remain.
- **SC-007**: Every interactive element (buttons, links, inputs, selects, table rows) has visible hover and focus states in both themes.
- **SC-008**: Authentication pages display branded design on viewports from 320px to 2560px wide without layout breakage.
- **SC-009**: The application determines theme before first visible paint, eliminating flash of wrong theme on page load.

## Assumptions

- The platform is used primarily on modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions) that support `prefers-color-scheme`.
- Users have at minimum a display name or email available from the authentication context for avatar generation.
- The "Profile" and "Settings" links in the user dropdown will initially navigate to placeholder pages or the dashboard until Phase 009 implements the settings hub.
- No server-side theme storage is needed — browser localStorage is sufficient since users typically access from the same device.
- The existing page structure and routes remain unchanged — this is purely a visual layer update.
- Print stylesheet will force light theme regardless of user preference.

## Scope Boundaries

**In scope:**
- Dark/light/system theme switching with persistence
- Color palette refinement for both themes
- Vector icon replacement in navigation
- Avatar component with initials
- Header dropdown menu
- Tooltip and tabs components
- Auth pages branded design
- Typography and spacing refinement
- Hover/focus state enhancements
- Transition animations

**Out of scope:**
- New routes or pages
- New backend API calls
- User-uploadable profile pictures (avatar is initials-only)
- Custom theme creation or per-user color preferences
- Internationalization or right-to-left layout support
- Animations beyond hover/focus/theme transitions (no page transition animations)

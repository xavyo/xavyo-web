# Feature Specification: Polish & UX Refinements

**Feature Branch**: `007-ux-polish`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "Final polish pass across the entire xavyo-web application covering loading states, empty states, error handling improvements, and responsive design."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Loading Feedback During Data Retrieval (Priority: P1)

As an admin user navigating between pages, I see visual placeholders (skeleton screens) while data is being fetched so that I know the application is working and what content layout to expect, rather than seeing a blank screen or abrupt content pop-in.

**Why this priority**: Loading feedback is the most impactful UX improvement because every user encounters it on every page visit. Without it, the application feels broken or slow during data fetches.

**Independent Test**: Can be fully tested by navigating to any list page (users, personas, NHI) or detail page and verifying that skeleton placeholders appear before data loads, matching the eventual content layout.

**Acceptance Scenarios**:

1. **Given** I navigate to a list page (users, personas, archetypes, or NHI), **When** data is being fetched from the server, **Then** I see skeleton placeholders matching the table layout (rows, columns) instead of a blank area.
2. **Given** I navigate to a detail page (user, persona, archetype, tool, agent, or service account), **When** the page data is loading, **Then** I see skeleton placeholders matching the form/card layout of the detail view.
3. **Given** I am on a list page and I change filters or pagination, **When** new data is being fetched, **Then** skeleton placeholders replace the previous data while loading occurs.
4. **Given** the data loads successfully, **When** skeletons are displayed, **Then** they are replaced smoothly by actual content without layout shift.

---

### User Story 2 - Empty State Guidance (Priority: P2)

As an admin user viewing a list page with no data, I see a helpful empty state message with a clear call-to-action instead of a confusing blank table, so I understand what this section is for and how to populate it.

**Why this priority**: Empty states are critical for first-time users and new tenants where most sections start empty. Clear guidance reduces confusion and drives user engagement with core features.

**Independent Test**: Can be fully tested by accessing any list page when no records exist and verifying meaningful messages and action links appear.

**Acceptance Scenarios**:

1. **Given** I am on the users list page and no users exist, **When** the page loads, **Then** I see a message like "No users yet" with a button or link to create the first user.
2. **Given** I am on the personas list page and no personas exist, **When** the page loads, **Then** I see a message like "No personas yet" with a link to create a persona.
3. **Given** I am on the archetypes list page and no archetypes exist, **When** the page loads, **Then** I see a message like "No archetypes yet" with a link to create an archetype.
4. **Given** I am on the NHI list page and no NHI entries exist, **When** the page loads, **Then** I see a message like "No non-human identities yet" with a link to create one.
5. **Given** I am on a detail page and an optional section (e.g., credentials) has no items, **When** the page loads, **Then** that section shows a meaningful empty message (e.g., "No credentials issued yet") with an action to add one.
6. **Given** I apply filters on a list page that result in zero matches, **When** results are empty, **Then** I see "No results match your filters" with an option to clear filters, distinct from the "no data exists" empty state.

---

### User Story 3 - Consistent Error Handling (Priority: P3)

As an admin user, when something goes wrong I receive clear, consistent error feedback so I understand what happened and what I can do about it, whether the error is from a form submission, a failed page load, or an unexpected server issue.

**Why this priority**: Good error handling prevents user frustration and reduces support requests. Consistency across all pages builds trust in the application.

**Independent Test**: Can be fully tested by triggering various error conditions (invalid form input, failed API call, network timeout) and verifying appropriate error feedback appears.

**Acceptance Scenarios**:

1. **Given** I submit a form with invalid data, **When** the server returns validation errors, **Then** I see inline error messages next to the affected fields (existing Superforms behavior, verify consistency).
2. **Given** a page fails to load due to a server error, **When** the error occurs, **Then** I see an error message with a "Retry" button that attempts to reload the page.
3. **Given** an unexpected error occurs during a background operation (e.g., lifecycle action, credential rotation), **When** the error is caught, **Then** a toast notification appears with a user-friendly error message.
4. **Given** I am on an error page, **When** I click "Retry", **Then** the system attempts to reload the current page.
5. **Given** a network error occurs during any operation, **When** the request fails, **Then** I see a message indicating the connection issue rather than a generic error.

---

### User Story 4 - Responsive Mobile Experience (Priority: P4)

As an admin user accessing the application on a tablet or mobile device, I can navigate and use all features effectively because the layout adapts to smaller screens, rather than being forced to scroll horizontally or deal with overlapping elements.

**Why this priority**: While admin applications are primarily used on desktop, mobile/tablet access is increasingly expected. Basic responsive behavior prevents the app from being unusable on smaller screens.

**Independent Test**: Can be fully tested by resizing the browser below 768px width and verifying navigation, tables, forms, and dialogs remain usable.

**Acceptance Scenarios**:

1. **Given** I access the application on a screen narrower than 768px, **When** the page loads, **Then** the sidebar is hidden and replaced with a hamburger menu button.
2. **Given** I am on mobile and the sidebar is hidden, **When** I tap the hamburger menu, **Then** the sidebar slides in as an overlay and I can navigate to any section.
3. **Given** I am on mobile viewing a data table, **When** the table has more columns than fit the screen width, **Then** I can scroll the table horizontally while the page header and navigation remain fixed.
4. **Given** I am on mobile filling out a form, **When** the form has side-by-side fields, **Then** those fields stack vertically to fit the narrow screen.
5. **Given** I am on mobile and a dialog opens, **When** the dialog appears, **Then** it fills the available width with appropriate padding rather than being a narrow centered box.
6. **Given** I am on mobile and the sidebar overlay is open, **When** I tap outside the sidebar or select a menu item, **Then** the sidebar closes.

---

### Edge Cases

- What happens when a page is loading and the user navigates away before data arrives? The skeleton should be replaced by the new page without errors.
- How does the system handle a page load failure followed by successful retry? The error state should clear and content should display normally.
- What happens when the network connection drops mid-session? Any pending operations should show an appropriate network error toast.
- How does the empty state display when filters are applied but data does exist (just not matching)? The "no matching results" message should be distinct from "no data exists".
- What happens to the mobile sidebar when the device is rotated from portrait to landscape (crossing the 768px threshold)? The layout should adapt without requiring a page refresh.
- What happens when skeleton screens display but data never arrives (timeout)? After a reasonable wait, the skeleton should transition to an error state with retry option.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display skeleton placeholder screens on all list pages (users, personas, archetypes, NHI) while data is being fetched.
- **FR-002**: System MUST display skeleton placeholder screens on all detail pages (user, persona, archetype, tool, agent, service account) while data is loading.
- **FR-003**: Skeleton placeholders MUST visually match the layout structure of the actual content they replace (same approximate widths, heights, and positioning).
- **FR-004**: System MUST display an empty state message with a call-to-action on every list page when no records exist for that entity.
- **FR-005**: System MUST display a distinct "no matching results" message when filters are applied but produce zero results, including an option to clear filters.
- **FR-006**: System MUST display empty state messages on detail page sections that have no data (e.g., credentials section with no credentials).
- **FR-007**: System MUST display a user-friendly error page with a "Retry" button when a page fails to load.
- **FR-008**: System MUST show toast notifications for unexpected errors that occur during background operations (lifecycle actions, credential operations).
- **FR-009**: Inline form validation error messages MUST be consistently styled across all forms in the application.
- **FR-010**: System MUST collapse the sidebar navigation into a hamburger menu on screens narrower than 768px.
- **FR-011**: System MUST allow users to open and close the mobile sidebar via the hamburger menu button.
- **FR-012**: Data tables MUST scroll horizontally on screens too narrow to display all columns.
- **FR-013**: Form fields that are displayed side-by-side on desktop MUST stack vertically on screens narrower than 768px.
- **FR-014**: Dialog boxes MUST adapt to full width (with padding) on screens narrower than 768px.
- **FR-015**: The mobile sidebar MUST close when the user taps outside of it or selects a navigation item.

## Assumptions

- The existing Skeleton UI component in the component library is sufficient for building skeleton screens; no new base component is needed.
- The 768px breakpoint is the standard threshold for mobile/tablet responsive behavior.
- Toast notifications for errors are already partially implemented via the existing toast store; this feature extends usage to cover more error scenarios consistently.
- The existing sidebar component can be extended with a visibility toggle and overlay behavior rather than being replaced.
- Empty state messages use standard copy language in English (matching the existing UI language).
- No new backend endpoints or API changes are required; all changes are purely client-side UI enhancements.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of list pages display skeleton loading states while data is fetched, eliminating blank-screen periods.
- **SC-002**: 100% of list pages display contextual empty state messages with actionable links when no data exists.
- **SC-003**: Users encountering a page load error can retry loading with a single click, and 100% of retries function correctly when the underlying issue is resolved.
- **SC-004**: All application pages are fully navigable and usable at screen widths down to 320px without horizontal page scrolling (table content may scroll independently).
- **SC-005**: The sidebar navigation is accessible on mobile via a hamburger menu, with open/close functionality completing in under 300ms.
- **SC-006**: All form validation errors across the application follow a consistent visual pattern (same styling, positioning, and messaging format).
- **SC-007**: 100% of unexpected errors during background operations result in a toast notification being displayed to the user.

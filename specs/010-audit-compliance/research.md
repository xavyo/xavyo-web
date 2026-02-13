# Research: Audit & Compliance

## R1: Cursor-Based Pagination Pattern in SvelteKit

**Decision**: Use client-side "Load more" button that calls a client-side proxy endpoint with the cursor parameter. State managed via Svelte 5 `$state` arrays that append new items.

**Rationale**: The xavyo-idp backend uses cursor-based pagination with `created_at` timestamps (not offset-based). This is more efficient for large datasets and avoids the "shifted page" problem. The frontend accumulates items in a `$state` array and passes the `next_cursor` from the previous response to load the next page.

**Alternatives considered**:
- Offset-based pagination (existing DataTable pattern) — rejected because backend uses cursor-based format
- Infinite scroll — rejected for simplicity; "Load more" button gives users explicit control
- Server-side pagination via `+page.server.ts` with URL params — rejected because cursor values (ISO timestamps) are ugly in URLs and the data doesn't need SSR

**Pattern**:
```
Client component → fetch('/api/audit/login-history?cursor=X&limit=20') → BFF proxy → xavyo-idp
Response: { items: [...], total: N, next_cursor: '2026-02-10T...' | null }
Client appends items to $state array, stores next_cursor for next load
```

## R2: Date Range Filter Component

**Decision**: Use native HTML `<input type="date">` elements for start/end date selection. Convert to ISO 8601 DateTime strings before sending to the API.

**Rationale**: Native date inputs are well-supported in modern browsers, accessible by default, and require zero external dependencies. The backend expects `DateTime<Utc>` strings (ISO 8601 format).

**Alternatives considered**:
- Custom date picker component (Bits UI) — rejected; Bits UI doesn't ship a date picker, and building one adds unnecessary complexity
- Third-party date picker (date-fns + custom) — rejected per Principle V (minimal complexity)

**Conversion**: `input.value` gives `YYYY-MM-DD`, convert to `YYYY-MM-DDT00:00:00Z` for start_date and `YYYY-MM-DDT23:59:59Z` for end_date.

## R3: Admin Role Detection

**Decision**: Reuse the existing `locals.user` object from `hooks.server.ts` which already decodes JWT claims. Check for admin role in the JWT claims to gate admin-only routes and navigation items.

**Rationale**: The existing BFF layer already decodes JWT claims into `locals.user`. The admin role is part of the JWT payload. No new auth mechanism needed.

**Implementation**: In `+page.server.ts` for admin routes, check `locals.user?.role === 'admin'` (or equivalent claim). For navigation visibility, pass the role from the layout load function.

## R4: Security Alerts in Settings vs Dedicated Page

**Decision**: Add security alerts as a new tab in the existing Settings page, alongside existing Profile/Security/Sessions/Devices tabs. Login history also goes in Settings as a tab. The admin audit dashboard gets its own dedicated route at `/audit`.

**Rationale**: User-facing security features (alerts, login history) naturally belong in the Settings area where users already manage their security (password, MFA, sessions, devices). The admin audit dashboard is a separate organizational concern and warrants its own top-level route.

**Navigation changes**:
- Settings page: Add "Alerts" and "Login History" tabs
- Sidebar: Add "Audit" item (admin-only) for the admin dashboard
- Badge: Show unacknowledged alert count on the Settings sidebar item

## R5: Hourly Distribution Visualization

**Decision**: Render the hourly distribution as a pure CSS bar chart using Tailwind utility classes. Each hour (0-23) gets a vertical bar whose height is proportional to the count relative to the maximum count.

**Rationale**: No external charting library needed (Principle V — minimal complexity). The hourly distribution is a simple dataset (24 fixed bars) that maps perfectly to a CSS flexbox layout with percentage heights.

**Pattern**: `flex items-end gap-1` container with 24 child divs. Each div's height is `(count / maxCount) * 100%`. The hour label appears below each bar.

## R6: Unacknowledged Alert Count Badge

**Decision**: Fetch the unacknowledged count from the `GET /security-alerts?limit=1&acknowledged=false` response's `unacknowledged_count` field in the app layout load function. Pass it to the sidebar/header components. Update optimistically when acknowledging.

**Rationale**: The backend already returns `unacknowledged_count` in the security alerts response. Fetching with `limit=1` is lightweight — we only need the count, not the full list. This avoids a separate "count" endpoint.

**Update strategy**: After acknowledging an alert, decrement the count in the client state immediately (optimistic update). If the acknowledge request fails, revert.

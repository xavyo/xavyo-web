# Quickstart: Polish & UX Refinements

## Scenario 1: Skeleton Loading on List Page

1. Navigate to `/users` page
2. While data is loading, observe skeleton rows in the table (animated pulse placeholders)
3. Skeleton rows should have the same column count as the actual table
4. Once data loads, skeletons are replaced by real data without layout shift
5. Change page (pagination) — skeletons appear again briefly during fetch

## Scenario 2: Empty State on Fresh Tenant

1. Sign up and provision a new tenant (no users, personas, or NHI yet)
2. Navigate to `/users` — see "No users yet. Create your first user." with a link to `/users/create`
3. Navigate to `/personas` — see "No personas yet." with a link to create
4. Navigate to `/personas/archetypes` — see "No archetypes yet." with a link to create
5. Navigate to `/nhi` — see "No non-human identities yet." with a link to create

## Scenario 3: Filtered Empty State

1. Navigate to `/users` with existing users
2. Search for a non-existent email
3. See "No results match your search." with option to clear the search
4. Clear the search — users reappear

## Scenario 4: Error Page with Retry

1. Navigate to a detail page (e.g., `/users/invalid-id`)
2. The server returns a 404 or 500 error
3. See an error page with message and "Retry" button
4. Click "Retry" — page attempts to reload

## Scenario 5: Mobile Sidebar Navigation

1. Resize browser to < 768px width
2. Sidebar disappears, hamburger menu appears in header
3. Tap hamburger — sidebar slides in as overlay with dark backdrop
4. Tap a nav item — sidebar closes, navigate to selected page
5. Tap outside sidebar — sidebar closes

## Scenario 6: Mobile Table Scrolling

1. On mobile width, navigate to `/users`
2. Table has more columns than fit the screen
3. Swipe/scroll horizontally within the table
4. Page header and navigation remain fixed (not scrolling)

## Scenario 7: Credentials Empty State

1. Navigate to an NHI detail page (tool, agent, or service account)
2. If no credentials exist, the credentials section shows "No credentials issued yet." with an "Issue Credential" button
3. Issue a credential — empty state disappears, credential appears in list

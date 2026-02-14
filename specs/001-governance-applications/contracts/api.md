# API Contracts: Governance Applications

## BFF Proxy Endpoints (SvelteKit)

### Existing: `src/routes/api/governance/applications/+server.ts`

Already handles:
- `GET /api/governance/applications` → forwards to backend
- `POST /api/governance/applications` → forwards to backend

### New: `src/routes/api/governance/applications/[id]/+server.ts`

#### GET /api/governance/applications/:id
- **Auth**: Requires `locals.accessToken` + `locals.tenantId`
- **Response**: `ApplicationResponse` (JSON)
- **Errors**: 401 (unauthorized), 404 (not found)

#### PUT /api/governance/applications/:id
- **Auth**: Requires `locals.accessToken` + `locals.tenantId`
- **Body**: `UpdateApplicationRequest` (JSON)
- **Response**: `ApplicationResponse` (JSON)
- **Errors**: 401, 400 (validation), 404

#### DELETE /api/governance/applications/:id
- **Auth**: Requires `locals.accessToken` + `locals.tenantId`
- **Response**: 204 No Content
- **Errors**: 401, 404, 412 (has entitlements)

## Backend API Endpoints (xavyo-idp)

All at `http://localhost:8080/governance/applications`

| Method | Path | Request Body | Response | Status |
|--------|------|-------------|----------|--------|
| GET | /governance/applications | - (query: status, app_type, limit, offset) | `ApplicationListResponse` | 200 |
| POST | /governance/applications | `CreateApplicationRequest` | `ApplicationResponse` | 201 |
| GET | /governance/applications/:id | - | `ApplicationResponse` | 200 |
| PUT | /governance/applications/:id | `UpdateApplicationRequest` | `ApplicationResponse` | 200 |
| DELETE | /governance/applications/:id | - | - | 204 / 412 |

## Page Server Actions

### List page (`/governance/applications`)
- **Load**: `GET /governance/applications?limit=20&offset=0` via `listApplications()`
- No form actions

### Create page (`/governance/applications/create`)
- **Load**: `superValidate(zod(createApplicationSchema))`
- **Default action**: Validate form → `createApplication()` → redirect to `/governance/applications`

### Detail page (`/governance/applications/[id]`)
- **Load**: `getApplication(id)` → populate `superValidate(data, zod(updateApplicationSchema))`
- **Update action**: Validate form → `updateApplication(id, data)` → success message
- **Delete action**: `deleteApplication(id)` → redirect to `/governance/applications` (or 412 error)

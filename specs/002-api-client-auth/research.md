# Research: API Client + Authentication

**Feature**: 002-api-client-auth
**Created**: 2026-02-10

## Decision 1: JWT Decoding Library

**Decision**: Use `jose` (JavaScript Object Signing and Encryption)
**Rationale**: Already installed in project dependencies. Supports `decodeJwt` for extracting claims without verification (appropriate for BFF where the backend already verified the token). Lightweight, no native dependencies.
**Alternatives considered**:
- `jsonwebtoken`: Heavier, designed for full verification. Overkill for BFF decode-only use.
- Manual base64 decode: Fragile, no type safety on claims.

## Decision 2: Cookie Configuration

**Decision**: HttpOnly + Secure + SameSite=Lax cookies
**Rationale**:
- `HttpOnly`: Prevents JavaScript access to tokens (XSS mitigation)
- `Secure`: Cookies only sent over HTTPS (set to false in dev for localhost)
- `SameSite=Lax`: Allows top-level navigation (redirects from email links) while blocking CSRF from third-party sites. `Strict` would block the verify-email and reset-password flows coming from email links.
- `Path=/`: Available on all routes
**Alternatives considered**:
- `SameSite=Strict`: Would break email verification links and password reset links (these arrive via external navigation)
- `SameSite=None`: Too permissive, allows third-party cookie sending

## Decision 3: Token Refresh Strategy

**Decision**: Server-side automatic refresh in hooks.server.ts
**Rationale**: The hook runs before every request. If the access token is expired (check `exp` claim), attempt refresh using the refresh_token cookie. If refresh succeeds, update cookies and continue. If refresh fails, clear all auth cookies and let the request proceed unauthenticated (page load functions will handle redirect to /login).
**Alternatives considered**:
- Client-side refresh with fetch interceptor: Violates BFF security (tokens in JS)
- Refresh only on 401 response: Adds latency (request → 401 → refresh → retry)

## Decision 4: Form Handling Pattern

**Decision**: Superforms with Zod schemas and SvelteKit form actions
**Rationale**: Already installed. Provides server-side validation, progressive enhancement (works without JS), and integrates with SvelteKit's form actions. Zod schemas are shared between client validation hints and server validation.
**Alternatives considered**:
- Raw SvelteKit form actions without Superforms: More boilerplate, no built-in client-side validation feedback
- Client-only validation: Violates security best practices (always validate server-side)

## Decision 5: API Client Architecture

**Decision**: Simple function-per-endpoint pattern with a shared fetch wrapper
**Rationale**: Constitution Principle V (Minimal Complexity) — one function per API endpoint, no class hierarchies, no generic abstractions. The fetch wrapper (`client.ts`) handles headers (Authorization, X-Tenant-Id, Content-Type) and base URL. Each API module (auth.ts, tenants.ts) exports named functions.
**Alternatives considered**:
- Generic API client class with method chaining: Over-engineered for the number of endpoints
- Auto-generated client from OpenAPI: Adds build complexity, hard to debug

## Decision 6: Error Handling in API Client

**Decision**: Return typed error objects, let page actions handle user-facing messages
**Rationale**: API client functions throw on network errors, return `{ error: string }` for API-level errors (400, 401, etc.). Page server actions catch errors and return them via Superforms' `fail()` for inline display.
**Alternatives considered**:
- Result type wrapper (Ok/Err): Adds complexity without benefit for this scale
- Global error handler: Loses context about which field caused the error

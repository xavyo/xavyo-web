# Implementation Plan: Security & Self-Service

**Branch**: `009-security-self-service` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-security-self-service/spec.md`

## Summary

Implement user-facing security management and self-service features: settings hub with tabbed layout (Profile, Security, Sessions, Devices), profile editing, password change with strength indicator, TOTP MFA enrollment wizard with QR code and recovery codes, WebAuthn/FIDO2 credential management, active session listing with revocation, device management with trust controls, security overview dashboard, and email change flow. All API calls go through SvelteKit BFF proxy endpoints using HttpOnly cookies.

## Technical Context

**Language/Version**: TypeScript 5.x / Svelte 5 (runes mode) + SvelteKit
**Primary Dependencies**: Bits UI, Tailwind CSS v4, Superforms + Zod (via `zod/v3`), lucide-svelte, WebAuthn Browser API
**Storage**: N/A (backend handles persistence via xavyo-idp REST API on localhost:8080)
**Testing**: Vitest + @testing-library/svelte (unit), Chrome DevTools MCP (E2E)
**Target Platform**: Web (desktop + mobile responsive, md:768px breakpoint)
**Project Type**: Web application (SvelteKit)
**Performance Goals**: Settings page loads within 2 seconds, all actions provide immediate feedback
**Constraints**: BFF pattern (no JWT exposure to client), 44px minimum touch targets, light/dark theme support
**Scale/Scope**: ~8-10 new routes, 4 new API modules, ~6 new Zod schemas, ~15 proxy endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. BFF Security | PASS | All API calls through SvelteKit server-side proxy endpoints. JWT tokens stay in HttpOnly cookies. WebAuthn registration uses server-side challenge/response flow. |
| II. Test-Driven Development | PASS | Unit tests for all API modules, schemas, components. E2E tests for MFA enrollment, session management. |
| III. Honest Reviews | PASS | Post-implementation review with `npm run check`, `npm run test:unit`, Chrome MCP visual testing. |
| IV. Svelte 5 Runes Only | PASS | All components use `$state`, `$derived`, `$props`. No legacy patterns. |
| V. Minimal Complexity | PASS | One function per endpoint. Tabs component from Phase 008 reused. No abstractions beyond what's needed. |
| VI. Type Safety | PASS | All API types mirror Rust DTOs. Zod schemas match TypeScript types. No `any`. |
| VII. English Only | PASS | All UI text and code in English. |

## Project Structure

### Documentation (this feature)

```text
specs/009-security-self-service/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── profile.md
│   ├── password.md
│   ├── mfa.md
│   ├── sessions.md
│   ├── devices.md
│   └── security.md
└── tasks.md             # Phase 2 output (speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   ├── me.ts                    # Profile, email change, security overview
│   │   ├── me.test.ts
│   │   ├── mfa.ts                   # TOTP setup/verify/disable, recovery codes, WebAuthn
│   │   ├── mfa.test.ts
│   │   ├── sessions.ts              # Session list, revoke individual/all
│   │   ├── sessions.test.ts
│   │   ├── devices.ts               # Device list, rename, trust, remove
│   │   ├── devices.test.ts
│   │   └── types.ts                 # ADD new types (existing file)
│   ├── schemas/
│   │   └── settings.ts              # Zod schemas for all settings forms
│   ├── components/
│   │   └── ui/
│   │       └── password-strength/   # Password strength indicator component
│   │           ├── index.ts
│   │           └── password-strength.svelte
│   └── utils/
│       └── password-strength.ts     # Password evaluation logic (pure function)
├── routes/
│   ├── api/
│   │   ├── me/
│   │   │   ├── profile/+server.ts           # GET/PUT /me/profile proxy
│   │   │   ├── password/+server.ts          # PUT /auth/password proxy
│   │   │   ├── security/+server.ts          # GET /me/security proxy
│   │   │   └── email/
│   │   │       ├── change/+server.ts        # POST /me/email/change proxy
│   │   │       └── verify/+server.ts        # POST /me/email/verify proxy
│   │   ├── mfa/
│   │   │   ├── status/+server.ts            # GET /users/me/mfa/status proxy
│   │   │   ├── totp/
│   │   │   │   ├── setup/+server.ts         # POST /auth/mfa/totp/setup proxy
│   │   │   │   ├── verify-setup/+server.ts  # POST /auth/mfa/totp/verify-setup proxy
│   │   │   │   └── disable/+server.ts       # DELETE /auth/mfa/totp proxy
│   │   │   ├── recovery/
│   │   │   │   └── generate/+server.ts      # POST /auth/mfa/recovery/generate proxy
│   │   │   └── webauthn/
│   │   │       ├── register/
│   │   │       │   ├── start/+server.ts     # POST start proxy
│   │   │       │   └── finish/+server.ts    # POST finish proxy
│   │   │       └── credentials/+server.ts   # GET/PATCH/DELETE proxy
│   │   ├── sessions/+server.ts              # GET/DELETE /users/me/sessions proxy
│   │   ├── sessions/[id]/+server.ts         # DELETE /users/me/sessions/{id} proxy
│   │   ├── devices/+server.ts               # GET /devices proxy
│   │   ├── devices/[id]/+server.ts          # PUT/DELETE /devices/{id} proxy
│   │   └── devices/[id]/trust/+server.ts    # POST/DELETE /devices/{id}/trust proxy
│   └── (app)/
│       └── settings/
│           ├── +page.svelte                 # Settings hub with tabs
│           ├── +page.server.ts              # Load profile, MFA status, security overview
│           ├── profile-tab.svelte           # Profile editing form
│           ├── security-tab.svelte          # Security overview + MFA + password
│           ├── sessions-tab.svelte          # Session list with revocation
│           ├── devices-tab.svelte           # Device list with trust management
│           ├── password-change-form.svelte  # Password change form
│           ├── mfa-status-section.svelte    # MFA overview (TOTP + WebAuthn status)
│           ├── totp-setup-wizard.svelte     # TOTP enrollment wizard (3 steps)
│           ├── webauthn-section.svelte      # WebAuthn credential management
│           ├── recovery-codes-dialog.svelte # Recovery codes display/download
│           ├── email-change-dialog.svelte   # Email change flow
│           └── security-overview.svelte     # Security health dashboard cards
```

**Structure Decision**: Follows existing SvelteKit project structure. Settings page uses a single route (`/settings`) with tab content as co-located Svelte components. BFF proxy endpoints in `src/routes/api/` follow the established pattern. API client modules in `src/lib/api/` follow one-function-per-endpoint pattern.

## Complexity Tracking

> No Constitution Check violations. No justification needed.

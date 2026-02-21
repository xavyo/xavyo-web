# Research: NHI Access Requests & Persona Context

## Decision 1: NHI Request API Path Prefix

**Decision**: Use `/governance/nhis/requests` as the backend path prefix (not `/nhi/requests`).
**Rationale**: Backend handlers are mounted under the governance router, not the base NHI router. Verified in `xavyo-api-governance/src/handlers/nhis.rs`.
**Alternatives**: None — must match backend routing.

## Decision 2: Persona Context Token Storage

**Decision**: Store the persona context access_token in the same HttpOnly cookie (`access_token`) used for the primary session. The original token is stored in a separate `original_access_token` cookie for switch-back.
**Rationale**: Follows the BFF security principle — tokens never exposed to client JS. Same pattern as Power of Attorney delegation. The switch-back endpoint returns the original token.
**Alternatives**: Could store in a separate `persona_token` cookie, but adds complexity without benefit since only one identity context is active at a time.

## Decision 3: NHI Certification Campaign Enhancement vs New

**Decision**: Create new enhanced certification pages under `/nhi/governance/certifications/` rather than modifying existing ones.
**Rationale**: The existing NHI governance certifications (Phase 014) use a simpler certify/revoke per-entity model. The enhanced model (Phase 038) adds campaigns with lifecycle, items, and bulk decide — fundamentally different UI. New pages avoid breaking existing functionality.
**Alternatives**: Could modify existing pages, but the UI models are too different.

## Decision 4: NHI Summary Cards Placement

**Decision**: Add summary cards at the top of the existing NHI main listing page (`/nhi`).
**Rationale**: Summary stats provide immediate visibility into NHI fleet health without requiring navigation to a separate page.
**Alternatives**: Could create a separate NHI dashboard page, but that adds unnecessary navigation.

## Decision 5: Persona Context Indicator Placement

**Decision**: Add context indicator to the app header (next to user avatar/name), visible from all app pages.
**Rationale**: SC-006 requires users to identify their active persona "at a glance from any page." The header is the only persistent UI element across all pages.
**Alternatives**: Could use a sidebar badge, but the header is more prominent and consistently visible.

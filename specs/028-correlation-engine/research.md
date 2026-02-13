# Research: Identity Correlation Engine

**Date**: 2026-02-12 | **Branch**: `028-correlation-engine`

## Backend API Verification (Constitution Principle VIII)

### Decision: All 7 API groups verified as existing in xavyo-idp backend

**Verified endpoints:**

| Group | Base Path | Endpoints | Status |
|-------|-----------|-----------|--------|
| Connector Correlation Rules | `/governance/connectors/{connector_id}/correlation/rules` | LIST, GET, CREATE, UPDATE (PATCH), DELETE, VALIDATE-EXPRESSION | Verified |
| Identity Correlation Rules | `/governance/identity-correlation-rules` | LIST, GET, CREATE, UPDATE (PUT), DELETE | Verified |
| Thresholds | `/governance/connectors/{connector_id}/correlation/thresholds` | GET, UPSERT (PUT) | Verified |
| Job Execution | `/governance/connectors/{connector_id}/correlation/evaluate` + `/jobs/{job_id}` | TRIGGER (POST), STATUS (GET) | Verified |
| Cases | `/governance/correlation/cases` | LIST, GET, CONFIRM, REJECT, CREATE-IDENTITY, REASSIGN | Verified |
| Statistics | `/governance/connectors/{connector_id}/correlation/statistics` | GET, TRENDS | Verified |
| Audit | `/governance/correlation/audit` | LIST, GET | Verified |

### Spec Corrections Based on Backend Reality

1. **Match types**: Backend supports `exact`, `fuzzy`, `expression` only — NO `phonetic` type
   - **Decision**: Remove phonetic from frontend, align with backend enum
   - **Rationale**: Phonetic matching can be achieved via expression type if needed

2. **Fuzzy algorithms**: Backend exposes `algorithm` field with `levenshtein` and `jaro_winkler` options
   - **Decision**: Add algorithm selector to rule form when match_type is `fuzzy`
   - **Rationale**: Direct mapping to backend field

3. **Weight is a float**: Backend uses `weight: f64` (e.g., 1.0, 1.5), not integer 0-100
   - **Decision**: Use numeric input with float step (0.1), not a slider 0-100
   - **Rationale**: Direct mapping to backend field

4. **Threshold is a float 0-1**: Backend uses `threshold: f64` (e.g., 0.85), not percentage 0-100
   - **Decision**: Display as percentage in UI (0.85 → 85%) but submit/receive as float
   - **Rationale**: Better UX while maintaining backend compatibility

5. **Identity correlation rules have single `attribute`**: NOT source_attribute + target_attribute pair
   - **Decision**: Single attribute input for identity rules (comparing same attribute across identities)
   - **Rationale**: Backend model uses single `attribute` field

6. **Correlation rule has extra fields**: `name`, `algorithm`, `threshold`, `normalize`, `is_active`, `priority`
   - **Decision**: Include all fields in the create/edit form
   - **Rationale**: Complete backend coverage

7. **Case "reassign" means reassign to different reviewer**: NOT link to different identity
   - **Decision**: Reassign UI shows user picker for reviewer assignment, not identity search
   - **Rationale**: Matches backend semantics (ReassignCaseRequest has `assigned_to` user UUID)

8. **No job cancel endpoint**: Backend only has trigger + status polling
   - **Decision**: Remove cancel job feature from frontend scope
   - **Rationale**: Backend doesn't support it; cannot fake it (Constitution Principle VIII)

9. **Validate expression endpoint exists**: POST `/correlation/rules/validate-expression`
   - **Decision**: Add "Test Expression" button in rule form when match_type is `expression`
   - **Rationale**: Useful UX feature with backend support

10. **Statistics include AI suggestions**: Backend returns `suggestions: string[]`
    - **Decision**: Display suggestions as info cards in the statistics dashboard
    - **Rationale**: Free value from backend

11. **Threshold has extra fields**: `include_deactivated`, `batch_size`
    - **Decision**: Include in threshold configuration form
    - **Rationale**: Complete backend coverage

12. **Case has `trigger_type`**: import, reconciliation, manual
    - **Decision**: Show as badge in case list and filter option
    - **Rationale**: Useful for filtering and context

## Navigation Architecture

### Decision: Hybrid approach — connector-scoped + global hub

- **Connector-scoped** (rules, thresholds, jobs, stats): Tabs on existing connector detail page at `/connectors/[id]`
- **Global** (cases, audit): New route at `/governance/correlation/` with tab layout (Cases | Audit)
- **Identity rules**: Under `/governance/correlation/` with a third tab (Identity Rules | Cases | Audit)

**Rationale**: Connector-scoped config belongs with the connector. Cases and audit are cross-connector, so they get a dedicated governance section. Identity rules are tenant-wide, so they go with the global section.

## UI Pattern Decisions

### Decision: Reuse existing project patterns

- **Tables**: DataTable component with TanStack Table
- **Forms**: Superforms + Zod schemas
- **Dialogs**: Bits UI Dialog for confirmations
- **Tabs**: Existing tab pattern from governance hub
- **Badges**: Status badges for case status, job status, match type
- **Polling**: `setInterval` in `onMount` for job status updates (5-second interval)
- **Empty states**: EmptyState component with icons and CTAs

### Decision: No chart library for trends

- Display trends as a simple table with daily data points
- Avoids adding a chart dependency for a single feature
- Can upgrade to chart later if needed

**Alternatives considered**: chart.js, echarts — rejected for YAGNI (Principle V)

# Research: Self-Service Request Catalog & Birthright Access

**Date**: 2026-02-12
**Feature**: 031-catalog-birthright

## Research Topics

### 1. Catalog Browsing Patterns

**Decision**: Category sidebar + item grid layout with client-side search/filter
**Rationale**: Standard e-commerce catalog pattern. Server-side initial load of categories and first page of items, client-side filtering via BFF proxy endpoints for responsive UX. Category sidebar is a tree component (reuse existing tree patterns from governance roles).
**Alternatives considered**:
- Full server-side rendering with form-based filters — rejected: too many page reloads for browsing experience
- Client-side SPA with all data loaded upfront — rejected: too much data for large catalogs

### 2. Shopping Cart State Management

**Decision**: Server-side cart via backend API (GET/POST/PUT/DELETE), client-side state for cart badge count
**Rationale**: Backend already provides full cart CRUD endpoints. Server-side cart persists across sessions and devices. Client-side `$state` for cart item count (updated after each cart mutation) provides responsive badge without polling.
**Alternatives considered**:
- Client-side cart (localStorage) — rejected: doesn't persist across devices; violates backend fidelity principle
- Real-time cart updates via WebSocket — rejected: YAGNI; simple fetch-after-mutation is sufficient

### 3. Birthright Policy Condition Builder UX

**Decision**: Inline condition rows with attribute/operator/value columns, add/remove buttons
**Rationale**: Standard rule-builder pattern. Each condition is a row: text input for attribute name, dropdown for operator (7 options), text/JSON input for value. Matches the backend `conditions[]` array structure directly.
**Alternatives considered**:
- Visual drag-and-drop rule builder — rejected: over-engineering for 7 operators
- JSON editor for conditions — rejected: not admin-friendly

### 4. Cart Validation UX

**Decision**: Explicit "Validate" button with results panel showing issues and SoD warnings separately
**Rationale**: Validation is a distinct step before submission (backend has separate validate and submit endpoints). Issues are blocking (must be fixed); SoD violations are warnings (can submit anyway). Clear visual separation needed.
**Alternatives considered**:
- Auto-validate on cart page load — rejected: could be slow for large carts; explicit action gives user control
- Inline validation per item — rejected: SoD violations are cross-item, can't be shown per-item

### 5. Category Hierarchy Depth

**Decision**: Support up to 4 levels of nesting in sidebar navigation
**Rationale**: Aligns with SC-009 success criteria. Backend supports unlimited nesting via `parent_id`. Frontend limits display to 4 levels for readability. Use collapsible tree nodes (same pattern as governance role tree).
**Alternatives considered**:
- Flat category list — rejected: misses hierarchy value
- Breadcrumb navigation instead of tree — rejected: sidebar tree gives better overview

### 6. Beneficiary Selection (Manager Requests)

**Decision**: User selector dropdown at top of catalog page, changes all requestability evaluations
**Rationale**: Backend's `beneficiary_id` query parameter on catalog items and cart endpoints supports this natively. UI shows "Requesting for: [Name]" banner when beneficiary is selected. Uses existing user search pattern.
**Alternatives considered**:
- Separate "Manager Request" mode/page — rejected: duplicates entire catalog UI
- Select beneficiary at submission time only — rejected: requestability must be checked for beneficiary during browsing

### 7. Form Fields on Catalog Items

**Decision**: Dynamic form rendering based on `form_fields[]` from catalog item definition
**Rationale**: Backend supports custom form fields per item. Frontend renders them dynamically in the cart (when filling parameters/form values). Use standard HTML form inputs (text, number, select, textarea) based on field type from backend.
**Alternatives considered**:
- Separate form page per item — rejected: breaks cart flow
- Ignore form fields — rejected: required by FR-013

## No Unresolved Items

All technical decisions are clear. No NEEDS CLARIFICATION items remain. Ready for Phase 1 design.

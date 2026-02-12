# Quickstart: Identity Correlation Engine

**Date**: 2026-02-12 | **Branch**: `028-correlation-engine`

## What This Feature Does

Adds a complete frontend for the xavyo-idp correlation engine that matches imported connector accounts to existing identities. Admins configure matching rules and confidence thresholds per connector, trigger batch correlation jobs, review uncertain matches in a case queue, and monitor performance through statistics and audit trails.

## Architecture Overview

```
Browser
  ├── Connector Detail Page (tabs: Rules, Thresholds, Jobs, Stats)
  │   └── Client-side API calls → /api/connectors/[id]/correlation/*
  │
  └── Governance Correlation Hub (tabs: Identity Rules, Cases, Audit)
      └── Server-side load + client-side actions → /api/governance/correlation/*

SvelteKit BFF (routes/api/)
  └── Proxies to xavyo-idp backend (localhost:8080)
      └── /governance/connectors/{id}/correlation/*
      └── /governance/correlation/*
      └── /governance/identity-correlation-rules
```

## Key Files to Create

### API Layer
- `src/lib/api/correlation.ts` — Server-side API client (24 functions)
- `src/lib/api/correlation-client.ts` — Client-side API client (24 functions)

### Schemas
- `src/lib/schemas/correlation.ts` — Zod validation schemas (9 schemas)

### BFF Proxies (~16 endpoint files)
- `src/routes/api/connectors/[connectorId]/correlation/rules/+server.ts`
- `src/routes/api/connectors/[connectorId]/correlation/rules/[id]/+server.ts`
- `src/routes/api/connectors/[connectorId]/correlation/rules/validate-expression/+server.ts`
- `src/routes/api/connectors/[connectorId]/correlation/thresholds/+server.ts`
- `src/routes/api/connectors/[connectorId]/correlation/evaluate/+server.ts`
- `src/routes/api/connectors/[connectorId]/correlation/jobs/[jobId]/+server.ts`
- `src/routes/api/connectors/[connectorId]/correlation/statistics/+server.ts`
- `src/routes/api/connectors/[connectorId]/correlation/statistics/trends/+server.ts`
- `src/routes/api/governance/correlation/cases/+server.ts`
- `src/routes/api/governance/correlation/cases/[caseId]/+server.ts`
- `src/routes/api/governance/correlation/cases/[caseId]/confirm/+server.ts`
- `src/routes/api/governance/correlation/cases/[caseId]/reject/+server.ts`
- `src/routes/api/governance/correlation/cases/[caseId]/create-identity/+server.ts`
- `src/routes/api/governance/correlation/cases/[caseId]/reassign/+server.ts`
- `src/routes/api/governance/correlation/identity-rules/+server.ts`
- `src/routes/api/governance/correlation/identity-rules/[id]/+server.ts`
- `src/routes/api/governance/correlation/audit/+server.ts`
- `src/routes/api/governance/correlation/audit/[eventId]/+server.ts`

### Pages
- `src/routes/(app)/connectors/[id]/+page.svelte` — Add correlation tabs (modify existing)
- `src/routes/(app)/connectors/[id]/+page.server.ts` — Load correlation data (modify existing)
- `src/routes/(app)/governance/correlation/+page.svelte` — Correlation hub (Identity Rules | Cases | Audit)
- `src/routes/(app)/governance/correlation/+page.server.ts` — Load hub data
- `src/routes/(app)/governance/correlation/cases/[caseId]/+page.svelte` — Case detail
- `src/routes/(app)/governance/correlation/cases/[caseId]/+page.server.ts` — Load case

### Components
- `src/lib/components/correlation/rules-table.svelte` — Rules list with CRUD actions
- `src/lib/components/correlation/rule-form.svelte` — Rule create/edit form
- `src/lib/components/correlation/threshold-form.svelte` — Threshold configuration
- `src/lib/components/correlation/job-status.svelte` — Job status display with polling
- `src/lib/components/correlation/statistics-cards.svelte` — Stats summary cards
- `src/lib/components/correlation/trends-table.svelte` — Daily trends table
- `src/lib/components/correlation/case-detail.svelte` — Case review with candidates
- `src/lib/components/correlation/candidate-card.svelte` — Candidate with attribute scores
- `src/lib/components/correlation/identity-rules-table.svelte` — Identity rules list
- `src/lib/components/correlation/audit-table.svelte` — Audit event list

## Quick Commands

```bash
# Run all tests
npm run test:unit

# Type check
npm run check

# Dev server
npm run dev
```

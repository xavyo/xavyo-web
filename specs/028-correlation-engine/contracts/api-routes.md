# API Contracts: Identity Correlation Engine

**Date**: 2026-02-12 | **Branch**: `028-correlation-engine`

## BFF Proxy Routes (src/routes/api/)

### Connector-Scoped Correlation Rules

| BFF Route | Method | Backend Path | Purpose |
|-----------|--------|-------------|---------|
| `/api/connectors/[connectorId]/correlation/rules` | GET | `/governance/connectors/{connector_id}/correlation/rules` | List rules |
| `/api/connectors/[connectorId]/correlation/rules` | POST | Same | Create rule |
| `/api/connectors/[connectorId]/correlation/rules/[id]` | GET | `.../rules/{id}` | Get rule |
| `/api/connectors/[connectorId]/correlation/rules/[id]` | PATCH | `.../rules/{id}` | Update rule |
| `/api/connectors/[connectorId]/correlation/rules/[id]` | DELETE | `.../rules/{id}` | Delete rule |
| `/api/connectors/[connectorId]/correlation/rules/validate-expression` | POST | `.../rules/validate-expression` | Validate expression |

### Correlation Thresholds

| BFF Route | Method | Backend Path | Purpose |
|-----------|--------|-------------|---------|
| `/api/connectors/[connectorId]/correlation/thresholds` | GET | `/governance/connectors/{connector_id}/correlation/thresholds` | Get thresholds |
| `/api/connectors/[connectorId]/correlation/thresholds` | PUT | Same | Upsert thresholds |

### Correlation Jobs

| BFF Route | Method | Backend Path | Purpose |
|-----------|--------|-------------|---------|
| `/api/connectors/[connectorId]/correlation/evaluate` | POST | `/governance/connectors/{connector_id}/correlation/evaluate` | Trigger job |
| `/api/connectors/[connectorId]/correlation/jobs/[jobId]` | GET | `.../correlation/jobs/{job_id}` | Get job status |

### Correlation Statistics

| BFF Route | Method | Backend Path | Purpose |
|-----------|--------|-------------|---------|
| `/api/connectors/[connectorId]/correlation/statistics` | GET | `/governance/connectors/{connector_id}/correlation/statistics` | Get stats |
| `/api/connectors/[connectorId]/correlation/statistics/trends` | GET | `.../statistics/trends` | Get trends |

### Correlation Cases (Global)

| BFF Route | Method | Backend Path | Purpose |
|-----------|--------|-------------|---------|
| `/api/governance/correlation/cases` | GET | `/governance/correlation/cases` | List cases |
| `/api/governance/correlation/cases/[caseId]` | GET | `.../cases/{case_id}` | Get case detail |
| `/api/governance/correlation/cases/[caseId]/confirm` | POST | `.../cases/{case_id}/confirm` | Confirm match |
| `/api/governance/correlation/cases/[caseId]/reject` | POST | `.../cases/{case_id}/reject` | Reject match |
| `/api/governance/correlation/cases/[caseId]/create-identity` | POST | `.../cases/{case_id}/create-identity` | Create identity |
| `/api/governance/correlation/cases/[caseId]/reassign` | POST | `.../cases/{case_id}/reassign` | Reassign reviewer |

### Identity Correlation Rules (Global)

| BFF Route | Method | Backend Path | Purpose |
|-----------|--------|-------------|---------|
| `/api/governance/correlation/identity-rules` | GET | `/governance/identity-correlation-rules` | List rules |
| `/api/governance/correlation/identity-rules` | POST | Same | Create rule |
| `/api/governance/correlation/identity-rules/[id]` | GET | `.../identity-correlation-rules/{id}` | Get rule |
| `/api/governance/correlation/identity-rules/[id]` | PUT | `.../identity-correlation-rules/{id}` | Update rule |
| `/api/governance/correlation/identity-rules/[id]` | DELETE | `.../identity-correlation-rules/{id}` | Delete rule |

### Correlation Audit (Global)

| BFF Route | Method | Backend Path | Purpose |
|-----------|--------|-------------|---------|
| `/api/governance/correlation/audit` | GET | `/governance/correlation/audit` | List audit events |
| `/api/governance/correlation/audit/[eventId]` | GET | `.../correlation/audit/{event_id}` | Get audit detail |

## Server-Side API Client Functions (src/lib/api/correlation.ts)

```typescript
// Connector-scoped rules
listCorrelationRules(connectorId, params, token, tenantId, fetch)
getCorrelationRule(connectorId, ruleId, token, tenantId, fetch)
createCorrelationRule(connectorId, body, token, tenantId, fetch)
updateCorrelationRule(connectorId, ruleId, body, token, tenantId, fetch)
deleteCorrelationRule(connectorId, ruleId, token, tenantId, fetch)
validateExpression(connectorId, body, token, tenantId, fetch)

// Thresholds
getCorrelationThresholds(connectorId, token, tenantId, fetch)
upsertCorrelationThresholds(connectorId, body, token, tenantId, fetch)

// Jobs
triggerCorrelation(connectorId, body, token, tenantId, fetch)
getCorrelationJobStatus(connectorId, jobId, token, tenantId, fetch)

// Statistics
getCorrelationStatistics(connectorId, params, token, tenantId, fetch)
getCorrelationTrends(connectorId, params, token, tenantId, fetch)

// Cases (global)
listCorrelationCases(params, token, tenantId, fetch)
getCorrelationCase(caseId, token, tenantId, fetch)
confirmCorrelationCase(caseId, body, token, tenantId, fetch)
rejectCorrelationCase(caseId, body, token, tenantId, fetch)
createIdentityFromCase(caseId, body, token, tenantId, fetch)
reassignCorrelationCase(caseId, body, token, tenantId, fetch)

// Identity rules (global)
listIdentityCorrelationRules(params, token, tenantId, fetch)
getIdentityCorrelationRule(ruleId, token, tenantId, fetch)
createIdentityCorrelationRule(body, token, tenantId, fetch)
updateIdentityCorrelationRule(ruleId, body, token, tenantId, fetch)
deleteIdentityCorrelationRule(ruleId, token, tenantId, fetch)

// Audit (global)
listCorrelationAuditEvents(params, token, tenantId, fetch)
getCorrelationAuditEvent(eventId, token, tenantId, fetch)
```

## Client-Side API Functions (src/lib/api/correlation-client.ts)

```typescript
// Connector-scoped (called from connector detail page components)
fetchCorrelationRules(connectorId, params?)
fetchCorrelationRule(connectorId, ruleId)
createCorrelationRuleClient(connectorId, body)
updateCorrelationRuleClient(connectorId, ruleId, body)
deleteCorrelationRuleClient(connectorId, ruleId)
validateExpressionClient(connectorId, body)
fetchCorrelationThresholds(connectorId)
upsertCorrelationThresholdsClient(connectorId, body)
triggerCorrelationClient(connectorId, body?)
fetchCorrelationJobStatus(connectorId, jobId)
fetchCorrelationStatistics(connectorId, params?)
fetchCorrelationTrends(connectorId, params)

// Global (called from governance correlation pages)
fetchCorrelationCases(params?)
fetchCorrelationCase(caseId)
confirmCaseClient(caseId, body)
rejectCaseClient(caseId, body)
createIdentityFromCaseClient(caseId, body)
reassignCaseClient(caseId, body)
fetchIdentityCorrelationRules(params?)
createIdentityCorrelationRuleClient(body)
updateIdentityCorrelationRuleClient(ruleId, body)
deleteIdentityCorrelationRuleClient(ruleId)
fetchCorrelationAuditEvents(params?)
fetchCorrelationAuditEvent(eventId)
```

## Zod Schemas (src/lib/schemas/correlation.ts)

```typescript
createCorrelationRuleSchema       // name, source_attribute, target_attribute, match_type, algorithm?, threshold, weight, expression?, tier, is_definitive, normalize, priority
updateCorrelationRuleSchema       // All fields optional
createIdentityCorrelationRuleSchema // name, attribute, match_type, algorithm?, threshold, weight, priority
updateIdentityCorrelationRuleSchema // All fields optional
upsertThresholdSchema             // auto_confirm_threshold, manual_review_threshold, tuning_mode, include_deactivated, batch_size
validateExpressionSchema          // expression, test_input
confirmCaseSchema                 // candidate_id, reason?
rejectCaseSchema                  // reason
createIdentityFromCaseSchema      // reason?
reassignCaseSchema                // assigned_to, reason?
```

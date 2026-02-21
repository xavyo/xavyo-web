# NHI Usage & Summary API Contract

## POST /governance/nhis/{id}/usage
Record a usage event (internal/system use).
- Body: `{ activity_type: string, details?: string, source_ip?: string }`
- Response 201: `NhiUsageRecord`

## GET /governance/nhis/{id}/usage
Get usage history for an NHI entity.
- Query: `limit?`, `offset?`
- Response 200: `{ items: NhiUsageRecord[], total: number }`

## GET /governance/nhis/{id}/usage/summary
Get usage summary with extended stats.
- Response 200: `NhiUsageSummary`

## GET /governance/nhis/staleness-report
Get staleness report across all NHIs.
- Query: `limit?`, `offset?`
- Response 200: `{ items: NhiStalenessEntry[], total: number }`

## GET /governance/nhis/summary
Get NHI summary stats.
- Response 200: `NhiSummary`

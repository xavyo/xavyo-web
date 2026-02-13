# API Contract: Micro Certification Statistics

## GET /governance/micro-certifications/stats

Get aggregated certification statistics.

**Response 200**:
```json
{
  "total": 100,
  "pending": 15,
  "certified": 60,
  "revoked": 10,
  "delegated": 5,
  "skipped": 3,
  "expired": 7,
  "overdue": 4,
  "avg_decision_time_secs": 3600.5
}
```

**Auth**: Admin only

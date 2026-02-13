# API Contract: Risk Scoring

## List Risk Scores
```
GET /governance/risk-scores?risk_level={level}&sort_by=total_score|created_at&limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": RiskScoreResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

## Risk Score Summary
```
GET /governance/risk-scores/summary
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "total_users": number,
  "low_count": number,
  "medium_count": number,
  "high_count": number,
  "critical_count": number,
  "average_score": number
}
```

## Get User Risk Score
```
GET /governance/users/{userId}/risk-score
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200: RiskScoreResponse
```

## Get User Risk Score History
```
GET /governance/users/{userId}/risk-score/history?start_date={date}&end_date={date}&limit={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "user_id": "UUID",
  "current_score": number,
  "score_30d_ago?": number,
  "score_60d_ago?": number,
  "score_90d_ago?": number,
  "change_30d?": number,
  "change_60d?": number,
  "change_90d?": number,
  "direction": "increasing|stable|decreasing",
  "history_entries": [
    {
      "snapshot_date": "date",
      "score": number,
      "risk_level": "low|medium|high|critical"
    }
  ]
}
```

## Risk Alerts Summary
```
GET /governance/risk-alerts/summary
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "total_alerts": number,
  "unread_count": number,
  "by_severity": {
    "low": number,
    "medium": number,
    "high": number,
    "critical": number
  }
}
```

## List Risk Alerts
```
GET /governance/risk-alerts?limit={n}&offset={n}
Authorization: Bearer {token}
X-Tenant-ID: {tenantId}

Response 200:
{
  "items": RiskAlertResponse[],
  "total": number,
  "limit": number,
  "offset": number
}
```

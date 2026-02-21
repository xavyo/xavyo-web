# NHI Enhanced Certifications API Contract

## POST /governance/nhis/certification/campaigns
Create a certification campaign.
- Body: `{ name: string, description?: string, scope: string, nhi_type_filter?: string, due_date?: string }`
- Response 201: `NhiCertCampaign`

## GET /governance/nhis/certification/campaigns
List certification campaigns.
- Query: `status?`, `limit?`, `offset?`
- Response 200: `{ items: NhiCertCampaign[], total: number }`

## GET /governance/nhis/certification/campaigns/{campaign_id}
Get campaign detail.
- Response 200: `NhiCertCampaign`

## POST /governance/nhis/certification/campaigns/{campaign_id}/launch
Launch a draft campaign.
- Response 200: `NhiCertCampaign`

## POST /governance/nhis/certification/campaigns/{campaign_id}/cancel
Cancel an active campaign.
- Response 200: `NhiCertCampaign`

## GET /governance/nhis/certification/campaigns/{campaign_id}/summary
Get campaign summary stats.
- Response 200: `NhiCertCampaignSummary`

## GET /governance/nhis/certification/campaigns/{campaign_id}/items
List certification items for a campaign.
- Query: `decision?`, `limit?`, `offset?`
- Response 200: `{ items: NhiCertItem[], total: number }`

## GET /governance/nhis/certification/items/{item_id}
Get certification item detail.
- Response 200: `NhiCertItem`

## POST /governance/nhis/certification/items/{item_id}/decide
Decide on a certification item.
- Body: `{ decision: 'certify' | 'revoke' | 'flag', notes?: string }`
- Response 200: `NhiCertItem`

## POST /governance/nhis/certification/items/bulk-decide
Bulk decide multiple items.
- Body: `{ item_ids: string[], decision: 'certify' | 'revoke' | 'flag', notes?: string }`
- Response 200: `{ decided: number, failed: number }`

## GET /governance/nhis/certification/my-pending
List my pending certification items.
- Query: `limit?`, `offset?`
- Response 200: `{ items: NhiCertItem[], total: number }`

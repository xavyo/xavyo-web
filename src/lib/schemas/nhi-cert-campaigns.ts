import { z } from 'zod/v3';

export const NHI_CERT_CAMPAIGN_SCOPES = ['all', 'by_type', 'specific'] as const;
export const NHI_CERT_TYPE_FILTERS = ['service_account', 'ai_agent', 'tool'] as const;
export const NHI_CERT_DECISIONS = ['certify', 'revoke', 'flag'] as const;

export const createNhiCertCampaignV2Schema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	description: z.string().optional().default(''),
	scope: z.enum(NHI_CERT_CAMPAIGN_SCOPES).default('all'),
	nhi_type_filter: z.string().optional().default(''),
	due_date: z.string().optional().default('')
});

export type CreateNhiCertCampaignV2FormData = z.infer<typeof createNhiCertCampaignV2Schema>;

export const decideNhiCertItemSchema = z.object({
	decision: z.enum(NHI_CERT_DECISIONS),
	notes: z.string().optional().default('')
});

export type DecideNhiCertItemFormData = z.infer<typeof decideNhiCertItemSchema>;

export const bulkDecideNhiCertSchema = z.object({
	item_ids: z.array(z.string().uuid()),
	decision: z.enum(NHI_CERT_DECISIONS),
	notes: z.string().optional().default('')
});

export type BulkDecideNhiCertFormData = z.infer<typeof bulkDecideNhiCertSchema>;

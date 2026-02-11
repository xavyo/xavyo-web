import { z } from 'zod/v3';

export const NHI_SOD_ENFORCEMENTS = ['prevent', 'warn'] as const;
export const NHI_CERT_SCOPES = ['all', 'by_type', 'specific'] as const;
export const NHI_TYPE_FILTERS = ['tool', 'agent', 'service_account'] as const;

const uuidField = (label: string) =>
	z.string().superRefine((val, ctx) => {
		if (val.length === 0) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} is required` });
			return z.NEVER;
		}
		if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
			ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${label} must be a valid UUID` });
		}
	});

export const createNhiSodRuleSchema = z.object({
	tool_id_a: uuidField('Tool A'),
	tool_id_b: uuidField('Tool B'),
	enforcement: z.enum(NHI_SOD_ENFORCEMENTS, {
		errorMap: () => ({ message: 'Enforcement level is required' })
	}),
	description: z.string().max(1000).optional()
});

export const gracePeriodSchema = z.object({
	grace_days: z.coerce.number().int().min(1, 'Minimum 1 day').max(365, 'Maximum 365 days')
});

export const createNhiCertCampaignSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	description: z.string().max(1000).optional(),
	scope: z.enum(NHI_CERT_SCOPES).optional().default('all'),
	nhi_type_filter: z.enum(NHI_TYPE_FILTERS).optional(),
	due_date: z.string().optional()
});

export const nhiSodCheckSchema = z.object({
	agent_id: uuidField('Agent ID'),
	tool_id: uuidField('Tool ID')
});

export type CreateNhiSodRuleSchema = typeof createNhiSodRuleSchema;
export type GracePeriodSchema = typeof gracePeriodSchema;
export type CreateNhiCertCampaignSchema = typeof createNhiCertCampaignSchema;
export type NhiSodCheckSchema = typeof nhiSodCheckSchema;

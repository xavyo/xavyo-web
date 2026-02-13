import { z } from 'zod/v3';

export const BILLING_PERIODS = ['monthly', 'annual', 'perpetual'] as const;
export const LICENSE_TYPES = ['named', 'concurrent'] as const;
export const EXPIRATION_POLICIES = ['block_new', 'revoke_all', 'warn_only'] as const;
export const ASSIGNMENT_SOURCES = ['manual', 'automatic', 'entitlement'] as const;
export const TRIGGER_TYPES = ['inactivity', 'lifecycle_state'] as const;

// 1. Create Pool
export const createPoolSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	vendor: z.string().min(1, 'Vendor is required').max(255),
	description: z.string().optional(),
	total_capacity: z.coerce.number().int('Must be an integer').min(0, 'Must be non-negative'),
	cost_per_license: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().min(0, 'Must be non-negative').optional()
	),
	currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
	billing_period: z.enum(BILLING_PERIODS),
	license_type: z.enum(LICENSE_TYPES).default('named'),
	expiration_date: z.string().optional(),
	expiration_policy: z.enum(EXPIRATION_POLICIES).default('block_new'),
	warning_days: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().int('Must be an integer').min(1).max(365).default(60)
	)
});

// 2. Update Pool — all fields optional
export const updatePoolSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255).optional(),
	vendor: z.string().min(1, 'Vendor is required').max(255).optional(),
	description: z.string().optional(),
	total_capacity: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().int('Must be an integer').min(0, 'Must be non-negative').optional()
	),
	cost_per_license: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().min(0, 'Must be non-negative').optional()
	),
	currency: z.string().length(3, 'Currency must be 3 characters').optional(),
	billing_period: z.enum(BILLING_PERIODS).optional(),
	license_type: z.enum(LICENSE_TYPES).optional(),
	expiration_date: z.string().optional(),
	expiration_policy: z.enum(EXPIRATION_POLICIES).optional(),
	warning_days: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().int('Must be an integer').min(1).max(365).optional()
	)
});

// 3. Assign License
export const assignLicenseSchema = z.object({
	license_pool_id: z.string().uuid('Must be a valid UUID'),
	user_id: z.string().uuid('Must be a valid UUID'),
	source: z.enum(ASSIGNMENT_SOURCES).default('manual'),
	notes: z.string().optional()
});

// 4. Bulk Assign — user_ids as textarea (one per line)
export const bulkAssignSchema = z.object({
	license_pool_id: z.string().uuid('Must be a valid UUID'),
	user_ids: z.string().min(1, 'At least one user ID is required'),
	source: z.enum(ASSIGNMENT_SOURCES).default('manual')
});

// 5. Bulk Reclaim — assignment_ids as textarea
export const bulkReclaimSchema = z.object({
	license_pool_id: z.string().uuid('Must be a valid UUID'),
	assignment_ids: z.string().min(1, 'At least one assignment ID is required'),
	reason: z.string().min(1, 'Reason is required')
});

// 6. Create Reclamation Rule
export const createReclamationRuleSchema = z.object({
	license_pool_id: z.string().uuid('Must be a valid UUID'),
	trigger_type: z.enum(TRIGGER_TYPES),
	threshold_days: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().int('Must be an integer').positive('Must be a positive integer').optional()
	),
	lifecycle_state: z.string().optional(),
	notification_days_before: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().int('Must be an integer').min(0).max(365).default(7)
	)
});

// 7. Update Reclamation Rule — partial fields
export const updateReclamationRuleSchema = z.object({
	threshold_days: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().int('Must be an integer').positive('Must be a positive integer').optional()
	),
	lifecycle_state: z.string().optional(),
	notification_days_before: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().int('Must be an integer').min(0).max(365).optional()
	),
	enabled: z.preprocess(
		(v) => {
			if (v === 'true') return true;
			if (v === 'false') return false;
			return v;
		},
		z.boolean().optional()
	)
});

// 8. Create Incompatibility
export const createIncompatibilitySchema = z.object({
	pool_a_id: z.string().uuid('Must be a valid UUID'),
	pool_b_id: z.string().uuid('Must be a valid UUID'),
	reason: z.string().min(1, 'Reason is required')
});

// 9. Create Entitlement Link
export const createEntitlementLinkSchema = z.object({
	license_pool_id: z.string().uuid('Must be a valid UUID'),
	entitlement_id: z.string().uuid('Must be a valid UUID'),
	priority: z.preprocess(
		(v) => (v === '' || v === undefined || v === null ? undefined : v),
		z.coerce.number().int('Must be an integer').min(0, 'Must be non-negative').default(0)
	)
});

// 10. Compliance Report
export const complianceReportSchema = z.object({
	vendor: z.string().optional(),
	from_date: z.string().optional(),
	to_date: z.string().optional()
});

// Schema types for Superforms
export type CreatePoolSchema = typeof createPoolSchema;
export type UpdatePoolSchema = typeof updatePoolSchema;
export type AssignLicenseSchema = typeof assignLicenseSchema;
export type BulkAssignSchema = typeof bulkAssignSchema;
export type BulkReclaimSchema = typeof bulkReclaimSchema;
export type CreateReclamationRuleSchema = typeof createReclamationRuleSchema;
export type UpdateReclamationRuleSchema = typeof updateReclamationRuleSchema;
export type CreateIncompatibilitySchema = typeof createIncompatibilitySchema;
export type CreateEntitlementLinkSchema = typeof createEntitlementLinkSchema;
export type ComplianceReportSchema = typeof complianceReportSchema;

// Inferred input types
export type CreatePoolInput = z.infer<typeof createPoolSchema>;
export type UpdatePoolInput = z.infer<typeof updatePoolSchema>;
export type AssignLicenseInput = z.infer<typeof assignLicenseSchema>;
export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;
export type BulkReclaimInput = z.infer<typeof bulkReclaimSchema>;
export type CreateReclamationRuleInput = z.infer<typeof createReclamationRuleSchema>;
export type UpdateReclamationRuleInput = z.infer<typeof updateReclamationRuleSchema>;
export type CreateIncompatibilityInput = z.infer<typeof createIncompatibilitySchema>;
export type CreateEntitlementLinkInput = z.infer<typeof createEntitlementLinkSchema>;
export type ComplianceReportInput = z.infer<typeof complianceReportSchema>;

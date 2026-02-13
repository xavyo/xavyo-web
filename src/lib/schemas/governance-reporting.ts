import { z } from 'zod/v3';

export const REPORT_TEMPLATE_TYPES = [
	'access_review',
	'sod_violations',
	'certification_status',
	'user_access',
	'audit_trail'
] as const;

export const COMPLIANCE_STANDARDS = ['sox', 'gdpr', 'hipaa', 'custom'] as const;

export const OUTPUT_FORMATS = ['json', 'csv'] as const;

export const SCHEDULE_FREQUENCIES = ['daily', 'weekly', 'monthly'] as const;

const templateDefinitionSchema = z.object({
	data_sources: z.array(z.string().min(1)).min(1, 'At least one data source required'),
	filters: z.array(
		z.object({
			field: z.string().min(1),
			type: z.string().min(1),
			required: z.boolean(),
			options: z.record(z.unknown()).nullable().optional(),
			default: z.unknown().nullable().optional()
		})
	),
	columns: z.array(
		z.object({
			field: z.string().min(1),
			label: z.string().min(1),
			sortable: z.boolean()
		})
	),
	grouping: z.array(z.string()),
	default_sort: z
		.object({
			field: z.string().min(1),
			direction: z.string().min(1)
		})
		.nullable()
		.optional()
});

export const createTemplateSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	description: z.string().max(1000).optional(),
	template_type: z.enum(REPORT_TEMPLATE_TYPES, {
		errorMap: () => ({ message: 'Template type is required' })
	}),
	compliance_standard: z.enum(COMPLIANCE_STANDARDS).optional(),
	definition: templateDefinitionSchema
});

export const updateTemplateSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	description: z.string().max(1000).optional(),
	definition: templateDefinitionSchema.optional()
});

export const cloneTemplateSchema = z.object({
	name: z.string().min(1, 'Name is required').max(200),
	description: z.string().max(1000).optional()
});

export const generateReportSchema = z.object({
	template_id: z.string().uuid('Template is required'),
	name: z.string().max(200).optional(),
	parameters: z.string().optional(),
	output_format: z.enum(OUTPUT_FORMATS, {
		errorMap: () => ({ message: 'Output format is required' })
	})
});

export const createScheduleSchema = z
	.object({
		template_id: z.string().uuid('Template is required'),
		name: z.string().min(1, 'Name is required').max(200),
		frequency: z.enum(SCHEDULE_FREQUENCIES, {
			errorMap: () => ({ message: 'Frequency is required' })
		}),
		schedule_hour: z.coerce
			.number()
			.int()
			.min(0, 'Hour must be 0-23')
			.max(23, 'Hour must be 0-23'),
		schedule_day_of_week: z.preprocess(
			(v) => (v === '' || v === null || v === undefined ? undefined : v),
			z.coerce.number().int().min(0).max(6).optional()
		),
		schedule_day_of_month: z.preprocess(
			(v) => (v === '' || v === null || v === undefined ? undefined : v),
			z.coerce.number().int().min(1).max(31).optional()
		),
		recipients: z.string().min(1, 'At least one recipient is required'),
		output_format: z.enum(OUTPUT_FORMATS, {
			errorMap: () => ({ message: 'Output format is required' })
		})
	})
	.refine(
		(data) => {
			if (data.frequency === 'weekly' && data.schedule_day_of_week === undefined) return false;
			return true;
		},
		{ message: 'Day of week is required for weekly schedules', path: ['schedule_day_of_week'] }
	)
	.refine(
		(data) => {
			if (data.frequency === 'monthly' && data.schedule_day_of_month === undefined) return false;
			return true;
		},
		{
			message: 'Day of month is required for monthly schedules',
			path: ['schedule_day_of_month']
		}
	);

export const updateScheduleSchema = z.object({
	name: z.string().min(1).max(200).optional(),
	frequency: z.enum(SCHEDULE_FREQUENCIES).optional(),
	schedule_hour: z.coerce.number().int().min(0).max(23).optional(),
	schedule_day_of_week: z.preprocess(
		(v) => (v === '' || v === null || v === undefined ? undefined : v),
		z.coerce.number().int().min(0).max(6).nullable().optional()
	),
	schedule_day_of_month: z.preprocess(
		(v) => (v === '' || v === null || v === undefined ? undefined : v),
		z.coerce.number().int().min(1).max(31).nullable().optional()
	),
	recipients: z.string().optional(),
	output_format: z.enum(OUTPUT_FORMATS).optional()
});

import { z } from 'zod/v3';

const destinationTypes = ['syslog_tcp_tls', 'syslog_udp', 'webhook', 'splunk_hec'] as const;
const exportFormats = ['cef', 'syslog_rfc5424', 'json', 'csv'] as const;
const eventCategories = [
	'authentication',
	'user_lifecycle',
	'group_changes',
	'access_requests',
	'provisioning',
	'administrative',
	'security',
	'entitlement',
	'sod_violation'
] as const;

export const createSiemDestinationSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
	destination_type: z.enum(destinationTypes, { errorMap: () => ({ message: 'Invalid destination type' }) }),
	endpoint_host: z.string().min(1, 'Host is required').max(512),
	endpoint_port: z.coerce.number().int().min(1).max(65535).optional(),
	export_format: z.enum(exportFormats, { errorMap: () => ({ message: 'Invalid export format' }) }),
	event_type_filter: z.array(z.enum(eventCategories)).default([]),
	rate_limit_per_second: z.coerce.number().int().min(1, 'Rate limit must be at least 1').default(1000),
	queue_buffer_size: z.coerce.number().int().min(100, 'Queue buffer must be at least 100').default(10000),
	circuit_breaker_threshold: z.coerce.number().int().min(1, 'Threshold must be at least 1').default(5),
	circuit_breaker_cooldown_secs: z.coerce.number().int().min(1, 'Cooldown must be at least 1 second').default(60),
	enabled: z.boolean().default(true),
	// Splunk-specific
	splunk_source: z.string().optional(),
	splunk_sourcetype: z.string().optional(),
	splunk_index: z.string().optional(),
	splunk_ack_enabled: z.boolean().default(false),
	// Syslog-specific
	syslog_facility: z.coerce.number().int().min(0).max(23).default(10),
	tls_verify_cert: z.boolean().default(true),
	// Auth config (base64-encoded)
	auth_config_b64: z.string().optional()
});

export const updateSiemDestinationSchema = z.object({
	name: z.string().min(1).max(255).optional(),
	endpoint_host: z.string().min(1).max(512).optional(),
	endpoint_port: z.coerce.number().int().min(1).max(65535).optional(),
	export_format: z.enum(exportFormats).optional(),
	event_type_filter: z.array(z.enum(eventCategories)).optional(),
	rate_limit_per_second: z.coerce.number().int().min(1).optional(),
	queue_buffer_size: z.coerce.number().int().min(100).optional(),
	circuit_breaker_threshold: z.coerce.number().int().min(1).optional(),
	circuit_breaker_cooldown_secs: z.coerce.number().int().min(1).optional(),
	enabled: z.boolean().optional(),
	splunk_source: z.string().optional(),
	splunk_sourcetype: z.string().optional(),
	splunk_index: z.string().optional(),
	splunk_ack_enabled: z.boolean().optional(),
	syslog_facility: z.coerce.number().int().min(0).max(23).optional(),
	tls_verify_cert: z.boolean().optional(),
	auth_config_b64: z.string().optional()
});

export const createSiemExportSchema = z
	.object({
		date_range_start: z.string().min(1, 'Start date is required'),
		date_range_end: z.string().min(1, 'End date is required'),
		event_type_filter: z.array(z.enum(eventCategories)).min(1, 'Select at least one event category'),
		output_format: z.enum(exportFormats, { errorMap: () => ({ message: 'Invalid output format' }) })
	})
	.refine(
		(data) => {
			const start = new Date(data.date_range_start);
			const end = new Date(data.date_range_end);
			return end > start;
		},
		{ message: 'End date must be after start date', path: ['date_range_end'] }
	)
	.refine(
		(data) => {
			const start = new Date(data.date_range_start);
			const end = new Date(data.date_range_end);
			const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
			return diffDays <= 90;
		},
		{ message: 'Date range cannot exceed 90 days', path: ['date_range_end'] }
	);

export type CreateSiemDestinationInput = z.infer<typeof createSiemDestinationSchema>;
export type UpdateSiemDestinationInput = z.infer<typeof updateSiemDestinationSchema>;
export type CreateSiemExportInput = z.infer<typeof createSiemExportSchema>;

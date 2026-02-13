import { describe, it, expect } from 'vitest';
import {
	createTemplateSchema,
	updateTemplateSchema,
	cloneTemplateSchema,
	generateReportSchema,
	createScheduleSchema,
	updateScheduleSchema
} from './governance-reporting';

const validDefinition = {
	data_sources: ['entitlements'],
	filters: [{ field: 'status', type: 'select', required: false, options: null, default: null }],
	columns: [{ field: 'name', label: 'Name', sortable: true }],
	grouping: [],
	default_sort: null
};

describe('createTemplateSchema', () => {
	it('accepts valid input', () => {
		const result = createTemplateSchema.safeParse({
			name: 'My Report',
			template_type: 'access_review',
			definition: validDefinition
		});
		expect(result.success).toBe(true);
	});

	it('accepts all optional fields', () => {
		const result = createTemplateSchema.safeParse({
			name: 'Full Report',
			description: 'A detailed report',
			template_type: 'sod_violations',
			compliance_standard: 'sox',
			definition: validDefinition
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createTemplateSchema.safeParse({
			template_type: 'access_review',
			definition: validDefinition
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid template_type', () => {
		const result = createTemplateSchema.safeParse({
			name: 'Test',
			template_type: 'invalid',
			definition: validDefinition
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty data_sources', () => {
		const result = createTemplateSchema.safeParse({
			name: 'Test',
			template_type: 'access_review',
			definition: { ...validDefinition, data_sources: [] }
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid compliance_standard', () => {
		const result = createTemplateSchema.safeParse({
			name: 'Test',
			template_type: 'access_review',
			compliance_standard: 'pci',
			definition: validDefinition
		});
		expect(result.success).toBe(false);
	});

	it('accepts all template types', () => {
		for (const tt of [
			'access_review',
			'sod_violations',
			'certification_status',
			'user_access',
			'audit_trail'
		]) {
			const result = createTemplateSchema.safeParse({
				name: 'Test',
				template_type: tt,
				definition: validDefinition
			});
			expect(result.success).toBe(true);
		}
	});

	it('accepts all compliance standards', () => {
		for (const cs of ['sox', 'gdpr', 'hipaa', 'custom']) {
			const result = createTemplateSchema.safeParse({
				name: 'Test',
				template_type: 'access_review',
				compliance_standard: cs,
				definition: validDefinition
			});
			expect(result.success).toBe(true);
		}
	});
});

describe('updateTemplateSchema', () => {
	it('accepts partial update', () => {
		const result = updateTemplateSchema.safeParse({ name: 'Updated' });
		expect(result.success).toBe(true);
	});

	it('accepts empty object', () => {
		const result = updateTemplateSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts definition update', () => {
		const result = updateTemplateSchema.safeParse({ definition: validDefinition });
		expect(result.success).toBe(true);
	});
});

describe('cloneTemplateSchema', () => {
	it('accepts valid clone', () => {
		const result = cloneTemplateSchema.safeParse({ name: 'Clone of Report' });
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = cloneTemplateSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('accepts with description', () => {
		const result = cloneTemplateSchema.safeParse({
			name: 'Clone',
			description: 'A clone'
		});
		expect(result.success).toBe(true);
	});
});

describe('generateReportSchema', () => {
	it('accepts valid generation request', () => {
		const result = generateReportSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			output_format: 'json'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID', () => {
		const result = generateReportSchema.safeParse({
			template_id: 'not-a-uuid',
			output_format: 'json'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid output format', () => {
		const result = generateReportSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			output_format: 'pdf'
		});
		expect(result.success).toBe(false);
	});

	it('accepts both output formats', () => {
		for (const fmt of ['json', 'csv']) {
			const result = generateReportSchema.safeParse({
				template_id: '550e8400-e29b-41d4-a716-446655440001',
				output_format: fmt
			});
			expect(result.success).toBe(true);
		}
	});

	it('accepts optional name and parameters', () => {
		const result = generateReportSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Q1 Report',
			parameters: '{"status": "active"}',
			output_format: 'csv'
		});
		expect(result.success).toBe(true);
	});
});

describe('createScheduleSchema', () => {
	it('accepts valid daily schedule', () => {
		const result = createScheduleSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Daily SOX',
			frequency: 'daily',
			schedule_hour: 8,
			recipients: 'admin@test.com',
			output_format: 'json'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid weekly schedule with day', () => {
		const result = createScheduleSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Weekly Audit',
			frequency: 'weekly',
			schedule_hour: 9,
			schedule_day_of_week: 1,
			recipients: 'audit@test.com',
			output_format: 'csv'
		});
		expect(result.success).toBe(true);
	});

	it('rejects weekly without day of week', () => {
		const result = createScheduleSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Weekly',
			frequency: 'weekly',
			schedule_hour: 9,
			recipients: 'test@test.com',
			output_format: 'json'
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid monthly schedule with day', () => {
		const result = createScheduleSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Monthly Compliance',
			frequency: 'monthly',
			schedule_hour: 6,
			schedule_day_of_month: 15,
			recipients: 'compliance@test.com',
			output_format: 'json'
		});
		expect(result.success).toBe(true);
	});

	it('rejects monthly without day of month', () => {
		const result = createScheduleSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Monthly',
			frequency: 'monthly',
			schedule_hour: 6,
			recipients: 'test@test.com',
			output_format: 'json'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createScheduleSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			frequency: 'daily',
			schedule_hour: 8,
			recipients: 'test@test.com',
			output_format: 'json'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing recipients', () => {
		const result = createScheduleSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Test',
			frequency: 'daily',
			schedule_hour: 8,
			recipients: '',
			output_format: 'json'
		});
		expect(result.success).toBe(false);
	});

	it('rejects hour out of range', () => {
		const result = createScheduleSchema.safeParse({
			template_id: '550e8400-e29b-41d4-a716-446655440001',
			name: 'Test',
			frequency: 'daily',
			schedule_hour: 25,
			recipients: 'test@test.com',
			output_format: 'json'
		});
		expect(result.success).toBe(false);
	});
});

describe('updateScheduleSchema', () => {
	it('accepts partial update', () => {
		const result = updateScheduleSchema.safeParse({ name: 'Updated' });
		expect(result.success).toBe(true);
	});

	it('accepts empty object', () => {
		const result = updateScheduleSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts frequency change', () => {
		const result = updateScheduleSchema.safeParse({
			frequency: 'weekly',
			schedule_day_of_week: 3
		});
		expect(result.success).toBe(true);
	});
});

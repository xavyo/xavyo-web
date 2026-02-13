import { describe, it, expect } from 'vitest';
import {
	createNhiSodRuleSchema,
	gracePeriodSchema,
	createNhiCertCampaignSchema,
	nhiSodCheckSchema
} from './nhi-governance';

describe('createNhiSodRuleSchema', () => {
	it('accepts valid input with all required fields', () => {
		const result = createNhiSodRuleSchema.safeParse({
			tool_id_a: '550e8400-e29b-41d4-a716-446655440001',
			tool_id_b: '550e8400-e29b-41d4-a716-446655440002',
			enforcement: 'prevent'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with optional description', () => {
		const result = createNhiSodRuleSchema.safeParse({
			tool_id_a: '550e8400-e29b-41d4-a716-446655440001',
			tool_id_b: '550e8400-e29b-41d4-a716-446655440002',
			enforcement: 'warn',
			description: 'These tools conflict'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing tool_id_a', () => {
		const result = createNhiSodRuleSchema.safeParse({
			tool_id_b: '550e8400-e29b-41d4-a716-446655440002',
			enforcement: 'prevent'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing tool_id_b', () => {
		const result = createNhiSodRuleSchema.safeParse({
			tool_id_a: '550e8400-e29b-41d4-a716-446655440001',
			enforcement: 'prevent'
		});
		expect(result.success).toBe(false);
	});

	it('rejects non-uuid tool_id_a with UUID error', () => {
		const result = createNhiSodRuleSchema.safeParse({
			tool_id_a: 'not-a-uuid',
			tool_id_b: '550e8400-e29b-41d4-a716-446655440002',
			enforcement: 'prevent'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const msg = result.error.issues[0].message;
			expect(msg).toBe('Tool A must be a valid UUID');
		}
	});

	it('rejects empty tool_id_a with only required error (no UUID error)', () => {
		const result = createNhiSodRuleSchema.safeParse({
			tool_id_a: '',
			tool_id_b: '550e8400-e29b-41d4-a716-446655440002',
			enforcement: 'prevent'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const toolAIssues = result.error.issues.filter((i) => i.path.includes('tool_id_a'));
			expect(toolAIssues).toHaveLength(1);
			expect(toolAIssues[0].message).toBe('Tool A is required');
		}
	});

	it('rejects missing enforcement', () => {
		const result = createNhiSodRuleSchema.safeParse({
			tool_id_a: '550e8400-e29b-41d4-a716-446655440001',
			tool_id_b: '550e8400-e29b-41d4-a716-446655440002'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid enforcement value', () => {
		const result = createNhiSodRuleSchema.safeParse({
			tool_id_a: '550e8400-e29b-41d4-a716-446655440001',
			tool_id_b: '550e8400-e29b-41d4-a716-446655440002',
			enforcement: 'block'
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 1000 chars', () => {
		const result = createNhiSodRuleSchema.safeParse({
			tool_id_a: '550e8400-e29b-41d4-a716-446655440001',
			tool_id_b: '550e8400-e29b-41d4-a716-446655440002',
			enforcement: 'prevent',
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});
});

describe('gracePeriodSchema', () => {
	it('accepts valid grace_days', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 30 });
		expect(result.success).toBe(true);
	});

	it('accepts minimum of 1 day', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 1 });
		expect(result.success).toBe(true);
	});

	it('accepts maximum of 365 days', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 365 });
		expect(result.success).toBe(true);
	});

	it('rejects 0 days', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 0 });
		expect(result.success).toBe(false);
	});

	it('rejects negative days', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: -5 });
		expect(result.success).toBe(false);
	});

	it('rejects over 365 days', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 366 });
		expect(result.success).toBe(false);
	});

	it('coerces string to number', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: '30' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.grace_days).toBe(30);
		}
	});

	it('rejects non-integer', () => {
		const result = gracePeriodSchema.safeParse({ grace_days: 30.5 });
		expect(result.success).toBe(false);
	});
});

describe('createNhiCertCampaignSchema', () => {
	it('accepts valid input with required fields', () => {
		const result = createNhiCertCampaignSchema.safeParse({
			name: 'Q1 2026 NHI Cert'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createNhiCertCampaignSchema.safeParse({
			name: 'Q1 2026 NHI Cert',
			description: 'Quarterly certification',
			scope: 'by_type',
			nhi_type_filter: 'agent',
			due_date: '2026-03-31'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createNhiCertCampaignSchema.safeParse({
			scope: 'all'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createNhiCertCampaignSchema.safeParse({
			name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createNhiCertCampaignSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid scope', () => {
		const result = createNhiCertCampaignSchema.safeParse({
			name: 'Test',
			scope: 'invalid_scope'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid nhi_type_filter', () => {
		const result = createNhiCertCampaignSchema.safeParse({
			name: 'Test',
			nhi_type_filter: 'invalid_type'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid scope values', () => {
		for (const scope of ['all', 'by_type', 'specific']) {
			const result = createNhiCertCampaignSchema.safeParse({ name: 'Test', scope });
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid nhi_type_filter values', () => {
		for (const filter of ['tool', 'agent', 'service_account']) {
			const result = createNhiCertCampaignSchema.safeParse({ name: 'Test', nhi_type_filter: filter });
			expect(result.success).toBe(true);
		}
	});
});

describe('nhiSodCheckSchema', () => {
	it('accepts valid agent_id and tool_id', () => {
		const result = nhiSodCheckSchema.safeParse({
			agent_id: '550e8400-e29b-41d4-a716-446655440001',
			tool_id: '550e8400-e29b-41d4-a716-446655440002'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing agent_id', () => {
		const result = nhiSodCheckSchema.safeParse({
			tool_id: '550e8400-e29b-41d4-a716-446655440002'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing tool_id', () => {
		const result = nhiSodCheckSchema.safeParse({
			agent_id: '550e8400-e29b-41d4-a716-446655440001'
		});
		expect(result.success).toBe(false);
	});

	it('rejects non-uuid agent_id', () => {
		const result = nhiSodCheckSchema.safeParse({
			agent_id: 'not-a-uuid',
			tool_id: '550e8400-e29b-41d4-a716-446655440002'
		});
		expect(result.success).toBe(false);
	});

	it('rejects non-uuid tool_id', () => {
		const result = nhiSodCheckSchema.safeParse({
			agent_id: '550e8400-e29b-41d4-a716-446655440001',
			tool_id: 'not-a-uuid'
		});
		expect(result.success).toBe(false);
	});
});

import { describe, it, expect } from 'vitest';
import {
	createNhiCertCampaignV2Schema,
	decideNhiCertItemSchema,
	bulkDecideNhiCertSchema
} from './nhi-cert-campaigns';

describe('createNhiCertCampaignV2Schema', () => {
	it('accepts valid input with required fields only', () => {
		const result = createNhiCertCampaignV2Schema.safeParse({
			name: 'Q1 2026 NHI Certification'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Q1 2026 NHI Certification');
			expect(result.data.scope).toBe('all');
			expect(result.data.description).toBe('');
		}
	});

	it('accepts valid input with all optional fields', () => {
		const result = createNhiCertCampaignV2Schema.safeParse({
			name: 'Q1 2026 NHI Certification',
			description: 'Quarterly NHI certification campaign',
			scope: 'by_type',
			nhi_type_filter: 'service_account',
			due_date: '2026-03-31'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.scope).toBe('by_type');
			expect(result.data.nhi_type_filter).toBe('service_account');
		}
	});

	it('rejects missing name', () => {
		const result = createNhiCertCampaignV2Schema.safeParse({
			scope: 'all'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createNhiCertCampaignV2Schema.safeParse({
			name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 200 characters', () => {
		const result = createNhiCertCampaignV2Schema.safeParse({
			name: 'x'.repeat(201)
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid scope values', () => {
		for (const scope of ['all', 'by_type', 'specific']) {
			const result = createNhiCertCampaignV2Schema.safeParse({ name: 'Test', scope });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid scope value', () => {
		const result = createNhiCertCampaignV2Schema.safeParse({
			name: 'Test',
			scope: 'invalid_scope'
		});
		expect(result.success).toBe(false);
	});

	it('defaults scope to all when omitted', () => {
		const result = createNhiCertCampaignV2Schema.safeParse({
			name: 'Test'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.scope).toBe('all');
		}
	});
});

describe('decideNhiCertItemSchema', () => {
	it('accepts certify decision', () => {
		const result = decideNhiCertItemSchema.safeParse({
			decision: 'certify'
		});
		expect(result.success).toBe(true);
	});

	it('accepts revoke decision', () => {
		const result = decideNhiCertItemSchema.safeParse({
			decision: 'revoke'
		});
		expect(result.success).toBe(true);
	});

	it('accepts flag decision', () => {
		const result = decideNhiCertItemSchema.safeParse({
			decision: 'flag'
		});
		expect(result.success).toBe(true);
	});

	it('accepts decision with optional notes', () => {
		const result = decideNhiCertItemSchema.safeParse({
			decision: 'certify',
			notes: 'Reviewed and approved'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notes).toBe('Reviewed and approved');
		}
	});

	it('defaults notes to empty string when omitted', () => {
		const result = decideNhiCertItemSchema.safeParse({
			decision: 'certify'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notes).toBe('');
		}
	});

	it('rejects invalid decision value', () => {
		const result = decideNhiCertItemSchema.safeParse({
			decision: 'approve'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing decision', () => {
		const result = decideNhiCertItemSchema.safeParse({
			notes: 'Some notes'
		});
		expect(result.success).toBe(false);
	});
});

describe('bulkDecideNhiCertSchema', () => {
	it('accepts valid input with item_ids array', () => {
		const result = bulkDecideNhiCertSchema.safeParse({
			item_ids: [
				'550e8400-e29b-41d4-a716-446655440001',
				'550e8400-e29b-41d4-a716-446655440002'
			],
			decision: 'certify'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with notes', () => {
		const result = bulkDecideNhiCertSchema.safeParse({
			item_ids: ['550e8400-e29b-41d4-a716-446655440001'],
			decision: 'revoke',
			notes: 'Bulk revocation'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notes).toBe('Bulk revocation');
		}
	});

	it('accepts empty item_ids array', () => {
		const result = bulkDecideNhiCertSchema.safeParse({
			item_ids: [],
			decision: 'certify'
		});
		expect(result.success).toBe(true);
	});

	it('rejects non-uuid item_ids', () => {
		const result = bulkDecideNhiCertSchema.safeParse({
			item_ids: ['not-a-uuid'],
			decision: 'certify'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing item_ids', () => {
		const result = bulkDecideNhiCertSchema.safeParse({
			decision: 'certify'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid decision in bulk', () => {
		const result = bulkDecideNhiCertSchema.safeParse({
			item_ids: ['550e8400-e29b-41d4-a716-446655440001'],
			decision: 'deny'
		});
		expect(result.success).toBe(false);
	});
});

import { describe, it, expect } from 'vitest';
import {
	createEntitlementSchema,
	updateEntitlementSchema,
	createSodRuleSchema,
	createCampaignSchema,
	createAccessRequestSchema,
	approveRequestSchema,
	rejectRequestSchema,
	certificationDecisionSchema
} from './governance';

describe('createEntitlementSchema', () => {
	const validAppId = '00000000-0000-0000-0000-000000000001';

	it('accepts valid input with required fields only', () => {
		const result = createEntitlementSchema.safeParse({
			application_id: validAppId,
			name: 'View Financial Reports',
			risk_level: 'high',
			data_protection_classification: 'sensitive'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createEntitlementSchema.safeParse({
			application_id: validAppId,
			name: 'View Financial Reports',
			description: 'Grants read access to financial reporting dashboards',
			risk_level: 'high',
			data_protection_classification: 'sensitive',
			legal_basis: 'legitimate_interest',
			is_delegable: false,
			retention_period_days: 365,
			data_controller: 'Finance Department',
			data_processor: 'Acme Corp',
			purposes: 'financial-reporting,compliance'
		});
		expect(result.success).toBe(true);
	});

	it('defaults is_delegable to true when omitted', () => {
		const result = createEntitlementSchema.safeParse({
			application_id: validAppId,
			name: 'Test',
			risk_level: 'low',
			data_protection_classification: 'none'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.is_delegable).toBe(true);
		}
	});

	it('rejects missing name', () => {
		const result = createEntitlementSchema.safeParse({
			risk_level: 'low',
			data_protection_classification: 'none'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createEntitlementSchema.safeParse({
			name: '',
			risk_level: 'low',
			data_protection_classification: 'none'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'x'.repeat(256),
			risk_level: 'low',
			data_protection_classification: 'none'
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 2000 chars', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'Test',
			risk_level: 'low',
			data_protection_classification: 'none',
			description: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing risk_level', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'Test',
			data_protection_classification: 'none'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid risk_level', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'Test',
			risk_level: 'extreme',
			data_protection_classification: 'none'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid risk_level values', () => {
		for (const level of ['low', 'medium', 'high', 'critical']) {
			const result = createEntitlementSchema.safeParse({
				application_id: validAppId,
				name: 'Test',
				risk_level: level,
				data_protection_classification: 'none'
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects missing data_protection_classification', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'Test',
			risk_level: 'low'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid data_protection_classification', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'Test',
			risk_level: 'low',
			data_protection_classification: 'top_secret'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid data_protection_classification values', () => {
		for (const cls of ['none', 'personal', 'sensitive', 'special_category']) {
			const result = createEntitlementSchema.safeParse({
				application_id: validAppId,
				name: 'Test',
				risk_level: 'low',
				data_protection_classification: cls
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid legal_basis', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'Test',
			risk_level: 'low',
			data_protection_classification: 'none',
			legal_basis: 'because_i_said_so'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid legal_basis values', () => {
		for (const basis of [
			'consent',
			'contract',
			'legal_obligation',
			'vital_interest',
			'public_task',
			'legitimate_interest'
		]) {
			const result = createEntitlementSchema.safeParse({
				application_id: validAppId,
				name: 'Test',
				risk_level: 'low',
				data_protection_classification: 'none',
				legal_basis: basis
			});
			expect(result.success).toBe(true);
		}
	});

	it('coerces retention_period_days from string to number', () => {
		const result = createEntitlementSchema.safeParse({
			application_id: validAppId,
			name: 'Test',
			risk_level: 'low',
			data_protection_classification: 'none',
			retention_period_days: '90'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.retention_period_days).toBe(90);
		}
	});

	it('rejects retention_period_days less than 1', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'Test',
			risk_level: 'low',
			data_protection_classification: 'none',
			retention_period_days: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects data_controller over 500 chars', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'Test',
			risk_level: 'low',
			data_protection_classification: 'none',
			data_controller: 'x'.repeat(501)
		});
		expect(result.success).toBe(false);
	});

	it('rejects data_processor over 500 chars', () => {
		const result = createEntitlementSchema.safeParse({
			name: 'Test',
			risk_level: 'low',
			data_protection_classification: 'none',
			data_processor: 'x'.repeat(501)
		});
		expect(result.success).toBe(false);
	});
});

describe('updateEntitlementSchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateEntitlementSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update', () => {
		const result = updateEntitlementSchema.safeParse({
			name: 'Updated Name',
			risk_level: 'critical'
		});
		expect(result.success).toBe(true);
	});

	it('rejects name over 255 chars', () => {
		const result = updateEntitlementSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid risk_level', () => {
		const result = updateEntitlementSchema.safeParse({
			risk_level: 'extreme'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid data_protection_classification', () => {
		const result = updateEntitlementSchema.safeParse({
			data_protection_classification: 'top_secret'
		});
		expect(result.success).toBe(false);
	});
});

describe('createSodRuleSchema', () => {
	const validUuid1 = '550e8400-e29b-41d4-a716-446655440000';
	const validUuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

	it('accepts valid input with required fields', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Payment Approval Conflict',
			first_entitlement_id: validUuid1,
			second_entitlement_id: validUuid2,
			severity: 'high'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Payment Approval Conflict',
			description: 'Users should not both create and approve payments',
			first_entitlement_id: validUuid1,
			second_entitlement_id: validUuid2,
			severity: 'critical',
			business_rationale: 'Prevents fraud via segregation of payment duties'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createSodRuleSchema.safeParse({
			first_entitlement_id: validUuid1,
			second_entitlement_id: validUuid2,
			severity: 'high'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'x'.repeat(256),
			first_entitlement_id: validUuid1,
			second_entitlement_id: validUuid2,
			severity: 'high'
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 1000 chars', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Test',
			first_entitlement_id: validUuid1,
			second_entitlement_id: validUuid2,
			severity: 'low',
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing first_entitlement_id', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Test',
			second_entitlement_id: validUuid2,
			severity: 'high'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid first_entitlement_id (not UUID)', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Test',
			first_entitlement_id: 'not-a-uuid',
			second_entitlement_id: validUuid2,
			severity: 'high'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing second_entitlement_id', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Test',
			first_entitlement_id: validUuid1,
			severity: 'high'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid second_entitlement_id (not UUID)', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Test',
			first_entitlement_id: validUuid1,
			second_entitlement_id: 'not-a-uuid',
			severity: 'high'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing severity', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Test',
			first_entitlement_id: validUuid1,
			second_entitlement_id: validUuid2
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid severity', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Test',
			first_entitlement_id: validUuid1,
			second_entitlement_id: validUuid2,
			severity: 'extreme'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid severity values', () => {
		for (const sev of ['low', 'medium', 'high', 'critical']) {
			const result = createSodRuleSchema.safeParse({
				name: 'Test',
				first_entitlement_id: validUuid1,
				second_entitlement_id: validUuid2,
				severity: sev
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects business_rationale over 2000 chars', () => {
		const result = createSodRuleSchema.safeParse({
			name: 'Test',
			first_entitlement_id: validUuid1,
			second_entitlement_id: validUuid2,
			severity: 'low',
			business_rationale: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});
});

describe('createCampaignSchema', () => {
	it('accepts valid input with required fields', () => {
		const result = createCampaignSchema.safeParse({
			name: 'Q1 2026 Access Review',
			scope_type: 'all_users',
			reviewer_type: 'user_manager',
			deadline: '2026-03-31'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createCampaignSchema.safeParse({
			name: 'Q1 2026 Access Review',
			description: 'Quarterly access certification for all users',
			scope_type: 'department',
			scope_config_department: 'Engineering',
			scope_config_application_id: '550e8400-e29b-41d4-a716-446655440000',
			scope_config_entitlement_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
			reviewer_type: 'specific_users',
			deadline: '2026-03-31T23:59:59Z'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = createCampaignSchema.safeParse({
			scope_type: 'all_users',
			reviewer_type: 'user_manager',
			deadline: '2026-03-31'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createCampaignSchema.safeParse({
			name: '',
			scope_type: 'all_users',
			reviewer_type: 'user_manager',
			deadline: '2026-03-31'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createCampaignSchema.safeParse({
			name: 'x'.repeat(256),
			scope_type: 'all_users',
			reviewer_type: 'user_manager',
			deadline: '2026-03-31'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing scope_type', () => {
		const result = createCampaignSchema.safeParse({
			name: 'Test',
			reviewer_type: 'user_manager',
			deadline: '2026-03-31'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid scope_type', () => {
		const result = createCampaignSchema.safeParse({
			name: 'Test',
			scope_type: 'some_scope',
			reviewer_type: 'user_manager',
			deadline: '2026-03-31'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid scope_type values', () => {
		for (const scope of ['all_users', 'department', 'application', 'entitlement']) {
			const result = createCampaignSchema.safeParse({
				name: 'Test',
				scope_type: scope,
				reviewer_type: 'user_manager',
				deadline: '2026-03-31'
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects missing reviewer_type', () => {
		const result = createCampaignSchema.safeParse({
			name: 'Test',
			scope_type: 'all_users',
			deadline: '2026-03-31'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid reviewer_type', () => {
		const result = createCampaignSchema.safeParse({
			name: 'Test',
			scope_type: 'all_users',
			reviewer_type: 'random_person',
			deadline: '2026-03-31'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid reviewer_type values', () => {
		for (const reviewer of [
			'user_manager',
			'application_owner',
			'entitlement_owner',
			'specific_users'
		]) {
			const result = createCampaignSchema.safeParse({
				name: 'Test',
				scope_type: 'all_users',
				reviewer_type: reviewer,
				deadline: '2026-03-31'
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects missing deadline', () => {
		const result = createCampaignSchema.safeParse({
			name: 'Test',
			scope_type: 'all_users',
			reviewer_type: 'user_manager'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty deadline', () => {
		const result = createCampaignSchema.safeParse({
			name: 'Test',
			scope_type: 'all_users',
			reviewer_type: 'user_manager',
			deadline: ''
		});
		expect(result.success).toBe(false);
	});
});

describe('createAccessRequestSchema', () => {
	const validUuid = '550e8400-e29b-41d4-a716-446655440000';

	it('accepts valid input with required fields', () => {
		const result = createAccessRequestSchema.safeParse({
			entitlement_id: validUuid,
			justification: 'I need access to the financial reports to complete the quarterly audit review.'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with optional expiry', () => {
		const result = createAccessRequestSchema.safeParse({
			entitlement_id: validUuid,
			justification: 'I need access to the financial reports to complete the quarterly audit review.',
			requested_expires_at: '2026-06-30T23:59:59Z'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing entitlement_id', () => {
		const result = createAccessRequestSchema.safeParse({
			justification: 'I need access to the financial reports to complete the quarterly audit review.'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid entitlement_id (not UUID)', () => {
		const result = createAccessRequestSchema.safeParse({
			entitlement_id: 'not-a-uuid',
			justification: 'I need access to the financial reports to complete the quarterly audit review.'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing justification', () => {
		const result = createAccessRequestSchema.safeParse({
			entitlement_id: validUuid
		});
		expect(result.success).toBe(false);
	});

	it('rejects justification under 20 characters', () => {
		const result = createAccessRequestSchema.safeParse({
			entitlement_id: validUuid,
			justification: 'Too short'
		});
		expect(result.success).toBe(false);
	});

	it('rejects justification of exactly 19 characters', () => {
		const result = createAccessRequestSchema.safeParse({
			entitlement_id: validUuid,
			justification: 'x'.repeat(19)
		});
		expect(result.success).toBe(false);
	});

	it('accepts justification of exactly 20 characters', () => {
		const result = createAccessRequestSchema.safeParse({
			entitlement_id: validUuid,
			justification: 'x'.repeat(20)
		});
		expect(result.success).toBe(true);
	});
});

describe('approveRequestSchema', () => {
	it('accepts empty object (notes is optional)', () => {
		const result = approveRequestSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid notes', () => {
		const result = approveRequestSchema.safeParse({
			notes: 'Approved per manager request'
		});
		expect(result.success).toBe(true);
	});
});

describe('rejectRequestSchema', () => {
	it('accepts valid reason', () => {
		const result = rejectRequestSchema.safeParse({
			reason: 'Insufficient justification provided'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing reason', () => {
		const result = rejectRequestSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects empty reason', () => {
		const result = rejectRequestSchema.safeParse({
			reason: ''
		});
		expect(result.success).toBe(false);
	});
});

describe('certificationDecisionSchema', () => {
	it('accepts approved decision', () => {
		const result = certificationDecisionSchema.safeParse({
			decision: 'approved'
		});
		expect(result.success).toBe(true);
	});

	it('accepts revoked decision', () => {
		const result = certificationDecisionSchema.safeParse({
			decision: 'revoked'
		});
		expect(result.success).toBe(true);
	});

	it('accepts decision with notes', () => {
		const result = certificationDecisionSchema.safeParse({
			decision: 'approved',
			notes: 'Access still required for ongoing project'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing decision', () => {
		const result = certificationDecisionSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects invalid decision', () => {
		const result = certificationDecisionSchema.safeParse({
			decision: 'pending'
		});
		expect(result.success).toBe(false);
	});

	it('rejects notes without decision', () => {
		const result = certificationDecisionSchema.safeParse({
			notes: 'Some notes'
		});
		expect(result.success).toBe(false);
	});
});

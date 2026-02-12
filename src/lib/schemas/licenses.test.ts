import { describe, it, expect } from 'vitest';
import {
	createPoolSchema,
	updatePoolSchema,
	assignLicenseSchema,
	bulkAssignSchema,
	bulkReclaimSchema,
	createReclamationRuleSchema,
	updateReclamationRuleSchema,
	createIncompatibilitySchema,
	createEntitlementLinkSchema,
	complianceReportSchema
} from './licenses';

const validUuid1 = '550e8400-e29b-41d4-a716-446655440000';
const validUuid2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

describe('createPoolSchema', () => {
	it('accepts valid complete input', () => {
		const result = createPoolSchema.safeParse({
			name: 'Microsoft 365 E3',
			vendor: 'Microsoft',
			description: 'Enterprise license pool for M365',
			total_capacity: 500,
			cost_per_license: 32.0,
			currency: 'USD',
			billing_period: 'annual',
			license_type: 'named',
			expiration_date: '2027-01-01',
			expiration_policy: 'block_new',
			warning_days: 30
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with defaults applied', () => {
		const result = createPoolSchema.safeParse({
			name: 'Jira Cloud',
			vendor: 'Atlassian',
			total_capacity: 200,
			billing_period: 'monthly'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.currency).toBe('USD');
			expect(result.data.license_type).toBe('named');
			expect(result.data.expiration_policy).toBe('block_new');
			expect(result.data.warning_days).toBe(60);
		}
	});

	it('rejects missing name', () => {
		const result = createPoolSchema.safeParse({
			vendor: 'Microsoft',
			total_capacity: 100,
			billing_period: 'annual'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createPoolSchema.safeParse({
			name: '',
			vendor: 'Microsoft',
			total_capacity: 100,
			billing_period: 'annual'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createPoolSchema.safeParse({
			name: 'x'.repeat(256),
			vendor: 'Microsoft',
			total_capacity: 100,
			billing_period: 'annual'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing vendor', () => {
		const result = createPoolSchema.safeParse({
			name: 'Microsoft 365',
			total_capacity: 100,
			billing_period: 'annual'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty vendor', () => {
		const result = createPoolSchema.safeParse({
			name: 'Microsoft 365',
			vendor: '',
			total_capacity: 100,
			billing_period: 'annual'
		});
		expect(result.success).toBe(false);
	});

	it('rejects vendor over 255 chars', () => {
		const result = createPoolSchema.safeParse({
			name: 'Microsoft 365',
			vendor: 'x'.repeat(256),
			total_capacity: 100,
			billing_period: 'annual'
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative total_capacity', () => {
		const result = createPoolSchema.safeParse({
			name: 'Microsoft 365',
			vendor: 'Microsoft',
			total_capacity: -1,
			billing_period: 'annual'
		});
		expect(result.success).toBe(false);
	});

	it('accepts zero total_capacity', () => {
		const result = createPoolSchema.safeParse({
			name: 'Microsoft 365',
			vendor: 'Microsoft',
			total_capacity: 0,
			billing_period: 'annual'
		});
		expect(result.success).toBe(true);
	});

	it('coerces total_capacity from string to number', () => {
		const result = createPoolSchema.safeParse({
			name: 'Microsoft 365',
			vendor: 'Microsoft',
			total_capacity: '250',
			billing_period: 'annual'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.total_capacity).toBe(250);
		}
	});

	it('rejects non-integer total_capacity', () => {
		const result = createPoolSchema.safeParse({
			name: 'Microsoft 365',
			vendor: 'Microsoft',
			total_capacity: 10.5,
			billing_period: 'annual'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid billing_period', () => {
		const result = createPoolSchema.safeParse({
			name: 'Microsoft 365',
			vendor: 'Microsoft',
			total_capacity: 100,
			billing_period: 'Quarterly'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid billing_period values', () => {
		for (const period of ['monthly', 'annual', 'perpetual']) {
			const result = createPoolSchema.safeParse({
				name: 'Test',
				vendor: 'Vendor',
				total_capacity: 10,
				billing_period: period
			});
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid license_type values', () => {
		for (const type of ['named', 'concurrent']) {
			const result = createPoolSchema.safeParse({
				name: 'Test',
				vendor: 'Vendor',
				total_capacity: 10,
				billing_period: 'monthly',
				license_type: type
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid license_type', () => {
		const result = createPoolSchema.safeParse({
			name: 'Test',
			vendor: 'Vendor',
			total_capacity: 10,
			billing_period: 'monthly',
			license_type: 'Floating'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid expiration_policy values', () => {
		for (const policy of ['block_new', 'revoke_all', 'warn_only']) {
			const result = createPoolSchema.safeParse({
				name: 'Test',
				vendor: 'Vendor',
				total_capacity: 10,
				billing_period: 'monthly',
				expiration_policy: policy
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid expiration_policy', () => {
		const result = createPoolSchema.safeParse({
			name: 'Test',
			vendor: 'Vendor',
			total_capacity: 10,
			billing_period: 'monthly',
			expiration_policy: 'IgnoreAll'
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative cost_per_license', () => {
		const result = createPoolSchema.safeParse({
			name: 'Test',
			vendor: 'Vendor',
			total_capacity: 10,
			billing_period: 'monthly',
			cost_per_license: -5.99
		});
		expect(result.success).toBe(false);
	});

	it('treats empty string cost_per_license as undefined (optional)', () => {
		const result = createPoolSchema.safeParse({
			name: 'Test',
			vendor: 'Vendor',
			total_capacity: 10,
			billing_period: 'monthly',
			cost_per_license: ''
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.cost_per_license).toBeUndefined();
		}
	});

	it('rejects currency not exactly 3 characters', () => {
		const result = createPoolSchema.safeParse({
			name: 'Test',
			vendor: 'Vendor',
			total_capacity: 10,
			billing_period: 'monthly',
			currency: 'US'
		});
		expect(result.success).toBe(false);
	});

	it('rejects currency over 3 characters', () => {
		const result = createPoolSchema.safeParse({
			name: 'Test',
			vendor: 'Vendor',
			total_capacity: 10,
			billing_period: 'monthly',
			currency: 'EURO'
		});
		expect(result.success).toBe(false);
	});

	it('accepts optional fields when omitted', () => {
		const result = createPoolSchema.safeParse({
			name: 'Slack Enterprise',
			vendor: 'Slack',
			total_capacity: 50,
			billing_period: 'monthly'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeUndefined();
			expect(result.data.cost_per_license).toBeUndefined();
			expect(result.data.expiration_date).toBeUndefined();
		}
	});

	it('rejects warning_days below 1', () => {
		const result = createPoolSchema.safeParse({
			name: 'Test',
			vendor: 'Vendor',
			total_capacity: 10,
			billing_period: 'monthly',
			warning_days: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects warning_days above 365', () => {
		const result = createPoolSchema.safeParse({
			name: 'Test',
			vendor: 'Vendor',
			total_capacity: 10,
			billing_period: 'monthly',
			warning_days: 366
		});
		expect(result.success).toBe(false);
	});

	it('treats empty string warning_days as default 60', () => {
		const result = createPoolSchema.safeParse({
			name: 'Test',
			vendor: 'Vendor',
			total_capacity: 10,
			billing_period: 'monthly',
			warning_days: ''
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.warning_days).toBe(60);
		}
	});
});

describe('updatePoolSchema', () => {
	it('accepts empty object (all fields optional)', () => {
		const result = updatePoolSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid name update', () => {
		const result = updatePoolSchema.safeParse({
			name: 'Updated Pool Name'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid vendor update', () => {
		const result = updatePoolSchema.safeParse({
			vendor: 'New Vendor'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid total_capacity update', () => {
		const result = updatePoolSchema.safeParse({
			total_capacity: 750
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.total_capacity).toBe(750);
		}
	});

	it('accepts valid billing_period update', () => {
		const result = updatePoolSchema.safeParse({
			billing_period: 'perpetual'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = updatePoolSchema.safeParse({
			name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty vendor', () => {
		const result = updatePoolSchema.safeParse({
			vendor: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid billing_period', () => {
		const result = updatePoolSchema.safeParse({
			billing_period: 'BiAnnual'
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative total_capacity', () => {
		const result = updatePoolSchema.safeParse({
			total_capacity: -10
		});
		expect(result.success).toBe(false);
	});

	it('treats empty string total_capacity as undefined', () => {
		const result = updatePoolSchema.safeParse({
			total_capacity: ''
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.total_capacity).toBeUndefined();
		}
	});

	it('treats empty string cost_per_license as undefined', () => {
		const result = updatePoolSchema.safeParse({
			cost_per_license: ''
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.cost_per_license).toBeUndefined();
		}
	});

	it('rejects invalid currency length', () => {
		const result = updatePoolSchema.safeParse({
			currency: 'AB'
		});
		expect(result.success).toBe(false);
	});

	it('rejects warning_days above 365', () => {
		const result = updatePoolSchema.safeParse({
			warning_days: 400
		});
		expect(result.success).toBe(false);
	});

	it('accepts valid partial update with multiple fields', () => {
		const result = updatePoolSchema.safeParse({
			name: 'Updated Name',
			total_capacity: 1000,
			cost_per_license: 15.5,
			currency: 'EUR'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Updated Name');
			expect(result.data.total_capacity).toBe(1000);
			expect(result.data.cost_per_license).toBe(15.5);
			expect(result.data.currency).toBe('EUR');
		}
	});
});

describe('assignLicenseSchema', () => {
	it('accepts valid input with defaults', () => {
		const result = assignLicenseSchema.safeParse({
			license_pool_id: validUuid1,
			user_id: validUuid2
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.source).toBe('manual');
		}
	});

	it('accepts valid input with all fields', () => {
		const result = assignLicenseSchema.safeParse({
			license_pool_id: validUuid1,
			user_id: validUuid2,
			source: 'automatic',
			notes: 'Assigned per manager request'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.source).toBe('automatic');
			expect(result.data.notes).toBe('Assigned per manager request');
		}
	});

	it('accepts all valid source values', () => {
		for (const source of ['manual', 'automatic', 'entitlement']) {
			const result = assignLicenseSchema.safeParse({
				license_pool_id: validUuid1,
				user_id: validUuid2,
				source
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid license_pool_id', () => {
		const result = assignLicenseSchema.safeParse({
			license_pool_id: 'not-a-uuid',
			user_id: validUuid2
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid user_id', () => {
		const result = assignLicenseSchema.safeParse({
			license_pool_id: validUuid1,
			user_id: 'bad-uuid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing license_pool_id', () => {
		const result = assignLicenseSchema.safeParse({
			user_id: validUuid2
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing user_id', () => {
		const result = assignLicenseSchema.safeParse({
			license_pool_id: validUuid1
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid source', () => {
		const result = assignLicenseSchema.safeParse({
			license_pool_id: validUuid1,
			user_id: validUuid2,
			source: 'Imported'
		});
		expect(result.success).toBe(false);
	});

	it('accepts omitted notes as optional', () => {
		const result = assignLicenseSchema.safeParse({
			license_pool_id: validUuid1,
			user_id: validUuid2
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notes).toBeUndefined();
		}
	});
});

describe('bulkAssignSchema', () => {
	it('accepts valid input with user_ids string', () => {
		const result = bulkAssignSchema.safeParse({
			license_pool_id: validUuid1,
			user_ids: `${validUuid1}\n${validUuid2}`
		});
		expect(result.success).toBe(true);
	});

	it('defaults source to manual', () => {
		const result = bulkAssignSchema.safeParse({
			license_pool_id: validUuid1,
			user_ids: validUuid1
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.source).toBe('manual');
		}
	});

	it('accepts explicit source', () => {
		const result = bulkAssignSchema.safeParse({
			license_pool_id: validUuid1,
			user_ids: validUuid1,
			source: 'entitlement'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.source).toBe('entitlement');
		}
	});

	it('rejects empty user_ids', () => {
		const result = bulkAssignSchema.safeParse({
			license_pool_id: validUuid1,
			user_ids: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing user_ids', () => {
		const result = bulkAssignSchema.safeParse({
			license_pool_id: validUuid1
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid license_pool_id', () => {
		const result = bulkAssignSchema.safeParse({
			license_pool_id: 'not-a-uuid',
			user_ids: validUuid1
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid source', () => {
		const result = bulkAssignSchema.safeParse({
			license_pool_id: validUuid1,
			user_ids: validUuid1,
			source: 'BatchImport'
		});
		expect(result.success).toBe(false);
	});
});

describe('bulkReclaimSchema', () => {
	it('accepts valid input', () => {
		const result = bulkReclaimSchema.safeParse({
			license_pool_id: validUuid1,
			assignment_ids: `${validUuid1}\n${validUuid2}`,
			reason: 'Users have left the organization'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty assignment_ids', () => {
		const result = bulkReclaimSchema.safeParse({
			license_pool_id: validUuid1,
			assignment_ids: '',
			reason: 'No longer needed'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing assignment_ids', () => {
		const result = bulkReclaimSchema.safeParse({
			license_pool_id: validUuid1,
			reason: 'No longer needed'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty reason', () => {
		const result = bulkReclaimSchema.safeParse({
			license_pool_id: validUuid1,
			assignment_ids: validUuid1,
			reason: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing reason', () => {
		const result = bulkReclaimSchema.safeParse({
			license_pool_id: validUuid1,
			assignment_ids: validUuid1
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid license_pool_id', () => {
		const result = bulkReclaimSchema.safeParse({
			license_pool_id: 'bad',
			assignment_ids: validUuid1,
			reason: 'Cleanup'
		});
		expect(result.success).toBe(false);
	});
});

describe('createReclamationRuleSchema', () => {
	it('accepts valid inactivity trigger', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'inactivity',
			threshold_days: 90
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid lifecycle_state trigger', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'lifecycle_state',
			lifecycle_state: 'suspended'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'inactivity',
			threshold_days: 60,
			lifecycle_state: 'disabled',
			notification_days_before: 14
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notification_days_before).toBe(14);
		}
	});

	it('defaults notification_days_before to 7', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'inactivity',
			threshold_days: 30
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.notification_days_before).toBe(7);
		}
	});

	it('rejects invalid trigger_type', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'TimeExpired'
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid trigger_type values', () => {
		for (const trigger of ['inactivity', 'lifecycle_state']) {
			const result = createReclamationRuleSchema.safeParse({
				license_pool_id: validUuid1,
				trigger_type: trigger
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid license_pool_id', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: 'not-uuid',
			trigger_type: 'inactivity'
		});
		expect(result.success).toBe(false);
	});

	it('threshold_days is optional', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'lifecycle_state'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.threshold_days).toBeUndefined();
		}
	});

	it('treats empty string threshold_days as undefined', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'inactivity',
			threshold_days: ''
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.threshold_days).toBeUndefined();
		}
	});

	it('rejects zero threshold_days (must be positive)', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'inactivity',
			threshold_days: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative threshold_days', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'inactivity',
			threshold_days: -10
		});
		expect(result.success).toBe(false);
	});

	it('coerces threshold_days from string to number', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'inactivity',
			threshold_days: '45'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.threshold_days).toBe(45);
		}
	});

	it('rejects notification_days_before above 365', () => {
		const result = createReclamationRuleSchema.safeParse({
			license_pool_id: validUuid1,
			trigger_type: 'inactivity',
			notification_days_before: 400
		});
		expect(result.success).toBe(false);
	});
});

describe('updateReclamationRuleSchema', () => {
	it('accepts empty object (all fields optional)', () => {
		const result = updateReclamationRuleSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid threshold_days update', () => {
		const result = updateReclamationRuleSchema.safeParse({
			threshold_days: 120
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.threshold_days).toBe(120);
		}
	});

	it('accepts valid lifecycle_state update', () => {
		const result = updateReclamationRuleSchema.safeParse({
			lifecycle_state: 'terminated'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid notification_days_before update', () => {
		const result = updateReclamationRuleSchema.safeParse({
			notification_days_before: 21
		});
		expect(result.success).toBe(true);
	});

	it('accepts boolean enabled field', () => {
		const result = updateReclamationRuleSchema.safeParse({
			enabled: true
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.enabled).toBe(true);
		}
	});

	it('coerces string "true" to boolean true for enabled', () => {
		const result = updateReclamationRuleSchema.safeParse({
			enabled: 'true'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.enabled).toBe(true);
		}
	});

	it('coerces string "false" to boolean false for enabled', () => {
		const result = updateReclamationRuleSchema.safeParse({
			enabled: 'false'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.enabled).toBe(false);
		}
	});

	it('rejects non-boolean non-string enabled value', () => {
		const result = updateReclamationRuleSchema.safeParse({
			enabled: 42
		});
		expect(result.success).toBe(false);
	});

	it('treats empty string threshold_days as undefined', () => {
		const result = updateReclamationRuleSchema.safeParse({
			threshold_days: ''
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.threshold_days).toBeUndefined();
		}
	});

	it('rejects notification_days_before above 365', () => {
		const result = updateReclamationRuleSchema.safeParse({
			notification_days_before: 500
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative threshold_days', () => {
		const result = updateReclamationRuleSchema.safeParse({
			threshold_days: -5
		});
		expect(result.success).toBe(false);
	});

	it('accepts combined partial update', () => {
		const result = updateReclamationRuleSchema.safeParse({
			threshold_days: 60,
			notification_days_before: 14,
			enabled: false
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.threshold_days).toBe(60);
			expect(result.data.notification_days_before).toBe(14);
			expect(result.data.enabled).toBe(false);
		}
	});
});

describe('createIncompatibilitySchema', () => {
	it('accepts valid input', () => {
		const result = createIncompatibilitySchema.safeParse({
			pool_a_id: validUuid1,
			pool_b_id: validUuid2,
			reason: 'Overlapping enterprise licenses from competing vendors'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid pool_a_id', () => {
		const result = createIncompatibilitySchema.safeParse({
			pool_a_id: 'not-a-uuid',
			pool_b_id: validUuid2,
			reason: 'Incompatible'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid pool_b_id', () => {
		const result = createIncompatibilitySchema.safeParse({
			pool_a_id: validUuid1,
			pool_b_id: 'bad-uuid',
			reason: 'Incompatible'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing pool_a_id', () => {
		const result = createIncompatibilitySchema.safeParse({
			pool_b_id: validUuid2,
			reason: 'Incompatible'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing pool_b_id', () => {
		const result = createIncompatibilitySchema.safeParse({
			pool_a_id: validUuid1,
			reason: 'Incompatible'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty reason', () => {
		const result = createIncompatibilitySchema.safeParse({
			pool_a_id: validUuid1,
			pool_b_id: validUuid2,
			reason: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing reason', () => {
		const result = createIncompatibilitySchema.safeParse({
			pool_a_id: validUuid1,
			pool_b_id: validUuid2
		});
		expect(result.success).toBe(false);
	});
});

describe('createEntitlementLinkSchema', () => {
	it('accepts valid input with defaults', () => {
		const result = createEntitlementLinkSchema.safeParse({
			license_pool_id: validUuid1,
			entitlement_id: validUuid2
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(0);
		}
	});

	it('accepts valid input with explicit priority', () => {
		const result = createEntitlementLinkSchema.safeParse({
			license_pool_id: validUuid1,
			entitlement_id: validUuid2,
			priority: 10
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(10);
		}
	});

	it('coerces priority from string to number', () => {
		const result = createEntitlementLinkSchema.safeParse({
			license_pool_id: validUuid1,
			entitlement_id: validUuid2,
			priority: '5'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(5);
		}
	});

	it('treats empty string priority as default 0', () => {
		const result = createEntitlementLinkSchema.safeParse({
			license_pool_id: validUuid1,
			entitlement_id: validUuid2,
			priority: ''
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(0);
		}
	});

	it('rejects negative priority', () => {
		const result = createEntitlementLinkSchema.safeParse({
			license_pool_id: validUuid1,
			entitlement_id: validUuid2,
			priority: -1
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid license_pool_id', () => {
		const result = createEntitlementLinkSchema.safeParse({
			license_pool_id: 'not-uuid',
			entitlement_id: validUuid2
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid entitlement_id', () => {
		const result = createEntitlementLinkSchema.safeParse({
			license_pool_id: validUuid1,
			entitlement_id: 'not-uuid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing license_pool_id', () => {
		const result = createEntitlementLinkSchema.safeParse({
			entitlement_id: validUuid2
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing entitlement_id', () => {
		const result = createEntitlementLinkSchema.safeParse({
			license_pool_id: validUuid1
		});
		expect(result.success).toBe(false);
	});

	it('rejects non-integer priority', () => {
		const result = createEntitlementLinkSchema.safeParse({
			license_pool_id: validUuid1,
			entitlement_id: validUuid2,
			priority: 2.5
		});
		expect(result.success).toBe(false);
	});
});

describe('complianceReportSchema', () => {
	it('accepts empty object (all fields optional)', () => {
		const result = complianceReportSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts vendor only', () => {
		const result = complianceReportSchema.safeParse({
			vendor: 'Microsoft'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.vendor).toBe('Microsoft');
		}
	});

	it('accepts from_date only', () => {
		const result = complianceReportSchema.safeParse({
			from_date: '2026-01-01'
		});
		expect(result.success).toBe(true);
	});

	it('accepts to_date only', () => {
		const result = complianceReportSchema.safeParse({
			to_date: '2026-12-31'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all fields together', () => {
		const result = complianceReportSchema.safeParse({
			vendor: 'Atlassian',
			from_date: '2026-01-01',
			to_date: '2026-06-30'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.vendor).toBe('Atlassian');
			expect(result.data.from_date).toBe('2026-01-01');
			expect(result.data.to_date).toBe('2026-06-30');
		}
	});

	it('accepts date-time strings', () => {
		const result = complianceReportSchema.safeParse({
			from_date: '2026-01-01T00:00:00Z',
			to_date: '2026-12-31T23:59:59Z'
		});
		expect(result.success).toBe(true);
	});

	it('omitted fields are undefined', () => {
		const result = complianceReportSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.vendor).toBeUndefined();
			expect(result.data.from_date).toBeUndefined();
			expect(result.data.to_date).toBeUndefined();
		}
	});
});

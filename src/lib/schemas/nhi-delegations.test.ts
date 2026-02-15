import { describe, it, expect } from 'vitest';
import { createDelegationSchema } from './nhi-delegations';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440001';

describe('createDelegationSchema', () => {
	it('accepts valid input with all required fields', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: VALID_UUID,
			principal_type: 'user',
			actor_nhi_id: VALID_UUID_2
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all optional fields', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: VALID_UUID,
			principal_type: 'nhi',
			actor_nhi_id: VALID_UUID_2,
			allowed_scopes: 'read,write',
			allowed_resource_types: 'api,data',
			max_delegation_depth: 3,
			expires_at: '2026-12-31T23:59:59'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.allowed_scopes).toBe('read,write');
			expect(result.data.allowed_resource_types).toBe('api,data');
			expect(result.data.max_delegation_depth).toBe(3);
		}
	});

	it('rejects invalid principal_id UUID', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: 'not-a-uuid',
			principal_type: 'user',
			actor_nhi_id: VALID_UUID_2
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const issues = result.error.issues.filter((i) => i.path.includes('principal_id'));
			expect(issues[0].message).toBe('Must be a valid UUID');
		}
	});

	it('rejects invalid actor_nhi_id UUID', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: VALID_UUID,
			principal_type: 'user',
			actor_nhi_id: 'bad'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid principal_type', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: VALID_UUID,
			principal_type: 'group',
			actor_nhi_id: VALID_UUID_2
		});
		expect(result.success).toBe(false);
	});

	it('accepts user and nhi principal types', () => {
		for (const type of ['user', 'nhi']) {
			const result = createDelegationSchema.safeParse({
				principal_id: VALID_UUID,
				principal_type: type,
				actor_nhi_id: VALID_UUID_2
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects max_delegation_depth below 1', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: VALID_UUID,
			principal_type: 'user',
			actor_nhi_id: VALID_UUID_2,
			max_delegation_depth: 0
		});
		expect(result.success).toBe(false);
	});

	it('rejects max_delegation_depth above 5', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: VALID_UUID,
			principal_type: 'user',
			actor_nhi_id: VALID_UUID_2,
			max_delegation_depth: 6
		});
		expect(result.success).toBe(false);
	});

	it('coerces max_delegation_depth from string', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: VALID_UUID,
			principal_type: 'user',
			actor_nhi_id: VALID_UUID_2,
			max_delegation_depth: '3'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.max_delegation_depth).toBe(3);
		}
	});

	it('defaults optional fields when omitted', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: VALID_UUID,
			principal_type: 'user',
			actor_nhi_id: VALID_UUID_2
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.allowed_scopes).toBe('');
			expect(result.data.allowed_resource_types).toBe('');
			expect(result.data.expires_at).toBe('');
			expect(result.data.max_delegation_depth).toBeUndefined();
		}
	});

	it('rejects missing principal_id', () => {
		const result = createDelegationSchema.safeParse({
			principal_type: 'user',
			actor_nhi_id: VALID_UUID_2
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing actor_nhi_id', () => {
		const result = createDelegationSchema.safeParse({
			principal_id: VALID_UUID,
			principal_type: 'user'
		});
		expect(result.success).toBe(false);
	});
});

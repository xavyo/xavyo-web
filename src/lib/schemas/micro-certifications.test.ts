import { describe, it, expect } from 'vitest';
import {
	decideMicroCertificationSchema,
	delegateMicroCertificationSchema,
	skipMicroCertificationSchema,
	bulkDecisionSchema,
	manualTriggerSchema,
	createTriggerRuleSchema,
	updateTriggerRuleSchema,
	globalEventsSearchSchema
} from './micro-certifications';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_UUID_2 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
const INVALID_UUID = 'not-a-uuid';

describe('decideMicroCertificationSchema', () => {
	it('accepts valid approve decision', () => {
		const result = decideMicroCertificationSchema.safeParse({ decision: 'approve' });
		expect(result.success).toBe(true);
	});

	it('accepts valid revoke decision', () => {
		const result = decideMicroCertificationSchema.safeParse({ decision: 'revoke' });
		expect(result.success).toBe(true);
	});

	it('accepts valid decision with comment', () => {
		const result = decideMicroCertificationSchema.safeParse({
			decision: 'revoke',
			comment: 'Access no longer needed'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.comment).toBe('Access no longer needed');
		}
	});

	it('accepts reduce decision', () => {
		const result = decideMicroCertificationSchema.safeParse({ decision: 'reduce' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid decision value', () => {
		const result = decideMicroCertificationSchema.safeParse({ decision: 'certify' });
		expect(result.success).toBe(false);
	});

	it('rejects missing decision', () => {
		const result = decideMicroCertificationSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('allows omitting comment', () => {
		const result = decideMicroCertificationSchema.safeParse({ decision: 'approve' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.comment).toBeUndefined();
		}
	});

	it('rejects comment exceeding 2000 characters', () => {
		const result = decideMicroCertificationSchema.safeParse({
			decision: 'approve',
			comment: 'a'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});

	it('accepts comment at exactly 2000 characters', () => {
		const result = decideMicroCertificationSchema.safeParse({
			decision: 'approve',
			comment: 'a'.repeat(2000)
		});
		expect(result.success).toBe(true);
	});
});

describe('delegateMicroCertificationSchema', () => {
	it('accepts valid delegate_to UUID', () => {
		const result = delegateMicroCertificationSchema.safeParse({ delegate_to: VALID_UUID });
		expect(result.success).toBe(true);
	});

	it('rejects invalid delegate_to UUID', () => {
		const result = delegateMicroCertificationSchema.safeParse({ delegate_to: INVALID_UUID });
		expect(result.success).toBe(false);
	});

	it('rejects missing delegate_to', () => {
		const result = delegateMicroCertificationSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('accepts optional comment', () => {
		const result = delegateMicroCertificationSchema.safeParse({
			delegate_to: VALID_UUID,
			comment: 'Delegating to team lead'
		});
		expect(result.success).toBe(true);
	});

	it('rejects comment exceeding 2000 characters', () => {
		const result = delegateMicroCertificationSchema.safeParse({
			delegate_to: VALID_UUID,
			comment: 'x'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});
});

describe('skipMicroCertificationSchema', () => {
	it('rejects empty object (reason is required)', () => {
		const result = skipMicroCertificationSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('rejects reason shorter than 10 characters', () => {
		const result = skipMicroCertificationSchema.safeParse({ reason: 'Too short' });
		expect(result.success).toBe(false);
	});

	it('accepts reason at exactly 10 characters', () => {
		const result = skipMicroCertificationSchema.safeParse({ reason: 'A'.repeat(10) });
		expect(result.success).toBe(true);
	});

	it('accepts valid reason', () => {
		const result = skipMicroCertificationSchema.safeParse({
			reason: 'User account is being terminated, access will be removed'
		});
		expect(result.success).toBe(true);
	});

	it('rejects reason exceeding 1000 characters', () => {
		const result = skipMicroCertificationSchema.safeParse({ reason: 'z'.repeat(1001) });
		expect(result.success).toBe(false);
	});
});

describe('bulkDecisionSchema', () => {
	it('accepts valid bulk approve decision', () => {
		const result = bulkDecisionSchema.safeParse({
			certification_ids: [VALID_UUID],
			decision: 'approve'
		});
		expect(result.success).toBe(true);
	});

	it('accepts multiple certification IDs', () => {
		const result = bulkDecisionSchema.safeParse({
			certification_ids: [VALID_UUID, VALID_UUID_2],
			decision: 'revoke',
			comment: 'Bulk revoke'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty certification_ids array', () => {
		const result = bulkDecisionSchema.safeParse({
			certification_ids: [],
			decision: 'approve'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid UUID in certification_ids', () => {
		const result = bulkDecisionSchema.safeParse({
			certification_ids: [INVALID_UUID],
			decision: 'approve'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing decision', () => {
		const result = bulkDecisionSchema.safeParse({
			certification_ids: [VALID_UUID]
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing certification_ids', () => {
		const result = bulkDecisionSchema.safeParse({ decision: 'approve' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid decision enum value', () => {
		const result = bulkDecisionSchema.safeParse({
			certification_ids: [VALID_UUID],
			decision: 'skip'
		});
		expect(result.success).toBe(false);
	});
});

describe('manualTriggerSchema', () => {
	it('accepts valid manual trigger', () => {
		const result = manualTriggerSchema.safeParse({
			user_id: VALID_UUID,
			entitlement_id: VALID_UUID_2,
			reason: 'Quarterly review'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all optional fields', () => {
		const result = manualTriggerSchema.safeParse({
			user_id: VALID_UUID,
			entitlement_id: VALID_UUID_2,
			trigger_rule_id: VALID_UUID,
			reviewer_id: VALID_UUID_2,
			reason: 'Triggered manually'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid user_id UUID', () => {
		const result = manualTriggerSchema.safeParse({
			user_id: INVALID_UUID,
			entitlement_id: VALID_UUID,
			reason: 'Test'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid entitlement_id UUID', () => {
		const result = manualTriggerSchema.safeParse({
			user_id: VALID_UUID,
			entitlement_id: INVALID_UUID,
			reason: 'Test'
		});
		expect(result.success).toBe(false);
	});

	it('rejects empty reason', () => {
		const result = manualTriggerSchema.safeParse({
			user_id: VALID_UUID,
			entitlement_id: VALID_UUID_2,
			reason: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing reason', () => {
		const result = manualTriggerSchema.safeParse({
			user_id: VALID_UUID,
			entitlement_id: VALID_UUID_2
		});
		expect(result.success).toBe(false);
	});

	it('rejects reason exceeding 2000 characters', () => {
		const result = manualTriggerSchema.safeParse({
			user_id: VALID_UUID,
			entitlement_id: VALID_UUID_2,
			reason: 'r'.repeat(2001)
		});
		expect(result.success).toBe(false);
	});
});

describe('createTriggerRuleSchema', () => {
	const validRule = {
		name: 'High Risk Assignment Review',
		trigger_type: 'high_risk_assignment' as const,
		scope_type: 'tenant' as const,
		reviewer_type: 'user_manager' as const
	};

	it('accepts minimal valid input', () => {
		const result = createTriggerRuleSchema.safeParse(validRule);
		expect(result.success).toBe(true);
	});

	it('applies default values for booleans', () => {
		const result = createTriggerRuleSchema.safeParse(validRule);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auto_revoke).toBe(false);
			expect(result.data.revoke_triggering_assignment).toBe(false);
			expect(result.data.is_default).toBe(false);
		}
	});

	it('rejects missing name', () => {
		const { name, ...rest } = validRule;
		const result = createTriggerRuleSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty name', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name exceeding 255 characters', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, name: 'n'.repeat(256) });
		expect(result.success).toBe(false);
	});

	it('accepts name at exactly 255 characters', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, name: 'n'.repeat(255) });
		expect(result.success).toBe(true);
	});

	it('rejects invalid trigger_type', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, trigger_type: 'invalid' });
		expect(result.success).toBe(false);
	});

	it('accepts all valid trigger_type values', () => {
		for (const t of ['high_risk_assignment', 'sod_violation', 'manager_change', 'periodic_recert', 'manual']) {
			const result = createTriggerRuleSchema.safeParse({ ...validRule, trigger_type: t });
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid scope_type values', () => {
		for (const s of ['tenant', 'application', 'entitlement']) {
			const result = createTriggerRuleSchema.safeParse({ ...validRule, scope_type: s });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid scope_type', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, scope_type: 'global' });
		expect(result.success).toBe(false);
	});

	it('accepts all valid reviewer_type values', () => {
		for (const r of ['user_manager', 'entitlement_owner', 'application_owner', 'specific_user']) {
			const result = createTriggerRuleSchema.safeParse({ ...validRule, reviewer_type: r });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid reviewer_type', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, reviewer_type: 'admin' });
		expect(result.success).toBe(false);
	});

	it('coerces string to number for timeout_secs', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, timeout_secs: '3600' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.timeout_secs).toBe(3600);
		}
	});

	it('coerces string to number for reminder_threshold_percent', () => {
		const result = createTriggerRuleSchema.safeParse({
			...validRule,
			reminder_threshold_percent: '75'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.reminder_threshold_percent).toBe(75);
		}
	});

	it('rejects reminder_threshold_percent over 100', () => {
		const result = createTriggerRuleSchema.safeParse({
			...validRule,
			reminder_threshold_percent: 101
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative timeout_secs', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, timeout_secs: -1 });
		expect(result.success).toBe(false);
	});

	it('coerces string to number for priority', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, priority: '10' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.priority).toBe(10);
		}
	});

	it('accepts optional UUID fields', () => {
		const result = createTriggerRuleSchema.safeParse({
			...validRule,
			scope_id: VALID_UUID,
			specific_reviewer_id: VALID_UUID_2,
			fallback_reviewer_id: VALID_UUID
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID in scope_id', () => {
		const result = createTriggerRuleSchema.safeParse({ ...validRule, scope_id: INVALID_UUID });
		expect(result.success).toBe(false);
	});

	it('accepts metadata as record', () => {
		const result = createTriggerRuleSchema.safeParse({
			...validRule,
			metadata: { key: 'value', count: 42 }
		});
		expect(result.success).toBe(true);
	});
});

describe('updateTriggerRuleSchema', () => {
	it('accepts empty object (all fields optional)', () => {
		const result = updateTriggerRuleSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts partial update with name only', () => {
		const result = updateTriggerRuleSchema.safeParse({ name: 'Updated Name' });
		expect(result.success).toBe(true);
	});

	it('rejects empty name string', () => {
		const result = updateTriggerRuleSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects name exceeding 255 characters', () => {
		const result = updateTriggerRuleSchema.safeParse({ name: 'x'.repeat(256) });
		expect(result.success).toBe(false);
	});

	it('accepts partial update with trigger_type only', () => {
		const result = updateTriggerRuleSchema.safeParse({ trigger_type: 'periodic_recert' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid trigger_type', () => {
		const result = updateTriggerRuleSchema.safeParse({ trigger_type: 'cron' });
		expect(result.success).toBe(false);
	});

	it('coerces string to number for timeout_secs', () => {
		const result = updateTriggerRuleSchema.safeParse({ timeout_secs: '7200' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.timeout_secs).toBe(7200);
		}
	});

	it('does not apply boolean defaults (all optional)', () => {
		const result = updateTriggerRuleSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auto_revoke).toBeUndefined();
			expect(result.data.is_default).toBeUndefined();
		}
	});
});

describe('globalEventsSearchSchema', () => {
	it('accepts empty object with defaults applied', () => {
		const result = globalEventsSearchSchema.safeParse({});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.limit).toBe(20);
			expect(result.data.offset).toBe(0);
		}
	});

	it('accepts all optional filter fields', () => {
		const result = globalEventsSearchSchema.safeParse({
			event_type: 'approved',
			actor_id: VALID_UUID,
			certification_id: VALID_UUID_2,
			from_date: '2026-01-01',
			to_date: '2026-12-31'
		});
		expect(result.success).toBe(true);
	});

	it('rejects invalid actor_id UUID', () => {
		const result = globalEventsSearchSchema.safeParse({ actor_id: INVALID_UUID });
		expect(result.success).toBe(false);
	});

	it('rejects invalid certification_id UUID', () => {
		const result = globalEventsSearchSchema.safeParse({ certification_id: INVALID_UUID });
		expect(result.success).toBe(false);
	});

	it('coerces string limit to number', () => {
		const result = globalEventsSearchSchema.safeParse({ limit: '50' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.limit).toBe(50);
		}
	});

	it('coerces string offset to number', () => {
		const result = globalEventsSearchSchema.safeParse({ offset: '10' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.offset).toBe(10);
		}
	});

	it('rejects limit below 1', () => {
		const result = globalEventsSearchSchema.safeParse({ limit: 0 });
		expect(result.success).toBe(false);
	});

	it('rejects limit above 100', () => {
		const result = globalEventsSearchSchema.safeParse({ limit: 101 });
		expect(result.success).toBe(false);
	});

	it('rejects negative offset', () => {
		const result = globalEventsSearchSchema.safeParse({ offset: -1 });
		expect(result.success).toBe(false);
	});
});

import { describe, it, expect } from 'vitest';
import {
	createWorkflowSchema,
	updateWorkflowSchema,
	addStepSchema,
	createGroupSchema,
	updateGroupSchema,
	addMemberSchema,
	createEscalationPolicySchema,
	updateEscalationPolicySchema,
	addLevelSchema,
	createExemptionSchema
} from './approval-workflows';

describe('createWorkflowSchema', () => {
	it('accepts valid input with name only', () => {
		const result = createWorkflowSchema.safeParse({
			name: 'Standard Approval'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with name and description', () => {
		const result = createWorkflowSchema.safeParse({
			name: 'Standard Approval',
			description: 'Default workflow for access requests'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createWorkflowSchema.safeParse({
			name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createWorkflowSchema.safeParse({
			description: 'No name provided'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createWorkflowSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('accepts name of exactly 255 chars', () => {
		const result = createWorkflowSchema.safeParse({
			name: 'x'.repeat(255)
		});
		expect(result.success).toBe(true);
	});

	it('rejects description over 1000 chars', () => {
		const result = createWorkflowSchema.safeParse({
			name: 'Test',
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});
});

describe('updateWorkflowSchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateWorkflowSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update with name', () => {
		const result = updateWorkflowSchema.safeParse({
			name: 'Updated Workflow'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid full update', () => {
		const result = updateWorkflowSchema.safeParse({
			name: 'Updated Workflow',
			description: 'Updated description for the workflow'
		});
		expect(result.success).toBe(true);
	});

	it('rejects name over 255 chars', () => {
		const result = updateWorkflowSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});

	it('rejects description over 1000 chars', () => {
		const result = updateWorkflowSchema.safeParse({
			description: 'x'.repeat(1001)
		});
		expect(result.success).toBe(false);
	});
});

describe('addStepSchema', () => {
	it('accepts valid input with manager approver type', () => {
		const result = addStepSchema.safeParse({
			approver_type: 'manager'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with specific_users and approvers list', () => {
		const result = addStepSchema.safeParse({
			approver_type: 'specific_users',
			specific_approvers: 'user-1,user-2'
		});
		expect(result.success).toBe(true);
	});

	it('accepts entitlement_owner approver type', () => {
		const result = addStepSchema.safeParse({
			approver_type: 'entitlement_owner'
		});
		expect(result.success).toBe(true);
	});

	it('accepts all valid approver_type values', () => {
		for (const approver_type of ['manager', 'entitlement_owner', 'specific_users']) {
			const result = addStepSchema.safeParse({ approver_type });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid approver_type', () => {
		const result = addStepSchema.safeParse({
			approver_type: 'random_type'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing approver_type', () => {
		const result = addStepSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('createGroupSchema', () => {
	it('accepts valid input with name only', () => {
		const result = createGroupSchema.safeParse({
			name: 'Security Reviewers'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with name and description', () => {
		const result = createGroupSchema.safeParse({
			name: 'Security Reviewers',
			description: 'Group responsible for security-related approvals'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createGroupSchema.safeParse({
			name: ''
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createGroupSchema.safeParse({
			description: 'No name'
		});
		expect(result.success).toBe(false);
	});

	it('rejects name over 255 chars', () => {
		const result = createGroupSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});
});

describe('updateGroupSchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateGroupSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update', () => {
		const result = updateGroupSchema.safeParse({
			name: 'Updated Group Name'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid full update', () => {
		const result = updateGroupSchema.safeParse({
			name: 'Updated Group',
			description: 'Updated group description'
		});
		expect(result.success).toBe(true);
	});

	it('rejects name over 255 chars', () => {
		const result = updateGroupSchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});
});

describe('addMemberSchema', () => {
	const validUserId = '550e8400-e29b-41d4-a716-446655440000';

	it('accepts valid input', () => {
		const result = addMemberSchema.safeParse({
			user_id: validUserId
		});
		expect(result.success).toBe(true);
	});

	it('rejects non-uuid user_id', () => {
		const result = addMemberSchema.safeParse({
			user_id: 'not-a-uuid'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing user_id', () => {
		const result = addMemberSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});

describe('createEscalationPolicySchema', () => {
	it('accepts valid input with all required fields', () => {
		const result = createEscalationPolicySchema.safeParse({
			name: 'Default Escalation',
			default_timeout_secs: 86400,
			final_fallback: 'auto_reject'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with all fields including optional', () => {
		const result = createEscalationPolicySchema.safeParse({
			name: 'Default Escalation',
			description: 'Escalation policy for overdue approvals',
			default_timeout_secs: 86400,
			warning_threshold_secs: 43200,
			final_fallback: 'escalate_admin'
		});
		expect(result.success).toBe(true);
	});

	it('rejects empty name', () => {
		const result = createEscalationPolicySchema.safeParse({
			name: '',
			default_timeout_secs: 86400,
			final_fallback: 'auto_reject'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = createEscalationPolicySchema.safeParse({
			default_timeout_secs: 86400,
			final_fallback: 'auto_reject'
		});
		expect(result.success).toBe(false);
	});

	it('rejects timeout under 60 seconds', () => {
		const result = createEscalationPolicySchema.safeParse({
			name: 'Test',
			default_timeout_secs: 30,
			final_fallback: 'auto_reject'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing final_fallback', () => {
		const result = createEscalationPolicySchema.safeParse({
			name: 'Test',
			default_timeout_secs: 86400
		});
		expect(result.success).toBe(false);
	});

	it('accepts all valid final_fallback values', () => {
		for (const fallback of ['escalate_admin', 'auto_approve', 'auto_reject', 'remain_pending']) {
			const result = createEscalationPolicySchema.safeParse({
				name: 'Test',
				default_timeout_secs: 86400,
				final_fallback: fallback
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects name over 255 chars', () => {
		const result = createEscalationPolicySchema.safeParse({
			name: 'x'.repeat(256),
			default_timeout_secs: 86400,
			final_fallback: 'auto_reject'
		});
		expect(result.success).toBe(false);
	});

	it('coerces string to number for default_timeout_secs', () => {
		const result = createEscalationPolicySchema.safeParse({
			name: 'Test',
			default_timeout_secs: '86400',
			final_fallback: 'auto_reject'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.default_timeout_secs).toBe(86400);
		}
	});
});

describe('updateEscalationPolicySchema', () => {
	it('accepts empty object (all optional)', () => {
		const result = updateEscalationPolicySchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts valid partial update', () => {
		const result = updateEscalationPolicySchema.safeParse({
			name: 'Updated Policy'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid full update', () => {
		const result = updateEscalationPolicySchema.safeParse({
			name: 'Updated Policy',
			description: 'Updated policy description',
			default_timeout_secs: 172800,
			final_fallback: 'auto_approve'
		});
		expect(result.success).toBe(true);
	});

	it('rejects name over 255 chars', () => {
		const result = updateEscalationPolicySchema.safeParse({
			name: 'x'.repeat(256)
		});
		expect(result.success).toBe(false);
	});
});

describe('addLevelSchema', () => {
	it('accepts valid input with approval_group target', () => {
		const result = addLevelSchema.safeParse({
			level_order: 1,
			timeout_secs: 86400,
			target_type: 'approval_group',
			target_id: '550e8400-e29b-41d4-a716-446655440000'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with manager target', () => {
		const result = addLevelSchema.safeParse({
			level_order: 2,
			timeout_secs: 172800,
			target_type: 'manager'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid input with manager_chain target and depth', () => {
		const result = addLevelSchema.safeParse({
			level_order: 3,
			timeout_secs: 86400,
			target_type: 'manager_chain',
			manager_chain_depth: 3
		});
		expect(result.success).toBe(true);
	});

	it('accepts all valid target_type values', () => {
		for (const target_type of ['specific_user', 'approval_group', 'manager', 'manager_chain', 'tenant_admin']) {
			const result = addLevelSchema.safeParse({
				level_order: 1,
				timeout_secs: 3600,
				target_type
			});
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid target_type', () => {
		const result = addLevelSchema.safeParse({
			level_order: 1,
			timeout_secs: 86400,
			target_type: 'invalid_type'
		});
		expect(result.success).toBe(false);
	});

	it('rejects 0 level_order', () => {
		const result = addLevelSchema.safeParse({
			level_order: 0,
			timeout_secs: 86400,
			target_type: 'manager'
		});
		expect(result.success).toBe(false);
	});

	it('rejects level_order over 10', () => {
		const result = addLevelSchema.safeParse({
			level_order: 11,
			timeout_secs: 86400,
			target_type: 'manager'
		});
		expect(result.success).toBe(false);
	});

	it('rejects timeout_secs under 60', () => {
		const result = addLevelSchema.safeParse({
			level_order: 1,
			timeout_secs: 30,
			target_type: 'manager'
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative timeout_secs', () => {
		const result = addLevelSchema.safeParse({
			level_order: 1,
			timeout_secs: -100,
			target_type: 'manager'
		});
		expect(result.success).toBe(false);
	});

	it('coerces string to number for timeout_secs', () => {
		const result = addLevelSchema.safeParse({
			level_order: '1',
			timeout_secs: '86400',
			target_type: 'tenant_admin'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.timeout_secs).toBe(86400);
		}
	});

	it('accepts optional level_name', () => {
		const result = addLevelSchema.safeParse({
			level_order: 1,
			level_name: 'First escalation',
			timeout_secs: 86400,
			target_type: 'manager'
		});
		expect(result.success).toBe(true);
	});
});

describe('createExemptionSchema', () => {
	const validRuleId = '550e8400-e29b-41d4-a716-446655440000';
	const validUserId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

	it('accepts valid input with required fields', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: validRuleId,
			user_id: validUserId,
			justification: 'This user requires both entitlements for quarterly audit processing',
			expires_at: '2026-06-30'
		});
		expect(result.success).toBe(true);
	});

	it('accepts ISO datetime for expires_at', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: validRuleId,
			user_id: validUserId,
			justification: 'Temporary exemption for migration project',
			expires_at: '2026-06-30T23:59:59Z'
		});
		expect(result.success).toBe(true);
	});

	it('rejects non-uuid rule_id', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: 'not-a-uuid',
			user_id: validUserId,
			justification: 'This is a valid justification text',
			expires_at: '2026-06-30'
		});
		expect(result.success).toBe(false);
	});

	it('rejects non-uuid user_id', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: validRuleId,
			user_id: 'not-a-uuid',
			justification: 'This is a valid justification text',
			expires_at: '2026-06-30'
		});
		expect(result.success).toBe(false);
	});

	it('rejects justification under 10 characters', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: validRuleId,
			user_id: validUserId,
			justification: 'Too short',
			expires_at: '2026-06-30'
		});
		expect(result.success).toBe(false);
	});

	it('accepts justification of exactly 10 characters', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: validRuleId,
			user_id: validUserId,
			justification: 'x'.repeat(10),
			expires_at: '2026-06-30'
		});
		expect(result.success).toBe(true);
	});

	it('rejects justification over 2000 characters', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: validRuleId,
			user_id: validUserId,
			justification: 'x'.repeat(2001),
			expires_at: '2026-06-30'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing rule_id', () => {
		const result = createExemptionSchema.safeParse({
			user_id: validUserId,
			justification: 'This is a valid justification text',
			expires_at: '2026-06-30'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing user_id', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: validRuleId,
			justification: 'This is a valid justification text',
			expires_at: '2026-06-30'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing justification', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: validRuleId,
			user_id: validUserId,
			expires_at: '2026-06-30'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing expires_at', () => {
		const result = createExemptionSchema.safeParse({
			rule_id: validRuleId,
			user_id: validUserId,
			justification: 'This is a valid justification text'
		});
		expect(result.success).toBe(false);
	});
});

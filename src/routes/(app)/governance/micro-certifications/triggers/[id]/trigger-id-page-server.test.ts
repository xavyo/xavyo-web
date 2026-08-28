import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/micro-certifications', () => ({
	getTriggerRule: vi.fn(),
	updateTriggerRule: vi.fn(),
	deleteTriggerRule: vi.fn(),
	enableTriggerRule: vi.fn(),
	disableTriggerRule: vi.fn(),
	setDefaultTriggerRule: vi.fn()
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: {} }),
	message: vi.fn()
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

vi.mock('$lib/schemas/micro-certifications', () => ({
	updateTriggerRuleSchema: {}
}));

import { load } from './+page.server';
import { getTriggerRule } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

describe('Micro-cert trigger detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getTriggerRule).mockResolvedValue({
			id: 'r1',
			name: 'High Risk',
			trigger_type: 'high_risk_assignment',
			scope_type: 'tenant',
			timeout_secs: 86400,
			reminder_threshold_percent: 75,
			auto_revoke: false,
			revoke_triggering_assignment: false,
			is_default: false
		} as any);
	});

	it('does not redirect a non-admin JWT user', async () => {
		const result = await load({
			params: { id: 'r1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.form).toBeDefined();
		expect(getTriggerRule).toHaveBeenCalled();
	});
});

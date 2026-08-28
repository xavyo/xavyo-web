import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/risk', () => ({
	getRiskThreshold: vi.fn(),
	updateRiskThreshold: vi.fn(),
	deleteRiskThreshold: vi.fn(),
	enableRiskThreshold: vi.fn(),
	disableRiskThreshold: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn(async (data: unknown) => ({ data, valid: true })),
	message: vi.fn()
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

import { hasAdminRole } from '$lib/server/auth';
import { getRiskThreshold } from '$lib/api/risk';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Risk threshold detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getRiskThreshold).mockResolvedValue({
			id: 't1',
			name: 'High',
			score_value: 80,
			severity: 'critical',
			action: 'alert',
			cooldown_hours: 24,
			is_enabled: true
		} as any);

		const { load } = await import('./+page.server');
		const result = await load({
			params: { id: 't1' },
			locals: mockLocals(false),
			fetch: vi.fn()
		} as any);

		expect(result.threshold).toBeDefined();
		expect(getRiskThreshold).toHaveBeenCalled();
	});
});

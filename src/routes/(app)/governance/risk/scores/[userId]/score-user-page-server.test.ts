import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/risk', () => ({
	getUserRiskScore: vi.fn()
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

import { load } from './+page.server';
import { getUserRiskScore } from '$lib/api/risk';
import { hasAdminRole } from '$lib/server/auth';

describe('User risk score +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(getUserRiskScore).mockResolvedValue({
			user_id: 'user-1',
			total_score: 42
		} as any);

		const result = await load({
			params: { userId: 'user-1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);

		expect(result.score.user_id).toBe('user-1');
		expect(getUserRiskScore).toHaveBeenCalled();
	});
});

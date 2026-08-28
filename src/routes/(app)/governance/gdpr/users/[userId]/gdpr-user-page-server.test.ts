import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/gdpr', () => ({
	getUserDataProtection: vi.fn()
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

import { hasAdminRole } from '$lib/server/auth';
import { getUserDataProtection } from '$lib/api/gdpr';

describe('GDPR user protection +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getUserDataProtection).mockResolvedValue({ user_id: 'u1' } as any);
		const { load } = await import('./+page.server');
		const result = await load({
			params: { userId: 'u1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.summary).toBeDefined();
		expect(getUserDataProtection).toHaveBeenCalled();
	});
});

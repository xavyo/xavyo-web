import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/nhi-governance', () => ({
	getNhiSodRule: vi.fn(),
	deleteNhiSodRule: vi.fn()
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
import { getNhiSodRule } from '$lib/api/nhi-governance';
import { hasAdminRole } from '$lib/server/auth';

describe('NHI SoD rule +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(getNhiSodRule).mockResolvedValue({ id: 'r1' } as any);
		const result = await load({
			params: { id: 'r1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.rule).toEqual({ id: 'r1' });
		expect(getNhiSodRule).toHaveBeenCalled();
	});
});

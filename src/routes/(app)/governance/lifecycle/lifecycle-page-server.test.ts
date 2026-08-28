import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/lifecycle', () => ({
	listLifecycleConfigs: vi.fn()
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
import { listLifecycleConfigs } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

describe('Lifecycle +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(listLifecycleConfigs).mockResolvedValue({ items: [], total: 0 } as any);
		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/governance/lifecycle')
		} as any);
		expect(result.configs).toBeDefined();
		expect(listLifecycleConfigs).toHaveBeenCalled();
	});
});

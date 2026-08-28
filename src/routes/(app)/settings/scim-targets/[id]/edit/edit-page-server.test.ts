import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/scim-targets', () => ({
	getScimTarget: vi.fn(),
	updateScimTarget: vi.fn()
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
import { getScimTarget } from '$lib/api/scim-targets';

describe('SCIM target edit +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getScimTarget).mockResolvedValue({
			id: 'tgt-1',
			name: 'Okta',
			base_url: 'https://example.com',
			auth_method: 'bearer',
			deprovisioning_strategy: 'disable',
			tls_verify: true,
			rate_limit_per_minute: 60,
			request_timeout_secs: 30,
			max_retries: 3,
			status: 'active'
		} as any);
		const { load } = await import('./+page.server');
		const result = await load({
			params: { id: 'tgt-1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.target).toBeDefined();
		expect(getScimTarget).toHaveBeenCalled();
	});
});

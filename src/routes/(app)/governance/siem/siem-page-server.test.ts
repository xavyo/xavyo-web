import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/siem', () => ({
	listSiemDestinations: vi.fn(),
	listSiemExports: vi.fn()
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
import { listSiemDestinations, listSiemExports } from '$lib/api/siem';
import { hasAdminRole } from '$lib/server/auth';

describe('SIEM +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(listSiemDestinations).mockResolvedValue({ items: [] } as any);
		vi.mocked(listSiemExports).mockResolvedValue({ items: [] } as any);
		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/governance/siem')
		} as any);
		expect(result.destinations).toBeDefined();
		expect(listSiemDestinations).toHaveBeenCalled();
	});
});

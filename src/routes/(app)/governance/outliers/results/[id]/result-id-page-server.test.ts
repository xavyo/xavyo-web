import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/outliers', () => ({
	getOutlierResult: vi.fn()
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
import { getOutlierResult } from '$lib/api/outliers';
import { hasAdminRole } from '$lib/server/auth';

describe('Outlier result +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(getOutlierResult).mockResolvedValue({ id: 'res-1' } as any);

		const result = await load({
			params: { id: 'res-1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);

		expect(result.result.id).toBe('res-1');
		expect(getOutlierResult).toHaveBeenCalled();
	});
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/scim-targets', () => ({
	listScimSyncRuns: vi.fn()
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

import { GET } from './+server';
import { listScimSyncRuns } from '$lib/api/scim-targets';
import { hasAdminRole } from '$lib/server/auth';

describe('GET /api/admin/scim-targets/:id/sync-runs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listScimSyncRuns).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			params: { id: 's1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/admin/scim-targets/s1/sync-runs')
		} as any);
		expect(response.status).toBe(200);
		expect(listScimSyncRuns).toHaveBeenCalled();
	});

	it('forwards advertised run_type filter', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listScimSyncRuns).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			params: { id: 's1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['admin'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/admin/scim-targets/s1/sync-runs?run_type=full_sync')
		} as any);
		expect(listScimSyncRuns).toHaveBeenCalledWith(
			's1',
			expect.objectContaining({ run_type: 'full_sync' }),
			'tok',
			'tid',
			expect.any(Function)
		);
	});
});

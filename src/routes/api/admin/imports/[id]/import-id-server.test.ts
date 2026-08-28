import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/imports', () => ({
	getImportJob: vi.fn()
}));

import { GET } from './+server';
import { getImportJob } from '$lib/api/imports';
import { hasAdminRole } from '$lib/server/auth';

describe('GET /api/admin/imports/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getImportJob).mockResolvedValue({ id: 'job-1' } as any);
		const response = await GET({
			params: { id: 'job-1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getImportJob).toHaveBeenCalled();
	});
});

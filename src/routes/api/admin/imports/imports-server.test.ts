import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/imports', () => ({
	listImportJobs: vi.fn(),
	uploadImport: vi.fn()
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

import { GET, POST } from './+server';
import { listImportJobs, uploadImport } from '$lib/api/imports';
import { hasAdminRole } from '$lib/server/auth';

describe('GET /api/admin/imports', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listImportJobs).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/admin/imports')
		} as any);
		expect(response.status).toBe(200);
		expect(listImportJobs).toHaveBeenCalled();
	});
});

describe('POST /api/admin/imports', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(uploadImport).mockResolvedValue({ id: 'job-1' } as any);
		const file = new File(['email\n'], 'users.csv', { type: 'text/csv' });
		const response = await POST({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn(),
			request: {
				formData: async () => ({
					get: (key: string) => (key === 'file' ? file : null)
				})
			}
		} as any);
		expect(response.status).toBe(202);
		expect(uploadImport).toHaveBeenCalled();
	});
});

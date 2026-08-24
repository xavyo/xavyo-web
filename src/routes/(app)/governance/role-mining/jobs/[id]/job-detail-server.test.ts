import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	getMiningJob: vi.fn(),
	listCandidates: vi.fn()
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

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { getMiningJob, listCandidates } from '$lib/api/role-mining';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Role mining job detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns job without candidates when not completed', async () => {
		vi.mocked(getMiningJob).mockResolvedValue({ id: 'job-1', status: 'running' } as any);

		const result = (await load({
			params: { id: 'job-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.job.id).toBe('job-1');
		expect(result.candidates.items).toEqual([]);
		expect(listCandidates).not.toHaveBeenCalled();
	});

	it('returns candidates when job is completed', async () => {
		vi.mocked(getMiningJob).mockResolvedValue({ id: 'job-1', status: 'completed' } as any);
		vi.mocked(listCandidates).mockResolvedValue({
			items: [{ id: 'cand-1' }],
			total: 1,
			page: 1,
			page_size: 50
		} as any);

		const result = (await load({
			params: { id: 'job-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.candidates.items).toHaveLength(1);
	});

	it('fails closed when candidates API throws', async () => {
		vi.mocked(getMiningJob).mockResolvedValue({ id: 'job-1', status: 'completed' } as any);
		vi.mocked(listCandidates).mockRejectedValue(new Error('network'));

		try {
			await load({
				params: { id: 'job-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status from job fetch', async () => {
		vi.mocked(getMiningJob).mockRejectedValue(new ApiError('Not found', 404));

		try {
			await load({
				params: { id: 'missing' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(404);
		}
	});
});

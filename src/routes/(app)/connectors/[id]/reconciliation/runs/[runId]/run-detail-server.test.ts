import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	getRun: vi.fn(),
	getRunReport: vi.fn(),
	cancelRun: vi.fn(),
	resumeRun: vi.fn()
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
import { getRun, getRunReport } from '$lib/api/reconciliation';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['admin'] }
});

describe('Reconciliation run detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('loads report for completed runs', async () => {
		vi.mocked(getRun).mockResolvedValue({ id: 'run-1', status: 'completed' } as any);
		vi.mocked(getRunReport).mockResolvedValue({ summary: 'ok' } as any);

		const result = (await load({
			params: { id: 'conn-1', runId: 'run-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.report.summary).toBe('ok');
	});

	it('treats missing report 404 as null', async () => {
		vi.mocked(getRun).mockResolvedValue({ id: 'run-1', status: 'completed' } as any);
		vi.mocked(getRunReport).mockRejectedValue(new ApiError('Not found', 404));

		const result = (await load({
			params: { id: 'conn-1', runId: 'run-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.report).toBeNull();
	});

	it('fails closed when report API throws 500', async () => {
		vi.mocked(getRun).mockResolvedValue({ id: 'run-1', status: 'completed' } as any);
		vi.mocked(getRunReport).mockRejectedValue(new ApiError('boom', 500));

		try {
			await load({
				params: { id: 'conn-1', runId: 'run-1' },
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});
});

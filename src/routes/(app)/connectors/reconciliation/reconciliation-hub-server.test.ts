import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	listAllSchedules: vi.fn(),
	getDiscrepancyTrend: vi.fn()
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
import { listAllSchedules, getDiscrepancyTrend } from '$lib/api/reconciliation';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Reconciliation hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns schedules and trend for admin', async () => {
		vi.mocked(listAllSchedules).mockResolvedValue({
			schedules: [{ id: 'sch-1' }]
		} as any);
		vi.mocked(getDiscrepancyTrend).mockResolvedValue({ points: [] } as any);

		const result = (await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.schedules).toHaveLength(1);
		expect(result.trend).toBeDefined();
	});

	it('fails closed when schedules API throws', async () => {
		vi.mocked(listAllSchedules).mockRejectedValue(new Error('network'));
		vi.mocked(getDiscrepancyTrend).mockResolvedValue({} as any);

		try {
			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('fails closed when trend API throws', async () => {
		vi.mocked(listAllSchedules).mockResolvedValue({ schedules: [] } as any);
		vi.mocked(getDiscrepancyTrend).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(listAllSchedules).mockRejectedValue(new ApiError('Forbidden', 403));
		vi.mocked(getDiscrepancyTrend).mockResolvedValue({} as any);

		try {
			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});

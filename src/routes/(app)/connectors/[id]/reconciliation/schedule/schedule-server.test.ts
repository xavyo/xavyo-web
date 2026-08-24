import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	getSchedule: vi.fn(),
	upsertSchedule: vi.fn(),
	deleteSchedule: vi.fn(),
	enableSchedule: vi.fn(),
	disableSchedule: vi.fn()
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
import { getSchedule } from '$lib/api/reconciliation';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['admin'] }
});

describe('Reconciliation schedule +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns schedule when found', async () => {
		vi.mocked(getSchedule).mockResolvedValue({ id: 'sch-1', enabled: true } as any);

		const result = (await load({
			params: { id: 'conn-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.schedule.id).toBe('sch-1');
	});

	it('returns null schedule on 404', async () => {
		vi.mocked(getSchedule).mockRejectedValue(new ApiError('Schedule not found', 404));

		const result = (await load({
			params: { id: 'conn-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.schedule).toBeNull();
	});

	it('fails closed on 500', async () => {
		vi.mocked(getSchedule).mockRejectedValue(new ApiError('boom', 500));

		try {
			await load({
				params: { id: 'conn-1' },
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});
});

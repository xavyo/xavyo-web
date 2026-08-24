import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	getSimulation: vi.fn()
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
import { getSimulation } from '$lib/api/role-mining';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Role-mining simulation detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns simulation', async () => {
		vi.mocked(getSimulation).mockResolvedValue({ id: 'sim-1', name: 'Add entitlement' } as any);

		const result = (await load({
			params: { id: 'sim-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.simulation.id).toBe('sim-1');
	});

	it('propagates ApiError 404', async () => {
		vi.mocked(getSimulation).mockRejectedValue(new ApiError('Not found', 404));

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

	it('fails closed with 500 on network error instead of fake 404', async () => {
		vi.mocked(getSimulation).mockRejectedValue(new Error('network'));

		try {
			await load({
				params: { id: 'sim-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});
});

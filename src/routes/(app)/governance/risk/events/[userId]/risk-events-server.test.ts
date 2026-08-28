import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/risk', () => ({
	listUserRiskEvents: vi.fn()
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
import { listUserRiskEvents } from '$lib/api/risk';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('User risk events +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listUserRiskEvents).mockResolvedValue({
			items: [{ id: 'ev-1' }],
			total: 1,
			limit: 50,
			offset: 0
		} as any);

		const result = (await load({
			params: { userId: 'user-1' },
			locals: mockLocals(false),
			url: new URL('http://localhost/governance/risk/events/user-1'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.events.items).toHaveLength(1);
		expect(result.userId).toBe('user-1');
		expect(listUserRiskEvents).toHaveBeenCalled();
	});

	it('fails closed when list API throws', async () => {
		vi.mocked(listUserRiskEvents).mockRejectedValue(new Error('network'));

		try {
			await load({
				params: { userId: 'user-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/risk/events/user-1'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(listUserRiskEvents).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				params: { userId: 'user-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/risk/events/user-1'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});

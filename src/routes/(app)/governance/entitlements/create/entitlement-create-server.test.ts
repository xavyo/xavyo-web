import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	createEntitlement: vi.fn(),
	listApplications: vi.fn()
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
import { listApplications } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Entitlement create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listApplications).mockResolvedValue({
			items: [{ id: 'app-1', name: 'VPN' }]
		} as any);

		const result = (await load({
			locals: mockLocals(false),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.applications).toEqual([{ id: 'app-1', name: 'VPN' }]);
		expect(result.form).toBeDefined();
	});

	it('returns applications for admin', async () => {
		vi.mocked(listApplications).mockResolvedValue({
			items: [{ id: 'app-1', name: 'VPN' }]
		} as any);

		const result = (await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.applications).toEqual([{ id: 'app-1', name: 'VPN' }]);
		expect(result.form).toBeDefined();
	});

	it('fails closed when applications API throws', async () => {
		vi.mocked(listApplications).mockRejectedValue(new Error('network'));

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
		vi.mocked(listApplications).mockRejectedValue(new ApiError('Forbidden', 403));

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

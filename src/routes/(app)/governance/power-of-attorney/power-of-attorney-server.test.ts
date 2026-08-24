import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/power-of-attorney', () => ({
	listPoa: vi.fn()
}));

vi.mock('$lib/api/users', () => ({
	listUsers: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
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

import { load } from './+page.server';
import { listPoa } from '$lib/api/power-of-attorney';
import { listUsers } from '$lib/api/users';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Power of Attorney hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('throws 401 when unauthenticated', async () => {
		try {
			await load({
				locals: { accessToken: null, tenantId: 'tid', user: { roles: [] } },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('returns outgoing grants for self-service users without calling listUsers', async () => {
		vi.mocked(listPoa).mockResolvedValue({
			items: [{ id: 'poa-1', reason: 'vacation' }],
			total: 1,
			limit: 20,
			offset: 0
		} as any);

		const result = (await load({
			locals: mockLocals(false),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.outgoing.items).toHaveLength(1);
		expect(result.isAdmin).toBe(false);
		expect(listUsers).not.toHaveBeenCalled();
	});

	it('loads user names for admins', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listPoa).mockResolvedValue({
			items: [],
			total: 0,
			limit: 20,
			offset: 0
		} as any);
		vi.mocked(listUsers).mockResolvedValue({
			users: [{ id: 'u1', email: 'a@b.com', display_name: 'Ada' }]
		} as any);

		const result = (await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.userNameMap.u1).toBe('Ada');
		expect(listUsers).toHaveBeenCalled();
	});

	it('fails closed when PoA list API throws', async () => {
		vi.mocked(listPoa).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status from PoA list', async () => {
		vi.mocked(listPoa).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});

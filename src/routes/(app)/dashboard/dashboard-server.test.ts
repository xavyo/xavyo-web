import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/users', () => ({
	listUsers: vi.fn()
}));

vi.mock('$lib/api/personas', () => ({
	listPersonas: vi.fn()
}));

vi.mock('$lib/api/nhi', () => ({
	listNhi: vi.fn()
}));

vi.mock('$lib/api/audit', () => ({
	fetchAdminLoginAttempts: vi.fn()
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
import { listUsers } from '$lib/api/users';
import { listPersonas } from '$lib/api/personas';
import { listNhi } from '$lib/api/nhi';
import { fetchAdminLoginAttempts } from '$lib/api/audit';
import { ApiError } from '$lib/api/client';

const parent = async () => ({ user: { id: 'u1' } });

describe('Dashboard +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listUsers).mockResolvedValue({
			users: [],
			pagination: { total_count: 12 }
		} as any);
		vi.mocked(listPersonas).mockResolvedValue({ items: [], total: 3 } as any);
		vi.mocked(listNhi).mockResolvedValue({ data: [], total: 4 } as any);
		vi.mocked(fetchAdminLoginAttempts).mockResolvedValue({ items: [], total: 7 } as any);
	});

	it('throws 401 when unauthenticated', async () => {
		try {
			await load({
				parent,
				locals: { accessToken: null, tenantId: 'tid' },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('returns counts', async () => {
		const result = (await load({
			parent,
			locals: { accessToken: 'tok', tenantId: 'tid' },
			fetch: vi.fn()
		} as any)) as any;

		expect(result.totalUsers).toBe(12);
		expect(result.activePersonas).toBe(3);
		expect(result.nhiIdentities).toBe(4);
		expect(result.recentActivity).toBe(7);
	});

	it('fails closed when a list API throws', async () => {
		vi.mocked(listUsers).mockRejectedValue(new Error('network'));

		try {
			await load({
				parent,
				locals: { accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(listPersonas).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				parent,
				locals: { accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});

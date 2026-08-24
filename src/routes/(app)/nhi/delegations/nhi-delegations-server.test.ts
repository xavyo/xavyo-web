import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-delegations', () => ({
	listDelegationGrants: vi.fn()
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
import { listDelegationGrants } from '$lib/api/nhi-delegations';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['user'] }
});

describe('NHI delegations +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('throws 401 when unauthenticated', async () => {
		try {
			await load({
				locals: { accessToken: null, tenantId: 'tid' },
				url: new URL('http://localhost/nhi/delegations'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('returns needsFilter without calling API when no principal or actor', async () => {
		const result = (await load({
			locals: mockLocals(),
			url: new URL('http://localhost/nhi/delegations'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.needsFilter).toBe(true);
		expect(result.grants).toEqual([]);
		expect(listDelegationGrants).not.toHaveBeenCalled();
	});

	it('returns grants when filtered', async () => {
		vi.mocked(listDelegationGrants).mockResolvedValue({
			data: [{ id: 'g1' }, { id: 'g2' }],
			limit: 20,
			offset: 0
		} as any);

		const result = (await load({
			locals: mockLocals(),
			url: new URL('http://localhost/nhi/delegations?principal_id=u1'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.grants).toHaveLength(2);
		expect(result.needsFilter).toBe(false);
	});

	it('fails closed when list API throws', async () => {
		vi.mocked(listDelegationGrants).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals(),
				url: new URL('http://localhost/nhi/delegations?principal_id=u1'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(listDelegationGrants).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				locals: mockLocals(),
				url: new URL('http://localhost/nhi/delegations?actor_nhi_id=n1'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});

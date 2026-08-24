import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/power-of-attorney', () => ({
	getPoa: vi.fn(),
	revokePoa: vi.fn(),
	extendPoa: vi.fn(),
	assumeIdentity: vi.fn(),
	getPoaAudit: vi.fn()
}));

vi.mock('$lib/api/users', () => ({
	listUsers: vi.fn()
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
	replaceAccessTokenIfJwt: vi.fn()
}));

import { load } from './+page.server';
import { getPoa, getPoaAudit } from '$lib/api/power-of-attorney';
import { listUsers } from '$lib/api/users';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { id: 'donor-1', roles: ['user'] }
});

const mockPoa = {
	id: 'poa-1',
	donor_id: 'donor-1',
	attorney_id: 'attorney-1',
	status: 'active'
};

describe('PoA detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getPoa).mockResolvedValue(mockPoa as any);
		vi.mocked(getPoaAudit).mockResolvedValue({
			items: [{ id: 'evt-1' }],
			total: 1,
			limit: 50,
			offset: 0
		} as any);
		vi.mocked(listUsers).mockResolvedValue({ users: [] } as any);
	});

	it('returns poa and audit', async () => {
		const result = (await load({
			params: { id: 'poa-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.poa.id).toBe('poa-1');
		expect(result.audit.items).toHaveLength(1);
	});

	it('fails closed when audit API throws', async () => {
		vi.mocked(getPoaAudit).mockRejectedValue(new Error('network'));

		try {
			await load({
				params: { id: 'poa-1' },
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status from audit', async () => {
		vi.mocked(getPoaAudit).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				params: { id: 'poa-1' },
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});

	it('still returns PoA when listUsers fails', async () => {
		vi.mocked(listUsers).mockRejectedValue(new Error('forbidden'));

		const result = (await load({
			params: { id: 'poa-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.poa.id).toBe('poa-1');
		expect(result.audit.items).toHaveLength(1);
		expect(result.userNameMap).toEqual({});
	});
});

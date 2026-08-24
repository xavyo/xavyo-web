import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	createSodExemption: vi.fn()
}));

vi.mock('$lib/api/governance', () => ({
	listSodRules: vi.fn()
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
import { listSodRules } from '$lib/api/governance';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('SoD exemption create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns rules for admin', async () => {
		vi.mocked(listSodRules).mockResolvedValue({
			items: [{ id: 'rule-1' }],
			total: 1,
			limit: 100,
			offset: 0
		} as any);

		const result = (await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.rules).toHaveLength(1);
		expect(result.form).toBeDefined();
	});

	it('fails closed when rules API throws', async () => {
		vi.mocked(listSodRules).mockRejectedValue(new Error('network'));

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
		vi.mocked(listSodRules).mockRejectedValue(new ApiError('Forbidden', 403));

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

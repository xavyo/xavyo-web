import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/risk', () => ({
	listRiskThresholds: vi.fn(),
	deleteRiskThreshold: vi.fn(),
	enableRiskThreshold: vi.fn(),
	disableRiskThreshold: vi.fn()
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

import { hasAdminRole } from '$lib/server/auth';
import { listRiskThresholds } from '$lib/api/risk';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Risk thresholds +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/risk/thresholds'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns thresholds for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRiskThresholds).mockResolvedValue({
				items: [{ id: 'thr-1', severity: 'high' }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/risk/thresholds'),
				fetch: vi.fn()
			} as any);

			expect(result.thresholds.items).toHaveLength(1);
			expect(result.thresholds.total).toBe(1);
		});

		it('fails closed when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRiskThresholds).mockRejectedValue(new Error('Network error'));

			try {
				await load({
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/risk/thresholds'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});
});

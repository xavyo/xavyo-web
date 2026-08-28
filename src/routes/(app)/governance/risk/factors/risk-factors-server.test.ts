import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/risk', () => ({
	listRiskFactors: vi.fn(),
	deleteRiskFactor: vi.fn(),
	enableRiskFactor: vi.fn(),
	disableRiskFactor: vi.fn()
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
import { listRiskFactors } from '$lib/api/risk';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Risk factors +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			load = mod.load;
		});

		it('does not redirect a non-admin JWT user', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			vi.mocked(listRiskFactors).mockResolvedValue({
				items: [{ id: 'fac-1', name: 'Privileged access' }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(false),
				url: new URL('http://localhost/governance/risk/factors'),
				fetch: vi.fn()
			} as any);

			expect(result.factors.items).toHaveLength(1);
			expect(listRiskFactors).toHaveBeenCalled();
		});

		it('returns factors for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRiskFactors).mockResolvedValue({
				items: [{ id: 'fac-1', name: 'Privileged access' }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/risk/factors'),
				fetch: vi.fn()
			} as any);

			expect(result.factors.items).toHaveLength(1);
			expect(result.factors.total).toBe(1);
		});

		it('fails closed when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRiskFactors).mockRejectedValue(new Error('Network error'));

			try {
				await load({
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/risk/factors'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});
});

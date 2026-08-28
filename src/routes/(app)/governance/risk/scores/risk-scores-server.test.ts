import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/risk', () => ({
	listRiskScores: vi.fn()
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
import { listRiskScores } from '$lib/api/risk';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Risk scores +page.server', () => {
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
			vi.mocked(listRiskScores).mockResolvedValue({
				items: [{ user_id: 'u-1', total_score: 80 }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(false),
				url: new URL('http://localhost/governance/risk/scores'),
				fetch: vi.fn()
			} as any);

			expect(result.scores.items).toHaveLength(1);
			expect(listRiskScores).toHaveBeenCalled();
		});

		it('returns scores for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRiskScores).mockResolvedValue({
				items: [{ user_id: 'u-1', total_score: 80 }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/risk/scores'),
				fetch: vi.fn()
			} as any);

			expect(result.scores.items).toHaveLength(1);
			expect(result.scores.total).toBe(1);
		});

		it('fails closed when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRiskScores).mockRejectedValue(new Error('Network error'));

			try {
				await load({
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/risk/scores'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/risk', () => ({
	listRiskAlerts: vi.fn(),
	getRiskAlertSummary: vi.fn(),
	acknowledgeRiskAlert: vi.fn(),
	deleteRiskAlert: vi.fn()
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
import { listRiskAlerts, getRiskAlertSummary } from '$lib/api/risk';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Risk alerts +page.server', () => {
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
			vi.mocked(listRiskAlerts).mockResolvedValue({
				items: [{ id: 'alert-1' }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);
			vi.mocked(getRiskAlertSummary).mockResolvedValue({
				unacknowledged: [],
				total_unacknowledged: 0
			} as any);

			const result = await load({
				locals: mockLocals(false),
				url: new URL('http://localhost/governance/risk'),
				fetch: vi.fn()
			} as any);

			expect(result.alerts.items).toHaveLength(1);
			expect(listRiskAlerts).toHaveBeenCalled();
		});

		it('returns alerts and summary for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRiskAlerts).mockResolvedValue({
				items: [{ id: 'alert-1' }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);
			vi.mocked(getRiskAlertSummary).mockResolvedValue({
				unacknowledged: [],
				total_unacknowledged: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/risk'),
				fetch: vi.fn()
			} as any);

			expect(result.alerts.items).toHaveLength(1);
		});

		it('fails closed when list API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRiskAlerts).mockRejectedValue(new Error('Network error'));
			vi.mocked(getRiskAlertSummary).mockResolvedValue({
				unacknowledged: [],
				total_unacknowledged: 0
			} as any);

			try {
				await load({
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/risk'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});
});

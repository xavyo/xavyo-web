import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/detection-rules', () => ({
	listDetectionRules: vi.fn(),
	deleteDetectionRule: vi.fn(),
	enableDetectionRule: vi.fn(),
	disableDetectionRule: vi.fn(),
	seedDefaultRules: vi.fn()
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
import { listDetectionRules } from '$lib/api/detection-rules';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Detection rules +page.server', () => {
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
			vi.mocked(listDetectionRules).mockResolvedValue({
				items: [],
				total: 0,
				limit: 50,
				offset: 0
			} as any);
			const result = await load({
				locals: mockLocals(false),
				url: new URL('http://localhost/governance/detection-rules'),
				fetch: vi.fn()
			} as any);
			expect(result).toBeDefined();
			expect(listDetectionRules).toHaveBeenCalled();
		});

		it('returns rules for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listDetectionRules).mockResolvedValue({
				items: [{ id: 'rule-1', name: 'Inactive 90 Days' }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/detection-rules'),
				fetch: vi.fn()
			} as any);

			expect(result.rules.items).toHaveLength(1);
			expect(result.rules.total).toBe(1);
		});

		it('fails closed when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listDetectionRules).mockRejectedValue(new Error('Network error'));

			try {
				await load({
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/detection-rules'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});
});

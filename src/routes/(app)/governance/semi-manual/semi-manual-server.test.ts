import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/semi-manual', () => ({
	listSemiManualApplications: vi.fn(),
	configureSemiManual: vi.fn(),
	removeSemiManualConfig: vi.fn()
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

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: {} }),
	message: vi.fn()
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema) => schema)
}));

import { hasAdminRole } from '$lib/server/auth';
import { listSemiManualApplications } from '$lib/api/semi-manual';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Semi-manual +page.server', () => {
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
			vi.mocked(listSemiManualApplications).mockResolvedValue({
				items: [{ id: 'app-1', name: 'HR System' }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(false),
				url: new URL('http://localhost/governance/semi-manual'),
				fetch: vi.fn()
			} as any);

			expect(result.applications.items).toHaveLength(1);
			expect(listSemiManualApplications).toHaveBeenCalled();
		});

		it('returns applications for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listSemiManualApplications).mockResolvedValue({
				items: [{ id: 'app-1', name: 'HR System' }],
				total: 1,
				limit: 50,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/semi-manual'),
				fetch: vi.fn()
			} as any);

			expect(result.applications.items).toHaveLength(1);
			expect(result.applications.total).toBe(1);
		});

		it('fails closed when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listSemiManualApplications).mockRejectedValue(new Error('Network error'));

			try {
				await load({
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/semi-manual'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});
});

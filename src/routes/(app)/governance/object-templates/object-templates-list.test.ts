import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/object-templates', () => ({
	listObjectTemplates: vi.fn()
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
import { listObjectTemplates } from '$lib/api/object-templates';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Object templates +page.server', () => {
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
					url: new URL('http://localhost/governance/object-templates')
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns templates for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listObjectTemplates).mockResolvedValue({
				items: [{ id: 'tpl-1', name: 'User template' }],
				total: 1
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/object-templates')
			} as any);

			expect(result.templates).toHaveLength(1);
			expect(result.total).toBe(1);
		});

		it('fails closed when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listObjectTemplates).mockRejectedValue(new Error('API error'));

			try {
				await load({
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/object-templates')
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});
});

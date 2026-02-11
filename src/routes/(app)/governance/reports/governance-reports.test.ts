import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Governance Reports hub +page.server', () => {
	it('redirects non-admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
			expect(e.location).toBe('/dashboard');
		}
	});

	it('returns empty object for admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const result = await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);
		expect(result).toEqual({});
	});

	it('calls hasAdminRole with user roles', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);
		expect(hasAdminRole).toHaveBeenCalledWith(['admin']);
	});

	it('calls hasAdminRole with non-admin roles', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				locals: { ...mockLocals(false), user: { roles: ['user', 'viewer'] } },
				fetch: vi.fn()
			} as any);
		} catch {
			// expected
		}
		expect(hasAdminRole).toHaveBeenCalledWith(['user', 'viewer']);
	});

	it('handles undefined user gracefully by redirecting', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				locals: { accessToken: 'tok', tenantId: 'tid', user: undefined },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
		}
	});
});

import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/api/nhi-governance', () => ({
	createNhiCertCampaign: vi.fn()
}));
vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(s: number, m: string) {
			super(m);
			this.status = s;
		}
	}
}));
vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load, actions } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('NHI Certification Campaign create +page.server', () => {
	it('redirects non-admin users on load', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
		}
	});

	it('loads form data for admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);

		const result: any = await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);

		expect(result.form).toBeDefined();
	});

	it('exports default form action', () => {
		expect(actions).toBeDefined();
		expect(actions.default).toBeDefined();
	});
});

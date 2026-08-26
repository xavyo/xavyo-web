import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/birthright', () => ({
	createBirthrightPolicy: vi.fn()
}));

vi.mock('$lib/api/governance', () => ({
	listEntitlements: vi.fn()
}));

import { actions } from './+page.server';
import { createBirthrightPolicy } from '$lib/api/birthright';

describe('Birthright policies create action', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects invalid JSON conditions', async () => {
		const fd = new FormData();
		fd.set('name', 'Policy');
		fd.set('conditions_json', 'not-json');
		try {
			await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: fd }),
				locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['admin'] } },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(400);
		}
		expect(createBirthrightPolicy).not.toHaveBeenCalled();
	});
});
